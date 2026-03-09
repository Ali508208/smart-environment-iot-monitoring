# Smart Environment Monitoring System

> A production-ready, full-stack IoT project that simulates and monitors environmental conditions — temperature, humidity, air quality, and light level — with a real-time web dashboard, alert system, and historical data visualisation.

Screen Shots
<img width="1276" height="896" alt="pic&#39;" src="https://github.com/user-attachments/assets/5115f172-bf2c-4fee-987e-845bd3d9ad05" />
<img width="1270" height="899" alt="pic2" src="https://github.com/user-attachments/assets/b333bd72-e993-4732-bf9c-6a52f37801ad" />
<img width="1278" height="533" alt="pic3" src="https://github.com/user-attachments/assets/f5b25ce2-60bc-45ad-87de-30c2c1c55ffa" />

---

## Table of Contents

1. [Overview](#overview)
2. [Architecture](#architecture)
3. [Technologies Used](#technologies-used)
4. [Features](#features)
5. [Project Structure](#project-structure)
6. [Installation & Setup](#installation--setup)
7. [API Reference](#api-reference)
8. [Sensor Simulator](#sensor-simulator)
9. [Alert System](#alert-system)
10. [Screenshots](#screenshots)
11. [Future Improvements](#future-improvements)
12. [License](#license)

---

## Overview

The **Smart Environment Monitoring System** demonstrates a complete end-to-end IoT architecture. Virtual ESP32 sensor nodes publish JSON readings every 5 seconds over **MQTT**. A **Node.js / Express** backend subscribes to those topics, persists every reading to **MongoDB**, and exposes a **REST API**. A **React + Vite** dashboard consumes the API, renders live **Recharts** charts, shows per-device sensor cards, and fires alert banners whenever readings exceed safety thresholds.

The project is intentionally structured to mirror a real production system — each concern lives in its own layer and is independently testable.

---

## Architecture

```
┌──────────────────────────────────────────────────┐
│            IoT Device Layer                       │
│  sensorSimulator.js (simulates ESP32 nodes)       │
│  Publishes readings every 5 s via MQTT            │
└──────────────────┬───────────────────────────────┘
                   │  MQTT  iot/device/{id}/data
                   ▼
┌──────────────────────────────────────────────────┐
│            MQTT Broker                            │
│  Mosquitto (local) or HiveMQ (cloud)              │
└──────────────────┬───────────────────────────────┘
                   │  mqtt.js subscribe
                   ▼
┌──────────────────────────────────────────────────┐
│            Node.js / Express Backend              │
│  mqttService.js  → parses & stores readings       │
│  sensorRoutes.js → REST API for sensor data       │
│  deviceRoutes.js → REST API for device registry   │
└──────────┬──────────────────────┬────────────────┘
           │  Mongoose            │  Express REST
           ▼                      ▼
┌──────────────────┐   ┌──────────────────────────┐
│    MongoDB        │   │  React + Vite Frontend    │
│  SensorData coll. │   │  Dashboard  /dashboard    │
│  Devices coll.    │   │  Devices    /devices      │
└──────────────────┘   │  Recharts charts           │
                        │  Tailwind CSS dark UI      │
                        └──────────────────────────┘
```

---

## Technologies Used

| Layer        | Technology                       |
| :----------- | :------------------------------- |
| Frontend     | React 18, Vite 5, React Router 6 |
| Charts       | Recharts 2                       |
| Styling      | Tailwind CSS 3                   |
| HTTP Client  | Axios                            |
| Backend      | Node.js 18+, Express 4           |
| IoT Protocol | MQTT via mqtt.js 5               |
| Database     | MongoDB 7 via Mongoose 8         |
| Simulator    | Node.js script (pure mqtt.js)    |
| Dev tooling  | Nodemon                          |

---

## Features

- **Real-time sensor monitoring** — temperature, humidity, air quality (AQI), light level
- **Live dashboard** — sensor cards + Recharts line charts auto-refresh every 5 seconds
- **Historical data** — up to 1 000 readings per query; 30-day TTL auto-expiry via MongoDB index
- **Alert system** — banner fires when temperature > 40 °C or air quality > 150 AQI
- **Device management** — register, view, and delete IoT nodes; online/offline status driven by MQTT heartbeat
- **Sensor simulator** — three virtual ESP32 nodes with realistic random data and occasional spikes for alert testing
- **Production ready** — CORS, input validation, parameterised DB queries, error handling, graceful shutdown

---

## Project Structure

```
Smart Environment IOT Monitoring/
│
├── backend/
│   ├── server.js                 # Express entry point
│   ├── .env.example              # Environment variable template
│   ├── package.json
│   ├── config/
│   │   └── db.js                 # Mongoose connection
│   ├── models/
│   │   ├── SensorData.js         # Sensor readings schema
│   │   └── Device.js             # IoT device registry schema
│   ├── routes/
│   │   ├── sensorRoutes.js
│   │   └── deviceRoutes.js
│   ├── controllers/
│   │   ├── sensorController.js
│   │   └── deviceController.js
│   ├── services/
│   │   └── mqttService.js        # MQTT broker connection & message handler
│   └── simulator/
│       └── sensorSimulator.js    # Publishes fake sensor data
│
├── frontend/
│   ├── index.html
│   ├── package.json
│   ├── vite.config.js
│   ├── tailwind.config.js
│   ├── postcss.config.js
│   └── src/
│       ├── main.jsx              # React entry point
│       ├── App.jsx               # Router + layout
│       ├── api/
│       │   └── api.js            # Axios client + API helpers
│       ├── components/
│       │   ├── Navbar.jsx
│       │   ├── SensorCard.jsx
│       │   └── Charts.jsx        # Temperature / Humidity / AQ charts
│       ├── pages/
│       │   ├── Dashboard.jsx
│       │   └── Devices.jsx
│       └── styles/
│           └── global.css
│
└── README.md
```

---

## Installation & Setup

### Prerequisites

| Requirement | Version  | Notes                                                                                  |
| :---------- | :------- | :------------------------------------------------------------------------------------- |
| Node.js     | ≥ 18.0.0 | [nodejs.org](https://nodejs.org)                                                       |
| MongoDB     | ≥ 6.0    | Local install or [MongoDB Atlas](https://www.mongodb.com/atlas) (free tier)            |
| MQTT Broker | any      | [Mosquitto](https://mosquitto.org) (local) or [HiveMQ](https://www.hivemq.com) (cloud) |

---

### Step 1 — Clone the repository

```bash
git clone https://github.com/Ali508208/smart-environment-iot-monitoring.git
cd smart-environment-iot-monitoring
```

---

### Step 2 — Configure the backend environment

```bash
cd backend
cp .env.example .env
```

Edit `.env` with your values:

```env
PORT=5000
MONGODB_URI=mongodb://localhost:27017/iot-monitoring
MQTT_BROKER_URL=mqtt://localhost:1883
CORS_ORIGIN=http://localhost:5173
```

---

### Step 3 — Install backend dependencies

```bash
# still inside /backend
npm install
```

---

### Step 4 — Install frontend dependencies

```bash
cd ../frontend
npm install
```

---

### Step 5 — Start the MQTT broker

**Option A — Local Mosquitto**

```bash
# macOS (Homebrew)
brew services start mosquitto

# Ubuntu / Debian
sudo systemctl start mosquitto

# Windows
net start mosquitto
```

**Option B — Docker (no local install needed)**

```bash
docker run -d -p 1883:1883 --name mosquitto eclipse-mosquitto
```

**Option C — Cloud broker (no setup)**

Use `mqtt://broker.hivemq.com:1883` in your `.env` (no auth required for testing).

---

### Step 6 — Start the backend server

```bash
cd backend
npm run dev          # development  (nodemon, auto-restart)
# or
npm start            # production
```

Expected output:

```
🚀  Backend running → http://localhost:5000
📡  MQTT broker     → mqtt://localhost:1883
🗄️   MongoDB        → mongodb://localhost:27017/iot-monitoring
✅  MongoDB connected: localhost
✅  MQTT broker connected
📥  Subscribed to topic: iot/device/+/data
```

---

### Step 7 — Start the frontend

```bash
cd frontend
npm run dev
```

Open [http://localhost:5173](http://localhost:5173) in your browser.

---

### Step 8 — Run the sensor simulator

In a **new terminal**:

```bash
cd backend
npm run simulate
```

Expected output:

```
🟢  Simulator connected to MQTT broker @ mqtt://localhost:1883
📡  Simulating 3 device(s) — interval: 5s

[10:32:01] ESP32-001  (Living Room ) | 🌡 26.4°C | 💧 58.3% | ☁  87 AQI | ☀  432 lux
[10:32:01] ESP32-002  (Bedroom     ) | 🌡 31.1°C | 💧 45.0% | ☁ 112 AQI | ☀  275 lux
[10:32:01] ESP32-003  (Office      ) | 🌡 22.7°C | 💧 71.5% | ☁  65 AQI | ☀  890 lux
```

The dashboard will populate within 5 seconds.

---

## API Reference

All endpoints return JSON in the shape `{ success: boolean, data: any }`.

### Sensor Endpoints

| Method | Endpoint                         | Description               |
| :----- | :------------------------------- | :------------------------ |
| GET    | `/api/sensors/latest`            | Latest reading per device |
| GET    | `/api/sensors/history`           | All readings (filterable) |
| GET    | `/api/sensors/history/:deviceId` | Readings for one device   |

#### Query parameters for `/api/sensors/history`

| Param      | Type     | Default | Description                     |
| :--------- | :------- | :------ | :------------------------------ |
| `deviceId` | string   | —       | Filter to a specific device     |
| `limit`    | int      | 100     | Max records returned (max 1000) |
| `from`     | ISO date | —       | Lower bound timestamp           |
| `to`       | ISO date | —       | Upper bound timestamp           |

**Example:**

```
GET /api/sensors/history?deviceId=ESP32-001&limit=50
```

---

### Device Endpoints

| Method | Endpoint                 | Description            |
| :----- | :----------------------- | :--------------------- |
| GET    | `/api/devices`           | List all devices       |
| GET    | `/api/devices/:deviceId` | Get single device      |
| POST   | `/api/devices`           | Register a new device  |
| PUT    | `/api/devices/:deviceId` | Update device metadata |
| DELETE | `/api/devices/:deviceId` | Remove a device        |

#### POST `/api/devices` — Request body

```json
{
  "deviceId": "ESP32-001",
  "name": "Sensor Node A",
  "location": "Living Room",
  "description": "Primary environment sensor"
}
```

---

### MQTT Topic Format

```
iot/device/{deviceId}/data
```

**Payload (JSON):**

```json
{
  "temperature": 26.5,
  "humidity": 60.0,
  "airQuality": 87,
  "light": 432
}
```

---

## Sensor Simulator

The simulator (`backend/simulator/sensorSimulator.js`) creates three virtual sensor nodes. Each device:

- Generates temperature between **20–38 °C** (5 % chance of spike to 40–45 °C)
- Generates humidity between **30–90 %**
- Generates air quality between **50–149 AQI** (5 % chance of spike to 151–200)
- Generates light level between **100–1000 lux**
- Publishes every **5 seconds** with a random start jitter

Spikes are intentionally included so the alert banners on the dashboard can be exercised without waiting.

---

## Alert System

| Metric      | Threshold | Trigger                       |
| :---------- | :-------- | :---------------------------- |
| Temperature | > 40 °C   | Red alert banner on dashboard |
| Air Quality | > 150 AQI | Red alert banner on dashboard |

Alerts are also logged to the backend console for server-side observability.

---

## Screenshots

> _Add screenshots to a `/screenshots` folder and update the paths below._

| Dashboard — Live Sensor Cards | Dashboard — Historical Charts |
| :---------------------------: | :---------------------------: |
|  `screenshots/dashboard.png`  |   `screenshots/charts.png`    |

|   Alert Banner Active    |       Devices Page        |
| :----------------------: | :-----------------------: |
| `screenshots/alerts.png` | `screenshots/devices.png` |

---

## Future Improvements

- [ ] **WebSocket / SSE** — replace REST polling with pushed events for true real-time updates
- [ ] **Authentication** — JWT-based login so only authorised users can view or manage devices
- [ ] **Docker Compose** — containerise backend, frontend, MongoDB, and Mosquitto for one-command startup
- [ ] **Grafana integration** — connect MongoDB or InfluxDB to Grafana for advanced analytics
- [ ] **Multi-metric device charts** — per-device drill-down pages with full history
- [ ] **Email / SMS alerts** — send notifications via SendGrid / Twilio when thresholds are exceeded
- [ ] **OTA update commands** — use MQTT downlink topics to push firmware updates to ESP32 nodes
- [ ] **Data export** — CSV / JSON export endpoint for offline analysis
- [ ] **Unit tests** — Jest tests for controllers and React Testing Library for components
- [ ] **CI/CD pipeline** — GitHub Actions workflow for lint, test, and Docker build on PR

---

## License

MIT © 2026 — Smart Environment IoT Monitoring System
