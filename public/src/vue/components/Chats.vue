<template>
  <div class="m_chatsview">
    <CreateChat
      v-if="show_create_channel_modal"
      @close="show_create_channel_modal = false"
    />

    <div v-else class="m_channels">
      <div class="m_channels--content">
        <h3 class="font-folder_title">{{ $t("channels_list") }}</h3>
        <div class="margin-vert-small">
          <button
            type="button"
            class="barButton barButton_createChannel"
            @click="show_create_channel_modal = !show_create_channel_modal"
          >
            <span>{{ $t("create") }}</span>
          </button>
        </div>

        <div class="m_actionbar" style="margin-left: 0px; margin-right: 0px">
          <div v-if="false">
            <div class="m_actionbar--text">
              {{ $t("showing") }}
              <span
                :class="{
                  'c-bleumarine':
                    Object.keys(all_chats).length !==
                    Object.keys(filtered_chats).length,
                }"
              >
                {{ Object.keys(filtered_chats).length }}
                {{ $t("channels_of") }}
                {{ Object.keys(all_chats).length }}
              </span>
            </div>
          </div>

          <div class="m_displayMyContent" v-if="false && $root.current_author">
            <span>{{ $t("show") }}</span>
            <select v-model="show_only_content_i_can_access">
              <option :value="true">
                {{ $t("only_channels_i_participate_in").toLowerCase() }}
              </option>
              <option :value="false">
                {{ $t("all_channels").toLowerCase() }}
              </option>
            </select>
          </div>
        </div>

        <div class="m_chats--list">
          <!-- <ChatRow
            v-for="(chat, index) in pinned_chats"
            :key="'pinned_' + index"
            :chat="chat"
          /> -->
          <ChatRow
            v-for="(chat, index) in linked_chats"
            :key="'nonpinned_' + index"
            :chat="chat"
          />
          <!-- <hr /> -->
          <!-- <label>{{ $t("general") }}</label>
          <ChatRow
            v-for="(chat, index) in non_linked_chats"
            :key="'nonpinned_' + index"
            :chat="chat"
          /> -->
        </div>
      </div>
    </div>

    <transition name="slideright" :duration="500">
      <Chat :chat="$root.current_chat" v-if="$root.current_chat" />
    </transition>
  </div>
</template>
<script>
import CreateChat from "./chat/CreateChat.vue";
import ChatRow from "./chat/ChatRow.vue";
import Chat from "./chat/Chat.vue";

