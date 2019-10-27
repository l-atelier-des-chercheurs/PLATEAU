<template>
  <div
    class="m_fabricCanvas"
    :class="{ 
      'is--receptiveToDrop' : !!$root.settings.media_being_dragged,
      'is--dragover' : is_being_dragover  
    }"
    @dragover="ondragover($event)"
    @drop="ondrop($event)"
  >
    <canvas ref="canvas" :width="canvas_properties.width" :height="canvas_properties.height" />
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
      }
    };
  },

  created() {},
  mounted() {
    document.addEventListener("keyup", this.captureKeyListener);

    this.cancelDragOver = debounce(this.cancelDragOver, 300);

    this.$eventHub.$on("remove_selection", this.removeSelection);

    this.canvas = new fabric.Canvas(this.$refs.canvas, {
      enableRetinaScaling: false
    });

    if (this.media.hasOwnProperty("content") && this.media.content !== "") {
      this.canvas.loadFromJSON(JSON.parse(this.media.content));
    }

    this.setDrawingOptions();

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
      if (this.drawing_options.mode === "select") {
        // this.new_line.setCoords();
        this.updateCanvas();
      }

      if (o.target) {
        this.updateCanvas();
      }
    });
    // this.setMedias();
  },
  beforeDestroy() {
    this.$eventHub.$off("remove_selection", this.removeSelection);
    document.removeEventListener("keyup", this.captureKeyListener);
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
  computed: {},
  methods: {
    captureKeyListener(event) {
      if (this.drawing_options.mode === "select" && event.key === "Backspace") {
        this.removeSelection();
      }
    },
    setDrawingOptions() {
      this.canvas.selection = this.drawing_options.mode === "select";
      this.canvas.forEachObject(o => {
        o.evented = this.drawing_options.mode === "select";
      });
      if (this.drawing_options.mode === "drawing") {
        this.canvas.defaultCursor = "Handwriting";
        // this.canvas.defaultCursor = "crosshair";
      } else {
      }

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

      debugger;

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
    }
  }
};
</script>
<style lang="scss">
.m_fabricCanvas {
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