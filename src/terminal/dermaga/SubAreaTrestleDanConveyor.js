import * as THREE from 'three';
import { TRESTLE_CONFIG } from './GeoDermaga.js';
import { createConveyorGallery } from '../../assets/industrial/createConveyorGallery.js';
import { createContainerTruck } from '../../assets/vehicles/createContainerTruck.js';

/**
 * ==============================================================================
 * SubAreaTrestleDanConveyor.js
 * ==============================================================================
 * Membangun:
 * 1. Perpanjangan Jalan Pasca-Gate & Plaza Abutmen Trestle (Z: 2436.0 s/d 2482.0)
 * 2. Menara Transfer Darat Beratap Merah (-7.192383, 112.679518) + Sambungan dari Cuker
 * 3. Jembatan Penghubung (Trestle) sepanjang 954.0m x 16.0m (Z: 2482.0 s/d 3436.0)
 * 4. 2-Lane Circular Pipe Sea Conveyor sepanjang 975.0m (Z: 2469.5 s/d 3444.5)
 */
export function createSubAreaTrestleDanConveyor() {
  const group = new THREE.Group();
  group.name = 'subarea_trestle_dan_conveyor';

  const {
    roadExtZStart,
    roadExtZEnd,
    yRoadLand,
    zStart,
    zEnd,
    widthX,
    yDeck,
    pileSpacingZ,
    conveyor
  } = TRESTLE_CONFIG;

  // Material Palet (Diseragamkan dengan warna jalan aspal standar 0x22262e)
  const concreteDeckMat = new THREE.MeshStandardMaterial({
    color: 0x22262e,
    roughness: 0.88,
    metalness: 0.08
  });

  const asphaltPlazaMat = new THREE.MeshStandardMaterial({
    color: 0x22262e,
    roughness: 0.88,
    metalness: 0.08
  });

  const barrierMat = new THREE.MeshStandardMaterial({
    color: 0x94a3b8,
    roughness: 0.7,
    metalness: 0.15
  });

  const jointMat = new THREE.MeshStandardMaterial({
    color: 0x475569,
    roughness: 0.85
  });

  const markingWhiteMat = new THREE.MeshStandardMaterial({
    color: 0xf8fafc,
    roughness: 0.4,
    polygonOffset: true,
    polygonOffsetFactor: -2,
    polygonOffsetUnits: -2
  });

  const markingYellowMat = new THREE.MeshStandardMaterial({
    color: 0xfacc15,
    roughness: 0.4,
    polygonOffset: true,
    polygonOffsetFactor: -2,
    polygonOffsetUnits: -2
  });

  const pileConcreteMat = new THREE.MeshStandardMaterial({
    color: 0x64748b,
    roughness: 0.85,
    metalness: 0.15
  });

  const towerWallMat = new THREE.MeshStandardMaterial({
    color: 0xdbe2ea,
    roughness: 0.55,
    metalness: 0.25
  });

  const redRoofMat = new THREE.MeshStandardMaterial({
    color: 0xb91c1c, // Atap merah khas Menara Transfer Conveyor di citra satelit
    roughness: 0.5,
    metalness: 0.25
  });

  const steelSupportMat = new THREE.MeshStandardMaterial({
    color: 0x475569,
    roughness: 0.5,
    metalness: 0.65
  });

  // ----------------------------------------------------------------------------
  // 1. PERPANJANGAN JALAN PASCA-GATE & PLAZA PANGKAL TRESTLE (Z: 2436.0 s/d 2482.0)
  // ----------------------------------------------------------------------------
  const extLenZ = roadExtZEnd - roadExtZStart; // 46.0m
  const extMidZ = (roadExtZStart + roadExtZEnd) / 2;

  // Pelat aspal plaza penghubung ujung koridor darat (lebar 42.8m: X in [-21.4, +21.4])
  const landPlaza = new THREE.Mesh(
    new THREE.BoxGeometry(42.8, 0.35, extLenZ),
    asphaltPlazaMat
  );
  landPlaza.position.set(0, yRoadLand - 0.15, extMidZ);
  landPlaza.receiveShadow = true;
  group.add(landPlaza);

  // Tanggul batu/tanah reklamasi di bawah plaza pangkal Trestle
  const abutmentRevetment = new THREE.Mesh(
    new THREE.BoxGeometry(46.0, 2.0, extLenZ + 4.0),
    pileConcreteMat
  );
  abutmentRevetment.position.set(0, 0.5, extMidZ);
  abutmentRevetment.receiveShadow = true;
  group.add(abutmentRevetment);

  // Ramp tanjakan mulus dari elevasi jalan darat (y = 1.631 di Z = 2442) ke dek Trestle (y = 3.2 di Z = 2482)
  const rampLenZ = 40.0;
  const rampStartZ = roadExtZEnd - rampLenZ; // 2442.0
  const rampMidY = (yRoadLand + yDeck) / 2;
  const rampSlopeAngle = Math.atan2(yDeck - yRoadLand, rampLenZ);

  const rampMesh = new THREE.Mesh(
    new THREE.BoxGeometry(widthX, 0.6, rampLenZ / Math.cos(rampSlopeAngle)),
    concreteDeckMat
  );
  rampMesh.position.set(0, rampMidY - 0.25, rampStartZ + rampLenZ / 2);
  rampMesh.rotation.x = -rampSlopeAngle;
  rampMesh.receiveShadow = true;
  rampMesh.castShadow = true;
  group.add(rampMesh);

  // ----------------------------------------------------------------------------
  // 2. JEMBATAN TRESTLE UTAMA (Z: 2482.0 s/d 3436.0 | Panjang 954.0m x Lebar 16.0m)
  // ----------------------------------------------------------------------------
  const trestleLenZ = zEnd - zStart; // 954.0m
  const trestleMidZ = (zStart + zEnd) / 2; // 2959.0
  const deckThickness = 0.85;

  const trestleDeck = new THREE.Mesh(
    new THREE.BoxGeometry(widthX, deckThickness, trestleLenZ),
    concreteDeckMat
  );
  trestleDeck.position.set(0, yDeck - deckThickness / 2, trestleMidZ);
  trestleDeck.receiveShadow = true;
  trestleDeck.castShadow = true;
  group.add(trestleDeck);

  // Parapet Beton Pembatas Tepi Kiri (+7.75) & Kanan (-7.75) serta Median Tengah (0.0)
  [-widthX / 2 + 0.25, widthX / 2 - 0.25].forEach((bx) => {
    const sideBarrier = new THREE.Mesh(
      new THREE.BoxGeometry(0.45, 0.75, trestleLenZ),
      barrierMat
    );
    sideBarrier.position.set(bx, yDeck + 0.375, trestleMidZ);
    sideBarrier.castShadow = true;
    group.add(sideBarrier);
  });

  // Garis Marka Kuning Ganda di Tengah Trestle & Marka Lajur Putih
  [-0.18, 0.18].forEach((mx) => {
    const centerLine = new THREE.Mesh(
      new THREE.PlaneGeometry(0.14, trestleLenZ - 4.0),
      markingYellowMat
    );
    centerLine.rotation.x = -Math.PI / 2;
    centerLine.position.set(mx, yDeck + 0.015, trestleMidZ);
    group.add(centerLine);
  });

  [-3.8, 3.8].forEach((lx) => {
    const laneLine = new THREE.Mesh(
      new THREE.PlaneGeometry(0.15, trestleLenZ - 4.0),
      markingWhiteMat
    );
    laneLine.rotation.x = -Math.PI / 2;
    laneLine.position.set(lx, yDeck + 0.015, trestleMidZ);
    group.add(laneLine);
  });

  // Garis Dilatasi / Expansion Joint setiap 24m (terlihat jelas bergaris-garis di citra satelit)
  const numSpans = Math.floor(trestleLenZ / pileSpacingZ);
  const jointGeo = new THREE.BoxGeometry(widthX - 0.6, 0.04, 0.28);
  const jointInst = new THREE.InstancedMesh(jointGeo, jointMat, numSpans + 1);
  const dummy = new THREE.Object3D();

  for (let i = 0; i <= numSpans; i++) {
    const jz = zStart + i * pileSpacingZ;
    dummy.position.set(0, yDeck + 0.01, jz);
    dummy.rotation.set(0, 0, 0);
    dummy.scale.set(1, 1, 1);
    dummy.updateMatrix();
    jointInst.setMatrixAt(i, dummy.matrix);
  }
  jointInst.instanceMatrix.needsUpdate = true;
  group.add(jointInst);

  // Tiang Pancang Laut (Sea Piles & Pile Caps) di Bawah Trestle (InstancedMesh)
  const capGeo = new THREE.BoxGeometry(widthX + 1.2, 0.8, 2.2);
  const capInst = new THREE.InstancedMesh(capGeo, pileConcreteMat, numSpans + 1);

  const pileHeight = yDeck + 3.5;
  const pileGeo = new THREE.CylinderGeometry(0.45, 0.45, pileHeight, 10);
  const pilesPerBent = 4;
  const pileInst = new THREE.InstancedMesh(pileGeo, pileConcreteMat, (numSpans + 1) * pilesPerBent);

  let pileIdx = 0;
  const pileXOffsets = [-6.2, -2.1, 2.1, 6.2];

  for (let i = 0; i <= numSpans; i++) {
    const bz = zStart + i * pileSpacingZ;

    // Pile Cap
    dummy.position.set(0, yDeck - deckThickness - 0.4, bz);
    dummy.rotation.set(0, 0, 0);
    dummy.updateMatrix();
    capInst.setMatrixAt(i, dummy.matrix);

    // 4 Tiang Pancang per Bent
    for (let p = 0; p < pilesPerBent; p++) {
      dummy.position.set(pileXOffsets[p], yDeck - deckThickness - pileHeight / 2, bz);
      dummy.updateMatrix();
      pileInst.setMatrixAt(pileIdx++, dummy.matrix);
    }
  }
  capInst.instanceMatrix.needsUpdate = true;
  pileInst.instanceMatrix.needsUpdate = true;
  group.add(capInst);
  group.add(pileInst);

  // ----------------------------------------------------------------------------
  // 3. MENARA TRANSFER DARAT BERATAP MERAH & 2-LANE CIRCULAR SEA CONVEYOR (975m)
  // ----------------------------------------------------------------------------
  const { landTower, berthTower, laneX, elevationY } = conveyor;

  // Fungsi pembuat Menara Transfer Conveyor Beratap Merah (Sesuai Citra Satelit)
  const createRedRoofTransferTower = ({ widthX: twX, widthZ: twZ, height: tH }) => {
    const tGroup = new THREE.Group();

    // Pondasi beton di atas air/tanah
    const basePad = new THREE.Mesh(
      new THREE.BoxGeometry(twX + 2.0, 3.4, twZ + 2.0),
      pileConcreteMat
    );
    basePad.position.y = 1.7;
    tGroup.add(basePad);

    // Badan menara cladding putih-abu industrial
    const bodyH = tH - 3.4;
    const body = new THREE.Mesh(
      new THREE.BoxGeometry(twX, bodyH, twZ),
      towerWallMat
    );
    body.position.y = 3.4 + bodyH / 2;
    body.castShadow = true;
    body.receiveShadow = true;
    tGroup.add(body);

    // Atap limas/pelana merah ikonik sesuai foto satelit
    const roof = new THREE.Mesh(
      new THREE.BoxGeometry(twX + 1.2, 0.95, twZ + 1.2),
      redRoofMat
    );
    roof.position.y = tH + 0.45;
    roof.castShadow = true;
    tGroup.add(roof);

    const roofRidge = new THREE.Mesh(
      new THREE.BoxGeometry(twX * 0.65, 0.7, twZ * 0.65),
      redRoofMat
    );
    roofRidge.position.y = tH + 1.1;
    tGroup.add(roofRidge);

    return tGroup;
  };

  // A. Menara Transfer Darat Beratap Merah (-7.192383, 112.679518 -> X = 15.5, Z = 2469.5)
  const landTowerMesh = createRedRoofTransferTower(landTower);
  landTowerMesh.position.set(landTower.x, 0, landTower.z);
  group.add(landTowerMesh);

  // Jembatan penghubung pendek 2-lane conveyor dari tepi jalan Cuker (X = 21.4) ke Menara Transfer Darat (X = 15.5)
  [2466.8, 2472.2].forEach((cz) => {
    group.add(
      createConveyorGallery({
        start: { x: 22.0, y: 13.5, z: cz },
        end: { x: landTower.x, y: elevationY + 1.5, z: cz },
        width: 3.1,
        height: 2.9,
        isCircular: true,
        withSupports: false
      })
    );
  });

  // B. 2-Lane Circular Pipe Sea Conveyor Sepanjang 975.0m (Z: 2469.5 s/d 3444.5)
  laneX.forEach((lx) => {
    group.add(
      createConveyorGallery({
        start: { x: lx, y: elevationY, z: conveyor.zStart },
        end: { x: lx, y: elevationY, z: conveyor.zEnd },
        width: 3.0,
        height: 3.0,
        isCircular: true,
        withSupports: true,
        supportSpacing: 24.0,
        groundY: 0.0
      })
    );
  });

  // Portal Pengaku Melintang & Pile Cap Laut untuk 2-Lane Sea Conveyor
  const convSpanCount = Math.floor((conveyor.zEnd - conveyor.zStart) / 24.0);
  const convCapGeo = new THREE.BoxGeometry(8.2, 1.2, 2.0);
  const convCapInst = new THREE.InstancedMesh(convCapGeo, pileConcreteMat, convSpanCount + 1);

  for (let i = 0; i <= convSpanCount; i++) {
    const cz = conveyor.zStart + i * 24.0;
    dummy.position.set(conveyor.centerX, 0.8, cz);
    dummy.rotation.set(0, 0, 0);
    dummy.updateMatrix();
    convCapInst.setMatrixAt(i, dummy.matrix);
  }
  convCapInst.instanceMatrix.needsUpdate = true;
  group.add(convCapInst);

  // 3 Stasiun Penegang / Mini-Tower Hijau di Sepanjang Conveyor Laut (Terlihat di Citra Satelit)
  [2720.0, 2980.0, 3240.0].forEach((stZ) => {
    const frameTower = new THREE.Mesh(
      new THREE.BoxGeometry(8.6, 5.2, 4.5),
      steelSupportMat
    );
    frameTower.position.set(conveyor.centerX, elevationY + 0.4, stZ);
    frameTower.castShadow = true;
    group.add(frameTower);
  });

  // C. Menara Transfer Dermaga Beratap Merah (-7.185955, 112.685875 -> X = 19.5, Z = 3444.5)
  const berthTowerMesh = createRedRoofTransferTower(berthTower);
  berthTowerMesh.position.set(berthTower.x, 0, berthTower.z);
  group.add(berthTowerMesh);

  // ----------------------------------------------------------------------------
  // 4. DERETAN DOLPHIN PELINDUNG DI SISI TENGGARA UJUNG TRESTLE (Z: 3250 s/d 3425)
  //    Terlihat sebagai 3 klaster barisan tiang hitam di kanan-atas gambar Trestle
  // ----------------------------------------------------------------------------
  const dolphinClusterStarts = [3255.0, 3315.0, 3375.0];
  dolphinClusterStarts.forEach((baseZ) => {
    for (let k = 0; k < 7; k++) {
      const dz = baseZ + k * 5.5;
      const fenderPile = new THREE.Mesh(
        new THREE.CylinderGeometry(0.65, 0.65, 4.2, 10),
        jointMat
      );
      fenderPile.position.set(-13.5, 1.8, dz);
      fenderPile.castShadow = true;
      group.add(fenderPile);
    }
  });

  // ----------------------------------------------------------------------------
  // 5. LALU LINTAS TRUK DI ATAS JEMBATAN TRESTLE (Sesuai Foto Satelit)
  // ----------------------------------------------------------------------------
  const trestleTrucks = [
    { x: 3.6,  z: 2610.0, rotY: 0,        load: 'ONE_40FT', color: 0x16a34a }, // Truk hijau menuju dermaga
    { x: 3.6,  z: 2890.0, rotY: 0,        load: 'TWO_20FT', color: 0x0284c7 },
    { x: 3.6,  z: 3180.0, rotY: 0,        load: 'ONE_40FT', color: 0x16a34a },
    { x: 3.6,  z: 3340.0, rotY: 0,        load: 'ONE_20FT', color: 0xd97706 },
    { x: -3.6, z: 2740.0, rotY: Math.PI,  load: 'ONE_40FT', color: 0xdc2626 }, // Truk kembali ke CY
    { x: -3.6, z: 3090.0, rotY: Math.PI,  load: 'EMPTY',    color: 0x0284c7 },
    { x: -3.6, z: 3290.0, rotY: Math.PI,  load: 'TWO_20FT', color: 0x16a34a }
  ];

  trestleTrucks.forEach((tk) => {
    const truck = createContainerTruck({
      loadType: tk.load,
      primaryColor: tk.color,
      cabColor: 0xf8fafc
    });
    truck.position.set(tk.x, yDeck, tk.z);
    truck.rotation.y = tk.rotY;
    group.add(truck);
  });

  return group;
}
