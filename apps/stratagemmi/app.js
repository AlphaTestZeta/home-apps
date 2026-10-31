// ---- Suoni -----------------------------------------------------------
// Metti i file nella cartella sounds/ con questi nomi (o cambia i nomi qui).
// Se un file manca, l'app funziona lo stesso, senza suono.
const SOUNDS = {
  up:    "sounds/up.mp3",
  down:  "sounds/down.mp3",
  left:  "sounds/left.mp3",
  right: "sounds/right.mp3",
};

// Rotazione della freccia (il disegno di base punta in su)
const ROTATION = { up: 0, right: 90, down: 180, left: 270 };

const SOGLIA = 30; // pixel di movimento per riconoscere uno swipe

const arrow = document.getElementById("arrow");
const audio = {};
for (const [dir, src] of Object.entries(SOUNDS)) {
  const a = new Audio(src);
  a.preload = "auto";
  audio[dir] = a;
}

function play(dir) {
  const base = audio[dir];
  if (!base) return;
  const a = base.cloneNode();       // permette swipe veloci sovrapposti
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
  play(dir);
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
