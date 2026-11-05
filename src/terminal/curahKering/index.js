import * as THREE from 'three';
import { createSubAreaLahanCuker } from './SubAreaLahanCuker.js';
import { createSubAreaPohonPesisirCuker } from './SubAreaPohonPesisirCuker.js';
import { createSubAreaSiloDanGudangCuker } from './SubAreaSiloDanGudangCuker.js';
import { createSubAreaOperasionalCuker } from './SubAreaOperasionalCuker.js';

/**
 * ==============================================================================
 * Area: Terminal Curah Kering (Z: 2117.6 s/d 2482.1 | X: +21.4 s/d +363.2)
 * ==============================================================================
 * Menggabungkan:
 * 1. Lahan & Zonasi 3 Sektor (ORU 83m, Koridor Tengah 58.5m, Bulk Area 223m)
 * 2. Sabuk Hutan Mangrove & Pepohonan Pesisir Luar (SW, NW, NE)
 * 3. Silo Storage 10x6000T (2x5), Twin Flat Storage, TT-3 & 2 Lane Conveyor
 * 4. Operasional Depan (PMK, GWT, HVS-3, Weighbridge), Gudang Tengah, & Fasilitas ORU
 */
export function createCurahKeringArea(scene) {
  const cukerAreaGroup = new THREE.Group();
  cukerAreaGroup.name = 'area_curah_kering';

  cukerAreaGroup.add(createSubAreaLahanCuker());
  cukerAreaGroup.add(createSubAreaPohonPesisirCuker());
  cukerAreaGroup.add(createSubAreaSiloDanGudangCuker());
  cukerAreaGroup.add(createSubAreaOperasionalCuker());

  if (scene) {
    scene.add(cukerAreaGroup);
  }

  return cukerAreaGroup;
}
