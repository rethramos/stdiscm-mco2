const e = require("express");

const PIECES = { X: "X", O: "O", EMPTY: "-" };

const X_CLASS = "x";
const CIRCLE_CLASS = "circle";
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
const cellElements = document.querySelectorAll("[data-cell]");
const board = document.getElementById("board");
const winningMessageElement = document.getElementById("winningMessage");
// const restartButton = document.getElementById("restartButton");
const winningMessageTextElement = document.querySelector(
  "[data-winning-message-text]"
);
const playerName = document.getElementById("playerName");
const isTurn = document.getElementById("isTurn");
let circleTurn;

const player = {
  username: sessionStorage.getItem("username"),
  piece: sessionStorage.getItem("piece"),
  boardId: sessionStorage.getItem("boardId"),
  sessionId: null,
};

const usernameSpan = document.getElementById("username");
const squadSpan = document.getElementById("squad");
const powerupsSpan = document.getElementById("powerups");

usernameSpan.innerText = player.username;
squadSpan.innerText = sessionStorage.getItem("squad");
powerupsSpan.innerText = 0;

board.classList.add(player.piece == PIECES.X ? X_CLASS : CIRCLE_CLASS);

let boardState = { board: [], id: "", turn: "" };
let powerupCtr = 0;

let hasPowerups = false;

const socket = io();
console.log({ socket });
socket.on("connect", function () {
  console.log("Client connected.");
  player.sessionId = socket.id;
  socket.emit("matchenter", player);
});

socket.on("disconnect", function () {
  console.log("Client disconnected.");
  socket.emit("playerdisconnect", { data: "test" });
});

socket.on("playernotfound", function (data) {
  window.location.href = "/";
});

socket.on("turnchange", function (data) {
  // check if you are current turn
  // if current, make move
  // else disabled yung board
  console.log("TURN CHANGE CLIENT");
  console.log({ data });
  arrayToBoard(data.board);
  boardState = data;
  if (boardState.hasWinner) {
    if (player.piece != boardState.turn) {
      socket.emit("grantpowerup", { squad: sessionStorage.getItem("squad") });
      if (player.piece == PIECES.O) {
        winningMessageTextElement.innerText = "O's Wins!";
      } else {
        winningMessageTextElement.innerText = "X's Wins!";
      }

      winningMessageElement.classList.add("show");
    } else {
      if (player.piece == PIECES.O) {
        winningMessageTextElement.innerText = "X's Wins!";
      } else {
        winningMessageTextElement.innerText = "O's Wins!";
      }

      winningMessageElement.classList.add("show");
    }
  } else if (boardState.isDraw) {
    winningMessageTextElement.innerText = "Draw!";
    winningMessageElement.classList.add("show");
  }
});

socket.on("grantpowerup", function (data) {
  if (data.squad == sessionStorage.getItem("squad")) {
    powerupCtr += 1;
    powerupsSpan.innerText = powerupCtr;
    hasPowerups = powerupCtr > 0;
  }
});

socket.on("gamestart", function (data) {
  boardState = data;
  console.log({ data: data });
  arrayToBoard(boardState.board);
});

socket.on("gameend", function (data) {
  window.location.href = "/scoreboard";
});

socket.on("opponentdisconnect", function (data) {
  p = player.piece;

  const newBoardState = {
    id: boardState.id,
    turn: oppositeOf(p),
    board: [p, p, p, p, p, p, p, p, p],
    squad: sessionStorage.getItem("squad"),
  };

  socket.emit("turnchange", newBoardState);
});

startGame();

// restartButton.addEventListener("click", startGame);

function startGame() {
  showTurn();  
  circleTurn = false;
  cellElements.forEach((cell) => {
    cell.classList.remove(X_CLASS);
    cell.classList.remove(CIRCLE_CLASS);
    cell.removeEventListener("click", handleClick);
    cell.addEventListener("click", handleClick);
  });
  //setBoardHoverClass();
  winningMessageElement.classList.remove("show");
}

