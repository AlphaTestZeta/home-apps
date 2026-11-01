// Uso (dalla cartella apps/stratagemmi):  node tools/check-codes.js
const fs = require("fs");
const S = new Function(fs.readFileSync(__dirname + "/../stratagems.js", "utf8") + "; return STRATAGEMS;")();
let problemi = 0;
const ids = new Set(), codes = new Map();
for (const s of S) {
  if (!/^[UDLR]+$/.test(s.code)) { console.log("Codice non valido:", s.name, s.code); problemi++; }
  if (ids.has(s.id)) { console.log("ID doppio:", s.id); problemi++; }
  ids.add(s.id);
  if (codes.has(s.code)) { console.log("Codice doppio:", s.name, "=", codes.get(s.code)); problemi++; }
  codes.set(s.code, s.name);
}
for (const a of S) for (const b of S)
  if (a !== b && b.code.length > a.code.length && b.code.startsWith(a.code)) {
    console.log("Prefisso:", a.name, `(${a.code})`, "è l'inizio di", b.name, `(${b.code})`); problemi++;
  }
console.log(`${S.length} stratagemmi, ${problemi} problemi`);
const nonVerificati = S.filter((s) => s.fonte !== "w");
console.log(`Verificati sulla wiki: ${S.length - nonVerificati.length} — da verificare: ${nonVerificati.length}`);
if (process.argv.includes("--elenco")) nonVerificati.forEach((s) => console.log(`  ${s.name} (${s.code}) [${s.fonte}]`));
