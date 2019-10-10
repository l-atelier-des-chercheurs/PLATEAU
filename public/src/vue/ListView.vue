<template>
  <div class="m_listview" name="list-complete" :duration="300" tag="div">
    <div :key="`create_document`" v-if="$root.show_create_document_modal">
      <form @submit.prevent="createDocument">
        <label>name</label>
        <input type="text" name="name" />
        <input type="submit" />
      </form>
    </div>

    <!-- <vue-good-table
      :columns="columns"
      :rows="documents_for_table"
      styleClass="vgt-table condensed"
    />-->

    <div class="m_document" v-for="(document, slug) in documents" :key="slug">
      <div>
        <div class="m_document--title">{{ document.name }}</div>
        <div class="m_document--meta">
          {{ available_fields.find(f => f.key === selected_field_to_show).label }}
          {{ document[selected_field_to_show] }}
        </div>
      </div>
      <div class="m_document--options">
        <button @click="$root.removeFolder({ type: 'documents', slugFolderName: slug })">Remove</button>
        <button @click="$root.openDocument(slug)">Open</button>
      </div>
    </div>
  </div>
</template>
<script>
export default {
  props: {
    documents: Object
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
    documents_for_table() {
      return Object.values(this.documents);
    }
  },
  methods: {
    createDocument(event) {
      console.log(`METHODS • ListView: createDocument`);

      let new_project_data = {
        name: event.target.name.value
      };

      this.$root.createFolder({ type: "documents", data: new_project_data });

      this.$root.show_create_document_modal = false;
    }
  }
};
</script>
<style lang="scss">
.m_listview {
  margin-left: 240px;
  // padding-top: 2em;

  // display: grid;
  // grid-template-columns: repeat(auto-fill, minmax(240px, 1fr));
  // grid-auto-rows: max-content;
  // grid-gap: calc(var(--spacing) * 2);

  > * {
  }
}

.m_document {
  width: 100%;
  border: 1px solid var(--active-color);
  background-color: white;
  margin: 1em;
  padding: 1em;
  max-width: 66ch;

  display: flex;

  > * {
    flex: 1 1 auto;

    &.m_document--options {
      flex: 0 0 auto;
    }
  }
}

.m_document--title {
  font-weight: 600;
}
.m_document--meta {
}
.m_document--options {
  color: var(--active-color);

  > * {
    padding: 0.1em 0.4em;
    border-radius: 2px;
  }
}
</style>
