angular
  .module('playlistEdit')
  .component('playlistEdit', {
    templateUrl: 'playlist-edit/playlist-edit.template.html',
    controller: ['Authentication', 'Utilities', '$location', '$routeParams',
      function playlistEditController(Authentication, Utilities, $location, $routeParams) {
        const ctrl = this;

        /**
         * Component lifecycle hooks
         */

        // initialize scope
        ctrl.$onInit = () => {
          // services
          ctrl.utils = new Utilities();
          ctrl.authentication = Authentication;

          // vars
          ctrl.playlistId = $routeParams.playlistId;
          ctrl.params = $location.search();

          // state
          ctrl.playlistIsPublic = false;
          ctrl.playlistEditPageCanbeDisplayed = false;
          ctrl.isOwner = false;
          ctrl.playlistIdIsValid = true;
          ctrl.containerIdOnOffSwitch = false;
          ctrl.livepreview = true;

          // request playlist
          ctrl.getPlaylist();
        };

        // do some stuff after page has initialized
        ctrl.$postLink = () => {
          // only need to retrieve the playlist when user logged in
          if (ctrl.authentication.isAuthorized) {
            ctrl.sanitycheck();

            // show notifications based on URL params
            if (ctrl.params.status) {
              if (ctrl.params.status === 'success') {
                ctrl.notificationStyle = 'callout success';
                ctrl.notificationMessage = 'Playlist has been successfully edited';
                ctrl.notify = true;
              } else if (ctrl.params.status === 'dupid') {
                ctrl.notificationStyle = 'callout alert';
                ctrl.notificationMessage = 'Sanity check failed. title already used';
                ctrl.notify = true;
              } else {
                ctrl.notificationStyle = 'callout alert';
                ctrl.notificationMessage = 'Updating the playlist failed.';
                ctrl.notify = true;
              }
            }
          } else {
            ctrl.notificationStyle = 'warning';
            ctrl.notificationMessage = 'Please log in to edit.';
            ctrl.notify = true;
          }
        };

        // on each digest, check if user is playlist owner
        // if user logs in from this page, we need to update view
        ctrl.$doCheck = () => {
          ctrl.sanitycheck();
        };

        /**
         * Callbacks
         */

        // keep playlist-edit and playlist-config-editor configs in sync
        ctrl.updateConfig = (updatedConfig) => {
          ctrl.config = updatedConfig;
        };

        // submit update request
        ctrl.save = () => {
          if (ctrl.authentication.userProfile === null) {
            ctrl.notificationStyle = 'alert';
            ctrl.notificationMessage = 'Cannot obtain github login id.';
            ctrl.notify = true;
            return;
          }

          const loginUser = ctrl.authentication.userProfile.login;

          ctrl.utils.updatePlaylist(ctrl.playlistId, ctrl.config, this, loginUser);
        };

        /**
         * Functions
         */

        // check login and ownership status and update view
        ctrl.sanitycheck = () => {
          if (ctrl.authentication.isAuthorized) {
            const loginUser = ctrl.authentication.userProfile.login;

            if (ctrl.playlistOwner === loginUser) {
              /**
               * login user can edit since she is the owner, regardless whether
               * the playlist is set to be public or private.
               */
              ctrl.playlistEditPageCanbeDisplayed = true;
              ctrl.isOwner = true;

              // ugly hack to get rid of login warning but not status notifications
              if (ctrl.notificationStyle === 'warning') {
                ctrl.notify = false;
              }
            } else if (ctrl.playlistIsPublic) {
              /**
               * login user is not the owner, however since the playlist is set
               * to be public, login user can still view the playlist but just
               * not allowed to make any edit.
               */
              ctrl.playlistEditPageCanbeDisplayed = true;
            } else {
              /* not the owner and the playlist is not public */
              ctrl.playlistEditPageCanbeDisplayed = false;
            }
          }
        };

        // request playlist and display response
        ctrl.getPlaylist = () => {
          ctrl.utils.getPlaylist(ctrl.playlistId).then((response) => {
            ctrl.config = JSON.parse(response.data.config);
            ctrl.playlistOwner = response.data.owner;
            ctrl.playlistIsPublic = response.data.public;
          }, (e) => {
            console.warn(e);
            ctrl.playlistIdIsValid = false;
            ctrl.notificationStyle = 'alert';
            ctrl.notificationMessage = `Cannot obtain playlist with id ${ctrl.playlistId}`;
            ctrl.notify = true;
          });
        };
      }],
  });
