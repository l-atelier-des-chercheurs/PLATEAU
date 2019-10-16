<template>
  <div class="m_list" name="list-complete" :duration="300" tag="div">
    <div :key="`create_project`" v-if="$root.show_create_project_modal">
      <form @submit.prevent="createProject">
        <label>name</label>
        <input type="text" name="name" />
        <input type="submit" />
      </form>
    </div>

    <div class v-for="(project, slug) in projects" :key="slug">
      <div>
        <div class>{{ project.name }}</div>
        <div class>
          {{ available_fields.find(f => f.key === selected_field_to_show).label }}
          {{ project[selected_field_to_show] }}
        </div>
      </div>
      <div class>
        <button @click="$root.removeFolder({ type: 'projects', slugFolderName: slug })">Remove</button>
        <button @click="$root.openProject(slug)">Open</button>
      </div>
    </div>
  </div>
</template>
<script>
export default {
  props: {
    projects: Object
  },
  components: {},
  data() {
    return {
      selected_field_to_show: "date_created",
      available_fields: [
        {
          key: "date_created",
          label: "Created on"
        },
        {
          key: "date_modified",
          label: "Last edited"
        }
      ],
      columns: [
        {
          label: "Name",
          field: "name"
        },
        {
          label: "Created On",
          field: "date_created",
          type: "date",
          dateInputFormat: "yyyy-MM-dd HH:m:s",
          dateOutputFormat: "PPPPpp"
        },
        {
          label: "Last edited On",
          field: "date_modified",
          type: "date",
          dateInputFormat: "yyyy-MM-dd HH:m:s",
          dateOutputFormat: "PPPPpp"
        }
        // {
        //   label: "Last Modified On",
        //   field: "date_modified",
        //   type: "date",
        //   dateInputFormat: "yyyy-MM-dd",
        //   dateOutputFormat: "MMM Do yy"
        // }
      ]
    };
  },
  created() {},
  mounted() {},
  beforeDestroy() {},
  watch: {},
  computed: {
    projects_for_table() {
      return Object.values(this.projects);
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
</style>
