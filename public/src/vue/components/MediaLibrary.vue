<template>
  <div class="m_library">
    <splitpanes horizontal watch-slots>
      <pane min-size="20" max-size="100" size="100">
        <div class="m_library--content">
          <div class="m_actionbar" v-show="$root.state.connected">
            <div class="m_actionbar--buttonBar">
              <!-- <button
                type="button"
                class="barButton barButton_capture"
                v-if="((project.password === 'has_pass') || project.password !== 'has_pass')"
                @click="openCapture"
                :disabled="read_only || is_iOS_device"
                disabled
              >
                <span>{{ $t('capture') }}</span>
              </button>-->
              <label
                v-if="
                  project.password === 'has_pass' ||
                    project.password !== 'has_pass'
                "
                :key="`add_${field.key}`"
                class
                v-for="field in input_file_fields"
                :disabled="read_only"
                :for="`add_${field.key}`"
                style="text-decoration: underline; cursor: pointer;"
              >
                <span v-html="field.label" />
                <input
                  type="file"
                  multiple
                  :id="`add_${field.key}`"
                  :name="field.key"
                  @change="updateInputFiles($event)"
                  :accept="field.accept"
                  :capture="field.capture"
                  style="width: 1px; height: 1px; overflow: hidden; position: absolute; opacity: 0;"
                />
              </label>

              <!-- <button type="button" class="barButton barButton_text" @click="createTextMedia">
          <span>{{ $t('create_text') }}</span>
              </button>-->
            </div>

            <div class="m_actionbar--text">
              {{ $t("showing") }}&nbsp;
              <span
                :class="{ 'c-rouge': sortedMedias.length !== numberOfMedias }"
              >
                {{ sortedMedias.length }}
                {{ $t("medias") }}
                <!-- {{ numberOfMedias }} -->
              </span>
              <!-- <template v-if="$root.allKeywords.length >= 0">
                &nbsp;—
                <button
                  type="button"
                  class="button-nostyle text-uc button-triangle"
                  :class="{ 'is--active' : show_filters }"
                  @click="show_filters = !show_filters"
                >{{ $t('filters') }}</button>
              </template>

              <template v-if="!show_medias_instead_of_projects && show_filters">
                <TagsAndAuthorFilters
                  :allKeywords="mediaKeywords"
                  :allAuthors="mediaAuthors"
                  :keywordFilter="$root.settings.media_filter.keyword"
                  :authorFilter="$root.settings.media_filter.author"
                  :favFilter="$root.settings.media_filter.fav"
                  @setKeywordFilter="a => $root.setMediaKeywordFilter(a)"
                  @setAuthorFilter="a => $root.setMediaAuthorFilter(a)"
                  @setFavFilter="a => $root.setFavAuthorFilter(a)"
                />
              </template>-->
            </div>
          </div>

          <transition-group tag="div" class="m_library--chronology" name="list-complete">
            <!-- <MediaCard
              v-for="media in sortedMedias"
              :key="media.slugMediaName"
              :media="media"
              :metaFileName="media.metaFileName"
              :slugProjectName="slugProjectName"
              :class="{ 'is--just_added' : last_media_added.includes(media.slugMediaName) }"
            />-->
            <div v-for="item in groupedMedias" :key="item[0]">
              <h3>{{ $root.formatDateToHuman(item[0]) }}</h3>

              <transition-group
                tag="div"
                class="m_library--chronology--medias"
                name="list-complete"
              >
                <div v-for="media in item[1]" :key="media.slugMediaName">
                  <MediaCard
                    :class="{
                      'is--inMediaFocus':
                        media.slugMediaName === show_media_detail_for
                    }"
                    :key="media.slugMediaName"
                    :media="media"
                    :metaFileName="media.metaFileName"
                    :slugProjectName="media.slugProjectName"
                    :preview_size="180"
                  ></MediaCard>
                </div>
              </transition-group>
            </div>
          </transition-group>
        </div>
      </pane>
      <pane
        v-if="show_media_detail_for"
        :key="show_media_detail_for"
        class
        min-size="20"
        max-size="70"
        size="50"
        style="position: relative;"
      >
        <div
          class="m_library--mediaFocus"
          @dragstart="startMediaDrag(mediaShownInFocus, $event)"
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
            :media="mediaShownInFocus"
            :preview_size="preview_size"
          />
          <div class="m_library--mediaFocus--buttons">
            <a
              class="button"
              :download="mediaShownInFocus.media_filename"
              :href="mediaFocusDownloadURL"
              target="_blank"
            >{{ $t("télécharger") }}</a>
            <button type="button" @click="removeMedia(show_media_detail_for)">{{ $t("supprimer") }}</button>
            <button type="button" @click="toggleMedia()">{{ $t("fermer") }}</button>
            <button type="button" @click="prevMedia">←</button>
            <button type="button" @click="nextMedia">→</button>
          </div>
        </div>
      </pane>

      <pane
        v-if="selected_files.length > 0"
        :key="'uploadfile'"
        min-size="1"
        max-size="30"
        size="10"
        style="position: relative;"
      >
        <UploadFile
          class="m_uploadFilePane"
          @close="selected_files = []"
          :read_only="read_only"
          :slugFolderName="slugProjectName"
          :type="'projects'"
          :selected_files="selected_files"
        />
      </pane>
    </splitpanes>

    <transition name="fade_fast" :duration="150">
      <div
        v-if="
          !read_only &&
            show_drop_container &&
            !$root.settings.media_being_dragged
        "
        @drop="ondrop($event)"
        class="_drop_indicator"
      >
        <div>
          <img src="/images/i_importer.svg" draggable="false" />
          <label>{{ $t("drop_here_to_import") }}</label>
        </div>
      </div>
    </transition>
  </div>
