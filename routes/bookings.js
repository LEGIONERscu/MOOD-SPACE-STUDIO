const express = require('express');
const router = express.Router();
const bookingController = require('../controllers/bookingController');

// Публічні маршрути
router.post('/', bookingController.createBooking);

// Захищені маршрути (потребують автентифікації)
router.get('/', bookingController.getBookings);
router.patch('/:id/status', bookingController.updateBookingStatus);

module.exports = router; 