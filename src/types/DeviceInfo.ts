import { RoadReport } from './RoadReport';

export interface DeviceInfo {
  deviceId: string;
  isOnline: boolean;
  lastCommunication: string;
  latestCondition: RoadReport['condition'];
  latitude: number;
  longitude: number;
  battery?: number;
  latestReportId: string;
}
