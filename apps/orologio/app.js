// Orologio digitale a 7 segmenti, bianco su nero.
// Usa l'ora e il fuso orario del telefono: se viaggi e il telefono cambia fuso, cambia anche l'ora qui.

const NS = "http://www.w3.org/2000/svg";
const clock = document.getElementById("clock");

// Segmenti: a=alto, b=alto dx, c=basso dx, d=basso, e=basso sx, f=alto sx, g=centro
const H = [[6,4],[10,0],[50,0],[54,4],[50,8],[10,8]];   // segmento orizzontale
const V = [[4,6],[8,10],[8,44],[4,48],[0,44],[0,10]];   // segmento verticale
const sposta = (p, dx, dy) => p.map(([x, y]) => `${x + dx},${y + dy}`).join(" ");
const SEG = { a: sposta(H,0,0), g: sposta(H,0,46), d: sposta(H,0,92),
              f: sposta(V,0,0), b: sposta(V,52,0), e: sposta(V,0,46), c: sposta(V,52,46) };
const CIFRE = { 0:"abcdef", 1:"bc", 2:"abdeg", 3:"abcdg", 4:"bcfg", 5:"acdfg", 6:"acdefg", 7:"abc", 8:"abcdefg", 9:"abcdfg" };

function creaCifra() {
  const svg = document.createElementNS(NS, "svg");
  svg.setAttribute("viewBox", "0 0 60 100");
  svg.setAttribute("aria-hidden", "true");
  const parti = {};
  for (const [nome, punti] of Object.entries(SEG)) {
    const p = document.createElementNS(NS, "polygon");
    p.setAttribute("points", punti);
    p.setAttribute("class", "seg");
    svg.appendChild(p);
    parti[nome] = p;
  }
  clock.appendChild(svg);
  return parti;
}

function creaDuePunti() {
  const svg = document.createElementNS(NS, "svg");
  svg.setAttribute("viewBox", "0 0 16 100");
  svg.setAttribute("aria-hidden", "true");
  for (const cy of [30, 70]) {
    const c = document.createElementNS(NS, "circle");
    c.setAttribute("cx", 8); c.setAttribute("cy", cy); c.setAttribute("r", 5);
    c.setAttribute("class", "dot");
    svg.appendChild(c);
  }
  clock.appendChild(svg);
}

const cifre = [creaCifra(), creaCifra()];
creaDuePunti();
cifre.push(creaCifra(), creaCifra());

let ultima = "";
function aggiorna() {
  const d = new Date();   // ora locale del telefono, fuso incluso
  const t = String(d.getHours()).padStart(2, "0") + String(d.getMinutes()).padStart(2, "0");
  if (t === ultima) return;
  ultima = t;
  clock.setAttribute("aria-label", `${t.slice(0, 2)}:${t.slice(2)}`);
  [...t].forEach((ch, i) => {
    for (const [nome, el] of Object.entries(cifre[i])) {
      el.classList.toggle("on", CIFRE[ch].includes(nome));
    }
  });
}
aggiorna();
setInterval(aggiorna, 1000);

// ---- Schermo intero, schermo sempre acceso, orizzontale -------------------------
if ("serviceWorker" in navigator) navigator.serviceWorker.register("../../sw.js").catch(() => {});

const installata = matchMedia("(display-mode: fullscreen), (display-mode: standalone)").matches || navigator.standalone;

async function tieniAcceso() {
  try { await navigator.wakeLock?.request("screen"); } catch (e) { /* non supportato */ }
}
document.addEventListener("visibilitychange", () => {
  if (document.visibilityState === "visible") { tieniAcceso(); aggiorna(); }
});

function bloccaOrizzontale() {
  try { screen.orientation?.lock?.("landscape")?.catch(() => {}); } catch (e) { /* non supportato */ }
}

document.addEventListener("pointerup", function primoTocco() {
  document.removeEventListener("pointerup", primoTocco);
  tieniAcceso();
  if (installata) { bloccaOrizzontale(); return; }
  if (document.fullscreenEnabled && !document.fullscreenElement) {
    document.documentElement.requestFullscreen({ navigationUI: "hide" }).then(bloccaOrizzontale).catch(() => {});
  }
});

document.addEventListener("contextmenu", (e) => e.preventDefault());
