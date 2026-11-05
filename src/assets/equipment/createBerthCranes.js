import * as THREE from 'three';

/**
 * ==============================================================================
 * Reusable Asset: Alat Berat Dermaga (CC / STS Ship-to-Shore Crane & Rel Baja)
 * ==============================================================================
 * Digunakan secara terpadu di Dermaga Petikemas & Dermaga Curah Kering (Total 10 Unit):
 * - Rel STS Sisi Luar (+Z) terhubung menerus dari ujung Tenggara Dermaga Petikemas
 *   hingga ujung Barat Laut Dermaga Curah Kering.
 * - Mendukung orientasi boom ke Laut Lepas (+Z) maupun ke Kolam Dalam (-Z),
 *   serta varian warna Merah-Oranye Pelindo dan Hijau-Teal Industrial TTL.
 */

const stsRedOrangeMat = new THREE.MeshStandardMaterial({
  color: 0xd9381e, // Merah-oranye khas STS Crane Pelindo TTL
  roughness: 0.42,
  metalness: 0.45,
  name: 'mat_sts_red_orange'
});

const stsTealGreenMat = new THREE.MeshStandardMaterial({
  color: 0x0f766e, // Hijau-teal khas crane TTL
  roughness: 0.44,
  metalness: 0.45,
  name: 'mat_sts_teal_green'
});

const stsBulkDarkTealMat = new THREE.MeshStandardMaterial({
  color: 0x115e59, // Hijau-gelap industrial STS di segmen Curah Kering
  roughness: 0.48,
  metalness: 0.45,
  name: 'mat_sts_bulk_teal'
});

const darkSteelMat = new THREE.MeshStandardMaterial({
  color: 0x1e293b,
  roughness: 0.55,
  metalness: 0.6,
  name: 'mat_sts_dark_steel'
});

const whiteHouseMat = new THREE.MeshStandardMaterial({
  color: 0xf1f5f9,
  roughness: 0.45,
  metalness: 0.25,
  name: 'mat_sts_machinery_house'
});

const safetyYellowMat = new THREE.MeshStandardMaterial({
  color: 0xfacc15,
  roughness: 0.45,
  metalness: 0.3,
  name: 'mat_sts_safety_yellow'
});

const railSteelMat = new THREE.MeshStandardMaterial({
  color: 0x64748b,
  roughness: 0.35,
  metalness: 0.8,
  name: 'mat_sts_rail_steel'
});

const solePlateMat = new THREE.MeshStandardMaterial({
  color: 0x334155,
  roughness: 0.75,
  metalness: 0.3,
  name: 'mat_sts_sole_plate'
});

/**
 * Membuat 1 unit Ship-to-Shore (CC/STS) Gantry Crane skala 1:1
 * - Sumbu X: arah jalan rel sepanjang dermaga (portalWidthX)
 * - Sumbu Z: arah bentang kaki portal & boom menjorok ke laut (railGaugeZ)
 */
