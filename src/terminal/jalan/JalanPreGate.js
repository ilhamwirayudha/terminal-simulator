import * as THREE from 'three';
import {
  portRoadPavementMat,
  seawallMat,
  curbHazardWhiteMat,
  curbHazardBlackMat,
  whiteLineMat,
  yellowLineMat
} from '../../assets/materials/roadMaterials.js';
import { createMedianIsland } from '../../assets/infrastructure/createMedianIsland.js';
import { createMedianTree } from '../../assets/nature/createMedianTree.js';
import { createPreGateCanopy } from '../../assets/buildings/createPreGateCanopy.js';

/**
 * ==============================================================================
 * Area: Jalan - Sub: Jalan Pre-Gate (Z: +623.5 s/d +1168.0)
 * Status: 1:1 Ground Truth Nyata (Sesuai Foto Satelit & Koordinat GPS)
 * ==============================================================================
 *
 * DEFINISI KANAN-KIRI RESMI (POV MENGHADAP TERMINAL / TIMUR LAUT):
 *
 * 1. SISI KIRI (BARAT LAUT / +X pada Three.js Camera):
 *    -> INBOUND / JALUR MASUK KE TERMINAL (Ada Truk, Pelebaran & Kanopi)
 *    * Segmen 1 (Z: 625 s/d 775, ~150m): 3 Lajur Masuk (X in [1.3, 13.3])
 *        - Lajur 3 (Delivery / sisi median): X in [1.3, 4.9]
 *        - Lajur 2 (Receiving / tengah): X in [4.9, 8.5]
 *        - Lajur 1 (Umum/Curah Kering / luar): X in [8.5, 12.1]
 *    * Crossover 1 & Yellow Box Junction + Zebra Cross di Z = 750 s/d 775
 *    * Zona Pelebaran / Taper (Z: 775 s/d 805, 30m):
 *        - Melebar ke arah luar KIRI (+X) dari X = 13.3 ke X = 16.9 (+3.6m)
 *        - Zebra cross kedua di Z = 808
 *    * Segmen 2 (Z: 805 s/d 1168, 363m): 4 Lajur Penuh Masuk (X in [1.3, 16.9])
 *    * KANOPI PRE GATE: Berada di Z ≈ 955 menaungi 4 lajur masuk sebagai patokan nyata!
 *
 * 2. SISI KANAN (TENGGARA / -X pada Three.js Camera):
 *    -> OUTBOUND / JALUR KELUAR MENUJU JEMBATAN
 *    * TIDAK ADA PELEBARAN SAMA SEKALI: Lurus konsisten 3 lajur menerus (X in [-13.3, -1.3])
 *    * Panah menunjuk ke arah keluar jembatan (↓ / Selatan)
 *
 * 3. TENGAH (X in [-1.3, +1.3]):
 *    -> MEDIAN JALAN BERKANSTIN DENGAN BARISAN POHON RINDANG (Tampak Foto 1 & 2)
 */
