// Autenticazione JWT: legge "Authorization: Bearer <token>"; se manca o non è
// valido risponde 401, altrimenti mette il payload decodificato in req.user.
const jwt = require('jsonwebtoken');
const { JWT_SECRET } = require('../config/jwt');

module.exports = function authenticateToken(req, res, next) {
  const token = (req.headers['authorization'] || '').split(' ')[1];
  if (!token) return res.status(401).json({ error: 'Token di autenticazione mancante' });
  jwt.verify(token, JWT_SECRET, (err, payload) => {
    if (err) return res.status(401).json({ error: 'Token non valido o scaduto' });
    req.user = payload; // { id, ruolo, email }
    next();
  });
};
