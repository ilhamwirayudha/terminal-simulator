import * as THREE from 'three';
import { createJalanAksesOsowilangun } from './JalanAksesOsowilangun.js';
import { createJembatanLaut } from './JembatanLaut.js';
import { createJalanPreGate } from './JalanPreGate.js';

/**
 * ==============================================================================
 * Area: Jalan (Coordinator File)
 * ==============================================================================
 * Menggabungkan seluruh sub-bagian jaringan jalan Terminal Teluk Lamong:
 * 1. Sub Akses Darat Osowilangun (Z: -1130 s/d -55) [SUDAH 1:1]
 * 2. Sub Jembatan Laut Melengkung 680m (Z: -55 s/d +625) [SUDAH 1:1]
 * 3. Sub Jalan Pre-Gate (Z: +623.5 s/d +1160) [1:1 GPS WGS84 Ground Truth]
 */
export function createAreaJalan(scene) {
  const areaJalanGroup = new THREE.Group();
  areaJalanGroup.name = 'area_jalan';

  // 1. Tambahkan Ruas Akses Osowilangun
  const jalanOsowilangun = createJalanAksesOsowilangun();
  areaJalanGroup.add(jalanOsowilangun);

  // 2. Tambahkan Ruas Jembatan Laut Melengkung
  const jembatanLaut = createJembatanLaut();
  areaJalanGroup.add(jembatanLaut);

  // 3. Tambahkan Ruas Jalan Pre-Gate
  const jalanPreGate = createJalanPreGate();
  areaJalanGroup.add(jalanPreGate);

  if (scene) {
    scene.add(areaJalanGroup);
  }

  return areaJalanGroup;
}
