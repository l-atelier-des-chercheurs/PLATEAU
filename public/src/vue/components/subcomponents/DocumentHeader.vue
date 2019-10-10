<template>
  <div class="m_documentHeader">
    <div class="m_documentHeader--text">
      <div
        class="quillWrapper"
        :class="{ 'is--focused' : is_focused }"
        autocorrect="off"
        autofocus="autofocus"
      >
        <!-- connection_state : {{ connection_state }} -->
        <!-- <br /> -->
        <div ref="editor" class />
      </div>
    </div>
    <div class="m_documentHeader--unlogo">
      <UNLogo />
    </div>
  </div>
</template>
<script>
import UNLogo from "./UNLogo.vue";

import ReconnectingWebSocket from "reconnectingwebsocket";
import ShareDB from "sharedb/lib/client";
import Quill from "quill";
import debounce from "debounce";

ShareDB.types.register(require("rich-text").type);

export default {
  props: {
    value: {
      type: String,
      default: ""
    },
    slugDocumentName: String
  },
  components: {
    UNLogo
  },
  data() {
    return {
      editor: null,
      editor_id: (Math.random().toString(36) + "00000000000000000").slice(
        2,
        3 + 5
      ),

      is_focused: false,
      debounce_textUpdate: undefined,

      custom_toolbar: [],

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
      formats: [],
      placeholder: "Write header here…"
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
        type: "documents",
        slugFolderName: this.slugDocumentName,
        field: "header_text"
      });

      const requested_querystring = "?" + params.toString();
      this.requested_resource_url =
        (location.protocol === "https:" ? "wss" : "ws") +
        "://" +
        window.location.host +
        "/sharedb" +
        requested_querystring;

      console.log(
        `MOUNTED • DocumentHeader: will connect to ws server with ${this.requested_resource_url}`
      );

      this.socket = new ReconnectingWebSocket(this.requested_resource_url);
      const connection = new ShareDB.Connection(this.socket);

      connection.on("state", this.wsState);
      const doc = connection.get("field", requested_querystring);

      doc.subscribe(err => {
        if (err) {
          console.error(`ON • DocumentHeader: err ${err}`);
        }
        console.log(`ON • DocumentHeader: subscribe`);

        if (!doc.type) {
          console.log(
            `ON • DocumentHeader: no type found on doc, creating a new one with content ${JSON.stringify(
              this.editor.getContents()
            )}`
          );
          doc.create(this.editor.getContents(), "rich-text");
        } else {
          console.log(
            `ON • DocumentHeader: doc already exists and doc.data = ${JSON.stringify(
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
            console.log(`ON • DocumentHeader: text-change by user`);
            doc.submitOp(delta, { source: this.editor_id });
            this.updateTextMedia();
          } else {
            console.log(`ON • DocumentHeader: text-change by API`);
          }
        });

        doc.on("op", (op, source) => {
          if (source === this.editor_id) return;
          console.log(`ON • DocumentHeader: operation applied to quill`);
          this.editor.updateContents(op);
        });
      });
    },
    wsState(state, reason) {
      console.log(
        `METHODS • DocumentHeader: wsState with state = ${state} and reason = ${reason}`
      );
      this.connection_state = state.toString();
      // 'connecting' 'connected' 'disconnected' 'closed' 'stopped'
    },
    updateTextMedia(event) {
      if (this.debounce_textUpdate) clearTimeout(this.debounce_textUpdate);
      this.debounce_textUpdate = setTimeout(() => {
        console.log(`DocumentHeader • updateTextMedia: saving new snapshop`);

        this.$root.editFolder({
          type: "documents",
          slugFolderName: this.slugDocumentName,
          data: {
            header_text: this.editor.getText() ? this.editor.getText() : ""
          }
        });
      }, 500);
    }
  }
};
</script>
<style lang="scss">
.m_documentHeader {
  display: flex;
  flex-flow: row nowrap;
  align-items: flex-end;
}

.m_documentHeader--text {
  font-weight: 600;
  flex: 1 1 auto;

  > * {
    width: 100%;
    max-width: 46ch;
  }
}
.m_documentHeader--unlogo {
  flex: 0 0 1in;
  margin-bottom: -0.3in;
  svg {
    width: 1in;
    height: 0.9in;
    padding: 0.05in;
    background: white;
    border-radius: 50% 0 0 50%;
  }
}

.m_documentHeader {
  .ql-container {
    font-family: inherit;
    font-size: inherit;
    line-height: inherit;
  }

  .ql-editor {
    padding: 0;
    // line-height: 1;
    font-weight: 600;
    font-family: inherit;

    &::after {
      // content: ".";
      color: #ccc;
    }
  }
  .quillWrapper.is--focused {
    .ql-editor::after {
      color: var(--active-color);
    }
  }

  .ql-editor.ql-blank::before {
    left: 0;
    color: rgba(0, 0, 0, 0.4);
    font-style: normal;
  }
}
</style>