/**
 * ==============================================================================
 * GeoProjection (Terminal Teluk Lamong Geodesic & Metric Calibration System)
 * ==============================================================================
 *
 * Provides high-precision conversion between real-world GPS coordinates (WGS84 Lat/Lon)
 * from Apple Maps / Google Maps and 3D metric Cartesian coordinates (X, Y, Z) in Three.js.
 *
 * Coordinate Convention in Three.js Simulator:
 * - 1 Three.js unit = 1.0 meter (True 1:1 Scale)
 * - Sumbu +Z = North-aligned corridor direction (Arah menuju Terminal / Laut Lepas)
 * - Sumbu -Z = South-aligned corridor direction (Arah menuju Daratan / Surabaya)
 * - Sumbu +X = East / Screen-Right
 * - Sumbu -X = West / Screen-Left
 * - Sumbu +Y = Elevation / Height in meters above sea level
 */

// WGS84 Earth Parameters at Teluk Lamong latitude (~ -7.2°)
const EARTH_RADIUS = 6378137.0; // meters (equatorial radius)

/**
 * Default Datum Origin (Causeway 1 Mainland Abutment: Z = 0)
 * Latitude: -7.2100105, Longitude: 112.6626984
 */
export const DEFAULT_DATUM = {
  lat: -7.2100105,
  lon: 112.6626984,
  name: 'Causeway 1 Mainland Abutment Origin (Z = 0)'
};

/**
 * Natural alignment angle of Terminal Teluk Lamong mainland corridor (~57.55° North-East).
 * Rotated by -57.55° to align straight along the Three.js Z-axis (+Z towards Terminal).
 */
export const DEFAULT_CORRIDOR_BEARING_DEG = 57.55;
export const ALIGNMENT_ROTATION_RAD = -(DEFAULT_CORRIDOR_BEARING_DEG * Math.PI) / 180.0;

/**
 * Known Real-World GPS Landmarks for Terminal Teluk Lamong
 */
export const GPS_LANDMARKS = {
  // 1. Gerbang Akses Jalan Raya Tambak Osowilangon (South Mainland Entrance, Z ≈ -1106)
  OSOWILANGON_IN_1: { lat: -7.2150086465437555, lon: 112.65405147129759, label: 'Jalan Masuk Osowilangon Kiri' },
  OSOWILANGON_IN_2: { lat: -7.215116639962826,  lon: 112.65411410041072, label: 'Jalan Masuk Osowilangon Kanan' },
  TOL_IN_RAMP_1:    { lat: -7.215119598686274,  lon: 112.65411410041072, label: 'Tol Masuk Flyover Ramp 1' },
  TOL_IN_RAMP_2:    { lat: -7.215203922296404,  lon: 112.65415585315279, label: 'Tol Masuk Flyover Ramp 2' },
  TOL_OUT_RAMP_1:   { lat: -7.215280849084933,  lon: 112.65417971186255, label: 'Tol Keluar Flyover Ramp 1' },
  TOL_OUT_RAMP_2:   { lat: -7.215357775860371,  lon: 112.65422146460463, label: 'Tol Keluar Flyover Ramp 2' },
  OSOWILANGON_OUT_1:{ lat: -7.215369610747748,  lon: 112.65423041162079, label: 'Jalan Keluar Osowilangon Kiri' },
  OSOWILANGON_OUT_2:{ lat: -7.215461331114367,  lon: 112.6542781290403,  label: 'Jalan Keluar Osowilangon Kanan' },

  // 2. Titik Penggabungan Tol & Darat (Merge Point, Z ≈ -792)
  MERGE_IN_LEFT:    { lat: -7.21370532664914,   lon: 112.6565685652839,  label: 'Titik Gabung Masuk Kiri' },
  MERGE_IN_RIGHT:   { lat: -7.213832552136631,  lon: 112.65664461492126, label: 'Titik Gabung Masuk Kanan' },
  MERGE_OUT_LEFT:   { lat: -7.213903561695482,  lon: 112.65668487649398, label: 'Titik Gabung Keluar Kiri' },
  MERGE_OUT_RIGHT:  { lat: -7.214041142684081,  lon: 112.65676838197814, label: 'Titik Gabung Keluar Kanan' },

  // 3. Pangkal Jembatan Laut Causeway 1 (Mainland Abutment Origin Z = 0)
  CAUSEWAY_1_START_LEFT:  { lat: -7.20996875939936,  lon: 112.66266225035261, label: 'P1: Pangkal Jembatan Kiri' },
  CAUSEWAY_1_START_RIGHT: { lat: -7.210052177010144, lon: 112.66273460038157, label: 'P2: Pangkal Jembatan Kanan' },

  // 4. Ujung Jembatan Laut Causeway 1 (Menjelang Pulau 1, Z ≈ 835)
  CAUSEWAY_1_END_RIGHT:   { lat: -7.204651732452334, lon: 112.66798893495472, label: 'P3: Ujung Jembatan Kanan' },
  CAUSEWAY_1_END_LEFT:    { lat: -7.204569169804228, lon: 112.66790668292828, label: 'P4: Ujung Jembatan Kiri' },

  // 5. Fasilitas Pulau 1
  OFFICE_GRAHA_PELINDO:   { lat: -7.20417, lon: 112.66889, label: 'Graha Pelindo (Head Office)' },
};

