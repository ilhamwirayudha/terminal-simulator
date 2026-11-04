/**
 * ==============================================================================
 * Geodesic & Layout Utilitas Barat (GeoUtilitas.js)
 * Sesuai Citra Satelit Nyata: Orientasi, Proporsi, dan Tata Letak Sub-Area
 * ==============================================================================
 *
 * ORIENTASI SISTEM:
 * - ATAS   = Barat Laut (NW) -> Arah +X di Three.js (v = 0)
 * - BAWAH  = Tenggara (SE)   -> Arah -X di Three.js / Sisi Jalan Utama (v = 1)
 * - KIRI   = Barat Daya (SW) -> Arah -Z di Three.js / Abutmen Jembatan (u = 0)
 * - KANAN  = Timur Laut (NE) -> Arah +Z di Three.js / Gerbang Pre-Gate (u = 1)
 *
 * UTARA SEJATI: Kanan-Atas (+0.707, -0.707) dalam ruang (u, v)
 */

export const NORTH_VECTOR = [0.707, -0.707];
export const EAST_VECTOR = [0.707, 0.707];

export const SITE_CALIBRATION = {
  uMinZ: 604.55,  // u = 0.0 (kiri / SW, tanjung mangrove barat daya)
  uMaxZ: 775.0,   // u = 1.0 (kanan / NE, batas timur laut Area A tepat di Z = 775 sebelum pelebaran jalan)
  vMinX: 175.0,   // v = 0.0 (atas / NW, garis pantai utara lurus menyambung CY di X = 175.0)
  baseCurbX: 13.3, // v = 1.0 (bawah / SE, kanstin jalan utama sebelum pelebaran)
  taperStartZ: 775.0,
  taperEndZ: 805.0,
  taperCurbX: 16.9
};

/**
 * Menghitung koordinat X kanstin tepi jalan masuk pada koordinat Z tertentu
 */
export function getRoadCurbX(z) {
  const { taperStartZ, taperEndZ, baseCurbX, taperCurbX } = SITE_CALIBRATION;
  // Transisi awal dari jembatan (lebar 7.8 di Z=625) ke koridor 13.3 di Z=660
  if (z <= 625.0) return 7.8;
  if (z < 660.0) {
    const t = (z - 625.0) / 35.0;
    const s = t * t * (3 - 2 * t);
    return 7.8 + 5.5 * s;
  }
  if (z <= taperStartZ) return baseCurbX;
  if (z >= taperEndZ) return taperCurbX;
  const t = (z - taperStartZ) / (taperEndZ - taperStartZ);
  return baseCurbX + t * (taperCurbX - baseCurbX);
}

/**
 * Mengonversi koordinat citra satelit (u, v) ke koordinat dunia 3D (x, z)
 * @param {number} u - 0 (kiri/SW) s/d 1 (kanan/NE)
 * @param {number} v - 0 (atas/NW) s/d 1 (bawah/SE jalan)
 * @returns {{x: number, z: number}}
 */
export function uvToWorld(u, v) {
  const z = SITE_CALIBRATION.uMinZ + u * (SITE_CALIBRATION.uMaxZ - SITE_CALIBRATION.uMinZ);
  const roadX = getRoadCurbX(z);
  const x = roadX + (1.0 - v) * (SITE_CALIBRATION.vMinX - roadX);
  return { x, z };
}

/**
 * Mengonversi koordinat dunia Three.js (x, z) ke (u, v)
 * @param {number} x
 * @param {number} z
 * @returns {{u: number, v: number}}
 */
export function worldToUv(x, z) {
  const u = (z - SITE_CALIBRATION.uMinZ) / (SITE_CALIBRATION.uMaxZ - SITE_CALIBRATION.uMinZ);
  const roadX = getRoadCurbX(z);
  const v = 1.0 - (x - roadX) / (SITE_CALIBRATION.vMinX - roadX);
  return { u, v };
}

