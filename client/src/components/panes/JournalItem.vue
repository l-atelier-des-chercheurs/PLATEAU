<template>
  <div class="_journalItem">
    <sl-details :summary="file.title">
      <CollaborativeEditor2
        :folder_type="'projects'"
        :folder_slug="project_slug"
        :meta_slug="file.slug"
        :content="file.content"
      />
      <sl-button @click="getArchives" size="small">Archives</sl-button>

      <div class="_archives" v-if="archives">
        <div v-for="archive in archives" :key="archive.filename">
          <DateField
            :title="'date'"
            :show_detail_initially="true"
            :date="archive.date"
          />
          <textarea readonly :value="archive.content" />
        </div>
      </div>

      <sl-button @click="removeText" size="small">Remove</sl-button>

      <!-- <pre>{{ file.content }}</pre> -->
    </sl-details>
  </div>
</template>
<script>
import CollaborativeEditor2 from "@/components/fields/CollaborativeEditor2.vue";

export default {
  props: {
    project_slug: String,
    file: Object,
  },
  components: {
    CollaborativeEditor2,
  },
  data() {
    return {
      archives: null,
    };
  },
  created() {},
  mounted() {},
  beforeDestroy() {},
  watch: {},
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
  },
};
</script>
<style lang="scss" scoped>
._journalItem {
  // padding: var(--sl-spacing-medium);
  // margin-top: -1px;
  // margin-bottom: -1px;
}
sl-details::part(base) {
  border-color: black;
  border-top-width: 0;
  border-left-width: 0;
  border-right-width: 0;
  border-radius: 0;
}
sl-details::part(content) {
  overflow: initial;
}

h2 {
  font-weight: 300;
  margin: 0;
}

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
