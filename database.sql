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
    citta VARCHAR(100) DEFAULT NULL,
    lat DECIMAL(10, 7) DEFAULT NULL,
    lon DECIMAL(10, 7) DEFAULT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    ruolo ENUM('candidato', 'datore') NOT NULL,
    foto_profilo MEDIUMTEXT,
    nome_azienda VARCHAR(100) DEFAULT NULL,
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
-- Password: "password123" per tutti (hash SHA256)
-- Hash: ef92b778bafe771e89245b89ecbc08a44a4e166c06659911881f383d4473e94f

-- Candidati (IDs 1 to 10)
INSERT INTO users (nome, cognome, eta, anni_esperienza, max_distanza_km, citta, lat, lon, email, password, ruolo, foto_profilo) VALUES 
('Mario', 'Rossi', 28, 5, 50, 'Milano', 45.4642035, 9.1899799, 'mario@email.com', 'ef92b778bafe771e89245b89ecbc08a44a4e166c06659911881f383d4473e94f', 'candidato', NULL),
('Luigi', 'Verdi', 25, 3, 30, 'Roma', 41.9027835, 12.4963655, 'luigi@email.com', 'ef92b778bafe771e89245b89ecbc08a44a4e166c06659911881f383d4473e94f', 'candidato', NULL),
('Anna', 'Bianchi', 30, 7, NULL, 'Napoli', 40.8517746, 14.2681244, 'anna@email.com', 'ef92b778bafe771e89245b89ecbc08a44a4e166c06659911881f383d4473e94f', 'candidato', NULL),
('Marco', 'Neri', 23, 2, 20, 'Torino', 45.0703393, 7.6868565, 'marco@email.com', 'ef92b778bafe771e89245b89ecbc08a44a4e166c06659911881f383d4473e94f', 'candidato', NULL),
('Sara', 'Colombo', 27, 4, 100, 'Firenze', 43.7695604, 11.2558136, 'sara@email.com', 'ef92b778bafe771e89245b89ecbc08a44a4e166c06659911881f383d4473e94f', 'candidato', NULL),
('Luca', 'Ferrari', 31, 6, 80, 'Bologna', 44.494887, 11.3426163, 'luca@email.com', 'ef92b778bafe771e89245b89ecbc08a44a4e166c06659911881f383d4473e94f', 'candidato', NULL),
('Giulia', 'Russo', 22, 1, 40, 'Palermo', 38.1156879, 13.3612671, 'giulia@email.com', 'ef92b778bafe771e89245b89ecbc08a44a4e166c06659911881f383d4473e94f', 'candidato', NULL),
('Roberto', 'Gallo', 29, 8, 20, 'Genova', 44.4056499, 8.946256, 'roberto@email.com', 'ef92b778bafe771e89245b89ecbc08a44a4e166c06659911881f383d4473e94f', 'candidato', NULL),
('Martina', 'Ricci', 26, 3, 60, 'Venezia', 45.4408474, 12.3155151, 'martina@email.com', 'ef92b778bafe771e89245b89ecbc08a44a4e166c06659911881f383d4473e94f', 'candidato', NULL),
('Elena', 'Marino', 24, 2, NULL, 'Bari', 41.1171432, 16.8718715, 'elena@email.com', 'ef92b778bafe771e89245b89ecbc08a44a4e166c06659911881f383d4473e94f', 'candidato', NULL);

