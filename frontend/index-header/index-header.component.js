angular
  .module('indexHeader')
  .component('indexHeader', {
    templateUrl: 'index-header/index-header.template.html',
    controller: ['$location',
      function exhibitDetailController($location) {
        this.displayMode = false;

        const path = $location.path();
        const exhibitDisplayPath = '/exhibit-display/';
        const playlistDisplayPath = '/playlist-display/';

        if (path.startsWith(exhibitDisplayPath) || path.startsWith(playlistDisplayPath)) {
          this.displayMode = true;
        }
      }],
  });
