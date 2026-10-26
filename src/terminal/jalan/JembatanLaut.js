import * as THREE from 'three';
import {
  bridgeConcreteMat,
  pierConcreteMat,
  asphaltMat,
  barrierMat,
  whiteLineMat,
  yellowLineMat,
  seawallMat
} from '../../assets/materials/roadMaterials.js';

/**
 * ==============================================================================
 * Area: Jalan - Sub: Jembatan Laut Melengkung 680 Meter (Z: -55 s/d +625)
 * Status: SUDAH 1:1 (Akurat dengan Ground Truth Apple Maps / WGS84)
 * ==============================================================================
 *
 * Jembatan Penghubung Laut Menghubungkan Daratan Osowilangun ke Terminal:
 * - Panjang: 680 meter (Z: -55 s/d +625)
 * - Lebar: 16.0 meter (4 lajur: 2 masuk, 2 keluar, bahu jalan & crash barrier)
 * - Kelengkungan Horizontal (Smooth S-curve sweep 4.8m melintasi selat)
 * - Kelengkungan Vertikal (Parabola arch clearance 6.8m untuk perahu nelayan)
 * - Box Girder ganda, tiang silinder laut dan pier cap setiap 25 meter
 */
export function createJembatanLaut() {
  const bridgeGroup = new THREE.Group();
  bridgeGroup.name = 'sub_jembatan_laut_melengkung';

  const bridgeStartZ = -55;
  const bridgeEndZ = 625;
  const bridgeLength = bridgeEndZ - bridgeStartZ; // 680m
  const bridgeWidth = 16.0;

  const yStart = 0.82; // Level jalan daratan di Z = -55
  const yEnd = 1.62;   // Level jalan terminal di Z = +625
  const archHeight = 6.8; // Lengkung parabola vertikal di tengah selat
  const sweepWidth = 4.8; // Lengkungan horizontal

  // 1. Fungsi Matematika Trajektori Lengkung Jembatan
  const getBridgePathPoint = (t) => {
    const z = bridgeStartZ + t * bridgeLength;
    const y_base = yStart + t * (yEnd - yStart);
    const y_arch = archHeight * 4.0 * t * (1.0 - t);
    const y = y_base + y_arch;
    const x = Math.sin(t * Math.PI) * sweepWidth;
    return new THREE.Vector3(x, y, z);
  };

  // 2. Sampling Frame Vektor (Frenet Frame)
  const numSteps = 136;
  const frames = [];
  const eps = 1e-4;
  for (let i = 0; i <= numSteps; i++) {
    const t = i / numSteps;
    const P = getBridgePathPoint(t);
    const P_prev = getBridgePathPoint(Math.max(0, t - eps));
    const P_next = getBridgePathPoint(Math.min(1, t + eps));
    const T = new THREE.Vector3().subVectors(P_next, P_prev).normalize();
    const N = new THREE.Vector3(-T.z, 0, T.x).normalize();
    const U = new THREE.Vector3().crossVectors(N, T).normalize();
    frames.push({ t, P, T, N, U });
  }

  // 3. Helper Pembuat Strip Geometri Melengkung (Curved Quad Ribbon)
  const createCurvedRibbon = (n1, n2, u1, u2, mat, receiveShadow = true, castShadow = false) => {
    const positions = [];
    const normals = [];

    for (let i = 0; i < numSteps; i++) {
      const fA = frames[i];
      const fB = frames[i + 1];

      const v1 = new THREE.Vector3().copy(fA.P).addScaledVector(fA.N, n1).addScaledVector(fA.U, u1);
      const v2 = new THREE.Vector3().copy(fA.P).addScaledVector(fA.N, n2).addScaledVector(fA.U, u2);
      const v3 = new THREE.Vector3().copy(fB.P).addScaledVector(fB.N, n2).addScaledVector(fB.U, u2);
      const v4 = new THREE.Vector3().copy(fB.P).addScaledVector(fB.N, n1).addScaledVector(fB.U, u1);

      positions.push(v1.x, v1.y, v1.z, v2.x, v2.y, v2.z, v3.x, v3.y, v3.z);
      positions.push(v1.x, v1.y, v1.z, v3.x, v3.y, v3.z, v4.x, v4.y, v4.z);

      const norm = new THREE.Vector3().crossVectors(
        new THREE.Vector3().subVectors(v2, v1),
        new THREE.Vector3().subVectors(v4, v1)
      ).normalize();

      normals.push(norm.x, norm.y, norm.z, norm.x, norm.y, norm.z, norm.x, norm.y, norm.z);
      normals.push(norm.x, norm.y, norm.z, norm.x, norm.y, norm.z, norm.x, norm.y, norm.z);
    }

    const geo = new THREE.BufferGeometry();
    geo.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
    geo.setAttribute('normal', new THREE.Float32BufferAttribute(normals, 3));
    const mesh = new THREE.Mesh(geo, mat);
    mesh.receiveShadow = receiveShadow;
    mesh.castShadow = castShadow;
    bridgeGroup.add(mesh);
    return mesh;
  };

  // Gelagar Beton Box Girder Jembatan
  createCurvedRibbon(-8.0, 8.0, 0.0, 0.0, bridgeConcreteMat, true, true);
  createCurvedRibbon(-8.0, 8.0, -1.2, -1.2, bridgeConcreteMat, true, false);
  createCurvedRibbon(-8.0, -8.0, 0.0, -1.2, bridgeConcreteMat, true, true);
  createCurvedRibbon(8.0, 8.0, -1.2, 0.0, bridgeConcreteMat, true, true);

  // Aspal Permukaan Jembatan
  createCurvedRibbon(-7.8, 7.8, 0.015, 0.015, asphaltMat, true, false);

  // Concrete Crash Barriers Kedua Sisi
  createCurvedRibbon(-7.9, -7.4, 0.9, 0.9, barrierMat, true, true);
  createCurvedRibbon(-7.9, -7.9, 0.9, 0.0, barrierMat, true, true);
  createCurvedRibbon(-7.4, -7.4, 0.0, 0.9, barrierMat, true, true);
  createCurvedRibbon(7.4, 7.9, 0.9, 0.9, barrierMat, true, true);
  createCurvedRibbon(7.4, 7.4, 0.9, 0.0, barrierMat, true, true);
  createCurvedRibbon(7.9, 7.9, 0.0, 0.9, barrierMat, true, true);

  // Marka Tepi Putih
  [-7.35, 7.35].forEach((lx) => {
    createCurvedRibbon(lx - 0.1, lx + 0.1, 0.022, 0.022, whiteLineMat, false, false);
  });

  // Marka Kuning Tengah
  [-0.12, 0.12].forEach((lx) => {
    createCurvedRibbon(lx - 0.06, lx + 0.06, 0.022, 0.022, yellowLineMat, false, false);
  });

  // Marka Putus-Putus Lajur Jembatan
  [-3.7, 3.7].forEach((lx) => {
    const dashL = 4.5;
    const gapL = 4.5;
    const cycle = dashL + gapL;
    for (let d = 5; d < bridgeLength - 5; d += cycle) {
      const tA = d / bridgeLength;
      const tB = Math.min(1.0, (d + dashL) / bridgeLength);
      const fA = {
        P: getBridgePathPoint(tA),
        N: new THREE.Vector3(
          -getBridgePathPoint(tA + 0.001).z + getBridgePathPoint(tA - 0.001).z,
          0,
          getBridgePathPoint(tA + 0.001).x - getBridgePathPoint(tA - 0.001).x
        ).normalize(),
        U: new THREE.Vector3(0, 1, 0)
      };
      const fB = {
        P: getBridgePathPoint(tB),
        N: new THREE.Vector3(
          -getBridgePathPoint(tB + 0.001).z + getBridgePathPoint(tB - 0.001).z,
          0,
          getBridgePathPoint(tB + 0.001).x - getBridgePathPoint(tB - 0.001).x
        ).normalize(),
        U: new THREE.Vector3(0, 1, 0)
      };
      const v1 = new THREE.Vector3().copy(fA.P).addScaledVector(fA.N, lx - 0.09).addScaledVector(fA.U, 0.022);
      const v2 = new THREE.Vector3().copy(fA.P).addScaledVector(fA.N, lx + 0.09).addScaledVector(fA.U, 0.022);
      const v3 = new THREE.Vector3().copy(fB.P).addScaledVector(fB.N, lx + 0.09).addScaledVector(fB.U, 0.022);
      const v4 = new THREE.Vector3().copy(fB.P).addScaledVector(fB.N, lx - 0.09).addScaledVector(fB.U, 0.022);

      const dPos = [v1.x, v1.y, v1.z, v2.x, v2.y, v2.z, v3.x, v3.y, v3.z, v1.x, v1.y, v1.z, v3.x, v3.y, v3.z, v4.x, v4.y, v4.z];
      const dGeo = new THREE.BufferGeometry();
      dGeo.setAttribute('position', new THREE.Float32BufferAttribute(dPos, 3));
      dGeo.computeVertexNormals();
      const dMesh = new THREE.Mesh(dGeo, whiteLineMat);
      bridgeGroup.add(dMesh);
    }
  });

  // Pilar Beton & Crossbeam Setiap 25 Meter
  for (let z = bridgeStartZ + 25; z < bridgeEndZ - 15; z += 25) {
    const t = (z - bridgeStartZ) / bridgeLength;
    const f = frames[Math.min(frames.length - 1, Math.round(t * numSteps))];

    const crossBeam = new THREE.Mesh(new THREE.BoxGeometry(bridgeWidth - 2.0, 1.4, 3.2), pierConcreteMat);
    crossBeam.position.copy(f.P).addScaledVector(f.U, -1.3);
    crossBeam.rotation.y = Math.atan2(f.T.x, f.T.z);
    crossBeam.castShadow = true;
    bridgeGroup.add(crossBeam);

    [-4.5, 4.5].forEach((px) => {
      const colTopY = f.P.y - 1.3;
      const colHeight = colTopY + 4.5;
      const column = new THREE.Mesh(new THREE.CylinderGeometry(1.0, 1.2, colHeight, 12), pierConcreteMat);
      const colPos = new THREE.Vector3().copy(f.P).addScaledVector(f.N, px);
      colPos.y = colTopY - colHeight / 2;
      column.position.copy(colPos);
      column.castShadow = true;
      bridgeGroup.add(column);

      const collar = new THREE.Mesh(new THREE.BoxGeometry(3.0, 1.0, 3.0), pierConcreteMat);
      collar.position.set(colPos.x, -0.4, colPos.z);
      bridgeGroup.add(collar);
    });
  }

  // Hamparan Permukaan Air Laut Teluk
  const seaWaterMat = new THREE.MeshStandardMaterial({
    color: 0x6e7d73,
    roughness: 0.28,
    metalness: 0.18,
    transparent: true,
    opacity: 0.94
  });
  const seaWater = new THREE.Mesh(new THREE.PlaneGeometry(3600, 3600), seaWaterMat);
  seaWater.rotation.x = -Math.PI / 2;
  seaWater.position.set(0, 0.0, 1150);
  seaWater.receiveShadow = true;
  bridgeGroup.add(seaWater);

  return bridgeGroup;
}
