angular.module('exhibitConfigEditor').component('exhibitConfigEditor', {
  bindings: {
    config: '<',
    onUpdate: '&'
  },
  templateUrl: 'exhibit-config-editor/exhibit-config-editor.template.html',
  controller: [
    '$scope',
    function exhibitConfigEditorController($scope) {
      const schema = {
        title: 'Exhibit configuration',
        description: 'Exhibit configuration details',
        type: 'object',
        properties: {
          metadata: {
            // $ref: 'metadata',
            $ref: '#/definitions/metadata'
          },
          content: {
            // $ref: 'content',
            $ref: '#/definitions/content'
          },
          display: {
            // $ref: 'display',
            $ref: '#/definitions/display'
          },
          layout: {
            // $ref: 'layout',
            $ref: '#/definitions/layout'
          },
          mapping: {
            // $ref: 'mapping',
            $ref: '#/definitions/mapping'
          }
        },
        required: ['metadata', 'content', 'display', 'layout', 'mapping'],

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

          content: {
            type: 'array',
            items: {
              // $ref: 'contentItem',
              $ref: '#/definitions/contentItem'
            }
          },

          contentItem: {
            type: 'object',
            properties: {
              id: {
                type: 'string'
              },
              title: {
                type: 'string'
              },
              url: {
                type: 'string'
              },
              scale: {
                type: 'number'
              }
            },
            required: ['id', 'title', 'url', 'scale']
          },

          display: {
            type: 'object',
            properties: {
              columns: {
                type: 'integer',
                minimum: 1
              },
              rows: {
                type: 'integer',
                minimum: 1
              },
              tile_x_resolution: {
                type: 'integer',
                minimum: 1
              },
              tile_y_resolution: {
                type: 'integer',
                minimum: 1
              }
            },
            required: [
              'columns',
              'rows',
              'tile_x_resolution',
              'tile_y_resolution'
            ]
          },

          layout: {
            type: 'object',
            properties: {
              margins: {
                // $ref: 'margins',
                $ref: '#/definitions/margins'
              },
              containers: {
                type: 'array',
                items: {
                  // $ref: 'containerItem',
                  $ref: '#/definitions/containerItem'
                }
              }
            },
            required: ['margins', 'containers']
          },

          margins: {
            type: 'object',
            properties: {
              XPercent: {
                type: 'number',
                minimum: 0
              },
              YPercent: {
                type: 'number',
                minimum: 0
              }
            },
            required: ['XPercent', 'YPercent']
          },

          containerItem: {
            type: 'object',
            properties: {
              id: {
                type: 'string'
              },
              originX: {
                type: 'integer',
                minimum: 0
              },
              originY: {
                type: 'integer',
                minimum: 0
              },
              sizeX: {
                type: 'integer',
                minimum: 1
              },
              sizeY: {
                type: 'integer',
                minimum: 1
              }
            },
            required: ['id', 'originX', 'originY', 'sizeX', 'sizeY']
          },

          mapping: {
            type: 'array',
            items: {
              // $ref: 'mappingItem',
              $ref: '#/definitions/mappingItem'
            }
          },

          mappingItem: {
            type: 'object',
            properties: {
              content: {
                type: 'string',
                description: 'content id'
              },
              container: {
                type: 'string',
                description: 'container id'
              }
            },
            required: ['content', 'container']
          }
        }
      };

      // const metadata = {
      //   type: 'object',
      //   properties: {
      //     name: {
      //       type: 'string',
      //     },
      //     description: {
      //       type: 'string',
      //     },
      //     authors: {
      //       type: 'array',
      //       items: {
      //         $ref: 'author',
      //       },
      //     },
      //     institutions: {
      //       type: 'array',
      //       items: {
      //         type: 'string',
      //       },
      //     },
      //     disciplines: {
      //       type: 'array',
      //       items: {
      //         type: 'string',
      //       },
      //     },
      //     tags: {
      //       type: 'array',
      //       items: {
      //         type: 'string',
      //       },
      //     },
      //     public: {
      //       type: 'boolean',
      //       default: false,
      //     },
      //   },
      //   required: ['name', 'description', 'authors', 'institutions', 'disciplines', 'tags', 'public'],
      // };

      // const author = {
      //   type: 'object',
      //   properties: {
      //     first_name: {
      //       type: 'string',
      //     },
      //     last_name: {
      //       type: 'string',
      //     },
      //   },
      //   required: ['first_name', 'last_name'],
      // };

      // const content = {
      //   type: 'array',
      //   items: { $ref: 'contentItem' },
      // };

      // const contentItem = {
      //   type: 'object',
      //   properties: {
      //     id: {
      //       type: 'string',
      //     },
      //     title: {
      //       type: 'string',
      //     },
      //     url: {
      //       type: 'string',
      //     },
      //     scale: {
      //       type: 'number',
      //     },
      //   },
      //   required: ['id', 'title', 'url', 'scale'],
      // };

      // const display = {
      //   type: 'object',
      //   properties: {
      //     columns: {
      //       type: 'integer',
      //       minimum: 1,
      //     },
      //     rows: {
      //       type: 'integer',
      //       minimum: 1,
      //     },
      //     tile_x_resolution: {
      //       type: 'integer',
      //       minimum: 1,
      //     },
      //     tile_y_resolution: {
      //       type: 'integer',
      //       minimum: 1,
      //     },
      //   },
      //   required: ['columns', 'rows', 'tile_x_resolution', 'tile_y_resolution'],
      // };

      // const layout = {
      //   type: 'object',
      //   properties: {
      //     margins: {
      //       $ref: 'margins',
      //     },
      //     containers: {
      //       type: 'array',
      //       items: {
      //         $ref: 'containerItem',
      //       },
      //     },
      //   },
      //   required: ['margins', 'containers'],
      // };

      // const margins = {
      //   type: 'object',
      //   properties: {
      //     XPercent: {
      //       type: 'number',
      //       minimum: 0,
      //     },
      //     YPercent: {
      //       type: 'number',
      //       minimum: 0,
      //     },
      //   },
      //   required: ['XPercent', 'YPercent'],
      // };

      // const containerItem = {
      //   type: 'object',
      //   properties: {
      //     id: {
      //       type: 'string',
      //     },
      //     originX: {
      //       type: 'integer',
      //       minimum: 0,
      //     },
      //     originY: {
      //       type: 'integer',
      //       minimum: 0,
      //     },
      //     sizeX: {
      //       type: 'integer',
      //       minimum: 1,
      //     },
      //     sizeY: {
      //       type: 'integer',
      //       minimum: 1,
      //     },
      //   },
      //   required: ['id', 'originX', 'originY', 'sizeX', 'sizeY'],
      // };

      // const mapping = {
      //   type: 'array',
      //   items: {
      //     $ref: 'mappingItem',
      //   },
      // };

      // const mappingItem = {
      //   type: 'object',
      //   properties: {
      //     content: {
      //       type: 'string',
      //       description: 'content id',
      //     },
      //     container: {
      //       type: 'string',
      //       description: 'container id',
      //     },
      //   },
      //   required: ['content', 'container'],
      // };

      const ajv = new Ajv({ allErrors: true, verbose: true });

      this.$onInit = () => {
        this.model = this.config;

        this.options = {
          schema,
          // schemaRefs: {
          //   metadata,
          //   author,
          //   content,
          //   contentItem,
          //   display,
          //   layout,
          //   margins,
          //   containerItem,
          //   mapping,
          //   mappingItem,
          // },
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
