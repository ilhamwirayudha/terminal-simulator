import * as THREE from 'three';
import { createMedianIsland } from '../../../assets/infrastructure/createMedianIsland.js';
import { createMedianTree } from '../../../assets/nature/createMedianTree.js';
import { PASCA_FRAME, TREE_MEDIAN_CONFIG } from './GeoPascaGate.js';

/**
 * ==============================================================================
 * Sub-Area: Median Pohon & Pos Operasional Pasca Gate (s: 571.5 s/d 814.0)
 * ==============================================================================
 * Koordinat GPS: -7.197348, 112.67494 s/d -7.195781, 112.676461
 * Meliputi pulau taman berkanstin selebar 8.4m, pos operasional beratap putih,
 * dan barisan pohon peneduh dua lajur di dalam pulau.
 */
export function createSubAreaMedianPohon() {
  const medGroup = new THREE.Group();
  medGroup.name = 'subarea_median_pohon_pasca_gate';

  const { z0, yRoad } = PASCA_FRAME;
  const { sStart, sEnd, centerX, width } = TREE_MEDIAN_CONFIG;
  const startZ = z0 + sStart;
  const endZ = z0 + sEnd;

  // 1. Pulau Median Berkanstin Lebar 8.4m dengan Ujung Melengkung (Bullnose)
  medGroup.add(
    createMedianIsland({
      startZ: startZ,
      endZ: endZ,
      centerX: centerX,
      width: width,
      y: yRoad
    })
  );

  // 2. Bangunan Pos Operasional / Shelter Petugas di Kepala Median (s: 584 s/d 604)
  // Sesuai footprint 2 blok di peta skematik & atap putih di foto satelit
  const bldgGroup = new THREE.Group();
  bldgGroup.name = 'median_operational_office';

  const wallMat = new THREE.MeshStandardMaterial({
    color: 0xe2e8f0,
    roughness: 0.55,
    metalness: 0.1
  });
  const roofWhiteMat = new THREE.MeshStandardMaterial({
    color: 0xf8fafc,
    roughness: 0.35,
    metalness: 0.15
  });
  const glassMat = new THREE.MeshStandardMaterial({
    color: 0x0284c7,
    roughness: 0.15,
    metalness: 0.85
  });
  const concretePadMat = new THREE.MeshStandardMaterial({
    color: 0x64748b,
    roughness: 0.8
  });

  // Lantai beton area pos (s: 580 s/d 606)
  const padMesh = new THREE.Mesh(new THREE.BoxGeometry(width - 0.6, 0.24, 26.0), concretePadMat);
  padMesh.position.set(centerX, yRoad + 0.12, z0 + 593.0);
  padMesh.receiveShadow = true;
  bldgGroup.add(padMesh);

  // Blok 1: Pos Kecil Barat Daya (s: 584 s/d 590)
  const block1 = new THREE.Mesh(new THREE.BoxGeometry(4.2, 3.2, 5.5), wallMat);
  block1.position.set(centerX + 0.6, yRoad + 0.24 + 1.6, z0 + 587.0);
  block1.castShadow = true;
  block1.receiveShadow = true;
  bldgGroup.add(block1);

  const roof1 = new THREE.Mesh(new THREE.BoxGeometry(4.8, 0.25, 6.2), roofWhiteMat);
  roof1.position.set(centerX + 0.6, yRoad + 0.24 + 3.32, z0 + 587.0);
  roof1.castShadow = true;
  bldgGroup.add(roof1);

  // Blok 2: Bangunan Utama Atap Putih (s: 593 s/d 603)
  const block2 = new THREE.Mesh(new THREE.BoxGeometry(6.2, 3.8, 9.5), wallMat);
  block2.position.set(centerX, yRoad + 0.24 + 1.9, z0 + 598.0);
  block2.castShadow = true;
  block2.receiveShadow = true;
  bldgGroup.add(block2);

  // Jendela kaca keliling
  const winMesh = new THREE.Mesh(new THREE.BoxGeometry(6.3, 1.2, 7.0), glassMat);
  winMesh.position.set(centerX, yRoad + 0.24 + 2.2, z0 + 598.0);
  bldgGroup.add(winMesh);

  // Atap Putih Lebar (Overhang terlihat jelas dari satelit)
  const roof2 = new THREE.Mesh(new THREE.BoxGeometry(7.4, 0.35, 10.8), roofWhiteMat);
  roof2.position.set(centerX, yRoad + 0.24 + 3.95, z0 + 598.0);
  roof2.castShadow = true;
  bldgGroup.add(roof2);

  medGroup.add(bldgGroup);

  // 3. Pepohonan Rimbun di Dalam Pulau Median
  // Klaster A: Ujung depan sebelum bangunan (s: 574 s/d 579)
  [-1.8, 1.8].forEach((tx) => {
    const tFront = createMedianTree({ scale: 1.05, rotationY: tx });
    tFront.position.set(centerX + tx, yRoad + 0.22, z0 + 576.5);
    medGroup.add(tFront);
  });

  // Klaster B: Sepanjang pulau setelah bangunan (s: 610 s/d 808)
  for (let s = 610.0; s <= 808.0; s += 8.5) {
    // Dua baris pohon selang-seling di sisi kiri & kanan pulau median
    [-2.1, 2.1].forEach((tx, idx) => {
      const zJitter = (idx === 0 ? -1.5 : 1.5) + Math.sin(s) * 0.8;
      const scale = 0.95 + Math.cos(s * 0.2 + idx) * 0.2;
      const tree = createMedianTree({
        scale: scale,
        rotationY: (s * 0.7 + idx) % (Math.PI * 2)
      });
      tree.position.set(centerX + tx, yRoad + 0.22, z0 + s + zJitter);
      medGroup.add(tree);
    });
  }

  return medGroup;
}
