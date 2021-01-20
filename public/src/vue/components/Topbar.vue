<template>
  <div>
    <div
      class="m_topbar"
      :class="`mode--${$root.do_navigation.view}`"
      v-if="!$root.settings.is_slave"
    >
      <div class="m_topbar--title">
        <div @click="$root.navigation_back()">
          <h1>
            <svg
              v-if="$root.do_navigation.view === 'Project'"
              version="1.1"
              xmlns="http://www.w3.org/2000/svg"
              xmlns:xlink="http://www.w3.org/1999/xlink"
              x="0px"
              y="0px"
              width="4.1px"
              height="8px"
              viewBox="0 0 4.1 8"
              style="enable-background: new 0 0 4.1 8"
              xml:space="preserve"
            >
              <path class="st0" d="M4,8H2.6L0,4.1L2.6,0h1.4L2.1,4.1L4,8z" />
            </svg>
            plateau
            <!-- <small>{{ $root.state.appVersion }}</small> -->
          </h1>
        </div>

        <div class="m_topbar--separator">/</div>

        <template
          v-if="$root.state.mode === 'live' && !$root.state.authentificated"
        >
          <div
            class="m_inputSessionPassword"
            v-if="$root.state.local_options.show_session_password_prompt"
          >
            <form @submit.prevent="submitPassword">
              <label for="inp" class="inp">
                <span class="label">Connexion&nbsp;password</span>
                <input
                  type="password"
                  v-model="pwd"
                  required
                  autofocus
                  autoselect
                  placeholder
                />
                <span class="border"></span>
              </label>
              <span class="switch switch-xs margin-bottom-small">
                <input
                  id="remember_password_on_this_device"
                  type="checkbox"
                  v-model="remember_password_on_this_device"
                />
                <label for="remember_password_on_this_device"
                  >remember password on this device</label
                >
              </span>

              <input type="submit" value="submit" />
            </form>
          </div>
        </template>
        <template v-else>
          <transition-group
            class="m_topbar--list"
            tag="div"
            name="list-complete"
            :duration="300"
          >
            <button
              type="button"
              v-if="$root.do_navigation.view === 'List'"
              @click="
                $root.show_create_project_modal = !$root.show_create_project_modal
              "
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
                style="enable-background: new 0 0 11.4 11.4"
                xml:space="preserve"
              >
                <path
                  class="st0"
                  d="M5.3,8.9H3.7L3.2,8.4V5.8H0.5L0,5.3V3.7l0.5-0.5h2.7V0.5L3.7,0h1.6l0.5,0.5v2.7l2.7,0l0.5,0.5v1.6L8.4,5.8 l-2.7,0v2.7L5.3,8.9z M4.2,7.9h0.6V5.3l0.5-0.5l2.7,0V4.2l-2.7,0L4.8,3.7V1H4.2v2.7L3.7,4.2H1v0.6h2.7l0.5,0.5V7.9z"
                />
              </svg>
              {{ $t("new_project") }}
            </button>
            <span
              v-if="$root.do_navigation.view === 'Project'"
              :key="`projectname`"
              @click="$root.navigation_back()"
              style="font-weight: 700"
              >{{ $root.current_project.name }}</span
            >
            <!-- <button
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
          &nbsp;
          {{ $t('back') }}
        </button>
        <button
          type="button"
          v-if="$root.do_navigation.view === 'Project'"
          :key="`remove`"
          @click="removeProject"
        >
          ×&nbsp;
          remove
          </button>-->
          </transition-group>
        </template>

        <button
          type="button"
          class="buttonLink"
          v-if="$root.do_navigation.view === 'List'"
          :disabled="zip_export_started"
          @click="downloadProjectArchive"
        >
          {{ $t("download") }}
        </button>
      </div>

      <PaneList
        class="m_topbar--paneList"
        v-if="$root.do_navigation.view === 'Project'"
      />
    </div>
    <div class="m_topbar--status" v-if="!$root.state.connected">
      {{ $t("notifications.connection_lost") }}
    </div>
    <!-- <Clients v-if="$root.settings.is_slave" /> -->
  </div>
</template>
<script>
import PaneList from "./subcomponents/PaneList.vue";

export default {
  props: {},
  components: {
    PaneList,
  },
  data() {
    return {
      zip_export_started: false,
    };
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
    },
  },
  methods: {
    submitPassword() {
      if (this.remember_password_on_this_device) {
        this.$auth.saveSessionPasswordToLocalStorage(this.pwd);
      }

      this.$socketio.connect(this.pwd);
      this.$emit("close");
    },
    downloadProjectArchive() {
      if (this.$root.state.dev_mode === "debug") {
        console.log(`Topbar • METHODS: downloadProjectArchive`);
      }

      this.zip_export_started = true;
      setTimeout(() => {
        this.zip_export_started = false;
      }, 2000);

      // const pwd = this.$auth.hashCode(this.project_password);
      const query_url =
        window.location.origin +
        "/_archives/projects/" +
        this.$root.current_project.slugFolderName;
      // + `?pwd=${pwd}`;

      if (this.$root.state.dev_mode === "debug")
        console.log(
          `Topbar • METHODS: downloadProjectArchive with query ${query_url}`
        );

      window.location.replace(query_url);
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
              slugFolderName: this.$root.do_navigation.current_slugProjectName,
            });
          },
          () => {}
        );
    },

    downloadPDF() {},
  },
};
</script>
<style lang="scss" scoped>
.m_topbar {
  position: relative;
  width: 100%;
  min-height: 55px;
  border-bottom: 1px solid black;

  padding: calc(var(--spacing) / 2);

  display: flex;
  flex-flow: row wrap;
  line-height: 2;
  align-items: center;
  justify-content: space-between;
  // padding-top: 2em;
  // border-bottom: 1px solid black;

  > * {
    padding: 0 calc(var(--spacing) / 2);
  }

  .m_topbar--title {
    display: flex;
    flex-flow: row nowrap;
    width: auto;

    > * {
      flex: 0 0 auto;
      padding: 0 calc(var(--spacing) / 8);

      &.m_topbar--list {
        flex: 1 1 0;

        span {
          text-overflow: ellipsis;
          white-space: nowrap;
          overflow: hidden;
        }
      }
    }
  }

  .m_topbar--list span {
    display: block;
    text-overflow: ellipsis;
    white-space: nowrap;
    overflow: hidden;
  }

  h1 {
    font-size: inherit;
    margin: 0;
    font-weight: 800;
    font-family: "Work Sans";
    text-transform: uppercase;
    letter-spacing: 0.03em;

    display: flex;
    flex-flow: row nowrap;
    align-items: center;

    > * {
      flex: 0 0 auto;
    }

    small {
      font-family: "Fira Code";
      font-weight: normal;
    }
  }

  &.mode--Project {
    h1 {
      cursor: pointer;
    }
  }
}

.m_topbar--separator {
  // margin: 0 var(--spacing);
}

.m_topbar--paneList {
  flex: 0 1 auto;
  justify-self: flex-end;
}

.m_topbar--status {
  background: var(--c-rouge);
  border-bottom: 1px solid black;
  padding: 0 var(--spacing);
  font-size: 80%;
  text-align: center;
  text-transform: lowercase;
}
</style>
