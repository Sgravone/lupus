// js/state.js
// Stato globale client

const state = {
  roomId: null,
  playerId: null,
  playerName: null,

  isMaster: false,
  phase: "lobby", // lobby | running | day | night
  mode: "standard",
  voteMode: "normal",

  rolesConfig: {},   // { roleId: qty }
  assignments: {},   // { playerId: roleId }
  playerStatus: {},  // { playerId: 'alive' | 'dead' }

  witchLastTargetId: null,

  myRoleId: null,

  nightActions: {
    wolvesTargetId: null,
    witchTargetId: null,
    seerTargetId: null,
    draculaTargetId: null,
  },

  timerSeconds: 0,
  timerInterval: null,

  pollingInterval: null,
  masterPanelOpen: false,

  // 👇 NUOVO: quando true, la UI non cambia schermata automaticamente
  screenLocked: false,
};

// helper rapidi
function $(id) {
  return document.getElementById(id);
}

function isPlayerAlive(id) {
  return state.playerStatus[id] !== "dead";
}

function formatSeconds(sec) {
  const m = Math.floor(sec / 60);
  const s = sec % 60;
  return `${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
}

function getRoomFromUrl() {
  const params = new URLSearchParams(window.location.search);
  return params.get("room");
}