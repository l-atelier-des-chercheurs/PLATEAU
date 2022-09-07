<template>
  <div class="_collaborativeEditor" :data-editable="is_editable">
    <component :is="`style`" v-html="font_selector_css" />
    <div ref="editBtn" class="_btnContainer">
      <sl-button v-if="!is_editable" @click="toggleEdit" size="small">
        <sl-icon slot="prefix" name="pencil" />Modifier
      </sl-button>
      <sl-button v-else @click="saveText" size="small">Enregistrer</sl-button>
    </div>
    <div
      ref="editor"
      class=""
      :class="{
        'is--dragover': is_being_dragover,
      }"
      @dragover="onDragover"
      @dragleave="onDragLeave"
      @drop="onDrop"
    />
    <transition name="fade" :duration="600">
      <div
        class="quillWrapper--savingIndicator"
        v-if="is_collaborative && (is_loading_or_saving || show_saved_icon)"
      >
        <transition name="fade" :duration="600"
          >""
          <template v-if="is_loading_or_saving">
            <span class="loader loader-small" />
          </template>
          <template v-else-if="show_saved_icon">
            <span>✓</span>
          </template>
        </transition>
      </div>
    </transition>

    <template v-if="is_editable">
      <span v-if="is_collaborative">
        ID : {{ editor_id }} Etat de la connection : {{ connection_state }}
      </span>
      <sl-button v-else @click="saveText" size="small"> Save </sl-button>
    </template>
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

import MediaBlot from "./quill/MediaBlot";
import CardEditableModule from "./quill/CardEditableModule";

Quill.register("formats/media", MediaBlot);
Quill.register("modules/cardEditable", CardEditableModule);

