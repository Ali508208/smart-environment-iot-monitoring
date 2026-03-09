/**
 * controllers/deviceController.js
 *
 * CRUD operations for IoT device management.
 */

const Device = require("../models/Device");

// ── GET /api/devices ────────────────────────────────────────
const getDevices = async (_req, res) => {
  try {
    const devices = await Device.find().sort({ createdAt: -1 }).lean();
    res.json({ success: true, count: devices.length, data: devices });
  } catch (err) {
    console.error("getDevices error:", err);
    res.status(500).json({ success: false, error: "Failed to fetch devices" });
  }
};

// ── GET /api/devices/:deviceId ──────────────────────────────
const getDeviceById = async (req, res) => {
  try {
    const device = await Device.findOne({
      deviceId: req.params.deviceId,
    }).lean();
    if (!device) {
      return res
        .status(404)
        .json({ success: false, error: "Device not found" });
    }
    res.json({ success: true, data: device });
  } catch (err) {
    console.error("getDeviceById error:", err);
    res.status(500).json({ success: false, error: "Failed to fetch device" });
  }
};

// ── POST /api/devices ───────────────────────────────────────
const registerDevice = async (req, res) => {
  try {
    const { deviceId, name, location, description } = req.body;

    // Input validation
    if (!deviceId || typeof deviceId !== "string" || !deviceId.trim()) {
      return res
        .status(400)
        .json({ success: false, error: "deviceId is required" });
    }
    if (!name || typeof name !== "string" || !name.trim()) {
      return res
        .status(400)
        .json({ success: false, error: "name is required" });
    }

    const exists = await Device.findOne({ deviceId: deviceId.trim() });
    if (exists) {
      return res
        .status(409)
        .json({ success: false, error: "Device ID already registered" });
    }

    const device = await Device.create({
      deviceId: deviceId.trim(),
      name: name.trim(),
      location: location?.trim(),
      description: description?.trim(),
    });

    res.status(201).json({ success: true, data: device });
  } catch (err) {
    console.error("registerDevice error:", err);
    res
      .status(500)
      .json({ success: false, error: "Failed to register device" });
  }
};

// ── PUT /api/devices/:deviceId ──────────────────────────────
const updateDevice = async (req, res) => {
  try {
    const { name, location, description } = req.body;

    const device = await Device.findOneAndUpdate(
      { deviceId: req.params.deviceId },
      {
        ...(name && { name: name.trim() }),
        ...(location && { location: location.trim() }),
        ...(description && { description: description.trim() }),
      },
      { new: true, runValidators: true },
    );

    if (!device) {
      return res
        .status(404)
        .json({ success: false, error: "Device not found" });
    }

    res.json({ success: true, data: device });
  } catch (err) {
    console.error("updateDevice error:", err);
    res.status(500).json({ success: false, error: "Failed to update device" });
  }
};

// ── DELETE /api/devices/:deviceId ──────────────────────────
const deleteDevice = async (req, res) => {
  try {
    const device = await Device.findOneAndDelete({
      deviceId: req.params.deviceId,
    });
    if (!device) {
      return res
        .status(404)
        .json({ success: false, error: "Device not found" });
    }
    res.json({ success: true, message: "Device deleted successfully" });
  } catch (err) {
    console.error("deleteDevice error:", err);
    res.status(500).json({ success: false, error: "Failed to delete device" });
  }
};

module.exports = {
  getDevices,
  getDeviceById,
  registerDevice,
  updateDevice,
  deleteDevice,
};
