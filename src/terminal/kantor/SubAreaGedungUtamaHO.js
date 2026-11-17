import * as THREE from 'three';
import { KANTOR_BOUNDS, MAIN_HO_CONFIG } from './GeoKantor.js';

/**
 * ==============================================================================
 * SubAreaGedungUtamaHO.js
 * ==============================================================================
 * Membangun Gedung Utama Head Office — Graha Pelindo (25.0m x 92.0m):
 * Koordinat GPS: -7.204176, 112.668931 s/d -7.204771, 112.669506
 * Terdiri dari 3 seksi arsitektural sesuai citra satelit (media_1794883270524_e77b250a.png):
 * 1. Seksi Utara (X: -47.5 s/d -88.5): Fasad depan melengkung, dek atap abu-abu,
 *    lis emas-kuning di tepi barat, dan sayap atap putih di tepi timur.
 * 2. Seksi Tengah Lobby (X: -88.5 s/d -114.5): Kanopi drop-off melengkung di sisi barat
 *    serta instalasi unit chiller/HVAC berjajar di atas dek atap.
 * 3. Seksi Menara Selatan (X: -114.5 s/d -139.5): Blok gedung bertingkat lebih tinggi
 *    dengan atap persegi putih bersih (25m x 25m).
 */
export function createSubAreaGedungUtamaHO() {
  const group = new THREE.Group();
  group.name = 'subarea_gedung_utama_ho';

  const { yPavement } = KANTOR_BOUNDS;
  const {
    zMin,
    zMax,
    centerZ,
    northWingXMax,
    northWingXMin,
    midLobbyXMax,
    midLobbyXMin,
    southTowerXMax,
    southTowerXMin
  } = MAIN_HO_CONFIG;

  const widthZ = zMax - zMin; // 25.0m

  // Material Arsitektural Gedung HO
  const wallWhiteMat = new THREE.MeshStandardMaterial({
    color: 0xf1f5f9,
    roughness: 0.45,
    metalness: 0.15
  });

  const curtainGlassMat = new THREE.MeshStandardMaterial({
    color: 0x1e3a5f,
    roughness: 0.15,
    metalness: 0.85
  });

  const roofGreyDeckMat = new THREE.MeshStandardMaterial({
    color: 0x78828c, // Dek beton abu-abu di bagian atas sayap utara & tengah
    roughness: 0.78,
    metalness: 0.15
  });

  const roofDarkGrilleMat = new THREE.MeshStandardMaterial({
    color: 0x334155,
    roughness: 0.65,
    metalness: 0.4
  });

  const roofBrightWhiteMat = new THREE.MeshStandardMaterial({
    color: 0xf8fafc, // Atap putih terang menara selatan & sayap timur
    roughness: 0.35,
    metalness: 0.2
  });

  const goldAccentMat = new THREE.MeshStandardMaterial({
    color: 0xd97706, // Lis aksen kuning-emas di tepi barat sayap utara pada foto satelit
    roughness: 0.4,
    metalness: 0.45
  });

  const hvacUnitMat = new THREE.MeshStandardMaterial({
    color: 0xcbd5e1,
    roughness: 0.5,
    metalness: 0.5
  });

  // ----------------------------------------------------------------------------
  // 1. SEKSI UTARA / DEPAN (X: -47.5 s/d -88.5, Panjang 41.0m, Tinggi 13.5m)
  // ----------------------------------------------------------------------------
  const northLenX = Math.abs(northWingXMax - northWingXMin); // 41.0m
  const northMidX = (northWingXMax + northWingXMin) / 2;     // -68.0
  const northH = 13.5;

  // Badan utama sayap utara
  const northBody = new THREE.Mesh(
    new THREE.BoxGeometry(northLenX - 4.0, northH, widthZ),
    wallWhiteMat
  );
  northBody.position.set(northMidX - 2.0, yPavement + northH / 2, centerZ);
  northBody.castShadow = true;
  northBody.receiveShadow = true;
  group.add(northBody);

  // Fasad Depan Melengkung Ikonik di Ujung Utara (X = -47.5 s/d -53.5)
  const curvedFront = new THREE.Mesh(
    new THREE.CylinderGeometry(widthZ / 2, widthZ / 2, northH + 0.4, 24, 1, false, 0, Math.PI),
     roofGreyDeckMat
  );
  curvedFront.scale.set(0.38, 1.0, 1.0); // Elips pipih melengkung ke arah utara (+X)
  curvedFront.position.set(northWingXMax - 4.5, yPavement + (northH + 0.4) / 2, centerZ);
  curvedFront.castShadow = true;
  group.add(curvedFront);

  // Kaca Curtain Wall Mengelilingi Sayap Utara
  const northGlass = new THREE.Mesh(
    new THREE.BoxGeometry(northLenX - 5.0, northH * 0.68, widthZ + 0.16),
    curtainGlassMat
  );
  northGlass.position.set(northMidX - 2.0, yPavement + northH * 0.54, centerZ);
  group.add(northGlass);

  // Dek Atap Abu-abu Sayap Utara (Sisi Barat Z: 728.2 s/d 746.0)
  const northRoofDeck = new THREE.Mesh(
    new THREE.BoxGeometry(northLenX - 4.2, 0.45, 17.8),
    roofGreyDeckMat
  );
  northRoofDeck.position.set(northMidX - 2.0, yPavement + northH + 0.22, 737.1);
  northRoofDeck.receiveShadow = true;
  group.add(northRoofDeck);

  // Skylight / Grille Gelap di Ujung Utara Atap (terlihat di foto satelit)
  const northSkylight = new THREE.Mesh(
    new THREE.BoxGeometry(5.5, 0.3, 16.0),
    roofDarkGrilleMat
  );
  northSkylight.position.set(northWingXMax - 7.5, yPavement + northH + 0.45, 737.0);
  group.add(northSkylight);

  // Sayap Atap Putih Memanjang di Tepi Timur Sayap Utara (Z: 746.0 s/d 753.0)
  const eastWhiteRoof = new THREE.Mesh(
    new THREE.BoxGeometry(northLenX - 6.0, 0.85, 7.2),
    roofBrightWhiteMat
  );
  eastWhiteRoof.position.set(northMidX - 3.0, yPavement + northH + 0.42, 749.4);
  eastWhiteRoof.castShadow = true;
  group.add(eastWhiteRoof);

  // Lis Parapet Kuning-Emas di Tepi Barat Sayap Utara (Z = 728.2)
  const westGoldTrim = new THREE.Mesh(
    new THREE.BoxGeometry(northLenX - 4.0, 0.9, 0.65),
    goldAccentMat
  );
  westGoldTrim.position.set(northMidX - 2.0, yPavement + northH + 0.45, zMin + 0.32);
  group.add(westGoldTrim);

  // ----------------------------------------------------------------------------
  // 2. SEKSI TENGAH / LOBBY & ROOFTOP M.E. (X: -88.5 s/d -114.5, Panjang 26.0m)
  // ----------------------------------------------------------------------------
  const midLenX = Math.abs(midLobbyXMax - midLobbyXMin); // 26.0m
  const midCenterX = (midLobbyXMax + midLobbyXMin) / 2;   // -101.5
  const midH = 14.2;

  const midBody = new THREE.Mesh(
    new THREE.BoxGeometry(midLenX, midH, widthZ),
    wallWhiteMat
  );
  midBody.position.set(midCenterX, yPavement + midH / 2, centerZ);
  midBody.castShadow = true;
  midBody.receiveShadow = true;
  group.add(midBody);

  const midRoof = new THREE.Mesh(
    new THREE.BoxGeometry(midLenX + 0.4, 0.45, widthZ + 0.4),
    roofGreyDeckMat
  );
  midRoof.position.set(midCenterX, yPavement + midH + 0.22, centerZ);
  group.add(midRoof);

  // Kanopi Drop-off Lobby Melengkung di Sisi Barat (Menghadap Jalan Internal Z = 724..728)
  const dropOffCanopy = new THREE.Mesh(
    new THREE.BoxGeometry(20.0, 0.55, 5.2),
    roofBrightWhiteMat
  );
  dropOffCanopy.position.set(midCenterX - 1.5, yPavement + 5.2, zMin - 2.4);
  dropOffCanopy.castShadow = true;
  group.add(dropOffCanopy);

  // Grid Unit Chiller / HVAC di Atas Atap Tengah (Terlihat jelas di foto satelit)
  for (let hx = -92.0; hx >= -106.0; hx -= 3.2) {
    for (let hz = 735.5; hz <= 743.5; hz += 2.6) {
      const hvac = new THREE.Mesh(
        new THREE.BoxGeometry(1.9, 1.3, 1.6),
        hvacUnitMat
      );
      hvac.position.set(hx, yPavement + midH + 0.9, hz);
      hvac.castShadow = true;
      group.add(hvac);
    }
  }

  // ----------------------------------------------------------------------------
  // 3. SEKSI MENARA SELATAN BERATAP PUTIH PERSEGI (X: -114.5 s/d -139.5, 25m x 25m)
  // ----------------------------------------------------------------------------
  const southLenX = Math.abs(southTowerXMax - southTowerXMin); // 25.0m
  const southCenterX = (southTowerXMax + southTowerXMin) / 2;   // -127.0
  const southH = 18.2; // Lebih tinggi dari sayap utara

  const southTowerBody = new THREE.Mesh(
    new THREE.BoxGeometry(southLenX, southH, widthZ + 1.5),
    wallWhiteMat
  );
  southTowerBody.position.set(southCenterX, yPavement + southH / 2, centerZ);
  southTowerBody.castShadow = true;
  southTowerBody.receiveShadow = true;
  group.add(southTowerBody);

  // Pita Kaca Bertingkat pada Menara Selatan
  [5.5, 9.8, 14.1].forEach((gy) => {
    const glassBand = new THREE.Mesh(
      new THREE.BoxGeometry(southLenX + 0.18, 2.4, widthZ + 1.68),
      curtainGlassMat
    );
    glassBand.position.set(southCenterX, yPavement + gy, centerZ);
    group.add(glassBand);
  });

  // Atap Persegi Putih Bersih di Puncak Menara Selatan (Sangat kontras di foto satelit)
  const southWhiteRoof = new THREE.Mesh(
    new THREE.BoxGeometry(southLenX + 1.6, 0.85, widthZ + 2.8),
    roofBrightWhiteMat
  );
  southWhiteRoof.position.set(southCenterX, yPavement + southH + 0.42, centerZ);
  southWhiteRoof.castShadow = true;
  southWhiteRoof.receiveShadow = true;
  group.add(southWhiteRoof);

  // ----------------------------------------------------------------------------
  // 4. POS JAGA / GEDUNG UTILITAS KECIL DI UTARA GEDUNG HO (Z = 749.0, X = -31.5)
  //    Terlihat di sudut kanan-atas foto satelit ke-2 dan denah PDF
  // ----------------------------------------------------------------------------
  const neGuardBldg = new THREE.Mesh(
    new THREE.BoxGeometry(7.5, 3.8, 7.5),
    wallWhiteMat
  );
  neGuardBldg.position.set(-31.5, yPavement + 1.9, 749.0);
  neGuardBldg.castShadow = true;
  group.add(neGuardBldg);

  const neGuardRoof = new THREE.Mesh(
    new THREE.BoxGeometry(8.2, 0.4, 8.2),
    roofGreyDeckMat
  );
  neGuardRoof.position.set(-31.5, yPavement + 3.9, 749.0);
  group.add(neGuardRoof);

  return group;
}