-- Datori di lavoro (IDs 11 to 15)
INSERT INTO users (nome, cognome, anni_esperienza, citta, lat, lon, email, password, ruolo, nome_azienda, descrizione_azienda) VALUES 
('Marco', 'Bianchi', 0, 'Milano', 45.4642035, 9.1899799, 'hr@techcorp.com', 'ef92b778bafe771e89245b89ecbc08a44a4e166c06659911881f383d4473e94f', 'datore', 'TechCorp S.r.l.', 'Azienda leader nello sviluppo di soluzioni SaaS enterprise. Cerchiamo talenti appassionati di tecnologia per costruire il futuro del software.'),
('Luca', 'Martini', 0, 'Roma', 41.9027835, 12.4963655, 'jobs@startuphub.it', 'ef92b778bafe771e89245b89ecbc08a44a4e166c06659911881f383d4473e94f', 'datore', 'StartupHub Italia', 'Incubatore di startup con focus su AI e Machine Learning. Offriamo un ambiente dinamico e stimolante per sviluppatori junior e senior.'),
('Giulia', 'Conti', 0, 'Firenze', 43.7695604, 11.2558136, 'info@webagencypro.com', 'ef92b778bafe771e89245b89ecbc08a44a4e166c06659911881f383d4473e94f', 'datore', 'WebAgency Pro', 'Agenzia web specializzata in e-commerce e siti corporate. Lavoriamo con React, Node.js e tecnologie cloud moderne.'),
('Andrea', 'Romano', 0, 'Torino', 45.0703393, 7.6868565, 'recruiting@cloudsolutions.it', 'ef92b778bafe771e89245b89ecbc08a44a4e166c06659911881f383d4473e94f', 'datore', 'CloudSolutions S.p.a.', 'Sviluppiamo infrastrutture cloud sicure e scalabili per le aziende.'),
('Francesca', 'Esposito', 0, 'Napoli', 40.8517746, 14.2681244, 'careers@devfactory.com', 'ef92b778bafe771e89245b89ecbc08a44a4e166c06659911881f383d4473e94f', 'datore', 'DevFactory SRL', 'Software house emergente specializzata nello sviluppo di applicazioni mobile cross-platform e web app.');

-- CV dei candidati
INSERT INTO cvs (user_id, bio, competenze, linguaggi, telefono, instagram, luogo_preferito, disponibile_ovunque, competenze_linguistiche, smartworking) VALUES 
(1, 'Sviluppatore Full Stack con 5 anni di esperienza. Appassionato di architetture scalabili e best practice.', 'Problem solving, Teamwork, Agile', 'JavaScript, Node.js, React, TypeScript', '3331234567', '@mariorossi_dev', 'Milano', FALSE, '[{"lingua":"Inglese","livello":"B2"},{"lingua":"Francese","livello":"A2"}]', TRUE),
(2, 'Backend developer con forte esperienza su database e API design. Amo ottimizzare le performance.', 'Analisi dati, API Design, DevOps', 'Java, SQL, Python, Go', '3339876543', '@luigi_backend', 'Roma', FALSE, '[{"lingua":"Inglese","livello":"C1"},{"lingua":"Spagnolo","livello":"A2"}]', FALSE),
(3, 'Frontend UI/UX developer con un occhio per il design. Creo interfacce intuitive e accessibili.', 'Figma, Design System, Accessibility', 'JavaScript, React, CSS, Vue.js', '3335556667', '@anna_uiux', '', TRUE, '[{"lingua":"Inglese","livello":"B1"},{"lingua":"Tedesco","livello":"B1"}]', TRUE),
(4, 'Junior developer motivato, appassionato di cybersecurity e programmazione low-level.', 'Networking, Linux, Security Audit', 'Python, C, Bash, Rust', '3341112233', '@marco_cyber', 'Torino', FALSE, '[{"lingua":"Inglese","livello":"B2"}]', FALSE),
(5, 'Sviluppatrice mobile con esperienza in app native e cross-platform. Amo la clean architecture.', 'Mobile Development, CI/CD, Testing', 'Kotlin, Swift, Dart, Flutter', '3352223344', '@sara_mobile', 'Firenze', FALSE, '[{"lingua":"Inglese","livello":"C1"},{"lingua":"Portoghese","livello":"A1"}]', TRUE),
(6, 'DevOps engineer con esperienza su cloud AWS e containerizzazione. Focus su automazione e monitoring.', 'Docker, Kubernetes, Terraform, AWS', 'Python, Bash, Go, YAML', '3363334455', '@luca_devops', 'Bologna', FALSE, '[{"lingua":"Inglese","livello":"C2"},{"lingua":"Francese","livello":"B1"}]', TRUE),
(7, 'Neolaureata in informatica con passione per lo sviluppo web e la data science.', 'Machine Learning, Data Analysis, Git', 'Python, JavaScript, R, SQL', '3374445566', '@giulia_data', 'Palermo', FALSE, '[{"lingua":"Inglese","livello":"B1"}]', FALSE),
(8, 'Backend engineer esperto in microservizi e architetture event-driven. Lavoro molto con Kafka e Spring Boot.', 'Microservices, Kafka, Spring Boot', 'Java, Kotlin, SQL', '3385556677', '@roberto_backend', 'Genova', FALSE, '[{"lingua":"Inglese","livello":"C1"}]', TRUE),
(9, 'Frontend Developer creativa. Mi piace costruire interfacce veloci e accessibili.', 'React, Next.js, Tailwind', 'JavaScript, TypeScript, HTML, CSS', '3396667788', '@martina_front', 'Venezia', FALSE, '[{"lingua":"Inglese","livello":"B2"},{"lingua":"Spagnolo","livello":"B1"}]', FALSE),
(10, 'Data Engineer Junior con una forte base matematica. Mi piace manipolare i dati ed estrarne valore.', 'ETL, Data Warehousing, SQL', 'Python, SQL, Scala', '3307778899', '@elena_data', 'Bari', TRUE, '[{"lingua":"Inglese","livello":"B2"}]', TRUE);

