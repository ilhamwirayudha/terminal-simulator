import * as THREE from 'three';

/**
 * ==============================================================================
 * Asset: createMotorcycleParkingBay
 * Kanopi Shelter Parkir Motor & Marka Jalur Parkir Roda Dua
 * ==============================================================================
 *
 * Struktur shelter parkir sepeda motor karyawan/tamu:
 * - Struktur atap pelindung baja ringan / spandek bergelombang (biru/silver)
 * - Rangka tiang penopang cantilever / double post
 * - Marka lantai slot parkir putih sudut 90° atau 60°
 * - Pilihan penempatan prop siluet motor roda dua instanced
 */

const canopySheetMat = new THREE.MeshStandardMaterial({
  color: 0x1e3a8a, // Biru navy industri atap parkir
  roughness: 0.45,
  metalness: 0.4
});

const frameSteelMat = new THREE.MeshStandardMaterial({
  color: 0x475569, // Rangka baja galvanis
  roughness: 0.4,
  metalness: 0.75
});

const bayLineMat = new THREE.MeshBasicMaterial({
  color: 0xffffff
});

const pavingMat = new THREE.MeshStandardMaterial({
  color: 0x3e424b, // Aspal / paving gelap parkiran
  roughness: 0.88,
  metalness: 0.05
});

const bikeBodyMat = new THREE.MeshStandardMaterial({
  color: 0x0f172a, // Body motor gelap
  roughness: 0.4,
  metalness: 0.5
});

const bikeSeatMat = new THREE.MeshStandardMaterial({
  color: 0x18181b, // Jok hitam
  roughness: 0.8
});

export function createMotorcycleParkingBay({
  length = 24.0,   // Panjang shelter (misal arah Z)
  width = 5.4,     // Lebar area (menampung 2 baris motor saling membelakangi)
  height = 2.7,
  numBays = 24,    // Jumlah slot marka parkir
  addMotorcycles = true
} = {}) {
  const parkGroup = new THREE.Group();
  parkGroup.name = 'asset_motorcycle_parking_bay';

  // 1. Lantai Paving / Aspal Parkiran
  const floorGeo = new THREE.BoxGeometry(width + 1.6, 0.1, length + 1.2);
  const floor = new THREE.Mesh(floorGeo, pavingMat);
  floor.position.set(0, 0.05, 0);
  floor.receiveShadow = true;
  parkGroup.add(floor);

  // 2. Atap Kanopi Lengkung / Miring Ganda
  const roofWingW = width / 2 + 0.3;
  [-roofWingW / 2, roofWingW / 2].forEach((rx, idx) => {
    const roofGeo = new THREE.BoxGeometry(roofWingW, 0.08, length + 0.4);
    const roof = new THREE.Mesh(roofGeo, canopySheetMat);
    roof.position.set(rx, height + (idx === 0 ? 0.12 : -0.12), 0);
    roof.rotation.z = (idx === 0 ? 0.08 : -0.08);
    roof.castShadow = true;
    parkGroup.add(roof);
  });

  // 3. Tiang-Tiang Penyangga Tengah (Central Post System)
  const numPosts = Math.max(3, Math.floor(length / 6) + 1);
  for (let i = 0; i < numPosts; i++) {
    const pz = -length / 2 + (i / (numPosts - 1)) * length;

    // Tiang vertikal utama
    const postGeo = new THREE.BoxGeometry(0.18, height, 0.18);
    const post = new THREE.Mesh(postGeo, frameSteelMat);
    post.position.set(0, height / 2 + 0.1, pz);
    post.castShadow = true;
    parkGroup.add(post);

    // Palang T / Kuda-kuda atap
    const beamGeo = new THREE.BoxGeometry(width - 0.4, 0.14, 0.14);
    const beam = new THREE.Mesh(beamGeo, frameSteelMat);
    beam.position.set(0, height + 0.05, pz);
    beam.castShadow = true;
    parkGroup.add(beam);
  }

  // 4. Marka Garis Parkir Roda Dua Putih
  const baySpacing = length / (numBays / 2);
  const halfBays = Math.floor(numBays / 2);

  for (let b = 0; b <= halfBays; b++) {
    const bz = -length / 2 + b * baySpacing;

    // Garis baris kiri
    const lineLeft = new THREE.Mesh(new THREE.PlaneGeometry(2.1, 0.1), bayLineMat);
    lineLeft.rotation.x = -Math.PI / 2;
    lineLeft.position.set(-width / 4, 0.11, bz);
    parkGroup.add(lineLeft);

    // Garis baris kanan
    const lineRight = new THREE.Mesh(new THREE.PlaneGeometry(2.1, 0.1), bayLineMat);
    lineRight.rotation.x = -Math.PI / 2;
    lineRight.position.set(width / 4, 0.11, bz);
    parkGroup.add(lineRight);
  }

  // 5. Prop Motor Parkir Terpilih (Ringan & Low-poly)
  if (addMotorcycles) {
    for (let b = 0; b < halfBays; b++) {
      const bz = -length / 2 + (b + 0.5) * baySpacing;

      // Parkir sisi kiri (beberapa terisi)
      if (b % 4 !== 2) {
        const bikeLeft = createLowPolyBike();
        bikeLeft.position.set(-width / 4, 0.11, bz);
        bikeLeft.rotation.y = Math.PI / 2;
        parkGroup.add(bikeLeft);
      }

      // Parkir sisi kanan (beberapa terisi)
      if (b % 3 !== 1) {
        const bikeRight = createLowPolyBike();
        bikeRight.position.set(width / 4, 0.11, bz);
        bikeRight.rotation.y = -Math.PI / 2;
        parkGroup.add(bikeRight);
      }
    }
  }

  return parkGroup;
}

function createLowPolyBike() {
  const bikeGroup = new THREE.Group();

  // Rangka body
  const body = new THREE.Mesh(new THREE.BoxGeometry(0.35, 0.45, 1.4), bikeBodyMat);
  body.position.y = 0.45;
  bikeGroup.add(body);

  // Jok
  const seat = new THREE.Mesh(new THREE.BoxGeometry(0.28, 0.1, 0.7), bikeSeatMat);
  seat.position.set(0, 0.72, -0.1);
  bikeGroup.add(seat);

  // Stang
  const bar = new THREE.Mesh(new THREE.BoxGeometry(0.55, 0.05, 0.06), frameSteelMat);
  bar.position.set(0, 0.82, 0.45);
  bikeGroup.add(bar);

  // Roda Depan & Belakang
  const wheelGeo = new THREE.CylinderGeometry(0.24, 0.24, 0.1, 8);
  const wheelMat = new THREE.MeshStandardMaterial({ color: 0x111827, roughness: 0.9 });

  const frontWheel = new THREE.Mesh(wheelGeo, wheelMat);
  frontWheel.rotation.z = Math.PI / 2;
  frontWheel.position.set(0, 0.24, 0.55);
  bikeGroup.add(frontWheel);

  const rearWheel = new THREE.Mesh(wheelGeo, wheelMat);
  rearWheel.rotation.z = Math.PI / 2;
  rearWheel.position.set(0, 0.24, -0.55);
  bikeGroup.add(rearWheel);

  return bikeGroup;
}
