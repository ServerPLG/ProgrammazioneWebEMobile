// Model della tabella "cvs" (curriculum del candidato).
const db = require('../db');

const CvModel = {
  // CV completo (join users + cvs) per la DevCard.
  async getByUserId(userId) {
    return (await db.get(
      `SELECT u.id, u.nome, u.cognome, u.eta, u.anni_esperienza, u.citta, u.lat, u.lon, u.email, u.foto_profilo,
              c.bio, c.competenze, c.linguaggi, c.telefono, c.instagram, c.linkedin, c.github,
              c.luogo_preferito, c.disponibile_ovunque, c.competenze_linguistiche, c.smartworking
       FROM users u LEFT JOIN cvs c ON u.id = c.user_id
       WHERE u.id = ? AND u.ruolo = 'candidato'`,
      [userId]
    )) || null;
  },
  async findByUserId(userId) {
    return (await db.get('SELECT * FROM cvs WHERE user_id = ?', [userId])) || null;
  },
  // Inserimento minimale in fase di registrazione.
  async insertOnRegister(userId, bio, linguaggi, telefono, linkedin, github) {
    await db.run(
      'INSERT INTO cvs (user_id, bio, linguaggi, telefono, linkedin, github) VALUES (?, ?, ?, ?, ?, ?)',
      [userId, bio || null, linguaggi || null, telefono || null, linkedin || null, github || null]
    );
  },
  async insert(c) {
    await db.run(
      'INSERT INTO cvs (user_id, bio, competenze, linguaggi, telefono, instagram, linkedin, github, luogo_preferito, disponibile_ovunque, competenze_linguistiche, smartworking) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
      [c.user_id, c.bio, c.competenze, c.linguaggi, c.telefono, c.instagram, c.linkedin, c.github, c.luogo_preferito, c.disponibile_ovunque, c.competenze_linguistiche, c.smartworking]
    );
  },
  async update(c) {
    await db.run(
      'UPDATE cvs SET bio=?, competenze=?, linguaggi=?, telefono=?, instagram=?, linkedin=?, github=?, luogo_preferito=?, disponibile_ovunque=?, competenze_linguistiche=?, smartworking=? WHERE user_id=?',
      [c.bio, c.competenze, c.linguaggi, c.telefono, c.instagram, c.linkedin, c.github, c.luogo_preferito, c.disponibile_ovunque, c.competenze_linguistiche, c.smartworking, c.user_id]
    );
  },
};

module.exports = CvModel;
