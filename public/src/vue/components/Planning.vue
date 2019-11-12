<template>
  <div class="m_planning">
    <!-- not sure about having a reorderable list  -->
    <!-- <SlickList
      axis="y"
      :useDragHandle="false"
      v-model="ordered_planning_items"
      @sort-end="sortEnded"
    >
      <SlickItem v-for="(item, index) in ordered_planning_items" :index="index" :key="item.key">
        <PlanningItem :key="item.metaFileName" :media="item" :slugFolderName="slugFolderName" />
      </SlickItem>
    </SlickList>-->

    <transition-group tag="div" name="list-complete">
      <PlanningItem
        v-for="media in sorted_planning_medias"
        :key="media.metaFileName"
        :media="media"
        :slugFolderName="slugFolderName"
      />
    </transition-group>

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
  </div>
</template>
<script>
import PlanningItem from "./subcomponents/PlanningItem.vue";
import { SlickList, SlickItem, HandleDirective } from "vue-slicksort";

export default {
  props: {
    slugFolderName: String,
    planning_medias: Array
  },
  components: {
    PlanningItem,
    SlickItem,
    SlickList
  },
  directives: { handle: HandleDirective },
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
    },
    ordered_planning_items: {
      get() {
        return this.planning_medias.sort((a, b) =>
          a.hasOwnProperty("planning_order") && a.planning_order
            ? a.planning_order.localeCompare(b.planning_order)
            : false
        );
      },
      set(new_order) {}
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
          // planning_order: 0
        }
      });
    },
    sortEnded({ event, newIndex, oldIndex, collection }) {
      if (newIndex !== oldIndex) {
        debugger;
      }
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