<template>
  <div id="app">
    <Topbar />
    <component
      :is="$root.do_navigation.view"
      :projects="$root.store.projects"
      :project="$root.currentProject"
      :slugProjectName="$root.do_navigation.current_slugProjectName"
    />
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
<style src="../../node_modules/splitpanes/dist/splitpanes.css"></style>

<style lang="less">
:root {
  --spacing: 0.7em;
  --border-width: 1pt;
  --border-color: #222;
  --page-height: 11in;
  --active-color: rgb(52, 122, 213);
  // --active-color: #aaa;
  --color-WriteUp: #fff;
  --color-MediaLibrary: #f9ca00;
  --color-Composition: #2c75c5;
  --color-Capture: #e45a6b;
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
  font-family: "IBM Plex Sans", "OutputSansVariable", sans-serif;
  font-weight: 400;
  background-color: white;
}

#app {
  font-weight: 400;
  font-size: 100%;
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

img,
video {
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

input:required {
  background-size: 16px 16px;
  background-position: top right;
  background-repeat: no-repeat;
  background-image: radial-gradient(#ff2719 18%, transparent 25%);

  transition: background-size 0.2s;

  &:focus {
    background-size: 20px 20px;
  }
}
input[type="text"] {
  border: 1px solid #000;
  line-height: 2;
  padding: 0 ~"calc(var(--spacing) / 2)";
  &:focus {
    outline: 0;
    // outline: #0a997f 1px solid;
    border-color: #999;
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

.font-small {
  font-size: 0.9em;
  line-height: 1.25;
}
.font-verysmall {
  font-size: 0.8em;
}

[draggable="true"] {
  -moz-user-select: none;
  -khtml-user-select: none;
  -webkit-user-select: none;
  user-select: none;
  /* Required to make elements draggable in old WebKit */
  -khtml-user-drag: element;
  -webkit-user-drag: element;

  cursor: -webkit-grab;
  cursor: -moz-grab;
}

.splitpanes__pane {
  // box-shadow: inset 0 0 3px rgba(0, 0, 0, 0.2);
  // border-radius: 4px;
  // overflow: hidden;
}

.splitpanes .splitpanes__splitter {
  position: relative;
  background-color: transparent;
  // border-left: 1px solid #eee;
  cursor: pointer;
  cursor: -webkit-grab;
  cursor: -moz-grab;
}
.splitpanes--dragging .splitpanes__splitter {
  cursor: -webkit-grabbing;
  cursor: -moz-grabbing;
}

.splitpanes--vertical > .splitpanes__splitter {
  width: 1px;
  margin-left: -1px;
  border-right: 1px solid black;
}
.splitpanes--horizontal > .splitpanes__splitter {
  height: 1px;
  border-bottom: 1px solid black;
}

.splitpanes__splitter:before {
  content: "";
  position: absolute;
  left: 0;
  top: 0;
  transition: opacity 0.4s;
  background-color: rgba(255, 255, 255, 1);
  opacity: 0;
  z-index: 10000;
}
.splitpanes__splitter:hover:before {
  // opacity: 1;
}
.splitpanes--vertical > .splitpanes__splitter::before {
  left: -10px;
  right: -10px;
  height: 100%;
}
.splitpanes--horizontal > .splitpanes__splitter::before {
  top: -10px;
  bottom: -10px;
  width: 100%;
}

.splitpanes__splitter:after {
  content: "";
  position: absolute;
  top: auto;
  bottom: auto;
  top: ~"calc(50% - 10px)";
  pointer-events: none;
  // top: 50%;

  transform: rotate(45deg);

  width: 2px;
  height: 20px;

  transition: all 0.4s;
  background-color: #000;
  opacity: 1;
  z-index: 10000;
}
.splitpanes__splitter:hover:after {
  opacity: 1;
  transform: rotate(90deg);
}

.splitpanes--vertical > .splitpanes__splitter:after {
  // left: -10px;
  // right: -10px;
  // height: 100%;
}
.splitpanes--horizontal > .splitpanes__splitter:after {
  transform: rotate(135deg);
  left: 50%;
  // top: -10px;
  // bottom: -10px;
  // width: 100%;
}
.splitpanes--horizontal > .splitpanes__splitter:hover:after {
  transform: rotate(180deg);
}

.c-active {
  color: var(--active-color);
}

.plyr {
  width: 100%;
  height: 100%;
  min-width: 100px;
  font-family: inherit;
  font-weight: 200;
  display: flex;

  --c-orange: var(--active-color);

  button {
    min-height: 0;
  }

  &.plyr--video {
    background-color: transparent;
  }

  video,
  .plyr__video-wrapper,
  .plyr__poster {
    width: 100%;
    height: 100%;
    object-fit: cover;
    background-color: transparent;

    > video {
      object-fit: contain;
      height: 100%;
    }
  }
  &.plyr--audio {
    // .bg-noir;

    .plyr__controls {
      // background: @c-noir;
      background: transparent;
      color: #000;
    }
  }
  .plyr__controls {
    background: linear-gradient(rgba(0, 0, 0, 0), rgba(0, 0, 0, 1));
    color: white;
    width: 100%;
  }

  .plyr__control--overlaid {
    background-color: var(--c-orange);
  }
  input[type="range"] {
    color: var(--c-orange);
  }

  .plyr__control.plyr__tab-focus,
  .plyr__control:hover,
  .plyr__control[aria-expanded="true"] {
    background-color: var(--c-orange);
  }
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

.slideup-enter-active,
.slideup-leave-active {
  transform: translateY(0);
  transition: opacity 0.4s linear, transform 0.4s ease-out;
}
.slideup-enter,
.slideup-leave-to {
  // opacity: 0;
  transform: translateY(100%);
  transition: opacity 0.4s linear, transform 0.4s ease-out;
}
</style>
