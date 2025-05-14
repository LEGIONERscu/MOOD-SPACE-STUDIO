const { MongoClient } = require('mongodb');

exports.handler = async (event, context) => {
  try {
    const client = await MongoClient.connect(process.env.MONGODB_URI);
    const db = client.db();
    const bookings = await db.collection('bookings').find({}).toArray();
    client.close();

    // Повертаємо тільки дату і тривалість
    const result = bookings.map(b => ({
      date: b.date,
      duration: b.duration
    }));

    return {
      statusCode: 200,
      body: JSON.stringify(result)
    };
  } catch (error) {
    return {
      statusCode: 500,
      body: JSON.stringify({ error: error.message })
    };
  }
}; 