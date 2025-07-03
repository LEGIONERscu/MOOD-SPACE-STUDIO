const express = require('express');
const cors = require('cors');
const path = require('path');
const mongoose = require('mongoose');

const app = express();

// Налаштування CORS
app.use(cors({
    origin: ['http://localhost:3002', 'http://127.0.0.1:3002'],
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization']
}));

// Middleware
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// Підключення до MongoDB
mongoose.connect('mongodb://localhost:27017/moodspace', {
    useNewUrlParser: true,
    useUnifiedTopology: true
})
.then(() => {
    console.log('Підключено до MongoDB');
})
.catch((error) => {
    console.error('Помилка підключення до MongoDB:', error);
});

// Робочі години (9:00 - 19:00)
const WORKING_HOURS = Array.from({ length: 11 }, (_, i) => `${i + 9}:00`);

// Підключення маршрутів бронювання
const bookingsRouter = require('./routes/bookings');
app.use('/bookings', bookingsRouter);

// API endpoints
app.get('/api/available-slots/:date', async (req, res) => {
    try {
        const date = new Date(req.params.date);
        const bookings = await Booking.find({
            date: {
                $gte: new Date(date.setHours(0, 0, 0)),
                $lt: new Date(date.setHours(23, 59, 59))
            }
        });

        const bookedTimes = bookings.map(booking => booking.time);
        const availableTimes = WORKING_HOURS.filter(time => !bookedTimes.includes(time));

        res.json({ availableTimes });
    } catch (error) {
        console.error('Помилка отримання доступних слотів:', error);
        res.status(500).json({ error: 'Помилка сервера' });
    }
});

app.post('/api/bookings', async (req, res) => {
    try {
        const booking = new Booking(req.body);
        await booking.save();
        console.log('Нове бронювання створено:', booking);
        res.status(201).json({ 
            message: 'Бронювання успішно створено',
            booking
        });
    } catch (error) {
        console.error('Помилка створення бронювання:', error);
        res.status(400).json({ error: 'Помилка при створенні бронювання' });
    }
});

// Обробка статичних файлів
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'calendar.html'));
});

// Запуск сервера
const PORT = 3002;
app.listen(PORT, '0.0.0.0', () => {
    console.log(`Сервер запущено на порту ${PORT}`);
}); 