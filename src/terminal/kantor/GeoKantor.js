/**
 * ==============================================================================
 * GeoKantor.js (Kalibrasi Geodesik Kompleks Kantor Utama / Head Office)
 * Sisi Tenggara Jalan Pre-Gate (Z: 597.9 s/d 775.0 | X: -13.3 s/d -181.3)
 * ==============================================================================
 * Sumber Koordinat Ground Truth:
 * 1. Keseluruhan Daerah Head Office:
 *    -7.204595, 112.668035 | -7.205702, 112.669118 | -7.204737, 112.670064 | -7.203696, 112.668975
 *    Tonjolan Barat Daya: -7.204763, 112.667865 | -7.204919, 112.668015
 * 2. Lapangan Futsal / Basket:
 *    -7.204678, 112.668357 | -7.204905, 112.668586 | -7.204772, 112.668701 | -7.204558, 112.668485
 * 3. Parkir Mobil Umum:
 *    -7.204544, 112.668480 | -7.204375, 112.668638 | -7.204614, 112.668885 | -7.204777, 112.668715
 * 4. Parkir Mobil Direktur & SM:
 *    -7.204274, 112.668753 | -7.204230, 112.668792 | -7.204460, 112.669033 | -7.204504, 112.668989
 * 5. Gedung Utama HO (Graha Pelindo):
 *    -7.204176, 112.668931 | -7.204026, 112.669072 | -7.204596, 112.669668 | -7.204771, 112.669506
 * 6. Kompleks Masjid, Koridor Penghubung, & Tempat Wudhu:
 *    Masjid: -7.205030, 112.668805 | -7.204800, 112.668909 | -7.205137, 112.669066 | -7.204901, 112.669161
 *    Penghubung: -7.205046, 112.669121 | -7.205115, 112.669269 | -7.205063, 112.669299 | -7.204988, 112.669141
 *    Wudhu: -7.205144, 112.669262 | -7.205198, 112.669383 | -7.205116, 112.669423 | -7.205053, 112.669311
 * 7. Parkir Mobil Selatan (Belakang HO):
 *    Baris 1: -7.204832, 112.669501 | -7.204852, 112.669519 | -7.204647, 112.669740 | -7.204622, 112.669709
 *    Baris 2: -7.205032, 112.669449 | -7.204661, 112.669817 | -7.204684, 112.669847 | -7.205048, 112.669498
 */

export const KANTOR_ANCHOR_GPS = {
  OUTER_REGION: [
    [-7.204595, 112.668035],
    [-7.205702, 112.669118],
    [-7.204737, 112.670064],
    [-7.203696, 112.668975]
  ],
  SW_BULGE: [
    [-7.204763, 112.667865],
    [-7.204919, 112.668015]
  ],
  SPORTS_COURT: [
    [-7.204678, 112.668357],
    [-7.204905, 112.668586],
    [-7.204772, 112.668701],
    [-7.204558, 112.668485]
  ],
  PUBLIC_PARKING: [
    [-7.204544, 112.668480],
    [-7.204375, 112.668638],
    [-7.204614, 112.668885],
    [-7.204777, 112.668715]
  ],
  VIP_DIRECTOR_PARKING: [
    [-7.204274, 112.668753],
    [-7.204230, 112.668792],
    [-7.204460, 112.669033],
    [-7.204504, 112.668989]
  ],
  MAIN_HO_BUILDING: [
    [-7.204176, 112.668931],
    [-7.204026, 112.669072],
    [-7.204596, 112.669668],
    [-7.204771, 112.669506]
  ],
  MASJID_MAIN: [
    [-7.205030, 112.668805],
    [-7.204800, 112.668909],
    [-7.205137, 112.669066],
    [-7.204901, 112.669161]
  ],
  MASJID_CONNECTOR: [
    [-7.205046, 112.669121],
    [-7.205115, 112.669269],
    [-7.205063, 112.669299],
    [-7.204988, 112.669141]
  ],
  MASJID_WUDHU: [
    [-7.205144, 112.669262],
    [-7.205198, 112.669383],
    [-7.205116, 112.669423],
    [-7.205053, 112.669311]
  ],
  SOUTH_PARKING_1: [
    [-7.204832, 112.669501],
    [-7.204852, 112.669519],
    [-7.204647, 112.669740],
    [-7.204622, 112.669709]
  ],
  SOUTH_PARKING_2: [
    [-7.205032, 112.669449],
    [-7.204661, 112.669817],
    [-7.204684, 112.669847],
    [-7.205048, 112.669498]
  ]
};

export const KANTOR_BOUNDS = {
  // Batas Utama Daratan Kompleks Kantor Utama (Sisi Tenggara Jalan Pre-Gate, X < -13.3)
  zMinMain: 624.3,      // Tepi Barat Daya daratan utama (-7.204595, 112.668035)
  zMaxMain: 768.0,      // Tepi Timur Laut daratan utama (-7.203696, 112.668975 -> lebar ~144m, dengan bakau s/d 774m)
  zMaxMangrove: 774.5,  // Batas terluar sabuk bakau Timur Laut
  xRoadCurb: -13.3,     // Menyambung rapat dengan kanstin sisi keluar Jalan Pre-Gate
  xInnerCompoundMin: -164.0, // Batas pagar/perkerasan dalam sebelum sabuk bakau selatan (~150m dari jalan)
  xOuterCoastMin: -181.3,    // Garis pantai terluar sabuk bakau selatan (-7.205702, 112.669118 -> kedalaman 168m)

  // Tonjolan Barat Daya (-7.204763, 112.667865 & -7.204919, 112.668015)
  swBulge: {
    zMin: 597.9,        // Menjorok 26.4m ke kiri dari zMinMain (624.3)
    zMax: 624.3,
    xMax: -13.3,
    xMin: -38.0         // Ketebalan ~24.7m
  },

  // Elevasi Permukaan
  yGround: 1.56,
  yPavement: 1.58,
  yRoadInternal: 1.595
};

