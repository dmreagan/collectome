/* eslint-disable prefer-destructuring */
angular
  .module('playlistDisplay')
  .component('playlistDisplay', {
    templateUrl: 'playlist-display/playlist-display.template.html',
    controller: [
      'Utilities',
      '$routeParams',
      '$timeout',
      function playlistDisplayController(Utilities, $routeParams, $timeout) {
        const utils = new Utilities();

        this.playlistId = $routeParams.playlistId;

        this.playlistIsPublic = true;

        let collections = [];

        let curIndex;

        this.collectionURL = null;

        const exhibitDisplayPrefix = '/exhibit-display/';

        const refresh = () => {
          curIndex = (curIndex + 1) % collections.length;
          const duration = collections[curIndex].duration;
          this.curExhibitDisplayURL =
            exhibitDisplayPrefix + collections[curIndex].id;

          $timeout(refresh, duration * 1000);
        };

        // async initialization of this.config
        // eslint-disable-next-line max-len
        utils.getPlaylist(this.playlistId).then(response => {
          const config = JSON.parse(response.data.config);
          collections = config.collections;
          this.playlistOwner = response.data.owner;
          this.playlistIsPublic = response.data.public;

          if (collections.length > 0) {
            curIndex = 0;
            const duration = collections[curIndex].duration;
            this.curExhibitDisplayURL =
              exhibitDisplayPrefix + collections[curIndex].id;

            $timeout(refresh, duration * 1000);
          }
        });
      },
    ],
  })
  .filter('trusted', [
    '$sce',
    function($sce) {
      return function(url) {
        return $sce.trustAsResourceUrl(url);
      };
    },
  ]);
