/**
 * ==============================================================================
 * GeoContainerYard.js (Kalibrasi Geodesik & Dimensi Kompleks Container Yard Utama)
 * ==============================================================================
 * Sumber Koordinat Ground Truth:
 * - Lahan Alokasi CY: -7.196914, 112.675689 s/d -7.196890, 112.684008
 * - Lapangan Barat:   -7.196901, 112.675711 s/d -7.200058, 112.681080
 * - Workshop/Office:  -7.195518, 112.677127 s/d -7.196057, 112.677672
 * - Gedung CFS:       -7.195173, 112.677512 s/d -7.195664, 112.678007
 * - Halte Bus:        -7.195129, 112.677452 s/d -7.195145, 112.677469
 * - Isi Bensin/SPBU:  -7.195272, 112.677497 s/d -7.195315, 112.677544
 * - 10 Blok ASC:      -7.196262, 112.677859 s/d -7.198358, 112.680025
 * - 5 Blok Selatan:   -7.198375, 112.680056 s/d -7.199401, 112.681090
 * - Blok Timur RTG:   -7.193070, 112.679600 s/d -7.196885, 112.683548
 */

export const CY_ANCHOR_GPS = {
  CORNER_NW_ROAD:  [-7.196914, 112.675689],
  CORNER_NE_ROAD:  [-7.192767, 112.679739],
  CORNER_SE_EAST:  [-7.196890, 112.684008],
  CORNER_SE_WEST:  [-7.200981, 112.679949],

  WEST_ZONE: [
    [-7.196901, 112.675711],
    [-7.195880, 112.676700],
    [-7.200058, 112.681080],
    [-7.201060, 112.680001]
  ],

  WORKSHOP_OFFICE: [
    [-7.195518, 112.677127],
    [-7.195371, 112.677250],
    [-7.195923, 112.677832],
    [-7.196057, 112.677672]
  ],

  CFS_COMPLEX: [
    [-7.195173, 112.677512],
    [-7.194274, 112.678394],
    [-7.194751, 112.678903],
    [-7.195664, 112.678007]
  ],

  BUS_STOP: [
    [-7.195129, 112.677452],
    [-7.195093, 112.677482],
    [-7.195111, 112.677502],
    [-7.195145, 112.677469]
  ],

  FUEL_STATION: [
    [-7.195272, 112.677497],
    [-7.195211, 112.677562],
    [-7.195249, 112.677605],
    [-7.195315, 112.677544]
  ],

  ASC_BLOCKS_10: [
    [-7.196262, 112.677859],
    [-7.193912, 112.680095],
    [-7.196021, 112.682274],
    [-7.198358, 112.680025]
  ],

  SOUTH_BLOCKS_5: [
    [-7.198375, 112.680056],
    [-7.196049, 112.682355],
    [-7.197038, 112.683374],
    [-7.199401, 112.681090]
  ],

  EAST_RTG_ZONE: [
    [-7.193070, 112.679600],
    [-7.192896, 112.679759],
    [-7.196727, 112.683715],
    [-7.196885, 112.683548]
  ]
};

export const CY_BOUNDS = {
  // Batas Lahan Bersih CY (642.1m x 654.7m)
  zMin: 1836.3,
  zMax: 2478.4,
  xRoadEdge: -21.4,
  xOuterSE: -676.1,

  yPavement: 1.62,
  ySoil: 1.60,
  coastalBeltWidth: 18.0
};

// 1. Konfigurasi Lapangan Ekspansi Barat (SubAreaLapanganBaratCY)
export const WEST_EXPANSION_CONFIG = {
  zMin: 1836.3,
  zMax: 1997.5,
  xMax: -21.4,
  xMin: -676.1,
  // Apron beton tengah tempat tumpukan kontainer sesuai Gambar 1
  apronXMax: -145.0,
  apronXMin: -395.0,
  // Jalan Akses Barat CY di sisi NE zona ini
  westRoadZMin: 2002.0,
  westRoadZMax: 2036.0
};

