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

        this.showfigcap = true;

        this.containerIdOnOffSwitch = false;

        this.switchContainerId = () => {
          if (!this.containerIdOnOffSwitch) {
            this.containerIdOnOffSwitch = true;
          } else {
            this.containerIdOnOffSwitch = false;
          }
        };

        this.updateConfig = (updatedConfig) => {
          this.config = updatedConfig;
        };

        this.goToExhibits = () => $location.url('/exhibits');

        this.goToCreated = () => $location.url(`/exhibits/${this.exhibitId}`);

        this.save = () => {
          if (this.authentication.userProfile.login === undefined) {
            this.message_style = 'alert error one-third float-center';
            this.info_message = 'Cannot obtain github login id.';
            return;
          }

          const loginUser = this.authentication.userProfile.login;

          if (this.exhibitOwner !== loginUser) {
            const msg = `exhibit owner ${this.exhibitOwner} not same as login user ${loginUser}`;

            this.message_style = 'alert error one-third float-center';
            this.info_message = msg;

            // console.log(msg);

            return;
          }

          const divId = '#avl-shim';
          // const divId = '#gridster';

          this.showfigcap = false;
          this.containerIdOnOffSwitch = false;

          /**
           * Before we do the snapshot, we want to hide figurecaption in
           * 'exhibit-config-preview.template.html' since html2canvas has
           * issues capturing the text.
           * 
           * 'this.showfigcap' will trigue the event to set figcaption's
           * ng-show property to false to make the figure caption be invisible.
           * However, the will take place AFTER html2canvas lib tries to capture
           * the snapshot. The workaround here is to synchronouslly sleep a while
           * to wait ng-show take effects.
           */
          const milliseconds = 500;
          utils.sleep(milliseconds).then(() => {
            utils.updateExhibit(this.exhibitId, this.config, divId, this, loginUser);
          });
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

              console.log('branch 1');
            } else if (this.exhibitIsPublic) {
              /**
               * login user is not the owner, however since the exhibit is set
               * to be public, login user can still view the exhibit but just
               * not allowed to make any edit.
               */
              this.exhibitEditPageCanbeDisplayed = true;
              console.log('branch 2');
            }
          } else if (this.exhibitIsPublic) {
            /**
             * when user is not logged in, if the exhibit is set to be public, then
             * can be displayed, otherwise not.
             */
            this.exhibitEditPageCanbeDisplayed = true;
            console.log('branch 3');
          }
        };

        // async initialization of this.config
        // eslint-disable-next-line max-len
        // utils.getExhibit(this.exhibitId).then((response) => {
        //   this.config = JSON.parse(response.data.config);
        //   this.exhibitOwner = response.data.owner;
        //   this.exhibitIsPublic = response.data.public;

        //   const milliseconds = 500;
        //   utils.sleep(milliseconds).then(() => {
        //     this.sanitycheck();
        //   });
        // });

        /**
         * sleep a while to make sure that authentication component
         * which is async is ready.
         */
        const milliseconds = 15;
        utils.sleep(milliseconds).then(() => {
          utils.getExhibit(this.exhibitId).then((response) => {
            this.config = JSON.parse(response.data.config);
            this.exhibitOwner = response.data.owner;
            this.exhibitIsPublic = response.data.public;
            this.sanitycheck();
          });
        });
      }],
  });
