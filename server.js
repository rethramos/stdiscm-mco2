const express = require("express");
const app = express();
const http = require("http");
const server = http.createServer(app);
const PORT = process.env.PORT || 3000;
const { Server } = require("socket.io");
const io = new Server(server);

const HTML_DIR = __dirname + "/public/html";

const WINNING_COMBINATIONS = [
  [0, 1, 2],
  [3, 4, 5],
  [6, 7, 8],
  [0, 3, 6],
  [1, 4, 7],
  [2, 5, 8],
  [0, 4, 8],
  [2, 4, 6],
];

app.use(express.static("public"));
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

const PIECES = { X: "X", O: "O", EMPTY: "-" };
const MAX_SQUAD_SIZE = 2;
let players = [];
let boards = [];
let powerups = [0, 0];
let wins = [0, 0];
let draws = 0;
let finishedboards = 0;

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

app.post("/", (req, res) => {
  // check username if already taken
  // if username is taken
  if (players.find((p) => p.username == req.body.username)) {
    return res.status(400).send({ msg: "Username already taken" });
  }
  if (players.length == MAX_SQUAD_SIZE * 2) {
    return res.status(400).send({ msg: "Queue is already full." });
  }

  players.push({ username: req.body.username });
  console.log("app.post: ", players);
  return res.status(200).send({ msg: "OK" });
});

app.get("/queue", (req, res) => {
  res.sendFile(HTML_DIR + "/queue.html");
});

app.get("/scoreboard", (req, res) => {
  res.sendFile(HTML_DIR + "/scoreboard.html");
});

app.get("/stats", (req, res) => {
  res.send({ wins, draws, powerups });
});

app.get("/game", (req, res) => {
  res.sendFile(HTML_DIR + "/index.html");
});

io.on("connection", (socket) => {
  console.log("a user connected");

  socket.on("disconnect", () => {
    console.log("URL", socket.request.headers.referer);
    let referer = socket.request.headers.referer.split("/");
    let endpoint = referer[referer.length - 1];
    endpoint = "/" + endpoint;
    if (endpoint == "/game") {
      console.log("a user disconnected session id: " + socket.id);
      players = players.filter((player) => player.sessionId != socket.id);
      console.log("current players:");
      players.forEach((player) => console.log(player));
    }
  });

  socket.on("playerqueue", (data) => {
    const p = data;
    // p.socket = socket;

    // block excess players
    // if (players.length == MAX_SQUAD_SIZE * 2) {
    //   return;
    // }

    // find index of logged in player
    let loggedInPlayerIndex = players.findIndex(
      (player) => player.username == p.username
    );
    players[loggedInPlayerIndex].socket = socket;
    players[loggedInPlayerIndex].sessionId = data.sessionId;
    console.log("logged in player: ", players[loggedInPlayerIndex]);
    // if player is not logged in, reject
    if (loggedInPlayerIndex == -1) {
      return;
    }
    //console.log("PLAYERS: ", players);
    if (loggedInPlayerIndex < MAX_SQUAD_SIZE) {
      players[loggedInPlayerIndex].squad = 0;
    } else {
      players[loggedInPlayerIndex].squad = 1;
    }
    console.log("PLAYERS: ", players);

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

        p1.socket.emit("pieceset", {
          piece: p1.piece,
          squad: p1.squad,
          boardId: p1.boardId,
        });
        p2.socket.emit("pieceset", {
          piece: p2.piece,
          squad: p2.squad,
          boardId: p2.boardId,
        });
      }

      // console.log("sockets: " + io.sockets.allSockets());
    }

    // console.log("current players:");
    // players.forEach((player) => console.log(player));
  });

  // TODO: emit new event (matchenter)
  socket.on("matchenter", (player) => {
    // update socket
    let index = players.findIndex((p) => p.username == player.username);
    console.log("INDEX: ", index);
    if (index == -1) return;

    players[index].socket = socket;
    players[index].sessionId = socket.id;
    boardId = player.boardId;
    console.log("SOCKET OF PLAYER:", players[index].socket.id);
    console.log("BOARDID: ", boardId);
    players[index].socket.join(boardId);

    // if there are 2 players in the room
    if (io.sockets.adapter.rooms.get(boardId).size == 2) {
      console.log("IN MATCHENTER:", io.sockets.adapter.rooms.get(boardId));
      io.to(boardId).emit(
        "gamestart",
        boards.find((board) => board.id == boardId)
      );
    }
  });
  // listen to "turnchange" from client
  socket.on("turnchange", (data) => {
    console.log(data);

    // emit "turnchange" back to clients
    console.log("win?", checkWin(data));
    console.log("draw?", isDraw(data));
    data.hasWinner = checkWin(data);
    if (data.hasWinner) {
      wins[data.squad]++;
      finishedboards++;
    }

    data.isDraw = isDraw(data);
    if (data.isDraw) {
      draws++;
      finishedboards++;
    }

    if (finishedboards == boards.length) {
      io.emit("gameend", {});
    } else {
      console.log("BOARD ID:", data.id);
      console.log("ROOMS:", io.sockets.adapter.rooms);
      io.to(data.id + "").emit("turnchange", data);
    }
  });

  socket.on("powerupuse", (data) => {
    powerups[data.squad]++;
  });

  socket.on("grantpowerup", (data) => {
    // for each match that is still ongoing, emit to squadmate
    console.log("grantpowerup event winning squad: ", data.squad);
    io.emit("grantpowerup", { squad: data.squad });
  });
});

server.listen(PORT, () => {
  console.log("listening on *:" + PORT);
});

function checkWin(bs) {
  let board = bs.board;

  return WINNING_COMBINATIONS.some((combination) => {
    return (
      board[combination[0]] == board[combination[1]] &&
      board[combination[1]] == board[combination[2]] &&
      board[combination[0]] != PIECES.EMPTY
    );
  });
}

function isDraw(bs) {
  let board = bs.board;
  return board.every((cell) => {
    return cell != PIECES.EMPTY;
  });
}

// function isDraw() {
//   return [...cellElements].every((cell) => {
//     return (
//       cell.classList.contains(X_CLASS) || cell.classList.contains(CIRCLE_CLASS)
//     );
//   });
// }
