import * as THREE from 'three';
import { createUtilitasArea } from './utilitas/index.js';
import { createWaitingCYArea } from './waitingCY/index.js';
import { createWaitingCukerArea } from './waitingCuker/index.js';

/**
 * ==============================================================================
 * Area: Buffer & Fasilitas Penyangga Barat (bufferArea)
 * Sisi Barat Laut Jalan Pre-Gate (Z: 604.5m s/d 1220.0m+ | X: 13.3m s/d 185.0m+)
 * Sesuai Ground Truth Citra Satelit Nyata Terminal Teluk Lamong
 * ==============================================================================
 *
 * Mengoordinasikan seluruh sub-zona fasilitas penyangga barat:
 * 1. Utilitas, IPAL, Driver Shelter, Parkir Motor, & Mangrove Selatan (utilitas/)
 * 2. Waiting Area Truk Petikemas & Blok TR 2-4 (waitingCY/)
 * 3. Waiting Area Curah Kering & Blok TR 5 (waitingCuker/)
 */
export function createBufferArea(scene = null) {
  const bufferGroup = new THREE.Group();
  bufferGroup.name = 'area_buffer_barat';

  // 1. Klaster Utilitas & Fasilitas Pendukung (Z: 604.5 - 775)
  const utilitasGroup = createUtilitasArea();
  bufferGroup.add(utilitasGroup);

  // 2. Klaster Waiting Area Petikemas & Blok TR 2-4 (Z: 775 - 1034)
  const waitingCYGroup = createWaitingCYArea();
  bufferGroup.add(waitingCYGroup);

  // 3. Klaster Waiting Area Curah Kering & Blok TR 5 (Z: 1034 - 1220+)
  const waitingCukerGroup = createWaitingCukerArea();
  bufferGroup.add(waitingCukerGroup);

  // Daftarkan seluruh AABB Box Collider ke scene untuk simulasi fisik/navigasi
  if (scene) {
    scene.userData.colliders = scene.userData.colliders || [];
    bufferGroup.traverse((obj) => {
      if (obj.userData && obj.userData.isCollider && obj.userData.aabb) {
        scene.userData.colliders.push(obj.userData.aabb);
      }
    });
    scene.add(bufferGroup);
  }

  return bufferGroup;
}
