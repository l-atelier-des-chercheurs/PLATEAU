<template>
  <div
    class="m_media"
    :class="{
      'is--inWriteUp': is_media_in_publi,
      'is--fav': media.fav,
      'is--ownMedia': media_made_by_current_author,
      'is--draggable_to_writeup':
        true ||
        $root.settings.current_writeup_media_metaFileName ||
        $root.settings.current_planning_media_metaFileName ||
        $root.settings.current_composition_media_metaFileName,
      'is--dragged': is_dragged
    }"
    @dragstart="startMediaDrag(media, $event)"
    @dragend="endMediaDrag()"
    :draggable="
      true ||
        $root.settings.current_writeup_media_metaFileName ||
        $root.settings.current_planning_media_metaFileName ||
        $root.settings.current_composition_media_metaFileName
    "
  >
    <div draggable="false">
      <figure
        @click.stop="toggleMediaModal()"
        @mouseover="is_hovered = true"
        @mouseleave="is_hovered = false"
        :class="{ 'is--hovered': is_hovered }"
      >
        <div>
          <MediaContent
            v-model="media.content"
            :context="'preview'"
            :slugFolderName="slugProjectName"
            :media="media"
            :element_width_for_sizes="200"
            :preview_size="preview_size"
          />
          <figcaption class="m_media--caption" v-if="!!media.caption">
            {{ media.caption }}
          </figcaption>
          <div class="m_media--date">
            {{
              $moment(media.date_uploaded, "YYYY-MM-DD HH:mm:ss").format(
                "HH:mm"
              )
            }}
          </div>
        </div>

        <figcaption v-if="is_hovered && false">
          <div class="m_metaField" v-if="!!media.type">
            <div>{{ $t("type") }}</div>
            <div>{{ $t(media.type) }}</div>
          </div>
          <div class="m_metaField" v-if="!!media.authors">
            <div>{{ $t("author") }}</div>
            <div>{{ media.authors }}</div>
          </div>
          <div class="m_metaField">
            <div>{{ $t("created") }}</div>
            <div>{{ $root.formatDateToHuman(media.date_created) }}</div>
          </div>
          <div class="m_metaField">
            <div>{{ $t("edited") }}</div>
            <div>{{ $root.formatDateToHuman(media.date_modified) }}</div>
          </div>
        </figcaption>
        <!-- <nav>
          <button 
            type="button" 
            class="button-redthin "
            @click.stop="toggleMediaModal()"
          >
            {{ $t('open') }}
          </button>
        </nav>-->
      </figure>
    </div>
  </div>
</template>
<script>
import MediaContent from "./MediaContent.vue";
import { setTimeout } from "timers";

