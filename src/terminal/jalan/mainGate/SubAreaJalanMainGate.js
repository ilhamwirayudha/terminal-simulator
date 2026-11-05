import * as THREE from 'three';
import {
  portRoadPavementMat,
  curbHazardWhiteMat,
  whiteLineMat,
  yellowLineMat
} from '../../../assets/materials/roadMaterials.js';
import { createMedianIsland } from '../../../assets/infrastructure/createMedianIsland.js';
import { FRAME, MEDIAN, getRoadEdgesAtS, MAIN_GATE_CONFIG } from './GeoMainGate.js';

/**
 * ==============================================================================
 * Sub-Area: Ruas Jalan Menuju Main Gate (Z: 1168.0 s/d 1699.0)
 * ==============================================================================
 * Menghubungkan ujung Pre-Gate (Z=1168) melintasi Main Gate (Z≈1613) hingga Z=1699.
 * Median tipis berakhir di belakang kanopi (s=455), lalu terbuka menyambut Median Pohon.
 */
export function createSubAreaJalanMainGate() {
  const roadGroup = new THREE.Group();
  roadGroup.name = 'subarea_jalan_main_gate';

  const { z0, totalLength, yRoad } = FRAME;
  const numSteps = 100;
  const stepLen = totalLength / numSteps;

  const positions = [];
  const normals = [];

  // 1. Mesh Perkerasan Aspal Jalan (Pavement Ribbon)
  for (let i = 0; i < numSteps; i++) {
    const s1 = i * stepLen;
    const s2 = (i + 1) * stepLen;
    const edge1 = getRoadEdgesAtS(s1);
    const edge2 = getRoadEdgesAtS(s2);

    positions.push(
      edge1.tNW, yRoad, edge1.z,
      edge2.tNW, yRoad, edge2.z,
      edge2.tSE, yRoad, edge2.z,

      edge1.tNW, yRoad, edge1.z,
      edge2.tSE, yRoad, edge2.z,
      edge1.tSE, yRoad, edge1.z
    );

    for (let k = 0; k < 6; k++) normals.push(0, 1, 0);
  }

  const roadGeo = new THREE.BufferGeometry();
  roadGeo.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
  roadGeo.setAttribute('normal', new THREE.Float32BufferAttribute(normals, 3));
  const roadMesh = new THREE.Mesh(roadGeo, portRoadPavementMat);
  roadMesh.receiveShadow = true;
  roadGroup.add(roadMesh);

  // 2. Kanstin Tepi Luar Jalan (Curbs: NW & SE)
  for (let i = 0; i < numSteps; i++) {
    const s1 = i * stepLen;
    const s2 = (i + 1) * stepLen;
    const edge1 = getRoadEdgesAtS(s1);
    const edge2 = getRoadEdgesAtS(s2);
    const dz = edge2.z - edge1.z;

    const dxNW = edge2.tNW - edge1.tNW;
    const lenNW = Math.hypot(dxNW, dz);
    const angleNW = Math.atan2(dxNW, dz);
    const curbNW = new THREE.Mesh(new THREE.BoxGeometry(0.35, 0.22, lenNW * 1.02), curbHazardWhiteMat);
    curbNW.position.set((edge1.tNW + edge2.tNW) / 2 + 0.15, yRoad + 0.11, (edge1.z + edge2.z) / 2);
    curbNW.rotation.y = angleNW;
    curbNW.castShadow = true;
    roadGroup.add(curbNW);

    const dxSE = edge2.tSE - edge1.tSE;
    const lenSE = Math.hypot(dxSE, dz);
    const angleSE = Math.atan2(dxSE, dz);
    const curbSE = new THREE.Mesh(new THREE.BoxGeometry(0.35, 0.22, lenSE * 1.02), curbHazardWhiteMat);
    curbSE.position.set((edge1.tSE + edge2.tSE) / 2 - 0.15, yRoad + 0.11, (edge1.z + edge2.z) / 2);
    curbSE.rotation.y = angleSE;
    curbSE.castShadow = true;
    roadGroup.add(curbSE);
  }

  // 3. Pulau Median Tengah (Berakhir di belakang kanopi: s = 0 s/d 455.0)
  const medLen = MEDIAN.sEnd;
  roadGroup.add(
    createMedianIsland({
      startZ: z0,
      endZ: z0 + medLen,
      centerX: 0,
      width: MEDIAN.width,
      y: yRoad
    })
  );

  // 4. Marka Garis Kuning Tepi Median (s = 0 s/d 455.0)
  [-1.4, 1.4].forEach((xLine) => {
    const medLine = new THREE.Mesh(
      new THREE.PlaneGeometry(0.22, medLen),
      yellowLineMat
    );
    medLine.rotation.x = -Math.PI / 2;
    medLine.position.set(xLine, yRoad + 0.006, z0 + medLen / 2);
    roadGroup.add(medLine);
  });

  // 5. Marka Putus-putus Pembagian Lajur
  const dashedPositions = [];
  const addDash = (lx, centerZ, len = 4.0, width = 0.2) => {
    const hw = width / 2;
    const hl = len / 2;
    const yP = yRoad + 0.006;
    dashedPositions.push(
      lx - hw, yP, centerZ - hl,
      lx + hw, yP, centerZ - hl,
      lx + hw, yP, centerZ + hl,

      lx - hw, yP, centerZ - hl,
      lx + hw, yP, centerZ + hl,
      lx - hw, yP, centerZ + hl
    );
  };

  // Segmen A: Awal (s: 0 s/d 220)
  [4.9, 8.5, 12.1, -4.9, -8.5].forEach((lx) => {
    for (let s = 10; s < 220; s += 10.0) {
      addDash(lx, z0 + s);
    }
  });

  // Segmen B: Pendekatan Gerbang (s: 350 s/d 425)
  [7.0, 13.0, 19.0, 25.0].forEach((lx) => {
    for (let s = 350; s < 425; s += 8.0) {
      addDash(lx, z0 + s);
    }
  });
  [-7.0, -13.0, -19.0, -25.0].forEach((lx) => {
    for (let s = 350; s < 425; s += 8.0) {
      addDash(lx, z0 + s);
    }
  });

  if (dashedPositions.length > 0) {
    const dashGeo = new THREE.BufferGeometry();
    dashGeo.setAttribute('position', new THREE.Float32BufferAttribute(dashedPositions, 3));
    dashGeo.computeVertexNormals();
    const dashMesh = new THREE.Mesh(dashGeo, whiteLineMat);
    roadGroup.add(dashMesh);
  }

  // 6. Zebra Cross di Depan Gerbang Masuk & Keluar
  const zebraZ = z0 + MAIN_GATE_CONFIG.sCenter - 12.0;
  for (let zOffset = -2.5; zOffset <= 2.5; zOffset += 1.0) {
    const stripeIn = new THREE.Mesh(new THREE.PlaneGeometry(23.0, 0.45), whiteLineMat);
    stripeIn.rotation.x = -Math.PI / 2;
    stripeIn.position.set(13.25, yRoad + 0.007, zebraZ + zOffset);
    roadGroup.add(stripeIn);

    const stripeOut = new THREE.Mesh(new THREE.PlaneGeometry(23.0, 0.45), whiteLineMat);
    stripeOut.rotation.x = -Math.PI / 2;
    stripeOut.position.set(-13.25, yRoad + 0.007, zebraZ + zOffset);
    roadGroup.add(stripeOut);
  }

  return roadGroup;
}
