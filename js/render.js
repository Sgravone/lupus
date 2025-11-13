// js/render.js
// Tutte le funzioni che aggiornano l'interfaccia

function showScreen(id) {
  ["screen-welcome", "screen-lobby", "screen-game", "screen-role"]
    .forEach(s => $(s).classList.add("hidden"));
  $(id).classList.remove("hidden");
}

function updateRoomLink() {
  if (!state.roomId) return;
  const url = new URL(window.location.href);
  url.searchParams.set("room", state.roomId);
  $("room-link").value = url.toString();
  $("game-room-id").textContent = state.roomId;
}

/* =====================================================
   RUOLI – CONFIGURAZIONE IN LOBBY
===================================================== */

function renderRolesConfig() {
  const container = $("roles-list");
  if (!container) return;

  container.innerHTML = "";

  Object.values(ROLES).forEach(r => {
    const qty = state.rolesConfig[r.id] || 0;

    const div = document.createElement("div");
    div.className = "role-chip";

    const header = document.createElement("div");
    header.className = "role-chip-header";

    const title = document.createElement("span");
    title.className = "role-chip-title";
    title.textContent = r.name;

    const toggle = document.createElement("span");
    toggle.className = "role-chip-toggle";
    toggle.textContent = "info";
    toggle.onclick = () => openRoleDetail(r.id);

    header.appendChild(title);
    header.appendChild(toggle);
    div.appendChild(header);

    const controls = document.createElement("div");
    controls.className = "qty-controls";

    const minus = document.createElement("button");
    minus.className = "role-counter-btn secondary small";
    minus.textContent = "−";
    minus.onclick = () => {
      const q = state.rolesConfig[r.id] || 0;
      if (q > 0) {
        state.rolesConfig[r.id] = q - 1;
        renderRolesConfig();
      }
    };

    const qtyLabel = document.createElement("span");
    qtyLabel.className = "role-qty-number";
    qtyLabel.textContent = qty;

    const plus = document.createElement("button");
    plus.className = "role-counter-btn secondary small";
    plus.textContent = "+";
    plus.onclick = () => {
      const q = state.rolesConfig[r.id] || 0;
      state.rolesConfig[r.id] = q + 1;
      renderRolesConfig();
    };

    controls.appendChild(minus);
    controls.appendChild(qtyLabel);
    controls.appendChild(plus);
    div.appendChild(controls);

    container.appendChild(div);
  });

  const total = Object.values(state.rolesConfig).reduce((a, b) => a + b, 0);
  $("roles-summary").textContent = `Totale ruoli selezionati: ${total}`;
}

/* =====================================================
   RUOLI – DETTAGLIO PERSONALE
===================================================== */

function openRoleDetail(roleId) {
  const r = ROLES[roleId];
  if (!r) return;

  $("role-name").textContent = r.name;
  $("role-faction-pill").textContent = r.faction;
  $("role-aura-pill").textContent = `Aura: ${r.aura}`;
  $("role-ability-pill").textContent = r.ability;
  $("role-description").textContent = r.description;

  $("role-box").classList.remove("hidden");

  state.screenLocked = true;
  showScreen("screen-role");
}

/* =====================================================
   LISTA GIOCATORI
===================================================== */

function renderPlayers(players) {
  const container = $("players-list");
  if (!container) return;

  const nonMasters = (players || []).filter(p => !p.isMaster);

  if (!nonMasters.length) {
    container.textContent = "Nessun giocatore.";
    container.dataset.count = 0;
    return;
  }

  container.innerHTML = "";
  container.dataset.count = nonMasters.length;

  nonMasters.forEach(p => {
    const div = document.createElement("div");
    div.className = "players-list-item";
    div.textContent = p.name;
    container.appendChild(div);
  });
}

/* =====================================================
   RUOLI IN PARTITA – FIX TENDINE CHE NON SI RICHIUDONO
===================================================== */

