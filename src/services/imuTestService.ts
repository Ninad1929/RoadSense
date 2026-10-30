import { ref, onValue, set } from "firebase/database";
import { db } from "./firebase";
import { ImuDataPayload, ImuSensorVector } from "../types/ImuTest";
import type { GpsRawPayload } from "../types/GpsTest";

export const IMU_TEST_PATH = "imuTest/latest";

function parseVector(val: unknown): ImuSensorVector | undefined {
  if (!val || typeof val !== "object") return undefined;
  const obj = val as Record<string, unknown>;

  const toNum = (v: unknown): number | null => {
    if (v === null || v === undefined) return null;
    const n = Number(v);
    return isNaN(n) ? null : n;
  };

  return {
    x: toNum(obj.x),
    y: toNum(obj.y),
    z: toNum(obj.z),
  };
}

function parseGpsRaw(val: unknown): GpsRawPayload | undefined {
  if (!val || typeof val !== "object") return undefined;
  const obj = val as Record<string, unknown>;
  if (typeof obj.nmea !== "string") return undefined;
  return { nmea: obj.nmea };
}

export function parseImuPayload(raw: unknown): ImuDataPayload | null {
  if (!raw || typeof raw !== "object") return null;

  const data = raw as Record<string, unknown>;

  return {
    deviceId: typeof data.deviceId === "string" ? data.deviceId : undefined,
    timestamp: typeof data.timestamp === "number" || typeof data.timestamp === "string" ? data.timestamp : undefined,
    accelerometer: parseVector(data.accelerometer),
    gyroscope: parseVector(data.gyroscope),
    gps: parseGpsRaw(data.gps),
  };
}

/**
 * Real-time listener for the latest IMU test data from hardware
 */
export function subscribeToImuTest(
  onData: (data: ImuDataPayload | null, raw: unknown) => void,
  onError?: (error: Error) => void
) {
  const imuRef = ref(db, IMU_TEST_PATH);

  return onValue(
    imuRef,
    (snapshot) => {
      if (!snapshot.exists()) {
        onData(null, null);
        return;
      }
      const raw = snapshot.val();
      const parsed = parseImuPayload(raw);
      onData(parsed, raw);
    },
    (error) => {
      console.error("Firebase IMU Test listener error:", error);
      if (onError) onError(error);
      else onData(null, null);
    }
  );
}

/**
 * Real-time listener for Firebase connection state (.info/connected)
 */
export function subscribeToFirebaseConnection(
  onStatusChange: (isConnected: boolean) => void
) {
  const connectedRef = ref(db, ".info/connected");

  return onValue(
    connectedRef,
    (snapshot) => {
      const connected = Boolean(snapshot.val());
      onStatusChange(connected);
    },
    (err) => {
      console.warn("Connection status listener error:", err);
      onStatusChange(false);
    }
  );
}

/**
 * Test utility to manually push a test frame to /imuTest/latest
 * Useful for validating the page before physical hardware is powered on
 */
export async function sendManualImuTestData(customPayload?: Partial<ImuDataPayload>): Promise<void> {
  const imuRef = ref(db, IMU_TEST_PATH);
  const payload: ImuDataPayload = {
    deviceId: customPayload?.deviceId || "TEST-DEVICE-01",
    timestamp: customPayload?.timestamp || Date.now(),
    accelerometer: customPayload?.accelerometer || {
      x: 0.12,
      y: -0.04,
      z: 9.81,
    },
    gyroscope: customPayload?.gyroscope || {
      x: 0.01,
      y: -0.02,
      z: 0.00,
    },
    gps: customPayload?.gps || {
      nmea: "$GPGGA,123519,1904.1234,N,07252.5678,E,1,08,0.9,10.0,M,0.0,M,,*49",
    },
  };

  await set(imuRef, payload);
}
