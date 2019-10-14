<template>
  <div class="m_project">
    <div>
      <div>Projet : {{ project.name }}</div>
      <div>Panneau de writeup (un seul pour commencer)</div>
      <WriteUp :slugFolderName="slugProjectName" :medias="project.medias" :read_only="read_only" />
    </div>
    <MediaLibrary :slugProjectName="slugProjectName" :project="project" :read_only="false" />
    <div class>
      <div class>Projection/composition</div>
    </div>
  </div>
</template>
<script>
import MediaLibrary from "./components/MediaLibrary.vue";
import WriteUp from "./components/WriteUp.vue";

export default {
  props: {
    project: Object,
    slugProjectName: String
  },
  components: {
    MediaLibrary,
    WriteUp
  },
  data() {
    return {
      paged_content: [[]],
      flowed_content: [],
      modules_height: [],
      max_height_per_page: 0
    };
  },
  created() {},
  mounted() {},
  beforeDestroy() {},
  watch: {},
  computed: {},
  methods: {}
};
</script>
<style lang="scss">
.m_project {
  position: relative;
  height: 100%;
  display: flex;
  flex-flow: row nowrap;
  overflow-y: auto;
  -webkit-overflow-scrolling: touch;

  > * {
    border-right: 1px solid black;
    padding: 1em;
  }

  .m_library {
    flex: 1 1 auto;
  }
}
</style>
