<template>
  <form class="m_planningItem" :class="{ 'is--editable': edit_mode }" @submit.prevent="sendEdits">
    <div class="m_planningItem--topbar">
      <div class="m_planningItem--editButtons">
        <button type="button" @click="edit_mode = !edit_mode" title="edit">
          <svg
            version="1.1"
            class="inline-svg"
            xmlns="http://www.w3.org/2000/svg"
            xmlns:xlink="http://www.w3.org/1999/xlink"
            x="0px"
            y="0px"
            width="100.7px"
            height="101px"
            viewBox="0 0 100.7 101"
            style="enable-background:new 0 0 100.7 101;"
            xml:space="preserve"
          >
            <path
              class="st0"
              d="M100.7,23.2L77.5,0l-66,66.2l0,0L0,101l34.7-11.6l0,0L100.7,23.2z M19.1,91.5l-9.4-9.7l4-12.4l18,17.8
                L19.1,91.5z"
            />
          </svg>
        </button>
        <button type="button" @click="removePlanningMedia" title="remove">
          <svg
            version="1.1"
            class="inline-svg"
            xmlns="http://www.w3.org/2000/svg"
            xmlns:xlink="http://www.w3.org/1999/xlink"
            x="0px"
            y="0px"
            width="91.6px"
            height="95px"
            viewBox="0 0 91.6 95"
            style="enable-background:new 0 0 91.6 95;"
            xml:space="preserve"
          >
            <path
              class="st0"
              d="M91.6,17H62.9V0H28.7v17H0v9.4h11.3V95h69V26.4h11.3V17z M64.4,69.4L57.8,76l-12-12l-12,12l-6.6-6.6l12-12
            l-12-12l6.6-6.6l12,12l12-12l6.6,6.6l-12,12L64.4,69.4z M38.1,9.4h15.3V17H38.1V9.4z"
            />
          </svg>
        </button>
      </div>
      <div class="m_planningItem--name">
        <span
          v-if="!edit_mode"
          v-html="media.name"
          @click="$emit('toggleOpen', media.metaFileName)"
        />
        <input v-else type="text" required v-model="edited_media_infos.name" />
      </div>
    </div>

    <div
      class="m_planningItem--date"
      v-if="edit_mode || media.planning_info_start || media_duration"
      :title="$moment(media.planning_info_start).format('l LTS')"
    >
      <div class="m_planningItem--date--start">
        <span v-if="!edit_mode && media.planning_info_start">
          {{
          $root.format_date_to_human(media.planning_info_start) +
          " " +
          $moment(media.planning_info_start).format("HH:mm:ss")
          }}
        </span>
        <!-- <DateTime
          v-else-if="edit_mode"
          v-model="edited_media_infos.planning_info_start"
          :twowaybinding="true"
          :read_only="false"
        />-->
        <!-- <span v-if="!media.planning_info_start">début</span>
        -->
      </div>
      <span v-if="(!edit_mode && media_duration) || edit_mode">→</span>
      <div class="m_planningItem--date--duration">
        <span v-if="!edit_mode && media_duration">
          {{ media_duration }}
          <button
            type="button"
            style="color: var(--c-rouge)"
            @click.stop="
              $eventHub.$emit('countdown.start_timer', {
                duration: media.planning_info_duration,
                attached_to: media.metaFileName
              })
            "
          >start timer</button>
        </span>
        <vue-timepicker v-else-if="edit_mode" v-model="edited_media_infos.planning_info_duration"></vue-timepicker>
      </div>
    </div>

    <div class="m_planningItem--submitButtons">
      <button
        type="button"
        class="button-small border-circled button-thin padding-verysmall margin-none bg-transparent"
        v-if="edit_mode"
        @click="edit_mode = !edit_mode"
      >{{ $t("annuler") }}</button>
      <button
        type="submit"
        class="button-small border-circled button-thin padding-verysmall margin-none bg-transparent"
        v-if="edit_mode"
      >{{ $t("valider") }}</button>
    </div>

    <div class="m_planningItem--notes" v-if="edit_notes">
      <!-- <div class="m_planningItem--notes--topbar">
        <h4>notes</h4>
        <button
          type="button"
          @click="edit_notes = !edit_notes"
          :class="{ 'is--active': edit_notes }"
        >
          <template v-if="edit_notes">×</template>
          edit
        </button>
      </div>-->

      <div class="m_planningItem--notes--staticNote" v-if="false && !edit_notes">
        <div
          v-html="notes_excerpt"
          class="m_planningItem--notes--staticNote--content"
          :class="{ 'is--excerpt': !show_full_notes }"
        />
        <button type="button" @click="show_full_notes = !show_full_notes">
          <template v-if="!show_full_notes">read the rest</template>
          <template v-else>hide</template>
        </button>
      </div>

      <div class="m_planningItem--notes--editNotes" v-if="edit_notes">
        <CollaborativeEditor
          v-model="media.content"
          :slugFolderName="slugFolderName"
          :enable_collaboration="true"
          :media="media"
        />
      </div>
    </div>

    <!-- <button
      class="m_planningItem--openButton"
      type="button"
      v-if="mode === 'collapsed'"
      @click="$emit('toggleOpen', media.metaFileName)"
    >Ouvrir</button>-->
    <!-- edit_mode : {{ edit_mode }}
    edited_media_infos : {{ edited_media_infos.name }}
    media.name : {{ media.name }}-->
  </form>
</template>
<script>
import DateTime from "./DateTime.vue";
import CollaborativeEditor from "./CollaborativeEditor.vue";
import VueTimepicker from "vue2-timepicker";

