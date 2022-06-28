<template>
  <div class="_journal">
    <div
      v-for="file of files"
      :key="file.slug"
      :file="file"
      :project_slug="project.slug"
    >
      <JournalItem :file="file" :project_slug="project.slug" />
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

      await this.$axios.patch(`/projects/${this.project.slug}`, {
        journal_items,
      });

      this.show_create_entry = false;
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
