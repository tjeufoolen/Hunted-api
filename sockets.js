const io = require("./utils/socket")
const PlayerController = require("./controllers/PlayerController")


io.on('connection', socket => {
	socket.on("join_room", room => {
		socket.join(room);
	});

    socket.on("send_location", location => {
        PlayerController.updateLocation(location)
	});
});
