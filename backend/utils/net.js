const os = require('os');
const dgram = require('dgram');

// Nomi di adattatori "virtuali" da evitare per il QR: VirtualBox, VMware,
// Hyper-V/WSL (vEthernet), Docker, VPN, ecc. Sono raggiungibili solo dal PC,
// non dal telefono sulla Wi-Fi.
const VIRTUAL_HINTS =
  /(virtualbox|vmware|hyper-v|vethernet|wsl|docker|loopback|tailscale|zerotier|tun|tap|vpn|radmin|npcap|bluetooth)/i;

// Tutti gli IPv4 non interni, con il nome dell'adattatore.
function candidateIps() {
  const out = [];
  for (const [name, list] of Object.entries(os.networkInterfaces())) {
    for (const i of list || []) {
      if (i.family === 'IPv4' && !i.internal) {
        out.push({ name, address: i.address });
      }
    }
  }
  return out;
}

// Punteggio: preferiamo le reti domestiche tipiche e penalizziamo gli
// adattatori virtuali (che il telefono non puo' raggiungere).
function scoreIp(name, address) {
  let score = 0;
  if (/^192\.168\./.test(address)) score += 30;
  else if (/^10\./.test(address)) score += 20;
  else if (/^172\.(1[6-9]|2\d|3[01])\./.test(address)) score += 10;
  if (VIRTUAL_HINTS.test(name)) score -= 50;
  return score;
}

// Versione sincrona (euristica su os.networkInterfaces).
function localIpSync() {
  const cands = candidateIps();
  if (!cands.length) return 'localhost';
  cands.sort((a, b) => scoreIp(b.name, b.address) - scoreIp(a.name, a.address));
  return cands[0].address;
}

// Versione affidabile: chiede al sistema operativo quale IP locale userebbe per
// uscire verso la rete (UDP "connect" verso un IP pubblico: NON invia pacchetti,
// imposta solo la rotta). Cosi' si ottiene l'IP della vera scheda Wi-Fi/LAN
// anche con VirtualBox/WSL/Docker installati. Fallback: euristica sincrona.
function localIp() {
  return new Promise((resolve) => {
    let settled = false;
    const finish = (ip) => {
      if (settled) return;
      settled = true;
      resolve(ip && ip !== '0.0.0.0' ? ip : localIpSync());
    };
    try {
      const socket = dgram.createSocket('udp4');
      socket.once('error', () => {
        try { socket.close(); } catch (_) {}
        finish(null);
      });
      socket.connect(80, '8.8.8.8', () => {
        let ip = null;
        try { ip = socket.address().address; } catch (_) {}
        try { socket.close(); } catch (_) {}
        finish(ip);
      });
      setTimeout(() => finish(null), 400);
    } catch (_) {
      finish(null);
    }
  });
}

module.exports = { localIp, localIpSync, candidateIps };
