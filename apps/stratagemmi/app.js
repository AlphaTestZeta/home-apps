// ---- Suoni -----------------------------------------------------------
// A ogni swipe parte un beep a caso tra gli 8 nella cartella sounds/:
// public_audio_sounds_stratagem-input-beep-1.ogg ... -8.ogg
// Se un file manca, l'app funziona lo stesso, senza suono.
const BEEP_COUNT = 8;
const beepSrc = (n) => `sounds/public_audio_sounds_stratagem-input-beep-${n}.ogg`;

// Rotazione della freccia (il disegno di base punta in su)
const ROTATION = { up: 0, right: 90, down: 180, left: 270 };

const SOGLIA = 30; // pixel di movimento per riconoscere uno swipe

const arrow = document.getElementById("arrow");
const beeps = [];
for (let n = 1; n <= BEEP_COUNT; n++) {
  const a = new Audio(beepSrc(n));
  a.preload = "auto";
  beeps.push(a);
}

let lastBeep = -1;

function play() {
  // sceglie a caso, ma mai lo stesso suono due volte di fila
  let i;
  do { i = Math.floor(Math.random() * BEEP_COUNT); } while (i === lastBeep && BEEP_COUNT > 1);
  lastBeep = i;

  const a = beeps[i].cloneNode();   // permette swipe veloci sovrapposti
  a.play().catch(() => {});         // file mancante o audio bloccato: ignora
}

function show(dir) {
  arrow.style.setProperty("--rot", ROTATION[dir] + "deg");
  arrow.classList.remove("show");
  void arrow.getBoundingClientRect(); // riavvia l'animazione
  arrow.classList.add("show");
}

function swipe(dir) {
  show(dir);
  play();
}

// ---- Riconoscimento swipe (ovunque sullo schermo) -------------------------
let start = null;

document.addEventListener("pointerdown", (e) => {
  if (e.target.closest(".back")) return;
  start = { x: e.clientX, y: e.clientY };
});

document.addEventListener("pointermove", (e) => {
  if (!start) return;
  const dx = e.clientX - start.x;
  const dy = e.clientY - start.y;
  if (Math.max(Math.abs(dx), Math.abs(dy)) < SOGLIA) return;

  const dir = Math.abs(dx) > Math.abs(dy)
    ? (dx > 0 ? "right" : "left")
    : (dy > 0 ? "down" : "up");

  swipe(dir);
  start = null; // uno swipe = una freccia; per un altro, solleva e ripeti
});

for (const ev of ["pointerup", "pointercancel"]) {
  document.addEventListener(ev, () => { start = null; });
}

// Blocca menu contestuale (pressione lunga) e gesti del browser
document.addEventListener("contextmenu", (e) => e.preventDefault());
