// js/events.js
// Event listeners principali

window.addEventListener("DOMContentLoaded", () => {
  const roomFromUrl = getRoomFromUrl();

  if (roomFromUrl) {
    $("welcome-create-join").classList.add("hidden");
    $("welcome-name-only").classList.remove("hidden");
    setStatus("welcome-status", "Ti stai unendo alla stanza " + roomFromUrl.toUpperCase());
  }

  // ---------------------------------------
  // CREAZIONE STANZA
  // ---------------------------------------
  $("btn-create-room").onclick = async () => {
    const name = prompt("Il tuo nome?");
    if (!name) return;

    setStatus("welcome-status", "Creo una nuova stanza...");
    try {
      const data = await apiCreateRoom(name.trim());
      if (data.error) {
        setStatus("welcome-status", data.error);
        return;
      }

      state.roomId = data.roomId;
      state.playerId = data.playerId;
      state.playerName = data.playerName;
      state.isMaster = !!data.isMaster;
      state.phase = "lobby";

      $("player-name-label").textContent = state.playerName;
      $("room-id-label").textContent = state.roomId;
      $("game-player-name").textContent = state.playerName;
      $("game-room-id").textContent = state.roomId;

      $("master-badge").classList.toggle("hidden", !state.isMaster);
      $("game-master-badge").classList.toggle("hidden", !state.isMaster);
      $("lobby-master-controls").classList.toggle("hidden", !state.isMaster);
      $("master-open-wrapper").classList.toggle("hidden", !state.isMaster);

      updateRoomLink();
      renderRolesConfig();
      updateVoteModeUI();
      applyPhaseTheme();
      showScreen("screen-lobby");
      startPolling();
    } catch (e) {
      console.error(e);
      setStatus("welcome-status", "Errore nella creazione della stanza.");
    }
  };

  // ---------------------------------------
  // JOIN MANUALE
  // ---------------------------------------
  $("btn-join-room").onclick = async () => {
    const roomId = $("join-room-id").value.trim().toUpperCase();
    const name = $("join-name").value.trim();
    if (!roomId || !name) {
      setStatus("welcome-status", "Inserisci codice stanza e nome.");
      return;
    }

    setStatus("welcome-status", "Entro nella stanza...");
    try {
      const data = await apiJoinRoom(roomId, name);
      if (data.error) {
        setStatus("welcome-status", data.error);
        return;
      }

      state.roomId = data.roomId;
      state.playerId = data.playerId;
      state.playerName = data.playerName;
      state.isMaster = !!data.isMaster;

      $("player-name-label").textContent = state.playerName;
      $("room-id-label").textContent = state.roomId;
      $("game-player-name").textContent = state.playerName;
      $("game-room-id").textContent = state.roomId;

      $("master-badge").classList.toggle("hidden", !state.isMaster);
      $("game-master-badge").classList.toggle("hidden", !state.isMaster);
      $("lobby-master-controls").classList.toggle("hidden", !state.isMaster);
      $("master-open-wrapper").classList.toggle("hidden", !state.isMaster);

      updateRoomLink();
      applyPhaseTheme();
      showScreen("screen-lobby");
      startPolling();
    } catch (e) {
      console.error(e);
      setStatus("welcome-status", "Errore nell’accesso alla stanza.");
    }
  };

  // ---------------------------------------
  // JOIN DIRETTO DA ?room=
  // ---------------------------------------
  $("btn-join-direct").onclick = async () => {
    const roomId = roomFromUrl ? roomFromUrl.toUpperCase() : "";
    const name = $("join-name-direct").value.trim();
    if (!roomId || !name) {
      setStatus("welcome-status", "Nome mancante.");
      return;
    }

    setStatus("welcome-status", "Entro nella stanza...");
    try {
      const data = await apiJoinRoom(roomId, name);
      if (data.error) {
        setStatus("welcome-status", data.error);
        return;
      }

      state.roomId = data.roomId;
      state.playerId = data.playerId;
      state.playerName = data.playerName;
      state.isMaster = !!data.isMaster;

      $("player-name-label").textContent = state.playerName;
      $("room-id-label").textContent = state.roomId;
      $("game-player-name").textContent = state.playerName;
      $("game-room-id").textContent = state.roomId;

      $("master-badge").classList.toggle("hidden", !state.isMaster);
      $("game-master-badge").classList.toggle("hidden", !state.isMaster);
      $("lobby-master-controls").classList.toggle("hidden", !state.isMaster);
      $("master-open-wrapper").classList.toggle("hidden", !state.isMaster);

      updateRoomLink();
      applyPhaseTheme();
      showScreen("screen-lobby");
      startPolling();
    } catch (e) {
      console.error(e);
      setStatus("welcome-status", "Errore nell’accesso alla stanza.");
    }
  };

  // ---------------------------------------
  // MODALITÀ VOTO
  // ---------------------------------------
  $("pill-vote-normal").onclick = async () => {
    if (!state.isMaster) return;
    state.voteMode = "normal";
    updateVoteModeUI();
    await apiUpdateState({ voteMode: "normal" });
  };

  $("pill-vote-secret").onclick = async () => {
    if (!state.isMaster) return;
    state.voteMode = "secret";
    updateVoteModeUI();
    await apiUpdateState({ voteMode: "secret" });
    alert("Il voto segreto verrà implementato in seguito.");
  };

  // ---------------------------------------
  // AVVIO PARTITA
  // ---------------------------------------
  $("btn-start-game").onclick = async () => {
    if (!state.isMaster) return;

    const data = await apiGetState();
    if (!data || data.error) {
      setStatus("lobby-status", "Errore nel recupero della stanza.");
      return;
    }

    const room = data.room;
    const allPlayers = room.players || [];
    const players = allPlayers.filter(p => !p.isMaster);
    const playersCount = players.length;

    let totalRoles = Object.values(state.rolesConfig).reduce((a, b) => a + b, 0);

    if (playersCount === 0) {
      setStatus("lobby-status", "Non ci sono giocatori (escluso il master).");
      return;
    }

    if (totalRoles === 0) {
      if (!confirm("Non hai selezionato ruoli: tutti Contadini. Procedere?")) return;
    } else if (totalRoles !== playersCount) {
      if (!confirm("Numero ruoli ≠ numero giocatori. Procedere comunque?")) return;
    }

    const rolesPool = [];
    Object.entries(state.rolesConfig).forEach(([roleId, qty]) => {
      for (let i = 0; i < qty; i++) rolesPool.push(roleId);
    });

    while (rolesPool.length < playersCount) {
      rolesPool.push("contadino");
    }

    for (let i = rolesPool.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [rolesPool[i], rolesPool[j]] = [rolesPool[j], rolesPool[i]];
    }

    const newAssignments = { ...(room.assignments || {}) };
    players.forEach((p, idx) => {
      newAssignments[p.id] = rolesPool[idx] || "contadino";
    });

    const newStatus = {};
    players.forEach(p => {
      newStatus[p.id] = "alive";
    });

    await apiUpdateState({
      assignments: newAssignments,
      rolesConfig: state.rolesConfig,
      playerStatus: newStatus,
      phase: "day", // la prima fase vera è il giorno
      voteMode: state.voteMode,
      witchLastTargetId: null,
    });

    state.assignments = newAssignments;
    state.playerStatus = newStatus;
    state.phase = "day";
    applyPhaseTheme();
    setStatus("lobby-status", "Partita avviata.");
    showScreen("screen-game");
    fetchRoomState();
  };

  // ---------------------------------------
  // MOSTRA IL MIO RUOLO
  // ---------------------------------------
  $("btn-show-my-role").onclick = () => {
    if (!state.myRoleId) {
      alert("Il tuo ruolo non risulta assegnato.");
      return;
    }
    openRoleDetail(state.myRoleId);
  };

  // ---------------------------------------
  // TORNA ALLA PARTITA (sblocca schermo)
  // ---------------------------------------
  $("btn-role-back").onclick = () => {
    state.screenLocked = false;
    showScreen("screen-game");
  };

  // ---------------------------------------
  // TIMER
  // ---------------------------------------
  $("btn-timer-1").onclick = () => startTimer(60);
  $("btn-timer-3").onclick = () => startTimer(180);
  $("btn-timer-5").onclick = () => startTimer(300);
  $("btn-timer-clear").onclick = () => stopTimer();

  // ---------------------------------------
  // FASI (pulsanti interni)
  // ---------------------------------------
  $("btn-phase-day").onclick = async () => {
    if (!state.isMaster) return;
    state.phase = "day";
    state.screenLocked = false;
    applyPhaseTheme();
    updatePhaseLabel();
    await apiUpdateState({ phase: "day" });
  };

  $("btn-phase-night").onclick = async () => {
    if (!state.isMaster) return;
    state.phase = "night";
    state.screenLocked = false;
    state.nightActions = {
      wolvesTargetId: null,
      witchTargetId: null,
      seerTargetId: null,
      draculaTargetId: null,
    };
    applyPhaseTheme();
    updatePhaseLabel();
    await apiUpdateState({
      phase: "night",
      nightActions: state.nightActions,
    });
    const data = await apiGetState();
    if (data && !data.error) {
      renderNightActions(data.room);
    }
  };

  // ---------------------------------------
  // PANNELLO MASTER
  // ---------------------------------------
  $("btn-toggle-master-panel").onclick = () => {
    if (!state.isMaster) return;
    state.masterPanelOpen = true;
    state.screenLocked = true;
$("master-panel-wrapper").classList.remove("hidden");
state.masterPanelOpen = true;

  };

  $("btn-close-master-panel").onclick = () => {
    state.masterPanelOpen = false;
    state.screenLocked = false;
$("master-panel-wrapper").classList.add("hidden");
state.masterPanelOpen = false;

  };

  // ---------------------------------------
  // FINE NOTTE → passa a giorno + chiudi pannello
  // ---------------------------------------
  $("btn-night-resolve").onclick = async () => {
    if (!state.isMaster || state.phase !== "night") return;
    const data = await apiGetState();
    if (!data || data.error) return;
    await resolveNight(data.room);

    // Chiudi pannello, la logica interna passa già a "day"
    state.masterPanelOpen = false;
    state.screenLocked = false;
    $("master-panel-wrapper").style.display = "none";

    // Aggiornamento stato/tema
    state.phase = "day";
    applyPhaseTheme();
    fetchRoomState();
  };

  // ---------------------------------------
  // MORTI DEL GIORNO
  // ---------------------------------------
  $("btn-day-mark-deaths").onclick = async () => {
    if (!state.isMaster || state.phase !== "day") return;
    const data = await apiGetState();
    if (!data || data.error) return;
    openDayDeathsOverlay(data.room);
  };

  $("btn-day-deaths-close").onclick = () => {
    $("day-deaths-overlay").style.display = "none";
  };

  $("btn-day-deaths-confirm").onclick = async () => {
    const data = await apiGetState();
    if (!data || data.error) return;
    await confirmDayDeaths(data.room);
    fetchRoomState();
  };

  // INIT UI base
  updateTimerDisplay();
  updateVoteModeUI();
  applyPhaseTheme();
});