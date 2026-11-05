import * as THREE from 'three';
import { BERTH_CONFIG, STS_CRANES_PLACEMENT } from './GeoDermaga.js';
import { createSTSCrane } from '../../assets/equipment/createBerthCranes.js';
import { createConveyorGallery } from '../../assets/industrial/createConveyorGallery.js';

/**
 * ==============================================================================
 * SubAreaDermagaCurahKering.js
 * ==============================================================================
 * Membangun Segmen Dermaga Curah Kering (Poligon 6 Titik L-Shape | X: +16.0 s/d +265.5):
 * - Menyatu langsung tanpa pemisah dengan ujung Barat Laut Dermaga Petikemas (X = +16.0)
 * - Pelataran L-shape Menara Transfer (X: +16.0 s/d +80.0, Z: 3430.0 s/d 3516.0)
 * - Jari Dermaga Curah Kering (X: +80.0 s/d +265.5, Z: 3486.0 s/d 3516.0, lebar 30.0m)
 * - Jalur Jetty Conveyor Curah Kering & Menara Siku Beratap Merah
 * - 2 unit STS Crane di atas Rel STS Sisi Luar yang menerus dari Dermaga Petikemas
 * - Mooring Dolphin ujung Barat Laut & deretan Dolphin/Pelampung Tambat di kolam dalam
 */