export function createSTSCrane({
  railGaugeZ = 30.0,         // Jarak antar rel kaki darat & kaki laut (30m)
  portalWidthX = 16.0,       // Lebar kaki portal searah rel X (16m)
  portalClearHeight = 14.5,  // Ruang bebas bawah portal untuk truk lewat
  boomElevationY = 38.0,     // Tinggi girder utama & boom di atas dek dermaga
  towerPeakY = 62.0,         // Tinggi puncak A-frame / forestay tower
  watersideOutreach = 56.0,  // Panjang boom menjorok ke atas kapal di laut
  landsideBackreach = 18.0,  // Panjang backreach di sisi belakang
  boomDirectionZ = 1,        // +1 = menghadap Laut Luar (+Z), -1 = menghadap Kolam Dalam (-Z)
  colorScheme = 'TEAL_GREEN',// 'RED_ORANGE' | 'TEAL_GREEN' | 'BULK_TEAL'
  hasBulkHopper = false,     // Jika sedang melayani segmen Curah Kering (dilengkapi hopper & grab)
  trolleyReachRatio = 0.55   // Posisi trolley di sepanjang boom (0.0 s/d 0.85)
} = {}) {
  const craneGroup = new THREE.Group();
  craneGroup.name = 'asset_sts_crane';

  const mainMat =
    colorScheme === 'RED_ORANGE'
      ? stsRedOrangeMat
      : colorScheme === 'BULK_TEAL'
      ? stsBulkDarkTealMat
      : stsTealGreenMat;

  const halfGaugeZ = railGaugeZ / 2;
  const halfWidthX = portalWidthX / 2;

  // Kita bangun dalam koordinat lokal di mana arah +Z lokal adalah arah Waterside (ke kapal),
  // lalu bila boomDirectionZ === -1 kita putar 180 derajat (Math.PI) pada sumbu Y.
  const inner = new THREE.Group();

  // ----------------------------------------------------------------------------
  // 1. BOGIE RODA REL & EQUALIZER SILL BEAM (Sisi Waterside +halfGaugeZ & Landside -halfGaugeZ)
  // ----------------------------------------------------------------------------
  [-halfGaugeZ, halfGaugeZ].forEach((rz) => {
    const sillLenX = portalWidthX + 5.6;
    const sillBeam = new THREE.Mesh(
      new THREE.BoxGeometry(sillLenX, 1.35, 1.35),
      darkSteelMat
    );
    sillBeam.position.set(0, 0.8, rz);
    sillBeam.castShadow = true;
    inner.add(sillBeam);

    // 4 unit bogie roda baja per rel
    [-halfWidthX - 1.4, -halfWidthX + 1.4, halfWidthX - 1.4, halfWidthX + 1.4].forEach((bx) => {
      const bogieBox = new THREE.Mesh(
        new THREE.BoxGeometry(2.1, 0.75, 1.55),
        safetyYellowMat
      );
      bogieBox.position.set(bx, 0.45, rz);
      inner.add(bogieBox);
    });
  });

  // ----------------------------------------------------------------------------
  // 2. EMPAT KAKI PORTAL UTAMA (Waterside Legs & Landside Legs) + PORTAL BEAMS
  // ----------------------------------------------------------------------------
  const legHeight = boomElevationY - 1.2;
  [-halfWidthX, halfWidthX].forEach((lx) => {
    [-halfGaugeZ, halfGaugeZ].forEach((lz) => {
      const leg = new THREE.Mesh(
        new THREE.BoxGeometry(1.35, legHeight, 1.45),
        mainMat
      );
      leg.position.set(lx, 1.2 + legHeight / 2, lz);
      leg.castShadow = true;
      leg.receiveShadow = true;
      inner.add(leg);
    });

    // Balok Portal Melintang Bawah (Portal Tie Beam di atas jalur truk Y = portalClearHeight)
    const portalTieBeam = new THREE.Mesh(
      new THREE.BoxGeometry(1.25, 1.6, railGaugeZ + 1.6),
      mainMat
    );
    portalTieBeam.position.set(lx, portalClearHeight, 0);
    portalTieBeam.castShadow = true;
    inner.add(portalTieBeam);

    // Bracing diagonal pengaku portal bawah
    const diagLen = Math.hypot(railGaugeZ * 0.42, boomElevationY - portalClearHeight);
    [-1, 1].forEach((dirZ) => {
      const brace = new THREE.Mesh(
        new THREE.BoxGeometry(0.65, diagLen, 0.65),
        mainMat
      );
      brace.position.set(
        lx,
        (portalClearHeight + boomElevationY) / 2,
        dirZ * (halfGaugeZ * 0.55)
      );
      brace.rotation.x = dirZ * 0.48;
      inner.add(brace);
    });
  });

  // Balok pengaku memanjang antar kaki sisi Waterside & Landside (Sumbu X)
  [-halfGaugeZ, halfGaugeZ].forEach((lz) => {
    const xTieLow = new THREE.Mesh(
      new THREE.BoxGeometry(portalWidthX, 1.2, 1.15),
      mainMat
    );
    xTieLow.position.set(0, portalClearHeight, lz);
    inner.add(xTieLow);

    const xTieHigh = new THREE.Mesh(
      new THREE.BoxGeometry(portalWidthX + 1.4, 1.6, 1.5),
      mainMat
    );
    xTieHigh.position.set(0, boomElevationY - 0.8, lz);
    inner.add(xTieHigh);
  });

  // Tangga akses & bordes vertikal di salah satu kaki darat
  const stairShaft = new THREE.Mesh(
    new THREE.BoxGeometry(1.8, legHeight, 1.8),
    darkSteelMat
  );
  stairShaft.position.set(-halfWidthX - 1.1, 1.2 + legHeight / 2, -halfGaugeZ);
  inner.add(stairShaft);

  // ----------------------------------------------------------------------------
  // 3. GIRDER UTAMA, BACKREACH (-Z), & WATERSIDE BOOM (+Z)
  // ----------------------------------------------------------------------------
  const totalBoomLengthZ = landsideBackreach + railGaugeZ + watersideOutreach;
  const boomCenterZ = (watersideOutreach - landsideBackreach) / 2;

  // Sepasang Twin Box Girder Boom memanjang dari Backreach hingga ujung Waterside Outreach
  const girderSpacingX = portalWidthX * 0.52;
  [-girderSpacingX / 2, girderSpacingX / 2].forEach((gx) => {
    const boomGirder = new THREE.Mesh(
      new THREE.BoxGeometry(1.15, 2.1, totalBoomLengthZ),
      mainMat
    );
    boomGirder.position.set(gx, boomElevationY + 0.8, boomCenterZ);
    boomGirder.castShadow = true;
    boomGirder.receiveShadow = true;
    inner.add(boomGirder);
  });

  // Balok silang penghubung twin boom girder setiap 9m
  for (let z = -halfGaugeZ - landsideBackreach + 2.0; z <= halfGaugeZ + watersideOutreach - 1.5; z += 9.0) {
    const crossMember = new THREE.Mesh(
      new THREE.BoxGeometry(girderSpacingX + 1.2, 0.85, 0.75),
      mainMat
    );
    crossMember.position.set(0, boomElevationY + 1.45, z);
    inner.add(crossMember);
  }

  // Ujung depan boom kuning keselamatan
  const boomTip = new THREE.Mesh(
    new THREE.BoxGeometry(girderSpacingX + 1.8, 1.6, 1.6),
    safetyYellowMat
  );
  boomTip.position.set(0, boomElevationY + 0.8, halfGaugeZ + watersideOutreach);
  inner.add(boomTip);

  // ----------------------------------------------------------------------------
  // 4. MACHINERY HOUSE (RUMAH MESIN PUTIH/WARNA CRANE DI ATAS GIRDER)
  // ----------------------------------------------------------------------------
  const machHouse = new THREE.Mesh(
    new THREE.BoxGeometry(portalWidthX * 0.78, 5.2, 15.5),
    whiteHouseMat
  );
  machHouse.position.set(0, boomElevationY + 4.4, -halfGaugeZ * 0.35);
  machHouse.castShadow = true;
  inner.add(machHouse);

  const machRoof = new THREE.Mesh(
    new THREE.BoxGeometry(portalWidthX * 0.82, 0.75, 16.2),
    mainMat
  );
  machRoof.position.set(0, boomElevationY + 7.2, -halfGaugeZ * 0.35);
  inner.add(machRoof);

  // ----------------------------------------------------------------------------
  // 5. MENARA PUNCAK A-FRAME (APEX TOWER) & KABEL PENAHAN BOOM (FORESTAY & BACKSTAY)
  // ----------------------------------------------------------------------------
  const upperTowerH = towerPeakY - boomElevationY;
  [-halfWidthX, halfWidthX].forEach((lx) => {
    // Tiang depan A-Frame di atas kaki Waterside
    const frontMast = new THREE.Mesh(
      new THREE.BoxGeometry(1.15, upperTowerH, 1.25),
      mainMat
    );
    frontMast.position.set(lx * 0.78, boomElevationY + upperTowerH / 2, halfGaugeZ);
    frontMast.castShadow = true;
    inner.add(frontMast);

    // Tiang miring belakang A-Frame menuju kaki Landside
    const backBraceLen = Math.hypot(railGaugeZ * 0.85, upperTowerH);
    const backMast = new THREE.Mesh(
      new THREE.BoxGeometry(0.95, backBraceLen, 0.95),
      mainMat
    );
    backMast.position.set(lx * 0.78, boomElevationY + upperTowerH * 0.48, 0.0);
    backMast.rotation.x = 0.72;
    inner.add(backMast);
  });

  // Balok Puncak A-Frame (Top Crosshead)
  const apexBeam = new THREE.Mesh(
    new THREE.BoxGeometry(portalWidthX * 0.86, 1.8, 2.4),
    mainMat
  );
  apexBeam.position.set(0, towerPeakY, halfGaugeZ);
  apexBeam.castShadow = true;
  inner.add(apexBeam);

  // Sepasang Forestay Tie Rods (Kabel baja penahan boom depan dari puncak A-Frame ke boom)
  const forestayTargetZ = halfGaugeZ + watersideOutreach * 0.76;
  const forestayDz = forestayTargetZ - halfGaugeZ;
  const forestayDy = towerPeakY - (boomElevationY + 1.5);
  const forestayLen = Math.hypot(forestayDz, forestayDy);
  const forestayAngle = Math.atan2(forestayDz, forestayDy);

  [-girderSpacingX * 0.45, girderSpacingX * 0.45].forEach((fx) => {
    const forestayRod = new THREE.Mesh(
      new THREE.CylinderGeometry(0.16, 0.16, forestayLen, 8),
      darkSteelMat
    );
    forestayRod.position.set(
      fx,
      (towerPeakY + boomElevationY + 1.5) / 2,
      (halfGaugeZ + forestayTargetZ) / 2
    );
    forestayRod.rotation.x = forestayAngle;
    inner.add(forestayRod);
  });

  // Backstay Tie Rods (dari puncak A-Frame ke ujung Backreach)
  const backstayTargetZ = -halfGaugeZ - landsideBackreach * 0.85;
  const backstayDz = halfGaugeZ - backstayTargetZ;
  const backstayLen = Math.hypot(backstayDz, forestayDy);
  const backstayAngle = -Math.atan2(backstayDz, forestayDy);

  [-girderSpacingX * 0.45, girderSpacingX * 0.45].forEach((bx) => {
    const backstayRod = new THREE.Mesh(
      new THREE.CylinderGeometry(0.16, 0.16, backstayLen, 8),
      darkSteelMat
    );
    backstayRod.position.set(
      bx,
      (towerPeakY + boomElevationY + 1.5) / 2,
      (halfGaugeZ + backstayTargetZ) / 2
    );
    backstayRod.rotation.x = backstayAngle;
    inner.add(backstayRod);
  });

  // ----------------------------------------------------------------------------
  // 6. TROLLEY, OPERATOR CABIN, & SPREADER / GRAB BUCKET
  // ----------------------------------------------------------------------------
  const trolleyZ = halfGaugeZ + watersideOutreach * trolleyReachRatio;
  const trolleyGroup = new THREE.Group();
  trolleyGroup.position.set(0, boomElevationY - 0.4, trolleyZ);

  const trolleyCar = new THREE.Mesh(
    new THREE.BoxGeometry(girderSpacingX + 1.4, 1.4, 4.8),
    darkSteelMat
  );
  trolleyCar.castShadow = true;
  trolleyGroup.add(trolleyCar);

  // Kabin operator putih tergantung di bawah trolley
  const opCabin = new THREE.Mesh(
    new THREE.BoxGeometry(2.2, 2.4, 2.8),
    whiteHouseMat
  );
  opCabin.position.set(0, -1.6, 1.2);
  trolleyGroup.add(opCabin);

  const hoistDrop = 22.0;
  [-1.1, 1.1].forEach((cx) => {
    [-1.4, 1.4].forEach((cz) => {
      const wire = new THREE.Mesh(
        new THREE.CylinderGeometry(0.05, 0.05, hoistDrop, 6),
        darkSteelMat
      );
      wire.position.set(cx, -hoistDrop / 2, cz);
      trolleyGroup.add(wire);
    });
  });

  if (hasBulkHopper) {
    // Grab Clamshell Bucket untuk Curah Kering + Hopper di Portal
    const grabBucket = new THREE.Mesh(
      new THREE.CylinderGeometry(2.2, 1.4, 3.4, 8),
      safetyYellowMat
    );
    grabBucket.position.set(0, -hoistDrop, 0);
    grabBucket.castShadow = true;
    trolleyGroup.add(grabBucket);

    // Hopper Corong Curah Kering di antara kaki portal untuk menyuplai Jetty Conveyor
    const hopper = new THREE.Mesh(
      new THREE.CylinderGeometry(5.5, 1.8, 8.5, 4),
      mainMat
    );
    hopper.rotation.y = Math.PI / 4;
    hopper.position.set(0, portalClearHeight + 5.5, 2.0);
    hopper.castShadow = true;
    inner.add(hopper);
  } else {
    // Spreader Kontainer 40ft Kuning Keselamatan
    const spreader = new THREE.Mesh(
      new THREE.BoxGeometry(2.6, 0.85, 12.2),
      safetyYellowMat
    );
    spreader.position.set(0, -hoistDrop, 0);
    spreader.castShadow = true;
    trolleyGroup.add(spreader);
  }

  inner.add(trolleyGroup);

  // Putar 180 derajat jika menghadap Kolam Dalam (-Z)
  if (boomDirectionZ < 0) {
    inner.rotation.y = Math.PI;
  }

  craneGroup.add(inner);
  return craneGroup;
}