-- Proposte di Colloquio (1-2 per profilo)
INSERT INTO interview_requests (employer_id, candidate_id, posizione_cercata, linguaggi_richiesti, range_stipendio, luogo, status) VALUES 
(11, 1, 'Senior Full Stack Developer', 'Node.js, React', '35.000€ - 45.000€', 'Milano', 'pending'),
(12, 1, 'Tech Lead', 'Node.js, TypeScript', '40.000€ - 55.000€', 'Milano / Remoto', 'pending'),
(12, 2, 'Backend Developer (AI team)', 'Python, SQL', '30.000€ - 38.000€', 'Roma', 'pending'),
(13, 3, 'Frontend / UX Designer', 'React, Vue', '25.000€ - 32.000€', 'Firenze', 'pending'),
(14, 3, 'UI Developer', 'JavaScript, CSS', '28.000€ - 35.000€', 'Remoto', 'pending'),
(14, 4, 'Junior Cloud / Security', 'Python, Bash', '22.000€ - 26.000€', 'Torino', 'pending'),
(15, 5, 'Sviluppatore Mobile Flutter', 'Dart, Kotlin', '28.000€ - 35.000€', 'Napoli / Remoto', 'pending'),
(13, 5, 'App Developer', 'Swift, Kotlin', '26.000€ - 32.000€', 'Firenze', 'pending'),
(11, 6, 'Cloud Infrastructure Engineer', 'AWS, Terraform', '40.000€ - 50.000€', 'Remoto', 'pending'),
(12, 7, 'Junior Data Scientist', 'Python, SQL', '24.000€ - 28.000€', 'Roma', 'pending'),
(15, 7, 'Data Analyst', 'Python, R', '23.000€ - 27.000€', 'Napoli', 'pending'),
(11, 8, 'Senior Java Backend', 'Java, Spring Boot', '45.000€ - 55.000€', 'Milano / Remoto', 'pending'),
(13, 9, 'React Developer', 'JavaScript, TypeScript', '28.000€ - 36.000€', 'Venezia / Remoto', 'pending'),
(15, 9, 'Frontend Engineer', 'Next.js', '30.000€ - 40.000€', 'Remoto', 'pending'),
(14, 10, 'Data Engineer Junior', 'Python, SQL', '25.000€ - 30.000€', 'Torino', 'pending');
