import { RoadReport, SensorVector } from "../types/RoadReport";
import { db } from "./firebase";
import { ref, get, onValue } from "firebase/database";

export const MAX_LIVE_RECORDS = 500;
export const ONLINE_THRESHOLD_MS = 2 * 60 * 1000;

const DATABASE_PATH = "roadReports";

function parseSensorValue(value: unknown): SensorVector | undefined {
  if (value == null) return undefined;

  if (typeof value === "string") return value;

  if (
    typeof value === "object" &&
    value !== null &&
    "x" in value &&
    "y" in value &&
    "z" in value
  ) {
    const v = value as { x: number; y: number; z: number };

    return {
      x: v.x,
      y: v.y,
      z: v.z,
    };
  }

  return undefined;
}

function parseTimestamp(value: unknown): string {
  if (typeof value === "number") {
    return new Date(value).toISOString();
  }

  if (typeof value === "string") {
    return value;
  }

  return new Date().toISOString();
}

function mapRealtimeData(id: string, data: any): RoadReport {
  return {
    id,

    deviceId: data.deviceId || "",

    roadName: data.roadName || "",

    latitude: data.latitude ?? 0,

    longitude: data.longitude ?? 0,

    condition: data.condition || "Moderate",

    confidence: data.confidence ?? 0,

    timestamp: parseTimestamp(data.timestamp),

    accelerometer: parseSensorValue(data.accelerometer),

    gyroscope: parseSensorValue(data.gyroscope),

    speed: data.speed,

    battery: data.battery,
  };
}

export const getRoadReports = async (): Promise<RoadReport[]> => {
  try {
    const snapshot = await get(ref(db, DATABASE_PATH));

    if (!snapshot.exists()) return [];

    const raw = snapshot.val();

    const reports = Object.entries(raw).map(([id, data]) =>
      mapRealtimeData(id, data)
    );

    reports.sort(
      (a, b) =>
        new Date(b.timestamp).getTime() -
        new Date(a.timestamp).getTime()
    );

    return reports;
  } catch (err) {
    console.error("Realtime Database Error:", err);
    return [];
  }
};

export const subscribeToRoadReports = (
  callback: (reports: RoadReport[]) => void,
  onError?: (error: Error) => void
) => {
  const reportsRef = ref(db, DATABASE_PATH);

  return onValue(
    reportsRef,
    (snapshot) => {
      if (!snapshot.exists()) {
        callback([]);
        return;
      }

      const raw = snapshot.val();

      const reports = Object.entries(raw).map(([id, data]) =>
        mapRealtimeData(id, data)
      );

      reports.sort(
        (a, b) =>
          new Date(b.timestamp).getTime() -
          new Date(a.timestamp).getTime()
      );

      callback(reports);
    },
    (error) => {
      console.error(error);

      if (onError)
        onError(error);
      else
        callback([]);
    }
  );
};