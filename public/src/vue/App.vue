<template>
  <div id="app">
    <Topbar />

    <template>
      <component
        :is="$root.do_navigation.view"
        :projects="$root.store.projects"
        :project="$root.currentProject"
        :slugProjectName="$root.do_navigation.current_slugProjectName"
      />
    </template>
  </div>
</template>

<script>
import Topbar from "./components/Topbar.vue";
import List from "./List.vue";
import Project from "./Project.vue";

export default {
  name: "app",
  components: {
    Topbar,
    List,
    Project
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
  height: 100%;
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
  margin: 0px;

  height: 100%;

  display: flex;
  flex-flow: column nowrap;
}

hr {
  border: 0;
  border-top: var(--border-width) solid var(--border-color);
}

* {
  box-sizing: border-box;
}

body {
  background-color: #fff;
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
  font-size: inherit;
  font-family: inherit;
  font-variant: small-caps;
  color: inherit;
  text-transform: lowercase;
  cursor: inherit;
  font-weight: 600;
}

button,
.button {
  text-decoration: underline;
  cursor: pointer;
  padding: 0.2em;
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
