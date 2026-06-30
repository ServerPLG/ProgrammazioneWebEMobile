# DevCards

App per il recruiting in stile "swipe": i candidati pubblicano una DevCard (un CV sintetico), i datori di lavoro scorrono i profili, li salvano o li scartano e propongono colloqui. Funziona da web e da mobile.

- **Frontend:** Angular 18 + Ionic 8 (+ Capacitor per Android). Gira su `http://localhost:4200`.
- **Backend:** Node.js + Express 5 + SQLite. Gira su `http://localhost:3000`.

In sviluppo i due processi girano insieme: il frontend chiama il backend tramite il proxy `/api -> :3000`.

## Requisiti

- [Node.js](https://nodejs.org/) LTS (versione 18 o 20) e npm.
- (Solo per la build mobile) Android Studio + JDK.

## Struttura del progetto

```
ProgrammazioneWebEMobile/
├── backend/      # API Express + database SQLite
├── frontend/     # app Angular + Ionic
├── README.md
└── documentazione-progetto-devcards.md   # documentazione completa
```

## Avvio rapido (sviluppo)

Servono **due terminali**.

### 1) Backend (porta 3000)

```bash
cd backend
npm install
npm start
```

Il database SQLite viene creato e popolato automaticamente al primo avvio (utenti di esempio).

### 2) Frontend (porta 4200)

```bash
cd frontend
npm install
npm start
```

Apri il browser su **http://localhost:4200**.

> Nota: il frontend ha bisogno del backend acceso. Lascia entrambi i terminali aperti.

## Credenziali demo

| Ruolo | Email | Password |
|---|---|---|
| Candidato | `candidato@candidato.it` | `1234` |
| Datore | `datore@datore.it` | `1234` |

## Configurazione (opzionale)

Il backend funziona con i valori di default, quindi il file `.env` non e' obbligatorio. Se vuoi personalizzarlo, copia `.env.example` in `.env` (nella cartella principale del progetto) e modifica i valori:

```
DB_FILE=database.sqlite
PORT=3000
JWT_SECRET=metti-qui-un-segreto-lungo-e-casuale
```

In produzione imposta sempre un `JWT_SECRET` tuo, lungo e casuale.

## Build di produzione (web)

```bash
cd frontend
npm run build      # genera la cartella frontend/www
```

## App mobile (Android, Capacitor)

```bash
cd frontend
npm run build
npx cap sync android
npx cap open android   # apre il progetto in Android Studio
```

Per l'app nativa, l'indirizzo del backend e' in `frontend/src/environments/` (`nativeApiUrl`):
- Emulatore Android: `http://10.0.2.2:3000`
- Telefono reale (stessa Wi-Fi): `http://IP-LAN-del-PC:3000`

## Documentazione

La documentazione tecnica completa (architettura, endpoint con esempi, descrizione di tutte le funzioni, schema del database) e' nel file [`documentazione-progetto-devcards.md`](documentazione-progetto-devcards.md).
