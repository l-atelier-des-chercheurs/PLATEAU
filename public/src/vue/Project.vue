<template>
  <splitpanes
    class="m_project"
    watch-slots
    @resized="resized()"
    :key="JSON.stringify($root.settings.project_panes_in_order)"
  >
    <template v-for="pane in $root.settings.project_panes_in_order">
      <pane v-if="pane.key === 'WriteUp' && pane.enabled" :key="pane.key">
        <WriteUp
          :slugFolderName="slugProjectName"
          :writeup_medias="writeup_medias"
          :read_only="read_only"
        />
      </pane>

      <pane v-else-if="pane.key === 'MediaLibrary' && pane.enabled" :key="pane.key">
        <MediaLibrary
          :slugProjectName="slugProjectName"
          :project="project"
          :library_medias="library_medias"
          :read_only="false"
        />
      </pane>

      <pane v-else-if="pane.key === 'Composition' && pane.enabled" :key="pane.key">
        <Composition
          :slugFolderName="slugProjectName"
          :composition_medias="composition_medias"
          :read_only="read_only"
        />
      </pane>

      <pane v-else-if="pane.key === 'Capture' && pane.enabled" :key="pane.key">
        <Capture
          :slugProjectName="slugProjectName"
          :project="project"
          :read_only="!$root.state.connected"
        />
      </pane>
    </template>
  </splitpanes>
</template>
<script>
import MediaLibrary from "./components/MediaLibrary.vue";
import WriteUp from "./components/WriteUp.vue";
import Capture from "./components/Capture.vue";
import Composition from "./components/Composition.vue";
import { Splitpanes, Pane } from "splitpanes";

export default {
  props: {
    project: Object,
    slugProjectName: String
  },
  components: {
    MediaLibrary,
    WriteUp,
    Capture,
    Composition,
    Splitpanes,
    Pane
  },
  data() {
    return {
      paged_content: [[]],
      flowed_content: [],
      modules_height: [],
      max_height_per_page: 0
    };
  },
  created() {},
  mounted() {
    this.$eventHub.$on("project.refresh_panes_order", this.refreshPanes);
  },
  beforeDestroy() {
    this.$eventHub.$off("project.refresh_panes_order", this.refreshPanes);
  },
  watch: {
    "$root.settings.project_panes_in_order": {
      handler() {
        setTimeout(() => {
          this.$forceUpdate();
        }, 500);
      },
      deep: true
    }
  },
  computed: {
    writeup_medias() {
      return Object.values(this.project.medias).filter(
        m => m.hasOwnProperty("type") && m.type === "writeup"
      );
    },
    composition_medias() {
      return Object.values(this.project.medias).filter(
        m => m.hasOwnProperty("type") && m.type === "composition"
      );
    },
    library_medias() {
      if (
        !this.project.hasOwnProperty("medias") ||
        typeof this.project.medias !== "object"
      ) {
        return [];
      }

      return Object.values(this.project.medias).filter(
        m =>
          m.hasOwnProperty("type") &&
          m.type !== "writeup" &&
          m.type !== "composition"
      );
    }
  },
  methods: {
    resized() {
      console.log(`Project / methods: resized`);
    },
    refreshPanes() {
      console.log(`Project / methods: refreshPanes`);
      this.$forceUpdate();
    }
  }
};
</script>
<style lang="scss">
.m_project {
  position: relative;
  height: 100%;
  display: flex;
  flex-flow: row nowrap;
  overflow-y: auto;
  -webkit-overflow-scrolling: touch;
  // background-color: #ecf0ed;
  // background-color: hsl(135, 12%, 96%);

  > * {
    height: 100%;
  }
}
</style>
