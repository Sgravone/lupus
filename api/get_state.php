<?php
// api/get_state.php
// Restituisce lo stato completo della stanza.

header('Content-Type: application/json');

$roomId = strtoupper(trim($_GET['roomId'] ?? ''));

if ($roomId === '') {
    echo json_encode(['error' => 'roomId mancante.']);
    exit;
}

$baseDir = __DIR__ . '/../data/rooms';
$file    = $baseDir . '/' . $roomId . '.json';

if (!file_exists($file)) {
    echo json_encode(['error' => 'Stanza non trovata.']);
    exit;
}

$room = json_decode(file_get_contents($file), true);
if (!$room) {
    echo json_encode(['error' => 'Errore nel caricamento della stanza.']);
    exit;
}

// Per sicurezza: assicuriamoci che alcune chiavi esistano sempre
if (!isset($room['rolesConfig']) || !is_array($room['rolesConfig'])) {
    $room['rolesConfig'] = [];
}
if (!isset($room['assignments']) || !is_array($room['assignments'])) {
    $room['assignments'] = [];
}
if (!isset($room['playerStatus']) || !is_array($room['playerStatus'])) {
    $room['playerStatus'] = [];
}
if (!isset($room['voteMode'])) {
    $room['voteMode'] = 'normal';
}
if (!isset($room['witchLastTargetId'])) {
    $room['witchLastTargetId'] = null;
}

echo json_encode(['room' => $room], JSON_UNESCAPED_UNICODE);