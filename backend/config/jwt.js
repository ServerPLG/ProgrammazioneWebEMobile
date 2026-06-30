// Configurazione centralizzata del JWT, usata dal controller (firma) e dal
// middleware (verifica), così il segreto è definito in un solo punto.
require('dotenv').config();

module.exports = {
  JWT_SECRET: process.env.JWT_SECRET || 'devcards-dev-secret-change-me',
  JWT_EXPIRES_IN: '24h',
};
