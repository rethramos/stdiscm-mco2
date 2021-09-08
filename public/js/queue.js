player = {
  username: sessionStorage.getItem("username"),
};

const socket = io();
console.log({ socket });
socket.on("connect", function () {
  console.log("Client connected.");
  player.sessionId = socket.id;
  socket.emit("playerqueue", player);
});

socket.on("disconnect", function () {
  console.log("Client disconnected.");
});

socket.on("pieceset", function (data) {
  console.log("from /queue:", data);
  sessionStorage.setItem("piece", data.piece);
  sessionStorage.setItem("squad", data.squad);
  sessionStorage.setItem("boardId", data.boardId);
  window.location.href = "/game";
});
