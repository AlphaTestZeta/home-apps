// ---- Suoni -----------------------------------------------------------
// Nella cartella sounds/:
//   public_audio_sounds_stratagem-input-beep-1..8.ogg   (a ogni swipe, a caso)
//   public_audio_sounds_stratagem-input-fail-1..2.ogg   (combinazione sbagliata, a caso)
//   public_audio_sounds_stratagem-input-ready.ogg       (stratagemma completato)
// Se un file manca, l'app funziona lo stesso, senza suono.
const PREFIX = "sounds/public_audio_sounds_stratagem-input-";
const BEEPS = Array.from({ length: 8 }, (_, i) => new Audio(`${PREFIX}beep-${i + 1}.ogg`));
const FAILS = Array.from({ length: 2 }, (_, i) => new Audio(`${PREFIX}fail-${i + 1}.ogg`));
const READY = new Audio(`${PREFIX}ready.ogg`);
[...BEEPS, ...FAILS, READY].forEach((a) => (a.preload = "auto"));

const last = new Map();
function playRandom(list) {
  let i;
  do { i = Math.floor(Math.random() * list.length); } while (list.length > 1 && i === last.get(list));
  last.set(list, i);
  play(list[i]);
}
function play(audio) {
  const a = audio.cloneNode();   // permette suoni sovrapposti
  a.play().catch(() => {});      // file mancante o audio bloccato: ignora
}

// ---- Impostazioni ----------------------------------------------------
const SOGLIA = 30;            // pixel di movimento per riconoscere uno swipe
const ATTESA_RISULTATO = 500; // ms tra l'ultimo swipe e la comparsa dell'icona
const DISSOLVENZA = 1000;     // ms: la sequenza in basso svanisce a completamento
const ATTESA_AMBIGUA = 800;   // ms: se un codice è l'inizio di un altro (es. SOS Beacon / Reinforce)
const ROTATION = { U: 0, R: 90, D: 180, L: 270 };
const DIR = { up: "U", right: "R", down: "D", left: "L" };

// ---- Elementi --------------------------------------------------------
const arrow = document.getElementById("arrow");
const result = document.getElementById("result");
const icon = document.getElementById("icon");
const label = document.getElementById("label");
const seqBox = document.getElementById("seq");
const resetBtn = document.getElementById("reset");

const ARROW_SVG = '<svg viewBox="0 0 100 100" aria-hidden="true"><path d="M50 8 L92 52 H64 V92 H36 V52 H8 Z" fill="currentColor"/></svg>';

// ---- Stato -----------------------------------------------------------
let seq = "";
let timer = null;      // attesa per i codici ambigui
let errTimer = null;
let completeTimer = null;   // attesa prima di mostrare l'icona
let fadeTimer = null;       // dissolvenza della sequenza in basso
let bloccoInput = false;    // vero dal completamento fino alla chiusura dell'icona

function renderSeq(errore = false) {
  clearTimeout(fadeTimer);
  seqBox.classList.remove("svanisce");
  seqBox.classList.toggle("errore", errore);
  seqBox.innerHTML = "";
  for (const d of seq) {
    seqBox.insertAdjacentHTML("beforeend", ARROW_SVG);
    seqBox.lastElementChild.style.transform = `rotate(${ROTATION[d]}deg)`;
  }
}

function flash(d) {
  arrow.style.setProperty("--rot", ROTATION[d] + "deg");
  arrow.classList.remove("show");
  void arrow.getBoundingClientRect();   // riavvia l'animazione
  arrow.classList.add("show");
}

function reset() {
  clearTimeout(timer);
  seq = "";
  renderSeq();
}

const ESTENSIONI = ["png", "svg", "webp"];   // formati provati se manca il campo "icon"

function mostraRisultato(s) {
  arrow.classList.remove("show");
  label.textContent = s.name;
  icon.hidden = true;

  // prima il file indicato in "icon", poi icons/<id>.png/.svg/.webp; senza icona resta il nome
  const urls = [];
  if (s.icon) urls.push(`icons/${encodeURIComponent(s.icon)}`);
  for (const e of ESTENSIONI) urls.push(`icons/${s.id}.${e}`);
  let i = 0;
  icon.onload = () => { icon.hidden = false; };
  icon.onerror = () => { if (++i < urls.length) icon.src = urls[i]; };
  icon.src = urls[0];
  result.hidden = false;
}

function complete(s) {
  clearTimeout(timer);
  bloccoInput = true;                 // da ora nessun input finché l'icona non viene chiusa
  play(READY);

  // l'ultima freccia resta visibile, poi compare l'icona
  clearTimeout(completeTimer);
  completeTimer = setTimeout(() => mostraRisultato(s), ATTESA_RISULTATO);

  // la sequenza in basso resta intera e svanisce in 1 secondo
  seqBox.classList.add("svanisce");
  clearTimeout(fadeTimer);
  fadeTimer = setTimeout(() => {
    seqBox.classList.remove("svanisce");
    seqBox.innerHTML = "";
  }, DISSOLVENZA);
  seq = "";
}

function fail() {
  clearTimeout(timer);
  playRandom(FAILS);
  renderSeq(true);                       // sequenza in rosso per un attimo
  clearTimeout(errTimer);
  errTimer = setTimeout(reset, 350);
  seq = "";
}


function input(d) {
  clearTimeout(errTimer);
  seqBox.classList.remove("errore");
  clearTimeout(timer);

  const next = seq + d;
  const candidati = STRATAGEMS.filter((s) => s.code.startsWith(next));
  if (candidati.length === 0) {
    seq = next;
    flash(d);
    return fail();
  }

  seq = next;
  renderSeq();
  flash(d);

  const esatto = candidati.find((s) => s.code === next);
  if (!esatto) { playRandom(BEEPS); return; }

  const altri = candidati.length > 1;   // codice che prosegue in un altro più lungo
  if (altri) {
    playRandom(BEEPS);
    timer = setTimeout(() => complete(esatto), ATTESA_AMBIGUA);
  } else {
    complete(esatto);
  }
}

// ---- Gesti (ovunque sullo schermo) -----------------------------------------
let start = null;
let bloccato = false;   // gesto iniziato con l'icona visibile: non conta come input

document.addEventListener("pointerdown", (e) => {
  if (e.target.closest(".back, .reset")) return;
  bloccato = bloccoInput;
  start = { x: e.clientX, y: e.clientY };
});

document.addEventListener("pointermove", (e) => {
  if (!start || bloccato) return;
  const dx = e.clientX - start.x;
  const dy = e.clientY - start.y;
  if (Math.max(Math.abs(dx), Math.abs(dy)) < SOGLIA) return;

  const dir = Math.abs(dx) > Math.abs(dy)
    ? (dx > 0 ? "right" : "left")
    : (dy > 0 ? "down" : "up");

  start = null;   // uno swipe = un input; per un altro, solleva e ripeti
  input(DIR[dir]);
});

function fine() {
  if (bloccato && !result.hidden) {   // il tocco chiude l'icona, senza input
    result.hidden = true;
    bloccoInput = false;
  }
  bloccato = false;
  start = null;
}
document.addEventListener("pointerup", fine);
document.addEventListener("pointercancel", fine);

document.addEventListener("contextmenu", (e) => e.preventDefault());

// ---- Azzera la sequenza (linea in alto al centro), senza suoni ---------------
resetBtn.addEventListener("pointerdown", (e) => {
  e.preventDefault();
  clearTimeout(completeTimer);
  clearTimeout(errTimer);
  if (result.hidden) bloccoInput = false;   // se l'icona non c'è ancora, annulla l'attesa
  reset();
});
