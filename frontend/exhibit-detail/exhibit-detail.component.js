angular
  .module('exhibitDetail')
  .component('exhibitDetail', {
    templateUrl: 'exhibit-detail/exhibit-detail.template.html',
    controller: ['Authentication', 'Utilities', '$routeParams', '$location', '$window',
      function exhibitDetailController(Authentication, Utilities, $routeParams, $location, $window) {
        const utils = new Utilities();

        this.authentication = Authentication;

        this.exhibitId = $routeParams.exhibitId;

        this.exhibitIdIsValid = true;

        this.exhibitIsPublic = false;

        this.isOwner = false;

        this.showfig = true;

        // async initialization of this.config
        // eslint-disable-next-line max-len
        utils.getExhibit(this.exhibitId).then((response) => {
          this.config = JSON.parse(response.data.config);
          this.snapshotRef = response.data.snapshot_ref;
          this.exhibitOwner = response.data.owner;
          this.exhibitIsPublic = response.data.public;

          /**
           * since 'login-button' module uses async approach to
           * retrieve user profile via code parameter in the redirect case,
           * we need to wait util the process is done. Otherwise
           * the 'userProfile' is still null.
           */
          if ($window.location.search) {
            /* in a redirect case,  wait and then check */

            console.log('redirect case');

            const milliseconds = 1000;
            utils.sleep(milliseconds).then(() => {
              console.log(this.authentication);

              const loginUser = this.authentication.userProfile.login;
              console.log(loginUser);
              if (loginUser === this.exhibitOwner) {
                this.isOwner = true;
                console.log('Is Owner');
              }
            });
          } else if (this.authentication.userProfile !== null) {
            /* not in a redirect case,  directly check */

            console.log('direct case');

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

        this.goToExhibits = () => $location.url('/exhibits');

        this.sanityCheck = () => {
          console.log(this.authentication);
          if (this.authentication.userProfile === null) {
            console.log('haha');
            this.hasError = true;
            this.message_style = 'alert error one-third float-center';
            this.info_message = 'Cannot obtain user\'s github login id.';
            return false;
          }

          const loginUser = this.authentication.userProfile.login;

          if (this.exhibitOwner !== loginUser) {
            this.hasError = true;
            const msg = `exhibit owner ${this.exhibitOwner} not same as login user ${loginUser}`;

            this.message_style = 'alert error one-third float-center';
            this.info_message = msg;

            // console.log(msg);

            return false;
          }

          return true;
        };

        this.goToEdit = () => {
          if (this.sanityCheck()) {
            $location.url(`/exhibits/${this.exhibitId}/edit`);
          }
        };

        this.delete = () => {
          if (!this.sanityCheck()) {
            return;
          }

          this.confirmDelete = true;
          this.message_style = 'alert info one-third float-center';
          this.info_message = 'Are you sure you want to delete this project?';

          this.deleteYes = () => {
            this.acknowledgeDelete = true;
            this.confirmDelete = false;

            /**
            * before delete snapshot we need to check whether other exhibits
            * also refer to this snapshot, if yes, then no deletion.
            */
            utils.getSnapshotCount(this.snapshotRef).then((response) => {
              const snapshotCount = response.data.count;

              // console.log('snapshotCount');
              // console.log(snapshotCount);

              if (snapshotCount <= 1) {
                utils.deleteSnapshot(this.snapshotRef);
              }
            }, (e) => {
              console.warn(e);
              // window.alert('Deleting the post failed.');
              this.message_style = 'alert error one-third float-center';
              this.info_message = 'Deleting the snapshot failed.';
            });

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
      }],
  });
