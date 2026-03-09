// src/pages/Dashboard.jsx — Main monitoring dashboard
import React, { useState, useEffect, useCallback } from "react";

import SensorCard from "../components/SensorCard";
import {
  TemperatureChart,
  HumidityChart,
  AirQualityChart,
} from "../components/Charts";
import { sensorAPI } from "../api/api";

// How frequently the dashboard polls the backend (ms)
const POLL_INTERVAL = 5000;

// ── Alert thresholds (must match backend/mqttService.js) ─────
const TEMP_ALERT = 40;
const AQI_ALERT = 150;

// ── Alert Banner ─────────────────────────────────────────────
const AlertBanner = ({ alerts, onDismiss }) => {
  if (!alerts.length) return null;
  return (
    <div
      role="alert"
      className="bg-red-950/60 border border-red-500/40 rounded-xl p-4 mb-6 flex gap-3"
    >
      {/* Icon */}
      <svg
        className="w-5 h-5 text-red-400 shrink-0 mt-0.5"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
        />
      </svg>

      {/* Messages */}
      <div className="flex-1">
        <p className="text-red-300 font-semibold text-sm mb-1">
          Environmental Alert
        </p>
        <ul className="space-y-0.5">
          {alerts.map((msg, i) => (
            <li key={i} className="text-red-200 text-sm">
              {msg}
            </li>
          ))}
        </ul>
      </div>

      {/* Dismiss */}
      <button
        onClick={onDismiss}
        aria-label="Dismiss alert"
        className="text-red-500 hover:text-red-300 transition-colors shrink-0"
      >
        <svg
          className="w-4 h-4"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M6 18L18 6M6 6l12 12"
          />
        </svg>
      </button>
    </div>
  );
};

// ── Loading skeleton ──────────────────────────────────────────
const LoadingSkeleton = () => (
  <div className="flex flex-col items-center justify-center min-h-80 gap-4">
    <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
    <p className="text-gray-500 text-sm">Connecting to sensors…</p>
  </div>
);

// ── Empty-state placeholder ───────────────────────────────────
const EmptyState = () => (
  <div className="bg-gray-900 border border-gray-800 rounded-xl p-12 text-center mb-8">
    <div className="w-16 h-16 bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-4">
      <svg
        className="w-8 h-8 text-gray-600"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={1.5}
          d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
        />
      </svg>
    </div>
    <h3 className="text-gray-300 font-medium mb-2">No sensor data yet</h3>
    <p className="text-gray-500 text-sm mb-4">
      Start the sensor simulator to begin receiving data.
    </p>
    <code className="bg-gray-800 text-green-400 text-xs px-4 py-2 rounded-lg select-all">
      cd backend &amp;&amp; npm run simulate
    </code>
  </div>
);

