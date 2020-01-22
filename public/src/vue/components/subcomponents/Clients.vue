<template>
  <div class="m_clientsList" :class="{ 'is--slave': $root.settings.is_slave }">
    <button
      type="button"
      class="m_clientsList--indicator"
      @click="showClientList = !showClientList"
      :content="$t('autre appareils connectés')"
      v-tippy="{
        placement: 'bottom',
        delay: [600, 0]
      }"
    >
      <span>{{ uniqueClientsExceptSelf.length }}</span>
    </button>

    <label>
      <input type="checkbox" v-model="$root.settings.is_slave" />
      esclave
    </label>

    <button
      type="button"
      v-if="
        !$root.settings.is_slave &&
          connectedSlaves.length > 0 &&
          $root.do_navigation.view === 'Project'
      "
      @click="sendCurrentPanesToSlaves"
    >
      Envoyer la disposition aux esclaves
    </button>

    <div class="m_clientsList--list" v-if="showClientList">
      <button
        type="button"
        class="m_clientsList--list--close"
        @click="showClientList = false"
      >
        ×
      </button>

      <template v-if="uniqueClientsExceptSelf.length === 0"
        >Aucune autres appareils connectés</template
      >

      <template v-else>
        <label>{{ $t("autres appareils connectés") }}</label>
        <br />
        <span
          class="m_clientsList--list--client"
          :key="client.id"
          v-for="client in uniqueClientsExceptSelf"
        >
          <template v-if="client.data.hasOwnProperty('author')">{{
            client.data.author.name
          }}</template>
          <template v-else>{{ $t("anonyme") }}</template>
          <template
            v-if="
              client.data.hasOwnProperty('is_slave') && client.data.is_slave
            "
          >
            (esclave)
          </template>
        </span>
      </template>
    </div>
  </div>
