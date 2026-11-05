import * as THREE from 'three';
import { createSubAreaTrestleDanConveyor } from './SubAreaTrestleDanConveyor.js';
import { createSubAreaDermagaPetikemas } from './SubAreaDermagaPetikemas.js';
import { createSubAreaDermagaCurahKering } from './SubAreaDermagaCurahKering.js';

/**
 * ==============================================================================
 * Modul Utama Area Dermaga & Jembatan Penghubung (Trestle + Sea Conveyor + Berth)
 * ==============================================================================
 * Mengintegrasikan:
 * 1. Trestle (Jembatan Penghubung 954m) & 2-Lane Sea Conveyor (975m)
 * 2. Dermaga Petikemas (656m x 80m) & Dermaga Curah Kering (250m L-Shape tanpa pemisah)
 * 3. Jalur Rel STS Menerus & Total 10 Unit CC/STS Crane (2 di Cuker + 8 di Petikemas)
 */
export function createDermagaArea(scene) {
  const dermagaGroup = new THREE.Group();
  dermagaGroup.name = 'dermaga_area_group';

  // 1. Jembatan Penghubung (Trestle) & 2-Lane Sea Conveyor
  dermagaGroup.add(createSubAreaTrestleDanConveyor());

  // 2. Segmen Dermaga Petikemas (8 STS Crane + Rel Menerus Sisi Luar + Rel Sisi Dalam)
  dermagaGroup.add(createSubAreaDermagaPetikemas());

  // 3. Segmen Dermaga Curah Kering (2 STS Crane + Jetty Conveyor + Mooring Dolphins)
  dermagaGroup.add(createSubAreaDermagaCurahKering());

  scene.add(dermagaGroup);
  return dermagaGroup;
}
