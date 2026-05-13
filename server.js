// Importo le librerie che mi servono (installate con npm install)
const express = require('express'); // Serve per creare il server web, il prof ha detto di usare questo
const cors = require('cors'); // Boh serve per non avere errori rossi nel browser quando chiamo le API
const crypto = require('crypto'); // Uso crypto di base per fare un hash semplice (niente cose complicate come bcrypt)
require('dotenv').config(); // Per caricare il file .env con la password del database
const db = require('./db'); // Importo il mio file db.js dove mi connetto al database mysql
const fs = require('fs');
const path = require('path');
const app = express(); // Inizializzo l'app, sempre così si fa

// Middleware (robe che vengono eseguite prima delle richieste)
app.use(cors()); // Attivo cors per tutti
app.use(express.json({ limit: '50mb' })); // Permetto di inviare JSON fino a 50mb perchè le foto pesano
// Dico ad express di servire la cartella frontend dove c'è il sito html
app.use(express.static('frontend'));

// Crea tabelle se non esistono
db.execute(`
    CREATE TABLE IF NOT EXISTS employer_interactions (
        employer_id INT,
        candidate_id INT,
        action ENUM('save', 'skip'),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        PRIMARY KEY (employer_id, candidate_id),
        FOREIGN KEY (employer_id) REFERENCES users(id) ON DELETE CASCADE,
        FOREIGN KEY (candidate_id) REFERENCES users(id) ON DELETE CASCADE
    )
`).catch(err => console.error("Errore creazione tabella interazioni:", err));

db.execute(`
    CREATE TABLE IF NOT EXISTS interview_requests (
        id INT AUTO_INCREMENT PRIMARY KEY,
        employer_id INT NOT NULL,
        candidate_id INT NOT NULL,
        posizione_cercata TEXT NOT NULL,
        linguaggi_richiesti VARCHAR(255),
        range_stipendio VARCHAR(100),
        luogo VARCHAR(200),
        status ENUM('pending', 'accepted', 'rejected') DEFAULT 'pending',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (employer_id) REFERENCES users(id) ON DELETE CASCADE,
        FOREIGN KEY (candidate_id) REFERENCES users(id) ON DELETE CASCADE
    )
`).catch(err => console.error("Errore creazione tabella interview_requests:", err));

// =============================
// HELPER: Geocoding con OpenStreetMap Nominatim
// =============================
async function geocodeCity(cityName) {
    try {
        const url = `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(cityName)}&format=json&limit=1`;
        const response = await fetch(url, {
            headers: { 'User-Agent': 'DevCards/1.0 (university-project)' }
        });
        const data = await response.json();
        if (data && data.length > 0) {
            return { lat: parseFloat(data[0].lat), lon: parseFloat(data[0].lon) };
        }
    } catch (err) {
        console.error("Errore geocoding:", err);
    }
    return { lat: null, lon: null };
}

// =============================
// HELPER: Calcolo distanza Haversine (in KM)
// =============================
function haversineDistance(lat1, lon1, lat2, lon2) {
    const R = 6371; // Raggio della Terra in km
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
        Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return Math.round(R * c);
}

// =============================
// ROUTES (le API che il frontend chiama)
// =============================

// 1. Registrazione (quando uno si iscrive)
app.post('/api/register', async (req, res) => {
    try {
        // Prendo tutti i dati dal body della richiesta (quello che manda il form)
        let { nome, cognome, eta, anni_esperienza, max_distanza_km, citta, lat, lon, email, password, ruolo, foto_profilo, descrizione_azienda } = req.body;

        // Se è un candidato e non ha messo la foto, gli metto un avatar a caso con dicebear
        if (ruolo === 'candidato' && (!foto_profilo || foto_profilo.trim() === '')) {
            foto_profilo = `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(nome + cognome)}&backgroundColor=e2e8f0`;
        }

        // Controllo se esiste già uno con questa email sennò si spacca il db
        const [existing] = await db.execute('SELECT * FROM users WHERE email = ?', [email]);
        if (existing.length > 0) {
            return res.status(400).json({ error: 'Email già registrata' });
        }

        // Se lat/lon non sono forniti dal frontend (mappa), trovo le coordinate dalla città
        if (!lat || !lon) {
            const coords = await geocodeCity(citta);
            lat = coords.lat;
            lon = coords.lon;
        }

        // Cripto la password sennò si vede sul db! Faccio un hash semplice (SHA256)
        const hashedPassword = crypto.createHash('sha256').update(password).digest('hex');

        // Inserisco l'utente nel database (i punti interrogativi servono per evitare SQL injection)
        const [result] = await db.execute(
            'INSERT INTO users (nome, cognome, eta, anni_esperienza, max_distanza_km, citta, lat, lon, email, password, ruolo, foto_profilo, descrizione_azienda) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
            [nome, cognome, eta || null, anni_esperienza || 0, max_distanza_km || null, citta, lat, lon, email, hashedPassword, ruolo, foto_profilo || null, descrizione_azienda || null]
        );

        // Rispondo che è andato tutto bene (201 created)
        res.status(201).json({ message: 'Registrazione completata', userId: result.insertId });
    } catch (error) {
        console.error(error); // Stampo l'errore se no non capisco perchè non va
        res.status(500).json({ error: 'Errore del server durante la registrazione' });
    }
});

