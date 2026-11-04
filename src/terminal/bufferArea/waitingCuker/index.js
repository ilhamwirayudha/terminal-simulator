import * as THREE from 'three';
import { createSubAreaPerkerasanCuker } from './SubAreaPerkerasanCuker.js';
import { createSubAreaMarkaCuker } from './SubAreaMarkaCuker.js';
import { createSubAreaBlokTR5 } from './SubAreaBlokTR5.js';
import { createSubAreaArmadaCuker } from './SubAreaArmadaCuker.js';
import { createSubAreaFasilitasCuker } from './SubAreaFasilitasCuker.js';

/**
 * ==============================================================================
 * Area: Waiting Area Curah Kering (Cuker) & CY Blok TR 5 (Coordinator File)
 * Sisi Barat Laut Jalan Pre-Gate (Z: 1034.4m s/d 1220.0m+ | X: 16.9m s/d 185.0m+)
 * Sesuai Citra Satelit Nyata & Ground Truth GPS WGS84 Terminal Teluk Lamong
 * ==============================================================================
 *
 * Mengoordinasikan seluruh sub-area fasilitas:
 * 1. Base Perkerasan Aspal & Tanggul Pesisir Bentuk L (CukerPavementSubArea.js)
 * 2. Marka Jalan, Pola Chevron & Grid Slot Kontainer (CukerMarkingsSubArea.js)
 * 3. Container Yard Blok TR 5 InstancedMesh (CukerTR5SubArea.js)
 * 4. Armada Dump Truck Curah Kering & Mobil Operasional (CukerVehiclesSubArea.js)
 * 5. Bangunan Pos, High Mast Lighting & Sabuk Mangrove L-Shape (CukerFacilitiesSubArea.js)
 */
export function createWaitingCukerArea(scene = null) {
  const cukerGroup = new THREE.Group();
  cukerGroup.name = 'area_cuker_waiting_tr5';

  // 1. Base Perkerasan Aspal & Tanggul Reklamasi Cokelat L-Shape
  const subPavement = createSubAreaPerkerasanCuker();
  cukerGroup.add(subPavement);

  // 2. Marka Garis Kuning, Pola Chevron & Grid Lantai Kontainer
  const subMarkings = createSubAreaMarkaCuker();
  cukerGroup.add(subMarkings);

  // 3. Container Yard Blok TR 5 (Tumpukan Kontainer Aktif 20ft & 40ft)
  const subTR5 = createSubAreaBlokTR5();
  cukerGroup.add(subTR5);

  // 4. Armada Dump Truck Curah Kering & Mobil Dinas
  const subVehicles = createSubAreaArmadaCuker();
  cukerGroup.add(subVehicles);

  // 5. Pos Jaga, High Mast, Pagar Perimeter & Sabuk Mangrove L-Shape
  const subFacilities = createSubAreaFasilitasCuker();
  cukerGroup.add(subFacilities);

  // 6. Daftarkan Box Collider jika ada
  if (scene) {
    scene.userData.colliders = scene.userData.colliders || [];
    cukerGroup.traverse((obj) => {
      if (obj.userData && obj.userData.isCollider && obj.userData.aabb) {
        scene.userData.colliders.push(obj.userData.aabb);
      }
    });
    scene.add(cukerGroup);
  }

  return cukerGroup;
}
