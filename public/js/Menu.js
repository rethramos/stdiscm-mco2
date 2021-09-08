let QueueGame = document.getElementById("queueBtn");
let form = document.getElementById("single-player-form");
let username = document.getElementById("username");

// QueueGame.addEventListener("click", (e) => {
//   e.preventDefault();
//   console.log("true_");
//   sessionStorage.setItem("player", document.getElementById("P1").value);
//   window.location.href = "/game";
// });

form.addEventListener("submit", function (e) {
  e.preventDefault();
  console.log("true_");

  axios
    .post("/", { username: username.value })
    .then((response) => {
      console.log(response);
      sessionStorage.setItem(
        "username",
        document.getElementById("username").value
      );

      if (response.status == 200) window.location.href = "/queue";
    })
    .catch((err) => {
      console.log(err);
      if (err.response) {
        alert(err.response.data.msg);
      }
    });
});
