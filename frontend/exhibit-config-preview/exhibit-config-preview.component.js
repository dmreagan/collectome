/* eslint-disable object-shorthand */
/* eslint-disable func-names */
/* eslint-disable indent */
angular
  .module('exhibitConfigPreview')
  .component('exhibitConfigPreview', {
    bindings: {
      config: '<',
      idswitch: '<',
      livepreview: '<',
    },
    templateUrl: 'exhibit-config-preview/exhibit-config-preview.template.html',
    controller: ['Utilities', function exhibitConfigPreviewController(Utilities) {
      const utils = new Utilities();

      this.idSwitchPreviousValue = null;

      const updatePreview = () => {
        utils.calculateSize('#avl-shim', '#avl-preview', this.config);

        const bezelPos = utils.calculateBezels(this.config);
        this.bezelPosHorizontal = bezelPos.bezelPosHorizontal;
        this.bezelPosVertical = bezelPos.bezelPosVertical;

        this.gridsterOpts = utils.calculateGridsterOpts(this.config);
        this.tiles = utils.calculateTiles(this.config);
      };


      this.$onInit = () => {
        // console.log('onInit');
        this.idSwitchPreviousValue = this.idswitch;
      };

      this.$doCheck = () => {
        // console.log('doCheck');
      };

      this.$onChanges = () => {
        // console.log('onChange');
        /**
         * when onChanges event is triggered by idswitch, there is no need
         * to update preview, just rely on ng-if to show the title
         */
        if (this.idSwitchPreviousValue !== null) { // make sure idSwitchPreviousValue is initialized
          if (this.idswitch !== this.idSwitchPreviousValue) {
            this.idSwitchPreviousValue = this.idswitch;
            return;
          }
        }

        /**
         * since we load config using async http.get from exhibit-create component,
         * the first time the onChanges event being called, config is still undefined.
         * We need to bypass this call and wait for its second invocation when config
         * has been initialized properly.
         */
        if (this.config !== undefined) {
          // only update when 'livepreview' is set to be true
          if (this.livepreview) {
            updatePreview();
          }
        }
      };

      this.$postLink = () => {
        // console.log('onPostLink');
      };
    }],
  })
  .filter('trusted', ['$sce', function ($sce) {
    return function (url) {
      return $sce.trustAsResourceUrl(url);
    };
  }])
  .directive('scale', () => {
    return {
      restrict: 'A',
      scope: {
        config: '=scale',
     },
      link: function(scope, elem, attr) {
        elem.on('load', function() {
            const contentId = elem.attr('contentId');
            // console.log(contentId);

            const grids = elem.parent().parent().parent(); 
            const htmlStr = grids.html();
            const idx = htmlStr.indexOf(contentId);

            let strKey = 'width:';
            const re = new RegExp(strKey, 'g');

            const matches = [];
            const dist = [];
            let match = null;
            while (match = re.exec(htmlStr)) {
                matches.push(match.index);
                dist.push(Math.abs(idx - match.index))
            }

            const closestMathIdx = matches[dist.indexOf(Math.min(... dist))];
             
            // console.log(htmlStr);    
         
            let i = htmlStr.indexOf('px', closestMathIdx + 1 + strKey.length);

            const width = parseInt(htmlStr.substring(closestMathIdx + 1 + strKey.length, i), 10);

            // console.log(width);

            strKey = 'px; height:';
            const startIdx = i + strKey.length + 1;

            i = htmlStr.indexOf('px', startIdx);

            const height = parseInt(htmlStr.substring(startIdx, i), 10);

            // console.log(height);

            const matchId = (obj) => {
              if (obj.id === contentId) {
                return true;
              }
    
              return false;
            };

            const matchedRecord = scope.config.content.filter(matchId);

            const scale = matchedRecord[0].scale;

            // console.log(scale);

            const scaleWidth = width / scale;
            const scaleHeight = height / scale;

            // console.log(scaleWidth);
            // console.log(scaleHeight);

            elem.css('width', `${scaleWidth}px`);
            elem.css('height', `${scaleHeight}px`);
            elem.css('transform-origin', 'top left');
            elem.css('transform', `scale3d(${scale}, ${scale}, 1)`);
          }); 
      }
    };
 });