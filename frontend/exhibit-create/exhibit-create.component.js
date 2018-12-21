angular
  .module('exhibitCreate')
  .component('exhibitCreate', {
    templateUrl: 'exhibit-create/exhibit-create.template.html',
    controller: ['exhibitConfigFactory', 'Utilities', '$location', '$routeParams', '$http',
      function exhibitCreateController(exhibitConfigFactory, Utilities, $location, $routeParams, $http) {
        const utils = new Utilities();

        this.exhibitId = $routeParams.exhibitId;

        this.$onInit = () => {
          // this.config = exhibitConfigFactory.config;

          const path = './assets/config-default.json';

          $http.get(path).then((response) => {
            this.config = response.data;
            // console.log(this.config);
          });
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
          // const divId = '#gridster';
          utils.submitExhibit(this.config, divId);
          utils.submitExhibit(this.config, snapshot);

          // $location.url(`/exhibit-create/${exhibitId}`);
        };
      }],
  });
