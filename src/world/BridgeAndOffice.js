import * as THREE from 'three';

/**
 * ==============================================================================
 * Terminal Teluk Lamong (TTL) - Sea Causeway Bridge & Pulau 1 Road Corridor
 * ==============================================================================
 * Clean Slate: Only Road Infrastructure & Marine Causeway
 * All non-road facilities (Graha Pelindo, Mosque, IPAL, Yard, Containers, Trucks)
 * are removed to allow a clean, modular reconstruction based on real ground truth.
 */

export function createBridgeAndOffice(scene) {
  const group = new THREE.Group();
  group.name = 'ttl_corridor_road_complex';

  // ----------------------------------------------------------------------------
  // Shared PBR Materials
  // ----------------------------------------------------------------------------
  const bridgeConcreteMat = new THREE.MeshStandardMaterial({
    color: 0x64748b, // Slate 500 reinforced marine concrete
    roughness: 0.75,
    metalness: 0.2
  });

  const pierConcreteMat = new THREE.MeshStandardMaterial({
    color: 0x475569, // Darker wet concrete for underwater piers
    roughness: 0.85,
    metalness: 0.15
  });

  const bridgeAsphaltMat = new THREE.MeshStandardMaterial({
    color: 0x22262e, // Deep asphalt matching mainland highway (Road.js)
    roughness: 0.88,
    metalness: 0.08
  });

  const portRoadPavementMat = new THREE.MeshStandardMaterial({
    color: 0x22262e,
    roughness: 0.88,
    metalness: 0.08,
    side: THREE.DoubleSide
  });

  const barrierMat = new THREE.MeshStandardMaterial({
    color: 0x94a3b8,
    roughness: 0.5,
    metalness: 0.6
  });

  const curbConcreteGreyMat = new THREE.MeshStandardMaterial({
    color: 0x9ba3ab,
    roughness: 0.8
  });

  const curbHazardWhiteMat = new THREE.MeshStandardMaterial({ color: 0xf8fafc, roughness: 0.4 });
  const curbHazardBlackMat = new THREE.MeshStandardMaterial({ color: 0x1e293b, roughness: 0.8 });
  const medianGrassMat = new THREE.MeshStandardMaterial({ color: 0x3d6836, roughness: 0.9 });
  const seawallMat = new THREE.MeshStandardMaterial({ color: 0x8a929a, roughness: 0.85 });

  const yellowLineMat = new THREE.MeshBasicMaterial({ color: 0xfbbf24, side: THREE.DoubleSide });
  const whiteLineMat = new THREE.MeshBasicMaterial({ color: 0xf8fafc, side: THREE.DoubleSide });

  // ============================================================================
  // SECTION 1: 680-METER CURVED SEA CAUSEWAY BRIDGE (Z: -55 to +625)
  // ============================================================================
  const bridgeGroup = new THREE.Group();
  bridgeGroup.name = 'sea_causeway_bridge';

  const bridgeStartZ = -55;
  const bridgeEndZ = 625;
  const bridgeLength = bridgeEndZ - bridgeStartZ; // 680m
  const bridgeWidth = 16.0;

  const yStart = 0.82; // Level jalan daratan di Z = -55
  const yEnd = 1.62;   // Level platform jalan di Z = +625
  const archHeight = 6.8; // Lengkung parabola vertikal di tengah laut
  const sweepWidth = 4.8; // Lengkungan halus horizontal melintasi selat

  // 1. Fungsi Matematika Trajektori Lengkung Jembatan
  const getBridgePathPoint = (t) => {
    const z = bridgeStartZ + t * bridgeLength;
    const y_base = yStart + t * (yEnd - yStart);
    const y_arch = archHeight * 4.0 * t * (1.0 - t);
    const y = y_base + y_arch;
    const x = Math.sin(t * Math.PI) * sweepWidth;
    return new THREE.Vector3(x, y, z);
  };

  // 2. Sampling Frame Vektor
  const numSteps = 136;
  const frames = [];
  const eps = 1e-4;
  for (let i = 0; i <= numSteps; i++) {
    const t = i / numSteps;
    const P = getBridgePathPoint(t);
    const P_prev = getBridgePathPoint(Math.max(0, t - eps));
    const P_next = getBridgePathPoint(Math.min(1, t + eps));
    const T = new THREE.Vector3().subVectors(P_next, P_prev).normalize();
    const N = new THREE.Vector3(-T.z, 0, T.x).normalize();
    const U = new THREE.Vector3().crossVectors(N, T).normalize();
    frames.push({ t, P, T, N, U });
  }

  // 3. Helper Pembuat Strip Geometri Melengkung (Curved Quad Ribbon)
  const createCurvedRibbon = (n1, n2, u1, u2, mat, receiveShadow = true, castShadow = false) => {
    const positions = [];
    const normals = [];

    for (let i = 0; i < numSteps; i++) {
      const fA = frames[i];
      const fB = frames[i + 1];

      const v1 = new THREE.Vector3().copy(fA.P).addScaledVector(fA.N, n1).addScaledVector(fA.U, u1);
      const v2 = new THREE.Vector3().copy(fA.P).addScaledVector(fA.N, n2).addScaledVector(fA.U, u2);
      const v3 = new THREE.Vector3().copy(fB.P).addScaledVector(fB.N, n2).addScaledVector(fB.U, u2);
      const v4 = new THREE.Vector3().copy(fB.P).addScaledVector(fB.N, n1).addScaledVector(fB.U, u1);

      positions.push(v1.x, v1.y, v1.z, v2.x, v2.y, v2.z, v3.x, v3.y, v3.z);
      positions.push(v1.x, v1.y, v1.z, v3.x, v3.y, v3.z, v4.x, v4.y, v4.z);

      const norm = new THREE.Vector3().crossVectors(
        new THREE.Vector3().subVectors(v2, v1),
        new THREE.Vector3().subVectors(v4, v1)
      ).normalize();

      normals.push(norm.x, norm.y, norm.z, norm.x, norm.y, norm.z, norm.x, norm.y, norm.z);
      normals.push(norm.x, norm.y, norm.z, norm.x, norm.y, norm.z, norm.x, norm.y, norm.z);
    }

    const geo = new THREE.BufferGeometry();
    geo.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
    geo.setAttribute('normal', new THREE.Float32BufferAttribute(normals, 3));
    const mesh = new THREE.Mesh(geo, mat);
    mesh.receiveShadow = receiveShadow;
    mesh.castShadow = castShadow;
    bridgeGroup.add(mesh);
    return mesh;
  };

  // Gelagar Beton Box Girder
  createCurvedRibbon(-8.0, 8.0, 0.0, 0.0, bridgeConcreteMat, true, true);
  createCurvedRibbon(-8.0, 8.0, -1.2, -1.2, bridgeConcreteMat, true, false);
  createCurvedRibbon(-8.0, -8.0, 0.0, -1.2, bridgeConcreteMat, true, true);
  createCurvedRibbon(8.0, 8.0, -1.2, 0.0, bridgeConcreteMat, true, true);

  // Aspal Jembatan
  createCurvedRibbon(-7.8, 7.8, 0.015, 0.015, bridgeAsphaltMat, true, false);

  // Crash Barriers Tepi Jembatan
  createCurvedRibbon(-7.9, -7.4, 0.9, 0.9, barrierMat, true, true);
  createCurvedRibbon(-7.9, -7.9, 0.9, 0.0, barrierMat, true, true);
  createCurvedRibbon(-7.4, -7.4, 0.0, 0.9, barrierMat, true, true);
  createCurvedRibbon(7.4, 7.9, 0.9, 0.9, barrierMat, true, true);
  createCurvedRibbon(7.4, 7.4, 0.9, 0.0, barrierMat, true, true);
  createCurvedRibbon(7.9, 7.9, 0.0, 0.9, barrierMat, true, true);

  // Marka Tepi Putih
  [-7.35, 7.35].forEach(lx => {
    createCurvedRibbon(lx - 0.1, lx + 0.1, 0.022, 0.022, whiteLineMat, false, false);
  });

  // Marka Kuning Tengah
  [-0.12, 0.12].forEach(lx => {
    createCurvedRibbon(lx - 0.06, lx + 0.06, 0.022, 0.022, yellowLineMat, false, false);
  });

  // Marka Putus-Putus Lajur Jembatan
  [-3.7, 3.7].forEach(lx => {
    const dashL = 4.5;
    const gapL = 4.5;
    const cycle = dashL + gapL;
    for (let d = 5; d < bridgeLength - 5; d += cycle) {
      const tA = d / bridgeLength;
      const tB = Math.min(1.0, (d + dashL) / bridgeLength);
      const fA = {
        P: getBridgePathPoint(tA),
        N: new THREE.Vector3(-getBridgePathPoint(tA + 0.001).z + getBridgePathPoint(tA - 0.001).z, 0, getBridgePathPoint(tA + 0.001).x - getBridgePathPoint(tA - 0.001).x).normalize(),
        U: new THREE.Vector3(0, 1, 0)
      };
      const fB = {
        P: getBridgePathPoint(tB),
        N: new THREE.Vector3(-getBridgePathPoint(tB + 0.001).z + getBridgePathPoint(tB - 0.001).z, 0, getBridgePathPoint(tB + 0.001).x - getBridgePathPoint(tB - 0.001).x).normalize(),
        U: new THREE.Vector3(0, 1, 0)
      };
      const v1 = new THREE.Vector3().copy(fA.P).addScaledVector(fA.N, lx - 0.09).addScaledVector(fA.U, 0.022);
      const v2 = new THREE.Vector3().copy(fA.P).addScaledVector(fA.N, lx + 0.09).addScaledVector(fA.U, 0.022);
      const v3 = new THREE.Vector3().copy(fB.P).addScaledVector(fB.N, lx + 0.09).addScaledVector(fB.U, 0.022);
      const v4 = new THREE.Vector3().copy(fB.P).addScaledVector(fB.N, lx - 0.09).addScaledVector(fB.U, 0.022);

      const dPos = [v1.x, v1.y, v1.z, v2.x, v2.y, v2.z, v3.x, v3.y, v3.z, v1.x, v1.y, v1.z, v3.x, v3.y, v3.z, v4.x, v4.y, v4.z];
      const dGeo = new THREE.BufferGeometry();
      dGeo.setAttribute('position', new THREE.Float32BufferAttribute(dPos, 3));
      dGeo.computeVertexNormals();
      const dMesh = new THREE.Mesh(dGeo, whiteLineMat);
      bridgeGroup.add(dMesh);
    }
  });

  // Pilar Beton Jembatan
  for (let z = bridgeStartZ + 25; z < bridgeEndZ - 15; z += 25) {
    const t = (z - bridgeStartZ) / bridgeLength;
    const f = frames[Math.min(frames.length - 1, Math.round(t * numSteps))];

    const crossBeam = new THREE.Mesh(new THREE.BoxGeometry(bridgeWidth - 2.0, 1.4, 3.2), pierConcreteMat);
    crossBeam.position.copy(f.P).addScaledVector(f.U, -1.3);
    crossBeam.rotation.y = Math.atan2(f.T.x, f.T.z);
    crossBeam.castShadow = true;
    bridgeGroup.add(crossBeam);

    [-4.5, 4.5].forEach(px => {
      const colTopY = f.P.y - 1.3;
      const colHeight = colTopY + 4.5;
      const column = new THREE.Mesh(new THREE.CylinderGeometry(1.0, 1.2, colHeight, 12), pierConcreteMat);
      const colPos = new THREE.Vector3().copy(f.P).addScaledVector(f.N, px);
      colPos.y = colTopY - colHeight / 2;
      column.position.copy(colPos);
      column.castShadow = true;
      bridgeGroup.add(column);

      const collar = new THREE.Mesh(new THREE.BoxGeometry(3.0, 1.0, 3.0), pierConcreteMat);
      collar.position.set(colPos.x, -0.4, colPos.z);
      bridgeGroup.add(collar);
    });
  }

  // Air Laut
  const seaWaterMat = new THREE.MeshStandardMaterial({
    color: 0x6e7d73,
    roughness: 0.28,
    metalness: 0.18,
    transparent: true,
    opacity: 0.94
  });

  const seaWater = new THREE.Mesh(new THREE.PlaneGeometry(3600, 3600), seaWaterMat);
  seaWater.rotation.x = -Math.PI / 2;
  seaWater.position.set(0, 0.0, 1150);
  seaWater.receiveShadow = true;
  bridgeGroup.add(seaWater);

  group.add(bridgeGroup);

  // ============================================================================
  // SECTION 2: PULAU 1 - MAIN ROAD CORRIDOR (Z: 625 s/d 1080)
  // Clean corridor road backbone (tanpa gedung, tanpa yard, tanpa truk)
  // ============================================================================
  const roadSegmentGroup = new THREE.Group();
  roadSegmentGroup.name = 'pulau1_road_corridor';

  // Abutmen Jembatan di Pulau 1
  const bridgeAbutmentIsland = new THREE.Mesh(new THREE.BoxGeometry(16.0, 2.4, 5.0), seawallMat);
  bridgeAbutmentIsland.position.set(0, -0.8, 623.5);
  bridgeAbutmentIsland.receiveShadow = true;
  roadSegmentGroup.add(bridgeAbutmentIsland);

  // 1. Aspal Pelebaran Halus Jalan Transisi Masuk (Z: 625 s/d 675)
  const getLeftRoadEdge = (z) => {
    const u = Math.min(Math.max((z - 625) / 50.0, 0), 1);
    const s = u * u * (3 - 2 * u);
    return 7.8 + 5.0 * s; // 7.8 -> 12.8
  };

  const getRightRoadEdge = (z) => {
    const u = Math.min(Math.max((z - 625) / 50.0, 0), 1);
    const s = u * u * (3 - 2 * u);
    return -7.8 - 5.0 * s; // -7.8 -> -12.8
  };

  const numZ = 30;
  const flarePositions = [];
  const flareNormals = [];

  for (let i = 0; i < numZ; i++) {
    const z1 = 625 + (i / numZ) * 50;
    const z2 = 625 + ((i + 1) / numZ) * 50;
    const xL1 = getLeftRoadEdge(z1);
    const xR1 = getRightRoadEdge(z1);
    const xL2 = getLeftRoadEdge(z2);
    const xR2 = getRightRoadEdge(z2);
    const y = 1.632;

    flarePositions.push(
      xR1, y, z1, xR2, y, z2, xL2, y, z2,
      xR1, y, z1, xL2, y, z2, xL1, y, z1
    );
    for (let k = 0; k < 6; k++) flareNormals.push(0, 1, 0);
  }

  const flareGeo = new THREE.BufferGeometry();
  flareGeo.setAttribute('position', new THREE.Float32BufferAttribute(flarePositions, 3));
  flareGeo.setAttribute('normal', new THREE.Float32BufferAttribute(flareNormals, 3));
  const flareMesh = new THREE.Mesh(flareGeo, portRoadPavementMat);
  flareMesh.receiveShadow = true;
  roadSegmentGroup.add(flareMesh);

  // Kanstin Tepi Luar Transisi
  const curbStepZ = 20;
  for (let i = 0; i < curbStepZ; i++) {
    const z1 = 625 + (i / curbStepZ) * 50;
    const z2 = 625 + ((i + 1) / curbStepZ) * 50;
    const midZ = (z1 + z2) / 2;
    const len = z2 - z1;

    const xr1 = getRightRoadEdge(z1);
    const xr2 = getRightRoadEdge(z2);
    const midXr = (xr1 + xr2) / 2;
    const angleR = Math.atan2(xr2 - xr1, len);
    const curbR = new THREE.Mesh(new THREE.BoxGeometry(0.35, 0.22, len * 1.05), curbHazardWhiteMat);
    curbR.position.set(midXr - 0.15, 1.74, midZ);
    curbR.rotation.y = angleR;
    curbR.castShadow = true;
    roadSegmentGroup.add(curbR);

    const xl1 = getLeftRoadEdge(z1);
    const xl2 = getLeftRoadEdge(z2);
    const midXl = (xl1 + xl2) / 2;
    const angleL = Math.atan2(xl2 - xl1, len);
    const curbL = new THREE.Mesh(new THREE.BoxGeometry(0.35, 0.22, len * 1.05), curbHazardWhiteMat);
    curbL.position.set(midXl + 0.15, 1.74, midZ);
    curbL.rotation.y = angleL;
    curbL.castShadow = true;
    roadSegmentGroup.add(curbL);
  }

  // 2. Marka Chevron Gore Pemisah Jalur (Z: 628 s/d 656)
  const centerLeadLine = new THREE.Mesh(new THREE.PlaneGeometry(0.24, 3.2), whiteLineMat);
  centerLeadLine.rotation.x = -Math.PI / 2;
  centerLeadLine.position.set(0, 1.636, 626.6);
  roadSegmentGroup.add(centerLeadLine);

  const goreBoundaryPositions = [];
  const goreNormals = [];
  const goreZ1 = 628.2;
  const goreZ2 = 656.0;
  const goreLength = goreZ2 - goreZ1;
  const goreSteps = 20;

  for (let i = 0; i < goreSteps; i++) {
    const za = goreZ1 + (i / goreSteps) * goreLength;
    const zb = goreZ1 + ((i + 1) / goreSteps) * goreLength;
    const wa = 1.3 * ((za - goreZ1) / goreLength);
    const wb = 1.3 * ((zb - goreZ1) / goreLength);
    const y = 1.636;
    const lw = 0.18;

    goreBoundaryPositions.push(
      wa - lw / 2, y, za, wa + lw / 2, y, za, wb + lw / 2, y, zb,
      wa - lw / 2, y, za, wb + lw / 2, y, zb, wb - lw / 2, y, zb
    );
    goreBoundaryPositions.push(
      -wa - lw / 2, y, za, -wa + lw / 2, y, za, -wb + lw / 2, y, zb,
      -wa - lw / 2, y, za, -wb + lw / 2, y, zb, -wb - lw / 2, y, zb
    );
    for (let k = 0; k < 12; k++) goreNormals.push(0, 1, 0);
  }

  const goreBoundGeo = new THREE.BufferGeometry();
  goreBoundGeo.setAttribute('position', new THREE.Float32BufferAttribute(goreBoundaryPositions, 3));
  goreBoundGeo.setAttribute('normal', new THREE.Float32BufferAttribute(goreNormals, 3));
  const goreBoundMesh = new THREE.Mesh(goreBoundGeo, whiteLineMat);
  roadSegmentGroup.add(goreBoundMesh);

  for (let cz = 631; cz <= 654; cz += 1.85) {
    const curW = 1.3 * ((cz - goreZ1) / goreLength);
    if (curW > 0.2) {
      const barLen = (curW * 2 - 0.28) * 1.35;
      const bar = new THREE.Mesh(new THREE.PlaneGeometry(0.24, Math.max(barLen, 0.2)), whiteLineMat);
      bar.rotation.x = -Math.PI / 2;
      bar.rotation.z = Math.PI / 4;
      bar.position.set(0, 1.636, cz);
      roadSegmentGroup.add(bar);
    }
  }

  // 3. Hamparan Aspal Jalan Utama 6-Lajur Pulau 1 (Z: 675 s/d 1080)
  // Inbound (+X: 3 Lajur, X in [1.3, 12.8])
  const inboundRoad = new THREE.Mesh(new THREE.PlaneGeometry(11.5, 405.0), portRoadPavementMat);
  inboundRoad.rotation.x = -Math.PI / 2;
  inboundRoad.position.set(7.05, 1.631, 877.5);
  inboundRoad.receiveShadow = true;
  roadSegmentGroup.add(inboundRoad);

  // Outbound (-X: 3 Lajur Menerus, X in [-12.8, -1.3], Z: 675 s/d 1080)
  const outboundRoad = new THREE.Mesh(new THREE.PlaneGeometry(11.5, 405.0), portRoadPavementMat);
  outboundRoad.rotation.x = -Math.PI / 2;
  outboundRoad.position.set(-7.05, 1.631, 877.5);
  outboundRoad.receiveShadow = true;
  roadSegmentGroup.add(outboundRoad);

  // Crossover U-Turn di antara median
  const addCrossoverPavement = (zStart, zEnd) => {
    const cLen = zEnd - zStart;
    const cMesh = new THREE.Mesh(new THREE.PlaneGeometry(2.8, cLen), portRoadPavementMat);
    cMesh.rotation.x = -Math.PI / 2;
    cMesh.position.set(0, 1.631, (zStart + zEnd) / 2);
    cMesh.receiveShadow = true;
    roadSegmentGroup.add(cMesh);
  };
  addCrossoverPavement(675, 688);
  addCrossoverPavement(792, 806);
  addCrossoverPavement(980, 1005);

  // 4. Median Tengah Ber-Kanstin
  const createDetailedMedianIsland = (startZ, endZ, width = 2.6) => {
    const medGroup = new THREE.Group();
    const radius = width / 2;
    const bodyStartZ = startZ + radius;
    const bodyEndZ = endZ - radius;
    const bodyLen = Math.max(bodyEndZ - bodyStartZ, 0.5);
    const centerZ = (startZ + endZ) / 2;

    [-radius + 0.12, radius - 0.12].forEach(kx => {
      const curbSide = new THREE.Mesh(new THREE.BoxGeometry(0.24, 0.22, bodyLen), curbConcreteGreyMat);
      curbSide.position.set(kx, 1.74, (bodyStartZ + bodyEndZ) / 2);
      curbSide.castShadow = true;
      medGroup.add(curbSide);
    });

    const groundFill = new THREE.Mesh(new THREE.PlaneGeometry(width - 0.44, bodyLen), medianGrassMat);
    groundFill.rotation.x = -Math.PI / 2;
    groundFill.position.set(0, 1.745, (bodyStartZ + bodyEndZ) / 2);
    groundFill.receiveShadow = true;
    medGroup.add(groundFill);

    // Bullnose melengkung
    const addBullnoseHead = (bz, isForward) => {
      const bnSegs = 8;
      const startAng = isForward ? 0 : Math.PI;
      const endAng = isForward ? Math.PI : Math.PI * 2;

      for (let s = 0; s < bnSegs; s++) {
        const a1 = startAng + (s / bnSegs) * (endAng - startAng);
        const a2 = startAng + ((s + 1) / bnSegs) * (endAng - startAng);
        const amid = (a1 + a2) / 2;
        const slen = radius * (Math.PI / bnSegs);
        const isWhite = s % 2 === 0;
        const cBlock = new THREE.Mesh(
          new THREE.BoxGeometry(0.24, 0.22, slen * 1.05),
          isWhite ? curbHazardWhiteMat : curbHazardBlackMat
        );
        cBlock.position.set(Math.cos(amid) * (radius - 0.12), 1.74, bz + Math.sin(amid) * (radius - 0.12));
        cBlock.rotation.y = -amid + Math.PI / 2;
        cBlock.castShadow = true;
        medGroup.add(cBlock);
      }
    };

    addBullnoseHead(bodyStartZ, false);
    addBullnoseHead(bodyEndZ, true);

    [-radius - 0.1, radius + 0.1].forEach(lx => {
      const yLine = new THREE.Mesh(new THREE.PlaneGeometry(0.18, endZ - startZ), yellowLineMat);
      yLine.rotation.x = -Math.PI / 2;
      yLine.position.set(lx, 1.637, centerZ);
      medGroup.add(yLine);
    });

    roadSegmentGroup.add(medGroup);
  };

  createDetailedMedianIsland(656, 675, 2.6);
  createDetailedMedianIsland(688, 792, 2.6);
  createDetailedMedianIsland(806, 980, 2.6);
  createDetailedMedianIsland(1005, 1080, 2.6);

  // 5. Marka Garis Putus-putus Lajur Pulau 1
  // Inbound (+X)
  [5.05, 8.85].forEach(lx => {
    for (let z = 675; z < 1080; z += 9.0) {
      const dash = new THREE.Mesh(new THREE.PlaneGeometry(0.2, 3.5), whiteLineMat);
      dash.rotation.x = -Math.PI / 2;
      dash.position.set(lx, 1.637, z + 1.75);
      roadSegmentGroup.add(dash);
    }
  });

  // Outbound (-X)
  [-5.05, -8.85].forEach(lx => {
    for (let z = 675; z < 1080; z += 9.0) {
      const dash = new THREE.Mesh(new THREE.PlaneGeometry(0.2, 3.5), whiteLineMat);
      dash.rotation.x = -Math.PI / 2;
      dash.position.set(lx, 1.637, z + 1.75);
      roadSegmentGroup.add(dash);
    }
  });

  // Garis Tepi Luar Kuning
  const inOuterLine = new THREE.Mesh(new THREE.PlaneGeometry(0.22, 405), yellowLineMat);
  inOuterLine.rotation.x = -Math.PI / 2;
  inOuterLine.position.set(12.7, 1.637, 877.5);
  roadSegmentGroup.add(inOuterLine);

  const outOuterLine = new THREE.Mesh(new THREE.PlaneGeometry(0.22, 405), yellowLineMat);
  outOuterLine.rotation.x = -Math.PI / 2;
  outOuterLine.position.set(-12.7, 1.637, 877.5);
  roadSegmentGroup.add(outOuterLine);

  group.add(roadSegmentGroup);

  scene.add(group);
  return group;
}
