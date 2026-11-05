import * as THREE from 'three';
import { BERTH_CONFIG, STS_CRANES_PLACEMENT } from './GeoDermaga.js';
import { createSTSCrane, createBerthRailTrack } from '../../assets/equipment/createBerthCranes.js';
import { createContainerTruck } from '../../assets/vehicles/createContainerTruck.js';

/**
 * ==============================================================================
 * SubAreaDermagaPetikemas.js
 * ==============================================================================
 * Membangun Segmen Dermaga Petikemas (656.0m x 80.0m | X: +16.0 s/d -640.0):
 * - Dek beton dermaga di atas tiang pancang laut (menyatu tanpa pemisah di X = +16.0
 *   dengan Dermaga Curah Kering)
 * - Fender karet kapal, bollard tambat kuning, & gedung operasional pangkal dermaga
 * - Marka loop sirkulasi truk di koridor tengah dermaga
 * - Rel STS Menerus Sisi Luar (+Z, X: -634 s/d +260) & Rel STS Sisi Dalam (-Z)
 * - 8 unit CC/STS Crane di segmen Petikemas (4 sisi luar + 4 sisi dalam)
 */
export function createSubAreaDermagaPetikemas() {
  const group = new THREE.Group();
  group.name = 'subarea_dermaga_petikemas';

  const {
    yDeck,
    deckThickness,
    railGaugeZ,
    outerRailCenterZ,
    outerRailStartX,
    outerRailEndX,
    innerRailCenterZ,
    innerRailStartX,
    innerRailEndX,
    petikemas
  } = BERTH_CONFIG;

  const lengthX = petikemas.xMax - petikemas.xMin; // 656.0m (dari +16.0 ke -640.0)
  const midX = (petikemas.xMax + petikemas.xMin) / 2; // -312.0
  const widthZ = petikemas.zMax - petikemas.zMin; // 80.0m (dari 3436.0 ke 3516.0)
  const midZ = (petikemas.zMax + petikemas.zMin) / 2; // 3476.0

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

  const loopLineBlueMat = new THREE.MeshStandardMaterial({
    color: 0x3b82f6,
    roughness: 0.5,
    polygonOffset: true,
    polygonOffsetFactor: -2,
    polygonOffsetUnits: -2
  });

  const markingWhiteMat = new THREE.MeshStandardMaterial({
    color: 0xf8fafc,
    roughness: 0.45,
    polygonOffset: true,
    polygonOffsetFactor: -2,
    polygonOffsetUnits: -2
  });

  const bldgWallMat = new THREE.MeshStandardMaterial({
    color: 0xe2e8f0,
    roughness: 0.6
  });

  const bldgRoofMat = new THREE.MeshStandardMaterial({
    color: 0x475569,
    roughness: 0.65
  });

  // ----------------------------------------------------------------------------
  // 1. DEK BETON UTAMA DERMAGA PETIKEMAS (656.0m x 80.0m)
  //    Menyambung mulus tanpa celah di X = +16.0 dengan Dermaga Curah Kering
  // ----------------------------------------------------------------------------
  const berthDeck = new THREE.Mesh(
    new THREE.BoxGeometry(lengthX, deckThickness, widthZ),
    concreteDeckMat
  );
  berthDeck.position.set(midX, yDeck - deckThickness / 2, midZ);
  berthDeck.receiveShadow = true;
  berthDeck.castShadow = true;
  group.add(berthDeck);

  // Balok Kanstin Tepi Dermaga (Coping Beam di sisi Luar +Z, Dalam -Z, dan Ujung SE -X)
  const outerCoping = new THREE.Mesh(
    new THREE.BoxGeometry(lengthX, 0.35, 1.2),
    copingEdgeMat
  );
  outerCoping.position.set(midX, yDeck + 0.12, petikemas.zMax - 0.6);
  group.add(outerCoping);

  // Tepi dalam dibagi agar tidak menghalangi mulut jembatan Trestle (X in [-8.0, +8.0])
  const innerLenSE = -8.5 - petikemas.xMin; // 631.5m
  const innerCopingSE = new THREE.Mesh(
    new THREE.BoxGeometry(innerLenSE, 0.35, 1.2),
    copingEdgeMat
  );
  innerCopingSE.position.set((petikemas.xMin - 8.5) / 2, yDeck + 0.12, petikemas.zMin + 0.6);
  group.add(innerCopingSE);

  const seEndCoping = new THREE.Mesh(
    new THREE.BoxGeometry(1.2, 0.35, widthZ),
    copingEdgeMat
  );
  seEndCoping.position.set(petikemas.xMin + 0.6, yDeck + 0.12, midZ);
  group.add(seEndCoping);

  // ----------------------------------------------------------------------------
  // 2. TIANG PANCANG LAUT (SEA PILES) DI BAWAH DEK DERMAGA PETIKEMAS (InstancedMesh)
  // ----------------------------------------------------------------------------
  const pileStepX = 20.0;
  const pileRowsZ = [3440.0, 3458.0, 3476.0, 3494.0, 3512.0];
  const numColsX = Math.floor(lengthX / pileStepX) + 1;
  const totalPiles = numColsX * pileRowsZ.length;

  const pileHeight = yDeck + 3.5;
  const pileGeo = new THREE.CylinderGeometry(0.52, 0.52, pileHeight, 10);
  const pileInst = new THREE.InstancedMesh(pileGeo, pileConcreteMat, totalPiles);
  const dummy = new THREE.Object3D();

  let pIdx = 0;
  for (let ix = 0; ix < numColsX; ix++) {
    const px = petikemas.xMin + 4.0 + ix * pileStepX;
    for (let iz = 0; iz < pileRowsZ.length; iz++) {
      dummy.position.set(px, yDeck - deckThickness - pileHeight / 2, pileRowsZ[iz]);
      dummy.rotation.set(0, 0, 0);
      dummy.updateMatrix();
      pileInst.setMatrixAt(pIdx++, dummy.matrix);
    }
  }
  pileInst.instanceMatrix.needsUpdate = true;
  group.add(pileInst);

  // ----------------------------------------------------------------------------
  // 3. FENDER KARET KAPAL & MOORING BOLLARD KUNING DI TEPI DERMAGA
  // ----------------------------------------------------------------------------
  const fenderSpacingX = 18.0;
  const fenderCountSide = Math.floor((lengthX - 16.0) / fenderSpacingX);
  const fenderGeo = new THREE.BoxGeometry(2.6, 1.5, 0.95);
  const bollardGeo = new THREE.CylinderGeometry(0.28, 0.35, 0.75, 10);

  const fenderInst = new THREE.InstancedMesh(fenderGeo, rubberFenderMat, fenderCountSide * 2);
  const bollardInst = new THREE.InstancedMesh(bollardGeo, bollardYellowMat, fenderCountSide * 2);

  let fIdx = 0;
  let bIdx = 0;
  for (let i = 0; i < fenderCountSide; i++) {
    const fx = petikemas.xMin + 10.0 + i * fenderSpacingX;

    // Sisi Luar (+Z)
    dummy.position.set(fx, yDeck - 0.55, petikemas.zMax + 0.45);
    dummy.updateMatrix();
    fenderInst.setMatrixAt(fIdx++, dummy.matrix);

    dummy.position.set(fx, yDeck + 0.38, petikemas.zMax - 0.8);
    dummy.updateMatrix();
    bollardInst.setMatrixAt(bIdx++, dummy.matrix);

    // Sisi Dalam (-Z, hanya untuk X < -16.0 agar tidak menabrak Trestle)
    if (fx < -16.0) {
      dummy.position.set(fx, yDeck - 0.55, petikemas.zMin - 0.45);
      dummy.updateMatrix();
      fenderInst.setMatrixAt(fIdx++, dummy.matrix);

      dummy.position.set(fx, yDeck + 0.38, petikemas.zMin + 0.8);
      dummy.updateMatrix();
      bollardInst.setMatrixAt(bIdx++, dummy.matrix);
    }
  }
  fenderInst.count = fIdx;
  bollardInst.count = bIdx;
  fenderInst.instanceMatrix.needsUpdate = true;
  bollardInst.instanceMatrix.needsUpdate = true;
  group.add(fenderInst);
  group.add(bollardInst);

  // ----------------------------------------------------------------------------
  // 4. GEDUNG OPERASIONAL PANGKAL DERMAGA & MARKA LOOP SIRKULASI TRUK
  //    Terlihat jelas di citra satelit tepat di selatan pertemuan Trestle
  // ----------------------------------------------------------------------------
  // Gedung Pos / Kantor Dermaga 1 & 2 di tepi dalam dekat Trestle (X: -28 s/d -12, Z: 3440 s/d 3462)
  const opsBldg1 = new THREE.Mesh(
    new THREE.BoxGeometry(11.0, 4.8, 7.5),
    bldgWallMat
  );
  opsBldg1.position.set(-16.5, yDeck + 2.4, 3444.5);
  opsBldg1.castShadow = true;
  group.add(opsBldg1);

  const opsRoof1 = new THREE.Mesh(
    new THREE.BoxGeometry(11.8, 0.5, 8.2),
    bldgRoofMat
  );
  opsRoof1.position.set(-16.5, yDeck + 5.0, 3444.5);
  group.add(opsRoof1);

  const opsBldg2 = new THREE.Mesh(
    new THREE.BoxGeometry(14.5, 5.2, 9.0),
    bldgWallMat
  );
  opsBldg2.position.set(-22.0, yDeck + 2.6, 3455.5);
  opsBldg2.castShadow = true;
  group.add(opsBldg2);

  const opsRoof2 = new THREE.Mesh(
    new THREE.BoxGeometry(15.2, 0.5, 9.6),
    bldgRoofMat
  );
  opsRoof2.position.set(-22.0, yDeck + 5.4, 3455.5);
  group.add(opsRoof2);

  // Marka Loop Jalan Sirkulasi Truk di Koridor Tengah Dermaga (Z: 3468 s/d 3484, X: -25 s/d -515)
  const loopLenX = 490.0;
  const loopMidX = -270.0;
  [3468.5, 3476.0, 3483.5].forEach((lz, idx) => {
    const lineMat = idx === 1 ? markingWhiteMat : loopLineBlueMat;
    const roadLine = new THREE.Mesh(
      new THREE.PlaneGeometry(loopLenX, idx === 1 ? 0.25 : 0.45),
      lineMat
    );
    roadLine.rotation.x = -Math.PI / 2;
    roadLine.position.set(loopMidX, yDeck + 0.02, lz);
    group.add(roadLine);
  });

  // Garis lengkung belokan dari ujung Trestle (X = 0, Z = 3436) masuk ke koridor tengah dermaga
  const turnCurveMat = new THREE.MeshStandardMaterial({
    color: 0x22262e,
    roughness: 0.88,
    metalness: 0.08,
    polygonOffset: true,
    polygonOffsetFactor: -1,
    polygonOffsetUnits: -1
  });
  const turnApron = new THREE.Mesh(
    new THREE.PlaneGeometry(34.0, 46.0),
    turnCurveMat
  );
  turnApron.rotation.x = -Math.PI / 2;
  turnApron.position.set(-2.0, yDeck + 0.01, 3459.0);
  group.add(turnApron);

  // ----------------------------------------------------------------------------
  // 5. JALUR REL BAJA STS CRANE (REL LUAR MENERUS KE CUKER & REL DALAM PETIKEMAS)
  // ----------------------------------------------------------------------------
  // A. Rel STS Sisi Luar (+Z): Menerus dari ujung SE Petikemas (X = -634) hingga ujung NW Cuker (X = +260)
  group.add(
    createBerthRailTrack({
      startX: outerRailStartX,
      endX: outerRailEndX,
      centerZ: outerRailCenterZ,
      railGaugeZ,
      ySurface: yDeck
    })
  );

  // B. Rel STS Sisi Dalam (-Z): Sepanjang sisi Domestik Dermaga Petikemas (X = -634 s/d -28)
  group.add(
    createBerthRailTrack({
      startX: innerRailStartX,
      endX: innerRailEndX,
      centerZ: innerRailCenterZ,
      railGaugeZ,
      ySurface: yDeck
    })
  );

  // ----------------------------------------------------------------------------
  // 6. 8 UNIT CC/STS CRANE DI SEGMEN DERMAGA PETIKEMAS
  //    (2 unit sisanya berada di Segmen Dermaga Curah Kering -> Total = 10 unit)
  // ----------------------------------------------------------------------------
  const petikemasCranes = STS_CRANES_PLACEMENT.filter((c) => c.segment === 'PETIKEMAS');
  petikemasCranes.forEach((cfg) => {
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
  // 7. TRUK KONTAINER (CTT) YANG SEDANG BEROPERASI DI DERMAGA PETIKEMAS
  // ----------------------------------------------------------------------------
  const berthTrucks = [
    { x: -95.0,  z: 3454.0, rotY: Math.PI / 2,  load: 'ONE_40FT', color: 0x0284c7 },
    { x: -175.0, z: 3448.0, rotY: Math.PI / 2,  load: 'TWO_20FT', color: 0xdc2626 },
    { x: -205.0, z: 3498.0, rotY: -Math.PI / 2, load: 'ONE_40FT', color: 0x16a34a },
    { x: -310.0, z: 3472.0, rotY: -Math.PI / 2, load: 'ONE_40FT', color: 0xd97706 },
    { x: -385.0, z: 3504.0, rotY: -Math.PI / 2, load: 'TWO_20FT', color: 0x0284c7 },
    { x: -430.0, z: 3496.0, rotY: -Math.PI / 2, load: 'EMPTY',    color: 0x16a34a },
    { x: -535.0, z: 3453.0, rotY: Math.PI / 2,  load: 'ONE_40FT', color: 0xdc2626 },
    { x: -565.0, z: 3502.0, rotY: -Math.PI / 2, load: 'ONE_20FT', color: 0x2563eb }
  ];

  berthTrucks.forEach((bt) => {
    const truck = createContainerTruck({
      loadType: bt.load,
      primaryColor: bt.color,
      cabColor: 0xf8fafc
    });
    truck.position.set(bt.x, yDeck, bt.z);
    truck.rotation.y = bt.rotY;
    group.add(truck);
  });

  return group;
}
