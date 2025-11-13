<?php
// api/join_room.php
// Aggiunge un nuovo giocatore a una stanza esistente.

header('Content-Type: application/json');

$raw = file_get_contents('php://input');
$data = json_decode($raw, true);

$roomId     = strtoupper(trim($data['roomId'] ?? ''));
$playerName = trim($data['playerName'] ?? '');

if ($roomId === '' || $playerName === '') {
    echo json_encode(['error' => 'Dati mancanti (stanza o nome).']);
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

// Evita nomi duplicati nella stessa stanza
foreach ($room['players'] as $p) {
    if (strcasecmp($p['name'], $playerName) === 0) {
        echo json_encode(['error' => 'Esiste già un giocatore con questo nome nella stanza.']);
        exit;
    }
}

$playerId = 'p_' . bin2hex(random_bytes(3));
$newPlayer = [
    'id'       => $playerId,
    'name'     => $playerName,
    'isMaster' => false
];

$room['players'][] = $newPlayer;

// Se non c'è ancora playerStatus, inizializzalo
if (!isset($room['playerStatus']) || !is_array($room['playerStatus'])) {
    $room['playerStatus'] = [];
}

// Di default il nuovo giocatore è vivo
$room['playerStatus'][$playerId] = 'alive';

// Salva
file_put_contents($file, json_encode($room, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE));

echo json_encode([
    'roomId'     => $roomId,
    'playerId'   => $playerId,
    'playerName' => $playerName,
    'isMaster'   => false
]);