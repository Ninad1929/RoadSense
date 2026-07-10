export interface RoadReport {
  id: string;
  roadName: string;
  latitude: number;
  longitude: number;
  condition: "Good" | "Moderate" | "Poor";
  confidence: number;
  timestamp: string;
  deviceId: string;
}
