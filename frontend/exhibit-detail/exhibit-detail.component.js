angular
  .module('exhibitDetail')
  .component('exhibitDetail', {
    templateUrl: 'exhibit-detail/exhibit-detail.template.html',
    controller: ['Utilities', '$routeParams',
      function exhibitDetailController(Utilities, $routeParams) {
        const utils = new Utilities();

        this.exhibitId = $routeParams.exhibitId;

        this.delete = () => {
          // TODO
        };

        // async initialization of this.config
        // eslint-disable-next-line max-len
        utils.getExhibit(this.exhibitId).then((response) => { this.config = response.data.config; });
      }],
  });