// ------------------------------------------------------------------------------
// Garis Pantai Acuan Citra Satelit & Ground Truth Teluk Lamong
// Di utara (u in [0.38, 1.00]): Garis pantai lurus di X = 175.0 (v = 0.00),
// menyambung seamless dengan cyWaitingArea & cukerWaitingArea.
// Di tanjung NW (u in [0.12, 0.38]): Melengkung mulus (smooth Catmull-Rom/Hermite spline)
// menuju abutmen jembatan laut di Z = 625 (u = 0.12, v = 0.92, X ≈ 21.2).
// ------------------------------------------------------------------------------
export const COASTLINE_CONTROL_POINTS = [
  [0.12, 0.92], // Abutmen jembatan sisi laut (Z = 625.0, X ≈ 21.2)
  [0.14, 0.72], // Transisi koridor jembatan (Z = 628.4, X ≈ 54.7)
  [0.18, 0.42], // Pesisir barat daya (Z = 635.2, X ≈ 105.3)
  [0.25, 0.14], // Bahu tanjung barat daya (Z = 647.2, X ≈ 152.1)
  [0.32, 0.02], // Lengkungan tanjung barat laut (Z = 659.1, X ≈ 171.8)
  [0.38, 0.00], // Awal garis pantai utara lurus (Z = 669.3, X = 175.0)
  [1.00, 0.00]  // Perbatasan CY Waiting Area (Z = 775.0, X = 175.0)
];

// Evaluator Spline Monotone Hermite untuk kontur pantai kontinu tanpa overshoot
function createMonotoneSpline(pts) {
  const n = pts.length;
  const x = pts.map((p) => p[0]);
  const y = pts.map((p) => p[1]);
  const dx = [], dy = [], m = [];
  for (let i = 0; i < n - 1; i++) {
    dx.push(x[i + 1] - x[i]);
    dy.push(y[i + 1] - y[i]);
    m.push(dy[i] / dx[i]);
  }
  const d = [m[0]];
  for (let i = 1; i < n - 1; i++) {
    if (m[i - 1] * m[i] <= 0) {
      d.push(0);
    } else {
      const common = dx[i - 1] + dx[i];
      d.push((3 * common) / ((common + dx[i]) / m[i - 1] + (common + dx[i - 1]) / m[i]));
    }
  }
  d.push(m[n - 2]);

  return function(uVal) {
    if (uVal <= x[0]) return y[0];
    if (uVal >= x[n - 1]) return y[n - 1];
    let i = 0;
    while (i < n - 2 && x[i + 1] < uVal) i++;
    const h = dx[i];
    const t = (uVal - x[i]) / h;
    const t2 = t * t;
    const t3 = t2 * t;
    const h00 = 2 * t3 - 3 * t2 + 1;
    const h10 = t3 - 2 * t2 + t;
    const h01 = -2 * t3 + 3 * t2;
    const h11 = t3 - t2;
    const res = h00 * y[i] + h10 * h * d[i] + h01 * y[i + 1] + h11 * h * d[i + 1];
    return Math.max(0.0, Math.min(1.0, res));
  };
}

const _coastlineSpline = createMonotoneSpline(COASTLINE_CONTROL_POINTS);

/**
 * Mendapatkan nilai v garis pantai untuk nilai u tertentu (smooth spline)
 */
export function getCoastlineV(u) {
  return _coastlineSpline(u);
}

// Sampling array titik diskret halus untuk kompatibilitas ShapeGeometry
export const COASTLINE_UV = [];
for (let i = 0; i <= 44; i++) {
  const t = i / 44;
  const u = 0.12 + t * (1.00 - 0.12);
  COASTLINE_UV.push([Number(u.toFixed(4)), Number(getCoastlineV(u).toFixed(4))]);
}

