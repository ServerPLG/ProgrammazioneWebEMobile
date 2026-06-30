const router = require('express').Router();
const c = require('../controllers/devcardController');
const auth = require('../middleware/authMiddleware');

router.get('/devcards', auth, c.getDevcards);
router.get('/devcards/saved', auth, c.getSavedDevcards);
router.post('/interact', auth, c.interact);
router.delete('/interact', auth, c.removeInteraction);

module.exports = router;
