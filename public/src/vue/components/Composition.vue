<template>
  <div class="m_composition">
    <div class>
      <table class v-if="mode === 'composition_list'">
        <thead>
          <tr>
            <th style>{{ $t('compositions') }}</th>
            <th>{{ $t('date_modified') }}</th>
            <th colspan="2">{{ $t('actions') }}</th>
          </tr>
        </thead>
        <transition-group tag="tbody" name="list-complete">
          <tr v-for="w in composition_medias" :key="w.metaFileName">
            <td>{{ w.name }}</td>
            <td
              :title="$moment(w.date_modified).format('l LTS')"
            >{{ format_date_to_human(w.date_modified) + ' ' + $moment(w.date_modified).format('HH:mm') }}</td>
            <td>
              <button
                type="button"
                class="button-small border-circled button-thin padding-verysmall margin-none bg-transparent"
                @click="openCompositionMedia(w.metaFileName)"
              >{{ $t('open') }}</button>
            </td>
            <td>
              <button
                type="button"
                class="button-small border-circled button-thin padding-verysmall margin-none bg-transparent"
                @click="removeCompositionMedia(w.metaFileName)"
              >{{ $t('remove') }}</button>
            </td>
          </tr>
          <tr :key="'create'">
            <template v-if="!show_createcomposition_section">
              <td colspan="4">
                <button
                  type="button"
                  class="_create_button"
                  @click="show_createcomposition_section = !show_createcomposition_section"
                >{{ $t('create') }}</button>
              </td>
            </template>

            <template v-else>
              <td colspan="2">
                <input type="text" class ref="nameInput" />
              </td>
              <td colspan="2">
                <button
                  type="button"
                  class="button-small border-circled button-thin button-wide padding-verysmall margin-none bg-transparent"
                  @click="createCompositionMedia"
                >{{ $t('create') }}</button>
              </td>
            </template>
          </tr>
        </transition-group>
      </table>
      <div v-else-if="mode === 'single_composition'" class="text-centered">
        <button
          class="button_backtolist"
          type="button"
          @click="closeCompositionMedia"
        >← {{ $t('back_to_list') }}</button>
      </div>
    </div>

    <CompositionEditor
      v-if="current_composition_media"
      class="bg-blanc c-noir"
      :slugFolderName="slugFolderName"
      :media="current_composition_media"
      :readonly="read_only"
      @remove="removeCompositionMedia($root.settings.current_composition_media_metaFileName)"
    />
  </div>
</template>
<script>
import CompositionEditor from "./subcomponents/CompositionEditor.vue";

export default {
  props: {
    slugFolderName: String,
    composition_medias: Array
  },
  components: {
    CompositionEditor
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
  padding: var(--spacing);
  height: 100%;
  overflow: auto;

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

table a:link {
  color: #666;
  font-weight: bold;
  text-decoration: none;
}
table a:visited {
  color: #999999;
  font-weight: bold;
  text-decoration: none;
}
table a:active,
table a:hover {
  color: #bd5a35;
  text-decoration: underline;
}

table {
  // font-family:Arial, Helvetica, sans-serif;
  // color: #666;
  // font-size:12px;
  // text-shadow: 1px 1px 0px #fff;
  // background:#ccc;
  margin: 20px;
  border-bottom: #000 1px solid;

  // -moz-box-shadow: 0 1px 2px #d1d1d1;
  // -webkit-box-shadow: 0 1px 2px #d1d1d1;
  // box-shadow: 0 1px 2px #d1d1d1;
}

table th {
  padding: var(--spacing);
  // border-top: 1px solid #fafafa;
  // border-bottom: 1px solid #e0e0e0;

  // background: #ededed;
  // background: -webkit-gradient(
  //   linear,
  //   left top,
  //   left bottom,
  //   from(#ededed),
  //   to(#ebebeb)
  // );
  border-bottom: 1px solid black;
}
table th:first-child {
  text-align: left;
  padding-left: 20px;
}
table tr {
  text-align: center;
  padding-left: 20px;
}
table td:first-child {
  text-align: left;
  padding-left: 20px;
  border-left: 0;
}
table td {
  padding: 18px;
  border-bottom: 1px solid #000;
  border-left: 1px solid #000;
}
table tr:last-child td {
  border-bottom: 0;
}
table tr:last-child td:first-child {
  -moz-border-radius-bottomleft: 3px;
  -webkit-border-bottom-left-radius: 3px;
  border-bottom-left-radius: 3px;
}
table tr:last-child td:last-child {
  -moz-border-radius-bottomright: 3px;
  -webkit-border-bottom-right-radius: 3px;
  border-bottom-right-radius: 3px;
}
table tr:hover td {
  background: #f2f2f2;
  background: -webkit-gradient(
    linear,
    left top,
    left bottom,
    from(#f2f2f2),
    to(#f0f0f0)
  );
  background: -moz-linear-gradient(top, #f2f2f2, #f0f0f0);
}

.button_backtolist {
  margin: 0 var(--spacing);
}

._create_button {
  width: 100%;
}
</style>