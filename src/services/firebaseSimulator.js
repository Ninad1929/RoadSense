import { db } from "./firebase";
import { ref, push } from "firebase/database";

const ENABLE_SIMULATOR = true;
const INTERVAL = 4000;

const devices = [
  "SPOTHOLES_01",
  "SPOTHOLES_02",
  "SPOTHOLES_03",
  "SPOTHOLES_04",
  "SPOTHOLES_05",
];

const roads = [
  { name: "SPIT Campus", lat: 19.123850, lng: 72.836920 },
  { name: "Andheri East", lat: 19.113600, lng: 72.869700 },
  { name: "Powai", lat: 19.117600, lng: 72.906000 },
  { name: "Bandra", lat: 19.054400, lng: 72.840500 },
  { name: "Kurla", lat: 19.072800, lng: 72.882600 },
  { name: "Sion", lat: 19.043400, lng: 72.861000 },
  { name: "Chembur", lat: 19.052200, lng: 72.900500 },
  { name: "Vashi", lat: 19.077100, lng: 72.998700 },
  { name: "Panvel", lat: 18.989400, lng: 73.117500 },
  { name: "Airoli", lat: 19.155000, lng: 72.999000 },
];

function rand(min, max) {
  return Math.random() * (max - min) + min;
}

let routeIndex = 0;

async function uploadRoadData() {
  const road = roads[routeIndex];

  routeIndex++;

  if (routeIndex >= roads.length)
    routeIndex = 0;

  const condition =
    Math.random() < 0.65
      ? "Good"
      : Math.random() < 0.8
      ? "Moderate"
      : "Poor";

  const data = {
    deviceId: devices[Math.floor(Math.random() * devices.length)],

    roadName: road.name,

    latitude: Number((road.lat + rand(-0.0005, 0.0005)).toFixed(6)),

    longitude: Number((road.lng + rand(-0.0005, 0.0005)).toFixed(6)),

    condition,

    confidence: Math.floor(rand(85, 99)),

    accelerometer: {
      x: Number(rand(-2, 2).toFixed(2)),
      y: Number(rand(-2, 2).toFixed(2)),
      z: Number(rand(8, 12).toFixed(2)),
    },

    gyroscope: {
      x: Number(rand(-1, 1).toFixed(2)),
      y: Number(rand(-1, 1).toFixed(2)),
      z: Number(rand(-1, 1).toFixed(2)),
    },

    speed: Math.floor(rand(20, 60)),

    timestamp: Date.now(),
  };

  try {
    await push(ref(db, "roadReports"), data);

    console.log("Uploaded:", data);
  } catch (err) {
    console.error("Upload failed:", err);
  }
}

export function startFirebaseSimulator() {
  if (!ENABLE_SIMULATOR) return;

  console.log("=================================");
  console.log("Realtime Database Simulator Started");
  console.log("=================================");

  uploadRoadData();

  setInterval(uploadRoadData, INTERVAL);
}