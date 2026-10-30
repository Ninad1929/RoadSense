/**
 * GPS/NMEA Processing Service
 *
 * Parses raw NMEA sentences received from the NEO-6M GPS module.
 * All GPS coordinate conversion happens HERE (client-side), not on STM32 or ESP32.
 *
 * Hardware data flow:
 *   NEO-6M → RAW NMEA → STM32 → RAW NMEA → ESP32 → RAW NMEA → Firebase → THIS SERVICE → Lat/Lng
 *
 * Supported sentence types:
 *   - $GPGGA / $GNGGA  (Global Positioning System Fix Data)
 *   - $GPRMC / $GNRMC  (Recommended Minimum Specific GPS/Transit Data)
 */

import type { GpsRawPayload, ParsedGpsCoordinates } from "../types/GpsTest";

// ---------------------------------------------------------------------------
// NMEA Checksum Validation
// ---------------------------------------------------------------------------

/**
 * Validates the NMEA checksum if present.
 * The checksum is a two-digit hex value after '*', computed as XOR of all
 * characters between '$' and '*' (exclusive).
 *
 * Returns true if no checksum is present (lenient) or if the checksum matches.
 */
export function validateNmeaChecksum(sentence: string): boolean {
  const asteriskIndex = sentence.indexOf("*");
  if (asteriskIndex === -1) {
    // No checksum present — lenient pass
    return true;
  }

  const checksumStr = sentence.substring(asteriskIndex + 1).trim();
  if (checksumStr.length < 2) return false;

  const expectedChecksum = parseInt(checksumStr.substring(0, 2), 16);
  if (isNaN(expectedChecksum)) return false;

  // XOR all characters between '$' and '*'
  const body = sentence.substring(
    sentence.startsWith("$") ? 1 : 0,
    asteriskIndex
  );

  let computed = 0;
  for (let i = 0; i < body.length; i++) {
    computed ^= body.charCodeAt(i);
  }

  return computed === expectedChecksum;
}

// ---------------------------------------------------------------------------
// NMEA Coordinate Conversion
// ---------------------------------------------------------------------------

/**
 * Converts NMEA coordinate format (DDMM.MMMM or DDDMM.MMMM) to decimal degrees.
 *
 * NMEA latitude format:  DDMM.MMMM  (2 digits for degrees)
 * NMEA longitude format: DDDMM.MMMM (3 digits for degrees)
 *
 * @param raw      Raw NMEA coordinate string (e.g. "1904.1234")
 * @param hemisphere  N/S/E/W direction indicator
 * @param isLongitude  true if parsing longitude (3-digit degree), false for latitude (2-digit)
 */
export function nmeaCoordToDecimalDegrees(
  raw: string,
  hemisphere: string,
  isLongitude: boolean
): number | null {
  if (!raw || raw.trim() === "") return null;

  const dotIndex = raw.indexOf(".");
  if (dotIndex === -1) return null;

  // Degrees occupy the first 2 chars (latitude) or 3 chars (longitude)
  const degreeDigits = isLongitude ? 3 : 2;
  if (dotIndex < degreeDigits) return null;

  const degreesStr = raw.substring(0, dotIndex - 2);
  const minutesStr = raw.substring(dotIndex - 2);

  const degrees = parseFloat(degreesStr);
  const minutes = parseFloat(minutesStr);

  if (isNaN(degrees) || isNaN(minutes)) return null;
  if (minutes < 0 || minutes >= 60) return null;

  let decimal = degrees + minutes / 60;

  // Apply sign based on hemisphere
  const hem = hemisphere.toUpperCase();
  if (hem === "S" || hem === "W") {
    decimal = -decimal;
  }

  return decimal;
}

// ---------------------------------------------------------------------------
// Sentence Parsers
// ---------------------------------------------------------------------------

/**
 * Parses a GGA sentence (GPS Fix Data).
 *
 * GGA field layout:
 *   0: $GPGGA / $GNGGA
 *   1: UTC time (HHMMSS.ss)
 *   2: Latitude (DDMM.MMMM)
 *   3: N/S
 *   4: Longitude (DDDMM.MMMM)
 *   5: E/W
 *   6: Fix quality (0=no fix, 1=GPS, 2=DGPS, ...)
 *   7: Number of satellites
 *   8: HDOP
 *   9: Altitude (MSL)
 *   10: Altitude unit (M)
 *   11: Geoid separation
 *   12: Geoid unit (M)
 *   13: DGPS age
 *   14: DGPS station ID
 */
