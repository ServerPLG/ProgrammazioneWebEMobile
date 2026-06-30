// Proposte di colloquio.
const InterviewModel = require('../models/interviewModel');
const UserModel = require('../models/userModel');
const { haversineDistance } = require('../utils/geo');
const { isFutureDateValue } = require('../utils/validators');

exports.proposeInterview = async (req, res) => {
  try {
    const employer_id = req.user.id;
    const { candidate_id, posizione_cercata, linguaggi_richiesti, range_stipendio, luogo, data_colloquio, ora_colloquio, luogo_colloquio } = req.body;
    if (!candidate_id || !posizione_cercata || !data_colloquio || !ora_colloquio || !luogo_colloquio) return res.status(400).json({ error: 'Parametri mancanti' });
    if (!isFutureDateValue(data_colloquio)) return res.status(400).json({ error: 'La data del colloquio deve essere successiva a quella corrente' });
    await InterviewModel.create({ employer_id, candidate_id, posizione_cercata, linguaggi_richiesti, range_stipendio, luogo, data_colloquio, ora_colloquio, luogo_colloquio });
    res.status(201).json({ message: 'Richiesta di colloquio inviata' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Errore nell'invio della richiesta" });
  }
};

// Colloqui ricevuti dal candidato, con distanza dall'azienda.
exports.getCandidateInterviews = async (req, res) => {
  try {
    const rows = await InterviewModel.getByCandidate(req.user.id);
    const cand = await UserModel.getCoords(req.user.id);
    res.json(rows.map((row) => {
      let distanza = null;
      if (cand?.lat && cand?.lon && row.azienda_lat && row.azienda_lon) distanza = haversineDistance(cand.lat, cand.lon, row.azienda_lat, row.azienda_lon) + ' km';
      return { ...row, distanza };
    }));
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Errore nel recupero dei colloqui' });
  }
};

exports.setInterviewStatus = async (req, res) => {
  try {
    const { interview_id, status } = req.body;
    if (!interview_id || !['accepted', 'rejected'].includes(status)) return res.status(400).json({ error: 'Parametri non validi' });
    // Aggiorna solo se il colloquio è indirizzato a questo candidato.
    const result = await InterviewModel.updateStatus(interview_id, status, req.user.id);
    if (result.changes === 0) return res.status(404).json({ error: 'Colloquio non trovato' });
    res.json({ message: `Colloquio ${status === 'accepted' ? 'accettato' : 'rifiutato'}` });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Errore aggiornamento stato colloquio' });
  }
};

exports.getEmployerInterviews = async (req, res) => {
  try {
    res.json(await InterviewModel.getByEmployer(req.user.id));
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Errore nel recupero dei colloqui' });
  }
};
