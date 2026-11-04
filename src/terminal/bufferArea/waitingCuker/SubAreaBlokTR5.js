import * as THREE from 'three';
import { TR5_CONFIG } from './GeoCuker.js';

/**
 * ==============================================================================
 * Sub-Area: Container Yard Blok TR 5 (Tumpukan Kontainer Aktif 20ft)
 * ==============================================================================
 * ORIENTASI GROUND TRUTH:
 * - Panjang Kontainer 20ft (6.06m) menghadap searah sumbu X (NW-SE, melintang jalan)
 * - Lebar Kontainer (2.44m) tersusun searah sumbu Z (sejajar jalan)
 * - Sub-blok Barat Daya: 6 Row melintang X x 8 Bay memanjang Z (Z: 1078.0 s/d 1099.8m)
 * - Sub-blok Timur Laut: 9 Row melintang X x 11 Bay memanjang Z (Z: 1111.8 s/d 1140.9m)
 * - Terletak di separuh timur lapangan, mundur aman dari gerbang masuk Z = 1050-1074m
 * - Dioptimasi penuh dengan THREE.InstancedMesh (1 Draw Call untuk 60 FPS)
 */
export function createSubAreaBlokTR5() {
  const tr5Group = new THREE.Group();
  tr5Group.name = 'subarea_cuker_tr5_containers';

  const yBase = 1.565;

  // Dimensi Kontainer Standar ISO 20ft
  const contLengthX = 6.06; // Panjang melintang X (tegak lurus jalan)
  const contWidthZ = 2.44;  // Lebar memanjang Z (sejajar jalan)
  const contHeight = 2.59;  // Tinggi per tier (Sumbu Y)

  // Material PBR Kontainer
  const containerMat = new THREE.MeshStandardMaterial({
    roughness: 0.65,
    metalness: 0.25,
    envMapIntensity: 0.8
  });

  // Palet Warna Kontainer Teluk Lamong
  const palette = [
    new THREE.Color(0x991b1b), // Merah bata / Maersk / CMA
    new THREE.Color(0xb91c1c), // Merah cerah
    new THREE.Color(0x1e3a8a), // Biru tua samudra
    new THREE.Color(0x2563eb), // Biru Pelindo
    new THREE.Color(0x0284c7), // Biru muda
    new THREE.Color(0xd1d5db), // Abu-abu krem reefer
    new THREE.Color(0x94a3b8), // Abu-abu baja
    new THREE.Color(0x166534), // Hijau tua Evergreen
    new THREE.Color(0xc2410c)  // Oranye Hapag-Lloyd
  ];

  let seed = 987654321;
  const rand = () => {
    seed = (seed * 1664525 + 1013904223) % 4294967296;
    return seed / 4294967296;
  };

  const containerInstances = [];

  // ----------------------------------------------------------------------------
  // 1. Generate Tumpukan di Sub-Blok Barat Daya (6 Row melintang X x 8 Bay memanjang Z)
  // Berada di X: 24.0 s/d 65.3m, Z: 1078.0 s/d 1099.8m
  // ----------------------------------------------------------------------------
  const sw = TR5_CONFIG.SW_BLOCK;
  const swRowStep = (sw.xMax - sw.xMin - contLengthX) / (sw.rows - 1);
  const swBayStep = (sw.zMax - sw.zMin - contWidthZ) / (sw.bays - 1);

  for (let r = 0; r < sw.rows; r++) {
    const px = sw.xMin + contLengthX / 2 + r * swRowStep;

    for (let b = 0; b < sw.bays; b++) {
      const pz = sw.zMin + contWidthZ / 2 + b * swBayStep;

      // Konsentrasi tumpukan aktif di bay tengah dan row tengah
      let tiers = 0;
      if (b >= 2 && b <= 5 && r >= 1 && r <= 4) {
        tiers = 2 + (rand() < 0.6 ? 1 : 0); // 2 s/d 3 tier
      } else if ((b === 1 || b === 6) && r >= 1 && r <= 3) {
        tiers = rand() < 0.5 ? 1 : 2; // 1 s/d 2 tier di tepi kluster
      }

      if (tiers > 0) {
        const colIdx = Math.floor(rand() * palette.length);
        for (let t = 0; t < tiers; t++) {
          const py = yBase + contHeight / 2 + t * contHeight;
          const col = (rand() < 0.7) ? palette[colIdx] : palette[Math.floor(rand() * palette.length)];
          containerInstances.push({ x: px, y: py, z: pz, color: col });
        }
      }
    }
  }

  // ----------------------------------------------------------------------------
  // 2. Generate Tumpukan di Sub-Blok Timur Laut (9 Row melintang X x 11 Bay memanjang Z)
  // Berada di X: 24.0 s/d 83.7m, Z: 1111.8 s/d 1140.9m
  // ----------------------------------------------------------------------------
  const ne = TR5_CONFIG.NE_BLOCK;
  const neRowStep = (ne.xMax - ne.xMin - contLengthX) / (ne.rows - 1);
  const neBayStep = (ne.zMax - ne.zMin - contWidthZ) / (ne.bays - 1);

  for (let r = 0; r < ne.rows; r++) {
    const px = ne.xMin + contLengthX / 2 + r * neRowStep;

    for (let b = 0; b < ne.bays; b++) {
      const pz = ne.zMin + contWidthZ / 2 + b * neBayStep;

      let tiers = 0;
      if (r <= 3 && b >= 2 && b <= 6) {
        tiers = 1 + (rand() < 0.5 ? 1 : 0); // 1 s/d 2 tier
      } else if (r >= 5 && r <= 7 && b >= 7 && b <= 9) {
        tiers = rand() < 0.4 ? 1 : 0;
      }

      if (tiers > 0) {
        const colIdx = Math.floor(rand() * palette.length);
        for (let t = 0; t < tiers; t++) {
          const py = yBase + contHeight / 2 + t * contHeight;
          const col = (rand() < 0.7) ? palette[colIdx] : palette[Math.floor(rand() * palette.length)];
          containerInstances.push({ x: px, y: py, z: pz, color: col });
        }
      }
    }
  }

  // ----------------------------------------------------------------------------
  // 3. Bangun THREE.InstancedMesh Kontainer 20ft (Melintang Searah X)
  // ----------------------------------------------------------------------------
  if (containerInstances.length > 0) {
    const contGeo = new THREE.BoxGeometry(contLengthX * 0.98, contHeight * 0.98, contWidthZ * 0.98);
    const instancedMesh = new THREE.InstancedMesh(contGeo, containerMat, containerInstances.length);
    instancedMesh.castShadow = true;
    instancedMesh.receiveShadow = true;

    const dummy = new THREE.Object3D();
    containerInstances.forEach((c, i) => {
      dummy.position.set(c.x, c.y, c.z);
      dummy.updateMatrix();
      instancedMesh.setMatrixAt(i, dummy.matrix);
      instancedMesh.setColorAt(i, c.color);
    });

    instancedMesh.instanceMatrix.needsUpdate = true;
    if (instancedMesh.instanceColor) instancedMesh.instanceColor.needsUpdate = true;
    tr5Group.add(instancedMesh);
  }

  return tr5Group;
}
