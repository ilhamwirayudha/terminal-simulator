/**
 * ==============================================================================
 * GeoDermaga.js (Kalibrasi Geodesik Trestle, Sea Conveyor, & Dermaga Terpadu)
 * ==============================================================================
 * Sumber Koordinat Ground Truth:
 * 1. Trestle (Jembatan Penghubung):
 *    -7.192402, 112.679903 | -7.186227, 112.685907 | -7.186099, 112.685813 | -7.192291, 112.679810
 * 2. Jalur Conveyor Laut (2 Lane Circular Pipe Conveyor):
 *    -7.192383, 112.679518 | -7.192471, 112.679594 | -7.185955, 112.685875 | -7.185884, 112.685807
 * 3. Dermaga Petikemas:
 *    -7.186149, 112.685784 | -7.185612, 112.686262 | -7.189069, 112.690989 | -7.189659, 112.690557
 * 4. Dermaga Curah Kering (Poligon 6 Titik L-Shape menyatu tanpa pemisah):
 *    -7.186097, 112.685753 | -7.185585, 112.686218 | -7.184248, 112.684402 |
 *    -7.184466, 112.684243 | -7.185465, 112.685592 | -7.185792, 112.685351
 */

export const DERMAGA_ANCHOR_GPS = {
  TRESTLE: [
    [-7.192402, 112.679903], // Pangkal SE
    [-7.186227, 112.685907], // Ujung Dermaga SE
    [-7.186099, 112.685813], // Ujung Dermaga NW
    [-7.192291, 112.679810]  // Pangkal NW
  ],
  SEA_CONVEYOR: [
    [-7.192383, 112.679518], // Pangkal Darat NW
    [-7.192471, 112.679594], // Pangkal Darat SE
    [-7.185955, 112.685875], // Ujung Dermaga SE
    [-7.185884, 112.685807]  // Ujung Dermaga NW
  ],
  BERTH_PETIKEMAS: [
    [-7.186149, 112.685784], // Sudut NW Dalam (bertemu Trestle & Cuker)
    [-7.185612, 112.686262], // Sudut NW Luar (menyatu dengan Cuker)
    [-7.189069, 112.690989], // Sudut SE Luar
    [-7.189659, 112.690557]  // Sudut SE Dalam
  ],
  BERTH_CURAH_KERING: [
    [-7.186097, 112.685753], // Pt 1: Menyatu dengan Sudut NW Dalam Petikemas
    [-7.185585, 112.686218], // Pt 2: Menyatu dengan Sudut NW Luar Petikemas
    [-7.184248, 112.684402], // Pt 3: Ujung NW Sisi Luar
    [-7.184466, 112.684243], // Pt 4: Ujung NW Sisi Dalam
    [-7.185465, 112.685592], // Pt 5: Sudut Tekukan Dalam L-Shape
    [-7.185792, 112.685351]  // Pt 6: Sudut Barat Daya Pelataran Menara Transfer
  ]
};

// 1. Konfigurasi Trestle & 2-Lane Sea Conveyor (Z: 2436.0 s/d 3436.0)
export const TRESTLE_CONFIG = {
  // Perpanjangan koridor jalan Pasca-Gate ke pangkal Trestle
  roadExtZStart: 2436.0,
  roadExtZEnd: 2482.0,
  yRoadLand: 1.631,

  // Jembatan Trestle Utama (Panjang 954.0m, Lebar 16.0m)
  zStart: 2482.0,
  zEnd: 3436.0,
  widthX: 16.0,         // X in [-8.0, +8.0]
  yDeck: 3.2,           // Elevasi dek jembatan & dermaga di atas permukaan laut
  pileSpacingZ: 24.0,   // Jarak antar bentang tiang pancang laut

  // 2-Lane Sea Conveyor di sisi Barat Laut (+X) Trestle (Panjang 975.0m)
  conveyor: {
    zStart: 2469.5,     // Dari Menara Transfer Darat beratap merah
    zEnd: 3444.5,       // Hingga Menara Transfer Dermaga beratap merah
    laneX: [13.2, 17.8],// 2 jalur pipa silinder bundar sejajar di sisi NW Trestle
    centerX: 15.5,
    elevationY: 9.8,    // Tinggi pusat pipa conveyor di atas laut
    landTower: {
      x: 15.5,
      z: 2469.5,        // Tepat menyambut ujung 2-lane conveyor Cuker (Z = 2466.8 & 2472.2, X = 21.4)
      widthX: 11.5,
      widthZ: 11.5,
      height: 16.5
    },
    berthTower: {
      x: 19.5,
      z: 3444.5,        // Berdiri di pelataran L-shape Dermaga Curah Kering
      widthX: 12.5,
      widthZ: 12.5,
      height: 21.0
    }
  }
};

