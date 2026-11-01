// Uso (dalla cartella apps/stratagemmi):  node tools/missing-icons.js
// Elenca le icone ancora mancanti in icons/.
const fs = require("fs");
const S = new Function(fs.readFileSync(__dirname + "/../stratagems.js", "utf8") + "; return STRATAGEMS;")();
const dir = __dirname + "/../icons/";
const c = (f) => fs.existsSync(dir + f);
const mancanti = S.filter((s) => !(s.icon && c(s.icon)) && !["png", "svg", "webp"].some((e) => c(`${s.id}.${e}`)));
mancanti.forEach((s) => console.log(`${s.icon || s.id + ".png"}  —  ${s.name}`));
console.log(`\nMancano ${mancanti.length} icone su ${S.length}.`);
