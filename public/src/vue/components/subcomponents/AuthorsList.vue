<template>
  <!-- <Modal
    ref="modal"
    @close="$emit('close')"
    :typeOfModal="'LargeAndScroll'"
    :prevent_close="prevent_close"
    :is_loading="is_loading"
  >
    <template slot="header">
      <span class>{{ $t("authors_list") }}</span>
    </template>

    <template slot="preview"> -->

  <div class="m_authorsList">
    <label>{{ $t("users_connected") }}</label>
    <div class="margin-sides-medium margin-vert-small">
      <div
        v-if="$root.state.local_options.force_login && !$root.current_author"
      >
        <strong>{{ $t("login_to_access") }}</strong>
      </div>

      <small>{{ $t("when_logged_as_author_content_will_be_tagged") }}</small>
      <!-- <button
        v-if="!show_detail"
        type="button"
        class="buttonLink margin-left-none padding-left-none"
        @click="show_detail = !show_detail"
      >
        + {{ $t("more_informations") }}
      </button>
      <div>
        <small v-if="show_detail">{{
          $t("more_informations_on_authors")
        }}</small>
      </div> -->
    </div>
    <transition-group tag="div" name="list-complete">
      <div class :key="'createAuthor'">
        <div class="m_authorsList--createAuthor">
          <button
            type="button"
            @click="openCreateAuthorPanel = true"
            v-if="openCreateAuthorPanel == false"
            class="m_authorsList--createAuthor--createButton bg-bleumarine"
          >
            {{ $t("create_an_author") }}
          </button>
          <CreateAuthor
            v-else
            @close="openCreateAuthorPanel = false"
            :read_only="read_only"
          />
        </div>
      </div>

      <template v-if="Object.keys(sorted_authors).length > 0">
        <div v-for="author in sorted_authors" :key="author.slugFolderName">
          <Author :author="author" @close="$emit('close')" />
        </div>
      </template>
    </transition-group>

    <div v-if="clients_not_identified.length > 0">
      <label>
        {{ $t("devices_not_identified") }}
      </label>
      <div v-for="client in clients_not_identified" :key="client.id">
        {{ $root.getDeviceName(client) }}
        <!-- {{ client.id }} -->
        <template
          v-if="
            $root.$socketio.socket.id &&
            $root.$socketio.socket.id.startsWith(client.id)
          "
          >({{ $t("self").toLowerCase() }})
        </template>
      </div>
    </div>
    <!-- <label
      >Liste des personnes sur Plateau
      <ul>
        <li>en premier, celles qui sont dans ce projet</li>
        <li>
          indiquer les panneaux et contenus ouverts, au clic = copie exact de
          leur disposition
        </li>
      </ul>
    </label> -->
  </div>
  <!-- </template>
  </Modal> -->
</template>
<script>
import Author from "./../subcomponents/Author.vue";
import CreateAuthor from "./../subcomponents/CreateAuthor.vue";

export default {
  props: {
    authors: {
      type: Object,
      default: {},
    },
    prevent_close: {
      type: Boolean,
      default: false,
    },
  },
  components: {
    Author,
    CreateAuthor,
  },
  data() {
    return {
      openCreateAuthorPanel: false,
      editAuthorSlug: false,
      show_detail: false,
      is_loading: false,
    };
  },

  created() {},
  mounted() {
    this.is_loading = true;
    this.$socketio.listFolders({ type: "authors" });
    this.$eventHub.$once("socketio.authors.folders_listed", () => {
      this.is_loading = false;
    });
  },
  beforeDestroy() {},

  watch: {},
  computed: {
    sorted_authors() {
      let sorted_authors = Object.values(this.authors).sort((a, b) =>
        a.name && b.name ? a.name.localeCompare(b.name) : false
      );

      // move connected authors to top
      if (this.$root.unique_clients) {
        sorted_authors.map((a, idx) => {
          const client_identified_as_author = this.$root.unique_clients.find(
            (c) => {
              return (
                c.data &&
                c.data.author &&
                c.data.author.slugFolderName === a.slugFolderName
              );
            }
          );
          if (client_identified_as_author)
            sorted_authors.unshift(
              // remove the found item, in-place (by index with splice),
              // returns an array of a single item removed
              sorted_authors.splice(idx, 1)[0]
            );
        });
      }

      // move current author to top
      if (this.$root.current_author) {
        sorted_authors.some(
          (item, idx) =>
            item.slugFolderName === this.$root.current_author.slugFolderName &&
            sorted_authors.unshift(
              // remove the found item, in-place (by index with splice),
              // returns an array of a single item removed
              sorted_authors.splice(idx, 1)[0]
            )
        );
      }

      return sorted_authors;
    },
    connected_clients_and_authors() {
      return this.$root.state.clients.map((c) => {
        if (
          c.hasOwnProperty("data") &&
          c.data.hasOwnProperty("author") &&
          c.data.author.slugFolderName
        ) {
          const fitting_author = this.sorted_authors.find(
            (a) => a.slugFolderName === c.data.author.slugFolderName
          );
          if (fitting_author) c._author = fitting_author;
        }
        return c;
      });
    },
    clients_not_identified() {
      return this.$root.state.clients.filter(
        (c) =>
          !c.hasOwnProperty("data") ||
          !c.data.hasOwnProperty("author") ||
          !c.data.author.slugFolderName
      );
    },
    connected_authors() {
      return this.$root.state.clients;
    },
  },
  methods: {},
};
</script>
<style lang="scss" scoped>
.m_authorsList {
  // display: flex;
  // flex-flow: row wrap;
  // align-items: flex-start;
  // justify-content: flex-start;
  margin-bottom: calc(var(--spacing) * 2);

  > * {
    // .margin-sides-small;
    // .margin-small;
    // flex: 0 0 240px;
    // min-height: 200px;
    // max-width: 160px;
  }

  .m_authorsList--createAuthor,
  .m_authorsList--editAuthor {
    margin: calc(var(--spacing)) 0;
    padding: calc(var(--spacing) / 2);

    position: relative;
    border: 4px dashed rgba(0, 0, 0, 0.3);
    // background-color: #fff;
    // border: 4px solid @c-gris_clair;
    border-radius: 4px;
    font-size: 0.8em;

    display: flex;
    flex-flow: none;
    align-items: center;
    justify-content: center;
    max-width: none;

    .m_authorsList--createAuthor--createButton {
      max-height: none;
      display: block;
      border: none;

      // .bg-gris_tresclair;
    }

    > form {
      width: 100%;

      label {
        display: block;
      }
    }
  }
}
</style>
