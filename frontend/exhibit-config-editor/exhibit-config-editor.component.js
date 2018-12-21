angular
  .module('exhibitConfigEditor')
  .component('exhibitConfigEditor', {
    bindings: {
      config: '<',
      onUpdate: '&',
    },
    templateUrl: 'exhibit-config-editor/exhibit-config-editor.template.html',
    controller: ['$scope', function avlConfigEditorController($scope) {
      this.$onInit = () => {
        this.model = this.config;

        this.options = {
          mode: 'code',
        };
      };

      this.$postLink = () => {
        $scope.$watchCollection(() => this.model, (newConfig) => {
          this.onUpdate({ config: newConfig });
        });
      };

      this.$onChanges = () => {
        // console.log('onChange');

        /**
         * since config on exhibit-create is loaed in an async manner, the first
         * time this function is called this.config is still undefined. Once the promise
         * is resolved, this function will be called once again to have the correctly
         * initialized jason.
         * 
         * Also this function is called whenever content of jason editor changes, however,
         * this should not have any side effect since this.conig is essentially the same
         * as this.model.
         */
        this.model = this.config;
      };
    }],
  });
