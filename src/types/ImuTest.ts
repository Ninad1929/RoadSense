import type { GpsRawPayload } from "./GpsTest";

export interface ImuSensorVector {
  x?: number | null;
  y?: number | null;
  z?: number | null;
}

export interface ImuDataPayload {
  deviceId?: string;
  timestamp?: number | string;
  accelerometer?: ImuSensorVector;
  gyroscope?: ImuSensorVector;
  gps?: GpsRawPayload;
}
