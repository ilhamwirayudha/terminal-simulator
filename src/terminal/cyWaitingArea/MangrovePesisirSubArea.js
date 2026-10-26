import * as THREE from 'three';
import { CY_WAITING_BOUNDS } from './CyWaitingGeo.js';

/**
 * ==============================================================================
 * Sub-Area: Sabuk Hutan Mangrove & Pesisir Pantai (Gambar 2)
 * Sisi Barat Laut Container Yard (X: 136m s/d 185m+ | Z: 775m s/d 1034m)
 * Sesuai Citra Satelit Nyata (Gambar 2):
 * - Strip tanah cokelat / tanggul reklamasi di belakang TR 2 (X: 136m - 146m)
 * - Sabuk hutan bakau rapat pesisir (X: 146m - 172m)
 * - Zona lumpur pasang surut (mudflat) (X: 170m - 176m)
 * - Perairan estuari / laut di sisi terluar (X > 175m)
 * ==============================================================================
 */
export function createMangrovePesisirSubArea() {
  const coastalGroup = new THREE.Group();
  coastalGroup.name = 'subarea_cy_mangrove_pesisir';

  const yGround = 1.55;
  const yMud = 1.05;
  const yWater = 0.85;

  const { zMin, zMax } = CY_WAITING_BOUNDS;
  const lenZ = zMax - zMin;
  const midZ = (zMin + zMax) / 2;

  // ----------------------------------------------------------------------------
  // 1. Strip Tanah Cokelat / Tanggul Reklamasi di Belakang TR 2 (X: 136 - 146)
  // ----------------------------------------------------------------------------
  const soilMat = new THREE.MeshStandardMaterial({
    color: 0x8a6240, // Tanah cokelat urukan reklamasi
    roughness: 0.95,
    metalness: 0.05
  });

  const soilGeo = new THREE.PlaneGeometry(10.0, lenZ);
  const soilMesh = new THREE.Mesh(soilGeo, soilMat);
  soilMesh.rotation.x = -Math.PI / 2;
  soilMesh.position.set(141.0, yGround + 0.01, midZ);
  soilMesh.receiveShadow = true;
  coastalGroup.add(soilMesh);

  // ----------------------------------------------------------------------------
  // 2. Zona Lumpur Pasang Surut Pesisir (Mudflat Intertidal) (X: 146 - 176)
  // ----------------------------------------------------------------------------
  const mudMat = new THREE.MeshStandardMaterial({
    color: 0x333b32, // Lumpur pasang surut basah
    roughness: 0.96,
    metalness: 0.04
  });

  const mudGeo = new THREE.PlaneGeometry(30.0, lenZ + 10.0);
  const mudMesh = new THREE.Mesh(mudGeo, mudMat);
  mudMesh.rotation.x = -Math.PI / 2;
  mudMesh.position.set(161.0, yMud, midZ);
  mudMesh.receiveShadow = true;
  coastalGroup.add(mudMesh);

  // ----------------------------------------------------------------------------
  // 3. Permukaan Air Laut Tenang (Water Plane) (X: 175 - 230)
  // ----------------------------------------------------------------------------
  const waterMat = new THREE.MeshStandardMaterial({
    color: 0x476359, // Air muara kehijauan estuari Teluk Lamong
    roughness: 0.25,
    metalness: 0.45
  });

  const waterGeo = new THREE.PlaneGeometry(60.0, lenZ + 40.0);
  const waterMesh = new THREE.Mesh(waterGeo, waterMat);
  waterMesh.rotation.x = -Math.PI / 2;
  waterMesh.position.set(205.0, yWater, midZ);
  coastalGroup.add(waterMesh);

  // ----------------------------------------------------------------------------
  // 4. Sabuk Hutan Mangrove Rapat (InstancedMesh)
  // X: 146m s/d 172m, Z: 775m s/d 1034m
  // ----------------------------------------------------------------------------
  let seed = 543216789;
  const rand = () => {
    seed = (seed * 1664525 + 1013904223) % 4294967296;
    return seed / 4294967296;
  };

  const colDark = new THREE.Color(0x132a14);
  const colMedium = new THREE.Color(0x1a381c);
  const colInland = new THREE.Color(0x2d4f22);

  const treeInstances = [];

  const xStep = 3.2;
  const zStep = 3.6;

  for (let x = 146.5; x <= 171.5; x += xStep) {
    for (let z = zMin + 1.5; z <= zMax - 1.5; z += zStep) {
      // Jitter acak
      const jx = x + (rand() - 0.5) * xStep * 0.9;
      const jz = z + (rand() - 0.5) * zStep * 0.9;

      // Kerapatan tinggi (92%)
      if (rand() < 0.92) {
        const scale = 0.85 + rand() * 0.45;
        let color = colDark;
        if (x < 152) color = colInland;
        else if (rand() < 0.5) color = colMedium;

        treeInstances.push({
          x: jx,
          z: jz,
          scale,
          color,
          rotY: rand() * Math.PI * 2
        });
      }
    }
  }

  const count = treeInstances.length;
  if (count === 0) return coastalGroup;

  // Trunk Geometry
  const trunkGeo = new THREE.CylinderGeometry(0.2, 0.32, 2.5, 6);
  const trunkMat = new THREE.MeshStandardMaterial({ color: 0x33281e, roughness: 0.92 });
  const trunkMesh = new THREE.InstancedMesh(trunkGeo, trunkMat, count);
  trunkMesh.castShadow = true;

  // Crown Geometry (Kanopi Pipih Alami)
  const crownGeo = new THREE.DodecahedronGeometry(2.3, 1);
  const crownMat = new THREE.MeshStandardMaterial({
    roughness: 0.82,
    metalness: 0.04,
    flatShading: true
  });
  const crownMesh = new THREE.InstancedMesh(crownGeo, crownMat, count);
  crownMesh.castShadow = true;
  crownMesh.receiveShadow = true;

  const dummy = new THREE.Object3D();

  for (let i = 0; i < count; i++) {
    const t = treeInstances[i];
    const s = t.scale;

    // Batang pohon
    dummy.position.set(t.x, yGround + 1.25 * s, t.z);
    dummy.rotation.set(0, t.rotY, 0);
    dummy.scale.set(s, s, s);
    dummy.updateMatrix();
    trunkMesh.setMatrixAt(i, dummy.matrix);

    // Kanopi tajuk bakau
    dummy.position.set(t.x, yGround + 2.8 * s, t.z);
    dummy.rotation.set(0, t.rotY * 1.4, 0);
    dummy.scale.set(s * 1.15, s * 0.72, s * 1.15); // Pipih mendatar alami
    dummy.updateMatrix();
    crownMesh.setMatrixAt(i, dummy.matrix);
    crownMesh.setColorAt(i, t.color);
  }

  trunkMesh.instanceMatrix.needsUpdate = true;
  crownMesh.instanceMatrix.needsUpdate = true;
  if (crownMesh.instanceColor) crownMesh.instanceColor.needsUpdate = true;

  coastalGroup.add(trunkMesh);
  coastalGroup.add(crownMesh);

  return coastalGroup;
}
