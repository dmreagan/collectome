angular
  .module('exhibitCreate')
  .component('exhibitCreate', {
    templateUrl: 'exhibit-create/exhibit-create.template.html',
    controller: ['Authentication', 'Utilities', '$location', '$routeParams',
      function exhibitCreateController(Authentication, Utilities, $location, $routeParams) {
        const utils = new Utilities();

        this.authentication = Authentication;

        this.exhibitId = $routeParams.exhibitId;

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

        this.save = () => {
          // check github login id is available
          if (this.authentication.userProfile.login === undefined) {
            this.message_style = 'alert error one-third float-center';
            this.info_message = 'Cannot obtain github login id.';
            return;
          }

          const loginUser = this.authentication.userProfile.login;

          utils.submitExhibit(this.config, this, loginUser);
        };

        const path = './assets/config-default.json';

        // async initialization of this.config
        utils.getConfig(path).then((response) => { this.config = response.data; });
      }],
  });
