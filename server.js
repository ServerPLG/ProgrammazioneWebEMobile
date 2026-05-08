const express = require('express');
const cors = require('cors');
const bcrypt = require('bcryptjs');
require('dotenv').config();
const db = require('./db');

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
// Serve frontend static files
app.use(express.static('frontend'));

// Crea tabella interazioni se non esiste
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

// --- ROUTES ---

// 1. Registrazione
app.post('/api/register', async (req, res) => {
    try {
        const { nome, cognome, eta, citta, email, password, ruolo } = req.body;
        
        // Check if user exists
        const [existing] = await db.execute('SELECT * FROM users WHERE email = ?', [email]);
        if (existing.length > 0) {
            return res.status(400).json({ error: 'Email già registrata' });
        }

        // Hash password
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        // Insert user
        const [result] = await db.execute(
            'INSERT INTO users (nome, cognome, eta, citta, email, password, ruolo) VALUES (?, ?, ?, ?, ?, ?, ?)',
            [nome, cognome, eta, citta, email, hashedPassword, ruolo]
        );

        res.status(201).json({ message: 'Registrazione completata', userId: result.insertId });
    } catch (error) {
        console.error(error);
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
        const validPassword = await bcrypt.compare(password, user.password);
        if (!validPassword) {
            return res.status(400).json({ error: 'Credenziali non valide' });
        }

        // Return user info (no JWT needed for simple demo, we just pass the user obj)
        const userData = { id: user.id, nome: user.nome, email: user.email, ruolo: user.ruolo };
        res.json({ message: 'Login effettuato', user: userData });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Errore del server durante il login' });
    }
});

// 3. API per i datori: Get DevCards Feed (Solo candidati non valutati)
app.get('/api/devcards', async (req, res) => {
    try {
        const { employer_id } = req.query;
        if (!employer_id) return res.status(400).json({ error: 'Manca employer_id' });
        
        let query = `
            SELECT u.id, u.nome, u.cognome, u.eta, u.citta, c.bio, c.competenze, c.linguaggi, c.telefono, c.instagram 
            FROM users u
            LEFT JOIN cvs c ON u.id = c.user_id
            WHERE u.ruolo = 'candidato'
            AND u.id NOT IN (
                SELECT candidate_id FROM employer_interactions WHERE employer_id = ?
            )
            ORDER BY RAND()
        `;
        
        const [devcards] = await db.execute(query, [employer_id]);
        res.json(devcards);
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

// 3.6 API per i datori: Get DevCards Salvate (Con filtri)
app.get('/api/devcards/saved', async (req, res) => {
    try {
        const { employer_id, linguaggio, citta, etaMax } = req.query;
        if (!employer_id) return res.status(400).json({ error: 'Manca employer_id' });

        let query = `
            SELECT u.id, u.nome, u.cognome, u.eta, u.citta, c.bio, c.competenze, c.linguaggi, c.telefono, c.instagram 
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
        if (etaMax) {
            query += ' AND u.eta <= ?';
            params.push(etaMax);
        }
        if (linguaggio) {
            query += ' AND c.linguaggi LIKE ?';
            params.push(`%${linguaggio}%`);
        }

        query += ' ORDER BY ei.created_at DESC';

        const [devcards] = await db.execute(query, params);
        res.json(devcards);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Errore nel recupero delle DevCards salvate' });
    }
});

// 4. API per i candidati: Upsert CV (Creazione o Aggiornamento)
app.post('/api/cv', async (req, res) => {
    try {
        const { user_id, bio, competenze, linguaggi, telefono, instagram } = req.body;
        
        // Verifica che l'utente esista ed è un candidato
        const [users] = await db.execute('SELECT * FROM users WHERE id = ? AND ruolo = ?', [user_id, 'candidato']);
        if (users.length === 0) return res.status(403).json({ error: 'Non autorizzato o utente non trovato' });

        // Controlla se il CV esiste già
        const [cvs] = await db.execute('SELECT * FROM cvs WHERE user_id = ?', [user_id]);
        
        if (cvs.length > 0) {
            // Update
            await db.execute(
                'UPDATE cvs SET bio=?, competenze=?, linguaggi=?, telefono=?, instagram=? WHERE user_id=?',
                [bio, competenze, linguaggi, telefono, instagram, user_id]
            );
            res.json({ message: 'CV aggiornato con successo' });
        } else {
            // Insert
            await db.execute(
                'INSERT INTO cvs (user_id, bio, competenze, linguaggi, telefono, instagram) VALUES (?, ?, ?, ?, ?, ?)',
                [user_id, bio, competenze, linguaggi, telefono, instagram]
            );
            res.json({ message: 'CV creato con successo' });
        }
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Errore nel salvataggio del CV' });
    }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server in esecuzione su http://localhost:${PORT}`);
});
