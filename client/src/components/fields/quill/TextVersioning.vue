<template>
  <div>
    <sl-button
      @click="toggleArchives"
      size="small"
      caret
      :active="show_archives"
    >
      Archives
    </sl-button>

    <sl-dialog ref="showArchives" label="Archives" class="">
      <div class="_archives" v-if="show_archives">
        <!-- not sure why sl-select doesnt work here -->
        <select v-model="selected_archive_filename">
          <option
            v-for="(archive, index) in archives"
            :value="archive.filename"
            :key="archive.filename"
            v-text="
              formatDateToPrecise(archive.date) +
              ' - version ' +
              (archives.length - index)
            "
          />
        </select>

        <!-- <sl-select v-sl-model="selected_archive_filename">
          <sl-menu-item
            v-for="archive in archives"
            :value="archive.filename"
            :key="archive.filename"
            v-text="formatDateToPrecise(archive.date)"
          />
        </sl-select> -->

        <div
          v-if="
            archive_shown &&
            (archive_shown.content || archive_shown.content === '')
          "
        >
          <!-- <DateField :show_detail_initially="true" :date="archive_shown.date" /> -->
          <div class="_archiveText" v-html="archive_shown.content" />
        </div>
      </div>
      <sl-button
        slot="footer"
        variant="primary"
        @click="restoreVersion(archive_shown.content)"
      >
        {{ $t("restore_this_version") }}
      </sl-button>
    </sl-dialog>
  </div>
</template>
<script>
export default {
  props: {
    folder_type: String,
    folder_slug: String,
    meta_slug: String,
  },
  components: {},
  data() {
    return {
      archives: null,
      show_archives: false,
      selected_archive_filename: "",
    };
  },
  created() {},
  mounted() {},
  beforeDestroy() {},
  watch: {},
  computed: {
    archive_shown() {
      if (this.archives)
        return this.archives.find(
          (a) => a.filename === this.selected_archive_filename
        );
      return false;
    },
  },
  methods: {
    async getArchives() {
      this.archives = await this.$api.getArchives({
        folder_type: this.folder_type,
        folder_slug: this.folder_slug,
        meta_slug: this.meta_slug,
      });

      this.archives.reverse();

      this.selected_archive_filename = this.archives[0].filename;
    },
    toggleArchives() {
      this.show_archives = !this.show_archives;
      if (this.show_archives) {
        this.getArchives();
        this.$refs.showArchives.show();
      } else {
        this.$refs.showArchives.hide();
      }
    },
    restoreVersion(content) {
      this.$emit("restore", content);
      this.toggleArchives();
    },
  },
};
</script>
<style lang="scss" scoped>
._archives {
  // border: 1px solid black;
  // display: grid;
  // grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  // gap: 1px;
  // padding: 1px;

  > * {
    // background: white;
    // padding: calc(var(--spacing) / 2);
  }
}

._archiveText {
  background: var(--color-Journal);
  padding: calc(var(--spacing) / 2);
  width: 100%;
  // max-height: 150px;
  // overflow: auto;

  ::v-deep {
    @import "./mainText.scss";
  }
}
</style>
