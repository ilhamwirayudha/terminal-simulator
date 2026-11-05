import * as THREE from 'three';
import { SOUTHWEST_BARRIER_CONFIG, CUKER_BOUNDS } from './GeoCuker.js';
import { seaWaterMat } from '../../../assets/materials/roadMaterials.js';

/**
 * ==============================================================================
 * Sub-Area: Kompleks Fasilitas Pembatas Barat Daya, Kabin NW, & Mangrove L-Shape
 * ==============================================================================
 * 1. Deretan Gedung Pembatas Fisik Sisi Barat Daya (Membentang X: 19m s/d 130m di Z in [1035, 1046m]):
 *    - Pos Jaga & Gardu Gerbang Cuker (X = 21, Z = 1045)
 *    - Gedung Kantor Operasional Cuker / TR 5 (X = 33, Z = 1039)
 *    - Workshop / Pergudangan Besar Atap Merah Bata Terakota (X = 55, Z = 1038.5)
 *    - Kanopi Shelter Supir & Istirahat Pengemudi (X = 76, Z = 1039)
 *    - Kompleks Portacamp 2 Lantai (X = 94, Z = 1039)
 *    - Stasiun Pengisian BBM Solar Truk (Tangki Silinder Kembar) (X = 111, Z = 1038.5)
 *    - Gardu Trafo / Generator Listrik Pelabuhan (X = 125, Z = 1038.5)
 *    - Kluster Kabin & Portacamp Modular Barat Laut (X: 137-143, Z: 1041-1051)
 * 2. Pagar perimeter keliling mengikuti tanggul reklamasi (NE dimundurkan ke Z = 1157m)
 * 3. Sabuk hutan mangrove lebat membungkus sisi NW & NE (dimundurkan ke Z: 1159 - 1198m)
 * (Tiang lampu high mast telah dihilangkan total sesuai permintaan)
 */
