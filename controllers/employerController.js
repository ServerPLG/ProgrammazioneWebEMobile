// Controller per i dati e il profilo dell'azienda (datore).
const UserModel = require('../models/userModel');
const { geocodeCity } = require('../utils/geo');

// 8. Info datore (per la pagina pubblica del candidato)
exports.getEmployer = async (req, res) => {
  try {
    const employer = await UserModel.getEmployerById(req.params.id);
    if (!employer) return res.status(404).json({ error: 'Azienda non trovata' });
    res.json(employer);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Errore nel recupero dati azienda' });
  }
};

// 9. Profilo Azienda: Get
exports.getEmployerProfile = async (req, res) => {
  try {
    const employer = await UserModel.getEmployerById(req.params.userId);
    if (!employer) return res.status(404).json({ error: 'Datore non trovato' });
    res.json(employer);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Errore nel recupero del profilo azienda' });
  }
};

// 9.5 Profilo Azienda: Salva/Aggiorna
exports.saveEmployerProfile = async (req, res) => {
  try {
    const { user_id, nome_azienda, descrizione_azienda, citta, lat, lon } = req.body;

    const user = await UserModel.findByIdAndRole(user_id, 'datore');
    if (!user) return res.status(403).json({ error: 'Non autorizzato' });

    let finalLat = lat;
    let finalLon = lon;
    if (citta && (!finalLat || !finalLon)) {
      const coords = await geocodeCity(citta);
      finalLat = coords.lat;
      finalLon = coords.lon;
    }

    await UserModel.updateEmployerProfile(user_id, nome_azienda, descrizione_azienda, citta, finalLat, finalLon);

    res.json({ message: 'Profilo azienda aggiornato con successo!', citta, lat: finalLat, lon: finalLon, nome_azienda, descrizione_azienda });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Errore nel salvataggio del profilo azienda' });
  }
};
