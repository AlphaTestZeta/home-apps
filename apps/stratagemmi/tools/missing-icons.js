// Uso (dalla cartella apps/stratagemmi):  node tools/missing-icons.js
// Elenca le icone ancora mancanti (cerca .png, .svg o .webp in icons/).
const fs = require("fs");
const S = new Function(fs.readFileSync(__dirname + "/../stratagems.js", "utf8") + "; return STRATAGEMS;")();
const mancanti = S.filter((s) => !["png", "svg", "webp"].some((e) => fs.existsSync(`${__dirname}/../icons/${s.id}.${e}`)));
mancanti.forEach((s) => console.log(`${s.id}.png  —  ${s.name}`));
console.log(`\nMancano ${mancanti.length} icone su ${S.length}.`);
