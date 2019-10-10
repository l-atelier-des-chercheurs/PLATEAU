<template>
  <div class="m_appmenu">
    <h1 @click="$root.navigation_back()">plateau</h1>

    <template v-if="$root.state.mode === 'live' && !$root.state.authentificated">
      <div class="m_inputSessionPassword" v-if="$root.show_session_password_prompt">
        <form @submit.prevent="submitPassword">
          <label for="inp" class="inp">
            <span class="label">Connexion&nbsp;password</span>
            <input type="password" v-model="pwd" required autofocus autoselect placeholder />
            <span class="border"></span>
          </label>
          <span class="switch switch-xs margin-bottom-small">
            <input
              id="remember_password_on_this_device"
              type="checkbox"
              v-model="remember_password_on_this_device"
            />
            <label for="remember_password_on_this_device">remember password on this device</label>
          </span>

          <input type="submit" value="submit" />
        </form>
      </div>
    </template>
    <template v-else>
      <transition-group class="m_appmenu--list" tag="div" name="list-complete" :duration="300">
        <button
          type="button"
          v-if="$root.do_navigation.view === 'ListView'"
          @click="$root.show_create_document_modal = !$root.show_create_document_modal"
          :key="`new_document`"
        >
          <svg
            class="picto"
            version="1.1"
            xmlns="http://www.w3.org/2000/svg"
            xmlns:xlink="http://www.w3.org/1999/xlink"
            x="0px"
            y="0px"
            width="11.4px"
            height="11.4px"
            viewBox="0 0 10 10"
            style="enable-background:new 0 0 11.4 11.4;"
            xml:space="preserve"
          >
            <path
              class="st0"
              d="M5.3,8.9H3.7L3.2,8.4V5.8H0.5L0,5.3V3.7l0.5-0.5h2.7V0.5L3.7,0h1.6l0.5,0.5v2.7l2.7,0l0.5,0.5v1.6L8.4,5.8
			l-2.7,0v2.7L5.3,8.9z M4.2,7.9h0.6V5.3l0.5-0.5l2.7,0V4.2l-2.7,0L4.8,3.7V1H4.2v2.7L3.7,4.2H1v0.6h2.7l0.5,0.5V7.9z"
            />
          </svg>
          new document
        </button>
        <button type="button" @click="$root.show_accounts_list" :key="`show_accounts`" disabled>
          <svg
            version="1.1"
            xmlns="http://www.w3.org/2000/svg"
            xmlns:xlink="http://www.w3.org/1999/xlink"
            x="0px"
            y="0px"
            width="10.1px"
            height="12.4px"
            viewBox="0 0 10.1 12.4"
            style="enable-background:new 0 0 10.1 12.4;"
            xml:space="preserve"
          >
            <path
              class="st0"
              d="M8.7,12.4H1.4c-0.7,0-1.2-0.5-1.4-1.2h0v-0.8c0.1-0.6,0.2-1.2,0.4-1.5C0.9,8,1.7,7.4,2.6,7.1
                c0,0,0.4-0.2,1.4-0.3C2.7,6.1,2.1,4.4,2.1,3.1C2.1,1.3,3.4,0,5.1,0c1.7,0,3.1,1.4,3.1,3.1c0,1.3-0.7,3-1.9,3.7
                c0.9,0.1,1.3,0.3,1.4,0.3c0.9,0.3,1.6,0.8,2.1,1.7c0.3,0.4,0.4,1.2,0.4,1.6l0,0.8h0C9.9,11.9,9.4,12.4,8.7,12.4z M1,10.8
                c0,0.4,0.2,0.6,0.4,0.6h7.2c0.2,0,0.4-0.3,0.4-0.6v-0.5c0-0.3,0-0.7-0.2-0.9l0,0C8.5,8.7,8,8.3,7.3,8C7.2,8,6.6,7.7,5.1,7.7
                S3,8,3,8C2.2,8.3,1.7,8.7,1.3,9.4c-0.1,0.1-0.2,0.4-0.3,1L1,10.8z M5.1,1C3.9,1,3.1,1.9,3.1,3.1c0,1.1,0.7,3,2.1,3
                c1.3,0,2.1-1.8,2.1-3C7.2,1.9,6.3,1,5.1,1z"
            />
          </svg>
          accounts list
        </button>
        <button
          type="button"
          v-if="$root.do_navigation.view === 'DocumentView'"
          :key="`paper_settings`"
          disabled
        >
          <svg
            class="picto"
            version="1.1"
            xmlns="http://www.w3.org/2000/svg"
            xmlns:xlink="http://www.w3.org/1999/xlink"
            x="0px"
            y="0px"
            width="11.4px"
            height="11.4px"
            viewBox="0 0 11.4 11.4"
            style="enable-background:new 0 0 11.4 11.4;"
            xml:space="preserve"
          >
            <path
              class="st0"
              d="M11.1,4.6L10,4l0.2-1.3c0-0.2,0-0.4-0.2-0.5L9.2,1.3C9.1,1.2,8.9,1.1,8.7,1.1L7.5,1.4l-0.4-1
              C7,0.1,6.8,0,6.6,0H4.8C4.6,0,4.4,0.1,4.3,0.4l-0.4,1L2.7,1.1c-0.2,0-0.4,0-0.5,0.2L1.3,2.2C1.2,2.3,1.1,2.5,1.1,2.7l0.2,1.3
              l-1,0.4C0.1,4.4,0,4.6,0,4.8v1.4c0,0.2,0.1,0.4,0.3,0.5l1.1,0.7L1.1,8.7c0,0.2,0,0.4,0.2,0.5l0.9,0.9c0.1,0.1,0.3,0.2,0.4,0.2
              c0,0,0.1,0,0.1,0l1-0.2l0.6,1.1c0.1,0.2,0.3,0.3,0.5,0.3h1.7c0.2,0,0.4-0.1,0.5-0.4l0.4-1l1.3,0.2c0,0,0.1,0,0.1,0
              c0.1,0,0.3-0.1,0.4-0.2l0.9-0.9c0.1-0.1,0.2-0.3,0.2-0.5L10,7.4l1.1-0.7c0.2-0.1,0.3-0.3,0.3-0.5V5.1C11.4,4.9,11.3,4.7,11.1,4.6z
              M10.3,5.9L9.1,6.6c0,0,0,0,0,0c0,0,0,0-0.1,0c0,0,0,0,0,0c0,0,0,0,0,0c0,0,0,0,0,0c0,0,0,0,0,0c0,0,0,0,0,0.1c0,0,0,0,0,0
              c0,0,0,0,0,0.1c0,0,0,0,0,0c0,0,0,0,0,0.1c0,0,0,0,0,0c0,0,0,0,0,0.1c0,0,0,0,0,0l0.2,1.4L8.6,9.1L7.2,8.8c0,0,0,0,0,0
              c0,0,0,0-0.1,0c0,0,0,0,0,0c0,0,0,0-0.1,0c0,0,0,0,0,0c0,0,0,0-0.1,0c0,0,0,0,0,0c0,0,0,0-0.1,0c0,0,0,0,0,0c0,0,0,0,0,0
              c0,0,0,0,0,0c0,0,0,0,0,0c0,0,0,0,0,0.1c0,0,0,0,0,0l-0.4,1.1h-1L4.5,9.1c0,0,0,0,0,0c0,0,0,0,0,0c0,0,0,0,0,0c0,0,0,0,0,0
              c0,0,0,0,0,0c0,0,0,0,0,0c0,0,0,0,0,0c0,0,0,0,0,0c0,0,0,0,0,0c0,0,0,0-0.1,0c0,0,0,0,0,0c0,0,0,0-0.1,0c0,0,0,0,0,0c0,0,0,0-0.1,0
              c0,0,0,0,0,0c0,0,0,0-0.1,0c0,0,0,0,0,0L2.8,9.1L2.3,8.6l0.2-1.4c0,0,0,0,0,0c0,0,0,0,0-0.1c0,0,0,0,0,0c0,0,0,0,0-0.1
              c0,0,0,0,0-0.1c0,0,0,0,0,0c0,0,0,0,0-0.1c0,0,0,0,0,0c0,0,0,0,0,0c0,0,0,0,0,0c0,0,0,0,0,0c0,0,0,0,0,0c0,0,0,0-0.1,0c0,0,0,0,0,0
              L1.1,5.9V5.2l1.1-0.4c0,0,0,0,0,0l0,0c0,0,0,0,0,0c0,0,0,0,0.1,0c0,0,0,0,0,0c0,0,0,0,0,0c0,0,0,0,0,0c0,0,0,0,0,0c0,0,0,0,0,0
              c0,0,0,0,0,0c0,0,0,0,0-0.1c0,0,0,0,0-0.1c0,0,0,0,0-0.1c0,0,0,0,0-0.1c0,0,0-0.1,0-0.1c0,0,0,0,0,0l0,0c0,0,0,0,0,0L2.3,2.8
              l0.4-0.4l1.4,0.2c0,0,0,0,0,0l0,0c0,0,0,0,0,0c0,0,0,0,0.1,0c0,0,0,0,0.1,0c0,0,0,0,0,0c0,0,0,0,0.1,0c0,0,0,0,0,0c0,0,0,0,0.1,0
              c0,0,0,0,0,0c0,0,0,0,0,0c0,0,0,0,0,0c0,0,0,0,0,0c0,0,0,0,0,0c0,0,0,0,0-0.1c0,0,0,0,0,0l0,0c0,0,0,0,0,0l0.4-1.1h0.9l0.4,1.1
              c0,0,0,0,0,0c0,0,0,0.1,0.1,0.1c0,0,0,0,0,0c0,0,0.1,0.1,0.1,0.1c0,0,0,0,0,0c0,0,0.1,0,0.1,0.1c0,0,0,0,0,0c0,0,0.1,0,0.1,0
              c0,0,0,0,0,0c0,0,0,0,0.1,0c0,0,0,0,0,0l0,0l0,0l1.4-0.2l0.4,0.4L8.8,4.2c0,0,0,0,0,0c0,0,0,0,0,0.1c0,0,0,0,0,0c0,0,0,0,0,0.1
              c0,0,0,0,0,0c0,0,0,0,0,0.1c0,0,0,0,0,0c0,0,0,0,0,0.1c0,0,0,0,0,0c0,0,0,0,0,0c0,0,0,0,0,0c0,0,0,0,0,0c0,0,0,0,0.1,0c0,0,0,0,0,0
              l1.1,0.7V5.9z"
            />
            <path
              class="st0"
              d="M5.7,3.4c-1.3,0-2.3,1-2.3,2.3c0,1.3,1,2.3,2.3,2.3S8,6.9,8,5.6S7,3.4,5.7,3.4z M5.7,6.8
              c-0.6,0-1.1-0.5-1.1-1.1s0.5-1.1,1.1-1.1S6.8,5,6.8,5.6S6.3,6.8,5.7,6.8z"
            />
          </svg>
          settings
        </button>
        <button
          type="button"
          v-if="$root.do_navigation.view === 'DocumentView'"
          :key="`remove`"
          @click="removeDocument"
        >
          ×&nbsp;
          remove
        </button>
        <a
          v-if="$root.do_navigation.view === 'DocumentView'"
          :href="download_pdf_link"
          download
          :key="`download_pdf`"
        >
          <svg
            version="1.1"
            xmlns="http://www.w3.org/2000/svg"
            xmlns:xlink="http://www.w3.org/1999/xlink"
            x="0px"
            y="0px"
            width="8.1px"
            height="10.1px"
            viewBox="0 0 8.1 10.1"
            style="enable-background:new 0 0 8.1 10.1;"
            xml:space="preserve"
          >
            <path
              class="st0"
              d="M7.5,0h-7L0,0.5v9l0.5,0.5h4.1L5,9.9l2.9-3l0.2-0.4v-6L7.5,0z M1.1,1.1H7V6H4.6L4.1,6.5V9h-3V1.1z M5.2,8.2V7.1
            h1.1L5.2,8.2z"
            />
          </svg>
          create pdf
        </a>
        <button
          type="button"
          v-if="$root.do_navigation.view === 'DocumentView'"
          @click="$root.navigation_back()"
          :key="`back`"
        >
          <svg
            version="1.1"
            xmlns="http://www.w3.org/2000/svg"
            xmlns:xlink="http://www.w3.org/1999/xlink"
            x="0px"
            y="0px"
            width="4.1px"
            height="8px"
            viewBox="0 0 4.1 8"
            style="enable-background:new 0 0 4.1 8;"
            xml:space="preserve"
          >
            <path class="st0" d="M4,8H2.6L0,4.1L2.6,0h1.4L2.1,4.1L4,8z" />
          </svg>
          back
        </button>
      </transition-group>
    </template>
  </div>