</template>
<script>
import UploadFile from "./modals/UploadFile.vue";
import MediaCard from "./subcomponents/MediaCard.vue";
import MediaContent from "./subcomponents/MediaContent.vue";
import TagsAndAuthorFilters from "./subcomponents/TagsAndAuthorFilters.vue";
import { setTimeout } from "timers";
import debounce from "debounce";
import { Splitpanes, Pane } from "splitpanes";

export default {
  props: {
    project: Object,
    slugProjectName: String,
    library_medias: Array,
    read_only: Boolean
  },
  components: {
    MediaCard,
    MediaContent,
    UploadFile,
    TagsAndAuthorFilters,
    Splitpanes,
    Pane
  },
  data() {
    return {
      mediaSort: {
        field: "date_created",
        type: "date",
        order: "descending"
      },
      selected_files: [],
      is_iOS_device:
        !!window.navigator.platform &&
        /iPad|iPhone|iPod/.test(navigator.platform),
      show_filters: false,

      show_drop_container: false,
      show_media_detail_for: false,

      last_media_added: [],
      media_focus_is_dragged: false,

      input_file_fields: [
        {
          key: "file",
          label: "Importer",
          accept: "",
          capture: false,
          svg: `
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 40 40">
              <path d="M20.89,12v4.63a1,1,0,0,0,1,1h4.63V28h-13V12h7.4m1-1H12.5V29h15V16.62H21.88V11Z" style="fill: #fff"/>
              <line x1="27" y1="17.12" x2="21.38" y2="11.5" style="fill: none;stroke: #fff;stroke-linecap: round;stroke-linejoin: round;stroke-width: 0.9900837817656861px"/>
            </svg>
          `
        }
      ]
    };
  },
  mounted() {
    if (
      this.$root.settings.media_filter.keyword ||
      this.$root.settings.media_filter.author
    ) {
      this.show_filters = true;
    }
    document.addEventListener("dragover", this.ondragover);

    this.cancelDragOver = debounce(this.cancelDragOver, 300);

    this.$eventHub.$on("library.toggleMedia", this.toggleMedia);
    this.$eventHub.$on("modal.prev_media", this.prevMedia);
    this.$eventHub.$on("modal.next_media", this.nextMedia);
    this.$eventHub.$on("socketio.media_created_or_updated", this.media_created);
  },
  created() {},
  beforeDestroy() {
    this.$root.settings.media_filter.author = false;
    this.$root.settings.media_filter.keyword = false;
    this.$root.settings.media_filter.fav = false;

    this.$eventHub.$off("library.toggleMedia", this.toggleMedia);
    this.$eventHub.$off("modal.prev_media", this.prevMedia);
    this.$eventHub.$off("modal.next_media", this.nextMedia);
    this.$eventHub.$off(
      "socketio.media_created_or_updated",
      this.media_created
    );

    document.addEventListener("dragover", this.ondragover);
  },
  watch: {},

  computed: {
    mediaShownInFocus() {
      return this.project.medias[this.show_media_detail_for];
    },
    numberOfMedias() {
      return this.library_medias.length;
    },
    mediaKeywords() {
      // grab all keywords from this.library_medias
      return this.getAllKeywordsFrom(this.library_medias);
    },
    mediaAuthors() {
      return this.$root.getAllAuthorsFrom(this.library_medias);
    },

    mediaFocusDownloadURL() {
      return `/${this.slugProjectName}/${this.mediaShownInFocus.media_filename}`;
    },

    sortedMedias() {
      var sortable = [];

      if (this.library_medias.length === 0) {
        return sortable;
      }

      this.library_medias.map(media => {
        let orderBy;

        if (this.mediaSort.type === "date") {
          if (media.hasOwnProperty(this.mediaSort.field)) {
            orderBy = +this.$moment(
              media[this.mediaSort.field],
              "YYYY-MM-DD HH:mm:ss"
            );
          }
          if (orderBy === undefined || Number.isNaN(orderBy)) {
            orderBy = 1000;
          }
        } else if (this.mediaSort.type === "alph") {
          orderBy = media[this.mediaSort.field];
          if (orderBy === undefined || Number.isNaN(orderBy)) {
            orderBy = 1000;
          }
          if (orderBy === undefined) {
            orderBy = "z";
          }
        }

        if (this.$root.isMediaShown(media)) {
          sortable.push({ slugMediaName: media.metaFileName, orderBy });
        }
      });

      let sortedSortable = sortable.sort(function(a, b) {
        let valA = a.orderBy;
        let valB = b.orderBy;
        if (typeof a.orderBy === "string" && typeof b.orderBy === "string") {
          valA = valA.toLowerCase();
          valB = valB.toLowerCase();
        }
        if (valA < valB) {
          return -1;
        }
        if (valA > valB) {
          return 1;
        }
        return 0;
      });

      if (this.mediaSort.order === "descending") {
        sortedSortable.reverse();
      }

      // array order is garanteed while objects properties aren’t,
      // that’s why we use an array here
      let sortedMedias = sortedSortable.reduce((accumulator, d) => {
        let sortedMediaObj = this.library_medias.find(
          m => m.metaFileName === d.slugMediaName
        );
        sortedMediaObj.slugMediaName = d.slugMediaName;
        accumulator.push(sortedMediaObj);
        return accumulator;
      }, []);

      return sortedMedias;
    },
    groupedMedias: function() {
      let mediaGroup = this.$_.groupBy(this.sortedMedias, media => {
        let _date;

        if (media.hasOwnProperty("date_created") && !!media.date_created) {
          _date = media.date_created;
        } else if (
          media.hasOwnProperty("date_uploaded") &&
          !!media.date_uploaded
        ) {
          _date = media.date_uploaded;
        } else {
          return this.$t("invalid_date");
        }

        var dateMoment = this.$moment(_date);
        return dateMoment.format("YYYY-MM-DD");
      });
      mediaGroup = this.$_.pairs(mediaGroup);
      mediaGroup = this.$_.sortBy(mediaGroup);
      mediaGroup = mediaGroup.reverse();
      return mediaGroup;
    }
  },
  methods: {
    prevMedia() {
      this.mediaNav(-1);
    },
    nextMedia() {
      this.mediaNav(+1);
    },
    mediaNav(relative_index) {
      const current_media_index = this.sortedMedias.findIndex(
        m => m.metaFileName === this.show_media_detail_for
      );
      const new_media = this.sortedMedias[current_media_index + relative_index];

      if (
        !!new_media &&
        new_media.hasOwnProperty("metaFileName") &&
        !!new_media.metaFileName
      ) {
        this.$nextTick(() => {
          this.openMedia(new_media.metaFileName);
        });
      }
    },

    getAllKeywordsFrom(base) {
      let uniqueKeywords = [];
      Object.values(base).map(meta => {
        if (!meta["keywords"]) return;
        meta.keywords.map(k => {
          if (uniqueKeywords.indexOf(k.title) == -1)
            uniqueKeywords.push(k.title);
        });
      });
      uniqueKeywords = uniqueKeywords.sort(function(a, b) {
        return a.toLowerCase().localeCompare(b.toLowerCase());
      });

      return uniqueKeywords.map(kw => {
        return {
          text: kw,
          classes: "tagcolorid_" + (parseInt(kw, 36) % 2)
        };
      });
    },
    media_created(m) {},
    openMedia(metaFileName) {
      if (this.$root.state.dev_mode === "debug") {
        console.log("METHODS • MediaLibrary: openMedia");
      }
      this.show_media_detail_for = metaFileName;
    },

    toggleMedia(metaFileName) {
      if (this.$root.state.dev_mode === "debug") {
        console.log("METHODS • MediaLibrary: toggleMedia");
      }

      if (this.show_media_detail_for === metaFileName)
        this.show_media_detail_for = false;
      else this.show_media_detail_for = metaFileName;
    },
    createTextMedia() {
      this.$eventHub.$on(
        "socketio.media_created_or_updated",
        this.newTextMediaCreated
      );
      this.$root.createMedia({
        slugFolderName: this.slugProjectName,
        type: "projects",
        additionalMeta: {
          type: "text"
        }
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
              slugMediaName: metaFileName
            });
          },
          () => {}
        );
    },
    // newTextMediaCreated(mdata) {
    //   if (this.$root.justCreatedMediaID === mdata.id) {
    //     this.$root.justCreatedMediaID = false;
    //     this.$eventHub.$off(
    //       "socketio.media_created_or_updated",
    //       this.newTextMediaCreated
    //     );
    //     this.openMediaModal(mdata.metaFileName);
    //   }
    // },
    openCapture() {
      // const iOS = !!navigator.platform && /iPad|iPhone|iPod/.test(navigator.platform);
      // if(iOS) {
      //   this.showImportModal = true;

      //   this.$alertify
      //     .closeLogOnClick(true)
      //     .delay(8000)
      //     .error(this.$t('notifications.ios_not_compatible_with_capture'));
      //   setTimeout(() => {
      //     this.$alertify
      //       .closeLogOnClick(true)
      //       .delay(8000)
      //       .log(this.$t('notifications.instead_import_with_this_button'));
      //   },1500);

      //   return;
      // }
      this.$root.do_navigation.view = "Capture";
    },
    updateInputFiles($event) {
      if (this.$root.state.dev_mode === "debug") {
        console.log(`METHODS • AddMedia / updateSelectedFiles`);
      }
      this.selected_files = Array.from($event.target.files);
      $event.target.value = "";
    },
    ondragover($event) {
      if (this.$root.state.dev_mode === "debug") {
        // console.log(`METHODS • AddMedia / ondragover`);
      }

      this.show_drop_container = true;
      this.cancelDragOver();
    },
    cancelDragOver() {
      if (this.$root.state.dev_mode === "debug") {
        console.log(`METHODS • AddMedia / cancelDragOver`);
      }
      this.show_drop_container = false;
    },
    ondrop($event) {
      if (this.$root.state.dev_mode === "debug") {
        console.log(`METHODS • AddMedia / ondrop`);
      }

      // Prevent default behavior (Prevent file from being opened)
      $event.preventDefault();

      if ($event.dataTransfer.items) {
        let files = [];
        for (var i = 0; i < $event.dataTransfer.items.length; i++) {
          if ($event.dataTransfer.items[i].kind === "file") {
            files.push($event.dataTransfer.items[i].getAsFile());
          }
        }
        this.selected_files = files;
      } else {
        for (var i = 0; i < $event.dataTransfer.files.length; i++) {
          this.selected_files = Array.from($event.dataTransfer.files);
        }
      }
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
    }
  }
};
</script>
<style lang="scss">
.m_library {
  position: relative;
  height: 100%;
  background-color: var(--color-MediaLibrary);
  // margin: 0 -1em;
  // background-color: #1c1e20;
  // color: white;

  .m_library--content {
    height: 100%;
    display: flex;
    flex-flow: column nowrap;
    overflow-y: auto;
  }
}

