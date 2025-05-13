const { MongoClient } = require('mongodb');
const nodemailer = require('nodemailer');

exports.handler = async (event, context) => {
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: 'Method Not Allowed' };
  }

  try {
    const data = JSON.parse(event.body);
    
    // Підключення до MongoDB Atlas
    const client = await MongoClient.connect(process.env.MONGODB_URI);
    const db = client.db();
    
    // Збереження бронювання
    const result = await db.collection('bookings').insertOne({
      ...data,
      createdAt: new Date(),
      status: 'pending'
    });

    // Налаштування відправки email
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
      }
    });

    // Відправка підтвердження
    await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to: data.clientEmail,
      subject: 'Підтвердження бронювання - MOOD SPACE',
      html: `
        <h1>Дякуємо за бронювання!</h1>
        <p>Ваше бронювання на ${new Date(data.date).toLocaleDateString()} з ${data.startTime} до ${data.endTime} отримано.</p>
        <p>Ми зв'яжемося з вами найближчим часом для підтвердження.</p>
      `
    });

    client.close();

    return {
      statusCode: 200,
      body: JSON.stringify({ success: true, booking: result.ops[0] })
    };
  } catch (error) {
    return {
      statusCode: 500,
      body: JSON.stringify({ error: error.message })
    };
  }
}; 