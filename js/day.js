// js/day.js
// Logica del giorno: selezione e conferma dei morti del giorno

function openDayDeathsOverlay(room) {
  const overlay = $("day-deaths-overlay");
  const list = $("day-deaths-list");
  list.innerHTML = "";

  const players = (room.players || []).filter(p => !p.isMaster);
  const alive = players.filter(p => isPlayerAlive(p.id));

  if (!alive.length) {
    list.innerHTML = `<p class="tiny">Non ci sono giocatori vivi da selezionare.</p>`;
  } else {
    alive.forEach(p => {
      const item = document.createElement("div");
      item.className = "day-deaths-item";

      const name = document.createElement("span");
      name.className = "day-deaths-name";
      name.textContent = p.name;

      const check = document.createElement("div");
      check.className = "day-deaths-check";

      check.onclick = (e) => {
        e.stopPropagation();
        check.classList.toggle("checked");
      };

      item.onclick = () => {
        check.classList.toggle("checked");
      };

      item.appendChild(name);
      item.appendChild(check);
      list.appendChild(item);
    });
  }

  overlay.style.display = "flex";
}

async function confirmDayDeaths(room) {
  const list = $("day-deaths-list");
  const items = Array.from(list.querySelectorAll(".day-deaths-item"));

  let newStatus = { ...state.playerStatus };

  items.forEach(item => {
    const name = item.querySelector(".day-deaths-name").textContent;
    const check = item.querySelector(".day-deaths-check");
    if (check.classList.contains("checked")) {
      const p = room.players.find(pp => pp.name === name && !pp.isMaster);
      if (p) newStatus[p.id] = "dead";
    }
  });

  await apiUpdateState({
    playerStatus: newStatus,
    // dopo il rogo normalmente si va verso notte
    phase: "night",
    nightActions: {
      wolvesTargetId: null,
      witchTargetId: null,
      seerTargetId: null,
      draculaTargetId: null,
    },
  });

  $("day-deaths-overlay").style.display = "none";
}