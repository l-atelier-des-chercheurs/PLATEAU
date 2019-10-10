<template>
  <transition-group
    name="fade_fast"
    :duration="300"
    tag="div"
    class="m_documentview"
    :style="documentStyles"
  >
    <template v-if="!$root.preview_mode">
      <div class="m_page m_page_singleColumn" :key="`flow`">
        <div class="m_page--container">
          <div class="m_page--container--header">
            <DocumentHeader :slugDocumentName="slugDocumentName" v-model="document.header_text" />
          </div>
          <div class="m_page--container--content">
            <!-- <pre>{{ flowed_content }}</pre> -->
            <transition-group name="module-switch" :duration="300">
              <template v-for="(m, index) in flowed_content">
                <hr
                  v-if="m.type === 'page_separator_indicator'"
                  :key="m.id"
                  :data-pagenumber="m.page_number + 1"
                  class="m_page--container--content--pageFlowSeparator"
                />
                <Module
                  v-else
                  :key="m.metaFileName"
                  :slugDocumentName="slugDocumentName"
                  :media="m"
                  :allow_moveup="index > 0"
                  :allow_movedown="index < flowed_content.length - 1"
                  @moveUp="moveThisModuleUp(m.metaFileName)"
                  @moveDown="moveThisModuleDown(m.metaFileName)"
                  @remove="removeThisModule(m.metaFileName)"
                />
              </template>
              <AddModuleBar
                key="AddModuleBar"
                :type="'documents'"
                :slugDocumentName="slugDocumentName"
                @appendModuleToList="appendModuleToList"
                @createModuleAndAppendToList="createModuleAndAppendToList"
              />
            </transition-group>
          </div>
        </div>
      </div>
    </template>
    <template v-else>
      <div class="m_page m_page_paged" v-for="(page, index) in paged_content" :key="index">
        <div class="m_page--pageNumber">
          <div>{{ (index + 1) }} / {{ paged_content.length }}</div>
        </div>

        <div class="m_page--container">
          <div class="m_page--container--header">
            <DocumentHeader :slugDocumentName="slugDocumentName" v-model="document.header_text" />
          </div>
          <div class="m_page--container--content">
            <transition-group name="module-switch" :duration="300">
              <Module
                v-for="m in page"
                :key="m.metaFileName"
                :slugDocumentName="slugDocumentName"
                :media="m"
                @moveUp="moveThisModuleUp(m.metaFileName)"
                @moveDown="moveThisModuleDown(m.metaFileName)"
                @remove="removeThisModule(m.metaFileName)"
              />
            </transition-group>
          </div>
        </div>
      </div>
    </template>

    <div class="m_fakepage m_page_paged" :key="`fakepage`">
      <div class="m_page--container">
        <div class="m_page--container--header">
          <DocumentHeader :slugDocumentName="slugDocumentName" v-model="document.header_text" />
        </div>
        <div class="m_page--container--content" ref="pageContent">
          <Module
            ref="fakeitems"
            v-for="(m, index) in orderedMedias"
            :key="m.metaFileName"
            :slugDocumentName="slugDocumentName"
            :media="m"
            :index="index"
            :allow_moveup="index > 0"
            :allow_movedown="index < orderedMedias.length - 1"
            @moveUp="moveThisModuleUp(m.metaFileName)"
            @moveDown="moveThisModuleDown(m.metaFileName)"
            @remove="removeThisModule(m.metaFileName)"
          />
        </div>
      </div>
    </div>

    <!-- <div class="m_page m_page_paged" key="fakepage2">
      <div class="m_page--container">
        <div class="m_page--container--header">
          <DocumentHeader :slugDocumentName="slugDocumentName" v-model="document.header_text" />
        </div>
        <div class="m_page--container--content" ref="pageContent"></div>
      </div>
    </div>-->

    <SideMenu key="sidemenu" v-if="$root.state.mode === 'live'" />
  </transition-group>
</template>
<script>
import AddModuleBar from "./components/subcomponents/AddModuleBar.vue";
import Module from "./components/subcomponents/Module.vue";
import DocumentHeader from "./components/subcomponents/DocumentHeader.vue";
import SideMenu from "./components/subcomponents/SideMenu.vue";

