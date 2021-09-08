let QueueGame = document.getElementById("queueBtn");
let form = document.getElementById("single-player-form");

// QueueGame.addEventListener("click", (e) => {
//   e.preventDefault();
//   console.log("true_");
//   sessionStorage.setItem("player", document.getElementById("P1").value);
//   window.location.href = "/game";
// });

form.addEventListener("submit", function (e) {
  e.preventDefault();
  console.log("true_");
  sessionStorage.setItem("player", document.getElementById("P1").value);
  window.location.href = "/game";
});
