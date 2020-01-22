/* eslint-disable func-names */
angular.module('utilities').service('Utilities', [
  'Api',
  '$window',
  '$q',
  '$location',
  '$http',
  '$route',
  function(Api, $window, $q, $location, $http, $route) {
    return function() {
      this.getConfig = path => {
        const d = $q.defer();
        $http.get(path).then(response => {
          d.resolve(response);
        });

        return d.promise;
      };

      this.initGridsterOpts = () => {
        const opts = {
          outerMargin: false,
          width: 'auto',
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

      this.calculateGridsterOpts = config => {
        const opts = this.initGridsterOpts();
        opts.columns = config.display.columns;
        opts.maxRows = config.display.rows;

        const marginX =
          (config.layout.margins.XPercent / 100.0) *
          config.display.tile_x_resolution;
        const marginY =
          (config.layout.margins.YPercent / 100.0) *
          config.display.tile_y_resolution;

        // TODO: the misalignment of the grid and the bezels is caused by the opts.margins setting
        opts.margins = [marginX, marginY];
        // opts.margins = [100, 100];

        opts.rowHeight = config.display.tile_y_resolution;
        opts.colWidth = config.display.tile_x_resolution;

        return opts;
      };

      this.calculateTiles = config => {
        // variable to be used by functions 'matchID' and 'matchMappingRecord'
        let id;

        /**
         * match container/content by id
         * @param {*} obj
         */
        const matchID = obj => {
          if (obj.id === id) {
            return true;
          }

          return false;
        };

        /**
         * match mapping record by container id
         * @param {*} obj
         */
        const matchMappingRecord = obj => {
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
          item.id = layout.containers[i].id;
          item.col = layout.containers[i].originX;
          item.row = layout.containers[i].originY;

          item.sizeX = layout.containers[i].sizeX;
          item.sizeY = layout.containers[i].sizeY;
          // following default values are used when no matching can be found
          item.title = '';
          item.url = '';
          item.contentId = '';

          id = layout.containers[i].id;

          const record = mapping.filter(matchMappingRecord);

          if (record.length > 0) {
            // get content id
            id = record[0].content;

            item.contentId = record[0].content;

            const matchedContent = content.filter(matchID);

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
        const widthPixels =
          config.display.tile_x_resolution * config.display.columns;
        const heightPixels =
          config.display.tile_y_resolution * config.display.rows;

        divPreview.style.width = `${widthPixels}px`;
        divPreview.style.height = `${heightPixels}px`;

        // have to subtract padding from clientWidth for proper scaling
        const padding = parseInt(
          $window.getComputedStyle(parent).paddingLeft,
          10
        );
        const parentWidth = parent.clientWidth - 2 * padding;
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
      this.calculateBezels = config => {
        const bezelPos = {};
        bezelPos.bezelPosHorizontal = [];
        bezelPos.bezelPosVertical = [];

        const columnWidth = config.display.tile_x_resolution;
        const rowHeight = config.display.tile_y_resolution;

        for (let i = 0; i < config.display.columns + 1; i += 1) {
          bezelPos.bezelPosHorizontal.push(i * columnWidth);
        }

        for (let j = 0; j < config.display.rows + 1; j += 1) {
          bezelPos.bezelPosVertical.push(j * rowHeight);
        }

        return bezelPos;
      };

      /**
       *
       * @param {base64 encoded string} snapshot
       */
      const uploadSnapshot = snapshot => {
        const d = $q.defer();
        const api = new Api('/snapshots');
        api.post({ snapshot }).then(
          response => {
            d.resolve(response);
          },
          response => {
            if (response.status === 409) {
              d.reject(response);
            }
          }
        );
        return d.promise;
      };

      /**
       *
       * @param {*} snapshotRef
       */
      this.deleteSnapshot = snapshotRef => {
        const d = $q.defer();

        const api = new Api(`/snapshot/${snapshotRef}`);
        api.delete().then(
          response => {
            d.resolve(response);
          },
          e => {
            console.warn(e);
            d.reject(e);
          }
        );
        return d.promise;
      };

      this.snapshotRollback = (snapshotRef, self, msg) => {
        /**
         * before roll back we need to check whether other exhibits
         * also refer to this snapshot, if yes, then no deletion.
         */
        const api = new Api(`/snapshotcount/${snapshotRef}`);
        api.get().then(
          response => {
            const snapshotCount = response.data.count;

            // console.log('snapshotCount');
            // console.log(snapshotCount);

            if (snapshotCount === 0) {
              this.deleteSnapshot(snapshotRef);

              self.message_style = 'alert error one-third float-center';
              self.info_message = msg;
            }
          },
          e => {
            console.warn(e);
            self.message_style = 'alert error one-third float-center';
            self.info_message = msg;
          }
        );
      };

      /**
       *
       * @param {config file} config
       * @param {type of the submit, 0 for create from scratch, 1 for update, i.e., delete and then create} type
       */
      this.submitExhibit = (config, self, owner, type) => {
        const snapshotRef =
          '-1'; /* reserved for future use, e.g., logo or user uplodaed image file */
        const extra = {};

        // eslint-disable-next-line max-len
        const authors = config.metadata.authors.filter(
          name => name.first_name && name.last_name
        );
        const filteredAuthors = authors.map(
          name => `${name.first_name}--${name.last_name}`
        );
        extra.authors = filteredAuthors.join(';');

        extra.institutions = config.metadata.institutions
          .filter(name => name)
          .join(';');

        extra.disciplines = config.metadata.disciplines.join(';');

        extra.tags = config.metadata.tags.join(';');

        extra.snapshotRef = snapshotRef;

        const api = new Api('/exhibits');

        const createTime = new Date();

        api
          .post({
            config,
            extra,
            createTime,
            owner,
          })
          .then(
            resp => {
              const assignedId = resp.data.id;

              if (type === 0) {
                // create from scratch
                const path = '/exhibit-create';
                $location.url(`${path}/${assignedId}`);
              } else if (type === 1) {
                // update, i.e., delete first and then create
                self.message_style = 'callout success';
                self.info_message = 'Collection has been successfully edited';
                self.success = true;
                $location.url(`/exhibits/${assignedId}/edit?status=success`);
              } else if (type === 2) {
                $location.url(`/exhibits/${assignedId}?status=copy`);
              }
            },
            e => {
              console.warn(e);

              // // roll back
              // const msg = 'Upload exhibit failed.';
              // this.snapshotRollback = (snapshotRef, self, msg);

              console.warn(e.data.status);
              self.message_style = 'callout alert';
              self.info_message = e.data.error;
            }
          );
      };

      /**
       *
       * @param {config file} config
       * @param {type of the submit, 0 for create from scratch, 1 for update, i.e., delete and then create} type
       */
      this.submitPlaylist = (config, self, owner, type) => {
        const extra = {};

        // eslint-disable-next-line max-len
        const authors = config.metadata.authors.filter(
          name => name.first_name && name.last_name
        );
        const filteredAuthors = authors.map(
          name => `${name.first_name}--${name.last_name}`
        );
        extra.authors = filteredAuthors.join(';');

        extra.institutions = config.metadata.institutions
          .filter(name => name)
          .join(';');

        extra.disciplines = config.metadata.disciplines.join(';');

        extra.tags = config.metadata.tags.join(';');

        extra.collections = config.collections.map(entry => entry.id).join(';');

        const api = new Api('/playlists');

        const createTime = new Date();

        api
          .post({
            config,
            extra,
            createTime,
            owner,
          })
          .then(
            resp => {
              const assignedId = resp.data.id;

              if (type === 0) {
                // create from scratch
                const path = '/playlist-create';
                $location.url(`${path}/${assignedId}`);
              } else if (type === 1) {
                // update, i.e., delete first and then create
                self.message_style = 'alert success one-third float-center';
                self.info_message = 'Playlist has been successfully edited';
                self.success = true;
                $location.url(`/playlists/${assignedId}/edit?status=success`);
              }
            },
            e => {
              console.warn(e);

              // // roll back
              // const msg = 'Upload exhibit failed.';
              // this.snapshotRollback = (snapshotRef, self, msg);

              console.warn(e.data.status);
              self.message_style = 'callout alert';
              self.info_message = e.data.error;
            }
          );
      };

      /**
       *
       * @param {config file} config
       * @param {id of the div to be taken a snapshot} divId
       */
      this.updateExhibit = (exhibitId, config, self, owner) => {
        const snapshotRef =
          '-1'; /* reserved for future use, e.g., logo or user uplodaed image file */
        const extra = {};

        const authors = config.metadata.authors.filter(
          name => name.first_name && name.last_name
        );
        const filteredAuthors = authors.map(
          name => `${name.first_name}--${name.last_name}`
        );
        extra.authors = filteredAuthors.join(';');

        extra.institutions = config.metadata.institutions
          .filter(name => name)
          .join(';');

        extra.disciplines = config.metadata.disciplines.join(';');

        extra.tags = config.metadata.tags.join(';');

        extra.snapshotRef = snapshotRef;

        const api = new Api(`/exhibit/${exhibitId}/edit`);

        const lastModifiedTime = new Date();

        api
          .put({
            config,
            extra,
            lastModifiedTime,
            owner,
          })
          .then(
            resp => {
              self.message_style = 'callout success';
              self.info_message = 'Exhibit has been successfully edited';
              self.success = true;

              // console.warn(resp);

              const params = $location.search();

              if (params.status) {
                if (params.status === 'success') {
                  /**
                   * come from a previous successful edit page
                   */
                  $route.reload();
                }
              } else {
                /**
                 * come from a plain edit page
                 */
                // add paramter and then reload
                $location.search('status', 'success');
              }
            },
            e => {
              console.warn(e);

              // roll back
              // const msg = 'Update exhibit failed.';
              // this.snapshotRollback = (snapshotRef, self, msg);

              self.message_style = 'callout alert';
              self.info_message = e.data.error;
            }
          );
      };

      /**
       *
       * @param {config file} config
       * @param {id of the div to be taken a snapshot} divId
       */
      this.updatePlaylist = (playlistId, config, self, owner) => {
        const snapshotRef =
          '-1'; /* reserved for future use, e.g., logo or user uplodaed image file */
        const extra = {};

        const authors = config.metadata.authors.filter(
          name => name.first_name && name.last_name
        );
        const filteredAuthors = authors.map(
          name => `${name.first_name}--${name.last_name}`
        );
        extra.authors = filteredAuthors.join(';');

        extra.institutions = config.metadata.institutions
          .filter(name => name)
          .join(';');

        extra.disciplines = config.metadata.disciplines.join(';');

        extra.tags = config.metadata.tags.join(';');

        extra.snapshotRef = snapshotRef;

        const api = new Api(`/playlist/${playlistId}/edit`);

        const lastModifiedTime = new Date();

        api
          .put({
            config,
            extra,
            lastModifiedTime,
            owner,
          })
          .then(
            resp => {
              self.message_style = 'callout success';
              self.info_message = 'Playlist has been successfully edited';
              self.success = true;

              // console.warn(resp);

              const params = $location.search();

              if (params.status) {
                if (params.status === 'success') {
                  /**
                   * come from a previous successful edit page
                   */
                  $route.reload();
                }
              } else {
                /**
                 * come from a plain edit page
                 */
                // add paramter and then reload
                $location.search('status', 'success');
              }
            },
            e => {
              console.warn(e);

              // roll back
              // const msg = 'Update exhibit failed.';
              // this.snapshotRollback = (snapshotRef, self, msg);

              self.message_style = 'callout alert';
              self.info_message = e.data.error;
            }
          );
      };

      this.getExhibit = exhibitId => {
        const d = $q.defer();
        const api = new Api(`/exhibit/${exhibitId}`);
        api.get().then(
          response => {
            d.resolve(response);
          },
          e => {
            console.warn(e);
            d.reject(e);
          }
        );
        return d.promise;
      };

      this.getPlaylist = playlistId => {
        const d = $q.defer();
        const api = new Api(`/playlist/${playlistId}`);
        api.get().then(
          response => {
            d.resolve(response);
          },
          e => {
            console.warn(e);
            d.reject(e);
          }
        );
        return d.promise;
      };

      this.deleteExhibit = exhibitId => {
        const api = new Api(`/exhibits/${exhibitId}`);
        return api.delete();
      };

      this.deletePlaylist = playlistId => {
        const api = new Api(`/playlists/${playlistId}`);
        return api.delete();
      };

      this.getAppGitHubClientId = () => {
        const d = $q.defer();

        const api = new Api('/github');
        api.get().then(
          response => {
            d.resolve(response);
          },
          e => {
            console.warn(e);
            d.reject(e);
          }
        );
        return d.promise;
      };

      this.checkExhibitId = (title, owner) => {
        const d = $q.defer();

        const api = new Api('/exhibitIdcheck');
        api.post({ title, owner }).then(
          response => {
            d.resolve(response);
          },
          e => {
            console.warn(e);
            d.reject(e);
          }
        );
        return d.promise;
      };

      this.checkPlaylistId = (title, owner) => {
        const d = $q.defer();

        const api = new Api('/playlistIdcheck');
        api.post({ title, owner }).then(
          response => {
            d.resolve(response);
          },
          e => {
            console.warn(e);
            d.reject(e);
          }
        );
        return d.promise;
      };

      this.getUserGitHubProfile = code => {
        const d = $q.defer();

        const api = new Api('/github');
        api.post({ code }).then(
          response => {
            d.resolve(response);
          },
          e => {
            console.warn(e);
            d.reject(e);
          }
        );
        return d.promise;
      };

      this.getSnapshotCount = snapshotRef => {
        const d = $q.defer();

        const api = new Api(`/snapshotcount/${snapshotRef}`);
        api.get().then(
          response => {
            d.resolve(response);
          },
          e => {
            console.warn(e);
            d.reject(e);
          }
        );
        return d.promise;
      };

      this.sleep = milliseconds =>
        new Promise(resolve => setTimeout(resolve, milliseconds));

      this.getExhibits = () => {
        const d = $q.defer();
        const api = new Api('/exhibits');
        api.get().then(
          response => {
            d.resolve(response);
          },
          e => {
            console.warn(e);
            d.reject(e);
          }
        );
        return d.promise;
      };

      this.getPlaylists = () => {
        const d = $q.defer();
        const api = new Api('/playlists');
        api.get().then(
          response => {
            d.resolve(response);
          },
          e => {
            console.warn(e);
            d.reject(e);
          }
        );
        return d.promise;
      };

      this.searchExhibits = query => {
        const d = $q.defer();
        const api = new Api('/searchExhibits');
        api.post(query).then(
          response => {
            d.resolve(response);
          },
          e => {
            console.warn(e);
            d.reject(e);
          }
        );
        return d.promise;
      };

      this.searchPlaylists = query => {
        const d = $q.defer();
        const api = new Api('/searchPlaylists');
        api.post(query).then(
          response => {
            d.resolve(response);
          },
          e => {
            console.warn(e);
            d.reject(e);
          }
        );
        return d.promise;
      };

      this.getSiteHeader = url => {
        const d = $q.defer();
        const api = new Api('/header');
        api.post({ url }).then(
          response => {
            d.resolve(response);
          },
          e => {
            console.warn(e);
            d.reject(e);
          }
        );
        return d.promise;
      };
    };
  },
]);
