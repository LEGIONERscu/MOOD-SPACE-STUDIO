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
        <h1>Дякуємо за бронювання у MOOD SPACE!</h1>
        <p>Ваше бронювання на <b>${booking.date.toLocaleDateString()}</b> з <b>${booking.startTime || ''}</b> до <b>${booking.endTime || ''}</b> отримано.</p>
        <p>Для підтвердження бронювання необхідно оплатити завдаток <b>500 грн</b> на картку:</p>
        <p><b>4441 1144 1234 5678</b> (ПриватБанк, отримувач: Іваненко Іван)</p>
        <p>Після оплати, будь ласка, надішліть скріншот чеку у відповідь на цей лист або у Instagram.</p>
        <p>Дякуємо за вибір нашої студії!</p>
      `
    });

    // Відправка листа адміністратору
    try {
      await transporter.sendMail({
        from: process.env.EMAIL_USER,
        to: process.env.ADMIN_EMAIL,
        subject: 'Нове бронювання - MOOD SPACE',
        html: `
          <h1>Нове бронювання!</h1>
          <p>Ім'я: <b>${booking.clientName || booking.name}</b></p>
          <p>Email: <b>${booking.clientEmail || booking.email}</b></p>
          <p>Телефон: <b>${booking.clientPhone || booking.phone}</b></p>
          <p>Дата: <b>${booking.date.toLocaleDateString()}</b></p>
          <p>Тривалість: <b>${booking.duration || ''}</b></p>
          <p>Додатково: <b>${booking.notes || ''}</b></p>
        `
      });
    } catch (adminMailError) {
      console.error('Admin email error:', adminMailError);
    }

    res.status(201).json(booking);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// Отримання всіх бронювань (з фільтрацією по місяцю)
exports.getBookings = async (req, res) => {
  try {
    let query = {};
    if (req.query.month) {
      // month у форматі YYYY-MM
      const [year, month] = req.query.month.split('-').map(Number);
      const start = new Date(year, month - 1, 1);
      const end = new Date(year, month, 1);
      query.date = { $gte: start, $lt: end };
    }
    const bookings = await Booking.find(query).sort({ date: 1 });
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