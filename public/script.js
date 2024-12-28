// Configuration
const CONFIG = {
    updateInterval: 5000, // Update interval in milliseconds
    temperatureThresholds: {
        min: 18,
        max: 30
    },
    humidityThresholds: {
        min: 30,
        max: 70
    }
};

// State management
let sensorData = {
    temperature: [],
    humidity: [],
    lastUpdate: null,
    readingsToday: 0
};

// Fetch sensor data from the server
async function fetchSensorData() {
    try {
        const response = await fetch('/data');
        const data = await response.json();
        console.log("Received data:", data); // Debug log
        
        // Check if we received valid data
        if (data && typeof data.temperature === 'number' && typeof data.humidity === 'number') {
            updateUI(data);
            return data;
        } else {
            console.error('Invalid data format received:', data);
            return null;
        }
    } catch (error) {
        console.error('Error fetching sensor data:', error);
        showAlert('Error fetching sensor data', 'danger');
        return null;
    }
}

// Update UI with new sensor data
function updateUI(data) {
    console.log("Updating UI with data:", data);  // Debug log
    
    // Update current values
    const tempElement = document.getElementById('temperature');
    const humElement = document.getElementById('humidity');
    
    if (tempElement) tempElement.textContent = `${data.temperature.toFixed(1)}°C`;
    if (humElement) humElement.textContent = `${data.humidity.toFixed(1)}%`;

    // Update last update time
    const now = new Date();
    const lastUpdateElement = document.getElementById('lastUpdate');
    if (lastUpdateElement) {
        lastUpdateElement.textContent = now.toLocaleTimeString();
    }

    // Add this: Check thresholds and update alerts
    checkThresholds(data);
    updateAlerts(data);

    // Call updateStatistics explicitly
    updateStatistics();
}

// Update statistics
async function updateStatistics() {
    try {
        // Get stats including averages
        const response = await fetch('/data/stats');
        const stats = await response.json();
        console.log("STATS RECEIVED:", stats); // Let's see what we're getting

        // Update DOM elements with explicit error checking
        const avgTempElement = document.getElementById('avgTemp');
        if (avgTempElement) {
            if (stats && stats.avgTemperature !== undefined) {
                avgTempElement.textContent = `${Number(stats.avgTemperature).toFixed(1)}°C`;
            } else {
                avgTempElement.textContent = '--°C';
            }
        }

        const avgHumidityElement = document.getElementById('avgHumidity');
        if (avgHumidityElement) {
            if (stats && stats.avgHumidity !== undefined) {
                avgHumidityElement.textContent = `${Number(stats.avgHumidity).toFixed(1)}%`;
            } else {
                avgHumidityElement.textContent = '--%';
            }
        }

        const readingsCountElement = document.getElementById('readingsCount');
        if (readingsCountElement) {
            if (stats && stats.readingsToday !== undefined) {
                readingsCountElement.textContent = stats.readingsToday.toString();
            } else {
                readingsCountElement.textContent = '0';
            }
        }
    } catch (error) {
        console.error('Error:', error);
    }
}

// Helper function to calculate average
function calculateAverage(array) {
    return array.reduce((a, b) => a + b, 0) / array.length;
}

// Check thresholds and show alerts
function checkThresholds(data) {
    if (data.temperature < CONFIG.temperatureThresholds.min) {
        showAlert('Temperature is below minimum threshold', 'warning');
    } else if (data.temperature > CONFIG.temperatureThresholds.max) {
        showAlert('Temperature is above maximum threshold', 'danger');
    }

    if (data.humidity < CONFIG.humidityThresholds.min) {
        showAlert('Humidity is below minimum threshold', 'warning');
    } else if (data.humidity > CONFIG.humidityThresholds.max) {
        showAlert('Humidity is above maximum threshold', 'danger');
    }
}

// Show alert message
function showAlert(message, type) {
    const alertsList = document.getElementById('alertsList');
    const alertElement = document.createElement('div');
    alertElement.className = `alert-item ${type}`;
    alertElement.innerHTML = `
        <i class="fas fa-exclamation-circle"></i>
        <span>${message}</span>
    `;
    alertsList.prepend(alertElement);

    // Remove alert after 5 seconds
    setTimeout(() => {
        alertElement.remove();
    }, 5000);
}

