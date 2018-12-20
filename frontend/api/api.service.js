angular
  .module('api')
  .service('Api', function (apiHost, $q, $http) {
    return function (path) {
      const url = `${apiHost}${path}`;
      this.post = function (data) {
        // CREATE
        return $http.post(url, JSON.stringify(data));
      };
      this.get = function () {
        // RETRIEVE
        return $http.get(url);
      };
      this.put = function (data) {
        // UPDATE
        return $http.put(url, JSON.stringify(data));
      };
      this.delete = function () {
        // DELETE
        return $http.delete(url);
      };
    };
  });