export default {
  props: {
    document: Object,
    slugDocumentName: String
  },
  components: {
    AddModuleBar,
    Module,
    DocumentHeader,
    SideMenu
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
  mounted() {
    this.max_height_per_page = 804;

    setInterval(() => {
      this.layoutPages();
    }, 1000);
  },
  beforeDestroy() {},
  watch: {
    orderedMedias: {
      handler() {
        // used to let m_fakepage time to update
        this.$nextTick(() => {
          this.layoutPages();
        });
      },
      deep: true
    }
  },
  computed: {
    orderedMedias() {
      // retourner la liste des médias
      if (
        !Array.isArray(this.document.medias_slugs) ||
        this.document.medias_slugs.length === 0 ||
        this.document.medias.length === 0
      ) {
        return [];
      }

      const media_refs = Object.entries(this.document.medias);

      const ordered_medias = this.document.medias_slugs.reduce((acc, s) => {
        // s.slugMediaName;
        const corresponding_media = media_refs.find(
          ([key, value]) => key === s.slugMediaName
        );

        if (corresponding_media) {
          acc.push(corresponding_media[1]);
        } else {
          console.log(
            `COMPUTED • DocumentView: orderedMedias failed to find media for slug ${s.slugMediaName}`
          );
          // TODO: it would make sens to rebuild document.medias_slugs to remove references to medias that have been removed
          // but this would only be needed if there is a discrepancy at some point between medias_slugs and the actual list of medias
          // which is not very probable
          // still, this could cause bugs when reordering medias_slugs for example
        }

        return acc;
      }, []);

      return ordered_medias;
    },
    documentStyles() {
      return {
        "--content-max-height": this.max_height_per_page + "px"
      };
    }
  },
  methods: {
    layoutPages() {
      // this method reads the height of items that were laid out in fakeitems and layouts the whole thing inside paged_content
      if (!this.$refs.fakeitems || !this.$refs.pageContent) return;

      // paged_content : all content placed on pages
      this.paged_content = [];
      // flowed_content : all content in the right order with a key to state the page its on
      this.flowed_content = [];

      this.paged_content.push([]);

      let current_height = 0;
      let current_page = 0;

      // console.log(`— about to get module height and attempt page layout`);
      this.max_height_per_page = this.$refs.pageContent.offsetHeight;

      Array.from(this.$refs.fakeitems).map((m, index) => {
        const item = this.orderedMedias[index];
        item._index = index;

        const module_height = m.$el.offsetHeight;
        item._module_height = module_height;

        // console.log(
        //   `Module index ${index} of type ${
        //     item["type"]
        //   }, height = ${module_height}, current_height = ${current_height}, max_height_per_page = ${
        //     this.max_height_per_page
        //   }`
        // );

        if (current_height + module_height > this.max_height_per_page) {
          // console.log(`Will create a new page`);
          this.paged_content.push([]);
          current_height = 0;
          current_page++;

          this.flowed_content.push({
            type: "page_separator_indicator",
            page_number: current_page,
            id: `page_separator${current_page}`
          });
        }

        this.paged_content[this.paged_content.length - 1].push(item);

        const flowed_item = Object.assign({}, item, { _page: current_page });
        this.flowed_content.push(flowed_item);

        current_height += module_height;
      });

      // read for each item its height
    },

    createModuleAndAppendToList({ type }) {
      if (this.$root.state.dev_mode === "debug") {
        console.log(
          `METHODS • DocumentView: createModuleAndAppendToList with type ${type}`
        );
      }

      this.$eventHub.$on("socketio.media_created_or_updated", d => {
        this.$eventHub.$off("socketio.media_created_or_updated");
        this.appendModuleToList({ slugMediaName: d.metaFileName });
      });

      this.createModule(type);
    },
    appendModuleToList({ slugMediaName }) {
      if (this.$root.state.dev_mode === "debug") {
        console.log(
          `METHODS • DocumentView: appendModuleToList with slugMediaName ${slugMediaName}`
        );
      }
      let medias_slugs = Array.isArray(this.document.medias_slugs)
        ? this.document.medias_slugs.slice()
        : [];

      medias_slugs.push({
        slugMediaName
      });

      this.$root.editFolder({
        type: "documents",
        slugFolderName: this.slugDocumentName,
        data: {
          medias_slugs
        }
      });
    },
    createModule(type) {
      if (this.$root.state.dev_mode === "debug") {
        console.log(`METHODS • DocumentView: createModule with type ${type}`);
      }

      this.$root.createMedia({
        slugFolderName: this.slugDocumentName,
        type: "documents",
        additionalMeta: {
          rawData: "",
          type
        }
      });
    },
    removeThisModule(metaFileName) {
      if (this.$root.state.dev_mode === "debug") {
        console.log(
          `METHODS • DocumentView: removeThisModule / slugMediaName = ${metaFileName}`
        );
      }

      this.$root.removeMedia({
        type: "documents",
        slugFolderName: this.slugDocumentName,
        slugMediaName: metaFileName
      });

      if (this.document.medias_slugs.length > 0) {
        let new_medias_slugs = this.document.medias_slugs.filter(
          m => m.slugMediaName !== metaFileName
        );

        this.$root.editFolder({
          type: "documents",
          slugFolderName: this.slugDocumentName,
          data: {
            medias_slugs: new_medias_slugs
          }
        });
      }
    },
    moveThisModuleUp(metaFileName) {
      console.log(
        `METHODS • DocumentView: moveThisModuleUp / metaFileName = ${metaFileName}`
      );

      const index = this.document.medias_slugs.findIndex(
        m => m.slugMediaName === metaFileName
      );

      const from = index;
      const to = index - 1;

      if (to < 0) {
        console.log(`Can’t move item up more`);
        return;
      }

      let new_medias_slugs = this.document.medias_slugs.slice();
      new_medias_slugs.splice(to, 0, new_medias_slugs.splice(from, 1)[0]);

      this.$root.editFolder({
        type: "documents",
        slugFolderName: this.slugDocumentName,
        data: {
          medias_slugs: new_medias_slugs
        }
      });
    },
    moveThisModuleDown(metaFileName) {
      console.log(
        `METHODS • DocumentView: moveThisModuleDown / index = ${index}`
      );

      const index = this.document.medias_slugs.findIndex(
        m => m.slugMediaName === metaFileName
      );

      const from = index;
      const to = index + 1;

      if (to > this.document.medias_slugs.length) {
        console.log(`Can’t move item up more`);
        return;
      }

      let new_medias_slugs = this.document.medias_slugs.slice();
      new_medias_slugs.splice(to, 0, new_medias_slugs.splice(from, 1)[0]);

      this.$root.editFolder({
        type: "documents",
        slugFolderName: this.slugDocumentName,
        data: {
          medias_slugs: new_medias_slugs
        }
      });
    },
    updateModuleHeight(metaFileName) {}
  }
};
</script>
<style lang="scss">
.m_documentview {
  position: relative;
  padding-top: 8em;
  margin-bottom: 8em;
  pointer-events: none;

  > * {
    pointer-events: auto;
  }
}

.m_page,
.m_fakepage {
  position: relative;
  margin: 0 auto;
  width: var(--page-width);
  background-color: white;
  box-shadow: 0px 2px 16px 0px rgba(0, 0, 0, 0.1);
  padding: var(--page-padding-vert) var(--page-padding-sides);

  &.m_page_singleColumn {
    // min-height: var(--page-height);
  }
  &.m_page_paged {
    height: var(--page-height);
    margin-bottom: 3em;

    .m_page--container {
      position: absolute;
      width: calc(100% - var(--page-padding-sides) * 2);
      height: calc(100% - var(--page-padding-vert) * 2);
      display: flex;
      flex-flow: column nowrap;

      .m_page--container--content {
        flex: 1 1 auto;
        overflow: hidden;
      }
    }
  }
}

.m_fakepage {
  visibility: hidden;
  position: absolute;
  top: 0;
}

.m_page--container--content--pageFlowSeparator {
  position: relative;
  width: calc(100% + 2 * var(--page-padding-sides));
  margin: var(--spacing) calc(-1 * var(--page-padding-sides));
  overflow: visible;
  border-color: currentColor;
  border-style: dashed;
  color: gray;

  &::before {
    content: "Page\00a0"attr(data-pagenumber);
    position: absolute;
    left: 100%;
    margin: 0 var(--spacing);
    top: 0;
    transform: translateY(-50%);
    line-height: 0;
  }
}

.m_page--container--header {
  width: 100%;
  flex: 0 0 4em;
  color: var(--active-color);

  margin-bottom: var(--spacing);
  padding-bottom: var(--spacing);
  border-bottom: var(--border-width) solid var(--border-color);
}
.m_page--pageNumber {
  position: absolute;
  top: 0.25in;
  right: 0.3in;

  font-size: smaller;
  text-transform: uppercase;
}
</style>
