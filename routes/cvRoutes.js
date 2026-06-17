const express = require('express');
const router = express.Router();
const cvController = require('../controllers/cvController');
const authenticateToken = require('../middleware/authMiddleware');

// Lettura CV pubblica (profilo via QR), salvataggio protetto
router.get('/cv/:userId', cvController.getCv);
router.post('/cv', authenticateToken, cvController.saveCv);

module.exports = router;