export function createJalanPreGate() {
  const preGateGroup = new THREE.Group();
  preGateGroup.name = 'sub_jalan_pre_gate';

  const yRoad = 1.631;

  // ----------------------------------------------------------------------------
  // Vector Highway Arrow Builder (Putih)
  // ----------------------------------------------------------------------------
  const createHighwayArrow = (pointsForward = true) => {
    const shape = new THREE.Shape();
    const stemW = 0.28;
    const stemL = 2.60;
    const headW = 1.05;
    const headL = 1.55;

    if (pointsForward) {
      // Menunjuk +Z (Ke arah Terminal / Masuk)
      shape.moveTo(-stemW / 2, stemL);
      shape.lineTo(stemW / 2, stemL);
      shape.lineTo(stemW / 2, 0);
      shape.lineTo(headW / 2, 0);
      shape.lineTo(0, -headL);
      shape.lineTo(-headW / 2, 0);
      shape.lineTo(-stemW / 2, 0);
      shape.closePath();
    } else {
      // Menunjuk -Z (Ke arah Jembatan / Keluar)
      shape.moveTo(-stemW / 2, -stemL);
      shape.lineTo(stemW / 2, -stemL);
      shape.lineTo(stemW / 2, 0);
      shape.lineTo(headW / 2, 0);
      shape.lineTo(0, headL);
      shape.lineTo(-headW / 2, 0);
      shape.lineTo(-stemW / 2, 0);
      shape.closePath();
    }

    const geo = new THREE.ShapeGeometry(shape);
    const mesh = new THREE.Mesh(geo, whiteLineMat);
    mesh.rotation.x = -Math.PI / 2;
    return mesh;
  };

  const addRoadArrow = (x, z, pointsForward, yLevel = yRoad + 0.007) => {
    const arrow = createHighwayArrow(pointsForward);
    arrow.position.set(x, yLevel, z);
    preGateGroup.add(arrow);
  };

  const createTaperLine = (startX, endX, startZ, endZ, mat = whiteLineMat, width = 0.22, yLevel = yRoad + 0.006) => {
    const shape = new THREE.Shape();
    const halfW = width / 2;
    shape.moveTo(startX - halfW, -startZ);
    shape.lineTo(startX + halfW, -startZ);
    shape.lineTo(endX + halfW, -endZ);
    shape.lineTo(endX - halfW, -endZ);
    shape.closePath();
    const geo = new THREE.ShapeGeometry(shape);
    const lineMesh = new THREE.Mesh(geo, mat);
    lineMesh.rotation.x = -Math.PI / 2;
    lineMesh.position.set(0, yLevel, 0);
    preGateGroup.add(lineMesh);
  };



  // ============================================================================
  // 1. ABUTMEN JEMBATAN LAUT (Z = 623.5)
  // ============================================================================
  const bridgeAbutmentIsland = new THREE.Mesh(new THREE.BoxGeometry(16.0, 2.4, 5.0), seawallMat);
  bridgeAbutmentIsland.position.set(0, -0.8, 623.5);
  bridgeAbutmentIsland.receiveShadow = true;
  preGateGroup.add(bridgeAbutmentIsland);

  // ============================================================================
  // 2. TRANSISI PELEBARAN AWAL DARI JEMBATAN KE JALAN (Z: 625 s/d 660)
  // Jembatan (Lebar 16m: X in [-8, +8]) melebar ke koridor awal (X: -13.3 s/d +13.3)
  // ============================================================================
  const numFlareSteps = 24;
  const flarePositions = [];
  const flareNormals = [];

  const getInboundEdgeTrans = (z) => {
    // SISI KIRI (Barat Laut / +X): Melebar dari +7.8m ke +13.3m
    const u = Math.min(Math.max((z - 625) / 35.0, 0), 1);
    const s = u * u * (3 - 2 * u);
    return 7.8 + 5.5 * s;
  };

  const getOutboundEdgeTrans = (z) => {
    // SISI KANAN (Tenggara / -X): Melebar dari -7.8m ke -13.3m
    const u = Math.min(Math.max((z - 625) / 35.0, 0), 1);
    const s = u * u * (3 - 2 * u);
    return -7.8 - 5.5 * s;
  };

  for (let i = 0; i < numFlareSteps; i++) {
    const z1 = 625 + (i / numFlareSteps) * 35;
    const z2 = 625 + ((i + 1) / numFlareSteps) * 35;
    const xIn1 = getInboundEdgeTrans(z1);
    const xOut1 = getOutboundEdgeTrans(z1);
    const xIn2 = getInboundEdgeTrans(z2);
    const xOut2 = getOutboundEdgeTrans(z2);

    flarePositions.push(
      xIn1, yRoad, z1, xIn2, yRoad, z2, xOut2, yRoad, z2,
      xIn1, yRoad, z1, xOut2, yRoad, z2, xOut1, yRoad, z1
    );
    for (let k = 0; k < 6; k++) flareNormals.push(0, 1, 0);
  }

  const flareGeo = new THREE.BufferGeometry();
  flareGeo.setAttribute('position', new THREE.Float32BufferAttribute(flarePositions, 3));
  flareGeo.setAttribute('normal', new THREE.Float32BufferAttribute(flareNormals, 3));
  const flareMesh = new THREE.Mesh(flareGeo, portRoadPavementMat);
  flareMesh.receiveShadow = true;
  preGateGroup.add(flareMesh);

  // Kanstin Transisi Awal
  for (let i = 0; i < 15; i++) {
    const z1 = 625 + (i / 15) * 35;
    const z2 = 625 + ((i + 1) / 15) * 35;
    const midZ = (z1 + z2) / 2;
    const len = z2 - z1;

    // Kanstin Sisi Kiri (Inbound / +X)
    const xin1 = getInboundEdgeTrans(z1);
    const xin2 = getInboundEdgeTrans(z2);
    const midXin = (xin1 + xin2) / 2;
    const angleIn = Math.atan2(xin2 - xin1, len);
    const curbIn = new THREE.Mesh(new THREE.BoxGeometry(0.35, 0.22, len * 1.05), curbHazardWhiteMat);
    curbIn.position.set(midXin + 0.15, yRoad + 0.11, midZ);
    curbIn.rotation.y = angleIn;
    curbIn.castShadow = true;
    preGateGroup.add(curbIn);

    // Kanstin Sisi Kanan (Outbound / -X)
    const xout1 = getOutboundEdgeTrans(z1);
    const xout2 = getOutboundEdgeTrans(z2);
    const midXout = (xout1 + xout2) / 2;
    const angleOut = Math.atan2(xout2 - xout1, len);
    const curbOut = new THREE.Mesh(new THREE.BoxGeometry(0.35, 0.22, len * 1.05), curbHazardWhiteMat);
    curbOut.position.set(midXout - 0.15, yRoad + 0.11, midZ);
    curbOut.rotation.y = angleOut;
    curbOut.castShadow = true;
    preGateGroup.add(curbOut);
  }

  // Marka Chevron Gore Pemisah Jalur Masuk & Keluar Awal
  createTaperLine(-1.3, 0.0, 656, 627, whiteLineMat, 0.22);
  createTaperLine(1.3, 0.0, 656, 627, whiteLineMat, 0.22);

  // ============================================================================
  // 3. SISI KIRI (BARAT LAUT / +X): JALUR MASUK SEGMEN 1 (3 LAJUR: Z in [660, 775])
  // Lebar 12.0m: X in [1.3, 13.3] (Tampak di Gambar 1)
  // - Lajur 3 (Delivery / sisi median): X in [1.3, 4.9]
  // - Lajur 2 (Receiving / tengah): X in [4.9, 8.5]
  // - Lajur 1 (Umum/Curah Kering / luar): X in [8.5, 12.1]
  // ============================================================================
  const seg1Len = 775.0 - 660.0; // 115m
  const seg1MidZ = (660.0 + 775.0) / 2;

  const seg1Inbound = new THREE.Mesh(new THREE.PlaneGeometry(12.0, seg1Len), portRoadPavementMat);
  seg1Inbound.rotation.x = -Math.PI / 2;
  seg1Inbound.position.set(7.3, yRoad, seg1MidZ);
  seg1Inbound.receiveShadow = true;
  preGateGroup.add(seg1Inbound);

  // Marka Garis Putus-putus Segmen 1 (+4.9m & +8.5m)
  [4.9, 8.5].forEach((lx) => {
    for (let z = 660; z < 775; z += 9.0) {
      const dash = new THREE.Mesh(new THREE.PlaneGeometry(0.2, 3.5), whiteLineMat);
      dash.rotation.x = -Math.PI / 2;
      dash.position.set(lx, yRoad + 0.006, z + 1.75);
      preGateGroup.add(dash);
    }
  });

  // Garis Solid Tepi Segmen 1 (Sisi Kiri Luar & Dalam)
  const seg1InOuter = new THREE.Mesh(new THREE.PlaneGeometry(0.24, seg1Len), whiteLineMat);
  seg1InOuter.rotation.x = -Math.PI / 2;
  seg1InOuter.position.set(13.1, yRoad + 0.006, seg1MidZ);
  preGateGroup.add(seg1InOuter);

  const seg1InInner = new THREE.Mesh(new THREE.PlaneGeometry(0.22, seg1Len), yellowLineMat);
  seg1InInner.rotation.x = -Math.PI / 2;
  seg1InInner.position.set(1.4, yRoad + 0.006, seg1MidZ);
  preGateGroup.add(seg1InInner);

  // Kanstin Tepi Luar Kiri Segmen 1
  const seg1Curb = new THREE.Mesh(new THREE.BoxGeometry(0.35, 0.22, seg1Len), curbHazardWhiteMat);
  seg1Curb.position.set(13.3, yRoad + 0.11, seg1MidZ);
  seg1Curb.castShadow = true;
  preGateGroup.add(seg1Curb);

  // Panah Marka Jalan Segmen 1 (Masuk: Forward / +Z)
  [680, 725].forEach((z) => {
    addRoadArrow(3.1, z, true);  // Lajur 3: Delivery
    addRoadArrow(6.7, z, true);  // Lajur 2: Receiving
    addRoadArrow(10.3, z, true); // Lajur 1: Umum / Curah Kering
  });

  // ============================================================================
  // 4. ZONA PELEBARAN / TAPER SISI KIRI (Z in [775.0, 805.0]) - PANJANG 30m
  // HANYA SISI KIRI (BARAT LAUT / +X) YANG MELEBAR!
  // Sisi luar kiri melebar dari X = +13.3 ke X = +16.9 (+3.6m untuk 1 lajur baru)
  // ============================================================================
  const taperShape = new THREE.Shape();
  // +Y shape = -Z world
  taperShape.moveTo(1.3, -775.0);
  taperShape.lineTo(13.3, -775.0);
  taperShape.lineTo(16.9, -805.0);
  taperShape.lineTo(1.3, -805.0);
  taperShape.closePath();

  const taperMesh = new THREE.Mesh(new THREE.ShapeGeometry(taperShape), portRoadPavementMat);
  taperMesh.rotation.x = -Math.PI / 2;
  taperMesh.position.set(0, yRoad, 0);
  taperMesh.receiveShadow = true;
  preGateGroup.add(taperMesh);

  // Garis-garis pemandu pelebaran
  createTaperLine(13.1, 16.7, 775, 805, whiteLineMat, 0.24); // Tepi luar kiri yang melebar
  createTaperLine(1.4, 1.4, 775, 805, yellowLineMat, 0.22);  // Tepi median lurus
  createTaperLine(4.9, 4.9, 775, 805, whiteLineMat, 0.20);   // Lajur 3 -> Lajur 4 (Delivery lurus)
  createTaperLine(8.5, 8.5, 775, 805, whiteLineMat, 0.20);   // Pemisah Lajur 3 & 2 baru
  createTaperLine(8.5, 12.1, 775, 805, whiteLineMat, 0.20);  // Garis split pembelahan lajur 2

  // Kanstin Miring Pelebaran di Sisi Luar Kiri
  const flareAngle = Math.atan2(16.9 - 13.3, 30.0);
  const flareLen = Math.hypot(3.6, 30.0);
  const flareCurb = new THREE.Mesh(new THREE.BoxGeometry(0.35, 0.22, flareLen), curbHazardWhiteMat);
  flareCurb.position.set((13.3 + 16.9) / 2, yRoad + 0.11, (775 + 805) / 2);
  flareCurb.rotation.y = flareAngle;
  flareCurb.castShadow = true;
  preGateGroup.add(flareCurb);

  // ============================================================================
  // 5. SISI KIRI (BARAT LAUT / +X): JALUR MASUK SEGMEN 2 (4 LAJUR: Z in [805, 1169])
  // Lebar 15.6m: X in [1.3, 16.9] (Tampak di Gambar 2)
  // - Lajur 4 (Delivery / sisi median): X in [1.3, 4.9]
  // - Lajur 3 (Receiving): X in [4.9, 8.5]
  // - Lajur 2 (Receiving): X in [8.5, 12.1]
  // - Lajur 1 (Umum/Curah Kering baru di paling luar): X in [12.1, 15.7]
  // ============================================================================
  const seg2Len = 1168.0 - 805.0; // 363m
  const seg2MidZ = (805.0 + 1168.0) / 2;

  const seg2Inbound = new THREE.Mesh(new THREE.PlaneGeometry(15.6, seg2Len), portRoadPavementMat);
  seg2Inbound.rotation.x = -Math.PI / 2;
  seg2Inbound.position.set(9.1, yRoad, seg2MidZ);
  seg2Inbound.receiveShadow = true;
  preGateGroup.add(seg2Inbound);

  // Marka Garis Putus-putus 4 Lajur Masuk (+4.9m, +8.5m, +12.1m)
  [4.9, 8.5, 12.1].forEach((lx) => {
    for (let z = 812; z < 1168; z += 9.0) {
      if ((z >= 940 && z <= 972) || (z >= 1005 && z <= 1035)) continue; // Hindari kanopi & bukaan
      const dash = new THREE.Mesh(new THREE.PlaneGeometry(0.2, 3.5), whiteLineMat);
      dash.rotation.x = -Math.PI / 2;
      dash.position.set(lx, yRoad + 0.006, z + 1.75);
      preGateGroup.add(dash);
    }
  });

  // Garis Solid Tepi Segmen 2 (Kiri Luar) - Dibuka di Z: 1008.0 s/d 1034.4 sebagai Jalur Masuk Waiting Area
  const zOpenStart = 1008.0;
  const zOpenEnd = 1034.4;

  // Bagian 1: Sebelum bukaan akses masuk (Z: 805.0 s/d 1008.0)
  const seg2InOuterLen1 = zOpenStart - 805.0; // 203.0m
  const seg2InOuterMidZ1 = (805.0 + zOpenStart) / 2;
  const seg2InOuter1 = new THREE.Mesh(new THREE.PlaneGeometry(0.24, seg2InOuterLen1), whiteLineMat);
  seg2InOuter1.rotation.x = -Math.PI / 2;
  seg2InOuter1.position.set(16.7, yRoad + 0.006, seg2InOuterMidZ1);
  preGateGroup.add(seg2InOuter1);

  // Bagian 2: Setelah bukaan akses masuk (Z: 1034.4 s/d 1168.0)
  const seg2InOuterLen2 = 1168.0 - zOpenEnd; // 133.6m
  const seg2InOuterMidZ2 = (zOpenEnd + 1168.0) / 2;
  const seg2InOuter2 = new THREE.Mesh(new THREE.PlaneGeometry(0.24, seg2InOuterLen2), whiteLineMat);
  seg2InOuter2.rotation.x = -Math.PI / 2;
  seg2InOuter2.position.set(16.7, yRoad + 0.006, seg2InOuterMidZ2);
  preGateGroup.add(seg2InOuter2);

  const seg2InInner = new THREE.Mesh(new THREE.PlaneGeometry(0.22, seg2Len), yellowLineMat);
  seg2InInner.rotation.x = -Math.PI / 2;
  seg2InInner.position.set(1.4, yRoad + 0.006, seg2MidZ);
  preGateGroup.add(seg2InInner);

  // Kanstin Tepi Luar Kiri Segmen 2 - Dibuka di Z: 1008.0 s/d 1034.4
  const seg2Curb1 = new THREE.Mesh(new THREE.BoxGeometry(0.35, 0.22, seg2InOuterLen1), curbHazardWhiteMat);
  seg2Curb1.position.set(16.9, yRoad + 0.11, seg2InOuterMidZ1);
  seg2Curb1.castShadow = true;
  preGateGroup.add(seg2Curb1);

  const seg2Curb2 = new THREE.Mesh(new THREE.BoxGeometry(0.35, 0.22, seg2InOuterLen2), curbHazardWhiteMat);
  seg2Curb2.position.set(16.9, yRoad + 0.11, seg2InOuterMidZ2);
  seg2Curb2.castShadow = true;
  preGateGroup.add(seg2Curb2);

  // Radius Corner Kanstin Penutup Sudut Bukaan Masuk Waiting Area (Corner Returns)
  const cornerCurbGeo = new THREE.BoxGeometry(1.6, 0.22, 0.35);
  const cornerCurb1 = new THREE.Mesh(cornerCurbGeo, curbHazardWhiteMat);
  cornerCurb1.position.set(16.9 + 0.8, yRoad + 0.11, zOpenStart);
  preGateGroup.add(cornerCurb1);

  const cornerCurb2 = new THREE.Mesh(cornerCurbGeo, curbHazardWhiteMat);
  cornerCurb2.position.set(16.9 + 0.8, yRoad + 0.11, zOpenEnd);
  preGateGroup.add(cornerCurb2);

  // Panah Marka Jalan 4 Lajur Segmen 2 (Masuk: Forward / +Z)
  [830, 890, 1000, 1080, 1150].forEach((z) => {
    addRoadArrow(3.1, z, true);  // Lajur 4: Delivery
    addRoadArrow(6.7, z, true);  // Lajur 3: Receiving
    addRoadArrow(10.3, z, true); // Lajur 2: Receiving
    addRoadArrow(13.9, z, true); // Lajur 1: Umum / Curah Kering
  });

  // ----------------------------------------------------------------------------
  // KANOPI GERBANG PRE-GATE (Asset Reusable createPreGateCanopy)
  // Berada di Z = 955 menaungi 4 lajur masuk sebagai patokan nyata (Tampak di Gambar 2)
  // ----------------------------------------------------------------------------
  const preGateCanopy = createPreGateCanopy({
    xStart: 1.3,
    xEnd: 16.9,
    centerZ: 955,
    length: 26,
    height: 8.2
  });
  preGateGroup.add(preGateCanopy);

  // ============================================================================
  // 6. SISI KANAN (TENGGARA / -X): JALUR KELUAR (3 LAJUR MENERUS: Z in [660, 1168])
  // TIDAK ADA PELEBARAN SAMA SEKALI: Lurus konsisten 3 lajur menerus (X: -13.3 s/d -1.3)
  // ============================================================================
  const outLen = 1168.0 - 660.0;
  const outMidZ = (660.0 + 1168.0) / 2;

  const outboundRoad = new THREE.Mesh(new THREE.PlaneGeometry(12.0, outLen), portRoadPavementMat);
  outboundRoad.rotation.x = -Math.PI / 2;
  outboundRoad.position.set(-7.3, yRoad, outMidZ);
  outboundRoad.receiveShadow = true;
  preGateGroup.add(outboundRoad);

  // Marka Garis Putus-putus Lajur Keluar (-4.9m, -8.5m)
  [-4.9, -8.5].forEach((lx) => {
    for (let z = 660; z < 1168; z += 9.0) {
      const dash = new THREE.Mesh(new THREE.PlaneGeometry(0.2, 3.5), whiteLineMat);
      dash.rotation.x = -Math.PI / 2;
      dash.position.set(lx, yRoad + 0.006, z + 1.75);
      preGateGroup.add(dash);
    }
  });

  // Garis Solid Tepi Jalur Keluar (Kanan Luar & Dalam)
  const outInnerLine = new THREE.Mesh(new THREE.PlaneGeometry(0.22, outLen), yellowLineMat);
  outInnerLine.rotation.x = -Math.PI / 2;
  outInnerLine.position.set(-1.4, yRoad + 0.006, outMidZ);
  preGateGroup.add(outInnerLine);

  const outOuterLine = new THREE.Mesh(new THREE.PlaneGeometry(0.24, outLen), whiteLineMat);
  outOuterLine.rotation.x = -Math.PI / 2;
  outOuterLine.position.set(-13.1, yRoad + 0.006, outMidZ);
  preGateGroup.add(outOuterLine);

  // Kanstin Tepi Luar Kanan (Outbound)
  const outCurb = new THREE.Mesh(new THREE.BoxGeometry(0.35, 0.22, outLen), curbHazardWhiteMat);
  outCurb.position.set(-13.3, yRoad + 0.11, outMidZ);
  outCurb.castShadow = true;
  preGateGroup.add(outCurb);

  // Panah Marka Jalan Jalur Keluar (Keluar: Reverse / -Z)
  [690, 740, 840, 920, 1000, 1100].forEach((z) => {
    addRoadArrow(-3.1, z, false);
    addRoadArrow(-6.7, z, false);
    addRoadArrow(-10.3, z, false);
  });

  // ============================================================================
  // 7. MEDIAN TENGAH BERKANSTIN DENGAN BARISAN POHON RINDANG PENUH
  // ============================================================================
  // Pulau Median Penuh Berkanstin (createMedianIsland)
  preGateGroup.add(createMedianIsland({ startZ: 656, endZ: 1168, centerX: 0, width: 2.6, y: yRoad }));

  // Barisan Pohon Rindang di Sepanjang Median Jalan (createMedianTree)
  for (let z = 662.0; z <= 1162.0; z += 14.0) {
    const tree = createMedianTree({
      scale: 0.95 + Math.sin(z * 0.1) * 0.15,
      rotationY: (z * 0.5) % (Math.PI * 2)
    });
    tree.position.set(0, yRoad + 0.11, z);
    preGateGroup.add(tree);
  }

  return preGateGroup;
}
