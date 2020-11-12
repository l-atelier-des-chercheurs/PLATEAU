<template>
  <div class="m_team">
    <div class="_sidebyside_radio">
      <label for="users">
        <input type="radio" id="users" value="users" v-model="current_tab" />
        <span>{{ $t("users") }}</span>
      </label>
      <label for="chats">
        <input type="radio" id="chats" value="chats" v-model="current_tab" />
        <span>{{ $t("channels") }}</span>
      </label>
    </div>

    <AuthorsList
      v-if="current_tab === 'users'"
      class="m_team--authorsList"
      :authors="$root.store.authors"
    />

    <div v-if="current_tab === 'chats'">
      <label> discussions en lien avec ce projet </label>
    </div>
    <!-- <Clients /> -->
  </div>
</template>
<script>
// import Clients from "./subcomponents/Clients.vue";
import AuthorsList from "./subcomponents/AuthorsList.vue";

export default {
  props: {},
  components: {
    // Clients,
    AuthorsList,
  },
  data() {
    return {
      current_tab: "users",
    };
  },
  created() {},
  mounted() {},
  beforeDestroy() {},
  watch: {},
  computed: {
    uniqueClients() {
      return this.$root.state.clients;
    },
    uniqueClientsExceptSelf() {
      return this.uniqueClients.filter(
        (c) => c.id !== this.$root.$socketio.socket.id
      );
    },
    self() {
      return this.uniqueClients.filter(
        (c) => c.id === this.$root.$socketio.socket.id
      );
    },
    connectedSlaves() {
      const slaves = this.uniqueClientsExceptSelf.filter(
        (c) => c.data.is_slave
      );
      this.$root.settings.has_slave_connected = slaves.length > 0;
      return slaves;
    },
  },
  methods: {
    urlToPortrait(preview) {
      if (!preview) return "";
      let pathToSmallestThumb = preview.find((m) => m.size === 180).path;

      let url =
        this.$root.state.mode === "export_publication"
          ? `./${pathToSmallestThumb}`
          : `/${pathToSmallestThumb}`;
      return url;
    },
  },
};
</script>
<style lang="scss" scoped>
.m_team {
  background-color: var(--color-Team);
  // padding: 0 var(--spacing);
  height: 100%;

  display: flex;
  flex-flow: column nowrap;
  overflow-y: auto;

  > ._sidebyside_radio {
    flex: 0 0 auto;
  }
}

._sidebyside_radio {
}

.m_team--authorsList {
  padding: calc(var(--spacing) / 2) var(--spacing);
}
</style>
