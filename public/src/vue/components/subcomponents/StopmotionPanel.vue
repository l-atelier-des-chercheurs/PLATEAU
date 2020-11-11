<template>
  <div
    class="m_stopmotionpanel"
    :class="{ 'is--showing_video_validation': validating_video_preview }"
  >
    <div class="m_stopmotionpanel--toprowbuttons">
      <button
        type="button"
        v-if="!validating_video_preview"
        @click="cancelStopmotion"
        class="buttonLink"
      >
        <span class="text-cap font-verysmall">{{ $t("stop_stopmotion") }}</span>
      </button>

      <button
        v-if="!show_live_feed"
        type="button"
        :disabled="read_only"
        @click="removeMedia(show_previous_photo.metaFileName)"
        class="buttonLink m_stopmotionpanel--medias--single--removeMedia"
      >
        <span class>{{ $t("remove_this_image") }}</span>
      </button>
    </div>

    <div class="m_stopmotionpanel--medias" v-if="!validating_video_preview">
      <transition-group
        class="m_stopmotionpanel--medias--list"
        name="list-complete"
        ref="mediaPreviews"
      >
        <div
          v-for="media in medias"
          :key="media.metaFileName"
          @click="
            show_previous_photo = media;
            show_live_feed = false;
          "
          class
          :class="{
            'is--current_single':
              show_previous_photo.metaFileName === media.metaFileName &&
              !show_live_feed,
          }"
        >
          <MediaContent
            :context="'preview'"
            :slugFolderName="stopmotiondata.slugFolderName"
            :media="media"
            :folderType="'stopmotions'"
            :preview_size="150"
          />
        </div>
        <div
          :class="{ 'is--current_single': show_live_feed }"
          @click="
            show_previous_photo = medias[medias.length - 1];
            show_live_feed = true;
          "
          :key="'live_feed'"
        >
          <video :srcObject.prop="videoStream" autoplay />
        </div>
      </transition-group>
      <div class="m_stopmotionpanel--medias--validation">
        <div class="m_stopmotionpanel--medias--validation--fpscounter">
          <label class>{{ $t("img_per_second") }}</label>
          <select step="1" v-model.number="frameRate">
            <option>2</option>
            <option>4</option>
            <option>8</option>
            <option>15</option>
            <option>24</option>
            <option>30</option>
          </select>
        </div>

        <button
          type="button"
          class="button button-bg_rounded bg-bleuvert"
          v-if="medias.length > 0"
          @click="assembleStopmotionMedias"
          :disabled="
            validating_video_preview && frameRate === previousFrameRate
          "
        >
          <span class="text-cap padding-left-small font-verysmall">{{
            $t("create")
          }}</span>
          <img
            src="/images/i_play.svg"
            width="48"
            height="48"
            draggable="false"
          />
        </button>

        <!-- <button
          type="button"
          class="buttonLink padding-verysmall margin-none"
          :class="{ 'is--active': show_advanced_menu }"
          @mousedown.stop.prevent="
            show_advanced_menu = !show_advanced_menu;
          "
          @touchstart.stop.prevent="
            show_advanced_menu = !show_advanced_menu;
          "
        >{{ $t('advanced_options') }}</button>-->
      </div>
    </div>

    <div v-else class="m_stopmotionpanel--videopreview" ref="videoPreview">
      <MediaContent
        :context="'full'"
        :slugFolderName="slugFolderName"
        :folderType="type"
        :media="validating_video_preview"
      />
    </div>

    <MediaValidationButtons
      v-if="validating_video_preview"
      :read_only="read_only"
      :media_is_being_sent="media_is_being_sent"
      :cancelButtonIsBackButton="true"
      :can_add_to_fav="can_add_to_fav"
      @cancel="backToStopmotion"
      @save="save()"
      @save_and_fav="saveAndFav()"
    />

    <div class="m_stopmotionpanel--loader" v-if="media_is_being_sent">
      <span class="loader loader-xs" />
    </div>
  </div>
</template>
<script>
import MediaContent from "./MediaContent.vue";
import MediaValidationButtons from "./MediaValidationButtons.vue";

