const carousel = document.getElementById("carousel");
const track = document.getElementById("track");
const thumb = document.getElementById("thumb");

// Crea le icone
for (const app of APPS) {
  const a = document.createElement("a");
  a.className = "app";
  a.href = app.url;
  a.setAttribute("aria-label", app.name);
  carousel.appendChild(a);
}

// Barra sincronizzata con lo scorrimento
const PAD = 0.012; // margine interno della barra (frazione della larghezza)

function layout() {
  const { scrollLeft, scrollWidth, clientWidth } = carousel;
  const max = scrollWidth - clientWidth;
  const tw = track.clientWidth;
  const inner = tw * (1 - PAD * 2);
  const w = Math.max(inner * clientWidth / scrollWidth, 40);
  const x = tw * PAD + (max > 0 ? (scrollLeft / max) * (inner - w) : 0);
  thumb.style.width = w + "px";
  thumb.style.transform = `translateX(${x}px)`;
  track.setAttribute("aria-valuenow", max > 0 ? Math.round(scrollLeft / max * 100) : 0);
}

carousel.addEventListener("scroll", layout, { passive: true });
window.addEventListener("resize", layout);
layout();

// Trascinare la barra o toccare la pista per spostarsi
function scrollToPointer(clientX) {
  const r = track.getBoundingClientRect();
  const w = thumb.offsetWidth;
  const ratio = Math.min(1, Math.max(0, (clientX - r.left - w / 2) / (r.width - w)));
  carousel.scrollTo({ left: ratio * (carousel.scrollWidth - carousel.clientWidth) });
}

let dragging = false;
track.addEventListener("pointerdown", (e) => {
  dragging = true;
  track.setPointerCapture(e.pointerId);
  carousel.style.scrollSnapType = "none";
  scrollToPointer(e.clientX);
});
track.addEventListener("pointermove", (e) => { if (dragging) scrollToPointer(e.clientX); });
const stop = () => { dragging = false; carousel.style.scrollSnapType = ""; };
track.addEventListener("pointerup", stop);
track.addEventListener("pointercancel", stop);

// Rotella del mouse: scorrimento orizzontale sul PC
carousel.addEventListener("wheel", (e) => {
  if (Math.abs(e.deltaY) > Math.abs(e.deltaX)) {
    carousel.scrollLeft += e.deltaY;
    e.preventDefault();
  }
}, { passive: false });
