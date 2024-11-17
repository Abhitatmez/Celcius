const express = require("express");
const mongoose = require("mongoose");
const path = require("path");
const app = express();
const port = 3000;

// Middleware to parse JSON bodies
app.use(express.json());

// Middleware to serve static files (like HTML, CSS, JS, and images)
app.use(express.static("public")); // Serve files from 'public' directory
app.use("/images", express.static(path.join(__dirname, "images"))); // Serve images from 'images' folder

// MongoDB connection
const mongoURI = 'mongodb+srv://abhijithtatme:ABHI1289@sensing.0u7q7.mongodb.net/iot_db'; // Replace with your MongoDB URI
mongoose
  .connect(mongoURI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log("Connected to MongoDB"))
  .catch((error) => console.error("MongoDB connection error:", error));

// Define a schema and model for storing sensor data
const SensorDataSchema = new mongoose.Schema({
  temperature: Number,
  humidity: Number,
  timestamp: { type: Date, default: Date.now },
});

const SensorData = mongoose.model("SensorData", SensorDataSchema);

// Home route - serves index.html
app.get("/", (req, res) => {
  res.sendFile(__dirname + "/public/index.html");
});

// Route to handle data from ESP8266
app.post("/data", async (req, res) => {
  const { temperature, humidity } = req.body;

  // Save the data to MongoDB
  try {
    const newData = new SensorData({ temperature, humidity });
    await newData.save();
    res.status(200).send("Data received and saved to MongoDB");
    console.log("Data received:", { temperature, humidity });
  } catch (error) {
    console.error("Error saving data to MongoDB:", error);
    res.status(500).send("Error saving data");
  }
});

// Route to send the latest sensor data (used for fetching)
app.get("/data", async (req, res) => {
  try {
    // Get the most recent data from MongoDB
    const latestData = await SensorData.find().sort({ timestamp: -1 }).limit(1);
    if (latestData.length > 0) {
      res.json(latestData[0]); // Send the latest record as JSON
    } else {
      res.status(404).send("No data found");
    }
  } catch (error) {
    console.error("Error fetching data:", error);
    res.status(500).send("Error fetching data");
  }
});

// Start server
app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});
