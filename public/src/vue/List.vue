<template>
  <div class="m_panes">
    <div class="m_panes--leftPane">
      <div class="m_panes--leftPane--title">Plateau</div>
      <div class="m_panes--leftPane--versionNumber">
        <small>{{ $root.state.appVersion }}</small>
      </div>
      <div class="m_panes--leftPane--text">
        Plateau est un outil de documentation pour les projets et workshops
        participatifs.
      </div>

      <AuthorsList
        class="m_panes--leftPane--authors"
        :authors="$root.store.authors"
      />
    </div>
    <div class="m_panes--rightPane">
      <div class="m_bar">
        <button
          type="button"
          @click="show_create_project_box = !show_create_project_box"
          :class="{ 'is--active': show_create_project_box }"
          :key="`new_project`"
        >
          <svg
            class="picto"
            version="1.1"
            xmlns="http://www.w3.org/2000/svg"
            xmlns:xlink="http://www.w3.org/1999/xlink"
            x="0px"
            y="0px"
            width="11.4px"
            height="11.4px"
            viewBox="0 0 10 10"
            style="enable-background: new 0 0 11.4 11.4"
            xml:space="preserve"
          >
            <path
              class="st0"
              d="M5.3,8.9H3.7L3.2,8.4V5.8H0.5L0,5.3V3.7l0.5-0.5h2.7V0.5L3.7,0h1.6l0.5,0.5v2.7l2.7,0l0.5,0.5v1.6L8.4,5.8 l-2.7,0v2.7L5.3,8.9z M4.2,7.9h0.6V5.3l0.5-0.5l2.7,0V4.2l-2.7,0L4.8,3.7V1H4.2v2.7L3.7,4.2H1v0.6h2.7l0.5,0.5V7.9z"
            />
          </svg>
          {{ $t("new_project") }}
        </button>
      </div>

      <div class="m_list">
        <div class="m_list--filters" v-if="$root.current_author">
          <label>Trier</label>
          <div class="switch switch-xs">
            <input
              class="switch"
              id="show_only_my_content"
              type="checkbox"
              v-model="show_only_my_content"
            />
            <label for="show_only_my_content">{{
              $t("only_my_projects")
            }}</label>
          </div>
          <div class="_keywordFilter">
            <label v-html="$t('by_keyword:')"></label>

            <button
              v-for="keyword in $root.getAllKeywordsFrom(this.projects)"
              :key="keyword.text"
              :class="[
                keyword.classes,
                {
                  'is--active':
                    $root.settings.project_filter.keyword === keyword.text,
                },
              ]"
              @click="$root.setProjectKeywordFilter(keyword.text)"
            >
              {{ keyword.text }}
            </button>
          </div>
        </div>

        <transition-group
          class="m_list--projects"
          name="list-complete"
          :duration="300"
          tag="div"
        >
          <CreateProject
            v-if="show_create_project_box"
            @close="show_create_project_box = false"
            :read_only="read_only"
            :key="`create_project`"
          />
          <ProjectThumb
            v-for="sortedProject in sortedProjects"
            :project="projects[sortedProject.slugProjectName]"
            :selected_field_to_show="selected_field_to_show"
            :key="sortedProject.slugProjectName"
          />
        </transition-group>
      </div>
    </div>
  </div>
</template>
<script>
import ProjectThumb from "./components/subcomponents/ProjectThumb.vue";
import AuthorsList from "./components/subcomponents/AuthorsList.vue";
import CreateProject from "./components/subcomponents/CreateProject.vue";

