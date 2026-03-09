// src/components/Navbar.jsx — Sticky top navigation bar
import React from "react";
import { NavLink } from "react-router-dom";

/** Tailwind classes toggled by React-Router's isActive flag */
const linkClass = ({ isActive }) =>
  `px-4 py-2 rounded-lg text-sm font-medium transition-colors duration-150 ${
    isActive
      ? "bg-blue-600 text-white shadow-sm"
      : "text-gray-400 hover:bg-gray-800 hover:text-gray-100"
  }`;

const Navbar = () => (
  <nav className="bg-gray-900 border-b border-gray-800 sticky top-0 z-50 shadow-lg">
    <div className="container mx-auto px-4 max-w-7xl">
      <div className="flex items-center justify-between h-16">
        {/* ── Brand ──────────────────────────────────────────── */}
        <div className="flex items-center gap-3">
          {/* Logo tile */}
          <div className="w-9 h-9 bg-blue-600 rounded-xl flex items-center justify-center shadow-md shadow-blue-900/40">
            <svg
              className="w-5 h-5 text-white"
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

          {/* Title block */}
          <div className="hidden sm:block">
            <p className="text-white font-bold text-sm leading-tight">
              Smart Environment
            </p>
            <p className="text-gray-500 text-xs">IoT Monitoring System</p>
          </div>
        </div>

        {/* ── Navigation links ────────────────────────────────── */}
        <div className="flex items-center gap-1">
          <NavLink to="/dashboard" className={linkClass}>
            <span className="flex items-center gap-1.5">
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
                  d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"
                />
              </svg>
              Dashboard
            </span>
          </NavLink>

          <NavLink to="/devices" className={linkClass}>
            <span className="flex items-center gap-1.5">
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
                  d="M9 3H5a2 2 0 00-2 2v4m6-6h10a2 2 0 012 2v4M9 3v18m0 0h10a2 2 0 002-2V9m-12 12H5a2 2 0 01-2-2V9m0 0h18"
                />
              </svg>
              Devices
            </span>
          </NavLink>
        </div>

        {/* ── Live indicator ──────────────────────────────────── */}
        <div className="flex items-center gap-2">
          {/* Pulsing green dot */}
          <span className="relative flex h-2.5 w-2.5">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-60" />
            <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-green-500" />
          </span>
          <span className="text-gray-400 text-xs hidden sm:inline">Live</span>
        </div>
      </div>
    </div>
  </nav>
);

export default Navbar;
