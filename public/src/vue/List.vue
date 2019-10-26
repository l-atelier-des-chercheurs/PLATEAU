<template>
  <transition-group class="m_list" name="list-complete" :duration="300" tag="div">
    <div :key="`create_project`" v-if="$root.show_create_project_modal">
      <form @submit.prevent="createProject">
        <label>{{ $t('name') }}</label>
        <input type="text" name="name" />
        <input type="submit" />
      </form>
    </div>
    <div class v-for="(project, slug) in projects" :key="slug">
      <div>
        <div class>{{ project.name }}</div>
        <div class="font-verysmall">
          {{ $t(available_fields.find(f => f.key === selected_field_to_show).key) }}
          <br />
          {{ projectDate(project[selected_field_to_show]) + ' ' + $t('at') + ' ' + $moment(project[selected_field_to_show]).format('HH:mm') }}
        </div>
      </div>
      <div class>
        <button @click="$root.openProject(slug)">{{ $t('open') }}</button>
        <button @click="removeProject(slug)">{{ $t('remove') }}</button>
      </div>
    </div>
  </transition-group>
</template>
<script>
export default {
  props: {
    projects: Object
  },
  components: {},
  data() {
    return {
      selected_field_to_show: "date_created",
      available_fields: [
        {
          key: "date_created"
        },
        {
          key: "date_modified"
        }
      ]
      // columns: [
      //   {
      //     label: "Name",
      //     field: "name"
      //   },
      //   {
      //     label: "Created On",
      //     field: "created_date",
      //     type: "date",
      //     dateInputFormat: "yyyy-MM-dd HH:m:s",
      //     dateOutputFormat: "PPPPpp"
      //   },
      //   {
      //     label: "Last edited On",
      //     field: "last_modified",
      //     type: "date",
      //     dateInputFormat: "yyyy-MM-dd HH:m:s",
      //     dateOutputFormat: "PPPPpp"
      //   }
      //   // {
      //   //   label: "Last Modified On",
      //   //   field: "date_modified",
      //   //   type: "date",
      //   //   dateInputFormat: "yyyy-MM-dd",
      //   //   dateOutputFormat: "MMM Do yy"
      //   // }
      // ]
    };
  },
  created() {},
  mounted() {},
  beforeDestroy() {},
  watch: {},
  computed: {
    projects_for_table() {
      return Object.values(this.projects);
    }
  },
  methods: {
    createProject(event) {
      console.log(`METHODS • ListView: createProject`);

      let new_project_data = {
        name: event.target.name.value
      };
      this.$root.createFolder({ type: "projects", data: new_project_data });
      this.$root.show_create_project_modal = false;
    },
    removeProject(slugFolderName) {
      this.$alertify
        .okBtn(this.$t("yes"))
        .cancelBtn(this.$t("cancel"))
        .confirm(
          this.$t("sureToRemoveProject"),
          () => {
            this.$root.removeFolder({
              type: "projects",
              slugFolderName
            });
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
          sameElse: "dddd D MMMM"
        });
      } else if (this.$root.lang.current === "en") {
        return this.$moment(d).calendar(null, {
          lastDay: "[yesterday]",
          sameDay: "[today]",
          nextDay: "[tomorrow]",
          lastWeek: "[last] dddd",
          nextWeek: "[next] dddd",
          sameElse: "dddd, MMMM D"
        });
      }
    }
  }
};
</script>
<style lang="scss">
.m_list {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  grid-auto-rows: max-content;

  > * {
    border-right: 1px solid black;
    border-bottom: 1px solid black;
    padding: var(--spacing);
  }
}
</style>
