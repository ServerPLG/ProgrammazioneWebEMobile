const router = require('express').Router();
const c = require('../controllers/interviewController');
const auth = require('../middleware/authMiddleware');

router.post('/interview', auth, c.proposeInterview);
router.get('/candidate/interviews', auth, c.getCandidateInterviews);
router.put('/interview/status', auth, c.setInterviewStatus);
router.get('/employer/interviews', auth, c.getEmployerInterviews); // prima di "/employer/:id"

module.exports = router;
