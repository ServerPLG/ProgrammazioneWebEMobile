// Autenticazione: registrazione, login (JWT), recupero e cambio password.
const crypto = require('crypto');
const jwt = require('jsonwebtoken');
const { JWT_SECRET, JWT_EXPIRES_IN } = require('../config/jwt');
const UserModel = require('../models/userModel');
const CvModel = require('../models/cvModel');
const { geocodeCity } = require('../utils/geo');
const { isDataImage } = require('../utils/validators');

const sha256 = (s) => crypto.createHash('sha256').update(s).digest('hex');

exports.register = async (req, res) => {
  try {
    let { nome, cognome, eta, anni_esperienza, citta, lat, lon, email, password, ruolo, foto_profilo, bio, linguaggi, telefono, linkedin, github } = req.body;
    if (typeof foto_profilo === 'string') foto_profilo = foto_profilo.trim();

    if (ruolo === 'candidato' && foto_profilo && !isDataImage(foto_profilo)) {
      return res.status(400).json({ error: 'La foto profilo deve essere caricata da file' });
    }
    // Candidato senza foto: avatar generato.
    if (ruolo === 'candidato' && !foto_profilo) {
      foto_profilo = `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(nome + cognome)}&backgroundColor=e2e8f0`;
    }
    if (await UserModel.findByEmail(email)) {
      return res.status(400).json({ error: 'Email già registrata' });
    }
    if (citta && (!lat || !lon)) ({ lat, lon } = await geocodeCity(citta));

    const userId = await UserModel.create({ nome, cognome, eta, anni_esperienza, citta, lat, lon, email, password: sha256(password), ruolo, foto_profilo });

    if (ruolo === 'candidato' && [bio, linguaggi, telefono, linkedin, github].some((v) => v && v.trim())) {
      await CvModel.insertOnRegister(userId, bio, linguaggi, telefono, linkedin, github);
    }
    res.status(201).json({ message: 'Registrazione completata', userId });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Errore del server durante la registrazione' });
  }
};

exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await UserModel.findByEmail(email);
    if (!user || sha256(password) !== user.password) {
      return res.status(400).json({ error: 'Credenziali non valide' });
    }
    const userData = {
      id: user.id, nome: user.nome, cognome: user.cognome, email: user.email, ruolo: user.ruolo,
      lat: user.lat, lon: user.lon, citta: user.citta,
      nome_azienda: user.nome_azienda, descrizione_azienda: user.descrizione_azienda,
    };
    const token = jwt.sign({ id: user.id, ruolo: user.ruolo, email: user.email }, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });
    res.json({ message: 'Login effettuato', user: userData, token });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Errore del server durante il login' });
  }
};

exports.recoverPassword = async (req, res) => {
  try {
    const { email } = req.body;
    const user = await UserModel.findByEmail(email);
    if (!user) return res.status(404).json({ error: 'Email non trovata nel sistema' });
    await UserModel.updatePasswordByEmail(email, sha256('123456'));
    res.json({ message: 'Password reimpostata a: 123456. Usala per accedere e poi cambiala.' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Errore durante il recupero password' });
  }
};

exports.changePassword = async (req, res) => {
  try {
    const { old_password, new_password } = req.body;
    if (!old_password || !new_password) return res.status(400).json({ error: 'Tutti i campi sono obbligatori' });
    if (new_password.length < 6) return res.status(400).json({ error: 'La nuova password deve avere almeno 6 caratteri' });

    const user = await UserModel.findById(req.user.id);
    if (!user) return res.status(404).json({ error: 'Utente non trovato' });
    if (sha256(old_password) !== user.password) return res.status(400).json({ error: 'La password attuale non è corretta' });

    await UserModel.updatePasswordById(req.user.id, sha256(new_password));
    res.json({ message: 'Password modificata con successo!' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Errore durante il cambio password' });
  }
};
