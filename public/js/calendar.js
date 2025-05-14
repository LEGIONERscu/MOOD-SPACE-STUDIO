document.addEventListener('DOMContentLoaded', async function () {
    const calendarEl = document.getElementById('calendar');
    const selectedDateInput = document.getElementById('selectedDate');
    const submitBtn = document.querySelector('.submit-btn');
    const durationSelect = document.getElementById('duration');

    // Отримуємо всі бронювання з бекенду
    let bookings = [];
    try {
        bookings = await fetch('/.netlify/functions/get-bookings').then(res => res.json());
    } catch (e) {
        bookings = [];
    }

    // Групуємо бронювання по датах
    const bookingsByDate = {};
    bookings.forEach(b => {
        const date = b.date.slice(0, 10); // YYYY-MM-DD
        if (!bookingsByDate[date]) bookingsByDate[date] = [];
        bookingsByDate[date].push(Number(b.duration));
    });

    // Створюємо простий календар на поточний місяць
    const today = new Date();
    const year = today.getFullYear();
    const month = today.getMonth();
    const daysInMonth = new Date(year, month + 1, 0).getDate();

    let selectedDay = null;

    const calendarGrid = document.createElement('div');
    calendarGrid.style.display = 'grid';
    calendarGrid.style.gridTemplateColumns = 'repeat(7, 1fr)';
    calendarGrid.style.gap = '6px';

    // Дні тижня
    const weekDays = ['Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб', 'Нд'];
    weekDays.forEach(day => {
        const wd = document.createElement('div');
        wd.textContent = day;
        wd.style.textAlign = 'center';
        wd.style.fontWeight = 'bold';
        wd.style.color = '#888';
        calendarGrid.appendChild(wd);
    });

    // Порожні клітинки до першого дня місяця
    const firstDay = new Date(year, month, 1).getDay() || 7;
    for (let i = 1; i < firstDay; i++) {
        const empty = document.createElement('div');
        calendarGrid.appendChild(empty);
    }

    // Дні місяця
    for (let day = 1; day <= daysInMonth; day++) {
        const date = new Date(year, month, day);
        const dateStr = `${year}-${String(month+1).padStart(2,'0')}-${String(day).padStart(2,'0')}`;
        const cell = document.createElement('button');
        cell.type = 'button';
        cell.textContent = day;
        cell.style.padding = '0.7em 0';
        cell.style.border = 'none';
        cell.style.borderRadius = '6px';
        cell.style.background = '#fff';
        cell.style.cursor = 'pointer';
        cell.style.fontWeight = '500';
        cell.style.transition = 'background 0.2s, color 0.2s';
        cell.style.color = '#222';

        // Неактивні минулі дні
        if (date < today.setHours(0,0,0,0)) {
            cell.disabled = true;
            cell.style.background = '#eee';
            cell.style.color = '#bbb';
            cell.style.cursor = 'not-allowed';
        }
        // Блокуємо дати, де вже заброньовано 8 годин
        if (bookingsByDate[dateStr] && bookingsByDate[dateStr].reduce((a,b)=>a+b,0) >= 8) {
            cell.disabled = true;
            cell.style.background = '#ffe0e0';
            cell.style.color = '#bbb';
            cell.style.cursor = 'not-allowed';
        }

        cell.addEventListener('click', function () {
            // Знімаємо виділення з попереднього
            if (selectedDay) selectedDay.style.background = '#fff';
            cell.style.background = '#111';
            cell.style.color = '#fff';
            selectedDay = cell;
            // Записуємо дату у приховане поле
            selectedDateInput.value = dateStr;
            // Оновлюємо доступні тривалості
            updateDurationOptions(dateStr);
            // Активуємо кнопку, якщо всі поля заповнені
            checkFormValidity();
        });
        calendarGrid.appendChild(cell);
    }

    calendarEl.appendChild(calendarGrid);

    function updateDurationOptions(dateStr) {
        // Розраховуємо зайняті години на цю дату
        const booked = bookingsByDate[dateStr] || [];
        const bookedSum = booked.reduce((a,b)=>a+b,0);
        // Очищаємо select
        Array.from(durationSelect.options).forEach((opt, i) => {
            if (i === 0) return; // placeholder
            const val = Number(opt.value);
            // Якщо не вистачає годин — блокуємо
            opt.disabled = (val > (8 - bookedSum));
        });
        durationSelect.value = '';
    }

    // Деактивуємо кнопку, якщо дата не вибрана
    function checkFormValidity() {
        const form = document.getElementById('bookingForm');
        if (
            selectedDateInput.value &&
            form.name.value &&
            form.email.value &&
            form.phone.value &&
            form.duration.value
        ) {
            submitBtn.disabled = false;
        } else {
            submitBtn.disabled = true;
        }
    }

    document.getElementById('bookingForm').addEventListener('input', checkFormValidity);
}); 