// js/night.js
// Logica della notte: selezioni e risoluzione

function renderNightActions(room) {
  const container = $("night-actions-container");
  if (!container) return;

  container.innerHTML = "";

  if (!state.isMaster) {
    container.innerHTML = `<span class="tiny">Solo il master può vedere questa sezione.</span>`;
    return;
  }

  if (state.phase !== "night") {
    container.innerHTML = `<span class="tiny">Non sei in fase Notte.</span>`;
    return;
  }

  const players = (room.players || []).filter(p => !p.isMaster);
  const alive = players.filter(p => isPlayerAlive(p.id));

  const cfg = state.rolesConfig || {};
  const hasWolves   = (cfg["lupo"] || 0) > 0;
  const hasWitch    = (cfg["strega"] || 0) > 0;
  const hasSeer     = (cfg["veggente"] || 0) > 0;
  const hasDracula  = (cfg["dracula"] || 0) > 0;

  // helper per creare select
  function buildSelectRow(labelText, id, noneLabel) {
    const row = document.createElement("div");
    row.className = "row";

    const label = document.createElement("span");
    label.textContent = labelText;

    const sel = document.createElement("select");
    sel.id = id;

    const opt = document.createElement("option");
    opt.value = "";
    opt.textContent = noneLabel || "Nessuno";
    sel.appendChild(opt);

    alive.forEach(p => {
      const o = document.createElement("option");
      o.value = p.id;
      o.textContent = p.name;
      sel.appendChild(o);
    });

    sel.onchange = () => {
      state.nightActions[id.replace("night-", "").replace("-target", "TargetId")] =
        sel.value || null;
    };

    row.appendChild(label);
    row.appendChild(sel);
    container.appendChild(row);
    return sel;
  }

  // Lupi
  if (hasWolves) {
    const sel = buildSelectRow("Lupi – bersaglio", "night-wolves-target", "Nessuna vittima");
    if (state.nightActions.wolvesTargetId) sel.value = state.nightActions.wolvesTargetId;
  }

  // Strega
  if (hasWitch) {
    const sel = buildSelectRow("Strega – protetto", "night-witch-target", "Nessuno");

    if (state.witchLastTargetId) {
      Array.from(sel.options).forEach(opt => {
        if (opt.value === state.witchLastTargetId) {
          opt.disabled = true;
          opt.textContent += " (non consentito)";
        }
      });
    }

    if (state.nightActions.witchTargetId) sel.value = state.nightActions.witchTargetId;
  }

  // Veggente
  if (hasSeer) {
    const row = document.createElement("div");
    row.className = "row";

    const label = document.createElement("span");
    label.textContent = "Veggente – bersaglio";

    const sel = document.createElement("select");
    sel.id = "night-seer-target";

    const opt = document.createElement("option");
    opt.value = "";
    opt.textContent = "Nessuno";
    sel.appendChild(opt);

    alive.forEach(p => {
      const o = document.createElement("option");
      o.value = p.id;
      o.textContent = p.name;
      sel.appendChild(o);
    });

    const aura = document.createElement("span");
    aura.className = "tiny";

    if (state.nightActions.seerTargetId) {
      sel.value = state.nightActions.seerTargetId;
      const rid = state.assignments[state.nightActions.seerTargetId];
      aura.textContent = "Aura: " + getPlayerAuraBasic(rid);
    }

    sel.onchange = () => {
      state.nightActions.seerTargetId = sel.value || null;
      if (!sel.value) {
        aura.textContent = "";
        return;
      }
      const rid = state.assignments[sel.value];
      aura.textContent = "Aura: " + getPlayerAuraBasic(rid);
    };

    row.appendChild(label);
    row.appendChild(sel);
    row.appendChild(aura);
    container.appendChild(row);
  }

  // Dracula
  if (hasDracula) {
    const sel = buildSelectRow("Dracula – bersaglio", "night-dracula-target", "Nessuno");
    if (state.nightActions.draculaTargetId) sel.value = state.nightActions.draculaTargetId;

    const note = document.createElement("p");
    note.className = "tiny";
    note.textContent =
      "Se Dracula morde un Lupo, muore. Aura Blu = nessun effetto. Aura Bianca = conversione narrativa.";
    container.appendChild(note);
  }

  if (!hasWolves && !hasWitch && !hasSeer && !hasDracula) {
    container.innerHTML = `<span class="tiny">Nessun ruolo attivo questa notte.</span>`;
  }
}


// ------------------------------------------------------------
// RISOLUZIONE NOTTE
// ------------------------------------------------------------
async function resolveNight(room) {
  const assignments = state.assignments;
  const players = (room.players || []).filter(p => !p.isMaster);
  const alive = players.filter(p => isPlayerAlive(p.id));

  let nightDeaths = [];
  let conversion = null;

  const wolfTarget = state.nightActions.wolvesTargetId;
  const witchTarget = state.nightActions.witchTargetId;
  const draculaTarget = state.nightActions.draculaTargetId;

  const cfg = state.rolesConfig || {};
  const hasWolves   = (cfg["lupo"] || 0) > 0;
  const hasWitch    = (cfg["strega"] || 0) > 0;
  const hasDracula  = (cfg["dracula"] || 0) > 0;

  // Lupi
  if (hasWolves && wolfTarget) {
    if (wolfTarget !== witchTarget) nightDeaths.push(wolfTarget);
  }

  // Dracula
  if (hasDracula && draculaTarget) {
    const targetRole = assignments[draculaTarget];
    if (targetRole === "lupo") {
      // Dracula muore
      const draculaPlayer = players.find(p => assignments[p.id] === "dracula");
      if (draculaPlayer) nightDeaths.push(draculaPlayer.id);
    } else {
      // Aura blu non cambia nulla
      if (targetRole && ROLES[targetRole].aura.includes("Blu")) {
        // nulla
      } else {
        // conversione
        conversion = draculaTarget;
      }
    }
  }

  // applica conversione
  if (conversion && !nightDeaths.includes(conversion)) {
    assignments[conversion] = "ghoul";
  }

  let newStatus = { ...state.playerStatus };
  nightDeaths.forEach(id => { newStatus[id] = "dead"; });

  // strega: salva l'ultimo protetto
  if (hasWitch) state.witchLastTargetId = witchTarget || null;

  await apiUpdateState({
    phase: "day",
    nightDeaths,
    playerStatus: newStatus,
    assignments: assignments,
    witchLastTargetId: state.witchLastTargetId,
    nightActions: {
      wolvesTargetId: null,
      witchTargetId: null,
      seerTargetId: null,
      draculaTargetId: null,
    },
  });

  state.nightActions = {
    wolvesTargetId: null,
    witchTargetId: null,
    seerTargetId: null,
    draculaTargetId: null,
  };

  $("night-result-label").textContent =
    nightDeaths.length
      ? "Morti: " + nightDeaths.map(id => players.find(p => p.id === id)?.name).join(", ")
      : "Nessun morto stanotte.";

  updatePhaseLabel();
}