export default {
  props: {
    read_only: Boolean,
    chats: Object,
  },
  components: {
    CreateChat,
    ChatRow,
    Chat,
  },
  data() {
    return {
      show_create_channel_modal: false,
      show_only_content_i_can_access: true,
      new_channel_name: "",
    };
  },
  created() {},
  mounted() {
    this.$socketio.listFolders({ type: "chats" });
  },
  beforeDestroy() {},
  watch: {},
  computed: {
    all_chats() {
      return Object.values(this.chats);
    },
    filtered_chats() {
      let chats = this.all_chats;

      // if (this.show_only_content_i_can_access && this.$root.current_author)
      chats = chats.filter((r) =>
        this.$root.canSeeFolder({
          type: "chats",
          slugFolderName: r.slugFolderName,
        })
      );

      return chats;
    },
    linked_chats() {
      if (this.filtered_chats.length === 0) return [];
      let pinned_chats = this.filtered_chats.filter(
        (c) => c.linked_project === this.$root.current_project.slugFolderName
      );
      pinned_chats = this.$_.sortBy(pinned_chats, (i) => i.name.toLowerCase());

      return pinned_chats;
    },
    non_linked_chats() {
      if (this.filtered_chats.length === 0) return [];
      let pinned_chats = this.filtered_chats.filter(
        (c) => !c.linked_project || c.linked_project === ""
      );
      pinned_chats = this.$_.sortBy(pinned_chats, (i) => i.name.toLowerCase());

      return pinned_chats;
    },
    pinned_chats() {
      if (this.filtered_chats.length === 0) return [];
      let pinned_chats = this.filtered_chats.filter((c) => c.pinned === true);
      pinned_chats = this.$_.sortBy(pinned_chats, (i) => i.name.toLowerCase());

      return pinned_chats;
    },
    non_pinned_chats() {
      if (this.filtered_chats.length === 0) return [];
      let non_pinned_chats = this.filtered_chats.filter(
        (c) => !c.pinned || c.pinned === false
      );
      non_pinned_chats = this.$_.sortBy(non_pinned_chats, "date_modified");
      non_pinned_chats = non_pinned_chats.reverse();

      return non_pinned_chats;
    },
  },
  methods: {},
};
</script>
<style lang="scss">
.m_chatsview {
  position: relative;
  overflow-y: auto;
  -webkit-overflow-scrolling: touch;
  overscroll-behavior-y: contain;
  z-index: 1;

  display: flex;
  flex-flow: column nowrap;

  width: 100%;
  flex: 1 1 100%;
}
.m_channels {
  height: 100%;
  overflow-y: auto;

  .m_channels--content {
    margin: calc(var(--spacing) / 1);
    padding: calc(var(--spacing) / 2);
    // border: 4px solid var(--c-rouge);
    // background-color: var(--c-rouge);
    border-radius: 4px;

    > *:first-child {
      margin-top: 0;
    }
    > h3 {
      margin-bottom: 0;

      button {
        color: inherit;
      }
    }

    label {
      color: inherit;
      margin-bottom: 0;
    }

    hr {
      border-bottom-color: var(--c-vert_fonce);
      max-width: 100px;
      margin: var(--spacing) auto;
    }
  }
}
</style>
<style lang="scss">
.m_chats--list {
  overflow-y: auto;
}

.m_chatRow {
  // .bg-rouge_fonce;
  background-color: rgba(0, 0, 0, 0.1);
  border-radius: 4px;
  margin: calc(var(--spacing) / 2) auto;

  // border: 2px solid var(--c-rouge);

  &.is--pinned {
    .m_chatRow--name {
      // font-size: 130%;
      // background-color: white;
      // .padding-verysmall;
      // color: var(--c-rouge);
    }
  }

  .m_chatRow--firstLine {
    padding: calc(var(--spacing) / 4);

    display: flex;
    flex-flow: row wrap;
    justify-content: space-between;
    align-items: center;
  }

  .m_chatRow--secondLine {
    // border-top: 2px solid var(--c-rouge)_fonce;
    // .bg-rouge_fonce;
    padding: calc(var(--spacing) / 4);

    .m_chatRow--secondLine--toggleAccessControl {
      display: flex;
      justify-content: center;
      margin: 0;
      padding: 0;
    }
  }

  .m_metaField > *,
  .buttonLink {
    color: white;
  }

  button.bg-rouge.is--disabled {
    background-color: var(--c-gris);
    background-color: transparent;
    color: var(--c-noir);
  }

  .m_chatRow--name {
    font-weight: 500;
    letter-spacing: 0.02em;
    margin-left: calc(var(--spacing) / 4);
  }

  .m_chatRow--unreadCounter {
    border-radius: 50%;
    background-color: var(--c-vert_fonce);
    width: 2em;
    height: 2em;
    min-height: 0;
    min-width: 0;
    margin-left: calc(var(--spacing) / 4);

    // margin-bottom: 0px;

    font-size: 60%;

    display: inline-flex;
    align-items: center;
    justify-content: center;
  }
}

.m_chat {
  position: absolute;
  top: 0;
  left: 0;
  // padding-top: var(--spacing);
  // padding-left: 20%;
  width: 100%;
  height: 100%;
  color: var(--c-noir);
  z-index: 100;

  background: linear-gradient(to right, transparent 0%, var(--c-noir) 90%);
}

