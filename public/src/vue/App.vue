<template>
  <div id="app">
    <Topbar
      v-if="
        $root.do_navigation.view !== 'List' &&
        $root.state.mode !== 'export_planning'
      "
    />
    <component
      v-if="$root.state.mode !== 'export_planning'"
      :is="$root.do_navigation.view"
      :projects="$root.store.projects"
      :project="$root.currentProject"
      :slugProjectName="$root.do_navigation.current_slugProjectName"
    />
    <div v-else>
      <PlanningItem
        v-for="media in planning_items"
        :key="media.metaFileName"
        :media="media"
        :slugFolderName="$root.do_navigation.current_slugProjectName"
        :mode="'expanded'"
      />
    </div>
  </div>
</template>

<script>
import Topbar from "./components/Topbar.vue";
import List from "./List.vue";
import Project from "./Project.vue";
import PlanningItem from "./components/subcomponents/PlanningItem.vue";

export default {
  name: "app",
  components: {
    Topbar,
    List,
    Project,
    PlanningItem,
  },
  props: {},
  data() {
    return {
      pwd: "",
      remember_password_on_this_device: false,
    };
  },
  watch: {},
  created() {},
  computed: {
    planning_items() {
      if (typeof this.$root.currentProject.medias !== "object") return [];
      return Object.values(this.$root.currentProject.medias).filter(
        (m) => m.type === "planning"
      );
    },
  },
  methods: {},
};
</script>

<style lang="less" src="./less/_normalize.less"></style>
<style src="../../node_modules/vue-good-table/dist/vue-good-table.css"></style>
<style src="../../node_modules/vue-plyr/dist/vue-plyr.css"></style>
<style src="../../node_modules/splitpanes/dist/splitpanes.css"></style>

