const mongoose = require("mongoose");
const { json } = require("express");

// MongoDB connection
let cachedDb = null;

async function connectToDatabase() {
    if (cachedDb) {
        return cachedDb;
    }
    
    const mongoURI = process.env.MONGODB_URI;
    if (!mongoURI) {
        throw new Error('MONGODB_URI is not defined');
    }

    const db = await mongoose.connect(mongoURI);
    cachedDb = db;
    return db;
}

// Define Schema
const SensorDataSchema = new mongoose.Schema({
    temperature: Number,
    humidity: Number,
    timestamp: { type: Date, default: Date.now },
});

// Ensure model isn't recreated
const SensorData = mongoose.models.SensorData || mongoose.model("SensorData", SensorDataSchema);

// Serverless function handler
module.exports = async (req, res) => {
    // Enable CORS
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }

    try {
        await connectToDatabase();

        // Route handling based on path
        const path = req.url;

        if (req.method === 'GET') {
            if (path === '/api/data') {
                const latestData = await SensorData.find().sort({ timestamp: -1 }).limit(1);
                return res.json(latestData[0] || { error: "No data found" });
            }
            
            if (path === '/api/data/history') {
                const historicalData = await SensorData.find().sort({ timestamp: -1 }).limit(100);
                return res.json(historicalData);
            }

            if (path === '/api/test') {
                return res.json({ message: "API is working" });
            }

            // Add other GET routes here...
        }

        if (req.method === 'POST' && path === '/api/data') {
            const { temperature, humidity } = req.body;
            
            if (!temperature || !humidity) {
                return res.status(400).json({ error: "Invalid data format" });
            }

            const newData = new SensorData({ temperature, humidity });
            await newData.save();
            return res.status(200).json({ message: "Data saved successfully" });
        }

        return res.status(404).json({ error: "Route not found" });

    } catch (error) {
        console.error('API Error:', error);
        return res.status(500).json({ error: "Internal server error" });
    }
};
