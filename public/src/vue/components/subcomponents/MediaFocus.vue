<template>
  <div
    class="m_mediaFocus"
    @dragstart="startMediaDrag(media, $event)"
    @dragend="endMediaDrag()"
    :draggable="
      true ||
      !!$root.settings.current_writeup_media_metaFileName ||
      !!$root.settings.current_planning_media_metaFileName ||
      $root.settings.current_composition_media_metaFileName
    "
  >
    <MediaContent
      :context="'full'"
      :slugFolderName="slugProjectName"
      :media="media"
    />

    <div class="m_mediaFocus--toprightButtons">
      <button
        type="button"
        class="m_favButton"
        @click="toggleFav"
        :class="{ 'is--active': media.fav }"
      >
        <svg
          version="1.1"
          class="inline-svg"
          xmlns="http://www.w3.org/2000/svg"
          xmlns:xlink="http://www.w3.org/1999/xlink"
          xmlns:a="http://ns.adobe.com/AdobeSVGViewerExtensions/3.0/"
          x="0px"
          y="0px"
          width="78.5px"
          height="106.4px"
          viewBox="0 0 78.5 106.4"
          style="enable-background: new 0 0 78.5 106.4"
          xml:space="preserve"
        >
          <polygon
            class="st0"
            points="60.4,29.7 78.5,7.3 78.5,7.3 12.7,7.3 12.7,52 78.5,52 78.5,52 	"
          />
          <polygon class="st0" points="9.6,106.4 0,106.4 0,2 9.6,0 " />
        </svg>
      </button>

      <button
        type="button"
        class="_fsButtons"
        @click="enterFullscreen"
        v-if="!is_fullscreen"
      >
        <svg
          width="18px"
          height="18px"
          viewBox="0 0 18 18"
          xmlns="http://www.w3.org/2000/svg"
        >
          <polygon
            points="10 3 13.6 3 9.6 7 11 8.4 15 4.4 15 8 17 8 17 1 10 1"
          ></polygon>
          <polygon
            points="7 9.6 3 13.6 3 10 1 10 1 17 8 17 8 15 4.4 15 8.4 11"
          ></polygon>
        </svg>
      </button>
      <button
        type="button"
        class="_fsButtons"
        @click="exitFullscreen"
        v-if="is_fullscreen"
      >
        <svg
          width="18px"
          height="18px"
          viewBox="0 0 18 18"
          xmlns="http://www.w3.org/2000/svg"
        >
          <polygon
            points="1 12 4.6 12 0.6 16 2 17.4 6 13.4 6 17 8 17 8 10 1 10"
          ></polygon>
          <polygon
            points="16 0.6 12 4.6 12 1 10 1 10 8 17 8 17 6 13.4 6 17.4 2"
          ></polygon>
        </svg>
      </button>
    </div>

    <div class="m_mediaFocus--options">
      <div class="margin-bottom-small m_mediaFocus--options--caption">
        <label>{{ $t("caption") }}</label>
        <MediaField
          class="_caption"
          :value="media.caption"
          :show_edit_button="true"
          :add_instructions="$t('add_caption')"
          :edit_instructions="$t('edit_caption')"
          :read_only="false"
          :plain_text="true"
          @updateField="(value) => updateMediaPubliMeta({ caption: value })"
        />
      </div>

      <div class="margin-bottom-small m_mediaFocus--options--keywords">
        <label>{{ $t("keywords") }}</label>
        <TagsInput
          :keywords="media.keywords"
          :read_only="false"
          @tagsChanged="
            (newTags) => updateMediaPubliMeta({ keywords: newTags })
          "
        />
      </div>

      <div class="m_mediaFocus--buttons">
        <a
          class="button"
          :download="media.media_filename"
          :href="mediaFocusDownloadURL"
          target="_blank"
          >{{ $t("download") }}</a
        >
        <button type="button" @click="removeMedia(show_media_detail_for)">
          {{ $t("remove") }}
        </button>
        <button type="button" @click="toggleMediaModal()">
          {{ $t("close") }}
        </button>
        <button type="button" @click="$emit('prevMedia')">←</button>
        <button type="button" @click="$emit('nextMedia')">→</button>
      </div>
    </div>
  </div>
</template>
<script>
import MediaContent from "./MediaContent.vue";
import MediaField from "./MediaField.vue";
import TagsInput from "./TagsInput.vue";

