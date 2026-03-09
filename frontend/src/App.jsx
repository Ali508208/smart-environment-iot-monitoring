// src/App.jsx — Root component: layout wrapper + client-side routing
import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";

import Navbar from "./components/Navbar";
import Dashboard from "./pages/Dashboard";
import Devices from "./pages/Devices";

function App() {
  return (
    <div className="min-h-screen bg-gray-950 text-gray-100">
      {/* Sticky top navigation */}
      <Navbar />

      {/* Page content — constrained to a comfortable max-width */}
      <main className="container mx-auto px-4 py-8 max-w-7xl">
        <Routes>
          {/* Redirect root to dashboard */}
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/devices" element={<Devices />} />

          {/* Catch-all — redirect unknown paths */}
          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Routes>
      </main>
    </div>
  );
}

export default App;
