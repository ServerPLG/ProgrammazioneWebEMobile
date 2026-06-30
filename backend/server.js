// Entry point: configura Express, monta le rotte API e avvia il server.
// Il frontend gira SEMPRE separatamente (ng serve con proxy.conf.json sulla
// porta 4200). Questo server espone solo le API: non serve mai il frontend.
const path = require('path');
const express = require('express');
const cors = require('cors');

// .env e' nella cartella principale del progetto (un livello sopra /backend).
// Se il file non esiste si usano comunque i valori di default piu' sotto.
require('dotenv').config({ path: path.join(__dirname, '..', '.env') });

const db = require('./db');
const initDatabase = require('./config/initDb');
const { localIp, localIpSync, candidateIps } = require('./utils/net');

const app = express();

app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(express.json({ limit: '50mb' })); // le foto profilo (base64) possono pesare

// Root: semplice health check, conferma che il backend e' attivo.
app.get('/', (req, res) => {
  res.json({ message: 'DevCards backend attivo' });
});

// API (tutte sotto /api). interviewRoutes prima di employerRoutes cosi'
// "/api/employer/interviews" ha precedenza su "/api/employer/:id".
app.use('/api', require('./routes/authRoutes'));
app.use('/api', require('./routes/cvRoutes'));
app.use('/api', require('./routes/devcardRoutes'));
app.use('/api', require('./routes/interviewRoutes'));
app.use('/api', require('./routes/employerRoutes'));
app.use('/api', require('./routes/miscRoutes'));

const PORT = process.env.PORT || 3000;

(async () => {
  try {
    await db.get('SELECT 1'); // verifica connessione DB prima di avviare
  } catch (err) {
    console.error(`ERRORE CONNESSIONE DATABASE (${process.env.DB_FILE || 'database.sqlite'}): ${err.message}`);
    console.error('Esegui "npm install" nella cartella backend.');
    process.exit(1);
  }
  await initDatabase(); // crea le tabelle se non esistono e inserisce i dati iniziali
  app.listen(PORT, '0.0.0.0', async () => {
    const lanIp = await localIp();
    console.log('DevCards server avviato.');
    console.log(`  Locale: http://localhost:${PORT}`);
    console.log(`  Rete:   http://${lanIp}:${PORT}`);
    // Elenco di tutti gli IP della macchina: se il QR non funziona dal telefono,
    // prova quello della tua scheda Wi-Fi tra questi.
    const all = candidateIps();
    if (all.length > 1) {
      console.log('  Altri IP rilevati (per QR/telefono sulla stessa Wi-Fi):');
      for (const c of all) console.log(`    - ${c.address}  (${c.name})`);
    }
  });
})();
