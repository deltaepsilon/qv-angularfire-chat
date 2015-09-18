app.controller('AuthCtrl', ['$scope', '$firebaseAuth', '$firebaseObject', '$firebaseArray', function($scope, $firebaseAuth, $firebaseObject, $firebaseArray) {
    var firebaseRoot = $scope.getFirebaseRoot(),
        ref = new Firebase(firebaseRoot),
        authObject = $firebaseAuth(ref);

    $scope.setAuthObject(authObject);

    $scope.google = function() {
        authObject.$authWithOAuthPopup('google', {
            scope: 'email'
        }).then(function(authData) {
            console.log('google success', authData);
        }, function(err) {
            console.warn('google error', err);
        });
    };

    $scope.facebook = function() {
        authObject.$authWithOAuthPopup('facebook', {
            scope: 'email'
        }).then(function(authData) {
            console.log('facebook success', authData);
        }, function(err) {
            console.warn('facebook error', err);
        });
    };

    $scope.login = function(loginUser) {
        // loginUser = {email: 'someemail@gmail.com', password: 'somepassword'};
        authObject.$authWithPassword(loginUser);
    };

    $scope.register = function(loginUser) {
        // loginUser = {email: 'someemail@gmail.com', password: 'somepassword'};
        authObject.$createUser(loginUser).then(function() {
            $scope.login(loginUser);
        });
    };


    authObject.$onAuth(function(authData) {
        console.log('authData', authData);
        if (!authData) {
            $scope.setUser(false);
        } else {
            var aclRef = new Firebase(firebaseRoot + 'acl/' + authData.uid),
                acl = $firebaseObject(aclRef),
                email;

            acl.$loaded().then(function(acl) {
                if (!acl.userKey) {
                    acl.isAdmin = false;
                    if (authData.provider === 'password') {
                        acl.email = authData.password.email;
                    } else if (authData.provider === 'google') {
                        acl.email = authData.google.email;
                    } else if (authData.provider === 'facebook') {
                        acl.email = authData.facebook.email;
                    }
                }

                acl.lastLogin = (new Date()).toString();

                acl.$save().then(function() {
                    var usersRef = new Firebase(firebaseRoot + 'users'),
                        users = $firebaseArray(usersRef.orderByChild('email').equalTo(acl.email));

                    users.$loaded().then(function(users) {
                        console.log('users', users);

                        if (!users.length) {
                            $firebaseArray(usersRef).$add().then(function(ref) {
                                var user = $firebaseObject(new Firebase(firebaseRoot + 'users/' + ref.key()));

                                user.email = acl.email;
                                user.$save().then(function() {
                                    acl.userKey = user.$id;
                                    acl.$save().then(function() {
                                        $scope.setUser(user);
                                    });
                                });
                            });


                        } else if (users.length === 1) {
                            var userKey = users[0].$id,
                                user = $firebaseObject(new Firebase(firebaseRoot + 'users/' + userKey));

                            if (!acl.userKey) {
                                acl.userKey = userKey;
                                acl.$save();
                            }

                            $scope.setUser(user);
                        } else {
                            console.warn('too many users found', users);
                        }
                    });
                });
            });

        }
    });

}]);