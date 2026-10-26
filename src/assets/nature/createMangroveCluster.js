import * as THREE from 'three';

/**
 * ==============================================================================
 * Asset: createMangroveCluster
 * Rumpun Pohon Bakau Pesisir (Rhizophora Mucronata)
 * ==============================================================================
 *
 * Membentuk klaster pohon mangrove pesisir rimbun yang dioptimasi untuk kinerja tinggi:
 * - Batang utama & akar tunjang khas mangrove (stilt roots)
 * - Kanopi tajuk berlapis bertingkat dengan variasi warna hijau gelap alami
 * - Menghasilkan kesan hutan bakau lebat di sepanjang garis pantai teluk
 */

// Shared Materials untuk efisiensi memori WebGL
const mangroveTrunkMat = new THREE.MeshStandardMaterial({
  color: 0x3d3023, // Cokelat gelap batang bakau berlumpur
  roughness: 0.95,
  metalness: 0.05
});

const mangroveRootMat = new THREE.MeshStandardMaterial({
  color: 0x2e241b,
  roughness: 0.98,
  metalness: 0.02
});

const mangroveFoliageMat1 = new THREE.MeshStandardMaterial({
  color: 0x1c381c, // Hijau tua lebat khas mangrove pesisir
  roughness: 0.85,
  metalness: 0.05,
  flatShading: true
});

const mangroveFoliageMat2 = new THREE.MeshStandardMaterial({
  color: 0x244823, // Variasi hijau daun pucuk
  roughness: 0.8,
  metalness: 0.05,
  flatShading: true
});

const mangroveFoliageMat3 = new THREE.MeshStandardMaterial({
  color: 0x172e18, // Hijau kanopi dalam yang teduh
  roughness: 0.9,
  metalness: 0.05,
  flatShading: true
});

// Shared Geometries
const trunkGeo = new THREE.CylinderGeometry(0.18, 0.28, 2.8, 6);
const rootGeo = new THREE.CylinderGeometry(0.06, 0.12, 2.2, 5);
const crownGeo1 = new THREE.DodecahedronGeometry(1.9, 1);
const crownGeo2 = new THREE.DodecahedronGeometry(1.4, 1);
const crownGeo3 = new THREE.DodecahedronGeometry(1.1, 1);

export function createMangroveTree({ height = 4.8, radius = 2.4, seed = 0 } = {}) {
  const treeGroup = new THREE.Group();
  treeGroup.name = 'mangrove_tree';

  // 1. Batang Utama
  const trunk = new THREE.Mesh(trunkGeo, mangroveTrunkMat);
  trunk.position.y = 1.4;
  trunk.castShadow = true;
  treeGroup.add(trunk);

  // 2. Akar Tunjang (Stilt Roots) khas bakau menancap ke lumpur
  const numRoots = 5;
  for (let i = 0; i < numRoots; i++) {
    const angle = (i / numRoots) * Math.PI * 2 + (seed * 0.7);
    const root = new THREE.Mesh(rootGeo, mangroveRootMat);
    const dist = 0.65;
    root.position.set(Math.cos(angle) * dist, 0.9, Math.sin(angle) * dist);
    root.rotation.z = Math.cos(angle) * 0.45;
    root.rotation.x = -Math.sin(angle) * 0.45;
    root.castShadow = true;
    treeGroup.add(root);
  }

  // 3. Kanopi Tajuk Dedaunan Bertingkat
  const crown1 = new THREE.Mesh(crownGeo1, seed % 2 === 0 ? mangroveFoliageMat1 : mangroveFoliageMat2);
  crown1.position.set(0, 3.2, 0);
  crown1.scale.set(radius / 2.0, 1.0, radius / 2.0);
  crown1.castShadow = true;
  crown1.receiveShadow = true;
  treeGroup.add(crown1);

  const crown2 = new THREE.Mesh(crownGeo2, seed % 3 === 0 ? mangroveFoliageMat3 : mangroveFoliageMat1);
  crown2.position.set(0.35 * Math.cos(seed), 4.2, 0.35 * Math.sin(seed));
  crown2.scale.set(0.9, 0.85, 0.9);
  crown2.castShadow = true;
  treeGroup.add(crown2);

  const crown3 = new THREE.Mesh(crownGeo3, mangroveFoliageMat2);
  crown3.position.set(-0.4 * Math.sin(seed), 2.9, 0.4 * Math.cos(seed));
  crown3.castShadow = true;
  treeGroup.add(crown3);

  const scale = height / 4.8;
  treeGroup.scale.set(scale, scale, scale);

  return treeGroup;
}

export function createMangroveCluster({ count = 8, spreadX = 14, spreadZ = 14 } = {}) {
  const clusterGroup = new THREE.Group();
  clusterGroup.name = 'mangrove_cluster';

  for (let i = 0; i < count; i++) {
    const angle = (i / count) * Math.PI * 2;
    const r = Math.sqrt((i + 1) / count) * (Math.min(spreadX, spreadZ) / 2);
    const x = Math.cos(angle * 1.6) * r + (Math.sin(i * 3.7) * 1.5);
    const z = Math.sin(angle * 1.6) * r + (Math.cos(i * 2.1) * 1.5);
    const h = 4.2 + (Math.sin(i * 5.1) * 0.9);

    const tree = createMangroveTree({ height: h, radius: 2.2 + (i % 3) * 0.3, seed: i });
    tree.position.set(x, 0, z);
    clusterGroup.add(tree);
  }

  return clusterGroup;
}
