angular
  .module('exhibitCreate')
  .component('exhibitCreate', {
    templateUrl: 'exhibit-create/exhibit-create.template.html',
    controller: ['Utilities', '$location', '$routeParams',
      function exhibitCreateController(Utilities, $location, $routeParams) {
        const utils = new Utilities();

        this.exhibitId = $routeParams.exhibitId;

        this.updateConfig = (updatedConfig) => {
          this.config = updatedConfig;
        };

        // this.goToExhibits = () => $location.url('/exhibits');

        /*
      if (this.exhibitId) {
        this.goToCreated = () => $location.url(`/exhibits/${this.exhibitId}`);
        this.message_success = 'alert success one-third float-center';
        this.message_content = 'Exhibit created!';
      }
      */

        this.save = () => {
          const divId = '#avl-preview';
          // const divId = '#gridster';
          utils.submitExhibit(this.config, divId);
        };

        const path = './assets/config-default.json';

        // async initialization of this.config
        utils.getConfig(path).then((response) => { this.config = response.data; });
      }],
  });