function handleClick(e) {
  console.log(boardState.turn);
  const cell = e.target;
  if (player.piece != boardState.turn) return;

  if (
    !hasPowerups &&
    (cell.classList.contains(X_CLASS) || cell.classList.contains(CIRCLE_CLASS))
  ) {
    return;
  }

  if (hasPowerups) {
    powerupCtr--;
    hasPowerups = powerupCtr > 0;
    powerupsSpan.innerText = powerupCtr;
    socket.emit("powerupuse", { squad: sessionStorage.getItem("squad") });
  }

  // const currentClass = circleTurn ? CIRCLE_CLASS : X_CLASS;
  const currentClass = player.piece == PIECES.X ? X_CLASS : CIRCLE_CLASS;
  console.log(player.piece, currentClass);
  placeMark(cell, currentClass);

  const newBoardState = {
    id: boardState.id,
    turn: oppositeOf(player.piece),
    board: boardToArray(),
    squad: sessionStorage.getItem("squad"),
  };

  console.log({ newBoardState });
  // emit to server
  socket.emit("turnchange", newBoardState);
}

function endGame(draw) {
  if (draw) {
    winningMessageTextElement.innerText = "Draw!";
  } else {
    winningMessageTextElement.innerText = `${circleTurn ? "O's" : "X's"} Wins!`;
  }
  winningMessageElement.classList.add("show");
}

function isDraw() {
  return [...cellElements].every((cell) => {
    return (
      cell.classList.contains(X_CLASS) || cell.classList.contains(CIRCLE_CLASS)
    );
  });
}

function placeMark(cell, currentClass) {
  cell.classList.add(currentClass);
  cell.classList.remove(oppositeClassOf(currentClass));
}

function swapTurns() {
  circleTurn = !circleTurn;
  showTurn();  
}

function showTurn(){
  if(circleTurn){
    if(player.piece == PIECES.O){
      isTurn.style.visibility === "visible";
    }else{
      isTurn.style.visibility === "hidden";
    }
  }else{
    if(player.piece == PIECES.O){
      isTurn.style.visibility === "hidden";
    }else{
      isTurn.style.visibility === "visible";
    }
  }
}

// function setBoardHoverClass() {
//   // board.classList.remove(X_CLASS);
//   // board.classList.remove(CIRCLE_CLASS);
//   // if (circleTurn) {
//   //   board.classList.add(CIRCLE_CLASS);
//   // } else {
//   //   board.classList.add(X_CLASS);
//   // }
// }

function checkWin(currentClass) {
  return WINNING_COMBINATIONS.some((combination) => {
    return combination.every((index) => {
      return cellElements[index].classList.contains(currentClass);
    });
  });
}

function boardToArray() {
  const pieces = board.children;
  const arr = [];

  for (let i = 0; i < pieces.length; i++) {
    const piece = pieces[i];
    let c = "-";
    if (piece.classList.contains(X_CLASS)) {
      c = "X";
    } else if (piece.classList.contains(CIRCLE_CLASS)) {
      c = "O";
    }
    arr.push(c);
  }
  // console.log(board.children, arr);

  return arr;
}

function arrayToBoard(arr) {
  const pieces = board.children;
  console.log(arr);
  for (let i = 0; i < arr.length; i++) {
    const element = arr[i];
    const piece = pieces[i];
    console.log(piece, element);

    if (element == PIECES.X) {
      piece.classList.add(X_CLASS);
      piece.classList.remove(CIRCLE_CLASS);
    } else if (element == PIECES.O) {
      piece.classList.add(CIRCLE_CLASS);
      piece.classList.remove(X_CLASS);
    } else {
      piece.classList.remove(X_CLASS);
      piece.classList.remove(CIRCLE_CLASS);
    }
  }
}

function oppositeOf(piece) {
  let p;

  if (piece == PIECES.X) {
    p = PIECES.O;
  } else if (piece == PIECES.O) {
    p = PIECES.X;
  }
  return p;
}

function oppositeClassOf(pieceClass) {
  let c;

  if (pieceClass == X_CLASS) {
    c = CIRCLE_CLASS;
  } else if (pieceClass == CIRCLE_CLASS) {
    c = X_CLASS;
  }

  return c;
}
