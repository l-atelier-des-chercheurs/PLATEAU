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
        <PaneList class="_paneList" :panes.sync="panes" />
      </template>
    </div>
    <div class="_panes" v-if="!is_loading && !error">
      <ProjectPanes :panes.sync="panes" :project="project" />
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

      panes: [],
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
        let panes = this.$route.query?.panes;
        if (panes) {
          panes = JSON.parse(panes);
          this.panes = panes;
        }
      },
      immediate: true,
    },
    panes: {
      handler() {
        this.updateQuery({ panes: this.panes });
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
    updateQuery({ panes }) {
      console.log(`PaneList / methods: updateQuery`);

      // only update if necessary
      if (this.$route.query?.panes)
        if (this.$route.query.panes === JSON.stringify(panes)) return false;

      const query = {
        panes: JSON.stringify(panes),
      };
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
