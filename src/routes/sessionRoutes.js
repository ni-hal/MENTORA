const express = require('express');
const { createSession, getLessonSessions, getSessionById } = require('../controllers/sessionController');
const { authenticate, authorize } = require('../middleware/auth');
const { ROLES } = require('../constants/roles');

const router = express.Router();

router.post('/', authenticate, authorize(ROLES.MENTOR), createSession);
router.get('/lessons/:lessonId/sessions', authenticate, getLessonSessions);
router.get('/:id', authenticate, getSessionById);

module.exports = router;
