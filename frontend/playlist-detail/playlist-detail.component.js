angular
  .module('playlistDetail')
  .component('playlistDetail', {
    templateUrl: 'playlist-detail/playlist-detail.template.html',
    controller: ['Authentication', 'Utilities', '$routeParams', '$location',
      function playlistDetailController(Authentication, Utilities, $routeParams, $location) {
        const utils = new Utilities();

        this.authentication = Authentication;

        this.playlistId = $routeParams.playlistId;

        this.playlistIdIsValid = true;

        this.playlistIsPublic = false;

        this.isOwner = false;

        this.containerIdOnOffSwitch = false;

        this.goToPlaylists = () => $location.url('/playlists');

        this.sanityCheck = () => {
          if (this.authentication.userProfile.login === null) {
            this.noPermission = true;
            this.message_style = 'alert error one-third float-center';
            this.info_message = 'Cannot obtain user\'s github login id.';
            return false;
          }

          const loginUser = this.authentication.userProfile.login;

          if (this.playlistOwner !== loginUser) {
            this.noPermission = true;
            const msg = `playlist owner "${this.playlistOwner}" not same as login user "${loginUser}"`;

            this.message_style = 'alert error one-third float-center';
            this.info_message = msg;

            // console.log(msg);

            return false;
          }

          return true;
        };

        this.goToEdit = () => {
          $location.url(`/playlists/${this.playlistId}/edit`);
        };

        this.delete = () => {
          this.confirmDelete = true;
          this.message_style = 'callout warning';
          this.info_message = 'Are you sure you want to delete this project?';

          this.deleteYes = () => {
            this.acknowledgeDelete = true;
            this.confirmDelete = false;

            utils.deletePlaylist(this.playlistId).then((response) => {
              this.message_style = 'callout success';
              this.info_message = 'Playlist Deleted!';
              // console.log(response);
              // console.log('Playlist deleted!');
            }, (e) => {
              console.warn(e);
              // window.alert('Deleting the post failed.');
              this.message_style = 'callout alert';
              this.info_message = 'Deleting the playlist failed.';
            });
          };
        };

        this.deleteNo = () => {
          this.confirmDelete = false;
        };

        this.deleteAcknowledge = () => {
          $location.url('/playlists');
        };

        this.fork = () => {
          const loginUser = this.authentication.userProfile.login;

          const clonedConfig = JSON.parse(JSON.stringify(this.config));

          // set to prviate
          clonedConfig.metadata.public = false;

          utils.submitPlaylist(clonedConfig, this, loginUser);
        };

        const getPlaylist = () => {
          utils.getPlaylist(this.playlistId).then((response) => {
            this.config = JSON.parse(response.data.config);
            this.playlistOwner = response.data.owner;
            this.playlistIsPublic = response.data.public;

            if (this.authentication.userProfile) {
              const loginUser = this.authentication.userProfile.login;
              console.log(loginUser);

              if (loginUser === this.playlistOwner) {
                this.isOwner = true;
              }
            }
          }, (e) => {
            console.warn(e);
            this.playlistIdIsValid = false;
            this.message_style = 'alert error one-third float-center';
            this.info_message = `Cannot obtain playlist with id ${this.playlistId}`;
          });
        };

        if (this.authentication.isAuthorized) {
          getPlaylist();
        } else {
          // wait a while till async login is ready (if the login is clicked)
          const milliseconds = 1000;
          utils.sleep(milliseconds).then(() => {
            getPlaylist();
          });
        }
      }],
  });
