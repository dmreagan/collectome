/*
Copyright (C) 2019 The Trustees of Indiana University
SPDX-License-Identifier: BSD-3-Clause
*/
angular
  .module('sameoriginCheck')
  .component('sameoriginCheck', {
    templateUrl: 'sameorigin-check/sameorigin-check.template.html',
    controller: ['Utilities',
      function exhibitCreateController(Utilities) {
        const utils = new Utilities();
        this.searchURL = '';

        const XFrameOptKey = 'X-Frame-Options';

        this.search = () => {
          this.message_style = null;
          this.info_message = null;

          if (this.searchURL === '') {
            this.message_style = 'alert error one-third float-center';
            this.info_message = 'Search URL cannot be empty';
            return;
          }

          utils.getSiteHeader(this.searchURL).then((response) => {
            const data = response.data;

            console.log(data);

            const lines = data.split('\n');

            this.message_style = 'alert success one-third float-center';

            for (let i = 0; i < lines.length; i += 1) {
              if (lines[i].toLowerCase().startsWith(XFrameOptKey.toLowerCase())) {
                console.log(lines[i]);
                this.info_message = `${lines[i]}`;

                return;
              }
            }

            this.info_message = `${XFrameOptKey} is not set`;
          }, (error) => {
            console.warn(error);

            this.message_style = 'alert error one-third float-center';

            console.log(error.status);

            if (error.status === 404) {
              this.info_message = `Cannot resolve URL ${this.searchURL}`;
            } else {
              this.info_message = `Cannot get info for URL ${this.searchURL}`;
            }
          });
        };
      }],
  });