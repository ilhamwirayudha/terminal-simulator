import * as THREE from 'three';
import {
  portRoadPavementMat,
  curbHazardWhiteMat,
  whiteLineMat,
  yellowLineMat
} from '../../../assets/materials/roadMaterials.js';
import {
  PASCA_FRAME,
  TREE_MEDIAN_CONFIG,
  CONTAINER_MEDIAN_CONFIG,
  getPascaRoadEdgesAtS
} from './GeoPascaGate.js';

/**
 * ==============================================================================
 * Sub-Area: Ruas Jalan Pasca Main Gate / Koridor CY (Z: 1699.0 s/d 2436.0)
 * ==============================================================================
 * 4 Lajur Inbound di sisi NW (X: +4.2 s/d +20.2)
 * 4 Lajur Outbound di sisi SE (X: -20.2 s/d -4.2)
 * Median berada tepat di tengah (X: -4.2 s/d +4.2)
 */
export function createSubAreaJalanPascaGate() {
  const roadGroup = new THREE.Group();
  roadGroup.name = 'subarea_jalan_pasca_gate';

  const { z0, sStart, sEnd, yRoad } = PASCA_FRAME;
  const totalLen = sEnd - sStart; // 737.0m
  const numSteps = 80;
  const stepLen = totalLen / numSteps;

  const positions = [];
  const normals = [];

  // 1. Mesh Perkerasan Aspal Jalan
  for (let i = 0; i < numSteps; i++) {
    const s1 = sStart + i * stepLen;
    const s2 = sStart + (i + 1) * stepLen;
    const edge1 = getPascaRoadEdgesAtS(s1);
    const edge2 = getPascaRoadEdgesAtS(s2);

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

  // 2. Kanstin Tepi Luar Jalan (NW & SE)
  for (let i = 0; i < numSteps; i++) {
    const s1 = sStart + i * stepLen;
    const s2 = sStart + (i + 1) * stepLen;
    const edge1 = getPascaRoadEdgesAtS(s1);
    const edge2 = getPascaRoadEdgesAtS(s2);
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

  // 3. Garis Putih Solid Tepi Luar Jalan (Mulai dari s=570 s/d s=1268)
  const straightLen = sEnd - 570.0;
  const straightMidZ = z0 + (570.0 + sEnd) / 2;

  [21.15, -21.15].forEach((xEdge) => {
    const outerLine = new THREE.Mesh(new THREE.PlaneGeometry(0.24, straightLen), whiteLineMat);
    outerLine.rotation.x = -Math.PI / 2;
    outerLine.position.set(xEdge, yRoad + 0.006, straightMidZ);
    roadGroup.add(outerLine);
  });

  // 4. Garis Kuning Tepi Median Pohon & Median Kontainer
  const addMedianBorderLines = (s1, s2, halfW) => {
    const len = s2 - s1;
    const midZ = z0 + (s1 + s2) / 2;
    [-halfW - 0.15, halfW + 0.15].forEach((xLine) => {
      const yLine = new THREE.Mesh(new THREE.PlaneGeometry(0.22, len), yellowLineMat);
      yLine.rotation.x = -Math.PI / 2;
      yLine.position.set(xLine, yRoad + 0.006, midZ);
      roadGroup.add(yLine);
    });
  };

  addMedianBorderLines(TREE_MEDIAN_CONFIG.sStart, TREE_MEDIAN_CONFIG.sEnd, TREE_MEDIAN_CONFIG.width / 2);
  addMedianBorderLines(CONTAINER_MEDIAN_CONFIG.sStart, CONTAINER_MEDIAN_CONFIG.sEnd, CONTAINER_MEDIAN_CONFIG.padWidth / 2);

  // 5. Marka Putus-putus Pembagian 4 Lajur Inbound & 4 Lajur Outbound
  const dashedPositions = [];
  const addDash = (lx, centerZ, len = 4.5, width = 0.2) => {
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

  // Inbound (NW: X in [5.4, 21.4] -> pembagi di 9.4, 13.4, 17.4)
  // Outbound (SE: X in [-21.4, -5.4] -> pembagi di -9.4, -13.4, -17.4)
  [9.4, 13.4, 17.4, -9.4, -13.4, -17.4].forEach((lx) => {
    for (let s = 540.0; s < sEnd - 8.0; s += 11.0) {
      // Lewati celah persimpangan utama agar bersih seperti citra satelit
      if (s >= 820.0 && s <= 895.0) continue;
      if (s >= 1212.0 && s <= 1255.0) continue;
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

  // 6. Panah Arah Sirkulasi Jalan (Forward +Z di NW, Reverse -Z di SE)
  const createArrowMesh = (pointsForward = true) => {
    const shape = new THREE.Shape();
    const stemW = 0.30, stemL = 2.8, headW = 1.1, headL = 1.6;
    if (pointsForward) {
      shape.moveTo(-stemW / 2, stemL);
      shape.lineTo(stemW / 2, stemL);
      shape.lineTo(stemW / 2, 0);
      shape.lineTo(headW / 2, 0);
      shape.lineTo(0, -headL);
      shape.lineTo(-headW / 2, 0);
      shape.lineTo(-stemW / 2, 0);
    } else {
      shape.moveTo(-stemW / 2, -stemL);
      shape.lineTo(stemW / 2, -stemL);
      shape.lineTo(stemW / 2, 0);
      shape.lineTo(headW / 2, 0);
      shape.lineTo(0, headL);
      shape.lineTo(-headW / 2, 0);
      shape.lineTo(-stemW / 2, 0);
    }
    shape.closePath();
    const mesh = new THREE.Mesh(new THREE.ShapeGeometry(shape), whiteLineMat);
    mesh.rotation.x = -Math.PI / 2;
    return mesh;
  };

  const arrowSList = [600, 680, 760, 860, 950, 1040, 1130, 1200];
  arrowSList.forEach((s) => {
    const zPos = z0 + s;
    // Panah Masuk (NW: Lajur tengah X = 11.4 & 15.4)
    [11.4, 15.4].forEach((lx) => {
      const arrIn = createArrowMesh(true);
      arrIn.position.set(lx, yRoad + 0.007, zPos);
      roadGroup.add(arrIn);
    });
    // Panah Keluar (SE: Lajur tengah X = -11.4 & -15.4)
    [-11.4, -15.4].forEach((lx) => {
      const arrOut = createArrowMesh(false);
      arrOut.position.set(lx, yRoad + 0.007, zPos);
      roadGroup.add(arrOut);
    });
  });

  return roadGroup;
}