</template>
<script>
export default {
  props: {},
  components: {},
  data() {
    return {};
  },
  created() {},
  mounted() {},
  beforeDestroy() {},
  watch: {},
  computed: {
    download_pdf_link() {
      return (
        window.location.origin +
        "/documents/" +
        this.$root.do_navigation.current_slugDocumentName +
        "/pdf"
      );
    }
  },
  methods: {
    submitPassword() {
      if (this.remember_password_on_this_device) {
        this.$auth.saveSessionPasswordToLocalStorage(this.pwd);
      }

      this.$socketio.connect(this.pwd);
      this.$emit("close");
    },
    removeDocument() {
      this.$alertify
        .okBtn(this.$t("yes"))
        .cancelBtn(this.$t("cancel"))
        .confirm(
          this.$t("sureToRemoveDocument"),
          () => {
            this.$root.removeFolder({
              type: "documents",
              slugFolderName: this.$root.do_navigation.current_slugDocumentName
            });
          },
          () => {}
        );
    },

    downloadPDF() {}
  }
};
</script>
<style lang="scss" scoped>
.m_appmenu {
  position: fixed;
  width: 100%;
  max-width: 240px;
  line-height: 1.4;

  user-select: none;
  // color: #999;
  transition: all 0.6s ease-out;

  &:not(:hover) {
    opacity: 0.4;
    // color: #000;
  }

  a {
    text-decoration: none;
    color: inherit;
    font-weight: 600;
  }
}

