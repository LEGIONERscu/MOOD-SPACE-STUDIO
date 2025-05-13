document.addEventListener('DOMContentLoaded', () => {
  const bookingForm = document.getElementById('bookingForm');
  const successMessage = document.getElementById('successMessage');
  const errorMessage = document.getElementById('errorMessage');

  if (bookingForm) {
    bookingForm.addEventListener('submit', async (e) => {
      e.preventDefault();

      const formData = {
        clientName: document.getElementById('clientName').value,
        clientEmail: document.getElementById('clientEmail').value,
        clientPhone: document.getElementById('clientPhone').value,
        date: document.getElementById('date').value,
        startTime: document.getElementById('startTime').value,
        endTime: document.getElementById('endTime').value,
        notes: document.getElementById('notes').value
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
          successMessage.style.display = 'block';
          errorMessage.style.display = 'none';
          bookingForm.reset();
        } else {
          throw new Error(data.error || 'Помилка при створенні бронювання');
        }
      } catch (error) {
        errorMessage.textContent = error.message;
        errorMessage.style.display = 'block';
        successMessage.style.display = 'none';
      }
    });
  }

  // Функція для перевірки доступності дати
  async function checkDateAvailability(date) {
    try {
      const response = await fetch(`/api/bookings?date=${date}`);
      const bookings = await response.json();
      
      // Тут можна додати логіку перевірки доступності
      return true;
    } catch (error) {
      console.error('Помилка перевірки доступності:', error);
      return false;
    }
  }
}); 