angular.module('playlistCreate').component('playlistCreate', {
  templateUrl: 'playlist-create/playlist-create.template.html',
  controller: [
    'Authentication',
    'Utilities',
    '$location',
    '$routeParams',
    function playlistCreateController(
      Authentication,
      Utilities,
      $location,
      $routeParams
    ) {
      const utils = new Utilities();

      this.authentication = Authentication;

      this.playlistId = $routeParams.playlistId;

      this.livepreview = true;

      this.updateConfig = updatedConfig => {
        this.config = updatedConfig;
      };

      this.goToPlaylists = () => $location.url('/playlists');

      this.containerIdOnOffSwitch = false;

      if (this.playlistId) {
        this.goToCreated = () => $location.url(`/playlists/${this.playlistId}`);
        this.message_success = 'callout success';
        this.message_content = 'Playlist created/forked!';
      }

      this.save = () => {
        // check github login id is available
        if (this.authentication.userProfile.login === undefined) {
          this.message_style = 'callout alert';
          this.info_message = 'Cannot obtain github login id.';
          return;
        }

        const loginUser = this.authentication.userProfile.login;

        const type = 0; // create from scratch
        utils.submitPlaylist(this.config, this, loginUser, type);
      };

      const path = './assets/playlist-config-default.json';

      // async initialization of this.config
      utils.getConfig(path).then(response => {
        this.config = response.data;
      });
    },
  ],
});
