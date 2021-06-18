const io = require("./utils/socket")
const PlayerController = require("./controllers/PlayerController");
const GameController = require("./controllers/GameController");


io.on('connection', socket => {
	socket.on("join_room", room => {
		socket.join(room);
	});

	socket.on("leave_rooms", () => {
		socket.leaveAll();
	})

	socket.on("send_location", location => {
		// Update location from player
		PlayerController.updateLocation(location);

		// Notify players when newLocation is close by
		PlayerController.fetchNearbyLocations(location, socket);
	});

	socket.on("pick_up_treasure", data => {
		GameController.pickUpTreasure(data, socket);
	});

	socket.on("arrest_thief", data => {
		GameController.arrestThief(data, socket);
	});
});
