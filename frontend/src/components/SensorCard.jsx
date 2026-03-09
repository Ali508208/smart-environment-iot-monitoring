// src/components/SensorCard.jsx — Individual metric card

import React from "react";

// ── Per-metric configuration ─────────────────────────────────
const METRIC_CONFIG = {
  temperature: {
    label: "Temperature",
    unit: "°C",
    colorClass: "text-orange-400",
    bgClass: "bg-orange-500/10",
    borderClass: "border-orange-500/20",
    icon: (
      <svg
        className="w-6 h-6"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
        />
      </svg>
    ),
    getStatus: (v) => (v > 40 ? "danger" : v > 35 ? "warning" : "normal"),
  },

  humidity: {
    label: "Humidity",
    unit: "%",
    colorClass: "text-blue-400",
    bgClass: "bg-blue-500/10",
    borderClass: "border-blue-500/20",
    icon: (
      <svg
        className="w-6 h-6"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M3 15a4 4 0 004 4h9a5 5 0 10-.1-9.999 5.002 5.002 0 10-9.78 2.096A4.001 4.001 0 003 15z"
        />
      </svg>
    ),
    getStatus: (v) => (v > 85 ? "warning" : "normal"),
  },

  airQuality: {
    label: "Air Quality",
    unit: "AQI",
    colorClass: "text-green-400",
    bgClass: "bg-green-500/10",
    borderClass: "border-green-500/20",
    icon: (
      <svg
        className="w-6 h-6"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M3 10h18M3 14h18m-9-9v18"
        />
      </svg>
    ),
    getStatus: (v) => (v > 150 ? "danger" : v > 100 ? "warning" : "normal"),
  },

  light: {
    label: "Light Level",
    unit: "lux",
    colorClass: "text-yellow-400",
    bgClass: "bg-yellow-500/10",
    borderClass: "border-yellow-500/20",
    icon: (
      <svg
        className="w-6 h-6"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z"
        />
      </svg>
    ),
    getStatus: () => "normal",
  },
};

// ── Status badge styles ──────────────────────────────────────
const STATUS_STYLES = {
  normal: { dot: "bg-green-400", badge: "text-green-400", label: "Normal" },
  warning: { dot: "bg-yellow-400", badge: "text-yellow-400", label: "Warning" },
  danger: {
    dot: "bg-red-400 animate-pulse",
    badge: "text-red-400",
    label: "Alert",
  },
};

// ── Component ────────────────────────────────────────────────
/**
 * @param {object}  props
 * @param {string}  props.type      — 'temperature' | 'humidity' | 'airQuality' | 'light'
 * @param {number}  props.value     — current reading (null while loading)
 * @param {string}  [props.deviceId]
 */
const SensorCard = ({ type, value, deviceId }) => {
  const config = METRIC_CONFIG[type];
  if (!config) return null;

  const status = value != null ? config.getStatus(value) : "normal";
  const style = STATUS_STYLES[status];

  return (
    <div
      className={`
        bg-gray-900 rounded-xl border ${config.borderClass}
        p-5 flex flex-col gap-4
        hover:shadow-lg hover:shadow-black/20
        transition-all duration-200
      `}
    >
      {/* ── Top row: icon + status badge ──────────────────────── */}
      <div className="flex items-center justify-between">
        <div
          className={`${config.bgClass} ${config.colorClass} p-2.5 rounded-xl`}
        >
          {config.icon}
        </div>

        <div className="flex items-center gap-1.5">
          <span className={`w-2 h-2 rounded-full ${style.dot}`} />
          <span className={`text-xs font-medium ${style.badge}`}>
            {style.label}
          </span>
        </div>
      </div>

      {/* ── Metric value ───────────────────────────────────────── */}
      <div>
        <div
          className={`text-3xl font-bold tracking-tight ${config.colorClass}`}
        >
          {value != null ? `${value}${config.unit}` : "—"}
        </div>
        <div className="text-gray-400 text-sm mt-1">{config.label}</div>
        {deviceId && (
          <div className="text-gray-600 text-xs mt-0.5 font-mono">
            {deviceId}
          </div>
        )}
      </div>
    </div>
  );
};

export default SensorCard;
