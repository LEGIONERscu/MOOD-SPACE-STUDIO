const Booking = require('../models/Booking');
const nodemailer = require('nodemailer');

// Налаштування відправки email
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  }
});

// Створення нового бронювання
exports.createBooking = async (req, res) => {
  try {
    const booking = new Booking(req.body);
    await booking.save();

    // Відправка підтвердження клієнту
    await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to: booking.clientEmail,
      subject: 'Підтвердження бронювання - MOOD SPACE',
      html: `
        <h1>Дякуємо за бронювання!</h1>
        <p>Ваше бронювання на ${booking.date.toLocaleDateString()} з ${booking.startTime} до ${booking.endTime} отримано.</p>
        <p>Ми зв'яжемося з вами найближчим часом для підтвердження.</p>
      `
    });

    res.status(201).json(booking);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// Отримання всіх бронювань
exports.getBookings = async (req, res) => {
  try {
    const bookings = await Booking.find().sort({ date: 1 });
    res.json(bookings);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Оновлення статусу бронювання
exports.updateBookingStatus = async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id);
    if (!booking) {
      return res.status(404).json({ message: 'Бронювання не знайдено' });
    }

    booking.status = req.body.status;
    await booking.save();

    // Відправка повідомлення про зміну статусу
    await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to: booking.clientEmail,
      subject: 'Оновлення статусу бронювання - MOOD SPACE',
      html: `
        <h1>Статус вашого бронювання оновлено</h1>
        <p>Ваше бронювання на ${booking.date.toLocaleDateString()} з ${booking.startTime} до ${booking.endTime} тепер має статус: ${req.body.status}</p>
      `
    });

    res.json(booking);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
}; 