angular
  .module('exhibitCreate')
  .component('exhibitCreate', {
    templateUrl: 'exhibit-create/exhibit-create.template.html',
    controller: ['exhibitConfigFactory', 'Utilities', '$location', '$routeParams',
      function exhibitCreateController(exhibitConfigFactory, Utilities, $location, $routeParams) {
        const utils = new Utilities();

        this.exhibitId = $routeParams.exhibitId;

        this.$onInit = () => {
          this.config = exhibitConfigFactory.config;
        };

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
          //const divId = '#gridster';
          utils.submitExhibit(this.config, divId);
          utils.submitExhibit(this.config, snapshot);

          // $location.url(`/exhibit-create/${exhibitId}`);
        };
      }],
  });
