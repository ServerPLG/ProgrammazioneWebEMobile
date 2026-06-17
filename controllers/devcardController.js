// Controller per il feed/preferiti delle DevCards (lato datore).
const DevcardModel = require('../models/devcardModel');
const UserModel = require('../models/userModel');
const { haversineDistance } = require('../utils/geo');

// 3. Feed DevCards per il datore (con distanza calcolata)
exports.getDevcards = async (req, res) => {
  try {
    const { employer_id } = req.query;
    if (!employer_id) return res.status(400).json({ error: 'Manca employer_id' });

    const emp = await UserModel.getCoords(employer_id);
    const empLat = emp?.lat;
    const empLon = emp?.lon;

    const devcards = await DevcardModel.getFeed(employer_id);

    const result = devcards.map(card => {
      let distanza = null;
      if (card.disponibile_ovunque) {
        distanza = 'Remoto';
      } else if (empLat && empLon && card.lat && card.lon) {
        distanza = haversineDistance(empLat, empLon, card.lat, card.lon) + ' km';
      }
      return { ...card, distanza };
    });

    res.json(result);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Errore nel recupero delle DevCards' });
  }
};

// 3.5 Registrare Save o Skip
exports.interact = async (req, res) => {
  try {
    const { employer_id, candidate_id, action } = req.body;
    if (!employer_id || !candidate_id || !['save', 'skip'].includes(action)) {
      return res.status(400).json({ error: 'Parametri non validi' });
    }
    await DevcardModel.upsertInteraction(employer_id, candidate_id, action);
    res.json({ message: 'Azione registrata' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Errore durante l'interazione" });
  }
};

// 3.5.5 Rimuovere un candidato salvato
exports.removeInteraction = async (req, res) => {
  try {
    const { employer_id, candidate_id } = req.body;
    if (!employer_id || !candidate_id) {
      return res.status(400).json({ error: 'Parametri mancanti' });
    }
    await DevcardModel.removeSave(employer_id, candidate_id);
    res.json({ message: 'Candidato rimosso dai preferiti' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Errore durante la rimozione" });
  }
};

// 3.6 DevCards salvate (con filtri)
exports.getSavedDevcards = async (req, res) => {
  try {
    const { employer_id, linguaggio, citta, anniExpMin, lingua } = req.query;
    if (!employer_id) return res.status(400).json({ error: 'Manca employer_id' });

    const emp = await UserModel.getCoords(employer_id);
    const empLat = emp?.lat;
    const empLon = emp?.lon;

    const devcards = await DevcardModel.getSaved(employer_id, { linguaggio, citta, anniExpMin, lingua });

    const result = devcards.map(card => {
      let distanza = null;
      if (empLat && empLon && card.lat && card.lon) {
        distanza = haversineDistance(empLat, empLon, card.lat, card.lon) + ' km';
      }
      return { ...card, distanza };
    });

    res.json(result);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Errore nel recupero delle DevCards salvate' });
  }
};
