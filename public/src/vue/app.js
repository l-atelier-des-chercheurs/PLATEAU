/** *********
  VUE
***********/

// The following line loads the standalone build of Vue instead of the runtime-only build,
// so you don't have to do: import Vue from 'vue/dist/vue'
// This is done with the browser options. For the config, see package.json
import Vue from "vue";
import DeviceDetector from "device-detector-js";

import localstore from "store";
import _ from "underscore";
Object.defineProperty(Vue.prototype, "$_", { value: _ });

import alertify from "alertify.js";
Vue.prototype.$alertify = alertify;

import auth from "../adc-core/auth-client.js";
auth.init();
Vue.prototype.$auth = auth;

import locale_strings from "./locale_strings.js";

// Vue.config.silent = false;
// Vue.config.devtools = true;

Vue.prototype.$eventHub = new Vue(); // Global event bus

import PortalVue from "portal-vue";
Vue.use(PortalVue);

import VueI18n from "vue-i18n";
Vue.use(VueI18n);

import VuePlyr from "vue-plyr";
Vue.use(VuePlyr);

Vue.component("Loader", {
  name: "Loader",
  template: `
    <div class="_loader">
      <span class="loader" />
    </div>
  `,
});

import VueTippy, { TippyComponent } from "vue-tippy";
Vue.use(VueTippy);
Vue.component("tippy", TippyComponent);

import VueGoodTablePlugin from "vue-good-table";
Vue.use(VueGoodTablePlugin);

import VCalendar from "v-calendar";
Vue.use(VCalendar);

import PasswordFieldComponent from "./components/subcomponents/PasswordField.vue";
Vue.component("PasswordField", PasswordFieldComponent);

import ImageSelectComponent from "./components/subcomponents/ImageSelect.vue";
Vue.component("ImageSelect", ImageSelectComponent);

import Modal from "./components/modals/BaseModal.vue";
Vue.component("Modal", Modal);

let lang_settings = {
  available: {
    fr: "Français",
  },
  default: "fr",
  current: "fr",
  init: function () {},
};
lang_settings.init();

import moment from "moment";
import "moment/locale/fr";

moment.locale(lang_settings.current);
Vue.prototype.$moment = moment;

import momentDurationFormatSetup from "moment-duration-format";
momentDurationFormatSetup(moment);

const html = document.documentElement; // returns the html tag
html.setAttribute("lang", lang_settings.current);

// Create VueI18n instance with options
let i18n = new VueI18n({
  locale: lang_settings.current, // set locale
  messages: locale_strings, // set locale messages
});

/** *********
  SOCKETIO
***********/

import custom_socketio from "../adc-core/custom-socketio.js";
Vue.prototype.$socketio = custom_socketio.init(i18n, auth, alertify);

import App from "./App.vue";

