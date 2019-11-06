angular
  .module('exhibitEdit')
  .component('exhibitEdit', {
    templateUrl: 'exhibit-edit/exhibit-edit.template.html',
    controller: ['Authentication', 'Utilities', '$location', '$routeParams', '$route',
      function exhibitEditController(Authentication, Utilities, $location, $routeParams, $route) {
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

          console.log('in params status check');

          if (params.status === 'success') {
            this.message_style = 'callout success';
            this.info_message = 'Collection has been successfully edited';
            this.success = true;
          } else if (params.status === 'dupid') {
            this.message_style = 'callout alert';
            this.info_message = 'Sanity check failed. title already used';

            console.log('params status is dupid');
          } else {
            this.message_style = 'callout alert';
            this.info_message = 'Updating the exhibit failed.';
          }
        }

        this.updateConfig = (updatedConfig) => {
          this.config = updatedConfig;
        };

        this.goToExhibits = () => $location.url('/exhibits');

        this.goToCreated = () => $location.url(`/exhibits/${this.exhibitId}`);

        this.save = () => {
          if (this.authentication.userProfile === null) {
            this.message_style = 'callout alert';
            this.info_message = 'Cannot obtain github login id.';
            return;
          }

          const loginUser = this.authentication.userProfile.login;

          // the following 'updateExhibit' function is used for system generated id
          utils.updateExhibit(this.exhibitId, this.config, this, loginUser);

          // when using user composed id (i.e., title), we need to delete and then create, since
          // it is a bad practice to update primary key.

          // utils.checkExhibitId(this.config.metadata.name, loginUser).then((response) => {
          //   utils.deleteExhibit(this.exhibitId).then((response) => {
          //     const type = 1; // update type
          //     utils.submitExhibit(this.config, this, loginUser, type);
          //   }, (e) => {
          //     console.warn(e);
          //     // window.alert('Deleting the post failed.');
          //     // this.message_style = 'callout alert';
          //     // this.info_message = 'Updating the exhibit failed.';

          //     $location.search('status', 'error');
          //     $route.reload();
          //   });
          // }, (e) => {
          //   console.warn(e);
          //   // this.message_style = 'callout alert';
          //   // this.info_message = 'Sanity check failed. title already used';

          //   console.log('duplicate id');
          //   $location.search('status', 'dupid');
          //   $route.reload();
          // });
        };

        this.sanitycheck = () => {
          if (this.authentication.isAuthorized) {
            const loginUser = this.authentication.userProfile.login;

            if (this.exhibitOwner === loginUser) {
              /**
               * login user can edit since she is the owner, regardless whether
               * the exhibit is set to be public or private.
               */
              this.exhibitEditPageCanbeDisplayed = true;
              this.isOwner = true;
            } else if (this.exhibitIsPublic) {
              /**
               * login user is not the owner, however since the exhibit is set
               * to be public, login user can still view the exhibit but just
               * not allowed to make any edit.
               */
              this.exhibitEditPageCanbeDisplayed = true;
            } else {
              /* not the owner and the exhibit is not public */
              this.exhibitEditPageCanbeDisplayed = false;
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
              this.message_style = 'callout alert';
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
