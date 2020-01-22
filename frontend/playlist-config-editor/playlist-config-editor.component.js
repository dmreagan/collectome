angular.module('playlistConfigEditor').component('playlistConfigEditor', {
  bindings: {
    config: '<',
    onUpdate: '&'
  },
  templateUrl: 'playlist-config-editor/playlist-config-editor.template.html',
  controller: [
    '$scope',
    function playlistConfigEditorController($scope) {
      const schema = {
        title: 'Playlist configuration',
        description: 'Playlist configuration details',
        type: 'object',
        properties: {
          metadata: {
            // $ref: 'metadata',
            $ref: '#/definitions/metadata'
          },
          collections: {
            // $ref: 'collections',
            $ref: '#/definitions/collections'
          }
        },
        required: ['metadata', 'collections'],

        definitions: {
          metadata: {
            type: 'object',
            properties: {
              name: {
                type: 'string'
              },
              description: {
                type: 'string'
              },
              authors: {
                type: 'array',
                items: {
                  // $ref: 'author',
                  $ref: '#/definitions/author'
                }
              },
              institutions: {
                type: 'array',
                items: {
                  type: 'string'
                }
              },
              disciplines: {
                type: 'array',
                items: {
                  type: 'string'
                }
              },
              tags: {
                type: 'array',
                items: {
                  type: 'string'
                }
              },
              public: {
                type: 'boolean',
                default: false
              }
            },
            required: [
              'name',
              'description',
              'authors',
              'institutions',
              'disciplines',
              'tags',
              'public'
            ]
          },

          author: {
            type: 'object',
            properties: {
              first_name: {
                type: 'string'
              },
              last_name: {
                type: 'string'
              }
            },
            required: ['first_name', 'last_name']
          },

          collections: {
            type: 'array',
            items: {
              // $ref: 'collectionsItem',
              $ref: '#/definitions/collectionsItem'
            }
          },

          collectionsItem: {
            type: 'object',
            properties: {
              id: {
                type: 'string'
              },
              duration: {
                type: 'number'
              }
            },
            required: ['id', 'duration']
          }
        }
      };

      const ajv = new Ajv({ allErrors: true, verbose: true });

      this.$onInit = () => {
        this.model = this.config;

        this.options = {
          schema,
          ajv,
          mode: 'code'
        };
      };

      this.$postLink = () => {
        $scope.$watchCollection(
          () => this.model,
          newConfig => {
            this.onUpdate({ config: newConfig });
          }
        );
      };

      this.$onChanges = () => {
        // console.log('onChange');

        /**
         * since config on exhibit-create is loaed in an async manner, the first
         * time this function is called this.config is still undefined. Once the promise
         * is resolved, this function will be called once again to have the correctly
         * initialized jason.
         *
         * Also this function is called whenever content of jason editor changes, however,
         * this should not have any side effect since this.conig is essentially the same
         * as this.model.
         */
        this.model = this.config;
      };
    }
  ]
});
