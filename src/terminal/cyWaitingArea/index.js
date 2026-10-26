import * as THREE from 'three';
import { createAccessRoadsSubArea } from './AccessRoadsSubArea.js';
import { createWaitingAreaSubArea } from './WaitingAreaSubArea.js';
import { createContainerYardSubArea } from './ContainerYardSubArea.js';
import { createMangrovePesisirSubArea } from './MangrovePesisirSubArea.js';
import { createDriverWalkwaySubArea } from './DriverWalkwaySubArea.js';

/**
 * ==============================================================================
 * Area: Container Yard & Truck Waiting Area (Coordinator File)
 * Sisi Barat Laut Jalan Pre-Gate (Z: 775m s/d 1034m | X: 16.9m s/d 185m+)
 * Sesuai Citra Satelit Nyata (Gambar 1 & Gambar 2)
 * ==============================================================================
 *
 * Mengoordinasikan seluruh sub-area fasilitas:
 * 1. Base Perkerasan Aspal, Jalur Manuver & Akses Sirkulasi (AccessRoadsSubArea.js)
 * 2. Truck Waiting Area A & B (66 Slot Truk Jajar Genjang 45°) (WaitingAreaSubArea.js)
 * 3. Container Yard Blok TR 2 & Blok TR 4 (InstancedMesh Kontainer) (ContainerYardSubArea.js)
 * 4. Sabuk Hutan Mangrove & Garis Pantai Pesisir (MangrovePesisirSubArea.js)
 * 5. Jalur Aspal Pejalan Kaki (Supir) Sisi Tenggara Menuju Shelter (DriverWalkwaySubArea.js)
 */
export function createCyWaitingArea(scene) {
  const cyWaitingGroup = new THREE.Group();
  cyWaitingGroup.name = 'area_cy_waiting';

  // 1. Tambahkan Akses Jalan & Base Aspal
  const subRoads = createAccessRoadsSubArea();
  cyWaitingGroup.add(subRoads);

  // 2. Tambahkan Truck Waiting Area (Slot A & B 66 Truk)
  const subWaiting = createWaitingAreaSubArea();
  cyWaitingGroup.add(subWaiting);

  // 3. Tambahkan Container Yard (Blok TR 2 & Blok TR 4)
  const subCY = createContainerYardSubArea();
  cyWaitingGroup.add(subCY);

  // 4. Tambahkan Sabuk Mangrove Pesisir & Garis Pantai (Gambar 2)
  const subMangrove = createMangrovePesisirSubArea();
  cyWaitingGroup.add(subMangrove);

  // 5. Tambahkan Jalur Aspal Pejalan Kaki (Supir) Sisi Tenggara Menuju Shelter
  const subWalkway = createDriverWalkwaySubArea();
  cyWaitingGroup.add(subWalkway);

  // 5. Daftarkan Box Collider AABB ke scene.userData.colliders
  if (scene) {
    scene.userData.colliders = scene.userData.colliders || [];
    cyWaitingGroup.traverse((obj) => {
      if (obj.userData && obj.userData.isCollider && obj.userData.aabb) {
        scene.userData.colliders.push(obj.userData.aabb);
      }
    });
    scene.add(cyWaitingGroup);
  }

  return cyWaitingGroup;
}
