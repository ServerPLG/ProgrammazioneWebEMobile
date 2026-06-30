// Dati e profilo dell'azienda (datore).
const UserModel = require('../models/userModel');
const { geocodeCity } = require('../utils/geo');

// Info azienda pubblica (pagina del candidato).
exports.getEmployer = async (req, res) => {
  try {
    const employer = await UserModel.getEmployerById(req.params.id);
    if (!employer) return res.status(404).json({ error: 'Azienda non trovata' });
    res.json(employer);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Errore nel recupero dati azienda' });
  }
};

exports.getEmployerProfile = async (req, res) => {
  try {
    const employer = await UserModel.getEmployerById(req.user.id);
    if (!employer) return res.status(404).json({ error: 'Datore non trovato' });
    res.json(employer);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Errore nel recupero del profilo azienda' });
  }
};

exports.saveEmployerProfile = async (req, res) => {
  try {
    const { nome_azienda, descrizione_azienda, citta, lat, lon } = req.body;
    const user = await UserModel.findByIdAndRole(req.user.id, 'datore');
    if (!user) return res.status(403).json({ error: 'Non autorizzato' });

    let finalLat = lat, finalLon = lon;
    if (citta && (!finalLat || !finalLon)) ({ lat: finalLat, lon: finalLon } = await geocodeCity(citta));
    await UserModel.updateEmployerProfile(req.user.id, nome_azienda, descrizione_azienda, citta, finalLat, finalLon);
    res.json({ message: 'Profilo azienda aggiornato con successo!', citta, lat: finalLat, lon: finalLon, nome_azienda, descrizione_azienda });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Errore nel salvataggio del profilo azienda' });
  }
};
