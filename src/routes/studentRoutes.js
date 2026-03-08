const express = require('express');
const { createStudent, getStudents } = require('../controllers/studentController');
const { authenticate, authorize } = require('../middleware/auth');
const { ROLES } = require('../constants/roles');

const router = express.Router();

router.post('/', authenticate, authorize(ROLES.PARENT), createStudent);
router.get('/', authenticate, authorize(ROLES.PARENT), getStudents);

module.exports = router;
