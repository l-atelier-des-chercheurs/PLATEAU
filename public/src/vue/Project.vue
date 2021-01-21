<template>
  <div class="m_project">
    <div class="m_filters" style="">
      <button
        type="button"
        class="button-nostyle text-uc _toggle_filters"
        :class="{ 'is--active': show_filters }"
        @click="show_filters = !show_filters"
      >
        {{ $t("filters") }}
      </button>

      <TagsAndAuthorFilters
        v-if="show_filters"
        :allKeywords="mediaKeywords"
        :keywordFilter="$root.settings.media_filter.keyword"
        :allAuthors="mediaAuthors"
        :authorFilter="$root.settings.media_filter.author"
        :favFilter="$root.settings.media_filter.fav"
        @setKeywordFilter="(a) => $root.setMediaKeywordFilter(a)"
        @setAuthorFilter="(a) => $root.setMediaAuthorFilter(a)"
        @setFavFilter="(a) => $root.setFavFilter(a)"
      />
    </div>

    <div class="m_project--splitpanes">
      <splitpanes
        watch-slots
        @resized="resized()"
        :key="
          JSON.stringify(
            $root.settings.project_panes_in_order.map((p) => p.key)
          )
        "
      >
        <template
          v-if="
            $root.settings.project_panes_in_order.filter((p) => p.enabled)
              .length === 0
          "
        >
          <div class="m_project--noPane">
            <i>Aucune panneau n’est actif</i>
          </div>
        </template>
        <template v-else v-for="pane in $root.settings.project_panes_in_order">
          <pane
            v-if="pane.key === 'WriteUp' && pane.enabled"
            :key="pane.key"
            min-size="5"
            ref="WriteUp"
          >
            <WriteUp
              :slugFolderName="slugProjectName"
              :writeup_medias="writeup_medias"
              :read_only="read_only"
            />
          </pane>

          <pane
            v-else-if="pane.key === 'MediaLibrary' && pane.enabled"
            :key="pane.key"
            min-size="5"
            ref="MediaLibrary"
          >
            <MediaLibrary
              :slugProjectName="slugProjectName"
              :project="project"
              :library_medias="library_medias"
              :read_only="false"
            />
          </pane>

          <pane
            v-else-if="pane.key === 'Composition' && pane.enabled"
            :key="pane.key"
            min-size="5"
            ref="Composition"
          >
            <Composition
              :slugFolderName="slugProjectName"
              :composition_medias="composition_medias"
              :read_only="read_only"
            />
          </pane>

          <pane
            v-else-if="pane.key === 'Capture' && pane.enabled"
            :key="pane.key"
            min-size="5"
            ref="Capture"
          >
            <CaptureView
              :slugFolderName="slugProjectName"
              :type="`projects`"
              :read_only="!$root.state.connected"
              :must_validate_media="false"
              :available_modes="['photo', 'video', 'stopmotion', 'audio']"
              data-id="Capture"
            />
          </pane>

          <pane
            v-if="pane.key === 'Planning' && pane.enabled"
            :key="pane.key"
            min-size="5"
            ref="Planning"
          >
            <Planning
              :slugFolderName="slugProjectName"
              :project="project"
              :planning_medias="planning_medias"
              :read_only="read_only"
            />
          </pane>

          <pane
            v-else-if="pane.key === 'Team' && pane.enabled"
            :key="pane.key"
            min-size="5"
            ref="Team"
          >
            <Team
              :slugFolderName="slugProjectName"
              :project="project"
              :read_only="!$root.state.connected"
              data-id="Capture"
            />
          </pane>
        </template>
      </splitpanes>
    </div>
    <Countdown :slugFolderName="slugProjectName" :project="project" />
  </div>
</template>
<script>
import MediaLibrary from "./components/MediaLibrary.vue";
import WriteUp from "./components/WriteUp.vue";
import CaptureView from "./components/capture/CaptureView.vue";
import Team from "./components/Team.vue";
import Composition from "./components/Composition.vue";
import Planning from "./components/Planning.vue";
import { Splitpanes, Pane } from "splitpanes";
import Countdown from "./components/subcomponents/Countdown.vue";
import TagsAndAuthorFilters from "./components/subcomponents/TagsAndAuthorFilters.vue";

