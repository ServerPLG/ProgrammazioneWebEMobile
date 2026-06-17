// Controller di autenticazione: registrazione, login (con JWT), recupero e
// cambio password.
const crypto = require('crypto');
const jwt = require('jsonwebtoken');
const { JWT_SECRET, JWT_EXPIRES_IN } = require('../config/jwt');
const UserModel = require('../models/userModel');
const CvModel = require('../models/cvModel');
const { geocodeCity } = require('../utils/geo');
const { isDataImage } = require('../utils/validators');

// 1. Registrazione
exports.register = async (req, res) => {
  try {
    let { nome, cognome, eta, anni_esperienza, max_distanza_km, citta, lat, lon, email, password, ruolo, foto_profilo, bio, linguaggi, telefono, linkedin, github } = req.body;

    if (typeof foto_profilo === 'string') {
      foto_profilo = foto_profilo.trim();
    }

    if (ruolo === 'candidato' && foto_profilo && !isDataImage(foto_profilo)) {
      return res.status(400).json({ error: 'La foto profilo deve essere caricata da file' });
    }

    // Se è un candidato senza foto, gli assegno un avatar generato
    if (ruolo === 'candidato' && (!foto_profilo || foto_profilo.trim() === '')) {
      foto_profilo = `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(nome + cognome)}&backgroundColor=e2e8f0`;
    }

    // Controllo email già registrata
    const existing = await UserModel.findByEmail(email);
    if (existing) {
      return res.status(400).json({ error: 'Email già registrata' });
    }

    // Se mancano le coordinate ma c'è la città, geocodifico
    if (citta && (!lat || !lon)) {
      const coords = await geocodeCity(citta);
      lat = coords.lat;
      lon = coords.lon;
    }

    const hashedPassword = crypto.createHash('sha256').update(password).digest('hex');

    const userId = await UserModel.create({
      nome, cognome, eta, anni_esperienza, max_distanza_km, citta, lat, lon,
      email, password: hashedPassword, ruolo, foto_profilo,
    });

    if (ruolo === 'candidato' && ((bio && bio.trim()) || (linguaggi && linguaggi.trim()) || (telefono && telefono.trim()) || (linkedin && linkedin.trim()) || (github && github.trim()))) {
      await CvModel.insertOnRegister(userId, bio, linguaggi, telefono, linkedin, github);
    }

    res.status(201).json({ message: 'Registrazione completata', userId });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Errore del server durante la registrazione' });
  }
};

// 2. Login (restituisce un token JWT)
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await UserModel.findByEmail(email);
    if (!user) {
      return res.status(400).json({ error: 'Credenziali non valide' });
    }

    const hashDaControllare = crypto.createHash('sha256').update(password).digest('hex');
    if (hashDaControllare !== user.password) {
      return res.status(400).json({ error: 'Credenziali non valide' });
    }

    const userData = {
      id: user.id, nome: user.nome, cognome: user.cognome,
      email: user.email, ruolo: user.ruolo,
      lat: user.lat, lon: user.lon, citta: user.citta,
      nome_azienda: user.nome_azienda,
      descrizione_azienda: user.descrizione_azienda
    };

    const token = jwt.sign(
      { id: user.id, ruolo: user.ruolo, email: user.email },
      JWT_SECRET,
      { expiresIn: JWT_EXPIRES_IN }
    );

    res.json({ message: 'Login effettuato', user: userData, token });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Errore del server durante il login' });
  }
};

// 2.5 Recupero password (simulato)
exports.recoverPassword = async (req, res) => {
  try {
    const { email } = req.body;
    const user = await UserModel.findByEmail(email);
    if (!user) {
      return res.status(404).json({ error: 'Email non trovata nel sistema' });
    }

    const newHash = crypto.createHash('sha256').update('123456').digest('hex');
    await UserModel.updatePasswordByEmail(email, newHash);

    res.json({ message: 'Password reimpostata a: 123456. Usala per accedere e poi cambiala.' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Errore durante il recupero password' });
  }
};

// 2.6 Cambio password (utente loggato)
exports.changePassword = async (req, res) => {
  try {
    const { user_id, old_password, new_password } = req.body;

    if (!user_id || !old_password || !new_password) {
      return res.status(400).json({ error: 'Tutti i campi sono obbligatori' });
    }
    if (new_password.length < 6) {
      return res.status(400).json({ error: 'La nuova password deve avere almeno 6 caratteri' });
    }

    const user = await UserModel.findById(user_id);
    if (!user) {
      return res.status(404).json({ error: 'Utente non trovato' });
    }

    const oldHash = crypto.createHash('sha256').update(old_password).digest('hex');
    if (oldHash !== user.password) {
      return res.status(400).json({ error: 'La password attuale non è corretta' });
    }

    const newHash = crypto.createHash('sha256').update(new_password).digest('hex');
    await UserModel.updatePasswordById(user_id, newHash);

    res.json({ message: 'Password modificata con successo!' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Errore durante il cambio password' });
  }
};
