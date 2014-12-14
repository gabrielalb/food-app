// Based loosely around work by Witold Szczerba - https://github.com/witoldsz/angular-http-auth
angular.module('security.service', [
  'security.retryQueue',    // Keeps track of failed requests that need to be retried once the user logs in
  'security.login'         // Contains the login form template and controller
])

.factory('security', ['$http', '$q', '$location', 'securityRetryQueue', 'CLIENT_ID', 'SCOPES', function($http, $q, $location, queue, $client_id, $scopes) {

  // Redirect to the given url (defaults to '/')
  function redirect(url) {
    url = url || '/';
    $location.path(url);
  }

  // Login form dialog stuff
  /*var loginDialog = null;
  function openLoginDialog() {
    if ( loginDialog ) {
      throw new Error('Trying to open a dialog that is already open!');
    }
    loginDialog = $dialog.dialog();
    loginDialog.open('security/login/form.tpl.html', 'LoginFormController').then(onLoginDialogClose);
  }
  function closeLoginDialog(success) {
    if (loginDialog) {
      loginDialog.close(success);
    }
  }
  function onLoginDialogClose(success) {
    loginDialog = null;
    if ( success ) {
      queue.retryAll();
    } else {
      queue.cancelAll();
      redirect();
    }
  }
*/
  // Register a handler for when an item is added to the retry queue
  queue.onItemAddedCallbacks.push(function(retryItem) {
    if ( queue.hasMore() ) {
      redirect('/login');
    }
  });

  // The public API of the service
  var service = {

    // Get the first reason for needing a login
    getLoginReason: function() {
      return queue.retryReason();
    },

    // Show the modal login dialog
    /*showLogin: function() {
      openLoginDialog();
    },*/

    handleAuthResult: function(authResult) {
        if (authResult && !authResult.error) {
          service.currentUser = authResult;
        }
        else {
          service.currentUser = null;
        }
          
    },

    // Attempt to authenticate a user by the given email and password
    login: function() {
      var p = $q.defer();
      gapi.auth.authorize(
            {'client_id': $client_id, 'scope': $scopes, 'immediate': false, 'cookie_policy': 'single_host_origin'},
            function(authResult) {
              if (authResult && !authResult.error) {
                service.currentUser = authResult;
              }
              else {
                service.currentUser = null;
              }
             // gapi.client.load('plus','v1');
              p.resolve(gapi);
            });

      $q.when(p.promise).then(function() {
        if ( service.isAuthenticated() ) {
          queue.retryAll();
        } else {
          queue.cancelAll();
        }
        $location.path('/dashboard');
      });
    },

    // Give up trying to login and clear the retry queue
    /*cancelLogin: function() {
      closeLoginDialog(false);
      redirect();
    },*/

    // Logout the current user and redirect
    logout: function(redirectTo) {
        service.currentUser = null;
        gapi.auth.signOut();
        redirect(redirectTo);
    },

    // Ask the backend to see if a user is already authenticated - this may be from a previous session.
    requestCurrentUser: function() {
      if ( service.isAuthenticated() ) {
        return $q.when(service.currentUser);
      }
      else {
          var p = $q.defer();
          gapi.auth.authorize(
            {'client_id': $client_id, 'scope': $scopes, 'immediate': true, 'cookie_policy': 'single_host_origin'},
           function(authResult){
            if (authResult && !authResult.error) {
              service.currentUser = authResult;
            }
            else {
              service.currentUser = null;
            }
            
            p.resolve(authResult);
          });

          return p.promise;
      }
    },

    requestUserName: function() {
      var p = $q.defer();
      gapi.client.load('plus','v1', function() {
        var request = gapi.client.plus.people.get({
          'userId': 'me'
        });
        request.execute(function(resp) {
          p.resolve(resp.displayName);
        });
      });

      return p.promise;
    },

    // Information about the current user
    currentUser: null,

    // Is the current user authenticated?
    isAuthenticated: function(){
      return !!service.currentUser;
    },
    
    // Is the current user an adminstrator?
    isAdmin: function() {
      return !!(service.currentUser && service.currentUser.admin);
    }
  };

  return service;
}]);
