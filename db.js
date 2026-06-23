// ---------------------------------------------------------------------------
// Connessione e accesso al database SQLite.
// SQLite e' un database leggero su singolo file: non richiede un server.
// Il file vive nella cartella del progetto e si configura con DB_FILE nel .env
// (default: database.sqlite).
// ---------------------------------------------------------------------------
const sqlite3 = require('sqlite3').verbose();
const path = require('path');
require('dotenv').config();

const DB_PATH = path.join(__dirname, process.env.DB_FILE || 'database.sqlite');

// Apertura della connessione al file del database.
const db = new sqlite3.Database(DB_PATH, (err) => {
    if (err) console.error('Errore connessione SQLite:', err.message);
});

// Abilita il rispetto delle foreign key (ON DELETE CASCADE),
// che in SQLite e' disattivato di default.
db.run('PRAGMA foreign_keys = ON');

// ---------------------------------------------------------------------------
// I metodi nativi di sqlite3 funzionano a callback: qui li avvolgo in Promise
// cosi' i Model possono usare async/await con un'API semplice e chiara.
//   - all() -> SELECT che restituisce piu' righe        -> array di righe
//   - get() -> SELECT che restituisce una sola riga      -> riga o undefined
//   - run() -> INSERT / UPDATE / DELETE                  -> { lastID, changes }
//   - exec() -> esecuzione di uno script con piu' query  -> void
// ---------------------------------------------------------------------------

// SELECT con piu' righe.
function all(sql, params = []) {
    return new Promise((resolve, reject) => {
        db.all(sql, params, (err, rows) => (err ? reject(err) : resolve(rows)));
    });
}

// SELECT con una sola riga (o undefined se non trovata).
function get(sql, params = []) {
    return new Promise((resolve, reject) => {
        db.get(sql, params, (err, row) => (err ? reject(err) : resolve(row)));
    });
}

// INSERT / UPDATE / DELETE. Uso una function (non arrow) per accedere a
// this.lastID (id generato) e this.changes (righe modificate).
function run(sql, params = []) {
    return new Promise((resolve, reject) => {
        db.run(sql, params, function (err) {
            if (err) return reject(err);
            resolve({ lastID: this.lastID, changes: this.changes });
        });
    });
}

// Esegue uno script con piu' statement (creazione tabelle e dati iniziali).
function exec(sql) {
    return new Promise((resolve, reject) => {
        db.exec(sql, (err) => (err ? reject(err) : resolve()));
    });
}

module.exports = { all, get, run, exec, raw: db };
