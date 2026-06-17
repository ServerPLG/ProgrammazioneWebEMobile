# DevCards

Piattaforma che connette sviluppatori (candidati) e aziende (datori di lavoro),
in stile "swipe". Progetto per il corso di Programmazione Web e Mobile.

## Stack tecnologico

- **Backend:** Node.js + Express 5 + MySQL (`mysql2`)
- **Frontend:** Angular 18 + Ionic 8 (componenti standalone)
- **Mappe:** Leaflet + OpenStreetMap / Nominatim
- **QR code:** libreria `qrcode`

Il backend Express serve sia le API (`/api/...`) sia la build statica del
frontend Angular Ionic (cartella `frontend/www`).

## Struttura del progetto

```
.
├── server.js            # Server Express + API REST
├── db.js                # Pool di connessione MySQL
├── database.sql         # Schema del database
├── .env                 # Configurazione (host DB, porta, ...)
├── package.json         # Dipendenze + script del backend
└── frontend/            # App Angular + Ionic
    ├── angular.json
    ├── package.json     # Dipendenze del frontend
    ├── src/
    │   ├── index.html
    │   ├── main.ts
    │   ├── global.scss  # Stili globali (design DevCards)
    │   ├── theme/       # Variabili tema Ionic
    │   ├── assets/      # logo.png, PDF di presentazione
    │   └── app/
    │       ├── app.routes.ts
    │       ├── models/        # Interfacce TypeScript
    │       ├── services/      # ApiService, AuthService, GeocodeService
    │       ├── guards/        # candidate.guard, employer.guard
    │       ├── components/    # devcard, full-profile, map-picker, header, modali
    │       └── pages/         # login, candidate, employer, ...
    └── www/             # Build di produzione (generata, servita da Express)
```

## Requisiti

- Node.js 18+ e npm
- MySQL / MariaDB (es. XAMPP) in esecuzione

## Configurazione database

1. Avvia MySQL e importa lo schema:

   ```bash
   mysql -u root < database.sql
   ```

2. Controlla le credenziali in `.env`:

   ```
   DB_HOST=localhost
   DB_USER=root
   DB_PASSWORD=
   DB_NAME=devcards
   PORT=3333
   ```

## Installazione e avvio

Dalla cartella principale del progetto:

```bash
# 1. Installa le dipendenze del backend
npm install

# 2. Installa le dipendenze del frontend e crea la build di produzione
cd frontend
npm install
npm run build
cd ..

# 3. Avvia il server (serve API + frontend compilato)
npm start
```

Apri il browser su `http://localhost:3333`.

In alternativa, in un colpo solo (installa tutto e compila il frontend):

```bash
npm run setup
npm start
```

## Sviluppo del frontend (hot reload)

Per lavorare sul frontend con ricaricamento automatico, avvia il backend
(`npm start`) e in un secondo terminale:

```bash
cd frontend
npm start   # ng serve su http://localhost:4200
```

In sviluppo imposta l'URL del backend in `frontend/src/environments/environment.ts`
(`apiUrl: 'http://localhost:3333'`) per puntare alle API Express.
Per la build di produzione lascia `apiUrl: ''` (percorsi relativi).

## Funzionalità

- Registrazione/login candidato o datore, recupero e cambio password
- Candidato: compilazione CV/DevCard con mappa di residenza, lingue, contatti;
  DevCard con QR verso il profilo pubblico; gestione offerte di colloquio ricevute
- Datore: profilo azienda con mappa, discovery dei candidati in stile swipe,
  preferiti con filtri, proposta di colloqui, elenco proposte inviate
- Profilo pubblico del candidato accessibile via QR code

## Risoluzione problemi

- **La pagina mostra "Frontend non ancora compilato"**: devi creare la build
  Angular. Esegui `cd frontend && npm install && npm run build`, poi `npm start`
  dalla cartella principale.
- **`npm install` nel frontend dà errori di peer dependencies**: riprova con
  `npm install --legacy-peer-deps`.
- **Pagina bianca dopo la build**: apri la console del browser (F12). Verifica
  che MySQL sia avviato e che il database `devcards` esista (importa
  `database.sql`). Controlla che `.env` punti al database corretto.
- **Le API rispondono 404**: assicurati di aprire il sito tramite il server
  Express (`http://localhost:3333`) e non tramite `ng serve`, a meno di aver
  impostato `apiUrl` in `environment.ts`.
- **Versione di Node**: usa Node.js 18 o 20 (LTS).
