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
      :project="$root.current_project"
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

    <portal-target name="modal_container" />
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
      if (typeof this.$root.current_project.medias !== "object") return [];
      return Object.values(this.$root.current_project.medias).filter(
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
  --c-vert_fonce: hsl(143, 69%, 40%);

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

.formbox {
  > *:first-child {
    font-weight: bold;
    // background-color: var(--c-noir);
    // width: 100%;
    // color: white;
    // display: block;
    // text-transform: lowercase;
    // font-variant: small-caps;
  }
  > *:not(:first-child):not(:last-child) {
    border-left: 4px solid var(--c-gris);
    padding: 0 ~"calc(var(--spacing) / 2)";
    margin: ~"calc(var(--spacing) / 2)" 0;

    label {
      // display: block;
    }
  }
  > button:last-child {
    margin: 0;
    min-height: 0;
    padding: 0;
  }

  ._submitbutton {
    width: 100%;
    background-color: var(--c-vert);
    // color: white;
    border-radius: 2px;
  }
}

.m_metaField {
  position: relative;

  display: flex;
  flex-flow: row wrap;
  justify-content: space-between;
  align-items: flex-end;

  color: var(--c-noir);
  border-bottom: 1px dashed var(--c-gris);
  border-radius: 2px;
  text-align: left;

  margin-bottom: ~"calc(var(--spacing) / 4)";

  > *:first-child {
    font-size: 80%;
    font-family: "Fira Mono";
    text-transform: uppercase;
    font-weight: 500;
    letter-spacing: 0.05em;
    color: var(--c-noir);

    &.is--active {
      color: var(--c-rouge) !important;
    }

    span {
      color: inherit;
    }

    margin-right: ~"calc(var(--spacing) / 4)";
  }

  > *:nth-child(2) {
    text-transform: initial;
    font-weight: 400;
  }
  &:last-child {
    // margin-bottom: 0;
  }

  button {
    min-height: 0;
    padding: 0;
  }
}

.m_authorField {
  position: relative;
  margin-bottom: 0;

  .font-small;
  letter-spacing: 0.04em;
  display: flex;
  flex-flow: row wrap;
  text-transform: initial;

  font-weight: 400;

  .m_authorField--show_all_authors {
    text-transform: uppercase;
    background-color: transparent !important;
    border: 2px solid var(--c-gris);
    font-size: 80% !important;
    font-weight: bold;

    &::before {
      display: none;
    }
  }

  > button,
  > span {
    flex-basis: auto;
    display: flex;
    align-items: center;
    min-height: 0;
    border-radius: 4px !important;
    text-decoration: none;
    font-variant: none;
    // color: white !important;
    font-weight: 400;
    background-color: var(--c-vert) !important;
    color: var(--c-noir);
    font-size: inherit !important;
    // .padding-sides-verysmall !important;
    // .padding-vert-verysmall !important;
    padding: ~"calc(var(--spacing)/8)" ~"calc(var(--spacing)/4)";

    text-transform: initial;
    font-weight: inherit;
    // font-weight: 500;

    margin: 0 !important;
    margin-right: ~"calc(var(--spacing) / 4)" !important;
    margin-bottom: ~"calc(var(--spacing) / 4)" !important;

    transition: all 0.06s cubic-bezier(0.19, 1, 0.22, 1);

    &[disabled] {
      opacity: 1;
    }

    &.is--active {
      // color: var(--c-vrt) !important;
      font-weight: 700;
      &::before {
        filter: invert(1);
      }
    }
    &::before {
      // content: url("data:image/svg+xml;charset=US-ASCII,%3Csvg%20xmlns%3D%22http%3A//www.w3.org/2000/svg%22%20viewBox%3D%220%200%2084%2084%22%3E%0A%20%20%3Ctitle%3Etext%20copie%2010%3C/title%3E%0A%20%20%3Cg%20id%3D%22Calque_6%22%20data-name%3D%22Calque%206%22%3E%0A%20%20%20%20%3Cg%20id%3D%22flc%22%3E%0A%20%20%20%20%20%20%3Cpath%20d%3D%22M64%2C56.53a18.29%2C18.29%2C0%2C0%2C0-10.06-8.09s-3.44-1.71-12.28-1.71-12.27%2C1.71-12.27%2C1.71a18.31%2C18.31%2C0%2C0%2C0-10.07%2C8.09c-1%2C1.47-1.47%2C4.66-1.71%2C6.37v2.45c0%2C3.19%2C2.2%2C5.89%2C4.9%2C5.89H60.56c2.7%2C0%2C4.91-2.7%2C4.91-5.89V62.9A10.5%2C10.5%2C0%2C0%2C0%2C64%2C56.53M28.41%2C24.91c0%2C7.36%2C4.66%2C18.39%2C13.5%2C18.39%2C8.59%2C0%2C13.5-11%2C13.5-18.39a13.44%2C13.44%2C0%2C0%2C0-13.5-13.47%2C13.29%2C13.29%2C0%2C0%2C0-13.5%2C13.47%22/%3E%0A%20%20%20%20%3C/g%3E%0A%20%20%3C/g%3E%0A%3C/svg%3E%0A");
      display: inline-block;
      vertical-align: middle;
      width: 20px;
      height: 20px;
      opacity: 0.4;
      transform: scale(0.8);
    }
    &.is--loggedInAuthor {
      &::before {
        opacity: 0.8;
      }
    }

    &:last-child {
      margin-right: 0 !important;
    }
  }
}

.input-group,
.input-single {
  margin-bottom: var(--spacing);
  display: flex;
  align-content: center;
}
.input-addon:last-child {
}
.alertify {
  z-index: 100000;
}

.alertify {
  z-index: 20000;
  background-color: fade(#333, 86%);

  .dialog > * {
    width: 450px;
    border-radius: 2px;
    border: 1px solid var(--c-gris);

    nav button.ok {
      background-color: transparent;
      border: none;
      font-size: inherit;
      font-family: inherit;
      background-color: #fff;
      display: inline-block;
      text-decoration: none;
      text-align: center;
      text-transform: uppercase;
      font-weight: 500 !important;
      letter-spacing: 0.06em;
      flex-shrink: 0;
      margin: 0;
      cursor: pointer;
      min-height: 3.24rem;
      padding: 0 0.81rem !important;
      border-radius: 6px !important;
      transition: color 0.25s ease-out, opacity 0.5s;
      color: #fff !important;
      background-color: var(--c-vert) !important;
    }
  }
}

.alertify-logs {
  z-index: 20001;
  right: 48px;
  pointer-events: none;
  font-size: 0.8em;
}
.alertify-logs > *,
.alertify-logs > .default {
  background-color: var(--c-gris);
  color: var(--c-noir);
  pointer-events: auto;
}
.alertify-logs > .error {
  background: var(--c-rouge);
  color: white;
}
.alertify-logs > .success {
  background: var(--c-vert);
  color: white;
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

  &.button-triangle {
    &::after {
      content: "◄";
      display: inline-block;
      margin-left: 0.5em;
      transition: transform 0.5s, color 0.5s;
    }

    &:hover {
      background: transparent;

      &::after {
        color: var(--c-rouge);
      }
    }

    &.is--active {
      color: var(--c-rouge);

      &::after {
        transform: rotate(-90deg);
      }

      &:hover {
        background: transparent;
      }
    }

    &.bg-rouge {
      &:hover {
        &::after {
          color: var(--c-noir);
        }
      }
      &.is--active {
        color: var(--c-noir);
      }
    }
  }
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
    // filter: grayscale(100%);
    opacity: 0.6;
  }
  &:focus {
    outline: 0;
  }

  &.is--active {
    background-color: var(--color-noir);
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
input[type="color"],
input[type="date"],
input[type="datetime-local"],
input[type="email"],
input[type="month"],
input[type="number"],
input[type="password"],
input[type="search"],
input[type="tel"],
input[type="text"],
input[type="time"],
input[type="url"],
input[type="week"],
select,
textarea {
  width: 100%;
  background-color: var(--c-gris);
  border: 0px solid #000;
  line-height: 2;
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

.m_captureview--videoPane--top {
  min-height: 100px !important;
}
.m_stopmotionpanel--medias--validation {
  color: black;
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

  transition: transform 0.4s;
  background-color: #000;
  opacity: 1;
  z-index: 11;
}
.splitpanes__splitter:hover {
  border-color: #fff;
}
.splitpanes__splitter:hover:after {
  opacity: 1;
  background-color: #fff;
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

  // font-family: "Fira Mono";

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
    text-decoration: none;
    font-variant: none;
    // background-color: @c-bleuvert_clair !important;
    background-color: var(--c-noir);
    // color: white !important;
    color: white !important;
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
.m_captureview {
  height: 100%;

  ._picto {
    display: none !important;
  }
  svg {
    width: 36px;
    height: 36px;
  }
  ._modeSelector {
    color: black;
  }
}
.m_captureSettings {
  button,
  input,
  optgroup,
  select,
  textarea {
    color: black;
  }
}

.inline-svg {
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
<style lang="scss">
.m_modal--mask {
  position: absolute;
  z-index: 10000;
  min-height: 100%;
  top: 0;
  width: 100%;

  overflow-y: auto;
  -webkit-overflow-scrolling: touch;

  background-color: rgba(255, 255, 255, 0.9);

  display: flex;
  align-items: center;
  justify-content: center;

  transition: all 0.2s ease-out;

  #app:not(.is--wide) & {
    align-items: flex-start;
    overflow: scroll !important;
    padding: 0 !important;
    height: 100% !important;
    background-color: #fff;
  }

  &.is_invisible {
    // background-color: transparent;
    opacity: 0;
    pointer-events: none;
  }

  &.is_minimized {
    background: transparent;
    // background: linear-gradient(45deg, fade(#fff, 92%) 150px, transparent 200px, transparent 100%);
    pointer-events: none;
    align-items: flex-end;
  }
}

.margin-sides-medium {
  margin: 0 calc(var(--spacing) / 1);
}

.m_modal--wrapper {
}

@t-panelWidth: 400px;

.m_modal--container {
  position: relative;
  transition: all 0.3s ease;

  width: 100%;
  cursor: auto;

  max-width: 320px;
  // margin: 5vmin 5vmin;
  pointer-events: all;
  z-index: 1000;

  transition: all 0.15s ease-out;

  &.is_invisible {
    opacity: 0;
    transform: translate3d(0, 15px, 0) scale(0.98);
  }

  &.is_minimized {
    transform: scale(0.25);
    transform-origin: bottom left;
    margin-left: 5px !important;
    margin-bottom: 5px !important;
    margin-right: auto !important;

    .m_modal--container--content {
      border: 30px solid white;
      border-radius: 20px;
    }
  }

  .m_modal--container--content {
    height: auto;
    position: relative;

    background-color: #fff;
    border-radius: 2px;
    // border: 1px solid @c-gris_clair;

    display: flex;
    flex-flow: row wrap;

    transition: background-color 0.4s ease-out;

    > * {
      flex: 1 1 300px;
      // transition: all .5s ease-out;

      &.m_modal--sidebar {
        flex: 0 1 320px;
        max-height: 90vh;
        width: 0px;
        border-left: 1px solid var(--c-gris);

        // transition: all .8s ease-out;

        #app:not(.is--wide) & {
          max-height: none;
          flex: 1 1 400px;
        }

        &.is_collapsed {
          flex-basis: 0px;
          border: none;
        }
      }

      &.m_modal--preview {
        position: relative;
        width: 100%;
        height: 90vh;
        overflow: hidden;

        #app:not(.is--wide) & {
          // height: auto;
        }
      }
    }

    textarea,
    .textarea,
    input[type="text"],
    select {
      color: var(--c-noir);
    }
    select[disabled] {
      color: var(--c-gris);
    }
  }
}

.m_modal--mask {
  &.typeOfModal-LargeAndScroll {
    // padding-top: @t-skipline;
    padding: var(--spacing) 0;
    // padding-top: @t-skipline;
    overflow-y: auto;
    .m_modal--container {
      max-width: 320 * 4;
      align-self: flex-start;
      .m_modal--preview {
        height: auto;
        #app:not(.is--wide) & {
          position: relative;
        }
      }
      #app.is--wide & {
        width: 90vw;
      }

      .m_modal--sidebar {
        margin-top: 0;
      }
    }
  }
  &.typeOfModal-ExportVideo {
    .m_modal--container {
      // max-width: @t-panelWidth * 4;
    }
  }

  &.typeOfModal-LargeAndNoScroll {
    overflow: hidden;

    .m_modal--container {
      margin: 0;
      max-width: 320px * 4;
      // align-self: flex-start;
      .m_modal--preview {
        #app.is--wide & {
          min-height: 70vh;
        }
        #app:not(.is--wide) & {
          // position: fixed;
          // height: 50vh;
        }
      }
      .m_modal--sidebar {
        #app:not(.is--wide) & {
          // margin-top: 50vh;
          margin-bottom: 3em;
        }
      }

      #app.is--wide & {
        width: 90vw;
        margin-bottom: 20px;
      }
    }
  }
  &.typeOfModal-SmallAndScroll {
    overflow-y: auto;

    // if it is large, then it might be long as well. Let’s make sure it sticks to the top and scrolls to the bottom
    .m_modal--container {
      padding: 5vh 0;
      align-self: flex-start;
      .m_modal--preview {
        display: flex;
        flex-flow: column nowrap;
        min-height: 10vh;
        height: auto;
      }
    }
  }
  &.typeOfModal-MediumAndScroll {
    overflow-y: auto;

    // if it is large, then it might be long as well. Let’s make sure it sticks to the top and scrolls to the bottom
    .m_modal--container {
      padding: 5vh 0;
      max-width: 320px * 2;
      align-self: flex-start;
      .m_modal--preview {
        display: flex;
        flex-flow: column nowrap;
        min-height: 10vh;
        height: auto;
      }
      .m_modal--sidebar {
        flex-basis: 320px * 2;
      }
    }
  }
  &.typeOfModal-LargeAndNoScrollWithButtons {
    .m_modal--container {
      max-width: none;
      height: 80vmin;
      width: 80vmin;

      .m_modal--container--content {
        flex-flow: column wrap;
        // background-color: transparent;
        // box-shadow: none;
        // border: none;
        height: 100%;

        .m_modal--sidebar {
          position: relative;
          // .bg-noir;
          flex-grow: 1;

          .m_modal--metaOptions {
            padding: 0;
            display: flex;
            flex-flow: column wrap;

            > .m_modal--metaOptions--media {
              flex: 1 1 auto;
            }
            > .m_modal--metaOptions--fav {
              flex: 0 0 auto;
            }
          }
        }
        .m_modal--buttons {
          flex: 0 0 auto;
        }
      }
    }
  }
}

