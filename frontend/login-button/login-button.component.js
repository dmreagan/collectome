angular
  .module('loginButton')
  .component('loginButton', {
    templateUrl: 'login-button/login-button.template.html',
    controller: ['Authentication', '$window', '$location', 'Utilities', function LoginButtonController(Authentication, $window, $location, Utilities) {
      this.authentication = Authentication;
      const utils = new Utilities();
      const gitOAuthURL = 'https://github.com/login/oauth/authorize';
      const githubScope = 'user:email';
      const baseURL = 'http://127.0.0.1:3000'; // dev
      // const baseURL = 'https://showcase.avl.iu.edu/collectome/frontend'; // production

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

      const checkForGitHubUserProfile = () => {
        if ($window.location.search) {
          const code = $window.location.search.substring('?code='.length);

          utils.getUserGitHubProfile(code).then((response) => {
            this.authentication.isAuthorized = true;
            const data = JSON.parse(response.data);
            this.authentication.userProfile = data;
            this.username = data.name;
            console.log(this.authentication);
          }, (e) => {
            console.warn(e);
          });
        }
      };

      if (!this.authentication.isAuthorized) checkForGitHubUserProfile();
    }],
  });
