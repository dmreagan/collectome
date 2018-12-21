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
    }],
  });
