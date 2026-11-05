/**
 * ==============================================================================
 * GeoCurahKering.js (Kalibrasi Geodesik & Dimensi Lahan Terminal Curah Kering)
 * ==============================================================================
 * Sumber Koordinat Ground Truth (Lahan Kosong Cuker tanpa pohon):
 * 1. Sudut SW-Jalan (Tepi Jalan NW, Awal Cuker): -7.194751, 112.677174 -> Z = 2117.6, X = +21.4
 * 2. Sudut NE-Jalan (Tepi Jalan NW, Akhir Cuker): -7.192407, 112.679484 -> Z = 2482.1, X = +21.4
 * 3. Sudut NW-Timur (Pesisir NE-NW):              -7.190299, 112.677281 -> Z = 2482.1, X = +363.2
 * 4. Sudut NW-Barat (Pesisir SW-NW):              -7.192559, 112.674950 -> Z = 2117.6, X = +363.2
 *
 * Koordinat 2 Lane Conveyor (Menuju Dermaga Curah Kering melewati Jembatan Penghubung):
 * - Titik Pangkal TT-3 (Kiri/SW):  -7.192015, 112.678909
 * - Titik Pangkal TT-3 (Kanan/NE): -7.191976, 112.678981
 * - Titik Tepi Jalan (Kanan/NE):   -7.192482, 112.679484
 * - Titik Tepi Jalan (Kiri/SW):    -7.192524, 112.679425
 */

export const CUKER_TERMINAL_ANCHOR_GPS = {
  CORNER_SW_ROAD:  [-7.194751, 112.677174],
  CORNER_NE_ROAD:  [-7.192407, 112.679484],
  CORNER_NW_EAST:  [-7.190299, 112.677281],
  CORNER_NW_WEST:  [-7.192559, 112.674950],

  CONV_START_SW:   [-7.192015, 112.678909],
  CONV_START_NE:   [-7.191976, 112.678981],
  CONV_END_NE:     [-7.192482, 112.679484],
  CONV_END_SW:     [-7.192524, 112.679425]
};

export const CUKER_TERMINAL_BOUNDS = {
  // Batas Lahan Bersih Terminal Curah Kering (Tidak termasuk hutan bakau/pohon pesisir luar)
  zMin: 2117.6,       // Tepat menyambung di titik berhentinya pohon jalan NW (s = 949.6)
  zMax: 2482.1,       // Melebihi ujung jalan saat ini (Z = 2436.0) sejauh ~46.1m
  xRoadEdge: 21.4,    // Menyambung rapat dengan kanstin NW jalan Pasca-Gate
  xOuterNW: 363.2,    // Tepi luar barat laut lahan Cuker (lebar 341.8m)

  // Pembagian 3 Zona Vertikal Berdasarkan Sketsa AutoCAD (83m : 58.5m : 223m)
  zOruEnd: 2200.6,    // 2117.6 + 83.0m (Area ORU)
  zMidEnd: 2259.1,    // 2200.6 + 58.5m (Koridor Gudang Tengah)
  // Bulk Area Utama: Z = 2259.1 s/d 2482.1 (Lebar 223.0m)

  // Elevasi Permukaan Lahan
  yPavement: 1.62,    // Perkerasan beton/aspal area Cuker
  ySoil: 1.60,        // Tanggul tanah reklamasi & hutan mangrove di luar batas lahan bersih

  // Lebar sabuk pesisir sisi Timur Laut (kanan pada gambar)
  neBeltWidth: 12.0
};

// 1. Konfigurasi Zona 1: AREA ORU (Z: 2117.6 s/d 2200.6, Lebar 83m)
export const ORU_CONFIG = {
  zMin: 2117.6,
  zMax: 2200.6,
  xAsphaltMax: 246.0, // Bagian atas X: 246 s/d 363.2 adalah tanah cokelat terbuka sesuai foto satelit
  tankGrid: {
    colsZ: [2182.5, 2190.0], // 2 kolom tangki hitam
    rowsXStart: 196.0,
    rowStepX: 6.4,
    numRows: 7,              // 2 x 7 = 14 tangki silinder hitam
    radius: 2.3,
    height: 7.5
  }
};

