<template>
  <splitpanes
    watch-slots
    :dbl-click-splitter="false"
    @resized="resized"
    :key="JSON.stringify(panes.map((p) => p.key))"
  >
    <template v-if="panes.filter((p) => p.enabled).length === 0">
      <pane><i>Aucune panneau n’est actif</i></pane>
    </template>
    <template v-else v-for="pane in panes">
      <pane
        v-if="pane.key === 'Journal' && pane.enabled"
        :key="pane.key"
        min-size="5"
        :size="pane.size_pc"
        ref="Journal"
      >
        <JournalPane />
      </pane>

      <pane
        v-else-if="pane.key === 'MediaLibrary' && pane.enabled"
        :key="pane.key"
        min-size="5"
        :size="pane.size_pc"
        ref="MediaLibrary"
      >
        <MediaLibrary :project="project" />
      </pane>

      <pane
        v-else-if="pane.key === 'Capture' && pane.enabled"
        :key="pane.key"
        min-size="5"
        :size="pane.size_pc"
        ref="Capture"
      >
        <CapturePane :project="project" />
      </pane>

      <pane
        v-else-if="pane.key === 'Team' && pane.enabled"
        :key="pane.key"
        min-size="5"
        :size="pane.size_pc"
        ref="Team"
      >
        <TeamPane :project="project" />
      </pane>
    </template>
  </splitpanes>
</template>
<script>
import { Splitpanes, Pane } from "splitpanes";
import JournalPane from "@/components/panes/JournalPane.vue";
import MediaLibrary from "@/components/panes/MediaLibrary.vue";
import CapturePane from "@/components/panes/CapturePane.vue";
import TeamPane from "@/components/panes/TeamPane.vue";

export default {
  props: {
    panes: Array,
    project: Object,
  },
  components: {
    Splitpanes,
    Pane,
    JournalPane,
    MediaLibrary,
    CapturePane,
    TeamPane,
  },
  data() {
    return {};
  },
  created() {},
  mounted() {},
  beforeDestroy() {},
  watch: {},
  computed: {},
  methods: {
    resized(shown_panes) {
      console.log(`Project / methods: resized`);
      let index = 0;
      const panes = this.panes.slice().map((p) => {
        if (p.enabled) {
          p.size_pc = Number(shown_panes[index].size.toFixed(2));
          index++;
        }
        return p;
      });
      this.$emit("update:panes", panes);
    },
  },
};
</script>
<style lang="scss" scoped></style>
