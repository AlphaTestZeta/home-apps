# Home apps

Bozza della home page: carosello orizzontale di icone quadrate (app) con barra di scorrimento.

## Struttura
- `index.html` – home
- `apps/stratagemmi/` – app 1: stratagemmi Helldivers
- `apps/orologio/` – app 2: orologio digitale
- `sw.js` + `manifest.webmanifest` – app installabile e offline (aggiorna con `node tools/aggiorna-sw.js`)
- `css/style.css` – grafica (sfondo sfumato, icone, barra)
- `js/apps.js` – **elenco delle app** (qui si modificano nomi e link)
- `js/main.js` – carosello e barra di scorrimento

## Provarla
Apri `index.html` nel browser (meglio dal telefono, in orizzontale), oppure:
`python3 -m http.server` e vai su http://localhost:8000