// 2. Konfigurasi Zona 2: KORIDOR TENGAH (Z: 2200.6 s/d 2259.1, Lebar 58.5m)
export const MID_CORRIDOR_CONFIG = {
  zMin: 2200.6,
  zMax: 2259.1,
  greyWarehouse: {
    centerZ: 2228.5,
    centerX: 224.0,
    widthZ: 36.0,
    lengthX: 62.0,
    height: 11.5
  },
  whiteWarehouse: {
    centerZ: 2229.0,
    centerX: 170.0,
    widthZ: 35.0,
    lengthX: 40.0,
    height: 10.5
  },
  smallSilos: [
    { x: 136.0, z: 2213.0, r: 4.5, h: 12.0 },
    { x: 124.0, z: 2213.0, r: 4.5, h: 12.0 },
    { x: 115.0, z: 2232.0, r: 4.2, h: 11.0 },
    { x: 111.0, z: 2241.0, r: 5.2, h: 13.0 }
  ]
};

// 3. Konfigurasi Zona 3: BULK AREA UTAMA (Z: 2259.1 s/d 2482.1, Lebar 223m)
export const BULK_AREA_CONFIG = {
  zMin: 2259.1,
  zMax: 2482.1,

  // 10 Silo Penyimpanan Jagung (2 Kolom x 5 Baris = 10 x 6000T)
  siloCluster: {
    colZ: [2283.5, 2313.5], // 2 kolom berjarak 30m
    rowXStart: 128.0,
    rowStepX: 30.5,         // 5 baris: X = 128, 158.5, 189, 219.5, 250
    numRows: 5,
    radius: 13.4,           // Diameter ~26.8m
    cylinderHeight: 25.0,
    roofHeight: 6.2
  },

  // Gudang Kembar Flat Storage (Phase #1 & Phase #2)
  flatStorage: {
    centerZ: 2398.5,        // Membentang Z: ~2330.5 s/d ~2466.5 (lebar total ~136m)
    centerX: 210.0,         // Membentang X: 116.0 s/d 304.0 (panjang 188m)
    lengthX: 188.0,
    singleWidthZ: 52.0,     // Sesuai AutoCAD 54m per hall
    centerGapZ: 6.0,
    sideBayWidthZ: 12.5,
    wallHeight: 13.0,
    roofPeakHeight: 8.5
  },

  // Transfer Tower TT-3 & 2 Lane Conveyor Menuju Dermaga
  transferTowerTT3: {
    x: 103.5,
    z: 2469.5,
    widthX: 12.0,
    widthZ: 12.0,
    height: 24.5
  },
  conveyorLanesToBerth: {
    startX: 103.5,          // Dari TT-3 (-7.192015, 112.678909)
    endX: 21.4,             // Hingga tepi jalan (-7.192524, 112.679425), panjang ~82m
    laneZ: [2466.8, 2472.2], // 2 Lane Conveyor sejajar (lebar total ~8.5m)
    elevationY: 13.5
  }
};

/**
 * Menghitung lebar sabuk tanggul/hutan mangrove di sisi Barat Daya (Kiri pada gambar, Z < zMin)
 */
export function getSwMangroveDepthAtX(x) {
  const baseDepth = 18.0;
  const bulge1 = 74.0 * Math.exp(-Math.pow((x - 175.0) / 78.0, 2));
  const bulge2 = 22.0 * Math.exp(-Math.pow((x - 275.0) / 55.0, 2));
  return baseDepth + bulge1 + bulge2;
}

/**
 * Menghitung lebar sabuk tanggul/hutan mangrove di sisi Barat Laut (Atas pada gambar, X > xOuterNW)
 */
export function getNwMangroveWidthAtZ(z) {
  const baseWidth = 18.0;
  const capeBulge = 22.0 * Math.exp(-Math.pow((z - 2295.0) / 85.0, 2));
  return baseWidth + capeBulge;
}
