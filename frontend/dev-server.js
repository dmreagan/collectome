/**
 * Start browser-sync server with URL rewriting to enable HTML5 mode
 * See https://docs.angularjs.org/guide/$location#hashbang-and-html5-modes
 */

const bs = require('browser-sync').create();
const hf = require('connect-history-api-fallback');

bs.init({
  server: true,
  watch: true,
  middleware: [
    hf({
      index: './index.html'
    })
  ]
});
