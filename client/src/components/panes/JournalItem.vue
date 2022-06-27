<template>
  <div>
    {{ file.slug }}
    <br />
    <textarea v-model="new_text" />
    <sl-button @click="saveText">Save</sl-button>
    <sl-button @click="getArchives">Archives</sl-button>

    <div class="_archives">
      <div v-for="archive in archives" :key="archive.filename">
        <DateField
          :title="'date'"
          :show_detail_initially="true"
          :date="archive.date"
        />
        <textarea readonly :value="archive.content" />
      </div>
    </div>

    <sl-button @click="removeText">Remove</sl-button>
    <br />
    {{ file.content }}
  </div>
</template>
<script>
export default {
  props: {
    project_slug: String,
    file: Object,
  },
  components: {},
  data() {
    return {
      new_text: this.file.content,
      archives: null,
    };
  },
  created() {},
  mounted() {},
  beforeDestroy() {},
  watch: {
    "file.content"() {
      this.new_text = this.file.content;
    },
  },
  computed: {},
  methods: {
    async saveText() {
      const new_meta = {
        content: this.new_text,
      };

      await this.$api.updateItem({
        folder_type: "projects",
        folder_slug: this.project_slug,
        meta_slug: this.file.slug,
        new_meta,
      });
    },
    async removeText() {
      await this.$api.deleteItem({
        folder_type: "projects",
        folder_slug: this.project_slug,
        meta_slug: this.file.slug,
      });
    },
    async getArchives() {
      this.archives = await this.$api.getArchives({
        folder_type: "projects",
        folder_slug: this.project_slug,
        meta_slug: this.file.slug,
      });
    },
  },
};
</script>
<style lang="scss" scoped>
textarea {
  width: 100%;
  min-height: 13ch;
}

._archives {
  display: flex;
  flex-flow: row wrap;
  list-style: none;
  gap: calc(var(--spacing) / 2);

  > * {
    background: white;
    padding: calc(var(--spacing) / 2);
  }
}
</style>
