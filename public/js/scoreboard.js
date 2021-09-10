const winsEl = document.getElementById("wins");
const drawsEl = document.getElementById("draws");
const losesEl = document.getElementById("loses");
const powerupsEl = document.getElementById("powerups");

axios
  .get("/stats")
  .then((response) => {
    const data = response.data;
    const squad = sessionStorage.getItem("squad");
    console.log("STATS:", data);
    winsEl.innerText = data.wins[squad];
    drawsEl.innerText = data.draws;
    losesEl.innerText = data.wins[oppositeSquad(squad)];
    powerupsEl.innerText = data.powerups[squad];
  })
  .catch((err) => {
    console.log(err);
  });

function oppositeSquad(n) {
  if (n == 0) {
    return 1;
  }
  return 0;
}
