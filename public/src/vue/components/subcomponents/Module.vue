<template>
  <div
    class="m_module"
    :class="[`m_module_${media.type}`, {
      'is--hovered': is_hovered
    }]"
    @mouseenter="is_hovered = true"
    @mouseleave="is_hovered = false"
  >
    <transition name="fade_fast">
      <div v-show="is_hovered && !$root.preview_mode" class="m_module--left_menu">
        <label :title="media._module_height">{{ media.type }}</label>
        <!-- <label>{{ media._module_height }}</label> -->
        <button type="button" :disabled="!allow_moveup" @click="moveUp" title="Move Up">
          <svg
            version="1.1"
            xmlns="http://www.w3.org/2000/svg"
            xmlns:xlink="http://www.w3.org/1999/xlink"
            x="0px"
            y="0px"
            width="16px"
            height="16px"
            viewBox="0 0 16 16"
            style="enable-background:new 0 0 16 16;"
            xml:space="preserve"
          >
            <polyline class="st0" points="6,6 8,4 10,6 		" />
            <line class="st0" x1="8" y1="13" x2="8" y2="4" />
          </svg>
        </button>
        <button type="button" :disabled="!allow_movedown" @click="moveDown" title="Move Down">
          <svg
            version="1.1"
            xmlns="http://www.w3.org/2000/svg"
            xmlns:xlink="http://www.w3.org/1999/xlink"
            x="0px"
            y="0px"
            width="16px"
            height="16px"
            viewBox="0 0 16 16"
            style="enable-background:new 0 0 16 16;"
            xml:space="preserve"
          >
            <polyline class="st0" points="10,10 8,12 6,10 		" />
            <line class="st0" x1="8" y1="3" x2="8" y2="12" />
          </svg>
        </button>
        <button type="button" @click="remove" title="Remove">
          <svg
            version="1.1"
            xmlns="http://www.w3.org/2000/svg"
            xmlns:xlink="http://www.w3.org/1999/xlink"
            x="0px"
            y="0px"
            width="16px"
            height="16px"
            viewBox="0 0 16 16"
            style="enable-background:new 0 0 16 16;"
            xml:space="preserve"
          >
            <polyline class="st0" points="10,6 8,8 6,6 		" />
            <polyline class="st0" points="6,10 8,8 10,10 		" />
          </svg>
        </button>
      </div>
    </transition>
    <div class="m_module--content" :class="[{
      },`m_module--content_${media.type}`]">
      <template v-if="media.type === 'text'">
        <MediaContent
          :context="'edit'"
          :slugFolderName="slugDocumentName"
          :media="media"
          :read_only="read_only"
          v-model="media.content"
        />
        <p class="mediaCaption">{{ media.caption }}</p>
      </template>
      <template v-else-if="media.type === 'embed'">
        <div class="m_module--content--embed">
          <form class="m_module--content--embed--topbar" @submit="updateEmbedLink">
            <label for="embedLink">URL</label>
            <input type="url" id="embedLink" name="embedLink" v-model="embed_link" />
            <input type="submit" v-if="!$root.preview_mode" value="update" />
          </form>
          <iframe
            v-if="!!media.embed_link"
            class="m_module--content--embed--iframe"
            :src="media.embed_link"
            width="100%"
            height="100%"
          />
        </div>
      </template>
      <template v-else-if="media.type === 'image'">
        <MediaContent
          :context="'preview'"
          :slugFolderName="slugDocumentName"
          :media="media"
          :read_only="read_only"
          :element_width_for_sizes="1600"
          v-model="media.content"
        />
        <p class="mediaCaption">{{ media.caption }}</p>
      </template>
      <DataModule
        v-else-if="media.type === 'data'"
        :media="media"
        @updateSubtype="v => updateSubtype(v)"
      />
      <template v-else>{{ media.type }}</template>
    </div>
  </div>
</template>
<script>
import MediaContent from "./MediaContent.vue";
import DataModule from "./DataModule.vue";
import { setTimeout } from "timers";

export default {
  props: {
    media: Object,
    preview: {
      type: Boolean,
      default: false
    },
    slugDocumentName: String,
    allow_moveup: Boolean,
    allow_movedown: Boolean
  },
  components: {
    MediaContent,
    DataModule
  },
  data() {
    return {
      is_hovered: false,
      embed_link: ""
    };
  },
  created() {
    this.embed_link = this.media.embed_link;
  },
  mounted() {},
  beforeDestroy() {},
  watch: {
    "media.embed_link": function() {
      this.embed_link = this.media.embed_link;
    }
  },
  computed: {
    data_current_subtype() {
      if (!this.media.dataviz_type) return false;
      return this.data_module.subtypes_available.find(
        s => s.key === this.media.dataviz_type
      );
    }
  },
  methods: {
    moveUp() {
      this.$emit("moveUp");
    },
    moveDown() {
      this.$emit("moveDown");
    },
    remove() {
      this.$emit("remove");
    },
    updateEmbedLink(e) {
      this.$root.editMedia({
        type: "documents",
        slugFolderName: this.slugDocumentName,
        slugMediaName: this.media.metaFileName,
        data: {
          embed_link: this.embed_link
        }
      });
      e.preventDefault();
    },
    updateSubtype(key) {
      this.$root.editMedia({
        type: "documents",
        slugFolderName: this.slugDocumentName,
        slugMediaName: this.media.metaFileName,
        data: {
          dataviz_type: key
        }
      });
    }
  }
};
</script>
<style lang="scss">
.m_module {
  position: relative;
  // padding and not margin to get the right height on the item for layout
  padding: var(--spacing) 0;
  max-height: var(--content-max-height);
  // overflow-x: visible;
  // overflow-y: hidden;

  &.is--hovered {
    z-index: 1;
  }

  h2 {
    margin: 0;
    font-size: 1.9em;
    font-weight: 700;
    line-height: 1.25;
  }
  p {
    margin: 0;
  }
}

