#include <ESP8266WiFi.h>
#include <DHT.h>
#include <ESP8266HTTPClient.h>


const char* ssid = "Meao 2.4Ghz";
const char* password = "ABHI1289";

// Server address (replace with your computer’s IP and port)
const char* serverAddress = "http://192.168.29.75:3001/data";

// DHT Sensor setup
#define DHTPIN 4 // GPIO pin where the DHT is connected
#define DHTTYPE DHT11
DHT dht(DHTPIN, DHTTYPE);

void setup() {
  Serial.begin(115200);
  dht.begin();

  // Connect to WiFi
  WiFi.begin(ssid, password);
  Serial.print("Connecting to WiFi...");
  while (WiFi.status() != WL_CONNECTED) {
    delay(1000);
    Serial.print(".");
  }
  Serial.println("\nConnected to WiFi");
}

void loop() {
  if (WiFi.status() == WL_CONNECTED) {
    HTTPClient http;
    WiFiClient client;

    // Sensor readings
    float temperature = dht.readTemperature();
    float humidity = dht.readHumidity();

    if (isnan(temperature) || isnan(humidity)) {
      Serial.println("Failed to read from DHT sensor!");
      return;
    }

    // Create JSON payload
    String jsonPayload = "{\"temperature\":" + String(temperature) + ",\"humidity\":" + String(humidity) + "}";

    // Send data to server
    http.begin(client, serverAddress); // Use client with HTTPClient::begin
    http.addHeader("Content-Type", "application/json");

    int httpResponseCode = http.POST(jsonPayload);
    if (httpResponseCode > 0) {
      Serial.print("Data sent successfully. Response code: ");
      Serial.println(httpResponseCode);
      Serial.println("Response: " + http.getString());
    } else {
      Serial.print("Error sending data\nError code: ");
      Serial.println(httpResponseCode);
    }

    http.end();
  } else {
    Serial.println("WiFi disconnected. Attempting reconnection...");
    WiFi.reconnect();
  }

  delay(10000); // Send data every 10 seconds
}
