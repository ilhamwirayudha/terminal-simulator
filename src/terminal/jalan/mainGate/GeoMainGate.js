/**
 * ==============================================================================
 * GeoMainGate.js (Main Gate & Access Road Geodesic & Layout Calibration)
 * Terminal Teluk Lamong - Ground Truth Coordinate System
 * ==============================================================================
 */

export const ANCHOR_GPS = {
  ROAD_START_NW: [-7.200887810447679, 112.67117720403479],
  ROAD_START_SE: [-7.201246301116954, 112.67155695707947],
  ROAD_END_NW: [-7.197390428256632, 112.67443535150699],
  ROAD_END_SE: [-7.197814402496706, 112.67491238409802],
  TREE_REF_1: [-7.200884673819727, 112.67117386769279],
  TREE_REF_2: [-7.200972470218126, 112.67126236207142],
  WIDENING_START: [-7.199648064100548, 112.67276060737429],
  CANOPY_C1_NW: [-7.1980889478532015, 112.67393091574951],
  CANOPY_C2_SE: [-7.198479644538619, 112.67433580914239],
  CANOPY_C3_SE_POST: [-7.198354915116919, 112.67445228532391],
  CANOPY_C4_NW_POST: [-7.197967886840143, 112.67404554310275]
};

export const FRAME = {
  z0: 1168.0,
  x0: 0.0,
  totalLength: 531.0,
  treeBandWidth: 13.8,
  yRoad: 1.631
};

export const MEDIAN = {
  xMin: -1.3,
  xMax: 1.3,
  width: 2.6,
  sEnd: 455.0 // Median tipis berakhir tepat di belakang kanopi Main Gate
};

/**
 * Profil Lebar Perkerasan Aspal Jalan (PAVEMENT_PROFILE)
 * s = Jarak memanjang dari Z0 = 1168.0 (s in [0, 531])
 * tNW = Jarak tepi terluar aspal sisi Barat Laut (+X) dari sumbu median (x = 0)
 * tSE = Jarak tepi terluar aspal sisi Tenggara (-X) dari sumbu median (x = 0)
 */
export const PAVEMENT_PROFILE = [
  //  s       tNW (NW/+X)   tSE (SE/-X)   Keterangan
  { s: 0.0,   tNW: 16.9,    tSE: -13.3,   note: 'Sambungan presisi Pre-Gate di Z=1168' },
  { s: 220.0, tNW: 16.9,    tSE: -13.3,   note: 'Awal pelebaran jalur' },
  { s: 330.0, tNW: 22.5,    tSE: -22.5,   note: 'Pelebaran mulus 1' },
  { s: 390.0, tNW: 27.5,    tSE: -27.5,   note: 'Pelebaran mulus 2' },
  { s: 430.0, tNW: 30.5,    tSE: -30.5,   note: 'Area gerbang masuk (kanopi)' },
  { s: 458.0, tNW: 30.5,    tSE: -30.5,   note: 'Area gerbang keluar (kanopi)' },
  { s: 495.0, tNW: 25.5,    tSE: -25.5,   note: 'Transisi halus menuju koridor pasca-gate' },
  { s: 531.0, tNW: 21.5,    tSE: -21.5,   note: 'Ujung segmen Main Gate (simetris menyambung Pasca Gate)' }
];

export const MAIN_GATE_CONFIG = {
  sCenter: 445.0, // Z ≈ 1613
  sLength: 20.0,  // Panjang kanopi Z: 435.0 s/d 455.0 (Z ≈ 1603 s/d 1623)
  canopyXMin: -25.0, // Menutup penuh 4 gate out kontainer
  canopyXMax: 25.0,  // Menutup penuh 4 gate in kontainer
  canopyHeight: 9.8,
  clearanceHeight: 6.8,

  lanes: [
    { id: 'gate_in_cuker', type: 'cuker_in', xCenter: 28.0, width: 4.8, hasCanopy: false },
    { id: 'gate_in_cont_1', type: 'cont_in', xCenter: 22.0, width: 4.8, hasCanopy: true },
    { id: 'gate_in_cont_2', type: 'cont_in', xCenter: 16.0, width: 4.8, hasCanopy: true },
    { id: 'gate_in_cont_3', type: 'cont_in', xCenter: 10.0, width: 4.8, hasCanopy: true },
    { id: 'gate_in_cont_4', type: 'cont_in', xCenter: 4.0,  width: 4.8, hasCanopy: true },

    { id: 'gate_out_cont_1', type: 'cont_out', xCenter: -4.0,  width: 4.8, hasCanopy: true },
    { id: 'gate_out_cont_2', type: 'cont_out', xCenter: -10.0, width: 4.8, hasCanopy: true },
    { id: 'gate_out_cont_3', type: 'cont_out', xCenter: -16.0, width: 4.8, hasCanopy: true },
    { id: 'gate_out_cont_4', type: 'cont_out', xCenter: -22.0, width: 4.8, hasCanopy: true },
    { id: 'gate_out_cuker', type: 'cuker_out', xCenter: -28.0, width: 4.8, hasCanopy: false }
  ]
};

export function getRoadEdgesAtS(s) {
  const clampedS = Math.max(0, Math.min(FRAME.totalLength, s));
  let i = 0;
  while (i < PAVEMENT_PROFILE.length - 1 && PAVEMENT_PROFILE[i + 1].s < clampedS) {
    i++;
  }
  const p1 = PAVEMENT_PROFILE[i];
  const p2 = PAVEMENT_PROFILE[Math.min(i + 1, PAVEMENT_PROFILE.length - 1)];

  if (p1.s === p2.s) {
    return { tNW: p1.tNW, tSE: p1.tSE, z: FRAME.z0 + clampedS };
  }

  const u = (clampedS - p1.s) / (p2.s - p1.s);
  const smoothU = u * u * (3 - 2 * u);

  const tNW = p1.tNW + smoothU * (p2.tNW - p1.tNW);
  const tSE = p1.tSE + smoothU * (p2.tSE - p1.tSE);
  return { tNW, tSE, z: FRAME.z0 + clampedS };
}
