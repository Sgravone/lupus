// js/panel.js
// Timer, modalità voto, polling, fetch stato stanza + tema giorno/notte

// TIMER ------------------------------
function startTimer(seconds) {
  state.timerSeconds = seconds;
  updateTimerDisplay();

  if (state.timerInterval) clearInterval(state.timerInterval);

  state.timerInterval = setInterval(() => {
    if (state.timerSeconds > 0) {
      state.timerSeconds--;
      updateTimerDisplay();
    } else {
      clearInterval(state.timerInterval);
      state.timerInterval = null;
    }
  }, 1000);
}

function stopTimer() {
  if (state.timerInterval) clearInterval(state.timerInterval);
  state.timerInterval = null;
  state.timerSeconds = 0;
  updateTimerDisplay();
}

function updateTimerDisplay() {
  $("timer-display").textContent = formatSeconds(state.timerSeconds);
}


// MODALITÀ VOTO ----------------------
function updateVoteModeUI() {
  const normal = $("pill-vote-normal");
  const secret = $("pill-vote-secret");
  const desc = $("vote-mode-description");

  if (!normal || !secret || !desc) return;

  if (state.voteMode === "normal") {
    normal.classList.add("mode-pill-active");
    secret.classList.remove("mode-pill-active");
    desc.textContent = "Il voto avviene dal vivo: il master segna i morti.";
  } else {
    secret.classList.add("mode-pill-active");
    normal.classList.remove("mode-pill-active");
    desc.textContent = "Voto segreto (in sviluppo).";
  }
}


// STATUS + POLLING -------------------
function setStatus(id, msg) {
  const el = $(id);
  if (el) el.textContent = msg || "";
}

function startPolling() {
  stopPolling();
  state.pollingInterval = setInterval(fetchRoomState, 2500);
  fetchRoomState();
}

function stopPolling() {
  if (state.pollingInterval) clearInterval(state.pollingInterval);
  state.pollingInterval = null;
}


// TEMA GIORNO / NOTTE ---------------
function applyPhaseTheme() {
  document.body.classList.remove("day-theme", "night-theme");

  if (state.phase === "day") {
    document.body.classList.add("day-theme");
  } else if (state.phase === "night") {
    document.body.classList.add("night-theme");
  } else {
    // default fallback: notte
    document.body.classList.add("night-theme");
  }
}


// FETCH STATO STANZA -----------------
async function fetchRoomState() {
  if (!state.roomId) return;
  try {
    const data = await apiGetState();
    if (!data || data.error) return;
    const room = data.room;
    if (!room) return;

    const me = (room.players || []).find(p => p.id === state.playerId);
    if (!me) return;

    state.isMaster = !!me.isMaster;
    state.mode = room.mode || "standard";
    state.phase = room.phase || "lobby";

    state.assignments = room.assignments || {};
    state.playerStatus = room.playerStatus || {};

    if (state.phase !== "lobby" || !state.isMaster) {
      state.rolesConfig = room.rolesConfig || {};
      renderRolesConfig();
    }

    state.voteMode = room.voteMode || "normal";
    state.witchLastTargetId = room.witchLastTargetId || null;
    state.myRoleId = state.assignments[state.playerId] || null;

    // Tema giorno/notte
    applyPhaseTheme();

    // UI comuni
    renderPlayers(room.players || []);
    renderMyRoleShort();
    renderGameRolesList();
    updatePhaseLabel();
    updateVoteModeUI();

    $("player-name-label").textContent = state.playerName || "";
    $("game-player-name").textContent = state.playerName || "";
    $("room-id-label").textContent = state.roomId || "";
    $("game-room-id").textContent = state.roomId || "";

    $("master-badge").classList.toggle("hidden", !state.isMaster);
    $("game-master-badge").classList.toggle("hidden", !state.isMaster);
    $("lobby-master-controls").classList.toggle("hidden", !state.isMaster);
    $("master-open-wrapper").classList.toggle("hidden", !state.isMaster);

    // Pannello master: se è aperto, aggiorna SEMPRE contenuti
    if (state.isMaster && state.masterPanelOpen) {
      renderMasterAssignments(room);
      if (state.phase === "night") {
        renderNightActions(room);
      } else {
        $("night-actions-container").innerHTML = "";
        $("night-result-label").textContent = "";
      }
    }

    // Giocatori: se non più in lobby, vanno alla schermata di gioco (ma solo se non stanno guardando ruolo)
    if (!state.isMaster && state.phase !== "lobby" && !state.screenLocked) {
      showScreen("screen-game");
    }

  } catch (e) {
    console.error("fetchRoomState error:", e);
  }
}