// Importo il modulo per collegarmi al database MySQL (scaricato con npm install mysql2)
const mysql = require('mysql2');

// Serve per leggere le variabili dal file .env (tipo la password del database, così non la scrivo qua)
require('dotenv').config();

// Creo un "pool" di connessioni. Il prof ha detto che è meglio di una singola connessione
// perchè così può gestire più richieste contemporaneamente senza bloccarsi.
const pool = mysql.createPool({
    host: process.env.DB_HOST, // Indirizzo del server del database (di solito localhost se uso XAMPP)
    user: process.env.DB_USER, // Nome utente del database (di solito è "root")
    password: process.env.DB_PASSWORD, // La password (su XAMPP spesso è vuota)
    database: process.env.DB_NAME, // Il nome del database che ho creato su phpMyAdmin
    waitForConnections: true, // Se sono finite le connessioni, aspetta che se ne liberi una
    connectionLimit: 10, // Massimo 10 connessioni aperte contemporaneamente
    queueLimit: 0
});

// Esporto il pool usando le promises, così dopo posso usare async/await al posto delle callbacks
module.exports = pool.promise();

