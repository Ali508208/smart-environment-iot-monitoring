// src/components/Charts.jsx — Recharts-based sensor visualisations

import React from "react";
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ReferenceLine,
} from "recharts";

// ── Helpers ──────────────────────────────────────────────────
const fmtTime = (ts) =>
  ts
    ? new Date(ts).toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      })
    : "";

// ── Custom tooltip ───────────────────────────────────────────
const ChartTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-gray-800 border border-gray-700 rounded-xl p-3 shadow-2xl text-xs">
      <p className="text-gray-400 mb-2 font-medium">
        {label ? new Date(label).toLocaleTimeString() : ""}
      </p>
      {payload.map((entry) => (
        <p
          key={entry.name}
          style={{ color: entry.color }}
          className="font-semibold leading-5"
        >
          {entry.name}: {entry.value}
          {entry.unit}
        </p>
      ))}
    </div>
  );
};

// ── Shared axis / grid props ─────────────────────────────────
const axisProps = {
  tick: { fill: "#4b5563", fontSize: 11 },
  stroke: "#1f2937",
};

const gridProps = {
  strokeDasharray: "3 3",
  stroke: "#1f2937",
  vertical: false,
};

// ── Temperature Chart ────────────────────────────────────────
export const TemperatureChart = ({ data = [] }) => (
  <div className="bg-gray-900 rounded-xl border border-gray-800 p-5">
    <h3 className="text-gray-100 font-semibold text-sm mb-4">
      🌡 Temperature History
    </h3>
    <ResponsiveContainer width="100%" height={220}>
      <LineChart
        data={data}
        margin={{ top: 5, right: 16, left: -10, bottom: 0 }}
      >
        <CartesianGrid {...gridProps} />
        <XAxis dataKey="timestamp" tickFormatter={fmtTime} {...axisProps} />
        <YAxis {...axisProps} domain={["auto", "auto"]} />
        <Tooltip content={<ChartTooltip />} />
        {/* Alert threshold line */}
        <ReferenceLine
          y={40}
          stroke="#ef4444"
          strokeDasharray="5 3"
          label={{
            value: "Alert 40°C",
            fill: "#ef4444",
            fontSize: 10,
            position: "insideTopRight",
          }}
        />
        <Line
          type="monotone"
          dataKey="temperature"
          stroke="#f97316"
          strokeWidth={2.5}
          dot={false}
          name="Temperature"
          unit="°C"
          activeDot={{ r: 4, fill: "#f97316" }}
        />
      </LineChart>
    </ResponsiveContainer>
  </div>
);

// ── Humidity Chart ───────────────────────────────────────────
export const HumidityChart = ({ data = [] }) => (
  <div className="bg-gray-900 rounded-xl border border-gray-800 p-5">
    <h3 className="text-gray-100 font-semibold text-sm mb-4">
      💧 Humidity History
    </h3>
    <ResponsiveContainer width="100%" height={220}>
      <LineChart
        data={data}
        margin={{ top: 5, right: 16, left: -10, bottom: 0 }}
      >
        <CartesianGrid {...gridProps} />
        <XAxis dataKey="timestamp" tickFormatter={fmtTime} {...axisProps} />
        <YAxis {...axisProps} domain={[0, 100]} />
        <Tooltip content={<ChartTooltip />} />
        <Line
          type="monotone"
          dataKey="humidity"
          stroke="#3b82f6"
          strokeWidth={2.5}
          dot={false}
          name="Humidity"
          unit="%"
          activeDot={{ r: 4, fill: "#3b82f6" }}
        />
      </LineChart>
    </ResponsiveContainer>
  </div>
);

// ── Air Quality Chart ────────────────────────────────────────
export const AirQualityChart = ({ data = [] }) => (
  <div className="bg-gray-900 rounded-xl border border-gray-800 p-5">
    <h3 className="text-gray-100 font-semibold text-sm mb-4">
      ☁ Air Quality Trend
    </h3>
    <ResponsiveContainer width="100%" height={220}>
      <LineChart
        data={data}
        margin={{ top: 5, right: 16, left: -10, bottom: 0 }}
      >
        <CartesianGrid {...gridProps} />
        <XAxis dataKey="timestamp" tickFormatter={fmtTime} {...axisProps} />
        <YAxis {...axisProps} domain={["auto", "auto"]} />
        <Tooltip content={<ChartTooltip />} />
        <ReferenceLine
          y={150}
          stroke="#ef4444"
          strokeDasharray="5 3"
          label={{
            value: "Danger 150 AQI",
            fill: "#ef4444",
            fontSize: 10,
            position: "insideTopRight",
          }}
        />
        <Line
          type="monotone"
          dataKey="airQuality"
          stroke="#22c55e"
          strokeWidth={2.5}
          dot={false}
          name="Air Quality"
          unit=" AQI"
          activeDot={{ r: 4, fill: "#22c55e" }}
        />
      </LineChart>
    </ResponsiveContainer>
  </div>
);

// ── Multi-metric overview chart ──────────────────────────────
export const MultiMetricChart = ({ data = [] }) => (
  <div className="bg-gray-900 rounded-xl border border-gray-800 p-5">
    <h3 className="text-gray-100 font-semibold text-sm mb-4">
      📊 Sensor Overview
    </h3>
    <ResponsiveContainer width="100%" height={280}>
      <LineChart
        data={data}
        margin={{ top: 5, right: 16, left: -10, bottom: 0 }}
      >
        <CartesianGrid {...gridProps} />
        <XAxis dataKey="timestamp" tickFormatter={fmtTime} {...axisProps} />
        <YAxis {...axisProps} />
        <Tooltip content={<ChartTooltip />} />
        <Legend
          wrapperStyle={{ fontSize: 12, color: "#9ca3af", paddingTop: 12 }}
        />
        <Line
          type="monotone"
          dataKey="temperature"
          stroke="#f97316"
          strokeWidth={2}
          dot={false}
          name="Temperature"
          unit="°C"
        />
        <Line
          type="monotone"
          dataKey="humidity"
          stroke="#3b82f6"
          strokeWidth={2}
          dot={false}
          name="Humidity"
          unit="%"
        />
        <Line
          type="monotone"
          dataKey="airQuality"
          stroke="#22c55e"
          strokeWidth={2}
          dot={false}
          name="Air Quality"
          unit=" AQI"
        />
      </LineChart>
    </ResponsiveContainer>
  </div>
);
