<template>
  <div class="m_writeup">
    <div class>
      <table class v-if="mode === 'writeup_list'">
        <thead>
          <tr>
            <th style>{{ $t('name') }}</th>
            <th>{{ $t('last_modified') }}</th>
            <th colspan="2">
              {{ $t('actions') }}
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
              <td colspan="4">
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
      @remove="removeWriteupMedia($root.settings.current_writeup_media_metaFileName)"
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

      this.$alertify
        .okBtn(this.$t("yes"))
        .cancelBtn(this.$t("cancel"))
        .confirm(
          this.$t("sureToRemoveWriteup"),
          () => {
            this.$root.settings.current_writeup_media_metaFileName = false;
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
  position: relative;
  margin: var(--spacing);
  // margin: 0 auto;
  height: 100%;
  overflow: auto;

  table {
    width: 100%;
    margin: 0;
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
  text-decoration:none;
}
table a:active,
table a:hover {
	color: #bd5a35;
	text-decoration:underline;
}

table {
	// font-family:Arial, Helvetica, sans-serif;
	color:#666;
	// font-size:12px;
	// text-shadow: 1px 1px 0px #fff;
	background:#ccc;
	margin:20px;
	border:#ccc 1px solid;

	-moz-border-radius:3px;
	-webkit-border-radius:3px;
	border-radius:3px;

	-moz-box-shadow: 0 1px 2px #d1d1d1;
	-webkit-box-shadow: 0 1px 2px #d1d1d1;
	box-shadow: 0 1px 2px #d1d1d1;
}

table th {
	padding:21px 25px 22px 25px;
	border-top:1px solid #fafafa;
	border-bottom:1px solid #e0e0e0;

	background: #ededed;
	background: -webkit-gradient(linear, left top, left bottom, from(#ededed), to(#ebebeb));
	background: -moz-linear-gradient(top,  #ededed,  #ebebeb);
}
table th:first-child {
	text-align: left;
	padding-left:20px;
}
table tr:first-child th:first-child {
	-moz-border-radius-topleft:3px;
	-webkit-border-top-left-radius:3px;
	border-top-left-radius:3px;
}
table tr:first-child th:last-child {
	-moz-border-radius-topright:3px;
	-webkit-border-top-right-radius:3px;
	border-top-right-radius:3px;
}
table tr {
	text-align: center;
	padding-left:20px;
}
table td:first-child {
	text-align: left;
	padding-left:20px;
	border-left: 0;
}
table td {
	padding:18px;
	border-top: 1px solid #ffffff;
	border-bottom:1px solid #e0e0e0;
	border-left: 1px solid #e0e0e0;

	background: #fafafa;
	background: -webkit-gradient(linear, left top, left bottom, from(#fbfbfb), to(#fafafa));
	background: -moz-linear-gradient(top,  #fbfbfb,  #fafafa);
}
table tr.even td {
	background: #f6f6f6;
	background: -webkit-gradient(linear, left top, left bottom, from(#f8f8f8), to(#f6f6f6));
	background: -moz-linear-gradient(top,  #f8f8f8,  #f6f6f6);
}
table tr:last-child td {
	border-bottom:0;
}
table tr:last-child td:first-child {
	-moz-border-radius-bottomleft:3px;
	-webkit-border-bottom-left-radius:3px;
	border-bottom-left-radius:3px;
}
table tr:last-child td:last-child {
	-moz-border-radius-bottomright:3px;
	-webkit-border-bottom-right-radius:3px;
	border-bottom-right-radius:3px;
}
table tr:hover td {
	background: #f2f2f2;
	background: -webkit-gradient(linear, left top, left bottom, from(#f2f2f2), to(#f0f0f0));
  background: -moz-linear-gradient(top,  #f2f2f2,  #f0f0f0);	
}
</style>