const io = require("./utils/socket")

io.on('connection', socket => {
	socket.on("join_room", room => {
		socket.join(room);
	})
});
