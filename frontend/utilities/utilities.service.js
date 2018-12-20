/* eslint-disable func-names */
angular
  .module('utilities')
  .service('Utilities', ['Api', '$window', '$q', '$location', function (Api, $window, $q, $location) {
    return function () {
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
        //opts.margins = [marginX, marginY];

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
      const deleteSnapshot = (snapshotRef) => {
        const api = new Api(`/snapshots/${snapshotRef}`);
        api.delete().then((response) => {
          // console.log("Deleted: "+ response);
          // console.log(response);
        }, (e) => {
          console.warn(e);
        });
      };

      /**
       *
       * @param {config file} config
       * @param {id of the div to be taken a snapshot} divId
       */
      this.submitExhibit = async function asyncSubmitExhibit(config, divId) {
        const path = '/exhibit-create';

        /* generate image snapshot */

        const prefix = 'data:image/png;base64,';
        const canvas = await html2canvas(document.querySelector(divId));
        // get base64 encoded string of the snapshot
        const snapshot = await canvas.toDataURL().substring(prefix.length);

        document.body.appendChild(canvas);

        uploadSnapshot(snapshot).then((response) => {
          const snapshotRef = response.data.digest;
          const extra = {};

          extra.authors = config.metadata.authors.filter(name => name.name_first && name.name_last).join(';');

          extra.institutions = config.metadata.institutions.filter(name => name).join(';');

          extra.disciplines = config.metadata.disciplines.join(';');

          extra.snapshotRef = snapshotRef;

          const api = new Api('/exhibits');

          api.post({ config, extra }).then((resp) => {
            const assignedId = resp.data.id;

            /*
            const protocol = $location.protocol();
            const host = $location.host();
            const port = $location.host();
            url = `${protocol}//${host}:${port}${path}/${assignedId}`;
            */

            $location.url(`${path}${assignedId}`);
          }, (e) => {
            console.warn(e);

            // roll back
            deleteSnapshot(snapshotRef);

            const message_style = 'alert error one-third float-center';
            const info_message = `Upload exhibit failed. ${e.data.error}`;
          });
        }, (e) => {
          console.warn(e);
          message_style = 'alert error one-third float-center';
          info_message = `Upload snapshot failed. ${e.data.error}`;
        });
      };
    };
  }]);
