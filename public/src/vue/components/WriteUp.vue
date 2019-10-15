<template>
  <div class="m_writeup">
    <div class>
      <table class v-if="mode === 'writeup_list'">
        <thead>
          <tr>
            <th style>{{ $t('name') }}</th>
            <th>{{ $t('last_modified') }}</th>
            <th>
              <!-- {{ $t('action') }} -->
            </th>
          </tr>
        </thead>
        <transition-group tag="tbody" name="list-complete">
          <tr v-for="w in writeup_medias" :key="w.metaFileName">
            <td>{{ w.name }}</td>
            <td
              :title="$moment(w.date_modified).format('l LTS')"
            >{{ format_date_to_human(w.date_modified) + ' ' + $moment(w.date_modified).format('HH:mm') }}</td>
            <td>
              <button
                type="button"
                class="button-small border-circled button-thin padding-verysmall margin-none bg-transparent"
                @click="openWriteupMedia(w.metaFileName)"
              >{{ $t('open') }}</button>
            </td>
            <td>
              <button
                type="button"
                class="button-small border-circled button-thin padding-verysmall margin-none bg-transparent"
                @click="removeWriteupMedia(w.metaFileName)"
              >{{ $t('remove') }}</button>
            </td>
          </tr>
          <tr :key="'create'">
            <template v-if="!show_createwriteup_section">
              <td colspan="3">
                <button
                  type="button"
                  class="button-small border-circled button-thin button-wide padding-verysmall margin-none bg-transparent"
                  @click="show_createwriteup_section = !show_createwriteup_section"
                >{{ $t('create') }}</button>
              </td>
            </template>

            <template v-else>
              <td colspan="2">
                <input type="text" class="input-xs" ref="nameInput" />
              </td>
              <td>
                <button
                  type="button"
                  class="button-small border-circled button-thin button-wide padding-verysmall margin-none bg-transparent"
                  @click="createWriteupMedia"
                >{{ $t('create') }}</button>
              </td>
            </template>
          </tr>
        </transition-group>
      </table>
      <div v-else-if="mode === 'single_writeup'" class="margin-small text-centered">
        <button
          type="button"
          class="button-small border-circled button-thin padding-verysmall margin-none bg-transparent"
          @click="closeWriteupMedia"
        >{{ $t('back_to_list') }}</button>
      </div>
    </div>

    <WriteUpEditor
      v-if="current_writeup_media"
      class="bg-blanc c-noir"
      :slugFolderName="slugFolderName"
      :media="current_writeup_media"
      :readonly="read_only"
    />
  </div>
</template>
<script>
import WriteUpEditor from "./subcomponents/WriteUpEditor.vue";

export default {
  props: {
    slugFolderName: String,
    medias: Object
  },
  components: {
    WriteUpEditor
  },
  data() {
    return {
      show_createwriteup_section: false
    };
  },

  created() {},
  mounted() {},
  beforeDestroy() {},

  watch: {},
  computed: {
    writeup_medias() {
      return Object.values(this.medias)
        .filter(m => m.type === "writeup")
        .sort((a, b) => a.date_modified.localeCompare(b.date_modified));
    },
    current_writeup_media() {
      if (this.$root.settings.current_writeup_media_metaFileName === false)
        return false;
      return Object.values(this.medias).filter(
        m =>
          m.metaFileName ===
          this.$root.settings.current_writeup_media_metaFileName
      )[0];
    },
    mode() {
      if (this.$root.settings.current_writeup_media_metaFileName) {
        return "single_writeup";
      }
      return "writeup_list";
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
    createWriteupMedia() {
      if (window.state.dev_mode === "debug") {
        console.log("METHODS • AddMediaButton: createWriteupMedia");
      }

      let name = this.$refs.nameInput.value;
      if (!name) {
        name = this.$t("untitled_document");
      }

      if (this.writeup_medias.filter(w => w.name === name).length > 0) {
        this.$alertify
          .closeLogOnClick(true)
          .delay(4000)
          .error(this.$t("notifications.document_name_exists"));
        return false;
      }

      this.show_createwriteup_section = false;
      // this.$eventHub.$on('socketio.media_created_or_updated', this.newTextMediaCreated);
      this.$root.createMedia({
        slugFolderName: this.slugFolderName,
        type: "projects",
        additionalMeta: {
          name,
          type: "writeup"
        }
      });
    },
    openWriteupMedia(metaFileName) {
      if (window.state.dev_mode === "debug") {
        console.log(`METHODS • WriteUp: openWriteupMedia / ${metaFileName}`);
      }

      this.$root.settings.current_writeup_media_metaFileName = false;
      this.$nextTick(() => {
        this.$root.settings.current_writeup_media_metaFileName = metaFileName;
      });
    },
    closeWriteupMedia() {
      if (window.state.dev_mode === "debug") {
        console.log(`METHODS • WriteUp: closeWriteupMedia`);
      }

      this.$root.settings.current_writeup_media_metaFileName = false;
    },
    removeWriteupMedia(metaFileName) {
      if (window.state.dev_mode === "debug") {
        console.log(`METHODS • WriteUp: removeWriteupMedia / ${metaFileName}`);
      }

      this.$root.settings.current_writeup_media_metaFileName = false;
      this.$alertify
        .okBtn(this.$t("yes"))
        .cancelBtn(this.$t("cancel"))
        .confirm(
          this.$t("sureToRemoveWriteup"),
          () => {
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
.m_writeup {
  padding: var(--spacing);
  max-width: 55ch;
  margin: 0 auto;
  height: 100%;
  overflow: auto;
}
</style>