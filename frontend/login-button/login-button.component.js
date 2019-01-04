angular
  .module('loginButton')
  .component('loginButton', {
    templateUrl: 'login-button/login-button.template.html',
    controller: ['Authentication', '$window', '$location', 'Api', 'Utilities', function LoginButtonController(Authentication, $window, $location, Api, Utilities) {
      this.authentication = Authentication;
      this.useremail = '';
      const utils = new Utilities();
      const gitOAuthURL = 'https://github.com/login/oauth/authorize';
      const githubScope = 'user:email';

      this.authenticateAsGitHubUser = () => {
        if (!this.authentication.isAuthorized) {
          utils.getAppGitHubClientId().then((response) => {
            const clientId = response.data;
            $window.location.assign(`${gitOAuthURL}?scope=${githubScope}&client_id=${clientId}`);
          });
        }
      };

      this.goToExhibitCreate = () => {
        $location.url('/exhibit-create');
      };

      const checkForGitHubUserEmail = () => {
        if ($window.location.search) {
          console.log($window.location.search);
          const code = $window.location.search.substring('?code='.length);
          console.log(code);

          utils.getUserGitHubEmail(code).then((response) => {
            this.authentication.isAuthorized = true;
            const data = JSON.parse(response.data);
            this.username = data.name;
          });
        }
      };

      if (!this.authentication.isAuthorized) checkForGitHubUserEmail();
    }],
  });
