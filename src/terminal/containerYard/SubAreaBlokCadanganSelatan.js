import * as THREE from 'three';
import { whiteLineMat } from '../../assets/materials/roadMaterials.js';
import {
  CONTAINER_SPECS,
  CONTAINER_PALETTE,
  createInstancedContainerBlock
} from '../../assets/containers/createContainer.js';
import {
  CY_BOUNDS,
  SOUTH_BLOCKS_CONFIG,
  ASC_BLOCKS_CONFIG
} from './GeoContainerYard.js';

/**
 * ==============================================================================
 * Sub-Area: 5 Baris Blok Cadangan Selatan CY (Bagian 3 Zona Tengah)
 *           (Z = 2054.5 s/d 2416.5 | X = -481.0 s/d -641.0)
 * ==============================================================================
 * Sesuai Koordinat Ground Truth (-7.198375, 112.680056 s/d -7.199401, 112.68109)
 * dan Gambar Detail (media_1793903737602_bc530380.png & media_1793903757099_cecea1b9.png):
 * - 5 Baris lapangan blok dengan bagian tengah kosong (hanya marka putih slot kontainer
 *   & bercak rumput alami)
 * - Bagian Ujung Barat (Z: 2056-2092) & Ujung Timur (Z: 2375-2415) pada kelima baris
 *   terisi tumpukan kontainer aktif
 * - Barisan kontainer tunggal di sepanjang tepi paling bawah (X = -645.5)
 */
