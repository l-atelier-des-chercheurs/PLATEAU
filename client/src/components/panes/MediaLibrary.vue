<template>
  <div class="_mediaLibrary">
    <splitpanes horizontal :dbl-click-splitter="false" @resized="resized">
      <pane
        min-size="5"
        class="_mediaLibrary--lib"
        ref="topLib"
        :size="lib_pane_size"
      >
        <label for="add_file" class="_boldBtn">
          <sl-button variant="text">
            <span>importer</span>
          </sl-button>
          <input
            type="file"
            multiple="multiple"
            id="add_file"
            name="file"
            accept=""
            style="
              width: 1px;
              height: 1px;
              overflow: hidden;
              position: absolute;
              opacity: 0;
            "
            @change="updateInputFiles($event)"
          />
          <div>Importer depuis un autre appareil</div>
        </label>
        <!-- <sl-button @click="createText">Créer du texte</sl-button>
    <sl-button
      type="button"
      @click="show_create_link_field = !show_create_link_field"
    >
      Ajouter un site web
    </sl-button> -->
        <UploadFiles
          v-if="selected_files.length > 0"
          :selected_files="selected_files"
          :folder_type="'projects'"
          :folder_slug="project.slug"
          @importedMedias="mediaJustImported"
          @close="selected_files = []"
        />

        <form
          v-if="show_create_link_field"
          class="input-validation-required"
          @submit.prevent="createLink"
        >
          <input type="url" required v-model="url_to" />
          <br />
          <input type="submit" />
        </form>

        Médias = {{ medias.length }}

        <div class="_mediaLibrary--lib--grid">
          <MediaTile
            v-for="file of medias"
            :key="file.slug"
            :project_slug="project.slug"
            :file="file"
            :is_focused="media_focused === file.slug"
            @toggleMediaFocus="(slug) => toggleMediaFocus(slug)"
          />
        </div>
      </pane>
      <pane
        min-size="5"
        class="_mediaLibrary--focusPane"
        ref="bottomLib"
        :size="focus_pane_size"
      >
        <transition name="fade_fast" mode="out-in">
          <MediaFocus
            v-if="focused_media"
            :key="focused_media.slug"
            :file="focused_media"
            :project_slug="project.slug"
            @remove="removeMedia(focused_media.slug)"
            @close="toggleMediaFocus(focused_media.slug)"
          />
        </transition>
      </pane>
    </splitpanes>
  </div>
</template>
<script>
import { Splitpanes, Pane } from "splitpanes";

import MediaFocus from "@/components/MediaFocus";
import UploadFiles from "@/components/fields/UploadFiles";
import MediaTile from "@/components/MediaTile.vue";

export default {
  props: {
    project: Object,
    libpanes: Array,
    media_focused: String,
  },
  components: {
    Splitpanes,
    Pane,
    MediaTile,
    MediaFocus,
    UploadFiles,
  },
  data() {
    return {
      selected_files: [],

      show_create_link_field: false,
      url_to: "https://latelier-des-chercheurs.fr/",

      focuspane_height_when_opened: this.libpanes[1] || 50,
    };
  },
  created() {},
  mounted() {},
  beforeDestroy() {},
  watch: {},
  computed: {
    medias() {
      return this.project.files.filter((f) => !f.is_journal) || [];
    },
    focused_media() {
      return (
        this.project.files.find((f) => f.slug === this.media_focused) || false
      );
    },
    lib_pane_size() {
      return (this.libpanes && this.libpanes[0]) || 100;
    },
    focus_pane_size() {
      return (this.libpanes && this.libpanes[1]) || 0;
    },
  },
  methods: {
    updateInputFiles($event) {
      this.selected_files = Array.from($event.target.files);
      $event.target.value = "";
    },
    mediaJustImported(list_of_added_metas) {
      list_of_added_metas;
      // this.$alertify
      //   .closeLogOnClick(true)
      //   .delay(4000)
      //   .success(list_of_added_metas);
    },

    async createText() {
      const filename = "texte.txt";
      const content = "PLOP PLIP";

      const additional_meta = {
        caption: "plip",
      };

      this.$api.uploadText({ filename, content, additional_meta });
    },

    async createLink() {
      const filename = this.url_to;
      const content = this.url_to;

      const additional_meta = {
        type: "url",
      };

      this.$api.uploadText({ filename, content, additional_meta });
    },

    resized(libpanes) {
      const _libpanes = libpanes.map((l) => Number(l.size.toFixed(2)));
      this.$emit("update:libpanes", _libpanes);

      if (_libpanes[1] !== 0) this.focuspane_height_when_opened = _libpanes[1];
    },

    toggleMediaFocus(slug) {
      if (!slug || this.media_focused === slug) {
        this.$emit("update:media_focused", null);
        this.resized([{ size: 100 }, { size: 0 }]);
      } else {
        this.$emit("update:media_focused", slug);
        this.resized([
          { size: 100 - this.focuspane_height_when_opened },
          { size: this.focuspane_height_when_opened },
        ]);
      }
    },

    async removeMedia(slug) {
      await this.$api.deleteItem({
        folder_type: "projects",
        folder_slug: this.project.slug,
        meta_slug: slug,
      });
      this.toggleMediaFocus(slug);
    },
  },
};
</script>
<style lang="scss" scoped>
._mediaLibrary {
  background: var(--color-MediaLibrary);
  height: 100%;
  overflow: auto;

  --active-color: var(--c-vert);
}

._mediaLibrary--lib {
  overflow: auto;
}

._mediaLibrary--lib--grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(100px, 1fr));
  gap: 1px;
  padding: 1px;
}

._mediaLibrary--focusPane {
  // background: var(--c-bleu);
}

._focusBtns {
  position: absolute;
  top: 0;
  right: 0;
}
</style>
