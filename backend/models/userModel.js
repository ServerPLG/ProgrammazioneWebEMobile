// Model della tabella "users".
const db = require('../db');

const UserModel = {
  async findByEmail(email) {
    return (await db.get('SELECT * FROM users WHERE email = ?', [email])) || null;
  },
  async findById(id) {
    return (await db.get('SELECT * FROM users WHERE id = ?', [id])) || null;
  },
  async findByIdAndRole(id, ruolo) {
    return (await db.get('SELECT * FROM users WHERE id = ? AND ruolo = ?', [id, ruolo])) || null;
  },
  async getCoords(id) {
    return (await db.get('SELECT lat, lon FROM users WHERE id = ?', [id])) || null;
  },
  async create(u) {
    const r = await db.run(
      'INSERT INTO users (nome, cognome, eta, anni_esperienza, citta, lat, lon, email, password, ruolo, foto_profilo) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
      [u.nome, u.cognome, u.eta || null, u.anni_esperienza || 0, u.citta || null, u.lat || null, u.lon || null, u.email, u.password, u.ruolo, u.foto_profilo || null]
    );
    return r.lastID;
  },
  async updatePasswordById(id, hash) {
    await db.run('UPDATE users SET password = ? WHERE id = ?', [hash, id]);
  },
  async updatePasswordByEmail(email, hash) {
    await db.run('UPDATE users SET password = ? WHERE email = ?', [hash, email]);
  },
  async updatePhoto(id, foto) {
    await db.run('UPDATE users SET foto_profilo = ? WHERE id = ?', [foto, id]);
  },
  async updateLocation(id, citta, lat, lon) {
    await db.run('UPDATE users SET citta = ?, lat = ?, lon = ? WHERE id = ?', [citta, lat, lon, id]);
  },
  async updateCoords(id, lat, lon) {
    await db.run('UPDATE users SET lat = ?, lon = ? WHERE id = ?', [lat, lon, id]);
  },
  // Dati pubblici di un datore (azienda).
  async getEmployerById(id) {
    return (await db.get(
      'SELECT id, nome, cognome, citta, lat, lon, nome_azienda, descrizione_azienda FROM users WHERE id = ? AND ruolo = ?',
      [id, 'datore']
    )) || null;
  },
  async updateEmployerProfile(id, nome_azienda, descrizione_azienda, citta, lat, lon) {
    await db.run(
      'UPDATE users SET nome_azienda = ?, descrizione_azienda = ?, citta = ?, lat = ?, lon = ? WHERE id = ?',
      [nome_azienda, descrizione_azienda, citta, lat, lon, id]
    );
  },
};

module.exports = UserModel;
