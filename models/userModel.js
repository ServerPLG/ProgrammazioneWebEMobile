// Model per la tabella "users" e operazioni di base sull'utente.
const db = require('../db');

const UserModel = {
  // Trova un utente dall'email
  async findByEmail(email) {
    const [rows] = await db.execute('SELECT * FROM users WHERE email = ?', [email]);
    return rows[0] || null;
  },

  // Trova un utente dall'id
  async findById(id) {
    const [rows] = await db.execute('SELECT * FROM users WHERE id = ?', [id]);
    return rows[0] || null;
  },

  // Trova un utente per id e ruolo (candidato/datore)
  async findByIdAndRole(id, ruolo) {
    const [rows] = await db.execute('SELECT * FROM users WHERE id = ? AND ruolo = ?', [id, ruolo]);
    return rows[0] || null;
  },

  // Solo le coordinate di un utente
  async getCoords(id) {
    const [rows] = await db.execute('SELECT lat, lon FROM users WHERE id = ?', [id]);
    return rows[0] || null;
  },

  // Crea un nuovo utente e restituisce l'id generato
  async create(u) {
    const [result] = await db.execute(
      'INSERT INTO users (nome, cognome, eta, anni_esperienza, max_distanza_km, citta, lat, lon, email, password, ruolo, foto_profilo) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
      [u.nome, u.cognome, u.eta || null, u.anni_esperienza || 0, u.max_distanza_km || null, u.citta || null, u.lat || null, u.lon || null, u.email, u.password, u.ruolo, u.foto_profilo || null]
    );
    return result.insertId;
  },

  async updatePasswordById(id, hash) {
    await db.execute('UPDATE users SET password = ? WHERE id = ?', [hash, id]);
  },

  async updatePasswordByEmail(email, hash) {
    await db.execute('UPDATE users SET password = ? WHERE email = ?', [hash, email]);
  },

  async updatePhoto(id, foto) {
    await db.execute('UPDATE users SET foto_profilo = ? WHERE id = ?', [foto, id]);
  },

  async updateLocation(id, citta, lat, lon) {
    await db.execute('UPDATE users SET citta = ?, lat = ?, lon = ? WHERE id = ?', [citta, lat, lon, id]);
  },

  async updateCoords(id, lat, lon) {
    await db.execute('UPDATE users SET lat = ?, lon = ? WHERE id = ?', [lat, lon, id]);
  },

  // Dati pubblici di un datore (azienda)
  async getEmployerById(id) {
    const [rows] = await db.execute(
      'SELECT id, nome, cognome, citta, lat, lon, nome_azienda, descrizione_azienda FROM users WHERE id = ? AND ruolo = ?',
      [id, 'datore']
    );
    return rows[0] || null;
  },

  async updateEmployerProfile(id, nome_azienda, descrizione_azienda, citta, lat, lon) {
    await db.execute(
      'UPDATE users SET nome_azienda = ?, descrizione_azienda = ?, citta = ?, lat = ?, lon = ? WHERE id = ?',
      [nome_azienda, descrizione_azienda, citta, lat, lon, id]
    );
  },
};

module.exports = UserModel;