export function isLandUV(u, v) {
  if (u < 0.12 || u > 1.02) return false;
  if (v > 1.02) return false;
  const vCoast = getCoastlineV(u);
  // v makin besar = makin ke arah jalan (daratan)
  return v >= vCoast;
}

/**
 * Uji point in polygon 2D
 */
export function isPointInPolygon2D(px, py, polygon) {
  let inside = false;
  for (let i = 0, j = polygon.length - 1; i < polygon.length; j = i++) {
    const xi = polygon[i][0], yi = polygon[i][1];
    const xj = polygon[j][0], yj = polygon[j][1];
    const intersect = ((yi > py) !== (yj > py)) && (px < ((xj - xi) * (py - yi)) / (yj - yi) + xi);
    if (intersect) inside = !inside;
  }
  return inside;
}

// ------------------------------------------------------------------------------
// Konfigurasi Zona Deklaratif (Lantai & Permukaan Tapak)
// ------------------------------------------------------------------------------
export const ZONES_CONFIG = [
  // Zona D: Hamparan Tanah Merah Kiri-Bawah
  {
    id: 'zone_tanah_merah_d',
    name: 'Tanah Merah Kiri Bawah',
    type: 'red_soil',
    uvPolygon: [
      [0.25, 0.89],
      [0.51, 0.89],
      [0.51, 1.00],
      [0.25, 1.00]
    ],
    color: 0x8d553e,
    roughness: 0.94,
    yOffset: 0.02
  },
  // Zona E: Strip Tanah Merah Kanan-Atas (di atas kompleks gedung)
  {
    id: 'zone_tanah_merah_e',
    name: 'Strip Tanah Cokelat Reklamasi Utara',
    type: 'reclamation_soil',
    uvPolygon: [
      [0.52, 0.18],
      [1.00, 0.18],
      [1.00, 0.24],
      [0.52, 0.24]
    ],
    color: 0x8a6240, // Warna tanah reklamasi identik dengan CY
    roughness: 0.95,
    yOffset: 0.02
  },
  // Zona C: Padang Rumput / Semak Terbuka (Hijau muda kekuningan, pohon jarang)
  {
    id: 'zone_padang_rumput_c',
    name: 'Padang Rumput & Semak Terbuka',
    type: 'open_grassland',
    uvPolygon: [
      [0.28, 0.55],
      [0.55, 0.55],
      [0.55, 0.87],
      [0.28, 0.87]
    ],
    color: 0x5a7238, // Hijau muda kekuningan padang rumput alami
    roughness: 0.92,
    yOffset: 0.012
  },
  // Halaman / Yard Tengah (Lantai beton abu-abu)
  {
    id: 'zone_yard_tengah',
    name: 'Halaman / Yard Tengah',
    type: 'concrete_yard',
    uvPolygon: [
      [0.52, 0.68],
      [0.78, 0.68],
      [0.78, 0.90],
      [0.52, 0.90]
    ],
    color: 0x5e6569, // Beton industri abu-abu
    roughness: 0.88,
    yOffset: 0.025
  },
  // Jalur Perkerasan Beton Vertikal
  {
    id: 'zone_jalur_perkerasan',
    name: 'Jalur Perkerasan Beton Vertikal',
    type: 'pavement_strip',
    uvPolygon: [
      [0.80, 0.42],
      [0.84, 0.42],
      [0.84, 0.97],
      [0.80, 0.97]
    ],
    color: 0x727a80,
    roughness: 0.84,
    yOffset: 0.03
  },
  // Base Kompleks Bangunan Tepi Kanan
  {
    id: 'zone_kompleks_bangunan_base',
    name: 'Base Kompleks Bangunan Timur Laut',
    type: 'facility_pavement',
    uvPolygon: [
      [0.82, 0.24],
      [0.99, 0.24],
      [0.99, 0.97],
      [0.82, 0.97]
    ],
    color: 0x545b60,
    roughness: 0.88,
    yOffset: 0.022
  }
];

