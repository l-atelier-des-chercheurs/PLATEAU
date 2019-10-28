<template>
  <div
    class="m_collaborativeEditor quillWrapper"
    :class="{ 
      'is--focused' : is_focused,
      'is--receptiveToDrop' : !!$root.settings.media_being_dragged,
      'is--dragover' : is_being_dragover  
    }"
    autofocus="autofocus"
    @dragover="ondragover($event)"
    @drop="ondrop($event)"
  >
    <!-- connection_state : {{ connection_state }} -->
    <!-- <br /> -->
    <div ref="editor" class="mediaTextContent" />
    <!-- <div class="_customCaret" :style="_customCaret_style" /> -->
  </div>
</template>
<script>
import ReconnectingWebSocket from "reconnectingwebsocket";
import ShareDB from "sharedb/lib/client";
import Quill from "quill";
import QuillCursors from "quill-cursors";
import debounce from "debounce";

let Inline = Quill.import("blots/inline");
let Block = Quill.import("blots/block");
let BlockEmbed = Quill.import("blots/block/embed");
const Module = Quill.import("core/module");

class MediaBlot extends BlockEmbed {
  static blotName = "media";
  static tagName = "figure";
  static className = "ql-mediacard";

  static create({ type, src, caption, metaFileName }) {
    let node = super.create();
    console.log(`CollaborativeEditor • MediaBlot : create for type = ${type}`);

    let tag;

    if (!type || !metaFileName) {
      alert(
        `Missing type or metaFileName : type = ${type} and metaFileName = ${metaFileName}`
      );
      return;
    }

    if (type === "image") {
      tag = window.document.createElement("img");
    } else if (type === "video") {
      tag = window.document.createElement("video");
      tag.setAttribute("controls", true);
    }

    if (src) {
      tag.setAttribute("src", src);
    }
    tag.setAttribute("draggable", false);
    node.appendChild(tag);
    if (caption) {
      let caption_tag = window.document.createElement("figcaption");
      caption_tag.innerHTML = caption;
      node.appendChild(caption_tag);
    }
    node.dataset.type = type;
    node.dataset.metaFileName = metaFileName;
    node.setAttribute("draggable", false);

    // todo for later: allow drag from cards in quill
    // to move inside document or to composition
    node.addEventListener("dragstart", $event => {
      $event.dataTransfer.setData("text/plain", "media_in_quill");
      $event.dataTransfer.effectAllowed = "move";
      // this.is_dragged = true;
      // this.$root.settings.media_being_dragged = media.metaFileName;
    });

    node.style.animation = "scale-in 0.5s cubic-bezier(0.19, 1, 0.22, 1)";
    node.addEventListener("animationend", () => {
      node.style.animation = "";
    });

    return node;
  }

  constructor(node) {
    super(node);

    let removeButton;
    let caption;
    let captionInput;

    node.__onSelect = () => {
      node.classList.add("is--focused");

      removeButton = window.document.createElement("button");
      removeButton.innerHTML = "×";
      removeButton.setAttribute("type", "button");
      removeButton.classList.add("_button_removeMedia");
      removeButton.addEventListener("click", () => {
        node.__onDeselect();
        const quill = Quill.find(node.parentElement.parentElement);
        quill.enable(true);
        node.style.animation = "scale-out 0.5s cubic-bezier(0.19, 1, 0.22, 1)";
        node.addEventListener("animationend", () => {
          node.remove();
        });
      });
      node.appendChild(removeButton);

      caption = node.querySelector("figcaption");
      captionInput = window.document.createElement("input");
      captionInput.setAttribute("type", "text");
      captionInput.placeholder = "Légende…";

      if (caption) {
        captionInput.value = caption.innerText;
        caption.innerHTML = "";
        caption.appendChild(captionInput);
      } else {
        caption = window.document.createElement("figcaption");
        caption.appendChild(captionInput);
        node.appendChild(caption);
      }
    };
    node.__onDeselect = () => {
      let value = captionInput.value;
      if (!value || value === "") {
        caption.remove();
      } else {
        captionInput.remove();
        caption.innerText = value;
      }

      node.classList.remove("is--focused");

      removeButton.remove();
    };
  }

  deleteAt() {
    // prevent removing on backspace after block
  }

  static value(node) {
    if (node.dataset.type === "image") {
      let img = node.querySelector("img");
      let figcaption = node.querySelector("figcaption");
      if (!img) return false;
      return {
        alt: img.getAttribute("alt"),
        src: img.getAttribute("src"),
        metaFileName: node.dataset.metaFileName,
        type: node.dataset.type,
        caption: figcaption ? figcaption.innerText : null
      };
    } else if (node.dataset.type === "video") {
      let video = node.querySelector("video");
      let figcaption = node.querySelector("figcaption");
      if (!video) return false;
      return {
        alt: video.getAttribute("alt"),
        src: video.getAttribute("src"),
        metaFileName: node.dataset.metaFileName,
        type: node.dataset.type,
        caption: figcaption ? figcaption.innerText : null
      };
    }
  }
}

