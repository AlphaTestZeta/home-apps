// Uso (dalla cartella principale della repo):  node tools/aggiorna-sw.js
// Rigenera l'elenco dei file e la versione in sw.js. Da rifare quando aggiungi o cambi file
// (icone, suoni, codice), poi fai commit di sw.js.
const fs = require("fs"), path = require("path"), crypto = require("crypto");
const root = path.join(__dirname, "..");
const skip = /^(\.git|node_modules|tools)$|\.(md|patch)$|^\.gitignore$|^sw\.js$/;
const files = [];
(function walk(d) {
  for (const n of fs.readdirSync(d).sort()) {
    if (skip.test(n)) continue;
    const p = path.join(d, n);
    fs.statSync(p).isDirectory() ? walk(p) : files.push(path.relative(root, p).split(path.sep).join("/"));
  }
})(root);
const h = crypto.createHash("md5");
files.forEach((f) => { h.update(f); h.update(fs.readFileSync(path.join(root, f))); });
const version = "v" + h.digest("hex").slice(0, 8);
const cartelleApp = fs.readdirSync(path.join(root, "apps")).filter((n) => fs.existsSync(path.join(root, "apps", n, "index.html"))).map((n) => `apps/${n}/`);
const lista = ["./", ...cartelleApp, ...files].map((f) => `  ${JSON.stringify(f.split("/").map(encodeURIComponent).join("/").replace(/^%2E%2F$/, "./").replace(/^\.%2F$/, "./"))},`).join("\n");
let sw = fs.readFileSync(path.join(root, "sw.js"), "utf8");
sw = sw.replace(/const VERSION = ".*?";/, `const VERSION = "${version}";`)
       .replace(/\/\/ <ARCHIVIO>[\s\S]*?\/\/ <\/ARCHIVIO>/, `// <ARCHIVIO>\n${lista}\n// </ARCHIVIO>`);
fs.writeFileSync(path.join(root, "sw.js"), sw);
console.log(`sw.js aggiornato: ${files.length + 2} file, versione ${version}`);
