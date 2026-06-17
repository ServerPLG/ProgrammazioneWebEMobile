const express = require('express');
const router = express.Router();
const devcardController = require('../controllers/devcardController');
const authenticateToken = require('../middleware/authMiddleware');

router.get('/devcards', authenticateToken, devcardController.getDevcards);
router.get('/devcards/saved', authenticateToken, devcardController.getSavedDevcards);
router.post('/interact', authenticateToken, devcardController.interact);
router.delete('/interact', authenticateToken, devcardController.removeInteraction);

module.exports = router;
