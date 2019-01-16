angular
  .module('indexHeader')
  .component('indexHeader', {
    templateUrl: 'index-header/index-header.template.html',
    controller: ['$location',
      function exhibitDetailController($location) {
        this.displayMode = false;

        const path = $location.path();
        const displayPath = '/exhibit-display/';

        if (path.startsWith(displayPath)) {
          this.displayMode = true;
        }
      }],
  });
