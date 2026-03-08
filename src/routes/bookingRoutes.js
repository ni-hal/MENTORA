const express = require('express');
const { createBooking } = require('../controllers/bookingController');
const { authenticate, authorize } = require('../middleware/auth');
const { ROLES } = require('../constants/roles');

const router = express.Router();

// Only parents can create bookings
router.post('/', authenticate, authorize(ROLES.PARENT), createBooking);

module.exports = router;
