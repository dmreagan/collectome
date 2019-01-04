angular
  .module('loginButton')
  .component('loginButton', {
    templateUrl: 'login-button/login-button.template.html',
    controller: ['Authentication', '$window', '$location', 'Utilities', function LoginButtonController(Authentication, $window, $location, Utilities) {
      this.authentication = Authentication;
      this.useremail = '';
      const utils = new Utilities();
      const gitOAuthURL = 'https://github.com/login/oauth/authorize';
      const githubScope = 'user:email';
      const baseURL = 'http://127.0.0.1:8080/#!';

      this.authenticateAsGitHubUser = () => {
        if (!this.authentication.isAuthorized) {
          utils.getAppGitHubClientId().then((response) => {
            const clientId = response.data;

            const redirectURI = $location.path();

            const url = `${gitOAuthURL}?scope=${githubScope}&client_id=${clientId}&redirect_uri=${baseURL}${redirectURI}`;

            console.log(url);

            $window.location.assign(url);
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
