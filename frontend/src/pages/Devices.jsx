// src/pages/Devices.jsx — IoT device registration & management page
import React, { useState, useEffect } from "react";
import { deviceAPI } from "../api/api";

// ── Status colour map ─────────────────────────────────────────
const STATUS = {
  online: {
    dot: "bg-green-400",
    badge: "bg-green-500/15 text-green-400 border-green-500/30",
    label: "Online",
  },
  offline: {
    dot: "bg-gray-600",
    badge: "bg-gray-700/40  text-gray-400  border-gray-600/30",
    label: "Offline",
  },
};

// ── Register Device Modal ────────────────────────────────────
const RegisterModal = ({ onClose, onSuccess }) => {
  const FIELDS = [
    { key: "deviceId", label: "Device ID *", placeholder: "e.g. ESP32-001" },
    { key: "name", label: "Name *", placeholder: "e.g. Sensor Node A" },
    { key: "location", label: "Location", placeholder: "e.g. Living Room" },
    { key: "description", label: "Description", placeholder: "Optional notes" },
  ];

  const [form, setForm] = useState({
    deviceId: "",
    name: "",
    location: "",
    description: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleChange = (key, value) => setForm((f) => ({ ...f, [key]: value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.deviceId.trim()) {
      setError("Device ID is required.");
      return;
    }
    if (!form.name.trim()) {
      setError("Name is required.");
      return;
    }

    setLoading(true);
    setError("");
    try {
      await deviceAPI.register(form);
      onSuccess();
      onClose();
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Close on Escape key
  useEffect(() => {
    const handler = (e) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [onClose]);

  return (
    <div
      className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="bg-gray-900 border border-gray-700 rounded-2xl w-full max-w-md shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-gray-800">
          <h2 className="text-white font-semibold">Register New Device</h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-200 transition-colors"
          >
            <svg
              className="w-5 h-5"
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

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {error && (
            <p className="bg-red-950/50 border border-red-500/30 rounded-lg px-4 py-2.5 text-red-300 text-sm">
              {error}
            </p>
          )}

          {FIELDS.map(({ key, label, placeholder }) => (
            <div key={key}>
              <label className="block text-gray-400 text-xs font-medium mb-1.5 uppercase tracking-wider">
                {label}
              </label>
              <input
                type="text"
                value={form[key]}
                onChange={(e) => handleChange(key, e.target.value)}
                placeholder={placeholder}
                className="
                  w-full bg-gray-800 border border-gray-700 rounded-lg
                  px-4 py-2.5 text-gray-100 text-sm placeholder-gray-600
                  focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500/30
                  transition-colors
                "
              />
            </div>
          ))}

          {/* Actions */}
          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 bg-gray-800 hover:bg-gray-700 text-gray-300 py-2.5 rounded-xl text-sm font-medium transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 bg-blue-600 hover:bg-blue-500 disabled:opacity-50 disabled:cursor-not-allowed text-white py-2.5 rounded-xl text-sm font-medium transition-colors"
            >
              {loading ? "Registering…" : "Register Device"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

// ── Device Card ───────────────────────────────────────────────
const DeviceCard = ({ device, onDelete }) => {
  const status = STATUS[device.status] ?? STATUS.offline;
  return (
    <div className="bg-gray-900 border border-gray-800 hover:border-gray-700 rounded-xl p-5 flex flex-col gap-4 transition-colors">
      {/* Header row */}
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-3">
          {/* Device icon tile */}
          <div className="w-10 h-10 bg-blue-600/15 border border-blue-600/25 rounded-xl flex items-center justify-center shrink-0">
            <svg
              className="w-5 h-5 text-blue-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 3H5a2 2 0 00-2 2v4m6-6h10a2 2 0 012 2v4M9 3v18m0 0h10a2 2 0 002-2V9m-12 12H5a2 2 0 01-2-2V9m0 0h18"
              />
            </svg>
          </div>

          <div className="min-w-0">
            <p className="text-white font-semibold text-sm leading-tight truncate">
              {device.name}
            </p>
            <p className="text-gray-500 text-xs font-mono">{device.deviceId}</p>
          </div>
        </div>

        {/* Status badge */}
        <span
          className={`text-xs px-2.5 py-1 rounded-full border font-medium shrink-0 ${status.badge}`}
        >
          <span
            className={`inline-block w-1.5 h-1.5 rounded-full mr-1.5 ${status.dot}`}
          />
          {status.label}
        </span>
      </div>

      {/* Details */}
      <div className="space-y-1.5 text-sm">
        {device.location && (
          <div className="flex items-center gap-2 text-gray-400">
            <svg
              className="w-3.5 h-3.5 text-gray-600 shrink-0"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
              />
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
              />
            </svg>
            <span className="text-xs">{device.location}</span>
          </div>
        )}

        {device.lastSeen && (
          <div className="flex items-center gap-2 text-gray-500">
            <svg
              className="w-3.5 h-3.5 shrink-0"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
            <span className="text-xs">
              Last seen: {new Date(device.lastSeen).toLocaleString()}
            </span>
          </div>
        )}

        {device.description && (
          <p className="text-gray-500 text-xs leading-relaxed">
            {device.description}
          </p>
        )}
      </div>

      {/* Footer: delete action */}
      <div className="pt-3 border-t border-gray-800 flex justify-end">
        <button
          onClick={() => onDelete(device.deviceId)}
          className="text-gray-600 hover:text-red-400 text-xs flex items-center gap-1 transition-colors"
        >
          <svg
            className="w-3.5 h-3.5"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
            />
          </svg>
          Delete
        </button>
      </div>
    </div>
  );
};

// ── Devices Page ──────────────────────────────────────────────
const Devices = () => {
  const [devices, setDevices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showModal, setShowModal] = useState(false);

  const fetchDevices = async () => {
    try {
      const res = await deviceAPI.getAll();
      setDevices(res.data ?? []);
      setError(null);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDevices();
    // Re-poll every 10 s to pick up status changes from MQTT
    const timer = setInterval(fetchDevices, 10000);
    return () => clearInterval(timer);
  }, []);

  const handleDelete = async (deviceId) => {
    if (!window.confirm(`Delete device "${deviceId}"? This cannot be undone.`))
      return;
    try {
      await deviceAPI.remove(deviceId);
      setDevices((prev) => prev.filter((d) => d.deviceId !== deviceId));
    } catch (err) {
      alert("Failed to delete device: " + err.message);
    }
  };

  const onlineCount = devices.filter((d) => d.status === "online").length;
  const offlineCount = devices.length - onlineCount;

  return (
    <div>
      {/* ── Header ──────────────────────────────────────────── */}
      <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-white">Devices</h1>
          <p className="text-gray-400 text-sm mt-0.5">
            Manage your IoT sensor nodes
          </p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="bg-blue-600 hover:bg-blue-500 text-white px-4 py-2.5 rounded-xl text-sm font-medium flex items-center gap-2 transition-colors shadow-lg shadow-blue-900/30"
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
              d="M12 4v16m8-8H4"
            />
          </svg>
          Register Device
        </button>
      </div>

      {/* ── Stats strip ─────────────────────────────────────── */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        {[
          { label: "Total", value: devices.length, color: "text-white" },
          { label: "Online", value: onlineCount, color: "text-green-400" },
          { label: "Offline", value: offlineCount, color: "text-gray-500" },
        ].map(({ label, value, color }) => (
          <div
            key={label}
            className="bg-gray-900 border border-gray-800 rounded-xl p-4"
          >
            <p className="text-gray-500 text-xs mb-1">{label}</p>
            <p className={`text-2xl font-bold ${color}`}>{value}</p>
          </div>
        ))}
      </div>

      {/* ── Error notice ─────────────────────────────────────── */}
      {error && (
        <div className="bg-yellow-950/40 border border-yellow-600/30 rounded-xl p-4 mb-6 text-yellow-300 text-sm">
          Backend unreachable — {error}
        </div>
      )}

      {/* ── Content ─────────────────────────────────────────── */}
      {loading ? (
        <div className="flex justify-center py-16">
          <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
        </div>
      ) : devices.length === 0 ? (
        <div className="bg-gray-900 border border-gray-800 rounded-xl p-14 text-center">
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
                d="M9 3H5a2 2 0 00-2 2v4m6-6h10a2 2 0 012 2v4M9 3v18m0 0h10a2 2 0 002-2V9m-12 12H5a2 2 0 01-2-2V9m0 0h18"
              />
            </svg>
          </div>
          <h3 className="text-gray-300 font-medium mb-2">
            No devices registered
          </h3>
          <p className="text-gray-500 text-sm">
            Click{" "}
            <span className="text-blue-400 font-medium">Register Device</span>{" "}
            or run the simulator to auto-create devices.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {devices.map((device) => (
            <DeviceCard
              key={device.deviceId}
              device={device}
              onDelete={handleDelete}
            />
          ))}
        </div>
      )}

      {/* ── Modal ───────────────────────────────────────────── */}
      {showModal && (
        <RegisterModal
          onClose={() => setShowModal(false)}
          onSuccess={fetchDevices}
        />
      )}
    </div>
  );
};

export default Devices;
