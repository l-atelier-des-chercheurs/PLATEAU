/** *********
  VUE
***********/

// The following line loads the standalone build of Vue instead of the runtime-only build,
// so you don't have to do: import Vue from 'vue/dist/vue'
// This is done with the browser options. For the config, see package.json
import Vue from "vue";

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

import VueTippy from "../../node_modules/vue-tippy/dist/vue-tippy.min.js";
Vue.use(VueTippy, {});

import VueGoodTablePlugin from "vue-good-table";
Vue.use(VueGoodTablePlugin);

import VCalendar from "v-calendar";
Vue.use(VCalendar);

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
    show_create_project_modal: false,

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
        {
          key: "Composition",
          enabled: false,
        },
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

      current_author: false,
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

      this.$eventHub.$once("socketio.authentificated", () => {
        this.$socketio.listFolders({ type: "authors" });
        this.$socketio.listFolders({ type: "projects" });
      });
    }
  },
  beforeDestroy() {},
  watch: {
    "store.authors": function () {
      if (window.state.dev_mode === "debug") {
        console.log(`ROOT EVENT: var has changed: store.authors`);
      }
      // check if, when store.authors refresh, the current_author is still there
      // delog if not
      if (
        this.settings.current_author &&
        !this.store.authors.hasOwnProperty(
          this.settings.current_author.slugFolderName
        )
      ) {
        this.unsetAuthor();
      }
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
  },
  computed: {
    currentProject: function () {
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
    current_planning_media: function () {
      if (
        !this.settings.current_planning_media_metaFileName ||
        Object.keys(this.currentProject).length === 0
      )
        return false;

      return Object.values(this.currentProject.medias).find(
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
    createFolder: function (fdata) {
      if (window.state.dev_mode === "debug") {
        console.log(
          `ROOT EVENT: createfolder: ${JSON.stringify(fdata, null, 4)}`
        );
      }

      this.justCreatedFolderID = fdata.id =
        Math.random().toString(36).substring(2, 15) +
        Math.random().toString(36).substring(2, 15);

      this.$socketio.createFolder(fdata);
    },
    editFolder: function (fdata) {
      if (window.state.dev_mode === "debug") {
        console.log(
          `ROOT EVENT: editFolder: ${JSON.stringify(fdata, null, 4)}`
        );
      }
      this.$socketio.editFolder(fdata);
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
      if (window.state.dev_mode === "debug") {
        console.log(`ROOT EVENT: createMedia`);
      }
      this.justCreatedMediaID = mdata.id =
        Math.random().toString(36).substring(2, 15) +
        Math.random().toString(36).substring(2, 15);

      if (this.settings.current_author.hasOwnProperty("name")) {
        if (!mdata.hasOwnProperty("additionalMeta")) {
          mdata.additionalMeta = {};
        }
        mdata.additionalMeta.authors = [
          { name: this.settings.current_author.name },
        ];
      }

      this.$nextTick(() => {
        this.$socketio.createMedia(mdata);
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
    setAuthor: function (author) {
      this.settings.current_author = author;
      this.$socketio.socket.emit("updateClientInfo", { author });
    },
    unsetAuthor: function () {
      this.settings.current_author = false;
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
    setFavFilter() {
      this.settings.media_filter.fav = !this.settings.media_filter.fav;
    },
  },
});
