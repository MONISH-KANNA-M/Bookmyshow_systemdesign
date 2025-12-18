let ioInstance = null;
export function setIO(io) {
  ioInstance = io;
}
export function getIO() {
  return ioInstance;
}

export function attachSockets(io) {
  io.on("connection", (socket) => {
    socket.on("join_show", (showId) => {
      socket.join(`show:${showId}`);
    });
    socket.on("leave_show", (showId) => {
      socket.leave(`show:${showId}`);
    });
  });
}

export function emitShowEvent(showId, event, payload) {
  const io = getIO();
  if (!io) return;
  io.to(`show:${showId}`).emit(event, payload);
}
