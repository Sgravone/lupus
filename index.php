<?php
// index.php - Lupus in Tabula – Goldr Edition (modulare)
?>
<!DOCTYPE html>
<html lang="it">
<head>
  <meta charset="UTF-8" />
  <title>Lupus in Tabula – Goldr Edition</title>
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <link rel="stylesheet" href="style.css">
</head>
<body>
  <div class="app">
    <!-- SCHERMATA 1: BENVENUTO / JOIN -->
    <div id="screen-welcome" class="card">
      <h1>Lupus – Goldr Edition</h1>
      <p class="small">
        Crea una nuova partita o unisciti a una stanza esistente.  
        Ottimizzato per smartphone.
      </p>

      <div id="welcome-create-join">
        <button id="btn-create-room">Crea nuova partita</button>

        <div class="divider"></div>

        <div>
          <div class="section-title">Entra in una partita</div>
          <label class="small">Codice stanza</label>
          <input id="join-room-id" placeholder="Es. ABC123" />

          <label class="small">Il tuo nome</label>
          <input id="join-name" placeholder="Es. Morgana" />

          <button id="btn-join-room" class="secondary">Entra</button>
        </div>
      </div>

      <div id="welcome-name-only" class="hidden">
        <label class="small">Il tuo nome</label>
        <input id="join-name-direct" placeholder="Es. Morgana" />
        <button id="btn-join-direct">Entra</button>
      </div>

      <div id="welcome-status" class="status"></div>
    </div>

    <!-- SCHERMATA 2: LOBBY -->
    <div id="screen-lobby" class="card hidden">
      <h2>Lobby partita</h2>

      <p class="small">Condividi questo link con gli altri giocatori:</p>
      <input id="room-link" readonly />

      <p class="small">
        Codice stanza: <span id="room-id-label"></span><br />
        Tu sei: <strong id="player-name-label"></strong>
        <span id="master-badge" class="badge badge-master hidden">Master</span>
      </p>

      <div class="divider"></div>

      <div>
        <div class="section-title">Giocatori</div>
        <div id="players-list" class="small">Nessun giocatore.</div>
      </div>

      <!-- CONTROLLI MASTER IN LOBBY -->
      <div id="lobby-master-controls" class="hidden">

        <div class="divider"></div>

        <div class="section-title">Modalità gioco</div>
        <div class="mode-pill-row">
          <span id="pill-mode-standard" class="mode-pill mode-pill-active">Master standard</span>
          <span id="pill-mode-auto" class="mode-pill tiny">Master automatico (in arrivo)</span>
        </div>
        <p id="mode-description" class="small">
          Modalità classica: tu fai da master.  
          Il sito assegna i ruoli e tiene traccia dello stato.
        </p>

        <div class="divider"></div>

        <div class="section-title">Modalità voto</div>
        <div class="mode-pill-row">
          <span id="pill-vote-normal" class="mode-pill mode-pill-active">Voto normale (dal vivo)</span>
          <span id="pill-vote-secret" class="mode-pill">Voto segreto (in arrivo)</span>
        </div>
        <p id="vote-mode-description" class="small">
          Scegli come verrà gestito il voto per tutta la partita.
        </p>

        <div class="divider"></div>

        <div class="section-title">Ruoli in partita</div>
        <p class="small">
          Puoi selezionare più ruoli del necessario: non tutti verranno usati.
        </p>

        <div id="roles-list" class="roles-list"></div>
        <p id="roles-summary" class="small"></p>

        <button id="btn-start-game">Avvia partita</button>

        <div id="lobby-status" class="status"></div>
      </div>
    </div>

    <!-- SCHERMATA 3: PARTITA -->
    <div id="screen-game" class="card hidden">
      <h2>Partita in corso</h2>
      <p class="small">
        Ruoli e fasi gestiti dal master.  
        Ogni giocatore può vedere il proprio ruolo.
      </p>

      <p class="tiny">
        Codice: <span id="game-room-id"></span> · 
        Tu sei: <strong id="game-player-name"></strong>
        <span id="game-master-badge" class="badge badge-master hidden">Master</span>
      </p>

      <div class="divider"></div>

      <div>
        <div class="section-title">Il tuo ruolo</div>
        <p id="game-role-label" class="small">Ruolo nascosto.</p>
        <button id="btn-show-my-role" class="secondary small">Mostra / Nascondi</button>
      </div>

      <div class="divider"></div>

      <div>
        <div class="section-title">Ruoli in gioco</div>
        <p class="tiny">
          Lista dei ruoli scelti dal master (anche quelli non assegnati).
        </p>
        <div id="game-roles-list" class="roles-list small"></div>
      </div>

      <div class="divider"></div>

      <div id="master-open-wrapper" class="hidden">
        <button id="btn-toggle-master-panel" class="secondary small">Apri pannello master</button>
        <p class="tiny">Chiudi il pannello quando gli altri potrebbero vedere lo schermo.</p>
      </div>

      <p id="phase-label" class="small"></p>
    </div>

    <!-- SCHERMATA 4: DETTAGLIO RUOLO -->
    <div id="screen-role" class="card hidden">
      <h2>Il tuo ruolo</h2>
      <p class="small">Non mostrare agli altri giocatori.</p>

      <div id="role-box" class="hidden">
        <h3 id="role-name"></h3>

        <div class="pill-row">
          <span id="role-faction-pill" class="pill"></span>
          <span id="role-aura-pill" class="pill"></span>
          <span id="role-ability-pill" class="pill pill-outline"></span>
        </div>

        <p id="role-description" class="small" style="margin-top: 8px;"></p>
      </div>

      <button id="btn-role-back" class="secondary">Torna alla partita</button>
    </div>

  </div> <!-- chiude .app -->

  <!-- PANNELLO MASTER -->
  <div id="master-panel-wrapper" class="hidden">
    <div id="master-panel-inner">
      <div id="master-panel-drag"></div>

      <div class="row">
        <span class="section-title">Pannello master</span>
        <button id="btn-close-master-panel" class="secondary small">Chiudi</button>
      </div>

      <div class="divider"></div>

      <div class="section-title">Assegnazioni ruolo</div>
      <div id="master-assignments" class="small"></div>

      <div class="divider"></div>

      <div class="section-title">Timer</div>
      <div class="row">
        <span class="small">Timer supporto</span>
        <span class="timer-display" id="timer-display">00:00</span>
      </div>

      <div class="timer-controls">
        <button id="btn-timer-1" class="secondary small">1 min</button>
        <button id="btn-timer-3" class="secondary small">3 min</button>
        <button id="btn-timer-5" class="secondary small">5 min</button>
        <button id="btn-timer-clear" class="secondary small">Reset</button>
      </div>

      <div class="divider"></div>

      <div class="section-title">Fase</div>
      <div class="row">
        <button id="btn-phase-day" class="secondary small">Giorno</button>
        <button id="btn-phase-night" class="secondary small">Notte</button>
      </div>

      <div class="divider"></div>

      <div class="section-title">Notte – ruoli attivi</div>
      <p class="tiny">
        Le selezioni qui non vengono più resettate: finché il pannello è aperto restano stabili.
      </p>
      <div id="night-actions-container" class="small"></div>

      <button id="btn-night-resolve" class="secondary small">Fine notte</button>
      <p id="night-result-label" class="tiny"></p>

      <div class="divider"></div>

      <div class="section-title">Vittime del giorno</div>
      <button id="btn-day-mark-deaths" class="secondary small">Segna morti del giorno</button>

    </div>
  </div>

  <!-- OVERLAY MORTI DEL GIORNO -->
  <div id="day-deaths-overlay">
    <div id="day-deaths-modal">
      <div class="row">
        <span class="section-title">Morti del giorno</span>
        <button id="btn-day-deaths-close" class="secondary small">Annulla</button>
      </div>
      <p class="tiny">Tocca i giocatori messi al rogo.</p>

      <div id="day-deaths-list" class="day-deaths-list"></div>
      <button id="btn-day-deaths-confirm" class="secondary small">Conferma</button>
    </div>
  </div>

  <!-- SCRIPTS MODULARI -->
  <script src="js/roles.js"></script>
  <script src="js/state.js"></script>
  <script src="js/api.js"></script>
  <script src="js/render.js"></script>
  <script src="js/night.js"></script>
  <script src="js/day.js"></script>
  <script src="js/panel.js"></script>
  <script src="js/events.js"></script>
  <script src="js/app.js"></script>
</body>
</html>