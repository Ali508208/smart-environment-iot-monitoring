/**
 * services/mqttService.js
 *
 * Manages the persistent MQTT broker connection for the backend.
 *
 * Responsibilities:
 *  - Subscribe to  iot/device/+/data
 *  - Parse incoming JSON payloads
 *  - Persist sensor readings to MongoDB (SensorData)
 *  - Upsert Device status to "online" on each message
 *  - Log console alerts when readings exceed thresholds
 *  - Expose a publish() helper for future downlink commands
 */

const mqtt = require("mqtt");
const SensorData = require("../models/SensorData");
const Device = require("../models/Device");

// Alert thresholds — mirror frontend constants
const THRESHOLDS = {
  TEMPERATURE_HIGH: 40, // °C
  AIR_QUALITY_BAD: 150, // AQI
};

// Topic pattern uses MQTT single-level wildcard (+)
const SUBSCRIBE_TOPIC = "iot/device/+/data";

let client = null;

// ── connect ─────────────────────────────────────────────────
const connect = () => {
  const brokerUrl = process.env.MQTT_BROKER_URL || "mqtt://localhost:1883";

  const options = {
    clientId: `iot-backend-${Date.now().toString(16)}`,
    clean: true,
    reconnectPeriod: 5000, // ms between reconnect attempts
    connectTimeout: 30000,
  };

  if (process.env.MQTT_USERNAME) {
    options.username = process.env.MQTT_USERNAME;
    options.password = process.env.MQTT_PASSWORD;
  }

  console.log(`🔌  Connecting to MQTT broker → ${brokerUrl}`);
  client = mqtt.connect(brokerUrl, options);

  // ── Event handlers ────────────────────────────────────────
  client.on("connect", () => {
    console.log("✅  MQTT broker connected");
    client.subscribe(SUBSCRIBE_TOPIC, { qos: 1 }, (err) => {
      if (err) {
        console.error("❌  MQTT subscribe failed:", err.message);
      } else {
        console.log(`📥  Subscribed to topic: ${SUBSCRIBE_TOPIC}`);
      }
    });
  });

  client.on("message", handleMessage);
  client.on("error", (err) => console.error("MQTT error:", err.message));
  client.on("reconnect", () => console.log("🔄  MQTT reconnecting…"));
  client.on("offline", () => console.warn("⚠️   MQTT client offline"));
};

// ── handleMessage ────────────────────────────────────────────
/**
 * Processes an incoming sensor payload.
 *
 * Topic format: iot/device/{deviceId}/data
 * Payload (JSON):
 *   { temperature, humidity, airQuality, light }
 */
const handleMessage = async (topic, messageBuffer) => {
  // 1. Validate topic structure
  const parts = topic.split("/");
  if (
    parts.length !== 4 ||
    parts[0] !== "iot" ||
    parts[1] !== "device" ||
    parts[3] !== "data"
  ) {
    console.warn(`⚠️   Unexpected topic: ${topic} — skipped`);
    return;
  }

  const deviceId = parts[2];

  // 2. Parse payload safely
  let payload;
  try {
    payload = JSON.parse(messageBuffer.toString());
  } catch {
    console.error(`❌  Invalid JSON from ${deviceId}`);
    return;
  }

  const { temperature, humidity, airQuality, light } = payload;

  try {
    // 3. Persist sensor reading
    await SensorData.create({
      deviceId,
      temperature,
      humidity,
      airQuality,
      light,
    });

    // 4. Mark device online
    await Device.findOneAndUpdate(
      { deviceId },
      { status: "online", lastSeen: new Date() },
      {
        upsert: true,
        new: true,
        setDefaultsOnInsert: true,
        // Avoid overwriting name/location when upserting unknown devices
        runValidators: false,
      },
    );

    // 5. Console alert for out-of-range readings
    if (temperature > THRESHOLDS.TEMPERATURE_HIGH) {
      console.warn(
        `🌡️  ALERT — High temperature on ${deviceId}: ${temperature}°C`,
      );
    }
    if (airQuality > THRESHOLDS.AIR_QUALITY_BAD) {
      console.warn(
        `☁️  ALERT — Poor air quality on ${deviceId}: ${airQuality} AQI`,
      );
    }

    // 6. Normal log line
    const ts = new Date().toLocaleTimeString();
    console.log(
      `[${ts}] ${deviceId} | 🌡 ${temperature}°C  💧 ${humidity}%  ☁ ${airQuality} AQI  ☀ ${light} lux`,
    );
  } catch (err) {
    console.error(`❌  DB write failed for ${deviceId}:`, err.message);
  }
};

// ── publish ──────────────────────────────────────────────────
/** Send a JSON command to a device (downlink). */
const publish = (topic, payload) => {
  if (!client?.connected) {
    console.warn("Cannot publish — MQTT not connected");
    return;
  }
  client.publish(topic, JSON.stringify(payload), { qos: 1 });
};

// ── disconnect ───────────────────────────────────────────────
const disconnect = () => {
  if (client) {
    client.end();
    console.log("🔌  MQTT client disconnected");
  }
};

module.exports = { connect, publish, disconnect };
