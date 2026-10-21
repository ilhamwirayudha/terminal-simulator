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
  PULAU_1: {
    id: 'PULAU_1',
    name: 'Pulau 1 Overview',
    badge: '● PULAU 1: TERMINAL OPERATIONAL & ADMINISTRATIVE COMPLEX',
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
    name: 'Jalan Pulau 1',
    badge: '● SEGMEN JALAN PULAU 1: PERSPEKTIF ASPAL 5-LAJUR & OCR (Z = 650)',
    position: new THREE.Vector3(11.4, 3.5, 650),
    target: new THREE.Vector3(11.4, 2.5, 780),
    allowOrbit: true
  },
  MAIN_GATE: {
    id: 'MAIN_GATE',
    name: 'Main Gate',
    badge: '● MAIN GATE & OCR TOLL INSPECTION CANOPY',
    position: new THREE.Vector3(-10, 16, 830),
    target: new THREE.Vector3(11.4, 6, 875),
    allowOrbit: true
  },
  WAITING_AREA: {
    id: 'WAITING_AREA',
    name: 'Waiting Area',
    badge: '● TRUCK BUFFER HOLDING YARD & CONTAINER STACKS',
    position: new THREE.Vector3(55, 48, 830),
    target: new THREE.Vector3(95, 5, 880),
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


