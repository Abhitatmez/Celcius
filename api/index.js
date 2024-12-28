const express = require("express");
const mongoose = require("mongoose");
const app = express();

// Middleware
app.use(express.json());

// MongoDB connection
const mongoURI = process.env.MONGODB_URI;
mongoose
  .connect(mongoURI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log("Connected to MongoDB"))
  .catch((error) => console.error("MongoDB connection error:", error));

// Define Schema
const SensorDataSchema = new mongoose.Schema({
  temperature: Number,
  humidity: Number,
  timestamp: { type: Date, default: Date.now },
});

const SensorData = mongoose.model("SensorData", SensorDataSchema);

// Routes
app.get("/api/data", async (req, res) => {
  try {
    const latestData = await SensorData.find().sort({ timestamp: -1 }).limit(1);
    if (latestData.length > 0) {
      res.json(latestData[0]);
    } else {
      res.status(404).send("No data found");
    }
  } catch (error) {
    console.error("Error fetching data:", error);
    res.status(500).send("Error fetching data");
  }
});

app.post("/api/data", async (req, res) => {
  const { temperature, humidity } = req.body;
  
  if (!temperature || !humidity) {
    return res.status(400).send("Invalid data format");
  }

  try {
    const newData = new SensorData({ temperature, humidity });
    await newData.save();
    res.status(200).send("Data received and saved to MongoDB");
  } catch (error) {
    console.error("Detailed MongoDB error:", error);
    res.status(500).send("Error saving data");
  }
});

app.get("/api/data/today-count", async (req, res) => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const count = await SensorData.countDocuments({
      timestamp: { $gte: today }
    });
    
    res.json({ count });
  } catch (error) {
    res.status(500).send("Error fetching count");
  }
});

app.get("/api/data/stats", async (req, res) => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const stats = await SensorData.aggregate([
      {
        $match: {
          timestamp: { $gte: today }
        }
      },
      {
        $group: {
          _id: null,
          avgTemperature: { $avg: "$temperature" },
          avgHumidity: { $avg: "$humidity" },
          readingsToday: { $sum: 1 }
        }
      }
    ]);

    if (stats.length > 0) {
      res.json({
        avgTemperature: stats[0].avgTemperature,
        avgHumidity: stats[0].avgHumidity,
        readingsToday: stats[0].readingsToday
      });
    } else {
      res.json({
        avgTemperature: 0,
        avgHumidity: 0,
        readingsToday: 0
      });
    }
  } catch (error) {
    res.status(500).json({ error: "Error calculating statistics" });
  }
});

app.get("/api/data/history", async (req, res) => {
  try {
    const historicalData = await SensorData.find({}).sort({ timestamp: -1 }).limit(100);
    return res.status(200).json(historicalData);
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
});

// Export the Express API
module.exports = app;