angular
  .module('exhibitEdit')
  .component('exhibitEdit', {
    templateUrl: 'exhibit-edit/exhibit-edit.template.html',
    controller: ['Authentication', 'Utilities', '$location', '$routeParams',
      function exhibitEditController(Authentication, Utilities, $location, $routeParams) {
        const utils = new Utilities();

        this.authentication = Authentication;

        this.exhibitId = $routeParams.exhibitId;

        this.exhibitIsPublic = false;

        this.exhibitEditPageCanbeDisplayed = false;

        this.isOwner = false;

        this.exhibitIdIsValid = true;

        this.containerIdOnOffSwitch = false;

        this.livepreview = true;

        const params = $location.search();

        console.log(params);

        if (params.status) {
          if (params.status === 'success') {
            this.message_style = 'alert success one-third float-center';
            this.info_message = 'Exhibit has been successfully edited';
            this.success = true;
          }
        }

        this.updateConfig = (updatedConfig) => {
          this.config = updatedConfig;
        };

        this.goToExhibits = () => $location.url('/exhibits');

        this.goToCreated = () => $location.url(`/exhibits/${this.exhibitId}`);

        this.save = () => {
          if (this.authentication.userProfile === null) {
            this.message_style = 'alert error one-third float-center';
            this.info_message = 'Cannot obtain github login id.';
            return;
          }

          console.log(this.config);

          const loginUser = this.authentication.userProfile.login;

          utils.updateExhibit(this.exhibitId, this.config, this, loginUser);
        };

        this.sanitycheck = () => {
          if (this.authentication.isAuthorized) {
            const loginUser = this.authentication.userProfile.login;

            console.log(loginUser);

            if (this.exhibitOwner === loginUser) {
              /**
               * login user can edit since she is the owner, regardless whether
               * the exhibit is set to be public or private.
               */
              this.exhibitEditPageCanbeDisplayed = true;
              this.isOwner = true;

              console.log('branch 1');
            } else if (this.exhibitIsPublic) {
              /**
               * login user is not the owner, however since the exhibit is set
               * to be public, login user can still view the exhibit but just
               * not allowed to make any edit.
               */
              this.exhibitEditPageCanbeDisplayed = true;
              console.log('branch 2');
            } else {
              /* not the owner and the exhibit is not public */
              this.exhibitEditPageCanbeDisplayed = false;
              console.log('branch 3');
            }
          }
        };

        const getExhibit = () => {
          // only need to retrieve the exhibit when user logged in
          if (this.authentication.isAuthorized) {
            utils.getExhibit(this.exhibitId).then((response) => {
              this.config = JSON.parse(response.data.config);
              this.exhibitOwner = response.data.owner;
              this.exhibitIsPublic = response.data.public;
              this.sanitycheck();
            }, (e) => {
              console.warn(e);
              this.exhibitIdIsValid = false;
              this.message_style = 'alert error one-third float-center';
              this.info_message = `Cannot obtain exhibit with id ${this.exhibitId}`;
            });
          }
        };

        if (this.authentication.isAuthorized) {
          getExhibit();
        } else {
          // wait a while till async login is ready (if the login is clicked)
          const milliseconds = 1000;
          utils.sleep(milliseconds).then(() => {
            getExhibit();
          });
        }
      }],
  });
