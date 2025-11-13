<?php
// api/update_state.php
// Aggiorna lo stato della stanza (solo il master può farlo).

header('Content-Type: application/json');

$raw = file_get_contents('php://input');
$data = json_decode($raw, true);

$roomId   = strtoupper(trim($data['roomId'] ?? ''));
$playerId = trim($data['playerId'] ?? '');
$update   = $data['update'] ?? null;

if ($roomId === '' || $playerId === '' || !is_array($update)) {
    echo json_encode(['error' => 'Dati mancanti.']);
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

// Verifica che chi chiede l’update sia il master
$isMaster = false;
foreach ($room['players'] as $p) {
    if ($p['id'] === $playerId && !empty($p['isMaster'])) {
        $isMaster = true;
        break;
    }
}
if (!$isMaster) {
    echo json_encode(['error' => 'Solo il master può aggiornare lo stato.']);
    exit;
}

// ===== Applicazione degli aggiornamenti consentiti =====

// Modalità di gioco (standard / auto in futuro)
if (isset($update['mode'])) {
    $room['mode'] = $update['mode'];
}

// Config ruoli
if (isset($update['rolesConfig']) && is_array($update['rolesConfig'])) {
    $room['rolesConfig'] = $update['rolesConfig'];
}

// Assegnazione ruoli ai giocatori
if (isset($update['assignments']) && is_array($update['assignments'])) {
    $room['assignments'] = $update['assignments'];
}

// Fase di gioco (lobby / running / day / night)
if (isset($update['phase'])) {
    $room['phase'] = $update['phase'];
}

// Modalità di voto (normal / secret)
if (isset($update['voteMode'])) {
    $room['voteMode'] = $update['voteMode'];
}

// Stato dei giocatori (vivo/morto)
if (isset($update['playerStatus']) && is_array($update['playerStatus'])) {
    // Merge semplice: sovrascrive ciò che viene passato dal master
    if (!isset($room['playerStatus']) || !is_array($room['playerStatus'])) {
        $room['playerStatus'] = [];
    }
    foreach ($update['playerStatus'] as $pid => $status) {
        $room['playerStatus'][$pid] = $status;
    }
}

// Ultimo bersaglio protetto dalla strega (per la regola del "non due volte di fila")
if (array_key_exists('witchLastTargetId', $update)) {
    $room['witchLastTargetId'] = $update['witchLastTargetId'];
}

// ===== Salva e restituisci =====
file_put_contents($file, json_encode($room, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE));

echo json_encode([
    'ok'   => true,
    'room' => $room
], JSON_UNESCAPED_UNICODE);