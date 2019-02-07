/*
Copyright (C) 2019 The Trustees of Indiana University
SPDX-License-Identifier: BSD-3-Clause
*/
angular
  .module('exhibitConfigDisplay')
  .component('exhibitConfigDisplay', {
    bindings: {
      config: '<',
    },
    templateUrl: 'exhibit-config-display/exhibit-config-display.template.html',
    controller: function exhibitConfigDisplayController() {
      this.$onInit = () => {
        this.model = this.config;

        this.options = {
          mode: 'tree',
          onEditable: function (node) {
              // this essentially makes the editor in read only mode
              return false;
          }      
        };
      };

      this.$onChanges = () => {
        /**
         * since config on exhibit-create is loaed in an async manner, the first
         * time this function is called this.config is still undefined. Once the promise
         * is resolved, this function will be called once again to have the correctly
         * initialized jason.
         */
        this.model = this.config;
      };
    },
  });