.m_chat--content {
  background-color: var(--c-vert);
  box-shadow: 0px 2px 16px 0px rgba(0, 0, 0, 0.4);
  width: 100%;
  height: 100%;
  overflow-y: auto;

  display: flex;
  flex-flow: column nowrap;

  > * {
    flex: 0 0 auto;
  }

  .m_chat--content--topbar {
    position: relative;
    background-color: var(--c-vert);
    color: white;
    z-index: 1;
    padding: 0 calc(var(--spacing) / 2);

    transition: box-shadow 0.4s cubic-bezier(0.19, 1, 0.22, 1);

    &.has--content_hidden_behind {
      box-shadow: 0px 2px 16px 0px rgba(0, 0, 0, 0.4);
    }

    .m_chat--content--topbar--firstLine {
      display: flex;
      align-items: center;
    }

    .m_chat--content--topbar--backbutton {
      background-color: var(--c-noir);
      color: white;
      min-height: 0;
      min-width: 0;
      width: 2em;
      height: 2em;

      margin-right: calc(var(--spacing) / 4);

      border-radius: 50%;
      font-weight: 400;
    }

    .m_chat--content--topbar--name {
      font-size: 2em;
      padding: calc(var(--spacing) / 4);
      padding-left: 0;
      flex: 1 1 auto;
    }
    button {
      color: white;
    }
  }

  .m_chat--content--topbar--optionbar {
    flex: 0 0 auto;
    display: flex;
    flex-flow: row wrap;
    justify-content: space-around;
    // .bg-blanc;

    margin: calc(var(--spacing) / 4);

    > * {
      flex: 1 1 200px;

      display: flex;
      flex-flow: row wrap;
      justify-content: flex-start;
      align-content: flex-start;
      align-items: center;
    }

    button,
    label {
      color: white;
    }
  }

  .m_chat--content--discussion {
    position: relative;
    flex: 1 1 0;
    // .bg-gris_clair;
    overflow-y: auto;

    padding: 0 calc(var(--spacing) / 4);

    ._no_message_message {
      width: 100%;
      height: 100%;
      display: block;
      color: white;
      padding: calc(var(--spacing));
      display: flex;
      align-items: center;
      justify-content: center;
    }
  }
  .m_chat--content--scrollToBottom {
    pointer-events: none;
    position: relative;
    // position: absolute;

    > button {
      position: absolute;
      display: block;
      bottom: 0;
      right: 0;
      margin: calc(var(--spacing) / 1);

      background-color: #fff;
      border: 4px solid var(--c-rouge);
      pointer-events: auto;
      border-radius: 50%;
      transform: rotate(90deg);

      width: 48px;
      height: 48px;

      padding: 0;

      box-sizing: content-box;

      transition: all 0.4s cubic-bezier(0.19, 1, 0.22, 1);

      &:hover {
        transform: scale(1.1) rotate(90deg);
      }

      svg {
        // width: 100%;
      }
    }
  }

  .m_chat--content--post {
    position: relative;
    z-index: 1;
    background-color: #fff;
    // border-top: 2px solid var(--c-rouge)_fonce;

    padding: calc(var(--spacing) / 4);

    margin-bottom: 0;

    transition: box-shadow 0.4s cubic-bezier(0.19, 1, 0.22, 1);

    &.has--hidden_content_above {
      box-shadow: 0px -2px 16px 0px rgba(0, 0, 0, 0.4);
    }

    .input-group {
      margin-bottom: 0;
    }
  }
}

