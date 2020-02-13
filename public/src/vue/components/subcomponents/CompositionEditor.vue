<template>
  <div class="m_compositioneditor">
    <div class="m_compositioneditor--topbar" v-if="!$root.settings.is_slave">
      <button type="button" @click="$emit('back')">← retour</button>

      <template v-if="!show_rename_field">
        <span class="m_compositioneditor--topbar--title padding-verysmall">
          {{ media.name }}
        </span>
      </template>
      <template v-else>
        <form
          class="padding-verysmall"
          v-on:submit.prevent="renameComposition()"
        >
          <div class="input-group">
            <span class="input-addon input-addon-xs">Nom</span>
            <input
              type="text"
              ref="nameInput"
              class="input-xs"
              v-model="new_name"
              required
            />
            <button
              type="submit"
              class="button-small border-circled button-thin padding-verysmall margin-none bg-transparent"
            >
              {{ $t("save") }}
            </button>
          </div>
        </form>
      </template>
      <span
        class="m_compositioneditor--topbar--buttons"
        v-if="!show_rename_field"
      >
        <button
          type="button"
          class="button-small border-circled button-thin padding-verysmall margin-none bg-transparent"
          @click="show_rename_field = !show_rename_field"
        >
          {{ $t("rename") }}
        </button>
        <button
          type="button"
          class="button-small border-circled button-thin padding-verysmall margin-none bg-transparent"
          @click="$emit('remove')"
        >
          {{ $t("remove") }}
        </button>
        <!-- <span>
          <label for="spellcheck">spellcheck</label>
          <input type="checkbox" v-model="spellcheck" name="spellcheck" id="spellcheck" />
        </span>-->
      </span>
    </div>

    <div class="m_encart" ref="encart">
      <fieldset v-if="!$root.settings.is_slave">
        <legend>Mode</legend>
        <div v-for="mode in ['select', 'drawing']" :key="mode">
          <input
            type="radio"
            :id="mode"
            :name="mode"
            :value="mode"
            v-model="drawing_options.mode"
          />
          <label :for="mode">
            <span>{{ mode }}</span>
          </label>
        </div>
      </fieldset>

      <fieldset v-if="!$root.settings.is_slave">
        <legend>Options</legend>
        <label>
          <input type="color" v-model="drawing_options.color" />
          Couleur
        </label>
        <br />
        <label>
          <input type="color" v-model="drawing_options.background_color" />
          Couleur du fond
        </label>
      </fieldset>
    </div>

    <div class="m_compositioneditor--canvas">
      <FabricCanvas
        :media="media"
        :slugFolderName="slugFolderName"
        :drawing_options="drawing_options"
      />
    </div>
  </div>
</template>
<script>
import FabricCanvas from "./FabricCanvas.vue";
import Draggabilly from "draggabilly";

export default {
  props: {
    slugFolderName: String,
    media: Object,
    read_only: {
      type: Boolean,
      default: true
    }
  },
  components: {
    FabricCanvas
  },
  data() {
    return {
      content: this.media.content,
      connection_state: "",
      show_rename_field: false,
      new_name: this.media.name,
      spellcheck: true,

      drawing_options: {
        width: 4,
        mode: "select",
        color: "#000000",
        background_color: "#ffffff"
      }
    };
  },

  created() {},
  mounted() {
    new Draggabilly(this.$refs.encart, {
      containment: true
    });
  },
  beforeDestroy() {},

  watch: {
    content: function() {}
  },
  computed: {
    hasAnyChangesBeenMadeToContent() {
      if (this.media.content.length !== this.content.length) {
        return true;
      } else if (this.media.content !== this.content) {
        return true;
      }
      return false;
    }
  },
  methods: {
    textChange(delta, oldDelta, source) {
      // if source === 'user'
    },
    renameComposition() {
      if (this.new_name === "") {
      }

      this.$root.editMedia({
        type: "projects",
        slugFolderName: this.slugFolderName,
        slugMediaName: this.media.metaFileName,
        data: {
          name: this.new_name
        }
      });

      this.show_rename_field = false;
    }
  }
};
</script>
<style>
.quillWrapper .ql-toolbar {
  /* padding-left: 1em; */
}

.m_compositioneditor {
  margin: 0 auto;
  height: 100%;
  --size-column-width: 600px;
}

.m_compositioneditor--topbar {
  border-bottom: 1px solid black;
  margin: 0 auto;
  /* max-width: var(--size-column-width); */
  /* padding: calc(var(--size-skipline) / 2) calc(var(--size-skipline)); */
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.m_compositioneditor--topbar--title {
  display: block;
  flex-grow: 0;
  font-size: 1.4em;
}
.m_compositioneditor--topbar--buttons {
  /* text-align: right; */
  float: right;
}

.m_encart {
  position: absolute;
  z-index: 1;
  border: 1px solid black;
  background-color: white;
  top: 10%;
  left: 10%;
  cursor: move;

  padding: calc(var(--spacing) / 2);
}

.m_compositioneditor--canvas {
  height: 100%;
  padding: var(--spacing);
  overflow: auto;
}
</style>
