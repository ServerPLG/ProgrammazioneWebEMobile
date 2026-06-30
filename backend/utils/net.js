const os = require('os');

// Primo IPv4 non interno (per QR/accesso in rete locale); 'localhost' se assente.
function localIp() {
  for (const list of Object.values(os.networkInterfaces())) {
    for (const i of list) if (i.family === 'IPv4' && !i.internal) return i.address;
  }
  return 'localhost';
}

module.exports = { localIp };
