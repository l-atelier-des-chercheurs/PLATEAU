<template>
  <div
    ref="fabric_canvas"
    class="m_fabricCanvas"
    :class="{
      'is--receptiveToDrop': !!$root.settings.media_being_dragged,
      'is--dragover': is_being_dragover
    }"
    :style="containerProperties"
    @dragover="ondragover($event)"
    @drop="ondrop($event)"
  >
    <canvas
      ref="canvas"
      :style="canvasProperties"
      :width="canvas_properties.width"
      :height="canvas_properties.height"
    />
  </div>
</template>
<script>
import debounce from "debounce";

export default {
  props: {
    medias: Array,
    media: Object,
    slugFolderName: String,
    drawing_options: Object
  },
  components: {},
  data() {
    return {
      canvas: undefined,
      new_line: undefined,
      isDown: false,
      canvas_properties: {
        width: 1024,
        height: 768
      },
      zoom: 1
    };
  },

  created() {},
  mounted() {
    document.addEventListener("keyup", this.captureKeyListener);

    this.cancelDragOver = debounce(this.cancelDragOver, 300);

    this.$eventHub.$on("remove_selection", this.removeSelection);

    // store relative URL for images thumbs
    // TODO: also work out a solution when media is directly embedded (for example, videos)
    fabric.Image.prototype.toObject = (function(toObject) {
      return function() {
        return fabric.util.object.extend(toObject.call(this), {
          src: "_thumbs" + this.getSrc().split("_thumbs")[1]
        });
      };
    })(fabric.Image.prototype.toObject);

    this.canvas = new fabric.Canvas(this.$refs.canvas, {
      enableRetinaScaling: false
    });

    if (this.media.hasOwnProperty("content") && this.media.content !== "") {
      this.canvas.loadFromJSON(JSON.parse(this.media.content));
    }

    this.setDrawingOptions();

    setTimeout(() => {
      this.updateCanvasSizeAccordingToPanel();
    }, 500);
    this.$eventHub.$on(
      `activity_panels_resized`,
      this.updateCanvasSizeAccordingToPanel
    );

    this.canvas.on("mouse:down", o => {
      this.isDown = true;
      var pointer = this.canvas.getPointer(o.e);
      var points = [pointer.x, pointer.y, pointer.x, pointer.y];

      if (this.drawing_options.mode === "drawing") {
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

      if (this.drawing_options.mode === "drawing") {
        // this.new_line.set({ x2: pointer.x, y2: pointer.y });
        // this.new_line.setCoords();
        this.canvas.renderAll();
      }
    });

    this.canvas.on("mouse:up", o => {
      if (!this.isDown) return;

      this.isDown = false;
      this.updateCanvas();
    });
    // this.setMedias();
  },
  beforeDestroy() {
    this.$eventHub.$off("remove_selection", this.removeSelection);
    document.removeEventListener("keyup", this.captureKeyListener);

    this.$eventHub.$off(
      `activity_panels_resized`,
      this.updateCanvasSizeAccordingToPanel
    );
  },

  watch: {
    "media.content": function() {
      this.canvas.loadFromJSON(JSON.parse(this.media.content));
      this.setDrawingOptions();
    },
    drawing_options: {
      handler() {
        this.setDrawingOptions();
      },
      deep: true
    }
  },
  computed: {
    containerProperties() {
      return `transform: scale(${this.zoom})`;
      // return `
      //   width: ${page.width * this.$root.settings.publi_zoom}mm;
      //   height: ${page.height * this.$root.settings.publi_zoom}mm;
      // `;
    },
    canvasProperties() {
      return `
        `;
    }
  },
  methods: {
    captureKeyListener(event) {
      if (this.drawing_options.mode === "select" && event.key === "Backspace") {
        this.removeSelection();
      }
    },
    setDrawingOptions() {
      console.log(`METHODS • FabricCanvas / setDrawingOptions`);
      this.canvas.selection = this.drawing_options.mode === "select";
      this.canvas.forEachObject(o => {
        o.evented = this.drawing_options.mode === "select";
      });
      if (this.drawing_options.mode === "drawing") {
        this.canvas.defaultCursor = "Handwriting";
        // this.canvas.defaultCursor = "crosshair";
      } else {
        this.canvas.defaultCursor = "crosshair";
      }

      this.canvas.backgroundColor = this.drawing_options.background_color;
      this.canvas.renderAll();

      this.canvas.isDrawingMode = this.drawing_options.mode === "drawing";
      this.canvas.freeDrawingBrush.color = this.drawing_options.color;
      this.canvas.freeDrawingBrush.width = this.drawing_options.width;
    },
    removeSelection: function() {
      this.canvas.getActiveObjects().forEach(obj => {
        this.canvas.remove(obj);
      });
      this.canvas.discardActiveObject().renderAll();

      this.updateCanvas();
    },
    updateCanvas: function() {
      console.log(`METHODS • FabricCanvas / updateCanvas`);

      const content = JSON.stringify(this.canvas.toJSON());

      this.$root.editMedia({
        type: "projects",
        slugFolderName: this.slugFolderName,
        slugMediaName: this.media.metaFileName,
        data: {
          content
        }
      });
    },
    ondragover($event) {
      console.log(
        `METHODS • FabricCanvas / dragover on ${$event.currentTarget.className}`
      );
      this.is_being_dragover = true;
      this.cancelDragOver();
    },
    cancelDragOver() {
      if (this.$root.state.dev_mode === "debug") {
        console.log(`METHODS • AddMedia / cancelDragOver`);
      }
      this.removeDragoverFromBlots();
      this.is_being_dragover = false;
    },

    ondrop($event) {
      console.log(`METHODS • FabricCanvas / ondrop`);

      // Prevent default behavior (Prevent file from being opened)
      $event.preventDefault();
      $event.dataTransfer.dropEffect = "move";

      if ($event.dataTransfer.getData("text/plain") === "media_in_quill") {
        console.log(
          `METHODS • FabricCanvas / ondrop: drag and dropped a media from quill / writeup`
        );
        $event.target;
      } else if ($event.dataTransfer.getData("text/plain")) {
        console.log(
          `METHODS • FabricCanvas / ondrop: dropped a media from the library`
        );

        const media = JSON.parse($event.dataTransfer.getData("text/plain"));

        if (media.media_filename) {
          // drop sur l’éditor et pas sur une ligne
          this.addMediaToCanvas(media);
        }
      }
    },
    addMediaToCanvas(media) {
      const mediaURL =
        this.$root.state.mode === "export_publication"
          ? `./${this.slugFolderName}/${media.media_filename}`
          : `/${this.slugFolderName}/${media.media_filename}`;

      if (media.type === "image") {
        const thumb = media.thumbs.find(m => m.size === 1600);

        const media_width = thumb.size;
        const media_height = media.ratio ? media_width * media.ratio : 900;

        fabric.Image.fromURL(thumb.path, oImg => {
          // scale image down, and flip it, before adding it onto canvas
          oImg.set({
            left: this.canvas_properties.width / 2 - 100,
            top: this.canvas_properties.height / 2 - 100,
            width: media_width,
            height: media_height,
            scaleX: 0.1,
            scaleY: 0.1
          });
          this.canvas.add(oImg);
        });
      }
    },
    updateCanvasSizeAccordingToPanel() {
      const container = this.$refs.fabric_canvas.offsetWidth;
      const canvas = this.$refs.canvas.offsetWidth;
      if (canvas > 0 && container > 0) {
        const margins = 0;
        if (container < canvas + margins) {
          this.zoom = container / (canvas + margins);
        }
      }
    }
  }
};
</script>
<style lang="scss">
.m_fabricCanvas {
  transform-origin: left top;
  transition: all 0.4s cubic-bezier(0.19, 1, 0.22, 1);

  > .canvas-container {
    background-color: white;
    margin: var(--spacing) auto;

    &::before {
      content: "";
      position: absolute;
      left: 0;
      right: 0;
      top: 0;
      bottom: 0;
      pointer-events: none;

      // Colors
      $bg-color: #fff;
      $dot-color: var(--color-Composition);

      // Dimensions
      $dot-size: 2px;
      $dot-space: 22px;

      background: linear-gradient(
            90deg,
            $bg-color ($dot-space - $dot-size),
            transparent 1%
          )
          center,
        linear-gradient($bg-color ($dot-space - $dot-size), transparent 1%)
          center,
        $dot-color;
      background-size: $dot-space $dot-space;

      opacity: 0;

      transition: opacity 0.4s linear;
    }
  }

  &.is--receptiveToDrop {
    > .canvas-container::before {
      opacity: 1;
    }
  }
}
</style>