.m_modal--sidebar {
  position: relative;
  display: flex;
  flex-flow: column nowrap;
  background-color: #fff;

  > * {
    flex: 0 0 auto;
  }

  .m_modal--sidebar--toggle {
    position: absolute;
    top: calc(var(--spacing) * 0.6);
    right: 100%;
    padding: calc(var(--spacing) / 4);
    font-weight: 700;
    font-size: 2em;
    border: 1px solid #e5e5e5;
    border-right: 0;
    // .bg-noir;
    // color: white;

    border-radius: 50% 0 0 50%;
    line-height: 1;
  }

  .m_modal--metaOptions {
    flex: 1 1 auto;
    padding: calc(var(--spacing) / 2) 0;
    overflow-y: auto;

    > * {
      margin: 0 calc(var(--spacing));

      > label ~ div {
        padding: calc(var(--spacing) / 2);
        border: 1px solid var(--c-gris);
        border-radius: 4px;

        > *:last-child {
          margin-bottom: 0;
        }
      }

      &.m_modal--buttonrow {
        margin: 0;
        // .margin-vert-small;
        padding: 0 calc(var(--spacing) / 2) 0;

        text-align: center;

        #app:not(.is--wide) & {
          > a,
          > button {
            font-size: 0.7rem;
            padding: 0;
          }
        }
      }

      .plyr .plyr__video-wrapper {
        background-color: transparent;
      }

      &:first-child {
        margin-top: 0;
      }
    }

    hr {
      margin: 0;

      margin: calc(var(--spacing) / 2);
    }
    table {
      margin: 0;
    }

    > *:last-child {
      margin-bottom: 0;
    }
  }
}
// if no preview, then sidebar takes the whole width