class CardEditableModule extends Module {
  constructor(quill, options) {
    super(quill, options);

    let is_selected = false;

    let listener = e => {
      if (!document.body.contains(quill.root)) {
        return document.body.removeEventListener("click", listener);
      }
      let elm = e.target.closest(".ql-mediacard");
      let deselectCard = () => {
        console.log("deselectCard");
        is_selected = false;
        if (elm.__onDeselect) {
          elm.__onDeselect(quill);
        } else {
          quill.setSelection(
            quill.getIndex(elm.__blot.blot) + 1,
            0,
            Quill.sources.USER
          );
        }
      };
      if (elm && elm.__blot && elm.__onSelect && !is_selected) {
        quill.disable();

        is_selected = true;

        elm.__onSelect(quill);
        let handleKeyPress = e => {
          if (e.keyCode === 27 || e.keyCode === 13) {
            window.removeEventListener("keypress", handleKeyPress);
            quill.enable(true);
            deselectCard();
          }
        };
        let handleClick = e => {
          if (e.which === 1 && !e.path.includes(elm)) {
            window.removeEventListener("click", handleClick);
            quill.enable(true);
            deselectCard();
          }
        };
        let handleDrag = e => {
          window.removeEventListener("dragover", handleDrag);
          quill.enable(true);
          deselectCard();
        };
        window.addEventListener("keypress", handleKeyPress);
        window.addEventListener("click", handleClick);
        window.addEventListener("dragover", handleDrag);
      }
    };
    quill.emitter.listenDOM("click", document.body, listener);
  }
}

Quill.register(
  {
    // Other formats or modules
    "formats/media": MediaBlot,
    "modules/cardEditable": CardEditableModule
  },
  true
);

Quill.register("modules/cursors", QuillCursors);
ShareDB.types.register(require("rich-text").type);

var quill_kb_bindings = {
  // This will overwrite the default binding also named 'tab'
  // tab: {
  //   key: 9,
  //   handler: function() {
  //     // Handle tab
  //   }
  // },

  // There is no default binding named 'custom'
  // so this will be added without overwriting anything
  backspace: {
    key: 8,
    handler: function(range, context) {
      if (
        range.index &&
        this.quill.getLine(range.index) &&
        this.quill.getLine(range.index)[0].domNode.dataset &&
        this.quill.getLine(range.index)[0].domNode.dataset.metaFileName
      ) {
      }
      return true;
    }
  }

  // list: {
  //   key: "backspace",
  //   format: ["list"],
  //   handler: function(range, context) {
  //     if (context.offset === 0) {
  //       // When backspace on the first character of a list,
  //       // remove the list instead
  //       this.quill.format("list", false, Quill.sources.USER);
  //     } else {
  //       // Otherwise propogate to Quill's default
  //       return true;
  //     }
  //   }
  // }
};

