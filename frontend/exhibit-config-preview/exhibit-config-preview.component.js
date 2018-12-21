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
      };


      this.$onInit = () => {
        // console.log('onInit');
      };


      this.$onChanges = () => {
        // console.log('onChange');

        /**
         * since we load config using async http.get from exhibit-create component,
         * the first time the onChanges event being called, config is still undefined.
         * We need to bypass this call and wait for its second invocation when config 
         * has been initialized properly.
         */
        if (this.config !== undefined) {
          updatePreview();
        }
      };

      this.$postLink = () => {
        // console.log('onPostLink');
      };
    }],
  })
  .filter('trusted', ['$sce', function ($sce) {
    return function (url) {
      return $sce.trustAsResourceUrl(url);
    };
  }]);
