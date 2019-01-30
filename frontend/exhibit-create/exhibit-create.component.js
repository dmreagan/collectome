angular
  .module('exhibitCreate')
  .component('exhibitCreate', {
    templateUrl: 'exhibit-create/exhibit-create.template.html',
    controller: ['Authentication', 'Utilities', '$location', '$routeParams',
      function exhibitCreateController(Authentication, Utilities, $location, $routeParams) {
        const utils = new Utilities();

        this.authentication = Authentication;

        this.exhibitId = $routeParams.exhibitId;

        this.showfig = true;

        this.livepreview = true;

        this.updateConfig = (updatedConfig) => {
          this.config = updatedConfig;
        };

        this.goToExhibits = () => $location.url('/exhibits');

        this.containerIdOnOffSwitch = false;

        this.switchContainerId = () => {
          if (!this.containerIdOnOffSwitch) {
            this.containerIdOnOffSwitch = true;
          } else {
            this.containerIdOnOffSwitch = false;
          }
        };

        if (this.exhibitId) {
          this.goToCreated = () => $location.url(`/exhibits/${this.exhibitId}`);
          this.message_success = 'alert success one-third float-center';
          this.message_content = 'Exhibit created!';
        }

        this.save = async function asyncSubmitExhibit() {
          // check github login id is available
          if (this.authentication.userProfile.login === undefined) {
            this.message_style = 'alert error one-third float-center';
            this.info_message = 'Cannot obtain github login id.';
            return;
          }

          const loginUser = this.authentication.userProfile.login;

          const divId = '#avl-shim';
          // const divId = '#gridster';

          this.showfig = false;
          this.containerIdOnOffSwitch = false;

          /**
           * Before we do the snapshot, we want to hide <figure></figure> in
           * 'exhibit-config-preview.template.html' since html2canvas has
           * issues capturing the iframe.
           * 
           * 'this.showfig' will trigue the event to set figure tag's
           * ng-if property to false to make the figures off.
           * However, the will take place AFTER html2canvas lib tries to capture
           * the snapshot. The workaround here is to synchronouslly sleep a while
           * to wait ng-if take effects.
           */

          const milliseconds = 10;
          utils.sleep(milliseconds).then(() => {
            utils.submitExhibit(this.config, divId, this, loginUser);
          });
        };

        const path = './assets/config-default.json';

        // async initialization of this.config
        utils.getConfig(path).then((response) => { this.config = response.data; });
      }],
  });