export default {
  props: {
    value: {
      type: String,
      default: "…"
    },
    media: Object,
    slugFolderName: String,
    spellcheck: {
      type: Boolean,
      default: true
    }
  },
  components: {},
  data() {
    return {
      editor: null,
      editor_id: (Math.random().toString(36) + "00000000000000000").slice(
        2,
        3 + 5
      ),

      is_focused: false,
      is_being_dragover: false,

      debounce_textUpdate: undefined,
      caret_position: {
        top: undefined,
        left: undefined
      },
      focused_lines: [],

      custom_toolbar: {
        container: [
          // [{ header: [false, 1, 2, 3] }],
          [{ header: 1 }, { header: 2 }],
          ["bold", "italic", "link", "blockquote"],
          [{ list: "ordered" }, { list: "bullet" }],
          ["clean"]
        ],
        handlers: {
          image: ""
        }
      },

      socket: null,
      connection_state: undefined,
      requested_resource_url: undefined
    };
  },

  created() {},
  mounted() {
    this.editor = new Quill(this.$refs.editor, {
      modules: {
        cardEditable: true,
        toolbar: this.custom_toolbar,
        cursors: {
          template: `
    <span class="ql-cursor-caret-container">
    <span class="ql-cursor-selections"></span>
      <span class="ql-cursor-caret"></span>
    </span>
    <div class="ql-cursor-flag">
      <small class="ql-cursor-name"></small>
      <span class="ql-cursor-flag-flap"></span>
    </div>
`,
          hideDelayMs: 5000,
          hideSpeedMs: 0,
          selectionChangeSource: null
        },
        keyboard: {
          bindings: quill_kb_bindings
        }
      },
      bounds: this.$refs.editor,
      theme: "snow",
      formats: [
        "bold",
        "italic",
        "underline",
        "link",
        "header",
        "blockquote",
        "list",
        "media"
      ],
      placeholder: "…"
    });

    this.$refs.editor.dataset.quill = this.editor;

    this.editor.root.innerHTML = this.value;
    this.cancelDragOver = debounce(this.cancelDragOver, 300);

    this.setSpellCheck();

    if (this.$root.preview_mode) {
      this.editor.disable();
    }

    const cursorsOne = this.editor.getModule("cursors");
    cursorsOne.createCursor(1, "User 1", "#0a997f");

    this.editor.focus();

    this.$nextTick(() => {
      if (this.$root.state.mode !== "live") {
        return;
      }

      this.initWebsocketMode();

      this.editor.on("text-change", (delta, oldDelta, source) => {
        this.$emit(
          "input",
          this.editor.getText() ? this.editor.root.innerHTML : ""
        );
        this.updateFocusedLines();
        // cursorsOne.moveCursor(1, range);
      });

      this.editor.on("selection-change", (range, oldRange, source) => {
        console.log("selection changed");
        if (range === null && oldRange !== null) this.is_focused = false;
        else if (range !== null && oldRange === null) this.is_focused = true;

        // cursorsOne.moveCursor(1, range);
        if (!!range && range.length == 0) {
          console.log("User cursor is on", range.index);
          this.updateCaretPosition();
        }

        this.updateFocusedLines();
      });
    });

    this.$eventHub.$on("writeup.addMedia", this.addMediaAtCaretPosition);
  },
  beforeDestroy() {
    if (!!this.socket) {
      this.socket.close();
    }

    this.$root.settings.medias_present_in_writeup = [];
  },
  watch: {
    "$root.preview_mode": function() {
      if (this.$root.preview_mode) {
        this.editor.disable();
      } else {
        this.editor.enable();
      }
    },
    spellcheck: function() {
      this.setSpellCheck();
    },
    value: function() {
      this.broadcastMediasPresentInWriteup();
    }
  },
  computed: {
    _customCaret_style() {
      return {
        transform: `translate3d(${this.caret_position.left}px, ${this.caret_position.top}px, 0px)`
      };
    }
  },
  methods: {
    initWebsocketMode() {
      const params = new URLSearchParams({
        type: "projects",
        slugFolderName: this.slugFolderName,
        metaFileName: this.media.metaFileName
      });

      const requested_querystring = "?" + params.toString();
      this.requested_resource_url =
        (location.protocol === "https:" ? "wss" : "ws") +
        "://" +
        window.location.host +
        "/sharedb" +
        requested_querystring;

      console.log(
        `MOUNTED • CollaborativeEditor: will connect to ws server with ${this.requested_resource_url}`
      );

      this.socket = new ReconnectingWebSocket(this.requested_resource_url);
      const connection = new ShareDB.Connection(this.socket);
      connection.on("state", this.wsState);

      const doc = connection.get("textMedias", requested_querystring);
      doc.subscribe(err => {
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
          this.editor.setContents(doc.data);
        }

        this.$emit(
          "input",
          this.editor.getText() ? this.editor.root.innerHTML : ""
        );

        this.editor.on("text-change", (delta, oldDelta, source) => {
          if (source == "user") {
            console.log(`ON • CollaborativeEditor: text-change by user`);
            doc.submitOp(delta, { source: this.editor_id });

            this.updateTextMedia();
          } else {
            console.log(`ON • CollaborativeEditor: text-change by API`);
          }
        });

        this.broadcastMediasPresentInWriteup();

        doc.on("op", (op, source) => {
          if (source === this.editor_id) return;
          console.log(`ON • CollaborativeEditor: operation applied to quill`);
          this.editor.updateContents(op);
        });
      });
    },
    updateCaretPosition() {
      console.log(`CollaborativeEditor • METHODS: updateCaretPosition`);
      var selection = this.editor.getSelection(true);
      const caretPos = this.editor.getBounds(selection);
      this.caret_position = { top: caretPos.top, left: caretPos.left };
    },
    updateFocusedLines() {
      console.log(`CollaborativeEditor • METHODS: updateFocusedLines`);

      // if (oldRange && oldRange.index) {
      //   const line = this.editor.getLine(oldRange.index);
      //   if (line) {
      //     line[0].domNode.classList.remove("is--focused");
      //   }
      // }

      this.editor
        .getLines()
        .map(b => b.domNode.classList.remove("is--focused"));

      const range = this.editor.getSelection();

      if (range && range.index) {
        const line = this.editor.getLine(range.index);
        if (line) {
          line[0].domNode.classList.add("is--focused");
        }
      }
    },
    wsState(state, reason) {
      console.log(
        `METHODS • CollaborativeEditor: wsState with state = ${state} and reason = ${reason}`
      );
      this.connection_state = state.toString();
      // 'connecting' 'connected' 'disconnected' 'closed' 'stopped'
    },
    updateTextMedia(event) {
      if (this.debounce_textUpdate) clearTimeout(this.debounce_textUpdate);
      this.debounce_textUpdate = setTimeout(() => {
        console.log(
          `CollaborativeEditor • updateTextMedia: saving new snapshop`
        );

        this.broadcastMediasPresentInWriteup();

        this.$root.editMedia({
          type: "projects",
          slugFolderName: this.slugFolderName,
          slugMediaName: this.media.metaFileName,
          data: {
            content: this.editor.getText() ? this.editor.root.innerHTML : ""
          }
        });
      }, 500);
    },
    broadcastMediasPresentInWriteup() {
      console.log(`CollaborativeEditor • broadcastMediasPresentInWriteup`);

      // var t0 = performance.now();

      const _medias_present = this.editor.getLines().reduce((acc, _blot) => {
        if (_blot.domNode.dataset && _blot.domNode.dataset.metaFileName) {
          if (!acc.includes(_blot.domNode.dataset.metaFileName)) {
            acc.push(_blot.domNode.dataset.metaFileName);
          }
        }
        return acc;
      }, []);

      // var t1 = performance.now();
      // console.log(
      //   "L'appel à faire quelqueChose a pris " + (t1 - t0) + " millisecondes."
      // );

      this.$root.settings.medias_present_in_writeup = _medias_present;
    },
    setSpellCheck() {
      console.log(
        `CollaborativeEditor • setSpellCheck: set to ${this.spellcheck}`
      );
      this.editor.root.spellcheck = this.spellcheck;
    },
    addMediaAtCaretPosition(media) {
      var selection = this.editor.getSelection(true);
      this.addMediaAtIndex(selection.index, media);
    },
    addMediaAtIndex(index, media) {
      console.log(`CollaborativeEditor • addMediaAtIndex ${index}`);
      const mediaURL =
        this.$root.state.mode === "export_publication"
          ? `./${this.slugFolderName}/${media.media_filename}`
          : `/${this.slugFolderName}/${media.media_filename}`;

      if (media.type === "image") {
        const thumb = media.thumbs.find(m => m.size === 1600);
        if (!!thumb) {
          // this.editor.insertText(index + 1, "\n", Quill.sources.USER);
          this.editor.insertEmbed(
            index,
            "media",
            {
              type: media.type,
              src: thumb.path,
              metaFileName: media.metaFileName
            },
            Quill.sources.USER
          );
          this.editor.setSelection(index + 1, Quill.sources.SILENT);
        }
      } else if (media.type === "video") {
        // this.editor.insertText(index, "\n", Quill.sources.USER);
        this.editor.insertEmbed(
          index,
          "media",
          {
            type: media.type,
            src: mediaURL,
            metaFileName: media.metaFileName
          },
          Quill.sources.USER
        );
        this.editor.setSelection(index + 1, Quill.sources.SILENT);
      } else {
        this.$alertify
          .closeLogOnClick(true)
          .delay(4000)
          .error(this.$t("notifications.media_type_not_handled"));
      }
    },
    ondragover($event) {
      console.log(
        `METHODS • CollaborativeEditor / dragover on ${$event.currentTarget.className}`
      );
      this.is_being_dragover = true;
      this.removeDragoverFromBlots();

      const _blot = this.getBlockFromElement($event.target);
      if (_blot) _blot.domNode.classList.add("is--dragover");

      this.cancelDragOver();
    },
    cancelDragOver() {
      if (this.$root.state.dev_mode === "debug") {
        console.log(`METHODS • CollaborativeEditor / cancelDragOver`);
      }
      this.removeDragoverFromBlots();
      this.is_being_dragover = false;
    },

    ondrop($event) {
      console.log(`METHODS • CollaborativeEditor / ondrop`);

      // Prevent default behavior (Prevent file from being opened)
      $event.preventDefault();
      $event.dataTransfer.dropEffect = "move";

      this.removeDragoverFromBlots();

      if ($event.dataTransfer.getData("text/plain") === "media_in_quill") {
        console.log(
          `METHODS • CollaborativeEditor / ondrop: drag and dropped a media from quill`
        );
        let _blot = this.getBlockFromElement($event.target);
        const index = this.editor.getIndex(_blot);

        // find which blot was dragged (A)

        // find where it was dropped (B)

        // move delta from A to B

        console.log(`_blot is currently at index ${index}`);
      } else if ($event.dataTransfer.getData("text/plain")) {
        console.log(
          `METHODS • CollaborativeEditor / ondrop: dropped a media from the library`
        );

        const data = JSON.parse($event.dataTransfer.getData("text/plain"));
        console.log(data);

        if (data.media_filename) {
          // drop sur l’éditor et pas sur une ligne
          if ($event.target.classList.contains("ql-editor")) {
            console.log(
              "dropped on editor and not on line, will insert at the end of doc"
            );
            this.addMediaAtIndex(this.editor.getLength() - 1, data);
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

          _blot = _blot.next ? _blot.next : _blot;

          const index = this.editor.getIndex(_blot);
          this.addMediaAtIndex(index, data);
        }
      }
    },
    removeDragoverFromBlots() {
      this.editor
        .getLines()
        .map(b => b.domNode.classList.remove("is--dragover"));
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
    }
  }
};
</script>
<style src="../../../../node_modules/quill/dist/quill.snow.css"></style>
<style lang="scss">
.m_collaborativeEditor {
  position: relative;
  font-family: "Work Sans";
  // margin-left: 3em;
  // padding: 0 0.1em;

  --active-color: black;

  &.is--focussed {
    background-color: blue;
  }

  &.is--receptiveToDrop {
    .ql-editor {
      &::after {
        opacity: 1;
      }
    }
    &.is--dragover {
      .ql-editor {
        > * {
          // background-image: linear-gradient(
          //   90deg,
          //   #ccc,
          //   #ccc 50%,
          //   transparent 0,
          //   transparent
          // );

          // background-size: 250% 4px;
        }
      }
    }
  }

  .ql-toolbar .ql-formats:first-child::before {
    /* content: "options :"; */
    position: relative;
    display: inline-block;
    float: left;
    font-size: 1rem;
    vertical-align: middle;
    font-weight: 400;
    /* background-color: #333; */
    /* left: -8px; */
    margin: 0;
    margin-top: 4px;
    font-weight: 400;
    /* padding: 11px; */
    /* margin-bottom: 10px; */
    /* text-decoration: underline; */
    font-size: 0.8rem;
    /* text-transform: uppercase; */
    /* margin-right: 15px; */
    /* font-style: italic; */
  }

  html[lang="fr"] .ql-picker.ql-header .ql-picker-label[data-value="1"]::before,
  html[lang="fr"] .ql-picker.ql-header .ql-picker-item[data-value="1"]::before {
    content: "Titre 1";
  }
  html[lang="fr"] .ql-picker.ql-header .ql-picker-label[data-value="2"]::before,
  html[lang="fr"] .ql-picker.ql-header .ql-picker-item[data-value="2"]::before {
    content: "Titre 2";
  }
  html[lang="fr"] .ql-picker.ql-header .ql-picker-label[data-value="3"]::before,
  html[lang="fr"] .ql-picker.ql-header .ql-picker-item[data-value="3"]::before {
    content: "Titre 3";
  }
  html[lang="fr"] .ql-picker.ql-header .ql-picker-label[data-value="4"]::before,
  html[lang="fr"] .ql-picker.ql-header .ql-picker-item[data-value="4"]::before {
    content: "Titre 4";
  }

  .ql-container.ql-bubble:not(.ql-disabled) a::before {
    line-height: 1.2;
  }

  .ql-tooltip {
    z-index: 1;
    border-radius: 4px;
    background-color: #000;
  }

  .ql-container {
    margin: 0 auto;

    &.ql-snow {
      border: 0;
    }
  }

  .ql-editor {
    position: relative;
    padding: 0;
    overflow: visible;
    min-height: 80vh;
    // caret-color: var(--active-color);
    line-height: inherit;
    padding: var(--spacing) calc(var(--spacing) * 2) 33vh;

    &::after {
      content: "";
      position: absolute;
      left: 0;
      right: 0;
      top: 0;
      bottom: 0;
      pointer-events: none;

      background-color: #ccc;

      // Colors
      $bg-color: #fff;
      $dot-color: var(--color-MediaLibrary);

      // Dimensions
      $dot-size: 2px;
      $dot-space: 22px;

      background: linear-gradient(
            90deg,
            $bg-color ($dot-space - $dot-size),
            transparent 1%
          )
          center,
        linear-gradient($bg-color ($dot-space - $dot-size), transparent 1%)
          center,
        $dot-color;
      background-size: $dot-space $dot-space;

      opacity: 0;

      transition: opacity 0.4s linear;
    }

    > * {
      position: relative;
      z-index: 1;

      // attention : à cause du drop il vaut mieux ne pas utiliser de margin
      // sinon pas moyen de savoir sur quel item c’est droppé
      margin: 0 auto;
      padding: 0;
      max-width: var(--size-column-width);

      background-position: 0 calc(100% - 3px);
      background-repeat: no-repeat;
      background-size: 250% 1px;
      transition: transform 0.5s linear;
      background-image: linear-gradient(
        90deg,
        transparent,
        transparent 50%,
        transparent 0,
        transparent
      );
      // background-image: linear-gradient(
      //   90deg,
      //   #ddd,
      //   #ddd 50%,
      //   transparent 0,
      //   transparent
      // );

      &.ql-mediacard {
        transform-origin: right center;
        border-radius: 0px;
        // margin-top: var(--spacing);
        // margin-bottom: var(--spacing);
        padding-top: calc(var(--spacing) / 2);
        padding-bottom: calc(var(--spacing) / 2);

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

          input {
            text-align: center;
            background-color: #eee;
            border: 0;
            border-radius: 4px;
          }
        }

        &:hover {
          box-shadow: 0 0 0 1px #fff, 0 0 0 2px var(--active-color);
          margin-top: calc(var(--spacing) / 2);
          margin-bottom: calc(var(--spacing) / 2);
          padding: 0;
        }

        &.is--focused {
          outline: 0;
          box-shadow: 0 0 0 2px #fff, 0 0 0 4px var(--active-color);
          margin-top: calc(var(--spacing) / 2);
          margin-bottom: calc(var(--spacing) / 2);
          padding: 0;
        }
      }

      @keyframes scale-in {
        0% {
          opacity: 0;
          max-height: 0px;
          transform: scale(0.9, 1);
        }
        100% {
          opacity: 1;
          max-height: 50vh;
          transform: scale(1, 1);
        }
      }
      @keyframes scale-out {
        0% {
          opacity: 1;
          max-height: 50vh;
          transform: scale(1, 1);
        }
        100% {
          opacity: 0;
          max-height: 0px;
          margin: 0;
          padding: 0;
          transform: scale(0.9, 1);
        }
      }

      // &::before {
      //   content: "";
      //   position: absolute;
      //   left: 0;
      //   right: 0;
      //   bottom: 0.15em;
      //   height: 1px;
      //   z-index: 0;
      //   border-bottom: 1px solid #e9e9e9;
      //   mix-blend-mode: darken;
      // }
    }
    > img {
      display: block;
    }

    &::after {
      // content: ".";
      color: #ccc;
    }
  }

  &.quillWrapper {
  }

  &.quillWrapper:hover,
  &.quillWrapper.is--focused {
    // color: rgba(40, 152, 217, 1);
    &::after {
      // content: "•";
      // display: block;
      // color: var(--active-color);
    }
  }

  .ql-editor.ql-blank::before {
    display: block;

    // position: relative;
    max-width: var(--size-column-width);
    margin: 0 auto;
    left: 20px;
    color: rgba(0, 0, 0, 0.6);
    font-style: normal;

    &:hover {
      color: black;
    }
  }

  .mediaTextContent {
    color: inherit;
    font-family: inherit;
    overflow: visible;

    > *:first-child {
      margin-top: 0;

      > *:first-child {
        margin-top: 0;
      }
    }

    // https://www.gridlover.net/try
    // fz : 16px
    // lh : 1.41
    // scale : 1.31

    font-size: 1.1em;
    line-height: 1.4375em;
    // max-width: 773px;
    // margin: auto;

    h1,
    .h1 {
      font-size: 2.25em;
      line-height: 1.27777778em;
      margin-top: 0.319444445em;
      margin-bottom: 0em;
    }
    h2,
    .h2 {
      font-size: 1.6875em;
      line-height: 1.7037037em;
      margin-top: 0.85185185em;
      margin-bottom: 0em;
    }
    h3,
    .h3 {
      font-size: 1em;
      line-height: 1.4375em;
      margin-top: 1.4375em;
      margin-bottom: 0em;
    }
    h4,
    .h4 {
      font-size: 1em;
      line-height: 1.4375em;
      margin-top: 1.4375em;
      margin-bottom: 0em;
    }
    h5,
    .h5 {
      font-size: 1em;
      line-height: 1.4375em;
      margin-top: 1.4375em;
      margin-bottom: 0em;
    }
    p,
    ul,
    ol,
    pre,
    table,
    blockquote {
      margin-top: 0em;
      margin-bottom: 0em;
    }
    ul ul,
    ol ol,
    ul ol,
    ol ul {
      margin-top: 0em;
      margin-bottom: 0em;
    }

    /* Let's make sure all's aligned */
    hr,
    .hr {
      border: 1px solid;
      margin: -1px 0;
    }
    a,
    b,
    i,
    strong,
    em,
    small,
    code {
      line-height: 0;
    }
    sub,
    sup {
      line-height: 0;
      position: relative;
      vertical-align: baseline;
    }
    sup {
      top: -0.5em;
    }
    sub {
      bottom: -0.25em;
    }
    // gridlover end

    h1,
    h2 {
      & + h2 {
        margin-top: 0;
      }
    }

    ol,
    ul {
      padding-left: 1.5em;

      > li {
        list-style-type: none;
      }
    }
    ul > li::before {
      content: "\2022";
    }

    li::before {
      display: inline-block;
      white-space: nowrap;
      width: 1.2em;
    }

    ol li {
      counter-reset: list-1 list-2 list-3 list-4 list-5 list-6 list-7 list-8
        list-9;
      counter-increment: list-0;
    }
    ol li:before {
      content: counter(list-0, decimal) ". ";
      font-size: 75%;
      font-weight: 600;
    }

    strong,
    b {
      font-weight: 600;
    }

    a {
      text-decoration: underline;
      text-decoration-style: solid;
      color: var(--active-color);
      font-weight: 600;
    }

    h1,
    h2 {
      -webkit-hyphens: auto;
      -ms-hyphens: auto;
      hyphens: auto;

      strong,
      b {
        font-weight: 800;
      }
    }

    h1 {
      font-weight: 600;
    }

    h2,
    h3,
    h4 {
      font-weight: 600;
    }

    blockquote {
      border-left: 4px solid #ccc;
      margin-bottom: 5px;
      margin-top: 5px;
      padding-left: 16px;
    }

    code,
    pre {
      background-color: #f0f0f0;
      border-radius: 3px;
    }
    pre {
      white-space: pre-wrap;
      margin-bottom: 5px;
      margin-top: 5px;
      padding: 5px 10px;
    }
    code {
      font-size: 85%;
      padding: 2px 4px;
    }
  }
}

