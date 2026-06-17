// Middleware di autenticazione JWT.
// Verifica l'header "Authorization: Bearer <token>": se manca o non è valido
// risponde 401, altrimenti mette i dati utente decodificati in req.user.
const jwt = require('jsonwebtoken');
const { JWT_SECRET } = require('../config/jwt');

module.exports = function authenticateToken(req, res, next) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];
  if (!token) {
    return res.status(401).json({ error: 'Token di autenticazione mancante' });
  }
  jwt.verify(token, JWT_SECRET, (err, payload) => {
    if (err) {
      return res.status(401).json({ error: 'Token non valido o scaduto' });
    }
    req.user = payload; // { id, ruolo, email }
    next();
  });
};
