/**
 * config/db.js — Mongoose connection helper
 *
 * Reads MONGODB_URI from the environment and connects once.
 * Terminates the process on unrecoverable failure so the
 * container / PM2 supervisor can restart with back-off.
 */

const mongoose = require("mongoose");

const connectDB = async () => {
  try {
    const uri =
      process.env.MONGODB_URI || "mongodb://localhost:27017/iot-monitoring";
    const conn = await mongoose.connect(uri, {
      // These options are the current Mongoose 8 defaults; listed explicitly
      // so behaviour is obvious when upgrading.
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 45000,
    });

    console.log(`✅  MongoDB connected: ${conn.connection.host}`);

    mongoose.connection.on("disconnected", () =>
      console.warn("⚠️   MongoDB disconnected — reconnecting…"),
    );
  } catch (err) {
    console.error(`❌  MongoDB connection failed: ${err.message}`);
    process.exit(1);
  }
};

module.exports = connectDB;
