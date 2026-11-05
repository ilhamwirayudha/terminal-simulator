import * as THREE from 'three';
import { createGrainSilo } from '../../assets/industrial/createGrainSilo.js';
import {
  CUKER_TERMINAL_BOUNDS,
  ORU_CONFIG,
  MID_CORRIDOR_CONFIG
} from './GeoCurahKering.js';

/**
 * ==============================================================================
 * Sub-Area: Fasilitas Operasional Depan (PMK, GWT, HVS-3, Weighbridge),
 *           Koridor Gudang Tengah (58.5m), dan Area ORU (83m)
 * ==============================================================================
 */
export function createSubAreaOperasionalCuker() {
  const opsGroup = new THREE.Group();
  opsGroup.name = 'subarea_operasional_cuker';

  const { yPavement } = CUKER_TERMINAL_BOUNDS;

  // Shared Materials
  const wallLightMat = new THREE.MeshStandardMaterial({
    color: 0xe2e8f0,
    roughness: 0.55,
    metalness: 0.15
  });
  const wallConcreteMat = new THREE.MeshStandardMaterial({
    color: 0xcbd5e1,
    roughness: 0.72,
    metalness: 0.1
  });
  const roofWhiteMat = new THREE.MeshStandardMaterial({
    color: 0xf8fafc,
    roughness: 0.35,
    metalness: 0.2
  });
  const roofGreyMat = new THREE.MeshStandardMaterial({
    color: 0x94a3b8,
    roughness: 0.52,
    metalness: 0.3
  });
  const roofDarkGreyMat = new THREE.MeshStandardMaterial({
    color: 0x64748b,
    roughness: 0.6,
    metalness: 0.25
  });
  const roadLightConcreteMat = new THREE.MeshStandardMaterial({
    color: 0x22262e,
    roughness: 0.88,
    metalness: 0.08
  });
  const darkAsphaltMat = new THREE.MeshStandardMaterial({
    color: 0x22262e,
    roughness: 0.88,
    metalness: 0.08
  });
  const gwtWaterChannelMat = new THREE.MeshStandardMaterial({
    color: 0x1e293b,
    roughness: 0.25,
    metalness: 0.5
  });
  const steelFrameMat = new THREE.MeshStandardMaterial({
    color: 0x64748b,
    roughness: 0.5,
    metalness: 0.65
  });
  const greenIslandMat = new THREE.MeshStandardMaterial({
    color: 0x3f5238,
    roughness: 0.92
  });

  // Helper pembuat gedung beratap pelana atau datar
  const createBuildingBox = (wX, hY, wZ, wallMat, roofMat, pitched = false) => {
    const bGroup = new THREE.Group();
    const body = new THREE.Mesh(new THREE.BoxGeometry(wX, hY, wZ), wallMat);
    body.position.y = hY / 2;
    body.castShadow = true;
    body.receiveShadow = true;
    bGroup.add(body);

    if (pitched) {
      const peakH = Math.min(3.8, wZ * 0.14);
      const halfW = (wZ + 1.0) / 2;
      const shape = new THREE.Shape();
      shape.moveTo(-halfW, 0);
      shape.lineTo(0, peakH);
      shape.lineTo(halfW, 0);
      shape.closePath();

      const rGeo = new THREE.ExtrudeGeometry(shape, { depth: wX + 1.0, bevelEnabled: false });
      const rMesh = new THREE.Mesh(rGeo, roofMat);
      rMesh.rotation.y = Math.PI / 2;
      rMesh.position.set(-(wX + 1.0) / 2, hY, 0);
      rMesh.castShadow = true;
      rMesh.receiveShadow = true;
      bGroup.add(rMesh);
    } else {
      const roof = new THREE.Mesh(new THREE.BoxGeometry(wX + 0.8, 0.4, wZ + 0.8), roofMat);
      roof.position.y = hY + 0.2;
      roof.castShadow = true;
      rGroupAdd(bGroup, roof);
    }
    return bGroup;
  };

  function rGroupAdd(g, m) {
    m.receiveShadow = true;
    g.add(m);
  }

  // ============================================================================
  // BAGIAN 1: DEPAN / SELATAN BULK AREA (PMK, GWT, HVS-3, WEIGHBRIDGE & LOADING)
  //           (Z: 2260 s/d 2462 | X: 21.4 s/d 100.0)
  // ============================================================================
  const bulkFrontGroup = new THREE.Group();
  bulkFrontGroup.name = 'bulk_front_operational_zone';

  // 1A. Apron Aspal Gelap Area Parkir & Manuver Depan PMK / HVS-3 (X: 22 s/d 55, Z: 2295 s/d 2450)
  const frontAsphalt = new THREE.Mesh(
    new THREE.PlaneGeometry(34.0, 156.0),
    darkAsphaltMat
  );
  frontAsphalt.rotation.x = -Math.PI / 2;
  frontAsphalt.position.set(38.5, yPavement + 0.01, 2373.0);
  frontAsphalt.receiveShadow = true;
  bulkFrontGroup.add(frontAsphalt);

  // 1B. Saluran / Kolam GWT Gelap Memanjang (sesuai pita gelap di AutoCAD & citra satelit)
  const gwtChannel = new THREE.Mesh(
    new THREE.BoxGeometry(5.5, 0.22, 128.0),
    gwtWaterChannelMat
  );
  gwtChannel.position.set(53.5, yPavement + 0.11, 2368.0);
  bulkFrontGroup.add(gwtChannel);

  // 1C. Gedung PMK (Pemadam Kebakaran) - Z = 2328, X = 36 (sesuai label "PMK" di AutoCAD)
  const pmkBuilding = createBuildingBox(16.0, 6.5, 22.0, wallLightMat, roofGreyMat, false);
  pmkBuilding.position.set(36.0, yPavement, 2328.0);
  bulkFrontGroup.add(pmkBuilding);

  // Tangki GWT 140m³ di sebelah kanan PMK (Z = 2356, X = 37)
  const gwtTank = createBuildingBox(11.0, 4.2, 14.0, wallConcreteMat, roofDarkGreyMat, false);
  gwtTank.position.set(37.0, yPavement, 2356.0);
  bulkFrontGroup.add(gwtTank);

  // 1D. Gedung HVS-3 (High Voltage Substation / Gardu Induk Memanjang) - Z = 2398, X = 35
  const hvsBuilding = createBuildingBox(13.5, 6.2, 48.0, wallLightMat, roofGreyMat, false);
  hvsBuilding.position.set(35.0, yPavement, 2398.0);
  bulkFrontGroup.add(hvsBuilding);

  // Gedung Main Exit Gate / Pos Keluar di Kanan Bawah (Z = 2450, X = 36)
  const exitGateHouse = createBuildingBox(16.0, 5.5, 16.0, wallLightMat, roofWhiteMat, false);
  exitGateHouse.position.set(36.0, yPavement, 2450.0);
  bulkFrontGroup.add(exitGateHouse);

  // 1E. Main Entrance Weighbridges (4 Lajur Jembatan Timbang di Kiri Bawah Bulk Area: Z = 2264 s/d 2284, X = 38)
  [2266.0, 2271.5, 2277.0, 2282.5].forEach((wz) => {
    const wbDeck = new THREE.Mesh(
      new THREE.BoxGeometry(18.0, 0.25, 3.4),
      steelFrameMat
    );
    wbDeck.position.set(39.0, yPavement + 0.125, wz);
    wbDeck.receiveShadow = true;
    bulkFrontGroup.add(wbDeck);

    // Booth Timbangan Kecil di Samping
    const wbBooth = new THREE.Mesh(
      new THREE.BoxGeometry(4.5, 2.8, 1.4),
      wallLightMat
    );
    wbBooth.position.set(39.0, yPavement + 1.4, wz + 2.2);
    wbBooth.castShadow = true;
    bulkFrontGroup.add(wbBooth);
  });

  // 1F. 4 Stasiun Hopper / Truck Loading Stations di Selatan Silo & Flat Storage (X = 82.0)
  [2288.0, 2338.0, 2396.0, 2442.0].forEach((lz) => {
    const station = createBuildingBox(22.0, 7.5, 10.5, wallLightMat, roofWhiteMat, false);
    station.position.set(82.0, yPavement, lz);
    bulkFrontGroup.add(station);
  });

  // 1G. Deretan Bangunan Penunjang di Tepi Kanan / Timur Laut (Z = 2474.5)
  // Sesuai AutoCAD: Power Station (28x12m), Main Office (50x12m), Fire Fighting
  const powerStation = createBuildingBox(28.0, 6.0, 9.5, wallLightMat, roofGreyMat, false);
  powerStation.position.set(145.0, yPavement, 2474.5);
  bulkFrontGroup.add(powerStation);

  const mainOfficeRight = createBuildingBox(42.0, 6.2, 9.5, wallLightMat, roofWhiteMat, false);
  mainOfficeRight.position.set(215.0, yPavement, 2474.5);
  bulkFrontGroup.add(mainOfficeRight);

  const fireFightingRight = createBuildingBox(24.0, 5.8, 9.5, wallLightMat, roofGreyMat, false);
  fireFightingRight.position.set(295.0, yPavement, 2474.5);
  bulkFrontGroup.add(fireFightingRight);

  opsGroup.add(bulkFrontGroup);

  // ============================================================================
  // BAGIAN 2: KORIDOR TENGAH (Z: 2200.6 s/d 2259.1, Lebar 58.5m)
  //           2 Gudang Tengah, 4 Silo Kecil, dan Rangka Baja
  // ============================================================================
  const midGroup = new THREE.Group();
  midGroup.name = 'mid_corridor_warehouses';

  // 2A. Gudang Tengah Atas (Atap Pelana Abu-abu: 62m x 36m)
  const gwCfg = MID_CORRIDOR_CONFIG.greyWarehouse;
  const greyWh = createBuildingBox(
    gwCfg.lengthX,
    gwCfg.height,
    gwCfg.widthZ,
    wallConcreteMat,
    roofGreyMat,
    true
  );
  greyWh.position.set(gwCfg.centerX, yPavement, gwCfg.centerZ);
  midGroup.add(greyWh);

  // 2B. Gudang Tengah Bawah (Atap Pelana Putih Terang: 40m x 35m)
  const wwCfg = MID_CORRIDOR_CONFIG.whiteWarehouse;
  const whiteWh = createBuildingBox(
    wwCfg.lengthX,
    wwCfg.height,
    wwCfg.widthZ,
    wallLightMat,
    roofWhiteMat,
    true
  );
  whiteWh.position.set(wwCfg.centerX, yPavement, wwCfg.centerZ);
  midGroup.add(whiteWh);

  // 2C. 4 Silo Silinder Kecil di Selatan Gudang Putih
  MID_CORRIDOR_CONFIG.smallSilos.forEach((sc) => {
    const sMesh = createGrainSilo({
      radius: sc.r,
      cylinderHeight: sc.h,
      roofHeight: 2.6,
      plinthHeight: 0.8,
      numRings: 3
    });
    sMesh.position.set(sc.x, yPavement, sc.z);
    midGroup.add(sMesh);
  });

  // 2D. Struktur Rangka Baja Terbuka (Steel Portal Grid di X = 78.0, Z = 2228.0)
  const steelGridGroup = new THREE.Group();
  steelGridGroup.position.set(78.0, yPavement, 2228.0);

  const gridPad = new THREE.Mesh(
    new THREE.BoxGeometry(36.0, 0.25, 34.0),
    wallConcreteMat
  );
  gridPad.position.y = 0.125;
  gridPad.receiveShadow = true;
  steelGridGroup.add(gridPad);

  // Balok & Kolom Kisi Baja (terlihat jelas sebagai grid di citra satelit)
  for (let gx = -15.0; gx <= 15.0; gx += 6.0) {
    const beamX = new THREE.Mesh(new THREE.BoxGeometry(0.45, 0.45, 32.0), steelFrameMat);
    beamX.position.set(gx, 6.2, 0);
    beamX.castShadow = true;
    steelGridGroup.add(beamX);

    for (let gz = -15.0; gz <= 15.0; gz += 6.0) {
      const col = new THREE.Mesh(new THREE.BoxGeometry(0.4, 6.2, 0.4), steelFrameMat);
      col.position.set(gx, 3.1, gz);
      col.castShadow = true;
      steelGridGroup.add(col);
    }
  }
  for (let gz = -15.0; gz <= 15.0; gz += 6.0) {
    const beamZ = new THREE.Mesh(new THREE.BoxGeometry(32.0, 0.45, 0.45), steelFrameMat);
    beamZ.position.set(0, 6.2, gz);
    steelGridGroup.add(beamZ);
  }
  midGroup.add(steelGridGroup);

  // Pos Gerbang Koridor Tengah di Dekat Jalan (X = 28.0, Z = 2244.0)
  const midGateHouse = createBuildingBox(7.5, 4.2, 11.0, wallLightMat, roofWhiteMat, false);
  midGateHouse.position.set(28.0, yPavement, 2244.0);
  midGroup.add(midGateHouse);

  opsGroup.add(midGroup);

  // ============================================================================
  // BAGIAN 3: AREA ORU (Z: 2117.6 s/d 2200.6, Lebar 83m)
  //           Jalan Loop Internal, Kanopi Timbangan, Gedung, & 14 Tangki Hitam
  // ============================================================================
  const oruGroup = new THREE.Group();
  oruGroup.name = 'oru_operational_zone';

  // 3A. Jalan Beton Terang Loop Internal ORU
  // Batang jalan kanan lurus dari jalan utama (X: 21.4 s/d 215.0, Z = 2171.0, lebar 11m)
  const oruMainRoad = new THREE.Mesh(
    new THREE.PlaneGeometry(193.6, 11.0),
    roadLightConcreteMat
  );
  oruMainRoad.rotation.x = -Math.PI / 2;
  oruMainRoad.position.set(118.2, yPavement + 0.012, 2171.0);
  oruMainRoad.receiveShadow = true;
  oruGroup.add(oruMainRoad);

  // Loop U-Turn Kiri Bawah (X: 36 s/d 114, Z: 2134 s/d 2171)
  const oruLoopPlate = new THREE.Mesh(
    new THREE.PlaneGeometry(78.0, 38.0),
    roadLightConcreteMat
  );
  oruLoopPlate.rotation.x = -Math.PI / 2;
  oruLoopPlate.position.set(75.0, yPavement + 0.011, 2152.0);
  oruLoopPlate.receiveShadow = true;
  oruGroup.add(oruLoopPlate);

  // Pulau Tengah Gelap di dalam Loop ORU (seperti bentuk D di foto satelit)
  const oruInnerIsland = new THREE.Mesh(
    new THREE.PlaneGeometry(42.0, 18.0),
    greenIslandMat
  );
  oruInnerIsland.rotation.x = -Math.PI / 2;
  oruInnerIsland.position.set(76.0, yPavement + 0.018, 2154.0);
  oruGroup.add(oruInnerIsland);

  // 3B. Kanopi Shelter / Timbangan ORU di Kiri Bawah (X = 68.0, Z = 2134.0)
  const oruCanopy = createBuildingBox(22.0, 5.8, 16.0, wallLightMat, roofGreyMat, false);
  oruCanopy.position.set(68.0, yPavement, 2134.0);
  oruGroup.add(oruCanopy);

  // 3C. Deretan Bangunan Operasional di Sisi Kanan Jalan ORU (Z = 2188.0)
  const oruBldg1 = createBuildingBox(16.0, 4.8, 10.0, wallLightMat, roofGreyMat, false);
  oruBldg1.position.set(34.0, yPavement, 2190.0);
  oruGroup.add(oruBldg1);

  const oruBldg2 = createBuildingBox(18.0, 5.0, 12.0, wallLightMat, roofGreyMat, false);
  oruBldg2.position.set(92.0, yPavement, 2187.0);
  oruGroup.add(oruBldg2);

  // 3D. Klaster 14 Tangki Silinder Hitam (2 Kolom x 7 Baris di Kanan-Atas Aspal ORU)
  const { colsZ, rowsXStart, rowStepX, numRows, radius, height } = ORU_CONFIG.tankGrid;
  colsZ.forEach((tz) => {
    for (let r = 0; r < numRows; r++) {
      const tx = rowsXStart + r * rowStepX;
      const darkTank = createGrainSilo({
        radius,
        cylinderHeight: height,
        roofHeight: 1.4,
        plinthHeight: 0.6,
        numRings: 0,
        isDarkTank: true
      });
      darkTank.position.set(tx, yPavement, tz);
      oruGroup.add(darkTank);
    }
  });

  // Gardu / Bangunan Utilitas di Sebelah Kiri 14 Tangki Hitam (X = 222.0, Z = 2154.0)
  const oruUtilPad = new THREE.Mesh(
    new THREE.BoxGeometry(42.0, 0.22, 34.0),
    wallConcreteMat
  );
  oruUtilPad.position.set(218.0, yPavement + 0.11, 2152.0);
  oruUtilPad.receiveShadow = true;
  oruGroup.add(oruUtilPad);

  const oruUtilBldg1 = createBuildingBox(22.0, 5.2, 10.0, wallLightMat, roofGreyMat, false);
  oruUtilBldg1.position.set(224.0, yPavement + 0.22, 2158.0);
  oruGroup.add(oruUtilBldg1);

  const oruUtilBldg2 = createBuildingBox(12.0, 4.5, 8.5, wallLightMat, roofGreyMat, false);
  oruUtilBldg2.position.set(184.0, yPavement, 2155.0);
  oruGroup.add(oruUtilBldg2);

  opsGroup.add(oruGroup);

  return opsGroup;
}