// 2. Konfigurasi Dermaga Petikemas & Dermaga Curah Kering Terpadu (Tanpa Pemisah)
export const BERTH_CONFIG = {
  yDeck: 3.2,           // Elevasi permukaan dek beton dermaga
  deckThickness: 1.35,  // Tebal pelat & balok dek dermaga
  railGaugeZ: 24.0,     // Lebar rel kaki portal STS Crane (24.0m agar pas di lebar jari Cuker 30.0m)

  // Jalur Rel STS Sisi Luar (+Z): MENERUS TANPA PUTUS dari Petikemas (X = -634) hingga Cuker (X = +260)
  outerRailCenterZ: 3501.0, // Rel kaki darat di Z = 3489.0, rel kaki laut di Z = 3513.0
  outerRailStartX: -634.0,
  outerRailEndX: 260.0,     // Total panjang rel STS menerus = 894.0m

  // Jalur Rel STS Sisi Dalam (-Z): Khusus sisi Domestik Dermaga Petikemas
  innerRailCenterZ: 3451.0, // Rel kaki laut di Z = 3439.0, rel kaki darat di Z = 3463.0
  innerRailStartX: -634.0,
  innerRailEndX: -28.0,     // Berhenti sebelum bundaran akses Trestle

  // A. Segmen Dermaga Petikemas (Panjang 656.0m x Lebar 80.0m)
  petikemas: {
    xMax: 16.0,         // Menyatu langsung tanpa celah dengan Dermaga Curah Kering di X = +16.0
    xMin: -640.0,       // Ujung Tenggara Dermaga Petikemas (Panjang 656.0m)
    zMin: 3436.0,       // Tepi Dalam (Barat Daya / Domestik)
    zMax: 3516.0        // Tepi Luar (Timur Laut / Internasional)
  },

  // B. Segmen Dermaga Curah Kering (Poligon 6 Titik L-Shape, Panjang 249.5m)
  curahKering: {
    xMin: 16.0,         // Menyatu langsung tanpa celah dengan Dermaga Petikemas di X = +16.0
    xStepL: 80.0,       // Batas pelataran lebar L-shape (X: +16.0 s/d +80.0, panjang 64.0m)
    xMax: 265.5,        // Ujung Barat Laut jari dermaga curah kering (panjang total 249.5m)
    zPlatformMin: 3430.0, // Pelataran menara transfer menjorok ke arah darat hingga Z = 3430.0
    zPierMin: 3486.0,   // Tepi dalam jari dermaga curah kering (lebar 30.0m: Z = 3486.0 s/d 3516.0)
    zMax: 3516.0        // Tepi luar segaris lurus dengan Dermaga Petikemas (Z = 3516.0)
  }
};

/**
 * Daftar 10 Unit CC/STS Crane Terpadu (2 di Segmen Curah Kering + 8 di Segmen Petikemas)
 * Posisi, orientasi boom, dan warna dikalibrasi presisi dari citra satelit referensi.
 */
