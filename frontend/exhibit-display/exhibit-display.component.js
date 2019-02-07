/*
Copyright (C) 2019 The Trustees of Indiana University
SPDX-License-Identifier: BSD-3-Clause
*/
angular
  .module('exhibitDisplay')
  .component('exhibitDisplay', {
    templateUrl: 'exhibit-display/exhibit-display.template.html',
    controller: ['Utilities', '$routeParams',
      function exhibitDetailController(Utilities, $routeParams) {
        const utils = new Utilities();

        this.exhibitId = $routeParams.exhibitId;

        this.exhibitIsPublic = true;

        const body = document.querySelector('body');

        body.style.margin = '0px';

        // async initialization of this.config
        // eslint-disable-next-line max-len
        utils.getExhibit(this.exhibitId).then((response) => {
          this.config = JSON.parse(response.data.config);
          this.snapshotRef = response.data.snapshot_ref;
          this.exhibitOwner = response.data.owner;
          this.exhibitIsPublic = response.data.public;

          utils.calculateSize('#avl-shim', '#avl-preview', this.config);

          this.gridsterOpts = utils.calculateGridsterOpts(this.config);

          this.tiles = utils.calculateTiles(this.config);
        });
      }],
  });