/**
 * Converts GPS (latitude, longitude) into raw metric offset (dx: East, dz: North)
 * relative to a datum origin in meters.
 *
 * @param {number} lat - Target latitude in decimal degrees
 * @param {number} lon - Target longitude in decimal degrees
 * @param {{lat: number, lon: number}} [datum=DEFAULT_DATUM] - Reference origin
 * @returns {{dx: number, dz: number}} Metric offsets (dx = East in meters, dz = North in meters)
 */
export function gpsToMetricOffset(lat, lon, datum = DEFAULT_DATUM) {
  const latRad = (datum.lat * Math.PI) / 180.0;
  const dLat = ((lat - datum.lat) * Math.PI) / 180.0;
  const dLon = ((lon - datum.lon) * Math.PI) / 180.0;

  // Equirectangular approximation (accurate to millimeter within 10 km)
  const dz = dLat * EARTH_RADIUS; // North (+) / South (-)
  const dx = dLon * EARTH_RADIUS * Math.cos(latRad); // East (+) / West (-)

  return { dx, dz };
}

/**
 * Converts GPS (lat, lon) into simulator coordinates (xSim, zSim) rotated so
 * the corridor aligns straight along the Z-axis (+Z = towards terminal).
 *
 * @param {number} lat - Target latitude
 * @param {number} lon - Target longitude
 * @param {{lat: number, lon: number}} [datum=DEFAULT_DATUM] - Origin
 * @param {number} [rotationRad=ALIGNMENT_ROTATION_RAD] - Alignment rotation
 * @returns {{x: number, z: number}} Coordinates in Three.js units (meters)
 */
export function gpsToSim(lat, lon, datum = DEFAULT_DATUM, corridorBearingDeg = DEFAULT_CORRIDOR_BEARING_DEG) {
  const { dx, dz } = gpsToMetricOffset(lat, lon, datum);

  // Bearing angle in radians (0° = North = +dz, 90° = East = +dx)
  const theta = (corridorBearingDeg * Math.PI) / 180.0;
  const sin = Math.sin(theta);
  const cos = Math.cos(theta);

  // Project:
  // zSim = along the road axis (+Z towards Terminal / North-East)
  // xSim = across the road axis (+X to the right / East-relative)
  const zSim = dx * sin + dz * cos;
  const xSim = dx * cos - dz * sin;

  return {
    x: Number(xSim.toFixed(3)),
    z: Number(zSim.toFixed(3))
  };
}

