angular
  .module('exhibitCreate')
  .component('exhibitCreate', {
    templateUrl: 'exhibit-create/exhibit-create.template.html',
    controller: ['Authentication', 'Utilities', '$location', '$routeParams',
      function exhibitCreateController(Authentication, Utilities, $location, $routeParams) {
        const utils = new Utilities();

        this.authentication = Authentication;
        
        this.exhibitId = $routeParams.exhibitId;

        this.updateConfig = (updatedConfig) => {
          this.config = updatedConfig;
        };

        this.goToExhibits = () => $location.url('/exhibits');

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

          const owner = this.authentication.userProfile.login;
          console.log(owner);

          // const divId = '#avl-preview';
          const divId = '#gridster';
          utils.submitExhibit(this.config, divId, this, owner);
        };

        const path = './assets/config-default.json';

        // async initialization of this.config
        utils.getConfig(path).then((response) => { this.config = response.data; });
      }],
  });