export const STS_CRANES_PLACEMENT = [
  // ============================================================================
  // A. 2 UNIT DI SEGMEN DERMAGA CURAH KERING (Di atas Rel Menerus Sisi Luar +Z)
  // ============================================================================
  {
    id: 'STS-CUKER-01',
    segment: 'CURAH_KERING',
    x: 236.0,
    z: BERTH_CONFIG.outerRailCenterZ,
    boomDirectionZ: 1, // Menghadap Laut Luar (+Z)
    colorScheme: 'BULK_TEAL',
    hasBulkHopper: true,
    trolleyReachRatio: 0.62
  },
  {
    id: 'STS-CUKER-02',
    segment: 'CURAH_KERING',
    x: 112.0,
    z: BERTH_CONFIG.outerRailCenterZ,
    boomDirectionZ: 1, // Menghadap Laut Luar (+Z)
    colorScheme: 'BULK_TEAL',
    hasBulkHopper: true,
    trolleyReachRatio: 0.52
  },

  // ============================================================================
  // B. 8 UNIT DI SEGMEN DERMAGA PETIKEMAS (4 di Rel Luar +Z, 4 di Rel Dalam -Z)
  // ============================================================================
  // 1. Klaster Atas-Tengah (Dekat tulisan "Terminal Teluk Lamong" di foto satelit)
  {
    id: 'STS-PK-01',
    segment: 'PETIKEMAS',
    x: -95.0,
    z: BERTH_CONFIG.innerRailCenterZ,
    boomDirectionZ: -1, // Menghadap Kolam Dalam (-Z)
    colorScheme: 'TEAL_GREEN',
    hasBulkHopper: false,
    trolleyReachRatio: 0.48
  },
  {
    id: 'STS-PK-02',
    segment: 'PETIKEMAS',
    x: -175.0,
    z: BERTH_CONFIG.innerRailCenterZ,
    boomDirectionZ: -1, // Menghadap Kolam Dalam (-Z)
    colorScheme: 'RED_ORANGE',
    hasBulkHopper: false,
    trolleyReachRatio: 0.58
  },
  {
    id: 'STS-PK-03',
    segment: 'PETIKEMAS',
    x: -205.0,
    z: BERTH_CONFIG.outerRailCenterZ,
    boomDirectionZ: 1,  // Menghadap Laut Luar (+Z)
    colorScheme: 'TEAL_GREEN',
    hasBulkHopper: false,
    trolleyReachRatio: 0.54
  },

  // 2. Klaster Tengah-Bawah (2 unit di Rel Luar +Z)
  {
    id: 'STS-PK-04',
    segment: 'PETIKEMAS',
    x: -385.0,
    z: BERTH_CONFIG.outerRailCenterZ,
    boomDirectionZ: 1,  // Menghadap Laut Luar (+Z)
    colorScheme: 'TEAL_GREEN',
    hasBulkHopper: false,
    trolleyReachRatio: 0.45
  },
  {
    id: 'STS-PK-05',
    segment: 'PETIKEMAS',
    x: -430.0,
    z: BERTH_CONFIG.outerRailCenterZ,
    boomDirectionZ: 1,  // Menghadap Laut Luar (+Z)
    colorScheme: 'RED_ORANGE',
    hasBulkHopper: false,
    trolleyReachRatio: 0.60
  },

  // 3. Klaster Ujung Tenggara (3 unit: 2 di Rel Dalam -Z, 1 di Rel Luar +Z)
  {
    id: 'STS-PK-06',
    segment: 'PETIKEMAS',
    x: -535.0,
    z: BERTH_CONFIG.innerRailCenterZ,
    boomDirectionZ: -1, // Menghadap Kolam Dalam (-Z)
    colorScheme: 'RED_ORANGE',
    hasBulkHopper: false,
    trolleyReachRatio: 0.52
  },
  {
    id: 'STS-PK-07',
    segment: 'PETIKEMAS',
    x: -565.0,
    z: BERTH_CONFIG.outerRailCenterZ,
    boomDirectionZ: 1,  // Menghadap Laut Luar (+Z)
    colorScheme: 'RED_ORANGE',
    hasBulkHopper: false,
    trolleyReachRatio: 0.64
  },
  {
    id: 'STS-PK-08',
    segment: 'PETIKEMAS',
    x: -595.0,
    z: BERTH_CONFIG.innerRailCenterZ,
    boomDirectionZ: -1, // Menghadap Kolam Dalam (-Z)
    colorScheme: 'RED_ORANGE',
    hasBulkHopper: false,
    trolleyReachRatio: 0.46
  }
];
