/**
 * Raw GPS data as received from Firebase (uploaded by ESP32).
 * Contains the raw NMEA sentence string from the NEO-6M module.
 *
 * Data flow:
 *   NEO-6M → RAW NMEA → STM32 → RAW NMEA → ESP32 → RAW NMEA → Firebase
 *
 * No GPS processing happens on STM32 or ESP32.
 * All NMEA parsing is performed client-side in gpsTestService.ts.
 */
export interface GpsRawPayload {
  /** Raw NMEA sentence string, e.g. "$GPGGA,123519,..." */
  nmea?: string;
}

/**
 * Result of parsing an NMEA sentence into usable GPS coordinates.
 */
export interface ParsedGpsCoordinates {
  /** Latitude in decimal degrees (positive = N, negative = S) */
  latitude: number;
  /** Longitude in decimal degrees (positive = E, negative = W) */
  longitude: number;
  /** Whether the GPS has a valid fix */
  hasFix: boolean;
  /** UTC time string from the NMEA sentence (HHMMSS or HHMMSS.ss) */
  utcTime?: string;
  /** Number of satellites in use (GGA only) */
  satelliteCount?: number;
  /** Altitude in meters above mean sea level (GGA only) */
  altitude?: number;
  /** Speed over ground in knots (RMC only) */
  speedKnots?: number;
  /** The NMEA sentence type that was parsed (e.g. "GGA", "RMC") */
  sentenceType?: string;
}

/**
 * Possible GPS stream states for the UI
 */
export type GpsStreamStatus = "waiting" | "live" | "no-fix" | "error";