export function createSubAreaBlokCadanganSelatan() {
  const southGroup = new THREE.Group();
  southGroup.name = 'subarea_5_blok_cadangan_selatan';

  const { yPavement } = CY_BOUNDS;
  const {
    zMin,
    zMax,
    xMax,
    numBlocks,
    blockPitchX,
    rowsPerBlock
  } = SOUTH_BLOCKS_CONFIG;

  const {
    westStackZMin,
    westStackZMax,
    eastStackZMin,
    eastStackZMax,
    baysPerHalf
  } = ASC_BLOCKS_CONFIG;

  const spec = CONTAINER_SPECS.TEU_20FT;
  const contHeight = spec.height;
  const rowStepX = 2.82;
  const bayStepZ = (westStackZMax - westStackZMin) / baysPerHalf;

  const blockSlabMat = new THREE.MeshStandardMaterial({
    color: 0x60666d,
    roughness: 0.88
  });

  const weatheredGrassMat = new THREE.MeshStandardMaterial({
    color: 0x3f5834,
    roughness: 0.94
  });

  const slotLinePositions = [];
  const addWhiteLine = (cx, cz, wX, wZ) => {
    const hx = wX / 2;
    const hz = wZ / 2;
    const yL = yPavement + 0.020;
    slotLinePositions.push(
      cx - hx, yL, cz - hz,
      cx + hx, yL, cz - hz,
      cx + hx, yL, cz + hz,

      cx - hx, yL, cz - hz,
      cx + hx, yL, cz + hz,
      cx - hx, yL, cz + hz
    );
  };

  let seed = 998877661;
  const rand = () => {
    seed = (seed * 1664525 + 1013904223) % 4294967296;
    return seed / 4294967296;
  };

  const containerInstances = [];

  for (let bIdx = 0; bIdx < numBlocks; bIdx++) {
    const blockCenterX = xMax - blockPitchX / 2 - bIdx * blockPitchX;

    // 1. Pelataran Beton Baris Blok Selatan
    const blockPad = new THREE.Mesh(
      new THREE.PlaneGeometry(20.5, 286.0),
      blockSlabMat
    );
    blockPad.rotation.x = -Math.PI / 2;
    blockPad.position.set(blockCenterX, yPavement + 0.008, (zMin + zMax) / 2);
    blockPad.receiveShadow = true;
    southGroup.add(blockPad);

    // 2. Marka Putih Ground Slot di Bagian Tengah yang Kosong (40 Bay)
    [westStackZMin, eastStackZMin].forEach((halfStartZ) => {
      for (let bay = 0; bay <= baysPerHalf; bay++) {
        const lineZ = halfStartZ + bay * bayStepZ;
        addWhiteLine(blockCenterX, lineZ, rowsPerBlock * rowStepX, 0.20);
      }
    });

    // Garis tengah pemisah seksi barat & timur
    addWhiteLine(blockCenterX, 2234.0, 20.5, 1.2);

    // 3. Tumpukan Kontainer di Ujung Barat (Z: 2058 s/d 2090) pada masing-masing dari 5 baris
    const westEndBays = [2060.5, 2067.3, 2074.1, 2080.9, 2087.7];
    westEndBays.forEach((bz, bayIdx) => {
      for (let r = 0; r < rowsPerBlock; r++) {
        // Di beberapa baris atas ujung barat, 2-3 bay paling dalam terisi
        if (bIdx <= 1 && bayIdx < 2 && rand() < 0.7) continue;
        if (rand() < 0.25) continue;

        const rx = blockCenterX - ((rowsPerBlock - 1) * rowStepX) / 2 + r * rowStepX;
        const tiers = 1 + Math.floor(rand() * 3);
        const domCol = CONTAINER_PALETTE[Math.floor(rand() * CONTAINER_PALETTE.length)];

        for (let t = 0; t < tiers; t++) {
          containerInstances.push({
            x: rx,
            y: yPavement + contHeight / 2 + t * contHeight,
            z: bz,
            color: rand() < 0.78 ? domCol : CONTAINER_PALETTE[Math.floor(rand() * CONTAINER_PALETTE.length)]
          });
        }
      }
    });

    // 4. Tumpukan Kontainer di Ujung Timur (Z: 2376 s/d 2413) pada masing-masing dari 5 baris
    const eastEndBays = [2377.5, 2384.3, 2391.1, 2397.9, 2404.7, 2411.5];
    eastEndBays.forEach((bz) => {
      for (let r = 0; r < rowsPerBlock; r++) {
        if (rand() < 0.22) continue;
        const rx = blockCenterX - ((rowsPerBlock - 1) * rowStepX) / 2 + r * rowStepX;
        const tiers = 1 + Math.floor(rand() * 3);
        const domCol = CONTAINER_PALETTE[Math.floor(rand() * CONTAINER_PALETTE.length)];

        for (let t = 0; t < tiers; t++) {
          containerInstances.push({
            x: rx,
            y: yPavement + contHeight / 2 + t * contHeight,
            z: bz,
            color: rand() < 0.78 ? domCol : CONTAINER_PALETTE[Math.floor(rand() * CONTAINER_PALETTE.length)]
          });
        }
      }
    });
  }

  // 5. Bercak Rumput Alami di Tengah Blok Selatan (Sesuai Gambar media_1793903757099_cecea1b9.png)
  [
    { x: -535.0, z: 2235.0, wX: 24.0, wZ: 45.0 },
    { x: -568.0, z: 2225.0, wX: 28.0, wZ: 68.0 },
    { x: -598.0, z: 2210.0, wX: 22.0, wZ: 52.0 },
    { x: -565.0, z: 2310.0, wX: 18.0, wZ: 36.0 }
  ].forEach((gp) => {
    const grassPatch = new THREE.Mesh(
      new THREE.PlaneGeometry(gp.wX, gp.wZ),
      weatheredGrassMat
    );
    grassPatch.rotation.x = -Math.PI / 2;
    grassPatch.position.set(gp.x, yPavement + 0.015, gp.z);
    southGroup.add(grassPatch);
  });

  // 6. Deretan Kontainer Tepi Bawah Selatan (X = -644.5, Z: 2058 s/d 2410)
  for (let z = 2060.0; z <= 2408.0; z += 8.5) {
    if (rand() < 0.28) continue;
    const tiers = 1 + Math.floor(rand() * 2);
    const col = CONTAINER_PALETTE[Math.floor(rand() * CONTAINER_PALETTE.length)];
    for (let t = 0; t < tiers; t++) {
      containerInstances.push({
        x: -644.5,
        y: yPavement + contHeight / 2 + t * contHeight,
        z,
        color: col
      });
    }
  }

  if (slotLinePositions.length > 0) {
    const lineGeo = new THREE.BufferGeometry();
    lineGeo.setAttribute('position', new THREE.Float32BufferAttribute(slotLinePositions, 3));
    lineGeo.computeVertexNormals();
    const lineMesh = new THREE.Mesh(lineGeo, whiteLineMat);
    southGroup.add(lineMesh);
  }

  southGroup.add(
    createInstancedContainerBlock(containerInstances, { orientedCrosswise: false })
  );

  return southGroup;
}