.m_message {
  // display: flex;
  // flex-flow: row wrap;
  background-color: #fff;
  margin: calc(var(--spacing) / 4) 0;

  border-radius: 5px;
  overflow: hidden;
  max-width: 90%;
  font-size: 70%;

  &.is--currentauthor {
    margin-left: auto;
    margin-right: 0;
  }

  .m_message--meta {
    display: flex;
    flex-flow: row wrap;
    justify-content: space-between;
    align-items: center;
    background-color: #eee;

    .is--currentauthor {
      background-color: var(--c-vert) !important;
      color: var(--c-noir) !important;
    }

    // border-bottom: 2px solid @c-gris_tresclair;
  }

  .m_message--meta--author {
    flex: 0 0 auto;

    > span {
      display: flex;
      flex-flow: row nowrap;
      align-items: center;
      font-weight: 400;
      text-transform: initial;
      margin-right: calc(var(--spacing) / 4) !important;
      padding: 0.2rem 0.6rem 0.2rem 0.2rem;
      color: var(--c-noir);
      border-top-left-radius: 4px;

      .is--currentauthor {
        &::before {
          opacity: 0.6;
        }
      }

      ._pp,
      ._no_pp {
        width: 20px;
        height: 20px;
        border-radius: 50%;
        margin-right: 0.2em;
        object-fit: cover;
      }

      ._no_pp {
        &::before {
          content: url("data:image/svg+xml;charset=US-ASCII,%3Csvg%20xmlns%3D%22http%3A//www.w3.org/2000/svg%22%20viewBox%3D%220%200%2084%2084%22%3E%0A%20%20%3Ctitle%3Etext%20copie%2010%3C/title%3E%0A%20%20%3Cg%20id%3D%22Calque_6%22%20data-name%3D%22Calque%206%22%3E%0A%20%20%20%20%3Cg%20id%3D%22flc%22%3E%0A%20%20%20%20%20%20%3Cpath%20d%3D%22M64%2C56.53a18.29%2C18.29%2C0%2C0%2C0-10.06-8.09s-3.44-1.71-12.28-1.71-12.27%2C1.71-12.27%2C1.71a18.31%2C18.31%2C0%2C0%2C0-10.07%2C8.09c-1%2C1.47-1.47%2C4.66-1.71%2C6.37v2.45c0%2C3.19%2C2.2%2C5.89%2C4.9%2C5.89H60.56c2.7%2C0%2C4.91-2.7%2C4.91-5.89V62.9A10.5%2C10.5%2C0%2C0%2C0%2C64%2C56.53M28.41%2C24.91c0%2C7.36%2C4.66%2C18.39%2C13.5%2C18.39%2C8.59%2C0%2C13.5-11%2C13.5-18.39a13.44%2C13.44%2C0%2C0%2C0-13.5-13.47%2C13.29%2C13.29%2C0%2C0%2C0-13.5%2C13.47%22/%3E%0A%20%20%20%20%3C/g%3E%0A%20%20%3C/g%3E%0A%3C/svg%3E%0A");
          display: inline-block;
          vertical-align: baseline;
          width: 20px;
          height: 20px;
          opacity: 0.2;
          transform: scale(0.8);
        }
      }
    }
  }
  .m_message--meta--date {
    padding: 0.2rem 0.4rem 0.2rem 0.2rem;
    margin-right: 0;
    text-align: right;
  }
  .m_message--text {
    padding-right: var(--spacing);
    flex: 1 1 auto;
    padding: calc(var(--spacing) / 4);
  }
}

.m_sinceLastVisit {
  position: relative;
  margin: 0 var(--spacing);
  margin: calc(var(--spacing) / 4) 0;

  width: calc(100% - var(--spacing) * 2);
  font-size: 60%;
  display: flex;
  justify-content: center;
  align-items: center;
  color: white;
  text-transform: lowercase;

  &::before {
    content: "";
    display: block;
    width: 100%;
    height: 1px;
    border-top: 1px solid currentColor;
    position: absolute;
  }
  span {
    font-weight: bold;
    position: relative;
    background-color: var(--c-vert);
    padding: 0 calc(var(--spacing) / 4);
  }
}

._button_showOlderMessages {
  position: relative;
  margin: 0 auto;
  // width: ~"calc(100% - var(--spacing) * 2)";
  margin: calc(var(--spacing) / 2) 0;

  font-size: 70%;
  background-color: var(--c-rouge) _fonce;

  display: flex;
  justify-content: center;

  span {
    // position: relative;
    // padding: 0 ~"calc( var(--spacing) / 4)";
  }
}
</style>