// ------------------------------------------------------------------------------
// Konfigurasi Bangunan Deklaratif (Kompleks Kanan & Fasilitas Yard)
// Sesuai Deskripsi Target Citra Satelit
// ------------------------------------------------------------------------------
export const BUILDINGS_CONFIG = [
  // 1. Bangunan Atap Putih (Paling Atas di Kompleks Kanan)
  {
    id: 'bldg_north_white',
    name: 'Bangunan Atap Putih Utara',
    uvRect: { uMin: 0.83, uMax: 0.95, vMin: 0.335, vMax: 0.385 },
    height: 4.6,
    roofColor: 0xf1f5f9,
    wallColor: 0xcfd6dc,
    roofType: 'flat',
    collider: true
  },
  // 2. Dua Deretan Atap Cokelat/Gelap Memanjang Horizontal (Barat-Timur)
  {
    id: 'bldg_brown_row_1',
    name: 'Deretan Atap Cokelat 1',
    uvRect: { uMin: 0.83, uMax: 0.97, vMin: 0.432, vMax: 0.455 },
    height: 3.8,
    roofColor: 0x452f23,
    wallColor: 0x64748b,
    roofType: 'pitched_horizontal',
    collider: true
  },
  {
    id: 'bldg_brown_row_2',
    name: 'Deretan Atap Cokelat 2',
    uvRect: { uMin: 0.83, uMax: 0.97, vMin: 0.465, vMax: 0.488 },
    height: 3.8,
    roofColor: 0x452f23,
    wallColor: 0x64748b,
    roofType: 'pitched_horizontal',
    collider: true
  },
  // 3. Gudang Atap Seng Abu/Putih Bergaris Vertikal (3-4 Bilah Sejajar)
  {
    id: 'bldg_warehouse_bay_1',
    name: 'Gudang Seng Bilah 1',
    uvRect: { uMin: 0.865, uMax: 0.890, vMin: 0.505, vMax: 0.715 },
    height: 6.6,
    roofColor: 0xd8dce0,
    wallColor: 0x94a3b8,
    roofType: 'corrugated_vertical',
    collider: true
  },
  {
    id: 'bldg_warehouse_bay_2',
    name: 'Gudang Seng Bilah 2',
    uvRect: { uMin: 0.895, uMax: 0.920, vMin: 0.505, vMax: 0.715 },
    height: 6.6,
    roofColor: 0xe5e9ed,
    wallColor: 0x94a3b8,
    roofType: 'corrugated_vertical',
    collider: true
  },
  {
    id: 'bldg_warehouse_bay_3',
    name: 'Gudang Seng Bilah 3',
    uvRect: { uMin: 0.925, uMax: 0.950, vMin: 0.505, vMax: 0.715 },
    height: 6.6,
    roofColor: 0xd8dce0,
    wallColor: 0x94a3b8,
    roofType: 'corrugated_vertical',
    collider: true
  },
  {
    id: 'bldg_warehouse_bay_4',
    name: 'Gudang Seng Bilah 4',
    uvRect: { uMin: 0.955, uMax: 0.980, vMin: 0.505, vMax: 0.715 },
    height: 6.6,
    roofColor: 0xe5e9ed,
    wallColor: 0x94a3b8,
    roofType: 'corrugated_vertical',
    collider: true
  },
  // 4. Bangunan Putih Besar di Ujung Bawah
  {
    id: 'bldg_south_white_main',
    name: 'Bangunan Putih Besar Tenggara',
    uvRect: { uMin: 0.84, uMax: 0.965, vMin: 0.78, vMax: 0.96 },
    height: 5.6,
    roofColor: 0xf8fafc,
    wallColor: 0xe2e8f0,
    roofType: 'pitched_subtle',
    collider: true
  },
  // Bangunan Putih Lebih Kecil di Sisi Kirinya
  {
    id: 'bldg_south_white_annex',
    name: 'Paviliun Putih Sisi Kiri',
    uvRect: { uMin: 0.835, uMax: 0.88, vMin: 0.83, vMax: 0.925 },
    height: 4.2,
    roofColor: 0xf1f5f9,
    wallColor: 0xe2e8f0,
    roofType: 'flat',
    collider: true
  },

  // ----------------------------------------------------------------------------
  // Fasilitas Halaman / Yard di Tengah-Bawah (u 0.52-0.78, v 0.68-0.90)
  // ----------------------------------------------------------------------------
  // Bangunan kecil atap putih/tan di bagian atas yard
  {
    id: 'yard_bldg_whitetan',
    name: 'Kantor Utilitas Atap Tan Yard',
    uvRect: { uMin: 0.605, uMax: 0.638, vMin: 0.685, vMax: 0.745 },
    height: 3.5,
    roofColor: 0xf4eee1,
    wallColor: 0xc4bcae,
    roofType: 'flat',
    collider: true
  },
  // Dua bangunan kecil atap biru di kiri
  {
    id: 'yard_shed_blue_1',
    name: 'Shed Atap Biru 1 (Kiri Yard)',
    uvRect: { uMin: 0.525, uMax: 0.550, vMin: 0.755, vMax: 0.788 },
    height: 3.2,
    roofColor: 0x0284c7, // Pelindo Blue
    wallColor: 0xf8fafc,
    roofType: 'flat',
    collider: true
  },
  {
    id: 'yard_shed_blue_2',
    name: 'Shed Atap Biru 2 (Kiri Bawah Yard)',
    uvRect: { uMin: 0.530, uMax: 0.555, vMin: 0.845, vMax: 0.878 },
    height: 3.2,
    roofColor: 0x0284c7,
    wallColor: 0xf8fafc,
    roofType: 'flat',
    collider: true
  },
  // Dua baris kontainer / tangki silinder horizontal abu-abu terang
  {
    id: 'yard_tank_row_1',
    name: 'Baris Tangki Silinder 1',
    type: 'skid_tanks',
    uvRect: { uMin: 0.595, uMax: 0.675, vMin: 0.775, vMax: 0.80 },
    height: 2.3,
    tankCount: 3,
    tankColor: 0xcfd8dc,
    collider: true
  },
  {
    id: 'yard_tank_row_2',
    name: 'Baris Tangki Silinder 2',
    type: 'skid_tanks',
    uvRect: { uMin: 0.595, uMax: 0.675, vMin: 0.815, vMax: 0.84 },
    height: 2.3,
    tankCount: 3,
    tankColor: 0xcfd8dc,
    collider: true
  },
  // Dua bangunan atap biru di kanan yard
  {
    id: 'yard_shed_blue_3',
    name: 'Shed Atap Biru Kanan',
    uvRect: { uMin: 0.708, uMax: 0.732, vMin: 0.705, vMax: 0.735 },
    height: 3.2,
    roofColor: 0x0284c7,
    wallColor: 0xf8fafc,
    roofType: 'flat',
    collider: true
  },
  // Bangunan putih kecil sekitar (0.76, 0.78)
  {
    id: 'yard_shed_white_small',
    name: 'Bangunan Putih Kecil Kanan',
    uvRect: { uMin: 0.748, uMax: 0.772, vMin: 0.765, vMax: 0.795 },
    height: 3.0,
    roofColor: 0xf8fafc,
    wallColor: 0xe2e8f0,
    roofType: 'flat',
    collider: true
  }
];

// Helper untuk kompatibilitas pengecekan exclusion pohon
export function isPointInsideBuildingUV(u, v, margin = 0.015) {
  for (const b of BUILDINGS_CONFIG) {
    const r = b.uvRect;
    if (
      u >= r.uMin - margin &&
      u <= r.uMax + margin &&
      v >= r.vMin - margin &&
      v <= r.vMax + margin
    ) {
      return true;
    }
  }
  return false;
}
