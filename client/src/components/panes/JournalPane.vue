<template>
  <div class="_journal">
    Journal <br />

    Journal {{ files.length }}
    <div
      v-for="file of files"
      :key="file.slug"
      :file="file"
      :project_slug="project.slug"
    >
      <JournalItem :file="file" :project_slug="project.slug" />
    </div>

    <sl-button @click="createText">Créer une entrée</sl-button>
  </div>
</template>
<script>
import JournalItem from "./JournalItem.vue";

export default {
  props: {
    project: Object,
  },
  components: {
    JournalItem,
  },
  data() {
    return {};
  },
  created() {},
  mounted() {},
  beforeDestroy() {},
  watch: {},
  computed: {
    files() {
      return this.project.files.filter((f) => f.is_journal === true) || [];
    },
  },
  methods: {
    async createText() {
      const meta_filename = await this.$api.uploadText({
        folder_type: "projects",
        folder_slug: this.project.slug,
        filename: "journal.txt",
        content: "PLOP PLIP" + Math.random(),
        mimetype: { type: "text/plain" },
        additional_meta: {
          is_journal: true,
        },
      });

      const journal_items = this.project.journal_items?.slice() || [];
      journal_items.push(meta_filename);

      await this.$axios.patch(`/projects/${this.project.slug}`, {
        journal_items,
      });
    },
  },
};
</script>
<style lang="scss" scoped>
._journal {
  background: var(--color-Journal);
  height: 100%;
  overflow: auto;
}
</style>