export default {
  props: {
    show_media_detail_for: String,
    slugProjectName: String,
    media: Object,
  },
  components: {
    MediaContent,
    MediaField,
    TagsInput,
  },
  data() {
    return {
      edit_caption: false,
      is_fullscreen: false,
    };
  },
  created() {},
  mounted() {},
  beforeDestroy() {},
  watch: {},
  computed: {
    mediaFocusDownloadURL() {
      return `/${this.slugProjectName}/${this.media.media_filename}`;
    },
  },
  methods: {
    toggleMediaModal() {
      if (this.$root.state.dev_mode === "debug") {
        console.log(
          `METHODS • MediaFocus: toggleMediaModal = ${this.metaFileName}`
        );
      }
      this.$eventHub.$emit("library.toggleMedia", false);
    },
    toggleFav() {
      let fav = true;
      if (this.media.fav) {
        fav = false;
      }

      this.$root.editMedia({
        type: "projects",
        slugFolderName: this.slugProjectName,
        slugMediaName: this.media.metaFileName,
        data: {
          fav,
        },
      });
    },
    startMediaDrag(media, $event) {
      console.log(`METHODS • MediaLibrary / startMediaDrag`);

      $event.dataTransfer.setData("text/plain", JSON.stringify(media));
      $event.dataTransfer.effectAllowed = "move";

      // this.media_focus_is_dragged = true;

      this.$root.settings.media_being_dragged = media.metaFileName;
    },
    endMediaDrag() {
      console.log(`METHODS • MediaLibrary / endMediaDrag`);
      setTimeout(() => {
        // this.media_focus_is_dragged = false;
        this.$root.settings.media_being_dragged = false;
      }, 500);
    },
    enterFullscreen() {
      let elem = this.$el;
      elem
        .requestFullscreen()
        .then(() => {
          this.is_fullscreen = true;
        })
        .catch((err) => {
          alert(
            `Error attempting to enable full-screen mode: ${err.message} (${err.name})`
          );
        });
    },
    exitFullscreen() {
      window.document.exitFullscreen();
      this.is_fullscreen = false;
    },
    updateMediaPubliMeta(val) {
      this.$root
        .editMedia({
          type: "projects",
          slugFolderName: this.slugProjectName,
          slugMediaName: this.media.metaFileName,
          data: val,
        })
        .then((mdata) => {
          this.$eventHub.$emit("projects.media_just_edited", mdata);
        });
    },
    removeMedia(metaFileName) {
      if (window.state.dev_mode === "debug") {
        console.log(`METHODS • WriteUp: removeMedia / ${metaFileName}`);
      }

      this.$alertify
        .okBtn(this.$t("yes"))
        .cancelBtn(this.$t("cancel"))
        .confirm(
          this.$t("sureToRemoveMedia"),
          () => {
            this.show_media_detail_for = false;

            this.$root.removeMedia({
              type: "projects",
              slugFolderName: this.slugProjectName,
              slugMediaName: metaFileName,
            });
          },
          () => {}
        );
    },
  },
};
</script>
<style lang="scss">
.m_mediaFocus {
  width: 100%;
  height: 100%;

  display: flex;
  flex-flow: column nowrap;
  overflow: auto;

  // box-shadow: 0 10px 23px rgba(0, 0, 0, 0.4);
  // background-color: rgba(51, 51, 51, 0);
  background-color: var(--c-orange);

  .mediaContainer {
    position: relative;
    flex: 1 0 150px;

    // background: linear-gradient(var(--c-noir), transparent);

    > * {
      position: absolute;
      width: 100%;
      height: 100%;
      object-fit: contain;
      object-position: center;
    }
  }
  .m_mediaFocus--options {
    button {
      // padding: 0;
    }

    .m_mediaFocus--options--caption {
      ._caption {
        padding: 0 calc(var(--spacing) / 2);
        // background-color: rgba(51, 51, 51, 0.2);

        // padding: 0 calc(var(--spacing) / 2);
        background-color: rgba(255, 255, 255, 0.2);

        font-size: 70%;
      }
    }

    > * {
      margin: 0 calc(var(--spacing) / 1);
      // padding: calc(var(--spacing) / 2) 0;
      background-color: var(--c-orange);

      &:not(:last-child) {
        border-bottom: 1px solid black;
      }
    }
  }

  .m_mediaFocus--buttons {
    flex: 0 0 auto;

    position: relative;
    z-index: 1;
    padding: 0 calc(var(--spacing) / 2);
    pointer-events: none;

    display: flex;
    justify-content: flex-end;
    align-items: flex-end;

    > * {
      pointer-events: auto;
    }

    button,
    a {
      text-decoration: none;
    }
  }
}

.m_mediaFocus--toprightButtons {
  position: absolute;
  top: 0;
  right: 0;

  display: flex;

  button {
    display: block;
    line-height: 0;
    margin: calc(var(--spacing) / 4);
    padding: calc(var(--spacing) / 2);
  }

  ._fsButtons {
    border-radius: 4px;
    &:hover {
      background-color: rgba(0, 0, 0, 0.1);
      fill: white;
    }
  }
}

.m_mediaFocus--options--keywords {
  display: flex;
  padding: calc(var(--spacing) / 4) 0;

  label {
    margin-right: calc(var(--spacing) / 2);
  }

  .m_keywordField > * {
    margin-top: calc(var(--spacing) / 4) !important;
  }
}
</style>
