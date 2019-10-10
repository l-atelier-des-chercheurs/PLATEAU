<template>
  <div id="app">
    <AppMenu />

    <transition name="fade_fast">
      <AccountsList v-if="$root.show_accounts" />
    </transition>

    <main>
      <template>
        <component
          :is="$root.do_navigation.view"
          :documents="$root.store.documents"
          :document="$root.currentDocument"
          :slugDocumentName="$root.do_navigation.current_slugDocumentName"
        />
      </template>
    </main>
  </div>
</template>

<script>
import AppMenu from "./components/AppMenu.vue";
import AccountsList from "./components/AccountsList.vue";
import ListView from "./ListView.vue";
import DocumentView from "./DocumentView.vue";

export default {
  name: "app",
  components: {
    AppMenu,
    ListView,
    DocumentView
  },
  props: {},
  data() {
    return {
      pwd: "",
      remember_password_on_this_device: false
    };
  },
  watch: {},
  created() {},
  computed: {},
  methods: {}
};
</script>

<style lang="less" src="./less/_normalize.less"></style>
<style src="../../node_modules/vue-good-table/dist/vue-good-table.css"></style>
<style src="../../node_modules/vue-plyr/dist/vue-plyr.css"></style>
<style lang="less">
:root {
  --spacing: 0.7em;
  --border-width: 1pt;
  --border-color: #222;
  --page-padding-vert: 0.5in;
  --page-padding-sides: 0.7in;
  --page-width: 8.5in;
  --page-height: 11in;
  --active-color: rgb(52, 122, 213);
  --active-color: #2898d9;
  // --active-color: #ff00ff;
}

::-moz-selection {
  background: rgba(151, 151, 151, 0.25);
}
::selection {
  background: rgba(151, 151, 151, 0.25);
}

html,
body {
  min-height: 100%;
}

body {
  font-family: "OutputSansVariable", sans-serif;
  font-weight: 400;
}

#app {
  font-weight: 400;
  font-size: 87.5%;
  line-height: 1.6;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  color: #000;
  margin-top: 60px;
}

hr {
  border: 0;
  border-top: var(--border-width) solid var(--border-color);
}

@media print {
  body {
    margin: 0;
  }

  #app {
    margin: 0;
  }
  .m_appmenu {
    display: none;
  }
  .m_documentview {
    margin: 0 !important;
    padding: 0 !important;

    .m_page {
      margin: 0;
      box-shadow: none;
    }
  }
}

* {
  box-sizing: border-box;
}

body {
  background-color: #eee;
  margin: 0 4%;

  @media print {
    background-color: transparent;
    margin: 0;
  }
}

img {
  max-width: 100%;
  height: auto;
}

button,
label {
  appearance: none;
  background-color: transparent;
  border: none;
  padding: 0;
  font-size: inherit;
  font-family: inherit;
  font-variant: small-caps;
  color: inherit;
  text-transform: lowercase;
  cursor: inherit;

  font-weight: 600;
}

button {
  cursor: pointer;
  transition: all 0.4s cubic-bezier(0.19, 1, 0.22, 1);

  &[disabled] {
    cursor: not-allowed;
    filter: grayscale(100%);
    opacity: 0.5;
  }
  &:focus {
    outline: 0;
  }
}

*[contenteditable] {
  &:focus {
    outline: 0;
  }

  &[contenteditable="false"] {
    cursor: not-allowed;
  }
}

.c-active {
  color: var(--active-color);
}

main {
}

.list-complete-move {
  position: relative;
  transition: transform 1s cubic-bezier(0.19, 1, 0.22, 1);
}
.list-complete-enter,
.list-complete-leave-to {
  opacity: 0;
}
.list-complete-leave-active {
  height: 0;

  position: absolute;
  z-index: 0 !important;
}

.module-switch-move {
  position: relative;
  background-color: white;
  transition: transform 1s cubic-bezier(0.19, 1, 0.22, 1);
}
.module-switch-enter,
.module-switch-leave-to {
  opacity: 0;
}
.module-switch-leave-active {
  height: 0;
  padding: 0;
  margin: 0;

  // position: absolute;
  z-index: 0 !important;
}

.fade_fast-enter-active,
.fade_fast-leave-active {
  opacity: 1;
  transition: opacity 0.3s linear;
}
.fade_fast-enter,
.fade_fast-leave-to {
  opacity: 0;
  transition: opacity 0.3s linear;
}
</style>
