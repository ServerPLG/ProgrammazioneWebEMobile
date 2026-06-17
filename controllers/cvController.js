// Controller del CV/DevCard del candidato.
const CvModel = require('../models/cvModel');
const UserModel = require('../models/userModel');
const { geocodeCity } = require('../utils/geo');
const { isDataImage } = require('../utils/validators');

// 4. Get CV/Card del candidato (pubblico: usato anche dal profilo via QR)
exports.getCv = async (req, res) => {
  try {
    const { userId } = req.params;
    const card = await CvModel.getByUserId(userId);
    if (!card) return res.status(404).json({ error: 'Candidato non trovato' });
    res.json(card);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Errore nel recupero del CV' });
  }
};

// 4.5 Upsert CV
exports.saveCv = async (req, res) => {
  try {
    const { user_id, bio, competenze, linguaggi, telefono, instagram, linkedin, github, luogo_preferito, citta, lat, lon, disponibile_ovunque, competenze_linguistiche, smartworking, foto_profilo } = req.body;

    const user = await UserModel.findByIdAndRole(user_id, 'candidato');
    if (!user) return res.status(403).json({ error: 'Non autorizzato o utente non trovato' });

    let savedCitta = user.citta;
    let savedLat = user.lat;
    let savedLon = user.lon;

    if (citta) {
      savedCitta = citta;
      savedLat = lat;
      savedLon = lon;
      if (!savedLat || !savedLon) {
        const coords = await geocodeCity(citta);
        savedLat = coords.lat;
        savedLon = coords.lon;
      }
      await UserModel.updateLocation(user_id, savedCitta, savedLat, savedLon);
    } else if (luogo_preferito && !disponibile_ovunque) {
      const coords = await geocodeCity(luogo_preferito);
      if (coords.lat && coords.lon) {
        await UserModel.updateCoords(user_id, coords.lat, coords.lon);
        savedLat = coords.lat;
        savedLon = coords.lon;
      }
    }

    if (typeof foto_profilo === 'string' && foto_profilo.trim() !== '') {
      if (!isDataImage(foto_profilo)) {
        return res.status(400).json({ error: 'La foto profilo deve essere caricata da file' });
      }
      await UserModel.updatePhoto(user_id, foto_profilo.trim());
    }

    const cvData = { user_id, bio, competenze, linguaggi, telefono, instagram, linkedin, github, luogo_preferito, disponibile_ovunque, competenze_linguistiche, smartworking };
    const existingCv = await CvModel.findByUserId(user_id);

    if (existingCv) {
      await CvModel.update(cvData);
      res.json({ message: 'CV aggiornato con successo', foto_profilo, citta: savedCitta, lat: savedLat, lon: savedLon });
    } else {
      await CvModel.insert(cvData);
      res.json({ message: 'CV creato con successo', foto_profilo, citta: savedCitta, lat: savedLat, lon: savedLon });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Errore nel salvataggio del CV' });
  }
};