.m_actionbar {
  padding: 0 var(--spacing);
  // display: flex;

  > * {
    padding: calc(var(--spacing) / 4) calc(var(--spacing) / 2);
    border-bottom: 1px solid black;
    border-top: 0;
    border-left: 0 solid #000;
  }

  .m_actionbar--text {
    font-size: 0.8em;
    line-height: 1.25;
    display: flex;
    align-items: center;
  }
}

.m_library--chronology {
  h3 {
    // font-weight: normal;
    font-size: 75%;
    margin: var(--spacing);
    margin-bottom: calc(var(--spacing) / 2);
  }
}

.m_library--chronology--medias {
  --media-width: 80px;
  --grid-gap: 0.5em;

  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(var(--media-width), 1fr));
  grid-auto-rows: max-content;
  grid-gap: calc(var(--spacing) / 1.5);
  padding: 0 var(--spacing);

  height: 100%;

  figure {
    margin: 0;
  }
}

.m_library--mediaFocus {
  width: 100%;
  height: 100%;

  display: flex;
  flex-flow: column nowrap;

  // box-shadow: 0 10px 23px rgba(0, 0, 0, 0.4);

  .mediaContainer {
    position: relative;
    flex: 1 1 auto;

    > * {
      position: absolute;
      width: 100%;
      height: 100%;
      object-fit: contain;
      object-position: center;
    }
  }

  .m_library--mediaFocus--buttons {
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
  }
}

._drop_indicator {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(10, 153, 127, 0.4);
  z-index: 50000;

  display: flex;
  justify-content: center;
  align-items: center;

  text-align: center;

  > * {
    display: block;
    width: 200px;
    height: 200px;
  }
}

.m_uploadFilePane {
  position: absolute;
  height: 100%;
  bottom: 0;
  width: 100%;
  z-index: 1000;
  padding: var(--spacing);
  background-color: #f9ca00;
}
</style>
