const io = require("./utils/socket")
const PlayerController = require("./controllers/PlayerController")


io.on('connection', socket => {
	socket.on("join_room", room => {
		socket.join(room);
	});

    socket.on("send_location", location => {
        PlayerController.updateLocation(location)
	});

	socket.on("pick_up_treasure", message => {
		console.log(message);
		socket.emit('pick_up_treasure_attempt', 'reeeeee');
	});
});