// 1. Konfigurasi Lapangan Futsal / Basket (19.5m x 34.6m)
export const SPORTS_COURT_CONFIG = {
  zMin: 644.0,
  zMax: 663.5,          // Lebar Z = 19.5m
  xMax: -44.6,
  xMin: -79.2,          // Panjang X = 34.6m
  centerZ: 653.75,
  centerX: -61.9
};

// 2. Konfigurasi Parkir Mobil Umum (26.0m x 36.3m, ~29 Slot)
export const PUBLIC_PARKING_CONFIG = {
  zMin: 664.0,
  zMax: 690.0,          // Lebar Z = 26.0m (berdampingan langsung di timur lapangan olahraga)
  xMax: -43.5,
  xMin: -79.8,          // Panjang X = 36.3m
  centerZ: 677.0,
  centerX: -61.65
};

// 3. Konfigurasi Parkir Direktur & Senior Manager (7.0m x 36.7m — Sesuai PDF 36.70m!)
export const VIP_PARKING_CONFIG = {
  zMin: 706.5,
  zMax: 713.5,          // Lebar Z = 7.0m
  xMax: -42.2,
  xMin: -78.9,          // Panjang X = 36.7m
  centerZ: 710.0,
  centerX: -60.55,
  canopyHeight: 3.8
};

// 4. Konfigurasi Gedung Utama Head Office — Graha Pelindo (25.0m x 92.0m)
export const MAIN_HO_CONFIG = {
  zMin: 728.0,
  zMax: 753.0,          // Lebar Z = 25.0m
  xMax: -47.5,          // Ujung Utara (Fasad melengkung menghadap Jalan Pre-Gate)
  xMin: -139.5,         // Ujung Selatan (Menara atap putih persegi)
  centerZ: 740.5,
  centerX: -93.5,
  // Pembagian 3 Seksi Gedung Utama HO sesuai Citra Satelit:
  northWingXMax: -47.5,
  northWingXMin: -88.5, // Panjang 41.0m (Fasad depan melengkung + atap abu-abu & putih)
  midLobbyXMax: -88.5,
  midLobbyXMin: -114.5, // Panjang 26.0m (Area lobby drop-off & rooftop chiller/M.E.)
  southTowerXMax: -114.5,
  southTowerXMin: -139.5 // Panjang 25.0m x 25.0m (Menara selatan beratap putih terang)
};

// 5. Konfigurasi Kompleks Masjid (Kubah Elips Putih + Koridor Penghubung + Tempat Wudhu)
export const MASJID_CONFIG = {
  // Kubah Utama Masjid (Elips/Oval 31m x 23m, dirotasi menyerong ~24 derajat sesuai gambar)
  mainDome: {
    centerZ: 671.6,
    centerX: -99.6,
    radiusX: 15.5,      // Setengah sumbu panjang (total ~31m sepanjang arah serong)
    radiusZ: 11.5,      // Setengah sumbu pendek (total ~23m)
    wallHeight: 5.5,
    domePeakHeight: 11.8,
    rotationY: -0.42    // Sudut serong (~24 derajat) searah koridor tempat wudhu di citra satelit
  },
  // Koridor Penghubung Beratap Putih (Menghubungkan Masjid ke Tempat Wudhu)
  connector: {
    startZ: 675.2,
    startX: -112.5,
    endZ: 681.8,
    endX: -129.8,
    width: 6.4,
    height: 4.2
  },
  // Paviliun Tempat Wudhu di Ujung Selatan
  wudhuPavilion: {
    centerZ: 684.6,
    centerX: -136.5,
    widthZ: 11.5,
    lengthX: 14.5,
    height: 4.6,
    rotationY: -0.42
  }
};

// 6. Konfigurasi 2 Area Parkir Mobil Selatan (Di Belakang Gedung Utama HO)
export const SOUTH_PARKING_CONFIG = {
  // Baris 1 (Tepat di selatan Gedung HO: -7.204832, 112.669501 s/d -7.204622, 112.669709)
  row1: {
    zMin: 702.5,
    zMax: 736.5,
    xCenter: -145.5,
    widthX: 5.5,
    canopyZMin: 703.5,  // Kanopi putih kecil yang tampak di kiri-belakang Gedung HO pada foto satelit
    canopyZMax: 716.5,
    canopyXCenter: -142.0
  },
  // Baris 2 (Di tepi selatan pelataran parkir belakang: -7.205032, 112.669449 s/d -7.204661, 112.669817)
  row2: {
    zMin: 685.0,
    zMax: 744.0,
    xCenter: -156.5,
    widthX: 5.5
  }
};
