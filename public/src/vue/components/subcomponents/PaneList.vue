<template>
  <SlickList
    class="m_slicklist"
    axis="x"
    v-model="$root.settings.project_active_panes_in_order"
    :useDragHandle="true"
  >
    <SlickItem
      v-for="(item, index) in $root.settings.project_active_panes_in_order"
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
    return {
      items: [
        "Item 1",
        "Item 2",
        "Item 3",
        "Item 4",
        "Item 5",
        "Item 6",
        "Item 7",
        "Item 8"
      ]
    };
  },
  created() {},
  mounted() {},
  beforeDestroy() {},
  watch: {},
  computed: {},
  methods: {}
};
</script>
<style lang="scss" scoped>
.m_slicklist {
  width: 500px;
  height: auto;
  display: flex;
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
    border-bottom: 1px solid #efefef;

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

  > div {
    display: flex;
    align-items: center;
    background-color: #fff;
    // color: white;
    padding: 0 var(--spacing);
    border-radius: 1em;
    height: 2em;
    transition: all 0.4s ease-out;

    span {
      text-decoration: none;
      margin-bottom: 0.2em;
    }
  }

  > input {
    flex: 0 0 auto;
    margin-right: calc(var(--spacing) / 2);
    position: absolute;
    top: -20px;
    opacity: 0;

    &:checked + div {
      background-color: #ccc;
    }
  }
}

.handle {
  position: relative;
  display: block;
  width: 18px;
  height: 18px;
  border: 4px solid transparent;
  border-radius: 9px;
  background-color: var(--color-active);
  margin-right: 10px;
  cursor: col-resize;
  transform: rotate(90deg);

  &::before {
    content: "";
    display: block;
    position: absolute;
    width: 100%;
    height: 100%;
    background-image: url('data:image/svg+xml;charset=utf-8,<svg xmlns="http://www.w3.org/2000/svg" width="50" height="50" viewBox="0 0 50 50"><path d="M0 7.5v5h50v-5H0zm0 15v5h50v-5H0zm0 15v5h50v-5H0z" color="%23000"/></svg>');
    background-size: contain;
    background-repeat: no-repeat;
  }
}
</style>
