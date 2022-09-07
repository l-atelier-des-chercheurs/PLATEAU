<template>
  <div>
    <sl-button
      @click="toggleArchives"
      size="small"
      caret
      :active="show_archives"
    >
      Archives
    </sl-button>

    <div class="_archives" v-if="show_archives">
      <div class="_archive" v-for="archive in archives" :key="archive.filename">
        <small>
          <DateField :show_detail_initially="true" :date="archive.date" />
        </small>
        <sl-button size="small" variant="text" disabled>
          sélectionner tout le texte
        </sl-button>
        <sl-button
          size="small"
          variant="text"
          @click="restoreVersion(archive.content)"
        >
          restaurer cette version
        </sl-button>

        <div class="_archiveText" v-html="archive.content" />
      </div>
    </div>
  </div>
</template>
<script>
export default {
  props: {
    folder_type: String,
    folder_slug: String,
    meta_slug: String,
  },
  components: {},
  data() {
    return {
      archives: null,
      show_archives: false,
    };
  },
  created() {},
  mounted() {},
  beforeDestroy() {},
  watch: {},
  computed: {},
  methods: {
    async getArchives() {
      this.archives = await this.$api.getArchives({
        folder_type: this.folder_type,
        folder_slug: this.folder_slug,
        meta_slug: this.meta_slug,
      });
    },
    toggleArchives() {
      this.show_archives = !this.show_archives;
      if (this.show_archives) this.getArchives();
    },
    restoreVersion(content) {
      this.$emit("restore", content);
    },
  },
};
</script>
<style lang="scss" scoped>
._archives {
  border: 1px solid black;
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 1px;
  padding: 1px;

  > * {
    background: white;
    padding: calc(var(--spacing) / 2);
  }
}

._archiveText {
  background: #eee;
  padding: calc(var(--spacing) / 2);
  width: 100%;
  max-height: 150px;
  overflow: auto;

  ::v-deep > *:first-child {
    margin-top: 0;
  }
}
</style>
