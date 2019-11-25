angular.module("authentication").service("Authentication", function() {
  this.isAuthorized = false;
  this.userProfile = null;
});
