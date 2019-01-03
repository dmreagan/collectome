angular
  .module('exhibitDetail')
  .component('exhibitDetail', {
    templateUrl: 'exhibit-detail/exhibit-detail.template.html',
    controller: ['Utilities', '$routeParams', '$location',
      function exhibitDetailController(Utilities, $routeParams, $location) {
        const utils = new Utilities();

        this.exhibitId = $routeParams.exhibitId;

        // async initialization of this.config
        // eslint-disable-next-line max-len
        utils.getExhibit(this.exhibitId).then((response) => {
          this.config = JSON.parse(response.data.config);
          this.snapshotRef = response.data.snapshot_ref;
        });

        this.goToExhibits = () => $location.url('/exhibits');
        this.goToEdit = () => $location.url(`/exhibits/${this.exhibitId}/edit`);

        this.delete = () => {
          this.confirmDelete = true;
          this.message_style = 'alert info one-third float-center';
          this.info_message = 'Are you sure you want to delete this project?';

          this.deleteYes = () => {
            this.acknowledgeDelete = true;
            this.confirmDelete = false;

            utils.deleteSnapshot(this.snapshotRef);

            utils.deleteExhibit(this.exhibitId).then((response) => {
              this.message_style = 'alert success one-third float-center';
              this.info_message = 'Exhibit Deleted!';
              // console.log(response);
              // console.log('Exhibit deleted!');
            }, (e) => {
              console.warn(e);
              // window.alert('Deleting the post failed.');
              this.message_style = 'alert error one-third float-center';
              this.info_message = 'Deleting the post failed.';
            });
          };
        };

        this.deleteNo = () => {
          this.confirmDelete = false;
        };

        this.deleteAcknowledge = () => {
          $location.url('/exhibits');
        };
      }],
  });
