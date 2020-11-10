<template>
  <div class="m_team" :class="{}">
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

    <div v-if="current_tab === 'users'">
      <AuthorsList :authors="$root.store.authors" />

      <label
        >Liste des personnes sur Plateau
        <ul>
          <li>en premier, celles qui sont dans ce projet</li>
          <li>
            indiquer les panneaux et contenus ouverts, au clic = copie exact de
            leur disposition
          </li>
        </ul>
      </label>

      <label> self </label>
    </div>

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
  methods: {},
};
</script>
<style lang="scss" scoped>
.m_team {
  background-color: var(--color-Team);
  // padding: var(--spacing);
  height: 100%;

  display: flex;
  flex-flow: column nowrap;
}

._sidebyside_radio {
}
</style>
