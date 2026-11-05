import * as THREE from 'three';

/**
 * ==============================================================================
 * Reusable Asset: Sabuk Pepohonan Tepi Jalan (Instanced Roadside Tree Band)
 * ==============================================================================
 */

const trunkMat = new THREE.MeshStandardMaterial({
  color: 0x2b1d12,
  roughness: 0.95
});

const foliageMat = new THREE.MeshStandardMaterial({
  roughness: 0.85,
  metalness: 0.05
});

const foliageColors = [
  new THREE.Color(0x1e3a1e),
  new THREE.Color(0x2d4f22),
  new THREE.Color(0x23441e),
  new THREE.Color(0x183318),
  new THREE.Color(0x365e2b)
];

export function createRoadsideTreeBand(treePoints = [], yGround = 1.631) {
  const group = new THREE.Group();
  group.name = 'asset_roadside_tree_band';

  if (!treePoints || treePoints.length === 0) return group;

  const count = treePoints.length;
  const trunkGeo = new THREE.CylinderGeometry(0.22, 0.42, 3.2, 7);
  const foliageGeo = new THREE.DodecahedronGeometry(2.4, 1);

  const trunkInst = new THREE.InstancedMesh(trunkGeo, trunkMat, count);
  const foliageInst = new THREE.InstancedMesh(foliageGeo, foliageMat, count);
  trunkInst.castShadow = true;
  foliageInst.castShadow = true;

  const dummy = new THREE.Object3D();

  let seed = 987654321;
  const rand = () => {
    seed = (seed * 1664525 + 1013904223) % 4294967296;
    return seed / 4294967296;
  };

  treePoints.forEach((pt, i) => {
    const scale = pt.scale || (0.85 + rand() * 0.35);
    const rot = rand() * Math.PI * 2;
    const col = pt.color || foliageColors[Math.floor(rand() * foliageColors.length)];

    // Trunk
    dummy.position.set(pt.x, yGround + (1.6 * scale), pt.z);
    dummy.scale.set(scale, scale, scale);
    dummy.rotation.set(0, rot, 0);
    dummy.updateMatrix();
    trunkInst.setMatrixAt(i, dummy.matrix);

    // Foliage
    dummy.position.set(pt.x, yGround + (3.6 * scale), pt.z);
    dummy.updateMatrix();
    foliageInst.setMatrixAt(i, dummy.matrix);
    foliageInst.setColorAt(i, col);
  });

  trunkInst.instanceMatrix.needsUpdate = true;
  foliageInst.instanceMatrix.needsUpdate = true;
  if (foliageInst.instanceColor) foliageInst.instanceColor.needsUpdate = true;

  group.add(trunkInst);
  group.add(foliageInst);

  return group;
}
