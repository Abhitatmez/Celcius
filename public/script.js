let lastTemperature = null;
let lastHumidity = null;
const refreshInterval = 5000; // Interval for refreshing the data (in ms)

// Function to fetch data from the server and update the page
async function fetchData() {
  try {
    const response = await fetch("http://localhost:3000/data");
    const data = await response.json();

    // Extract temperature and humidity from the data
    const temperature = data.temperature;
    const humidity = data.humidity;

    // Update the temperature and humidity in the HTML
    document.getElementById("temperature").textContent = `${temperature}°C`;
    document.getElementById("humidity").textContent = `${humidity}%`;

    // Call function to update background color based on data
    updateBackgroundImage(temperature);

    // Update previous temperature and humidity for future reference
    lastTemperature = temperature;
    lastHumidity = humidity;
  } catch (error) {
    console.error("Error fetching data:", error);
  }
}

// Function to update the background image based on temperature
function updateBackgroundImage(temperature) {
  let backgroundImageUrl = '';

  // Set background image based on temperature ranges
  if (temperature < 10) {
    backgroundImageUrl = "/images/cold.gif";
  } else if (temperature >= 10 && temperature < 20) {
    backgroundImageUrl = "/images/cool.gif";
  } else if (temperature >= 20 && temperature < 25) {
    backgroundImageUrl = "/images/normal.gif";
  } else if (temperature >= 25 && temperature < 30) {
    backgroundImageUrl = "/images/warm.gif";
  } else {
    backgroundImageUrl = "/images/hot.gif";
  }

  // Set background image to the body
  document.body.style.backgroundImage = `url(${backgroundImageUrl})`;
  document.body.style.backgroundSize = "cover"; // Ensure the image covers the screen
}

// Refresh data every x milliseconds
setInterval(fetchData, refreshInterval);

// Initial data fetch on page load
fetchData();
