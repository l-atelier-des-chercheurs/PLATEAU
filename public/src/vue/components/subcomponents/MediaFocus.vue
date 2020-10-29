<template>
  <div
    class="m_library--mediaFocus"
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

    <div>
      <MediaField
        :value="media.caption"
        :show_edit_button="true"
        :add_instructions="$t('add_caption')"
        :edit_instructions="$t('edit_caption')"
        :read_only="false"
        :plain_text="true"
        @updateField="(value) => updateMediaPubliMeta({ caption: value })"
      />
    </div>

    <div class="m_library--mediaFocus--buttons">
      <a
        class="button"
        :download="media.media_filename"
        :href="mediaFocusDownloadURL"
        target="_blank"
        >{{ $t("télécharger") }}</a
      >
      <button type="button" @click="removeMedia(show_media_detail_for)">
        {{ $t("supprimer") }}
      </button>
      <button type="button" @click="toggleMediaModal()">
        {{ $t("fermer") }}
      </button>
      <button type="button" @click="$emit('prevMedia')">←</button>
      <button type="button" @click="$emit('nextMedia')">→</button>
    </div>
  </div>
</template>
<script>
import MediaContent from "./MediaContent.vue";
import MediaField from "./MediaField.vue";

export default {
  props: {
    show_media_detail_for: String,
    slugProjectName: String,
    media: Object,
  },
  components: {
    MediaContent,
    MediaField,
  },
  data() {
    return {
      edit_caption: false,
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
<style lang="scss" scoped></style>
