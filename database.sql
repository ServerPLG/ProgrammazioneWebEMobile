-- Creazione del database
DROP DATABASE IF EXISTS devcards;
CREATE DATABASE devcards;
USE devcards;

-- Tabella Utenti (comune sia per candidati che per datori di lavoro)
CREATE TABLE IF NOT EXISTS users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nome VARCHAR(50) NOT NULL,
    cognome VARCHAR(50) NOT NULL,
    eta INT DEFAULT NULL,
    anni_esperienza INT DEFAULT 0,
    max_distanza_km INT DEFAULT NULL,
    citta VARCHAR(100) NOT NULL,
    lat DECIMAL(10, 7) DEFAULT NULL,
    lon DECIMAL(10, 7) DEFAULT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    ruolo ENUM('candidato', 'datore') NOT NULL,
    foto_profilo MEDIUMTEXT,
    descrizione_azienda TEXT DEFAULT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tabella CV (specifica solo per i candidati)
CREATE TABLE IF NOT EXISTS cvs (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT UNIQUE NOT NULL,
    bio TEXT,
    competenze TEXT,
    linguaggi VARCHAR(255),
    telefono VARCHAR(20),
    instagram VARCHAR(100),
    luogo_preferito VARCHAR(100),
    disponibile_ovunque BOOLEAN DEFAULT FALSE,
    competenze_linguistiche TEXT,
    smartworking BOOLEAN DEFAULT FALSE,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Tabella Interazioni Datori -> Candidati (Save / Skip)
CREATE TABLE IF NOT EXISTS employer_interactions (
    employer_id INT,
    candidate_id INT,
    action ENUM('save', 'skip') NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (employer_id, candidate_id),
    FOREIGN KEY (employer_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (candidate_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Tabella Richieste di Colloquio
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
);

-- ================================================================
-- DATI MOCK
-- ================================================================
-- Password: "password123" per tutti (hash bcrypt)
-- Hash generato con bcrypt, rounds=10

-- Candidati
INSERT INTO users (nome, cognome, eta, anni_esperienza, max_distanza_km, citta, lat, lon, email, password, ruolo, foto_profilo) VALUES 
('Mario', 'Rossi', 28, 5, 50, 'Milano', 45.4642035, 9.1899799, 'mario@email.com', '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy', 'candidato', NULL),
('Luigi', 'Verdi', 25, 3, 30, 'Roma', 41.9027835, 12.4963655, 'luigi@email.com', '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy', 'candidato', NULL),
('Anna', 'Bianchi', 30, 7, NULL, 'Napoli', 40.8517746, 14.2681244, 'anna@email.com', '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy', 'candidato', NULL),
('Marco', 'Neri', 23, 2, 20, 'Torino', 45.0703393, 7.6868565, 'marco@email.com', '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy', 'candidato', NULL),
('Sara', 'Colombo', 27, 4, 100, 'Firenze', 43.7695604, 11.2558136, 'sara@email.com', '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy', 'candidato', NULL),
('Luca', 'Ferrari', 31, 6, 80, 'Bologna', 44.494887, 11.3426163, 'luca@email.com', '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy', 'candidato', NULL),
('Giulia', 'Russo', 22, 1, 40, 'Palermo', 38.1156879, 13.3612671, 'giulia@email.com', '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy', 'candidato', NULL);

-- Datori di lavoro
INSERT INTO users (nome, cognome, anni_esperienza, citta, lat, lon, email, password, ruolo, descrizione_azienda) VALUES 
('TechCorp', 'S.r.l.', 0, 'Milano', 45.4642035, 9.1899799, 'hr@techcorp.com', '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy', 'datore', 'Azienda leader nello sviluppo di soluzioni SaaS enterprise. Cerchiamo talenti appassionati di tecnologia per costruire il futuro del software.'),
('StartupHub', 'Italia', 0, 'Roma', 41.9027835, 12.4963655, 'jobs@startuphub.it', '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy', 'datore', 'Incubatore di startup con focus su AI e Machine Learning. Offriamo un ambiente dinamico e stimolante per sviluppatori junior e senior.'),
('WebAgency', 'Pro', 0, 'Firenze', 43.7695604, 11.2558136, 'info@webagencypro.com', '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy', 'datore', 'Agenzia web specializzata in e-commerce e siti corporate. Lavoriamo con React, Node.js e tecnologie cloud moderne.');

-- CV dei candidati
INSERT INTO cvs (user_id, bio, competenze, linguaggi, telefono, instagram, luogo_preferito, disponibile_ovunque, competenze_linguistiche, smartworking) VALUES 
(1, 'Sviluppatore Full Stack con 5 anni di esperienza. Appassionato di architetture scalabili e best practice.', 'Problem solving, Teamwork, Agile', 'JavaScript, Node.js, React, TypeScript', '3331234567', '@mariorossi_dev', 'Milano', FALSE, '[{"lingua":"Inglese","livello":"B2"},{"lingua":"Francese","livello":"A2"}]', TRUE),
(2, 'Backend developer con forte esperienza su database e API design. Amo ottimizzare le performance.', 'Analisi dati, API Design, DevOps', 'Java, SQL, Python, Go', '3339876543', '@luigi_backend', 'Roma', FALSE, '[{"lingua":"Inglese","livello":"C1"},{"lingua":"Spagnolo","livello":"A2"}]', FALSE),
(3, 'Frontend UI/UX developer con un occhio per il design. Creo interfacce intuitive e accessibili.', 'Figma, Design System, Accessibility', 'JavaScript, React, CSS, Vue.js', '3335556667', '@anna_uiux', '', TRUE, '[{"lingua":"Inglese","livello":"B1"},{"lingua":"Tedesco","livello":"B1"}]', TRUE),
(4, 'Junior developer motivato, appassionato di cybersecurity e programmazione low-level.', 'Networking, Linux, Security Audit', 'Python, C, Bash, Rust', '3341112233', '@marco_cyber', 'Torino', FALSE, '[{"lingua":"Inglese","livello":"B2"}]', FALSE),
(5, 'Sviluppatrice mobile con esperienza in app native e cross-platform. Amo la clean architecture.', 'Mobile Development, CI/CD, Testing', 'Kotlin, Swift, Dart, Flutter', '3352223344', '@sara_mobile', 'Firenze', FALSE, '[{"lingua":"Inglese","livello":"C1"},{"lingua":"Portoghese","livello":"A1"}]', TRUE),
(6, 'DevOps engineer con esperienza su cloud AWS e containerizzazione. Focus su automazione e monitoring.', 'Docker, Kubernetes, Terraform, AWS', 'Python, Bash, Go, YAML', '3363334455', '@luca_devops', 'Bologna', FALSE, '[{"lingua":"Inglese","livello":"C2"},{"lingua":"Francese","livello":"B1"}]', TRUE),
(7, 'Neolaureata in informatica con passione per lo sviluppo web e la data science.', 'Machine Learning, Data Analysis, Git', 'Python, JavaScript, R, SQL', '3374445566', '@giulia_data', 'Palermo', FALSE, '[{"lingua":"Inglese","livello":"B1"}]', FALSE);
