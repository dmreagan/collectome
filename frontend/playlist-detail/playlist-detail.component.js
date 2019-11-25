angular.module("playlistDetail").component("playlistDetail", {
  templateUrl: "playlist-detail/playlist-detail.template.html",
  controller: [
    "Authentication",
    "Utilities",
    "$routeParams",
    "$location",
    function playlistDetailController(
      Authentication,
      Utilities,
      $routeParams,
      $location
    ) {
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

        // state
        ctrl.notify = false;
        ctrl.playlistIdIsValid = true;
        ctrl.playlistIsPublic = false;
        ctrl.isOwner = false;
        ctrl.containerIdOnOffSwitch = false;
      };

      // do some stuff after page has initialized
      ctrl.$postLink = () => {
        ctrl.getPlaylist();
      };

      // on each digest, check if user is playlist owner
      // if user logs in from this page, we need to update view
      ctrl.$doCheck = () => {
        ctrl.userIsOwner = ctrl.isUserOwner();

        if (ctrl.userIsOwner) {
          ctrl.notify = false;
        }
      };

      /**
       * Callbacks
       */

      // show delete confirmation callout
      ctrl.delete = () => {
        ctrl.confirmDelete = true;
      };

      // hide delete confirmation callout
      ctrl.deleteNo = () => {
        ctrl.confirmDelete = false;
      };

      // send delete request and display response
      ctrl.deleteYes = () => {
        ctrl.acknowledgeDelete = true;
        ctrl.confirmDelete = false;

        ctrl.utils.deletePlaylist(ctrl.playlistId).then(
          () => {
            ctrl.notificationStyle = "success";
            ctrl.notificationMessage = "Playlist deleted!";
          },
          e => {
            console.warn(e);
            // window.alert('Deleting the post failed.');
            ctrl.notificationStyle = "alert";
            ctrl.notificationMessage = "Deleting the playlist failed.";
          }
        );
      };

      // create a copy owned by the user
      ctrl.fork = () => {
        const loginUser = ctrl.authentication.userProfile.login;

        const clonedConfig = JSON.parse(JSON.stringify(ctrl.config));

        // set to prviate
        clonedConfig.metadata.public = false;

        ctrl.utils.submitPlaylist(clonedConfig, this, loginUser);
      };

      /**
       * Functions
       */

      // Send request for playlist
      ctrl.getPlaylist = () => {
        ctrl.utils.getPlaylist(ctrl.playlistId).then(
          response => {
            ctrl.config = JSON.parse(response.data.config);
            ctrl.playlistOwner = response.data.owner;
            ctrl.playlistIsPublic = response.data.public;
            ctrl.userIsOwner = ctrl.isUserOwner();

            if (!ctrl.playlistIsPublic && !ctrl.userIsOwner) {
              ctrl.notificationStyle = "alert";
              ctrl.notificationMessage = "This playlist is private.";
              ctrl.notify = true;
            }
          },
          e => {
            console.warn(e);
            ctrl.playlistIdIsValid = false;
            ctrl.notificationStyle = "alert";
            ctrl.notificationMessage = `Cannot obtain playlist with id ${ctrl.playlistId}`;
            ctrl.notify = true;
          }
        );
      };

      // Check if user owns this playlist
      ctrl.isUserOwner = () => {
        let localUserIsOwner = false;

        if (ctrl.authentication.userProfile) {
          if (ctrl.authentication.userProfile.login === ctrl.playlistOwner) {
            localUserIsOwner = true;
          }
        }

        return localUserIsOwner;
      };
    }
  ]
});
