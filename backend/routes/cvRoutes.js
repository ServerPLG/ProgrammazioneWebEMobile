const router = require('express').Router();
const c = require('../controllers/cvController');
const auth = require('../middleware/authMiddleware');

router.get('/cv/:userId', c.getCv); // lettura pubblica (profilo via QR)
router.post('/cv', auth, c.saveCv);

module.exports = router;
