<template>
  <div
    class="m_composition"
    :class="{
      'is--slave': $root.settings.is_slave
    }"
  >
    <div
      class="m_composition--list"
      v-if="!$root.settings.is_slave && mode === 'composition_list'"
    >
      <transition-group
        tag="div"
        class="m_composition--items"
        name="list-complete"
      >
        <div
          v-for="w in composition_medias"
          :key="w.metaFileName"
          class="m_composition--items--item"
          @click="openCompositionMedia(w.metaFileName)"
        >
          <div class="_composition_preview">
            <FabricCanvas
              :media="w"
              :max_zoom="0.3"
              :slugFolderName="slugFolderName"
              :drawing_options="{ mode: 'select' }"
            />
          </div>

          <div class="m_composition--items--item--name">
            {{ w.name }}
          </div>
          <div :title="$moment(w.date_modified).format('l LTS')">
            Modifié le
            {{
              format_date_to_human(w.date_modified) +
                " " +
                $moment(w.date_modified).format("HH:mm")
            }}
          </div>

          <div class="m_composition--items--item--buttons">
            <!-- <button
                type="button"
                class="button-small border-circled button-thin padding-verysmall margin-none bg-transparent"
              >
                {{ $t("open") }}
              </button> -->
            <!-- <div>
                <button
                  type="button"
                  class="button-small border-circled button-thin padding-verysmall margin-none bg-transparent"
                  @click="removeCompositionMedia(w.metaFileName)"
                >
                  {{ $t("remove") }}
                </button>
              </div> -->
          </div>
        </div>
        <div :key="'create'" class="m_composition--items--item_create">
          <template v-if="!show_createcomposition_section">
            <button
              type="button"
              class="_create_button"
              @click="
                show_createcomposition_section = !show_createcomposition_section
              "
            >
              {{ $t("create") }}
            </button>
          </template>

          <template v-else>
            <input
              type="text"
              class
              ref="nameInput"
              @keyup.enter="createCompositionMedia"
            />
            <button
              type="button"
              class="button-small border-circled button-thin button-wide padding-verysmall margin-none bg-transparent"
              @click="createCompositionMedia"
            >
              {{ $t("create") }}
            </button>
          </template>
        </div>
      </transition-group>
    </div>

    <CompositionEditor
      v-if="current_composition_media"
      class="bg-blanc c-noir"
      :slugFolderName="slugFolderName"
      :media="current_composition_media"
      :readonly="read_only"
      @remove="
        removeCompositionMedia(
          $root.settings.current_composition_media_metaFileName
        )
      "
      @back="closeCompositionMedia"
    />
  </div>
</template>
<script>
import FabricCanvas from "./subcomponents/FabricCanvas.vue";
import CompositionEditor from "./subcomponents/CompositionEditor.vue";

