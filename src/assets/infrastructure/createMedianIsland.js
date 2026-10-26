import * as THREE from 'three';
import {
  curbConcreteGreyMat,
  curbHazardWhiteMat,
  curbHazardBlackMat,
  medianGrassMat,
  yellowLineMat
} from '../materials/roadMaterials.js';

/**
 * Reusable Asset: Raised Median Island with Curbs & Bullnose Heads
 * @param {Object} options
 * @param {number} options.startZ - Starting Z position
 * @param {number} options.endZ - Ending Z position
 * @param {number} options.centerX - Center X position (default: 0)
 * @param {number} options.width - Width of median (default: 2.6)
 * @param {number} options.y - Base road elevation (default: 1.63)
 * @returns {THREE.Group}
 */
export function createMedianIsland({
  startZ,
  endZ,
  centerX = 0,
  width = 2.6,
  y = 1.63
}) {
  const medGroup = new THREE.Group();
  medGroup.name = `median_island_${startZ}_${endZ}`;

  const radius = width / 2;
  const bodyStartZ = startZ + radius;
  const bodyEndZ = endZ - radius;
  const bodyLen = Math.max(bodyEndZ - bodyStartZ, 0.5);
  const centerZ = (startZ + endZ) / 2;

  // 1. Sisi Kanstin Kiri & Kanan
  [-radius + 0.12, radius - 0.12].forEach((kx) => {
    const curbSide = new THREE.Mesh(
      new THREE.BoxGeometry(0.24, 0.22, bodyLen),
      curbConcreteGreyMat
    );
    curbSide.position.set(centerX + kx, y + 0.11, (bodyStartZ + bodyEndZ) / 2);
    curbSide.castShadow = true;
    curbSide.receiveShadow = true;
    medGroup.add(curbSide);
  });

  // 2. Hamparan Rumput Tengah
  const groundFill = new THREE.Mesh(
    new THREE.PlaneGeometry(width - 0.44, bodyLen),
    medianGrassMat
  );
  groundFill.rotation.x = -Math.PI / 2;
  groundFill.position.set(centerX, y + 0.115, (bodyStartZ + bodyEndZ) / 2);
  groundFill.receiveShadow = true;
  medGroup.add(groundFill);

  // 3. Ujung Lengkung Bullnose (Hitam-Putih Hazard)
  const addBullnoseHead = (bz, isForward) => {
    const bnSegs = 8;
    const startAng = isForward ? 0 : Math.PI;
    const endAng = isForward ? Math.PI : Math.PI * 2;

    for (let s = 0; s < bnSegs; s++) {
      const a1 = startAng + (s / bnSegs) * (endAng - startAng);
      const a2 = startAng + ((s + 1) / bnSegs) * (endAng - startAng);
      const amid = (a1 + a2) / 2;
      const slen = radius * (Math.PI / bnSegs);
      const isWhite = s % 2 === 0;
      const cBlock = new THREE.Mesh(
        new THREE.BoxGeometry(0.24, 0.22, slen * 1.05),
        isWhite ? curbHazardWhiteMat : curbHazardBlackMat
      );
      cBlock.position.set(
        centerX + Math.cos(amid) * (radius - 0.12),
        y + 0.11,
        bz + Math.sin(amid) * (radius - 0.12)
      );
      cBlock.rotation.y = -amid + Math.PI / 2;
      cBlock.castShadow = true;
      cBlock.receiveShadow = true;
      medGroup.add(cBlock);
    }
  };

  addBullnoseHead(bodyStartZ, false);
  addBullnoseHead(bodyEndZ, true);

  // 4. Marka Garis Kuning Tepi Median
  [-radius - 0.1, radius + 0.1].forEach((lx) => {
    const yLine = new THREE.Mesh(
      new THREE.PlaneGeometry(0.18, endZ - startZ),
      yellowLineMat
    );
    yLine.rotation.x = -Math.PI / 2;
    yLine.position.set(centerX + lx, y + 0.007, centerZ);
    medGroup.add(yLine);
  });

  return medGroup;
}
