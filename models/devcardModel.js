// Model per le interazioni datore-candidato e per i feed di DevCards.
const db = require('../db');

const DevcardModel = {
  // Feed di candidati per un datore: esclude chi è già stato visto (save/skip)
  // e chi ha un colloquio già accettato/rifiutato.
  async getFeed(employerId) {
    const query = `
      SELECT u.id, u.nome, u.cognome, u.eta, u.anni_esperienza, u.max_distanza_km, u.citta, u.lat, u.lon, u.email, u.foto_profilo,
             c.bio, c.competenze, c.linguaggi, c.telefono, c.instagram, c.linkedin, c.github,
             c.luogo_preferito, c.disponibile_ovunque, c.competenze_linguistiche, c.smartworking
      FROM users u
      LEFT JOIN cvs c ON u.id = c.user_id
      WHERE u.ruolo = 'candidato'
      AND u.id NOT IN (
          SELECT candidate_id FROM employer_interactions WHERE employer_id = ?
      )
      AND u.id NOT IN (
          SELECT candidate_id FROM interview_requests
          WHERE employer_id = ? AND status IN ('accepted', 'rejected')
      )
      ORDER BY RANDOM()
    `;
    const [rows] = await db.execute(query, [employerId, employerId]);
    return rows;
  },

  // Candidati salvati dal datore, con filtri opzionali
  async getSaved(employerId, filters = {}) {
    let query = `
      SELECT u.id, u.nome, u.cognome, u.eta, u.anni_esperienza, u.max_distanza_km, u.citta, u.lat, u.lon, u.email, u.foto_profilo,
             c.bio, c.competenze, c.linguaggi, c.telefono, c.instagram, c.linkedin, c.github,
             c.luogo_preferito, c.disponibile_ovunque, c.competenze_linguistiche, c.smartworking
      FROM users u
      LEFT JOIN cvs c ON u.id = c.user_id
      INNER JOIN employer_interactions ei ON u.id = ei.candidate_id
      WHERE ei.employer_id = ? AND ei.action = 'save'
    `;
    const params = [employerId];

    if (filters.citta) {
      query += ' AND u.citta LIKE ?';
      params.push(`%${filters.citta}%`);
    }
    if (filters.anniExpMin) {
      query += ' AND u.anni_esperienza >= ?';
      params.push(filters.anniExpMin);
    }
    if (filters.linguaggio) {
      query += ' AND c.linguaggi LIKE ?';
      params.push(`%${filters.linguaggio}%`);
    }
    if (filters.lingua) {
      query += ' AND c.competenze_linguistiche LIKE ?';
      params.push(`%${filters.lingua}%`);
    }

    query += ' ORDER BY ei.created_at DESC';

    const [rows] = await db.execute(query, params);
    return rows;
  },

  // Registra o aggiorna un'interazione (save/skip)
  async upsertInteraction(employerId, candidateId, action) {
    await db.execute(
      `INSERT INTO employer_interactions (employer_id, candidate_id, action)
       VALUES (?, ?, ?)
       ON CONFLICT(employer_id, candidate_id) DO UPDATE SET action = excluded.action`,
      [employerId, candidateId, action]
    );
  },

  // Rimuove un candidato dai preferiti
  async removeSave(employerId, candidateId) {
    await db.execute(
      "DELETE FROM employer_interactions WHERE employer_id = ? AND candidate_id = ? AND action = 'save'",
      [employerId, candidateId]
    );
  },
};

module.exports = DevcardModel;
