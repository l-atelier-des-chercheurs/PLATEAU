<template>
  <splitpanes
    watch-slots
    :dbl-click-splitter="false"
    @resized="resized"
    :key="JSON.stringify(projectpanes.map((p) => p.key))"
  >
    <template v-if="projectpanes.filter((p) => p.enabled).length === 0">
      <pane><i>Aucune panneau n’est actif</i></pane>
    </template>
    <template v-else v-for="pane in projectpanes">
      <pane
        v-if="pane.key === 'Journal' && pane.enabled"
        :key="pane.key"
        min-size="5"
        :size="pane.size_pc"
        ref="Journal"
      >
        <JournalPane
          :project="project"
          :opened_journal_entries="opened_journal_entries"
          @update:opened_journal_entries="
            $emit('update:opened_journal_entries', $event)
          "
        />
      </pane>

      <pane
        v-else-if="pane.key === 'MediaLibrary' && pane.enabled"
        :key="pane.key"
        min-size="5"
        :size="pane.size_pc"
        ref="MediaLibrary"
      >
        <MediaLibrary
          :project="project"
          :libpanes="libpanes"
          @update:libpanes="$emit('update:libpanes', $event)"
          :media_focused="media_focused"
          @update:media_focused="$emit('update:media_focused', $event)"
        />
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
    projectpanes: Array,
    libpanes: Array,
    opened_journal_entries: Array,
    project: Object,
    media_focused: String,
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
      const projectpanes = this.projectpanes.slice().map((p) => {
        if (p.enabled) {
          p.size_pc = Number(shown_projectpanes[index].size.toFixed(2));
          index++;
        }
        return p;
      });
      this.$emit("update:panes", projectpanes);
    },
  },
};
</script>
<style lang="scss" scoped></style>
