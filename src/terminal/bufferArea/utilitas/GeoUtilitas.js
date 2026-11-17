/**
 * ==============================================================================
 * Geodesic & Layout Utilitas Barat (GeoUtilitas.js)
 * Terkalibrasi 1:1 Berdasarkan Koordinat GPS Ground Truth:
 *
 * 1. Keseluruhan Utilitas (205.0m x 161.7m | Z: 570.0 s/d 775.0, X: 13.3 s/d 175.0):
 *    - PT1_NE_COAST: -7.202263, 112.667851 -> u = 1.000, v = 0.000 (Z = 775.0, X = 175.0)
 *    - PT2_SE_ROAD:  -7.203327, 112.668962 -> u = 1.000, v = 1.000 (Z = 775.0, X = 13.3)
 *    - PT3_SW_ROAD:  -7.204647, 112.667663 -> u = 0.000, v = 1.000 (Z = 570.0, X = 13.3)
 *    - PT4_NW_BEND:  -7.202784, 112.667319 -> u = 0.592, v = 0.000 (Z = 691.4, X = 175.0)
 *
 * 2. SubAreaIpal (4 Titik GPS -> u: 0.433 s/d 0.696, v: 0.669 s/d 0.994):
 *    -7.203719, 112.667861 | -7.203376, 112.668201 | -7.203738, 112.668576 | -7.204069, 112.668218
 *
 * 3. SubAreaParkirMotor (6 Titik GPS Poligon L-Shape -> u: 0.771 s/d 0.998, v: 0.336 s/d 0.713):
 *    -7.202919, 112.667933 | -7.202618, 112.668226 | -7.203045, 112.668621 |
 *    -7.203224, 112.668441 | -7.202949, 112.668153 | -7.203028, 112.668053
 *
 * 4. SubAreaShelter (8 Titik GPS Poligon Stepped L-Shape -> u: 0.814 s/d 0.992, v: 0.751 s/d 0.995):
 *    -7.203229, 112.668521 | -7.203083, 112.668673 | -7.203239, 112.668851 | -7.203318, 112.668776 |
 *    -7.203408, 112.668871 | -7.203569, 112.668729 | -7.203373, 112.668516 | -7.203291, 112.668573
 * ==============================================================================
 */

export const UTILITAS_ANCHOR_GPS = {
  OUTER_BOUNDS: [
    [-7.202263, 112.667851], // Pt 1: Kanan-Atas (NE Coast)
    [-7.203327, 112.668962], // Pt 2: Kanan-Bawah (SE Road)
    [-7.204647, 112.667663], // Pt 3: Kiri-Bawah (SW Road)
    [-7.202784, 112.667319]  // Pt 4: Kiri-Atas (NW Mangrove Bend)
  ],
  IPAL_BOUNDS: [
    [-7.203719, 112.667861], // u: 0.434, v: 0.669
    [-7.203376, 112.668201], // u: 0.695, v: 0.670
    [-7.203738, 112.668576], // u: 0.696, v: 0.994
    [-7.204069, 112.668218]  // u: 0.433, v: 0.994
  ],
  PARKIR_MOTOR_POLYGON: [
    [-7.202919, 112.667933], // Pt 1: u: 0.771, v: 0.337
    [-7.202618, 112.668226], // Pt 2: u: 0.998, v: 0.336
    [-7.203045, 112.668621], // Pt 3: u: 0.981, v: 0.713
    [-7.203224, 112.668441], // Pt 4: u: 0.844, v: 0.712
    [-7.202949, 112.668153], // Pt 5: u: 0.842, v: 0.453
    [-7.203028, 112.668053]  // Pt 6: u: 0.774, v: 0.442
  ],
  SHELTER_POLYGON: [
    [-7.203229, 112.668521], // Pt 1: u: 0.872, v: 0.751
    [-7.203083, 112.668673], // Pt 2: u: 0.986, v: 0.755
    [-7.203239, 112.668851], // Pt 3: u: 0.992, v: 0.908
    [-7.203318, 112.668776], // Pt 4: u: 0.933, v: 0.910
    [-7.203408, 112.668871], // Pt 5: u: 0.934, v: 0.995
    [-7.203569, 112.668729], // Pt 6: u: 0.819, v: 1.000
    [-7.203373, 112.668516], // Pt 7: u: 0.814, v: 0.814
    [-7.203291, 112.668573]  // Pt 8: u: 0.868, v: 0.803
  ]
};

