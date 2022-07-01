<template>
  <div class="_collaborativeEditor">
    <component :is="`style`" v-html="font_selector_css" />
    <div ref="editor" class="" />
    <transition name="fade" :duration="600">
      <div
        class="quillWrapper--savingIndicator"
        v-if="enable_collaboration && (is_loading_or_saving || show_saved_icon)"
      >
        <transition name="fade" :duration="600">
          <template v-if="is_loading_or_saving">
            <span class="loader loader-small" />
          </template>
          <template v-else-if="show_saved_icon">
            <span>✓</span>
          </template>
        </transition>
      </div>
    </transition>

    ID : {{ editor_id }} Etat de la connection : {{ connection_state }}
    <sl-button v-if="!enable_collaboration" @click="saveText" size="small"
      >Save</sl-button
    >
  </div>
</template>
<script>
import ReconnectingWebSocket from "reconnectingwebsocket";
import ShareDB from "sharedb/lib/client";
import Quill from "quill";
ShareDB.types.register(require("rich-text").type);

import { toolbar, fonts, formats } from "./quill/defaults.js";

const FontAttributor = Quill.import("attributors/style/font");
FontAttributor.whitelist = fonts;
Quill.register(FontAttributor, true);

var BlockEmbed = Quill.import("blots/block/embed");
class DividerBlot extends BlockEmbed {}
DividerBlot.blotName = "divider";
DividerBlot.tagName = "hr";
Quill.register(DividerBlot);

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
      socket: null,
      connection_state: null,
      debounce_textUpdate: undefined,
      enable_collaboration: true,

      is_loading_or_saving: false,
      show_saved_icon: false,

      editor_id: (Math.random().toString(36) + "00000000000000000").slice(
        2,
        5 + 5
      ),
    };
  },
  created() {},
  mounted() {
    this.initEditor();
    if (this.enable_collaboration) this.initCollaborative();
  },
  beforeDestroy() {
    if (this.socket) this.socket.close();
  },
  watch: {
    content() {
      if (!this.enable_collaboration) this.editor.root.innerHTML = this.content;
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
        // debug: "info",
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

    initCollaborative() {
      const params = new URLSearchParams({
        folder_type: this.folder_type,
        folder_slug: this.folder_slug,
        meta_slug: this.meta_slug,
      });

      const requested_querystring = "?" + params.toString();
      const requested_resource_url =
        (location.protocol === "https:" ? "wss" : "ws") +
        "://" +
        window.location.host +
        "/sharedb" +
        requested_querystring;

      console.log(
        `CollaborativeEditor / initWebsocketMode : will connect to ws server with ${requested_resource_url}`
      );

      this.socket = new ReconnectingWebSocket(requested_resource_url);
      const connection = new ShareDB.Connection(this.socket);
      connection.on("state", (state) => {
        this.connection_state = state.toString();
      });

      this.is_loading_websocket = true;

      const doc = connection.get("textMedias", requested_querystring);
      doc.subscribe((err) => {
        if (err) {
          console.error(`ON • CollaborativeEditor: err ${err}`);
        }
        console.log(`ON • CollaborativeEditor: subscribe`);

        if (!doc.type) {
          console.log(
            `ON • CollaborativeEditor: no type found on doc, creating a new one with content ${JSON.stringify(
              this.editor.getContents()
            )}`
          );
          doc.create(this.editor.getContents(), "rich-text");
        } else {
          console.log(
            `ON • CollaborativeEditor: doc already exists and doc.data = ${JSON.stringify(
              doc.data,
              null,
              4
            )}`
          );
          this.editor.setContents(doc.data, "init");
        }

        this.editor.history.clear();
        // this.editor.setSelection(this.editor.getLength(), 0, "api");
        // this.$emit("input", this.sanitizeEditorHTML());

        this.editor.on("text-change", (delta, oldDelta, source) => {
          if (source == "user") {
            doc.submitOp(delta, { source: this.editor_id });
            this.updateTextMedia();
          } else {
            console.log(`ON • CollaborativeEditor: text-change by API`);
          }
        });
        doc.on("op", (op, source) => {
          if (source === this.editor_id) return;
          console.log(`ON • CollaborativeEditor: operation applied to quill`);
          this.editor.updateContents(op);
        });
      });

      doc.on("error", () => {
        // err;
        // soucis : les situations ou le serveur a été fermé et en le rouvrant il ne possède plus d’instance du doc dans sharedb…
        this.$forceUpdate();
      });
    },

    updateTextMedia() {
      if (this.debounce_textUpdate) clearTimeout(this.debounce_textUpdate);
      this.is_loading_or_saving = true;
      this.debounce_textUpdate = setTimeout(async () => {
        console.log(
          `CollaborativeEditor • updateTextMedia: saving new snapshop`
        );

        await this.saveText();
        this.is_loading_or_saving = false;
        this.show_saved_icon = true;
        setTimeout(() => {
          this.show_saved_icon = false;
        }, 200);
      }, 1000);
    },
  },
};
</script>
<style src="quill/dist/quill.snow.css"></style>
<style lang="scss" scoped>
._collaborativeEditor {
  position: relative;
  font-size: 110%;

  ::v-deep .ql-toolbar {
    position: sticky;
    top: 0;
    z-index: 2;
    font-size: inherit;
    font-family: inherit;
    font-weight: normal;
    background: black;
    color: white !important;

    .ql-fill,
    .ql-stroke.ql-fill {
      fill: white;
    }

    .ql-stroke {
      stroke: white;
    }

    .ql-picker {
      color: white;
    }

    .ql-picker.ql-font {
      width: 140px;
    }
  }
  ::v-deep {
    .ql-container {
      font-size: inherit;
      font-family: inherit;
      font-weight: normal;
    }
    .ql-editor {
      // color: blue;
    }
  }
}
</style>
