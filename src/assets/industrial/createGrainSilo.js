import * as THREE from 'three';

/**
 * ==============================================================================
 * Reusable Asset: Silo Penyimpanan Curah Kering (Corrugated Steel Grain Silo)
 * ==============================================================================
 * Digunakan untuk:
 * - 10 Silo Jagung Utama (2x5, masing-masing 6000T / Ø27m) di Bulk Area
 * - 4 Silo Pendukung (Ø8.5m) di Koridor Tengah
 * - 14 Tangki/Hopper Silinder Hitam (2x7) di Area ORU
 */

const siloWallMat = new THREE.MeshStandardMaterial({
  color: 0xdbe2ea,
  roughness: 0.42,
  metalness: 0.55,
  name: 'mat_silo_corrugated_steel'
});

const siloRoofMat = new THREE.MeshStandardMaterial({
  color: 0xeef2f6,
  roughness: 0.35,
  metalness: 0.48,
  name: 'mat_silo_conical_roof'
});

const siloRingMat = new THREE.MeshStandardMaterial({
  color: 0x94a3b8,
  roughness: 0.5,
  metalness: 0.6,
  name: 'mat_silo_stiffener_ring'
});

const siloBaseMat = new THREE.MeshStandardMaterial({
  color: 0x64748b,
  roughness: 0.85,
  metalness: 0.1,
  name: 'mat_silo_concrete_plinth'
});

const darkTankMat = new THREE.MeshStandardMaterial({
  color: 0x272e36,
  roughness: 0.55,
  metalness: 0.45,
  name: 'mat_oru_dark_tank'
});

export function createGrainSilo({
  radius = 13.2,
  cylinderHeight = 25.0,
  roofHeight = 6.2,
  plinthHeight = 1.4,
  numRings = 5,
  isDarkTank = false
} = {}) {
  const group = new THREE.Group();
  group.name = 'asset_grain_silo';

  // 1. Fondasi Beton Melingkar (Concrete Plinth)
  const plinthGeo = new THREE.CylinderGeometry(radius * 1.03, radius * 1.05, plinthHeight, 28);
  const plinthMesh = new THREE.Mesh(plinthGeo, siloBaseMat);
  plinthMesh.position.y = plinthHeight / 2;
  plinthMesh.receiveShadow = true;
  plinthMesh.castShadow = true;
  group.add(plinthMesh);

  // 2. Dinding Tabung Silo Baja (Main Cylinder Body)
  const bodyGeo = new THREE.CylinderGeometry(radius, radius, cylinderHeight, 32);
  const bodyMesh = new THREE.Mesh(bodyGeo, isDarkTank ? darkTankMat : siloWallMat);
  bodyMesh.position.y = plinthHeight + cylinderHeight / 2;
  bodyMesh.castShadow = true;
  bodyMesh.receiveShadow = true;
  group.add(bodyMesh);

  // 3. Cincin Pengaku Horizontal (Stiffener Rings) & Rusuk Vertikal
  if (!isDarkTank && numRings > 0) {
    const ringGeo = new THREE.CylinderGeometry(radius * 1.008, radius * 1.008, 0.28, 32);
    for (let i = 1; i <= numRings; i++) {
      const ry = plinthHeight + (cylinderHeight / (numRings + 1)) * i;
      const ring = new THREE.Mesh(ringGeo, siloRingMat);
      ring.position.y = ry;
      group.add(ring);
    }
  }

  // 4. Atap Kerucut (Conical Roof)
  const coneGeo = new THREE.ConeGeometry(radius * 1.015, roofHeight, 32);
  const coneMesh = new THREE.Mesh(coneGeo, isDarkTank ? darkTankMat : siloRoofMat);
  coneMesh.position.y = plinthHeight + cylinderHeight + roofHeight / 2;
  coneMesh.castShadow = true;
  coneMesh.receiveShadow = true;
  group.add(coneMesh);

  // 5. Kerah Puncak / Cap Ventilasi Atas (Top Collar)
  const capGeo = new THREE.CylinderGeometry(radius * 0.14, radius * 0.16, 1.1, 16);
  const capMesh = new THREE.Mesh(capGeo, siloRingMat);
  capMesh.position.y = plinthHeight + cylinderHeight + roofHeight - 0.2;
  group.add(capMesh);

  return group;
}
