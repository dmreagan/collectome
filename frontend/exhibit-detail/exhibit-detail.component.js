angular.module("exhibitDetail").component("exhibitDetail", {
  templateUrl: "exhibit-detail/exhibit-detail.template.html",
  controller: [
    "Authentication",
    "Utilities",
    "$routeParams",
    "$location",
    function exhibitDetailController(
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
        ctrl.exhibitId = $routeParams.exhibitId;
        ctrl.params = $location.search();

        // state
        ctrl.notify = false;
        ctrl.exhibitIdIsValid = false;
        ctrl.exhibitIsPublic = false;
        ctrl.userIsOwner = false;
        ctrl.containerIdOnOffSwitch = false;
      };

      // do some stuff after page has initialized
      ctrl.$postLink = () => {
        // show a success callout if collection was just copied
        if (ctrl.params.status === "copy") {
          // ctrl.copy = true;
          ctrl.notify = true;
          ctrl.notificationStyle = "success";
          ctrl.notificationMessage =
            "This is your own copy of the collection. It is marked private by default.";
        }

        ctrl.getExhibit();
      };

      // on each digest, check if user is collection owner
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

        ctrl.utils.deleteExhibit(ctrl.exhibitId).then(
          () => {
            ctrl.notificationStyle = "success";
            ctrl.notificationMessage = "Exhibit deleted!";
          },
          e => {
            console.warn(e);
            // window.alert('Deleting the post failed.');
            ctrl.notificationStyle = "alert";
            ctrl.notificationMessage = "Deleting the exhibit failed.";
          }
        );
      };

      // create a copy owned by the user
      ctrl.fork = () => {
        const loginUser = ctrl.authentication.userProfile.login;

        const clonedConfig = JSON.parse(JSON.stringify(ctrl.config));

        // set to prviate
        clonedConfig.metadata.public = false;

        ctrl.utils.submitExhibit(clonedConfig, this, loginUser, 2);
      };

      /**
       * Functions
       */

      // Send request for collection
      ctrl.getExhibit = () => {
        ctrl.utils.getExhibit(ctrl.exhibitId).then(
          response => {
            ctrl.exhibitIdIsValid = true;
            ctrl.config = JSON.parse(response.data.config);
            ctrl.exhibitOwner = response.data.owner;
            ctrl.exhibitIsPublic = response.data.public;
            ctrl.userIsOwner = ctrl.isUserOwner();

            if (!ctrl.exhibitIsPublic && !ctrl.userIsOwner) {
              ctrl.notificationStyle = "alert";
              ctrl.notificationMessage = "This collection is private.";
              ctrl.notify = true;
            }
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

      // Check if user owns this collection
      ctrl.isUserOwner = () => {
        let localUserIsOwner = false;

        if (ctrl.authentication.userProfile) {
          if (ctrl.authentication.userProfile.login === ctrl.exhibitOwner) {
            localUserIsOwner = true;
          }
        }

        return localUserIsOwner;
      };
    }
  ]
});
