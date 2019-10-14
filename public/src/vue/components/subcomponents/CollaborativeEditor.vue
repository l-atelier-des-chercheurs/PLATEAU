<template>
  <div
    class="m_collaborativeEditor quillWrapper"
    :class="{ 'is--focused' : is_focused }"
    autocorrect="off"
    autofocus="autofocus"
  >
    <!-- connection_state : {{ connection_state }} -->
    <!-- <br /> -->
    <div ref="editor" class="mediaTextContent" />
  </div>
</template>
<script>
import ReconnectingWebSocket from "reconnectingwebsocket";
import ShareDB from "sharedb/lib/client";
import Quill from "quill";
import debounce from "debounce";

ShareDB.types.register(require("rich-text").type);

export default {
  props: {
    value: {
      type: String,
      default: "…"
    },
    media: Object,
    slugFolderName: String
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
      debounce_textUpdate: undefined,

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
        toolbar: this.custom_toolbar
      },
      theme: "bubble",
      formats: [
        "bold",
        "italic",
        "underline",
        "link",
        "header",
        "blockquote",
        "list"
      ],
      placeholder: "Write text here…"
    });
    this.editor.root.innerHTML = this.value;

    if (this.$root.preview_mode) {
      this.editor.disable();
    }

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
      });

      this.editor.on("selection-change", (range, oldRange, source) => {
        console.log("selection changed");
        if (range === null && oldRange !== null) this.is_focused = false;
        else if (range !== null && oldRange === null) this.is_focused = true;
      });
    });
  },
  beforeDestroy() {
    if (!!this.socket) {
      this.socket.close();
    }
  },
  watch: {
    "$root.preview_mode": function() {
      if (this.$root.preview_mode) {
        this.editor.disable();
      } else {
        this.editor.enable();
      }
    }
  },
  computed: {},
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
        this.$root.editMedia({
          type: "projects",
          slugFolderName: this.slugFolderName,
          slugMediaName: this.media.metaFileName,
          data: {
            content: this.editor.getText() ? this.editor.root.innerHTML : ""
          }
        });
      }, 500);
    }
  }
};
</script>
<style src="../../../../node_modules/quill/dist/quill.bubble.css"></style>
<style lang="scss">
.m_collaborativeEditor {
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
    border-radius: 4px;
  }

  .ql-editor {
    padding-left: 0;
    padding-top: 0;
    padding-bottom: 0;
    overflow: visible;
    min-height: 5em;

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
      margin-top: 0.63888889em;
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
      font-weight: 700;
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
    }

    h1 {
      font-weight: 700;
    }

    h2,
    h3,
    h4 {
      font-weight: 700;
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
</style>