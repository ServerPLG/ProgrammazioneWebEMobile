// All'avvio crea le tabelle (sempre, idempotente) e inserisce i dati iniziali
// solo la prima volta (se "users" è vuota). Schema e seed stanno in
// "database.sqlite.sql", separati dal marcatore "-- DATI MOCK".
const fs = require('fs');
const path = require('path');
const db = require('../db');

async function initDatabase() {
  const full = fs.readFileSync(path.join(__dirname, '..', 'database.sqlite.sql'), 'utf8');
  const idx = full.indexOf('-- DATI MOCK');
  const schemaSql = idx >= 0 ? full.slice(0, idx) : full;
  const seedSql = idx >= 0 ? full.slice(idx) : '';

  await db.exec(schemaSql);
  const row = await db.get('SELECT COUNT(*) AS n FROM users');
  if (row.n === 0 && seedSql.trim()) await db.exec(seedSql);
}

module.exports = initDatabase;
