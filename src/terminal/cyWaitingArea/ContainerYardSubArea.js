import * as THREE from 'three';
import { BLOCKS_CONFIG } from './CyWaitingGeo.js';

/**
 * ==============================================================================
 * Sub-Area: Container Yard (Blok TR 2 & Blok TR 4)
 * Sesuai Citra Satelit Nyata (Gambar 1 & Gambar 2):
 * - Blok TR 2: 30 deret x 8 baris (menghadap barat laut-tenggara)
 * - Blok TR 4: 28 deret x 7 baris
 * - Ketinggian tumpukan acak max 4 tier (deterministik seeded RNG)
 * - Jalan manuver alat berat 20.5m di antara Blok TR 2 dan TR 4
 * - Menggunakan THREE.InstancedMesh dengan instanceColor (1 draw call, 60 FPS)
 * ==============================================================================
 */
export function createContainerYardSubArea() {
  const cyGroup = new THREE.Group();
  cyGroup.name = 'subarea_container_yard';

  const yBase = 1.56;

  // Ukuran standar kontainer TEU (20ft)
  const contWidth = 2.44;  // Sumbu X (lebar baris)
  const contHeight = 2.59; // Sumbu Y (tinggi per tier)
  const contLength = 6.06; // Sumbu Z (panjang deret)

  // Palet Warna Realistis Sesuai Citra Satelit (Gambar 1)
  const palette = [
    new THREE.Color(0x991b1b), // Merah bata / terakota tua
    new THREE.Color(0xb91c1c), // Merah marun
    new THREE.Color(0xc2410c), // Oranye bata
    new THREE.Color(0x1e3a8a), // Biru tua laut
    new THREE.Color(0x2563eb), // Biru Pelindo
    new THREE.Color(0x0284c7), // Biru laut cerah
    new THREE.Color(0x166534), // Hijau kontainer tua
    new THREE.Color(0x047857), // Hijau zamrud / Evergreen
    new THREE.Color(0x0d9488), // Hijau tosca
    new THREE.Color(0xf8fafc), // Putih reefer container
    new THREE.Color(0xe2e8f0), // Abu-abu terang reefer
    new THREE.Color(0x94a3b8), // Abu-abu baja
    new THREE.Color(0x475569)  // Abu-abu gelap industri
  ];

  // Seeded Random Generator (Deterministik)
  let seed = 135792468;
  const rand = () => {
    seed = (seed * 1664525 + 1013904223) % 4294967296;
    return seed / 4294967296;
  };

  const containerList = [];

  // Helper untuk men-generate blok tumpukan kontainer
  const generateBlock = (config) => {
    const { bays, rows, maxTier, xMin, xMax, zMin, zMax } = config;

    const rowSpacing = (xMax - xMin - contWidth) / (rows - 1);
    const baySpacing = (zMax - zMin - contLength) / (bays - 1);

    for (let r = 0; r < rows; r++) {
      const posX = xMin + contWidth / 2 + r * rowSpacing;

      for (let b = 0; b < bays; b++) {
        const posZ = zMin + contLength / 2 + b * baySpacing;

        // Distribusi ketinggian tumpukan (sesuai citra: ada area kosong, 1, 2, 3, max 4)
        // Pola kluster realistis
        const clusterNoise = Math.sin(r * 0.8) * Math.cos(b * 0.4) + rand() * 0.8;
        let tiers = 0;
        if (clusterNoise > 0.6) {
          tiers = Math.min(maxTier, 3 + Math.floor(rand() * 2)); // 3 - 4 tier
        } else if (clusterNoise > 0.1) {
          tiers = 1 + Math.floor(rand() * 3); // 1 - 3 tier
        } else if (clusterNoise > -0.3) {
          tiers = rand() < 0.5 ? 1 : 2;
        } else {
          tiers = rand() < 0.2 ? 1 : 0; // Sebagian celah kosong
        }

        // Warna dominan satu kolom (seringkali 1 stack memiliki warna serupa)
        const baseColIdx = Math.floor(rand() * palette.length);

        for (let t = 0; t < tiers; t++) {
          const posY = yBase + contHeight / 2 + t * contHeight;
          const col = (rand() < 0.75) ? palette[baseColIdx] : palette[Math.floor(rand() * palette.length)];

          containerList.push({
            x: posX,
            y: posY,
            z: posZ,
            color: col
          });
        }
      }
    }
  };

  // Generate Blok TR 2 (8 baris x 30 deret)
  generateBlock(BLOCKS_CONFIG.TR2);

  // Generate Blok TR 4 (7 baris x 28 deret)
  generateBlock(BLOCKS_CONFIG.TR4);

  const count = containerList.length;
  if (count === 0) return cyGroup;

  // InstancedMesh Kontainer 20ft
  const contGeo = new THREE.BoxGeometry(contWidth * 0.98, contHeight * 0.98, contLength * 0.98);
  const contMat = new THREE.MeshStandardMaterial({
    roughness: 0.55,
    metalness: 0.35
  });

  const contMesh = new THREE.InstancedMesh(contGeo, contMat, count);
  contMesh.castShadow = true;
  contMesh.receiveShadow = true;

  const dummy = new THREE.Object3D();

  for (let i = 0; i < count; i++) {
    const c = containerList[i];
    dummy.position.set(c.x, c.y, c.z);
    dummy.updateMatrix();

    contMesh.setMatrixAt(i, dummy.matrix);
    contMesh.setColorAt(i, c.color);
  }

  contMesh.instanceMatrix.needsUpdate = true;
  if (contMesh.instanceColor) contMesh.instanceColor.needsUpdate = true;
  cyGroup.add(contMesh);

  // ----------------------------------------------------------------------------
  // AABB Box Collider untuk Simulasi Truk / Drone
  // ----------------------------------------------------------------------------
  // Collider Blok TR 2
  const tr2 = BLOCKS_CONFIG.TR2;
  const colliderTR2 = new THREE.Group();
  colliderTR2.userData.isCollider = true;
  colliderTR2.userData.aabb = new THREE.Box3(
    new THREE.Vector3(tr2.xMin, yBase, tr2.zMin),
    new THREE.Vector3(tr2.xMax, yBase + tr2.maxTier * contHeight, tr2.zMax)
  );
  cyGroup.add(colliderTR2);

  // Collider Blok TR 4
  const tr4 = BLOCKS_CONFIG.TR4;
  const colliderTR4 = new THREE.Group();
  colliderTR4.userData.isCollider = true;
  colliderTR4.userData.aabb = new THREE.Box3(
    new THREE.Vector3(tr4.xMin, yBase, tr4.zMin),
    new THREE.Vector3(tr4.xMax, yBase + tr4.maxTier * contHeight, tr4.zMax)
  );
  cyGroup.add(colliderTR4);

  return cyGroup;
}
