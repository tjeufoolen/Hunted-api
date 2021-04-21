const io = require('./utils/socket');


  io.on('connection', (socket) => {
    socket.on("join_room", (room) => {
            socket.join(room)
            console.log(io.sockets.adapter.rooms.get(room))
      })

      socket.on("message", () => {
        io.emit("message", "hoi")
      })

});