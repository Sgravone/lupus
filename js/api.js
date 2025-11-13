// js/api.js
// Comunicazione con /api/*.php

async function apiCreateRoom(playerName) {
  const res = await fetch("api/create_room.php", {
    method: "POST",
    body: JSON.stringify({ playerName }),
  });
  return res.json();
}

async function apiJoinRoom(roomId, playerName) {
  const res = await fetch("api/join_room.php", {
    method: "POST",
    body: JSON.stringify({ roomId, playerName }),
  });
  return res.json();
}

async function apiGetState() {
  if (!state.roomId) return null;
  const res = await fetch(`api/get_state.php?roomId=${state.roomId}`);
  return res.json();
}

async function apiUpdateState(update) {
  const res = await fetch("api/update_state.php", {
    method: "POST",
    body: JSON.stringify({
      roomId: state.roomId,
      playerId: state.playerId,
      update,
    }),
  });
  return res.json();
}