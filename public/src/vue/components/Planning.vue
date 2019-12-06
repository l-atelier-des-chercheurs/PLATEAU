<template>
  <div class="m_planning">
    <splitpanes horizontal watch-slots>
      <pane min-size="10" max-size="100" size="100">
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
        <div class="m_planning--container" @click.self="open_planning_item = false">
          <transition-group tag="div" name="list-complete">
            <div v-for="media in sorted_planning_medias" :key="media.metaFileName">
              <PlanningItem
                :class="{ 'is--active' : open_planning_item === media.metaFileName }"
                :media="media"
                :slugFolderName="slugFolderName"
                @toggleOpen="toggleOpenItem"
              />

              <div
                class="m_planningPane"
                :class="{ 'is--open' : open_planning_item === media.metaFileName }"
              >
                <transition name="slideright" :duration="400">
                  <div
                    class="m_planningPane--content"
                    v-if="open_planning_item === media.metaFileName"
                  >
                    <PlanningItem
                      :key="media.metaFileName"
                      :media="media"
                      :slugFolderName="slugFolderName"
                      :mode="'expanded'"
                      @open="metaFileName => open_planning_item = metaFileName"
                    />
                  </div>
                </transition>
              </div>
            </div>
          </transition-group>

          <form
            @submit.prevent="createPlanningMedia"
            :key="'create'"
            class="m_planning--container--create"
          >
            <div v-if="!show_planning_section">
              <td colspan="4">
                <button
                  type="button"
                  class="_create_button"
                  @click="show_planning_section = !show_planning_section"
                >{{ $t("create") }}</button>
              </td>
            </div>

            <div v-else>
              <td colspan="2">
                <input type="text" class ref="nameInput" />
              </td>
              <td colspan="2">
                <button
                  type="submit"
                  class="button-small border-circled button-thin button-wide padding-verysmall margin-none bg-transparent"
                >{{ $t("create") }}</button>
              </td>
            </div>
          </form>
        </div>
      </pane>
      <pane
        v-if="show_media_notes_for"
        :key="show_media_notes_for"
        class
        min-size="20"
        max-size="70"
        size="50"
        style="position: relative;"
      ></pane>
    </splitpanes>
  </div>
</template>
<script>
import PlanningItem from "./subcomponents/PlanningItem.vue";
import { Splitpanes, Pane } from "splitpanes";

import { SlickList, SlickItem, HandleDirective } from "vue-slicksort";

export default {
  props: {
    slugFolderName: String,
    planning_medias: Array
  },
  components: {
    PlanningItem,
    SlickItem,
    SlickList,
    Splitpanes,
    Pane
  },
  directives: { handle: HandleDirective },
  data() {
    return {
      show_planning_section: false,
      open_planning_item: false
    };
  },

  created() {},
  mounted() {},
  beforeDestroy() {},

  watch: {},
  computed: {
    sorted_planning_medias() {
      return this.planning_medias.sort((a, b) =>
        a.hasOwnProperty("planning_info_start") && a.planning_info_start
          ? a.planning_info_start.localeCompare(b.planning_info_start)
          : false
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
    toggleOpenItem(item_meta) {
      if (this.open_planning_item === item_meta) {
        this.open_planning_item = false;
        return;
      }
      this.open_planning_item = item_meta;
      return;
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
      }
    }
  }
};
</script>
<style lang="scss">
.m_planning {
  position: relative;
  height: 100%;
  background-color: var(--color-Planning);

  // height: 100%;
  // overflow-y: auto;
}
.m_planning--container {
  height: 100%;
  // display: flex;
  // flex-flow: column nowrap;
  overflow-y: auto;

  margin: 0 auto;

  &:hover .m_planningPane--content:not(:hover) {
    transform: translateX(46%);
    // margin-left: 66%;
    background-color: blue;
  }
}

.m_planning--container--create {
  padding: calc(var(--spacing) / 1);
  background-color: #fff;
  border: 1px solid black;
  margin: -1px;
}

.m_planningPane {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  z-index: -1;
  overflow: hidden;
  pointer-events: none;

  // background-color: rgba(255, 255, 255, 0.4);
  // box-shadow: 0 0 12px #888;
  // box-shadow: 0 2px 5px rgba(0, 0, 0, 0.2);

  &.is--open {
    z-index: 1;
  }
}
.m_planningPane--content {
  background-color: white;
  height: 100%;
  pointer-events: auto;
  // width: 100%;
  // overflow: auto;
  margin-left: 10%;
  transition: all 0.4s cubic-bezier(0.19, 1, 0.22, 1);

  > * {
    height: 100%;
  }
}
</style>
