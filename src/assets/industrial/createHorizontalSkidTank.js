import * as THREE from 'three';

/**
 * ==============================================================================
 * Asset: createHorizontalSkidTank
 * Tangki Silinder Horizontal Skid Industri IPAL / Utilitas
 * ==============================================================================
 *
 * Sesuai foto satelit (tampak 2 tangki/skid horizontal perak/putih di yard IPAL):
 * - Bejana silinder horizontal dengan ujung cembung (dished heads)
 * - Rangka penopang sadel baja (dual saddle cradle) di atas balok skid H-beam
 * - Manifold pipa inspeksi, valve, dan nozzle industri
 */

const tankShellMat = new THREE.MeshStandardMaterial({
  color: 0xcfd8dc, // Putih perak baja industri
  roughness: 0.35,
  metalness: 0.7
});

const saddleSteelMat = new THREE.MeshStandardMaterial({
  color: 0x374151, // Baja gelap penopang
  roughness: 0.45,
  metalness: 0.8
});

const pipeYellowMat = new THREE.MeshStandardMaterial({
  color: 0xd97706, // Pipa keselamatan industri
  roughness: 0.4,
  metalness: 0.5
});

export function createHorizontalSkidTank({
  radius = 1.1,
  length = 6.8,
  skidHeight = 0.5
} = {}) {
  const tankGroup = new THREE.Group();
  tankGroup.name = 'asset_horizontal_skid_tank';

  const centerY = skidHeight + radius;

  // 1. Silinder Utama Horizontal (sepanjang sumbu Z)
  const cylinderGeo = new THREE.CylinderGeometry(radius, radius, length, 24);
  const cylinder = new THREE.Mesh(cylinderGeo, tankShellMat);
  cylinder.rotation.x = Math.PI / 2;
  cylinder.position.y = centerY;
  cylinder.castShadow = true;
  cylinder.receiveShadow = true;
  tankGroup.add(cylinder);

  // Ujung Cembung (Dished Heads)
  [-length / 2, length / 2].forEach((endZ, idx) => {
    const headGeo = new THREE.SphereGeometry(radius, 24, 12, 0, Math.PI * 2, 0, Math.PI / 2);
    const head = new THREE.Mesh(headGeo, tankShellMat);
    head.rotation.x = idx === 0 ? -Math.PI / 2 : Math.PI / 2;
    head.position.set(0, centerY, endZ);
    head.castShadow = true;
    tankGroup.add(head);
  });

  // 2. Dudukan Sadel Baja Ganda (Dual Saddles)
  [-length * 0.28, length * 0.28].forEach((sz) => {
    // Balok penyangga bawah
    const baseBeam = new THREE.Mesh(new THREE.BoxGeometry(radius * 2.3, skidHeight, 0.4), saddleSteelMat);
    baseBeam.position.set(0, skidHeight / 2, sz);
    baseBeam.castShadow = true;
    tankGroup.add(baseBeam);

    // Busur penopang tangki
    const cradle = new THREE.Mesh(new THREE.CylinderGeometry(radius * 1.05, radius * 1.05, 0.35, 16, 1, true, 0, Math.PI), saddleSteelMat);
    cradle.rotation.x = Math.PI / 2;
    cradle.rotation.z = Math.PI;
    cradle.position.set(0, centerY, sz);
    tankGroup.add(cradle);
  });

  // Balok Rangka Skid Dasar (H-beam memanjang)
  [-radius * 0.95, radius * 0.95].forEach((sx) => {
    const skidBeam = new THREE.Mesh(new THREE.BoxGeometry(0.2, 0.25, length + 0.8), saddleSteelMat);
    skidBeam.position.set(sx, 0.125, 0);
    skidBeam.castShadow = true;
    tankGroup.add(skidBeam);
  });

  // 3. Manhole & Pipa Atas
  const manhole = new THREE.Mesh(new THREE.CylinderGeometry(0.35, 0.35, 0.3, 16), saddleSteelMat);
  manhole.position.set(0, centerY + radius + 0.15, 0);
  tankGroup.add(manhole);

  const topPipe = new THREE.Mesh(new THREE.CylinderGeometry(0.08, 0.08, 1.2, 8), pipeYellowMat);
  topPipe.rotation.z = Math.PI / 2;
  topPipe.position.set(0.6, centerY + radius + 0.3, -length * 0.2);
  tankGroup.add(topPipe);

  return tankGroup;
}
