<template>
  <div class="m_sidemenu">
    <label>
      edit
      <input type="checkbox" v-model="preview_mode" />
    </label>
  </div>
</template>
<script>
export default {
  props: {},
  components: {},
  data() {
    return {
      preview_mode: !this.$root.preview_mode
    };
  },
  created() {},
  mounted() {},
  beforeDestroy() {},
  watch: {
    preview_mode: function() {
      this.$root.preview_mode = !this.preview_mode;
    }
  },
  computed: {},
  methods: {}
};
</script>
<style lang="scss">
.m_sidemenu {
  position: fixed;
  bottom: 5vmin;
  right: 5vmin;

  background: white;
  // border: 2px solid #ddd;

  label {
    display: block;
    cursor: pointer;
    padding: var(--spacing);
  }
}
</style>