function renderGameRolesList() {
  const container = $("game-roles-list");
  if (!container) return;
  container.innerHTML = "";

  const cfg = state.rolesConfig || {};
  const entries = Object.entries(cfg).filter(([, qty]) => qty > 0);

  if (!entries.length) {
    container.textContent = "Nessun ruolo configurato.";
    return;
  }

  const openSet = new Set(state.openRoleDetails || []);
  if (!state.openRoleDetails) state.openRoleDetails = [];

  entries.forEach(([roleId, qty]) => {
    const r = ROLES[roleId];
    if (!r) return;

    const chip = document.createElement("div");
    chip.className = "role-chip";

    const header = document.createElement("div");
    header.className = "role-chip-header";

    const title = document.createElement("span");
    title.className = "role-chip-title";
    title.textContent = r.name + (qty > 1 ? ` ×${qty}` : "");

    const toggle = document.createElement("span");
    toggle.className = "role-chip-toggle tiny";
    toggle.textContent = "Dettagli";

    header.appendChild(title);
    header.appendChild(toggle);
    chip.appendChild(header);

    const body = document.createElement("div");
    body.className = "role-chip-body";
    if (!openSet.has(roleId)) body.classList.add("hidden");

    body.innerHTML = `
      <div class="pill-row">
        <span class="pill">${r.faction}</span>
        <span class="pill">Aura: ${r.aura}</span>
        <span class="pill pill-outline">${r.ability}</span>
      </div>
      <p class="tiny" style="margin-top:6px;">${r.description}</p>
    `;

    toggle.onclick = () => {
      const isOpen = !body.classList.contains("hidden");

      if (isOpen) {
        body.classList.add("hidden");
        openSet.delete(roleId);
      } else {
        body.classList.remove("hidden");
        openSet.add(roleId);
      }

      state.openRoleDetails = Array.from(openSet);
    };

    chip.appendChild(body);
    container.appendChild(chip);
  });
}

/* =====================================================
   MIO RUOLO BREVE
===================================================== */

function renderMyRoleShort() {
  const label = $("game-role-label");
  if (!label) return;

  if (!state.myRoleId) {
    label.textContent = "Ruolo nascosto o non ancora assegnato.";
    return;
  }
  const r = ROLES[state.myRoleId];
  label.textContent = r ? r.name : "Ruolo sconosciuto.";
}

/* =====================================================
   PHASE LABEL
===================================================== */

function updatePhaseLabel() {
  let text = "";
  if (state.phase === "lobby") text = "In attesa che il master avvii la partita.";
  else if (state.phase === "running") text = "Partita in corso.";
  else if (state.phase === "day") text = "Fase: Giorno.";
  else if (state.phase === "night") text = "Fase: Notte.";

  $("phase-label").textContent = text;

  const btnNight = $("btn-night-resolve");
  const btnDay = $("btn-day-mark-deaths");

  if (btnNight)
    btnNight.style.display = (state.isMaster && state.phase === "night") ? "block" : "none";

  if (btnDay)
    btnDay.style.display = (state.isMaster && state.phase === "day") ? "block" : "none";
}

/* =====================================================
   MASTER – ASSEGNAZIONI
===================================================== */

function renderMasterAssignments(room) {
  const container = $("master-assignments");
  if (!container) return;

  container.innerHTML = "";
  const players = (room.players || []).filter(p => !p.isMaster);

  if (!players.length) {
    container.textContent = "Nessun giocatore.";
    return;
  }

  players.forEach(p => {
    const roleId = state.assignments[p.id];
    const r = ROLES[roleId];
    const div = document.createElement("div");
    div.className = "players-list-item";

    let html = `<strong>${p.name}</strong>: `;
    html += r ? r.name : "Contadino";
    if (!isPlayerAlive(p.id)) html += ` <span class="player-dead-label">(morto)</span>`;

    div.innerHTML = html;
    container.appendChild(div);
  });
}