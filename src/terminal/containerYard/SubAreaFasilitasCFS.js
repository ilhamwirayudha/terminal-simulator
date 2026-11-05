import * as THREE from 'three';
import {
  CONTAINER_SPECS,
  CONTAINER_PALETTE,
  createInstancedContainerBlock
} from '../../assets/containers/createContainer.js';
import {
  createContainerTruck,
  TRUCK_CAB_MATERIALS,
  TRUCK_CONTAINER_MATERIALS
} from '../../assets/vehicles/createContainerTruck.js';
import {
  CY_BOUNDS,
  CFS_ZONE_CONFIG
} from './GeoContainerYard.js';

/**
 * ==============================================================================
 * Sub-Area: Kompleks CFS, Workshop, Terminal Office, Halte Bus, SPBU & Yard CFS
 *           (Bagian 1 Zona Tengah CY: X = -21.4 s/d -114.0 | Z = 2040 s/d 2413)
 * ==============================================================================
 * Sesuai Koordinat Ground Truth & Gambar Detail (media_1793902907594_b40ab1e9.png):
 * 1. Workshop & Terminal Office (Z: 2057.5 s/d 2079.8, X: -26.0 s/d -113.5)
 * 2. Halte Bus (-7.195129, 112.677452) & Tempat Isi Bensin / SPBU (-7.195272, 112.677497)
 * 3. Gedung CFS (114m x 46m) + Loading Dock CTT Truck Utara + Parkir Serong Selatan
 * 4. Yard Kontainer Samping Kanan CFS (5 baris hadap NW-SE + klaster hadap SW-NE + Reefer putih)
 */
