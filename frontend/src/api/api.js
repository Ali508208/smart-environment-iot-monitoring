/**
 * src/api/api.js
 *
 * Thin Axios wrapper.
 *
 * During development, Vite proxies /api → http://localhost:5000
 * so the base URL is relative (works for both dev and prod builds).
 * Override with VITE_API_URL for cloud deployments.
 */

import axios from "axios";

const BASE_URL = import.meta.env.VITE_API_URL || "/api";

const http = axios.create({
  baseURL: BASE_URL,
  timeout: 12000,
  headers: { "Content-Type": "application/json" },
});

// ── Response interceptor ─────────────────────────────────────
// Unwrap the { success, data } envelope so callers get the payload directly.
// On error, throw a plain Error with the server message.
http.interceptors.response.use(
  (res) => res.data,
  (err) => {
    const message =
      err.response?.data?.error ||
      (err.code === "ECONNABORTED" ? "Request timed out" : null) ||
      err.message ||
      "Network error — is the backend running?";
    return Promise.reject(new Error(message));
  },
);

// ── Sensor API ───────────────────────────────────────────────
export const sensorAPI = {
  /** Latest reading for every active device */
  getLatest: () => http.get("/sensors/latest"),

  /**
   * Historical readings.
   * @param {object} params — { deviceId?, limit?, from?, to? }
   */
  getHistory: (params = {}) => http.get("/sensors/history", { params }),

  /** Full history for a single device */
  getDeviceHistory: (deviceId, params = {}) =>
    http.get(`/sensors/history/${deviceId}`, { params }),
};

// ── Device API ───────────────────────────────────────────────
export const deviceAPI = {
  getAll: () => http.get("/devices"),
  getById: (deviceId) => http.get(`/devices/${deviceId}`),
  register: (payload) => http.post("/devices", payload),
  update: (deviceId, payload) => http.put(`/devices/${deviceId}`, payload),
  remove: (deviceId) => http.delete(`/devices/${deviceId}`),
};

export default http;
