<template>
  <div class="m_planning">
    <transition-group tag="div" name="list-complete">
      <PlanningItem
        v-for="media in sorted_planning_medias"
        :key="media.metaFileName"
        :media="media"
        :slugFolderName="slugFolderName"
      />

      <div :key="'create'">
        <div v-if="!show_planning_section">
          <td colspan="4">
            <button
              type="button"
              class="_create_button"
              @click="show_planning_section = !show_planning_section"
            >{{ $t('create') }}</button>
          </td>
        </div>

        <div v-else>
          <td colspan="2">
            <input type="text" class ref="nameInput" />
          </td>
          <td colspan="2">
            <button
              type="button"
              class="button-small border-circled button-thin button-wide padding-verysmall margin-none bg-transparent"
              @click="createPlanningMedia"
            >{{ $t('create') }}</button>
          </td>
        </div>
      </div>
    </transition-group>
  </div>
</template>
<script>
import PlanningItem from "./subcomponents/PlanningItem.vue";

export default {
  props: {
    slugFolderName: String,
    planning_medias: Array
  },
  components: {
    PlanningItem
  },
  data() {
    return {
      show_planning_section: false
    };
  },

  created() {},
  mounted() {},
  beforeDestroy() {},

  watch: {},
  computed: {
    sorted_planning_medias() {
      return this.planning_medias.sort((a, b) =>
        a.date_modified.localeCompare(b.date_modified)
      );
    }
  },
  methods: {
    textChange(delta, oldDelta, source) {
      // if source === 'user'
    },
    createPlanningMedia() {
      if (window.state.dev_mode === "debug") {
        console.log("METHODS • AddMediaButton: createPlanningMedia");
      }

      let name = this.$refs.nameInput.value;
      if (!name) {
        name = this.$t("untitled_document");
      }

      if (this.planning_medias.filter(w => w.name === name).length > 0) {
        this.$alertify
          .closeLogOnClick(true)
          .delay(4000)
          .error(this.$t("notifications.document_name_exists"));
        return false;
      }

      this.show_planning_section = false;

      this.$root.createMedia({
        slugFolderName: this.slugFolderName,
        type: "projects",
        additionalMeta: {
          name,
          type: "planning"
        }
      });
    }
  }
};
</script>
<style lang="scss">
.m_planning {
  position: relative;
  // margin: var(--spacing);
  // margin: 0 auto;
  background-color: var(--color-Planning);
  height: 100%;

  // height: 100%;
  // overflow-y: auto;
}
</style>