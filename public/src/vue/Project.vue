<template>
  <splitpanes class="m_project" watch-slots>
    <template v-for="pane in $root.settings.project_panes_in_order">
      <pane v-if="pane.key === 'WriteUp' && pane.enabled" :key="pane.key" min-size="1">
        <WriteUp :slugFolderName="slugProjectName" :medias="project.medias" :read_only="read_only" />
      </pane>

      <pane v-else-if="pane.key === 'MediaLibrary' && pane.enabled" :key="pane.key">
        <MediaLibrary :slugProjectName="slugProjectName" :project="project" :read_only="false" />
      </pane>

      <pane v-else-if="pane.key === 'Composition' && pane.enabled" :key="pane.key">
        <div class="m_composition">
          <div class>
            <i>à venir</i>
            <br />projection/composition
          </div>
        </div>
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
  mounted() {},
  beforeDestroy() {},
  watch: {},
  computed: {},
  methods: {}
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

.m_composition {
  background-color: var(--color-Composition);
  padding: var(--spacing);
  height: 100%;
}
</style>
