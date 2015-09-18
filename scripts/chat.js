app.controller('ChatCtrl', ['$scope', '$firebaseObject', '$firebaseArray', function($scope, $firebaseObject, $firebaseArray) {
	var firebaseRoot = $scope.getFirebaseRoot();
	var roomsRef = new Firebase(firebaseRoot + 'rooms');
	var	rooms = $firebaseArray(roomsRef);

	$scope.rooms = rooms;

	rooms.$loaded().then(function (rooms) {
		if (rooms.length) {
			$scope.selectRoom(rooms[0]);	
		}
	});

	$scope.addRoom = function (room) {
		room.created = (new Date()).toString();

		rooms.$add(room).then(function (ref) {
			console.log('room key', ref.key());
		}, function (err) {
			console.warn('room error', err);
		});
	};

	$scope.removeRoom = function (room) {
		rooms.$remove(room);
	};

	$scope.selectRoom = function (room) {
		$scope.selectedRoom = room;

		$scope.chats = $firebaseArray(new Firebase(firebaseRoot + 'roomChats/' + room.$id + '/chats'));
	};

	$scope.addChat = function (roomKey, chat, user) {
		var chatsRef = new Firebase(firebaseRoot + 'roomChats/' + roomKey + '/chats'),
			chats = $firebaseArray(chatsRef);

		chat.created = (new Date()).toString();
		chat.userKey = user.$id;
		chat.userEmail = user.email;
		chat.userUsername = user.username;
		chat.gravatar = "http://www.gravatar.com/avatar/" + md5(user.email.toLowerCase());

		chats.$add(chat);
	};
	
}]);