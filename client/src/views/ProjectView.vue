<template>
  <div class="_projectView">
    <div class="_topbar">
      <router-link to="/projects" v-text="'⇠'" />

      <template v-if="is_loading">Chargement…</template>
      <template v-else-if="error">
        <div v-if="error.status === 404">Projet introuvable</div>
      </template>
      <template v-else>
        <div>
          <h1>{{ project.title }}</h1>
        </div>
        <PaneList class="_paneList" :panes.sync="projectpanes" />
      </template>
    </div>
    <div class="_panes" v-if="!is_loading && !error">
      <ProjectPanes
        :projectpanes.sync="projectpanes"
        :libpanes.sync="libpanes"
        :project="project"
        :media_focused.sync="media_focused"
        :opened_journal_entries.sync="opened_journal_entries"
      />
    </div>
  </div>
</template>

<script>
import PaneList from "@/components/nav/PaneList.vue";
import ProjectPanes from "@/components/ProjectPanes.vue";

export default {
  props: {},
  components: {
    PaneList,
    ProjectPanes,
  },
  data() {
    return {
      project_slug: this.$route.params.slug,
      is_loading: true,
      error: null,
      project: null,

      projectpanes: [],
      libpanes: [],
      media_focused: null,
      opened_journal_entries: [],
    };
  },
  created() {},
  mounted() {
    this.$api
      .getFolder({
        folder_type: "projects",
        folder_slug: this.project_slug,
      })
      .then((project) => {
        this.project = project;
        this.$api.join({ room: `projects/${this.project_slug}` });
      })
      .catch((err) => {
        this.error = err.response;
      })
      .then(() => (this.is_loading = false));
  },
  beforeDestroy() {
    this.$api.leave({ room: `projects/${this.project_slug}` });
  },
  watch: {
    $route: {
      handler() {
        let projectpanes = this.$route.query?.projectpanes;
        if (projectpanes) this.projectpanes = JSON.parse(projectpanes);

        let libpanes = this.$route.query?.libpanes;
        if (libpanes) this.libpanes = JSON.parse(libpanes);

        this.media_focused = this.$route.query?.media_focused || null;

        let opened_journal_entries = this.$route.query?.opened_journal_entries;
        if (opened_journal_entries)
          this.opened_journal_entries = JSON.parse(opened_journal_entries);
      },
      immediate: true,
    },
    projectpanes: {
      handler() {
        this.updateQueryPanes();
      },
      deep: true,
    },
    libpanes: {
      handler() {
        this.updateQueryPanes();
      },
      deep: true,
    },
    media_focused: {
      handler() {
        this.updateQueryPanes();
      },
      deep: true,
    },
    opened_journal_entries: {
      handler() {
        this.updateQueryPanes();
      },
      deep: true,
    },
  },
  computed: {
    // project() {
    // return window.store.projects?.find((p) => p.slug === this.project_slug);
    // },
  },
  methods: {
    updateQueryPanes() {
      let query = {};

      if (this.projectpanes)
        query.projectpanes = JSON.stringify(this.projectpanes);
      if (this.libpanes) query.libpanes = JSON.stringify(this.libpanes);
      if (this.media_focused) query.media_focused = this.media_focused;
      if (this.opened_journal_entries)
        query.opened_journal_entries = JSON.stringify(
          this.opened_journal_entries
        );
      if (
        this.$route.query &&
        JSON.stringify(this.$route.query) === JSON.stringify(query)
      )
        return false;

      this.$router.replace({ query });
    },
  },
};
</script>
<style lang="scss" scoped>
._projectView {
  height: 100vh;
  max-height: -webkit-fill-available;

  display: flex;
  flex-flow: column nowrap;
}

._topbar {
  display: flex;
  flex-flow: row wrap;
  align-items: center;
  // justify-content: space-between;
  gap: calc(var(--spacing));
  padding: var(--spacing);

  border-bottom: 1px solid black;

  ._paneList {
    flex: 1 1 auto;
  }
}

._panes {
  height: 100%;
  display: flex;
  flex-flow: row nowrap;
  overflow-y: auto;
  -webkit-overflow-scrolling: touch;

  > * {
    height: 100%;
  }
}
</style>
