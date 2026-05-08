-- Creazione del database
CREATE DATABASE IF NOT EXISTS devcards;
USE devcards;

-- Tabella Utenti (comune sia per candidati che per datori di lavoro)
CREATE TABLE IF NOT EXISTS users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nome VARCHAR(50) NOT NULL,
    cognome VARCHAR(50) NOT NULL,
    eta INT NOT NULL,
    citta VARCHAR(100) NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    ruolo ENUM('candidato', 'datore') NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tabella CV (specifica solo per i candidati)
-- È collegata alla tabella users tramite user_id (relazione 1 a 1)
CREATE TABLE IF NOT EXISTS cvs (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT UNIQUE NOT NULL,
    bio TEXT,
    competenze TEXT,
    linguaggi VARCHAR(255),
    telefono VARCHAR(20),
    instagram VARCHAR(100),
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Dati fittizi (Mock data) per testare l'applicazione subito
INSERT INTO users (nome, cognome, eta, citta, email, password, ruolo) VALUES 
('Mario', 'Rossi', 28, 'Milano', 'mario@email.com', '$2a$10$X/Q8Z.1...', 'candidato'),
('Luigi', 'Verdi', 25, 'Roma', 'luigi@email.com', '$2a$10$X/Q8Z.1...', 'candidato'),
('Anna', 'Bianchi', 30, 'Napoli', 'anna@email.com', '$2a$10$X/Q8Z.1...', 'candidato'),
('Azienda', 'Tech', 40, 'Milano', 'datore@azienda.com', '$2a$10$X/Q8Z.1...', 'datore');

INSERT INTO cvs (user_id, bio, competenze, linguaggi, telefono, instagram) VALUES 
(1, 'Sviluppatore Full Stack appassionato di web app.', 'Problem solving, Teamwork', 'JavaScript, HTML, CSS, Node.js', '3331234567', '@mariorossi_dev'),
(2, 'Backend developer con focus su database.', 'Analisi dati, API Design', 'Java, SQL, Python', '3339876543', '@luigi_backend'),
(3, 'Frontend UI/UX developer.', 'Figma, Design System', 'JavaScript, React, CSS', '3335556667', '@anna_uiux');

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