export default {
  props: {
    slugFolderName: String,
    composition_medias: Array
  },
  components: {
    CompositionEditor,
    FabricCanvas
  },
  data() {
    return {
      show_createcomposition_section: false
    };
  },

  created() {},
  mounted() {},
  beforeDestroy() {},

  watch: {},
  computed: {
    sorted_composition_medias() {
      return this.composition_medias.sort((a, b) =>
        a.date_modified.localeCompare(b.date_modified)
      );
    },
    current_composition_media() {
      if (this.$root.settings.current_composition_media_metaFileName === false)
        return false;
      return this.composition_medias.filter(
        m =>
          m.metaFileName ===
          this.$root.settings.current_composition_media_metaFileName
      )[0];
    },
    mode() {
      if (this.$root.settings.current_composition_media_metaFileName) {
        return "single_composition";
      }
      return "composition_list";
    }
  },
  methods: {
    textChange(delta, oldDelta, source) {
      // if source === 'user'
    },
    format_date_to_human(d) {
      if (this.$root.lang.current === "fr") {
        return this.$moment(d).calendar(null, {
          lastDay: "[hier]",
          sameDay: "[aujourd’hui]",
          nextDay: "[demain]",
          lastWeek: "dddd [dernier]",
          nextWeek: "dddd [prochain]",
          sameElse: "dddd D MMMM"
        });
      } else if (this.$root.lang.current === "en") {
        return this.$moment(d).calendar(null, {
          lastDay: "[yesterday]",
          sameDay: "[today]",
          nextDay: "[tomorrow]",
          lastWeek: "[last] dddd",
          nextWeek: "[next] dddd",
          sameElse: "dddd, MMMM D"
        });
      }
    },
    createCompositionMedia() {
      if (window.state.dev_mode === "debug") {
        console.log("METHODS • AddMediaButton: createCompositionMedia");
      }

      let name = this.$refs.nameInput.value;
      if (!name) {
        name = this.$t("untitled_document");
      }

      if (this.composition_medias.filter(w => w.name === name).length > 0) {
        this.$alertify
          .closeLogOnClick(true)
          .delay(4000)
          .error(this.$t("notifications.document_name_exists"));
        return false;
      }

      this.show_createcomposition_section = false;

      this.$eventHub.$on("socketio.media_created_or_updated", m =>
        this.openCompositionMedia(m.metaFileName)
      );
      this.$root.createMedia({
        slugFolderName: this.slugFolderName,
        type: "projects",
        additionalMeta: {
          name,
          type: "composition"
        }
      });
    },
    openCompositionMedia(metaFileName) {
      if (window.state.dev_mode === "debug") {
        console.log(
          `METHODS • Composition: openCompositionMedia / ${metaFileName}`
        );
      }

      this.$root.settings.current_composition_media_metaFileName = false;
      this.$nextTick(() => {
        this.$root.settings.current_composition_media_metaFileName = metaFileName;
      });
    },
    closeCompositionMedia() {
      if (window.state.dev_mode === "debug") {
        console.log(`METHODS • Composition: closeCompositionMedia`);
      }

      this.$root.settings.current_composition_media_metaFileName = false;
    },
    removeCompositionMedia(metaFileName) {
      if (window.state.dev_mode === "debug") {
        console.log(
          `METHODS • Composition: removeCompositionMedia / ${metaFileName}`
        );
      }

      this.$alertify
        .okBtn(this.$t("yes"))
        .cancelBtn(this.$t("cancel"))
        .confirm(
          this.$t("sureToRemoveComposition"),
          () => {
            this.$root.settings.current_composition_media_metaFileName = false;
            this.$root.removeMedia({
              type: "projects",
              slugFolderName: this.slugFolderName,
              slugMediaName: metaFileName
            });
          },
          () => {}
        );
    }
  }
};
</script>
<style lang="scss">
.m_composition {
  position: relative;
  background-color: var(--color-Composition);
  height: 100%;

  &.is--slave {
    padding: 0;

    .m_compositioneditor {
      height: 100%;

      .m_fabricCanvas {
        transform-origin: left center;
      }
    }
  }

  table {
    width: 100%;
    margin: 0;
  }
  input[type="text"] {
    width: 100%;
  }

  button {
  }
}
.m_composition--list {
  height: 100%;
  padding: var(--spacing);
  overflow: auto;
}

._create_button {
  width: 100%;
}

._composition_preview {
  width: 100%;
  padding-bottom: 75%;
  height: 0;
  margin: 0;
}

.m_composition--items {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(180px, 220px));
  grid-auto-rows: max-content;
  grid-gap: calc(var(--spacing) / 1.5);
  // padding: 0 var(--spacing);

  > * {
    border: 1px solid black;
    padding: calc(var(--spacing) / 2);
  }

  .m_fabricCanvas > .canvas-container {
    margin: 0;
  }
}

.m_composition--items--item {
  cursor: pointer;
  &:hover {
    background-color: rgba(255, 255, 255, 0.4);
  }

  > * {
    pointer-events: none;
  }
}
.m_composition--items--item_create {
  display: flex;
  align-items: center;
}

.m_composition--items--item--name {
  font-weight: 500;
  font-family: "Work Sans";
  font-size: 150%;
  margin-top: 0;
}
.m_composition--items--item--buttons {
  display: flex;
  flex-flow: row wrap;
  justify-content: center;
}
</style>
