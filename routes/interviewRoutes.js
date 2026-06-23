const express = require('express');
const router = express.Router();
const interviewController = require('../controllers/interviewController');
const authenticateToken = require('../middleware/authMiddleware');

router.post('/interview', authenticateToken, interviewController.proposeInterview);
router.get('/candidate/interviews', authenticateToken, interviewController.getCandidateInterviews);
router.put('/interview/status', authenticateToken, interviewController.setInterviewStatus);
// NB: questa rotta va registrata prima di "/employer/:id" (employerRoutes)
router.get('/employer/interviews', authenticateToken, interviewController.getEmployerInterviews);

module.exports = router;
