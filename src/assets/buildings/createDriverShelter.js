import * as THREE from 'three';

/**
 * ==============================================================================
 * Asset: createDriverShelter
 * Bangunan Shelter & Ruang Istirahat Driver Truk Terminal
 * ==============================================================================
 *
 * Struktur arsitektural shelter istirahat pengemudi di tepi jalan pre-gate:
 * - Bangunan utama (aula ber-AC, musholla, toilet, loket layanan)
 * - Lis fasad warna Pelindo Blue khas Pelindo
 * - Kanopi beranda teras depan peneduh dengan tiang baja hollow
 * - Kaca jendela tinted / architectural glass
 * - Area bangku istirahat outdoor untuk driver
 */

const wallMat = new THREE.MeshStandardMaterial({
  color: 0xf8fafc, // Putih tulang bersih arsitektural
  roughness: 0.6,
  metalness: 0.05
});

const trimBlueMat = new THREE.MeshStandardMaterial({
  color: 0x0284c7, // Pelindo Blue
  roughness: 0.45,
  metalness: 0.2
});

const roofMat = new THREE.MeshStandardMaterial({
  color: 0xe2e8f0, // Atap dak / metal sheet cerah
  roughness: 0.5,
  metalness: 0.15
});

const canopyRoofMat = new THREE.MeshStandardMaterial({
  color: 0x0369a1, // Kanopi teras biru
  roughness: 0.4,
  metalness: 0.3
});

const steelPostMat = new THREE.MeshStandardMaterial({
  color: 0x334155, // Tiang baja abu-abu gelap
  roughness: 0.4,
  metalness: 0.7
});

const glassMat = new THREE.MeshStandardMaterial({
  color: 0x1e293b,
  roughness: 0.15,
  metalness: 0.9,
  transparent: true,
  opacity: 0.75
});

const benchMat = new THREE.MeshStandardMaterial({
  color: 0x92400e, // Kayu sintetis / taman bangku
  roughness: 0.7
});

export function createDriverShelter({
  length = 18.0,   // Panjang gedung proporsional (sesuai citra satelit)
  width = 11.0,    // Lebar gedung
  height = 4.0,    // Tinggi plafon proporsional
  porchDepth = 3.6 // Kedalaman teras kanopi peneduh
} = {}) {
  const shelterGroup = new THREE.Group();
  shelterGroup.name = 'asset_driver_shelter';

  // 1. Lantai Podium / Paving Dasar Gedung
  const plinthW = width + porchDepth + 1.2;
  const plinthL = length + 2.0;
  const plinthGeo = new THREE.BoxGeometry(plinthW, 0.25, plinthL);
  const plinth = new THREE.Mesh(plinthGeo, new THREE.MeshStandardMaterial({ color: 0x94a3b8, roughness: 0.85 }));
  plinth.position.set(porchDepth / 2, 0.125, 0);
  plinth.receiveShadow = true;
  shelterGroup.add(plinth);

  // 2. Bangunan Utama Gedung
  const mainBldgGeo = new THREE.BoxGeometry(width, height, length);
  const mainBldg = new THREE.Mesh(mainBldgGeo, wallMat);
  mainBldg.position.set(0, height / 2 + 0.25, 0);
  mainBldg.castShadow = true;
  mainBldg.receiveShadow = true;
  shelterGroup.add(mainBldg);

  // 3. Lis Fasad Biru Pelindo di Atas & Bawah
  const topTrimGeo = new THREE.BoxGeometry(width + 0.3, 0.4, length + 0.3);
  const topTrim = new THREE.Mesh(topTrimGeo, trimBlueMat);
  topTrim.position.set(0, height + 0.25 - 0.2, 0);
  shelterGroup.add(topTrim);

  // 4. Atap Gedung Utama
  const roofGeo = new THREE.BoxGeometry(width + 0.6, 0.35, length + 0.6);
  const roof = new THREE.Mesh(roofGeo, roofMat);
  roof.position.set(0, height + 0.25 + 0.18, 0);
  roof.castShadow = true;
  shelterGroup.add(roof);

  // 5. Jendela Kaca Panjang & Pintu Masuk
  const winW = length * 0.18;
  const windowFrontGeo = new THREE.BoxGeometry(0.1, 1.8, winW);
  [-length * 0.26, 0.0, length * 0.26].forEach((wz) => {
    const win = new THREE.Mesh(windowFrontGeo, glassMat);
    win.position.set(width / 2 + 0.02, 2.0, wz);
    shelterGroup.add(win);
  });

  // Pintu Masuk Kaca Ganda di Sisi Depan
  const doorGeo = new THREE.BoxGeometry(0.12, 2.4, 2.0);
  const door = new THREE.Mesh(doorGeo, glassMat);
  door.position.set(width / 2 + 0.03, 1.45, -length * 0.12);
  shelterGroup.add(door);

  // 6. Kanopi Teras Peneduh (Porch)
  const porchRoofGeo = new THREE.BoxGeometry(porchDepth, 0.2, length + 0.4);
  const porchRoof = new THREE.Mesh(porchRoofGeo, canopyRoofMat);
  porchRoof.position.set(width / 2 + porchDepth / 2, height - 0.6, 0);
  porchRoof.castShadow = true;
  shelterGroup.add(porchRoof);

  // Tiang-tiang Baja Penyangga Kanopi
  const numPosts = 5;
  for (let i = 0; i < numPosts; i++) {
    const pz = -length / 2 + (i / (numPosts - 1)) * length;
    const postGeo = new THREE.BoxGeometry(0.2, height - 0.7, 0.2);
    const post = new THREE.Mesh(postGeo, steelPostMat);
    post.position.set(width / 2 + porchDepth - 0.2, (height - 0.7) / 2 + 0.25, pz);
    post.castShadow = true;
    shelterGroup.add(post);

    // Bangku Istirahat Outdoor di Antara Tiang
    if (i < numPosts - 1) {
      const benchZ = pz + length / (numPosts - 1) / 2;
      const benchGeo = new THREE.BoxGeometry(0.65, 0.45, 1.8);
      const bench = new THREE.Mesh(benchGeo, benchMat);
      bench.position.set(width / 2 + porchDepth - 1.2, 0.45, benchZ);
      bench.castShadow = true;
      shelterGroup.add(bench);
    }
  }

  return shelterGroup;
}
