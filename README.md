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

Il dev server e' configurato per restare in ascolto su tutte le interfacce di rete (`--host 0.0.0.0`), quindi e' raggiungibile anche da altri dispositivi sulla stessa Wi-Fi all'indirizzo **http://IP-LAN-del-PC:4200**. E' cosi' che il QR della DevCard funziona quando viene scansionato dal telefono.

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

## Stampa della DevCard

Dalla home del candidato il pulsante **Stampa DevCard** apre la finestra di stampa del browser e produce **due pagine** in formato biglietto da visita (55x85 mm): il **fronte** della card e il **retro** con il QR del profilo pubblico. Per stampare correttamente, nelle opzioni di stampa imposta margini "Nessuno" e, se serve, disattiva intestazioni/pie' di pagina del browser.

## Risoluzione problemi

**Il QR non si apre dal telefono ("sito irraggiungibile").**
- Assicurati di aver **riavviato** sia il backend sia il frontend dopo gli aggiornamenti (le modifiche al dev server hanno effetto solo al riavvio).
- PC e telefono devono essere sulla **stessa rete Wi-Fi** (non una rete "ospiti"/guest, che spesso isola i dispositivi tra loro).
- All'avvio il backend stampa in console l'IP di rete e l'elenco di tutti gli IP della macchina: il QR deve usare l'IP della tua scheda **Wi-Fi** (di solito `192.168.x.x`).
- **Firewall di Windows**: alla prima esecuzione consenti a Node l'accesso alle **reti private** (porte `4200` e `3000`). E' la causa piu' frequente quando l'IP e' gia' corretto.

## Documentazione

La documentazione tecnica completa (architettura, endpoint con esempi, descrizione di tutte le funzioni, schema del database) e' nel file [`documentazione-progetto-devcards.md`](documentazione-progetto-devcards.md).