// ── Main Dashboard ────────────────────────────────────────────
const Dashboard = () => {
  const [latestData, setLatestData] = useState([]);
  const [historyData, setHistoryData] = useState([]);
  const [alerts, setAlerts] = useState([]);
  const [showAlerts, setShowAlerts] = useState(true);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [lastUpdated, setLastUpdated] = useState(null);

  // Derive alert messages from latest readings
  const computeAlerts = useCallback((readings) => {
    const msgs = [];
    readings.forEach(({ deviceId, temperature, airQuality }) => {
      if (temperature > TEMP_ALERT)
        msgs.push(
          `High temperature on ${deviceId}: ${temperature}°C (threshold ${TEMP_ALERT}°C)`,
        );
      if (airQuality > AQI_ALERT)
        msgs.push(
          `Dangerous air quality on ${deviceId}: ${airQuality} AQI (threshold ${AQI_ALERT})`,
        );
    });
    setAlerts(msgs);
    if (msgs.length > 0) setShowAlerts(true);
  }, []);

  const fetchData = useCallback(async () => {
    try {
      const [latestRes, historyRes] = await Promise.all([
        sensorAPI.getLatest(),
        sensorAPI.getHistory({ limit: 60 }),
      ]);
      setLatestData(latestRes.data ?? []);
      setHistoryData(historyRes.data ?? []);
      computeAlerts(latestRes.data ?? []);
      setLastUpdated(new Date());
      setError(null);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [computeAlerts]);

  useEffect(() => {
    fetchData();
    const timer = setInterval(fetchData, POLL_INTERVAL);
    return () => clearInterval(timer);
  }, [fetchData]);

  // Use first device's readings for charts when multiple devices are present
  const primaryId = latestData[0]?.deviceId;
  const primaryHistory = primaryId
    ? historyData.filter((r) => r.deviceId === primaryId)
    : historyData;

  if (loading) return <LoadingSkeleton />;

  return (
    <div>
      {/* ── Page header ─────────────────────────────────────── */}
      <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-white">Dashboard</h1>
          <p className="text-gray-400 text-sm mt-0.5">
            Real-time environmental monitoring
          </p>
        </div>

        <div className="flex items-center gap-3">
          {lastUpdated && (
            <span className="text-gray-600 text-xs">
              Updated {lastUpdated.toLocaleTimeString()}
            </span>
          )}
          <button
            onClick={fetchData}
            className="bg-gray-800 hover:bg-gray-700 text-gray-300 px-3 py-2 rounded-lg text-sm flex items-center gap-2 transition-colors"
          >
            <svg
              className="w-4 h-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
              />
            </svg>
            Refresh
          </button>
        </div>
      </div>

      {/* ── Backend connection error ─────────────────────────── */}
      {error && (
        <div className="bg-yellow-950/40 border border-yellow-600/30 rounded-xl p-4 mb-6 flex items-start gap-3">
          <svg
            className="w-5 h-5 text-yellow-400 shrink-0 mt-0.5"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 9v2m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
          <p className="text-yellow-300 text-sm">
            Backend unreachable — {error}. Ensure the server and MQTT broker are
            running.
          </p>
        </div>
      )}

      {/* ── Alert banner ─────────────────────────────────────── */}
      {showAlerts && (
        <AlertBanner alerts={alerts} onDismiss={() => setShowAlerts(false)} />
      )}

      {/* ── Sensor cards grid ────────────────────────────────── */}
      {latestData.length > 0 ? (
        latestData.map((device) => (
          <div key={device.deviceId} className="mb-8">
            {/* Device label */}
            <div className="flex items-center gap-2 mb-3">
              <span className="w-2 h-2 bg-green-400 rounded-full" />
              <span className="text-gray-400 text-sm font-mono font-medium">
                {device.deviceId}
              </span>
              {device.timestamp && (
                <span className="text-gray-600 text-xs">
                  · {new Date(device.timestamp).toLocaleTimeString()}
                </span>
              )}
            </div>

            {/* 4-column card grid */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <SensorCard
                type="temperature"
                value={device.temperature}
                deviceId={device.deviceId}
              />
              <SensorCard
                type="humidity"
                value={device.humidity}
                deviceId={device.deviceId}
              />
              <SensorCard
                type="airQuality"
                value={device.airQuality}
                deviceId={device.deviceId}
              />
              <SensorCard
                type="light"
                value={device.light}
                deviceId={device.deviceId}
              />
            </div>
          </div>
        ))
      ) : (
        <EmptyState />
      )}

      {/* ── Charts ──────────────────────────────────────────── */}
      {primaryHistory.length > 0 && (
        <section className="mb-8">
          <h2 className="text-lg font-semibold text-gray-100 mb-4">
            Historical Data
          </h2>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 mb-5">
            <TemperatureChart data={primaryHistory} />
            <HumidityChart data={primaryHistory} />
          </div>
          <AirQualityChart data={primaryHistory} />
        </section>
      )}

      {/* ── Recent readings table ────────────────────────────── */}
      {historyData.length > 0 && (
        <section>
          <div className="bg-gray-900 border border-gray-800 rounded-xl overflow-hidden">
            <div className="px-5 py-4 border-b border-gray-800">
              <h2 className="text-gray-100 font-semibold text-sm">
                Recent Readings
              </h2>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-gray-500 border-b border-gray-800 text-xs uppercase tracking-wider">
                    <th className="px-5 py-3 text-left  font-medium">Device</th>
                    <th className="px-5 py-3 text-right font-medium">
                      Temp (°C)
                    </th>
                    <th className="px-5 py-3 text-right font-medium">
                      Humidity (%)
                    </th>
                    <th className="px-5 py-3 text-right font-medium">
                      Air Quality
                    </th>
                    <th className="px-5 py-3 text-right font-medium">
                      Light (lux)
                    </th>
                    <th className="px-5 py-3 text-right font-medium">Time</th>
                  </tr>
                </thead>
                <tbody>
                  {[...historyData]
                    .reverse()
                    .slice(0, 20)
                    .map((row, idx) => (
                      <tr
                        key={idx}
                        className="border-b border-gray-800/50 hover:bg-gray-800/30 transition-colors"
                      >
                        <td className="px-5 py-3 text-gray-400 font-mono text-xs">
                          {row.deviceId}
                        </td>
                        <td
                          className={`px-5 py-3 text-right font-medium ${row.temperature > TEMP_ALERT ? "text-red-400" : "text-orange-400"}`}
                        >
                          {row.temperature}
                        </td>
                        <td className="px-5 py-3 text-right text-blue-400">
                          {row.humidity}
                        </td>
                        <td
                          className={`px-5 py-3 text-right font-medium ${
                            row.airQuality > AQI_ALERT
                              ? "text-red-400"
                              : row.airQuality > AQI_ALERT * 0.67
                                ? "text-yellow-400"
                                : "text-green-400"
                          }`}
                        >
                          {row.airQuality}
                        </td>
                        <td className="px-5 py-3 text-right text-yellow-400">
                          {row.light}
                        </td>
                        <td className="px-5 py-3 text-right text-gray-600 text-xs">
                          {new Date(row.timestamp).toLocaleTimeString()}
                        </td>
                      </tr>
                    ))}
                </tbody>
              </table>
            </div>
          </div>
        </section>
      )}
    </div>
  );
};

export default Dashboard;