</template>
<script>
export default {
  props: {},
  components: {},
  data() {
    return {
      showClientList: false
    };
  },
  created() {},
  mounted() {
    this.$eventHub.$on(
      "clients.receivedDataFromClient",
      this.gotInfoFromClient
    );
  },
  beforeDestroy() {
    this.$eventHub.$off(
      "clients.receivedDataFromClient",
      this.gotInfoFromClient
    );
  },
  watch: {},
  computed: {
    uniqueClients() {
      return this.$root.state.clients;
    },
    uniqueClientsExceptSelf() {
      return this.uniqueClients.filter(
        c => c.id !== this.$root.$socketio.socket.id
      );
    },
    connectedSlaves() {
      return this.uniqueClientsExceptSelf.filter(c => c.data.is_slave);
    }
  },
  methods: {
    sendCurrentPanesToSlaves() {
      this.connectedSlaves.map(c => {
        this.$socketio.socket.emit("sendDataToSpecificClient", {
          socketid: c.id,
          data: {
            project_panes_in_order: this.$root.settings.project_panes_in_order,
            current_planning_media_metaFileName: this.$root.settings
              .current_planning_media_metaFileName,
            current_composition_media_metaFileName: this.$root.settings
              .current_composition_media_metaFileName,
            openProject: this.$root.do_navigation.current_slugProjectName
          }
        });
      });
    },
    gotInfoFromClient(d) {
      if (!this.$root.settings.is_slave) return false;

      console.log(
        `Clients • METHODS / gotInfoFromClient : name = ${JSON.stringify(d)}`
      );

      const _data = d.data;

      if (
        _data.hasOwnProperty("openProject") &&
        _data.openProject !== this.$root.do_navigation.current_slugProjectName
      )
        this.$root.openProject(_data.openProject);

      if (_data.hasOwnProperty("project_panes_in_order"))
        this.$root.settings.project_panes_in_order =
          _data.project_panes_in_order;

      if (_data.hasOwnProperty("current_planning_media_metaFileName"))
        this.$root.settings.current_planning_media_metaFileName =
          _data.current_planning_media_metaFileName;

      if (_data.hasOwnProperty("current_composition_media_metaFileName"))
        this.$root.settings.current_composition_media_metaFileName =
          _data.current_composition_media_metaFileName;

      this.$nextTick(() => {
        this.$eventHub.$emit(
          "project.set_pane_size",
          _data.project_panes_in_order
        );
      });
    }
  }
};
</script>
<style scoped lang="scss">
.m_clientsList--indicator {
  padding: 0 calc(var(--spacing) / 4);
  display: flex;
  align-items: center;

  &::after {
    content: url("data:image/svg+xml;charset=US-ASCII,%3Csvg%20xmlns%3D%22http%3A//www.w3.org/2000/svg%22%20viewBox%3D%220%200%2084%2084%22%3E%0A%20%20%3Ctitle%3Etext%20copie%208%3C/title%3E%0A%20%20%3Cg%20id%3D%22Calque_6%22%20data-name%3D%22Calque%206%22%3E%0A%20%20%20%20%3Cg%20id%3D%22flc%22%3E%0A%20%20%20%20%20%20%3Cg%3E%0A%20%20%20%20%20%20%20%20%3Cpath%20d%3D%22M55%2C54.13a10.45%2C10.45%2C0%2C0%2C0-5.75-4.62s-2-1-7-1-7%2C1-7%2C1a10.47%2C10.47%2C0%2C0%2C0-5.76%2C4.62%2C10.92%2C10.92%2C0%2C0%2C0-1%2C3.65v1.4a3.15%2C3.15%2C0%2C0%2C0%2C2.81%2C3.36H53a3.15%2C3.15%2C0%2C0%2C0%2C2.8-3.36v-1.4A6.08%2C6.08%2C0%2C0%2C0%2C55%2C54.13M34.64%2C36.06c0%2C4.21%2C2.66%2C10.51%2C7.71%2C10.51s7.72-6.3%2C7.72-10.51a7.69%2C7.69%2C0%2C0%2C0-7.72-7.7%2C7.59%2C7.59%2C0%2C0%2C0-7.71%2C7.7%22/%3E%0A%20%20%20%20%20%20%20%20%3Cg%3E%0A%20%20%20%20%20%20%20%20%20%20%3Cpath%20d%3D%22M33.79%2C47.69a9%2C9%2C0%2C0%2C0-4.63-3.22s-1.82-1-6.45-1-6.45%2C1-6.45%2C1a9.87%2C9.87%2C0%2C0%2C0-5.48%2C4.34%2C7.46%2C7.46%2C0%2C0%2C0-.84%2C3.36v1.12a2.86%2C2.86%2C0%2C0%2C0%2C2.67%2C3.09H25.66a8.12%2C8.12%2C0%2C0%2C1%2C1-3A13.1%2C13.1%2C0%2C0%2C1%2C33.79%2C47.69Z%22/%3E%0A%20%20%20%20%20%20%20%20%20%20%3Cpath%20d%3D%22M22.71%2C41.53c4.63%2C0%2C7.16-5.89%2C7.16-9.81a7.16%2C7.16%2C0%2C0%2C0-14.32%2C0C15.41%2C35.64%2C17.94%2C41.53%2C22.71%2C41.53Z%22/%3E%0A%20%20%20%20%20%20%20%20%3C/g%3E%0A%20%20%20%20%20%20%20%20%3Cg%3E%0A%20%20%20%20%20%20%20%20%20%20%3Cpath%20d%3D%22M50.77%2C47.69a9%2C9%2C0%2C0%2C1%2C4.63-3.22s1.82-1%2C6.46-1%2C6.45%2C1%2C6.45%2C1a9.85%2C9.85%2C0%2C0%2C1%2C5.47%2C4.34%2C7.46%2C7.46%2C0%2C0%2C1%2C.84%2C3.36v1.12A2.86%2C2.86%2C0%2C0%2C1%2C72%2C56.38h-13a8.12%2C8.12%2C0%2C0%2C0-1-3A13.12%2C13.12%2C0%2C0%2C0%2C50.77%2C47.69Z%22/%3E%0A%20%20%20%20%20%20%20%20%20%20%3Cpath%20d%3D%22M62%2C41.53c-4.63%2C0-7.16-5.89-7.16-9.81a7.16%2C7.16%2C0%2C0%2C1%2C14.31%2C0C69.15%2C35.64%2C66.63%2C41.53%2C62%2C41.53Z%22/%3E%0A%20%20%20%20%20%20%20%20%3C/g%3E%0A%20%20%20%20%20%20%3C/g%3E%0A%20%20%20%20%3C/g%3E%0A%20%20%3C/g%3E%0A%3C/svg%3E%0A");
    display: block;
    width: 20px;
    height: 20px;
    margin-right: calc(var(--spacing) / 4);
  }

  span {
    margin: 0 calc(var(--spacing) / 4);
  }
}
.m_clientsList {
  position: relative;
  // position: absolute;
  // top: 50%;
  // transform: translateY(-50%);
  // left: 100%;
  // margin-left: calc(var(--spacing) / 4);
  font-size: 70%;

  background-color: white;
  border: 1px solid black;
  border-radius: 2px;
  padding: 0;
  margin: 0 calc(var(--spacing));

  z-index: 10001;

  // margin-left: var(--spacing);

  display: flex;
  flex-flow: row wrap;
  align-items: center;

  &.is--slave {
    position: absolute;
    bottom: 0;
    left: 50%;
    transform: translateX(-50%);
    margin: calc(var(--spacing)) 0;
  }

  > * {
    margin-right: calc(var(--spacing) / 2);
  }
}

.m_clientsList--list {
  position: absolute;
  top: 100%;
  margin-top: calc(var(--spacing) / 4);

  left: 0%;
  background-color: white;
  border: 1px solid black;
  // transform: translate3d(-50%, 0, 0);

  width: 220px;
  max-height: 200px;
  overflow: auto;

  // .margin-sides-medium;
  padding: calc(var(--spacing) / 4);

  border-radius: 2px;
  max-width: 220px;
  // .bg-blanc;
  // border: 2px solid @c-noir;

  label {
    color: currentColor;
  }

  .m_clientsList--list--close {
    position: absolute;
    top: 0;
    right: 0;
    min-height: 0;
    padding: calc(var(--spacing) / 2);
    background-color: transparent;
    font-size: 2em;
    line-height: 0.5;
  }

  .m_clientsList--list--client {
    &:not(:last-child)::after {
      content: ",";
      margin-right: 0.2em;
    }
  }
}
</style>
