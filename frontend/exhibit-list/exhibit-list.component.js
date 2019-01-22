angular
  .module('exhibitList')
  .component('exhibitList', {
    templateUrl: 'exhibit-list/exhibit-list.template.html',
    controller: ['Utilities', 'apiHost',
      function exhibitCreateController(Utilities, apiHost) {
        const utils = new Utilities();
        this.apiHost = apiHost;

        this.exhibits = [];
        this.searchString = null;
        this.rowSearch = null;
        this.colSearch = null;

        const loadExhibits = () => {
          utils.getExhibits().then((response) => {
            this.exhibits = response.data;
            console.log(this.exhibits);
            this.sortBy = 'create_time';
          }, (e) => {
            console.warn(e);
            this.exhibits = [];
          });
        };

        const searchExhibits = () => {
          const query = {
            query_string: this.searchString,
            row: this.rowSearch,
            col: this.colSearch,
          };

          utils.searchExhibits(query).then((response) => {
            this.exhibits = response.data;
            this.sortBy = '-_score';
          }, (error) => {
            console.warn(error);
            this.exhibits = [];
          });
        };

        this.updateSearch = () => {
          console.log(this.searchString);
          console.log(this.rowSearch);
          console.log(this.colSearch);

          if ((this.searchString === '') && (this.rowSearch === null) && (this.colSearch === null)) {
            console.log('loadExhibits');
            loadExhibits();
          } else {
            console.log('searchExhibits');
            searchExhibits();
          }
        };

        const init = () => {
          loadExhibits();
        };

        init();
      }],
  });
