<template>
  <div>
    <div>{{ media.name }}</div>
    <div
      :title="$moment(media.date_modified).format('l LTS')"
    >{{ $root.format_date_to_human(media.date_modified) + ' ' + $moment(media.date_modified).format('HH:mm') }}</div>
    <div>
      <button
        type="button"
        class="button-small border-circled button-thin padding-verysmall margin-none bg-transparent"
        @click="removePlanningMedia(media.metaFileName)"
      >{{ $t('remove') }}</button>
    </div>
  </div>
</template>
<script>
export default {
  props: {
    media: Object,
    slugFolderName: String
  },
  components: {},
  data() {
    return {};
  },
  created() {},
  mounted() {},
  beforeDestroy() {},
  watch: {},
  computed: {},
  methods: {
    removePlanningMedia(metaFileName) {
      if (window.state.dev_mode === "debug") {
        console.log(
          `METHODS • Planning: removePlanningMedia / ${metaFileName}`
        );
      }

      this.$alertify
        .okBtn(this.$t("yes"))
        .cancelBtn(this.$t("cancel"))
        .confirm(
          this.$t("sureToRemovePlanning"),
          () => {
            this.$root.removeMedia({
              type: "projects",
              slugFolderName: this.slugFolderName,
              slugMediaName: metaFileName
            });
          },
          () => {}
        );
    }
  }
};
</script>
<style lang="scss"></style>

