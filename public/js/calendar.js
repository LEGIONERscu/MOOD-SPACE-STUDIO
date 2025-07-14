document.addEventListener('DOMContentLoaded', function () {
    const calendarGrid = document.getElementById('calendarGrid');
    const monthTitle = document.getElementById('currentMonth');
    const prevMonthBtn = document.getElementById('prevMonth');
    const nextMonthBtn = document.getElementById('nextMonth');
    const timeSlots = document.getElementById('timeSlots');
    const timeSlotsContainer = document.getElementById('timeSlotsContainer');

    let currentDate = new Date();
    const WORKING_HOURS = [
        '09:00','10:00','11:00','12:00','13:00','14:00','15:00','16:00','17:00','18:00','19:00'
    ];

    async function fetchBookings(year, month) {
        const ym = `${year}-${String(month+1).padStart(2,'0')}`;
        const res = await fetch(`/bookings?month=${ym}`);
        if (!res.ok) return [];
        return await res.json();
    }

    function formatDate(date) {
        return date.toISOString().split('T')[0];
    }

    function getMonthName(month) {
        return ['Січень','Лютий','Березень','Квітень','Травень','Червень','Липень','Серпень','Вересень','Жовтень','Листопад','Грудень'][month];
    }

    async function renderCalendar(year, month) {
        monthTitle.textContent = `${getMonthName(month)} ${year}`;
        // Очищаємо сітку, залишаючи заголовки днів тижня
        while (calendarGrid.children.length > 7) {
            calendarGrid.removeChild(calendarGrid.lastChild);
        }
        // Отримуємо бронювання за місяць
        const bookings = await fetchBookings(year, month);
        // Групуємо по датах
        const bookingsByDate = {};
        bookings.forEach(b => {
            const date = b.date.slice(0,10);
            if (!bookingsByDate[date]) bookingsByDate[date] = [];
            bookingsByDate[date].push({start: b.startTime, end: b.endTime});
        });
        // Дати місяця
        const firstDay = new Date(year, month, 1);
        const lastDay = new Date(year, month+1, 0);
        const daysInMonth = lastDay.getDate();
        const today = new Date();
        // Порожні клітинки до першого дня місяця
        let startDay = firstDay.getDay() || 7;
        for (let i = 1; i < startDay; i++) {
            const empty = document.createElement('div');
            empty.className = 'calendar-day';
            calendarGrid.appendChild(empty);
        }
        // Дні місяця
        for (let day = 1; day <= daysInMonth; day++) {
            const date = new Date(year, month, day);
            const dateStr = `${year}-${String(month+1).padStart(2,'0')}-${String(day).padStart(2,'0')}`;
            const cell = document.createElement('div');
            cell.className = 'calendar-day';
            cell.textContent = day;
            // Сьогодні
            if (date.toDateString() === today.toDateString()) {
                cell.classList.add('today');
            }
            // Минулі дні
            if (date < new Date(today.getFullYear(), today.getMonth(), today.getDate())) {
                cell.classList.add('booked');
                cell.style.cursor = 'not-allowed';
            }
            // Дні з бронюваннями
            if (bookingsByDate[dateStr] && bookingsByDate[dateStr].length > 0) {
                cell.classList.add('booked');
                cell.style.background = '#ffe0e0';
            }
            // Клік по дню
            if (date >= new Date(today.getFullYear(), today.getMonth(), today.getDate())) {
                cell.addEventListener('click', () => {
                    // Показати слоти
                    showTimeSlots(dateStr, bookingsByDate[dateStr] || []);
                    // Виділити день
                    document.querySelectorAll('.calendar-day').forEach(d => d.classList.remove('selected'));
                    cell.classList.add('selected');
                });
            }
            calendarGrid.appendChild(cell);
        }
    }

    function showTimeSlots(dateStr, busyIntervals) {
        timeSlots.classList.add('active');
        timeSlotsContainer.innerHTML = '';
        WORKING_HOURS.forEach(time => {
            // Перевіряємо, чи слот зайнятий
            let isBusy = false;
            for (const b of busyIntervals) {
                if (time >= b.start && time < b.end) {
                    isBusy = true;
                    break;
                }
            }
            const slot = document.createElement('div');
            slot.className = 'time-slot' + (isBusy ? ' booked' : '');
            slot.textContent = time;
            if (!isBusy) {
                slot.addEventListener('click', () => {
                    document.querySelectorAll('.time-slot').forEach(s => s.classList.remove('selected'));
                    slot.classList.add('selected');
                    // Тут можна додати дію для бронювання
                });
            }
            timeSlotsContainer.appendChild(slot);
        });
    }

    // Навігація по місяцях
    prevMonthBtn.addEventListener('click', () => {
        currentDate.setMonth(currentDate.getMonth() - 1);
        renderCalendar(currentDate.getFullYear(), currentDate.getMonth());
    });
    nextMonthBtn.addEventListener('click', () => {
        currentDate.setMonth(currentDate.getMonth() + 1);
        renderCalendar(currentDate.getFullYear(), currentDate.getMonth());
    });

    // Початковий рендер
    renderCalendar(currentDate.getFullYear(), currentDate.getMonth());
}); 