export default {
  props: {
    media: Object,
    slugProjectName: String,
    metaFileName: String,
    preview_size: Number
  },
  components: {
    MediaContent
  },
  data() {
    return {
      is_hovered: false,
      is_dragged: false,
      mediaTypeIcon: {
        image: "/images/i_icone-dodoc_image.svg",
        video: "/images/i_icone-dodoc_video.svg",
        stopmotion: "/images/i_icone-dodoc_anim.svg",
        audio: "/images/i_icone-dodoc_audio.svg"
      }
    };
  },

  created() {},
  mounted() {},
  beforeDestroy() {},
  watch: {},
  computed: {
    is_media_in_publi() {
      if (this.$root.settings.medias_present_in_writeup.length === 0) {
        return false;
      }
      return (
        this.$root.settings.medias_present_in_writeup.findIndex(
          s => s === this.metaFileName
        ) > -1
      );

      // if(this.$root.settings.current_publication.slug) {
      //   if(this.$root.store.publications.hasOwnProperty(this.$root.settings.current_publication.slug)) {
      //     const currentPubli = this.$root.store.publications[this.$root.settings.current_publication.slug];
      //     if(currentPubli.hasOwnProperty('medias') && Object.keys(currentPubli.medias).length > 0) {
      //       const media_in_publi = Object.values(currentPubli.medias).filter(s => s.slugMediaName === this.metaFileName);
      //       if(media_in_publi.length > 0) {
      //         this.media_is_in_current_publi = true;
      //       } else {
      //         this.media_is_in_current_publi = false;
      //       }
      //     }
      //   }
      // }
    },
    instructions_depending_on_media_in_publi() {
      if (this.is_media_in_publi) {
        return this.$t("add_to_recipe");
      }
      return this.$t("add_to_recipe");
    },
    media_made_by_current_author() {
      if (!this.media.authors || typeof this.media.authors !== "object") {
        return false;
      }
      if (!this.$root.settings.current_author) {
        return false;
      }
      return (
        this.media.authors.filter(
          a => a.name === this.$root.settings.current_author.name
        ).length > 0
      );
    }
  },
  methods: {
    toggleMediaModal() {
      if (this.$root.state.dev_mode === "debug") {
        console.log(
          `METHODS • MediaCard: toggleMediaModal = ${this.metaFileName}`
        );
      }
      this.$eventHub.$emit("library.toggleMedia", this.metaFileName);
    },
    addToCurrentWriteup() {
      if (this.$root.state.dev_mode === "debug") {
        console.log("METHODS • MediaCard: addToCurrentWriteup");
      }
      this.$eventHub.$emit("writeup.addMedia", this.media);
    },
    startMediaDrag(media, $event) {
      console.log(`METHODS • MediaCard / startMediaDrag`);

      $event.dataTransfer.setData("text/plain", JSON.stringify(media));
      $event.dataTransfer.effectAllowed = "move";

      this.is_dragged = true;

      this.$root.settings.media_being_dragged = media.metaFileName;
    },
    endMediaDrag() {
      console.log(`METHODS • MediaCard / endMediaDrag`);
      setTimeout(() => {
        this.is_dragged = false;
        this.$root.settings.media_being_dragged = false;
      }, 500);
    }
  }
};
</script>
<style lang="scss">
.m_media {
  position: relative;
  background-color: rgba(193, 154, 0, 0.4);
  background-color: rgba(255, 255, 255, 0.2);
  border-radius: 4px;
  /* border: 2px solid black; */
  // width: var(--media-width);
  // height: var(--media-width);

  // transition: all 1s cubic-bezier(0.19, 1, 0.22, 1);

  &:hover {
    background-color: rgba(255, 255, 255, 0.4);
  }

  &::after {
    content: "";
    position: absolute;
    bottom: 0;
    right: 0;
    width: 5px;
    height: 5px;
    margin: 5px;

    background-color: #000;
    border-radius: 50%;
    opacity: 0;
    transition: all 0.4s cubic-bezier(0.19, 1, 0.22, 1);
  }

  &.is--inWriteUp {
    &::after {
      opacity: 1;
    }
  }

  &.is--inMediaFocus {
    border: 1px solid black;
  }

  &.is--draggable_to_writeup {
    // border: 4px dotted rgba(255, 255, 255, 0.5);
    box-shadow: 0 2px 5px rgba(0, 0, 0, 0.2);

    .mediaContainer {
      cursor: -webkit-grab;
      cursor: -moz-grab;
    }
  }

  &.is--dragged {
    opacity: 0.4;
  }

  .mediaContainer {
    position: relative;
    cursor: pointer;
    // width: var(--media-width);
    // height: var(--media-width);

    > * {
      position: absolute;
      width: 100%;
      height: 100%;
      margin: 0;
      padding: 0;
      object-fit: scale-down;
      object-position: 50% 48%;
    }

    &::after {
      content: "";
      display: block;
      width: 100%;
      height: 0;
      padding-bottom: 100%;
    }

    // > img {
    //   width: 100%;
    //   height: 100%;
    //   object-fit: scale-down;
    //   object-position: center center;
    // }
    .play_picto {
      display: block;
      display: flex;
      justify-content: center;
      align-items: center;

      svg {
        width: 20px;
        height: 20px;
        padding: 4px;

        // box-shadow: 0 3px 6px rgba(0,0,0,0.16), 0 3px 6px rgba(0,0,0,0.23);
        background-color: rgba(31, 31, 31, 1);
        fill: #f9ca00;
        border-radius: 10px;
      }
    }
  }
}

.m_media--caption {
  font-size: 70%;
  padding: 0 calc(var(--spacing) / 4);
}
.m_media--date {
  font-size: 70%;
  font-weight: bold;
  padding: 0 calc(var(--spacing) / 4);
}
</style>