export default {
  props: {
    project: Object,
    slugProjectName: String,
  },
  components: {
    MediaLibrary,
    WriteUp,
    CaptureView,
    Team,
    Composition,
    Planning,
    Splitpanes,
    Pane,
    Countdown,
    TagsAndAuthorFilters,
  },
  data() {
    return {
      paged_content: [[]],
      flowed_content: [],
      modules_height: [],
      max_height_per_page: 0,

      show_filters: false,
    };
  },
  created() {},
  mounted() {
    this.$eventHub.$on("project.refresh_panes_order", this.refreshPanes);
    this.$eventHub.$on("project.set_pane_size", this.setPaneSize);
  },
  beforeDestroy() {
    this.$eventHub.$off("project.refresh_panes_order", this.refreshPanes);
    this.$eventHub.$off("project.set_pane_size", this.setPaneSize);
    this.$root.closeChat();
  },
  watch: {
    "$root.settings.project_panes_in_order": {
      handler() {
        setTimeout(() => {
          this.$forceUpdate();
        }, 500);
      },
      deep: true,
    },
    show_filters: function () {
      if (!this.show_filters) {
        this.$root.settings.media_filter.keyword = "";
        this.$root.settings.media_filter.author = "";
        this.$root.settings.media_filter.fav = false;
        this.$root.settings.media_filter.type = false;
      }
    },
  },
  computed: {
    writeup_medias() {
      return Object.values(this.project.medias).filter(
        (m) => m.hasOwnProperty("type") && m.type === "writeup"
      );
    },
    mediaKeywords() {
      return this.$root.getAllKeywordsFrom(this.project.medias);
    },
    mediaAuthors() {
      return this.$root.getAllAuthorsFrom(this.project.medias);
    },
    composition_medias() {
      return Object.values(this.project.medias).filter(
        (m) => m.hasOwnProperty("type") && m.type === "composition"
      );
    },
    planning_medias() {
      return Object.values(this.project.medias).filter(
        (m) => m.hasOwnProperty("type") && m.type === "planning"
      );
    },
    library_medias() {
      if (
        !this.project.hasOwnProperty("medias") ||
        typeof this.project.medias !== "object"
      ) {
        return [];
      }

      return Object.values(this.project.medias).filter(
        (m) =>
          m.hasOwnProperty("type") &&
          !["writeup", "composition", "planning"].includes(m.type)
      );
    },
  },
  methods: {
    resized() {
      console.log(`Project / methods: resized`);
      this.$eventHub.$emit(`activity_panels_resized`);

      setTimeout(() => {
        this.updateWidthInStore();
      }, 500);
    },
    refreshPanes() {
      console.log(`Project / methods: refreshPanes`);
      this.$forceUpdate();
    },
    updateWidthInStore() {
      console.log(`Project / methods: updateWidthInStore`);

      Object.entries(this.$refs).map(([key, $el]) => {
        this.$root.settings.project_panes_in_order = this.$root.settings.project_panes_in_order.map(
          (p) => {
            if (p.key === key && !!$el[0] && $el[0].hasOwnProperty("$el")) {
              const _width = parseInt($el[0].$el.style.width);
              if (p.width !== _width) {
                p.width = _width + "%";
              }
            }
            return p;
          }
        );
      });
    },
    setPaneSize(panes_in_order) {
      panes_in_order.map((p) => {
        if (p.enabled && this.$refs.hasOwnProperty(p.key)) {
          console.log(`setPaneSize • setting ${p.key} to ${p.width}`);
          this.$refs[p.key][0].$el.style.width = p.width;
        }
      });

      setTimeout(() => {
        this.$eventHub.$emit(`activity_panels_resized`);
      }, 500);
    },
  },
};
</script>
<style lang="scss">
.m_filters {
  background-color: #fff;
  border-bottom: 1px solid black;
  // margin: calc(var(--spacing) / 2);
  padding: 0 calc(var(--spacing) / 2);

  // display: flex;

  > button {
    text-decoration: none;
  }
}
.m_tagsAndAuthorFilters {
  display: flex;
  align-items: center;
  flex-flow: row wrap;

  > * {
    padding: 0 calc(var(--spacing) / 2);
  }
  label {
    margin-right: calc(var(--spacing) / 2);
  }

  .m_tagsAndAuthorFilters--keywords {
    display: flex;
  }
}

._toggle_filters {
  line-height: 1;
}

.m_project {
  position: relative;
  height: 100%;
  background-color: #eee;
  overflow: hidden;

  display: flex;
  flex-flow: column nowrap;

  // background-color: #ecf0ed;
  // background-color: hsl(135, 12%, 96%);

  .m_project--splitpanes {
    height: 100%;
    display: flex;
    flex-flow: row nowrap;
    overflow-y: auto;
    -webkit-overflow-scrolling: touch;
    > * {
      height: 100%;
    }
  }
}

.m_project--noPane {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;
  // font-weight: bold;
  color: #999;
}
</style>