export const NORTH_VECTOR = [0.707, -0.707];
export const EAST_VECTOR = [0.707, 0.707];

export const SITE_CALIBRATION = {
  uMinZ: 570.0,    // u = 0.0 (Pt 3: -7.204647, 112.667663 -> Z = 570.0, digeser -55m dari 625.0)
  uMaxZ: 775.0,    // u = 1.0 (Pt 2: -7.203327, 112.668962 -> Z = 775.0, Lebar Presisi = 205.0m)
  vMinX: 175.0,    // v = 0.0 (Pt 1: -7.202263, 112.667851 -> X = 175.0, Tinggi = 161.7m)
  baseCurbX: 13.3, // v = 1.0 (Kanstin jalan utama Pre-Gate)
  taperStartZ: 775.0,
  taperEndZ: 805.0,
  taperCurbX: 16.9
};

/**
 * Menghitung koordinat X kanstin tepi jalan masuk pada koordinat Z tertentu
 */
export function getRoadCurbX(z) {
  const { taperStartZ, taperEndZ, baseCurbX, taperCurbX } = SITE_CALIBRATION;
  if (z <= 570.0) return 7.8;
  if (z < 605.0) {
    const t = (z - 570.0) / 35.0;
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
 */
export function uvToWorld(u, v) {
  const z = SITE_CALIBRATION.uMinZ + u * (SITE_CALIBRATION.uMaxZ - SITE_CALIBRATION.uMinZ);
  const roadX = getRoadCurbX(z);
  const x = roadX + (1.0 - v) * (SITE_CALIBRATION.vMinX - roadX);
  return { x, z };
}

/**
 * Mengonversi koordinat dunia Three.js (x, z) ke (u, v)
 */
export function worldToUv(x, z) {
  const u = (z - SITE_CALIBRATION.uMinZ) / (SITE_CALIBRATION.uMaxZ - SITE_CALIBRATION.uMinZ);
  const roadX = getRoadCurbX(z);
  const v = 1.0 - (x - roadX) / (SITE_CALIBRATION.vMinX - roadX);
  return { u, v };
}

// ------------------------------------------------------------------------------
// Garis Pantai Terkalibrasi Presisi dari Pt 3 (u=0.00, v=0.92) -> Pt 4 (u=0.592, v=0.00) -> Pt 1 (u=1.00, v=0.00)
// ------------------------------------------------------------------------------
export const COASTLINE_CONTROL_POINTS = [
  [0.00, 0.92], // Pt 3 (-7.204647, 112.667663): Ujung barat daya di abutmen (Z = 570.0)
  [0.06, 0.76], // Bahu bawah tanjung bakau barat daya
  [0.18, 0.56], // Lereng diagonal bawah
  [0.32, 0.35], // Lereng diagonal tengah
  [0.46, 0.14], // Lereng diagonal atas
  [0.55, 0.02], // Menjelang puncak belokan tanjung Pt 4
  [0.592, 0.00],// Pt 4 (-7.202784, 112.667319): Sudut belokan pantai utara (Z = 691.4, X = 175.0)
  [1.00, 0.00]  // Pt 1 (-7.202263, 112.667851): Pantai lurus utara 83.6m hingga Waiting CY (Z = 775.0)
];

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

export function getCoastlineV(u) {
  return _coastlineSpline(u);
}

export const COASTLINE_UV = [];
for (let i = 0; i <= 50; i++) {
  const u = i / 50;
  COASTLINE_UV.push([Number(u.toFixed(4)), Number(getCoastlineV(u).toFixed(4))]);
}

export function isLandUV(u, v) {
  if (u < 0.00 || u > 1.02) return false;
  if (v > 1.02) return false;
  const vCoast = getCoastlineV(u);
  return v >= vCoast;
}

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
// Konfigurasi Zona Deklaratif (Berdasarkan Koordinat GPS SubAreaIpal, ParkirMotor & Shelter)
// ------------------------------------------------------------------------------
export const ZONES_CONFIG = [
  // Zona D: Hamparan Tanah Merah Kiri-Bawah di Sisi Barat Daya SubAreaIpal (u: 0.12 s/d 0.43)
  {
    id: 'zone_tanah_merah_d',
    name: 'Tanah Merah Kiri Bawah',
    type: 'red_soil',
    uvPolygon: [
      [0.12, 0.87],
      [0.43, 0.87],
      [0.43, 1.00],
      [0.12, 1.00]
    ],
    color: 0x8d553e,
    roughness: 0.94,
    yOffset: 0.02
  },
  // Zona E: Strip Tanah Cokelat Reklamasi Utara (di atas Bak IPAL Utara)
  {
    id: 'zone_tanah_merah_e',
    name: 'Strip Tanah Cokelat Reklamasi Utara',
    type: 'reclamation_soil',
    uvPolygon: [
      [0.72, 0.18],
      [1.00, 0.18],
      [1.00, 0.25],
      [0.72, 0.25]
    ],
    color: 0x8a6240,
    roughness: 0.95,
    yOffset: 0.02
  },
  // Zona C: Padang Rumput & Semak Terbuka di Sisi Barat Daya
  {
    id: 'zone_padang_rumput_c',
    name: 'Padang Rumput & Semak Terbuka',
    type: 'open_grassland',
    uvPolygon: [
      [0.16, 0.78],
      [0.42, 0.42],
      [0.48, 0.42],
      [0.43, 0.86],
      [0.16, 0.86]
    ],
    color: 0x5a7238,
    roughness: 0.92,
    yOffset: 0.012
  },
  // Yard SubAreaIpal (Sesuai 4 titik GPS: u in [0.433, 0.696], v in [0.669, 0.994])
  {
    id: 'zone_yard_tengah',
    name: 'Halaman SubAreaIpal',
    type: 'concrete_yard',
    uvPolygon: [
      [0.433, 0.669],
      [0.696, 0.670],
      [0.696, 0.994],
      [0.433, 0.994]
    ],
    color: 0x686f75,
    roughness: 0.86,
    yOffset: 0.025
  },
  // Jalan Akses Internal Aspal (antara SubAreaIpal u=0.696 dan SubAreaParkirMotor/Shelter u=0.771/0.814)
  {
    id: 'zone_jalur_perkerasan',
    name: 'Jalur Jalan Akses Aspal Vertikal',
    type: 'pavement_strip',
    uvPolygon: [
      [0.715, 0.25],
      [0.770, 0.25],
      [0.770, 0.442],
      [0.838, 0.453],
      [0.838, 0.745],
      [0.812, 0.805],
      [0.812, 1.00],
      [0.715, 1.00]
    ],
    color: 0x22262e,
    roughness: 0.88,
    yOffset: 0.03
  },
  // Base Pelataran SubAreaParkirMotor & SubAreaShelter (u: 0.768 s/d 0.998, v: 0.25 s/d 0.995)
  {
    id: 'zone_kompleks_bangunan_base',
    name: 'Base Kompleks Parkir Motor & Shelter Timur Laut',
    type: 'facility_pavement',
    uvPolygon: [
      [0.768, 0.25],
      [0.998, 0.25],
      [0.998, 0.995],
      [0.812, 0.995],
      [0.812, 0.805],
      [0.838, 0.745],
      [0.838, 0.453],
      [0.768, 0.442]
    ],
    color: 0x545b60,
    roughness: 0.88,
    yOffset: 0.022
  }
];

// ------------------------------------------------------------------------------
// Konfigurasi Bangunan Deklaratif Terkalibrasi Presisi dengan Poligon GPS
// ------------------------------------------------------------------------------
export const BUILDINGS_CONFIG = [
  // ============================================================================
  // A. FASILITAS SUB-AREA IPAL (u: 0.433 s/d 0.696, v: 0.669 s/d 0.994)
  //    Sesuai 4 Titik GPS: -7.203719, 112.667861 s/d -7.204069, 112.668218
  // ============================================================================
  {
    id: 'yard_bldg_whitetan',
    name: 'Gedung Putih Atas IPAL',
    uvRect: { uMin: 0.525, uMax: 0.578, vMin: 0.675, vMax: 0.748 },
    height: 3.8,
    roofColor: 0xf8fafc,
    wallColor: 0xe2e8f0,
    roofType: 'flat',
    collider: true
  },
  {
    id: 'yard_shed_blue_1',
    name: 'Shed Atap Biru 1 (Kiri Atas IPAL)',
    uvRect: { uMin: 0.442, uMax: 0.476, vMin: 0.745, vMax: 0.805 },
    height: 3.2,
    roofColor: 0x0284c7,
    wallColor: 0xf8fafc,
    roofType: 'flat',
    collider: true
  },
  {
    id: 'yard_shed_blue_2',
    name: 'Shed Atap Biru 2 (Kiri Bawah IPAL)',
    uvRect: { uMin: 0.448, uMax: 0.478, vMin: 0.835, vMax: 0.902 },
    height: 3.2,
    roofColor: 0x0284c7,
    wallColor: 0xf8fafc,
    roofType: 'flat',
    collider: true
  },
  {
    id: 'yard_tank_row_1',
    name: 'Baris Instalasi / Tangki IPAL 1',
    type: 'skid_tanks',
    uvRect: { uMin: 0.510, uMax: 0.618, vMin: 0.762, vMax: 0.795 },
    height: 2.5,
    tankCount: 4,
    tankColor: 0xcfd8dc,
    collider: true
  },
  {
    id: 'yard_tank_row_2',
    name: 'Baris Instalasi / Tangki IPAL 2',
    type: 'skid_tanks',
    uvRect: { uMin: 0.510, uMax: 0.618, vMin: 0.806, vMax: 0.838 },
    height: 2.5,
    tankCount: 4,
    tankColor: 0xcfd8dc,
    collider: true
  },
  {
    id: 'yard_shed_blue_3',
    name: 'Gedung Memanjang Kanan IPAL',
    uvRect: { uMin: 0.638, uMax: 0.668, vMin: 0.678, vMax: 0.885 },
    height: 3.6,
    roofColor: 0xcbd5e1,
    wallColor: 0xf8fafc,
    roofType: 'flat',
    collider: true
  },
  {
    id: 'yard_shed_white_small',
    name: 'Bangunan Putih Kanan IPAL',
    uvRect: { uMin: 0.668, uMax: 0.694, vMin: 0.745, vMax: 0.825 },
    height: 3.4,
    roofColor: 0xf8fafc,
    wallColor: 0xe2e8f0,
    roofType: 'flat',
    collider: true
  },

  // ============================================================================
  // B. FASILITAS SUB-AREA PARKIR MOTOR & UTILITAS UTARA (6 Titik Poligon L-Shape)
  //    u: 0.771 s/d 0.998 (v: 0.336 s/d 0.442) & u: 0.842 s/d 0.981 (v: 0.453 s/d 0.713)
  // ============================================================================
  // Bak Beton Kembar di Utara Parkir Motor (v: 0.258 s/d 0.312)
  {
    id: 'parkir_north_basin',
    name: 'Bak Beton Kembar Utara',
    uvRect: { uMin: 0.772, uMax: 0.935, vMin: 0.258, vMax: 0.312 },
    height: 3.2,
    roofColor: 0xe2e8f0,
    wallColor: 0xcbd5e1,
    roofType: 'flat',
    collider: true
  },
  // 2 Deret Panjang Atap Cokelat Horizontal (Tepat di sayap atas L-Shape: u: 0.771 s/d 0.995, v: 0.345 s/d 0.438)
  {
    id: 'parkir_brown_row_1',
    name: 'Kanopi Parkir Cokelat Horizontal 1',
    uvRect: { uMin: 0.771, uMax: 0.992, vMin: 0.348, vMax: 0.386 },
    height: 3.6,
    roofColor: 0x4a3525,
    wallColor: 0x64748b,
    roofType: 'pitched_horizontal',
    collider: true
  },
  {
    id: 'parkir_brown_row_2',
    name: 'Kanopi Parkir Cokelat Horizontal 2',
    uvRect: { uMin: 0.771, uMax: 0.992, vMin: 0.398, vMax: 0.438 },
    height: 3.6,
    roofColor: 0x4a3525,
    wallColor: 0x64748b,
    roofType: 'pitched_horizontal',
    collider: true
  },
  // 4 Lajur Kanopi Parkir Motor Vertikal (Tepat di batang vertikal L-Shape: u: 0.844 s/d 0.981, v: 0.455 s/d 0.712)
  {
    id: 'parkir_canopy_bay_1',
    name: 'Kanopi Parkir Motor Bilah 1',
    uvRect: { uMin: 0.844, uMax: 0.875, vMin: 0.455, vMax: 0.675 },
    height: 4.2,
    roofColor: 0xd8dce0,
    wallColor: 0x94a3b8,
    roofType: 'corrugated_vertical',
    collider: true
  },
  {
    id: 'parkir_canopy_bay_2',
    name: 'Kanopi Parkir Motor Bilah 2',
    uvRect: { uMin: 0.880, uMax: 0.911, vMin: 0.455, vMax: 0.675 },
    height: 4.2,
    roofColor: 0xe5e9ed,
    wallColor: 0x94a3b8,
    roofType: 'corrugated_vertical',
    collider: true
  },
  {
    id: 'parkir_canopy_bay_3',
    name: 'Kanopi Parkir Motor Bilah 3',
    uvRect: { uMin: 0.916, uMax: 0.947, vMin: 0.455, vMax: 0.675 },
    height: 4.2,
    roofColor: 0xd8dce0,
    wallColor: 0x94a3b8,
    roofType: 'corrugated_vertical',
    collider: true
  },
  {
    id: 'parkir_canopy_bay_4',
    name: 'Kanopi Parkir Motor Bilah 4',
    uvRect: { uMin: 0.952, uMax: 0.981, vMin: 0.455, vMax: 0.675 },
    height: 4.2,
    roofColor: 0xe5e9ed,
    wallColor: 0x94a3b8,
    roofType: 'corrugated_vertical',
    collider: true
  },
  // Kanopi Melintang Bawah Parkir Motor (u: 0.844 s/d 0.965, v: 0.680 s/d 0.712)
  {
    id: 'parkir_canopy_south_bar',
    name: 'Kanopi Parkir Motor Bawah',
    uvRect: { uMin: 0.844, uMax: 0.965, vMin: 0.680, vMax: 0.712 },
    height: 4.0,
    roofColor: 0xd8dce0,
    wallColor: 0x94a3b8,
    roofType: 'flat',
    collider: true
  },
  // 2 Bangunan / Bak Persegi di Lekukan Kiri L-Shape Parkir Motor (u: 0.785 s/d 0.835)
  {
    id: 'parkir_courtyard_box_1',
    name: 'Bangunan Pendukung Parkir 1',
    uvRect: { uMin: 0.785, uMax: 0.835, vMin: 0.472, vMax: 0.542 },
    height: 3.4,
    roofColor: 0xcbd5e1,
    wallColor: 0xe2e8f0,
    roofType: 'flat',
    collider: true
  },
  {
    id: 'parkir_courtyard_box_2',
    name: 'Bangunan Pendukung Parkir 2',
    uvRect: { uMin: 0.785, uMax: 0.835, vMin: 0.602, vMax: 0.668 },
    height: 3.5,
    roofColor: 0xe2e8f0,
    wallColor: 0xf8fafc,
    roofType: 'flat',
    collider: true
  },

  // ============================================================================
  // C. FASILITAS SUB-AREA SHELTER (8 Titik GPS Poligon Stepped L-Shape)
  //    - Blok Utama Kiri-Bawah (Pt 4-5-6-7-8): u in [0.814, 0.934], v in [0.803, 0.995]
  //    - Sayap Kanan-Atas (Pt 1-2-3-4-8):      u in [0.870, 0.992], v in [0.751, 0.910]
  // ============================================================================
  {
    id: 'bldg_south_white_main',
    name: 'Gedung Utama Shelter Putih (Sisi Jalan)',
    uvRect: { uMin: 0.814, uMax: 0.934, vMin: 0.805, vMax: 0.995 },
    height: 6.0,
    roofColor: 0xf8fafc,
    wallColor: 0xe2e8f0,
    roofType: 'pitched_subtle',
    collider: true
  },
  {
    id: 'bldg_south_white_annex',
    name: 'Sayap Timur Laut Gedung Shelter Putih',
    uvRect: { uMin: 0.870, uMax: 0.992, vMin: 0.751, vMax: 0.910 },
    height: 5.0,
    roofColor: 0xf1f5f9,
    wallColor: 0xe2e8f0,
    roofType: 'flat',
    collider: true
  }
];

export function isPointInsideBuildingUV(u, v, margin = 0.012) {
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
