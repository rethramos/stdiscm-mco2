const express = require("express");
const app = express();
const http = require("http");
const server = http.createServer(app);
const PORT = 3000;
const { Server } = require("socket.io");
const io = new Server(server);

const HTML_DIR = __dirname + "/public/html";

app.use(express.static("public"));

const PIECES = { X: "X", O: "O", EMPTY: "-" };
const MAX_SQUAD_SIZE = 1;
let players = [];
let boards = [];

for (let i = 0; i < MAX_SQUAD_SIZE; i++) {
  boards.push({
    id: i,
    turn: null,
    board: [
      PIECES.EMPTY,
      PIECES.EMPTY,
      PIECES.EMPTY,
      PIECES.EMPTY,
      PIECES.EMPTY,
      PIECES.EMPTY,
      PIECES.EMPTY,
      PIECES.EMPTY,
      PIECES.EMPTY,
    ],
  });
}

app.get("/", (req, res) => {
  res.sendFile(HTML_DIR + "/main-menu.html");
});

app.get("/game", (req, res) => {
  res.sendFile(HTML_DIR + "/index.html");
});

io.on("connection", (socket) => {
  console.log("a user connected");

  socket.on("disconnect", () => {
    console.log("a user disconnected session id: " + socket.id);
    players = players.filter((player) => player.sessionId != socket.id);
    console.log("current players:");
    players.forEach((player) => console.log(player));
  });

  socket.on("playerqueue", (data) => {
    const p = data;
    p.socket = socket;

    // block excess players
    if (players.length == MAX_SQUAD_SIZE * 2) {
      return;
    }

    players.push(p);

    if (players.indexOf(p) < MAX_SQUAD_SIZE) {
      p.squad = 0;
    } else {
      p.squad = 1;
    }

    // if there are enough players
    if (players.length == MAX_SQUAD_SIZE * 2) {
      let boardId;
      for (let i = 0; i < MAX_SQUAD_SIZE; i++) {
        boardId = boards[i].id;
        console.log(boards[i]);
        let p1 = players[i];
        let p2 = players[i + MAX_SQUAD_SIZE];
        p1.boardId = boardId;
        p2.boardId = boardId;
        //randomizer
        let result = Math.random();
        if (result < 0.5) {
          p1.piece = PIECES.X;
          p2.piece = PIECES.O;
          boards[i].turn = p1.piece;
        } else {
          p1.piece = PIECES.O;
          p2.piece = PIECES.X;
          boards[i].turn = p2.piece;
        }

        // join match
        p1.socket.join(boardId);
        p2.socket.join(boardId);
        io.to(boardId).emit(
          "gamestart",
          boards.find((board) => board.id == boardId)
        );
      }

      // console.log("sockets: " + io.sockets.allSockets());
    }

    // console.log("current players:");
    // players.forEach((player) => console.log(player));
  });

  // listen to "turnchange" from client
  socket.on("turnchange", (data) => {
    console.log(data);
    // check wins,etc.
    // emit to room
    // console.log("rooms", socket.rooms);

    // emit "turnchange" back to clients
    io.to(data.id).emit("turnchange", data);
  });
});

server.listen(PORT, () => {
  console.log("listening on *:" + PORT);
});