// 2. Login
app.post('/api/login', async (req, res) => {
    try {
        const { email, password } = req.body;

        const [users] = await db.execute('SELECT * FROM users WHERE email = ?', [email]);
        if (users.length === 0) {
            return res.status(400).json({ error: 'Credenziali non valide' });
        }

        const user = users[0];
        // Controllo se l'hash della password inserita è uguale a quello salvato nel database
        const hashDaControllare = crypto.createHash('sha256').update(password).digest('hex');
        const validPassword = (hashDaControllare === user.password);
        if (!validPassword) {
            return res.status(400).json({ error: 'Credenziali non valide' });
        }

        const userData = {
            id: user.id, nome: user.nome, cognome: user.cognome,
            email: user.email, ruolo: user.ruolo,
            lat: user.lat, lon: user.lon, citta: user.citta,
            descrizione_azienda: user.descrizione_azienda
        };
        res.json({ message: 'Login effettuato', user: userData });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Errore del server durante il login' });
    }
});

// 2.5 Recupero Password (simulato)
app.post('/api/recover-password', async (req, res) => {
    try {
        const { email } = req.body;
        const [users] = await db.execute('SELECT * FROM users WHERE email = ?', [email]);
        if (users.length === 0) {
            return res.status(404).json({ error: 'Email non trovata nel sistema' });
        }

        // Reset password a "123456" con un hash semplice
        const newHash = crypto.createHash('sha256').update('123456').digest('hex');
        await db.execute('UPDATE users SET password = ? WHERE email = ?', [newHash, email]);

        res.json({ message: 'Password reimpostata a: 123456. Usala per accedere e poi cambiala.' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Errore durante il recupero password' });
    }
});

// 3. API per i datori: Get DevCards Feed (con distanza calcolata)
app.get('/api/devcards', async (req, res) => {
    try {
        const { employer_id } = req.query;
        if (!employer_id) return res.status(400).json({ error: 'Manca employer_id' });

        // Recupera coordinate del datore
        const [employers] = await db.execute('SELECT lat, lon FROM users WHERE id = ?', [employer_id]);
        const empLat = employers[0]?.lat;
        const empLon = employers[0]?.lon;

        let query = `
            SELECT u.id, u.nome, u.cognome, u.eta, u.anni_esperienza, u.max_distanza_km, u.citta, u.lat, u.lon, u.foto_profilo,
                   c.bio, c.competenze, c.linguaggi, c.telefono, c.instagram, 
                   c.luogo_preferito, c.disponibile_ovunque, c.competenze_linguistiche, c.smartworking 
            FROM users u
            LEFT JOIN cvs c ON u.id = c.user_id
            WHERE u.ruolo = 'candidato'
            AND u.id NOT IN (
                SELECT candidate_id FROM employer_interactions WHERE employer_id = ?
            )
            ORDER BY RAND()
        `;

        const [devcards] = await db.execute(query, [employer_id]);

        // Aggiungi distanza a ogni card
        const result = devcards.map(card => {
            let distanza = null;
            if (card.disponibile_ovunque) {
                distanza = 'Remoto';
            } else if (empLat && empLon && card.lat && card.lon) {
                distanza = haversineDistance(empLat, empLon, card.lat, card.lon) + ' km';
            }
            return { ...card, distanza };
        });

        res.json(result);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Errore nel recupero delle DevCards' });
    }
});

// 3.5 API per i datori: Registrare Skip o Save
app.post('/api/interact', async (req, res) => {
    try {
        const { employer_id, candidate_id, action } = req.body;
        if (!employer_id || !candidate_id || !['save', 'skip'].includes(action)) {
            return res.status(400).json({ error: 'Parametri non validi' });
        }
        await db.execute(
            `INSERT INTO employer_interactions (employer_id, candidate_id, action) 
             VALUES (?, ?, ?) 
             ON DUPLICATE KEY UPDATE action = VALUES(action)`,
            [employer_id, candidate_id, action]
        );
        res.json({ message: 'Azione registrata' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Errore durante l'interazione" });
    }
});

// 3.6 API per i datori: Get DevCards Salvate (Con filtri avanzati)
app.get('/api/devcards/saved', async (req, res) => {
    try {
        const { employer_id, linguaggio, citta, anniExpMin, lingua } = req.query;
        if (!employer_id) return res.status(400).json({ error: 'Manca employer_id' });

        // Coordinate del datore
        const [employers] = await db.execute('SELECT lat, lon FROM users WHERE id = ?', [employer_id]);
        const empLat = employers[0]?.lat;
        const empLon = employers[0]?.lon;

        let query = `
            SELECT u.id, u.nome, u.cognome, u.eta, u.anni_esperienza, u.max_distanza_km, u.citta, u.lat, u.lon, u.foto_profilo,
                   c.bio, c.competenze, c.linguaggi, c.telefono, c.instagram, 
                   c.luogo_preferito, c.disponibile_ovunque, c.competenze_linguistiche, c.smartworking 
            FROM users u
            LEFT JOIN cvs c ON u.id = c.user_id
            INNER JOIN employer_interactions ei ON u.id = ei.candidate_id
            WHERE ei.employer_id = ? AND ei.action = 'save'
        `;
        let params = [employer_id];

        if (citta) {
            query += ' AND u.citta LIKE ?';
            params.push(`%${citta}%`);
        }
        if (anniExpMin) {
            query += ' AND u.anni_esperienza >= ?';
            params.push(anniExpMin);
        }
        if (linguaggio) {
            query += ' AND c.linguaggi LIKE ?';
            params.push(`%${linguaggio}%`);
        }
        if (lingua) {
            query += ' AND c.competenze_linguistiche LIKE ?';
            params.push(`%${lingua}%`);
        }

        query += ' ORDER BY ei.created_at DESC';

        const [devcards] = await db.execute(query, params);

        const result = devcards.map(card => {
            let distanza = null;
            if (card.disponibile_ovunque) {
                distanza = 'Remoto';
            } else if (empLat && empLon && card.lat && card.lon) {
                distanza = haversineDistance(empLat, empLon, card.lat, card.lon) + ' km';
            }
            return { ...card, distanza };
        });

        res.json(result);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Errore nel recupero delle DevCards salvate' });
    }
});

// 4. API per i candidati: Get il proprio CV/Card
app.get('/api/cv/:userId', async (req, res) => {
    try {
        const { userId } = req.params;
        const [rows] = await db.execute(
            `SELECT u.id, u.nome, u.cognome, u.eta, u.anni_esperienza, u.max_distanza_km, u.citta, u.lat, u.lon, u.foto_profilo,
                    c.bio, c.competenze, c.linguaggi, c.telefono, c.instagram,
                    c.luogo_preferito, c.disponibile_ovunque, c.competenze_linguistiche, c.smartworking 
             FROM users u
             LEFT JOIN cvs c ON u.id = c.user_id
             WHERE u.id = ? AND u.ruolo = 'candidato'`,
            [userId]
        );
        if (rows.length === 0) return res.status(404).json({ error: 'Candidato non trovato' });
        res.json(rows[0]);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Errore nel recupero del CV' });
    }
});

// 4.5 API per i candidati: Upsert CV
app.post('/api/cv', async (req, res) => {
    try {
        const { user_id, bio, competenze, linguaggi, telefono, instagram, luogo_preferito, disponibile_ovunque, competenze_linguistiche, smartworking } = req.body;

        const [users] = await db.execute('SELECT * FROM users WHERE id = ? AND ruolo = ?', [user_id, 'candidato']);
        if (users.length === 0) return res.status(403).json({ error: 'Non autorizzato o utente non trovato' });

        // Se ha indicato un luogo preferito, geocodificalo e aggiorna le coordinate dell'utente
        if (luogo_preferito && !disponibile_ovunque) {
            const coords = await geocodeCity(luogo_preferito);
            if (coords.lat && coords.lon) {
                await db.execute('UPDATE users SET lat = ?, lon = ? WHERE id = ?', [coords.lat, coords.lon, user_id]);
            }
        }

        const [cvs] = await db.execute('SELECT * FROM cvs WHERE user_id = ?', [user_id]);

        if (cvs.length > 0) {
            await db.execute(
                'UPDATE cvs SET bio=?, competenze=?, linguaggi=?, telefono=?, instagram=?, luogo_preferito=?, disponibile_ovunque=?, competenze_linguistiche=?, smartworking=? WHERE user_id=?',
                [bio, competenze, linguaggi, telefono, instagram, luogo_preferito, disponibile_ovunque, competenze_linguistiche, smartworking, user_id]
            );
            res.json({ message: 'CV aggiornato con successo' });
        } else {
            await db.execute(
                'INSERT INTO cvs (user_id, bio, competenze, linguaggi, telefono, instagram, luogo_preferito, disponibile_ovunque, competenze_linguistiche, smartworking) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
                [user_id, bio, competenze, linguaggi, telefono, instagram, luogo_preferito, disponibile_ovunque, competenze_linguistiche, smartworking]
            );
            res.json({ message: 'CV creato con successo' });
        }
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Errore nel salvataggio del CV' });
    }
});

// =============================
// INTERVIEW REQUESTS
// =============================

// 5. Proponi colloquio (dal datore)
app.post('/api/interview', async (req, res) => {
    try {
        const { employer_id, candidate_id, posizione_cercata, linguaggi_richiesti, range_stipendio, luogo } = req.body;
        if (!employer_id || !candidate_id || !posizione_cercata) {
            return res.status(400).json({ error: 'Parametri mancanti' });
        }

        await db.execute(
            'INSERT INTO interview_requests (employer_id, candidate_id, posizione_cercata, linguaggi_richiesti, range_stipendio, luogo) VALUES (?, ?, ?, ?, ?, ?)',
            [employer_id, candidate_id, posizione_cercata, linguaggi_richiesti, range_stipendio, luogo]
        );
        res.status(201).json({ message: 'Richiesta di colloquio inviata' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Errore nell'invio della richiesta" });
    }
});

// 6. Recupera colloqui ricevuti da un candidato
app.get('/api/candidate/interviews', async (req, res) => {
    try {
        const { candidate_id } = req.query;
        if (!candidate_id) return res.status(400).json({ error: 'Manca candidate_id' });

        const [rows] = await db.execute(
            `SELECT ir.*, 
                    u.nome AS azienda_nome, u.cognome AS azienda_cognome, u.citta AS azienda_citta,
                    u.lat AS azienda_lat, u.lon AS azienda_lon, u.descrizione_azienda
             FROM interview_requests ir
             JOIN users u ON ir.employer_id = u.id
             WHERE ir.candidate_id = ?
             ORDER BY ir.created_at DESC`,
            [candidate_id]
        );

        // Aggiungi la distanza del candidato rispetto all'azienda
        const [candidates] = await db.execute('SELECT lat, lon FROM users WHERE id = ?', [candidate_id]);
        const candLat = candidates[0]?.lat;
        const candLon = candidates[0]?.lon;

        const result = rows.map(row => {
            let distanza = null;
            if (candLat && candLon && row.azienda_lat && row.azienda_lon) {
                distanza = haversineDistance(candLat, candLon, row.azienda_lat, row.azienda_lon) + ' km';
            }
            return { ...row, distanza };
        });

        res.json(result);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Errore nel recupero dei colloqui' });
    }
});

// 7. Accetta o Rifiuta un colloquio
app.put('/api/interview/status', async (req, res) => {
    try {
        const { interview_id, status } = req.body;
        if (!interview_id || !['accepted', 'rejected'].includes(status)) {
            return res.status(400).json({ error: 'Parametri non validi' });
        }

        await db.execute('UPDATE interview_requests SET status = ? WHERE id = ?', [status, interview_id]);
        res.json({ message: `Colloquio ${status === 'accepted' ? 'accettato' : 'rifiutato'}` });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Errore aggiornamento stato colloquio' });
    }
});

// 8. Get info datore (per la pagina pubblica del candidato)
app.get('/api/employer/:id', async (req, res) => {
    try {
        const [rows] = await db.execute(
            'SELECT id, nome, cognome, citta, descrizione_azienda FROM users WHERE id = ? AND ruolo = ?',
            [req.params.id, 'datore']
        );
        if (rows.length === 0) return res.status(404).json({ error: 'Azienda non trovata' });
        res.json(rows[0]);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Errore nel recupero dati azienda' });
    }
});

// --- START ---
// Qui decido su che porta far girare il server (se non è settata su .env uso la 3000)
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    // Stampo in console così so che è partito
    console.log(`Server in esecuzione su http://localhost:${PORT}`);
    console.log(`(Ricordati di accendere XAMPP per il database!!)`);
});
