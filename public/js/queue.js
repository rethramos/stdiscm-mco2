player = {
  username: sessionStorage.getItem("username"),
};

if (!player.username) {
  redirect("/");
}

const socket = io();
console.log({ socket });
socket.on("connect", function () {
  console.log("Client connected.");
  player.sessionId = socket.id;
  socket.emit("playerqueue", player);
  console.log("EMITTED PLAYERQUEUE:", player);
});

socket.on("disconnect", function () {
  console.log("Client disconnected.");
});

socket.on("playernotfound", function (data) {
  redirect("/");
});

socket.on("pieceset", function (data) {
  console.log("from /queue:", data);
  sessionStorage.setItem("piece", data.piece);
  sessionStorage.setItem("squad", data.squad);
  sessionStorage.setItem("boardId", data.boardId);
  window.location.href = "/game";
});

function redirect(path) {
  window.location.href = path;
}
