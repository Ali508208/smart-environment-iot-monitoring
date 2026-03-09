/**
 * routes/sensorRoutes.js
 *
 * GET /api/sensors/latest         — most-recent reading per device
 * GET /api/sensors/history        — paginated history (optional filters)
 * GET /api/sensors/history/:id    — history for one specific device
 */

const express = require("express");
const router = express.Router();

const {
  getLatestReadings,
  getHistory,
  getDeviceHistory,
} = require("../controllers/sensorController");

router.get("/latest", getLatestReadings);
router.get("/history", getHistory);
router.get("/history/:deviceId", getDeviceHistory);

module.exports = router;
