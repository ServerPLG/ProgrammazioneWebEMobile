// Controller per utilità varie del server.
const os = require('os');

// IP locale del server (serve a generare QR funzionanti in rete locale)
exports.getServerIp = (req, res) => {
  try {
    const interfaces = os.networkInterfaces();
    let localIp = 'localhost';
    for (const name of Object.keys(interfaces)) {
      for (const iface of interfaces[name]) {
        if (iface.family === 'IPv4' && !iface.internal) {
          localIp = iface.address;
          break;
        }
      }
    }
    res.json({ ip: localIp });
  } catch (error) {
    res.status(500).json({ error: 'Errore nel recupero dell\'IP locale' });
  }
};