._customCaret {
  position: absolute;
  width: 2px;
  height: 1em;
  top: 0;
  left: 0;
  background-color: green;
  z-index: 1;

  animation: 1s blink step-end infinite;
}

@keyframes blink {
  from,
  to {
    opacity: 0;
  }
  50% {
    opacity: 1;
  }
}

.ql-cursor-flag {
  display: none;
}

.ql-toolbar.ql-snow .ql-formats {
  display: block;
  margin-right: 0 !important;
}
.ql-snow.ql-toolbar button,
.ql-snow .ql-toolbar button {
  display: block;
  float: none;
}

.ql-toolbar.ql-snow {
  background-color: #222;
  /* border-left: 0; */
  border: none;
  color: white;
  border-radius: 0 0 4px 4px;
  // top: 121px;
  bottom: 10px;
  position: fixed;
  z-index: 10;
  left: 10px;

  .ql-fill,
  .ql-stroke.ql-fill {
    fill: currentColor;
  }

  .ql-stroke {
    stroke: currentColor;
  }
}

.ql-snow.ql-toolbar button:hover .ql-stroke,
.ql-snow .ql-toolbar button:hover .ql-stroke,
.ql-snow.ql-toolbar button:focus .ql-stroke,
.ql-snow .ql-toolbar button:focus .ql-stroke,
.ql-snow.ql-toolbar button.ql-active .ql-stroke,
.ql-snow .ql-toolbar button.ql-active .ql-stroke,
.ql-snow.ql-toolbar .ql-picker-label:hover .ql-stroke,
.ql-snow .ql-toolbar .ql-picker-label:hover .ql-stroke,
.ql-snow.ql-toolbar .ql-picker-label.ql-active .ql-stroke,
.ql-snow .ql-toolbar .ql-picker-label.ql-active .ql-stroke,
.ql-snow.ql-toolbar .ql-picker-item:hover .ql-stroke,
.ql-snow .ql-toolbar .ql-picker-item:hover .ql-stroke,
.ql-snow.ql-toolbar .ql-picker-item.ql-selected .ql-stroke,
.ql-snow .ql-toolbar .ql-picker-item.ql-selected .ql-stroke,
.ql-snow.ql-toolbar button:hover .ql-stroke-miter,
.ql-snow .ql-toolbar button:hover .ql-stroke-miter,
.ql-snow.ql-toolbar button:focus .ql-stroke-miter,
.ql-snow .ql-toolbar button:focus .ql-stroke-miter,
.ql-snow.ql-toolbar button.ql-active .ql-stroke-miter,
.ql-snow .ql-toolbar button.ql-active .ql-stroke-miter,
.ql-snow.ql-toolbar .ql-picker-label:hover .ql-stroke-miter,
.ql-snow .ql-toolbar .ql-picker-label:hover .ql-stroke-miter,
.ql-snow.ql-toolbar .ql-picker-label.ql-active .ql-stroke-miter,
.ql-snow .ql-toolbar .ql-picker-label.ql-active .ql-stroke-miter,
.ql-snow.ql-toolbar .ql-picker-item:hover .ql-stroke-miter,
.ql-snow .ql-toolbar .ql-picker-item:hover .ql-stroke-miter,
.ql-snow.ql-toolbar .ql-picker-item.ql-selected .ql-stroke-miter,
.ql-snow .ql-toolbar .ql-picker-item.ql-selected .ql-stroke-miter {
  stroke: #0a997f;
}

