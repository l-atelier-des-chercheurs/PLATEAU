<template>
  <transition-group
    class="m_list"
    name="list-complete"
    :duration="300"
    tag="div"
  >
    <div :key="`create_project`" v-if="$root.show_create_project_modal">
      <form @submit.prevent="createProject">
        <label>{{ $t("name") }}</label>
        <input type="text" name="name" />
        <input type="submit" />
      </form>
    </div>
    <ProjectThumb
      v-for="sortedProject in sortedProjects"
      :project="projects[sortedProject.slugProjectName]"
      :selected_field_to_show="selected_field_to_show"
      :key="sortedProject.slugProjectName"
    />
  </transition-group>
</template>
<script>
import ProjectThumb from "./components/subcomponents/ProjectThumb.vue";

export default {
  props: {
    projects: Object
  },
  components: {
    ProjectThumb
  },
  data() {
    return {
      selected_field_to_show: "date_created",
      available_fields: [
        {
          key: "date_created"
        },
        {
          key: "date_modified"
        }
      ],

      currentSort: {
        field: "date_created",
        type: "date",
        order: "descending"
      },

      show_filters: false,
      show_search: false
    };
  },
  created() {},
  mounted() {},
  beforeDestroy() {},
  watch: {},
  computed: {
    sortedProjects: function() {
      var sortable = [];

      if (!this.projects || this.projects.length === 0) {
        return [];
      }

      for (let slugProjectName in this.projects) {
        let orderBy;

        if (this.currentSort.type === "date") {
          orderBy = +this.$moment(
            this.projects[slugProjectName][this.currentSort.field],
            "YYYY-MM-DD HH:mm:ss"
          );
        } else if (this.currentSort.type === "alph") {
          orderBy = this.projects[slugProjectName][this.currentSort.field];
        }

        if (this.$root.settings.project_filter.name !== "") {
          if (
            !this.projects[slugProjectName].name
              .toLowerCase()
              .includes(this.$root.settings.project_filter.name.toLowerCase())
          )
            continue;
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
            this.projects[slugProjectName].hasOwnProperty("keywords") &&
            typeof this.projects[slugProjectName].keywords === "object" &&
            this.projects[slugProjectName].keywords.filter(
              k => k.title === this.$root.settings.project_filter.keyword
            ).length > 0
          ) {
            if (
              this.projects[slugProjectName].hasOwnProperty("authors") &&
              typeof this.projects[slugProjectName].authors === "object" &&
              this.projects[slugProjectName].authors.filter(
                k => k.name === this.$root.settings.project_filter.author
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
            this.projects[slugProjectName].hasOwnProperty("keywords") &&
            typeof this.projects[slugProjectName].keywords === "object" &&
            this.projects[slugProjectName].keywords.filter(
              k => k.title === this.$root.settings.project_filter.keyword
            ).length > 0
          ) {
            sortable.push({ slugProjectName, orderBy });
          }
          continue;
        }

        if (!!this.$root.settings.project_filter.author) {
          // only add to sorted array if project has this keyword
          if (
            this.projects[slugProjectName].hasOwnProperty("authors") &&
            typeof this.projects[slugProjectName].authors === "object" &&
            this.projects[slugProjectName].authors.filter(
              k => k.name === this.$root.settings.project_filter.author
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

      let sortedSortable = sortable.sort(function(a, b) {
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
    }
  },
  methods: {
    createProject(event) {
      console.log(`METHODS • ListView: createProject`);

      let new_project_data = {
        name: event.target.name.value
      };
      this.$root.createFolder({ type: "projects", data: new_project_data });
      this.$root.show_create_project_modal = false;
    }
  }
};
</script>
<style lang="scss">
.m_list {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  grid-auto-rows: max-content;

  > * {
    border-right: 1px solid black;
    border-bottom: 1px solid black;
    padding: var(--spacing);
  }
}
</style>
