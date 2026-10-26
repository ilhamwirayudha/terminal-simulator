import * as THREE from 'three';

/**
 * ==============================================================================
 * Reusable Asset: Pohon Median Peneduh Jalan (Median Parkway Tree)
 * ==============================================================================
 * Model pohon tropis peneduh pelabuhan dengan kanopi daun rimbun dan batang kokoh,
 * dirancang efisien dan reusable untuk barisan median jalan.
 */

// Shared Materials untuk Pohon agar efisien di GPU VRAM
const trunkMat = new THREE.MeshStandardMaterial({
  color: 0x3d2817, // Brown bark
  roughness: 0.9,
  metalness: 0.05,
  name: 'mat_tree_trunk'
});

const foliageMatPrimary = new THREE.MeshStandardMaterial({
  color: 0x2d5a27, // Natural lush green
  roughness: 0.8,
  metalness: 0.1,
  name: 'mat_tree_foliage_primary'
});

const foliageMatSecondary = new THREE.MeshStandardMaterial({
  color: 0x3d7035, // Slightly brighter highlight green
  roughness: 0.75,
  metalness: 0.05,
  name: 'mat_tree_foliage_secondary'
});

// Shared Geometries
const trunkGeo = new THREE.CylinderGeometry(0.22, 0.32, 2.6, 8);
const canopyBaseGeo = new THREE.DodecahedronGeometry(1.6, 1);
const canopyTopGeo = new THREE.DodecahedronGeometry(1.2, 1);

export function createMedianTree({
  scale = 1.0,
  rotationY = 0
} = {}) {
  const treeGroup = new THREE.Group();
  treeGroup.name = 'asset_median_tree';

  // 1. Batang Pohon
  const trunk = new THREE.Mesh(trunkGeo, trunkMat);
  trunk.position.y = 1.3;
  trunk.castShadow = true;
  trunk.receiveShadow = true;
  treeGroup.add(trunk);

  // 2. Kanopi Daun Bawah (Rimbun)
  const canopyBase = new THREE.Mesh(canopyBaseGeo, foliageMatPrimary);
  canopyBase.position.y = 3.0;
  canopyBase.scale.set(1.3, 0.9, 1.3);
  canopyBase.castShadow = true;
  canopyBase.receiveShadow = true;
  treeGroup.add(canopyBase);

  // 3. Kanopi Daun Atas (Pucuk/Highlight)
  const canopyTop = new THREE.Mesh(canopyTopGeo, foliageMatSecondary);
  canopyTop.position.y = 4.1;
  canopyTop.scale.set(1.0, 1.1, 1.0);
  canopyTop.castShadow = true;
  treeGroup.add(canopyTop);

  if (scale !== 1.0) {
    treeGroup.scale.setScalar(scale);
  }
  if (rotationY !== 0) {
    treeGroup.rotation.y = rotationY;
  }

  return treeGroup;
}
