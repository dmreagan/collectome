/*
Copyright (C) 2019 The Trustees of Indiana University
SPDX-License-Identifier: BSD-3-Clause
*/
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

        this.threeByThreeCheckbox = false;
        this.fourByFourCheckbox = false;

        this.customizedLayoutCheckbox = false;

        this.custRow = 1;
        this.custCol = 1;

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
            this.sortBy = '-create_time';
          }, (e) => {
            console.warn(e);
            this.exhibits = [];
          });
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

          console.log(layouts);

          const query = {
            query_string: this.searchString,
            row: this.rowSearch,
            col: this.colSearch,
            gird_layouts: layouts,
          };

          utils.searchExhibits(query).then((response) => {
            this.exhibits = response.data.filter(filterExhibit);
            console.log(this.exhibits);
            this.sortBy = '-_score';
          }, (error) => {
            console.warn(error);
            this.exhibits = [];
          });
        };

        this.updateSearch = () => {
          console.log('search string:'.concat(this.searchString));
          console.log('search row:'.concat(this.rowSearch));
          console.log('search col:'.concat(this.colSearch));
          console.log('3*3 checkbox:'.concat(this.threeByThreeCheckbox));
          console.log('4*4 checkbox:'.concat(this.fourByFourCheckbox));
          console.log('customized layout checkbox:'.concat(this.customizedLayoutCheckbox));
          console.log('customized row:'.concat(this.custRow));
          console.log('customized col:'.concat(this.custCol));

          if (!this.searchString && !this.rowSearch && !this.colSearch
            && !this.threeByThreeCheckbox
            && !this.fourByFourCheckbox
            && !this.customizedLayoutCheckbox) {
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