<style lang="less">
:root {
  --spacing: 0.9rem;
  --border-width: 1pt;
  --border-color: #222;
  --page-height: 11in;
  --active-color: rgb(52, 122, 213);

  --c-orange: #f9ca00;
  --c-rouge: #ff3e51;
  --c-bleu: #2c75c5;
  --c-noir: #333;
  --c-gris: #eff2f3;
  --c-vert: hsl(143, 69%, 55%);

  --active-color: var(--c-orange);
  // --active-color: #aaa;
  --color-WriteUp: #fff;
  --color-MediaLibrary: var(--c-orange);
  --color-Composition: var(--c-bleu);
  --color-Capture: var(--c-rouge);
  --color-Planning: var(--c-gris);
  --color-Team: var(--c-vert);

  --scrollbar-height: 1px;
  --scrollbar-padding: 3px;
  --scrollbar-border: 2px;
  --c-barbgcolor: rgba(255, 255, 255, 0);
  --c-thumbcolor: black;
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

.alertify {
  z-index: 1000;
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
.button,
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
  font-size: inherit;
  font-weight: bold;
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

  &.is--active {
    background-color: --color-noir;
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
  line-height: 1.7;
  padding: 0 ~"calc(var(--spacing) / 2)";
  &:focus {
    outline: 0;
    // outline: #0a997f 1px solid;
    border-color: #999;
  }
}

.margin-bottom-small {
  margin-bottom: ~"calc(var(--spacing) / 2)";
}

*[contenteditable] {
  &:focus {
    outline: 0;
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
  z-index: 100;
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
  z-index: 10;
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
  z-index: 11;
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

svg.inline-svg {
  display: inline-block;
  width: 1em;
  height: 1em;

  &.inline-svg-larger {
    width: 1.4em;
    height: 1.4em;
  }

  > * {
    fill: currentColor;
  }

  &_larger {
    width: 1.5em;
    height: 1.5em;
    margin-top: -0.25em;
    margin-bottom: -0.25em;
  }
}

.m_tagsAndAuthorFilters {
  margin: ~"calc(var(--spacing) / 2)" 0;

  .item {
    :not(.is--active) {
      opacity: 0.4;
    }
  }

  > * {
    max-height: 20vh;
    overflow: auto;
    // .custom_scrollbar(8px, 5px, 6px);
  }
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

._sidebyside_radio {
  display: flex;
  flex-flow: row wrap;
  justify-content: stretch;
  text-align: center;

  > * {
    flex: 1 1 0;
    padding: ~"calc(var(--spacing) / 1)" ~"calc(var(--spacing) / 2)";
    cursor: pointer;
    line-height: 1;

    &:hover {
      background-color: rgba(0, 0, 0, 0.04);
    }
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
  transition: opacity 0.2s cubic-bezier(0.19, 1, 0.22, 1),
    transform 0.4s cubic-bezier(0.19, 1, 0.22, 1);
}
.slideup-enter,
.slideup-leave-to {
  opacity: 0;
  transform: translateY(30px);
  transition: opacity 0.2s cubic-bezier(0.19, 1, 0.22, 1),
    transform 0.4s cubic-bezier(0.19, 1, 0.22, 1);
}

.slideright-enter-active,
.slideright-leave-active {
  transform: translateX(0) !important;
  transition: opacity 0.4s linear, transform 0.7s ease-out;
}
.slideright-enter,
.slideright-leave-to {
  // opacity: 0;
  transform: translateX(100%) !important;
  transition: opacity 0.4s linear, transform 0.8s ease-out;
}

.m_keywordField,
.vue-tags-input {
  position: relative;
  margin-bottom: 0;
  font-size: 75%;
  display: flex;
  flex-flow: row wrap;
  align-items: flex-start;
  text-transform: initial;

  font-family: "Fira Mono";

  > .input {
    border: none !important;
    padding: 0 !important;
  }
  > .autocomplete {
    position: relative !important;
    background-color: transparent;
    border: 4px solid #eee !important;
    padding: ~"calc(var(--spacing) / 4)";
    margin-bottom: ~"calc(var(--spacing) / 4)";
    padding-bottom: 0;
    flex: 1 0 100%;

    // &::before {
    //   content: "suggestion";
    //   margin-bottom: @t-skipline / 8;
    //   text-transform: uppercase;
    //   .label;
    //   display: block;
    //   flex: 1 1 100%;
    // }

    > div {
      display: flex;
      flex-flow: row wrap;
    }
  }

  .m_keywordField--show_all_keywords {
    display: block;
    text-transform: uppercase;
    background-color: transparent !important;
    border: 2px solid #eee;
    font-size: 80% !important;
    font-weight: bold;
    color: #333 !important;

    &::before {
      display: none;
    }
  }

  .item {
    border-radius: 4px;
    &.selected-item {
      background-color: var(--c-bleu) !important;
    }
  }
  .tags {
    flex-flow: row wrap !important;
  }

  .new-tag-input-wrapper {
    position: relative;
    padding: 0 !important;
    background-color: transparent;
    margin-right: ~"calc(var(--spacing) / 4)" !important;
    margin-bottom: ~"calc(var(--spacing) / 4)" !important;

    display: flex !important;
    flex-flow: row nowrap;
    transform: all 1s cubic-bezier(0.19, 1, 0.22, 1);

    input {
      position: relative;
      z-index: 1;

      padding: ~"calc(var(--spacing) / 4)";

      margin: 0 !important;
      border-radius: 4px;
      min-width: 15ch !important;
      flex: 1 1 auto;
      // .bg-gris_tresclair;
      font-size: inherit !important;
      line-height: 1;

      height: auto !important;
      border-bottom: 2px solid #eee !important;
    }

    button {
      display: block;
      // .button-small;
      font-size: 2em;
      background-color: #eee;
      // .bg-bleuvert;
      color: white;
      flex: 0 0 1em;
      min-height: 0;
      width: 1em;
      overflow: hidden;
      padding: 0;
      margin-left: -4px;
      padding-left: 4px;
      border-radius: 0 4px 4px 0;

      &[disabled] {
        background-color: #eee;
      }
    }
  }

  > span,
  > button,
  .tag,
  .item {
    flex-basis: auto;
    display: flex;
    align-items: center;
    min-height: 0;
    border-radius: 4px !important;
    // background-color: @c-bleuvert_clair !important;
    background-color: white;
    // color: white !important;
    color: black !important;
    font-size: inherit !important;
    // .padding-sides-verysmall !important;
    // .padding-vert-verysmall !important;
    padding: 0.2rem 0.2rem;

    text-transform: initial;
    font-weight: inherit;
    font-weight: 400;

    margin: 0 !important;
    margin-right: ~"calc(var(--spacing) / 4)" !important;
    margin-bottom: ~"calc(var(--spacing) / 4)" !important;

    &.is--active {
      font-weight: 700;
      &::before {
        color: black;
        // background-color: black !important;
      }
    }

    &.tagcolorid_0 {
      // background-color: @c-bleuvert_clair !important;
      &.is--active {
      }
    }
    &.tagcolorid_1 {
      // background-color: @c-rouge_clair !important;
    }
    &.tagcolorid_2 {
      // background-color: @c-orange_clair !important;
    }

    &::before {
      content: "•";
      flex-shrink: 0;
      margin: 0 ~"calc(var(--spacing) / 4)";
      margin-left: ~"calc(var(--spacing) / 8)";
      display: inline-block;
      vertical-align: middle;
      color: white;
      font-size: 1em;
      border-radius: 50%;
      transform: scale(1.7);

      transition: all 0.2s cubic-bezier(0.19, 1, 0.22, 1);
    }

    &.can_be_removed {
      &::before {
        content: "×";
        transform: scale(1.5);
        transition: transform 0.15s ease;
      }
      &:hover {
        &::before {
          color: #000;
          // transform: scale(2);
        }
      }
    }

    .actions {
      margin: 0 ~"calc(var(--spacing) / 2)";
      margin-right: 0;
    }
  }

  .item > div {
    margin: 0;
  }
}
</style>
<style lang="scss">
body {
  &::-webkit-scrollbar {
    height: calc((var(--scrollbar-padding) * 2) + var(--scrollbar-height));
    width: calc((var(--scrollbar-padding) * 2) + var(--scrollbar-height));
    background-color: var(--c-barbgcolor);
  }

  &::-webkit-scrollbar-track,
  &::-webkit-scrollbar-thumb {
    border: var(--scrollbar-border) solid rgba(255, 255, 255, 0);
    border-radius: calc(var(--scrollbar-border) * 4);
    background-clip: padding-box;

    transition: all 0.4s;
  }

  &::-webkit-scrollbar-track {
    background-color: transparent;
  }

  &::-webkit-scrollbar-thumb {
    background-color: var(--c-thumbcolor);
    &:hover {
      background-color: #111;
      border: var(--scrollbar-border) solid rgba(255, 255, 255, 0);
    }
  }
}
</style>
