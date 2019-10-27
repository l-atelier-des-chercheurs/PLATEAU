
<template>
  <div class="m_compositioneditor">
    <div class="m_compositioneditor--topbar padding-small">
      <template v-if="!show_rename_field">
        <span class="m_compositioneditor--topbar--title padding-verysmall">{{ media.name }}</span>
      </template>
      <template v-else>
        <form class="padding-verysmall" v-on:submit.prevent="renameComposition()">
          <div class="input-group">
            <span class="input-addon input-addon-xs">Nom</span>
            <input type="text" ref="nameInput" class="input-xs" v-model="new_name" required />
            <button
              type="submit"
              class="button-small border-circled button-thin padding-verysmall margin-none bg-transparent"
            >{{ $t('save') }}</button>
          </div>
        </form>
      </template>
      <span class="m_compositioneditor--topbar--buttons" v-if="!show_rename_field">
        <button
          type="button"
          class="button-small border-circled button-thin padding-verysmall margin-none bg-transparent"
          @click="show_rename_field = !show_rename_field"
        >{{ $t('rename') }}</button>
        <button
          type="button"
          class="button-small border-circled button-thin padding-verysmall margin-none bg-transparent"
          @click="$emit('remove')"
        >{{ $t('remove') }}</button>
        <!-- <span>
          <label for="spellcheck">spellcheck</label>
          <input type="checkbox" v-model="spellcheck" name="spellcheck" id="spellcheck" />
        </span>-->
      </span>
    </div>

    <!-- <CollaborativeEditor
      v-model="content"
      :media_metaFileName="media.metaFileName"
      :slugFolderName="slugFolderName"
      :enable_collaboration="true"
      :media="media"
      :spellcheck="spellcheck"
      @connectionStateChanged="_connection_state => connection_state = _connection_state"
      ref="textField"
      :read_only="read_only"
    />-->
    <FabricCanvas
      :medias="sortedMedias"
      :media="media"
      :project="project"
      :slugFolderName="slugFolderName"
      :drawing_options="drawing_options"
    />
  </div>
</template>
<script>
import FabricCanvas from "./FabricCanvas.vue";

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
        select_mode: false,
        color: "#000"
      }
    };
  },

  created() {},
  mounted() {},
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
  --size-column-width: 600px;
}

.m_compositioneditor--topbar {
  border-bottom: 1px solid black;
  margin: 0 auto;
  max-width: var(--size-column-width);
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
</style>