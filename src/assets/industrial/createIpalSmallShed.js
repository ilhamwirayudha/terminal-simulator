import * as THREE from 'three';

/**
 * ==============================================================================
 * Asset: createIpalSmallShed
 * Shed Utilitas / Rumah Kontrol Kompak Beratap Biru Pelindo
 * ==============================================================================
 *
 * Sesuai foto satelit (tampak 2 atap biru cerah kecil di barat IPAL):
 * - Dimensi kompak proporsional (lebar ~5.2m, panjang ~7.5m, tinggi ~3.2m)
 * - Atap pelana/datar biru cerah khas Pelindo
 * - Dinding modular beton/plat baja dengan pintu servis dan ventilasi kisi
 */

const shedWallMat = new THREE.MeshStandardMaterial({
  color: 0xf1f5f9, // Dinding putih/abu terang
  roughness: 0.65,
  metalness: 0.1
});

const shedBlueRoofMat = new THREE.MeshStandardMaterial({
  color: 0x0284c7, // Biru cerah Pelindo (tampak jelas di satelit)
  roughness: 0.38,
  metalness: 0.35
});

const shedDoorMat = new THREE.MeshStandardMaterial({
  color: 0x1e293b,
  roughness: 0.5,
  metalness: 0.6
});

const shedLouverMat = new THREE.MeshStandardMaterial({
  color: 0x475569,
  roughness: 0.4,
  metalness: 0.8
});

export function createIpalSmallShed({
  width = 5.2,
  length = 7.5,
  height = 3.2,
  roofColor = 0x0284c7
} = {}) {
  const shedGroup = new THREE.Group();
  shedGroup.name = 'asset_ipal_small_shed';

  // 1. Lantai / Pondasi
  const floorGeo = new THREE.BoxGeometry(width + 0.4, 0.2, length + 0.4);
  const floor = new THREE.Mesh(floorGeo, new THREE.MeshStandardMaterial({ color: 0x64748b, roughness: 0.9 }));
  floor.position.y = 0.1;
  floor.receiveShadow = true;
  shedGroup.add(floor);

  // 2. Badan Gedung
  const bodyGeo = new THREE.BoxGeometry(width, height, length);
  const body = new THREE.Mesh(bodyGeo, shedWallMat);
  body.position.y = height / 2 + 0.2;
  body.castShadow = true;
  body.receiveShadow = true;
  shedGroup.add(body);

  // 3. Atap Biru Pelindo dengan Overhang
  const roofMat = roofColor === 0x0284c7 ? shedBlueRoofMat : new THREE.MeshStandardMaterial({
    color: roofColor,
    roughness: 0.38,
    metalness: 0.35
  });
  const roofGeo = new THREE.BoxGeometry(width + 0.8, 0.3, length + 0.8);
  const roof = new THREE.Mesh(roofGeo, roofMat);
  roof.position.y = height + 0.2 + 0.15;
  roof.castShadow = true;
  shedGroup.add(roof);

  // 4. Pintu Servis
  const doorGeo = new THREE.BoxGeometry(0.08, 2.2, 1.2);
  const door = new THREE.Mesh(doorGeo, shedDoorMat);
  door.position.set(width / 2 + 0.02, 1.3, 0);
  shedGroup.add(door);

  // 5. Kisi Ventilasi / Louver Udara
  const louverGeo = new THREE.BoxGeometry(0.06, 0.8, 1.8);
  const louver = new THREE.Mesh(louverGeo, shedLouverMat);
  louver.position.set(-width / 2 - 0.02, 2.2, 0);
  shedGroup.add(louver);

  return shedGroup;
}