export default {
  props: {
    stopmotiondata: Object,
    slugFolderName: String,
    type: String,
    videoStream: MediaStream,
    can_add_to_fav: Boolean,
  },
  components: {
    MediaContent,
    MediaValidationButtons,
  },
  data() {
    return {
      frameRate: 4,
      previousFrameRate: 4,
      validating_video_preview: false,
      show_previous_photo: false,
      media_is_being_sent: false,
      show_live_feed: true,
      show_advanced_menu: false,
    };
  },

  created() {},
  mounted() {
    if (Object.values(this.stopmotiondata.medias).length > 0) {
      // this.show_previous_photo = Object.values(this.stopmotiondata.medias).slice(-1)[0];
    }
  },
  beforeDestroy() {},

  watch: {
    medias: function () {
      if (this.medias.length > 0) {
        if (this.show_live_feed) {
          this.show_previous_photo = this.medias[this.medias.length - 1];
          this.$nextTick(() => {
            this.$nextTick(() => {
              this.$refs.mediaPreviews.$el.scrollLeft = 1000000;
            });
          });
        }
      }
    },
    show_previous_photo: function () {
      this.$emit("new_single_image", this.show_previous_photo);
    },
    show_live_feed: function () {
      this.$emit("show_live_feed", this.show_live_feed);
    },
    validating_video_preview: function () {
      this.$emit("validating_video", this.validating_video_preview);
    },
  },
  computed: {
    medias: function () {
      if (this.stopmotiondata.hasOwnProperty("medias")) {
        return Object.values(this.stopmotiondata.medias);
      } else {
        return [];
      }
    },
  },
  methods: {
    assembleStopmotionMedias: function () {
      console.log("METHODS • StopmotionPanel: assembleStopmotionMedias");
      this.$eventHub.$on(
        "socketio.media_created_or_updated",
        this.newStopmotionVideo
      );

      const list_media_names = this.medias.map((x) => x.media_filename);

      this.$root.createMedia({
        slugFolderName: this.slugFolderName,
        type: this.type,
        rawData: list_media_names,
        additionalMeta: {
          type: "stopmotion",
          slugStopmotionName: this.stopmotiondata.slugFolderName,
          frameRate: this.frameRate,
        },
      });
      this.previousFrameRate = this.frameRate;
      this.validating_video_preview = false;
      this.media_is_being_sent = true;
    },
    newStopmotionVideo: function (mdata) {
      console.log("METHODS • StopmotionPanel: newStopmotionVideo");
      this.$eventHub.$off(
        "socketio.media_created_or_updated",
        this.newStopmotionVideo
      );
      this.validating_video_preview = mdata;
      this.media_is_being_sent = false;

      this.$nextTick(() => {
        // this.$refs.videoPreview.getElementsByTagName('video')[0].play();
      });
    },
    backToStopmotion: function () {
      console.log("METHODS • StopmotionPanel: backToStopmotion");
      this.$root.removeMedia({
        type: this.type,
        slugFolderName: this.slugFolderName,
        slugMediaName: this.validating_video_preview.metaFileName,
      });
      this.validating_video_preview = false;
    },
    cancelStopmotion: function () {
      this.$alertify
        .okBtn(this.$t("yes"))
        .cancelBtn(this.$t("cancel"))
        .confirm(
          this.$t("sure_to_cancel_stopmotion"),
          () => {
            this.show_previous_photo = false;
            this.$nextTick(() => {
              this.$emit("close");
            });
          },
          () => {}
        );
    },
    save: function () {
      this.$emit("saveMedia", this.validating_video_preview.metaFileName);
      this.show_previous_photo = false;
      this.validating_video_preview = false;

      this.$nextTick(() => {
        this.$emit("close");
      });
    },
    saveAndFav: function () {
      this.$root.editMedia({
        type: this.type,
        slugFolderName: this.slugFolderName,
        slugMediaName: this.validating_video_preview.metaFileName,
        data: {
          fav: true,
        },
      });
      this.$emit("saveMedia", this.validating_video_preview.metaFileName);

      this.show_previous_photo = false;
      this.validating_video_preview = false;

      this.$nextTick(() => {
        this.$emit("close");
      });
    },
    removeMedia: function (slugMediaName) {
      console.log("METHODS • StopmotionPanel: removeMedia");

      // get index
      const index = this.medias.findIndex(
        (m) => m.metaFileName === slugMediaName
      );
      if (index < this.medias.length - 1) {
        this.show_previous_photo = this.medias[index + 1];
      } else {
        this.show_previous_photo = false;
        this.show_live_feed = true;
      }
      this.validating_video_preview = false;

      this.$root.removeMedia({
        type: "stopmotions",
        slugFolderName: this.stopmotiondata.slugFolderName,
        slugMediaName,
      });
    },
  },
};
</script>
<style lang="scss" scoped>
.m_stopmotionpanel {
  position: relative;
  display: flex;
  // .bg-noir;
  flex-flow: column nowrap;
  flex: 0 1 auto;

  &.is--showing_video_validation {
    flex-grow: 1;
  }

  > * {
    transition: all 0.4s;
  }

  .m_stopmotionpanel--toprowbuttons {
    position: absolute;
    left: 0;
    z-index: 10;
    bottom: 100%;

    button {
      background-color: var(--c-noir);
      color: white;
    }
  }

  .m_stopmotionpanel--medias {
    // .bg-noir;
    flex: 1 1 auto;
    display: flex;
    flex-flow: row nowrap;
    max-height: 120px;
    // justify-content: flex-end;

    // .m_stopmotionpanel--medias--single {
    //   position: relative;
    //   flex: 1 1 auto;
    //   .bg-noir;

    //   .mediaContainer {
    //     position: absolute;
    //     height: 100%;
    //     width: 100%;
    //     img {
    //       height: 100%;
    //       width: 100%;
    //       margin: 0;
    //       object-fit: contain;
    //       object-position: center;
    //     }
    //   }

    //   .m_stopmotionpanel--medias--single--removeMedia {
    //     position: absolute;
    //     bottom: 0;right: 0;
    //   }
    // }

    .m_stopmotionpanel--medias--list {
      display: block;
      flex: 1 1 auto;
      position: relative;
      display: flex;
      flex-flow: row nowrap;
      align-items: center;

      overflow-x: auto;
      overflow-y: hidden;

      -webkit-overflow-scrolling: touch;
      overscroll-behavior-y: contain;
      padding: calc(var(--spacing) / 4);
      margin: calc(var(--spacing) / 4);
      scroll-behavior: smooth;

      background-color: var(--c-gris);
      border-radius: 6px;

      // .custom_scrollbar(1px, 3px, 2px, rgba(255, 255, 255, 0), #333);

      counter-reset: compteListe;

      &::before,
      &::after {
        // content: '';
        // height: 100%;
        // padding-left: 2px;
      }

      > * {
        position: relative;
        overflow: hidden;
        // background-color: @c-gris_clair;
        // border-radius: 10px;
        // height: 100px;
        width: auto;
        flex: 0 0 90px;
        margin-right: 1px;
        cursor: pointer;

        &::before {
          counter-increment: compteListe 1;
          content: counter(compteListe) " ";
          position: absolute;
          left: 0;
          top: 0;
          padding: calc(var(--spacing) / 4);
          // .c-noir;
          // .c-blanc;
          text-transform: uppercase;
          font-size: 50%;
          // font-weight: 600;
          background-color: var(--c-noir);
          color: white;
          border-radius: 0 0 0.4em 0;
          line-height: 1;
          z-index: 1;
        }

        &:last-child {
          flex-basis: 190px;

          video {
            width: 90px;
          }
          &::before {
            content: "LIVE";
            // .bg-bleuvert;
          }
          // &::after {
          //   content:'';
          //   display: block;
          //   width: 100px;
          //   height: 1px;
          // }
        }

        &.is--current_single::before {
          // .c-rouge;
          color: white;
          background-color: var(--c-rouge);
        }

        .mediaContainer {
          width: 100%;
          height: 100%;
          width: auto;
          img,
          video {
            width: 100%;
            height: 100%;
            margin: 0;
            object-fit: contain;
            background-color: var(--c-noir);
          }
        }
      }
    }

    .m_stopmotionpanel--medias--validation {
      // .bg-rouge;
      flex-shrink: 0;
      padding: calc(var(--spacing) / 4);

      display: flex;
      flex: row nowrap;
      align-items: center;

      --input-height: 2em;

      .m_stopmotionpanel--medias--validation--fpscounter {
        // .padding-sides-small;
        display: flex;
        flex-flow: row nowrap;
        align-items: center;

        select {
          margin-left: calc(var(--spacing) / 4);
          margin-left: calc(var(--spacing) / 4);
          flex: 0 0 auto;
          max-width: 50px;
          font-size: 70%;
          // .bg-noir;
        }
        label {
          margin-left: calc(var(--spacing) / 4);
          margin-left: calc(var(--spacing) / 4);
          // display: none;
          color: white;
          max-width: 80px;
          font-size: 0.6em;
        }
      }

      button {
        // width: 100%;
        // height: 100%;
        padding: 0;
        // .margin-small;
        // min-height: 0;
      }
    }
  }
  .m_stopmotionpanel--videopreview {
    position: relative;
    flex: 1 1 auto;
    overflow: hidden;

    .mediaContainer {
      position: absolute;
      height: 100%;
      width: 100%;

      display: flex;
      align-items: center;

      > * {
        width: 100%;
        height: 100%;
      }

      video {
        height: 100%;
        width: 100%;
        background-color: var(--c-noir);
      }
    }
  }

  .m_stopmotionpanel--buttons {
    flex: 0 0 auto;
    width: 100%;
    // min-height: 50px;
    color: var(--c-noir);

    > * {
      display: flex;
      flex-flow: row wrap;
      justify-content: space-between;
      align-items: center;
      padding: calc(var(--spacing) / 2);
      // .bg-noir;

      &:nth-child(1) {
      }
      &:nth-child(2) {
        border-top: 2px solid white;
        justify-content: center;
        background-color: var(--c-noir);
      }
    }

    label {
      // color: white;
    }
    input[type="number"] {
      width: 50px;
    }
  }

  .m_stopmotionpanel--loader {
    position: absolute;
    z-index: 2;
    top: 0;
    left: 0;
    bottom: 0;
    right: 0;
    background-color: rgba(255, 255, 255, 0.9);
    display: flex;
    justify-content: center;
    align-items: center;
  }
}
</style>
