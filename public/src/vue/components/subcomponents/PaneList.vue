<template>
  <SlickList
    class="m_slicklist"
    axis="x"
    v-model="$root.settings.project_panes_in_order"
    :useDragHandle="true"
    @sort-end="sortEnded"
  >
    <SlickItem
      v-for="(item, index) in $root.settings.project_panes_in_order"
      :index="index"
      :key="item.key"
    >
      <label
        :for="`enable_pane_for_${item.key}`"
        class="m_slicklist--button button"
        :data-correspondingpane="item.key"
        :disabled="!item.enabled"
        :style="`--color-active: var(--color-${item.key});`"
      >
        <input type="checkbox" :id="`enable_pane_for_${item.key}`" v-model="item.enabled" />
        <div>
          <div v-handle v-if="item.enabled" class="handle" />
          <span>{{ $t(item.key) }}</span>
        </div>
      </label>
    </SlickItem>
  </SlickList>
</template>
<script>
import { SlickList, SlickItem, HandleDirective } from "vue-slicksort";

export default {
  props: {},
  components: {
    SlickItem,
    SlickList
  },
  directives: { handle: HandleDirective },
  data() {
    return {};
  },
  created() {},
  mounted() {},
  beforeDestroy() {},
  watch: {},
  computed: {},
  methods: {
    sortEnded({ event, newIndex, oldIndex, collection }) {
      if (newIndex !== oldIndex) {
        this.$eventHub.$emit("project.refresh_panes_order");
      }
    }
  }
};
</script>
<style lang="scss">
.m_slicklist {
  width: 500px;
  height: auto;
  display: flex;
  flex-flow: row wrap;
  justify-content: flex-end;
  white-space: nowrap;

  > * {
    flex: 0 0 auto;
    margin-right: var(--spacing);

    display: -webkit-box;
    display: -ms-flexbox;
    display: flex;
    align-items: center;
    // width: 100%;

    background-color: #fff;
    // border-bottom: 1px solid #efefef;

    user-select: none;

    transition: all 0.4s;
  }
}

.m_slicklist--button {
  display: flex;
  flex-flow: row nowrap;
  align-items: center;
  text-decoration: none;
  cursor: pointer;
  // overrided by pane type color
  --color-active: #ccc;
  --height-panebutton: 32px;

  &[disabled] {
    cursor: pointer !important;
  }

  > div {
    display: flex;
    align-items: center;
    background-color: #fff;
    // color: white;
    padding: 0 var(--spacing);
    border-radius: calc(var(--height-panebutton) / 2);
    height: var(--height-panebutton);
    transition: all 0.4s ease-out;

    span {
      text-decoration: none;
      margin-bottom: 0.2em;
    }
  }

  &[for="enable_pane_for_WriteUp"] > div {
    border: 1px solid transparent;
  }

  > input {
    flex: 0 0 auto;
    margin-right: calc(var(--spacing) / 2);
    position: absolute;
    top: -20px;
    opacity: 0;

    &:checked + div {
      // background-color: #ccc;
      // border-color: var(--color-active);
      border-color: black;
      background: var(--color-active);
    }
  }
}

.handle {
  position: relative;
  display: block;
  width: var(--height-panebutton);
  height: var(--height-panebutton);

  margin: -8px 2px -8px calc(-1 * var(--spacing));

  padding: 10px;
  border: 1px solid transparent;
  border-radius: 50%;

  cursor: col-resize;

  &::before {
    content: "";
    display: block;
    position: absolute;
    width: 10px;
    height: 10px;
    background-image: url('data:image/svg+xml;charset=utf-8,<svg xmlns="http://www.w3.org/2000/svg" width="50" height="50" viewBox="0 0 50 50"><path d="M0 7.5v5h50v-5H0zm0 15v5h50v-5H0zm0 15v5h50v-5H0z" color="%23000"/></svg>');
    background-size: contain;
    background-repeat: no-repeat;
    transform: rotate(90deg);
  }

  &:hover {
    border-color: #000;
    background-color: var(--color-active);
    ::before {
    }
  }
}
</style>
