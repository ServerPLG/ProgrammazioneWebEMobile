// Model per la tabella "cvs" (curriculum del candidato).
const db = require('../db');

const CvModel = {
  // CV completo del candidato (join users + cvs) usato per la DevCard
  async getByUserId(userId) {
    const [rows] = await db.execute(
      `SELECT u.id, u.nome, u.cognome, u.eta, u.anni_esperienza, u.max_distanza_km, u.citta, u.lat, u.lon, u.email, u.foto_profilo,
              c.bio, c.competenze, c.linguaggi, c.telefono, c.instagram, c.linkedin, c.github,
              c.luogo_preferito, c.disponibile_ovunque, c.competenze_linguistiche, c.smartworking
       FROM users u
       LEFT JOIN cvs c ON u.id = c.user_id
       WHERE u.id = ? AND u.ruolo = 'candidato'`,
      [userId]
    );
    return rows[0] || null;
  },

  // Riga cvs grezza (per verificare se esiste già)
  async findByUserId(userId) {
    const [rows] = await db.execute('SELECT * FROM cvs WHERE user_id = ?', [userId]);
    return rows[0] || null;
  },

  // Inserimento minimale durante la registrazione
  async insertOnRegister(userId, bio, linguaggi, telefono, linkedin, github) {
    await db.execute(
      'INSERT INTO cvs (user_id, bio, linguaggi, telefono, linkedin, github) VALUES (?, ?, ?, ?, ?, ?)',
      [userId, bio || null, linguaggi || null, telefono || null, linkedin || null, github || null]
    );
  },

  // Inserimento CV completo
  async insert(c) {
    await db.execute(
      'INSERT INTO cvs (user_id, bio, competenze, linguaggi, telefono, instagram, linkedin, github, luogo_preferito, disponibile_ovunque, competenze_linguistiche, smartworking) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
      [c.user_id, c.bio, c.competenze, c.linguaggi, c.telefono, c.instagram, c.linkedin, c.github, c.luogo_preferito, c.disponibile_ovunque, c.competenze_linguistiche, c.smartworking]
    );
  },

  // Aggiornamento CV completo
  async update(c) {
    await db.execute(
      'UPDATE cvs SET bio=?, competenze=?, linguaggi=?, telefono=?, instagram=?, linkedin=?, github=?, luogo_preferito=?, disponibile_ovunque=?, competenze_linguistiche=?, smartworking=? WHERE user_id=?',
      [c.bio, c.competenze, c.linguaggi, c.telefono, c.instagram, c.linkedin, c.github, c.luogo_preferito, c.disponibile_ovunque, c.competenze_linguistiche, c.smartworking, c.user_id]
    );
  },
};

module.exports = CvModel;
