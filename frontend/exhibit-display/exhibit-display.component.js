angular.module('exhibitDisplay').component('exhibitDisplay', {
  templateUrl: 'exhibit-display/exhibit-display.template.html',
  controller: [
    'Utilities',
    '$routeParams',
    function exhibitDisplayController(Utilities, $routeParams) {
      const utils = new Utilities();

      this.exhibitId = $routeParams.exhibitId;

      this.exhibitIsPublic = true;

      const body = document.querySelector('body');

      body.style.margin = '0px';
      body.style.overflow = 'hidden';

      // async initialization of this.config
      utils.getExhibit(this.exhibitId).then(response => {
        this.config = JSON.parse(response.data.config);
        this.snapshotRef = response.data.snapshot_ref;
        this.exhibitOwner = response.data.owner;
        this.exhibitIsPublic = response.data.public;

        utils.calculateSize('#avl-shim', '#avl-preview', this.config);

        this.gridsterOpts = utils.calculateGridsterOpts(this.config);

        this.content = utils.calculateTiles(this.config);
        this.tiles = this.content.tiles;
        this.backgroundUrl = this.content.background.url;
      });
    },
  ],
});
