/*
Copyright (C) 2019 The Trustees of Indiana University
SPDX-License-Identifier: BSD-3-Clause
*/
angular
  .module('api')
  .service('Api', function (apiHost, $q, $http) {
    return function (path, config = null) {
      const url = `${apiHost}${path}`;
      this.post = function (data) {
        // CREATE
        return $http.post(url, JSON.stringify(data), config);
      };
      this.get = function () {
        // RETRIEVE
        return $http.get(url, config);
      };
      this.put = function (data) {
        // UPDATE
        return $http.put(url, JSON.stringify(data), config);
      };
      this.delete = function () {
        // DELETE
        return $http.delete(url, config);
      };
    };
  });