.ql-snow.ql-toolbar button:hover,
.ql-snow .ql-toolbar button:hover,
.ql-snow.ql-toolbar button:focus,
.ql-snow .ql-toolbar button:focus,
.ql-snow.ql-toolbar button.ql-active,
.ql-snow .ql-toolbar button.ql-active,
.ql-snow.ql-toolbar .ql-picker-label:hover,
.ql-snow .ql-toolbar .ql-picker-label:hover,
.ql-snow.ql-toolbar .ql-picker-label.ql-active,
.ql-snow .ql-toolbar .ql-picker-label.ql-active,
.ql-snow.ql-toolbar .ql-picker-item:hover,
.ql-snow .ql-toolbar .ql-picker-item:hover,
.ql-snow.ql-toolbar .ql-picker-item.ql-selected,
.ql-snow .ql-toolbar .ql-picker-item.ql-selected {
  color: #0a997f;
}

.ql-snow.ql-toolbar button:hover .ql-fill,
.ql-snow .ql-toolbar button:hover .ql-fill,
.ql-snow.ql-toolbar button:focus .ql-fill,
.ql-snow .ql-toolbar button:focus .ql-fill,
.ql-snow.ql-toolbar button.ql-active .ql-fill,
.ql-snow .ql-toolbar button.ql-active .ql-fill,
.ql-snow.ql-toolbar .ql-picker-label:hover .ql-fill,
.ql-snow .ql-toolbar .ql-picker-label:hover .ql-fill,
.ql-snow.ql-toolbar .ql-picker-label.ql-active .ql-fill,
.ql-snow .ql-toolbar .ql-picker-label.ql-active .ql-fill,
.ql-snow.ql-toolbar .ql-picker-item:hover .ql-fill,
.ql-snow .ql-toolbar .ql-picker-item:hover .ql-fill,
.ql-snow.ql-toolbar .ql-picker-item.ql-selected .ql-fill,
.ql-snow .ql-toolbar .ql-picker-item.ql-selected .ql-fill,
.ql-snow.ql-toolbar button:hover .ql-stroke.ql-fill,
.ql-snow .ql-toolbar button:hover .ql-stroke.ql-fill,
.ql-snow.ql-toolbar button:focus .ql-stroke.ql-fill,
.ql-snow .ql-toolbar button:focus .ql-stroke.ql-fill,
.ql-snow.ql-toolbar button.ql-active .ql-stroke.ql-fill,
.ql-snow .ql-toolbar button.ql-active .ql-stroke.ql-fill,
.ql-snow.ql-toolbar .ql-picker-label:hover .ql-stroke.ql-fill,
.ql-snow .ql-toolbar .ql-picker-label:hover .ql-stroke.ql-fill,
.ql-snow.ql-toolbar .ql-picker-label.ql-active .ql-stroke.ql-fill,
.ql-snow .ql-toolbar .ql-picker-label.ql-active .ql-stroke.ql-fill,
.ql-snow.ql-toolbar .ql-picker-item:hover .ql-stroke.ql-fill,
.ql-snow .ql-toolbar .ql-picker-item:hover .ql-stroke.ql-fill,
.ql-snow.ql-toolbar .ql-picker-item.ql-selected .ql-stroke.ql-fill,
.ql-snow .ql-toolbar .ql-picker-item.ql-selected .ql-stroke.ql-fill {
  fill: #0a997f;
}

