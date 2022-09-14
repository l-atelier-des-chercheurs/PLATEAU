<template>
  <div class="_journalItem">
    <sl-details
      :summary="file.title"
      @sl-show="onShow"
      @sl-hide="onHide"
      ref="detail"
    >
      <DateField class="" :title="'date_created'" :date="file.date_uploaded" />
      <DateField :title="'date_modified'" :date="file.date_modified" />
      <sl-button @click="removeText" size="small">Supprimer</sl-button>
    </sl-details>
    <CollaborativeEditor2
      v-if="is_open"
      :folder_type="'projects'"
      :folder_slug="project_slug"
      :meta_slug="file.slug"
      :content="file.content"
      :scrollingContainer="scrollingContainer"
    />
  </div>
</template>
<script>
import CollaborativeEditor2 from "@/components/fields/CollaborativeEditor2.vue";

export default {
  props: {
    file: Object,
    project_slug: String,
    open_initially: Boolean,
    scrollingContainer: HTMLElement,
  },
  components: {
    CollaborativeEditor2,
  },
  data() {
    return {
      is_open: this.open_initially,
    };
  },
  created() {},
  mounted() {
    if (this.open_initially) {
      this.$nextTick(() => {
        // setTimeout(() => {
        if (this.$refs.detail.show) this.$refs.detail.show();
        // }, 500);
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
    onShow() {
      if (!this.is_open) this.is_open = true;
    },
    onHide() {
      if (this.is_open) this.is_open = false;
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

._editor {
  // padding: var(--spacing) 0;
  // max-width: 120ch;
}
</style>
