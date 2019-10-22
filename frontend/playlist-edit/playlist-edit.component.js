angular
  .module('playlistEdit')
  .component('playlistEdit', {
    templateUrl: 'playlist-edit/playlist-edit.template.html',
    controller: ['Authentication', 'Utilities', '$location', '$routeParams', '$route',
      function playlistEditController(Authentication, Utilities, $location, $routeParams, $route) {
        const utils = new Utilities();

        this.authentication = Authentication;

        this.playlistId = $routeParams.playlistId;

        this.playlistIsPublic = false;

        this.playlistEditPageCanbeDisplayed = false;

        this.isOwner = false;

        this.playlistIdIsValid = true;

        this.containerIdOnOffSwitch = false;

        this.livepreview = true;

        const params = $location.search();

        console.log(params);

        if (params.status) {
          if (params.status === 'success') {
            this.message_style = 'callout success';
            this.info_message = 'Playlist has been successfully edited';
            this.success = true;
          } else if (params.status === 'dupid') {
            this.message_style = 'callout alert';
            this.info_message = 'Sanity check failed. title already used';
          } else {
            this.message_style = 'callout alert';
            this.info_message = 'Updating the playlist failed.';
          }
        }

        this.updateConfig = (updatedConfig) => {
          this.config = updatedConfig;
        };

        this.goToPlaylists = () => $location.url('/playlists');

        this.goToCreated = () => $location.url(`/playlists/${this.playlistId}`);

        this.save = () => {
          if (this.authentication.userProfile === null) {
            this.message_style = 'callout alert';
            this.info_message = 'Cannot obtain github login id.';
            return;
          }

          console.log(this.config);

          const loginUser = this.authentication.userProfile.login;

          // the following 'updatePlaylist' function is used for system generated id
          // utils.updatePlaylist(this.playlistId, this.config, this, loginUser);

          // when using user composed id (i.e., title), we need to delete and then create, since
          // it is a bad practice to update primary key.

          utils.checkPlaylistId(this.config.metadata.name, loginUser).then((response) => {
            utils.deletePlaylist(this.playlistId).then((response) => {
              const type = 1; // update type
              utils.submitPlaylist(this.config, this, loginUser, type);
            }, (e) => {
              console.warn(e);
              // window.alert('Deleting the post failed.');
              // this.message_style = 'callout alert';
              // this.info_message = 'Updating the playlist failed.';

              $location.search('status', 'error');
              $route.reload();
            });
          }, (e) => {
            console.warn(e);
            // this.message_style = 'callout alert';
            // this.info_message = 'Sanity check failed. title already used';

            console.log('duplicate id');
            $location.search('status', 'dupid');
            $route.reload();
          });
        };

        this.sanitycheck = () => {
          if (this.authentication.isAuthorized) {
            const loginUser = this.authentication.userProfile.login;

            console.log(loginUser);

            if (this.playlistOwner === loginUser) {
              /**
               * login user can edit since she is the owner, regardless whether
               * the playlist is set to be public or private.
               */
              this.playlistEditPageCanbeDisplayed = true;
              this.isOwner = true;

              console.log('branch 1');
            } else if (this.playlistIsPublic) {
              /**
               * login user is not the owner, however since the playlist is set
               * to be public, login user can still view the playlist but just
               * not allowed to make any edit.
               */
              this.playlistEditPageCanbeDisplayed = true;
              console.log('branch 2');
            } else {
              /* not the owner and the playlist is not public */
              this.playlistEditPageCanbeDisplayed = false;
              console.log('branch 3');
            }
          }
        };

        const getPlaylist = () => {
          // only need to retrieve the playlist when user logged in
          if (this.authentication.isAuthorized) {
            utils.getPlaylist(this.playlistId).then((response) => {
              this.config = JSON.parse(response.data.config);
              this.playlistOwner = response.data.owner;
              this.playlistIsPublic = response.data.public;
              this.sanitycheck();
            }, (e) => {
              console.warn(e);
              this.playlistIdIsValid = false;
              this.message_style = 'alert error one-third float-center';
              this.info_message = `Cannot obtain playlist with id ${this.playlistId}`;
            });
          }
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