.m_modal--preview {
  .mediaContainer {
    height: 100%;
    overflow: hidden;
    position: relative;
    // .bg-blanc;
    background-color: var(--c-noir);
    // .bg-noir;

    &[data-context="edit"] {
      > * {
        width: 100%;
        height: 100%;
      }
    }

    img {
      position: absolute;
      top: 0;
      right: 0;
      width: auto;
      height: auto;
      object-fit: contain;
      object-position: center;
    }

    &.type-stl iframe {
      width: 100%;
      height: 100%;
      padding: 0;
      border: 0;
    }

    .plyr--video,
    .plyr__video-wrapper,
    .plyr__poster {
      background-color: transparent;
    }
    .plyr--video .plyr__controls {
      // background: linear-gradient(fade(@c-gris, 0%),fade(@c-gris, 100%));
    }
    .plyr__controls {
    }

    .plyr--audio {
      display: flex;
      justify-content: center;
      align-items: center;

      .plyr__controls {
        // background-color: @c-noir;
        // background: transparent;
        // color: @c-noir;
        width: 80%;
        margin: 0 auto;
      }
    }

    &.type-text {
      // .font-large;
      .ql-container {
        height: 100%;

        .ql-editor {
          max-width: 70ch;
          margin: 0 auto;
          overflow-y: auto;
          -webkit-overflow-scrolling: touch;
          overscroll-behavior-y: contain;
          // .custom_scrollbar(1px, 5px, 4px, rgba(255, 255, 255, 0), #333);

          &::after {
            content: "";
            display: block;
            height: 0.5em;
          }
        }
      }
    }

    &.type-audio {
      audio {
      }

      padding: 5%;
      padding-top: 25%;

      #app.is--wide & {
        padding: 0;
        padding-top: 35%;
      }
    }
    &.type-other {
      color: var(--c-noir);

      pre {
        display: inline-block;
        background-color: #fff;
        margin: calc(var(--spacing) / 8);
        padding: calc(var(--spacing) / 8);
      }
    }
  }

  input[type="text"] {
  }

  .m_modal--preview--media {
    width: 100%;
    height: 100%;

    > * {
      width: 100%;
      height: 100%;
      object-fit: contain;
      object-position: center;
    }
  }
}

