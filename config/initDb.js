// Inizializzazione del database. All'avvio:
//  1) crea sempre le tabelle se non esistono (operazione sicura/idempotente);
//  2) inserisce i dati iniziali SOLO la prima volta (se la tabella users e' vuota),
//     cosi' riavviare il server non duplica i dati di esempio.
// Lo schema e i dati stanno in "database.sqlite.sql", separati dal marcatore "DATI MOCK".
const fs = require('fs');
const path = require('path');
const db = require('../db');

async function initDatabase() {
  const sqlPath = path.join(__dirname, '..', 'database.sqlite.sql');
  const full = fs.readFileSync(sqlPath, 'utf8');

  // Divido lo script in due parti: schema (CREATE TABLE ...) e seed (INSERT ...).
  const marker = '-- DATI MOCK';
  const idx = full.indexOf(marker);
  const schemaSql = idx >= 0 ? full.slice(0, idx) : full;
  const seedSql = idx >= 0 ? full.slice(idx) : '';

  // 1) Creazione tabelle: sempre (CREATE TABLE IF NOT EXISTS).
  await db.exec(schemaSql);

  // 2) Seed: solo se non ci sono ancora utenti.
  const [rows] = await db.execute('SELECT COUNT(*) AS n FROM users');
  if (rows[0].n === 0 && seedSql.trim()) {
    await db.exec(seedSql);
  }
}

module.exports = initDatabase;