// how it works:
// -> disabled by default
// -> if can_be_edited is true, an edit button is displayed up top
// -> is is_collaborative is true, it uses sharedb on the server to handle conflict-free editing

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

      is_collaborative: false,
      is_editable: false,
      is_being_dragover: false,
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
    // this.enableEditor();
  },
  beforeDestroy() {
    if (this.socket) this.socket.close();
  },
  watch: {
    content() {
      if (!this.is_collaborative) this.editor.root.innerHTML = this.content;
    },
    is_editable() {},
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
    async initEditor() {
      this.editor = new Quill(this.$refs.editor, {
        // debug: "info",
        modules: {
          cardEditable: true,
          toolbar: toolbar,
        },
        bounds: this.$refs.editor,
        theme: "snow",
        formats,
        placeholder: "…",
        readOnly: !this.is_editable,
      });
      if (this.content) this.editor.root.innerHTML = this.content;

      if (this.$refs.editBtn)
        this.$el.querySelector(".ql-toolbar").appendChild(this.$refs.editBtn);
      // document.getElementById('target').appendChild(  document.getElementById('to_be_moved') )

      // this.$el.querySelector(".ql-edit").addEventListener("click", () => {
      //   this.toggleEdit();
      // });
    },

    getEditorContent() {
      if (!this.editor.getText() || this.editor.getText() === "\n") return "";
      let content = this.editor.root.innerHTML;
      // used to make sure we don’t get weird stuff such as <p style="font-family: "Avada";">plop</p>
      content = content.replace(/&quot;/g, "'");
      return content;
    },

    toggleEdit() {
      if (!this.is_editable) this.enableEditor();
      else this.disableEditor();
    },
    enableEditor() {
      this.editor.enable();
      this.is_editable = true;
    },
    disableEditor() {
      this.editor.disable();
      this.is_editable = false;
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

      this.disableEditor();
    },

    startCollaborative() {
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
        `CollaborativeEditor / startCollaborative : will connect to ws server with ${requested_resource_url}`
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
    endCollaborative() {},

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

    addMediaAtTheEnd(media) {
      this.addMediaAtIndex(this.editor.getLength() - 1, media);
    },
    addMediaAtCaretPosition(media) {
      const selection = this.editor.getSelection(true);
      if (selection && selection.index) {
        this.addMediaAtIndex(selection.index, media);
        return;
      }
      this.addMediaAtTheEnd(media);
    },
    addMediaAtIndex(index, media) {
      console.log(`CollaborativeEditor • addMediaAtIndex ${index}`);
      const mediaURL = `./${this.folder_slug}/${media.media_filename}`;
      // const mediaURL =
      //   this.$root.state.mode === "export_publication"
      //     ? `./${this.folder_slug}/${media.media_filename}`
      //     : `/${this.folder_slug}/${media.media_filename}`;

      // setting editor focus and selection can cause the scroll to "jump"
      // not exactly a good idea…
      // this.editor.setSelection(index, Quill.sources.SILENT);
      // this.editor.focus();

      this.editor.blur();

      const { type, caption, slug } = media;

      if (type === "image") {
        const thumb_path = media.thumbs[1600];
        if (thumb_path) {
          // this.editor.insertText(index, "\n", Quill.sources.USER);
          this.editor.insertEmbed(
            index,
            "media",
            {
              type,
              caption,
              meta_filename: slug,
              src: `/thumbs/${this.folder_type}/${this.folder_slug}/${thumb_path}`,
            },
            Quill.sources.USER
          );
          // this.editor.setSelection(index + 1, Quill.sources.SILENT);
        }
      } else if (type === "video") {
        // this.editor.insertText(index, "\n", Quill.sources.USER);
        this.editor.insertEmbed(
          index,
          "media",
          {
            type,
            caption,
            meta_filename: slug,
            src: mediaURL,
          },
          Quill.sources.USER
        );
        // this.editor.setSelection(index + 1, Quill.sources.SILENT);
      } else if (media.type === "audio") {
        this.editor.insertEmbed(
          index,
          "media",
          {
            type,
            caption,
            meta_filename: slug,
            src: mediaURL,
          },
          Quill.sources.USER
        );
      } else {
        this.$alertify
          .closeLogOnClick(true)
          .delay(4000)
          .error(this.$t("notifications.media_type_not_handled"));
      }
    },

    onDragover($event) {
      console.log(`CollaborativeEditor2 / onDragover`);
      this.is_being_dragover = true;

      this.removeDragoverFromBlots();
      // this.removeFocusFromBlots();

      const _blot = this.getBlockFromElement($event.target);
      if (_blot) _blot.domNode.classList.add("is--dragover");
    },
    onDragLeave($event) {
      if (
        $event.target.classList.contains("ql-editor") ||
        this.getBlockFromElement($event.target) !== false
      )
        return;

      console.log(`CollaborativeEditor2 / onDragLeave`);
      this.is_being_dragover = false;
    },

    onDrop($event) {
      console.log(`CollaborativeEditor2 / onDrop`);

      // Prevent default behavior (Prevent file from being opened)
      $event.preventDefault();
      $event.dataTransfer.dropEffect = "move";

      this.removeDragoverFromBlots();

      if ($event.dataTransfer.getData("text/plain") === "media_in_quill") {
        console.log(
          `CollaborativeEditor2 / onDrop : : drag and dropped a media from quill`
        );

        let _blot = this.getBlockFromElement($event.target);
        const index = this.editor.getIndex(_blot);

        // find which blot was dragged (A)

        // find where it was dropped (B)

        // move delta from A to B

        console.log(`_blot is currently at index ${index}`);
      } else if ($event.dataTransfer.getData("text/plain")) {
        console.log(
          `CollaborativeEditor2 / onDrop : : dropped a media from the library`
        );

        const media = JSON.parse($event.dataTransfer.getData("text/plain"));
        console.log(media);

        if (media.media_filename) {
          // drop sur l’éditor et pas sur une ligne
          if ($event.target.classList.contains("ql-editor")) {
            console.log(
              "dropped on editor and not on line, will insert at the end of doc"
            );
            this.addMediaAtIndex(this.editor.getLength() - 1, media);
            return;
          }

          let _blot = this.getBlockFromElement($event.target);

          if (!_blot) {
            this.$alertify
              .closeLogOnClick(true)
              .delay(4000)
              .error(this.$t("notifications.failed_to_find_block_line"));
            return;
          }

          _blot =
            _blot.next !== null && _blot.next.domNode ? _blot.next : _blot;

          const index = this.editor.getIndex(_blot);
          this.addMediaAtIndex(index, media);
        }
      }
    },

    removeDragoverFromBlots() {
      this.editor.getLines().map((b) => {
        while (b.parent !== b.scroll) {
          b = b.parent;
          if (b === b.scroll) {
            break;
          }
        }
        if (b !== b.scroll && b.domNode) {
          b.domNode.classList.remove("is--dragover");
        }
      });
    },

    getBlockFromElement(_target) {
      while (!_target.parentElement.classList.contains("ql-editor")) {
        _target = _target.parentElement;
        if (_target === null || !_target.parentElement) break;
      }
      let _blot = Quill.find(_target);
      if (_blot) {
        return _blot;
      }
      return false;
    },
  },
};
</script>
<style src="quill/dist/quill.snow.css"></style>
<style lang="scss" scoped>
._collaborativeEditor {
  position: relative;
  font-size: 100%;
  --toolbar-bg: var(--color-Journal);

  ::v-deep .ql-toolbar {
    position: sticky;
    top: 0;
    z-index: 2;
    font-size: inherit;
    font-family: inherit;
    font-weight: normal;
    background-color: var(--toolbar-bg);
    color: black !important;

    // border-radius: 0.5em;
    border: none;

    button,
    svg {
      color: currentColor;
    }

    .ql-fill,
    .ql-stroke.ql-fill {
      fill: currentColor;
    }

    .ql-stroke {
      stroke: currentColor;
    }

    .ql-picker {
      color: currentColor;
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
      background-color: var(--toolbar-bg);

      &:not(.ql-disabled) {
      }
    }

    .ql-editor {
      padding: 0;
      counter-reset: listCounter;
      height: auto;
      overflow: visible;

      margin: 0 calc(var(--spacing) * 2);
      background-color: white;
      border-radius: 4px;

      > * {
        padding: 0 calc(var(--spacing));
        margin: 0;
      }
      > img {
        max-width: 30ch;
      }

      > * {
        counter-increment: listCounter;
        position: relative;
        // padding-left: calc(var(--spacing));

        &::before {
          content: "";

          // font-family: "IBM Plex Sans", "OutputSansVariable";
          position: absolute;
          padding-top: 0.85em;
          right: 100%;
          text-align: right;

          font-size: 0.6rem;
          text-align: center;
          text-overflow: ellipsis;
          white-space: nowrap;
          overflow: hidden;
          width: calc(var(--spacing) * 2);
          max-width: 100px;
          // padding-right: calc(var(--spacing) / 2);
          color: transparent;
          color: hsl(210, 11%, 18%);

          transition: all 0.1s cubic-bezier(0.19, 1, 0.22, 1);

          content: counter(listCounter);
        }

        &.is--focused,
        &.is--dragover {
          &::before {
            background-color: var(--active-color);
          }
        }

        &::after {
          content: "";
          display: block;
          width: 100%;
          height: 0;
          margin: 0;
          background-color: var(--c-rouge);
        }

        &.is--dragover {
          &::after {
            // margin: var(--spacing) 0;
            // height: 4px;
            transition: all 0.1s cubic-bezier(0.19, 1, 0.22, 1);
          }
        }
      }
    }

    .ql-container.ql-disabled {
      .ql-editor > * {
        cursor: inherit;
      }
    }
  }
}

._collaborativeEditor:not([data-editable="true"]) ._btnContainer {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  display: flex;
  justify-content: center;
  align-items: center;
  background-color: var(--toolbar-bg);
}
</style>
