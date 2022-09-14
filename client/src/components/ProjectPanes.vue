<template>
  <splitpanes watch-slots :dbl-click-splitter="false" @resized="resized">
    <template v-if="projectpanes.length === 0">
      <pane><i>Aucune panneau n’est actif</i></pane>
    </template>
    <template v-else v-for="(pane, index) in projectpanes">
      <pane
        v-if="pane.type === 'Journal'"
        :key="pane.key"
        min-size="5"
        :size="pane.size"
        ref="Journal"
      >
        <JournalPane
          :project="project"
          :opened_journal_entries="pane.pads"
          @update:opened_journal_entries="pane.pads = $event"
        />
      </pane>

      <pane
        v-else-if="pane.type === 'MediaLibrary'"
        :key="pane.key"
        min-size="5"
        :size="pane.size"
        ref="MediaLibrary"
      >
        <MediaLibrary
          :project="project"
          :focus_height="pane.focus_height"
          @update:focus_height="pane.focus_height = $event"
          :media_focused="pane.focus"
          @update:media_focused="pane.focus = $event"
        />
      </pane>

      <pane
        v-else-if="pane.type === 'Capture'"
        :key="pane.key"
        min-size="5"
        :size="pane.size"
        ref="Capture"
      >
        <CapturePane :project="project" />
      </pane>

      <pane
        v-else-if="pane.type === 'Team'"
        :key="pane.key"
        min-size="5"
        :size="pane.size"
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
    projectpanes: Array,
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
    resized(shown_projectpanes) {
      console.log(`Project / methods: resized`);
      let index = 0;
      this.projectpanes.map((p) => {
        p.size = Number(p.size.toFixed(1));
        return p;
      });
      // this.$emit("update:projectpanes", projectpanes);
    },
  },
};
</script>
<style lang="scss" scoped></style>
