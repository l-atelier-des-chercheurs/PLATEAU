<template>
  <div class="_mediaLibrary">
    <splitpanes horizontal :dbl-click-splitter="false" @resized="resized">
      <pane
        min-size="5"
        class="_mediaLibrary--lib"
        ref="topLib"
        :size="libpanes && libpanes[0]"
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
          <div v-for="file of medias" :key="file.slug" class="_mediaTile">
            <MediaContent :file="file" :project_slug="project.slug" />
            <button
              type="button"
              class="_focusMediaBtn"
              @click="toggleMediaFocus(file.slug)"
            />
          </div>
        </div>
      </pane>
      <pane
        min-size="5"
        class="_mediaLibrary--focusPane"
        ref="bottomLib"
        :size="focus_pane_size"
      >
        <transition name="fade_fast" mode="out-in">
          <div v-if="focused_media">
            <sl-button-group>
              <sl-button size="small" @click="removeMedia(focused_media.slug)"
                >Supprimer</sl-button
              >
            </sl-button-group>
            <MediaContent
              :key="focused_media.slug"
              :file="focused_media"
              :project_slug="project.slug"
              :resolution="1600"
            />
          </div>
        </transition>
      </pane>
    </splitpanes>
  </div>
</template>
<script>
import { Splitpanes, Pane } from "splitpanes";

import UploadFiles from "@/components/fields/UploadFiles";
import MediaContent from "@/components/MediaContent.vue";

export default {
  props: {
    project: Object,
    libpanes: Array,
    media_focused: String,
  },
  components: {
    Splitpanes,
    Pane,

    UploadFiles,
    MediaContent,
  },
  data() {
    return {
      selected_files: [],

      show_create_link_field: false,
      url_to: "https://latelier-des-chercheurs.fr/",
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
    focus_pane_size() {
      return this.libpanes && this.libpanes[1];
    },
  },
  methods: {
    updateInputFiles($event) {
      this.selected_files = Array.from($event.target.files);
      $event.target.value = "";
    },
    mediaJustImported(list_of_added_metas) {
      this.$alertify
        .closeLogOnClick(true)
        .delay(4000)
        .success(list_of_added_metas);
      this.selected_files = [];
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
    },

    toggleMediaFocus(slug) {
      if (this.media_focused === slug) {
        this.$emit("update:media_focused", null);
        this.resized([{ size: 100 }, { size: 0 }]);
      } else {
        this.$emit("update:media_focused", slug);
        this.resized([{ size: 50 }, { size: 50 }]);
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
}

._mediaLibrary--lib--grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(100px, 1fr));
  // gap: calc(var(--spacing) / 2);
  // padding: calc(var(--spacing) / 2);
  gap: 1px;
  padding: 1px;

  ._mediaTile {
    position: relative;
    aspect-ratio: 1/1;

    ::v-deep {
      img {
        position: absolute;
        width: 100%;
        height: 100%;
        object-fit: cover;
        max-width: none;
      }
    }
  }

  ._focusMediaBtn {
    appearance: none;
    position: absolute;
    inset: 0;
    width: 100%;
    background: transparent;
    &:hover {
      background: rgba(255, 255, 255, 0.35);
    }
  }
}

._mediaLibrary--focusPane {
  position: relative;
  ::v-deep {
    ._mediaContent {
      position: absolute;
      width: 100%;
      height: 100%;

      img {
        position: absolute;
        width: 100%;
        height: 100%;

        object-fit: contain;
        max-width: none;
      }
    }
  }
}
</style>
