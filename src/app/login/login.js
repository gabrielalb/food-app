angular.module('login', ['services.localizedMessages'], ['$routeProvider', function($routeProvider){

  $routeProvider.when('/login', {
    templateUrl:'login/login-form.tpl.html',
    controller:'LoginCtrl'
    /*resolve:{
      projects:['Projects', function(Projects){
        return Projects.all();
      }]
    }*/
  });
}]);

angular.module('login').controller('LoginCtrl', ['$scope', 'security', 'localizedMessages', function($scope, security, localizedMessages){
  $scope.user = {};

  // Any error message from failing to login
  $scope.authError = null;

  // The reason that we are being asked to login - for instance because we tried to access something to which we are not authorized
  // We could do something diffent for each reason here but to keep it simple...
  $scope.authReason = null;
  if ( security.getLoginReason() ) {
    $scope.authReason = ( security.isAuthenticated() ) ?
      localizedMessages.get('login.reason.notAuthorized') :
      localizedMessages.get('login.reason.notAuthenticated');
  }

  // Attempt to authenticate the user specified in the form's model
  $scope.login = function() {
    // Clear any previous security errors
    $scope.authError = null;

    // Try to login
    security.login();
  };

}]);