<template>
  <div class="_mediaLibrary">
    <label for="add_file" class="_boldBtn">
      <sl-button variant="text">
        <span>importer</span>
      </sl-button>
      <input
        type="file"
        multiple="multiple"
        id="add_file"
        name="file"
        accept=""
        style="
          width: 1px;
          height: 1px;
          overflow: hidden;
          position: absolute;
          opacity: 0;
        "
        @change="updateInputFiles($event)"
      />
    </label>
    <!-- <sl-button @click="createText">Créer du texte</sl-button>
    <sl-button
      type="button"
      @click="show_create_link_field = !show_create_link_field"
    >
      Ajouter un site web
    </sl-button> -->
    <UploadFiles
      v-if="selected_files.length > 0"
      :selected_files="selected_files"
      :folder_type="'projects'"
      :folder_slug="project.slug"
      @importedMedias="mediaJustImported"
    />

    <form
      v-if="show_create_link_field"
      class="input-validation-required"
      @submit.prevent="createLink"
    >
      <input type="url" required v-model="url_to" />
      <br />
      <input type="submit" />
    </form>

    Médias = {{ medias.length }}
    <div class="_mediaLibrary--lib">
      <MediaCard
        v-for="file of medias"
        :key="file.slug"
        :file="file"
        :project_slug="project.slug"
      />
    </div>
  </div>
</template>
<script>
import UploadFiles from "@/components/fields/UploadFiles";
import MediaCard from "@/components/MediaCard.vue";

export default {
  props: {
    project: Object,
  },
  components: {
    UploadFiles,
    MediaCard,
  },
  data() {
    return {
      fetch_status: null,
      fetch_error: null,

      selected_files: [],

      show_create_link_field: false,
      url_to: "https://latelier-des-chercheurs.fr/",
    };
  },
  created() {},
  mounted() {},
  beforeDestroy() {},
  watch: {},
  computed: {
    medias() {
      return this.project.files.filter((f) => !f.is_journal) || [];
    },
  },
  methods: {
    updateInputFiles($event) {
      this.selected_files = Array.from($event.target.files);
      $event.target.value = "";
    },
    mediaJustImported(list_of_added_metas) {
      this.$alertify
        .closeLogOnClick(true)
        .delay(4000)
        .success(list_of_added_metas);
      this.selected_files = [];
    },

    async createText() {
      const filename = "texte.txt";
      const content = "PLOP PLIP";

      const additional_meta = {
        caption: "plip",
      };

      this.$api.uploadText({ filename, content, additional_meta });
    },

    async createLink() {
      const filename = this.url_to;
      const content = this.url_to;

      const additional_meta = {
        type: "url",
      };

      this.$api.uploadText({ filename, content, additional_meta });
    },
  },
};
</script>
<style lang="scss" scoped>
._mediaLibrary {
  background: var(--color-MediaLibrary);
  height: 100%;
  overflow: auto;
}

._mediaLibrary--lib {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(100px, 1fr));
  gap: calc(var(--spacing) / 2);
  padding: calc(var(--spacing) / 2);
}
</style>
