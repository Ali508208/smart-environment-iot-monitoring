/**
 * controllers/sensorController.js
 *
 * Business logic for sensor data endpoints.
 */

const SensorData = require("../models/SensorData");

// ── GET /api/sensors/latest ─────────────────────────────────
/**
 * Returns the single most-recent reading for every device
 * using a MongoDB aggregation pipeline.
 */
const getLatestReadings = async (_req, res) => {
  try {
    const latestReadings = await SensorData.aggregate([
      { $sort: { timestamp: -1 } },
      {
        $group: {
          _id: "$deviceId",
          deviceId: { $first: "$deviceId" },
          temperature: { $first: "$temperature" },
          humidity: { $first: "$humidity" },
          airQuality: { $first: "$airQuality" },
          light: { $first: "$light" },
          timestamp: { $first: "$timestamp" },
        },
      },
      { $project: { _id: 0 } },
      { $sort: { deviceId: 1 } },
    ]);

    res.json({ success: true, data: latestReadings });
  } catch (err) {
    console.error("getLatestReadings error:", err);
    res
      .status(500)
      .json({ success: false, error: "Failed to fetch latest readings" });
  }
};

// ── GET /api/sensors/history ────────────────────────────────
/**
 * Returns historical readings with optional query filters.
 *
 * Query params:
 *   deviceId  — filter to a specific device
 *   limit     — max records (default 100, max 1000)
 *   from      — ISO date lower bound
 *   to        — ISO date upper bound
 */
const getHistory = async (req, res) => {
  try {
    const { deviceId, limit = 100, from, to } = req.query;

    const filter = {};

    if (deviceId) {
      filter.deviceId = deviceId;
    }

    if (from || to) {
      filter.timestamp = {};
      if (from) filter.timestamp.$gte = new Date(from);
      if (to) filter.timestamp.$lte = new Date(to);
    }

    const cap = Math.min(parseInt(limit, 10) || 100, 1000);
    const readings = await SensorData.find(filter)
      .sort({ timestamp: -1 })
      .limit(cap)
      .select("-__v")
      .lean();

    // Return in chronological order for charts
    res.json({
      success: true,
      count: readings.length,
      data: readings.reverse(),
    });
  } catch (err) {
    console.error("getHistory error:", err);
    res
      .status(500)
      .json({ success: false, error: "Failed to fetch sensor history" });
  }
};

// ── GET /api/sensors/history/:deviceId ─────────────────────
/**
 * Returns the most-recent readings for a single device.
 * Useful for per-device chart drill-downs.
 */
const getDeviceHistory = async (req, res) => {
  try {
    const { deviceId } = req.params;
    const cap = Math.min(parseInt(req.query.limit, 10) || 60, 500);

    const readings = await SensorData.find({ deviceId })
      .sort({ timestamp: -1 })
      .limit(cap)
      .lean();

    res.json({
      success: true,
      count: readings.length,
      data: readings.reverse(),
    });
  } catch (err) {
    console.error("getDeviceHistory error:", err);
    res
      .status(500)
      .json({ success: false, error: "Failed to fetch device history" });
  }
};

module.exports = { getLatestReadings, getHistory, getDeviceHistory };
