/**
 * simulator/sensorSimulator.js
 *
 * Simulates multiple ESP32-style IoT sensor nodes.
 *
 * Each device publishes randomised-but-realistic readings to
 * the MQTT broker every PUBLISH_INTERVAL milliseconds.
 *
 * Run:   node simulator/sensorSimulator.js
 *        (or: npm run simulate  from the backend folder)
 *
 * Environment: reads MQTT_BROKER_URL from ../.env if present.
 */

require("dotenv").config({ path: require("path").join(__dirname, "../.env") });

const mqtt = require("mqtt");

// ── Configuration ────────────────────────────────────────────
const BROKER_URL = process.env.MQTT_BROKER_URL || "mqtt://localhost:1883";
const PUBLISH_INTERVAL = 5000; // milliseconds between readings

/** Simulated devices — add more entries to scale the demo */
const DEVICES = [
  { id: "ESP32-001", name: "Sensor Node A", location: "Living Room" },
  { id: "ESP32-002", name: "Sensor Node B", location: "Bedroom" },
  { id: "ESP32-003", name: "Sensor Node C", location: "Office" },
];

// ── Helpers ──────────────────────────────────────────────────
/** Uniformly random float in [min, max] rounded to one decimal */
const rand = (min, max) =>
  parseFloat((Math.random() * (max - min) + min).toFixed(1));

/** Integer random in [min, max] */
const randInt = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;

/**
 * Generate a realistic-ish sensor reading.
 * Occasional spikes simulate threshold-trigger events so the
 * alert banners on the dashboard can be exercised.
 */
const generateReading = () => {
  const tempSpike = Math.random() < 0.05; // 5 % chance
  const aqSpike = Math.random() < 0.05; // 5 % chance

  return {
    temperature: tempSpike ? rand(40.5, 45.0) : rand(20.0, 38.0),
    humidity: rand(30, 90),
    airQuality: aqSpike ? randInt(151, 200) : randInt(50, 149),
    light: randInt(100, 1000),
  };
};

// ── MQTT connection ──────────────────────────────────────────
const client = mqtt.connect(BROKER_URL, {
  clientId: `iot-simulator-${Date.now().toString(16)}`,
  clean: true,
  reconnectPeriod: 5000,
});

client.on("connect", () => {
  console.log(`\n🟢  Simulator connected to MQTT broker @ ${BROKER_URL}`);
  console.log(
    `📡  Simulating ${DEVICES.length} device(s) — interval: ${PUBLISH_INTERVAL / 1000}s\n`,
  );

  DEVICES.forEach((device) => {
    // Stagger initial publish so all devices don't fire simultaneously
    const jitter = Math.random() * 1000;

    setTimeout(() => {
      // Publish immediately, then continue on interval
      publishReading(device);
      setInterval(() => publishReading(device), PUBLISH_INTERVAL);
    }, jitter);
  });
});

client.on("error", (err) =>
  console.error("❌  Simulator MQTT error:", err.message),
);
client.on("reconnect", () => console.log("🔄  Simulator reconnecting…"));

// ── Publish helper ───────────────────────────────────────────
const publishReading = (device) => {
  const reading = generateReading();
  const topic = `iot/device/${device.id}/data`;
  const payload = JSON.stringify(reading);

  client.publish(topic, payload, { qos: 1 }, (err) => {
    if (err) {
      console.error(`❌  Publish failed for ${device.id}:`, err.message);
      return;
    }

    const ts = new Date().toLocaleTimeString();
    console.log(
      `[${ts}] ${device.id.padEnd(10)} (${device.location.padEnd(12)}) ` +
        `| 🌡 ${String(reading.temperature).padStart(4)}°C ` +
        `| 💧 ${String(reading.humidity).padStart(4)}%  ` +
        `| ☁ ${String(reading.airQuality).padStart(3)} AQI ` +
        `| ☀ ${String(reading.light).padStart(4)} lux`,
    );
  });
};

// ── Graceful shutdown ────────────────────────────────────────
process.on("SIGINT", () => {
  console.log("\n🔴  Simulator stopped.");
  client.end();
  process.exit(0);
});
