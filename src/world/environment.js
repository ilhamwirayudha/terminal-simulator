import * as THREE from 'three';

/**
 * ==============================================================================
 * Terminal Teluk Lamong (TTL) - 3-Lane Dedicated Highway Environment
 * ==============================================================================
 *
 * PROVEN SATELLITE LAYOUT:
 * - SISI KIRI (X < 0): JALUR MASUK (Pos Keamanan, Kanopi, Palang & 3 Lajur Masuk)
 * - SISI KANAN (X > 0): JALUR KELUAR (Bebas tanpa portal/kanopi)
 */
export function createEnvironment(scene) {
  const envGroup = new THREE.Group();
  envGroup.name = 'ttl_mainland_environment';

  // ----------------------------------------------------------------------------
  // Shared PBR Materials
  // ----------------------------------------------------------------------------
  const waterMaterial = new THREE.MeshStandardMaterial({
    color: 0x6e7d73, // Natural silty greenish-grey estuarine water matching satellite imagery
    roughness: 0.28,
    metalness: 0.18,
    transparent: true,
    opacity: 0.94
  });

  const mudflatMaterial = new THREE.MeshStandardMaterial({
    color: 0x5a6659, // Intertidal silt & sediment mudflat tone matching satellite
    roughness: 0.95,
    metalness: 0.05
  });

  const mainlandTerrainMat = new THREE.MeshStandardMaterial({
    color: 0x243e24,
    roughness: 0.9,
    metalness: 0.05
  });

  const pondWaterMat = new THREE.MeshStandardMaterial({
    color: 0x18342b,
    roughness: 0.2,
    metalness: 0.3
  });

  const dykeMaterial = new THREE.MeshStandardMaterial({
    color: 0x3f4f3a,
    roughness: 0.95
  });

  const medianSoilMat = new THREE.MeshStandardMaterial({
    color: 0x6e5d48,
    roughness: 0.95
  });

  const medianGrassMat = new THREE.MeshStandardMaterial({
    color: 0x3a5a2e,
    roughness: 0.9
  });

  const curbConcreteMat = new THREE.MeshStandardMaterial({
    color: 0x475569,
    roughness: 0.75
  });

  const seawallMat = new THREE.MeshStandardMaterial({
    color: 0x333d4b,
    roughness: 0.8,
    metalness: 0.2
  });

  const buildingWallMat = new THREE.MeshStandardMaterial({
    color: 0x334155,
    roughness: 0.6,
    metalness: 0.3
  });

  const glassMaterial = new THREE.MeshStandardMaterial({
    color: 0x38bdf8,
    roughness: 0.1,
    metalness: 0.9,
    transparent: true,
    opacity: 0.82
  });

  const canopyMat = new THREE.MeshStandardMaterial({
    color: 0xf1f5f9,
    roughness: 0.3,
    metalness: 0.2,
    side: THREE.DoubleSide
  });

  const steelMaterial = new THREE.MeshStandardMaterial({
    color: 0x94a3b8,
    roughness: 0.4,
    metalness: 0.8
  });

  const barrierArmMat = new THREE.MeshStandardMaterial({
    color: 0xdc2626,
    roughness: 0.4
  });

  const whiteStripeMat = new THREE.MeshStandardMaterial({
    color: 0xf8fafc,
    roughness: 0.4
  });

  const foliageMaterial = new THREE.MeshStandardMaterial({
    color: 0x2d5a27,
    roughness: 0.9,
    metalness: 0.05
  });

  const bushFoliageMat = new THREE.MeshStandardMaterial({
    color: 0x476b32,
    roughness: 0.95
  });

  const treeTrunkMaterial = new THREE.MeshStandardMaterial({
    color: 0x3f2e1e,
    roughness: 0.9
  });

  // Helper to place trees
  const addTree = (group, x, y, z, scale = 1.0) => {
    const tree = new THREE.Group();
    tree.position.set(x, y, z);
    tree.scale.set(scale, scale, scale);

    const trunk = new THREE.Mesh(new THREE.CylinderGeometry(0.2, 0.3, 1.8, 6), treeTrunkMaterial);
    trunk.position.set(0, 0.9, 0);
    trunk.castShadow = true;
    tree.add(trunk);

    const foliage = new THREE.Mesh(new THREE.ConeGeometry(1.4, 3.2, 7), foliageMaterial);
    foliage.position.set(0, 2.8, 0);
    foliage.castShadow = true;
    tree.add(foliage);

    group.add(tree);
  };

  // Helper to place rounded shrubs/bushes
  const addBush = (group, x, y, z, r = 1.2) => {
    const bush = new THREE.Mesh(new THREE.SphereGeometry(r, 8, 6), bushFoliageMat);
    bush.position.set(x, y + r * 0.7, z);
    bush.scale.set(1.2, 0.8, 1.2);
    bush.castShadow = true;
    group.add(bush);
  };

  // Lantai laut dan mudflat telah dihapus sesuai permintaan.

  // ----------------------------------------------------------------------------
  // 2. MAINLAND BASE TERRAIN & FISHPONDS (TAMBAK) (Z = -280 to -55)
  // ----------------------------------------------------------------------------
  const mainlandGroup = new THREE.Group();
  mainlandGroup.name = 'zone_a_mainland';

  // Base terrain: diperkecil lebarnya dari 900 menjadi 90 (X in [-45, +45]) agar proporsional
  const mainlandBase = new THREE.Mesh(new THREE.BoxGeometry(90, 2.0, 700), mainlandTerrainMat);
  mainlandBase.position.set(0, -0.2, -376.5);
  mainlandBase.receiveShadow = true;
  mainlandGroup.add(mainlandBase);

  // Kotak-kotak tambak (fish ponds) telah dihapus sesuai permintaan.

  // Tanggul Pantai Kiri (X: -45 s/d -8.2)
  const seawallLeft = new THREE.Mesh(new THREE.BoxGeometry(36.8, 2.0, 4.0), seawallMat);
  seawallLeft.position.set(-26.6, -0.2, -55);
  seawallLeft.receiveShadow = true;
  mainlandGroup.add(seawallLeft);

  // Tanggul Pantai Kanan (X: +8.2 s/d +45)
  const seawallRight = new THREE.Mesh(new THREE.BoxGeometry(36.8, 2.0, 4.0), seawallMat);
  seawallRight.position.set(26.6, -0.2, -55);
  seawallRight.receiveShadow = true;
  mainlandGroup.add(seawallRight);

  // Pondasi Abutmen Penyangga Bawah Jembatan (Di Bawah Dek Jalan: Y = -0.5)
  const bridgeAbutment = new THREE.Mesh(new THREE.BoxGeometry(16.0, 2.0, 4.0), seawallMat);
  bridgeAbutment.position.set(0, -0.5, -55);
  bridgeAbutment.receiveShadow = true;
  mainlandGroup.add(bridgeAbutment);

  // Deretan pohon di sepanjang koridor daratan (Z=-59 s/d Z=-690)
  for (let x = -36; x <= 36; x += 12) {
    if (Math.abs(x) > 18) {
      addTree(mainlandGroup, x, 0.8, -59, 1.2);
      // Pohon setiap ~55m sepanjang jalan
      for (let z = -75; z >= -690; z -= 55) {
        const jitter = (Math.sin(x * 0.3 + z * 0.1) * 4);
        addTree(mainlandGroup, x + jitter, 0.8, z, 0.8 + Math.abs(Math.sin(z * 0.05)) * 0.4);
      }
    }
  }

  // ----------------------------------------------------------------------------
  // 3. WIDE LANDSCAPED CENTRAL MEDIAN (WIDTH = 8.4m / X in [-4.2, +4.2])
  // ----------------------------------------------------------------------------
  const addMedianIsland = (startZ, endZ) => {
    const l = Math.abs(endZ - startZ);
    const midZ = (startZ + endZ) / 2;
    
    // Radius of the outer curb is 4.2 (width 8.4)
    const capRadius = 4.2;
    const rectLength = l - capRadius * 2;
    
    // Centers for the rounded caps
    const zStartCap = startZ + capRadius; // startZ is the smaller (more negative) value
    const zEndCap = endZ - capRadius;

    // 1. CURB (Width = 8.4)
    const curb = new THREE.Mesh(new THREE.BoxGeometry(8.4, 0.35, rectLength), curbConcreteMat);
    curb.position.set(0, 0.95, midZ);
    mainlandGroup.add(curb);
    
    const curbGeo = new THREE.CylinderGeometry(4.2, 4.2, 0.35, 32);
    const curbCap1 = new THREE.Mesh(curbGeo, curbConcreteMat);
    curbCap1.position.set(0, 0.95, zStartCap);
    mainlandGroup.add(curbCap1);
    const curbCap2 = new THREE.Mesh(curbGeo, curbConcreteMat);
    curbCap2.position.set(0, 0.95, zEndCap);
    mainlandGroup.add(curbCap2);

    // 2. SOIL (Width = 7.8)
    const soil = new THREE.Mesh(new THREE.BoxGeometry(7.8, 0.38, rectLength), medianSoilMat);
    soil.position.set(0, 0.96, midZ);
    mainlandGroup.add(soil);
    
    const soilGeo = new THREE.CylinderGeometry(3.9, 3.9, 0.38, 32);
    const soilCap1 = new THREE.Mesh(soilGeo, medianSoilMat);
    soilCap1.position.set(0, 0.96, zStartCap);
    mainlandGroup.add(soilCap1);
    const soilCap2 = new THREE.Mesh(soilGeo, medianSoilMat);
    soilCap2.position.set(0, 0.96, zEndCap);
    mainlandGroup.add(soilCap2);

    // 3. GRASS (Width = 7.2)
    const grass = new THREE.Mesh(new THREE.PlaneGeometry(7.2, rectLength), medianGrassMat);
    grass.rotation.x = -Math.PI / 2;
    grass.position.set(0, 1.16, midZ);
    mainlandGroup.add(grass);
    
    const grassGeo = new THREE.CircleGeometry(3.6, 32);
    const grassCap1 = new THREE.Mesh(grassGeo, medianGrassMat);
    grassCap1.rotation.x = -Math.PI / 2;
    grassCap1.position.set(0, 1.16, zStartCap);
    mainlandGroup.add(grassCap1);
    const grassCap2 = new THREE.Mesh(grassGeo, medianGrassMat);
    grassCap2.rotation.x = -Math.PI / 2;
    grassCap2.position.set(0, 1.16, zEndCap);
    mainlandGroup.add(grassCap2);

    for (let z = startZ + 6; z <= endZ - 6; z += 10) {
      // Hilangkan pohon di area Pos Keamanan (Z = -170) & Bangunan Gardu (Z = -135 s/d -120)
      if (z > -185 && z < -155) continue;
      if (z > -140 && z < -120) continue;

      const offsetX = (Math.sin(z * 0.2) * 2.0);
      addTree(mainlandGroup, offsetX, 1.15, z, 0.85 + Math.random() * 0.3);
      addBush(mainlandGroup, -offsetX * 0.8, 1.15, z + 3, 1.1);
    }
  };

  // === 3 PULAU TAMAN MEDIAN TENGAH (SESUAI FOTO SATELIT APPLE MAPS) ===
  // 1. Taman Segmen 1 (Jalan Masuk Panjang): Z = -700 s/d -410
  addMedianIsland(-700, -410);

  // 2. Taman Segmen 2 (Jalan Menuju Pos Keamanan): Z = -380 s/d -170
  addMedianIsland(-380, -170);

  // 3. Taman Segmen 3 (Taman Kompak Pembangkit Listrik / Gardu PLN TTL): Z = -140 s/d -106
  addMedianIsland(-140, -106);
  // Z = -106 to -53: Segmen 4 (Area Taper / Merge ke Jembatan, tanpa median taman)

  // ----------------------------------------------------------------------------
  // 4. MULTI-VEHICLE FLEET ON 3 DEDICATED LANES
  // ----------------------------------------------------------------------------
  const truckCabColors = [0xea580c, 0x0284c7, 0xdc2626, 0x16a34a, 0x9333ea, 0xca8a04];
  const containerColors = [0x0284c7, 0xdc2626, 0x059669, 0xd97706, 0x7c3aed, 0x2563eb, 0x475569];
  const dumpTruckColors = [0xb45309, 0xd97706, 0x4d7c0f, 0x65a30d, 0x854d0e];
  const carColors = [0xffffff, 0x1e293b, 0x94a3b8, 0xdc2626, 0x2563eb];
  const chassisMat = new THREE.MeshStandardMaterial({ color: 0x1e293b, roughness: 0.8 });
  const wheelMat = new THREE.MeshStandardMaterial({ color: 0x0f172a, roughness: 0.9 });

  // A. TRUK KONTAINER
  const addContainerTruck = (x, z, headingNorth = true, colorIdx = 0) => {
    const truck = new THREE.Group();
    truck.position.set(x, 0.82, z);
    truck.rotation.y = headingNorth ? 0 : Math.PI;

    const ch = new THREE.Mesh(new THREE.BoxGeometry(2.3, 0.4, 8.5), chassisMat);
    ch.position.set(0, 0.5, 0);
    truck.add(ch);

    const cabMat = new THREE.MeshStandardMaterial({ color: truckCabColors[colorIdx % truckCabColors.length], roughness: 0.5 });
    const cab = new THREE.Mesh(new THREE.BoxGeometry(2.4, 2.0, 2.2), cabMat);
    cab.position.set(0, 1.7, 3.2);
    truck.add(cab);

    const ws = new THREE.Mesh(new THREE.BoxGeometry(2.2, 0.8, 0.1), glassMaterial);
    ws.position.set(0, 1.9, 4.35);
    truck.add(ws);

    const contMat = new THREE.MeshStandardMaterial({ color: containerColors[colorIdx % containerColors.length], roughness: 0.6 });
    const cont = new THREE.Mesh(new THREE.BoxGeometry(2.4, 2.5, 6.0), contMat);
    cont.position.set(0, 1.9, -1.0);
    cont.castShadow = true;
    truck.add(cont);

    const wGeo = new THREE.CylinderGeometry(0.5, 0.5, 0.35, 12);
    [-1.2, 1.2].forEach(wx => {
      [3.0, -2.5].forEach(wz => {
        const wheel = new THREE.Mesh(wGeo, wheelMat);
        wheel.rotation.z = Math.PI / 2;
        wheel.position.set(wx, 0.5, wz);
        truck.add(wheel);
      });
    });

    mainlandGroup.add(truck);
  };

  // B. TRUK CURAH KERING
  const addDryBulkTruck = (x, z, headingNorth = true, colorIdx = 0) => {
    const truck = new THREE.Group();
    truck.position.set(x, 0.82, z);
    truck.rotation.y = headingNorth ? 0 : Math.PI;

    const ch = new THREE.Mesh(new THREE.BoxGeometry(2.3, 0.4, 8.0), chassisMat);
    ch.position.set(0, 0.5, 0);
    truck.add(ch);

    const cabMat = new THREE.MeshStandardMaterial({ color: dumpTruckColors[colorIdx % dumpTruckColors.length], roughness: 0.5 });
    const cab = new THREE.Mesh(new THREE.BoxGeometry(2.4, 2.0, 2.0), cabMat);
    cab.position.set(0, 1.7, 2.9);
    truck.add(cab);

    const bedMat = new THREE.MeshStandardMaterial({ color: 0x475569, roughness: 0.7, metalness: 0.4 });
    const bed = new THREE.Mesh(new THREE.BoxGeometry(2.4, 1.8, 5.4), bedMat);
    bed.position.set(0, 1.6, -1.0);
    truck.add(bed);

    const tarpMat = new THREE.MeshStandardMaterial({ color: 0x854d0e, roughness: 0.9 });
    const tarp = new THREE.Mesh(new THREE.BoxGeometry(2.3, 0.4, 5.2), tarpMat);
    tarp.position.set(0, 2.5, -1.0);
    truck.add(tarp);

    const wGeo = new THREE.CylinderGeometry(0.5, 0.5, 0.35, 12);
    [-1.2, 1.2].forEach(wx => {
      [2.7, -2.2].forEach(wz => {
        const wheel = new THREE.Mesh(wGeo, wheelMat);
        wheel.rotation.z = Math.PI / 2;
        wheel.position.set(wx, 0.5, wz);
        truck.add(wheel);
      });
    });

    mainlandGroup.add(truck);
  };

  // C. MOBIL & MOTOR
  const addLightVehicle = (x, z, headingNorth = true, colorIdx = 0, isMotorcycle = false) => {
    const veh = new THREE.Group();
    veh.position.set(x, 0.82, z);
    veh.rotation.y = headingNorth ? 0 : Math.PI;

    if (isMotorcycle) {
      const motoMat = new THREE.MeshStandardMaterial({ color: 0x0284c7, roughness: 0.4 });
      const body = new THREE.Mesh(new THREE.BoxGeometry(0.5, 0.7, 1.8), motoMat);
      body.position.set(0, 0.5, 0);
      veh.add(body);

      const rider = new THREE.Mesh(new THREE.BoxGeometry(0.4, 0.8, 0.4), new THREE.MeshStandardMaterial({ color: 0x1e293b }));
      rider.position.set(0, 1.0, 0);
      veh.add(rider);
    } else {
      const carMat = new THREE.MeshStandardMaterial({ color: carColors[colorIdx % carColors.length], roughness: 0.3, metalness: 0.5 });
      const body = new THREE.Mesh(new THREE.BoxGeometry(1.9, 0.8, 4.4), carMat);
      body.position.set(0, 0.65, 0);
      veh.add(body);

      const cabin = new THREE.Mesh(new THREE.BoxGeometry(1.7, 0.7, 2.4), glassMaterial);
      cabin.position.set(0, 1.25, -0.3);
      veh.add(cabin);
    }

    mainlandGroup.add(veh);
  };

  // ----------------------------------------------------------------------------
  // DEPLOY FLEETS TO THE 3 DEDICATED LANES
  // +X = KIRI LAYAR = ENTRY (masuk ke kantor, headingNorth = true)
  // -X = KANAN LAYAR = EXIT  (keluar dari kantor, headingNorth = false)
  // ----------------------------------------------------------------------------

  // 1. INBOUND / ENTRY (SISI KIRI LAYAR / X = +positif)
  // LAJUR KONTAINER (X = +13.8) - menghadap ke kantor
  addContainerTruck(13.8, -260, true, 0);
  addContainerTruck(13.8, -245, true, 1);
  addContainerTruck(13.8, -230, true, 2);
  addContainerTruck(13.8, -160, true, 3);
  addContainerTruck(13.8, -145, true, 4);
  addContainerTruck(13.8, -130, true, 5);

  // LAJUR CURAH KERING (X = +10.0) - menghadap ke kantor
  addDryBulkTruck(10.0, -250, true, 0);
  addDryBulkTruck(10.0, -220, true, 1);
  addDryBulkTruck(10.0, -150, true, 2);
  addDryBulkTruck(10.0, -120, true, 3);

  // LAJUR MOBIL & MOTOR (X = +6.2) - menghadap ke kantor
  addLightVehicle(6.2, -240, true, 0, false);
  addLightVehicle(6.2, -225, true, 1, true);
  addLightVehicle(6.2, -160, true, 2, false);
  addLightVehicle(6.2, -135, true, 3, true);

  // 2. OUTBOUND / EXIT (SISI KANAN LAYAR / X = -negatif)
  // LAJUR KONTAINER (X = -13.8) - menghadap keluar
  addContainerTruck(-13.8, -250, false, 6);
  addContainerTruck(-13.8, -235, false, 0);

  // LAJUR CURAH KERING (X = -10.0) - menghadap keluar
  addDryBulkTruck(-10.0, -240, false, 4);

  // LAJUR MOBIL & MOTOR (X = -6.2) - menghadap keluar
  addLightVehicle(-6.2, -220, false, 1, false);

  // === KENDARAAN TERDISTRIBUSI DI 4 SEGMEN (Z = -680 s/d -80) ===
  // ENTRY Kontainer (X = +13.8)
  [[-670,0],[-590,1],[-510,2],[-440,3],[-360,4],[-290,5],[-230,6],[-130,0],[-80,1]]
    .forEach(([z,c]) => addContainerTruck(13.8, z, true, c));

  // ENTRY Curah Kering (X = +10.0)
  [[-650,0],[-570,1],[-480,2],[-340,3],[-270,4],[-210,2],[-120,0]]
    .forEach(([z,c]) => addDryBulkTruck(10.0, z, true, c));

  // ENTRY Motor/Mobil (X = +6.2)
  [[-630,0,false],[-540,1,true],[-460,2,false],[-320,3,true],[-250,0,false],[-195,1,true],[-110,2,false]]
    .forEach(([z,c,m]) => addLightVehicle(6.2, z, true, c, m));

  // EXIT Kontainer (X = -13.8)
  [[-660,0],[-580,6],[-490,1],[-350,0],[-280,2],[-220,1],[-130,6],[-80,0]]
    .forEach(([z,c]) => addContainerTruck(-13.8, z, false, c));

  // EXIT Curah Kering (X = -10.0)
  [[-640,4],[-550,0],[-470,2],[-330,3],[-260,0],[-200,4],[-120,2]]
    .forEach(([z,c]) => addDryBulkTruck(-10.0, z, false, c));

      // EXIT Motor/Mobil (X = -6.2)
  [[-620,0,false],[-530,1,true],[-450,2,false],[-310,0,true],[-240,1,false],[-175,2,true],[-100,0,false]]
    .forEach(([z,c,m]) => addLightVehicle(-6.2, z, false, c, m));

  // ----------------------------------------------------------------------------
  // SEGMEN 2: SECURITY CHECKPOINT (POS KEAMANAN DENGAN KANOPI MENAUNGI LAJUR 3)
  // Kanopi memanjang dari median (X = 0) ke arah Jalur Masuk mencakup Lajur 3 (X = 0 s/d +8.2)
  // ----------------------------------------------------------------------------
  const secGroup = new THREE.Group();
  secGroup.position.set(0, 0.8, -186);

  // 1. KANOPI ATAP PUTIH — Memanjang dari median (X = 0) menaungi Lajur 3 (X = +8.2)
  // Lebar (X) = 8.2m, Panjang (Z) = 8.0m, Pusat di X = +4.1
  const secRoof = new THREE.Mesh(new THREE.BoxGeometry(8.2, 0.5, 8.0), canopyMat);
  secRoof.position.set(4.1, 5.2, 0);
  secRoof.castShadow = true;
  secGroup.add(secRoof);

  // 2. 4 Tiang Baja Penyangga Kanopi
  // 2 Tiang di sisi median (X = +0.3) dan 2 Tiang di batas lajur 3 / cuker (X = +8.0)
  const pCols = [
    { x: 0.3, z: -3.6 }, { x: 8.0, z: -3.6 },
    { x: 0.3, z:  3.6 }, { x: 8.0, z:  3.6 }
  ];
  pCols.forEach(pc => {
    const col = new THREE.Mesh(new THREE.CylinderGeometry(0.18, 0.18, 5.2, 8), steelMaterial);
    col.position.set(pc.x, 2.6, pc.z);
    col.castShadow = true;
    secGroup.add(col);
  });

  // 3. SPEED BUMPS DI LAJUR 3 (Di Bawah Naungan Kanopi Pos Keamanan)
  const createStripedTexture = () => {
    const canvas = document.createElement('canvas');
    canvas.width = 16;
    canvas.height = 64;
    const ctx = canvas.getContext('2d');
    ctx.fillStyle = '#eab308';
    ctx.fillRect(0, 0, 16, 64);
    ctx.fillStyle = '#111111';
    ctx.fillRect(0, 0, 16, 32);
    const tex = new THREE.CanvasTexture(canvas);
    tex.wrapS = THREE.RepeatWrapping;
    tex.wrapT = THREE.RepeatWrapping;
    tex.repeat.set(1, 8);
    return tex;
  };

  const speedBumpMat = new THREE.MeshStandardMaterial({
    map: createStripedTexture(),
    roughness: 0.8,
  });

  [-3.2, 3.2].forEach(zLocal => {
    const bump = new THREE.Mesh(new THREE.CylinderGeometry(0.1, 0.1, 3.7, 16), speedBumpMat);
    bump.rotation.z = Math.PI / 2;
    bump.position.set(6.15, 0.05, zLocal); // Tepat di lajur 3 (X in [4.3, 8.0])
    bump.castShadow = true;
    secGroup.add(bump);
  });

  // 4. SECURITY BOOTH DI SISI MEDIAN (Menghadap langsung ke kendaraan lajur 3)
  const boothGroup = new THREE.Group();
  boothGroup.position.set(2.1, 0, 0); // Berada di pulau taman (X = 2.1) di bawah kanopi

  const frameMat = new THREE.MeshStandardMaterial({ color: 0xd1d5db, roughness: 0.8 });
  const panelMat = new THREE.MeshStandardMaterial({ color: 0xf1f5f9, roughness: 0.9 });
  const glassMat = new THREE.MeshStandardMaterial({ color: 0xbae6fd, transparent: true, opacity: 0.6, roughness: 0.1, metalness: 0.8 });
  const darkMat = new THREE.MeshStandardMaterial({ color: 0x1e293b });

  // Base Panel
  const basePanel = new THREE.Mesh(new THREE.BoxGeometry(2.6, 1.2, 3.0), panelMat);
  basePanel.position.set(0, 0.6, 0);
  basePanel.castShadow = true;
  boothGroup.add(basePanel);

  // 4 Kolom Booth
  const colGeo = new THREE.BoxGeometry(0.18, 2.8, 0.18);
  [ [-1.2, -1.4], [1.2, -1.4], [-1.2, 1.4], [1.2, 1.4] ].forEach(([cx, cz]) => {
    const c = new THREE.Mesh(colGeo, frameMat);
    c.position.set(cx, 1.4, cz);
    c.castShadow = true;
    boothGroup.add(c);
  });

  // Top frame / roof
  const topFrame = new THREE.Mesh(new THREE.BoxGeometry(2.8, 0.5, 3.2), frameMat);
  topFrame.position.set(0, 2.5, 0);
  topFrame.castShadow = true;
  boothGroup.add(topFrame);

  // White "SECURITY" sign board area
  const signBoard = new THREE.Mesh(new THREE.BoxGeometry(2.82, 0.28, 3.22), panelMat);
  signBoard.position.set(0, 2.5, 0);
  boothGroup.add(signBoard);

  // Glass Windows (Jendela besar menghadap lajur 3 di X = +1.25)
  const winLane = new THREE.Mesh(new THREE.BoxGeometry(0.05, 1.0, 2.6), glassMat);
  winLane.position.set(1.25, 1.7, 0);
  boothGroup.add(winLane);

  const winMedian = new THREE.Mesh(new THREE.BoxGeometry(0.05, 1.0, 2.6), glassMat);
  winMedian.position.set(-1.25, 1.7, 0);
  boothGroup.add(winMedian);

  const winSideGeo = new THREE.BoxGeometry(2.4, 1.0, 0.05);
  const winSide1 = new THREE.Mesh(winSideGeo, glassMat);
  winSide1.position.set(0, 1.7, 1.45);
  boothGroup.add(winSide1);
  const winSide2 = new THREE.Mesh(winSideGeo, glassMat);
  winSide2.position.set(0, 1.7, -1.45);
  boothGroup.add(winSide2);

  // Aksesoris Atap
  const light = new THREE.Mesh(new THREE.BoxGeometry(0.35, 0.18, 0.25), darkMat);
  light.position.set(0, 2.85, 0);
  boothGroup.add(light);

  secGroup.add(boothGroup);

  // ----------------------------------------------------------------------------
  // 5. WATER BARRIER SEPANJANG TIANG ATAP POS KEAMANAN (DI SISI LAJUR KE-2 MASUK)
  // Berjejer di X = +8.45 melindungi tiang kanopi dan memisahkan Lajur 3 & Lajur 2
  // ----------------------------------------------------------------------------
  const barrierOrangeMat = new THREE.MeshStandardMaterial({
    color: 0xea580c, // Safety Orange
    roughness: 0.45,
    metalness: 0.05
  });

  const barrierWhiteMat = new THREE.MeshStandardMaterial({
    color: 0xf8fafc, // Safety White
    roughness: 0.45,
    metalness: 0.05
  });

  const barrierReflectorMat = new THREE.MeshBasicMaterial({
    color: 0xfef08a, // Glowing yellow reflector
    side: THREE.DoubleSide
  });

  const barrierCapMat = new THREE.MeshStandardMaterial({
    color: 0x1e293b,
    roughness: 0.8
  });

  const createWaterBarrierUnit = (isOrange = true) => {
    const unit = new THREE.Group();
    const mat = isOrange ? barrierOrangeMat : barrierWhiteMat;

    // Body Dasar (Trapezoid stepped profile)
    const baseMesh = new THREE.Mesh(new THREE.BoxGeometry(0.46, 0.35, 1.25), mat);
    baseMesh.position.set(0, 0.175, 0);
    baseMesh.castShadow = true;
    unit.add(baseMesh);

    const upperMesh = new THREE.Mesh(new THREE.BoxGeometry(0.28, 0.52, 1.22), mat);
    upperMesh.position.set(0, 0.58, 0);
    upperMesh.castShadow = true;
    unit.add(upperMesh);

    const rimMesh = new THREE.Mesh(new THREE.BoxGeometry(0.32, 0.08, 1.26), mat);
    rimMesh.position.set(0, 0.86, 0);
    rimMesh.castShadow = true;
    unit.add(rimMesh);

    // Tutup pengisian air di atas (Black Cap)
    const cap = new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.06, 0.04, 12), barrierCapMat);
    cap.position.set(0, 0.91, 0);
    unit.add(cap);

    // Stiker Reflektor Kuning (Menghadap Lajur 2 di X > 0)
    const refl = new THREE.Mesh(new THREE.PlaneGeometry(1.0, 0.12), barrierReflectorMat);
    refl.position.set(0.142, 0.58, 0);
    refl.rotation.y = Math.PI / 2;
    unit.add(refl);

    // Stiker Reflektor Kuning (Menghadap Lajur 3 di X < 0)
    const reflInner = new THREE.Mesh(new THREE.PlaneGeometry(1.0, 0.12), barrierReflectorMat);
    reflInner.position.set(-0.142, 0.58, 0);
    reflInner.rotation.y = -Math.PI / 2;
    unit.add(reflInner);

    // Pin pengait sambungan antar barrier
    const pin = new THREE.Mesh(new THREE.CylinderGeometry(0.03, 0.03, 0.4, 8), barrierCapMat);
    pin.position.set(0, 0.45, 0.63);
    unit.add(pin);

    return unit;
  };

  // Deretan Water Barrier di X = +8.45 (di sisi lajur ke-2 sepanjang tiang kanopi)
  const barrierZOffsets = [-5.2, -3.9, -2.6, -1.3, 0, 1.3, 2.6, 3.9, 5.2];
  barrierZOffsets.forEach((bz, idx) => {
    const isOrange = idx % 2 === 0;
    const barrier = createWaterBarrierUnit(isOrange);
    barrier.position.set(8.45, 0, bz);
    secGroup.add(barrier);
  });

  mainlandGroup.add(secGroup);

  // ----------------------------------------------------------------------------
  // SEGMEN 3: PEMBANGKIT LISTRIK / GARDU INDUK PLN KOMPAK (Z = -128)
  // Sesuai denah satelit asli: Bangunan putih ganda di barat, rumpun pohon lebat di timur
  // ----------------------------------------------------------------------------
  const powerSubstationGroup = new THREE.Group();
  powerSubstationGroup.position.set(0, 0.8, -128);

  const subWallMat = new THREE.MeshStandardMaterial({ color: 0xf1f5f9, roughness: 0.5 }); // Putih arsitektural
  const subRoofMat = new THREE.MeshStandardMaterial({ color: 0xe2e8f0, roughness: 0.4 }); // Atap putih cerah (satelit)
  const subTrimMat = new THREE.MeshStandardMaterial({ color: 0x0284c7, roughness: 0.5 }); // Pelindo Blue
  const metalGrateMat = new THREE.MeshStandardMaterial({ color: 0x475569, metalness: 0.8, roughness: 0.3 });

  // 1. Bangunan Gardu Utama (Gedung 1)
  const bldg1 = new THREE.Mesh(new THREE.BoxGeometry(3.4, 2.4, 4.8), subWallMat);
  bldg1.position.set(-0.2, 1.2, -2.2);
  bldg1.castShadow = true;
  powerSubstationGroup.add(bldg1);

  const roof1 = new THREE.Mesh(new THREE.BoxGeometry(3.7, 0.3, 5.1), subRoofMat);
  roof1.position.set(-0.2, 2.5, -2.2);
  roof1.castShadow = true;
  powerSubstationGroup.add(roof1);

  // 2. Bangunan Gardu Sekunder (Gedung 2 - adjacent)
  const bldg2 = new THREE.Mesh(new THREE.BoxGeometry(2.8, 2.0, 3.6), subWallMat);
  bldg2.position.set(0.3, 1.0, 1.8);
  bldg2.castShadow = true;
  powerSubstationGroup.add(bldg2);

  const roof2 = new THREE.Mesh(new THREE.BoxGeometry(3.1, 0.3, 3.9), subRoofMat);
  roof2.position.set(0.3, 2.1, 1.8);
  roof2.castShadow = true;
  powerSubstationGroup.add(roof2);

  // Pintu Besi Servis & Detail Ventilasi
  const doorMat = new THREE.MeshStandardMaterial({ color: 0x1e293b, roughness: 0.6 });
  const door = new THREE.Mesh(new THREE.BoxGeometry(0.1, 1.8, 1.4), doorMat);
  door.position.set(1.52, 0.9, -2.2);
  powerSubstationGroup.add(door);

  // Trafo & Panel Kompak di sisi gedung
  const transformerMat = new THREE.MeshStandardMaterial({ color: 0x334155, roughness: 0.4, metalness: 0.7 });
  const insulatorMat = new THREE.MeshStandardMaterial({ color: 0x78350f, roughness: 0.3 });
  const trafo = new THREE.Mesh(new THREE.BoxGeometry(1.6, 1.4, 1.4), transformerMat);
  trafo.position.set(-0.4, 0.7, 4.6);
  trafo.castShadow = true;
  powerSubstationGroup.add(trafo);

  [-0.3, 0.3].forEach(ix => {
    const ins = new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.08, 0.5, 8), insulatorMat);
    ins.position.set(ix - 0.4, 1.6, 4.6);
    powerSubstationGroup.add(ins);
  });

  mainlandGroup.add(powerSubstationGroup);

  // Rumpun Pohon Lebat di Ujung Timur Taman Segmen 3 (Z = -118 s/d -110, sesuai foto satelit)
  addTree(mainlandGroup,  0.5, 1.15, -118, 1.4);
  addTree(mainlandGroup, -1.2, 1.15, -114, 1.3);
  addTree(mainlandGroup,  0.8, 1.15, -111, 1.2);
  addBush(mainlandGroup, -0.2, 1.15, -116, 1.3);
  addBush(mainlandGroup,  1.1, 1.15, -113, 1.1);
  addBush(mainlandGroup, -0.8, 1.15, -110, 1.0);

  envGroup.add(mainlandGroup);

  scene.add(envGroup);
  return envGroup;
}
