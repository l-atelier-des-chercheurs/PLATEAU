<template>
  <div
    class="m_collaborativeEditor quillWrapper"
    :class="{ 
      'is--receptiveToDrop' : !!$root.settings.media_being_dragged,
      'is--dragover' : is_being_dragover  
    }"
    autofocus="autofocus"
    @dragover="ondragover($event)"
    @drop="dropHandler($event)"
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

class ImageBlot extends BlockEmbed {
  static blotName = "image";
  static tagName = ["figure", "image"];

  static create({ src, caption, metaFileName }) {
    let node = super.create();
    let img = window.document.createElement("img");
    if (caption) {
      img.setAttribute("alt", caption);
    }
    if (src) {
      img.setAttribute("src", src);
    }
    node.appendChild(img);
    if (caption) {
      let caption = window.document.createElement("figcaption");
      caption.innerHTML = caption;
      node.appendChild(caption);
    }
    node.className = "ql-card-editable ql-card-figure ql-card-image";
    if (metaFileName) {
      node.dataset.metaFileName = metaFileName;
    }
    return node;
  }

  constructor(node) {
    super(node);
    node.__onSelect = () => {
      if (!node.querySelector("input")) {
        let caption = node.querySelector("figcaption");
        let captionInput = window.document.createElement("input");
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
        captionInput.addEventListener("blur", () => {
          let value = captionInput.value;
          if (!value || value === "") {
            caption.remove();
          } else {
            captionInput.remove();
            caption.innerText = value;
          }
        });
        captionInput.focus();
      }
    };
  }

  static value(node) {
    let img = node.querySelector("img");
    let figcaption = node.querySelector("figcaption");
    if (!img) return false;
    return {
      alt: img.getAttribute("alt"),
      src: img.getAttribute("src"),
      linked_media_metaFileName: node.dataset.metaFileName,
      caption: figcaption ? figcaption.innerText : null
    };
  }
}
class VideoBlot extends BlockEmbed {
  static blotName = "video";
  static tagName = ["figure", "video"];

  static create({ src, caption, metaFileName }) {
    let node = super.create();
    let video = window.document.createElement("video");
    video.setAttribute("controls", true);
    if (caption) {
      video.setAttribute("alt", caption);
    }
    if (src) {
      video.setAttribute("src", src);
    }
    node.appendChild(video);
    if (caption) {
      let caption = window.document.createElement("figcaption");
      caption.innerHTML = caption;
      node.appendChild(caption);
    }
    node.className = "ql-card-editable ql-card-figure ql-card-video";
    if (metaFileName) {
      node.dataset.metaFileName = metaFileName;
    }
    return node;
  }

  constructor(node) {
    super(node);
    node.__onSelect = () => {
      if (!node.querySelector("input")) {
        let caption = node.querySelector("figcaption");
        let captionInput = window.document.createElement("input");
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
        captionInput.addEventListener("blur", () => {
          let value = captionInput.value;
          if (!value || value === "") {
            caption.remove();
          } else {
            captionInput.remove();
            caption.innerText = value;
          }
        });
        captionInput.focus();
      }
    };
  }

  static value(node) {
    let video = node.querySelector("video");
    let figcaption = node.querySelector("figcaption");
    if (!video) return false;
    return {
      alt: video.getAttribute("alt"),
      src: video.getAttribute("src"),
      linked_media_metaFileName: node.dataset.metaFileName,
      caption: figcaption ? figcaption.innerText : null
    };
  }
}

