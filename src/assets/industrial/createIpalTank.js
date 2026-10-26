import * as THREE from 'three';

/**
 * ==============================================================================
 * Asset: createIpalTank
 * Tangki Silinder Vertikal IPAL (Equalization / Sedimentation / Sludge Tank)
 * ==============================================================================
 *
 * Struktur tangki industri kimia/pengolahan air:
 * - Badan silinder baja/komposit dengan ring pengaku
 * - Atap kubah (dome) landai
 * - Pondasi beton bundar berundak
 * - Tangga inspeksi vertikal (caged ladder)
 * - Pipa manifold & flange industri
 */

const tankBodyMat = new THREE.MeshStandardMaterial({
  color: 0x94a3b8, // Plat baja abu-abu industri cerah
  roughness: 0.45,
  metalness: 0.6
});

const tankRoofMat = new THREE.MeshStandardMaterial({
  color: 0x0284c7, // Pelindo Blue / Biru utilitas (tampak pada gambar satelit)
  roughness: 0.4,
  metalness: 0.4
});

const tankBaseMat = new THREE.MeshStandardMaterial({
  color: 0x64748b, // Beton pondasi tangki
  roughness: 0.9,
  metalness: 0.05
});

const pipeMat = new THREE.MeshStandardMaterial({
  color: 0x334155, // Pipa baja gelap
  roughness: 0.35,
  metalness: 0.8
});

const ladderMat = new THREE.MeshStandardMaterial({
  color: 0xf59e0b, // Kuning safety industrial
  roughness: 0.4,
  metalness: 0.5
});

export function createIpalTank({
  radius = 2.6,
  height = 5.2,
  roofColor = 0x0284c7
} = {}) {
  const tankGroup = new THREE.Group();
  tankGroup.name = 'asset_ipal_tank';

  // 1. Pondasi Beton Bundar
  const plinthGeo = new THREE.CylinderGeometry(radius * 1.15, radius * 1.2, 0.4, 24);
  const plinth = new THREE.Mesh(plinthGeo, tankBaseMat);
  plinth.position.y = 0.2;
  plinth.receiveShadow = true;
  tankGroup.add(plinth);

  // 2. Silinder Utama Tangki
  const bodyGeo = new THREE.CylinderGeometry(radius, radius, height, 24);
  const body = new THREE.Mesh(bodyGeo, tankBodyMat);
  body.position.y = height / 2 + 0.4;
  body.castShadow = true;
  body.receiveShadow = true;
  tankGroup.add(body);

  // Ring pengaku tangki (Stiffener rings)
  [0.3, 0.6, 0.9].forEach((f) => {
    const ringGeo = new THREE.TorusGeometry(radius + 0.04, 0.04, 8, 24);
    const ring = new THREE.Mesh(ringGeo, pipeMat);
    ring.rotation.x = Math.PI / 2;
    ring.position.y = height * f + 0.4;
    tankGroup.add(ring);
  });

  // 3. Atap Kubah Landai
  const domeMat = roofColor === 0x0284c7 ? tankRoofMat : new THREE.MeshStandardMaterial({
    color: roofColor,
    roughness: 0.4,
    metalness: 0.4
  });
  const domeGeo = new THREE.CylinderGeometry(0.2, radius, 0.6, 24);
  const dome = new THREE.Mesh(domeGeo, domeMat);
  dome.position.y = height + 0.4 + 0.3;
  dome.castShadow = true;
  tankGroup.add(dome);

  // 4. Tangga Inspeksi Vertikal
  const ladderGroup = new THREE.Group();
  const ladderW = 0.55;
  [-ladderW / 2, ladderW / 2].forEach((lx) => {
    const stringer = new THREE.Mesh(new THREE.CylinderGeometry(0.02, 0.02, height, 6), ladderMat);
    stringer.position.set(lx, height / 2 + 0.4, radius + 0.18);
    ladderGroup.add(stringer);
  });

  const numRungs = Math.floor(height / 0.35);
  for (let r = 0; r < numRungs; r++) {
    const rung = new THREE.Mesh(new THREE.CylinderGeometry(0.015, 0.015, ladderW, 6), ladderMat);
    rung.rotation.z = Math.PI / 2;
    rung.position.set(0, 0.5 + r * 0.35, radius + 0.18);
    ladderGroup.add(rung);
  }
  tankGroup.add(ladderGroup);

  // 5. Pipa Masuk / Keluar (Flange & Nozzle)
  const pipeGeo = new THREE.CylinderGeometry(0.12, 0.12, 1.4, 12);
  const pipe = new THREE.Mesh(pipeGeo, pipeMat);
  pipe.rotation.x = Math.PI / 2;
  pipe.position.set(0, 1.0, -radius - 0.5);
  tankGroup.add(pipe);

  return tankGroup;
}
