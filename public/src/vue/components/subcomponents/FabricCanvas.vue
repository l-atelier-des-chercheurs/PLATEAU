<template>
  <div>
    <canvas ref="canvas" width="1200" :height="map_height" />
  </div>
</template>
<script>
export default {
  props: {
    medias: Array,
    media: Object,
    map_height: Number,
    slugFolderName: String,
    current_mode: String,
    drawing_options: Object
  },
  components: {},
  data() {
    return {
      canvas: undefined,
      new_line: undefined,
      isDown: false
    };
  },

  created() {},
  mounted() {
    document.addEventListener("keyup", this.captureKeyListener);

    this.$eventHub.$on("remove_selection", this.removeSelection);

    this.canvas = new fabric.Canvas(this.$refs.canvas, {
      enableRetinaScaling: false
    });

    if (
      this.media.hasOwnProperty("canvas_information") &&
      this.media.canvas_information !== ""
    ) {
      this.canvas.loadFromJSON(JSON.parse(this.media.canvas_information));
    }

    this.setDrawingOptions();

    this.canvas.on("mouse:down", o => {
      this.isDown = true;
      var pointer = this.canvas.getPointer(o.e);
      var points = [pointer.x, pointer.y, pointer.x, pointer.y];

      if (!this.drawing_options.select_mode) {
        // this.new_line = new fabric.Line(points, {
        //   fill: this.drawing_options.color,
        //   stroke: this.drawing_options.color,
        //   strokeWidth: this.drawing_options.width,
        //   originX: "center",
        //   originY: "center"
        // });
        // this.canvas.add(this.new_line);
      }
    });
    this.canvas.on("mouse:move", o => {
      if (!this.isDown) return;
      var pointer = this.canvas.getPointer(o.e);

      if (!this.drawing_options.select_mode) {
        // this.new_line.set({ x2: pointer.x, y2: pointer.y });
        // this.new_line.setCoords();
        this.canvas.renderAll();
      }
    });

    this.canvas.on("mouse:up", o => {
      if (!this.isDown) return;

      this.isDown = false;
      if (!this.drawing_options.select_mode) {
        // this.new_line.setCoords();
        this.updateLinksList();
      }

      if (o.target) {
        this.updateLinksList();
      }
    });
    // this.setMedias();
  },
  beforeDestroy() {
    this.$eventHub.$off("remove_selection", this.removeSelection);
    document.removeEventListener("keyup", this.captureKeyListener);
  },

  watch: {
    "media.canvas_information": function() {
      debugger;
      this.canvas.loadFromJSON(JSON.parse(this.media.canvas_information));
      this.setDrawingOptions();
    },
    drawing_options: {
      handler() {
        this.setDrawingOptions();
      },
      deep: true
    }
  },
  computed: {},
  methods: {
    captureKeyListener(event) {
      if (this.drawing_options.select_mode && event.key === "Backspace") {
        this.removeSelection();
      }
    },
    setDrawingOptions() {
      this.canvas.selection = this.drawing_options.select_mode;
      this.canvas.forEachObject(o => {
        o.evented = this.drawing_options.select_mode;
      });
      if (!this.drawing_options.select_mode) {
        this.canvas.defaultCursor = "Handwriting";
        // this.canvas.defaultCursor = "crosshair";
      } else {
      }

      this.canvas.isDrawingMode = !this.drawing_options.select_mode;
      this.canvas.freeDrawingBrush.color = this.drawing_options.color;
      this.canvas.freeDrawingBrush.width = this.drawing_options.width;
    },
    setMedias() {
      if (this.medias.length === 0) {
        return;
      }

      this.medias.map(m => {
        if (m.type === "image") {
          fabric.Image.fromURL(this.linkToImageThumb(m), oImg => {
            // scale image down, and flip it, before adding it onto canvas
            oImg.set({
              left: m.x,
              top: m.y,
              width: m.width,
              height: m.height
            });
            this.canvas.add(oImg);
          });
        } else if (m.type === "text") {
          const text = new fabric.Text(m.content, {
            left: m.x,
            top: m.y,
            width: m.width,
            height: m.height
          });
          this.canvas.add(text);
        }
      });
    },
    linkToImageThumb(media) {
      if (!media.hasOwnProperty("thumbs")) {
        return this.mediaURL(media);
      }

      let pathToSmallestThumb = media.thumbs.filter(m => m.size === 1600)[0]
        .path;

      if (
        // if image is gif and context is not 'preview', let’s show the original gif
        this.mediaURL(media)
          .toLowerCase()
          .endsWith(".gif") ||
        pathToSmallestThumb === undefined
      ) {
        return this.mediaURL(media);
      }

      let url = `/${pathToSmallestThumb}`;
      return url;
    },
    mediaURL: function(media) {
      return `/${this.slugFolderName}/${media.media_filename}`;
    },
    removeSelection: function() {
      this.canvas.getActiveObjects().forEach(obj => {
        this.canvas.remove(obj);
      });
      this.canvas.discardActiveObject().renderAll();

      this.updateLinksList();
    },
    updateLinksList: function() {
      const canvas_information = JSON.stringify(this.canvas.toJSON());

      this.$root.editMedia({
        type: "projects",
        slugFolderName: this.slugFolderName,
        slugMediaName: this.media.metaFileName,
        data: {
          canvas_information
        }
      });
    }
  }
};
</script>
<style>
</style>