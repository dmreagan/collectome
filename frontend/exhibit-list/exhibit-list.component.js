angular.module('exhibitList').component('exhibitList', {
  templateUrl: 'exhibit-list/exhibit-list.template.html',
  controller: [
    'Authentication',
    'Utilities',
    'apiHost',
    function exhibitCreateController(Authentication, Utilities, apiHost) {
      const utils = new Utilities();
      this.apiHost = apiHost;
      this.authentication = Authentication;

      this.exhibits = [];
      this.searchString = null;
      this.rowSearch = null;
      this.colSearch = null;

      this.threeByThreeCheckbox = false;
      this.fourByFourCheckbox = false;

      this.customizedLayoutCheckbox = false;
      this.ownedOnlyToggle = false;

      this.custRow = 3;
      this.custCol = 3;

      // this.$onInit = () => {
      //   console.log('onInit');
      // };

      // this.$onChanges = () => {
      //   console.log('onChange');
      // };

      // this.$postLink = () => {
      //   console.log('onPostLink');
      // };

      // only show exhibits that are public
      const filterExhibit = e => {
        /**
         * all public collections go through,
         * unless the ownedOnlyToggle is on
         */
        if (e.public && !this.ownedOnlyToggle) {
          return true;
        }

        /**
         * if exhibit not public, then check if login user
         * is the owner
         */
        if (this.authentication.userProfile) {
          const loginUser = this.authentication.userProfile.login;

          if (e.owner === loginUser) {
            return true;
          }
        }

        return false;
      };

      const loadExhibits = () => {
        utils.getExhibits().then(
          response => {
            this.exhibits = response.data.filter(filterExhibit);
            this.sortBy = '-create_time';
          },
          e => {
            console.warn(e);
            this.exhibits = [];
          }
        );
      };

      const searchExhibits = () => {
        let layouts = [];

        if (this.threeByThreeCheckbox) {
          layouts.push({ row: 3, col: 3 });
        }

        if (this.fourByFourCheckbox) {
          layouts.push({ row: 4, col: 4 });
        }

        if (this.customizedLayoutCheckbox) {
          if (!this.custRow) {
            this.custRow = 1;
          }

          if (!this.custCol) {
            this.custCol = 1;
          }

          layouts.push({ row: this.custRow, col: this.custCol });
        }

        if (layouts.length === 0) {
          layouts = null;
        }

        const query = {
          query_string: this.searchString,
          row: this.rowSearch,
          col: this.colSearch,
          gird_layouts: layouts,
        };

        utils.searchExhibits(query).then(
          response => {
            this.exhibits = response.data.filter(filterExhibit);
            this.sortBy = '-_score';
          },
          error => {
            console.warn(error);
            this.exhibits = [];
          }
        );
      };

      this.updateSearch = () => {
        if (
          !this.searchString &&
          !this.rowSearch &&
          !this.colSearch &&
          !this.threeByThreeCheckbox &&
          !this.fourByFourCheckbox &&
          !this.customizedLayoutCheckbox
        ) {
          loadExhibits();
        } else {
          searchExhibits();
        }
      };

      const init = () => {
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
    },
  ],
});
