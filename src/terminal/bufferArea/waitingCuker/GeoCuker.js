/**
 * ==============================================================================
 * CukerGeo.js (Waiting Area Curah Kering & CY Blok TR 5 Geodesic Calibration)
 * Sisi Barat Laut Jalan Pre-Gate (Z: 1034.4m s/d 1200.0m+ | X: 16.9m s/d 185.0m+)
 * Sesuai Citra Satelit Nyata & Ground Truth GPS WGS84 Terminal Teluk Lamong
 * ==============================================================================
 */

export const CUKER_BOUNDS = {
  // Sumbu Z (sepanjang koridor Jalan Pre-Gate ke arah Timur Laut)
  zMin: 1034.4,          // Batas awal tepat di akhir cyWaitingArea (Zero-Clipping)
  zAsphaltMax: 1145.0,   // Batas akhir perkerasan aspal lapangan Cuker & TR 5 dimundurkan ke 1145m
  zBufferMax: 1159.0,    // Batas tanggul tanah reklamasi/kerikil cokelat di sisi Timur Laut
  zMangroveMax: 1198.0,  // Batas sabuk mangrove lebat membelok di sisi Timur Laut
  zWaterMax: 1245.0,     // Batas bidang air laut estuari Teluk Lamong

  // Sumbu X (tegak lurus jalan, +X ke arah Barat Laut / Laut)
  xRoadCurb: 16.9,       // Kanstin tepi jalan Pre-Gate segmen 4 lajur
  xDrivewaySouth: 24.0,  // Tepi jalan akses koridor sisi jalan
  xCukerStart: 88.0,     // Awal lapangan parkir Waiting Area Curah Kering (Dump Truck)
  xCukerAsphaltEnd: 136.0, // Batas aspal sisi Barat Laut (sejajar dengan CY TR 2)
  xSoilBufferEnd: 148.0, // Tanggul tanah reklamasi cokelat sisi Barat Laut
  xMangroveEnd: 175.0,   // Sabuk hutan mangrove rapat pesisir Barat Laut
  xWaterCoast: 215.0     // Perairan estuari sisi terluar
};

/**
 * Konfigurasi Akses Keluar-Masuk & Kompleks Fasilitas Pembatas Sisi Barat Daya
 * Membentang penuh dari X = 19.0m s/d X = 131.0m pada Z in [1035.0, 1046.0m],
 * membentuk dinding pembatas fisik komprehensif antara cyWaitingArea dan Cuker.
 */
export const SOUTHWEST_BARRIER_CONFIG = {
  gateAperture: {
    zStart: 1050.0,
    zEnd: 1074.0,        // Lebar 24.0 meter (presisi ground truth GMaps)
    xRoad: 16.9
  },
  facilities: [
    {
      id: 'pos_satpam_gate',
      name: 'Pos Jaga & Gardu Gerbang Cuker',
      x: 21.0,
      z: 1045.0,
      width: 4.5,
      length: 6.0,
      height: 3.4,
      type: 'gate_booth'
    },
    {
      id: 'kantor_operasional',
      name: 'Gedung Kantor Operasional Cuker / TR 5',
      x: 33.0,
      z: 1039.0,
      width: 14.0,
      length: 8.0,
      height: 4.8,
      type: 'office'
    },
    {
      id: 'gudang_bengkel_terakota',
      name: 'Workshop / Fasilitas Bengkel Atap Merah Bata Terakota',
      x: 55.0,
      z: 1038.5,
      width: 24.0,
      length: 11.0,
      height: 6.2,
      type: 'warehouse_pitched'
    },
    {
      id: 'shelter_supir_kanopi',
      name: 'Shelter Istirahat Supir & Kanopi Baja',
      x: 76.0,
      z: 1039.0,
      width: 16.0,
      length: 7.0,
      height: 4.0,
      type: 'canopy_shelter'
    },
    {
      id: 'portacamp_2tier',
      name: 'Kompleks Portacamp Modular 2 Lantai',
      x: 94.0,
      z: 1039.0,
      width: 12.0,
      length: 5.0,
      height: 5.8,
      type: 'portacamp_stacked'
    },
    {
      id: 'fuel_station_truk',
      name: 'Stasiun Pengisian BBM Solar Truk (Tangki Silinder Kembar & Dispenser)',
      x: 111.0,
      z: 1038.5,
      width: 14.0,
      length: 6.5,
      height: 4.5,
      type: 'fuel_station'
    },
    {
      id: 'substation_gardu',
      name: 'Gardu Trafo & Ruang Generator Listrik Pelabuhan',
      x: 125.0,
      z: 1038.5,
      width: 8.0,
      length: 6.0,
      height: 3.8,
      type: 'substation'
    }
  ]
};

/**
 * Konfigurasi Grid & Tumpukan Container Yard Blok TR 5
 */
export const TR5_CONFIG = {
  SW_BLOCK: {
    id: 'tr5_sub_sw',
    name: 'CY Blok TR 5 Barat Daya (6 Row melintang X x 8 Bay memanjang Z)',
    rows: 6,
    bays: 8,
    xMin: 24.0,
    xMax: 65.3,
    zMin: 1078.0,
    zMax: 1099.8,
    maxTier: 3
  },
  CROSS_AISLE: {
    zMin: 1099.8,
    zMax: 1111.8,        // Celah lorong manuver Reach Stacker selebar 12.0m
    xMin: 24.0,
    xMax: 83.7
  },
  NE_BLOCK: {
    id: 'tr5_sub_ne',
    name: 'CY Blok TR 5 Timur Laut (9 Row melintang X x 11 Bay memanjang Z)',
    rows: 9,
    bays: 11,
    xMin: 24.0,
    xMax: 83.7,
    zMin: 1111.8,
    zMax: 1140.9,        // Berakhir di 1140.9m, ada buffer 4.1m sebelum batas aspal 1145m
    maxTier: 3
  }
};

/**
 * Konfigurasi Area Parkir Waiting Area Curah Kering (Dump Truck Cuker)
 */
export const CUKER_PARKING_CONFIG = {
  TRUCK_SPECS: {
    bedLength: 7.4,      // Panjang bak muatan (~32 CBM)
    bedWidth: 2.46,      // Lebar bak muatan
    bedHeight: 1.75,     // Tinggi dinding bak curah
    chassisLength: 9.8,  // Panjang total sasis tronton 10 roda
    cabLength: 2.4,
    cabWidth: 2.45,
    cabHeight: 2.6
  },

  // 2 Sisi Barisan Parkir Rapi Berhadapan (Tanpa barisan ketiga tengah):
  // Sisi 1 (Barisan Barat Laut): Menghadap Tenggara (-X, ke dalam lapangan)
  ROW_NW: {
    x: 125.0,
    zMin: 1056.0,
    zMax: 1126.0,
    count: 8,
    facing: -Math.PI / 2 // Menghadap Tenggara (-X)
  },
  // Sisi 2 (Barisan Tenggara Seberang): Menghadap Barat Laut (+X, berhadapan rapi)
  ROW_SE: {
    x: 102.0,
    zMin: 1056.0,
    zMax: 1126.0,
    count: 8,
    facing: Math.PI / 2  // Menghadap Barat Laut (+X)
  }
};
