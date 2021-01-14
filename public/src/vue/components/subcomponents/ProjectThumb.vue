<template>
  <div class="m_projectThumb">
    <div v-if="!show_edit_project">
      <div>
        <div class="m_projectThumb--name">{{ project.name }}</div>
        <!-- <div class="font-verysmall">
          {{ $t(selected_field_to_show) }}
          <br />
          {{
            projectDate(project[selected_field_to_show]) +
            " " +
            $t("at") +
            " " +
            $moment(project[selected_field_to_show]).format("HH:mm")
          }}
        </div> -->

        <div class="m_keywordField">
          <span
            v-for="keyword in project.keywords"
            :key="keyword.title"
            :class="['tagcolorid_' + (parseInt(keyword.title, 36) % 2)]"
            >{{ keyword.title }}</span
          >
        </div>

        <div class="m_metaField" v-if="!!project.authors">
          <div>{{ $t("authors") }}</div>
          <AuthorsInput :currentAuthors="project.authors" :read_only="true" />
        </div>

        <AccessController
          :folder="project"
          :context="'preview'"
          :type="'projects'"
          @openFolder="$root.openProject(project.slugFolderName)"
        />
      </div>
      <div class>
        <button
          v-if="can_see_project"
          @click="$root.openProject(project.slugFolderName)"
        >
          {{ $t("open") }}
        </button>

        <button v-if="can_edit_project" @click="show_edit_project = true">
          {{ $t("edit") }}
        </button>

        <button type="button" @click="more_options = !more_options">+</button>

        <template v-if="more_options">
          <button
            type="button"
            class="buttonLink"
            :class="{ 'is--active': showDuplicateProjectMenu }"
            @click="showDuplicateProjectMenu = !showDuplicateProjectMenu"
            :disabled="read_only"
          >
            {{ $t("duplicate") }}
          </button>

          <button
            type="button"
            class="buttonLink"
            :disabled="zip_export_started"
            @click="downloadProjectArchive"
          >
            {{ $t("download") }}
          </button>

          <div v-if="showDuplicateProjectMenu" class="margin-bottom-small">
            <label v-html="'Nom de la copie'" />
            <form @submit.prevent="duplicateWithNewName()" class="input-group">
              <input
                type="text"
                v-model.trim="copy_project_name"
                required
                autofocus
              />
              <button type="submit" v-html="$t('copier')" class="bg-bleuvert" />
            </form>
          </div>

          <button @click="removeProject(project.slugFolderName)">
            {{ $t("remove") }}
          </button>
        </template>
      </div>
    </div>
    <div v-else>
      <EditProject
        :project="project"
        :project_password="project_password()"
        :slugProjectName="project.slugFolderName"
        @close="show_edit_project = false"
        :read_only="read_only"
      />
    </div>
  </div>
</template>
<script>
import AuthorsInput from "../subcomponents/AuthorsInput.vue";
import AccessController from "../subcomponents/AccessController.vue";
import EditProject from "../subcomponents/EditProject.vue";

import localstore from "store";
export default {
  props: {
    project: Object,
    selected_field_to_show: String,
    available_fields: Array,
  },
  components: {
    AuthorsInput,
    AccessController,
    EditProject,
  },
  data() {
    return {
      showDuplicateProjectMenu: false,
      show_edit_project: false,
      copy_project_name: this.$t("copy_of") + " " + this.project.name,
      zip_export_started: false,

      more_options: false,
    };
  },
  created() {},
  mounted() {},
  beforeDestroy() {},
  watch: {},
  computed: {
    can_see_project() {
      return this.$root.canSeeFolder({
        type: "projects",
        slugFolderName: this.project.slugFolderName,
      });
    },
    can_edit_project() {
      return this.$root.canEditFolder({
        type: "projects",
        slugFolderName: this.project.slugFolderName,
      });
    },
  },
  methods: {
    removeProject(slugFolderName) {
      this.$alertify
        .okBtn(this.$t("yes"))
        .cancelBtn(this.$t("cancel"))
        .confirm(
          this.$t("sureToRemoveProject"),
          () => {
            this.$root.removeFolder({
              type: "projects",
              slugFolderName,
            });

            localstore.set(`panes.${slugFolderName}`, false);
          },
          () => {}
        );
    },
    projectDate(d) {
      if (this.$root.lang.current === "fr") {
        return this.$moment(d).calendar(null, {
          lastDay: "[hier]",
          sameDay: "[aujourd’hui]",
          nextDay: "[demain]",
          lastWeek: "dddd [dernier]",
          nextWeek: "dddd [prochain]",
          sameElse: "dddd D MMMM",
        });
      } else if (this.$root.lang.current === "en") {
        return this.$moment(d).calendar(null, {
          lastDay: "[yesterday]",
          sameDay: "[today]",
          nextDay: "[tomorrow]",
          lastWeek: "[last] dddd",
          nextWeek: "[next] dddd",
          sameElse: "dddd, MMMM D",
        });
      }
    },
    duplicateWithNewName(event) {
      console.log("METHODS • Project: duplicateWithNewName");

      function getAllProjectNames() {
        let allProjectsName = [];
        for (let slugProjectName in window.store.projects) {
          let projectName = window.store.projects[slugProjectName].name;
          allProjectsName.push(projectName);
        }
        return allProjectsName;
      }
      let allProjectsName = getAllProjectNames();

      // check if project name (not slug) already exists
      if (allProjectsName.indexOf(this.copy_project_name) >= 0) {
        // invalidate if it does
        this.$alertify
          .closeLogOnClick(true)
          .delay(4000)
          .error(this.$t("notifications.project_name_exists"));

        return false;
      }

      this.$socketio.copyFolder({
        type: "projects",
        slugFolderName: this.project.slugFolderName,
        new_folder_name: this.copy_project_name,
      });
      this.showDuplicateProjectMenu = false;

      this.$alertify
        .closeLogOnClick(true)
        .delay(4000)
        .log(this.$t("notifications.project_copy_in_progress"));

      this.$eventHub.$once("socketio.projects.folder_listed", () => {
        this.$alertify
          .closeLogOnClick(true)
          .delay(4000)
          .success(this.$t("notifications.project_copy_completed"));
      });
    },
    downloadProjectArchive() {
      if (this.$root.state.dev_mode === "debug") {
        console.log(`ProjectThumb • METHODS: downloadProjectArchive`);
      }

      this.zip_export_started = true;
      setTimeout(() => {
        this.zip_export_started = false;
      }, 2000);

      // const pwd = this.$auth.hashCode(this.project_password);
      const query_url =
        window.location.origin +
        "/_archives/projects/" +
        this.project.slugFolderName;
      // + `?pwd=${pwd}`;

      if (this.$root.state.dev_mode === "debug")
        console.log(
          `Project • METHODS: downloadProjectArchive with query ${query_url}`
        );

      window.location.replace(query_url);
    },
    project_password() {
      if (this.password !== "has_pass") return "";
      return this.$root.getFolderPassword({
        type: "projects",
        slugFolderName: this.slugProjectName,
      });
    },
  },
};
</script>
<style lang="scss" scoped>
.m_projectThumb {
}
.m_projectThumb--name {
  font-weight: 700;
}
</style>
