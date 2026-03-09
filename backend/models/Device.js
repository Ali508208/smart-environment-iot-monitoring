/**
 * models/Device.js
 *
 * Represents a registered IoT sensor node.
 * Status is updated in real-time by the MQTT service whenever
 * a message arrives from the device.
 */

const mongoose = require("mongoose");

const DeviceSchema = new mongoose.Schema(
  {
    deviceId: {
      type: String,
      required: [true, "deviceId is required"],
      unique: true,
      trim: true,
    },
    name: {
      type: String,
      required: [true, "Device name is required"],
      trim: true,
    },
    location: {
      type: String,
      trim: true,
      default: "Unknown",
    },
    description: {
      type: String,
      trim: true,
    },
    status: {
      type: String,
      enum: ["online", "offline"],
      default: "offline",
    },
    lastSeen: {
      type: Date,
      default: null,
    },
  },
  {
    // createdAt + updatedAt added automatically
    timestamps: true,
    versionKey: false,
  },
);

module.exports = mongoose.model("Device", DeviceSchema);
