angular
  .module('exhibitList')
  .component('exhibitList', {
    templateUrl: 'exhibit-list/exhibit-list.template.html',
    controller: ['Authentication', 'Utilities', 'apiHost',
      function exhibitCreateController(Authentication, Utilities, apiHost) {
        const utils = new Utilities();
        this.apiHost = apiHost;
        this.authentication = Authentication;

        this.exhibits = [];
        this.searchString = null;
        this.rowSearch = null;
        this.colSearch = null;

        // only show exhibits that are public
        const filterExhibit = (e) => {
          if (e.public) {
            return true;
          }

          /**
           * if exhibit not public, then check if login user
           * is the owner
           */
          if (this.authentication.userProfile) {
            const loginUser = this.authentication.userProfile.login;

            console.log(loginUser);

            if (e.owner === loginUser) {
              return true;
            }
          }

          return false;
        };

        const loadExhibits = () => {
          utils.getExhibits().then((response) => {
            this.exhibits = response.data.filter(filterExhibit);
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
            this.exhibits = response.data.filter(filterExhibit);
            console.log(this.exhibits);
            this.sortBy = '_score';
          }, (error) => {
            console.warn(error);
            this.exhibits = [];
          });
        };

        this.updateSearch = () => {
          console.log(this.searchString);
          console.log(this.rowSearch);
          console.log(this.colSearch);

          if ((this.searchString === null) && (this.rowSearch === null) && (this.colSearch === null)) {
            console.log('loadExhibits');
            loadExhibits();
          } else {
            console.log('searchExhibits');
            searchExhibits();
          }
        };

        const init = () => {
          console.log('init loadExhibits');
          loadExhibits();
        };

        if (this.authentication.isAuthorized) {
          init();
        } else {
          // wait a while till async login is ready (if the login is clicked)
          const milliseconds = 1000;
          utils.sleep(milliseconds).then(() => {
            init();
          });
        }
      }],
  });
