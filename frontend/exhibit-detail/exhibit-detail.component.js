angular
  .module('exhibitDetail')
  .component('exhibitDetail', {
    templateUrl: 'exhibit-detail/exhibit-detail.template.html',
    controller: ['Authentication', 'Utilities', '$routeParams', '$location',
      function exhibitDetailController(Authentication, Utilities, $routeParams, $location) {
        const utils = new Utilities();

        this.authentication = Authentication;

        this.exhibitId = $routeParams.exhibitId;

        this.exhibitIdIsValid = true;

        this.exhibitIsPublic = false;

        this.isOwner = false;

        this.containerIdOnOffSwitch = false;

        this.goToExhibits = () => $location.url('/exhibits');

        this.sanityCheck = () => {
          if (this.authentication.userProfile.login === null) {
            this.noPermission = true;
            this.message_style = 'alert error one-third float-center';
            this.info_message = 'Cannot obtain user\'s github login id.';
            return false;
          }

          const loginUser = this.authentication.userProfile.login;

          if (this.exhibitOwner !== loginUser) {
            this.noPermission = true;
            const msg = `exhibit owner "${this.exhibitOwner}" not same as login user "${loginUser}"`;

            this.message_style = 'alert error one-third float-center';
            this.info_message = msg;

            // console.log(msg);

            return false;
          }

          return true;
        };

        this.goToEdit = () => {
          $location.url(`/exhibits/${this.exhibitId}/edit`);
        };

        this.delete = () => {
          this.confirmDelete = true;
          this.message_style = 'alert info one-third float-center';
          this.info_message = 'Are you sure you want to delete this project?';

          this.deleteYes = () => {
            this.acknowledgeDelete = true;
            this.confirmDelete = false;

            utils.deleteExhibit(this.exhibitId).then((response) => {
              this.message_style = 'alert success one-third float-center';
              this.info_message = 'Exhibit Deleted!';
              // console.log(response);
              // console.log('Exhibit deleted!');
            }, (e) => {
              console.warn(e);
              // window.alert('Deleting the post failed.');
              this.message_style = 'alert error one-third float-center';
              this.info_message = 'Deleting the exhibit failed.';
            });
          };
        };

        this.deleteNo = () => {
          this.confirmDelete = false;
        };

        this.deleteAcknowledge = () => {
          $location.url('/exhibits');
        };

        this.goToDisplay = () => {
          /**
           * need to use 'window.location.href' rather than '$location.url'
           * since we need a reload the page after changing the URL
           */
          window.location.href = `/exhibit-display/${this.exhibitId}`;
        };

        this.fork = () => {
          const loginUser = this.authentication.userProfile.login;

          utils.submitExhibit(this.config, this, loginUser);
        };

        const getExhibit = () => {
          utils.getExhibit(this.exhibitId).then((response) => {
            this.config = JSON.parse(response.data.config);
            this.exhibitOwner = response.data.owner;
            this.exhibitIsPublic = response.data.public;

            if (this.authentication.userProfile) {
              const loginUser = this.authentication.userProfile.login;
              console.log(loginUser);

              if (loginUser === this.exhibitOwner) {
                this.isOwner = true;
              }
            }
          }, (e) => {
            console.warn(e);
            this.exhibitIdIsValid = false;
            this.message_style = 'alert error one-third float-center';
            this.info_message = `Cannot obtain exhibit with id ${this.exhibitId}`;
          });
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
