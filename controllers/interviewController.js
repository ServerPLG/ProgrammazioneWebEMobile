// Controller per le proposte di colloquio.
const InterviewModel = require('../models/interviewModel');
const UserModel = require('../models/userModel');
const { haversineDistance } = require('../utils/geo');
const { isFutureDateValue } = require('../utils/validators');

// 5. Proponi colloquio (dal datore)
exports.proposeInterview = async (req, res) => {
  try {
    const employer_id = req.user.id; // identità presa dal token JWT
    const { candidate_id, posizione_cercata, linguaggi_richiesti, range_stipendio, luogo, data_colloquio, ora_colloquio, luogo_colloquio } = req.body;
    if (!candidate_id || !posizione_cercata || !data_colloquio || !ora_colloquio || !luogo_colloquio) {
      return res.status(400).json({ error: 'Parametri mancanti' });
    }

    if (!isFutureDateValue(data_colloquio)) {
      return res.status(400).json({ error: 'La data del colloquio deve essere successiva a quella corrente' });
    }

    await InterviewModel.create({ employer_id, candidate_id, posizione_cercata, linguaggi_richiesti, range_stipendio, luogo, data_colloquio, ora_colloquio, luogo_colloquio });
    res.status(201).json({ message: 'Richiesta di colloquio inviata' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Errore nell'invio della richiesta" });
  }
};

// 6. Colloqui ricevuti da un candidato (con distanza dall'azienda)
exports.getCandidateInterviews = async (req, res) => {
  try {
    const candidate_id = req.user.id; // identità presa dal token JWT

    const rows = await InterviewModel.getByCandidate(candidate_id);

    const cand = await UserModel.getCoords(candidate_id);
    const candLat = cand?.lat;
    const candLon = cand?.lon;

    const result = rows.map(row => {
      let distanza = null;
      if (candLat && candLon && row.azienda_lat && row.azienda_lon) {
        distanza = haversineDistance(candLat, candLon, row.azienda_lat, row.azienda_lon) + ' km';
      }
      return { ...row, distanza };
    });

    res.json(result);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Errore nel recupero dei colloqui' });
  }
};

// 7. Accetta o Rifiuta un colloquio
exports.setInterviewStatus = async (req, res) => {
  try {
    const candidate_id = req.user.id; // identità presa dal token JWT
    const { interview_id, status } = req.body;
    if (!interview_id || !['accepted', 'rejected'].includes(status)) {
      return res.status(400).json({ error: 'Parametri non validi' });
    }

    // Aggiorna solo se il colloquio è effettivamente indirizzato a questo candidato.
    const result = await InterviewModel.updateStatus(interview_id, status, candidate_id);
    if (result.changes === 0) {
      return res.status(404).json({ error: 'Colloquio non trovato' });
    }
    res.json({ message: `Colloquio ${status === 'accepted' ? 'accettato' : 'rifiutato'}` });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Errore aggiornamento stato colloquio' });
  }
};

// 8.5 Colloqui inviati da un datore
exports.getEmployerInterviews = async (req, res) => {
  try {
    const employer_id = req.user.id; // identità presa dal token JWT

    const rows = await InterviewModel.getByEmployer(employer_id);
    res.json(rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Errore nel recupero dei colloqui' });
  }
};
