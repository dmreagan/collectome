angular.module('playlistConfigDisplay').component('playlistConfigDisplay', {
  bindings: {
    config: '<',
  },
  templateUrl: 'playlist-config-display/playlist-config-display.template.html',
  controller: function playlistConfigDisplayController() {
    this.$onInit = () => {
      this.model = this.config;

      this.options = {
        mode: 'tree',
        onEditable: function(node) {
          // this essentially makes the editor in read only mode
          return false;
        },
      };
    };

    this.$onChanges = () => {
      /**
       * since config on exhibit-create is loaed in an async manner, the first
       * time this function is called this.config is still undefined. Once the promise
       * is resolved, this function will be called once again to have the correctly
       * initialized jason.
       */
      this.model = this.config;
    };
  },
});
