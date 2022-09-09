<template>
  <div class="_collaborativeEditor" :data-editable="editor_is_enabled">
    <TextVersioning
      :folder_type="folder_type"
      :folder_slug="folder_slug"
      :meta_slug="meta_slug"
      @restore="restoreVersion"
    />

    <component :is="`style`" v-html="font_selector_css" />
    <div ref="editBtn" class="_btnContainer">
      <sl-button v-if="!editor_is_enabled" @click="toggleEdit" size="small">
        <sl-icon slot="prefix" name="pencil" />Modifier
      </sl-button>
      <sl-button v-else @click="saveText" size="small">Enregistrer</sl-button>
      <!-- {{ currently_selected_blots }} -->
    </div>
    <div
      ref="editor"
      class=""
      :class="{
        'is--dragover': is_being_dragover,
      }"
      @dragover="onDragover"
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

    <template v-if="editor_is_enabled">
      <span v-if="is_collaborative">
        ID : {{ editor_id }} Etat de la connection : {{ connection_state }}
      </span>
      <sl-button v-else @click="saveText" size="small"> Save </sl-button>
    </template>
  </div>
</template>
<script>
import TextVersioning from "./quill/TextVersioning.vue";
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
  components: {
    TextVersioning,
  },
  data() {
    return {
      editor: null,
      socket: null,
      connection_state: null,
      debounce_textUpdate: undefined,

      is_collaborative: false,
      editor_is_enabled: false,
      is_being_dragover: false,
      is_loading_or_saving: false,
      show_saved_icon: false,

      currently_selected_blots: false,

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
    editor_is_enabled() {},
    currently_selected_blots(newEles, oldEles) {
      if (oldEles) oldEles.forEach((el) => el.classList.remove("is--selected"));
      if (newEles) newEles.forEach((el) => el.classList.add("is--selected"));
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
        readOnly: !this.editor_is_enabled,
      });
      if (this.content) this.editor.root.innerHTML = this.content;

      if (this.$refs.editBtn)
        this.$el.querySelector(".ql-toolbar").appendChild(this.$refs.editBtn);
      // document.getElementById('target').appendChild(  document.getElementById('to_be_moved') )

      // this.$el.querySelector(".ql-edit").addEventListener("click", () => {
      //   this.toggleEdit();
      // });

      this.editor.on("selection-change", (range, oldRange, source) => {
        source;
        console.log(`CollaborativeEditor • selection-change`);
        this.updateSelectedLines();
      });
      this.editor.on("text-change", (delta, oldDelta, source) => {
        console.log(`CollaborativeEditor / text-change with source ${source}`);
        this.$nextTick(() => {
          this.updateSelectedLines();
        });
      });
    },

    getEditorContent() {
      console.log(`CollaborativeEditor • getEditorContent`);
      if (!this.editor.getText() || this.editor.getText() === "\n") return "";
      let html = this.editor.root.innerHTML;

      html = this.cleanEditorContent(html);

      return html;
    },
    cleanEditorContent(html) {
      console.log(`CollaborativeEditor • cleanEditorContent`);

      var t = document.createElement("template");
      t.innerHTML = html;

      // used to make sure we don’t get weird stuff such as <p style="font-family: "Avada";">plop</p>
      // content = content.replace(/&quot;/g, "'");
      // todo : remove status class like is--selected or is--dragover
      t.content
        .querySelectorAll(".is--selected")
        .forEach((el) => el.classList.remove("is--selected"));

      return t.innerHTML;
    },

    toggleEdit() {
      if (!this.editor_is_enabled) this.enableEditor();
      else this.disableEditor();
    },
    enableEditor() {
      this.editor.enable();
      this.editor_is_enabled = true;
    },
    disableEditor() {
      this.editor.setSelection(null);
      this.updateSelectedLines();
      this.$nextTick(() => {
        this.editor.disable();
        this.editor_is_enabled = false;
      });
    },

    restoreVersion(content) {
      this.editor.root.innerHTML = content;
    },

    updateSelectedLines() {
      console.log(`CollaborativeEditor • updateSelectedLines`);

      if (!this.editor_is_enabled) return;
      const range = this.editor.getSelection();

      if (range && range.index) {
        let blots = [];
        if (range.length === 0) blots = [this.editor.getLine(range.index)[0]];
        else blots = this.editor.getLines(range.index, range.length);

        if (blots) {
          this.currently_selected_blots = blots.map((b) => b.domNode);
          return;
        }
      }

      this.currently_selected_blots = false;
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
          console.error(`CollaborativeEditor / err ${err}`);
        }
        console.log(`CollaborativeEditor / doc subscribe`);

        if (!doc.type) {
          console.log(
            `CollaborativeEditor / no type found on doc, creating a new one with content ${JSON.stringify(
              this.editor.getContents()
            )}`
          );
          doc.create(this.editor.getContents(), "rich-text");
        } else {
          console.log(
            `CollaborativeEditor / doc already exists and doc.data = ${JSON.stringify(
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
          console.log(
            `CollaborativeEditor / text-change with source ${source}`
          );
          if (source == "user") {
            doc.submitOp(delta, { source: this.editor_id });
            this.updateTextMedia();
          }
          this.$nextTick(() => {
            this.updateSelectedLines();
          });
        });
        doc.on("op", (op, source) => {
          if (source === this.editor_id) return;
          console.log(`CollaborativeEditor / operation applied to quill`);
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
      $event.preventDefault();
      // todo debounce dragover to trigger only a handful of times per seconds
      const el = $event.target;
      if (el.parentElement.classList.contains("ql-editor")) {
        el.classList.add("is--dragover");
        el.addEventListener("dragleave", () => {
          console.log(`CollaborativeEditor2 / dragleave`);
          el.classList.remove("is--dragover");
        });
      }
    },
    // onDragLeave($event) {},
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
          this.addMediaAtIndex(index - 1, media);
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
      if (_blot) return _blot;
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
      border: 0;

      &:not(.ql-disabled) {
      }
    }

    .ql-editor {
      padding: 0;
      counter-reset: listCounter;
      height: auto;
      overflow: visible;

      margin: 0 0 0 calc(var(--spacing) * 2);
      background-color: white;
      border-radius: 4px;

      > * {
        padding: 0 calc(var(--spacing) / 2);
        margin: 0;
      }
      > img {
        max-width: 30ch;
      }

      .ql-mediacard {
        transform-origin: center top;
        border-radius: 0px;
        outline: none;
        // margin-top: var(--spacing);
        // margin-bottom: var(--spacing);
        // padding: calc(var(--spacing)) 0;
        // padding-top: 0;
        // margin-left: calc(-1 * var(--spacing) / 2);
        // margin-right: calc(-1 * var(--spacing) / 2);

        &[data-ratio="1\/4"] {
          width: 25%;
        }
        &[data-ratio="2\/4"] {
          width: 50%;
        }
        &[data-ratio="3\/4"] {
          width: 75%;
        }

        .ql-mediacard--background {
          content: "";
          // position: absolute;
          // display: block;
          // top: calc(var(--spacing) / 2);
          // left: calc(-1 * var(--spacing) / 2);
          // right: calc(-1 * var(--spacing) / 2);
          // bottom: calc(var(--spacing) / 1);

          // background-color: rgba(0, 0, 0, 0.2);
          // border: 2px solid var(--active-color);
          pointer-events: none;

          opacity: 0;
          z-index: 0;
        }

        img {
          display: block;
        }
        video {
          display: block;
          &:focus {
            outline: 0;
          }
        }

        figcaption {
          text-align: center;
          font-size: 75%;
          // font-weight: 600;
          color: #444;
          margin: 0 auto;
          padding: 0.4em 0;
          max-width: 33ch;
          line-height: 2;
          input {
            text-align: center;
            background-color: #d9d9d9;
            border: 0;
            border-radius: 4px;

            &:focus {
              background-color: #eee;
            }
          }
        }

        &:hover {
          // background-color: #eee;
          // box-shadow: 0 0 0 1px #fff, 0 0 0 2px var(--active-color);
        }

        &.is--focused {
          // outline: 0;
          // box-shadow: 0 0 0 2px #fff, 0 0 0 4px var(--active-color);
          // .ql-mediacard--background {
          //   opacity: 1;
          // }
        }
      }

      > * {
        counter-increment: listCounter;
        position: relative;
        // padding-left: calc(var(--spacing));

        &::before {
          content: "";

          /* old way : pos abs */
          position: absolute;
          // padding-top: 0.85em;
          right: 100%;
          text-align: right;
          height: 100%;

          font-size: 0.6rem;
          text-align: center;
          text-overflow: ellipsis;
          white-space: nowrap;
          overflow: hidden;
          line-height: 3;
          width: calc(var(--spacing) * 2);
          max-width: 100px;
          line-height: 2.5;
          color: transparent;
          color: hsl(210, 11%, 18%);

          // position: relative;
          // display: inline-block;
          // font-size: 0.6rem;
          // vertical-align: baseline;
          // width: calc(var(--spacing) * 2);
          // margin-left: calc(var(--spacing) * 2 * -1);

          transition: all 0.25s cubic-bezier(0.19, 1, 0.22, 1);

          content: counter(listCounter);
        }

        &.is--selected {
          &::before {
            background-color: var(--active-color);
          }
        }
        &.is--dragover {
          &::before {
            background-color: var(--c-orange);
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