/**
 * Calculates straight line distance (in meters) between two GPS points using Haversine formula.
 *
 * @param {number} lat1
 * @param {number} lon1
 * @param {number} lat2
 * @param {number} lon2
 * @returns {number} Distance in meters
 */
export function calculateGpsDistance(lat1, lon1, lat2, lon2) {
  const phi1 = (lat1 * Math.PI) / 180.0;
  const phi2 = (lat2 * Math.PI) / 180.0;
  const deltaPhi = ((lat2 - lat1) * Math.PI) / 180.0;
  const deltaLambda = ((lon2 - lon1) * Math.PI) / 180.0;

  const a =
    Math.sin(deltaPhi / 2) * Math.sin(deltaPhi / 2) +
    Math.cos(phi1) * Math.cos(phi2) * Math.sin(deltaLambda / 2) * Math.sin(deltaLambda / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return Number((EARTH_RADIUS * c).toFixed(2));
}

/**
 * Calculates true bearing (in degrees, 0° = North, 90° = East) from point 1 to point 2.
 *
 * @param {number} lat1
 * @param {number} lon1
 * @param {number} lat2
 * @param {number} lon2
 * @returns {number} Bearing in degrees [0, 360)
 */
export function calculateGpsBearing(lat1, lon1, lat2, lon2) {
  const phi1 = (lat1 * Math.PI) / 180.0;
  const phi2 = (lat2 * Math.PI) / 180.0;
  const deltaLambda = ((lon2 - lon1) * Math.PI) / 180.0;

  const y = Math.sin(deltaLambda) * Math.cos(phi2);
  const x = Math.cos(phi1) * Math.sin(phi2) - Math.sin(phi1) * Math.cos(phi2) * Math.cos(deltaLambda);
  const theta = Math.atan2(y, x);

  const bearing = ((theta * 180.0) / Math.PI + 360.0) % 360.0;
  return Number(bearing.toFixed(2));
}

/**
 * Converts 3D simulator coordinates (xSim, zSim) back into real-world WGS84 GPS (lat, lon).
 *
 * @param {number} xSim - Three.js X position
 * @param {number} zSim - Three.js Z position
 * @param {{lat: number, lon: number}} [datum=DEFAULT_DATUM] - Reference origin
 * @param {number} [corridorBearingDeg=DEFAULT_CORRIDOR_BEARING_DEG] - Corridor alignment bearing
 * @returns {{lat: number, lon: number, latStr: string, lonStr: string}}
 */
export function simToGps(xSim, zSim, datum = DEFAULT_DATUM, corridorBearingDeg = DEFAULT_CORRIDOR_BEARING_DEG) {
  const theta = (corridorBearingDeg * Math.PI) / 180.0;
  const sin = Math.sin(theta);
  const cos = Math.cos(theta);

  // Invert rotation:
  // dx = xSim * cos + zSim * sin
  // dz = zSim * cos - xSim * sin
  const dx = xSim * cos + zSim * sin;
  const dz = zSim * cos - xSim * sin;

  const latRad = (datum.lat * Math.PI) / 180.0;
  const dLatRad = dz / EARTH_RADIUS;
  const dLonRad = dx / (EARTH_RADIUS * Math.cos(latRad));

  const lat = datum.lat + (dLatRad * 180.0) / Math.PI;
  const lon = datum.lon + (dLonRad * 180.0) / Math.PI;

  return {
    lat: Number(lat.toFixed(6)),
    lon: Number(lon.toFixed(6)),
    latStr: lat.toFixed(6),
    lonStr: lon.toFixed(6)
  };
}

/**
 * Formats a latitude and longitude pair into a human-readable Google Maps string.
 *
 * @param {number} lat
 * @param {number} lon
 * @returns {string} e.g. "-7.215119, 112.654114"
 */
export function formatGps(lat, lon) {
  return `${lat.toFixed(6)}, ${lon.toFixed(6)}`;
}
