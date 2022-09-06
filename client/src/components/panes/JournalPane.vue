<template>
  <div class="_journal">
    <div
      v-for="file of files"
      :key="file.slug"
      :file="file"
      :project_slug="project.slug"
    >
      <JournalItem
        :file="file"
        :project_slug="project.slug"
        :open_initially="entryStatus({ slug: file.slug })"
        @toggleEntry="toggleEntry({ slug: file.slug, is_open: $event })"
      />
    </div>

    <div class="_createForm">
      <sl-button variant="text" @click="show_create_entry = !show_create_entry"
        >Créer une entrée</sl-button
      >
      <form
        v-if="show_create_entry"
        class="input-validation-required"
        @submit.prevent="createText"
      >
        <sl-input name="title" label="Titre" required />
        <br />
        <sl-button type="submit" variant="primary">Créer</sl-button>
      </form>
    </div>
  </div>
</template>
<script>
import JournalItem from "./JournalItem.vue";

export default {
  props: {
    project: Object,
    opened_journal_entries: Array,
  },
  components: {
    JournalItem,
  },
  data() {
    return {
      show_create_entry: false,
    };
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
    async createText($event) {
      const formData = new FormData($event.target);
      const formProps = Object.fromEntries(formData);

      const title = formProps.title;
      if (!title) throw new Error("Missing title");

      const meta_filename = await this.$api.uploadText({
        folder_type: "projects",
        folder_slug: this.project.slug,
        filename: "journal-" + title + ".txt",
        additional_meta: {
          is_journal: true,
          title,
        },
      });

      const journal_items = this.project.journal_items?.slice() || [];
      journal_items.push(meta_filename);

      // TODO use updateItem

      await this.$axios.patch(`/projects/${this.project.slug}`, {
        journal_items,
      });

      this.show_create_entry = false;
    },
    entryStatus({ slug }) {
      // todo : is entry opened or close (if its meta name is in this.opened_journal_entries)
      return this.opened_journal_entries.includes(slug);
    },
    toggleEntry({ slug, is_open }) {
      // todo : add or remove slug from opened_journal_entries
      let opened_journal_entries = this.opened_journal_entries;
      opened_journal_entries = opened_journal_entries.filter(
        (je) => je !== slug
      );
      if (is_open) opened_journal_entries.push(slug);

      this.$emit("update:opened_journal_entries", opened_journal_entries);
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
._createForm {
  padding: var(--spacing);
}
</style>
