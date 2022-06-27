<template>
  <div>
    {{ file.slug }}
    <br />
    <textarea v-model="new_text" />
    <sl-button @click="saveText">Save</sl-button>
  </div>
</template>
<script>
export default {
  props: {
    project_slug: String,
    file: Object,
  },
  components: {},
  data() {
    return {
      new_text: this.file.content,
    };
  },
  created() {},
  mounted() {},
  beforeDestroy() {},
  watch: {
    "file.content"() {
      this.new_text = this.file.content;
    },
  },
  computed: {},
  methods: {
    async saveText() {
      const new_meta = {
        content: this.new_text,
      };

      await this.$api.updateItem({
        folder_type: "projects",
        folder_slug: this.project_slug,
        meta_slug: this.file.slug,
        new_meta,
      });
    },
  },
};
</script>
<style lang="scss" scoped>
textarea {
  width: 100%;
  min-height: 13ch;
}
</style>