function parseGGA(fields: string[]): ParsedGpsCoordinates | null {
  if (fields.length < 7) return null;

  const fixQuality = parseInt(fields[6], 10);
  const hasFix = !isNaN(fixQuality) && fixQuality > 0;

  if (!hasFix) {
    return {
      latitude: 0,
      longitude: 0,
      hasFix: false,
      utcTime: fields[1] || undefined,
      sentenceType: "GGA",
    };
  }

  const latitude = nmeaCoordToDecimalDegrees(fields[2], fields[3], false);
  const longitude = nmeaCoordToDecimalDegrees(fields[4], fields[5], true);

  if (latitude === null || longitude === null) return null;

  const satelliteCount = parseInt(fields[7], 10);
  const altitude = fields.length > 9 ? parseFloat(fields[9]) : undefined;

  return {
    latitude,
    longitude,
    hasFix: true,
    utcTime: fields[1] || undefined,
    satelliteCount: isNaN(satelliteCount) ? undefined : satelliteCount,
    altitude: altitude !== undefined && !isNaN(altitude) ? altitude : undefined,
    sentenceType: "GGA",
  };
}

/**
 * Parses an RMC sentence (Recommended Minimum).
 *
 * RMC field layout:
 *   0: $GPRMC / $GNRMC
 *   1: UTC time (HHMMSS.ss)
 *   2: Status (A=active/valid, V=void/invalid)
 *   3: Latitude (DDMM.MMMM)
 *   4: N/S
 *   5: Longitude (DDDMM.MMMM)
 *   6: E/W
 *   7: Speed over ground (knots)
 *   8: Course over ground (degrees)
 *   9: Date (DDMMYY)
 *   10: Magnetic variation
 *   11: Magnetic variation direction
 */
function parseRMC(fields: string[]): ParsedGpsCoordinates | null {
  if (fields.length < 7) return null;

  const status = fields[2]?.toUpperCase();
  const hasFix = status === "A";

  if (!hasFix) {
    return {
      latitude: 0,
      longitude: 0,
      hasFix: false,
      utcTime: fields[1] || undefined,
      sentenceType: "RMC",
    };
  }

  const latitude = nmeaCoordToDecimalDegrees(fields[3], fields[4], false);
  const longitude = nmeaCoordToDecimalDegrees(fields[5], fields[6], true);

  if (latitude === null || longitude === null) return null;

  const speedKnots =
    fields.length > 7 ? parseFloat(fields[7]) : undefined;

  return {
    latitude,
    longitude,
    hasFix: true,
    utcTime: fields[1] || undefined,
    speedKnots:
      speedKnots !== undefined && !isNaN(speedKnots)
        ? speedKnots
        : undefined,
    sentenceType: "RMC",
  };
}

// ---------------------------------------------------------------------------
// Main NMEA Parser
// ---------------------------------------------------------------------------

/**
 * Parses a raw NMEA sentence string and returns structured GPS coordinates.
 *
 * Supports: $GPGGA, $GNGGA, $GPRMC, $GNRMC
 *
 * Returns null for:
 *   - Empty/missing input
 *   - Unsupported sentence types
 *   - Malformed sentences
 *   - Failed checksum validation
 */
export function parseNmeaSentence(
  nmea: string | undefined | null
): ParsedGpsCoordinates | null {
  if (!nmea || typeof nmea !== "string") return null;

  const trimmed = nmea.trim();
  if (trimmed.length === 0) return null;

  // Must start with '$'
  if (!trimmed.startsWith("$")) return null;

  // Validate checksum if present
  if (!validateNmeaChecksum(trimmed)) {
    console.warn("[gpsTestService] NMEA checksum mismatch:", trimmed);
    return null;
  }

  // Strip checksum portion for field parsing
  const bodyEnd = trimmed.indexOf("*");
  const body = bodyEnd !== -1 ? trimmed.substring(0, bodyEnd) : trimmed;

  const fields = body.split(",");
  if (fields.length < 2) return null;

  const sentenceId = fields[0].toUpperCase();

  switch (sentenceId) {
    case "$GPGGA":
    case "$GNGGA":
      return parseGGA(fields);

    case "$GPRMC":
    case "$GNRMC":
      return parseRMC(fields);

    default:
      // Unsupported sentence type — return null gracefully
      return null;
  }
}

// ---------------------------------------------------------------------------
// High-level helper: process a GpsRawPayload from Firebase
// ---------------------------------------------------------------------------

/**
 * Processes a GPS raw payload from the Firebase /imuTest/latest/gps object.
 * Returns parsed coordinates or null if parsing fails or no data is present.
 */
export function processGpsPayload(
  gpsRaw: GpsRawPayload | null | undefined
): ParsedGpsCoordinates | null {
  if (!gpsRaw || typeof gpsRaw !== "object") return null;
  if (!gpsRaw.nmea || typeof gpsRaw.nmea !== "string") return null;

  return parseNmeaSentence(gpsRaw.nmea);
}
