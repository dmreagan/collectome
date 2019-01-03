angular
  .module('exhibitEdit')
  .component('exhibitEdit', {
    templateUrl: 'exhibit-edit/exhibit-edit.template.html',
    controller: ['Utilities', '$location', '$routeParams',
      function exhibitEditController(Utilities, $location, $routeParams) {
        console.log('exhibitEditController');
        const utils = new Utilities();

        this.exhibitId = $routeParams.exhibitId;

        this.goToExhibits = () => $location.url('/exhibits');

        this.goToCreated = () => $location.url(`/exhibits/${this.exhibitId}`);

        this.save = () => {
          const divId = '#avl-preview';
          // const divId = '#gridster';
          utils.updateExhibit(this.exhibitId, this.config, divId, this);
        };

        // async initialization of this.config
        // eslint-disable-next-line max-len
        utils.getExhibit(this.exhibitId).then((response) => { this.config = JSON.parse(response.data.config); });
      }],
  });

