<template>
  <div
    class="_socketStatus"
    :class="{
      'is--connected': $root.is_connected,
    }"
  >
    Connected as {{ $api.socket.userID }}
    |
    <button
      type="button"
      :disabled="$root.is_connected"
      @click="$api.reconnectSocket"
    >
      connect
    </button>
    |
    <button
      type="button"
      :disabled="!$root.is_connected"
      @click="$api.disconnectSocket"
    >
      disconnect
    </button>

    <details>
      <summary>$api.store</summary>
      <pre>{{ $api.store }}</pre>
    </details>
  </div>
</template>
<script>
export default {
  props: {},
  components: {},
  data() {
    return {};
  },
  created() {},
  mounted() {},
  beforeDestroy() {},
  watch: {},
  computed: {},
  methods: {},
};
</script>
<style lang="scss" scoped>
._socketStatus {
  position: absolute;
  z-index: 1500;
  bottom: 0;
  right: 0;
  left: auto;
  width: calc(100% - calc(var(--spacing)));
  max-width: 50ch;
  padding: calc(var(--spacing) / 2);
  background: var(--c-rouge);

  margin: calc(var(--spacing) / 2);
  border-radius: 8px;

  &.is--connected {
    background: var(--c-vert);
  }
}
</style>