.m_modal--close_button {
  position: fixed;
  top: 0;
  right: 0;
  z-index: 1500;

  line {
    fill: none;
    stroke: #4d4d4d;
    stroke-miterlimit: 10;
    stroke-width: 3px;
  }

  html.touchevents & {
    top: 0;
    right: 0;
  }
}

.m_modal--loader {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  z-index: 10000;
  background-color: rgba(255, 255, 255, 0.8);

  display: flex;
  justify-content: center;
  align-items: center;
}

.m_modal--minimize_button {
  position: fixed;
  bottom: 0;
  left: 0;
  z-index: 1500;

  pointer-events: auto;

  transition: transform 0.2s ease-out;

  &.is_minimized {
    // transform: ;
    transform: scale(-1) rotate(-360deg);
  }

  #app:not(.is--wide) & {
    display: none;
  }
}
.m_modal--nav_left,
.m_modal--nav_right {
  position: fixed;
  // top: ~"calc(50% - 40px)";
  top: auto;
  bottom: 0;
  z-index: 1500;

  #app:not(.is--wide) & {
    top: auto;
    bottom: 0;
    border: none;
  }
}
.m_modal--nav_left {
  left: auto;
  right: 50%;
  #app:not(.is--wide) & {
    left: 0;
    right: auto;
  }
}
.m_modal--nav_right {
  left: 50%;
  #app:not(.is--wide) & {
    left: auto;
    right: 0;
  }
}

