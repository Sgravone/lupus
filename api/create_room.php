<?php
// api/create_room.php
// Crea una nuova stanza e il primo giocatore (master).

header('Content-Type: application/json');

$raw = file_get_contents('php://input');
$data = json_decode($raw, true);

$playerName = trim($data['playerName'] ?? '');
if ($playerName === '') {
    echo json_encode(['error' => 'Nome giocatore mancante.']);
    exit;
}

// Genera ID stanza e giocatore
$roomId   = strtoupper(substr(bin2hex(random_bytes(3)), 0, 6));
$playerId = 'p_' . bin2hex(random_bytes(3));

$room = [
    'id'        => $roomId,
    'createdAt' => time(),
    'mode'      => 'standard',   // per ora solo master standard
    'phase'     => 'lobby',      // lobby | running | day | night
    'voteMode'  => 'normal',     // normal | secret (preparato per il futuro)
    'players'   => [
        [
            'id'       => $playerId,
            'name'     => $playerName,
            'isMaster' => true
        ]
    ],
    'rolesConfig'       => new stdClass(), // configurazione ruoli
    'assignments'       => new stdClass(), // playerId -> roleId
    'playerStatus'      => new stdClass(), // playerId -> 'alive' | 'dead'
    'witchLastTargetId' => null            // chi ha protetto la strega l’ultima notte
];

// Salva su disco
$baseDir = __DIR__ . '/../data/rooms';
if (!is_dir($baseDir)) {
    @mkdir($baseDir, 0777, true);
}

$file = $baseDir . '/' . $roomId . '.json';
file_put_contents($file, json_encode($room, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE));

echo json_encode([
    'roomId'     => $roomId,
    'playerId'   => $playerId,
    'playerName' => $playerName,
    'isMaster'   => true
]);