/**
 * Membuat jalur rel baja berat (STS Crane Rail Track) sepanjang sumbu X dermaga
 */
export function createBerthRailTrack({
  startX,
  endX,
  centerZ,
  railGaugeZ = 30.0,
  ySurface = 3.2
}) {
  const railGroup = new THREE.Group();
  railGroup.name = 'asset_sts_rail_track';

  const lengthX = Math.abs(endX - startX);
  const midX = (startX + endX) / 2;
  const halfGaugeZ = railGaugeZ / 2;

  [-halfGaugeZ, halfGaugeZ].forEach((dz) => {
    const rz = centerZ + dz;

    // Landasan soleplate beton/baja
    const solePlate = new THREE.Mesh(
      new THREE.BoxGeometry(lengthX, 0.08, 0.85),
      solePlateMat
    );
    solePlate.position.set(midX, ySurface + 0.04, rz);
    solePlate.receiveShadow = true;
    railGroup.add(solePlate);

    // Batang rel baja berat
    const steelRail = new THREE.Mesh(
      new THREE.BoxGeometry(lengthX, 0.18, 0.28),
      railSteelMat
    );
    steelRail.position.set(midX, ySurface + 0.14, rz);
    steelRail.castShadow = true;
    railGroup.add(steelRail);

    // Buffer Stop Kuning di kedua ujung rel
    [startX, endX].forEach((stopX) => {
      const bufferStop = new THREE.Mesh(
        new THREE.BoxGeometry(1.2, 1.4, 0.95),
        safetyYellowMat
      );
      bufferStop.position.set(stopX, ySurface + 0.7, rz);
      bufferStop.castShadow = true;
      railGroup.add(bufferStop);
    });
  });

  return railGroup;
}
