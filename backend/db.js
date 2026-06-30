// Connessione SQLite. Il file del DB sta nella cartella /backend (stessa di questo file).
// I metodi nativi a callback di sqlite3 sono avvolti in Promise per usare async/await:
//   all -> più righe | get -> una riga | run -> INSERT/UPDATE/DELETE | exec -> script.
const path = require('path');
const sqlite3 = require('sqlite3').verbose();
// .env è nella cartella principale del progetto (un livello sopra /backend).
require('dotenv').config({ path: path.join(__dirname, '..', '.env') });

const DB_PATH = path.join(__dirname, process.env.DB_FILE || 'database.sqlite');

const db = new sqlite3.Database(DB_PATH, (err) => {
  if (err) console.error('Errore connessione SQLite:', err.message);
});

db.run('PRAGMA foreign_keys = ON'); // foreign key (ON DELETE CASCADE), off di default in SQLite

function all(sql, params = []) {
  return new Promise((resolve, reject) => db.all(sql, params, (err, rows) => (err ? reject(err) : resolve(rows))));
}

function get(sql, params = []) {
  return new Promise((resolve, reject) => db.get(sql, params, (err, row) => (err ? reject(err) : resolve(row))));
}

// function (non arrow) per accedere a this.lastID / this.changes.
function run(sql, params = []) {
  return new Promise((resolve, reject) => {
    db.run(sql, params, function (err) {
      if (err) return reject(err);
      resolve({ lastID: this.lastID, changes: this.changes });
    });
  });
}

function exec(sql) {
  return new Promise((resolve, reject) => db.exec(sql, (err) => (err ? reject(err) : resolve())));
}

module.exports = { all, get, run, exec, raw: db };
