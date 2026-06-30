// Utilità varie del server.
const { localIp } = require('../utils/net');

// IP locale del server (per generare QR funzionanti in rete locale).
exports.getServerIp = async (req, res) => {
  try {
    res.json({ ip: localIp() });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Errore nel recupero dell'IP locale" });
  }
};
