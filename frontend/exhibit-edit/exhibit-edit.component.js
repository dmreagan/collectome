angular.module("exhibitEdit").component("exhibitEdit", {
  templateUrl: "exhibit-edit/exhibit-edit.template.html",
  controller: [
    "Authentication",
    "Utilities",
    "$location",
    "$routeParams",
    function exhibitEditController(
      Authentication,
      Utilities,
      $location,
      $routeParams
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
        ctrl.exhibitId = $routeParams.exhibitId;
        ctrl.params = $location.search();

        // state
        ctrl.notify = false;
        ctrl.exhibitIsPublic = false;
        ctrl.exhibitEditPageCanbeDisplayed = false;
        ctrl.userIsOwner = false;
        ctrl.exhibitIdIsValid = true;
        ctrl.containerIdOnOffSwitch = false;
        ctrl.livepreview = true;

        // request collection
        ctrl.getExhibit();
      };

      // do some stuff after page has initialized
      ctrl.$postLink = () => {
        // only need to retrieve the exhibit when user logged in
        if (ctrl.authentication.isAuthorized) {
          ctrl.sanitycheck();

          // show notifications based on URL params
          if (ctrl.params.status) {
            if (ctrl.params.status === "success") {
              ctrl.notificationStyle = "success";
              ctrl.notificationMessage =
                "Collection has been successfully edited.";
              ctrl.notify = true;
            } else if (ctrl.params.status === "dupid") {
              ctrl.notificationStyle = "alert";
              ctrl.notificationMessage = "Title already in use.";
              ctrl.notify = true;
            } else {
              ctrl.notificationStyle = "alert";
              ctrl.notificationMessage = "Updating the exhibit failed.";
              ctrl.notify = true;
            }
          }
        } else {
          ctrl.notificationStyle = "warning";
          ctrl.notificationMessage = "Please log in to edit.";
          ctrl.notify = true;
        }
      };

      // on each digest, check if user is collection owner
      // if user logs in from this page, we need to update view
      ctrl.$doCheck = () => {
        ctrl.sanitycheck();
      };

      /**
       * Callbacks
       */

      // keep exhibit-edit and exhibit-config-editor configs in sync
      ctrl.updateConfig = updatedConfig => {
        ctrl.config = updatedConfig;
      };

      // submit update request
      ctrl.save = () => {
        if (ctrl.authentication.userProfile === null) {
          ctrl.notificationStyle = "alert";
          ctrl.notificationMessage = "Cannot obtain GitHub login id.";
          ctrl.notify = true;
          return;
        }

        const loginUser = ctrl.authentication.userProfile.login;

        ctrl.utils.updateExhibit(ctrl.exhibitId, ctrl.config, this, loginUser);
      };

      /**
       * Functions
       */

      // check login and ownership status and update view
      ctrl.sanitycheck = () => {
        if (ctrl.authentication.isAuthorized) {
          const loginUser = ctrl.authentication.userProfile.login;

          if (ctrl.exhibitOwner === loginUser) {
            /**
             * login user can edit since she is the owner, regardless whether
             * the exhibit is set to be public or private.
             */
            ctrl.exhibitEditPageCanbeDisplayed = true;
            ctrl.userIsOwner = true;

            // ugly hack to get rid of login warning but not status notifications
            if (ctrl.notificationStyle === "warning") {
              ctrl.notify = false;
            }
          } else if (ctrl.exhibitIsPublic) {
            /**
             * login user is not the owner, however since the exhibit is set
             * to be public, login user can still view the exhibit but just
             * not allowed to make any edit.
             */
            ctrl.exhibitEditPageCanbeDisplayed = true;
          } else {
            /* not the owner and the exhibit is not public */
            ctrl.exhibitEditPageCanbeDisplayed = false;
          }
        }
      };

      // request collection and display response
      ctrl.getExhibit = () => {
        ctrl.utils.getExhibit(ctrl.exhibitId).then(
          response => {
            ctrl.config = JSON.parse(response.data.config);
            ctrl.exhibitOwner = response.data.owner;
            ctrl.exhibitIsPublic = response.data.public;
          },
          e => {
            console.warn(e);
            ctrl.exhibitIdIsValid = false;
            ctrl.notificationStyle = "alert";
            ctrl.notificationMessage = `Cannot obtain exhibit with id ${ctrl.exhibitId}`;
            ctrl.notify = true;
          }
        );
      };
    }
  ]
});