export function createSubAreaFasilitasCFS() {
  const cfsGroup = new THREE.Group();
  cfsGroup.name = 'subarea_fasilitas_cfs_cy';

  const { yPavement } = CY_BOUNDS;
  const { workshop, busStop, fuelStation, cfsArea, eastCfsYard } = CFS_ZONE_CONFIG;

  // Materials
  const wallLightMat = new THREE.MeshStandardMaterial({
    color: 0xe2e8f0,
    roughness: 0.55,
    metalness: 0.15
  });
  const wallDarkMat = new THREE.MeshStandardMaterial({
    color: 0x334155,
    roughness: 0.65,
    metalness: 0.25
  });
  const roofWhiteMat = new THREE.MeshStandardMaterial({
    color: 0xf1f5f9,
    roughness: 0.38,
    metalness: 0.22
  });
  const roofSilverMat = new THREE.MeshStandardMaterial({
    color: 0xd1d5db,
    roughness: 0.42,
    metalness: 0.35
  });
  const roofDarkMat = new THREE.MeshStandardMaterial({
    color: 0x1e293b,
    roughness: 0.6,
    metalness: 0.3
  });
  const roofTerracottaMat = new THREE.MeshStandardMaterial({
    color: 0xb45309,
    roughness: 0.65
  });
  const fuelCanopyMat = new THREE.MeshStandardMaterial({
    color: 0x0284c7, // Biru Pelindo / SPBU
    roughness: 0.4,
    metalness: 0.3
  });
  const busStopMat = new THREE.MeshStandardMaterial({
    color: 0x0d9488,
    roughness: 0.4,
    metalness: 0.3
  });
  const apronConcreteMat = new THREE.MeshStandardMaterial({
    color: 0x737b84,
    roughness: 0.82
  });

  // ----------------------------------------------------------------------------
  // 1. Kompleks Workshop & Terminal Office (Z: 2057.5 s/d 2079.8, X: -26 s/d -113.5)
  // ----------------------------------------------------------------------------
  const wsGroup = new THREE.Group();
  wsGroup.name = 'cy_workshop_and_office';

  // Gedung 1 (Atas): Workshop Utama Beratap Putih (X: -28 s/d -64, Z: 2058 s/d 2076)
  const wsMain = new THREE.Mesh(new THREE.BoxGeometry(36.0, 8.5, 17.5), wallLightMat);
  wsMain.position.set(-46.0, yPavement + 4.25, 2067.0);
  wsMain.castShadow = true;
  wsMain.receiveShadow = true;
  wsGroup.add(wsMain);

  const wsMainRoof = new THREE.Mesh(new THREE.BoxGeometry(37.2, 0.45, 18.6), roofWhiteMat);
  wsMainRoof.position.set(-46.0, yPavement + 8.7, 2067.0);
  wsMainRoof.castShadow = true;
  wsGroup.add(wsMainRoof);

  // Gedung 2 (Tengah): Terminal Office (X: -66 s/d -84, Z: 2059 s/d 2073)
  const wsMid = new THREE.Mesh(new THREE.BoxGeometry(17.5, 7.2, 13.5), wallLightMat);
  wsMid.position.set(-75.0, yPavement + 3.6, 2066.0);
  wsMid.castShadow = true;
  wsGroup.add(wsMid);

  const wsMidRoof = new THREE.Mesh(new THREE.BoxGeometry(18.4, 0.4, 14.4), roofWhiteMat);
  wsMidRoof.position.set(-75.0, yPavement + 7.4, 2066.0);
  wsGroup.add(wsMidRoof);

  // Gedung 3 (Bawah): Gedung Kontrol / Maintenance (X: -88 s/d -112, Z: 2058 s/d 2075)
  const wsBot = new THREE.Mesh(new THREE.BoxGeometry(23.0, 7.8, 16.5), wallDarkMat);
  wsBot.position.set(-100.0, yPavement + 3.9, 2066.5);
  wsBot.castShadow = true;
  wsGroup.add(wsBot);

  const wsBotRoof = new THREE.Mesh(new THREE.BoxGeometry(24.0, 0.4, 17.5), roofSilverMat);
  wsBotRoof.position.set(-100.0, yPavement + 8.0, 2066.5);
  wsGroup.add(wsBotRoof);

  cfsGroup.add(wsGroup);

  // ----------------------------------------------------------------------------
  // 2. Halte Bus & Tempat Isi Bensin / Fuel Station
  // ----------------------------------------------------------------------------
  // A. Halte Bus (-7.195129, 112.677452 -> Z = 2114.2, X = -23.8)
  const busGroup = new THREE.Group();
  busGroup.position.set(busStop.centerX, yPavement, busStop.centerZ);

  const busPlatform = new THREE.Mesh(
    new THREE.BoxGeometry(busStop.depthX, 0.22, busStop.widthZ),
    wallLightMat
  );
  busPlatform.position.y = 0.11;
  busGroup.add(busPlatform);

  const busBackWall = new THREE.Mesh(
    new THREE.BoxGeometry(0.25, 2.8, busStop.widthZ - 0.4),
    wallDarkMat
  );
  busBackWall.position.set(-busStop.depthX / 2 + 0.2, 1.5, 0);
  busGroup.add(busBackWall);

  const busRoof = new THREE.Mesh(
    new THREE.BoxGeometry(busStop.depthX + 0.6, 0.25, busStop.widthZ + 0.6),
    busStopMat
  );
  busRoof.position.y = 3.0;
  busRoof.castShadow = true;
  busGroup.add(busRoof);
  cfsGroup.add(busGroup);

  // B. Tempat Isi Bensin / Fuel Station (-7.195272, 112.677497 -> Z = 2106.3, X = -37.6)
  const fuelGroup = new THREE.Group();
  fuelGroup.position.set(fuelStation.centerX, yPavement, fuelStation.centerZ);

  const fuelIsland = new THREE.Mesh(
    new THREE.BoxGeometry(fuelStation.depthX, 0.24, fuelStation.widthZ),
    wallLightMat
  );
  fuelIsland.position.y = 0.12;
  fuelGroup.add(fuelIsland);

  // 2 Dispenser Pompa BBM & 4 Tiang Kanopi
  [-2.5, 2.5].forEach((fz) => {
    const pump = new THREE.Mesh(new THREE.BoxGeometry(1.2, 2.1, 0.9), fuelCanopyMat);
    pump.position.set(0, 1.2, fz);
    pump.castShadow = true;
    fuelGroup.add(pump);

    [-2.8, 2.8].forEach((fx) => {
      const col = new THREE.Mesh(new THREE.CylinderGeometry(0.2, 0.2, 5.4, 8), wallLightMat);
      col.position.set(fx, 2.7, fz);
      fuelGroup.add(col);
    });
  });

  const fuelCanopy = new THREE.Mesh(
    new THREE.BoxGeometry(fuelStation.depthX + 1.6, 0.55, fuelStation.widthZ + 1.6),
     roofWhiteMat
  );
  fuelCanopy.position.y = 5.5;
  fuelCanopy.castShadow = true;
  fuelGroup.add(fuelCanopy);

  const fuelFascia = new THREE.Mesh(
    new THREE.BoxGeometry(fuelStation.depthX + 1.7, 0.35, fuelStation.widthZ + 1.7),
    fuelCanopyMat
  );
  fuelFascia.position.y = 5.55;
  fuelGroup.add(fuelFascia);

  cfsGroup.add(fuelGroup);

  // ----------------------------------------------------------------------------
  // 3. Gedung Utama CFS (Container Freight Station: 114m x 46m)
  // ----------------------------------------------------------------------------
  const cfsBldgGroup = new THREE.Group();
  cfsBldgGroup.name = 'cfs_main_warehouse';

  const cfsLenZ = cfsArea.bldgZMax - cfsArea.bldgZMin; // 114.0m
  const cfsWidX = Math.abs(cfsArea.bldgXMax - cfsArea.bldgXMin); // 46.0m
  const cfsMidZ = (cfsArea.bldgZMin + cfsArea.bldgZMax) / 2;     // 2175.0
  const cfsMidX = (cfsArea.bldgXMax + cfsArea.bldgXMin) / 2;     // -69.0

  // Apron Beton Terang di Sekeliling CFS
  const cfsApron = new THREE.Mesh(
    new THREE.PlaneGeometry(77.0, 141.0),
    apronConcreteMat
  );
  cfsApron.rotation.x = -Math.PI / 2;
  cfsApron.position.set(-70.0, yPavement + 0.01, 2185.0);
  cfsApron.receiveShadow = true;
  cfsBldgGroup.add(cfsApron);

  // Dinding Utama Gedung CFS
  const cfsWallH = 9.5;
  const cfsBody = new THREE.Mesh(
    new THREE.BoxGeometry(cfsWidX, cfsWallH, cfsLenZ),
    wallLightMat
  );
  cfsBody.position.set(cfsMidX, yPavement + cfsWallH / 2, cfsMidZ);
  cfsBody.castShadow = true;
  cfsBody.receiveShadow = true;
  cfsBldgGroup.add(cfsBody);

  // Atap Melengkung / Barrel-Pitched Roof Gedung CFS (sesuai citra satelit)
  const roofCurveShape = new THREE.Shape();
  const halfX = (cfsWidX + 2.0) / 2;
  roofCurveShape.moveTo(-halfX, 0);
  roofCurveShape.quadraticCurveTo(0, 6.2, halfX, 0);
  roofCurveShape.closePath();

  const cfsRoofGeo = new THREE.ExtrudeGeometry(roofCurveShape, {
    depth: cfsLenZ + 2.0,
    bevelEnabled: false,
    curveSegments: 16
  });
  const cfsRoofMesh = new THREE.Mesh(cfsRoofGeo, roofSilverMat);
  cfsRoofMesh.position.set(cfsMidX, yPavement + cfsWallH, cfsMidZ - (cfsLenZ + 2.0) / 2);
  cfsRoofMesh.castShadow = true;
  cfsRoofMesh.receiveShadow = true;
  cfsBldgGroup.add(cfsRoofMesh);

  // Kanopi Loading Dock di Sisi Utara (X = -43.5) & Sisi Selatan (X = -94.5)
  [-43.5, -94.5].forEach((cx) => {
    const dockCanopy = new THREE.Mesh(
      new THREE.BoxGeometry(5.5, 0.35, cfsLenZ - 4.0),
      roofWhiteMat
    );
    dockCanopy.position.set(cx, yPavement + 5.2, cfsMidZ);
    dockCanopy.castShadow = true;
    cfsBldgGroup.add(dockCanopy);
  });

  // Pos / Gedung Kantor Kecil di Sudut Kiri-Bawah CFS (Z = 2114, X = -98, atap terakota/merah)
  const cfsCornerOffice = new THREE.Mesh(
    new THREE.BoxGeometry(12.0, 5.5, 9.5),
    wallLightMat
  );
  cfsCornerOffice.position.set(-98.0, yPavement + 2.75, 2114.0);
  cfsCornerOffice.castShadow = true;
  cfsBldgGroup.add(cfsCornerOffice);

  const cfsCornerRoof = new THREE.Mesh(
    new THREE.BoxGeometry(12.8, 0.4, 10.2),
    roofTerracottaMat
  );
  cfsCornerRoof.position.set(-98.0, yPavement + 5.7, 2114.0);
  cfsBldgGroup.add(cfsCornerRoof);

  // Gedung Inspeksi / Kantor Gelap di Yard Samping Kanan CFS (Z = 2348, X = -62)
  const darkYardBldg = new THREE.Mesh(
    new THREE.BoxGeometry(20.0, 6.8, 16.0),
    wallDarkMat
  );
  darkYardBldg.position.set(-62.0, yPavement + 3.4, 2348.0);
  darkYardBldg.castShadow = true;
  cfsBldgGroup.add(darkYardBldg);

  const darkYardRoof = new THREE.Mesh(
    new THREE.BoxGeometry(21.0, 0.4, 17.0),
    roofDarkMat
  );
  darkYardRoof.position.set(-62.0, yPavement + 7.0, 2348.0);
  cfsBldgGroup.add(darkYardRoof);

  cfsGroup.add(cfsBldgGroup);

  // ----------------------------------------------------------------------------
  // 4. Penataan Kontainer & Parkir CTT di Sekitar CFS & Yard Samping Kanan
  //    (Memperhatikan arah hadap NW-SE vs SW-NE sesuai media_1793902907594_b40ab1e9.png)
  // ----------------------------------------------------------------------------
  const spec = CONTAINER_SPECS.TEU_20FT;
  const contH = spec.height;

  let seed = 667788991;
  const rand = () => {
    seed = (seed * 1664525 + 1013904223) % 4294967296;
    return seed / 4294967296;
  };

  // List 1: Kontainer menghadap NW-SE (orientedCrosswise: true -> panjang 6.06m searah X)
  const nwSeContainers = [];
  // List 2: Kontainer menghadap SW-NE (orientedCrosswise: false -> panjang 6.06m searah Z)
  const swNeContainers = [];

  // A. 18 Slot CTT Truck Parkir Mundur di Loading Dock Utara Gedung CFS (X = -37.5, Z: 2133 s/d 2225)
  // Menggunakan model truk standar dari waitingCY (createContainerTruck)
  const cabMats = [
    TRUCK_CAB_MATERIALS.WHITE,
    TRUCK_CAB_MATERIALS.BLUE,
    TRUCK_CAB_MATERIALS.RED,
    TRUCK_CAB_MATERIALS.GREEN,
    TRUCK_CAB_MATERIALS.YELLOW
  ];
  const contMats = [
    TRUCK_CONTAINER_MATERIALS.BLUE,
    TRUCK_CONTAINER_MATERIALS.RED,
    TRUCK_CONTAINER_MATERIALS.ORANGE,
    TRUCK_CONTAINER_MATERIALS.GREEN,
    TRUCK_CONTAINER_MATERIALS.WHITE,
    TRUCK_CONTAINER_MATERIALS.GREY
  ];
  const loadTypes = ['ONE_40FT', 'TWO_20FT', 'ONE_20FT', 'EMPTY'];

  for (let z = 2133.0; z <= 2225.0; z += 5.4) {
    if (rand() < 0.12) continue;
    const tLoad = loadTypes[Math.floor(rand() * loadTypes.length)];
    const tCab = cabMats[Math.floor(rand() * cabMats.length)];
    const tMat1 = contMats[Math.floor(rand() * contMats.length)];
    const tMat2 = contMats[Math.floor(rand() * contMats.length)];

    const cttTruck = createContainerTruck({
      loadType: tLoad,
      cabMat: tCab,
      matCont1: tMat1,
      matCont2: tMat2
    });
    // rotation.y = +PI/2 -> kabin menghadap +X (Utara/NW), buntut trailer merapat ke loading dock CFS (X = -45.5)
    cttTruck.rotation.y = Math.PI / 2;
    cttTruck.position.set(-37.5, yPavement, z);
    cfsGroup.add(cttTruck);
  }

  // B. Kontainer Serong di Selatan (Belakang) Gedung CFS (X = -102.0, Z: 2124 s/d 2212)
  for (let z = 2126.0; z <= 2210.0; z += 5.2) {
    if (rand() < 0.25) continue;
    const col = CONTAINER_PALETTE[Math.floor(rand() * CONTAINER_PALETTE.length)];
    nwSeContainers.push({
      x: -102.0,
      y: yPavement + contH / 2,
      z,
      rotationY: 0.58, // Kontainer miring/serong sesuai gambar
      color: col
    });
  }

  // C. 5 Baris Rapi Kontainer Menghadap NW-SE di Samping Kanan CFS (Z: 2262 s/d 2306, X: -32 s/d -86)
  // Terlihat sangat jelas di media_1793902907594_b40ab1e9.png: 5 baris memanjang vertikal (X)
  const fiveRowsX = [-33.0, -45.5, -58.0, -70.5, -83.0];
  fiveRowsX.forEach((rx) => {
    for (let z = 2263.0; z <= 2305.0; z += 2.85) {
      if (rand() < 0.08) continue;
      const tiers = 1 + Math.floor(rand() * 3);
      const domCol = CONTAINER_PALETTE[Math.floor(rand() * CONTAINER_PALETTE.length)];
      for (let t = 0; t < tiers; t++) {
        nwSeContainers.push({
          x: rx,
          y: yPavement + contH / 2 + t * contH,
          z,
          color: rand() < 0.75 ? domCol : CONTAINER_PALETTE[Math.floor(rand() * CONTAINER_PALETTE.length)]
        });
      }
    }
  });

  // D. Klaster Kontainer Menghadap SW-NE (Horizontal) di Sebelah Kanan 5 Baris Tersebut
  //    (Z: 2314 s/d 2408, X: -28 s/d -92, menghindari gedung gelap di X=-62, Z=2348)
  const swNeClusters = [
    { zMin: 2314.0, zMax: 2334.0, xMin: -88.0, xMax: -30.0 },
    { zMin: 2362.0, zMax: 2408.0, xMin: -90.0, xMax: -28.0 },
    { zMin: 2340.0, zMax: 2356.0, xMin: -42.0, xMax: -30.0 },
    // Klaster kecil di kiri Workshop (Z: 2043 s/d 2055)
    { zMin: 2044.0, zMax: 2054.0, xMin: -68.0, xMax: -50.0 },
    { zMin: 2044.0, zMax: 2054.0, xMin: -106.0, xMax: -92.0 }
  ];

  swNeClusters.forEach((cl) => {
    for (let x = cl.xMax; x >= cl.xMin; x -= 2.9) {
      for (let z = cl.zMin; z <= cl.zMax; z += 6.5) {
        if (rand() < 0.32) continue;
        const tiers = 1 + Math.floor(rand() * 3);
        const domCol = CONTAINER_PALETTE[Math.floor(rand() * CONTAINER_PALETTE.length)];
        for (let t = 0; t < tiers; t++) {
          swNeContainers.push({
            x,
            y: yPavement + contH / 2 + t * contH,
            z,
            color: rand() < 0.75 ? domCol : CONTAINER_PALETTE[Math.floor(rand() * CONTAINER_PALETTE.length)]
          });
        }
      }
    }
  });

  // E. 2 Baris Kontainer Putih (Reefer/Empty) Menghadap SW-NE di Bawah Yard Kanan CFS
  //    (X = -99.5 & -103.0, Z: 2258 s/d 2348) sesuai barisan putih terang di gambar
  const whiteColor = new THREE.Color(0xf8fafc);
  [-99.5, -103.0].forEach((wx) => {
    for (let z = 2260.0; z <= 2346.0; z += 6.6) {
      if (rand() < 0.12) continue;
      const tiers = 2 + Math.floor(rand() * 2);
      for (let t = 0; t < tiers; t++) {
        swNeContainers.push({
          x: wx,
          y: yPavement + contH / 2 + t * contH,
          z,
          color: whiteColor
        });
      }
    }
  });

  cfsGroup.add(createInstancedContainerBlock(nwSeContainers, { orientedCrosswise: true }));
  cfsGroup.add(createInstancedContainerBlock(swNeContainers, { orientedCrosswise: false }));

  return cfsGroup;
}
