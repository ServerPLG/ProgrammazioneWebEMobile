const express = require('express');
const router = express.Router();
const employerController = require('../controllers/employerController');
const authenticateToken = require('../middleware/authMiddleware');

// Info azienda pubblica (usata anche dalle pagine accessibili senza login)
router.get('/employer/:id', employerController.getEmployer);
router.get('/employer-profile/:userId', authenticateToken, employerController.getEmployerProfile);
router.post('/employer-profile', authenticateToken, employerController.saveEmployerProfile);

module.exports = router;
