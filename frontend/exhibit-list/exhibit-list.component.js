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
  })
  .directive('drawdisplay', () => {
    return {
      restrict: 'E',
      scope: {},
      link: function(scope, element, attrs) {
        const canvas = element.children()[0];
        const ctx = canvas.getContext('2d');

        const x = 10;
        const y = 10;
        const width = 150;
        const height = 100;

        ctx.lineWidth = 5;

        ctx.strokeRect(x, y, width, height);

        ctx.fillStyle = 'wheat';
        ctx.fillRect(x, y, width, height);

        const rows = attrs.rows;
        const cols = attrs.cols;

        // console.log(rows);
        // console.log(cols);

        const rowHeight = Math.ceil(height / rows);
        const colWidth = Math.ceil(width / cols);

        ctx.lineWidth = 2;

        for (let i = 1; i < rows; i += 1) {
          ctx.beginPath();

          ctx.moveTo(x, i * rowHeight + y);
          ctx.lineTo(x + width, i * rowHeight + y);
          ctx.stroke();
        }

        for (let i = 1; i < cols; i += 1) {
          ctx.beginPath();

          ctx.moveTo(i * colWidth + x, y);
          ctx.lineTo(i * colWidth + x, y + height);
          ctx.stroke();
        }
    
      }
    };
  })
  .directive('drawgrid', () => {
    return {
      restrict: 'E',
      scope: {
        config: '=config',
      },
      link: function(scope, element, attrs) {
        const config = JSON.parse(scope.config);
        
        const displayRows = config.display.rows;
        const displayCols = config.display.columns;

        // console.log(displayRows);
        // console.log(displayCols);

        const containers = config.layout.containers;

        // console.log(containers);

        const compare = (a, b) => {
          if (a.originY !== b.originY) {
            return a.originY - b.originY;
          }

          return a.originX - b.originX;
        };

        const sortedContainers= containers.sort(compare);
        // console.log(sortedContainers);

        const canvas = element.children()[0];
        const ctx = canvas.getContext('2d');

        const x = 5;
        const y = 5;
        const width = 280;
        const height = 140;

        ctx.lineWidth = 2;

        const rowHeight = Math.floor(height / displayRows);
        const colWidth = Math.floor(width / displayCols);

        for (let i = 0; i < sortedContainers.length; i += 1) {
          const container = sortedContainers[i];

          const originX = container.originX * colWidth + x;
          const originY = container.originY * rowHeight + y;

          const gridWidth = container.sizeX * colWidth;
          const gridHeight = container.sizeY * rowHeight;

          ctx.strokeRect(originX, originY, gridWidth, gridHeight);

          // ctx.fillStyle = 'blanchedalmond';
          // ctx.fillRect(originX, originY, gridWidth, gridHeight);
        }
    
      }
    };
  });
