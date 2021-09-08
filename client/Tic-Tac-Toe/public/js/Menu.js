let QueueGame = document.getElementById("queueBtn");

QueueGame.addEventListener("click", () => {
  console.log("true_");
  sessionStorage.setItem("player", document.getElementById("P1").value);
  window.location.href = "/game";
});
