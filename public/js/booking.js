document.addEventListener('DOMContentLoaded', () => {
  const bookingForm = document.getElementById('bookingForm');
  const successMessage = document.getElementById('successMessage');
  const errorMessage = document.getElementById('errorMessage');
  const submitBtn = document.querySelector('.submit-btn');

  if (bookingForm) {
    bookingForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      submitBtn.disabled = true;
      successMessage.textContent = '';
      errorMessage.textContent = '';

      const formData = {
        name: bookingForm.name.value,
        email: bookingForm.email.value,
        phone: bookingForm.phone.value,
        date: bookingForm.date.value,
        time: bookingForm.time.value
      };

      try {
        const response = await fetch('/.netlify/functions/create-booking', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(formData)
        });
        const data = await response.json();
        if (response.ok) {
          successMessage.textContent = 'Бронювання успішно створено! Перевірте email для підтвердження.';
          errorMessage.textContent = '';
          bookingForm.reset();
          submitBtn.disabled = true;
        } else {
          throw new Error(data.error || 'Помилка при створенні бронювання');
        }
      } catch (error) {
        errorMessage.textContent = error.message;
        successMessage.textContent = '';
        submitBtn.disabled = false;
      }
    });
  }
}); 