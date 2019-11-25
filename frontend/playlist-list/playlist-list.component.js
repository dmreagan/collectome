angular.module("playlistList").component("playlistList", {
  templateUrl: "playlist-list/playlist-list.template.html",
  controller: [
    "Authentication",
    "Utilities",
    "apiHost",
    function playlistCreateController(Authentication, Utilities, apiHost) {
      const utils = new Utilities();
      this.apiHost = apiHost;
      this.authentication = Authentication;

      this.playlists = [];
      this.searchString = null;
      this.rowSearch = null;
      this.colSearch = null;

      this.threeByThreeCheckbox = false;
      this.fourByFourCheckbox = false;

      this.customizedLayoutCheckbox = false;

      this.custRow = 3;
      this.custCol = 3;

      // this.$onInit = () => {
      //   console.log('onInit');
      // };

      // this.$onChanges = () => {
      //   console.log('onChange');
      // };

      // this.$postLink = () => {
      //   console.log('onPostLink');
      // };

      // only show playlists that are public
      const filterPlaylist = e => {
        if (e.public) {
          return true;
        }

        /**
         * if playlist not public, then check if login user
         * is the owner
         */
        if (this.authentication.userProfile) {
          const loginUser = this.authentication.userProfile.login;

          console.log(loginUser);

          if (e.owner === loginUser) {
            return true;
          }
        }

        return false;
      };

      const loadPlaylists = () => {
        utils.getPlaylists().then(
          response => {
            this.playlists = response.data.filter(filterPlaylist);

            console.log(this.playlists);
            this.sortBy = "-create_time";
          },
          e => {
            console.warn(e);
            this.playlists = [];
          }
        );
      };

      const searchPlaylists = () => {
        const query = {
          query_string: this.searchString
        };

        utils.searchPlaylists(query).then(
          response => {
            this.playlists = response.data.filter(filterPlaylist);
            console.log(this.playlists);
            this.sortBy = "-_score";
          },
          error => {
            console.warn(error);
            this.playlists = [];
          }
        );
      };

      this.updateSearch = () => {
        console.log("search string:".concat(this.searchString));

        if (!this.searchString) {
          console.log("loadPlaylists");
          loadPlaylists();
        } else {
          console.log("searchPlaylists");
          searchPlaylists();
        }
      };

      const init = () => {
        console.log("init loadPlaylists");
        loadPlaylists();
      };

      if (this.authentication.isAuthorized) {
        init();
      } else {
        // wait a while till async login is ready (if the login is clicked)
        const milliseconds = 1000;
        utils.sleep(milliseconds).then(() => {
          init();
        });
      }
    }
  ]
});