export function createSubAreaFasilitasCuker() {
  const facGroup = new THREE.Group();
  facGroup.name = 'subarea_cuker_facilities';

  const yGround = 1.565;
  const yMud = 1.05;
  const yWater = 0.85;

  const zEndAsphalt = CUKER_BOUNDS.zAsphaltMax; // 1145.0m
  const zEndSoil = CUKER_BOUNDS.zBufferMax;     // 1159.0m
  const zFenceNE = zEndSoil - 2.0;              // 1157.0m
  const zMangroveMax = CUKER_BOUNDS.zMangroveMax;// 1198.0m

  // Material Bangunan
  const wallWhiteMat = new THREE.MeshStandardMaterial({ color: 0xe2e8f0, roughness: 0.7 });
  const wallBeigeMat = new THREE.MeshStandardMaterial({ color: 0xcbd5e1, roughness: 0.75 });
  const wallDarkMat = new THREE.MeshStandardMaterial({ color: 0x334155, roughness: 0.8 });
  const roofSlateMat = new THREE.MeshStandardMaterial({ color: 0x1e293b, roughness: 0.5 });
  const roofTerracottaMat = new THREE.MeshStandardMaterial({ color: 0x9a3412, roughness: 0.8, metalness: 0.1 });
  const glassMat = new THREE.MeshStandardMaterial({ color: 0x0f172a, roughness: 0.1, metalness: 0.9 });
  const steelTrussMat = new THREE.MeshStandardMaterial({ color: 0x64748b, metalness: 0.7, roughness: 0.3 });
  const hazardOrangeMat = new THREE.MeshStandardMaterial({ color: 0xf59e0b, roughness: 0.4 });
  const hazardYellowMat = new THREE.MeshStandardMaterial({ color: 0xeab308, roughness: 0.4 });
  const shutterDoorMat = new THREE.MeshStandardMaterial({ color: 0x475569, roughness: 0.6, metalness: 0.5 });
  const tankWhiteMat = new THREE.MeshStandardMaterial({ color: 0xf8fafc, roughness: 0.3, metalness: 0.6 });

  // ----------------------------------------------------------------------------
  // 1. KOMPLEKS FASILITAS PEMBATAS SISI BARAT DAYA (Z: 1035.0 s/d 1046.0m)
  // ----------------------------------------------------------------------------

  // A. Pos Jaga & Gardu Gerbang Cuker (X = 21.0, Z = 1045.0)
  const gateBooth = new THREE.Group();
  gateBooth.position.set(21.0, yGround, 1045.0);

  const boothBody = new THREE.Mesh(new THREE.BoxGeometry(4.5, 3.2, 5.5), wallWhiteMat);
  boothBody.position.set(0, 1.6, 0);
  boothBody.castShadow = true;
  gateBooth.add(boothBody);

  const boothRoof = new THREE.Mesh(new THREE.BoxGeometry(5.8, 0.35, 7.0), roofSlateMat);
  boothRoof.position.set(0, 3.35, 0);
  gateBooth.add(boothRoof);

  const boothGlassNorth = new THREE.Mesh(new THREE.PlaneGeometry(3.6, 1.3), glassMat);
  boothGlassNorth.position.set(0, 1.9, 2.76);
  gateBooth.add(boothGlassNorth);

  const boothGlassRoad = new THREE.Mesh(new THREE.PlaneGeometry(4.5, 1.3), glassMat);
  boothGlassRoad.rotation.y = -Math.PI / 2;
  boothGlassRoad.position.set(-2.26, 1.9, 0);
  gateBooth.add(boothGlassRoad);

  const barrierPost = new THREE.Mesh(new THREE.BoxGeometry(0.4, 1.1, 0.4), hazardOrangeMat);
  barrierPost.position.set(-2.4, 0.55, 3.2);
  gateBooth.add(barrierPost);

  const barrierArm = new THREE.Mesh(new THREE.CylinderGeometry(0.05, 0.05, 4.2), wallWhiteMat);
  barrierArm.rotateZ(Math.PI / 2);
  barrierArm.position.set(-4.5, 1.0, 3.2);
  gateBooth.add(barrierArm);

  facGroup.add(gateBooth);

  // B. Gedung Kantor Operasional Cuker / TR 5 (X = 33.0, Z = 1039.0)
  const officeBuilding = new THREE.Group();
  officeBuilding.position.set(33.0, yGround, 1039.0);

  const officeMain = new THREE.Mesh(new THREE.BoxGeometry(14.0, 4.6, 8.0), wallWhiteMat);
  officeMain.position.set(0, 2.3, 0);
  officeMain.castShadow = true;
  officeBuilding.add(officeMain);

  const officeRoof = new THREE.Mesh(new THREE.BoxGeometry(15.2, 0.4, 9.2), roofSlateMat);
  officeRoof.position.set(0, 4.8, 0);
  officeBuilding.add(officeRoof);

  [-4.01, 4.01].forEach((pz) => {
    const winRibbon = new THREE.Mesh(new THREE.PlaneGeometry(12.0, 1.4), glassMat);
    winRibbon.position.set(0, 2.6, pz);
    if (pz < 0) winRibbon.rotation.y = Math.PI;
    officeBuilding.add(winRibbon);
  });

  facGroup.add(officeBuilding);

  // C. Workshop / Pergudangan Besar Atap Merah Bata Terakota (X = 55.0, Z = 1038.5)
  const warehouseGroup = new THREE.Group();
  warehouseGroup.position.set(55.0, yGround, 1038.5);

  const whBody = new THREE.Mesh(new THREE.BoxGeometry(24.0, 5.0, 11.0), wallBeigeMat);
  whBody.position.set(0, 2.5, 0);
  whBody.castShadow = true;
  warehouseGroup.add(whBody);

  const roofShape = new THREE.Shape();
  roofShape.moveTo(-5.8, 0);
  roofShape.lineTo(0, 2.6);
  roofShape.lineTo(5.8, 0);
  roofShape.closePath();

  const roofExtrudeSettings = { steps: 1, depth: 24.8, bevelEnabled: false };
  const pitchedRoofGeo = new THREE.ExtrudeGeometry(roofShape, roofExtrudeSettings);
  const pitchedRoofMesh = new THREE.Mesh(pitchedRoofGeo, roofTerracottaMat);
  pitchedRoofMesh.rotation.y = Math.PI / 2;
  pitchedRoofMesh.position.set(-12.4, 5.0, 0);
  pitchedRoofMesh.castShadow = true;
  warehouseGroup.add(pitchedRoofMesh);

  [-7.0, 0, 7.0].forEach((dx) => {
    const shutter = new THREE.Mesh(new THREE.PlaneGeometry(3.6, 3.6), shutterDoorMat);
    shutter.position.set(dx, 1.8, 5.51);
    warehouseGroup.add(shutter);
  });

  facGroup.add(warehouseGroup);

  // D. Shelter Supir & Kanopi Peneduh Panjang (X = 76.0, Z = 1039.0)
  const shelterGroup = new THREE.Group();
  shelterGroup.position.set(76.0, yGround, 1039.0);

  const canopyRoof = new THREE.Mesh(new THREE.BoxGeometry(16.0, 0.25, 7.0), roofSlateMat);
  canopyRoof.position.set(0, 3.8, 0);
  shelterGroup.add(canopyRoof);

  [-7.0, -2.5, 2.5, 7.0].forEach((px) => {
    [-3.0, 3.0].forEach((pz) => {
      const col = new THREE.Mesh(new THREE.CylinderGeometry(0.12, 0.12, 3.8, 8), steelTrussMat);
      col.position.set(px, 1.9, pz);
      shelterGroup.add(col);
    });
  });

  const restRoom = new THREE.Mesh(new THREE.BoxGeometry(8.0, 3.2, 4.0), wallWhiteMat);
  restRoom.position.set(0, 1.6, -1.0);
  shelterGroup.add(restRoom);

  facGroup.add(shelterGroup);

  // E. Kompleks Portacamp Modular 2 Lantai (X = 94.0, Z = 1039.0)
  const portacampGroup = new THREE.Group();
  portacampGroup.position.set(94.0, yGround, 1039.0);

  const pcL1A = new THREE.Mesh(new THREE.BoxGeometry(5.8, 2.8, 4.5), wallWhiteMat);
  pcL1A.position.set(-3.0, 1.4, 0);
  portacampGroup.add(pcL1A);

  const pcL1B = new THREE.Mesh(new THREE.BoxGeometry(5.8, 2.8, 4.5), wallBeigeMat);
  pcL1B.position.set(3.0, 1.4, 0);
  portacampGroup.add(pcL1B);

  const pcL2 = new THREE.Mesh(new THREE.BoxGeometry(6.0, 2.8, 4.5), wallWhiteMat);
  pcL2.position.set(0, 4.2, 0);
  portacampGroup.add(pcL2);

  const stair = new THREE.Mesh(new THREE.BoxGeometry(1.2, 3.2, 2.4), steelTrussMat);
  stair.position.set(4.2, 1.6, 2.2);
  portacampGroup.add(stair);

  facGroup.add(portacampGroup);

  // F. Stasiun Pengisian BBM Solar Truk (X = 111.0, Z = 1038.5)
  const fuelStationGroup = new THREE.Group();
  fuelStationGroup.position.set(111.0, yGround, 1038.5);

  const tankGeo = new THREE.CylinderGeometry(1.4, 1.4, 6.0, 16);
  tankGeo.rotateZ(Math.PI / 2);

  [-1.6, 1.6].forEach((tz) => {
    const tank = new THREE.Mesh(tankGeo, tankWhiteMat);
    tank.position.set(0, 1.8, tz);
    tank.castShadow = true;
    fuelStationGroup.add(tank);

    const band = new THREE.Mesh(new THREE.CylinderGeometry(1.42, 1.42, 0.4, 16), hazardYellowMat);
    band.rotateZ(Math.PI / 2);
    band.position.set(0, 1.8, tz);
    fuelStationGroup.add(band);

    [-2.2, 2.2].forEach((tx) => {
      const saddle = new THREE.Mesh(new THREE.BoxGeometry(0.5, 0.8, 1.8), wallDarkMat);
      saddle.position.set(tx, 0.4, tz);
      fuelStationGroup.add(saddle);
    });
  });

  const pumpIsland = new THREE.Mesh(new THREE.BoxGeometry(4.0, 0.25, 1.2), hazardYellowMat);
  pumpIsland.position.set(0, 0.125, 4.2);
  fuelStationGroup.add(pumpIsland);

  const pumpDispenser = new THREE.Mesh(new THREE.BoxGeometry(0.8, 1.6, 0.6), wallDarkMat);
  pumpDispenser.position.set(0, 0.95, 4.2);
  fuelStationGroup.add(pumpDispenser);

  const pumpCanopy = new THREE.Mesh(new THREE.BoxGeometry(5.2, 0.2, 2.4), roofSlateMat);
  pumpCanopy.position.set(0, 3.2, 4.2);
  fuelStationGroup.add(pumpCanopy);

  facGroup.add(fuelStationGroup);

  // G. Gardu Trafo & Ruang Generator Listrik Pelabuhan (X = 125.0, Z = 1038.5)
  const substationGroup = new THREE.Group();
  substationGroup.position.set(125.0, yGround, 1038.5);

  const subBody = new THREE.Mesh(new THREE.BoxGeometry(8.0, 3.8, 6.0), wallDarkMat);
  subBody.position.set(0, 1.9, 0);
  subBody.castShadow = true;
  substationGroup.add(subBody);

  const subRoof = new THREE.Mesh(new THREE.BoxGeometry(8.6, 0.3, 6.6), roofSlateMat);
  subRoof.position.set(0, 3.95, 0);
  substationGroup.add(subRoof);

  const louver = new THREE.Mesh(new THREE.PlaneGeometry(2.4, 1.8), shutterDoorMat);
  louver.position.set(0, 2.0, 3.01);
  substationGroup.add(louver);

  const warningPlate = new THREE.Mesh(new THREE.PlaneGeometry(0.8, 0.8), hazardYellowMat);
  warningPlate.position.set(2.4, 2.0, 3.01);
  substationGroup.add(warningPlate);

  facGroup.add(substationGroup);

  // H. Kluster Portacamp & Kabin Modular Sisi Barat Laut (X in [137, 143], Z in [1041, 1051])
  // Tampak pada citra satelit di tepi tanah reklamasi barat laut
  const nwCabinMatBlue = new THREE.MeshStandardMaterial({ color: 0x1e40af, roughness: 0.6 });
  const nwCabinMatWhite = new THREE.MeshStandardMaterial({ color: 0xe2e8f0, roughness: 0.65 });
  const nwCabins = [
    { x: 139.0, z: 1043.0, mat: nwCabinMatBlue },
    { x: 142.5, z: 1043.0, mat: nwCabinMatWhite },
    { x: 139.0, z: 1048.5, mat: nwCabinMatWhite },
    { x: 142.5, z: 1048.5, mat: nwCabinMatBlue }
  ];

  nwCabins.forEach(({ x, z, mat }) => {
    const cabin = new THREE.Mesh(new THREE.BoxGeometry(2.44, 2.59, 5.0), mat);
    cabin.position.set(x, yGround + 1.30, z);
    cabin.castShadow = true;
    facGroup.add(cabin);

    const cRoof = new THREE.Mesh(new THREE.BoxGeometry(2.54, 0.15, 5.1), roofSlateMat);
    cRoof.position.set(x, yGround + 2.67, z);
    facGroup.add(cRoof);
  });

  // ----------------------------------------------------------------------------
  // 2. Pagar Perimeter Keliling Pelabuhan (Chain Link Fence di Tanggul Cokelat)
  // Pagar Timur Laut dimundurkan ke Z = 1157.0m
  // ----------------------------------------------------------------------------
  const fenceMat = new THREE.MeshStandardMaterial({ color: 0x64748b, metalness: 0.6, roughness: 0.4 });
  const postGeo = new THREE.CylinderGeometry(0.06, 0.06, 2.4, 6);

  const createFenceLine = (x1, z1, x2, z2, step = 4.0) => {
    const dx = x2 - x1;
    const dz = z2 - z1;
    const len = Math.hypot(dx, dz);
    const count = Math.floor(len / step);
    const angle = Math.atan2(dx, dz);

    const fenceSeg = new THREE.Group();
    for (let i = 0; i <= count; i++) {
      const t = i / count;
      const px = x1 + t * dx;
      const pz = z1 + t * dz;
      const post = new THREE.Mesh(postGeo, fenceMat);
      post.position.set(px, yGround + 1.2, pz);
      fenceSeg.add(post);
    }

    const topRail = new THREE.Mesh(new THREE.CylinderGeometry(0.03, 0.03, len, 6), fenceMat);
    topRail.rotation.x = Math.PI / 2;
    topRail.rotation.z = -angle;
    topRail.position.set((x1 + x2) / 2, yGround + 2.3, (z1 + z2) / 2);
    fenceSeg.add(topRail);

    return fenceSeg;
  };

  facGroup.add(createFenceLine(146.0, 1034.4, 146.0, zFenceNE, 5.0)); // Pagar NW
  facGroup.add(createFenceLine(146.0, zFenceNE, 18.5, zFenceNE, 5.0));  // Pagar NE (Dimundurkan ke 1157m)

  // ----------------------------------------------------------------------------
  // 4. Sabuk Hutan Mangrove Pesisir Bentuk L (Membungkus Sisi NW & NE)
  // Dimundurkan mengikuti batas baru Z: 1159m s/d 1198m
  // ----------------------------------------------------------------------------
  const mudMat = new THREE.MeshStandardMaterial({ color: 0x333b32, roughness: 0.96, metalness: 0.04 });

  const mudShape = new THREE.Shape();
  mudShape.moveTo(146.0, -1034.4);
  mudShape.lineTo(185.0, -1034.4);
  mudShape.lineTo(185.0, -zMangroveMax);
  // Sisi Timur Laut disesuaikan agar tidak tumpang tindih dengan sabuk pohon jalan Main Gate (X <= 33m)
  mudShape.lineTo(33.0, -zMangroveMax);
  mudShape.lineTo(33.0, -zFenceNE);
  mudShape.lineTo(146.0, -zFenceNE);
  mudShape.closePath();

  const mudGeo = new THREE.ShapeGeometry(mudShape);
  const mudMesh = new THREE.Mesh(mudGeo, mudMat);
  mudMesh.rotation.x = -Math.PI / 2;
  mudMesh.position.set(0, yMud, 0);
  mudMesh.receiveShadow = true;
  facGroup.add(mudMesh);

  const waterShape = new THREE.Shape();
  waterShape.moveTo(175.0, -1030.0);
  waterShape.lineTo(235.0, -1030.0);
  waterShape.lineTo(235.0, -1245.0);
  waterShape.lineTo(15.0, -1245.0);
  waterShape.lineTo(15.0, -1192.0);
  waterShape.lineTo(175.0, -1192.0);
  waterShape.closePath();

  const waterGeo = new THREE.ShapeGeometry(waterShape);
  const waterMesh = new THREE.Mesh(waterGeo, seaWaterMat);
  waterMesh.rotation.x = -Math.PI / 2;
  waterMesh.position.set(0, yWater, 0);
  facGroup.add(waterMesh);

  const trunkGeo = new THREE.CylinderGeometry(0.2, 0.45, 2.5, 6);
  const foliageGeo = new THREE.DodecahedronGeometry(2.0, 1);
  const trunkMat = new THREE.MeshStandardMaterial({ color: 0x2b1d12, roughness: 0.95 });
  const foliageMat = new THREE.MeshStandardMaterial({ roughness: 0.85, metalness: 0.05 });

  const folColors = [
    new THREE.Color(0x132a14),
    new THREE.Color(0x1a381c),
    new THREE.Color(0x2d4f22),
    new THREE.Color(0x1e401b)
  ];

  let seed = 456789123;
  const rand = () => {
    seed = (seed * 1664525 + 1013904223) % 4294967296;
    return seed / 4294967296;
  };

  const treeList = [];

  // Mangrove Sisi NW (Z: 1034.4 s/d 1157.0)
  for (let x = 148.0; x <= 175.0; x += 3.6) {
    for (let z = 1034.4; z <= zFenceNE; z += 3.6) {
      const jx = x + (rand() - 0.5) * 2.2;
      const jz = z + (rand() - 0.5) * 2.2;
      const scale = 0.85 + rand() * 0.45;
      const col = folColors[Math.floor(rand() * folColors.length)];
      treeList.push({ x: jx, z: jz, scale, color: col });
    }
  }

  // Mangrove Sisi NE Membelok (Z: 1159.0 s/d 1198.0, X dimulai dari 33m agar jalan Main Gate steril)
  for (let x = 33.0; x <= 178.0; x += 3.6) {
    for (let z = zEndSoil; z <= zMangroveMax; z += 3.6) {
      const jx = x + (rand() - 0.5) * 2.2;
      const jz = z + (rand() - 0.5) * 2.2;
      const scale = 0.85 + rand() * 0.45;
      const col = folColors[Math.floor(rand() * folColors.length)];
      treeList.push({ x: jx, z: jz, scale, color: col });
    }
  }

  if (treeList.length > 0) {
    const trunkInst = new THREE.InstancedMesh(trunkGeo, trunkMat, treeList.length);
    const foliageInst = new THREE.InstancedMesh(foliageGeo, foliageMat, treeList.length);
    trunkInst.castShadow = true;
    foliageInst.castShadow = true;

    const dummy = new THREE.Object3D();
    treeList.forEach((t, i) => {
      dummy.position.set(t.x, yGround + 1.25 * t.scale, t.z);
      dummy.scale.set(t.scale, t.scale, t.scale);
      dummy.rotation.set(0, rand() * Math.PI * 2, 0);
      dummy.updateMatrix();
      trunkInst.setMatrixAt(i, dummy.matrix);

      dummy.position.set(t.x, yGround + 2.8 * t.scale, t.z);
      dummy.updateMatrix();
      foliageInst.setMatrixAt(i, dummy.matrix);
      foliageInst.setColorAt(i, t.color);
    });

    trunkInst.instanceMatrix.needsUpdate = true;
    foliageInst.instanceMatrix.needsUpdate = true;
    if (foliageInst.instanceColor) foliageInst.instanceColor.needsUpdate = true;

    facGroup.add(trunkInst);
    facGroup.add(foliageInst);
  }

  return facGroup;
}
