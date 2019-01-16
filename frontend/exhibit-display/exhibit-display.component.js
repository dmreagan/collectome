angular
  .module('exhibitDisplay')
  .component('exhibitDisplay', {
    templateUrl: 'exhibit-display/exhibit-display.template.html',
    controller: ['Authentication', 'Utilities', '$routeParams', '$location',
      function exhibitDetailController(Authentication, Utilities, $routeParams, $location) {
        const utils = new Utilities();

        this.authentication = Authentication;

        this.exhibitId = $routeParams.exhibitId;

        this.exhibitIsPublic = false;

        // async initialization of this.config
        // eslint-disable-next-line max-len
        utils.getExhibit(this.exhibitId).then((response) => {
          this.config = JSON.parse(response.data.config);
          this.snapshotRef = response.data.snapshot_ref;
          this.exhibitOwner = response.data.owner;
          this.exhibitIsPublic = response.data.public;
          this.exhibitIsPublic = response.data.public;
        });

        this.goToExhibits = () => $location.url('/exhibits');
      }],
  });
