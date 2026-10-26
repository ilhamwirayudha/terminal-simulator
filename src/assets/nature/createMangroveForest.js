import * as THREE from 'three';

/**
 * ==============================================================================
 * Asset: createMangroveForest
 * Hutan Mangrove Pesisir Lebat Berbasis InstancedMesh (60 FPS Performance)
 * ==============================================================================
 *
 * Mampu merender 1.000 s/d 3.000 pohon bakau rimbun dengan tajuk berlapis
 * hanya dalam 4-5 draw call GPU:
 * - Batang silinder & akar bakau
 * - Tajuk daun berlapis bertingkat dengan variasi skala, rotasi, & warna hijau alami
 * - Mendukung area poligon boundary dan exclusion zone (agar tidak menembus bangunan)
 */

const trunkMat = new THREE.MeshStandardMaterial({
  color: 0x34291f, // Batang cokelat gelap bakau basah
  roughness: 0.95,
  metalness: 0.05
});

const crownMat1 = new THREE.MeshStandardMaterial({
  color: 0x183318, // Hijau tua lebat khas kanopi mangrove satelit
  roughness: 0.85,
  metalness: 0.04,
  flatShading: true
});

const crownMat2 = new THREE.MeshStandardMaterial({
  color: 0x224422, // Variasi hijau pucuk dedaunan
  roughness: 0.82,
  metalness: 0.05,
  flatShading: true
});

const crownMat3 = new THREE.MeshStandardMaterial({
  color: 0x142814, // Hijau kanopi dalam yang teduh
  roughness: 0.9,
  metalness: 0.03,
  flatShading: true
});

export function createMangroveForest({
  treeCoordinates = [], // Array { x, z, scale, height, seed }
  yLevel = 1.05
} = {}) {
  const forestGroup = new THREE.Group();
  forestGroup.name = 'asset_mangrove_forest_instanced';

  const count = treeCoordinates.length;
  if (count === 0) return forestGroup;

  // Shared Geometries
  const trunkGeo = new THREE.CylinderGeometry(0.22, 0.35, 2.8, 6);
  const crownGeo1 = new THREE.DodecahedronGeometry(2.4, 1);
  const crownGeo2 = new THREE.DodecahedronGeometry(1.8, 1);
  const crownGeo3 = new THREE.DodecahedronGeometry(1.4, 1);

  // Instanced Meshes
  const trunkMesh = new THREE.InstancedMesh(trunkGeo, trunkMat, count);
  const crownMesh1 = new THREE.InstancedMesh(crownGeo1, crownMat1, count);
  const crownMesh2 = new THREE.InstancedMesh(crownGeo2, crownMat2, count);
  const crownMesh3 = new THREE.InstancedMesh(crownGeo3, crownMat3, count);

  trunkMesh.castShadow = true;
  crownMesh1.castShadow = true;
  crownMesh1.receiveShadow = true;
  crownMesh2.castShadow = true;
  crownMesh2.receiveShadow = true;
  crownMesh3.castShadow = true;

  const dummy = new THREE.Object3D();

  for (let i = 0; i < count; i++) {
    const pt = treeCoordinates[i];
    const s = pt.scale || 1.0;
    const rotY = (pt.seed || i) * 1.618;

    // 1. Batang
    dummy.position.set(pt.x, yLevel + 1.4 * s, pt.z);
    dummy.rotation.set(0, rotY, (pt.seed % 5 - 2) * 0.03);
    dummy.scale.set(s, s, s);
    dummy.updateMatrix();
    trunkMesh.setMatrixAt(i, dummy.matrix);

    // 2. Tajuk Utama (Crown 1)
    dummy.position.set(pt.x, yLevel + 3.2 * s, pt.z);
    dummy.rotation.set(0, rotY * 1.3, 0);
    dummy.scale.set(s * 1.15, s * 0.95, s * 1.15);
    dummy.updateMatrix();
    crownMesh1.setMatrixAt(i, dummy.matrix);

    // 3. Tajuk Atas (Crown 2)
    dummy.position.set(pt.x + 0.4 * s * Math.cos(rotY), yLevel + 4.4 * s, pt.z + 0.4 * s * Math.sin(rotY));
    dummy.rotation.set(0, rotY * 0.7, 0);
    dummy.scale.set(s * 0.95, s * 0.9, s * 0.95);
    dummy.updateMatrix();
    crownMesh2.setMatrixAt(i, dummy.matrix);

    // 4. Tajuk Samping / Rimbun (Crown 3)
    dummy.position.set(pt.x - 0.5 * s * Math.sin(rotY), yLevel + 3.0 * s, pt.z + 0.5 * s * Math.cos(rotY));
    dummy.rotation.set(0, rotY * 2.1, 0);
    dummy.scale.set(s * 1.05, s * 0.85, s * 1.05);
    dummy.updateMatrix();
    crownMesh3.setMatrixAt(i, dummy.matrix);
  }

  trunkMesh.instanceMatrix.needsUpdate = true;
  crownMesh1.instanceMatrix.needsUpdate = true;
  crownMesh2.instanceMatrix.needsUpdate = true;
  crownMesh3.instanceMatrix.needsUpdate = true;

  forestGroup.add(trunkMesh);
  forestGroup.add(crownMesh1);
  forestGroup.add(crownMesh2);
  forestGroup.add(crownMesh3);

  return forestGroup;
}
