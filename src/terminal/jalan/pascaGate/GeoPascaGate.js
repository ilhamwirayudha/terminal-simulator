/**
 * ==============================================================================
 * GeoPascaGate.js (Koridor Jalan Pasca Main Gate Menuju Container Yard)
 * Sumbu s menerus dari Z0 = 1168.0: s = 531.0 (Z=1699) s/d s = 1268.0 (Z=2436)
 * ==============================================================================
 */

export const PASCA_ANCHOR_GPS = {
  // Titik sambung dari akhir segmen Main Gate
  START_NW: [-7.197361, 112.674421],
  START_SE: [-7.197862, 112.674966],

  // Batas berhentinya sabuk pohon tepi
  TREE_STOP_SE: [-7.196986, 112.675824],
  TREE_STOP_NW: [-7.194633, 112.677024],

  // Koridor jalan murni tanpa pohon (area CY)
  ROAD_SE_START: [-7.196912, 112.675697],
  ROAD_SE_END:   [-7.192966, 112.679436],
  ROAD_NW_START: [-7.194757, 112.677174],
  ROAD_NW_END:   [-7.192717, 112.679156],

  // Poligon Median Pohon
  TREE_MED_1: [-7.197348, 112.674940],
  TREE_MED_2: [-7.195781, 112.676461],
  TREE_MED_3: [-7.195834, 112.676510],
  TREE_MED_4: [-7.197393, 112.674978],

  // Poligon Median Kontainer
  CONT_MED_1: [-7.195158, 112.677019],
  CONT_MED_2: [-7.195217, 112.677069],
  CONT_MED_3: [-7.193219, 112.678920],
  CONT_MED_4: [-7.193284, 112.678982]
};

export const PASCA_FRAME = {
  z0: 1168.0,     // Referensi s = 0 yang sama dengan Main Gate
  sStart: 531.0,  // Z = 1699.0 (ujung Main Gate)
  sEnd: 1268.0,   // Z = 2436.0 (ujung koridor CY)
  yRoad: 1.631
};

export const PASCA_ROAD_PROFILE = [
  { s: 531.0,  tNW: 21.5, tSE: -21.5, note: 'Sambungan mulus dari ujung segmen Main Gate' },
  { s: 570.0,  tNW: 21.4, tSE: -21.4, note: 'Koridor simetris 42.8m (16m In + 10.8m Median + 16m Out)' },
  { s: 1268.0, tNW: 21.4, tSE: -21.4, note: 'Ujung koridor jalan CY (Z = 2436.0)' }
];

export const TREE_MEDIAN_CONFIG = {
  sStart: 571.5, // Z = 1739.5
  sEnd: 814.0,   // Z = 1982.0 (Panjang 242.5m)
  centerX: 0.0,  // Tepat di tengah koridor
  width: 10.8,   // X in [-5.4, +5.4]
  boothStartS: 582.0,
  boothEndS: 604.0
};

export const CONTAINER_MEDIAN_CONFIG = {
  sStart: 906.0, // Z = 2074.0 (setelah celah persimpangan 92m)
  sEnd: 1208.0,  // Z = 2376.0 (Panjang 302.0m)
  centerX: 0.0,  // Tepat di tengah koridor
  padWidth: 10.8, // Lebar alas beton median X in [-5.4, +5.4] untuk memuat 4 bay (4 x 2.44m)
  // Dimensi standar kontainer 20ft (dari waitingCY/SubAreaBlokTR.js):
  // Lebar 2.44m sepanjang sumbu X (NW-SE, 4 bay berjajar), panjang 6.06m sepanjang sumbu Z (row mengikuti)
  contSpanX: 2.44,
  contSpanZ: 6.06,
  contHeight: 2.59,
  maxTiers: 4
};

export const VEGETATION_BOUNDS = {
  sStart: 531.0,
  sStopSE: 668.3, // Z = 1836.3 (-7.196986, 112.675824)
  sStopNW: 949.6  // Z = 2117.6 (-7.194633, 112.677024)
};

export function getPascaRoadEdgesAtS(s) {
  const clampedS = Math.max(PASCA_FRAME.sStart, Math.min(PASCA_FRAME.sEnd, s));
  let i = 0;
  while (i < PASCA_ROAD_PROFILE.length - 1 && PASCA_ROAD_PROFILE[i + 1].s < clampedS) {
    i++;
  }
  const p1 = PASCA_ROAD_PROFILE[i];
  const p2 = PASCA_ROAD_PROFILE[Math.min(i + 1, PASCA_ROAD_PROFILE.length - 1)];

  if (p1.s === p2.s) {
    return { tNW: p1.tNW, tSE: p1.tSE, z: PASCA_FRAME.z0 + clampedS };
  }

  const u = (clampedS - p1.s) / (p2.s - p1.s);
  const smoothU = u * u * (3 - 2 * u);

  const tNW = p1.tNW + smoothU * (p2.tNW - p1.tNW);
  const tSE = p1.tSE + smoothU * (p2.tSE - p1.tSE);
  return { tNW, tSE, z: PASCA_FRAME.z0 + clampedS };
}
