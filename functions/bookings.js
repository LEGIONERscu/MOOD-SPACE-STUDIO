const { MongoClient } = require('mongodb');

// MongoDB connection string
const MONGODB_URI = process.env.MONGODB_URI;

// Connect to MongoDB
async function connectToDatabase() {
    const client = await MongoClient.connect(MONGODB_URI);
    const db = client.db('moodspace');
    return { client, db };
}

// Working hours (9:00 - 19:00)
const WORKING_HOURS = Array.from({ length: 11 }, (_, i) => `${i + 9}:00`);

exports.handler = async (event, context) => {
    // Enable CORS
    const headers = {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Content-Type',
        'Access-Control-Allow-Methods': 'GET, POST, OPTIONS'
    };

    // Handle preflight requests
    if (event.httpMethod === 'OPTIONS') {
        return {
            statusCode: 200,
            headers,
            body: ''
        };
    }

    try {
        const { client, db } = await connectToDatabase();

        if (event.httpMethod === 'GET') {
            // Handle getting available slots
            const date = event.queryStringParameters.date;
            const bookings = await db.collection('bookings').find({
                date: {
                    $gte: new Date(date + 'T00:00:00.000Z'),
                    $lt: new Date(date + 'T23:59:59.999Z')
                }
            }).toArray();

            const bookedTimes = bookings.map(booking => booking.time);
            const availableTimes = WORKING_HOURS.filter(time => !bookedTimes.includes(time));

            await client.close();

            return {
                statusCode: 200,
                headers,
                body: JSON.stringify({ availableTimes })
            };
        }

        if (event.httpMethod === 'POST') {
            // Handle creating a booking
            const booking = JSON.parse(event.body);
            const result = await db.collection('bookings').insertOne({
                ...booking,
                date: new Date(booking.date),
                createdAt: new Date()
            });

            await client.close();

            return {
                statusCode: 201,
                headers,
                body: JSON.stringify({
                    message: 'Бронювання успішно створено',
                    booking: { ...booking, _id: result.insertedId }
                })
            };
        }

        return {
            statusCode: 405,
            headers,
            body: JSON.stringify({ error: 'Method not allowed' })
        };
    } catch (error) {
        console.error('Error:', error);
        return {
            statusCode: 500,
            headers,
            body: JSON.stringify({ error: 'Internal server error' })
        };
    }
}; 