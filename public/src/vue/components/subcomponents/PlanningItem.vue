<template>
  <form class="m_planningItem" :class="{ 'is--editable' :  edit_mode }" @submit.prevent="sendEdits">
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
        <span v-if="!edit_mode" v-html="media.name" />
        <input v-else type="text" v-model="edited_media_infos.name" ref="item_name" />
      </div>
    </div>
    <div class="m_planningItem--date" :title="$moment(media.planning_info_start).format('l LTS')">
      <div class="m_planningItem--date--start">
        07/02/2018 — 12:25
        <!-- <DateTime v-model="_planning_info_start" :twowaybinding="true" :read_only="false" /> -->
        <!-- <span v-if="!media.planning_info_start">début</span>
        <span>{{ $root.format_date_to_human(media.planning_info_start) + ' ' + $moment(media.planning_info_start).format('HH:mm') }}</span>-->
      </div>
      <div class="m_planningItem--date--end">
        07/02/2018 — 12:25
        <div
          v-if="media.planning_info_end"
        >{{ $root.format_date_to_human(media.planning_info_end) + ' ' + $moment(media.planning_info_end).format('HH:mm') }}</div>
      </div>
    </div>
    <div class="m_planningItem--submitButtons">
      <button
        type="button"
        class="button-small border-circled button-thin padding-verysmall margin-none bg-transparent"
        v-if="edit_mode"
        @click="edit_mode = !edit_mode"
      >{{ $t('cancel') }}</button>
      <button
        type="submit"
        class="button-small border-circled button-thin padding-verysmall margin-none bg-transparent"
        v-if="edit_mode"
      >{{ $t('submit') }}</button>
    </div>
    edit_mode : {{ edit_mode }}
    edited_media_infos : {{ edited_media_infos.name }}
    media.name : {{ media.name }}
  </form>
</template>
<script>
import DateTime from "./DateTime.vue";

export default {
  props: {
    media: Object,
    slugFolderName: String
  },
  components: {
    DateTime
  },
  data() {
    return {
      edit_mode: false,

      edited_media_infos: {
        name: this.media.name
      },

      planning_info_start: this.media.planning_info_start
    };
  },
  created() {},
  mounted() {},
  beforeDestroy() {},
  watch: {
    "media.name": function() {
      this.edited_media_infos.name = this.media.name;
    }
  },
  computed: {},
  methods: {
    sendEdits() {
      let data = {};

      const checkIfValueChanged = (key, val) => val !== this.media[key];

      Object.keys(this.edited_media_infos).map(k => {
        if (checkIfValueChanged(k, this.edited_media_infos[k])) {
          data[k] = this.edited_media_infos[k];
        }
      });

      debugger;

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
          `METHODS • Planning: removePlanningMedia / ${this.media.metaFileName}`
        );
      }

      this.$alertify
        .okBtn(this.$t("yes"))
        .cancelBtn(this.$t("cancel"))
        .confirm(
          this.$t("sureToRemovePlanning"),
          () => {
            this.$root.removeMedia({
              type: "projects",
              slugFolderName: this.slugFolderName,
              slugMediaName: this.media.metaFileName
            });
          },
          () => {}
        );
    }
  }
};
</script>
<style lang="scss">
.m_planningItem {
  padding: calc(var(--spacing) / 2) var(--spacing);
  background-color: #fff;
  margin: -1px;
  // padding: 15px;
  border: 1px solid black;

  > * {
    margin: calc(var(--spacing) / 4) 0;
  }
}

.m_planningItem--topbar {
  display: flex;
  flex-flow: row wrap;
  justify-content: space-between;
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
  font-weight: bold;
}

.m_planningItem--date {
  background-color: #eee;
  // color: white;
  padding: 0.4em;
  line-height: 1;
  border-radius: 1em;
  font-size: 75%;

  display: flex;
  flex-flow: row wrap;
  justify-content: space-between;

  > * {
    flex: 0 1 auto;
  }
}

.m_planningItem--date--start {
}

.m_planningItem--submitButtons {
  display: flex;
  flex-flow: row wrap;
  justify-content: center;
}
</style>