export default {
  props: {
    projects: Object,
  },
  components: {
    ProjectThumb,
    AuthorsList,
    CreateProject,
  },
  data() {
    return {
      selected_field_to_show: "date_created",
      available_fields: [
        {
          key: "date_created",
        },
        {
          key: "date_modified",
        },
      ],

      currentSort: {
        field: "date_created",
        type: "date",
        order: "descending",
      },

      show_only_my_content: false,
      show_filters: false,
      show_search: false,
      show_create_project_box: false,
    };
  },
  created() {},
  mounted() {},
  beforeDestroy() {},
  watch: {},
  computed: {
    sortedProjects: function () {
      var sortable = [];

      if (!this.projects || this.projects.length === 0) {
        return [];
      }

      for (let slugProjectName in this.projects) {
        let orderBy;
        const project = this.projects[slugProjectName];

        if (this.currentSort.type === "date") {
          orderBy = +this.$moment(
            project[this.currentSort.field],
            "YYYY-MM-DD HH:mm:ss"
          );
        } else if (this.currentSort.type === "alph") {
          orderBy = project[this.currentSort.field];
        }

        if (this.$root.settings.project_filter.name !== "") {
          if (
            !project.name
              .toLowerCase()
              .includes(this.$root.settings.project_filter.name.toLowerCase())
          )
            continue;
        }

        if (this.show_only_my_content && this.$root.current_author) {
          if (
            !project.hasOwnProperty("authors") ||
            !Array.isArray(project.authors) ||
            !project.authors.some(
              (k) =>
                k.slugFolderName === this.$root.current_author.slugFolderName
            )
          ) {
            continue;
          }
        }

        if (
          !this.$root.settings.project_filter.keyword &&
          !this.$root.settings.project_filter.author
        ) {
          sortable.push({ slugProjectName, orderBy });
          continue;
        }

        if (
          !!this.$root.settings.project_filter.keyword &&
          !!this.$root.settings.project_filter.author
        ) {
          // only add to sorted array if project has this keyword
          if (
            project.hasOwnProperty("keywords") &&
            typeof project.keywords === "object" &&
            project.keywords.filter(
              (k) => k.title === this.$root.settings.project_filter.keyword
            ).length > 0
          ) {
            if (
              project.hasOwnProperty("authors") &&
              typeof project.authors === "object" &&
              project.authors.filter(
                (k) => k.name === this.$root.settings.project_filter.author
              ).length > 0
            ) {
              sortable.push({ slugProjectName, orderBy });
            }
          }
          continue;
        }
        // if a project keyword filter is set
        if (!!this.$root.settings.project_filter.keyword) {
          // only add to sorted array if project has this keyword
          if (
            project.hasOwnProperty("keywords") &&
            typeof project.keywords === "object" &&
            project.keywords.filter(
              (k) => k.title === this.$root.settings.project_filter.keyword
            ).length > 0
          ) {
            sortable.push({ slugProjectName, orderBy });
          }
          continue;
        }

        if (!!this.$root.settings.project_filter.author) {
          // only add to sorted array if project has this keyword
          if (
            project.hasOwnProperty("authors") &&
            typeof project.authors === "object" &&
            project.authors.filter(
              (k) => k.name === this.$root.settings.project_filter.author
            ).length > 0
          ) {
            sortable.push({ slugProjectName, orderBy });
          }
          continue;
        }
      }

      // if there is no project in sortable, it is probable that filters
      // were too restrictive
      if (sortable.length === 0) {
        // lets remove filters if there are any
        this.$nextTick(() => {
          // this.$root.settings.project_filter.keyword = false;
        });
      }

      let sortedSortable = sortable.sort(function (a, b) {
        let valA = a.orderBy;
        let valB = b.orderBy;
        if (typeof a.orderBy === "string" && typeof b.orderBy === "string") {
          valA = valA.toLowerCase();
          valB = valB.toLowerCase();
        }
        if (valA < valB) {
          return -1;
        }
        if (valA > valB) {
          return 1;
        }
        return 0;
      });

      if (this.currentSort.order === "descending") {
        sortedSortable.reverse();
      }

      return sortedSortable;
    },
  },
  methods: {},
};
</script>
<style lang="scss" scoped>
.m_panes {
  height: 100%;
  display: flex;
  flex-flow: row nowrap;
}

.m_panes--leftPane {
  padding: 10vh 0 10vh 4%;
  flex: 1 1 33%;
  background-color: var(--c-vert);
  overflow-y: auto;
}
.m_panes--leftPane--title {
  text-transform: uppercase;
  font-weight: 800;
  font-family: "Work Sans";
  font-size: 3vw;
  letter-spacing: 0.03em;
  padding-right: 20px;

  border-bottom: 1px solid black;
  line-height: 1;
  padding-bottom: 10px;
  margin-bottom: 10px;
}
.m_panes--leftPane--versionNumber {
  font-family: "Fira Code";
}
.m_panes--leftPane--text {
  margin-top: 50px;
  padding-right: 20%;
}
.m_panes--leftPane--authors {
  margin-top: 50px;
  padding-right: 20%;
}

.m_panes--rightPane {
  flex: 1 1 66%;

  position: relative;

  display: flex;
  flex-flow: row nowrap;

  > * {
    flex: 1;
  }
}

.m_list {
  flex-basis: 50%;
  overflow-y: auto;
  padding: calc(10vh + 2.55em) 0 var(--spacing);

  .m_list--filters {
    padding: calc(var(--spacing) / 1.5) calc(var(--spacing));
    // margin: calc(var(--spacing) / 2) calc(var(--spacing));
  }

  .m_list--projects {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
    grid-auto-rows: max-content;
    // padding: calc(10vh + 2.55em) calc(var(--spacing) * 2) 50px;

    > * {
      // background: white;
      // box-shadow: 0px 2px 6px rgba(150, 150, 150, 0.8);
      // border-radius: 8px;
      // border: 1px solid var(--c-noir);
      background-color: var(--c-gris);

      padding: calc(var(--spacing) / 1.5) calc(var(--spacing));
      margin: calc(var(--spacing) / 2) calc(var(--spacing));
    }
  }
}

.m_bar {
  order: 2;
  padding: calc(10vh + 2.55em) calc(var(--spacing) * 2) 50px;
  flex-basis: 50%;

  > button {
    border: 1px solid black;
    padding: calc(var(--spacing) / 2) calc(var(--spacing));
    margin: calc(var(--spacing) / 2) calc(var(--spacing));

    &.is--active {
      background-color: black;
      color: white;

      svg {
        fill: white;
      }
    }
  }
}

._keywordFilter {
  button.is--active {
    background-color: var(--c-rouge);
    border-radius: 4px;
  }
}
</style>
