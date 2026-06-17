// =============================
// Entry point del server (struttura MVC)
// server.js si occupa solo di: configurare Express, servire il frontend,
// montare le rotte (routes -> controllers -> models) e avviare il server.
// =============================
const express = require('express');
const cors = require('cors');
require('dotenv').config();
const os = require('os');
const path = require('path');
const fs = require('fs');

const db = require('./db');
const initDatabase = require('./config/initDb');

// Rotte (ognuna delega al proprio controller)
const authRoutes = require('./routes/authRoutes');
const cvRoutes = require('./routes/cvRoutes');
const devcardRoutes = require('./routes/devcardRoutes');
const interviewRoutes = require('./routes/interviewRoutes');
const employerRoutes = require('./routes/employerRoutes');
const miscRoutes = require('./routes/miscRoutes');

const app = express();

// Cartella con la build dell'app Angular + Ionic (generata da "npm run build")
const FRONTEND_DIR = path.join(__dirname, 'frontend', 'www');

// ---- Middleware globali ----
app.use(cors());
app.use(express.json({ limit: '50mb' })); // Le foto profilo (base64) possono pesare
app.use(express.static(FRONTEND_DIR));

// ---- API (montate tutte sotto /api) ----
// NB: interviewRoutes va PRIMA di employerRoutes, così "/api/employer/interviews"
// viene gestita prima di "/api/employer/:id".
app.use('/api', authRoutes);
app.use('/api', cvRoutes);
app.use('/api', devcardRoutes);
app.use('/api', interviewRoutes);
app.use('/api', employerRoutes);
app.use('/api', miscRoutes);

// ---- Fallback SPA (Angular Router) ----
// Qualsiasi GET non /api restituisce index.html così funzionano deep link, refresh e QR.
app.use((req, res, next) => {
  if (req.method === 'GET' && !req.path.startsWith('/api')) {
    const indexPath = path.join(FRONTEND_DIR, 'index.html');
    if (!fs.existsSync(indexPath)) {
      return res.status(503).send(
        '<html lang="it"><head><meta charset="utf-8"><title>DevCards</title></head>' +
        '<body style="font-family:sans-serif;max-width:640px;margin:60px auto;line-height:1.6">' +
        '<h1>Frontend non ancora compilato</h1>' +
        '<p>La cartella <code>frontend/www</code> non esiste. Compila l\'app Angular + Ionic:</p>' +
        '<pre style="background:#f4f4f4;padding:16px;border-radius:8px">cd frontend\nnpm install\nnpm run build</pre>' +
        '<p>Poi riavvia il server con <code>npm start</code> e ricarica la pagina.</p>' +
        '</body></html>'
      );
    }
    return res.sendFile(indexPath);
  }
  next();
});

// ---- Avvio ----
const PORT = process.env.PORT || 3000;
const DB_FILE = process.env.DB_FILE || 'database.sqlite';

async function startServer() {
  // Testo la connessione al database prima di avviare il server
  try {
    await db.execute('SELECT 1');
  } catch (err) {
    console.error('\n╔══════════════════════════════════════════════════╗');
    console.error('║     ERRORE CONNESSIONE DATABASE                  ║');
    console.error('╚══════════════════════════════════════════════════╝');
    console.error(`  File DB: ${DB_FILE}`);
    console.error(`  Errore: ${err.message}\n`);
    console.error('  💡 Controlla che il pacchetto sqlite3 sia installato');
    console.error('     (esegui "npm install" nella cartella del progetto).\n');
    process.exit(1);
  }

  // Creo le tabelle se non esistono
  await initDatabase();

  // Trovo l'IP locale per mostrarlo nel terminale
  const interfaces = os.networkInterfaces();
  let localIp = 'localhost';
  for (const name of Object.keys(interfaces)) {
    for (const iface of interfaces[name]) {
      if (iface.family === 'IPv4' && !iface.internal) {
        localIp = iface.address;
        break;
      }
    }
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.clear();
    console.log('╔══════════════════════════════════════════════════╗');
    console.log('║               DevCards Server Avviato            ║');
    console.log('╚══════════════════════════════════════════════════╝');
    console.log();
    console.log(`  ✅ Database:   SQLite (${DB_FILE})`);
    console.log(`  🌐 Locale:     http://localhost:${PORT}`);
    console.log(`  📡 Rete:       http://${localIp}:${PORT}`);
    console.log();
    console.log('  Premi Ctrl+C per fermare il server.');
    console.log('──────────────────────────────────────────────────');
  });
}

startServer();