let vm = new Vue({
  // eslint-disable-line no-new
  i18n,
  el: "#app",
  components: { App },
  template: `
    <App
    />
  `,
  data: {
    store: window.store,
    state: window.state,

    justCreatedFolderID: false,
    justCreatedMediaID: false,

    currentTime: "",
    preview_mode: false,

    do_navigation: {
      view: "List",
      current_slugProjectName: false,
    },
    show_session_password_prompt: false,

    show_accounts_list: false,

    // persistant, par device (dans le localstorage)
    settings: {
      windowWidth: window.innerWidth,
      windowHeight: window.innerHeight,

      is_slave: false,
      has_slave_connected: false,

      default_project_panes: [
        {
          key: "Planning",
          enabled: true,
        },
        {
          key: "MediaLibrary",
          enabled: true,
        },
        // {
        //   key: "Composition",
        //   enabled: false,
        // },
        {
          key: "Capture",
          enabled: false,
        },
        {
          key: "Team",
          enabled: false,
        },
        // {
        //   key: "WriteUp",
        //   enabled: true
        // }
      ],
      project_panes_in_order: [],

      current_chat: {
        slug: "",
      },

      capture_options: {
        selected_mode: "",
        selected_devicesId: {
          audioinput: "",
          videoinput: "",
          audiooutput: "",
        },
        ideal_camera_resolution: {
          name: "",
          width: "",
          height: "",
        },

        distant_flux: {
          active: false,
          username: `plateau-${(
            Math.random().toString(36) + "00000000000000000"
          ).slice(2, 3 + 2)}`,
          callee_username: "",
        },
      },

      medias_present_in_writeup: [],

      current_writeup_media_metaFileName: false,
      current_planning_media_metaFileName: false,

      current_composition_media_metaFileName: false,
      media_being_dragged: false,

      current_author_slug: false,
      project_filter: {
        keyword: "",
        author: "",
        name: "",
      },
      media_filter: {
        keyword: "",
        author: "",
        fav: "",
      },
    },
    lang: {
      available: lang_settings.available,
      current: lang_settings.current,
    },
  },
  created() {
    if (window.state.dev_mode === "debug") {
      console.log("ROOT EVENT: created");
    }

    if (this.settings.enable_system_bar) {
      document.body.classList.add("has_systembar");
    }

    if (window.state.dev_mode === "debug") {
      console.log("ROOT EVENT: created / checking for password");
    }

    this.$moment.locale("fr");

    window.addEventListener("resize", () => {
      this.settings.windowWidth = window.innerWidth;
      this.settings.windowHeight = window.innerHeight;
    });

    // self-correcting timer
    let setCurrentTime = () => {
      this.currentTime = this.$moment();
      // console.log("off by " + this.$moment().milliseconds());
      setTimeout(setCurrentTime, 1000 - this.$moment().milliseconds());
    };
    setCurrentTime();

    if (this.store.noticeOfError) {
      if (this.store.noticeOfError === "failed_to_find_folder") {
        this.$alertify
          .closeLogOnClick(true)
          .delay(4000)
          .error(
            this.$t('notifications["failed_to_get_folder:"]') +
              " " +
              this.state.request.slugFolderName
          );
      }
    } else {
      if (window.state.dev_mode === "debug") {
        console.log(
          "ROOT EVENT: created / no errors, checking for content to load"
        );
      }

      // if a slugProjectName or a metaFileName is requested, load the content of that folder rightaway
      // we are probably in a webbrowser that accesses a subfolder or a media
      if (this.state.request.slugFolderName) {
        if (this.state.mode === "live") {
          this.$eventHub.$once("socketio.projects.folders_listed", () => {
            this.openProject(this.state.request.slugFolderName);
          });
        } else {
          this.do_navigation.view = "Project";
          this.do_navigation.current_slugProjectName = this.state.request.slugFolderName;
        }
      }
    }

    /* à la connexion/reconnexion, détecter si un projet ou une publi sont ouverts 
    et si c’est le cas, rafraichir leur contenu (meta, medias) */
    this.$eventHub.$on("socketio.reconnect", () => {
      this.$socketio.listFolders({ type: "authors" });
      this.$socketio.listFolders({ type: "projects" });
      this.$socketio.listFolders({ type: "chats" });

      if (this.do_navigation.current_slugProjectName) {
        this.$socketio.listFolder({
          type: "projects",
          slugFolderName: this.do_navigation.current_slugProjectName,
        });
        this.$socketio.listMedias({
          type: "projects",
          slugFolderName: this.do_navigation.current_slugProjectName,
        });
      }
    });

    window.onpopstate = (event) => {
      console.log(
        `ROOT EVENT: popstate with event.state.slugProjectName = ${event.state.slugProjectName}`
      );
      this.do_navigation.current_slugProjectName = event.state.slugProjectName;
    };

    if (this.state.mode === "live") {
      console.log("ROOT EVENT: created / now connecting with socketio");

      if (!this.$root.state.is_electron) {
        this.$eventHub.$on("socketio.connect", () => {
          this.$alertify
            .closeLogOnClick(true)
            .delay(4000)
            .success(this.$t('notifications["connected_to_plateau"]'));
        });
        this.$eventHub.$on("socketio.reconnect", () => {
          this.$alertify
            .closeLogOnClick(true)
            .delay(4000)
            .success(this.$t('notifications["connected_to_plateau"]'));
        });
      }

      if (this.$root.state.session_password === "has_pass") {
        var session_storage_pwd = this.$auth.getSessionPasswordFromLocalStorage();
        if (session_storage_pwd) {
          this.$socketio.connect(session_storage_pwd);

          this.$alertify
            .closeLogOnClick(true)
            .delay(4000)
            .log(this.$t("notifications.using_saved_password"));

          this.$eventHub.$once("socketio.socketerror", () => {
            this.show_session_password_prompt = true;
          });
        } else {
          this.show_session_password_prompt = true;
        }

        this.$eventHub.$on("socketio.socketerror", () => {
          // if error, attempt to reconnect
          this.$alertify
            .closeLogOnClick(true)
            .delay(4000)
            .error(this.$t('notifications["wrong_password"]'));
          this.show_session_password_prompt = true;
        });
      } else {
        this.$socketio.connect();
      }

      const deviceDetector = new DeviceDetector();
      const device = deviceDetector.parse(navigator.userAgent);
      this.$socketio.socket.emit("updateClientInfo", { device });

      this.$eventHub.$once("socketio.authentificated", () => {
        this.$socketio.listFolders({ type: "authors" });
        this.$socketio.listFolders({ type: "projects" });
        this.$socketio.listFolders({ type: "chats" });

        const authorized_authors = this.state.list_authorized_folders.find(
          (f) => f.type === "authors" && f.allowed_slugFolderNames.length > 0
        );

        if (authorized_authors) {
          this.$eventHub.$once("socketio.authors.folders_listed", () => {
            if (Object.values(this.store.authors).length === 0) return;

            const first_author_slug =
              authorized_authors.allowed_slugFolderNames[0];
            const author = Object.values(this.store.authors).find(
              (a) => a.slugFolderName === first_author_slug
            );

            if (author) {
              this.setAuthor(first_author_slug);
              this.$alertify
                .closeLogOnClick(true)
                .delay(4000)
                .success(
                  this.$t("notifications.connecting_using_saved_account") +
                    author.name
                );
            }
          });
        }
      });
    }
  },
  beforeDestroy() {},
  watch: {
    "store.authors": function () {
      if (window.state.dev_mode === "debug") {
        console.log(`ROOT EVENT: var has changed: store.authors`);
      }
      // check if, when store.authors refresh, the current_author_slug is still there
      // delog if not
      if (
        this.settings.current_author_slug !== false &&
        !this.store.authors.hasOwnProperty(this.settings.current_author_slug)
      ) {
        this.unsetAuthor();
      }
    },
    "state.list_authorized_folders": {
      handler() {
        const authors = this.state.list_authorized_folders.find(
          (f) => f.type === "authors"
        );
        if (authors) {
          const allowed_slugFolderNames = authors.allowed_slugFolderNames;
          if (allowed_slugFolderNames.length > 0) {
            this.setAuthor(allowed_slugFolderNames[0]);
            return;
          }
        }
        this.unsetAuthor();
      },
      deep: true,
    },

    "settings.is_slave": function () {
      this.$socketio.socket.emit("updateClientInfo", {
        is_slave: this.settings.is_slave,
      });
    },
    "settings.project_panes_in_order": {
      handler() {
        console.log(
          `ROOT EVENT: var has changed: settings.project_panes_in_order`
        );
        // console.log(`panes data`);
        // this.$root.settings.project_panes_in_order.map(pp =>
        //   console.log(`${pp.key} = ${pp.enabled}`)
        // );

        // if (
        //   this.$root.settings.project_panes_in_order.includes(
        //     p => p.key === "WriteUp"
        //   )
        // )
        //   this.$root.settings.project_panes_in_order = this.$root.settings.project_panes_in_order.filter(
        //     p => p.key !== "WriteUp"
        //   );

        localstore.set(
          `panes.${this.do_navigation.current_slugProjectName}`,
          this.settings.project_panes_in_order
        );
      },
      deep: true,
    },
    current_project() {
      this.updateClientInfo({
        looking_at_project: {
          slugFolderName: this.current_project
            ? this.current_project.slugFolderName
            : false,
        },
      });
    },
  },
  computed: {
    current_project: function () {
      if (
        !this.store.hasOwnProperty("projects") ||
        Object.keys(this.store.projects).length === 0
      ) {
        this.closeProject();
        return {};
      }

      if (
        this.store.projects.hasOwnProperty(
          this.do_navigation.current_slugProjectName
        )
      ) {
        return this.store.projects[this.do_navigation.current_slugProjectName];
      } else {
        this.closeProject();
        return {};
      }
    },
    current_author() {
      if (!this.settings.current_author_slug) return false;
      if (!this.store.authors.hasOwnProperty(this.settings.current_author_slug))
        return false;
      return this.store.authors[this.settings.current_author_slug];
    },
    current_chat() {
      if (!this.settings.current_chat.slug) return false;

      return Object.values(this.store.chats).find(
        (c) => c.slugFolderName === this.settings.current_chat.slug
      );
    },
    unique_clients() {
      return this.$root.state.clients.reduce((acc, client) => {
        if (client.id === this.$root.$socketio.socket.id.substring(0, 4))
          return acc;

        if (
          this.$root.state.local_options.force_login &&
          !client.data.hasOwnProperty("author")
        )
          return acc;

        if (
          !client.data.hasOwnProperty("author") ||
          !acc.some(
            (a) => a.data.slugFolderName === client.data.author.slugFolderName
          )
        )
          acc.push(client);

        return acc;
      }, []);
    },
    all_authors() {
      return Object.values(this.store.authors);
    },
    current_author_is_admin() {
      return this.current_author && this.current_author.role === "admin";
    },

    current_planning_media: function () {
      if (
        !this.settings.current_planning_media_metaFileName ||
        Object.keys(this.current_project).length === 0
      )
        return false;

      return Object.values(this.current_project.medias).find(
        (m) =>
          m.metaFileName === this.settings.current_planning_media_metaFileName
      );
    },
    projects_that_are_accessible() {
      const type = "projects";
      return Object.values(this.store[type]).filter((p) =>
        this.canAccessFolder({ type, slugFolderName: p.slugFolderName })
      );
    },
    allAuthors() {
      let allAuthors = [];
      for (let slugAuthorName in this.store.authors) {
        let authorName = this.store.authors[slugAuthorName];
        allAuthors.push(authorName);
      }
      allAuthors = allAuthors.filter(function (item, pos) {
        return allAuthors.indexOf(item) == pos;
      });
      return allAuthors;
    },
    currentTime_human() {
      return this.$moment(this.currentTime).format("LL   LTS");
    },
    allKeywords() {
      let allKeywords = [];
      for (let slugProjectName in this.store.projects) {
        const project = this.store.projects[slugProjectName];
        let projectKeywords = project.keywords;
        if (!!projectKeywords) {
          projectKeywords.map((val) => {
            allKeywords.push(val.title);
          });

          if (
            project.hasOwnProperty("medias") &&
            Object.keys(project.medias).length > 0
          ) {
            Object.values(project.medias).map((m) => {
              if (m.hasOwnProperty("keywords") && m.keywords.length > 0) {
                allKeywords = allKeywords.concat(
                  m.keywords.map((k) => k.title)
                );
              }
            });
          }
        }
      }
      allKeywords = allKeywords.filter(function (item, pos) {
        return allKeywords.indexOf(item) == pos;
      });

      return allKeywords.map((kw) => {
        return {
          text: kw,
          classes: "tagcolorid_" + (parseInt(kw, 36) % 2),
        };
      });
    },
  },
  methods: {
    openChat(slugFolderName) {
      if (window.state.dev_mode === "debug") {
        console.log(`ROOT EVENT: openChat: ${slugFolderName}`);
      }
      this.settings.current_chat.slug = slugFolderName;
    },
    closeChat() {
      if (window.state.dev_mode === "debug") {
        console.log(`ROOT EVENT: closeChat`);
      }
      this.settings.current_chat.slug = false;
    },
    findClientsLookingAt({ type, slugFolderName, metaFileName }) {
      if (type === "projects" && metaFileName) {
        type = "editing_media";
      } else if (type === "projects") {
        type = "looking_at_project";
      } else if (type === "publications") {
        type = "looking_at_publi";
      } else if (type === "chats") {
        type = "looking_at_chat";
      } else return [];

      return this.$root.unique_clients.filter(
        (c) =>
          c.data &&
          c.data.hasOwnProperty(type) &&
          c.data[type].slugFolderName === slugFolderName &&
          (!metaFileName || c.data[type].metaFileName === metaFileName)
      );
    },
    getAllAuthorsFrom(base) {
      let uniqueAuthors = [];
      Object.values(base).map((meta) => {
        if (!meta["authors"]) return;
        if (typeof meta.authors === "string") {
          meta.authors = [{ name: meta.authors }];
        }
        meta.authors.map((k) => {
          if (uniqueAuthors.indexOf(k.name) == -1) uniqueAuthors.push(k.name);
        });
      });
      uniqueAuthors = uniqueAuthors.sort(function (a, b) {
        return a.toLowerCase().localeCompare(b.toLowerCase());
      });
      return uniqueAuthors.map((kw) => {
        return {
          name: kw,
        };
      });
    },
    setProjectKeywordFilter(newKeywordFilter) {
      if (this.settings.project_filter.keyword !== newKeywordFilter) {
        this.settings.project_filter.keyword = newKeywordFilter;
      } else {
        this.settings.project_filter.keyword = "";
      }
    },
    setReadMessageToLast({ chat }) {
      // if logged in, set author last_messages_read_in_channels to metaFileName of chat
      if (!this.$root.current_author) return false;

      const last_message_channel = {
        channel: chat.slugFolderName,
        index: chat.number_of_medias,
      };

      let last_messages_read_in_channels = Array.isArray(
        this.$root.current_author.last_messages_read_in_channels
      )
        ? JSON.parse(
            JSON.stringify(
              this.$root.current_author.last_messages_read_in_channels
            )
          )
        : [];

      const channel_info_in_author = last_messages_read_in_channels.find(
        (c) => c.channel === last_message_channel.channel
      );
      if (
        channel_info_in_author &&
        Number(channel_info_in_author.index) ===
          Number(last_message_channel.index)
      ) {
        // already up to date, do nothing
        return;
      }

      // remove existing prop
      last_messages_read_in_channels = last_messages_read_in_channels.filter(
        (c) => c.channel !== last_message_channel.channel
      );

      last_messages_read_in_channels.push(last_message_channel);

      this.$root.editFolder({
        type: "authors",
        slugFolderName: this.$root.current_author.slugFolderName,
        data: {
          last_messages_read_in_channels,
        },
      });
    },
    getUnreadMessageCount(chat) {
      if (!this.current_author) return false;

      if (
        !this.canSeeFolder({
          type: "chats",
          slugFolderName: chat.slugFolderName,
        })
      )
        return false;

      const total_number_of_messages_in_chat = chat.number_of_medias;

      // find media with meta
      const last_messages_read_in_channels = this.current_author
        .last_messages_read_in_channels;

      if (last_messages_read_in_channels) {
        const existing_info = last_messages_read_in_channels.find(
          (c) => c.channel === chat.slugFolderName
        );

        if (existing_info) {
          // const last_message_metaFileName = existing_info.metaFileName;
          // const index_of_past_message_read = Object.values(
          //   chat.medias
          // ).findIndex((m) => m.metaFileName === existing_info.msg);
          // return (
          //   total_number_of_messages_in_chat - index_of_past_message_read - 1
          // );
          // using index for performance reason (no need to list all chats to get a rough unread count)
          if (existing_info.hasOwnProperty("index")) {
            return Math.max(
              0,
              total_number_of_messages_in_chat - Number(existing_info.index)
            );
          }
        }
      }

      return Math.max(0, total_number_of_messages_in_chat);
    },
    canSeeFolder: function ({ type, slugFolderName }) {
      if (!this.store[type].hasOwnProperty(slugFolderName)) return false;

      if (this.current_author_is_admin) return true;

      // if folder has pass, and user doesn’t have it
      const folder = this.store[type][slugFolderName];

      if (
        folder.hasOwnProperty("viewing_limited_to") &&
        folder.viewing_limited_to === "everybody"
      ) {
        return true;
      }

      if (
        folder.hasOwnProperty("viewing_limited_to") &&
        folder.viewing_limited_to === "only_authors"
      ) {
        if (!folder.authors || folder.authors.length === 0) return false;

        return folder.authors.some(
          (a) => a.slugFolderName === this.current_author.slugFolderName
        );
      }

      return this.canEditFolder({ type, slugFolderName });
    },
    canEditFolder: function ({ type, slugFolderName }) {
      if (!this.store[type].hasOwnProperty(slugFolderName)) return false;

      const folder = this.store[type][slugFolderName];

      // if admin
      if (this.current_author_is_admin) return true;

      if (
        folder.hasOwnProperty("editing_limited_to") &&
        folder.editing_limited_to === "nobody"
      )
        return false;

      // if no password && no editing limits
      if (
        folder.password !== "has_pass" &&
        (!folder.hasOwnProperty("editing_limited_to") ||
          folder.editing_limited_to === "" ||
          folder.editing_limited_to === "with_password")
      )
        return true;

      // if explicit edit authorized
      if (
        folder.hasOwnProperty("editing_limited_to") &&
        folder.editing_limited_to === "everybody"
      )
        return true;

      // if password is set
      if (
        folder.password === "has_pass" &&
        (!folder.hasOwnProperty("editing_limited_to") ||
          folder.editing_limited_to === "" ||
          folder.editing_limited_to === "with_password")
      ) {
        return this.state.list_authorized_folders.some((i) => {
          return (
            !!i &&
            i.hasOwnProperty("type") &&
            i.type === type &&
            i.hasOwnProperty("allowed_slugFolderNames") &&
            i.allowed_slugFolderNames.indexOf(slugFolderName) >= 0
          );
        });
      }

      // if editing_limited_to === 'only_authors'
      if (
        folder.hasOwnProperty("editing_limited_to") &&
        folder.editing_limited_to === "only_authors"
      ) {
        if (!folder.authors || folder.authors.length === 0) return false;

        return folder.authors.some(
          (a) => a.slugFolderName === this.current_author.slugFolderName
        );
      }

      return false;
    },

    setAuthor: function (author_slug) {
      if (this.settings.current_author_slug === author_slug) return;

      if (this.state.dev_mode === "debug") console.log(`ROOT EVENT: setAuthor`);

      const author = Object.values(this.store.authors).find(
        (a) => a.slugFolderName === author_slug
      );

      if (!author) return;

      this.settings.current_author_slug = author_slug;

      this.$socketio.socket.emit("updateClientInfo", {
        author: { slugFolderName: author.slugFolderName },
      });
      this.$socketio.listFolders({ type: "authors" });
      this.$eventHub.$emit("authors.newAuthorSet");
    },
    unsetAuthor: function () {
      if (!this.settings.current_author_slug) return;

      if (this.state.dev_mode === "debug")
        console.log(`ROOT EVENT: unsetAuthor`);

      this.$auth.removeAllFoldersPassword({
        type: "authors",
      });
      this.$socketio.sendAuth();

      this.settings.current_author_slug = false;
      this.$socketio.socket.emit("updateClientInfo", { author: {} });
    },
    getAuthor(slugFolderName) {
      return this.getFolder({ slugFolderName, type: "authors" });
    },
    getFolder({ slugFolderName, type }) {
      if (
        Object.keys(this.store[type]).length === 0 ||
        !this.store[type].hasOwnProperty(slugFolderName)
      )
        return false;
      return this.store[type][slugFolderName];
    },

    format_date_to_human(d) {
      if (this.$root.lang.current === "fr") {
        return this.$moment(d).calendar(null, {
          lastDay: "[hier]",
          sameDay: "[aujourd’hui]",
          nextDay: "[demain]",
          lastWeek: "dddd [dernier]",
          nextWeek: "dddd [prochain]",
          sameElse: "dddd D MMMM Y",
        });
      } else if (this.$root.lang.current === "en") {
        return this.$moment(d).calendar(null, {
          lastDay: "[yesterday]",
          sameDay: "[today]",
          nextDay: "[tomorrow]",
          lastWeek: "[last] dddd",
          nextWeek: "[next] dddd",
          sameElse: "dddd, MMMM D Y",
        });
      }
    },
    format_duration_to_human({ duration, format }) {
      let _duration = this.$moment.isDuration(duration)
        ? duration
        : this.$moment.duration(duration);
      if (!_duration.isValid()) return false;

      if (format) {
        return _duration.format(format);
      }

      if (_duration.asHours() < 1) {
        return _duration.format("m [minutes]");
      }

      return _duration.format("H [heures] [et] m [minutes]");
    },
    formatDurationToHoursMinutesSeconds(date) {
      return this.$moment.utc(date).format("HH:mm:ss");
    },
    formatBytes(a, b) {
      if (0 == a) return `0 ${this.$t("bytes")}`;

      var e = [
        this.$t("bytes"),
        this.$t("kb"),
        this.$t("mb"),
        this.$t("gb"),
        "TB",
        "PB",
        "EB",
        "ZB",
        "YB",
      ];

      var c = 1024,
        d = b || 2,
        f = Math.floor(Math.log(a) / Math.log(c));
      return parseFloat((a / Math.pow(c, f)).toFixed(d)) + " " + e[f];
    },
    createFolder: function (fdata) {
      return new Promise((resolve, reject) => {
        if (window.state.dev_mode === "debug") {
          console.log(
            `ROOT EVENT: createfolder: ${JSON.stringify(fdata, null, 4)}`
          );
        }

        const type = fdata.type;

        fdata.id =
          Math.random().toString(36).substring(2, 15) +
          Math.random().toString(36).substring(2, 15);

        this.$socketio.createFolder(fdata);

        const catchFolderCreation = (d) => {
          if (fdata.id === d.id) {
            if (d.password === "has_pass") {
              this.$auth.updateFoldersPasswords({
                [type]: {
                  [d.slugFolderName]: fdata.data.password,
                },
              });

              this.$socketio.sendAuth();
              this.$eventHub.$once("socketio.authentificated", () => {
                return resolve(d);
              });
            } else {
              this.$nextTick(() => {
                return resolve(d);
              });
            }
          } else {
            this.$eventHub.$once(
              `socketio.folder_created_or_updated`,
              catchFolderCreation
            );
          }
        };
        this.$eventHub.$once(
          `socketio.folder_created_or_updated`,
          catchFolderCreation
        );
      });
    },

    editFolder: function (fdata) {
      return new Promise((resolve, reject) => {
        if (window.state.dev_mode === "debug") {
          console.log(
            `ROOT EVENT: editFolder: ${JSON.stringify(fdata, null, 4)}`
          );
        }

        fdata.id =
          Math.random().toString(36).substring(2, 15) +
          Math.random().toString(36).substring(2, 15);

        this.$socketio.editFolder(fdata);

        const catchFolderEdition = function (d) {
          if (fdata.id === d.id) {
            return resolve(d);
          } else {
            this.$eventHub.$once(
              `socketio.folder_created_or_updated`,
              catchFolderEdition
            );
          }
        };
        this.$eventHub.$once(
          "socketio.folder_created_or_updated",
          catchFolderEdition
        );
      });
    },
    removeFolder: function ({ type, slugFolderName }) {
      if (window.state.dev_mode === "debug") {
        console.log(
          `ROOT EVENT: removeFolder: slugFolderName = ${slugFolderName} of type = ${type}`
        );
      }
      this.$socketio.removeFolder({ type, slugFolderName });
    },
    createMedia: function (mdata) {
      return new Promise((resolve, reject) => {
        if (window.state.dev_mode === "debug") {
          console.log(`ROOT EVENT: createMedia`);
        }
        mdata.id =
          Math.random().toString(36).substring(2, 15) +
          Math.random().toString(36).substring(2, 15);

        if (this.current_author) {
          if (!mdata.hasOwnProperty("additionalMeta")) {
            mdata.additionalMeta = {};
          }
          mdata.additionalMeta.authors = [
            { slugFolderName: this.current_author.slugFolderName },
          ];
        }

        this.$socketio.createMedia(mdata);

        const catchMediaCreation = (d) => {
          if (mdata.id === d.id) {
            this.$nextTick(() => {
              return resolve(d);
            });
          } else {
            this.$eventHub.$once(
              `socketio.media_created_or_updated`,
              catchMediaCreation
            );
          }
        };
        this.$eventHub.$once(
          `socketio.media_created_or_updated`,
          catchMediaCreation
        );
      });
    },
    removeMedia: function (mdata) {
      if (window.state.dev_mode === "debug") {
        console.log(
          `ROOT EVENT: removeMedia: ${JSON.stringify(mdata, null, 4)}`
        );
      }
      this.$socketio.removeMedia(mdata);
    },
    editMedia: function (mdata) {
      if (window.state.dev_mode === "debug") {
        console.log(`ROOT EVENT: editMedia: ${JSON.stringify(mdata, null, 4)}`);
      }
      this.$socketio.editMedia(mdata);
    },
    canAccessFolder: function ({ type, slugFolderName }) {
      if (!this.store[type].hasOwnProperty(slugFolderName)) return false;

      // if folder doesn’t have a password set
      if (this.store[type][slugFolderName].password !== "has_pass") {
        return true;
      }

      const has_reference_to_folder = this.state.list_authorized_folders.filter(
        (i) => {
          if (
            !!i &&
            i.hasOwnProperty("type") &&
            i.type === type &&
            i.hasOwnProperty("allowed_slugFolderNames") &&
            i.allowed_slugFolderNames.indexOf(slugFolderName) >= 0
          )
            return true;
          return false;
        }
      );

      if (has_reference_to_folder.length > 0) {
        return true;
      }
      return false;
    },
    openProject: function (slugProjectName) {
      if (window.state.dev_mode === "debug") {
        console.log(`ROOT EVENT: openProject: ${slugProjectName}`);
      }
      if (
        !this.store.projects.hasOwnProperty(slugProjectName) ||
        !this.canAccessFolder({
          type: "projects",
          slugFolderName: slugProjectName,
        })
      ) {
        console.log("Missing folder key on the page, aborting.");
        this.closeProject();
        return false;
      }

      this.do_navigation.view = "Project";
      this.do_navigation.current_slugProjectName = slugProjectName;

      this.settings.project_panes_in_order = JSON.parse(
        JSON.stringify(this.settings.default_project_panes)
      );

      let panes_config_for_project = localstore.get(
        `panes.${this.$root.do_navigation.current_slugProjectName}`
      );
      if (panes_config_for_project) {
        // warning! if app was changed and new panes added, then
        // these won’t be in the localstorage…
        // hence we need to compare both arrays and merge thoughtfully

        // find in panes_config_for_project those that are missing
        let missing_panes = this.settings.project_panes_in_order.filter(
          (p) => !panes_config_for_project.map((_p) => _p.key).includes(p.key)
        );

        this.settings.project_panes_in_order = panes_config_for_project.concat(
          missing_panes
        );
      }

      this.$socketio.listMedias({
        type: "projects",
        slugFolderName: slugProjectName,
      });

      history.pushState(
        { slugProjectName },
        this.store.projects[slugProjectName].name,
        "/" + slugProjectName
      );
    },
    closeProject: function () {
      if (window.state.dev_mode === "debug") {
        console.log("ROOT EVENT: closeProject");
      }

      this.do_navigation.view = "List";
      this.do_navigation.current_slugProjectName = "";

      history.pushState({ slugProjectName: "" }, "", "/");
    },
    filterMedia(media) {
      const checkIfMediaIsFav = (media) => {
        return (
          media.hasOwnProperty("fav") &&
          typeof media.fav === "boolean" &&
          media.fav === this.settings.media_filter.fav
        );
      };

      const checkIfMediaHasKeyword = (media) => {
        return (
          media.hasOwnProperty("keywords") &&
          typeof media.keywords === "object" &&
          media.keywords.filter(
            (k) => k.title === this.settings.media_filter.keyword
          ).length > 0
        );
      };
      const checkIfMediaHasAuthor = (media) => {
        return (
          media.hasOwnProperty("authors") &&
          typeof media.authors === "object" &&
          media.authors.filter(
            (k) => k.slugFolderName === this.settings.media_filter.author
          ).length > 0
        );
      };
      const checkIfMediaHasType = (media) => {
        return (
          media.hasOwnProperty("type") &&
          typeof media.type === "string" &&
          this.settings.media_filter.type.includes(media.type)
        );
      };

      return (
        (!this.settings.media_filter.fav || checkIfMediaIsFav(media)) &&
        (!this.settings.media_filter.keyword ||
          checkIfMediaHasKeyword(media)) &&
        (!this.settings.media_filter.author || checkIfMediaHasAuthor(media)) &&
        (!this.settings.media_filter.type || checkIfMediaHasType(media))
      );
    },
    updateLocalLang: function (newLangCode) {
      if (window.state.dev_mode === "debug") {
        console.log("ROOT EVENT: updateLocalLang");
      }
      i18n.locale = newLangCode;
      moment.locale(newLangCode);
      this.lang.current = newLangCode;

      const html = document.documentElement; // returns the html tag
      html.setAttribute("lang", newLangCode);

      localstore.set("language", newLangCode);
    },
    updateClientInfo(val) {
      if (this.$socketio.socket) {
        if (window.state.dev_mode === "debug")
          console.log(`ROOT EVENT: updateClientInfo`);

        this.$socketio.socket.emit("updateClientInfo", val);
      }
    },
    openMedia({ slugProjectName, metaFileName }) {
      if (window.state.dev_mode === "debug") {
        console.log(
          `ROOT EVENT: openMedia with slugProjectName = ${slugProjectName} and metaFileName = ${metaFileName}`
        );
      }

      this.media_modal.open = true;
      this.media_modal.minimized = false;
      this.media_modal.current_slugProjectName = slugProjectName;
      this.media_modal.current_metaFileName = metaFileName;
    },
    closeMedia: function () {
      if (window.state.dev_mode === "debug") {
        console.log(`ROOT EVENT: closeMedia`);
      }

      this.media_modal.open = false;
    },

    downloadPubliPDF({ slugPubliName }) {
      if (window.state.dev_mode === "debug") {
        console.log(`ROOT EVENT: downloadPubliPDF: ${slugPubliName}`);
      }
      this.$socketio.downloadPubliPDF({
        slugPubliName,
      });
    },
    allKeywords({ type = "projects" }) {
      let allTypeKeywords = [];
      for (let slugProjectName in this.store[type]) {
        const folder = this.store[type][slugProjectName];
        let folderKeywords = folder.keywords;
        if (!!folderKeywords) {
          folderKeywords.map((val) => {
            allTypeKeywords.push(val.title);
          });
        }

        if (
          folder.hasOwnProperty("medias") &&
          Object.keys(folder.medias).length > 0
        ) {
          Object.values(folder.medias).map((m) => {
            if (m.hasOwnProperty("keywords") && m.keywords.length > 0) {
              allTypeKeywords = allTypeKeywords.concat(
                m.keywords.map((k) => k.title)
              );
            }
          });
        }
      }
      allTypeKeywords = allTypeKeywords.filter(function (item, pos) {
        return allTypeKeywords.indexOf(item) == pos;
      });

      return allTypeKeywords.map((kw) => {
        return {
          text: kw,
          classes: "tagcolorid_" + (parseInt(kw, 36) % 2),
        };
      });
    },
    getAllKeywordsFrom(base) {
      let uniqueKeywords = [];
      Object.values(base).map((meta) => {
        if (!meta["keywords"]) return;
        meta.keywords.map((k) => {
          if (uniqueKeywords.indexOf(k.title) == -1)
            uniqueKeywords.push(k.title);
        });
      });
      uniqueKeywords = uniqueKeywords.sort(function (a, b) {
        return a.toLowerCase().localeCompare(b.toLowerCase());
      });

      return uniqueKeywords.map((kw) => {
        return {
          text: kw,
          classes: "tagcolorid_" + (parseInt(kw, 36) % 2),
        };
      });
    },
    listSpecificMedias(mdata) {
      if (window.state.dev_mode === "debug") {
        console.log(
          `ROOT EVENT: listSpecificMedias with medias_list = ${JSON.stringify(
            mdata,
            null,
            4
          )}`
        );
      }
      this.$socketio.listSpecificMedias(mdata);
    },
    switchLang() {
      if (window.state.dev_mode === "debug") {
        console.log(`ROOT EVENT: switchLang`);
      }
      if (this.lang.current === "fr") {
        this.updateLocalLang("en");
      } else {
        this.updateLocalLang("fr");
      }
    },
    formatDateToCalendar(date) {
      return this.$moment(date, "YYYY-MM-DD HH:mm:ss").calendar();
    },
    formatDateToHuman(date) {
      return this.$moment(date, "YYYY-MM-DD HH:mm:ss").format("LL");
    },
    updateNetworkInfos() {
      this.$socketio.updateNetworkInfos();
    },
    navigation_back() {
      if (this.do_navigation.view === "Capture") {
        this.do_navigation.view = "Project";
      } else if (this.do_navigation.view === "Project") {
        this.closeProject();
      }
    },
    setMediaKeywordFilter(newKeywordFilter) {
      if (this.settings.media_filter.keyword !== newKeywordFilter) {
        this.settings.media_filter.keyword = newKeywordFilter;
      } else {
        this.settings.media_filter.keyword = "";
      }
    },
    getFolderPassword({ type, slugFolderName }) {
      const folders_password = this.$auth.getFoldersPasswords();
      if (
        folders_password.hasOwnProperty(type) &&
        folders_password[type].hasOwnProperty(slugFolderName)
      ) {
        return folders_password[type][slugFolderName];
      }
      return "";
    },

    setFavFilter() {
      this.settings.media_filter.fav = !this.settings.media_filter.fav;
    },
    getDeviceName(client) {
      if (
        !client ||
        !client.hasOwnProperty("data") ||
        !client.data.hasOwnProperty("device")
      )
        return ".";

      let str = "";
      const device = client.data.device;

      if (device.hasOwnProperty("client"))
        str += device.client.name + " " + device.client.version;
      if (device.hasOwnProperty("os"))
        str += " " + this.$t("on") + " " + device.os.name;

      return str;
    },
  },
});
