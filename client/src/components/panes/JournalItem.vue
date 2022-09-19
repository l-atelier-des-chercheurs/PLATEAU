<template>
  <div
    class="_journalItem"
    :class="{
      'is--open': is_open,
    }"
  >
    <sl-details
      :summary="file.title"
      @sl-show="onShow"
      @sl-hide="onHide"
      ref="detail"
    >
      <sl-tree>
        <sl-tree-item>
          Informations
          <sl-tree-item>
            Date de création
            <sl-tree-item>
              <DateField
                :date="file.date_uploaded"
                :show_detail_initially="true"
              />
            </sl-tree-item>
          </sl-tree-item>
          <sl-tree-item>
            Date de dernière modification
            <sl-tree-item>
              <DateField
                :date="file.date_modified"
                :show_detail_initially="true"
              />
            </sl-tree-item>
          </sl-tree-item>
          <sl-tree-item>
            Supprimer cette entrée
            <sl-tree-item>
              <sl-button @click="removeText" size="small">Confirmer</sl-button>
            </sl-tree-item>
          </sl-tree-item>
        </sl-tree-item>
      </sl-tree>
    </sl-details>
    <CollaborativeEditor2
      v-if="is_open"
      :folder_type="'projects'"
      :folder_slug="project_slug"
      :file="file"
      :scrollingContainer="scrollingContainer"
      :line_selected="line_selected"
      @lineClicked="$emit('lineClicked', $event)"
    />
  </div>
</template>
<script>
import CollaborativeEditor2 from "@/adc-core/fields/collaborative-editor/CollaborativeEditor2.vue";

export default {
  props: {
    file: Object,
    project_slug: String,
    status: [Boolean, Object],
    scrollingContainer: HTMLElement,
  },
  components: {
    CollaborativeEditor2,
  },
  data() {
    return {
      is_open: false,
    };
  },
  created() {},
  mounted() {
    if (this.status) {
      this.$nextTick(() => {
        if (this.$refs.detail.show) this.$refs.detail.show();
      });
    }
  },
  beforeDestroy() {},
  watch: {
    is_open() {
      this.$emit("toggleEntry", this.is_open);
    },
  },
  computed: {
    line_selected() {
      return this.status && this.status.line;
    },
  },
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
  // border-bottom: 5px solid black;
  // margin-bottom: calc(var(--spacing) / 1);
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
  padding: 0;
  padding-bottom: var(--sl-spacing-small);
}

._editor {
  // padding: var(--spacing) 0;
  // max-width: 120ch;
}
</style>
