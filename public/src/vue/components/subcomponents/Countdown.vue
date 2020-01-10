<template>
  <div class="m_countdown" v-if="remaining_time">
    <span>{{ remaining_time }}</span>
    <button type="button" @click="clear_timer">
      ×
    </button>
  </div>
</template>
<script>
export default {
  props: {},
  components: {},
  data() {
    return {
      end_date: false
    };
  },
  created() {},
  mounted() {
    this.$eventHub.$on("countdown.start_timer", this.start_timer);
  },
  beforeDestroy() {
    this.$eventHub.$off("countdown.start_timer", this.start_timer);
  },
  watch: {},
  computed: {
    remaining_time() {
      if (!this.end_date) {
        return false;
      }
      let _remaining_time = this.$moment.duration(
        this.end_date.diff(this.$root.currentTime)
      );
      _remaining_time = this.$root.format_duration_to_human({
        duration: _remaining_time,
        format: "h:mm:ss"
      });
      return _remaining_time;
    }
  },
  methods: {
    start_timer(d) {
      const _m = this.$moment.duration(d, "hh:mm a");
      this.end_date = this.$moment(this.$root.currentTime).add(_m);
    },
    clear_timer() {
      this.end_date = false;
    }
  }
};
</script>
<style lang="scss">
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
  border-radius: 2px;
  padding: 0 calc(var(--spacing) / 2);
  margin: calc(var(--spacing));

  text-align: center;
  display: flex;
  flex-flow: row nowrap;
  align-items: center;

  > * {
    display: inline-block;
    margin: 0 calc(var(--spacing) / 2);
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
  }
}
</style>