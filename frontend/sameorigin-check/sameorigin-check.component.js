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
            this.message_style = 'callout warning';
            this.info_message = 'URL cannot be empty';
            return;
          }

          utils.getSiteHeader(this.searchURL).then((response) => {
            const data = response.data;

            console.log(data);

            const lines = data.split('\n');

            this.message_style = 'callout success';

            for (let i = 0; i < lines.length; i += 1) {
              if (lines[i].toLowerCase().startsWith(XFrameOptKey.toLowerCase())) {
                console.log(lines[i]);
                this.info_message = `${lines[i]}`;
                this.message_style = 'callout alert';

                return;
              }
            }

            this.info_message = `${XFrameOptKey} is not set`;
          }, (error) => {
            console.warn(error);

            this.message_style = 'callout warning';

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