class CardEditableModule extends Module {
  constructor(quill, options) {
    super(quill, options);
    let listener = e => {
      if (!document.body.contains(quill.root)) {
        return document.body.removeEventListener("click", listener);
      }
      let elm = e.target.closest(".ql-card-editable");
      let deselectCard = () => {
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
      if (elm && elm.__blot && elm.__onSelect) {
        quill.disable();
        elm.__onSelect(quill);
        let handleKeyPress = e => {
          if (e.keyCode === 27 || e.keyCode === 13) {
            window.removeEventListener("keypress", handleKeyPress);
            quill.enable(true);
            deselectCard();
          }
        };
        let handleClick = e => {
          if (e.which === 1 && !elm.contains(e.target)) {
            window.removeEventListener("click", handleClick);
            quill.enable(true);
            deselectCard();
          }
        };
        window.addEventListener("keypress", handleKeyPress);
        window.addEventListener("click", handleClick);
      }
    };
    quill.emitter.listenDOM("click", document.body, listener);
  }
}

Quill.register(
  {
    // Other formats or modules
    "formats/image": ImageBlot,
    "formats/video": VideoBlot,
    "modules/cardEditable": CardEditableModule
  },
  true
);

//// see https://stackoverflow.com/a/46064381
// class MediaBlot extends BlockEmbed {
//   static create(value) {
//     let node = super.create();

//     debugger;
//     if (value.type === "image") {
//       node.innerHTML = `<img src="${value.url}">`;
//     }
//     // node.setAttribute("src", value.url);
//     return node;
//   }

//   static value(node) {
//     return {
//       // alt: node.getAttribute("alt"),
//       type: node.getAttribute("src"),
//       url: node.getAttribute("src")
//     };
//   }
// }
// MediaBlot.blotName = "media";
// MediaBlot.tagName = "div";
// Quill.register(MediaBlot);

Quill.register("modules/cursors", QuillCursors);
ShareDB.types.register(require("rich-text").type);

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
        "image",
        "video"
      ],
      placeholder: "…"
    });
    this.editor.root.innerHTML = this.value;
    this.cancelDragOver = debounce(this.cancelDragOver, 300);

    this.setSpellCheck();

    if (this.$root.preview_mode) {
      this.editor.disable();
    }

    const cursorsOne = this.editor.getModule("cursors");
    cursorsOne.createCursor(1, "User 1", "#0a997f");

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
      });
    });

    this.$eventHub.$on("writeup.addMedia", this.addMediaAtCaretPosition);
  },
  beforeDestroy() {
    if (!!this.socket) {
      this.socket.close();
    }

    this.$root.settings.medias_present_in_writeup = "";
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

        doc.on("op", (op, source) => {
          if (source === this.editor_id) return;
          console.log(`ON • CollaborativeEditor: operation applied to quill`);
          this.editor.updateContents(op);
        });
      });
    },
    updateCaretPosition() {
      console.log(`METHODS • CollaborativeEditor: updateCaretPosition`);
      var selection = this.editor.getSelection(true);
      const caretPos = this.editor.getBounds(selection);
      this.caret_position = { top: caretPos.top, left: caretPos.left };
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
          // this.editor.insertText(index, "\n", Quill.sources.USER);
          this.editor.insertEmbed(
            index,
            "image",
            {
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
          "video",
          {
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
      // console.log(`METHODS • CollaborativeEditor / dragover`);
      this.is_being_dragover = true;
      this.cancelDragOver();
    },
    cancelDragOver() {
      if (this.$root.state.dev_mode === "debug") {
        console.log(`METHODS • AddMedia / cancelDragOver`);
      }
      this.is_being_dragover = false;
    },

    dropHandler($event) {
      console.log(`METHODS • CollaborativeEditor / dropHandler`);

      // Prevent default behavior (Prevent file from being opened)
      $event.preventDefault();
      $event.dataTransfer.dropEffect = "move";

      const data = JSON.parse($event.dataTransfer.getData("text/plain"));
      console.log(data);

      if (data.media_filename) {
        // drop sur l’éditor et pas sur une ligne
        if ($event.target.classList.contains("ql-editor")) {
          this.addMediaAtIndex(this.editor.scroll.length() - 1, data);
          return;
        }

        let _target = $event.target;
        while (!_target.parentElement.classList.contains("ql-editor")) {
          _target = $event.target.parentElement;

          if (_target === null) {
            break;
          }
        }

        let _blot = Quill.find(_target);
        if (_blot) {
          // const _blotIndex = this.editor.getLines().findIndex(b => b === _blot);
          // let [line, offset] = this.editor.getLine(_blotIndex);
          const idx = this.editor.getIndex(_blot);
          this.addMediaAtIndex(idx, data);
        } else {
          this.$alertify
            .closeLogOnClick(true)
            .delay(4000)
            .error(this.$t("notifications.failed_to_find_block_line"));
        }
      }
    }
  }
};
</script>
<style src="../../../../node_modules/quill/dist/quill.snow.css"></style>
<style lang="scss">
.m_collaborativeEditor {
  position: relative;
  font-family: "Work Sans";
  margin: 0.5em 0;
  // margin-left: 3em;
  padding: 0 0.1em;

  &.is--receptiveToDrop {
    .ql-editor {
      background-attachment: #fff;
    }

    &.is--dragover {
      .ql-editor {
        > * {
          background-image: linear-gradient(
            90deg,
            #ccc,
            #ccc 50%,
            transparent 0,
            transparent
          );

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
    max-width: 65ch;
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
    caret-color: #111;
    line-height: inherit;
    margin-left: 70px;
    padding-bottom: 33vh;

    > * {
      position: relative;
      z-index: 1;

      margin: 0;
      padding: 0;

      background-position: 0 calc(100% - 3px);
      background-repeat: no-repeat;
      background-size: 250% 1px;
      transition: all 0.5s linear;
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

      &.ql-card-figure {
        transform-origin: right center;
        animation: scale-in 0.5s cubic-bezier(0.19, 1, 0.22, 1);
        img {
          display: block;
          margin: var(--spacing) 0;
        }

        figcaption {
          text-align: center;
          margin-top: 0em;
          font-size: 75%;
          // font-weight: 600;
          // color: #999;
        }
      }

      @keyframes scale-in {
        0% {
          opacity: 0;
          transform: scale(0.9, 1);
        }
        100% {
          opacity: 1;
          transform: scale(1, 1);
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
    left: 0;
    color: rgba(0, 0, 0, 0.4);
    font-style: normal;
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

    font-size: 1em;
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
  top: 121px;
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

  & > * {
    counter-increment: listCounter;

    &::after {
      content: counter(listCounter);

      font-family: "IBM Plex Sans", "OutputSansVariable";
      position: absolute;
      top: 0;
      right: 100%;
      margin-right: 1em;

      font-size: 0.6rem;
      font-weight: 200;
      text-align: right;
      text-overflow: ellipsis;
      white-space: nowrap;
      overflow: hidden;
      // display: inline-block;
      // float: left;
      width: 100px;
      max-width: 100px;
      // margin-left: -106px;
      // margin-right: 16px;
      /* font-weight: normal; */
      /* background-color: transparent; */
      /* line-height: 8px; */
      /* margin-top: 8px; */
      color: hsl(210, 11%, 58%);

      transition: all 0.4s cubic-bezier(0.19, 1, 0.22, 1);
    }

    &:hover,
    &.is--dragover {
      &::after {
        font-weight: 900;
        color: #333;
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
</style>
