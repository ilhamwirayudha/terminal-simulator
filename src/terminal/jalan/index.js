import * as THREE from 'three';
import { createJalanAksesOsowilangun } from './JalanAksesOsowilangun.js';
import { createJembatanLaut } from './JembatanLaut.js';
import { createJalanPreGate } from './JalanPreGate.js';
import { createMainGateArea } from './mainGate/index.js';
import { createPascaGateArea } from './pascaGate/index.js';

/**
 * ==============================================================================
 * Area: Jalan (Coordinator File Tunggal Seluruh Jaringan Jalan)
 * ==============================================================================
 * Menggabungkan seluruh sub-bagian jaringan jalan Terminal Teluk Lamong:
 * 1. Sub Akses Darat Osowilangun (Z: -1130 s/d -55)
 * 2. Sub Jembatan Laut Melengkung 680m (Z: -55 s/d +625)
 * 3. Sub Jalan Pre-Gate (Z: +623.5 s/d +1168)
 * 4. Sub Jalan Main Gate & Kanopi Utama (Z: +1168 s/d +1699)
 * 5. Sub Jalan Pasca Main Gate & Median Pohon/Kontainer (Z: +1699 s/d +2436)
 */
export function createAreaJalan(scene) {
  const areaJalanGroup = new THREE.Group();
  areaJalanGroup.name = 'area_jalan';

  // 1. Tambahkan Ruas Akses Osowilangun
  areaJalanGroup.add(createJalanAksesOsowilangun());

  // 2. Tambahkan Ruas Jembatan Laut Melengkung
  areaJalanGroup.add(createJembatanLaut());

  // 3. Tambahkan Ruas Jalan Pre-Gate
  areaJalanGroup.add(createJalanPreGate());

  // 4. Tambahkan Ruas Jalan Main Gate & Kanopi Utama
  areaJalanGroup.add(createMainGateArea());

  // 5. Tambahkan Ruas Jalan Pasca Main Gate (Median Pohon & Median Kontainer)
  areaJalanGroup.add(createPascaGateArea());

  if (scene) {
    scene.add(areaJalanGroup);
  }

  return areaJalanGroup;
}
