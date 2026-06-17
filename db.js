// Connessione al database SQLite (come spiegato a lezione: "npm install sqlite sqlite3").
// SQLite e' un DB leggero su singolo file, non serve un server come MySQL/XAMPP.
const sqlite3 = require('sqlite3').verbose();
const path = require('path');

// Serve per leggere le variabili dal file .env (es. il percorso del file DB).
require('dotenv').config();

// Il database vive in un unico file dentro la cartella del progetto.
// Si puo' cambiare percorso/nome con DB_FILE nel .env (default: database.sqlite).
const DB_PATH = path.join(__dirname, process.env.DB_FILE || 'database.sqlite');

// Apertura della connessione (come da slide: new sqlite3.Database(...)).
const db = new sqlite3.Database(DB_PATH, (err) => {
    if (err) console.error('Errore connessione SQLite:', err.message);
});

// Abilita il rispetto delle foreign key (ON DELETE CASCADE), che in SQLite
// e' disattivato di default.
db.run('PRAGMA foreign_keys = ON');

// ---------------------------------------------------------------------------
// Strato di compatibilita': i Model usano "const [rows] = await db.execute(sql, params)".
// Wrappo i metodi a callback di sqlite3 (db.all / db.run) in Promise e restituisco
// lo stesso formato di prima, cosi' i Model restano identici.
//   - SELECT  -> db.all  -> [ righe ]
//   - INSERT/UPDATE/DELETE -> db.run -> [ { insertId, affectedRows } ]
// ---------------------------------------------------------------------------
function execute(sql, params = []) {
    const isRead = /^\s*(SELECT|PRAGMA|WITH)/i.test(sql);
    return new Promise((resolve, reject) => {
        if (isRead) {
            db.all(sql, params, (err, rows) => {
                if (err) return reject(err);
                resolve([rows, []]);
            });
        } else {
            // function (non arrow) per accedere a this.lastID / this.changes
            db.run(sql, params, function (err) {
                if (err) return reject(err);
                resolve([{ insertId: this.lastID, affectedRows: this.changes }, []]);
            });
        }
    });
}

// Esegue uno script con piu' query (usato per creare le tabelle e i dati iniziali).
function exec(sql) {
    return new Promise((resolve, reject) => {
        db.exec(sql, (err) => (err ? reject(err) : resolve()));
    });
}

module.exports = { execute, exec, raw: db };
