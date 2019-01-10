/* eslint-disable func-names */
angular
  .module('utilities')
  .service('Utilities', ['Api', '$window', '$q', '$location', '$http', function (Api, $window, $q, $location, $http) {
    return function () {
      this.getConfig = (path) => {
        const d = $q.defer();
        $http.get(path).then((response) => {
          d.resolve(response);
        });

        return d.promise;
      };

      this.initGridsterOpts = () => {
        const opts = {
          outerMargin: false,
          width: 'auto',
          colWidth: 'auto',
          pushing: true,
          floating: true,
          draggable: {
            enabled: true,
          },
          resizable: {
            enabled: false,
            handles: ['n', 'e', 's', 'w', 'se', 'sw'],
          },
        };

        return opts;
      };

      this.calculateGridsterOpts = (config) => {
        const opts = this.initGridsterOpts();
        opts.columns = config.display.columns;
        opts.maxRows = config.display.rows;

        const marginX = (config.layout.margins.XPercent / 100.0) * config.display.tile_x_resolution;
        const marginY = (config.layout.margins.YPercent / 100.0) * config.display.tile_y_resolution;

        // TODO: the misalignment of the grid and the bezels is caused by the opts.margins setting
        opts.margins = [marginX, marginY];
        // opts.margins = [100, 100];

        opts.rowHeight = config.display.tile_y_resolution;

        return opts;
      };

      this.calculateTiles = (config) => {
        // variable to be used by functions 'matchID' and 'matchMappingRecord'
        let id;

        /**
        * match container/content by id
        * @param {*} obj
        */
        const matchID = (obj) => {
          if (obj.id === id) {
            return true;
          }

          return false;
        };

        /**
        * match mapping record by container id
        * @param {*} obj
        */
        const matchMappingRecord = (obj) => {
          if (obj.container === id) {
            return true;
          }

          return false;
        };


        const tiles = [];
        const layout = config.layout;
        const content = config.content;
        const mapping = config.mapping;

        for (let i = 0, l = layout.containers.length; i < l; i += 1) {
          const item = {};
          item.col = layout.containers[i].originX;
          item.row = layout.containers[i].originY;

          item.sizeX = layout.containers[i].sizeX;
          item.sizeY = layout.containers[i].sizeY;
          // following default values are used when no matching can be found
          item.title = '';
          item.url = '';

          id = layout.containers[i].id;

          record = mapping.filter(matchMappingRecord);

          if (record.length > 0) {
            // get content id
            id = record[0].content;

            matchedContent = content.filter(matchID);

            if (matchedContent.length > 0) {
              item.title = matchedContent[0].title;
              item.url = matchedContent[0].url;
            }
          }

          tiles.push(item);
        }

        const compare = (a, b) => {
          if (a.row !== b.row) {
            return a.row - b.row;
          }

          return a.col - b.col;
        };

        const sortedTiles = tiles.sort(compare);
        return sortedTiles;
      };

      /**
       * Set size and scale values for the preview
      */
      this.calculateSize = (shimDivId, previewDivId, config) => {
        const divPreview = document.querySelector(previewDivId);
        const divShim = document.querySelector(shimDivId);
        const parent = divPreview.parentElement.parentElement.parentElement;

        // set preview size
        const widthPixels = config.display.tile_x_resolution * config.display.columns;
        const heightPixels = config.display.tile_y_resolution * config.display.rows;

        divPreview.style.width = `${widthPixels}px`;
        divPreview.style.height = `${heightPixels}px`;

        // have to subtract padding from clientWidth for proper scaling
        const padding = parseInt($window.getComputedStyle(parent).paddingLeft, 10);
        const parentWidth = parent.clientWidth - (2 * padding);
        const scaleWidth = parentWidth / widthPixels;

        // scale preview back down to fit the page
        divPreview.style.transform = `scale3d(${scaleWidth}, ${scaleWidth}, 1)`;

        // set size of shim to save room for the preview
        divShim.style.height = `${heightPixels * scaleWidth}px`;
      };

      /**
       * Fill arrays with bezel positions
       * Arrays are used by ngRepeat in the template
      */
      this.calculateBezels = (config) => {
        const bezelPos = {};
        bezelPos.bezelPosHorizontal = [];
        bezelPos.bezelPosVertical = [];

        const columnWidth = config.display.tile_x_resolution;
        const rowHeight = config.display.tile_y_resolution;

        for (let i = 1; i < (config.display.columns); i += 1) {
          bezelPos.bezelPosHorizontal.push(i * columnWidth);
        }

        for (let j = 1; j < (config.display.rows); j += 1) {
          bezelPos.bezelPosVertical.push(j * rowHeight);
        }

        return bezelPos;
      };

      /**
       *
       * @param {base64 encoded string} snapshot
       */
      const uploadSnapshot = (snapshot) => {
        const d = $q.defer();
        const api = new Api('/snapshots');
        api.post({ snapshot }).then((response) => {
          d.resolve(response);
        }, (response) => {
          if (response.status === 409) {
            d.reject(response);
          }
        });
        return d.promise;
      };

      /**
       *
       * @param {*} snapshotRef
       */
      this.deleteSnapshot = (snapshotRef) => {
        const api = new Api(`/snapshot/${snapshotRef}`);
        api.delete().then((response) => {
          // console.log("Deleted: "+ response);
          // console.log(response);
        }, (e) => {
          console.warn(e);
        });
      };

      this.snapshotRollback = (snapshotRef, self, msg) => {
        /**
          * before roll back we need to check whether other exhibits
          * also refer to this snapshot, if yes, then no deletion.
        */
        const api = new Api(`/snapshotcount/${snapshotRef}`);
        api.get().then((response) => {
          const snapshotCount = response.data.count;

          // console.log('snapshotCount');
          // console.log(snapshotCount);

          if (snapshotCount === 0) {
            this.deleteSnapshot(snapshotRef);

            self.message_style = 'alert error one-third float-center';
            self.info_message = msg;
          }
        }, (e) => {
          console.warn(e);
          self.message_style = 'alert error one-third float-center';
          self.info_message = msg;
        });
      };

      /**
       *
       * @param {config file} config
       * @param {id of the div to be taken a snapshot} divId
       */
      this.submitExhibit = async function asyncSubmitExhibit(config, divId, self, owner) {
        const path = '/exhibit-create';

        /* generate image snapshot */

        const prefix = 'data:image/png;base64,';

        const canvas = await html2canvas(document.querySelector(divId));
        // get base64 encoded string of the snapshot
        const snapshot = await canvas.toDataURL().substring(prefix.length);

        self.showfigcap = true;
        
        // console.log(snapshot);

        // document.body.appendChild(canvas);

        uploadSnapshot(snapshot).then((response) => {
          const snapshotRef = response.data.digest;
          const extra = {};

          // eslint-disable-next-line max-len
          const authors = config.metadata.authors.filter(name => (name.first_name && name.last_name));
          const filteredAuthors = authors.map(name => `${name.first_name}--${name.last_name}`);
          extra.authors = filteredAuthors.join(';');

          extra.institutions = config.metadata.institutions.filter(name => name).join(';');

          extra.disciplines = config.metadata.disciplines.join(';');

          extra.snapshotRef = snapshotRef;

          const api = new Api('/exhibits');

          const createTime = new Date();

          api.post({ config, extra, createTime, owner }).then((resp) => {
            const assignedId = resp.data.id;

            $location.url(`${path}/${assignedId}`);
          }, (e) => {
            console.warn(e);

            // roll back
            const msg = 'Upload exhibit failed.';
            this.snapshotRollback = (snapshotRef, self, msg);
          });
        }, (e) => {
          console.warn(e);
          self.message_style = 'alert error one-third float-center';
          self.info_message = 'Upload snapshot failed.';
        });
      };


      /**
       *
       * @param {config file} config
       * @param {id of the div to be taken a snapshot} divId
       */
      this.updateExhibit = async function asyncSubmitExhibit(exhibitId, config, divId, self, owner) {
        /* generate image snapshot */

        const prefix = 'data:image/png;base64,';
        const canvas = await html2canvas(document.querySelector(divId));
        // get base64 encoded string of the snapshot
        const snapshot = await canvas.toDataURL().substring(prefix.length);

        self.showfigcap = true;

        // document.body.appendChild(canvas);

        uploadSnapshot(snapshot).then((response) => {
          const snapshotRef = response.data.digest;
          const extra = {};

          extra.authors = config.metadata.authors.filter(name => name.name_first && name.name_last).join(';');

          extra.institutions = config.metadata.institutions.filter(name => name).join(';');

          extra.disciplines = config.metadata.disciplines.join(';');

          extra.snapshotRef = snapshotRef;

          const api = new Api(`/exhibit/${exhibitId}/edit`);

          const lastModifiedTime = new Date();
          api.put({ config, extra, lastModifiedTime, owner }).then((resp) => {
            self.message_style = 'alert success one-third float-center';
            self.info_message = 'Post has been successfully edited';
            self.success = true;
            console.warn(resp);
          }, (e) => {
            console.warn(e);

            // roll back
            const msg = 'Update exhibit failed.';
            this.snapshotRollback = (snapshotRef, self, msg);
          });
        }, (e) => {
          console.warn(e);
          self.message_style = 'alert error one-third float-center';
          self.info_message = 'Upload snapshot failed.';
        });
      };

      this.getExhibit = (exhibitId) => {
        const d = $q.defer();
        const api = new Api(`/exhibit/${exhibitId}`);
        api.get().then((response) => {
          d.resolve(response);
        }, (e) => {
          console.warn(e);
          d.reject({});
        });
        return d.promise;
      };


      this.deleteExhibit = (exhibitId) => {
        const api = new Api(`/exhibits/${exhibitId}`);
        return api.delete();
      };

      this.getAppGitHubClientId = () => {
        const d = $q.defer();

        const api = new Api('/github');
        api.get().then((response) => {
          d.resolve(response);
        }, (e) => {
          console.warn(e);
          d.reject({});
        });
        return d.promise;
      };

      this.getUserGitHubProfile = (code) => {
        const d = $q.defer();

        const api = new Api('/github');
        api.post({ code }).then((response) => {
          d.resolve(response);
        }, (e) => {
          console.warn(e);
          d.reject({});
        });
        return d.promise;
      };

      this.getSnapshotCount = (snapshotRef) => {
        const d = $q.defer();

        const api = new Api(`/snapshotcount/${snapshotRef}`);
        api.get().then((response) => {
          d.resolve(response);
        }, (e) => {
          console.warn(e);
          d.reject({});
        });
        return d.promise;
      };

      this.sleep = (milliseconds) => {
        return new Promise(resolve => setTimeout(resolve, milliseconds));
      };
    };
  }]);
