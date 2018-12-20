angular
  .module('collectomeApp')
  .config(['$locationProvider', '$routeProvider',
    function config($locationProvider, $routeProvider) {
      $locationProvider.html5Mode({
        enabled: false,
        requireBase: true,
      });


      $routeProvider
        .when('/exhibits', {
          template: '<exhibit-list></exhibit-list>',
        })
        .when('/exhibits/featured', {
          template: '<exhibit-list></exhibit-list>',
        })
        .when('/exhibits/:exhibitId', {
          template: '<exhibit-detail></exhibit-detail>',
        })
        .when('/exhibits/:exhibitId/edit', {
          template: '<exhibit-edit></exhibit-edit>',
        })
        .when('/exhibit-create', {
          template: '<exhibit-create></exhibit-create>',
        })
        .when('/exhibit-create/:exhibitId', {
          template: '<exhibit-create></exhibit-create>',
        })
        .otherwise('/exhibits');
    },
  ]);
