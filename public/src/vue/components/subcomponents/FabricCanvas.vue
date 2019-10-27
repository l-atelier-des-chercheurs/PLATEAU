<template>
  <div
    class="m_fabricCanvas"
    :class="{ 
      'is--receptiveToDrop' : !!$root.settings.media_being_dragged,
      'is--dragover' : is_being_dragover  
    }"
  >
    <canvas
      ref="canvas"
      width="1024"
      height="768"
      @dragover="ondragover($event)"
      @drop="dropHandler($event)"
    />
  </div>
</template>
<script>
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

    if (this.media.hasOwnProperty("content") && this.media.content !== "") {
      this.canvas.loadFromJSON(JSON.parse(this.media.content));
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
        `METHODS • CollaborativeEditor / dragover on ${$event.currentTarget.className}`
      );
      this.is_being_dragover = true;
      this.cancelDragOver();
    },
    dropHandler($event) {
      console.log(`METHODS • CollaborativeEditor / dropHandler`);

      // Prevent default behavior (Prevent file from being opened)
      $event.preventDefault();
      $event.dataTransfer.dropEffect = "move";

      this.removeDragoverFromBlots();

      if ($event.dataTransfer.getData("text/plain") === "media_in_quill") {
        console.log(
          `METHODS • CollaborativeEditor / dropHandler: drag and dropped a media from quill`
        );
        let _blot = this.getBlockFromElement($event.target);
        const index = this.editor.getIndex(_blot);

        // find which blot was dragged (A)

        // find where it was dropped (B)

        // move delta from A to B

        console.log(`_blot is currently at index ${index}`);
      } else if ($event.dataTransfer.getData("text/plain")) {
        console.log(
          `METHODS • CollaborativeEditor / dropHandler: dropped a media from the library`
        );

        const data = JSON.parse($event.dataTransfer.getData("text/plain"));
        console.log(data);

        if (data.media_filename) {
          // drop sur l’éditor et pas sur une ligne
          if ($event.target.classList.contains("ql-editor")) {
            console.log(
              "dropped on editor and not on line, will insert at the end of doc"
            );
            this.addMediaAtIndex(this.editor.getLength() - 1, data);
            return;
          }

          let _blot = this.getBlockFromElement($event.target);

          if (!_blot) {
            this.$alertify
              .closeLogOnClick(true)
              .delay(4000)
              .error(this.$t("notifications.failed_to_find_block_line"));
            return;
          }

          _blot = _blot.next ? _blot.next : _blot;

          const index = this.editor.getIndex(_blot);
          this.addMediaAtIndex(index, data);
        }
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

    &::after {
      content: "";
      position: absolute;
      left: 0;
      right: 0;
      top: 0;
      bottom: 0;

      background-color: #ccc;

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
    > .canvas-container::after {
      opacity: 1;
    }
  }
}
</style>