.ql-editor {
  counter-reset: listCounter;

  &:focus > * {
    &.is--focused,
    &.is--dragover {
      &::before {
        content: counter(listCounter);
        // font-size: 0.8rem;
        color: var(--active-color);
        color: hsl(210, 11%, 58%);
      }
    }
  }

  & > * {
    counter-increment: listCounter;

    &::before {
      content: "";

      font-family: "IBM Plex Sans", "OutputSansVariable";
      position: absolute;
      top: 2px;
      right: 100%;
      margin-right: var(--spacing);
      margin-right: 0;

      font-size: 0.6rem;
      font-weight: 600;
      text-align: center;
      text-overflow: ellipsis;
      white-space: nowrap;
      overflow: hidden;
      // display: inline-block;
      // float: left;
      width: var(--spacing);
      max-width: 100px;
      padding: 0 calc(var(--spacing) / 4) 0 calc(var(--spacing) / 4 * 2);
      color: transparent;
      color: hsl(210, 11%, 58%);

      transition: all 0.4s cubic-bezier(0.19, 1, 0.22, 1);
    }

    &::after {
      content: "";
      display: block;
      width: 100%;
      height: 0;
      margin: 0;
      background-color: var(--color-MediaLibrary);
    }

    &.is--dragover {
      &::after {
        margin: var(--spacing) 0;
        height: 4px;
        transition: all 0.4s cubic-bezier(0.19, 1, 0.22, 1);
      }
    }
  }
}
.ql-clipboard {
  position: fixed;
  display: none;

  left: 50%;
  top: 50%;
}

._button_removeMedia {
  position: absolute;
  top: 0;
  right: 0;
  background: white;
  text-decoration: none;
  line-height: 0;
  width: 1em;
  height: 1em;
}
</style>
