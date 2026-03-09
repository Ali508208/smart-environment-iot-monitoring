/**
 * routes/deviceRoutes.js
 *
 * GET    /api/devices           — list all registered devices
 * GET    /api/devices/:deviceId — get single device
 * POST   /api/devices           — register new device
 * PUT    /api/devices/:deviceId — update device metadata
 * DELETE /api/devices/:deviceId — remove device
 */

const express = require("express");
const router = express.Router();

const {
  getDevices,
  getDeviceById,
  registerDevice,
  updateDevice,
  deleteDevice,
} = require("../controllers/deviceController");

router.get("/", getDevices);
router.get("/:deviceId", getDeviceById);
router.post("/", registerDevice);
router.put("/:deviceId", updateDevice);
router.delete("/:deviceId", deleteDevice);

module.exports = router;
