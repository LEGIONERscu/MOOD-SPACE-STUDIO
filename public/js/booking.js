document.addEventListener('DOMContentLoaded', () => {
  const bookingForm = document.getElementById('bookingForm');
  const successMessage = document.getElementById('successMessage');
  const errorMessage = document.getElementById('errorMessage');
  const submitBtn = document.querySelector('.submit-btn');

  function checkFormValidity() {
    if (!bookingForm) return;
    const name = bookingForm.name.value.trim();
    const email = bookingForm.email.value.trim();
    const phone = bookingForm.phone.value.trim();
    const date = bookingForm.date.value.trim();
    const duration = bookingForm.duration.value.trim();
    submitBtn.disabled = !(name && email && phone && date && duration);
  }

  if (bookingForm) {
    bookingForm.addEventListener('input', checkFormValidity);
    checkFormValidity(); // Перевірити одразу при завантаженні
    bookingForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      submitBtn.disabled = true;
      successMessage.textContent = '';
      errorMessage.textContent = '';

      const startTime = bookingForm.startTime.value;
      const duration = Number(bookingForm.duration.value);
      function addHours(time, hours) {
        const [h, m] = time.split(':').map(Number);
        const date = new Date(0, 0, 0, h, m);
        date.setHours(date.getHours() + hours);
        return date.toTimeString().slice(0,5);
      }
      const endTime = addHours(startTime, duration);

      const formData = {
        clientName: bookingForm.name.value,
        clientEmail: bookingForm.email.value,
        clientPhone: bookingForm.phone.value,
        date: bookingForm.date.value,
        duration: bookingForm.duration.value,
        startTime,
        endTime
      };

      try {
        const response = await fetch('https://mood-space-studio.onrender.com/bookings', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(formData)
        });
        const data = await response.json();
        if (response.ok) {
          successMessage.textContent = 'Бронювання успішно створено! Перевірте email для підтвердження.';
          successMessage.style.display = 'block';
          errorMessage.textContent = '';
          errorMessage.style.display = 'none';
          bookingForm.reset();
          submitBtn.disabled = true;
        } else {
          throw new Error(data.error || 'Помилка при створенні бронювання');
        }
      } catch (error) {
        errorMessage.textContent = error.message;
        errorMessage.style.display = 'block';
        successMessage.textContent = '';
        successMessage.style.display = 'none';
        submitBtn.disabled = false;
      }
    });
  }
}); 