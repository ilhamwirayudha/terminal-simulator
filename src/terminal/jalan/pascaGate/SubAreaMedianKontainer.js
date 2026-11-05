import * as THREE from 'three';
import {
  curbConcreteGreyMat,
  curbHazardWhiteMat
} from '../../../assets/materials/roadMaterials.js';
import {
  CONTAINER_SPECS,
  CONTAINER_PALETTE,
  createInstancedContainerBlock
} from '../../../assets/containers/createContainer.js';
import { PASCA_FRAME, CONTAINER_MEDIAN_CONFIG } from './GeoPascaGate.js';

/**
 * ==============================================================================
 * Sub-Area: Median Kontainer Pasca Gate (s: 906.0 s/d 1208.0, Panjang 302m)
 * ==============================================================================
 * Koordinat GPS: -7.195158, 112.677019 s/d -7.193284, 112.678982
 * Median tepat di tengah koridor (X = 0.0, Lebar 8.4m), berisi tumpukan kontainer
 * 20ft melintang (menghadap NW-SE) dengan tinggi acak 1 s/d 4 tier.
 */
export function createSubAreaMedianKontainer() {
  const contMedGroup = new THREE.Group();
  contMedGroup.name = 'subarea_median_kontainer_pasca_gate';

  const { z0, yRoad } = PASCA_FRAME;
  const { sStart, sEnd, centerX, padWidth, maxTiers } = CONTAINER_MEDIAN_CONFIG;

  const startZ = z0 + sStart;
  const endZ = z0 + sEnd;
  const totalLen = endZ - startZ; // 302.0m
  const midZ = (startZ + endZ) / 2;
  const padHeight = 0.22;

  // 1. Alas Beton Median (Concrete Container Pad & Curbs)
  const padMesh = new THREE.Mesh(
    new THREE.BoxGeometry(padWidth - 0.5, padHeight, totalLen),
    curbConcreteGreyMat
  );
  padMesh.position.set(centerX, yRoad + padHeight / 2, midZ);
  padMesh.receiveShadow = true;
  padMesh.castShadow = true;
  contMedGroup.add(padMesh);

  // Kanstin Tepi Kiri & Kanan Alas Kontainer
  [-padWidth / 2 + 0.15, padWidth / 2 - 0.15].forEach((kx) => {
    const sideCurb = new THREE.Mesh(
      new THREE.BoxGeometry(0.30, padHeight + 0.04, totalLen),
      curbHazardWhiteMat
    );
    sideCurb.position.set(centerX + kx, yRoad + (padHeight + 0.04) / 2, midZ);
    sideCurb.castShadow = true;
    contMedGroup.add(sideCurb);
  });

  // 2. Susunan Tumpukan Kontainer 20ft (4 Bay berjajar NW-SE x Row mengikuti panjang median, 1-4 Tier)
  // Mengikuti orientasi SubAreaBlokTR.js: lebar 2.44m di sumbu X (NW-SE), panjang 6.06m di sumbu Z (SW-NE)
  const spec = CONTAINER_SPECS.TEU_20FT;
  const contWidthX = spec.width;   // 2.44m (searah X / NW-SE)
  const contHeight = spec.height;  // 2.59m (searah Y / Tier)
  const contLengthZ = spec.length; // 6.06m (searah Z / SW-NE)
  const yBase = yRoad + padHeight;

  let seed = 246813579;
  const rand = () => {
    seed = (seed * 1664525 + 1013904223) % 4294967296;
    return seed / 4294967296;
  };

  const instances = [];

  // 4 Bay berjajar di sumbu X (NW-SE) tepat di tengah median
  const numBaysX = 4;
  const baySpacingX = 2.56; // 2.44m + 0.12m celah antar bay
  const startX = centerX - ((numBaysX - 1) * baySpacingX) / 2;

  // Row mengikuti panjang median 302m di sumbu Z
  const rowStepZ = contLengthZ + 0.44; // 6.06m + 0.44m celah antar kontainer = 6.50m
  const marginZ = 3.0;
  const usableLenZ = totalLen - marginZ * 2;
  const numRowsZ = Math.floor(usableLenZ / rowStepZ); // ~45 row sepanjang median

  for (let b = 0; b < numBaysX; b++) {
    const px = startX + b * baySpacingX;

    for (let r = 0; r < numRowsZ; r++) {
      const pz = startZ + marginZ + contLengthZ / 2 + r * rowStepZ;

      // Tinggi tumpukan acak 1 s/d 4 tier
      const rVal = rand();
      let tiers = 1;
      if (rVal > 0.72) {
        tiers = Math.min(maxTiers, 4);
      } else if (rVal > 0.42) {
        tiers = 3;
      } else if (rVal > 0.15) {
        tiers = 2;
      } else {
        tiers = 1;
      }

      const dominantColor = CONTAINER_PALETTE[Math.floor(rand() * CONTAINER_PALETTE.length)];

      for (let t = 0; t < tiers; t++) {
        const py = yBase + contHeight / 2 + t * contHeight;
        const col = rand() < 0.72 ? dominantColor : CONTAINER_PALETTE[Math.floor(rand() * CONTAINER_PALETTE.length)];

        instances.push({
          x: px,
          y: py,
          z: pz,
          color: col
        });
      }
    }
  }

  // Render dengan 1 Draw Call InstancedMesh (orientedCrosswise: false -> sama dengan waitingCY/SubAreaBlokTR.js)
  const instancedBlock = createInstancedContainerBlock(instances, { orientedCrosswise: false });
  contMedGroup.add(instancedBlock);

  return contMedGroup;
}
