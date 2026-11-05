import * as THREE from 'three';

/**
 * ==============================================================================
 * Reusable Asset: Palang Otomatis Gerbang (Automatic Boom Barrier)
 * ==============================================================================
 */

const housingMat = new THREE.MeshStandardMaterial({
  color: 0xf97316, // Industrial safety orange
  roughness: 0.35,
  metalness: 0.4,
  name: 'mat_barrier_housing'
});

const armWhiteMat = new THREE.MeshStandardMaterial({
  color: 0xf8fafc,
  roughness: 0.3
});

const armRedMat = new THREE.MeshStandardMaterial({
  color: 0xef4444,
  roughness: 0.3
});

export function createBoomBarrier({
  x = 0,
  z = 0,
  yRoad = 1.631,
  armLength = 3.8,
  isOpen = false,
  pointsNegativeX = true // Direction the arm extends
} = {}) {
  const barrierGroup = new THREE.Group();
  barrierGroup.name = 'asset_boom_barrier';

  // 1. Kotak Motor Housing
  const hW = 0.35, hH = 1.1, hL = 0.35;
  const housing = new THREE.Mesh(new THREE.BoxGeometry(hW, hH, hL), housingMat);
  housing.position.set(x, yRoad + hH / 2, z);
  housing.castShadow = true;
  barrierGroup.add(housing);

  // 2. Lengan Palang (Boom Arm with Red/White Stripes)
  const armGroup = new THREE.Group();
  armGroup.position.set(x, yRoad + hH * 0.85, z);

  const numStripes = 8;
  const stripeLen = armLength / numStripes;
  const dir = pointsNegativeX ? -1 : 1;

  for (let i = 0; i < numStripes; i++) {
    const isRed = i % 2 === 1;
    const stripeGeo = new THREE.BoxGeometry(stripeLen, 0.08, 0.04);
    const stripe = new THREE.Mesh(stripeGeo, isRed ? armRedMat : armWhiteMat);
    stripe.position.set(dir * (i * stripeLen + stripeLen / 2), 0, 0);
    armGroup.add(stripe);
  }

  // Jika terbuka, rotasi palang terangkat 75 derajat
  if (isOpen) {
    armGroup.rotation.z = dir * (Math.PI * 0.42);
  }

  barrierGroup.add(armGroup);
  return barrierGroup;
}