// Initialize the application
async function initialize() {
    console.log("Initializing application");  // Debug log
    
    // Initial data fetch and UI update
    const data = await fetchSensorData();
    if (data) {
        updateUI(data);
    }

    // Set up periodic updates
    setInterval(async () => {
        const data = await fetchSensorData();
        if (data) {
            updateUI(data);
        }
    }, CONFIG.updateInterval);
}

// Reset readings counter at midnight
function resetReadingsAtMidnight() {
    const now = new Date();
    const night = new Date(
        now.getFullYear(),
        now.getMonth(),
        now.getDate() + 1, // tomorrow
        0, 0, 0 // midnight
    );
    const msToMidnight = night.getTime() - now.getTime();

    setTimeout(() => {
        sensorData.readingsToday = 0;
        // Set up next day's reset
        resetReadingsAtMidnight();
    }, msToMidnight);
}

// Start the application
initialize();

// Modify the updateAlerts function to use CONFIG thresholds
function updateAlerts(sensorData) {
    const alertsList = document.getElementById('alertsList');
    if (!alertsList) return;
    
    alertsList.innerHTML = ''; // Clear existing alerts

    // Use the CONFIG thresholds instead of hard-coded values
    if (sensorData.temperature > CONFIG.temperatureThresholds.max) {
        const alertHTML = `
            <div class="alert-item">
                <div class="alert-icon warning">
                    <i class="fas fa-exclamation-triangle"></i>
                </div>
                <div class="alert-content">
                    <div class="alert-header">
                        <span class="alert-type">High Temperature</span>
                        <span class="alert-time">Just now</span>
                    </div>
                    <div class="alert-message">Temperature reached ${sensorData.temperature.toFixed(1)}°C (Above threshold of ${CONFIG.temperatureThresholds.max}°C)</div>
                </div>
            </div>
        `;
        alertsList.innerHTML += alertHTML;
    }

    if (sensorData.humidity > CONFIG.humidityThresholds.max) {
        const alertHTML = `
            <div class="alert-item">
                <div class="alert-icon critical">
                    <i class="fas fa-exclamation-circle"></i>
                </div>
                <div class="alert-content">
                    <div class="alert-header">
                        <span class="alert-type">High Humidity</span>
                        <span class="alert-time">Just now</span>
                    </div>
                    <div class="alert-message">Humidity reached ${sensorData.humidity.toFixed(1)}% (Above threshold of ${CONFIG.humidityThresholds.max}%)</div>
                </div>
            </div>
        `;
        alertsList.innerHTML += alertHTML;
    }

    // Also check for low values
    if (sensorData.temperature < CONFIG.temperatureThresholds.min) {
        const alertHTML = `
            <div class="alert-item">
                <div class="alert-icon warning">
                    <i class="fas fa-exclamation-triangle"></i>
                </div>
                <div class="alert-content">
                    <div class="alert-header">
                        <span class="alert-type">Low Temperature</span>
                        <span class="alert-time">Just now</span>
                    </div>
                    <div class="alert-message">Temperature dropped to ${sensorData.temperature.toFixed(1)}°C (Below threshold of ${CONFIG.temperatureThresholds.min}°C)</div>
                </div>
            </div>
        `;
        alertsList.innerHTML += alertHTML;
    }

    if (sensorData.humidity < CONFIG.humidityThresholds.min) {
        const alertHTML = `
            <div class="alert-item">
                <div class="alert-icon warning">
                    <i class="fas fa-exclamation-triangle"></i>
                </div>
                <div class="alert-content">
                    <div class="alert-header">
                        <span class="alert-type">Low Humidity</span>
                        <span class="alert-time">Just now</span>
                    </div>
                    <div class="alert-message">Humidity dropped to ${sensorData.humidity.toFixed(1)}% (Below threshold of ${CONFIG.humidityThresholds.min}%)</div>
                </div>
            </div>
        `;
        alertsList.innerHTML += alertHTML;
    }

    // If no alerts, show the "System Normal" message
    if (alertsList.innerHTML === '') {
        alertsList.innerHTML = `
            <div class="alert-item">
                <div class="alert-icon info">
                    <i class="fas fa-check-circle"></i>
                </div>
                <div class="alert-content">
                    <div class="alert-header">
                        <span class="alert-type">System Normal</span>
                        <span class="alert-time">Now</span>
                    </div>
                    <div class="alert-message">All readings are within normal range</div>
                </div>
            </div>
        `;
    }
}