.m_module--content {
  min-height: 4em;
  // background-color: rgba(12, 41, 05, 0.12);
}

.m_module--content_image {
  position: relative;
  background-color: #fff;
  // background-color: var(--active-color);

  &.is--empty {
    display: flex;
    justify-content: center;
    align-items: center;
    align-content: center;
    // background-image: url(data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAcAAAAHCAYAAADEUlfTAAAALklEQVQYV2NkQAMmVVf/n2nTZgQJgwkYQJZAkUSXAPHBOrFJgIxmxCVBvp0gnQD44CaK2OOb1gAAAABJRU5ErkJggg==);
  }

  label {
    cursor: pointer;
    background-color: var(--active-color);
    color: white;
    padding: 0px 5px 5px;
  }

  #upload_image {
    opacity: 0;
    position: absolute;
    z-index: -1;
  }

  .removeImage {
    position: absolute;
    top: 0;
    right: 0;
    text-shadow: 0px 1px 15px white;
    padding: 0 5px;
    color: var(--active-color);
  }

  figure {
    margin: 0;
  }
  figcaption {
    font-size: 0.8em;
  }

  img {
    display: block;
    max-height: calc(var(--content-max-height) - var(--spacing) * 2);
  }
}

.m_module--content--embed {
  // background-color: var(--active-color);
  // padding: var(--spacing);
  display: flex;
  flex-flow: column nowrap;

  > * {
    flex: 1 1 auto;
  }

  .m_module--content--embed--topbar {
    flex: 0 0 auto;

    background-color: var(--active-color);

    color: white;
    width: 100%;
    margin: 0 auto;
    padding: 4px;
    padding-right: 0;
    border-radius: 2px 2px 0 0;
    font-size: 80%;

    display: flex;
    justify-content: space-between;
    align-content: center;
    align-items: center;

    label {
      font-weight: 900;
      letter-spacing: 0.1em;
    }

    > * {
      flex: 0 0 auto;
      margin: 0 4px;
    }

    > input {
      flex: 1 1 auto;
      border: 0;
      padding: 0.4em;
      border-radius: 4px;
      color: black;

      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }

    > input[type="submit"] {
      flex: 0 0 auto;
      // border: 2px solid var(--active-color);
      border-radius: 4px;
      background: white;
      color: var(--active-color);
      padding: 0.2em 0.4em 0.4em;
      cursor: pointer;
    }
  }

  iframe {
    border-radius: 0 0 2px 2px;
    border: 0;
    height: 5in;
    border: 2px solid var(--active-color);
    border-top: 0;
  }
}

.m_module--left_menu {
  --button-size: 22.5px;

  position: absolute;
  right: 100%;
  top: 0;
  min-height: 100%;
  color: var(--active-color);

  width: calc(22.5px + var(--spacing) * 4);

  // margin: var(--spacing);
  padding: var(--spacing) calc(var(--spacing) * 2);

  display: flex;
  flex-flow: column nowrap;
  align-items: flex-end;

  &::before {
    content: "";
    position: absolute;
    right: var(--spacing);
    border-right: var(--border-width) solid var(--active-color);
    height: calc(100% - var(--spacing) * 2);
  }

  > label {
    margin-top: 0;
    margin-top: -0.3em;

    // position: absolute;
    // right: 100%;
    // margin-right: 4px;
    // margin-top: 5px;
    // transform: rotate(-90deg);
    // transform-origin: top right;
  }

  button {
    display: block;
    line-height: 0;
    margin-bottom: calc(var(--spacing) / 2);

    &:last-child {
      margin-bottom: 0;
    }

    svg {
      width: 22.5px;
      height: 22.5px;
      border-radius: 50%;
      border: var(--border-width) solid var(--active-color);
      border-width: calc(var(--border-width) * 1.1);
      stroke-width: 1px;

      path,
      ellipse,
      circle,
      polyline,
      line {
        fill: none;
        stroke: var(--active-color);
        stroke-miterlimit: 10;
      }
    }
  }
}
</style>
