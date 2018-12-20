angular
  .module('exhibitConfigPreview')
  .component('exhibitConfigPreview', {
    bindings: {
      config: '<',
    },
    templateUrl: 'exhibit-config-preview/exhibit-config-preview.template.html',
    controller: ['Utilities', function exhibitConfigPreviewController(Utilities) {
      const utils = new Utilities();

      const updatePreview = () => {
        utils.calculateSize('#avl-shim', '#avl-preview', this.config);

        const bezelPos = utils.calculateBezels(this.config);
        this.bezelPosHorizontal = bezelPos.bezelPosHorizontal;
        this.bezelPosVertical = bezelPos.bezelPosVertical;

        this.gridsterOpts = utils.calculateGridsterOpts(this.config);
        this.tiles = utils.calculateTiles(this.config);

        // console.info('updatePreview');
      };


      this.$onInit = () => {
        // console.info('onInit');
        updatePreview();
      };


      this.$onChanges = () => {
        // console.info('onChange');
        updatePreview();
      };

      this.$postLink = () => {
        // console.info('onPostLink');
        updatePreview();
      };
    }],
  })
  .filter('trusted', ['$sce', function ($sce) {
    return function (url) {
      return $sce.trustAsResourceUrl(url);
    };
  }]);
