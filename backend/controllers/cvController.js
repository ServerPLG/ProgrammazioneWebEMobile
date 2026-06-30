// CV/DevCard del candidato.
const CvModel = require('../models/cvModel');
const UserModel = require('../models/userModel');
const { geocodeCity } = require('../utils/geo');
const { isDataImage } = require('../utils/validators');

// Lettura pubblica (anche dal profilo via QR).
exports.getCv = async (req, res) => {
  try {
    const card = await CvModel.getByUserId(req.params.userId);
    if (!card) return res.status(404).json({ error: 'Candidato non trovato' });
    res.json(card);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Errore nel recupero del CV' });
  }
};

// Crea o aggiorna il CV del candidato loggato (identità dal token JWT).
exports.saveCv = async (req, res) => {
  try {
    const user_id = req.user.id;
    const { bio, competenze, linguaggi, telefono, instagram, linkedin, github, luogo_preferito, citta, lat, lon, disponibile_ovunque, competenze_linguistiche, smartworking, foto_profilo } = req.body;

    const user = await UserModel.findByIdAndRole(user_id, 'candidato');
    if (!user) return res.status(403).json({ error: 'Non autorizzato o utente non trovato' });

    let savedCitta = user.citta, savedLat = user.lat, savedLon = user.lon;
    if (citta) {
      savedCitta = citta; savedLat = lat; savedLon = lon;
      if (!savedLat || !savedLon) ({ lat: savedLat, lon: savedLon } = await geocodeCity(citta));
      await UserModel.updateLocation(user_id, savedCitta, savedLat, savedLon);
    } else if (luogo_preferito && !disponibile_ovunque) {
      const coords = await geocodeCity(luogo_preferito);
      if (coords.lat && coords.lon) {
        await UserModel.updateCoords(user_id, coords.lat, coords.lon);
        savedLat = coords.lat; savedLon = coords.lon;
      }
    }

    if (typeof foto_profilo === 'string' && foto_profilo.trim() !== '') {
      if (!isDataImage(foto_profilo)) return res.status(400).json({ error: 'La foto profilo deve essere caricata da file' });
      await UserModel.updatePhoto(user_id, foto_profilo.trim());
    }

    const cvData = { user_id, bio, competenze, linguaggi, telefono, instagram, linkedin, github, luogo_preferito, disponibile_ovunque, competenze_linguistiche, smartworking };
    const exists = await CvModel.findByUserId(user_id);
    if (exists) await CvModel.update(cvData); else await CvModel.insert(cvData);
    res.json({ message: exists ? 'CV aggiornato con successo' : 'CV creato con successo', foto_profilo, citta: savedCitta, lat: savedLat, lon: savedLon });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Errore nel salvataggio del CV' });
  }
};
