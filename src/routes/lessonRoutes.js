const express = require('express');
const { createLesson, getLessons } = require('../controllers/lessonController');
const { authenticate, authorize } = require('../middleware/auth');
const { ROLES } = require('../constants/roles');

const router = express.Router();

router.post('/', authenticate, authorize(ROLES.MENTOR), createLesson);
router.get('/', authenticate, getLessons);

module.exports = router;
