export type SensorVector =
  | { x: number; y: number; z: number }
  | string;

export interface RoadReport {
  id: string;
  deviceId: string;
  roadName: string;
  latitude: number;
  longitude: number;
  condition: 'Good' | 'Moderate' | 'Poor';
  confidence: number;
  timestamp: string;
  accelerometer?: SensorVector;
  gyroscope?: SensorVector;
  speed?: number;
  battery?: number;
}

export interface LiveMonitoringSummary {
  connectedDevices: number;
  onlineDevices: number;
  offlineDevices: number;
  todaysDetections: number;
}
