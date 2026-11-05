import * as THREE from 'three';

/**
 * ==============================================================================
 * Reusable Asset: Gudang Flat Storage Curah Kering (Twin Flat Storage Warehouse)
 * ==============================================================================
 * Sesuai Sketsa AutoCAD & Citra Satelit:
 * - 2 Gedung Utama Kembar (Phase #2 di Barat Daya & Phase #1 di Timur Laut)
 * - Masing-masing berukuran utama 54m x 140m (ditambah bay samping 14m + kanopi)
 * - Warna atap krem / putih gading (ivory/warm beige) khas gudang curah TTL
 * - Dilengkapi rumah konveyor memanjang di punggung atap (ridge gallery)
 */

const wallConcreteMat = new THREE.MeshStandardMaterial({
  color: 0xcbd5e1,
  roughness: 0.78,
  metalness: 0.1,
  name: 'mat_flat_storage_wall'
});

const claddingWallMat = new THREE.MeshStandardMaterial({
  color: 0xe2e8f0,
  roughness: 0.52,
  metalness: 0.28,
  name: 'mat_flat_storage_cladding'
});

const roofIvoryMat = new THREE.MeshStandardMaterial({
  color: 0xe7dfd3,
  roughness: 0.46,
  metalness: 0.22,
  name: 'mat_flat_storage_roof_ivory'
});

const roofRidgeMat = new THREE.MeshStandardMaterial({
  color: 0xd6ccc0,
  roughness: 0.42,
  metalness: 0.30,
  name: 'mat_flat_storage_ridge'
});

const darkTrimMat = new THREE.MeshStandardMaterial({
  color: 0x334155,
  roughness: 0.6,
  metalness: 0.4,
  name: 'mat_flat_storage_trim'
});

/**
 * Membuat satu kompleks Gudang Flat Storage Kembar (Phase #1 & Phase #2)
 * Sumbu Z = lebar bentang kiri-kanan (SW-NE), Sumbu X = panjang gudang (SE-NW)
 */
export function createFlatStorageComplex({
  lengthX = 186.0,    // Panjang memanjang sumbu X (SE ke NW)
  singleWidthZ = 56.0, // Lebar masing-masing gudang utama (Phase #1 & #2)
  centerGapZ = 6.0,    // Celah lorong tengah antar 2 gudang
  sideBayWidthZ = 12.0, // Bay tambahan di sisi luar kiri & kanan (sesuai AutoCAD 14m)
  wallHeight = 12.5,
  roofPeakHeight = 8.5
} = {}) {
  const group = new THREE.Group();
  group.name = 'asset_flat_storage_complex';

  const buildSingleHall = (offsetZ, hallName) => {
    const hall = new THREE.Group();
    hall.name = hallName;

    // 1. Dinding Beton Penahan Bawah (Retaining Wall untuk muatan curah)
    const lowerWallH = 5.5;
    const lowerMesh = new THREE.Mesh(
      new THREE.BoxGeometry(lengthX, lowerWallH, singleWidthZ),
      wallConcreteMat
    );
    lowerMesh.position.set(0, lowerWallH / 2, offsetZ);
    lowerMesh.castShadow = true;
    lowerMesh.receiveShadow = true;
    hall.add(lowerMesh);

    // 2. Dinding Cladding Baja Atas
    const upperWallH = wallHeight - lowerWallH;
    const upperMesh = new THREE.Mesh(
      new THREE.BoxGeometry(lengthX * 0.998, upperWallH, singleWidthZ * 0.996),
      claddingWallMat
    );
    upperMesh.position.set(0, lowerWallH + upperWallH / 2, offsetZ);
    upperMesh.castShadow = true;
    upperMesh.receiveShadow = true;
    hall.add(upperMesh);

    // 3. Atap Pelana (Pitched Gable Roof sepanjang sumbu X)
    // Dibuat dengan ExtrudeGeometry dari penampang segitiga di bidang YZ lalu dirotasi/ditempatkan
    const halfW = (singleWidthZ + 1.6) / 2;
    const roofShape = new THREE.Shape();
    roofShape.moveTo(-halfW, 0);
    roofShape.lineTo(0, roofPeakHeight);
    roofShape.lineTo(halfW, 0);
    roofShape.closePath();

    const roofGeo = new THREE.ExtrudeGeometry(roofShape, {
      depth: lengthX + 2.0,
      bevelEnabled: false
    });
    // ExtrudeGeometry mengekstrusi sepanjang +Z lokal; kita putar agar ekstrusi sepanjang sumbu X
    const roofMesh = new THREE.Mesh(roofGeo, roofIvoryMat);
    roofMesh.rotation.y = Math.PI / 2;
    roofMesh.position.set(-(lengthX + 2.0) / 2, wallHeight, offsetZ);
    roofMesh.castShadow = true;
    roofMesh.receiveShadow = true;
    hall.add(roofMesh);

    // 4. Rumah Konveyor Puncak Atap (Overhead Ridge Conveyor Gallery)
    const ridgeGallery = new THREE.Mesh(
      new THREE.BoxGeometry(lengthX + 1.0, 2.8, 4.6),
      roofRidgeMat
    );
    ridgeGallery.position.set(0, wallHeight + roofPeakHeight + 0.6, offsetZ);
    ridgeGallery.castShadow = true;
    hall.add(ridgeGallery);

    return hall;
  };

  const zOffsetHall = (singleWidthZ + centerGapZ) / 2;

  // Phase #2 (Kiri / Barat Daya: -Z) & Phase #1 (Kanan / Timur Laut: +Z)
  group.add(buildSingleHall(-zOffsetHall, 'flat_storage_phase_2_sw'));
  group.add(buildSingleHall(+zOffsetHall, 'flat_storage_phase_1_ne'));

  // 5. Lorong Penghubung Tengah (Central Spine Gallery di antara Phase #1 dan #2)
  const centerSpineH = wallHeight + 3.2;
  const centerSpine = new THREE.Mesh(
    new THREE.BoxGeometry(lengthX + 2.0, centerSpineH, centerGapZ + 2.4),
    roofRidgeMat
  );
  centerSpine.position.set(0, centerSpineH / 2, 0);
  centerSpine.castShadow = true;
  centerSpine.receiveShadow = true;
  group.add(centerSpine);

  // 6. Side Bays di Sisi Luar Kiri (-Z) dan Sisi Luar Kanan (+Z) (sesuai citra satelit & AutoCAD 14m)
  const sideBayH = wallHeight - 1.8;
  const sideBayOffsetZ = zOffsetHall + singleWidthZ / 2 + sideBayWidthZ / 2 - 0.2;

  [-sideBayOffsetZ, +sideBayOffsetZ].forEach((sz, idx) => {
    const sideBay = new THREE.Mesh(
      new THREE.BoxGeometry(lengthX * 0.96, sideBayH, sideBayWidthZ),
      roofIvoryMat
    );
    sideBay.position.set(0, sideBayH / 2, sz);
    sideBay.castShadow = true;
    sideBay.receiveShadow = true;
    group.add(sideBay);

    // Garis talang gelap antara atap utama dan side bay (terlihat jelas sebagai garis bayangan di satelit)
    const gutterStrip = new THREE.Mesh(
      new THREE.BoxGeometry(lengthX * 0.99, 0.4, 1.1),
      darkTrimMat
    );
    gutterStrip.position.set(
      0,
      sideBayH + 0.2,
      idx === 0 ? -zOffsetHall - singleWidthZ / 2 : +zOffsetHall + singleWidthZ / 2
    );
    group.add(gutterStrip);
  });

  return group;
}
