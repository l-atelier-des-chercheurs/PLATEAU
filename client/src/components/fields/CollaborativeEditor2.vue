<template>
  <div class="_collaborativeEditor">
    <component :is="`style`" v-html="font_selector_css" />
    <div ref="editor" class="" />
    <sl-button @click="saveText" size="small">Save</sl-button>
  </div>
</template>
<script>
import { toolbar, fonts, formats } from "./quill/defaults.js";
import Quill from "quill";

const FontAttributor = Quill.import("attributors/style/font");
FontAttributor.whitelist = fonts;
Quill.register(FontAttributor, true);

export default {
  props: {
    folder_type: String,
    folder_slug: String,
    meta_slug: String,
    content: String,
  },
  components: {},
  data() {
    return {
      editor: null,
    };
  },
  created() {},
  mounted() {
    this.initEditor();
  },
  beforeDestroy() {},
  watch: {
    content() {
      this.editor.root.innerHTML = this.content;
    },
  },
  computed: {
    font_selector_css() {
      fonts;
      let css = "";
      for (const font of fonts) {
        css += `
.ql-picker.ql-font .ql-picker-label[data-value="${font}"]::before,
.ql-picker.ql-font .ql-picker-item[data-value="${font}"]::before {
  content: "${font}";
  font-family: "${font}";
}
        `;
      }
      return css;
    },
  },
  methods: {
    initEditor() {
      this.editor = new Quill(this.$refs.editor, {
        debug: "info",
        modules: {
          toolbar: toolbar,
        },
        bounds: this.$refs.editor,
        theme: "snow",
        formats,
        placeholder: "…",
      });

      if (this.content) this.editor.root.innerHTML = this.content;
    },
    getEditorContent() {
      if (!this.editor.getText() || this.editor.getText() === "\n") return "";
      let content = this.editor.root.innerHTML;
      // used to make sure we don’t get weird stuff such as <p style="font-family: "Avada";">plop</p>
      content = content.replace(/&quot;/g, "'");
      return content;
    },

    async saveText() {
      const new_meta = {
        content: this.getEditorContent(),
      };
      await this.$api.updateItem({
        folder_type: this.folder_type,
        folder_slug: this.folder_slug,
        meta_slug: this.meta_slug,
        new_meta,
      });
    },
  },
};
</script>
<style src="quill/dist/quill.snow.css"></style>
<style lang="scss" scoped>
._collaborativeEditor {
  position: relative;

  ::v-deep .ql-toolbar {
    position: sticky;
    top: 0;
    z-index: 2;
    font-size: inherit;
    font-family: inherit;
    font-weight: normal;
    background: white;

    .ql-picker.ql-font {
      width: 140px;
    }
  }
  ::v-deep .ql-container {
    font-size: inherit;
    font-family: inherit;
    font-weight: normal;
  }
}
</style>
