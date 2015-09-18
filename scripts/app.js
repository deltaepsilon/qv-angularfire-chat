var app = angular.module('ChatApp', ['ngMaterial', 'firebase']);

app.controller('AppCtrl', ['$scope', '$mdSidenav', function($scope, $mdSidenav) {
    $scope.toggleSidenav = function(menuId) {
        $mdSidenav(menuId).toggle();
    };

    $scope.getFirebaseRoot = function() {
        return 'https://qv-angularfire-chat.firebaseio.com/dm6/';
    };

    $scope.setAuthObject = function(authObject) {
        $scope.authObject = authObject;
    };

    $scope.setUser = function(user) {
        if (user) {
            user.$bindTo($scope, 'user'); // Creates 3-way bind to from $scope.user to my-firebase.com/users/###userKey###
            user.$loaded().then(function(user) {
                console.log('loaded user', user);
            });
        }
    };



}]);