export function createSubAreaDermagaCurahKering() {
  const group = new THREE.Group();
  group.name = 'subarea_dermaga_curah_kering';

  const {
    yDeck,
    deckThickness,
    railGaugeZ,
    curahKering
  } = BERTH_CONFIG;

  // Material Palet (Diseragamkan dengan warna jalan aspal standar 0x22262e)
  const concreteDeckMat = new THREE.MeshStandardMaterial({
    color: 0x22262e,
    roughness: 0.88,
    metalness: 0.08
  });

  const copingEdgeMat = new THREE.MeshStandardMaterial({
    color: 0x94a3b8,
    roughness: 0.7,
    metalness: 0.15
  });

  const pileConcreteMat = new THREE.MeshStandardMaterial({
    color: 0x64748b,
    roughness: 0.85,
    metalness: 0.15
  });

  const rubberFenderMat = new THREE.MeshStandardMaterial({
    color: 0x18181b,
    roughness: 0.9,
    metalness: 0.1
  });

  const bollardYellowMat = new THREE.MeshStandardMaterial({
    color: 0xfacc15,
    roughness: 0.45,
    metalness: 0.3
  });

  const towerWallMat = new THREE.MeshStandardMaterial({
    color: 0xdbe2ea,
    roughness: 0.55,
    metalness: 0.25
  });

  const redRoofMat = new THREE.MeshStandardMaterial({
    color: 0xb91c1c, // Atap merah khas menara transfer curah kering
    roughness: 0.5,
    metalness: 0.25
  });

  const catwalkSteelMat = new THREE.MeshStandardMaterial({
    color: 0x94a3b8,
    roughness: 0.45,
    metalness: 0.6
  });

  // ----------------------------------------------------------------------------
  // 1. DEK BETON POLIGON 6-TITIK (L-SHAPE) MENYATU TANPA PEMISAH
  // ----------------------------------------------------------------------------
  // A. Bagian Pangkal L-Shape (X: +16.0 s/d +80.0, Z: 3430.0 s/d 3516.0 -> 64.0m x 86.0m)
  const baseLenX = curahKering.xStepL - curahKering.xMin; // 64.0m
  const baseMidX = (curahKering.xStepL + curahKering.xMin) / 2; // +48.0
  const baseWidthZ = curahKering.zMax - curahKering.zPlatformMin; // 86.0m
  const baseMidZ = (curahKering.zMax + curahKering.zPlatformMin) / 2; // 3473.0

  const basePlatformDeck = new THREE.Mesh(
    new THREE.BoxGeometry(baseLenX, deckThickness, baseWidthZ),
    concreteDeckMat
  );
  basePlatformDeck.position.set(baseMidX, yDeck - deckThickness / 2, baseMidZ);
  basePlatformDeck.receiveShadow = true;
  basePlatformDeck.castShadow = true;
  group.add(basePlatformDeck);

  // B. Bagian Jari Dermaga / Pier Finger Barat Laut (X: +80.0 s/d +265.5, Z: 3486.0 s/d 3516.0 -> 185.5m x 30.0m)
  const pierLenX = curahKering.xMax - curahKering.xStepL; // 185.5m
  const pierMidX = (curahKering.xMax + curahKering.xStepL) / 2; // +172.75
  const pierWidthZ = curahKering.zMax - curahKering.zPierMin; // 30.0m
  const pierMidZ = (curahKering.zMax + curahKering.zPierMin) / 2; // 3501.0

  const pierFingerDeck = new THREE.Mesh(
    new THREE.BoxGeometry(pierLenX, deckThickness, pierWidthZ),
    concreteDeckMat
  );
  pierFingerDeck.position.set(pierMidX, yDeck - deckThickness / 2, pierMidZ);
  pierFingerDeck.receiveShadow = true;
  pierFingerDeck.castShadow = true;
  group.add(pierFingerDeck);

  // Kanstin Tepi Luar (+Z menerus dari X = +16.0 s/d +265.5) & Tepi Ujung NW (+X = 265.5)
  const totalOuterLenX = curahKering.xMax - curahKering.xMin; // 249.5m
  const outerCoping = new THREE.Mesh(
    new THREE.BoxGeometry(totalOuterLenX, 0.35, 1.2),
    copingEdgeMat
  );
  outerCoping.position.set(
    (curahKering.xMax + curahKering.xMin) / 2,
    yDeck + 0.12,
    curahKering.zMax - 0.6
  );
  group.add(outerCoping);

  const innerPierCoping = new THREE.Mesh(
    new THREE.BoxGeometry(pierLenX, 0.35, 1.0),
    copingEdgeMat
  );
  innerPierCoping.position.set(pierMidX, yDeck + 0.12, curahKering.zPierMin + 0.5);
  group.add(innerPierCoping);

  const nwTipCoping = new THREE.Mesh(
    new THREE.BoxGeometry(1.2, 0.35, pierWidthZ),
    copingEdgeMat
  );
  nwTipCoping.position.set(curahKering.xMax - 0.6, yDeck + 0.12, pierMidZ);
  group.add(nwTipCoping);

  // ----------------------------------------------------------------------------
  // 2. TIANG PANCANG LAUT (SEA PILES) DI BAWAH DERMAGA CURAH KERING
  // ----------------------------------------------------------------------------
  const pileCoords = [];
  // Tiang di bawah Pelataran L-Shape
  for (let x = curahKering.xMin + 8.0; x <= curahKering.xStepL; x += 16.0) {
    for (let z = curahKering.zPlatformMin + 6.0; z <= curahKering.zMax - 4.0; z += 18.0) {
      pileCoords.push({ x, z });
    }
  }
  // Tiang di bawah Jari Dermaga Curah Kering
  for (let x = curahKering.xStepL + 14.0; x <= curahKering.xMax - 4.0; x += 16.0) {
    [3489.0, 3501.0, 3513.0].forEach((z) => {
      pileCoords.push({ x, z });
    });
  }

  const pileHeight = yDeck + 3.5;
  const pileGeo = new THREE.CylinderGeometry(0.5, 0.5, pileHeight, 10);
  const pileInst = new THREE.InstancedMesh(pileGeo, pileConcreteMat, pileCoords.length);
  const dummy = new THREE.Object3D();

  pileCoords.forEach((pt, idx) => {
    dummy.position.set(pt.x, yDeck - deckThickness - pileHeight / 2, pt.z);
    dummy.rotation.set(0, 0, 0);
    dummy.updateMatrix();
    pileInst.setMatrixAt(idx, dummy.matrix);
  });
  pileInst.instanceMatrix.needsUpdate = true;
  group.add(pileInst);

  // Fender Karet & Bollard Kuning di Sisi Luar Dermaga Curah Kering
  for (let fx = curahKering.xMin + 12.0; fx <= curahKering.xMax - 8.0; fx += 18.0) {
    const fender = new THREE.Mesh(
      new THREE.BoxGeometry(2.6, 1.5, 0.95),
      rubberFenderMat
    );
    fender.position.set(fx, yDeck - 0.55, curahKering.zMax + 0.45);
    group.add(fender);

    const bollard = new THREE.Mesh(
      new THREE.CylinderGeometry(0.28, 0.35, 0.75, 10),
      bollardYellowMat
    );
    bollard.position.set(fx, yDeck + 0.38, curahKering.zMax - 0.8);
    group.add(bollard);
  }

  // ----------------------------------------------------------------------------
  // 3. SISTEM CONVEYOR DERMAGA CURAH KERING & MENARA TRANSFER BERATAP MERAH
  //    Sesuai Citra Satelit:
  //    - Menara Siku Timur Laut (X = 19.5, Z = 3495.5) menerima 2-lane conveyor dari
  //      Menara Transfer Dermaga (X = 19.5, Z = 3444.5)
  //    - Menara Transfer Tengah Beratap Merah di tekukan dalam L-Shape (X = 86.0, Z = 3488.5)
  //    - Jetty Bulk Conveyor memanjang di sepanjang jari dermaga (X = 19.5 s/d 258.0)
  // ----------------------------------------------------------------------------
  const buildRedRoofTower = (wX, wZ, h) => {
    const tGrp = new THREE.Group();
    const body = new THREE.Mesh(new THREE.BoxGeometry(wX, h, wZ), towerWallMat);
    body.position.y = h / 2;
    body.castShadow = true;
    tGrp.add(body);

    const roof = new THREE.Mesh(new THREE.BoxGeometry(wX + 1.0, 0.9, wZ + 1.0), redRoofMat);
    roof.position.y = h + 0.45;
    roof.castShadow = true;
    tGrp.add(roof);
    return tGrp;
  };

  // A. Menara Siku Belokan Conveyor (X = 19.5, Z = 3495.5)
  const cornerJunctionTower = buildRedRoofTower(10.5, 10.5, 17.5);
  cornerJunctionTower.position.set(19.5, yDeck, 3495.5);
  group.add(cornerJunctionTower);

  // B. Menara Transfer Beratap Merah di Tekukan Dalam L-Shape (Terlihat jelas di foto satelit: X = 86.0, Z = 3488.0)
  const midRedTower = buildRedRoofTower(11.5, 11.5, 18.5);
  midRedTower.position.set(86.0, yDeck, 3488.0);
  group.add(midRedTower);

  // C. 2-Lane Conveyor Penghubung di Atas Pelataran L-Shape (Z: 3444.5 s/d 3495.5 pada X = 17.2 & 21.8)
  [17.2, 21.8].forEach((lx) => {
    group.add(
      createConveyorGallery({
        start: { x: lx, y: 10.2, z: 3444.5 },
        end: { x: lx, y: 11.5, z: 3495.5 },
        width: 2.9,
        height: 2.9,
        isCircular: true,
        withSupports: true,
        supportSpacing: 16.0,
        groundY: yDeck
      })
    );
  });

  // D. Jetty Bulk Conveyor Sepanjang Jari Dermaga Curah Kering (X: 19.5 s/d 258.0 pada Z = 3495.5)
  group.add(
    createConveyorGallery({
      start: { x: 19.5, y: 11.5, z: 3495.5 },
      end: { x: 258.0, y: 11.5, z: 3495.5 },
      width: 3.4,
      height: 3.2,
      isCircular: true,
      withSupports: true,
      supportSpacing: 20.0,
      groundY: yDeck
    })
  );

  // ----------------------------------------------------------------------------
  // 4. 2 UNIT STS CRANE DI SEGMEN DERMAGA CURAH KERING
  //    Berjalan di atas Rel STS Sisi Luar (+Z) yang terhubung menerus dari Petikemas
  // ----------------------------------------------------------------------------
  const cukerCranes = STS_CRANES_PLACEMENT.filter((c) => c.segment === 'CURAH_KERING');
  cukerCranes.forEach((cfg) => {
    const sts = createSTSCrane({
      railGaugeZ,
      boomDirectionZ: cfg.boomDirectionZ,
      colorScheme: cfg.colorScheme,
      hasBulkHopper: cfg.hasBulkHopper,
      trolleyReachRatio: cfg.trolleyReachRatio
    });
    sts.position.set(cfg.x, yDeck + 0.18, cfg.z);
    group.add(sts);
  });

  // ----------------------------------------------------------------------------
  // 5. MOORING DOLPHIN UJUNG BARAT LAUT & BARISAN DOLPHIN KOLAM DALAM
  //    (Sesuai titik-titik struktur putih di ujung atas dan kiri atas foto satelit)
  // ----------------------------------------------------------------------------
  // A. Mooring Dolphin Ujung Barat Laut (X = 286.0, Z = 3504.0) + Jembatan Catwalk
  const tipDolphin = new THREE.Mesh(
    new THREE.BoxGeometry(7.5, 2.6, 7.5),
    concreteDeckMat
  );
  tipDolphin.position.set(286.0, yDeck - 0.5, 3504.0);
  tipDolphin.castShadow = true;
  group.add(tipDolphin);

  const tipBollard = new THREE.Mesh(
    new THREE.CylinderGeometry(0.35, 0.42, 0.9, 10),
    bollardYellowMat
  );
  tipBollard.position.set(286.0, yDeck + 1.1, 3504.0);
  group.add(tipBollard);

  const catwalkBridge = new THREE.Mesh(
    new THREE.BoxGeometry(22.0, 0.45, 1.8),
    catwalkSteelMat
  );
  catwalkBridge.position.set(275.5, yDeck + 0.25, 3504.0);
  catwalkBridge.castShadow = true;
  group.add(catwalkBridge);

  // B. 2 Baris Mooring Dolphins / Ponton Tambat Putih di Kolam Dalam (X: 96 s/d 216, Z = 3452 & 3466)
  for (let dx = 98.0; dx <= 210.0; dx += 22.0) {
    [3450.0, 3466.0].forEach((dz) => {
      const innerDolphin = new THREE.Mesh(
        new THREE.BoxGeometry(4.2, 2.2, 4.2),
        concreteDeckMat
      );
      innerDolphin.position.set(dx, 1.2, dz);
      innerDolphin.castShadow = true;
      group.add(innerDolphin);

      const dPile = new THREE.Mesh(
        new THREE.CylinderGeometry(0.45, 0.45, 3.5, 8),
        pileConcreteMat
      );
      dPile.position.set(dx, -0.5, dz);
      group.add(dPile);
    });
  }

  return group;
}
