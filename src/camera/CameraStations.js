import * as THREE from 'three';

/**
 * ==============================================================================
 * Camera Stations Configuration (Mainland Highway Corridor - Satellite Acc.)
 * ==============================================================================
 *
 * Predefined observation camera vantage points:
 * 1. OVERVIEW: South-to-North elevated perspective across the full highway.
 * 2. HIGHWAY: Inbound roadway view along queued trucks and wide parkway median.
 * 3. CHECKPOINT: Inbound Security Checkpoint Gate, Canopy, and Barrier.
 * 4. MEDIAN_PARK: Landscaped central parkway median and U-turn crossovers.
 */

export const CameraStations = {
  OVERVIEW: {
    id: 'OVERVIEW',
    name: 'Overview',
    badge: '● TTL SATELLITE OVERVIEW (OSOWILANGON - TOL - KORIDOR DARATAN)',
    position: new THREE.Vector3(-120, 480, -350),
    target: new THREE.Vector3(0, 10, -150),
    allowOrbit: true
  },
  OSOWILANGON_GATE: {
    id: 'OSOWILANGON_GATE',
    name: 'Gerbang Osowilangon',
    badge: '● GERBANG OSOWILANGON & PANGKAL FLYOVER TOL (Z = -1108)',
    position: new THREE.Vector3(38, 26, -1110),
    target: new THREE.Vector3(0, 5, -1040),
    allowOrbit: true
  },
  TOLL_FLYOVER: {
    id: 'TOLL_FLYOVER',
    name: 'Flyover Tol Romokalisari',
    badge: '● FLYOVER TOL ROMOKALISARI: DEK LAYANG RAMP DOWN & UNDERPASS (Z = -950)',
    position: new THREE.Vector3(32, 28, -950),
    target: new THREE.Vector3(0, 5, -880),
    allowOrbit: true
  },
  TOLL_DESCENT_VIEW: {
    id: 'TOLL_DESCENT_VIEW',
    name: 'Turunan Tol Ramp',
    badge: '● TURUNAN FLYOVER TOL ROMOKALISARI MENUJU TITIK GABUNG',
    position: new THREE.Vector3(-24, 22, -735),
    target: new THREE.Vector3(0, 4, -860),
    allowOrbit: true
  },
  TOLL_INTERCHANGE: {
    id: 'TOLL_INTERCHANGE',
    name: 'Flyover Tol Romokalisari',
    badge: '● FLYOVER TOL ROMOKALISARI: DEK LAYANG RAMP DOWN & UNDERPASS (Z = -950)',
    position: new THREE.Vector3(32, 28, -950),
    target: new THREE.Vector3(0, 5, -880),
    allowOrbit: true
  },
  TOLL_MERGE: {
    id: 'TOLL_MERGE',
    name: 'Titik Gabung Tol',
    badge: '● TITIK PENGGABUNGAN (TOUCHDOWN) & PENYEMPITAN KORIDOR (Z = -792)',
    position: new THREE.Vector3(28, 22, -810),
    target: new THREE.Vector3(0, 2, -730),
    allowOrbit: true
  },
  HIGHWAY: {
    id: 'HIGHWAY',
    name: 'Jalan Daratan',
    badge: '● SEGMEN JALAN DARATAN: PERSPEKTIF PENGEMUDI DI ATAS ASPAL (Z = -320)',
    position: new THREE.Vector3(14.0, 3.2, -320),
    target: new THREE.Vector3(14.0, 2.0, -180),
    allowOrbit: true
  },
  CHECKPOINT: {
    id: 'CHECKPOINT',
    name: 'Pos Keamanan',
    badge: '● POS KEAMANAN & KANOPI PEMERIKSAAN (Z = -186)',
    position: new THREE.Vector3(13.8, 2.8, -230),
    target: new THREE.Vector3(4.1, 2.2, -186),
    allowOrbit: true
  },
  RESET_CHECKPOINT: {
    id: 'RESET_CHECKPOINT',
    name: 'Pos Keamanan',
    badge: '● RESET: JALUR MASUK POS KEAMANAN (Z = -230)',
    position: new THREE.Vector3(13.8, 2.8, -230),
    target: new THREE.Vector3(4.1, 2.2, -186),
    allowOrbit: true
  },
  MEDIAN_PARK: {
    id: 'MEDIAN_PARK',
    name: 'Median & Crossovers',
    badge: '● SEGMEN 3: PEMBANGKIT LISTRIK & MERGE JEMBATAN',
    position: new THREE.Vector3(18, 22, -145),
    target: new THREE.Vector3(0, 2, -115),
    allowOrbit: true
  },
  CAUSEWAY: {
    id: 'CAUSEWAY',
    name: 'Causeway Bridge',
    badge: '● 680M CURVED CAUSEWAY BRIDGE (JEMBATAN MELENGKUNG)',
    position: new THREE.Vector3(3.8, 4.5, 20),
    target: new THREE.Vector3(3.8, 3.8, 180),
    allowOrbit: true
  },
  TERMINAL_OVERVIEW: {
    id: 'TERMINAL_OVERVIEW',
    name: 'Terminal Overview',
    badge: '● TERMINAL TELUK LAMONG: OPERATIONAL & ADMINISTRATIVE COMPLEX',
    position: new THREE.Vector3(-80, 340, 750),
    target: new THREE.Vector3(-80, 2.2, 750),
    allowOrbit: true
  },
  HEAD_OFFICE: {
    id: 'HEAD_OFFICE',
    name: 'Head Office',
    badge: '● GRAHA PELINDO - HEAD OFFICE TELUK LAMONG',
    position: new THREE.Vector3(-60, 45, 765),
    target: new THREE.Vector3(-110, 10, 765),
    allowOrbit: true
  },
  MASJID: {
    id: 'MASJID',
    name: 'Masjid TTL',
    badge: '● MASJID TELUK LAMONG (KUBAH PUTIH IKONIK)',
    position: new THREE.Vector3(-95, 35, 680),
    target: new THREE.Vector3(-135, 10, 680),
    allowOrbit: true
  },
  SPORTS_COURT: {
    id: 'SPORTS_COURT',
    name: 'Sports & Parking',
    badge: '● LAPANGAN BASKET/FUTSAL & SHELTER PARKIR MOTOR',
    position: new THREE.Vector3(-30, 25, 670),
    target: new THREE.Vector3(-70, 3, 670),
    allowOrbit: true
  },
  ROAD_CORRIDOR: {
    id: 'ROAD_CORRIDOR',
    name: 'Jalan Pre-Gate (Aspal)',
    badge: '● JALAN PRE-GATE: PERSPEKTIF PENGEMUDI DI LAJUR MASUK (Z = 650)',
    position: new THREE.Vector3(7.3, 3.5, 650),
    target: new THREE.Vector3(7.3, 2.5, 820),
    allowOrbit: true
  },
  PRE_GATE_TOP_VIEW: {
    id: 'PRE_GATE_TOP_VIEW',
    name: 'Jalan Pre-Gate (Top View)',
    badge: '● JALAN PRE-GATE: SATELLITE TOP-DOWN VIEW (Z = 625 s/d 1169)',
    position: new THREE.Vector3(0, 160, 880),
    target: new THREE.Vector3(5, 1.6, 920),
    allowOrbit: true
  },
  AREA_A_TOP_VIEW: {
    id: 'AREA_A_TOP_VIEW',
    name: 'Area A (Top View Satelit)',
    badge: '● AREA A: SATELLITE TOP-DOWN VIEW (SESUAI CITRA SATELIT REFERENSI)',
    position: new THREE.Vector3(81.5, 230, 690.0),
    target: new THREE.Vector3(81.5, 1.6, 690.0),
    allowOrbit: true
  },
  AREA_A_OVERVIEW: {
    id: 'AREA_A_OVERVIEW',
    name: 'Area A (Overview)',
    badge: '● AREA A: SABUK MANGROVE, YARD FASILITAS & KOMPLEKS BANGUNAN',
    position: new THREE.Vector3(75, 75, 595),
    target: new THREE.Vector3(82, 1.6, 690),
    allowOrbit: true
  },
  AREA_A_IPAL: {
    id: 'AREA_A_IPAL',
    name: 'Area A: Yard Tengah',
    badge: '● AREA A: HALAMAN / YARD TENGAH, SKID TANGKI & SHED UTILITAS',
    position: new THREE.Vector3(18, 22, 695),
    target: new THREE.Vector3(45, 2.5, 718),
    allowOrbit: true
  },
  AREA_A_SHELTER_PARKIR: {
    id: 'AREA_A_SHELTER_PARKIR',
    name: 'Area A: Kompleks Bangunan',
    badge: '● AREA A: KOMPLEKS BANGUNAN TIMUR LAUT (4 TINGKAT GEDUNG & GUDANG SENG)',
    position: new THREE.Vector3(25, 30, 735),
    target: new THREE.Vector3(62, 4.0, 760),
    allowOrbit: true
  },
  MAIN_GATE: {
    id: 'MAIN_GATE',
    name: 'Gerbang Pre-Gate',
    badge: '● KANOPI GERBANG PRE-GATE & PEMERIKSAAN LAJUR MASUK (Z = 955)',
    position: new THREE.Vector3(9.1, 16, 910),
    target: new THREE.Vector3(9.1, 4.5, 960),
    allowOrbit: true
  },
  DRIVER_WALKWAY: {
    id: 'DRIVER_WALKWAY',
    name: 'Jalur Supir ke Shelter',
    badge: '● JALUR ASPAL PEJALAN KAKI SUPIR: WAITING AREA MENUJU SHELTER (SISI TENGGARA)',
    position: new THREE.Vector3(12.0, 16.0, 835.0),
    target: new THREE.Vector3(25.5, 2.0, 775.0),
    allowOrbit: true
  },
  WAITING_AREA: {
    id: 'WAITING_AREA',
    name: 'CY & Waiting Area',
    badge: '● CONTAINER YARD (TR 2 & TR 4) & TRUCK WAITING AREA (Z: 775 - 1034)',
    position: new THREE.Vector3(25, 42, 850),
    target: new THREE.Vector3(85, 4.0, 905),
    allowOrbit: true
  },
  CY_WAITING_TOP_VIEW: {
    id: 'CY_WAITING_TOP_VIEW',
    name: 'Top View CY & Waiting Area',
    badge: '● TOP-DOWN SATELIT: CY BLOK TR 2 & TR 4, WAITING AREA, MANGROVE',
    position: new THREE.Vector3(75.0, 260.0, 895.0),
    target: new THREE.Vector3(75.0, 1.6, 895.01),
    allowOrbit: true
  },
  SOUTH_TOP_VIEW: {
    id: 'SOUTH_TOP_VIEW',
    name: 'Top View Sayap Selatan',
    badge: '● TOP-DOWN SATELIT: GRAHA PELINDO, MASJID, SPORT & JALAN',
    position: new THREE.Vector3(-78, 165, 745.8),
    target: new THREE.Vector3(-78, 2.2, 745.0),
    allowOrbit: true
  },
  NORTH_TOP_VIEW: {
    id: 'NORTH_TOP_VIEW',
    name: 'Top View Sayap Utara',
    badge: '● TOP-DOWN SATELIT: DEPOT PETIKEMAS, GATE, STAGING BUS & SUBSTATION',
    position: new THREE.Vector3(80, 220, 860.8),
    target: new THREE.Vector3(80, 2.2, 860.0),
    allowOrbit: true
  },
  CAUSEWAY_CORRIDOR: {
    id: 'CAUSEWAY_CORRIDOR',
    name: 'Causeway Antar Pulau',
    badge: '● CAUSEWAY INTER-ISLAND: KORIDOR JALAN TANGGUL 6-LAJUR (Z = 1080 - 1590)',
    position: new THREE.Vector3(7.05, 3.4, 1090),
    target: new THREE.Vector3(7.05, 2.5, 1180),
    allowOrbit: true
  },
  TOLL_PLAZA_VIEW: {
    id: 'TOLL_PLAZA_VIEW',
    name: 'Plaza Gerbang Tol',
    badge: '● INTER-ISLAND TOLL PLAZA: KANOPI BARREL-VAULT 50M & 10 GARDU TOL (Z = 1330)',
    position: new THREE.Vector3(-22, 20, 1275),
    target: new THREE.Vector3(2.5, 6, 1330),
    allowOrbit: true
  },
  POST_TOLL_OVAL_VIEW: {
    id: 'POST_TOLL_OVAL_VIEW',
    name: 'Pulau Teardrop Oval',
    badge: '● PULAU TEARDROP MEDIAN: CINCIN POHON & POS KONTROL ADMINISTRASI (Z = 1415)',
    position: new THREE.Vector3(18, 24, 1380),
    target: new THREE.Vector3(-1.2, 5, 1415),
    allowOrbit: true
  },
  LOGISTICS_INTERSECTION_VIEW: {
    id: 'LOGISTICS_INTERSECTION_VIEW',
    name: 'Simpang 4 & Gudang Logistik',
    badge: '● SIMPANG 4 TERMINAL, YELLOW BOX & GUDANG LOGISTIK TENGGARA (Z = 1587)',
    position: new THREE.Vector3(28, 34, 1555),
    target: new THREE.Vector3(-18, 6, 1595),
    allowOrbit: true
  },
  MANGROVE_RESERVE_VIEW: {
    id: 'MANGROVE_RESERVE_VIEW',
    name: 'Pulau Mangrove',
    badge: '● SOUTH MANGROVE RESERVE ISLAND: HUTAN KONSERVASI MANGROVE',
    position: new THREE.Vector3(-105, 120, 1245),
    target: new THREE.Vector3(-105, 2, 1375),
    allowOrbit: true
  },
  CAUSEWAY_TOP_VIEW: {
    id: 'CAUSEWAY_TOP_VIEW',
    name: 'Top View Causeway',
    badge: '● TOP-DOWN SATELIT: KORIDOR JEMBATAN, GERBANG TOL, MANGROVE & LOGISTIK (Z = 1080 - 1590)',
    position: new THREE.Vector3(-45, 380, 1335.8),
    target: new THREE.Vector3(-45, 2.0, 1335.0),
    allowOrbit: true
  }
};