.m_modal--header {
  border-bottom: 2px solid var(--c-noir);

  #app:not(.is--wide) & {
    border-top: 2px solid var(--c-noir);
  }

  h3 {
    padding: calc(var(--spacing) / 2) calc(var(--spacing));

    font-weight: 700;
    font-size: 2em;
  }

  small {
    // line-height: 1.4;
    font-size: 60%;
    display: block;
  }
}

.m_modal--buttons {
  padding: calc(var(--spacing) / 8);

  border-top: 2px solid var(--c-gris);

  display: flex;
  justify-content: center;

  min-height: 3em;

  #app:not(.is--wide) & {
    position: fixed;
    z-index: 1000;
    bottom: 0;
    left: 0;
    width: 100%;
    background-color: #fff;
  }
  button {
    margin: calc(var(--spacing) / 8);
  }

  button[type="submit"] {
    #app:not(.is--wide) & {
      // left: 50%;
      width: 10em;
      margin: 0 auto;
      // transform: translateX(-50%);
      text-align: center;
      min-height: 0;
    }
  }
}

@media print {
  .m_modal--container {
    max-width: none !important;
  }
  .m_modal--container--content {
    box-shadow: none !important;
    border: none !important;
  }
  .m_modal--preview {
    height: 100vh !important;
    border: none !important;
  }
  .m_modal--header {
    display: none;
  }
  // .m_modal--sidebar {
  //   display: none;
  // }

  .m_modal--preview {
    display: none;
  }
  .m_modal--mask {
    height: auto !important;
  }
  .m_modal--sidebar {
    overflow: auto;
    max-height: none !important;
  }
  .m_modal--footer {
    display: none;
  }
}
</style>
