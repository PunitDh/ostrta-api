const emitToSocket = (message, ...args) =>
  io.to(socket.id).emit(message, ...args);

module.exports = { emitToSocket };
