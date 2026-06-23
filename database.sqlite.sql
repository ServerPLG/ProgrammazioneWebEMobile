-- Schema + dati iniziali del database SQLite.
-- Idempotente: CREATE TABLE IF NOT EXISTS + INSERT OR IGNORE, eseguito a ogni avvio.
-- Tipi SQLite nativi: INTEGER, REAL, TEXT (le date sono TEXT ISO con CURRENT_TIMESTAMP).

-- Tabella Utenti (comune sia per candidati che per datori di lavoro)
CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    nome TEXT NOT NULL,
    cognome TEXT NOT NULL,
    eta INTEGER DEFAULT NULL,
    anni_esperienza INTEGER DEFAULT 0,
    citta TEXT DEFAULT NULL,
    lat REAL DEFAULT NULL,
    lon REAL DEFAULT NULL,
    email TEXT UNIQUE NOT NULL,
    password TEXT NOT NULL,
    ruolo TEXT NOT NULL,
    foto_profilo TEXT,
    nome_azienda TEXT DEFAULT NULL,
    descrizione_azienda TEXT DEFAULT NULL,
    created_at TEXT DEFAULT CURRENT_TIMESTAMP
);

-- Tabella CV (specifica solo per i candidati)
CREATE TABLE IF NOT EXISTS cvs (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER UNIQUE NOT NULL,
    bio TEXT,
    competenze TEXT,
    linguaggi TEXT,
    telefono TEXT,
    instagram TEXT,
    luogo_preferito TEXT,
    disponibile_ovunque INTEGER DEFAULT 0,
    competenze_linguistiche TEXT,
    smartworking INTEGER DEFAULT 0,
    linkedin TEXT DEFAULT NULL,
    github TEXT DEFAULT NULL,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Tabella Interazioni Datori -> Candidati (Save / Skip)
CREATE TABLE IF NOT EXISTS employer_interactions (
    employer_id INTEGER,
    candidate_id INTEGER,
    action TEXT NOT NULL,
    created_at TEXT DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (employer_id, candidate_id),
    FOREIGN KEY (employer_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (candidate_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Tabella Richieste di Colloquio
CREATE TABLE IF NOT EXISTS interview_requests (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    employer_id INTEGER NOT NULL,
    candidate_id INTEGER NOT NULL,
    posizione_cercata TEXT NOT NULL,
    linguaggi_richiesti TEXT,
    range_stipendio TEXT,
    luogo TEXT,
    data_colloquio TEXT,
    ora_colloquio TEXT,
    luogo_colloquio TEXT,
    status TEXT DEFAULT 'pending',
    created_at TEXT DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (employer_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (candidate_id) REFERENCES users(id) ON DELETE CASCADE
);

-- -- ================================================================
-- DATI MOCK
-- ================================================================

-- Candidati (IDs 1 to 31)
-- candidato@candidato.it password hash (1234): 03ac674216f3e15c761ee1a5e255f067953623c8b388b4459e13f978d7c846f4
-- Altre password sono definite in credenziali.txt
INSERT OR IGNORE INTO users (id, nome, cognome, eta, anni_esperienza, citta, lat, lon, email, password, ruolo, foto_profilo) VALUES 
(1, 'Candidato', 'Speciale', 25, 3, 'Milano', 45.4642035, 9.1899799, 'candidato@candidato.it', '03ac674216f3e15c761ee1a5e255f067953623c8b388b4459e13f978d7c846f4', 'candidato', NULL),
(2, 'Mario', 'Rossi', 28, 5, 'Milano', 45.4642035, 9.1899799, 'mario.rossi@email.it', '2f445c250fda330e4f95a8e72a7083cb14d0212159e44384ff314ff28662626c', 'candidato', NULL),
(3, 'Luigi', 'Verdi', 32, 8, 'Roma', 41.9027835, 12.4963655, 'luigi.verdi@email.it', '3560ee6e640465d4461417d0d44c48a95882f9ac93a6f0aaccc8779e4915cafc', 'candidato', NULL),
(4, 'Anna', 'Bianchi', 24, 2, 'Torino', 45.0703393, 7.6868565, 'anna.bianchi@email.it', 'cd666c6d3cb8d153e9441b1cf8e2ddd8aa4de33f462a5ad2b4cae346b622267d', 'candidato', NULL),
(5, 'Marco', 'Neri', 29, 4, 'Bologna', 44.494887, 11.3426163, 'marco.neri@email.it', 'bf107feacb8ca10088c0e4034ec7c38f33bb14279390139afb534dfacb36cb7a', 'candidato', NULL),
(6, 'Sara', 'Colombo', 27, 3, 'Firenze', 43.7695604, 11.2558136, 'sara.colombo@email.it', 'af4447c28863d3d0ed3dfa94330848868fae5a671696c233a6a93e4b3e32b2fe', 'candidato', NULL),
(7, 'Luca', 'Ferrari', 35, 10, 'Genova', 44.4056499, 8.946256, 'luca.ferrari@email.it', '17f1dff9d7d67771cada19f0f0d077010000c8bdbe20ded8f97376670de1e891', 'candidato', NULL),
(8, 'Giulia', 'Russo', 23, 1, 'Napoli', 40.8517746, 14.2681244, 'giulia.russo@email.it', '775c0de5cb92643f8dc01d9e3438782e8060cf371d1b17da117eaf26d2fc5e89', 'candidato', NULL),
(9, 'Roberto', 'Gallo', 31, 6, 'Venezia', 45.4408474, 12.3155151, 'roberto.gallo@email.it', '486cce02f8efe98054f1908125c6def0dd2d32021033ff83b5b157e87d53ea65', 'candidato', NULL),
(10, 'Martina', 'Ricci', 26, 3, 'Bari', 41.1171432, 16.8718715, 'martina.ricci@email.it', 'd09f6c43993a1553f30a8c71f9997dfee6c330ee141b0ca3ba9f7131db8aaba2', 'candidato', NULL),
(11, 'Alessandro', 'Moretti', 30, 5, 'Palermo', 38.1156879, 13.3612671, 'alessandro.moretti@email.it', '6ba5e7fe71e92b81799f5ea6d2ce859e4e536328f4ccda99aea1ae2c23ab77c0', 'candidato', NULL),
(12, 'Elena', 'Marino', 27, 4, 'Milano', 45.4642035, 9.1899799, 'elena.marino@email.it', '0e4797cbcfbfa8fcbbc2d0d26871fad7dcd2c5c82a3ddc8c2b53e8c88309607f', 'candidato', NULL),
(13, 'Francesco', 'Bruno', 33, 7, 'Torino', 45.0703393, 7.6868565, 'francesco.bruno@email.it', '693d081c29dfa37f2be8ac957d1a19c911084e13e6a5a51552b375d1e3511605', 'candidato', NULL),
(14, 'Chiara', 'Esposito', 25, 2, 'Napoli', 40.8517746, 14.2681244, 'chiara.esposito@email.it', 'ba6f6b207ebaf996553fbab9603e400dc067c2fdd5a492de061153efb90dd5bd', 'candidato', NULL),
(15, 'Matteo', 'Rizzo', 28, 4, 'Verona', 45.4383842, 10.9916215, 'matteo.rizzo@email.it', '91f087fca03159ff0b8481535f0cfbd38ceb7c693be386c3c65d5429d0e6f22c', 'candidato', NULL),
(16, 'Francesca', 'Giordano', 29, 5, 'Firenze', 43.7695604, 11.2558136, 'francesca.giordano@email.it', '52dfa740c44d885770b476c766a199fa20ce776b36b5e16f20ec3fab6a4d99ae', 'candidato', NULL),
(17, 'Davide', 'Barbieri', 34, 9, 'Roma', 41.9027835, 12.4963655, 'davide.barbieri@email.it', '987d6bb785df464e475df1db90bef792f1b574e841dc04a2bdc65087d406409d', 'candidato', NULL),
(18, 'Alice', 'Lombardi', 26, 3, 'Pisa', 43.70853, 10.4036, 'alice.lombardi@email.it', '93433ffa65392c526b20e36d254c228ec5195d18391e7f6c63411e57c55319c1', 'candidato', NULL),
(19, 'Stefano', 'Fontana', 38, 15, 'Milano', 45.4642035, 9.1899799, 'stefano.fontana@email.it', '8796c8c5849f6669cf4efaba056501ff1328b7ba0a33782e6eb149fb20945bb2', 'candidato', NULL),
(20, 'Valentina', 'Caruso', 24, 1, 'Padova', 45.4064349, 11.8767611, 'valentina.caruso@email.it', '9247449278630d0abc2c06c121675f647994d579c343974ef905a49cdce8208c', 'candidato', NULL),
(21, 'Andrea', 'Villa', 30, 6, 'Monza', 45.5845, 9.2744, 'andrea.villa@email.it', '9b3cd2d6e34e38955350fdcf17edda2b0e39e0cffb386ba3a60fdf31ed9eb090', 'candidato', NULL),
(22, 'Simona', 'Pellegrini', 27, 3, 'Roma', 41.9027835, 12.4963655, 'simona.pellegrini@email.it', '477bfc54e7f92963a7e3d1b67b57ae57000b62d9f12d73bdd21e38204e93e660', 'candidato', NULL),
(23, 'Giorgio', 'Galli', 31, 7, 'Milano', 45.4642035, 9.1899799, 'giorgio.galli@email.it', 'a241fa767d6a03e1d0416ef939158bc05bcf2874fc95fa1c3165f950014cc5b7', 'candidato', NULL),
(24, 'Martina', 'Franco', 29, 4, 'Catania', 37.5078772, 15.0830304, 'martina.franco@email.it', '740e2774a2c491c36e43e13dddec8ba9290bf15b7d29e394cdcd09e7b4c7e308', 'candidato', NULL),
(25, 'Federico', 'Rinaldi', 26, 2, 'Brescia', 45.5415526, 10.2118019, 'federico.rinaldi@email.it', '473b93cb0ea41f5038caa5756e2535f34c956a3c685473a041b424e8053e2b0b', 'candidato', NULL),
(26, 'Silvia', 'Riva', 32, 6, 'Milano', 45.4642035, 9.1899799, 'silvia.riva@email.it', 'bc838dad080fd3a9a4653f4cec5c5bca91304b4cffa07641041ac8456dc22096', 'candidato', NULL),
(27, 'Gabriele', 'Serra', 34, 8, 'Cagliari', 39.2238411, 9.1216613, 'gabriele.serra@email.it', 'e0397f34823a36a7b6c8498fa58b13a93ad92577bb8ea4afe3e1a720c221e20f', 'candidato', NULL),
(28, 'Camilla', 'Marchetti', 23, 1, 'Ancona', 43.6158299, 13.518915, 'camilla.marchetti@email.it', '2807d6c6d01624f7d158e4c1188adbe9c2634dd5b8ce2064298a64c55079141a', 'candidato', NULL),
(29, 'Lorenzo', 'Guerra', 35, 11, 'Roma', 41.9027835, 12.4963655, 'lorenzo.guerra@email.it', 'a329406148e14a4ba75a2709a9edf33229fc9a2920b03ffb422f5f288dde78b2', 'candidato', NULL),
(30, 'Sofia', 'Piras', 28, 4, 'Sassari', 40.7259162, 8.5556828, 'sofia.piras@email.it', '42c964d16d729a7283ecf3cade1d511e0eafb04d0ae5b67b70e85c7b46c49d2a', 'candidato', NULL),
(31, 'Valerio', 'Ponti', 30, 5, 'Milano', 45.4642035, 9.1899799, 'valerio.ponti@email.it', '4a47478b3de57889258e51e151f0dc838a98ac442618350a4295f096aef7988f', 'candidato', NULL);

-- Datori di lavoro (IDs 32 to 62)
-- datore@datore.it password hash (1234): 03ac674216f3e15c761ee1a5e255f067953623c8b388b4459e13f978d7c846f4
INSERT OR IGNORE INTO users (id, nome, cognome, email, password, ruolo, citta, lat, lon, nome_azienda, descrizione_azienda) VALUES 
(32, 'Datore', 'Speciale', 'datore@datore.it', '03ac674216f3e15c761ee1a5e255f067953623c8b388b4459e13f978d7c846f4', 'datore', 'Milano', 45.4642035, 9.1899799, 'SpecialeTech Inc.', 'Azienda speciale per i test del sistema. Sviluppiamo soluzioni cloud moderne.'),
(33, 'Alessandro', 'Sanna', 'hr@techhub.it', '56aa372aad62182af9e04363311b71693e1f4186a19bff9f368b6ad9b2fa7a11', 'datore', 'Milano', 45.4642035, 9.1899799, 'TechHub Milano', 'La tech company di riferimento per startup innovative.'),
(34, 'Beatrice', 'Russo', 'careers@innovations.it', '2d44ae06be85f7b25bddddecea0e47aaefdd72ded844ad57edda98f36638cbbd', 'datore', 'Torino', 45.0703393, 7.6868565, 'Innovation Systems S.p.A.', 'Sviluppo software e sistemi di intelligenza artificiale per l’automotive.'),
(35, 'Carlo', 'Ferrara', 'recruiting@webagency.it', 'd1e8bf93157eaa7c7bf41a9d85b591f27992534f341a434d0bc93aaffb7665f8', 'datore', 'Roma', 41.9027835, 12.4963655, 'CreativeWeb Agency', 'Creiamo siti web e applicazioni mobile ad alto impatto visivo.'),
(36, 'Diana', 'Corti', 'jobs@cloudcorp.com', '301c7ace8683d8159799bd733928f0291be4425b7b4df27df5409f765cd99483', 'datore', 'Bologna', 44.494887, 11.3426163, 'CloudCorp S.r.l.', 'Fornitore di servizi cloud e migrazione infrastrutture enterprise.'),
(37, 'Enrico', 'Gatti', 'lavoro@datasoft.it', '701947686a2fd72a87ae82dd15feda1f1acb1da1c7f122a2e0287cf6d77cd14c', 'datore', 'Firenze', 43.7695604, 11.2558136, 'DataSoft Solution', 'Sviluppo database ed analytics per grandi gruppi commerciali.'),
(38, 'Federica', 'Poli', 'recruiting@appfactory.it', 'bedbf84b2c3ed9496a2f078cb43061122300f42fd3951ca99fd50964e72994be', 'datore', 'Milano', 45.4642035, 9.1899799, 'AppFactory SRL', 'Software house focalizzata sulla progettazione di applicazioni mobile.'),
(39, 'Giovanni', 'Tosi', 'hr@cybernet.it', 'ff350f89d6b66d367ebc4232827052b8de19d8bd619197177536a537118c82c9', 'datore', 'Roma', 41.9027835, 12.4963655, 'CyberNet Security', 'Consulenza di cybersecurity, penetration testing e audit di sicurezza.'),
(40, 'Ilaria', 'Neri', 'talents@saasfy.com', 'f9bf914707bc119fa8370ac36164c602922b0f4a9c8461bf2352bf9563e1701e', 'datore', 'Napoli', 40.8517746, 14.2681244, 'SaaSfy Europe', 'Sviluppo di piattaforme SaaS cloud native per il B2B.'),
(41, 'Luca', 'Fonti', 'jobs@fintechdev.it', 'a00079c1b911e9a37721e87cf67aa190aaedc21bef45ba35560cf2aa1e21925c', 'datore', 'Milano', 45.4642035, 9.1899799, 'FinTechDev SRL', 'Sviluppiamo soluzioni software per il settore bancario e dei pagamenti.'),
(42, 'Marta', 'Valli', 'recruiting@gaminglabs.it', '5ce5ae5abb2590203ed49e9fdd0e5c4928c490f9a8393bcac56657744c20faea', 'datore', 'Bologna', 44.494887, 11.3426163, 'Gaming Labs Italy', 'Studio indipendente di sviluppo videogiochi per console e mobile.'),
(43, 'Nicola', 'Serra', 'jobs@edutech.it', 'ad02aef195f809824fbd4bf8fdd75767e1aa936bcd8904ea2245d114836e155b', 'datore', 'Venezia', 45.4408474, 12.3155151, 'EduTech SpA', 'Piattaforme di e-learning e soluzioni digitali per l’istruzione.'),
(44, 'Olivia', 'Pieri', 'hr@healthtech.it', 'dbe8f76b9c15aaabd4dca0cee2bfcff7b69e1f17e4fa9ee992ce03a000ab77eb', 'datore', 'Roma', 41.9027835, 12.4963655, 'HealthTech Solutions', 'Tecnologia applicata alla medicina e software gestionali per cliniche.'),
(45, 'Paolo', 'Gallo', 'careers@greenit.it', '04e88181c2e117d0cdf12fa65ec8f2bc2b73a21af624e0ec80aabe23ffd7eefa', 'datore', 'Torino', 45.0703393, 7.6868565, 'GreenIT Solutions', 'Progetti IT orientati all’efficienza energetica e alla sostenibilità.'),
(46, 'Quinto', 'Rizzo', 'hiring@aiworks.it', '80afa3c5f1ef86441a98cf26165e258dbc52a27233cebca55ae379e1a3d0f311', 'datore', 'Pisa', 43.70853, 10.4036, 'AIWorks Italia', 'Startup innovativa che sviluppa modelli predittivi basati su LLM.'),
(47, 'Rosa', 'Bianchi', 'hr@retaildigital.it', '9079b5d7fae6f1405bb0c9e5d52fdbb7d6182d9ea92fe13bc902804675f0dd4b', 'datore', 'Milano', 45.4642035, 9.1899799, 'RetailDigital SPA', 'Soluzioni e-commerce omnicanale per marchi della moda.'),
(48, 'Salvatore', 'Piras', 'careers@securecloud.it', '89ebc1a35377864e4abf96c9132e23d8beda3964418e3f1c8b770d47b3b9d4a3', 'datore', 'Cagliari', 39.2238411, 9.1216613, 'SecureCloud S.r.l.', 'Fornitore di server cloud sicuri ed hosting gestito.'),
(49, 'Teresa', 'Costa', 'jobs@erpsoft.it', '0100663e77f059c7d731d0c04d673b1c91b0249bab9b862f8b613b32aeaffba9', 'datore', 'Verona', 45.4383842, 10.9916215, 'ERPSoft S.r.l.', 'Sistemi gestionali ERP per la piccola e media impresa italiana.'),
(50, 'Umberto', 'Leone', 'recruiting@iotdev.it', '67aae23f7fe06313723c3ce1d4c1b186f46bea1dafe4cca6cfa9dd5be6cf95c5', 'datore', 'Brescia', 45.5415526, 10.2118019, 'IoTDev Solutions', 'Sistemi di automazione industriale ed IoT integrato.'),
(51, 'Valeria', 'Riva', 'careers@mediaweb.it', '929ce2f1bd4f2c07fefa78b5373c4726c133f309d7fba6fc86e656653d5ba86f', 'datore', 'Napoli', 40.8517746, 14.2681244, 'MediaWeb Publishing', 'Portali d’informazione online e content management systems.'),
(52, 'Walter', 'Basso', 'hiring@robotics.it', 'c9f55c1aad67e0c1da2c8bf732a841bc385c6f6c975f2a49b19aeca51f300e70', 'datore', 'Milano', 45.4642035, 9.1899799, 'Robotics Labs', 'Sviluppo software per bracci robotici ed automazione magazzini.'),
(53, 'Yuri', 'Adami', 'hr@automotiveit.it', '3b15b65dfbc9356bb2008d39870b9358817536e032d005c16f45f6ef660d562f', 'datore', 'Bologna', 44.494887, 11.3426163, 'Automotive IT', 'Software embedded e telematica per veicoli industriali.'),
(54, 'Zoe', 'Rinaldi', 'jobs@nanotech.it', 'd6864aa57fd6f55df745d929f802e14cad21cf5a453eab9abe3402854c7c7968', 'datore', 'Roma', 41.9027835, 12.4963655, 'NanoTech Systems', 'Sensori microscopici e software di tracciamento biomedicale.'),
(55, 'Bruno', 'Vianello', 'hiring@spacesoft.it', 'b29a40b83a6ce17e0fb0d31b34ff3d9d4cb66ac0300940c305fc24207e293ebe', 'datore', 'Padova', 45.4064349, 11.8767611, 'SpaceSoft Solutions', 'Sistemi di simulazione orbitale e telemetria spaziale.'),
(56, 'Clara', 'Dotti', 'hr@biotechit.it', 'c74b2fc8e2552dd903c83a7813125cbc40efdbcf6c9ae33b7277c81f2ec473d6', 'datore', 'Milano', 45.4642035, 9.1899799, 'BioTech IT', 'Software per analisi genomica e bioinformatica.'),
(57, 'Domenico', 'Orsi', 'careers@foodtech.it', '6c7976f1b6e724edd8b158aa61f8334b26625f0cd1c9b120f35fb889f1419ecc', 'datore', 'Parma', 44.801485, 10.327903, 'FoodTech Europe', 'Gestione informatizzata della filiera alimentare.'),
(58, 'Ester', 'Luz', 'recruiting@travelsoft.it', '2dd9c5850fbe701780e44c820a236845e1b1d190f584786709910febe4649a6f', 'datore', 'Firenze', 43.7695604, 11.2558136, 'TravelSoft SPA', 'Motori di ricerca per voli e hotel, sistemi di prenotazione.'),
(59, 'Filippo', 'Mori', 'jobs@musictech.it', '2ab13ce9d77477a17534ac46a49307169787bca36a49bde6e6beb58a5d4c093e', 'datore', 'Milano', 45.4642035, 9.1899799, 'MusicTech Labs', 'Algoritmi di raccomandazione musicale e streaming audio.'),
(60, 'Gemma', 'Boni', 'hiring@sportanalytics.it', '1b00d7da9eabd2a556c55b0d20c5525c5f1eb1c6abae26fe82bc8bd395e81da4', 'datore', 'Roma', 41.9027835, 12.4963655, 'Sport Analytics', 'Analisi delle prestazioni atletiche tramite computer vision.'),
(61, 'Hugo', 'Festa', 'careers@fashiondigital.it', 'c40c14d6cdf276b8ea8ba9199838de34b579a3e99e65ed2c87b473d15464018b', 'datore', 'Milano', 45.4642035, 9.1899799, 'FashionDigital Hub', 'E-commerce specialist per la moda di lusso milanese.'),
(62, 'Irene', 'Riva', 'jobs@erphiring.it', '726235940f0baa7c7d4875b4ef9b94ee1091325cd84313c3e2ec67184fac7dc7', 'datore', 'Torino', 45.0703393, 7.6868565, 'ERPHiring Solutions', 'Consulenza gestionale e migrazione sistemi SAP.');

-- CV dei candidati
INSERT OR IGNORE INTO cvs (user_id, bio, competenze, linguaggi, telefono, instagram, luogo_preferito, disponibile_ovunque, competenze_linguistiche, smartworking) VALUES 
(1, 'Profilo speciale per testare la piattaforma. Sviluppatore appassionato.', 'Testing, Debugging, Frontend', 'JavaScript, HTML, CSS, React', '3330000000', '@candidato_test', 'Milano', 0, '[{"lingua":"Inglese","livello":"B2"}]', 1),
(2, 'Sviluppatore Full Stack appassionato di React e Node.js.', 'React, Node, SQL', 'JavaScript, TypeScript, SQL', '3331112222', '@mario_dev', 'Milano', 0, '[{"lingua":"Inglese","livello":"B2"}]', 1),
(3, 'Backend Developer specializzato in Java ed enterprise architectures.', 'Java, Spring, Microservices', 'Java, SQL, Go', '3342223333', '@luigi_code', 'Roma', 0, '[{"lingua":"Inglese","livello":"C1"}]', 0),
(4, 'Frontend Developer junior con forte senso estetico.', 'UI/UX, CSS, Responsive Design', 'JavaScript, HTML, CSS, Vue.js', '3353334444', '@anna_design', 'Torino', 0, '[{"lingua":"Inglese","livello":"B1"},{"lingua":"Francese","livello":"A2"}]', 1),
(5, 'Data Scientist esperto di Python, Machine Learning e Analytics.', 'Machine Learning, Data Analysis, ETL', 'Python, R, SQL, Julia', '3364445555', '@marco_data', 'Bologna', 0, '[{"lingua":"Inglese","livello":"C2"}]', 1),
(6, 'Mobile Developer esperta di Flutter e Swift.', 'App development, Native UI, App Store publish', 'Dart, Swift, Kotlin', '3375556666', '@sara_mobile', 'Firenze', 0, '[{"lingua":"Inglese","livello":"B2"}]', 1),
(7, 'Cloud Engineer / DevOps con 10 anni di esperienza infrastrutturale.', 'Kubernetes, AWS, CI/CD', 'Go, Bash, Python, Terraform', '3386667777', '@luca_cloud', 'Genova', 1, '[{"lingua":"Inglese","livello":"C1"}]', 1),
(8, 'Neolaureata con voglia di crescere nello sviluppo Backend.', 'OOP, DB Design, Git', 'C#, Java, SQL', '3397778888', '@giulia_dev', 'Napoli', 0, '[{"lingua":"Inglese","livello":"B1"}]', 0),
(9, 'Backend Developer appassionato di C# e architettura .NET Core.', '.NET Core, WebAPI, Microservices', 'C#, SQL, TypeScript', '3408889999', '@roby_net', 'Mestre', 0, '[{"lingua":"Inglese","livello":"B2"}]', 1),
(10, 'Web Designer e Frontend Developer dedita alla UI pulita.', 'Figma, Tailwind, React', 'JavaScript, HTML, CSS', '3419990000', '@martina_design', 'Bari', 0, '[{"lingua":"Inglese","livello":"B2"},{"lingua":"Spagnolo","livello":"B1"}]', 1),
(11, 'Embedded systems engineer e sviluppatore IoT.', 'Firmware, IoT, Hardware interfacing', 'C, C++, Rust, Python', '3421110001', '@ale_iot', 'Palermo', 0, '[{"lingua":"Inglese","livello":"B1"}]', 0),
(12, 'iOS Developer nativa con solida conoscenza di SwiftUI.', 'SwiftUI, Combine, CoreData', 'Swift, Objective-C', '3432220002', '@elena_ios', 'Milano', 1, '[{"lingua":"Inglese","livello":"C1"}]', 1),
(13, 'Android Developer esperto in architetture MVVM.', 'Jetpack Compose, Kotlin Coroutines, Clean Architecture', 'Kotlin, Java', '3443330003', '@fra_android', 'Torino', 0, '[{"lingua":"Inglese","livello":"B2"}]', 1),
(14, 'Frontend enthusiast appassionata di animazioni ed interattività.', 'CSS Grid, Framer Motion, React', 'JavaScript, TypeScript, HTML, CSS', '3454440004', '@chiara_web', 'Napoli', 0, '[{"lingua":"Inglese","livello":"B2"}]', 1),
(15, 'Database Administrator e SQL Developer.', 'DB Tuning, Backup & Recovery, Query optimization', 'SQL, T-SQL, PL/SQL, Bash', '3465550005', '@matteo_dba', 'Verona', 0, '[{"lingua":"Inglese","livello":"B1"}]', 0),
(16, 'Ruby on Rails and Javascript Full Stack Developer.', 'Rails, Hotwire, Postgres', 'Ruby, JavaScript, SQL', '3476660006', '@fran_rails', 'Firenze', 0, '[{"lingua":"Inglese","livello":"C1"}]', 1),
(17, 'Sviluppatore C++ senior specializzato in computer grafica e motori di gioco.', 'OpenGL, Direct3D, Game Engine Architecture', 'C++, C, Python', '3487770007', '@david_engine', 'Roma', 0, '[{"lingua":"Inglese","livello":"C2"}]', 1),
(18, 'Frontend engineer orientata a React e Next.js.', 'SSR, JAMstack, Web Performance', 'JavaScript, TypeScript, HTML, CSS', '3498880008', '@alice_next', 'Pisa', 1, '[{"lingua":"Inglese","livello":"B2"}]', 1),
(19, 'Veterano dello sviluppo web in PHP, Laravel e Symfony.', 'Architecture design, API integrations, CMS', 'PHP, JavaScript, SQL, HTML', '3509990009', '@stefano_laravel', 'Milano', 0, '[{"lingua":"Inglese","livello":"B1"}]', 1),
(20, 'Junior Developer entusiasta, specializzata in tecnologie Node.js.', 'Express, REST APIs, Git', 'JavaScript, HTML, CSS, SQL', '3510001111', '@vale_node', 'Padova', 0, '[{"lingua":"Inglese","livello":"B2"}]', 1),
(21, 'Sviluppatore backend Go / Python focalizzato sulle performance.', 'Microservices, Docker, Redis', 'Go, Python, SQL', '3521112222', '@andrea_go', 'Monza', 0, '[{"lingua":"Inglese","livello":"C1"}]', 1),
(22, 'UI/UX Designer convertita allo sviluppo Frontend.', 'Wireframing, Prototype, CSS layout', 'JavaScript, HTML, CSS, Figma', '3532223333', '@simo_ui', 'Roma', 0, '[{"lingua":"Inglese","livello":"B2"},{"lingua":"Francese","livello":"B1"}]', 1),
(23, 'DevOps Engineer con forte focus sulla sicurezza e AWS.', 'Terraform, Docker, Cloud Security', 'Bash, Python, Go', '3543334444', '@giorgio_devops', 'Remoto', 1, '[{"lingua":"Inglese","livello":"C1"}]', 1),
(24, 'Sviluppatrice Backend Node.js / PostgreSQL.', 'Express, Knex, DB Optimization', 'JavaScript, TypeScript, SQL', '3554445555', '@marti_back', 'Catania', 0, '[{"lingua":"Inglese","livello":"B2"}]', 1),
(25, 'Sviluppatore Python focalizzato su automazione e web scraping.', 'Scrapy, Selenium, Pandas', 'Python, SQL, Bash', '3565556666', '@fede_python', 'Brescia', 0, '[{"lingua":"Inglese","livello":"B1"}]', 0),
(26, 'Frontend Architect esperta di sistemi complessi Angular.', 'State management, RxJS, Custom directives', 'JavaScript, TypeScript, HTML, CSS', '3576667777', '@silvia_angular', 'Milano', 0, '[{"lingua":"Inglese","livello":"C1"},{"lingua":"Tedesco","livello":"A2"}]', 1),
(27, 'Sviluppatore Full Stack orientato ad architetture serverless.', 'Lambda, DynamoDB, API Gateway', 'TypeScript, Python, SQL', '3587778888', '@gabri_serverless', 'Cagliari', 0, '[{"lingua":"Inglese","livello":"B2"}]', 1),
(28, 'Junior Frontend Developer con focus su accessibilità e markup semantico.', 'HTML5 Semantic, WAI-ARIA, CSS Layouts', 'JavaScript, HTML, CSS', '3598889999', '@camilla_web', 'Ancona', 0, '[{"lingua":"Inglese","livello":"B2"}]', 1),
(29, 'Senior Backend Engineer / Team Lead.', 'System Design, Architecture, Mentoring', 'Go, Java, Python, SQL', '3609990000', '@lorenzo_lead', 'Roma', 1, '[{"lingua":"Inglese","livello":"C2"}]', 1),
(30, 'Sviluppatrice Laravel ed e-commerce specialist.', 'Laravel, WooCommerce, Stripe Integrations', 'PHP, SQL, JavaScript', '3610002222', '@sofia_laravel', 'Sassari', 0, '[{"lingua":"Inglese","livello":"B1"}]', 1),
(31, 'Mobile Developer specializzato in Flutter cross-platform.', 'Flutter, State management, Push Notifications', 'Dart, JavaScript', '3621113333', '@valerio_flutter', 'Milano', 0, '[{"lingua":"Inglese","livello":"B2"}]', 1);

-- Interazioni Datori -> Candidati (Save / Skip)
INSERT OR IGNORE INTO employer_interactions (employer_id, candidate_id, action) VALUES
(32, 1, 'save'),
(32, 2, 'save'),
(32, 3, 'skip'),
(33, 1, 'save'),
(33, 4, 'save'),
(33, 5, 'skip'),
(34, 1, 'save'),
(34, 6, 'save'),
(35, 7, 'save'),
(36, 8, 'save'),
(37, 9, 'save'),
(38, 10, 'save'),
(39, 11, 'save'),
(40, 12, 'save'),
(41, 13, 'save'),
(42, 14, 'save'),
(43, 15, 'save'),
(44, 16, 'save'),
(45, 17, 'save'),
(46, 18, 'save'),
(47, 19, 'save'),
(48, 20, 'save'),
(49, 21, 'save'),
(50, 22, 'save'),
(51, 23, 'save'),
(52, 24, 'save'),
(53, 25, 'save'),
(54, 26, 'save'),
(55, 27, 'save'),
(56, 28, 'save'),
(57, 29, 'save'),
(58, 30, 'save'),
(59, 31, 'save'),
(60, 2, 'save'),
(61, 3, 'save'),
(62, 4, 'save');

-- Proposte di Colloquio (Richieste)
INSERT OR IGNORE INTO interview_requests (employer_id, candidate_id, posizione_cercata, linguaggi_richiesti, range_stipendio, luogo, data_colloquio, ora_colloquio, luogo_colloquio, status) VALUES 
(32, 1, 'Lead Full Stack Developer', 'React, Node, Cloud', '40.000€ - 50.000€', 'Milano', '2026-07-10', '10:00:00', 'Sede SpecialeTech, Via Dante 10', 'accepted'),
(33, 1, 'Junior Developer', 'TypeScript', '25.000€', 'Milano', '2026-07-15', '14:30:00', 'Google Meet', 'pending'),
(33, 2, 'React Developer', 'JavaScript, CSS', '28.000€ - 35.000€', 'Milano', '2026-06-25', '11:00:00', 'Sede Centrale, Milano', 'accepted'),
(34, 4, 'Frontend Engineer', 'Vue.js, HTML, CSS', '26.000€ - 32.000€', 'Torino', '2026-06-28', '15:30:00', 'Microsoft Teams', 'pending'),
(35, 3, 'Java Backend Specialist', 'Java, SQL', '35.000€ - 42.000€', 'Roma', '2026-06-30', '09:30:00', 'Sede Roma, Via Nazionale 4', 'rejected'),
(36, 5, 'Python Data Scientist', 'Python, SQL, R', '32.000€ - 38.000€', 'Bologna', '2026-07-02', '10:00:00', 'Google Meet', 'accepted'),
(37, 6, 'Mobile App Developer', 'Dart, Flutter', '30.000€ - 35.000€', 'Firenze', '2026-07-03', '14:00:00', 'Sede Firenze', 'pending'),
(38, 7, 'DevOps / Cloud Engineer', 'Go, Bash, Terraform', '45.000€ - 55.000€', 'Remoto', '2026-07-04', '16:00:00', 'Google Meet', 'accepted'),
(39, 8, 'Backend Junior C#', 'C#, SQL', '24.000€', 'Napoli', '2026-07-05', '11:30:00', 'Teams', 'pending'),
(40, 9, 'C# Backend Developer', 'C#, SQL', '30.000€ - 36.000€', 'Mestre', '2026-07-06', '12:00:00', 'Sede WebAgency, Venezia', 'accepted');
