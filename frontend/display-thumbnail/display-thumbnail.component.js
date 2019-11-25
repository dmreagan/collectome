angular.module("displayThumbnail").component("displayThumbnail", {
  template: "<canvas></canvas>",
  bindings: {
    config: "<"
  },
  controller: function DisplayThumbnailController($element) {
    const ctrl = this;

    this.$onInit = () => {
      ctrl.x = 10;
      ctrl.y = 10;
      ctrl.width = 250;
      ctrl.colWidth = Math.ceil(ctrl.width / ctrl.config.columns);
      ctrl.rowHeight = Math.ceil((ctrl.colWidth / 16) * 9);
      ctrl.height = ctrl.config.rows * ctrl.rowHeight;

      /**
       * Sorting function for layout containers
       * @param {*} a
       * @param {*} b
       */
      const compare = (a, b) => {
        if (a.originY !== b.originY) {
          return a.originY - b.originY;
        }

        return a.originX - b.originX;
      };

      ctrl.containers = JSON.parse(ctrl.config.config).layout.containers;
      ctrl.sortedContainers = ctrl.containers.sort(compare);
    };

    this.$postLink = () => {
      ctrl.canvas = $element.children()[0];
      ctrl.ctx = ctrl.canvas.getContext("2d");

      for (let k = 0; k < ctrl.sortedContainers.length; k += 1) {
        const container = ctrl.sortedContainers[k];

        const originX = container.originX * ctrl.colWidth + ctrl.x;
        const originY = container.originY * ctrl.rowHeight + ctrl.y;

        const gridWidth = container.sizeX * ctrl.colWidth;
        const gridHeight = container.sizeY * ctrl.rowHeight;

        // fetch color from chroma.js library
        ctrl.ctx.fillStyle = chroma.scale("Blues")(
          k / (ctrl.sortedContainers.length - 1)
        );
        ctrl.ctx.fillRect(originX, originY, gridWidth, gridHeight);
      }

      ctrl.ctx.lineWidth = 5;
      ctrl.ctx.strokeRect(ctrl.x, ctrl.y, ctrl.width, ctrl.height);

      ctrl.ctx.lineWidth = 2;

      // draw horizontal bezels
      for (let i = 1; i < ctrl.config.rows; i += 1) {
        ctrl.ctx.beginPath();
        ctrl.ctx.moveTo(ctrl.x, i * ctrl.rowHeight + ctrl.y);
        ctrl.ctx.lineTo(ctrl.x + ctrl.width, i * ctrl.rowHeight + ctrl.y);
        ctrl.ctx.stroke();
      }

      for (let j = 1; j < ctrl.config.columns; j += 1) {
        ctrl.ctx.beginPath();
        ctrl.ctx.moveTo(j * ctrl.colWidth + ctrl.x, ctrl.y);
        ctrl.ctx.lineTo(j * ctrl.colWidth + ctrl.x, ctrl.y + ctrl.height);
        ctrl.ctx.stroke();
      }
    };
  }
});
