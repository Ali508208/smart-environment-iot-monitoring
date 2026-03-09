/**
 * models/SensorData.js
 *
 * Stores every sensor reading received from an IoT device.
 * Indexed on (deviceId + timestamp) for range queries used by
 * the history and chart endpoints.
 */

const mongoose = require("mongoose");

const SensorDataSchema = new mongoose.Schema(
  {
    deviceId: {
      type: String,
      required: [true, "deviceId is required"],
      trim: true,
      index: true,
    },
    temperature: {
      type: Number,
      min: -50,
      max: 100,
    },
    humidity: {
      type: Number,
      min: 0,
      max: 100,
    },
    airQuality: {
      type: Number,
      min: 0,
      max: 1000,
    },
    light: {
      type: Number,
      min: 0,
      max: 100000,
    },
    timestamp: {
      type: Date,
      default: Date.now,
      index: true,
    },
  },
  {
    // Disable automatic __v field to keep documents lean
    versionKey: false,
  },
);

// Compound index for efficient per-device time-range queries
SensorDataSchema.index({ deviceId: 1, timestamp: -1 });

// TTL index — auto-delete readings older than 30 days (2 592 000 s)
// Remove or increase this in production if long-term storage is required.
SensorDataSchema.index({ timestamp: 1 }, { expireAfterSeconds: 2592000 });

module.exports = mongoose.model("SensorData", SensorDataSchema);
