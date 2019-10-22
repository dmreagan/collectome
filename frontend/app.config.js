angular
  .module('collectomeApp')
  .config(['$locationProvider', '$routeProvider',
    function config($locationProvider, $routeProvider) {
      $locationProvider.html5Mode({
        enabled: true,
      });


      $routeProvider
        .when('/home', {
          template: '<home></home>',
        })
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
        .when('/exhibit-display/:exhibitId', {
          template: '<exhibit-display></exhibit-display>',
        })
        .when('/playlists', {
          template: '<playlist-list></playlist-list>',
        })
        .when('/playlists/featured', {
          template: '<playlist-list></playlist-list>',
        })
        .when('/playlists/:playlistId', {
          template: '<playlist-detail></playlist-detail>',
        })
        .when('/playlist-create', {
          template: '<playlist-create></playlist-create>',
        })
        .when('/playlist-create/:playlistId', {
          template: '<playlist-create></playlist-create>',
        })
        .when('/playlists/:playlistId/edit', {
          template: '<playlist-edit></playlist-edit>',
        })
        .when('/playlist-display/:playlistId', {
          template: '<playlist-display></playlist-display>',
        })
        .when('/sameorigin-check/', {
          template: '<sameorigin-check></sameorigin-check>',
        })
        .otherwise('/home');
    },
  ]);
