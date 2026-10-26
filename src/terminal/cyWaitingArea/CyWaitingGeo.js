/**
 * ==============================================================================
 * CyWaitingGeo.js (Container Yard & Truck Waiting Area Geodesic & Metric Calibration)
 * Sisi Barat Laut Jalan Pre-Gate (Z: 775m s/d 1034m | X: 16.9m s/d 185m)
 * Sesuai Citra Satelit Nyata: Orientasi, Proporsi, dan Grid Slot Kontainer & Truk
 * ==============================================================================
 */

export const CY_WAITING_BOUNDS = {
  // Sumbu Z (sepanjang jalan Pre-Gate)
  zMin: 775.0,
  zMax: 1034.4,

  // Sumbu X (tegak lurus jalan, +X ke arah barat laut / laut)
  xRoadCurb: 16.9,     // Tepi kanstin jalan Pre-Gate segmen 4 lajur
  xBufferStart: 28.0,  // Tepi perkerasan aspal Waiting Area
  xCYStart: 76.3,      // Tepi perkerasan Container Yard
  xMangroveStart: 136.0, // Batas belakang CY / awal strip tanah reklamasi & mangrove
  xWaterCoast: 175.0    // Garis pantai muara / air laut
};

export const BLOCKS_CONFIG = {
  // ----------------------------------------------------------------------------
  // 1. Container Yard: Blok TR 2 (Sisi Luar / Dekat Mangrove)
  // Ditambahkan 2 deret di sisi barat daya: 32 deret memanjang Z, 8 baris melintang X
  // ----------------------------------------------------------------------------
  TR2: {
    id: 'cy_block_tr2',
    name: 'Container Yard Blok TR 2',
    xMin: 115.8,
    xMax: 135.9,
    zMin: 805.2, // Tambah 2 deret ke sisi barat daya
    zMax: 1032.8,
    bays: 32, // 32 deret memanjang Z
    rows: 8,  // 8 baris melintang X
    maxTier: 4,
    // Menghadap barat laut - tenggara
    facing: 'NW-SE'
  },

  // ----------------------------------------------------------------------------
  // 2. Container Yard: Blok TR 4 (Sisi Dalam / Dekat Waiting Area)
  // 28 deret memanjang Z, 7 baris melintang X
  // ----------------------------------------------------------------------------
  TR4: {
    id: 'cy_block_tr4',
    name: 'Container Yard Blok TR 4',
    xMin: 76.9,
    xMax: 95.3,
    zMin: 799.4,
    zMax: 1015.5,
    bays: 28, // 28 deret memanjang Z
    rows: 7,  // 7 baris melintang X
    maxTier: 4,
    facing: 'NW-SE'
  },

  // ----------------------------------------------------------------------------
  // 3. Jalan Manuver Alat Berat / Truk di antara Blok TR 2 dan TR 4
  // ----------------------------------------------------------------------------
  CY_DRIVEWAY: {
    xMin: 95.3,
    xMax: 115.8, // Lebar 20.5 meter!
    zMin: 785.0,
    zMax: 1032.0
  },

  // ----------------------------------------------------------------------------
  // 4. Truck Waiting Area A (Baris Atas / Sisi Luar)
  // 33 slot truk miring (jajar genjang 45°)
  // ----------------------------------------------------------------------------
  WAITING_A: {
    id: 'waiting_area_a',
    name: 'Waiting Area A',
    slotsCount: 33,
    xMin: 54.1,
    xMax: 69.6, // Lebar slot ≈ 15.5m
    zMin: 795.2,
    zMax: 1006.4,
    slotAngleDeg: 45.0 // Miring 45 derajat jajar genjang
  },

  // ----------------------------------------------------------------------------
  // 5. Truck Waiting Area B (Baris Bawah / Sisi Dekat Jalan Pre-Gate)
  // 33 slot truk miring (jajar genjang 45°)
  // ----------------------------------------------------------------------------
  WAITING_B: {
    id: 'waiting_area_b',
    name: 'Waiting Area B',
    slotsCount: 33,
    xMin: 32.2,
    xMax: 48.0, // Lebar slot ≈ 15.8m
    zMin: 798.4,
    zMax: 998.1,
    slotAngleDeg: 45.0
  },

  // ----------------------------------------------------------------------------
  // 6. Jalur Sirkulasi Truk di antara Waiting Area A dan B
  // ----------------------------------------------------------------------------
  WA_DRIVEWAY: {
    xMin: 48.0,
    xMax: 54.1, // Lebar 6.1m
    zMin: 790.0,
    zMax: 1005.0
  },

  // ----------------------------------------------------------------------------
  // 7. Jalur Pemisah antara Waiting Area dan Container Yard
  // ----------------------------------------------------------------------------
  WA_CY_SEPARATOR_LANE: {
    xMin: 69.6,
    xMax: 76.9, // Lebar 7.3m
    zMin: 785.0,
    zMax: 1015.0
  },

  // ----------------------------------------------------------------------------
  // 8. Akses Keluar / Masuk Sisi Timur Laut (NE Access)
  // Menghubungkan Waiting Area & CY ke Jalan Pre-Gate
  // ----------------------------------------------------------------------------
  NE_ACCESS: {
    xMin: 16.9,
    xMax: 76.9,
    zMin: 1000.0,
    zMax: 1034.4
  }
};
