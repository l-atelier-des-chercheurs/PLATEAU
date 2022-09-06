<template>
  <div class="_journalItem">
    <sl-details
      :summary="file.title"
      @sl-show="afterShow"
      @sl-hide="hide"
      ref="detail"
    >
      <DateField class="" :title="'date_created'" :date="file.date_uploaded" />
      <DateField :title="'date_modified'" :date="file.date_modified" />
      <sl-button @click="removeText" size="small">Supprimer</sl-button>
      <sl-button
        @click="toggleArchives"
        size="small"
        caret
        :active="show_archives"
      >
        Archives
      </sl-button>
      <div class="_archives" v-if="show_archives">
        <div
          class="_archive"
          v-for="archive in archives"
          :key="archive.filename"
        >
          <small>
            <DateField :show_detail_initially="true" :date="archive.date" />
          </small>
          <sl-button size="small" variant="text" disabled>
            sélectionner tout le texte
          </sl-button>

          <div class="_archiveText" v-html="archive.content" />
        </div>
      </div>

      <!-- <pre>{{ file.content }}</pre> -->
    </sl-details>

    <transition name="fade_fast">
      <div class="_editor" v-if="is_open">
        <CollaborativeEditor2
          :folder_type="'projects'"
          :folder_slug="project_slug"
          :meta_slug="file.slug"
          :content="file.content"
        />
      </div>
    </transition>
  </div>
</template>
<script>
import CollaborativeEditor2 from "@/components/fields/CollaborativeEditor2.vue";

export default {
  props: {
    file: Object,
    project_slug: String,
    open_initially: Boolean,
  },
  components: {
    CollaborativeEditor2,
  },
  data() {
    return {
      archives: null,
      show_archives: false,
      is_open: false,
    };
  },
  created() {},
  mounted() {
    if (this.open_initially) {
      this.$nextTick(() => {
        this.$refs.detail.show();
      });
    }
  },
  beforeDestroy() {},
  watch: {
    is_open() {
      this.$emit("toggleEntry", this.is_open);
    },
  },
  computed: {},
  methods: {
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
    afterShow() {
      this.is_open = true;
    },
    hide() {
      this.is_open = false;
    },
    toggleArchives() {
      this.show_archives = !this.show_archives;
      if (this.show_archives) this.getArchives();
    },
  },
};
</script>
<style lang="scss" scoped>
._journalItem {
  // padding: var(--sl-spacing-medium);
  // margin-top: -1px;
  // margin-bottom: -1px;
  border-bottom: 1px solid black;
  background: white;
}
sl-details::part(summary) {
  font-size: 120%;
}
sl-details::part(base) {
  border-color: black;
  border-width: 0;
  border-radius: 0;
}
sl-details::part(content) {
  overflow: initial;
  padding-top: 0;
  padding-bottom: var(--sl-spacing-small);
}

._archives {
  border: 1px solid black;
  overflow: auto;

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

._editor {
  padding: var(--spacing) 0;
  max-width: 120ch;
}
</style>
