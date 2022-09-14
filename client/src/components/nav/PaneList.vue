<template>
  <div
    class="_paneList"
    :class="{
      'is--mobile': $root.is_mobile_view,
    }"
  >
    <component
      :is="$root.is_mobile_view ? 'sl-drawer' : 'span'"
      label="Panneaux"
      class="_paneList2"
      placement="top"
      ref="drawer"
    >
      <SlickList
        class="_paneList--list"
        axis="x"
        v-model="project_panes"
        :useDragHandle="true"
      >
        <SlickItem
          v-for="(item, index) in project_panes"
          :index="index"
          class="_paneItem"
          :key="item.key"
        >
          <div
            class="_paneItem--button button"
            :style="`--color-active: var(--color-${item.type});`"
            @click="removePane(index)"
          >
            <div>
              <div v-handle class="_handle" />
              <span>{{ $t(item.type) }}</span>
            </div>
          </div>
        </SlickItem>
      </SlickList>
      <!-- <sl-icon name="plus-square-fill" label="Panneaux" />
      <sl-icon name="plus" label="Panneaux" /> -->
      <sl-dropdown>
        <sl-button slot="trigger" variant="default" circle>
          <sl-icon name="plus" label="Panneaux" />
        </sl-button>
        <sl-menu>
          <sl-menu-item
            v-for="pane in possible_project_panes"
            :key="pane.type"
            v-html="$t(pane.type)"
            @click="newPaneSelected(pane)"
          />
        </sl-menu>
      </sl-dropdown>
    </component>

    <!-- // TODO -->

    <sl-button
      v-if="$root.is_mobile_view"
      @click="$refs.drawer.show()"
      pill
      type="primary"
      size="small"
    >
      <sl-icon name="layout-three-columns" label="Panneaux" />
    </sl-button>
  </div>
</template>
<script>
import { SlickList, SlickItem, HandleDirective } from "vue-slicksort";

export default {
  props: {
    panes: Array,
  },
  components: {
    SlickItem,
    SlickList,
  },
  directives: { handle: HandleDirective },
  data() {
    return {
      show_panelist: false,

      project_panes: [],
      possible_project_panes: [
        {
          type: "Journal",
          pads: [],
          size: 50,
        },
        {
          type: "MediaLibrary",
          focus: false,
          focus_height: 0,
          size: 50,
        },
        {
          type: "Capture",
          mode: false,
          size: 50,
        },
        {
          type: "Team",
          size: 50,
        },
      ],
    };
  },
  created() {
    // if (this.project_panes.length === 0)
    //   this.project_panes = this.default_project_panes.slice();
  },
  mounted() {},
  beforeDestroy() {},
  watch: {
    panes: {
      handler() {
        this.project_panes = this.panes.slice();
      },
      deep: true,
      immediate: true,
    },
    project_panes: {
      handler() {
        if (JSON.stringify(this.project_panes) === JSON.stringify(this.panes))
          return false;

        // if a pane is enabled its size cant be set to 0
        this.project_panes = this.project_panes.map((p) => {
          if (p.size === 0) p.size = 20;
          return p;
        });

        this.$emit("update:panes", this.project_panes);
      },
      deep: true,
    },
    "$root.is_mobile_view"() {
      if (this.$root.is_mobile_view) {
        // this.project_panes.map()
      }
    },
  },
  computed: {},
  methods: {
    newPaneSelected(pane) {
      // $evt.detail.item.value;
      pane.key = (Math.random().toString(36) + "00000000000000000").slice(2, 5);
      this.project_panes.push(pane);
    },
    removePane(index) {
      this.project_panes.splice(index, 1);
    },
  },
};
</script>
<style lang="scss">
._paneList {
  ._paneList2 {
    display: flex;
    flex-flow: row wrap;
    justify-content: flex-end;
  }

  &.is--mobile {
    ._paneList--list {
      // flex-flow: row;
      align-items: center;
      flex-flow: column nowrap;
    }
  }
}

._paneList--list {
  // flex-basis: 300px;

  height: auto;
  display: flex;
  flex-flow: row wrap;
  justify-content: flex-end;
  // justify-content: flex-end;
  white-space: nowrap;

  overflow: auto;

  > * {
    flex: 0 0 auto;
    margin-right: calc(var(--spacing) / 2);
    margin-top: calc(var(--spacing) / 4);
    margin-bottom: calc(var(--spacing) / 4);

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

._paneItem--button {
  display: flex;
  flex-flow: row nowrap;
  align-items: center;
  text-decoration: none;
  cursor: pointer;
  padding: 0;
  text-decoration: none;
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

  div {
    // background-color: #ccc;
    // border-color: var(--color-active);
    // border-color: black;
    background: var(--color-active);
  }
}

._handle {
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
