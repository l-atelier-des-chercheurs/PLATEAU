<template>
  <div class="m_topbar">
    <div @click="$root.navigation_back()">plateau</div>

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
      <transition-group class="m_topbar--list" tag="div" name="list-complete" :duration="300">
        <button
          type="button"
          v-if="$root.do_navigation.view === 'List'"
          @click="$root.show_create_project_modal = !$root.show_create_project_modal"
          :key="`new_project`"
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
          new project
        </button>
        <button
          type="button"
          v-if="$root.do_navigation.view === 'Project'"
          :key="`remove`"
          @click="removeProject"
        >
          ×&nbsp;
          remove
        </button>
        <button
          type="button"
          v-if="$root.do_navigation.view === 'Project'"
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
        "/projects/" +
        this.$root.do_navigation.current_slugProjectName +
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
    removeProject() {
      this.$alertify
        .okBtn(this.$t("yes"))
        .cancelBtn(this.$t("cancel"))
        .confirm(
          this.$t("sureToRemoveProject"),
          () => {
            this.$root.removeFolder({
              type: "projects",
              slugFolderName: this.$root.do_navigation.current_slugProjectName
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
.m_topbar {
  width: 100%;
  height: 55px;
  background-color: #000;
  color: white;

  padding: 1em;

  display: flex;
  // padding-top: 2em;
  // border-bottom: 1px solid black;
}
</style>
