import * as THREE from 'three';

/**
 * ==============================================================================
 * Reusable Asset: Kontainer Standar ISO 20ft & 40ft (Standard Shipping Container)
 * Standar tunggal proyek berdasarkan ukuran di waitingCY/SubAreaBlokTR.js
 * ==============================================================================
 */

export const CONTAINER_SPECS = {
  TEU_20FT: {
    width: 2.44,  // Lebar standar ISO (m)
    height: 2.59, // Tinggi standar ISO (m)
    length: 6.06  // Panjang standar 20ft (m)
  },
  FEU_40FT: {
    width: 2.44,
    height: 2.59,
    length: 12.19
  }
};

export const CONTAINER_PALETTE = [
  new THREE.Color(0x991b1b), // Merah bata / CMA CGM / Maersk
  new THREE.Color(0xb91c1c), // Merah marun
  new THREE.Color(0xc2410c), // Oranye Hapag-Lloyd
  new THREE.Color(0x1e3a8a), // Biru tua samudra
  new THREE.Color(0x2563eb), // Biru Pelindo
  new THREE.Color(0x0284c7), // Biru laut cerah
  new THREE.Color(0x166534), // Hijau tua Evergreen
  new THREE.Color(0x047857), // Hijau zamrud
  new THREE.Color(0x0d9488), // Hijau tosca
  new THREE.Color(0xf8fafc), // Putih reefer
  new THREE.Color(0xe2e8f0), // Abu-abu terang
  new THREE.Color(0x94a3b8), // Abu-abu baja
  new THREE.Color(0x475569)  // Abu-abu gelap industri
];

const sharedContainerMat = new THREE.MeshStandardMaterial({
  roughness: 0.58,
  metalness: 0.32,
  name: 'mat_iso_container_shared'
});

/**
 * Membuat 1 unit mesh kontainer (untuk penempatan tunggal)
 */
export function createContainer({
  type = '20ft',
  color = 0x0284c7,
  orientedCrosswise = false // true = panjang 6.06m menghadap sumbu X (NW-SE)
} = {}) {
  const spec = type === '40ft' ? CONTAINER_SPECS.FEU_40FT : CONTAINER_SPECS.TEU_20FT;
  const dimX = orientedCrosswise ? spec.length : spec.width;
  const dimY = spec.height;
  const dimZ = orientedCrosswise ? spec.width : spec.length;

  const geo = new THREE.BoxGeometry(dimX * 0.98, dimY * 0.98, dimZ * 0.98);
  const mat = sharedContainerMat.clone();
  mat.color.set(color);

  const mesh = new THREE.Mesh(geo, mat);
  mesh.castShadow = true;
  mesh.receiveShadow = true;
  mesh.name = `asset_container_${type}`;
  return mesh;
}

/**
 * Membuat kumpulan kontainer secara efisien dengan THREE.InstancedMesh (1 Draw Call)
 * @param {Array<{x: number, y: number, z: number, color: THREE.Color, rotationY?: number}>} instances
 * @param {Object} options
 * @param {boolean} [options.orientedCrosswise=true] - true jika panjang 6.06m melintang sumbu X (NW-SE)
 */
export function createInstancedContainerBlock(instances = [], { orientedCrosswise = true } = {}) {
  const group = new THREE.Group();
  group.name = 'asset_instanced_container_block';

  if (!instances || instances.length === 0) return group;

  const spec = CONTAINER_SPECS.TEU_20FT;
  const dimX = orientedCrosswise ? spec.length : spec.width;
  const dimY = spec.height;
  const dimZ = orientedCrosswise ? spec.width : spec.length;

  const contGeo = new THREE.BoxGeometry(dimX * 0.98, dimY * 0.98, dimZ * 0.98);
  const contMesh = new THREE.InstancedMesh(contGeo, sharedContainerMat, instances.length);
  contMesh.castShadow = true;
  contMesh.receiveShadow = true;

  const dummy = new THREE.Object3D();
  for (let i = 0; i < instances.length; i++) {
    const item = instances[i];
    dummy.position.set(item.x, item.y, item.z);
    dummy.rotation.set(0, item.rotationY || 0, 0);
    dummy.scale.set(1, 1, 1);
    dummy.updateMatrix();

    contMesh.setMatrixAt(i, dummy.matrix);
    contMesh.setColorAt(i, item.color || CONTAINER_PALETTE[0]);
  }

  contMesh.instanceMatrix.needsUpdate = true;
  if (contMesh.instanceColor) contMesh.instanceColor.needsUpdate = true;

  group.add(contMesh);
  return group;
}
