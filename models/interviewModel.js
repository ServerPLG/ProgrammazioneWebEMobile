// Model per la tabella "interview_requests" (proposte di colloquio).
const db = require('../db');

const InterviewModel = {
  async create(i) {
    await db.execute(
      'INSERT INTO interview_requests (employer_id, candidate_id, posizione_cercata, linguaggi_richiesti, range_stipendio, luogo, data_colloquio, ora_colloquio, luogo_colloquio) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)',
      [i.employer_id, i.candidate_id, i.posizione_cercata, i.linguaggi_richiesti, i.range_stipendio, i.luogo, i.data_colloquio, i.ora_colloquio, i.luogo_colloquio]
    );
  },

  // Colloqui ricevuti da un candidato (con dati azienda)
  async getByCandidate(candidateId) {
    const [rows] = await db.execute(
      `SELECT ir.*,
              u.nome AS azienda_nome, u.cognome AS azienda_cognome, u.citta AS azienda_citta,
              u.lat AS azienda_lat, u.lon AS azienda_lon, u.nome_azienda, u.descrizione_azienda
       FROM interview_requests ir
       JOIN users u ON ir.employer_id = u.id
       WHERE ir.candidate_id = ?
       ORDER BY ir.created_at DESC`,
      [candidateId]
    );
    return rows;
  },

  // Colloqui inviati da un datore (con dati candidato)
  async getByEmployer(employerId) {
    const [rows] = await db.execute(
      `SELECT ir.*,
              u.nome AS candidato_nome, u.cognome AS candidato_cognome, u.citta AS candidato_citta, u.foto_profilo
       FROM interview_requests ir
       JOIN users u ON ir.candidate_id = u.id
       WHERE ir.employer_id = ?
       ORDER BY ir.created_at DESC`,
      [employerId]
    );
    return rows;
  },

  async updateStatus(interviewId, status) {
    await db.execute('UPDATE interview_requests SET status = ? WHERE id = ?', [status, interviewId]);
  },
};

module.exports = InterviewModel;
