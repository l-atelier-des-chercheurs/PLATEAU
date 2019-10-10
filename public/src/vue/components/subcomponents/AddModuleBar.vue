<template>
  <div class="m_addmodule">
    <div class="m_addmodule--content">
      <div>add a block</div>
      <div class="m_addmodule--buttonRow">
        <template v-for="btn in btns">
          <label for="addImage" v-if="btn.key === 'image'" :key="btn.key">
            <span v-html="btn.svg" />
            <span class="label">{{ btn.label }}</span>
            <input
              type="file"
              accept="image/*"
              id="addImage"
              class="inputfile-2"
              @change="updateInputFiles($event)"
            />
          </label>

          <button v-else type="button" :key="btn.key" @click.self="addButtonClicked($event, btn)">
            <span v-html="btn.svg" />
            <span class="label">{{ btn.label }}</span>
          </button>
        </template>
      </div>
    </div>
  </div>
</template>
<script>
import * as axios from "axios";
export default {
  props: {
    type: String,
    slugDocumentName: String
  },
  components: {},
  data() {
    return {
      files_to_upload_meta: [],

      btns: [
        {
          key: "text",
          label: "text",
          svg: `
            <svg version="1.1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" x="0px" y="0px" width="48px"
    height="48px" viewBox="0 0 48 48" style="enable-background:new 0 0 48 48;" xml:space="preserve">
      <path class="st4" d="M18.8,13.7h10.4v2h-4V27H23V15.7h-4.2V13.7z"/>
  </svg>
          `
        },
        {
          key: "image",
          label: "image",
          svg: `
        <svg version="1.1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" x="0px" y="0px" width="48px"
          height="48px" viewBox="0 0 48 48" style="enable-background:new 0 0 48 48;" xml:space="preserve">
          <rect x="16.3" y="11.7" class="st4" width="15.4" height="15.4"/>
          <polyline class="st4" points="16.3,22.4 20.7,17.1 26.3,24.1 	"/>
          <polyline class="st4" points="31.7,23.6 30.2,23.6 26.9,19.8 24.8,22.3 	"/>
          <circle class="st4" cx="28" cy="15.4" r="1.7"/>
        </svg>

          `
        },
        {
          key: "embed",
          label: "embed",
          svg: `
  <svg version="1.1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" x="0px" y="0px" width="48px"
    height="48px" viewBox="0 0 48 48" style="enable-background:new 0 0 48 48;" xml:space="preserve">
    <path class="st4" d="M31.6,26.3H15.2c-0.6,0-1-0.4-1-1v-9.5c0-0.6,0.4-1,1-1h16.4c0.5,0,1,0.4,1,1v9.5
      C32.6,25.8,32.1,26.3,31.6,26.3z"/>
    <line class="st4" x1="16.2" y1="17.1" x2="30.3" y2="17.1"/>
    <line class="st4" x1="23.4" y1="19.4" x2="30.3" y2="19.4"/>
    <line class="st4" x1="23.4" y1="21.7" x2="30.3" y2="21.7"/>
    <line class="st4" x1="23.4" y1="24" x2="28" y2="24"/>
    <path class="st4" d="M20.1,24h-2.6c-0.5,0-1-0.5-1-1v-2.6c0-0.6,0.5-1,1-1h2.6c0.6,0,1,0.4,1,1V23C21.1,23.6,20.7,24,20.1,24z"/>
  </svg>
          `
        },
        {
          key: "data",
          label: "data",
          svg: `
  <svg version="1.1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" x="0px" y="0px" width="48px"
    height="48px" viewBox="0 0 48 48" style="enable-background:new 0 0 48 48;" xml:space="preserve">
    <line class="st4" x1="16" y1="29.3" x2="31.4" y2="29.3"/>
    <line class="st4" x1="16.6" y1="27.9" x2="16.6" y2="20.9"/>
    <line class="st4" x1="18.7" y1="27.9" x2="18.7" y2="17.4"/>
    <line class="st4" x1="20.7" y1="27.9" x2="20.7" y2="23"/>
    <line class="st4" x1="22.7" y1="27.9" x2="22.7" y2="15.9"/>
    <line class="st4" x1="24.8" y1="27.9" x2="24.8" y2="17.9"/>
    <line class="st4" x1="26.8" y1="27.9" x2="26.8" y2="22.4"/>
    <line class="st4" x1="28.8" y1="27.9" x2="28.8" y2="20"/>
    <line class="st4" x1="30.8" y1="27.9" x2="30.8" y2="13.9"/>
  </svg>
          `
        }
      ]
    };
  },
  created() {},
  mounted() {},
  beforeDestroy() {},
  watch: {},
  computed: {
    uriToUploadMedia: function() {
      return `file-upload/${this.type}/${this.slugDocumentName}`;
    }
  },
  methods: {
    addButtonClicked(event, btn) {
      this.$emit("createModuleAndAppendToList", { type: btn.key });
      event.target.blur();
    },
    updateInputFiles($event) {
      if (this.$root.state.dev_mode === "debug") {
        console.log(`METHODS • AddModuleBar / updateSelectedFiles`);
      }
      const image_to_upload = Array.from($event.target.files);
      $event.target.value = "";

      this.sendThisFile(image_to_upload[0]);
    },
    sendThisFile(f) {
      return new Promise((resolve, reject) => {
        if (this.$root.state.dev_mode === "debug") {
          console.log(`METHODS • UploadFile / sendThisFile : name = ${f.name}`);
        }

        const filename = f.name;
        const modified = f.lastModified;

        this.$set(this.files_to_upload_meta, filename, {
          upload_percentages: 0,
          status: "sending"
        });

        let formData = new FormData();
        formData.append("files", f, filename);
        const meta = {
          fileCreationDate: modified
          // authors: this.$root.settings.current_author_name
          //   ? [{ name: this.$root.settings.current_author_name }]
          //   : ""
        };
        formData.append(filename, JSON.stringify(meta));

        const socketid = this.$socketio.socket.id;
        if (socketid !== undefined) {
          formData.append("socketid", socketid);
        }

        if (this.$root.state.dev_mode === "debug") {
          console.log(
            `METHODS • sendThisFile: name = ${filename} / formData is ready / sending to ${this.uriToUploadMedia}`
          );
        }

        // TODO : possibilité de cancel
        axios
          .post(this.uriToUploadMedia, formData, {
            headers: { "Content-Type": "multipart/form-data" },
            onUploadProgress: function(progressEvent) {
              this.files_to_upload_meta[filename].upload_percentages = parseInt(
                Math.round((progressEvent.loaded * 100) / progressEvent.total)
              );

              this.$alertify
                .closeLogOnClick(true)
                .delay(4000)
                .log(
                  this.$t("notifications.sending_in_progress") +
                    ": " +
                    this.files_to_upload_meta[filename].upload_percentages +
                    "%"
                );
            }.bind(this)
          })
          .then(x => x.data)
          .then(x => {
            if (this.$root.state.dev_mode === "debug") {
              console.log(
                `METHODS • sendThisFile: name = ${filename} / success uploading`
              );
            }

            this.files_to_upload_meta[filename].status = "success";
            this.files_to_upload_meta[filename].upload_percentages = 100;

            // x.medias_filenames.map(f => this.$emit("appendModuleToList", f));
            const just_added_filenames = x.medias_filenames;

            this.$eventHub.$on(`socketio.documents.listMedia`, d => {
              if (
                d.hasOwnProperty("documents") &&
                d.documents.hasOwnProperty(this.slugDocumentName)
              ) {
                const new_media = Object.values(
                  d.documents[this.slugDocumentName].medias
                ).filter(m => m.media_filename);

                if (new_media.length > 0) {
                  this.$emit("appendModuleToList", {
                    slugMediaName: new_media[0].metaFileName
                  });
                  this.$eventHub.$off(`socketio.documents.listMedia`);
                }
              }
              // check if x.medias_filenames contain
            });

            resolve(filename);
            // resolve(x.map(img => Object.assign({}, img, { url: `${BASE_URL}/images/${img.id}` })));
          })
          .catch(err => {
            if (this.$root.state.dev_mode === "debug") {
              console.log(
                `METHODS • sendThisFile: name = ${filename} / failed uploading`
              );
            }

            this.files_to_upload_meta[filename].status = "failed";
            this.files_to_upload_meta[filename].upload_percentages = 0;

            this.$alertify
              .closeLogOnClick(true)
              .delay(4000)
              .error(this.$t("notifications.media_couldnt_be_sent"));

            reject();
          });
      });
    }
  }
};
</script>
<style lang="scss">
.m_addmodule {
  --button-size: 67.5px;

  position: relative;
  background-color: white;

  padding: var(--spacing) 0;

  font-variant: small-caps;
  font-weight: 600;
  line-height: 1;
  text-align: center;

  user-select: none;

  color: var(--active-color);

  button,
  label {
    position: relative;
    width: var(--button-size);
    height: var(--button-size);
    border-radius: 50%;
    border: var(--border-width) solid var(--active-color);
    border-width: calc(var(--border-width) * 1.1);

    svg {
      width: 100%;
      height: 100%;
    }

    .label {
      position: absolute;
      top: 58%;
      left: 0;
      right: 0;
    }
  }

  hr {
    border-color: inherit;
  }

  svg {
    stroke-width: 1px;

    path,
    ellipse,
    circle,
    polyline,
    line,
    rect {
      fill: none;
      stroke: currentColor;
      stroke-miterlimit: 10;
    }
  }
}

.m_addmodule--content {
  max-width: calc(var(--button-size) * 4 + var(--spacing) * 3);
  margin: 0 auto;
}

.m_addmodule--buttonRow {
  margin: calc(var(--spacing) / 2) 0;
  padding: var(--spacing) 0;

  display: grid;
  grid-template-columns: repeat(4, var(--button-size));
  grid-gap: var(--spacing);

  border-top: var(--border-width) solid var(--active-color);

  button:focus,
  button:hover,
  label:focus,
  label:hover {
    background-color: var(--active-color);
    color: white;
  }

  button,
  label {
    cursor: pointer !important;
    > * {
      pointer-events: none;
    }
  }
}

// file picker
input[type="file"] {
  width: 0.1px;
  height: 0.1px;
  opacity: 0;
  overflow: hidden;
  position: absolute;
  z-index: -1;
}
</style>
