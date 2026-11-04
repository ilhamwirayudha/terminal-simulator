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
  // 1. Container Yard: Blok TR 2 (Sisi Dalam / Dekat Waiting Area)
  // 28 deret memanjang Z, 7 baris melintang X
  // ----------------------------------------------------------------------------
  TR2: {
    id: 'cy_block_tr2',
    name: 'Container Yard Blok TR 2',
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
  // 2. Container Yard: Blok TR 4 (Sisi Luar / Dekat Mangrove)
  // Ditambahkan 2 deret di sisi barat daya: 32 deret memanjang Z, 8 baris melintang X
  // ----------------------------------------------------------------------------
  TR4: {
    id: 'cy_block_tr4',
    name: 'Container Yard Blok TR 4',
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
  // 3. Jalan Manuver Alat Berat / Truk di antara Blok TR 2 dan TR 4
  // ----------------------------------------------------------------------------
  CY_DRIVEWAY: {
    xMin: 95.3,
    xMax: 115.8, // Lebar 20.5 meter!
    zMin: 785.0,
    zMax: 1032.0
  }
};
