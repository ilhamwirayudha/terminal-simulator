import * as THREE from 'three';

/**
 * ==============================================================================
 * Asset: createIpalBasin
 * Bak Pengolahan Air Limbah / Kolam Aerasi & Sedimentasi IPAL
 * ==============================================================================
 *
 * Struktur bak beton bertulang berpetak dengan air olahan dan jembatan inspeksi:
 * - Dinding perimeter beton bertulang tebal
 * - Sekat pembagi kanal/sel aliran air limbah
 * - Bidang permukaan air olahan dengan warna hijau zaitun khas IPAL
 * - Jembatan inspeksi (catwalk) di atas bak beserta railing pengaman
 */

const basinConcreteMat = new THREE.MeshStandardMaterial({
  color: 0x8a9296, // Beton ekspos IPAL tahan korosi
  roughness: 0.88,
  metalness: 0.1
});

const treatedWaterMat = new THREE.MeshStandardMaterial({
  color: 0x2d4f3b, // Air pengolahan limbah kehijauan (sesuai satelit)
  roughness: 0.35,
  metalness: 0.25,
  transparent: true,
  opacity: 0.92
});

const catwalkSteelMat = new THREE.MeshStandardMaterial({
  color: 0x475569, // Kisi baja galvanis jembatan inspeksi
  roughness: 0.5,
  metalness: 0.75
});

const safetyRailingMat = new THREE.MeshStandardMaterial({
  color: 0xd97706, // Kuning-oranye safety industrial railing
  roughness: 0.45,
  metalness: 0.3
});

export function createIpalBasin({
  width = 7.5,        // Lebar saluran kompak (sumbu X lokal)
  length = 24.0,      // Panjang saluran (sumbu Z lokal)
  depth = 1.8,        // Kedalaman proporsional
  wallThickness = 0.35,
  numChannels = 2     // Sekat kanal ganda sesuai citra
} = {}) {
  const basinGroup = new THREE.Group();
  basinGroup.name = 'asset_ipal_basin';

  // 1. Lantai Dasar Beton Bak
  const floorGeo = new THREE.BoxGeometry(width, 0.4, length);
  const floorMesh = new THREE.Mesh(floorGeo, basinConcreteMat);
  floorMesh.position.y = 0.2;
  floorMesh.receiveShadow = true;
  basinGroup.add(floorMesh);

  // 2. Dinding Perimeter Luar
  // Dinding Sisi Kiri & Kanan (Panjang)
  const sideWallGeo = new THREE.BoxGeometry(wallThickness, depth, length);
  const leftWall = new THREE.Mesh(sideWallGeo, basinConcreteMat);
  leftWall.position.set(-width / 2 + wallThickness / 2, depth / 2 + 0.2, 0);
  leftWall.castShadow = true;
  leftWall.receiveShadow = true;
  basinGroup.add(leftWall);

  const rightWall = new THREE.Mesh(sideWallGeo, basinConcreteMat);
  rightWall.position.set(width / 2 - wallThickness / 2, depth / 2 + 0.2, 0);
  rightWall.castShadow = true;
  rightWall.receiveShadow = true;
  basinGroup.add(rightWall);

  // Dinding Sisi Depan & Belakang (Lebar)
  const endWallGeo = new THREE.BoxGeometry(width - 2 * wallThickness, depth, wallThickness);
  const frontWall = new THREE.Mesh(endWallGeo, basinConcreteMat);
  frontWall.position.set(0, depth / 2 + 0.2, length / 2 - wallThickness / 2);
  frontWall.castShadow = true;
  basinGroup.add(frontWall);

  const backWall = new THREE.Mesh(endWallGeo, basinConcreteMat);
  backWall.position.set(0, depth / 2 + 0.2, -length / 2 + wallThickness / 2);
  backWall.castShadow = true;
  basinGroup.add(backWall);

  // 3. Sekat Pembagi Kanal Memanjang
  const innerWidth = width - 2 * wallThickness;
  const channelWidth = innerWidth / numChannels;

  for (let c = 1; c < numChannels; c++) {
    const dividerX = -innerWidth / 2 + c * channelWidth;
    const divider = new THREE.Mesh(new THREE.BoxGeometry(0.3, depth * 0.9, length - 2 * wallThickness), basinConcreteMat);
    divider.position.set(dividerX, (depth * 0.9) / 2 + 0.2, 0);
    divider.castShadow = true;
    basinGroup.add(divider);
  }

  // 4. Permukaan Air Olahan
  const waterGeo = new THREE.PlaneGeometry(innerWidth, length - 2 * wallThickness);
  const waterMesh = new THREE.Mesh(waterGeo, treatedWaterMat);
  waterMesh.rotation.x = -Math.PI / 2;
  waterMesh.position.set(0, depth * 0.78 + 0.2, 0);
  basinGroup.add(waterMesh);

  // 5. Catwalk Jembatan Inspeksi Melintang di Tengah
  const catwalkWidth = 1.1;
  const catwalkGeo = new THREE.BoxGeometry(width + 0.4, 0.12, catwalkWidth);
  const catwalkMesh = new THREE.Mesh(catwalkGeo, catwalkSteelMat);
  catwalkMesh.position.set(0, depth + 0.26, 0);
  catwalkMesh.castShadow = true;
  basinGroup.add(catwalkMesh);

  // Railing Safety Jembatan Catwalk
  [-catwalkWidth / 2 + 0.05, catwalkWidth / 2 - 0.05].forEach((rz) => {
    const railBarGeo = new THREE.BoxGeometry(width + 0.4, 0.05, 0.05);
    const topRail = new THREE.Mesh(railBarGeo, safetyRailingMat);
    topRail.position.set(0, depth + 1.1, rz);
    basinGroup.add(topRail);

    const midRail = new THREE.Mesh(railBarGeo, safetyRailingMat);
    midRail.position.set(0, depth + 0.65, rz);
    basinGroup.add(midRail);

    // Tiang vertikal railing
    const numPosts = 5;
    for (let p = 0; p < numPosts; p++) {
      const px = -width / 2 + (p / (numPosts - 1)) * width;
      const post = new THREE.Mesh(new THREE.CylinderGeometry(0.025, 0.025, 0.85, 6), safetyRailingMat);
      post.position.set(px, depth + 0.68, rz);
      basinGroup.add(post);
    }
  });

  return basinGroup;
}
