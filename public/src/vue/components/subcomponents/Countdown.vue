<template>
  <div class="m_countdown" v-if="remaining_time">
    <div class="m_countdown--timer">
      <span>{{ remaining_time }}</span>
      <button type="button" @click="clear_timer">
        <svg class="svg-icon" viewBox="0 0 20 20">
          <path
            fill="none"
            d="M11.469,10l7.08-7.08c0.406-0.406,0.406-1.064,0-1.469c-0.406-0.406-1.063-0.406-1.469,0L10,8.53l-7.081-7.08
							c-0.406-0.406-1.064-0.406-1.469,0c-0.406,0.406-0.406,1.063,0,1.469L8.531,10L1.45,17.081c-0.406,0.406-0.406,1.064,0,1.469
							c0.203,0.203,0.469,0.304,0.735,0.304c0.266,0,0.531-0.101,0.735-0.304L10,11.469l7.08,7.081c0.203,0.203,0.469,0.304,0.735,0.304
							c0.267,0,0.532-0.101,0.735-0.304c0.406-0.406,0.406-1.064,0-1.469L11.469,10z"
          />
        </svg>
      </button>
    </div>
    <div v-if="originating_planning_item" class="m_countdown--planningName">
      <span
        @click="openPlanningItem(originating_planning_item.metaFileName)"
      >→ {{ originating_planning_item.name }}</span>
    </div>
  </div>
</template>
<script>
export default {
  props: {
    slugFolderName: String,
    project: Object
  },
  components: {},
  data() {
    return {};
  },
  created() {},
  mounted() {
    this.$eventHub.$on("countdown.start_timer", this.start_timer);
  },
  beforeDestroy() {
    this.$eventHub.$off("countdown.start_timer", this.start_timer);
  },
  watch: {
    "project.countdown_options": function() {
      if (!!this.project.countdown_options)
        this.$alertify
          .closeLogOnClick(true)
          .delay(4000)
          .success("Début du compte à rebours");
    }
  },
  computed: {
    remaining_time() {
      if (
        !this.project.countdown_options ||
        !Array.isArray(this.project.countdown_options) ||
        this.project.countdown_options.length === 0
      ) {
        return false;
      }
      let _remaining_time = this.$moment.duration(
        this.$moment(this.project.countdown_options[0].end_date).diff(
          this.$root.currentTime
        )
      );

      // si temps restant négatif
      // return false
      if (_remaining_time < 0) return false;

      _remaining_time = this.$root.format_duration_to_human({
        duration: _remaining_time,
        format: "h:mm:ss"
      });
      return _remaining_time;
    },
    originating_planning_item() {
      if (
        !this.remaining_time ||
        !this.project.countdown_options[0].hasOwnProperty("attached_to")
      )
        return false;

      const attached_to = this.project.countdown_options[0].attached_to;

      if (this.project.medias.hasOwnProperty(attached_to)) {
        return this.project.medias[attached_to];
      }
    }
  },
  methods: {
    start_timer({ duration, attached_to }) {
      const _m = this.$moment.duration(duration, "hh:mm a");
      let _end_date = this.$moment(this.$root.currentTime).add(_m);
      _end_date = _end_date.format("YYYY-MM-DD HH:mm:ss");

      // editproject
      this.$root.editFolder({
        type: "projects",
        slugFolderName: this.slugFolderName,
        data: {
          countdown_options: [
            {
              end_date: _end_date,
              attached_to
            }
          ]
        }
      });
    },
    clear_timer() {
      // editproject
      this.$root.editFolder({
        type: "projects",
        slugFolderName: this.slugFolderName,
        data: {
          countdown_options: []
        }
      });
    },
    openPlanningItem(metaFileName) {
      this.$root.settings.project_panes_in_order.find(
        p => p.key === "Planning"
      ).enabled = true;
      this.$root.settings.current_planning_media_metaFileName = metaFileName;
    }
  }
};
</script>
<style lang="scss" scoped>
.m_countdown {
  position: absolute;
  bottom: 0;
  right: 10%;
  width: auto;
  min-height: 2em;
  min-width: 70px;
  height: auto;
  background-color: #ff3e51;
  z-index: 11000;
  border-radius: 10px;
  margin: calc(var(--spacing));

  text-align: center;
  // font-family: "Work Sans";
}

.m_countdown--timer {
  display: flex;
  flex-flow: row nowrap;
  align-items: center;
  font-weight: 600;
  font-size: 2em;
  padding: calc(var(--spacing) / 2);

  font-variant-numeric: tabular-nums;
  // margin: calc(var(--spacing));

  > * {
    margin: 0 calc(var(--spacing) / 2);
  }
}

button {
  text-decoration: none;
  background-color: rgba(0, 0, 0, 0.15);
  border-radius: 50%;
  line-height: 0;
  width: 1.5em;
  height: 1.5em;
  display: flex;
  align-items: center;
  justify-content: center;

  .svg-icon {
    width: 50%;
    height: 50%;
  }
}

.m_countdown--planningName {
  background-color: rgba(0, 0, 0, 0.15);
  padding: 0 calc(var(--spacing) / 2);

  span {
    cursor: pointer;
  }
}

/* -----
SVG Icons - svgicons.sparkk.fr
----- */

.svg-icon {
  width: 1em;
  height: 1em;
}

.svg-icon path,
.svg-icon polygon,
.svg-icon rect {
  fill: currentColor;
}

.svg-icon circle {
  stroke: currentColor;
  stroke-width: 1;
}
</style>
