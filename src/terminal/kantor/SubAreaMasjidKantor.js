import * as THREE from 'three';
import { KANTOR_BOUNDS, MASJID_CONFIG } from './GeoKantor.js';

/**
 * ==============================================================================
 * SubAreaMasjidKantor.js
 * ==============================================================================
 * Membangun Kompleks Masjid Terminal Teluk Lamong Berdasarkan Koordinat GPS & PDF:
 * 1. Bangunan Utama Masjid Berbentuk Kubah Putih Elips/Bundar Modern (31m x 23m)
 *    -7.205030, 112.668805 | -7.204800, 112.668909 | -7.205137, 112.669066 | -7.204901, 112.669161
 * 2. Koridor Penghubung Beratap Putih Menuju Tempat Wudhu
 *    -7.205046, 112.669121 s/d -7.205063, 112.669299
 * 3. Bangunan Tempat Wudhu di Ujung Selatan
 *    -7.205144, 112.669262 s/d -7.205053, 112.669311
 */
export function createSubAreaMasjidKantor() {
  const group = new THREE.Group();
  group.name = 'subarea_masjid_kantor';

  const { yPavement } = KANTOR_BOUNDS;
  const { mainDome, connector, wudhuPavilion } = MASJID_CONFIG;

  // Material Palet Masjid
  const domeWhiteMat = new THREE.MeshStandardMaterial({
    color: 0xf8fafc, // Putih mutiara cerah khas kubah masjid di foto satelit
    roughness: 0.32,
    metalness: 0.15
  });

  const wallCreamWhiteMat = new THREE.MeshStandardMaterial({
    color: 0xe2e8f0,
    roughness: 0.52,
    metalness: 0.1
  });

  const podiumStoneMat = new THREE.MeshStandardMaterial({
    color: 0x94a3b8,
    roughness: 0.72,
    metalness: 0.15
  });

  const glassDarkMat = new THREE.MeshStandardMaterial({
    color: 0x1e3a5f,
    roughness: 0.2,
    metalness: 0.8
  });

  const goldFinialMat = new THREE.MeshStandardMaterial({
    color: 0xfacc15,
    roughness: 0.25,
    metalness: 0.8
  });

  // ----------------------------------------------------------------------------
  // 1. BANGUNAN UTAMA MASJID (KUBAH PUTIH ELIPS/OVAL 31m x 23m)
  // ----------------------------------------------------------------------------
  const masjidMainGroup = new THREE.Group();
  masjidMainGroup.position.set(mainDome.centerX, yPavement, mainDome.centerZ);
  masjidMainGroup.rotation.y = mainDome.rotationY;

  const rMajor = mainDome.radiusX; // 15.5m (sepanjang sumbu X lokal)
  const rMinor = mainDome.radiusZ; // 11.5m (sepanjang sumbu Z lokal)
  const ratioZ = rMinor / rMajor;  // ~0.742

  // A. Podium Dasar Berundak Elips
  const podiumMesh = new THREE.Mesh(
    new THREE.CylinderGeometry(rMajor + 1.8, rMajor + 2.4, 0.75, 36),
    podiumStoneMat
  );
  podiumMesh.scale.set(1.0, 1.0, ratioZ);
  podiumMesh.position.y = 0.375;
  podiumMesh.receiveShadow = true;
  masjidMainGroup.add(podiumMesh);

  // B. Dinding Silinder/Elips Bawah & Kaca Lengkung
  const drumMesh = new THREE.Mesh(
    new THREE.CylinderGeometry(rMajor * 0.92, rMajor * 0.95, mainDome.wallHeight, 36),
    wallCreamWhiteMat
  );
  drumMesh.scale.set(1.0, 1.0, ratioZ);
  drumMesh.position.y = 0.75 + mainDome.wallHeight / 2;
  drumMesh.castShadow = true;
  drumMesh.receiveShadow = true;
  masjidMainGroup.add(drumMesh);

  const glassDrum = new THREE.Mesh(
    new THREE.CylinderGeometry(rMajor * 0.93, rMajor * 0.93, mainDome.wallHeight * 0.58, 36),
    glassDarkMat
  );
  glassDrum.scale.set(1.0, 1.0, ratioZ);
  glassDrum.position.y = 0.75 + mainDome.wallHeight * 0.52;
  masjidMainGroup.add(glassDrum);

  // C. Kubah / Atap Lengkung Elips Putih Besar (Menutupi seluruh ruang sholat utama)
  const domeRadius = rMajor + 0.6;
  const domeHeight = mainDome.domePeakHeight - mainDome.wallHeight;
  const domeGeo = new THREE.SphereGeometry(domeRadius, 36, 20, 0, Math.PI * 2, 0, Math.PI / 2);
  const domeMesh = new THREE.Mesh(domeGeo, domeWhiteMat);
  domeMesh.scale.set(1.0, domeHeight / domeRadius, ratioZ);
  domeMesh.position.y = 0.75 + mainDome.wallHeight - 0.3;
  domeMesh.castShadow = true;
  domeMesh.receiveShadow = true;
  masjidMainGroup.add(domeMesh);

  // Kanopi Mihrab di Ujung Barat Laut (+X lokal) & Foyer Masuk di Tenggara (-X lokal) sesuai PDF
  const mihrabBox = new THREE.Mesh(
    new THREE.BoxGeometry(4.5, mainDome.wallHeight + 1.2, 7.2),
    domeWhiteMat
  );
  mihrabBox.position.set(rMajor * 0.88, (mainDome.wallHeight + 1.2) / 2 + 0.5, 0);
  mihrabBox.castShadow = true;
  masjidMainGroup.add(mihrabBox);

  const foyerBox = new THREE.Mesh(
    new THREE.BoxGeometry(5.2, mainDome.wallHeight + 0.8, 9.5),
    domeWhiteMat
  );
  foyerBox.position.set(-rMajor * 0.86, (mainDome.wallHeight + 0.8) / 2 + 0.5, 0);
  foyerBox.castShadow = true;
  masjidMainGroup.add(foyerBox);

  // Tiang Bulan Sabit Emas di Puncak Kubah
  const finial = new THREE.Mesh(
    new THREE.CylinderGeometry(0.12, 0.18, 2.2, 8),
    goldFinialMat
  );
  finial.position.y = 0.75 + mainDome.domePeakHeight + 0.6;
  masjidMainGroup.add(finial);

  group.add(masjidMainGroup);

  // ----------------------------------------------------------------------------
  // 2. KORIDOR PENGHUBUNG BERATAP PUTIH (DARI MASJID KE TEMPAT WUDHU)
  //    Koordinat GPS: -7.205046, 112.669121 s/d -7.205063, 112.669299
  // ----------------------------------------------------------------------------
  const dx = connector.endX - connector.startX;
  const dz = connector.endZ - connector.startZ;
  const connLen = Math.hypot(dx, dz); // ~18.5m
  const connMidX = (connector.startX + connector.endX) / 2;
  const connMidZ = (connector.startZ + connector.endZ) / 2;
  const connAngle = Math.atan2(dz, -dx);

  const connGroup = new THREE.Group();
  connGroup.position.set(connMidX, yPavement, connMidZ);
  connGroup.rotation.y = connAngle;

  // Lantai Selasar Penghubung
  const walkwayFloor = new THREE.Mesh(
    new THREE.BoxGeometry(connLen + 2.0, 0.35, connector.width),
    podiumStoneMat
  );
  walkwayFloor.position.y = 0.175;
  walkwayFloor.receiveShadow = true;
  connGroup.add(walkwayFloor);

  // Kanopi Atap Putih Koridor Penghubung
  const walkwayRoof = new THREE.Mesh(
    new THREE.BoxGeometry(connLen + 2.6, 0.45, connector.width + 0.8),
    domeWhiteMat
  );
  walkwayRoof.position.y = connector.height;
  walkwayRoof.castShadow = true;
  walkwayRoof.receiveShadow = true;
  connGroup.add(walkwayRoof);

  // Deretan Kolom Penyangga Selasar
  for (let lx = -connLen / 2 + 1.5; lx <= connLen / 2 - 1.5; lx += 4.2) {
    [-connector.width / 2 + 0.5, connector.width / 2 - 0.5].forEach((lz) => {
      const col = new THREE.Mesh(
        new THREE.CylinderGeometry(0.22, 0.22, connector.height, 10),
        wallCreamWhiteMat
      );
      col.position.set(lx, connector.height / 2, lz);
      col.castShadow = true;
      connGroup.add(col);
    });
  }

  group.add(connGroup);

  // ----------------------------------------------------------------------------
  // 3. PAVILIUN TEMPAT WUDHU DI UJUNG SELATAN (MASIH BAGIAN DARI MASJID)
  //    Koordinat GPS: -7.205144, 112.669262 s/d -7.205053, 112.669311
  // ----------------------------------------------------------------------------
  const wudhuGroup = new THREE.Group();
  wudhuGroup.position.set(wudhuPavilion.centerX, yPavement, wudhuPavilion.centerZ);
  wudhuGroup.rotation.y = wudhuPavilion.rotationY;

  const wBody = new THREE.Mesh(
    new THREE.BoxGeometry(wudhuPavilion.lengthX, wudhuPavilion.height, wudhuPavilion.widthZ),
    wallCreamWhiteMat
  );
  wBody.position.y = wudhuPavilion.height / 2;
  wBody.castShadow = true;
  wBody.receiveShadow = true;
  wudhuGroup.add(wBody);

  const wRoof = new THREE.Mesh(
    new THREE.BoxGeometry(wudhuPavilion.lengthX + 1.4, 0.55, wudhuPavilion.widthZ + 1.4),
    domeWhiteMat
  );
  wRoof.position.y = wudhuPavilion.height + 0.25;
  wRoof.castShadow = true;
  wRoof.receiveShadow = true;
  wudhuGroup.add(wRoof);

  group.add(wudhuGroup);

  return group;
}
