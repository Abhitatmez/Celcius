# Celsius - IoT Temperature Monitoring System

A real-time IoT temperature and humidity monitoring system using ESP8266, DHT11 sensor, MongoDB, and Vercel deployment.

## 🌡️ Overview

Celsius is a web-based monitoring system that collects temperature and humidity data from a DHT11 sensor connected to an ESP8266 microcontroller. The data is stored in MongoDB and displayed through a responsive web interface.

## 🚀 Features

- Real-time temperature and humidity monitoring
- Historical data tracking and visualization
- Responsive dashboard interface
- Alert system for threshold violations
- Mobile-friendly design

## 🛠️ Technology Stack

- **Hardware**
  - ESP8266 Microcontroller
  - DHT11 Temperature & Humidity Sensor

- **Backend**
  - MongoDB (Database)
  - Node.js
  - Express.js

- **Frontend**
  - HTML5
  - CSS3
  - JavaScript
  - Chart.js for data visualization

- **Deployment**
  - Vercel (Hosting)
  - MongoDB Atlas (Database hosting)


## 🔧 Setup and Installation

1. **Hardware Setup**
   - Connect DHT11 sensor to ESP8266
   - Flash the ESP8266 with provided code
   - Configure WiFi credentials

2. **MongoDB Setup**
   ```bash
   # Create a MongoDB Atlas account
   # Create a new cluster
   # Get your connection string
   ```

3. **Project Setup**
   ```bash
   # Clone the repository
   git clone https://github.com/yourusername/celsius.git
   cd celsius

   # Install dependencies
   npm install
   ```

4. **Environment Variables**
   - Create MongoDB connection string
   - Add to Vercel environment variables:
     - `MONGODB_URI`: Your MongoDB connection string

5. **Deployment**
   ```bash
   # Deploy to Vercel
   vercel
   ```

## 📊 Dashboard Features

- Real-time temperature and humidity display
- Historical data graphs
- Alert notifications
- Customizable settings
- Mobile-responsive design

## 🔌 API Endpoints

- `GET /api/data` - Get latest sensor readings
- `POST /api/data` - Submit new sensor readings
- `GET /api/data/history` - Get historical data
- `GET /api/data/stats` - Get statistical data

## 📱 Screenshots

[Add screenshots of your dashboard here]

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## ✨ Acknowledgements

- Chart.js for data visualization
- Font Awesome for icons
- MongoDB Atlas for database hosting
- Vercel for deployment

## 📞 Contact

[Your Name] - [Your Email]

Project Link: [https://github.com/yourusername/celsius](https://github.com/yourusername/celsius)
