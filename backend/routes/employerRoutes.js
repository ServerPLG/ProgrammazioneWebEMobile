const router = require('express').Router();
const c = require('../controllers/employerController');
const auth = require('../middleware/authMiddleware');

router.get('/employer/:id', c.getEmployer); // info azienda pubblica
router.get('/employer-profile', auth, c.getEmployerProfile);
router.post('/employer-profile', auth, c.saveEmployerProfile);

module.exports = router;