// 2. Konfigurasi Kompleks CFS, Workshop, Halte, SPBU & Yard Samping (SubAreaFasilitasCFS)
export const CFS_ZONE_CONFIG = {
  workshop: {
    zMin: 2057.5,
    zMax: 2079.8,
    xMax: -26.0,
    xMin: -113.5
  },
  busStop: {
    centerZ: 2114.2,
    centerX: -23.8,
    widthZ: 6.2,
    depthX: 3.4
  },
  fuelStation: {
    centerZ: 2106.3,
    centerX: -37.6,
    widthZ: 10.5,
    depthX: 8.8
  },
  cfsArea: {
    zMin: 2114.5,
    zMax: 2255.5,
    xMax: -31.5,
    xMin: -108.5,
    // Dimensi Gedung Gudang CFS Utama
    bldgZMin: 2118.0,
    bldgZMax: 2232.0, // Panjang 114m
    bldgXMax: -46.0,
    bldgXMin: -92.0,  // Lebar 46m
    bldgHeight: 13.5
  },
  eastCfsYard: {
    zMin: 2258.0,
    zMax: 2413.0,
    xMax: -26.0,
    xMin: -108.5
  }
};

// 3. Konfigurasi 10 Baris Blok Utama + 20 ASC Crane (SubAreaBlokUtamaASC)
export const ASC_BLOCKS_CONFIG = {
  zMin: 2054.5,
  zMax: 2413.8,       // Total lebar Z = 359.3m
  xMax: -140.5,
  xMin: -475.5,       // Total kedalaman X = 335.0m (10 baris x 33.5m)
  numBlocks: 10,
  blockPitchX: 33.5,  // Jarak pusat-ke-pusat antar baris blok
  rowsPerBlock: 6,    // 6 baris kontainer per blok (lebar ~16.5m)
  ascRailSpanX: 21.6, // Jarak rel kaki ASC melampaui 6 row kontainer

  // Pembagian arah Z (359.3m):
  // - Ujung Barat (Z: 2054.5 s/d 2092.5): Area Parkir/Transfer Truk R/D (38m)
  // - Seksi Kontainer Barat (Z: 2095.0 s/d 2231.0): 20 Bay kontainer 20ft (136m)
  // - Celah Lorong Tengah (Z: 2231.0 s/d 2237.0): 6m
  // - Seksi Kontainer Timur (Z: 2237.0 s/d 2373.0): 20 Bay kontainer 20ft (136m)
  // - Ujung Timur (Z: 2375.5 s/d 2413.8): Area Parkir/Transfer Truk R/D (38.3m)
  westTransferZMin: 2054.5,
  westTransferZMax: 2092.5,
  westStackZMin: 2095.0,
  westStackZMax: 2231.0,
  eastStackZMin: 2237.0,
  eastStackZMax: 2373.0,
  eastTransferZMin: 2375.5,
  eastTransferZMax: 2413.8,
  baysPerHalf: 20     // 20 bay di barat + 20 bay di timur = 40 bay per baris blok
};

// 4. Konfigurasi 5 Baris Blok Cadangan Selatan (SubAreaBlokCadanganSelatan)
export const SOUTH_BLOCKS_CONFIG = {
  zMin: 2054.5,
  zMax: 2416.5,
  xMax: -481.0,
  xMin: -641.0,       // Kedalaman X = 160.0m (5 baris x 32.0m)
  numBlocks: 5,
  blockPitchX: 32.0,
  rowsPerBlock: 6
};

// 5. Konfigurasi Koridor Reefer & Blok Timur + 2 RTG (SubAreaBlokTimurRTG)
export const EAST_RTG_CONFIG = {
  zMin: 2442.5,
  zMax: 2469.0,       // Lebar koridor 26.5m
  xMax: -33.0,
  xMin: -642.5,       // Panjang 609.5m
  eastAccessRoadZMin: 2415.5,
  eastAccessRoadZMax: 2441.5,
  sePerimeterRoadZMin: 2469.5,
  sePerimeterRoadZMax: 2477.5
};