export default {
  props: {
    media: Object,
    slugFolderName: String,
    mode: {
      type: String,
      default: "collapsed"
    }
  },
  components: {
    DateTime,
    CollaborativeEditor,
    VueTimepicker
  },

  data() {
    return {
      edit_mode: false,
      edit_notes: this.mode === "expanded",
      show_full_notes: false
    };
  },
  created() {},
  mounted() {
    if (this.mode === "expanded")
      this.$root.settings.current_planning_media_metaFileName = this.media.metaFileName;
  },
  beforeDestroy() {
    if (this.mode === "expanded")
      this.$root.settings.current_planning_media_metaFileName = false;
  },
  watch: {
    edit_mode: function() {
      if (this.edit_mode) {
        this.edited_media_infos = {
          name: this.media.name,
          planning_info_start: this.media.planning_info_start,
          planning_info_duration: this.media.planning_info_duration
        };
      }
    }
  },
  computed: {
    notes_excerpt() {
      return this.media.content;
    },
    media_duration() {
      if (!this.media.planning_info_duration) {
        return false;
      }
      return this.$root.format_duration_to_human({
        duration: this.media.planning_info_duration
      });
    }
  },
  methods: {
    sendEdits() {
      let data = {};

      // if (!!this.edited_media_infos.planning_info_duration) {
      //   const HH = !!this.edited_media_infos.planning_info_duration.HH
      //     ? this.edited_media_infos.planning_info_duration.HH
      //     : "00";
      //   const mm = !!this.edited_media_infos.planning_info_duration.mm
      //     ? this.edited_media_infos.planning_info_duration.mm
      //     : "00";

      //   this.edited_media_infos.planning_info_duration = HH + "" + mm;
      // }

      const checkIfValueChanged = (key, val) => val !== this.media[key];

      Object.keys(this.edited_media_infos).map(k => {
        if (checkIfValueChanged(k, this.edited_media_infos[k])) {
          data[k] = this.edited_media_infos[k];
        }
      });

      this.$root.editMedia({
        type: "projects",
        slugFolderName: this.slugFolderName,
        slugMediaName: this.media.metaFileName,
        data
      });
      this.edit_mode = false;
    },
    removePlanningMedia() {
      if (window.state.dev_mode === "debug") {
        console.log(
          `METHODS • PlanningItem: removePlanningMedia / ${this.media.metaFileName}`
        );
      }

      this.$alertify
        .okBtn(this.$t("yes"))
        .cancelBtn(this.$t("cancel"))
        .confirm(
          this.$t("sureToRemovePlanning"),
          () => {
            this.$emit("removePlanningMedia", this.media.metaFileName);
          },
          () => {}
        );
    }
  }
};
</script>
<style
  src="../../../../node_modules/vue2-timepicker/dist/VueTimepicker.css"
></style>
<style lang="scss">
.vue__time-picker .dropdown ul li:not([disabled]).active,
.vue__time-picker .dropdown ul li:not([disabled]).active:focus,
.vue__time-picker .dropdown ul li:not([disabled]).active:hover {
  background: var(--c-rouge);
}

.m_planningItem {
  position: relative;
  padding: calc(var(--spacing) / 1) 0;
  background-color: #fff;

  display: flex;
  flex-flow: column nowrap;

  > * {
    flex: 1 0 auto;
    padding: 0 var(--spacing);
  }

  &.is--active {
    color: #999;
  }
}

.m_planningItem--topbar {
  display: flex;
  flex-flow: row wrap;
  justify-content: space-between;
  line-height: 1;
}

.m_planningItem--editButtons {
  order: 1;

  button {
    svg {
      width: 0.8rem;
      height: 0.8rem;
    }
  }
}

.m_planningItem--name {
  font-size: 150%;
  // font-weight: bold;
  margin: 0;
  font-weight: 500;
  font-family: "Work Sans";

  span {
    cursor: pointer;

    &:hover {
      opacity: 0.7;
    }
  }
}

.m_planningItem--date {
  // background-color: #eee;
  // color: white;
  // padding: 0.4em;
  // line-height: 1;
  border-radius: 1em;
  font-size: 75%;

  display: flex;
  flex-flow: row wrap;
  align-items: center;

  > * {
    flex: 0 1 auto;
    margin-right: calc(var(--spacing) / 2);
  }
}

.m_planningItem--date--start {
}
.m_planningItem--date--duration {
  button {
    &:hover {
      opacity: 0.3;
    }
  }
}

.m_planningItem--submitButtons {
  display: flex;
  flex-flow: row wrap;
  justify-content: center;
}

.m_planningItem--notes {
  // border: 1px solid var(--c-noir);
  border-radius: 1px;
  flex: 1 1 auto !important;
  height: 100%;
  margin-top: calc(var(--spacing) / 1);
  padding: 0;
  // margin: 5px;
}

.m_planningItem--openButton {
  position: absolute;
  display: block;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  width: 100%;

  text-indent: 1800px;
}

.m_planningItem--notes--topbar {
  display: flex;
  align-items: center;
  margin-top: 1em;
  justify-content: space-between;
  h4 {
    margin: 0;
  }
}

.m_planningItem--notes--staticNote--content {
  overflow: hidden;
  &.is--excerpt {
    max-height: 10em;
  }

  p {
    margin: 0;
  }
}

.m_planningItem--notes--editNotes {
  // position: absolute;
  // top: 0;
  // bottom: 0;
  // left: 0;
  // right: 0;
  z-index: 1;
  height: 100%;
  // overflow: scroll;

  .ql-container {
  }

  .m_collaborativeEditor {
    height: 100%;
  }
}
</style>
