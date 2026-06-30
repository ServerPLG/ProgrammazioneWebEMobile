// Feed e preferiti delle DevCards (lato datore).
const DevcardModel = require('../models/devcardModel');
const UserModel = require('../models/userModel');
const { haversineDistance } = require('../utils/geo');

// Aggiunge "distanza" a ogni card: 'Remoto' (se ammesso) o "N km", altrimenti null.
function withDistance(cards, lat, lon, remoteLabel = false) {
  return cards.map((card) => {
    let distanza = null;
    if (remoteLabel && card.disponibile_ovunque) distanza = 'Remoto';
    else if (lat && lon && card.lat && card.lon) distanza = haversineDistance(lat, lon, card.lat, card.lon) + ' km';
    return { ...card, distanza };
  });
}

exports.getDevcards = async (req, res) => {
  try {
    const emp = await UserModel.getCoords(req.user.id);
    const cards = await DevcardModel.getFeed(req.user.id);
    res.json(withDistance(cards, emp?.lat, emp?.lon, true));
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Errore nel recupero delle DevCards' });
  }
};

exports.interact = async (req, res) => {
  try {
    const { candidate_id, action } = req.body;
    if (!candidate_id || !['save', 'skip'].includes(action)) return res.status(400).json({ error: 'Parametri non validi' });
    await DevcardModel.upsertInteraction(req.user.id, candidate_id, action);
    res.json({ message: 'Azione registrata' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Errore durante l'interazione" });
  }
};

exports.removeInteraction = async (req, res) => {
  try {
    const { candidate_id } = req.body;
    if (!candidate_id) return res.status(400).json({ error: 'Parametri mancanti' });
    await DevcardModel.removeSave(req.user.id, candidate_id);
    res.json({ message: 'Candidato rimosso dai preferiti' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Errore durante la rimozione' });
  }
};

exports.getSavedDevcards = async (req, res) => {
  try {
    const { linguaggio, citta, anniExpMin, lingua } = req.query;
    const emp = await UserModel.getCoords(req.user.id);
    const cards = await DevcardModel.getSaved(req.user.id, { linguaggio, citta, anniExpMin, lingua });
    res.json(withDistance(cards, emp?.lat, emp?.lon));
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Errore nel recupero delle DevCards salvate' });
  }
};
