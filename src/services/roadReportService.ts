import { RoadReport, SensorVector } from '../types/RoadReport';
import { db } from './firebase';
import { collection, getDocs, query, orderBy, onSnapshot, DocumentSnapshot } from 'firebase/firestore';

const COLLECTION_NAME = 'roadReports';
export const MAX_LIVE_RECORDS = 500;
export const ONLINE_THRESHOLD_MS = 2 * 60 * 1000;

function parseSensorValue(value: unknown): SensorVector | undefined {
  if (value == null) return undefined;
  if (typeof value === 'string') return value;
  if (typeof value === 'object' && value !== null && 'x' in value && 'y' in value && 'z' in value) {
    const v = value as { x: number; y: number; z: number };
    return { x: v.x, y: v.y, z: v.z };
  }
  return undefined;
}

function parseTimestamp(value: unknown): string {
  if (value && typeof value === 'object' && 'toDate' in value && typeof value.toDate === 'function') {
    return value.toDate().toISOString();
  }
  if (typeof value === 'string') return value;
  return new Date().toISOString();
}

export function mapDocToRoadReport(doc: DocumentSnapshot): RoadReport {
  const data = doc.data() ?? {};
  const nestedLocation = data.location as { latitude?: number; longitude?: number } | undefined;

  const latitude =
    typeof data.latitude === 'number'
      ? data.latitude
      : nestedLocation?.latitude ?? 0;
  const longitude =
    typeof data.longitude === 'number'
      ? data.longitude
      : nestedLocation?.longitude ?? 0;

  return {
    id: doc.id,
    deviceId: (data.deviceId as string) || '',
    roadName: (data.roadName as string) || '',
    latitude,
    longitude,
    condition: (data.condition as RoadReport['condition']) || 'Moderate',
    confidence: (data.confidence as number) ?? 0,
    timestamp: parseTimestamp(data.timestamp),
    accelerometer: parseSensorValue(data.accelerometer ?? data.accel),
    gyroscope: parseSensorValue(data.gyroscope ?? data.gyro),
    speed: typeof data.speed === 'number' ? data.speed : undefined,
    battery: typeof data.battery === 'number' ? data.battery : undefined,
  };
}

/**
 * One-time fetch of all road reports from Firestore.
 */
export const getRoadReports = async (): Promise<RoadReport[]> => {
  try {
    const reportsRef = collection(db, COLLECTION_NAME);
    const q = query(reportsRef, orderBy('timestamp', 'desc'));
    const snapshot = await getDocs(q);

    return snapshot.docs.map(mapDocToRoadReport);
  } catch (error) {
    console.error('Error fetching road reports from Firestore:', error);
    return [];
  }
};

/**
 * Real-time listener for road reports from Firestore.
 * @param callback Function to call when data updates
 * @param onError Optional error handler — when omitted, errors fall back to empty array
 * @returns Unsubscribe function
 */
export const subscribeToRoadReports = (
  callback: (reports: RoadReport[]) => void,
  onError?: (error: Error) => void
) => {
  const reportsRef = collection(db, COLLECTION_NAME);
  const q = query(reportsRef, orderBy('timestamp', 'desc'));

  const unsubscribe = onSnapshot(
    q,
    (snapshot) => {
      const reports = snapshot.docs.map(mapDocToRoadReport);
      callback(reports);
    },
    (error) => {
      console.error('Error listening to road reports:', error);
      if (onError) {
        onError(error);
      } else {
        callback([]);
      }
    }
  );

  return unsubscribe;
};