h1 {
  margin: 0;
  line-height: 1;
  letter-spacing: 0.02em;
  font-weight: 700;
  cursor: pointer;
  // font-style: italic;
}

hr {
  margin: calc(var(--spacing) * 0.7) 0;
  width: 18ch;
  border-color: currentColor;
  border-width: calc(var(--border-width) * 1.5);
  border-color: transparent;
  background-color: currentColor;
  opacity: 0.6;
}

.m_appmenu--list {
  list-style: none;
  padding: 0;
  margin: calc(var(--spacing) * 0.7) 0;
}

svg {
  fill: currentColor;
}

button,
a {
  display: block;
  font-variant: inherit;
  font-size: 115%;

  &[disabled] {
    cursor: not-allowed;
  }

  svg {
    margin-top: 2px;
    width: 12px;
    height: 12px;
  }
}

.inp {
  position: relative;
  display: block;
  margin: auto;
  width: 100%;
  max-width: 280px;
  margin-bottom: 1em;
}
.inp .label {
  // position: absolute;
  top: 16px;
  left: 0;
  font-size: 16px;
  color: #9098a9;
  font-weight: 500;
  transform-origin: 0 0;
  transition: all 0.2s ease;
}
.inp .border {
  position: absolute;
  bottom: 0;
  left: 0;
  height: 2px;
  width: 100%;
  background: #07f;
  transform: scaleX(0);
  transform-origin: 0 0;
  transition: all 0.15s ease;
}
.inp input {
  -webkit-appearance: none;
  width: 100%;
  border: 0;
  font-family: inherit;
  padding: 12px 0;
  height: 40px;
  font-size: 16px;
  font-weight: 500;
  border-bottom: 2px solid #c8ccd4;
  background: none;
  border-radius: 0;
  color: #223254;
  transition: all 0.15s ease;
}
.inp input:hover {
  background: rgba(34, 50, 84, 0.03);
}
.inp input:not(:placeholder-shown) + span {
  color: var(--active-color);
  // transform: translateY(-26px) scale(0.75);
}
.inp input:focus {
  background: none;
  outline: none;
}
.inp input:focus + span {
  color: var(--active-color);
  // transform: translateY(-26px) scale(0.75);
}
.inp input:focus + span + .border {
  border-color: var(--active-color);
  transform: scaleX(1);
}
</style>
