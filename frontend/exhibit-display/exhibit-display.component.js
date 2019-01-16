angular
  .module('exhibitDisplay')
  .component('exhibitDisplay', {
    templateUrl: 'exhibit-display/exhibit-display.template.html',
    controller: ['Utilities', '$routeParams',
      function exhibitDetailController(Utilities, $routeParams) {
        const utils = new Utilities();

        this.exhibitId = $routeParams.exhibitId;

        this.exhibitIsPublic = false;

        // async initialization of this.config
        // eslint-disable-next-line max-len
        utils.getExhibit(this.exhibitId).then((response) => {
          this.config = JSON.parse(response.data.config);
          this.snapshotRef = response.data.snapshot_ref;
          this.exhibitOwner = response.data.owner;
          this.exhibitIsPublic = response.data.public;

          this.gridsterOpts = utils.calculateGridsterOpts(this.config);
          this.tiles = utils.calculateTiles(this.config);
        });
      }],
  });
