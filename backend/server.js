/**
 * server.js — Express entry point
 *
 * Responsibilities:
 *  - Connect to MongoDB
 *  - Mount REST API routes
 *  - Bootstrap MQTT service
 *  - Global error handling
 */

require("dotenv").config();

const express = require("express");
const cors = require("cors");

const connectDB = require("./config/db");
const sensorRoutes = require("./routes/sensorRoutes");
const deviceRoutes = require("./routes/deviceRoutes");
const mqttService = require("./services/mqttService");

const app = express();
const PORT = process.env.PORT || 5000;

// ── Middleware ──────────────────────────────────────────────
app.use(
  cors({
    origin: process.env.CORS_ORIGIN || "http://localhost:5173",
    methods: ["GET", "POST", "PUT", "DELETE"],
    allowedHeaders: ["Content-Type", "Authorization"],
  }),
);
app.use(express.json({ limit: "10kb" }));

// ── Database ────────────────────────────────────────────────
connectDB();

// ── MQTT ────────────────────────────────────────────────────
mqttService.connect();

// ── Routes ──────────────────────────────────────────────────
app.use("/api/sensors", sensorRoutes);
app.use("/api/devices", deviceRoutes);

// Health-check — useful for Docker / CI probes
app.get("/health", (_req, res) => {
  res.json({ status: "ok", timestamp: new Date().toISOString() });
});

// ── 404 ─────────────────────────────────────────────────────
app.use((_req, res) => {
  res.status(404).json({ success: false, error: "Route not found" });
});

// ── Global error handler ────────────────────────────────────
// eslint-disable-next-line no-unused-vars
app.use((err, _req, res, _next) => {
  console.error("Unhandled error:", err.stack);
  res.status(500).json({ success: false, error: "Internal server error" });
});

// ── Start ───────────────────────────────────────────────────
app.listen(PORT, () => {
  console.log(`\n🚀  Backend running → http://localhost:${PORT}`);
  console.log(
    `📡  MQTT broker     → ${process.env.MQTT_BROKER_URL || "mqtt://localhost:1883"}`,
  );
  console.log(
    `🗄️   MongoDB        → ${process.env.MONGODB_URI || "mongodb://localhost:27017/iot-monitoring"}\n`,
  );
});

// Graceful shutdown
process.on("SIGINT", () => {
  console.log("\nShutting down server…");
  mqttService.disconnect();
  process.exit(0);
});
