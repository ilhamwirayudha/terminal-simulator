import * as THREE from 'three';

/**
 * ==============================================================================
 * Terminal Teluk Lamong (TTL) - Sea Causeway Bridge & Administrative Office
 * ==============================================================================
 *
 * 1. SEA CAUSEWAY BRIDGE (Jembatan Penghubung Laut: Z in [-55, +100])
 *    - Elevated 6-Lane Concrete Highway Deck (Width: 32m, Height: Y = 1.6m)
 *    - Heavy Concrete Bridge Piers & Underwater Pile Caps spaced every 22m
 *    - Central Median with Dual-Arm Highway LED Streetlamps
 *    - Parapets, Steel Crash Barriers & Road Markings
 *    - Industrial Enclosed Dry-Bulk Conveyor Pipeline along the East flank
 *
 * 2. ADMINISTRATIVE OFFICE ISLAND PLATFORM (Pulau Kantor TTL: Z in [100, 210])
 *    - Reclaimed Marine Platform with Coastal Seawall perimeter
 *    - Iconic 4-Story Modern Glass & Composite Office Building (Kantor Pelindo TTL)
 *    - Drop-off Canopy, Rooftop Comms Mast, Solar Array, & Glowing Logo Sign
 *    - Ceremonial Flagpole Monument (Indonesia & Pelindo flags)
 *    - Paved Operational Parking Lot with Parked Vehicles
 *    - Landscaped Palm Trees, Flowerbeds, & Access Road Loop
 */

export function createBridgeAndOffice(scene) {
  const group = new THREE.Group();
  group.name = 'ttl_bridge_and_office_complex';

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

  const barrierMat = new THREE.MeshStandardMaterial({
    color: 0x94a3b8,
    roughness: 0.5,
    metalness: 0.6
  });

  const steelMat = new THREE.MeshStandardMaterial({
    color: 0x334155,
    roughness: 0.4,
    metalness: 0.8
  });

  const pipeMat = new THREE.MeshStandardMaterial({
    color: 0x0284c7, // Pelindo Industrial Blue
    roughness: 0.5,
    metalness: 0.5
  });

  const buildingWallMat = new THREE.MeshStandardMaterial({
    color: 0xf8fafc, // Crisp architectural white
    roughness: 0.35,
    metalness: 0.1
  });

  const buildingDarkTrimMat = new THREE.MeshStandardMaterial({
    color: 0x0f172a, // Deep slate trim
    roughness: 0.5,
    metalness: 0.4
  });

  const glassWindowMat = new THREE.MeshStandardMaterial({
    color: 0x0284c7, // Marine aqua tinted reflective glass
    roughness: 0.08,
    metalness: 0.95,
    transparent: true,
    opacity: 0.85
  });

  const platformGrassMat = new THREE.MeshStandardMaterial({
    color: 0x2d5a27,
    roughness: 0.9
  });

  const platformPavingMat = new THREE.MeshStandardMaterial({
    color: 0x94a3b8,
    roughness: 0.8
  });

  const yellowLineMat = new THREE.MeshBasicMaterial({ color: 0xfbbf24, side: THREE.DoubleSide });
  const whiteLineMat = new THREE.MeshBasicMaterial({ color: 0xf8fafc, side: THREE.DoubleSide });

  const lampGlowMat = new THREE.MeshStandardMaterial({
    color: 0xfef08a,
    emissive: 0xfef08a,
    emissiveIntensity: 1.2,
    roughness: 0.2
  });

  // Helper for Palm Trees on Office Platform
  const addPalmTree = (parent, x, y, z, scale = 1.0) => {
    const palm = new THREE.Group();
    palm.position.set(x, y, z);
    palm.scale.set(scale, scale, scale);

    const trunkGeo = new THREE.CylinderGeometry(0.18, 0.28, 4.2, 7);
    const trunkMat = new THREE.MeshStandardMaterial({ color: 0x5c3a21, roughness: 0.9 });
    const trunk = new THREE.Mesh(trunkGeo, trunkMat);
    trunk.position.set(0, 2.1, 0);
    trunk.rotation.z = (Math.random() - 0.5) * 0.1;
    trunk.castShadow = true;
    palm.add(trunk);

    const frondMat = new THREE.MeshStandardMaterial({ color: 0x15803d, roughness: 0.8, side: THREE.DoubleSide });
    for (let i = 0; i < 7; i++) {
      const angle = (i / 7) * Math.PI * 2;
      const frond = new THREE.Mesh(new THREE.ConeGeometry(0.9, 2.8, 4), frondMat);
      frond.position.set(Math.cos(angle) * 1.2, 4.0, Math.sin(angle) * 1.2);
      frond.rotation.x = Math.sin(angle) * 0.8;
      frond.rotation.z = -Math.cos(angle) * 0.8;
      frond.castShadow = true;
      palm.add(frond);
    }
    parent.add(palm);
  };

  // ============================================================================
  // SECTION 1: 680-METER CURVED SEA CAUSEWAY BRIDGE (Z: -55 to +625)
  // Desain melengkung layaknya jembatan laut asli:
  // - Lengkung Vertikal Parabolik (Camber / Arching) naik anggun hingga Y = 8.0m di atas laut
  // - Sweep Horizontal Halus mengikuti kontur selat mangrove Teluk Lamong
  // - Gelagar Box Girder, Aspal Mulus, Pembatas Tengah Ramping, Crash Barrier & Marka Jalan
  // ============================================================================
  const bridgeGroup = new THREE.Group();
  bridgeGroup.name = 'sea_causeway_bridge';

  const bridgeStartZ = -55;
  const bridgeEndZ = 625;
  const bridgeLength = bridgeEndZ - bridgeStartZ; // 680m
  const bridgeWidth = 16.0;

  const yStart = 0.82; // Level jalan daratan di Z = -55
  const yEnd = 1.62;   // Level platform kantor di Z = +625
  const archHeight = 6.8; // Tinggi lengkung parabola vertikal di tengah laut (puncak Y = 8.0m)
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

  // 2. Sampling Frame Vektor (Posisi, Tangent, Normal Lateral, Up Vector)
  const numSteps = 136; // Resolusi tinggi (~5m per segmen)
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

      // Triangle 1: v1 -> v2 -> v3
      positions.push(v1.x, v1.y, v1.z, v2.x, v2.y, v2.z, v3.x, v3.y, v3.z);
      // Triangle 2: v1 -> v3 -> v4
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

  // A. Gelagar Beton Box Girder (Tebal 1.2m, Lebar 16.0m)
  createCurvedRibbon(-8.0, 8.0, 0.0, 0.0, bridgeConcreteMat, true, true);     // Permukaan Atas
  createCurvedRibbon(-8.0, 8.0, -1.2, -1.2, bridgeConcreteMat, true, false);  // Permukaan Bawah
  createCurvedRibbon(-8.0, -8.0, 0.0, -1.2, bridgeConcreteMat, true, true);  // Dinding Sisi Kiri
  createCurvedRibbon(8.0, 8.0, -1.2, 0.0, bridgeConcreteMat, true, true);  // Dinding Sisi Kanan

  // B. Permukaan Aspal Mulus Jembatan (Lebar 15.6m Penuh Tanpa Halangan Tengah)
  createCurvedRibbon(-7.8, 7.8, 0.015, 0.015, bridgeAsphaltMat, true, false);

  // C. Pagar Pengaman Luar Sisi Kiri & Kanan (Concrete Crash Barriers di X = ±7.75)
  // Barrier Kiri
  createCurvedRibbon(-7.9, -7.4, 0.9, 0.9, barrierMat, true, true);
  createCurvedRibbon(-7.9, -7.9, 0.9, 0.0, barrierMat, true, true);
  createCurvedRibbon(-7.4, -7.4, 0.0, 0.9, barrierMat, true, true);
  // Barrier Kanan
  createCurvedRibbon(7.4, 7.9, 0.9, 0.9, barrierMat, true, true);
  createCurvedRibbon(7.4, 7.4, 0.9, 0.0, barrierMat, true, true);
  createCurvedRibbon(7.9, 7.9, 0.0, 0.9, barrierMat, true, true);

  // D. Marka Jalan Jembatan (Tanpa Pembatas Fisik di Tengah):
  // 1. Marka Garis Tepi Luar Putih (Outer White Edge Lines - Sesuai Standar Marka Indonesia)
  [-7.35, 7.35].forEach(lx => {
    createCurvedRibbon(lx - 0.1, lx + 0.1, 0.022, 0.022, whiteLineMat, false, false);
  });

  // 2. Marka Garis Kuning Utuh di Tengah Jalan (Solid Yellow Center Median Line - Sesuai Standar Marka Indonesia)
  [-0.12, 0.12].forEach(lx => {
    createCurvedRibbon(lx - 0.06, lx + 0.06, 0.022, 0.022, yellowLineMat, false, false);
  });

  // 3. Marka Garis Putus-putus Lajur (Dashed Lane Dividers di X = ±3.7)
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

  // Marka Garis Kejut Transversal (Optical Speed Bars) di Lajur Inbound Menjelang Pulau (Z ~ 585 - 618)
  for (let bz = bridgeLength - 40; bz <= bridgeLength - 10; bz += 6.5) {
    const tA = bz / bridgeLength;
    const tB = (bz + 0.65) / bridgeLength;
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
    // Lajur inbound berada di -N (+X), dari X = 0.5 hingga 7.2
    const v1 = new THREE.Vector3().copy(fA.P).addScaledVector(fA.N, -7.1).addScaledVector(fA.U, 0.024);
    const v2 = new THREE.Vector3().copy(fA.P).addScaledVector(fA.N, -0.6).addScaledVector(fA.U, 0.024);
    const v3 = new THREE.Vector3().copy(fB.P).addScaledVector(fB.N, -0.6).addScaledVector(fB.U, 0.024);
    const v4 = new THREE.Vector3().copy(fB.P).addScaledVector(fB.N, -7.1).addScaledVector(fB.U, 0.024);

    const bPos = [v1.x, v1.y, v1.z, v2.x, v2.y, v2.z, v3.x, v3.y, v3.z, v1.x, v1.y, v1.z, v3.x, v3.y, v3.z, v4.x, v4.y, v4.z];
    const bGeo = new THREE.BufferGeometry();
    bGeo.setAttribute('position', new THREE.Float32BufferAttribute(bPos, 3));
    bGeo.computeVertexNormals();
    const bMesh = new THREE.Mesh(bGeo, whiteLineMat);
    bridgeGroup.add(bMesh);
  }

  // E. Pilar Beton Penyangga Jembatan (Every ~25m sepanjang jembatan)
  for (let z = bridgeStartZ + 25; z < bridgeEndZ - 15; z += 25) {
    const t = (z - bridgeStartZ) / bridgeLength;
    const f = frames[Math.min(frames.length - 1, Math.round(t * numSteps))];

    // Crosshead Beam
    const crossBeam = new THREE.Mesh(new THREE.BoxGeometry(bridgeWidth - 2.0, 1.4, 3.2), pierConcreteMat);
    crossBeam.position.copy(f.P).addScaledVector(f.U, -1.3);
    crossBeam.rotation.y = Math.atan2(f.T.x, f.T.z);
    crossBeam.castShadow = true;
    bridgeGroup.add(crossBeam);

    // Dual Cylindrical Columns
    [-4.5, 4.5].forEach(px => {
      const colTopY = f.P.y - 1.3;
      const colHeight = colTopY + 4.5;
      const column = new THREE.Mesh(new THREE.CylinderGeometry(1.0, 1.2, colHeight, 12), pierConcreteMat);
      const colPos = new THREE.Vector3().copy(f.P).addScaledVector(f.N, px);
      colPos.y = colTopY - colHeight / 2;
      column.position.copy(colPos);
      column.castShadow = true;
      bridgeGroup.add(column);

      // Underwater Pile Cap Collar
      const collar = new THREE.Mesh(new THREE.BoxGeometry(3.0, 1.0, 3.0), pierConcreteMat);
      collar.position.set(colPos.x, -0.4, colPos.z);
      bridgeGroup.add(collar);
    });
  }

  // 4. AIR LAUT DAN HUTAN MANGROVE SEPANJANG JEMBATAN (SESUAI FOTO SATELIT PANORAMA)
  const seaWaterMat = new THREE.MeshStandardMaterial({
    color: 0x6e7d73, // Silty greenish-grey estuarine coastal water matching satellite photos
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

  // Rumpun Mangrove / Hutan Bakau Pesisir di Sisi Jembatan
  const mangroveCanopyMat = new THREE.MeshStandardMaterial({ color: 0x1e3a1e, roughness: 0.85 });
  const addMangroveCluster = (cx, cz, count = 6, spread = 16) => {
    const cluster = new THREE.Group();
    cluster.position.set(cx, 0, cz);
    for (let i = 0; i < count; i++) {
      const mx = (Math.random() - 0.5) * spread;
      const mz = (Math.random() - 0.5) * spread;
      const r = 2.0 + Math.random() * 2.2;
      const tree = new THREE.Mesh(new THREE.SphereGeometry(r, 7, 6), mangroveCanopyMat);
      tree.scale.set(1.3, 0.8, 1.3);
      tree.position.set(mx, r * 0.7 + 0.1, mz);
      tree.castShadow = true;
      cluster.add(tree);
    }
    bridgeGroup.add(cluster);
  };

  // Gugusan Mangrove di Sisi Barat/Pantai & Flank Jembatan
  addMangroveCluster(-35, -20, 10, 24);
  addMangroveCluster(35, -20, 10, 24);
  addMangroveCluster(-45, 60, 8, 20);
  addMangroveCluster(40, 90, 9, 22);
  addMangroveCluster(-55, 180, 12, 28);
  addMangroveCluster(50, 230, 10, 25);
  addMangroveCluster(-40, 320, 8, 20);
  addMangroveCluster(45, 380, 11, 26);
  addMangroveCluster(-45, 480, 10, 24);
  addMangroveCluster(45, 520, 11, 26);
  addMangroveCluster(-35, 580, 9, 20);
  addMangroveCluster(35, 610, 9, 20);

  group.add(bridgeGroup);

  // ============================================================================
  // SECTION 2: PULAU 1 - TELUK LAMONG SATELLITE-ACCURATE ISLAND COMPLEX
  // (Z in [625, 1150], Elevasi Tanah Y = 1.62m)
  // Bentuk dan tata letak 100% presisi sesuai foto satelit resolusi tinggi:
  // - BENTUK TANAH: Custom Extruded Island Polygon dengan garis pantai mangrove diagonal
  //   di barat laut (+X), tanggul utara lurus, semenanjung persegi di selatan (-X),
  //   dan teluk air laut di tenggara jalan.
  // - SAYAP SELATAN (-X): Head Office (Graha Pelindo), Masjid Kubah Putih & Menara 20m,
  //   Lapangan Basket/Futsal, 2 Shelter Kanopi Motor, Jalan Loop Internal, & Sabuk Mangrove
  // - JALAN UTAMA: 5-Lajur Inbound, Taman Median Ber-kanstin dengan 2 U-Turn,
  //   Pos Timbangan Pre-Check, 2 Gantry Truss OCR, Antrean Truk, & 3-Lajur Outbound
  // - SAYAP UTARA (+X): Main Gate Canopy, Hutan Mangrove Segitiga, Substation Utilitas,
  //   Gedung Operasional, Holding Yard Depot Kontainer Multi-Tier, & Staging Bus
  // ============================================================================
  const islandGroup = new THREE.Group();
  islandGroup.name = 'ttl_pulau_1_complex';

  // ----------------------------------------------------------------------------
  // A. MATERIAL LENGKAP PULAU 1
  // ----------------------------------------------------------------------------
  const islandSoilMat = new THREE.MeshStandardMaterial({ color: 0x6e6854, roughness: 0.95 }); // Coastal sandy terrain
  const islandGrassMat = new THREE.MeshStandardMaterial({ color: 0x4a6341, roughness: 0.9 });  // Coastal grass
  const seawallMat = new THREE.MeshStandardMaterial({ color: 0x8a929a, roughness: 0.85 });     // Concrete seawall
  const courtGreenMat = new THREE.MeshStandardMaterial({ color: 0x15803d, roughness: 0.65 });
  const courtBorderMat = new THREE.MeshStandardMaterial({ color: 0xc2410c, roughness: 0.7 });
  const fenceWireMat = new THREE.MeshStandardMaterial({ color: 0x1e293b, roughness: 0.5, wireframe: true });
  const hoopOrangeMat = new THREE.MeshStandardMaterial({ color: 0xea580c, roughness: 0.4 });

  const mosqueWhiteMat = new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 0.25, metalness: 0.05 });
  const goldMat = new THREE.MeshStandardMaterial({ color: 0xf59e0b, metalness: 0.85, roughness: 0.2 });
  const gateCanopyMat = new THREE.MeshStandardMaterial({ color: 0xf1f5f9, roughness: 0.3 });
  const gateBlueMat = new THREE.MeshStandardMaterial({ color: 0x0284c7, roughness: 0.4 });
  const shelterRoofMat = new THREE.MeshStandardMaterial({ color: 0xe2e8f0, metalness: 0.3, roughness: 0.5 });
  const boomBarrierMat = new THREE.MeshStandardMaterial({ color: 0xdc2626, roughness: 0.4 });

  const roadConcreteLightMat = new THREE.MeshStandardMaterial({ color: 0x22262e, roughness: 0.88 });
  const roadAsphaltDarkMat = new THREE.MeshStandardMaterial({ color: 0x22262e, roughness: 0.88 });
  const portRoadPavementMat = new THREE.MeshStandardMaterial({
    color: 0x22262e, // Deep asphalt matching mainland highway (Road.js) - seragam dari ujung ke ujung
    roughness: 0.88,
    metalness: 0.08,
    side: THREE.DoubleSide
  });
  const redShoulderAsphaltMat = new THREE.MeshStandardMaterial({
    color: 0x82443e, // Reddish-tinted port shoulder pavement (seen under parked red truck in satellite photo)
    roughness: 0.88,
    metalness: 0.05,
    side: THREE.DoubleSide
  });
  const gatePlazaConcreteMat = new THREE.MeshStandardMaterial({
    color: 0x767e85, // Heavy-duty reinforced inspection apron concrete
    roughness: 0.85,
    metalness: 0.04,
    side: THREE.DoubleSide
  });
  const curbConcreteGreyMat = new THREE.MeshStandardMaterial({
    color: 0x9ba3ab,
    roughness: 0.8
  });
  const medianSoilMat = new THREE.MeshStandardMaterial({
    color: 0x545042, // Earthy coastal soil fill
    roughness: 0.95
  });
  const medianFoliageDarkMat = new THREE.MeshStandardMaterial({ color: 0x1e361b, roughness: 0.85 });
  const medianFoliageMidMat = new THREE.MeshStandardMaterial({ color: 0x2c4a26, roughness: 0.8 });
  const medianFoliageLightMat = new THREE.MeshStandardMaterial({ color: 0x38582d, roughness: 0.8 });
  const expansionJointMat = new THREE.MeshStandardMaterial({ color: 0x111827, roughness: 0.6, metalness: 0.8 });
  const curbHazardWhiteMat = new THREE.MeshStandardMaterial({ color: 0xf8fafc, roughness: 0.6 });
  const curbHazardBlackMat = new THREE.MeshStandardMaterial({ color: 0x1e242b, roughness: 0.7 });
  const medianGrassMat = new THREE.MeshStandardMaterial({ color: 0x3d5c32, roughness: 0.85 });
  const bushGreenMat = new THREE.MeshStandardMaterial({ color: 0x223e1e, roughness: 0.8 });
  const gantryTrussMat = new THREE.MeshStandardMaterial({ color: 0x475569, roughness: 0.4, metalness: 0.7 });
  const ledGreenArrowMat = new THREE.MeshBasicMaterial({ color: 0x22c55e });
  const mangroveMat = new THREE.MeshStandardMaterial({ color: 0x1e3a1e, roughness: 0.85 });

  // ----------------------------------------------------------------------------
  // B. FONDASI DARATAN PULAU 1 SESUAI BENTUK KONTUR SATELIT ASLI
  // Menggunakan custom 2D Polygon Extrusion yang merefleksikan seluruh belokan pulau
  // ----------------------------------------------------------------------------
  const islandShape = new THREE.Shape();
  // Mulai dari dudukan abutment jembatan sisi timur/kiri (+X di Z = 624.5)
  islandShape.moveTo(8.5, 624.5);

  // 1. Garis Pantai Pesisir Barat Laut (+X) Melengkung Halus Sesuai Citra Satelit Asli
  islandShape.lineTo(12, 625);
  islandShape.lineTo(20, 628);  islandShape.lineTo(36, 634);
  islandShape.lineTo(45, 644);
  
  // 2. Garis Pantai Pantai Utara (+X) Lurus ke Timur
  islandShape.lineTo(142, 690);
  islandShape.lineTo(142, 1080); // Sudut Timur Laut Pulau
  // 3. Tanggul Timur (+X ke -X di Z = 1080)
  islandShape.lineTo(-16, 1080); // Titik keluar jalan utama ke arah Pulau 2

  // 4. Garis Pantai Teluk Air Laut Selatan Jalan (Z: 1080 s/d 788 pada X = -16)
  islandShape.lineTo(-16, 788); // Sudut awal Semenanjung Selatan

  // 5. Tanggul Timur Semenanjung Selatan (Z = 788, dari X = -16 ke X = -202 - melonjong ke bawah)
  islandShape.lineTo(-202, 788); // Sudut Tenggara Semenanjung Selatan

  // 6. Tanggul Selatan Semenanjung Selatan (X = -202, dari Z = 788 ke Z = 642)
  islandShape.lineTo(-202, 642); // Sudut Barat Daya Semenanjung Selatan

  // 7. Tanggul Barat Semenanjung Selatan Menuju Garis Pantai Selatan Jembatan
  islandShape.lineTo(-36, 642);
  islandShape.lineTo(-26, 628);
  islandShape.lineTo(-18, 616);
  islandShape.lineTo(-12, 614);
  islandShape.lineTo(-8.5, 618);
  islandShape.lineTo(-8.5, 624.5); // Sisi kanan abutment

  // 8. Dudukan Abutment Jembatan di Z = 624.5
  islandShape.lineTo(8.5, 624.5); // Menutup kurva pulau

  const extrudeSettings = {
    steps: 1,
    depth: 3.2,
    bevelEnabled: false
  };

  const islandGeo = new THREE.ExtrudeGeometry(islandShape, extrudeSettings);

  // Fondasi Tanah Pulau 1 (Solid Coastal Ground: Y = 1.62)
  // Dengan rotation.x = Math.PI / 2, koordinat 2D (x, y) menjadi 3D (x, 1.62, z) dengan normal menghadap ke atas (+Y)
  // dan ekstrusi depth 3.2m turun ke bawah hingga Y = -1.58m di bawah permukaan air laut
  const islandMesh = new THREE.Mesh(islandGeo, islandSoilMat);
  islandMesh.rotation.x = Math.PI / 2;
  islandMesh.position.set(0, 1.62, 0);
  islandMesh.receiveShadow = true;
  islandGroup.add(islandMesh);

  // Lapisan Dasar Beton Bawah Pulau (Underwater Platform Base)
  const underMesh = new THREE.Mesh(islandGeo, bridgeConcreteMat);
  underMesh.rotation.x = Math.PI / 2;
  underMesh.position.set(0, 1.58, 0);
  islandGroup.add(underMesh);

  // ----------------------------------------------------------------------------
  // C. TANGGUL BETON KELILING PULAU 1 (PERIMETER SEAWALL)
  // ----------------------------------------------------------------------------
  const addWallSegment = (x1, z1, x2, z2, width = 2.4, height = 1.0) => {
    const dx = x2 - x1;
    const dz = z2 - z1;
    const len = Math.sqrt(dx * dx + dz * dz);
    const angle = Math.atan2(dz, dx);
    const wall = new THREE.Mesh(new THREE.BoxGeometry(len, height, width), seawallMat);
    wall.position.set(x1 + dx / 2, 1.62 + height / 2, z1 + dz / 2);
    wall.rotation.y = -angle;
    wall.castShadow = true;
    islandGroup.add(wall);
  };

  // Tanggul Utara Lurus
  addWallSegment(142, 690, 142, 1080);
  // Tanggul Timur (Hanya di sisi utara jalan; koridor jalan terbuka menuju causeway di X in [-18.5, 18.5])
  addWallSegment(142, 1080, 18.5, 1080);
  // Tanggul Teluk Selatan Jalan
  addWallSegment(-16, 1080, -16, 788);
  // Tanggul Semenanjung Selatan (Melonjong ke Bawah: X in [-202, -16], Z in [642, 788])
  addWallSegment(-16, 788, -202, 788);
  addWallSegment(-202, 788, -202, 642);
  addWallSegment(-202, 642, -36, 642);
  addWallSegment(-36, 642, -26, 628);
  addWallSegment(-26, 628, -14, 614);

  // Pondasi Abutmen Kokoh di Ujung Jembatan Pulau 1 (Dudukan Struktural di Bawah Gelagar Jembatan: Top di Y = 0.4m)
  const bridgeAbutmentIsland = new THREE.Mesh(new THREE.BoxGeometry(16.0, 2.4, 5.0), seawallMat);
  bridgeAbutmentIsland.position.set(0, -0.8, 623.5);
  bridgeAbutmentIsland.receiveShadow = true;
  islandGroup.add(bridgeAbutmentIsland);

  // ----------------------------------------------------------------------------
  // D. SEGMEN JALAN POROS UTAMA PULAU 1 (Z: 625 s/d 1150)
  // Jembatan 4 lajur (2 masuk & 2 keluar) melebar menjadi 6 lajur (3 masuk & 3 keluar)
  // ketika memasuki daratan Pulau 1 (Persis Foto Satelit Apple Maps)
  // ----------------------------------------------------------------------------
  const roadSegmentGroup = new THREE.Group();
  roadSegmentGroup.name = 'pulau1_road_corridor';

  // 2. Aspal Pelebaran Halus Jalan Transisi Masuk (Transition Flare: Z = 625 s/d 675)
  // Dari lebar jembatan 4-lajur (X in [-7.8, +7.8]) melebar ke 6-lajur (3 masuk X in [1.3, 12.8], 3 keluar X in [-12.8, -1.3])
  const getLeftRoadEdge = (z) => {
    const u = Math.min(Math.max((z - 625) / 50.0, 0), 1);
    const s = u * u * (3 - 2 * u); // smoothstep
    return 7.8 + 5.0 * s; // Melebar dari X = 7.8 (2 lajur jembatan) ke X = 12.8 (3 lajur pulau)
  };

  const getRightRoadEdge = (z) => {
    const u = Math.min(Math.max((z - 625) / 50.0, 0), 1);
    const s = u * u * (3 - 2 * u); // smoothstep
    return -7.8 - 5.0 * s; // Melebar dari X = -7.8 (2 lajur jembatan) ke X = -12.8 (3 lajur pulau)
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

    // Quad: triangle 1 & triangle 2 (CCW) dengan normal menghadap ke atas (+Y)
    flarePositions.push(
      xR1, y, z1, xR2, y, z2, xL2, y, z2,
      xR1, y, z1, xL2, y, z2, xL1, y, z1
    );
    for (let k = 0; k < 6; k++) {
      flareNormals.push(0, 1, 0);
    }
  }

  const flareGeo = new THREE.BufferGeometry();
  flareGeo.setAttribute('position', new THREE.Float32BufferAttribute(flarePositions, 3));
  flareGeo.setAttribute('normal', new THREE.Float32BufferAttribute(flareNormals, 3));
  const flareMesh = new THREE.Mesh(flareGeo, portRoadPavementMat);
  flareMesh.receiveShadow = true;
  roadSegmentGroup.add(flareMesh);

  // Kanstin Beton Pembatas Tepi Luar yang Mengikuti Kurva Transisi
  const curbStepZ = 20;
  for (let i = 0; i < curbStepZ; i++) {
    const z1 = 625 + (i / curbStepZ) * 50;
    const z2 = 625 + ((i + 1) / curbStepZ) * 50;
    const midZ = (z1 + z2) / 2;
    const len = z2 - z1;

    // Kanstin Tepi Kanan (-X)
    const xr1 = getRightRoadEdge(z1);
    const xr2 = getRightRoadEdge(z2);
    const midXr = (xr1 + xr2) / 2;
    const angleR = Math.atan2(xr2 - xr1, len);
    const curbR = new THREE.Mesh(new THREE.BoxGeometry(0.35, 0.22, len * 1.05), curbHazardWhiteMat);
    curbR.position.set(midXr - 0.15, 1.74, midZ);
    curbR.rotation.y = angleR;
    curbR.castShadow = true;
    roadSegmentGroup.add(curbR);

    // Kanstin Tepi Kiri (+X)
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

  // 3. Marka Chevron Gore Pemisah Jalur Berbentuk V Runcing (Z: 628 s/d 656)
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

  const chevronHatchGroup = new THREE.Group();
  for (let cz = 631; cz <= 654; cz += 1.85) {
    const curW = 1.3 * ((cz - goreZ1) / goreLength);
    if (curW > 0.2) {
      const barLen = (curW * 2 - 0.28) * 1.35;
      const bar = new THREE.Mesh(new THREE.PlaneGeometry(0.24, Math.max(barLen, 0.2)), whiteLineMat);
      bar.rotation.x = -Math.PI / 2;
      bar.rotation.z = Math.PI / 4;
      bar.position.set(0, 1.636, cz);
      chevronHatchGroup.add(bar);
    }
  }
  roadSegmentGroup.add(chevronHatchGroup);

  // 4. Hamparan Aspal Jalan Utama 6-Lajur Pulau 1 (Z: 675 s/d 1150)
  // Inbound (+X: 3 Lajur, X in [1.3, 12.8])
  const inboundRoad3Lane = new THREE.Mesh(new THREE.PlaneGeometry(11.5, 145), portRoadPavementMat);
  inboundRoad3Lane.rotation.x = -Math.PI / 2;
  inboundRoad3Lane.position.set(7.05, 1.631, 747.5);
  inboundRoad3Lane.receiveShadow = true;
  roadSegmentGroup.add(inboundRoad3Lane);

  // Zona Pelebaran Menjelang Gerbang (Z in [820, 865]: 3 Lajur Melebar ke 4 Lajur Pemeriksaan)
  const preGateFlareGeo = new THREE.BufferGeometry();
  const pgPos = [];
  const pgNorm = [];
  const pgSteps = 15;
  for (let i = 0; i < pgSteps; i++) {
    const tA = i / pgSteps;
    const tB = (i + 1) / pgSteps;
    const zA = 820 + tA * 45;
    const zB = 820 + tB * 45;
    const sA = tA * tA * (3 - 2 * tA);
    const sB = tB * tB * (3 - 2 * tB);
    const xOuterA = 12.8 + sA * 3.7; // Melebar dari 12.8 ke 16.5
    const xOuterB = 12.8 + sB * 3.7;
    const y = 1.631;

    pgPos.push(
      1.3, y, zA, xOuterB, y, zB, xOuterA, y, zA,
      1.3, y, zA, 1.3, y, zB, xOuterB, y, zB
    );
    for (let k = 0; k < 6; k++) pgNorm.push(0, 1, 0);
  }
  preGateFlareGeo.setAttribute('position', new THREE.Float32BufferAttribute(pgPos, 3));
  preGateFlareGeo.setAttribute('normal', new THREE.Float32BufferAttribute(pgNorm, 3));
  const preGateFlareMesh = new THREE.Mesh(preGateFlareGeo, portRoadPavementMat);
  preGateFlareMesh.receiveShadow = true;
  roadSegmentGroup.add(preGateFlareMesh);

  // Pelat Beton Gerbang Pemeriksaan (Reinforced Apron 4-Lajur: Z in [865, 908], X in [1.3, 16.5])
  const gateInspectionApron = new THREE.Mesh(new THREE.PlaneGeometry(15.2, 43), gatePlazaConcreteMat);
  gateInspectionApron.rotation.x = -Math.PI / 2;
  gateInspectionApron.position.set(8.9, 1.631, 886.5);
  gateInspectionApron.receiveShadow = true;
  roadSegmentGroup.add(gateInspectionApron);

  // Jalan Inbound Pasca Gerbang Pulau 1 (Z in [908, 1080])
  const inboundPostGate = new THREE.Mesh(new THREE.PlaneGeometry(15.2, 172.0), portRoadPavementMat);
  inboundPostGate.rotation.x = -Math.PI / 2;
  inboundPostGate.position.set(8.9, 1.631, 994.0);
  inboundPostGate.receiveShadow = true;
  roadSegmentGroup.add(inboundPostGate);

  // Outbound Pulau 1 (-X: 3 Lajur Menerus, X in [-12.8, -1.3], Z in [675, 1080])
  const outboundRoad3Lane = new THREE.Mesh(new THREE.PlaneGeometry(11.5, 405.0), portRoadPavementMat);
  outboundRoad3Lane.rotation.x = -Math.PI / 2;
  outboundRoad3Lane.position.set(-7.05, 1.631, 877.5);
  outboundRoad3Lane.receiveShadow = true;
  roadSegmentGroup.add(outboundRoad3Lane);

  // Bukaan Aspal Crossover (U-Turn 1, 2, & 3 di Antara Median Tengah)
  const addCrossoverPavement = (zStart, zEnd) => {
    const cLen = zEnd - zStart;
    const cMesh = new THREE.Mesh(new THREE.PlaneGeometry(2.8, cLen), portRoadPavementMat);
    cMesh.rotation.x = -Math.PI / 2;
    cMesh.position.set(0, 1.631, (zStart + zEnd) / 2);
    cMesh.receiveShadow = true;
    roadSegmentGroup.add(cMesh);
  };
  addCrossoverPavement(675, 688);  // Crossover 1
  addCrossoverPavement(792, 806);  // Crossover 2
  addCrossoverPavement(980, 1005); // Crossover 3

  // Jalur Slip Masuk Deselerasi Menuju Depo Kontainer & Buffer Yard (+X: Z in [734, 765])
  const slipRoadGeo = new THREE.BufferGeometry();
  const slipPos = [];
  const slipNorm = [];
  const sSteps = 12;
  for (let i = 0; i < sSteps; i++) {
    const tA = i / sSteps;
    const tB = (i + 1) / sSteps;
    const zA = 734 + tA * 31;
    const zB = 734 + tB * 31;
    const xInA = 12.8;
    const xInB = 12.8;
    const xOutA = 12.8 + tA * 8.5;
    const xOutB = 12.8 + tB * 8.5;
    const y = 1.631;

    slipPos.push(
      xInA, y, zA, xOutB, y, zB, xOutA, y, zA,
      xInA, y, zA, xInB, y, zB, xOutB, y, zB
    );
    for (let k = 0; k < 6; k++) slipNorm.push(0, 1, 0);
  }
  slipRoadGeo.setAttribute('position', new THREE.Float32BufferAttribute(slipPos, 3));
  slipRoadGeo.setAttribute('normal', new THREE.Float32BufferAttribute(slipNorm, 3));
  const slipRoadMesh = new THREE.Mesh(slipRoadGeo, portRoadPavementMat);
  slipRoadMesh.receiveShadow = true;
  roadSegmentGroup.add(slipRoadMesh);

  // Marka Chevron Gore Segitiga pada Percabangan Slip Masuk Buffer (Z in [735, 750])
  for (let cz = 736; cz <= 749; cz += 2.2) {
    const u = (cz - 735) / 15.0;
    const barW = u * 6.5;
    if (barW > 0.4) {
      const cBar = new THREE.Mesh(new THREE.PlaneGeometry(barW, 0.28), whiteLineMat);
      cBar.rotation.x = -Math.PI / 2;
      cBar.rotation.z = -Math.PI / 5;
      cBar.position.set(12.8 + barW / 2 + 0.2, 1.636, cz);
      roadSegmentGroup.add(cBar);
    }
  }

  // ----------------------------------------------------------------------------
  // 5. TAMAN MEDIAN TENGAH BER-KANSTIN & SEGMENTASI SESUAI CITRA SATELIT
  // ----------------------------------------------------------------------------
  const createDetailedMedianIsland = (startZ, endZ, width = 2.6, opts = {}) => {
    const medGroup = new THREE.Group();
    const radius = width / 2;
    const bodyStartZ = startZ + radius;
    const bodyEndZ = endZ - radius;
    const bodyLen = Math.max(bodyEndZ - bodyStartZ, 0.5);
    const centerZ = (startZ + endZ) / 2;

    // Kanstin Sisi Lurus (Kiri +X & Kanan -X)
    [-radius + 0.12, radius - 0.12].forEach(kx => {
      const curbSide = new THREE.Mesh(new THREE.BoxGeometry(0.24, 0.22, bodyLen), curbConcreteGreyMat);
      curbSide.position.set(kx, 1.74, (bodyStartZ + bodyEndZ) / 2);
      curbSide.castShadow = true;
      medGroup.add(curbSide);
    });

    // Tanah Isi / Rumput Tengah
    const groundFill = new THREE.Mesh(new THREE.PlaneGeometry(width - 0.44, bodyLen), medianGrassMat);
    groundFill.rotation.x = -Math.PI / 2;
    groundFill.position.set(0, 1.745, (bodyStartZ + bodyEndZ) / 2);
    groundFill.receiveShadow = true;
    medGroup.add(groundFill);

    // Bullnose Melengkung Semicircular di Ujung Depan & Belakang
    const addBullnoseHead = (bz, isForward) => {
      const bnSegs = 12;
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

      // Tutup Rumput Bullnose
      const circleGeo = new THREE.CircleGeometry(radius - 0.22, 14, startAng, Math.PI);
      const circleMesh = new THREE.Mesh(circleGeo, medianGrassMat);
      circleMesh.rotation.x = -Math.PI / 2;
      circleMesh.position.set(0, 1.745, bz);
      medGroup.add(circleMesh);
    };

    addBullnoseHead(bodyStartZ, false);
    addBullnoseHead(bodyEndZ, true);

    // Marka Garis Tepi Kuning Berjalan di Sepanjang Sisi Median
    [-radius - 0.1, radius + 0.1].forEach(lx => {
      const yLine = new THREE.Mesh(new THREE.PlaneGeometry(0.18, endZ - startZ), yellowLineMat);
      yLine.rotation.x = -Math.PI / 2;
      yLine.position.set(lx, 1.637, centerZ);
      medGroup.add(yLine);
    });

    // Vegetasi Alami Multi-Tier (Semak Port & Pohon Hias Median Rimbun Sesuai Citra Satelit)
    const foliageMats = [medianFoliageDarkMat, medianFoliageMidMat, medianFoliageLightMat];
    const foliageDensity = opts.density || 2.2;
    for (let pz = startZ + 2.0; pz <= endZ - 2.0; pz += foliageDensity) {
      const seed = Math.sin(pz * 12.34);
      const xJitter = (seed * 0.35);
      const rBase = 0.65 + Math.abs(seed) * 0.45;
      const fMat = foliageMats[Math.floor(Math.abs(seed * 9)) % foliageMats.length];
      const fMat2 = foliageMats[(Math.floor(Math.abs(seed * 9)) + 1) % foliageMats.length];

      // Semak Utama Rimbun
      const shrub = new THREE.Mesh(new THREE.SphereGeometry(rBase, 7, 6), fMat);
      shrub.scale.set(1.3, 0.75, 1.3);
      shrub.position.set(xJitter, 1.74 + rBase * 0.55, pz);
      shrub.castShadow = true;
      medGroup.add(shrub);

      // Lobe Semak Tambahan
      const subR = rBase * 0.7;
      const subShrub = new THREE.Mesh(new THREE.SphereGeometry(subR, 6, 5), fMat2);
      subShrub.scale.set(1.2, 0.6, 1.2);
      subShrub.position.set(-xJitter * 0.7, 1.74 + subR * 0.5, pz + 0.9);
      subShrub.castShadow = true;
      medGroup.add(subShrub);

      // Pohon Median Kecil Berdaun Lebat setiap ~11m (Bebas dari Tiang Lampu)
      const nearLamp = opts.lampZ && opts.lampZ.some(lz => Math.abs(pz - lz) < 4.0);
      if (!nearLamp && Math.round(pz) % 11 < 2) {
        const tTrunk = new THREE.Mesh(new THREE.CylinderGeometry(0.08, 0.12, 1.8, 6), buildingDarkTrimMat);
        tTrunk.position.set(seed * 0.25, 1.74 + 0.9, pz);
        medGroup.add(tTrunk);

        const tCrown = new THREE.Mesh(new THREE.SphereGeometry(1.35, 7, 6), fMat);
        tCrown.scale.set(1.15, 0.85, 1.15);
        tCrown.position.set(seed * 0.25, 1.74 + 2.3, pz);
        tCrown.castShadow = true;
        medGroup.add(tCrown);
      }
    }

    // Tiang Lampu Jalan Ganda (Dual-mast Highway Lighting)
    if (opts.lampZ && Array.isArray(opts.lampZ)) {
      opts.lampZ.forEach(lz => {
        const pole = new THREE.Mesh(new THREE.CylinderGeometry(0.08, 0.12, 7.5, 8), steelMat);
        pole.position.set(0, 1.74 + 3.75, lz);
        pole.castShadow = true;
        medGroup.add(pole);

        [-1.2, 1.2].forEach(armX => {
          const arm = new THREE.Mesh(new THREE.CylinderGeometry(0.04, 0.04, 1.6, 6), steelMat);
          arm.rotation.z = armX > 0 ? -Math.PI / 4 : Math.PI / 4;
          arm.position.set(armX * 0.5, 1.74 + 7.2, lz);
          medGroup.add(arm);

          const fixture = new THREE.Mesh(new THREE.BoxGeometry(0.35, 0.12, 0.2), lampGlowMat);
          fixture.position.set(armX, 1.74 + 7.6, lz);
          medGroup.add(fixture);
        });
      });
    }

    roadSegmentGroup.add(medGroup);
    return medGroup;
  };

  // 1. Median 1: Pasca Jembatan (Z: 656 s/d 675 - Dikembalikan ke panjang semula)
  createDetailedMedianIsland(656, 675, 2.6, { density: 2.2, lampZ: [658] });

  // 2. Median 2: Segmen Poros Utama Terpanjang (Z: 688 s/d 696 - Diperpendek menjadi hanya 8 meter sesuai permintaan)
  createDetailedMedianIsland(688, 696, 2.6, { density: 2.3, lampZ: [] });

  // 3. Median 3: Pendekatan Gerbang (Z: 806 s/d 868)
  createDetailedMedianIsland(806, 868, 2.6, { density: 2.3, lampZ: [836] });

  // 4. Pembatas Beton Di Bawah Gerbang Pemeriksaan (Z: 868 s/d 906)
  const underGateDivider = new THREE.Mesh(new THREE.BoxGeometry(1.2, 0.85, 38.0), curbConcreteGreyMat);
  underGateDivider.position.set(0.6, 1.74 + 0.3, 887);
  underGateDivider.castShadow = true;
  roadSegmentGroup.add(underGateDivider);

  // 5. Median 4: Pasca Gerbang (Z: 908 s/d 980)
  createDetailedMedianIsland(908, 980, 2.6, { density: 2.3, lampZ: [944] });

  // 6. Median 5: Menuju Lapangan Petikemas (Z: 1005 s/d 1080)
  createDetailedMedianIsland(1005, 1080, 2.6, { density: 2.4, lampZ: [1040] });

  // ----------------------------------------------------------------------------
  // 7. MARKA LAJUR 6-LANE: 3 MASUK & 3 KELUAR (PERSIS FOTO SATELIT)
  // ----------------------------------------------------------------------------
  // A. LAJUR MASUK INBOUND (+X):
  // Melebar dari 2 lajur jembatan ke 3 lajur pulau (Dividers at X = 5.05 & X = 8.85)
  // Garis Pembagi Lajur 1 & 2 (Melengkung dari bridge X = 3.8 ke pulau X = 5.05)
  for (let z = 628; z < 675; z += 9.0) {
    const u = (z - 625) / 50.0;
    const s = u * u * (3 - 2 * u);
    const curX = 3.8 + 1.25 * s;
    const dash = new THREE.Mesh(new THREE.PlaneGeometry(0.2, 3.5), whiteLineMat);
    dash.rotation.x = -Math.PI / 2;
    dash.position.set(curX, 1.637, z + 1.75);
    roadSegmentGroup.add(dash);
  }

  // Garis Pembagi Lajur 2 & 3 (Lajur ketiga baru muncul dari Z = 645, X = 6.2 ke X = 8.85)
  for (let z = 645; z < 675; z += 9.0) {
    const u = (z - 645) / 30.0;
    const s = u * u * (3 - 2 * u);
    const curX = 6.2 + 2.65 * s;
    const dash = new THREE.Mesh(new THREE.PlaneGeometry(0.2, 3.5), whiteLineMat);
    dash.rotation.x = -Math.PI / 2;
    dash.position.set(curX, 1.637, z + 1.75);
    roadSegmentGroup.add(dash);
  }

  // 2 Garis Putus-Putus Pembagi 3 Lajur Masuk di Jalan Utama Pulau (Z: 675 s/d 820)
  [5.05, 8.85].forEach(lx => {
    for (let z = 675; z < 820; z += 9.0) {
      const dash = new THREE.Mesh(new THREE.PlaneGeometry(0.2, 3.5), whiteLineMat);
      dash.rotation.x = -Math.PI / 2;
      dash.position.set(lx, 1.637, z + 1.75);
      roadSegmentGroup.add(dash);
    }
  });

  // Kanalisasi 4 Lajur Menjelang Gerbang (Z: 820 s/d 865.5)
  [5.05, 8.85, 12.65].forEach(lx => {
    // Garis putus-putus transisi
    for (let z = 820; z < 848; z += 9.0) {
      const dash = new THREE.Mesh(new THREE.PlaneGeometry(0.2, 3.5), whiteLineMat);
      dash.rotation.x = -Math.PI / 2;
      dash.position.set(lx, 1.637, z + 1.75);
      roadSegmentGroup.add(dash);
    }
    // Garis solid kanalisasi
    const solidLine = new THREE.Mesh(new THREE.PlaneGeometry(0.22, 17.5), whiteLineMat);
    solidLine.rotation.x = -Math.PI / 2;
    solidLine.position.set(lx, 1.637, 856.75);
    roadSegmentGroup.add(solidLine);
  });

  // Garis Pembagi Pasca Gerbang (Z: 908 s/d 1080)
  [5.05, 8.85, 12.65].forEach(lx => {
    for (let z = 908; z < 1080; z += 9.0) {
      if (z > 975 && z < 1015 && lx === 12.65) continue;
      const dash = new THREE.Mesh(new THREE.PlaneGeometry(0.2, 3.5), whiteLineMat);
      dash.rotation.x = -Math.PI / 2;
      dash.position.set(lx, 1.637, z + 1.75);
      roadSegmentGroup.add(dash);
    }
  });

  // Zebra Cross Penyeberangan Petugas Pemeriksa (Z = 862)
  for (let zx = 2.0; zx <= 16.0; zx += 1.1) {
    const zStripe = new THREE.Mesh(new THREE.PlaneGeometry(0.55, 3.0), whiteLineMat);
    zStripe.rotation.x = -Math.PI / 2;
    zStripe.position.set(zx, 1.638, 862);
    roadSegmentGroup.add(zStripe);
  }

  // Garis Henti Putih Tebal (Stop Bar) di Depan Gerbang (Z = 865.5)
  const stopBar = new THREE.Mesh(new THREE.PlaneGeometry(15.2, 0.75), whiteLineMat);
  stopBar.rotation.x = -Math.PI / 2;
  stopBar.position.set(8.9, 1.638, 865.5);
  roadSegmentGroup.add(stopBar);

  // Garis Kuning Tepi Luar Inbound
  const inOuterLine = new THREE.Mesh(new THREE.PlaneGeometry(0.22, 145), yellowLineMat);
  inOuterLine.rotation.x = -Math.PI / 2;
  inOuterLine.position.set(12.7, 1.637, 747.5);
  roadSegmentGroup.add(inOuterLine);

  // B. LAJUR KELUAR OUTBOUND (-X):
  // 3 Lajur Keluar di Jalan Utama Pulau (Dividers at X = -5.05 & X = -8.85, Z: 675 s/d 1080)
  [-5.05, -8.85].forEach(lx => {
    for (let z = 675; z < 1080; z += 9.0) {
      const dash = new THREE.Mesh(new THREE.PlaneGeometry(0.2, 3.5), whiteLineMat);
      dash.rotation.x = -Math.PI / 2;
      dash.position.set(lx, 1.637, z + 1.75);
      roadSegmentGroup.add(dash);
    }
  });

  // Transisi Merge 3 Lajur ke 2 Lajur Menuju Jembatan (Z in [630, 675]):
  // Garis Pembagi Lajur 1 & 2 (Melengkung dari pulau X = -5.05 ke bridge X = -3.8)
  for (let z = 630; z < 675; z += 9.0) {
    const u = (z - 625) / 50.0;
    const s = u * u * (3 - 2 * u);
    const curX = -3.8 - 1.25 * s;
    const dash = new THREE.Mesh(new THREE.PlaneGeometry(0.2, 3.5), whiteLineMat);
    dash.rotation.x = -Math.PI / 2;
    dash.position.set(curX, 1.637, z + 1.75);
    roadSegmentGroup.add(dash);
  }

  // Garis Pembagi Lajur 2 & 3 di Flare (Z in [650, 675])
  for (let z = 650; z < 675; z += 9.0) {
    const dash = new THREE.Mesh(new THREE.PlaneGeometry(0.2, 3.5), whiteLineMat);
    dash.rotation.x = -Math.PI / 2;
    dash.position.set(-8.85, 1.637, z + 1.75);
    roadSegmentGroup.add(dash);
  }

  // Garis Merge Diagonal Menutup Lajur 3 ke Lajur 2 (Z in [640, 665])
  for (let k = 0; k < 4; k++) {
    const mz = 642 + k * 5.8;
    const mx = -8.85 - (665 - mz) * 0.16;
    const mergeDash = new THREE.Mesh(new THREE.PlaneGeometry(0.2, 3.2), whiteLineMat);
    mergeDash.rotation.x = -Math.PI / 2;
    mergeDash.rotation.z = -0.16;
    mergeDash.position.set(mx, 1.637, mz);
    roadSegmentGroup.add(mergeDash);
  }

  // Garis Kuning Tepi Luar Outbound (-X di X = -12.7)
  const outOuterLine = new THREE.Mesh(new THREE.PlaneGeometry(0.22, 475), yellowLineMat);
  outOuterLine.rotation.x = -Math.PI / 2;
  outOuterLine.position.set(-12.7, 1.637, 912.5);
  roadSegmentGroup.add(outOuterLine);

  // ----------------------------------------------------------------------------
  // 8. BAHU JALAN UTARA (+X): LAYBY PARKIR TRUK MERAH (PERSIS FOTO SATELIT)
  // Di foto satelit terlihat bahu jalan kiri transisi memiliki perkerasan kemerahan
  // tempat terparkir truk trailer kontainer merah dan sasis
  // ----------------------------------------------------------------------------
  // Pelataran Parkir Beraspal Kemerahan (Layby: Z in [640, 690], X in [12.7, 18.2])
  const northLaybyPad = new THREE.Mesh(new THREE.PlaneGeometry(5.5, 50.0), redShoulderAsphaltMat);
  northLaybyPad.rotation.x = -Math.PI / 2;
  northLaybyPad.position.set(15.45, 1.633, 665);
  northLaybyPad.receiveShadow = true;
  roadSegmentGroup.add(northLaybyPad);

  // Kanstin Luar Pembatas Layby
  const laybyCurb = new THREE.Mesh(new THREE.BoxGeometry(0.3, 0.22, 50.0), curbConcreteGreyMat);
  laybyCurb.position.set(18.3, 1.74, 665);
  roadSegmentGroup.add(laybyCurb);

  // Helper Pembuat Truk Port Detail Rendah Memori
  const addCorridorTruck = (x, z, rotY, cabColorHex, contColorHex, isChassisOnly = false) => {
    const truck = new THREE.Group();
    truck.position.set(x, 1.633, z);
    truck.rotation.y = rotY;

    // Kabin Truk
    const cabMat = new THREE.MeshStandardMaterial({ color: cabColorHex, roughness: 0.4 });
    const cab = new THREE.Mesh(new THREE.BoxGeometry(2.4, 3.0, 2.8), cabMat);
    cab.position.set(0, 1.5, 4.8);
    cab.castShadow = true;
    truck.add(cab);

    const win = new THREE.Mesh(new THREE.PlaneGeometry(2.1, 0.9), glassWindowMat);
    win.position.set(0, 1.95, 6.22);
    truck.add(win);

    // Sasis Trailer Baja Hitam
    const chMat = new THREE.MeshStandardMaterial({ color: 0x1e293b, roughness: 0.8 });
    const ch = new THREE.Mesh(new THREE.BoxGeometry(2.4, 0.5, 12.2), chMat);
    ch.position.set(0, 0.8, -1.8);
    ch.castShadow = true;
    truck.add(ch);

    // Roda Ban
    [-1.15, 1.15].forEach(wx => {
      [4.8, 3.6, -5.8, -7.0].forEach(wz => {
        const wh = new THREE.Mesh(new THREE.CylinderGeometry(0.46, 0.46, 0.32, 8), curbHazardBlackMat);
        wh.rotation.z = Math.PI / 2;
        wh.position.set(wx, 0.46, wz);
        truck.add(wh);
      });
    });

    // Kontainer Muatan (Jika bukan sasis kosong)
    if (!isChassisOnly && contColorHex !== null) {
      const contMat = new THREE.MeshStandardMaterial({ color: contColorHex, roughness: 0.55, metalness: 0.1 });
      const cont = new THREE.Mesh(new THREE.BoxGeometry(2.4, 2.59, 12.19), contMat);
      cont.position.set(0, 2.35, -1.8);
      cont.castShadow = true;
      truck.add(cont);
    }

    roadSegmentGroup.add(truck);
  };

  // Truk Beroperasi / Mengantre di 3 Lajur Jalan (Tertata Rapi di Dalam Batas Lajur):
  // Truk Tangki/Oranye di Lajur 2 (X = 7.0, Z = 680)
  addCorridorTruck(7.0, 680, 0, 0xd97706, 0x0284c7, false);
  // Truk Kontainer Merah/Abu di Lajur 3 (X = 10.8, Z = 712)
  addCorridorTruck(10.8, 712, 0, 0xdc2626, 0x475569, false);

  // ----------------------------------------------------------------------------
  // 9. BAHU JALAN SELATAN (-X): TANGGUL BETON & SABUK HIJAU RIMBUN SATELIT
  // Sepanjang sisi outbound (-X: X in [-13.0, -18.0], Z in [630, 1080])
  // terdapat sabuk hijau pepohonan pantai yang sangat padat dan asri
  // ----------------------------------------------------------------------------
  const southWallMat = new THREE.MeshStandardMaterial({ color: 0x8a929a, roughness: 0.85 });
  const southPerimeterWall = new THREE.Mesh(new THREE.BoxGeometry(0.35, 0.9, 450.0), southWallMat);
  southPerimeterWall.position.set(-13.4, 1.74 + 0.35, 855);
  southPerimeterWall.castShadow = true;
  roadSegmentGroup.add(southPerimeterWall);

  // Sabuk Pohon & Hutan Mangrove Pantai Padat Sisi Selatan (Persis Foto Satelit)
  const treeCanopyColors = [0x1e361b, 0x244220, 0x2d5027, 0x183015, 0x345a2e];
  for (let z = 630; z <= 1076; z += 5.5) {
    const seed = Math.sin(z * 4.56);
    // 2 Baris Pohon (Baris Depan Dekat Tanggul & Baris Belakang Rimbun)
    [-14.8 + seed * 0.4, -17.6 - Math.abs(seed) * 0.6].forEach((treeX, rowIdx) => {
      const treeH = 4.2 + Math.abs(seed) * 1.6 + rowIdx * 0.8;
      const canopyR = 1.9 + Math.abs(seed) * 0.6 + rowIdx * 0.3;
      const cColor = treeCanopyColors[(Math.floor(Math.abs(seed * 7)) + rowIdx) % treeCanopyColors.length];

      const treeGroup = new THREE.Group();
      treeGroup.position.set(treeX, 1.63, z + (rowIdx === 1 ? 2.5 : 0));

      // Batang Pohon
      const trunk = new THREE.Mesh(new THREE.CylinderGeometry(0.14, 0.24, treeH * 0.5, 6), buildingDarkTrimMat);
      trunk.position.set(0, treeH * 0.25, 0);
      trunk.castShadow = true;
      treeGroup.add(trunk);

      // Tajuk Daun Rimbun
      const foliageMat = new THREE.MeshStandardMaterial({ color: cColor, roughness: 0.82 });
      const canopy1 = new THREE.Mesh(new THREE.SphereGeometry(canopyR, 7, 6), foliageMat);
      canopy1.scale.set(1.2, 0.82, 1.2);
      canopy1.position.set(0, treeH * 0.65, 0);
      canopy1.castShadow = true;
      treeGroup.add(canopy1);

      const canopy2 = new THREE.Mesh(new THREE.SphereGeometry(canopyR * 0.72, 6, 5), foliageMat);
      canopy2.position.set(seed * 0.45, treeH * 0.84, -seed * 0.35);
      canopy2.castShadow = true;
      treeGroup.add(canopy2);

      // Semak Rendah di Bawah Pohon
      const shrub = new THREE.Mesh(new THREE.SphereGeometry(0.95, 6, 5), foliageMat);
      shrub.scale.set(1.3, 0.55, 1.3);
      shrub.position.set(-seed * 0.5, 0.45, seed * 0.4);
      treeGroup.add(shrub);

      roadSegmentGroup.add(treeGroup);
    });

    // Lampu Jalan Tepi Selatan Setiap ~28.5m
    if (Math.round(z) % 28 < 10) {
      const sLamp = new THREE.Mesh(new THREE.CylinderGeometry(0.08, 0.12, 7.5, 8), steelMat);
      sLamp.position.set(-13.6, 1.74 + 3.75, z);
      sLamp.castShadow = true;
      roadSegmentGroup.add(sLamp);

      const sArm = new THREE.Mesh(new THREE.CylinderGeometry(0.04, 0.04, 1.4, 6), steelMat);
      sArm.rotation.z = Math.PI / 4;
      sArm.position.set(-13.0, 1.74 + 7.2, z);
      roadSegmentGroup.add(sArm);

      const sFix = new THREE.Mesh(new THREE.BoxGeometry(0.35, 0.12, 0.2), lampGlowMat);
      sFix.position.set(-12.4, 1.74 + 7.6, z);
      roadSegmentGroup.add(sFix);
    }
  }

  // 10. Percabangan Jalan Akses Kantor & Pulau Taman Segitiga
  const branchRoadGeo = new THREE.BufferGeometry();
  const branchRoadPos = [];
  const branchRoadNorm = [];
  const bSteps = 16;
  for (let i = 0; i < bSteps; i++) {
    const t1 = i / bSteps;
    const t2 = (i + 1) / bSteps;
    const z1 = 672 + t1 * 54;
    const z2 = 672 + t2 * 54;
    const xIn1 = -13.0 - t1 * 14.5;
    const xIn2 = -13.0 - t2 * 14.5;
    const xOut1 = xIn1 - 8.5;
    const xOut2 = xIn2 - 8.5;
    const y = 1.63;

    branchRoadPos.push(
      xOut1, y, z1, xIn2, y, z2, xIn1, y, z1,
      xOut1, y, z1, xOut2, y, z2, xIn2, y, z2
    );
    for (let k = 0; k < 6; k++) branchRoadNorm.push(0, 1, 0);
  }
  branchRoadGeo.setAttribute('position', new THREE.Float32BufferAttribute(branchRoadPos, 3));
  branchRoadGeo.setAttribute('normal', new THREE.Float32BufferAttribute(branchRoadNorm, 3));
  const branchRoadMesh = new THREE.Mesh(branchRoadGeo, portRoadPavementMat);
  branchRoadMesh.receiveShadow = true;
  roadSegmentGroup.add(branchRoadMesh);

  // Pulau Taman Segitiga (Triangular Green Traffic Island)
  const triangleIslandGroup = new THREE.Group();
  triangleIslandGroup.position.set(0, 1.63, 0);

  const triCurbPoints = [
    new THREE.Vector3(-13.4, 0.11, 674),
    new THREE.Vector3(-13.4, 0.11, 724),
    new THREE.Vector3(-27.4, 0.11, 722),
    new THREE.Vector3(-13.4, 0.11, 674)
  ];
  for (let k = 0; k < 3; k++) {
    const pA = triCurbPoints[k];
    const pB = triCurbPoints[k + 1];
    const segLen = pA.distanceTo(pB);
    const subSegs = Math.floor(segLen / 1.8);
    for (let m = 0; m < subSegs; m++) {
      const tA = m / subSegs;
      const tB = (m + 1) / subSegs;
      const mid = new THREE.Vector3().lerpVectors(pA, pB, (tA + tB) / 2);
      const angle = Math.atan2(pB.x - pA.x, pB.z - pA.z);
      const isW = m % 2 === 0;
      const curbPiece = new THREE.Mesh(
        new THREE.BoxGeometry(0.24, 0.22, (segLen / subSegs) * 1.02),
        isW ? curbHazardWhiteMat : curbHazardBlackMat
      );
      curbPiece.position.copy(mid);
      curbPiece.rotation.y = angle;
      curbPiece.castShadow = true;
      triangleIslandGroup.add(curbPiece);
    }
  }

  addPalmTree(triangleIslandGroup, -18.0, 0.22, 712, 1.2);
  addPalmTree(triangleIslandGroup, -22.0, 0.22, 718, 1.0);
  const triBush1 = new THREE.Mesh(new THREE.SphereGeometry(0.9, 7, 6), bushGreenMat);
  triBush1.scale.set(1.2, 0.65, 1.2);
  triBush1.position.set(-16.5, 0.65, 695);
  triangleIslandGroup.add(triBush1);

  roadSegmentGroup.add(triangleIslandGroup);

  // 11. Pos Pre-Check / Timbangan di Bahu Jalan Inbound (+X: Z = 650)
  const preCheckGroup = new THREE.Group();
  preCheckGroup.position.set(20.5, 1.63, 650);

  const pcBooth = new THREE.Mesh(new THREE.BoxGeometry(2.6, 3.0, 4.5), buildingWallMat);
  pcBooth.position.set(0, 1.5, 0);
  pcBooth.castShadow = true;
  preCheckGroup.add(pcBooth);

  const pcRoof = new THREE.Mesh(new THREE.BoxGeometry(3.4, 0.25, 5.5), buildingDarkTrimMat);
  pcRoof.position.set(0, 3.1, 0);
  preCheckGroup.add(pcRoof);

  const pcWin = new THREE.Mesh(new THREE.BoxGeometry(2.65, 1.1, 3.2), glassWindowMat);
  pcWin.position.set(0, 1.8, 0);
  preCheckGroup.add(pcWin);

  roadSegmentGroup.add(preCheckGroup);

  // 12. Rangka Portal Gantry OCR Overhead (Z = 718 & Z = 818)
  const addGantryPortal = (pz, titleText) => {
    const gantry = new THREE.Group();
    gantry.position.set(7.0, 1.63, pz);

    [-7.0, 7.0].forEach(px => {
      const gPost = new THREE.Mesh(new THREE.CylinderGeometry(0.2, 0.25, 6.6, 8), gantryTrussMat);
      gPost.position.set(px, 3.3, 0);
      gPost.castShadow = true;
      gantry.add(gPost);
    });

    const gBeam = new THREE.Mesh(new THREE.BoxGeometry(14.6, 0.9, 0.7), gantryTrussMat);
    gBeam.position.set(0, 6.2, 0);
    gBeam.castShadow = true;
    gantry.add(gBeam);

    const vmsCanvas = document.createElement('canvas');
    vmsCanvas.width = 1024;
    vmsCanvas.height = 128;
    const vctx = vmsCanvas.getContext('2d');
    vctx.fillStyle = '#0369a1';
    vctx.fillRect(0, 0, 1024, 128);
    vctx.fillStyle = '#ffffff';
    vctx.font = 'bold 36px Arial, sans-serif';
    vctx.textAlign = 'center';
    vctx.fillText(titleText, 512, 78);

    const vmsTex = new THREE.CanvasTexture(vmsCanvas);
    const vmsSign = new THREE.Mesh(
      new THREE.PlaneGeometry(12.5, 1.0),
      new THREE.MeshBasicMaterial({ map: vmsTex, side: THREE.DoubleSide })
    );
    vmsSign.position.set(0, 6.2, -0.4);
    gantry.add(vmsSign);

    [-5, -2, 2, 5].forEach(cx => {
      const cam = new THREE.Mesh(new THREE.BoxGeometry(0.35, 0.25, 0.45), buildingDarkTrimMat);
      cam.position.set(cx, 5.4, -0.3);
      gantry.add(cam);
    });

    roadSegmentGroup.add(gantry);
  };

  addGantryPortal(718, 'TERMINAL TELUK LAMONG ● LAJUR 1: MOBIL | LAJUR 2-3: TRUK PETIKEMAS');
  addGantryPortal(818, 'PERSIAPKAN DOKUMEN & E-TICKET ● MAIN GATE CHECKPOINT 60M');

  islandGroup.add(roadSegmentGroup);

  // ============================================================================
  // E. REMODEL TOTAL PULAU 1 SESUAI CITRA FOTO SATELIT ASLI
  // Mengintegrasikan 6 Zona Utama:
  // 1. Semenanjung Selatan (-X): Graha Pelindo, Lapangan Olahraga, Masjid Kubah Bundar, Parkir Mobil
  // 2. Main Road Gate: Kanopi Lengkung Setengah Silinder (Barrel-Vault Canopy) Inbound
  // 3. Kawasan Utilitas Barat Laut (+X): 3 Baris Shed Solar, Gedung Ops, Basin Air, Gardu Listrik
  // 4. Container Storage Depot (+X): Susunan Blok Kontainer Multi-Tier Berwarna Pelayaran Asli
  // 5. Bus & Vehicle Staging (+X): Marka Putar (Circular Turning Loop), Armada 16 Bus, Chassis Rack
  // 6. Tanggul & Sabuk Hijau Perimeter: Mangrove & Cemara Laut Rimbun Keliling Pulau
  // ============================================================================

  // ----------------------------------------------------------------------------
  // 1. MATERIAL & TEKSTUR KHUSUS PULAU 1 SESUAI SATELIT
  // ----------------------------------------------------------------------------
  const massingWhiteMat = new THREE.MeshStandardMaterial({ color: 0xf8fafc, roughness: 0.45, metalness: 0.05 });
  const massingRoofMat = new THREE.MeshStandardMaterial({ color: 0xe2e8f0, roughness: 0.65, metalness: 0.05 });
  const massingDarkSlateMat = new THREE.MeshStandardMaterial({ color: 0x1e293b, roughness: 0.7, metalness: 0.2 });
  const massingWarehouseMat = new THREE.MeshStandardMaterial({ color: 0xcbd5e1, roughness: 0.6, metalness: 0.05 });
  const massingGlassAquaMat = new THREE.MeshStandardMaterial({
    color: 0x0284c7,
    roughness: 0.1,
    metalness: 0.85,
    transparent: true,
    opacity: 0.85
  });
  const goldFinialMat = new THREE.MeshStandardMaterial({ color: 0xf59e0b, metalness: 0.9, roughness: 0.2 });

  // Pavement & Ground Surfaces
  const officePavementMat = new THREE.MeshStandardMaterial({ color: 0xdde2e8, roughness: 0.9 });
  const officeLawnMat = new THREE.MeshStandardMaterial({ color: 0x3b7a36, roughness: 0.85 });
  const parkingAsphaltMat = new THREE.MeshStandardMaterial({ color: 0x23272e, roughness: 0.92 });
  const cyAsphaltMat = new THREE.MeshStandardMaterial({ color: 0x2b2f38, roughness: 0.9 });
  const stagingAsphaltMat = new THREE.MeshStandardMaterial({ color: 0x30353e, roughness: 0.9 });

  // Sports Court Materials
  const courtPlayingGreenMat = new THREE.MeshStandardMaterial({ color: 0x15803d, roughness: 0.65 });
  const courtApronTerracottaMat = new THREE.MeshStandardMaterial({ color: 0xc2410c, roughness: 0.7 });

  // Container Colors (Sesuai Foto Satelit: CMA CGM, ONE, Evergreen, Hapag, Maersk, MSC, Reefer)
  const contBlueMat = new THREE.MeshStandardMaterial({ color: 0x0284c7, roughness: 0.55, metalness: 0.15 });
  const contRedMat = new THREE.MeshStandardMaterial({ color: 0xdc2626, roughness: 0.55, metalness: 0.15 });
  const contOrangeMat = new THREE.MeshStandardMaterial({ color: 0xea580c, roughness: 0.55, metalness: 0.15 });
  const contGreenMat = new THREE.MeshStandardMaterial({ color: 0x16a34a, roughness: 0.55, metalness: 0.15 });
  const contMaerskMat = new THREE.MeshStandardMaterial({ color: 0x38bdf8, roughness: 0.55, metalness: 0.15 });
  const contYellowMat = new THREE.MeshStandardMaterial({ color: 0xca8a04, roughness: 0.55, metalness: 0.15 });
  const contReeferMat = new THREE.MeshStandardMaterial({ color: 0xf8fafc, roughness: 0.45, metalness: 0.1 });
  const contSlateMat = new THREE.MeshStandardMaterial({ color: 0x475569, roughness: 0.6, metalness: 0.15 });

  // Edge & Line Materials
  const edgeSlateMat = new THREE.LineBasicMaterial({ color: 0x475569, linewidth: 1 });
  const edgeContDarkMat = new THREE.LineBasicMaterial({ color: 0x1e293b, linewidth: 1 });

  // Vehicle Materials
  const wheelBlackMat = new THREE.MeshStandardMaterial({ color: 0x0f172a, roughness: 0.9 });
  const vehicleWindowMat = new THREE.MeshStandardMaterial({ color: 0x0369a1, roughness: 0.2, metalness: 0.8 });

  // 4 Natural Foliage Shades for Trees
  const foliageMats = [
    new THREE.MeshStandardMaterial({ color: 0x1e3a1e, roughness: 0.85 }), // Deep Mangrove
    new THREE.MeshStandardMaterial({ color: 0x2d5e30, roughness: 0.8 }),  // Forest Green
    new THREE.MeshStandardMaterial({ color: 0x3c7a3f, roughness: 0.75 }), // Fresh Coastal Green
    new THREE.MeshStandardMaterial({ color: 0x4d7c38, roughness: 0.75 })  // Olive Canopy
  ];
  const treeWoodMat = new THREE.MeshStandardMaterial({ color: 0x5c3a21, roughness: 0.9 });

  // ----------------------------------------------------------------------------
  // 2. HELPER FUNCTIONS UNTUK PEMODELAN EFISIEN & PRESISI
  // ----------------------------------------------------------------------------
  const createMassingBuilding = (w, h, l, x, z, yOffset = 0, mat = massingWhiteMat, edgeMat = edgeSlateMat, rotY = 0) => {
    const bGroup = new THREE.Group();
    bGroup.position.set(x, yOffset + h / 2, z);
    if (rotY !== 0) bGroup.rotation.y = rotY;
    const geo = new THREE.BoxGeometry(w, h, l);
    const mesh = new THREE.Mesh(geo, mat);
    mesh.castShadow = true;
    mesh.receiveShadow = true;
    bGroup.add(mesh);
    const edgeLines = new THREE.LineSegments(new THREE.EdgesGeometry(geo), edgeMat);
    bGroup.add(edgeLines);
    return bGroup;
  };

  const trunkCylGeo = new THREE.CylinderGeometry(0.2, 0.32, 1.4, 6);
  trunkCylGeo.translate(0, 0.7, 0);

  const addSatelliteTree = (parent, x, z, r = 2.4, toneIdx = 0, yLevel = 0) => {
    const tree = new THREE.Group();
    tree.position.set(x, yLevel, z);

    // Batang pohon proporsional
    const tH = 1.4 + r * 0.45;
    const trunk = new THREE.Mesh(new THREE.CylinderGeometry(0.16, 0.28, tH, 6), treeWoodMat);
    trunk.position.set(0, tH / 2, 0);
    trunk.castShadow = true;
    tree.add(trunk);

    const fMat = foliageMats[toneIdx % foliageMats.length];
    const fMatSec = foliageMats[(toneIdx + 1) % foliageMats.length];

    // Tajuk Utama (Main Canopy)
    const canopy1 = new THREE.Mesh(new THREE.SphereGeometry(r, 7, 6), fMat);
    canopy1.scale.set(1.15, 0.82, 1.15);
    canopy1.position.set(0, tH * 0.78 + r * 0.65, 0);
    canopy1.castShadow = true;
    tree.add(canopy1);

    // Tajuk Sekunder Bergeser (Secondary Organic Lobe)
    const seed = Math.sin(x * 12.34 + z * 7.65);
    const subR = r * 0.68;
    const canopy2 = new THREE.Mesh(new THREE.SphereGeometry(subR, 6, 5), fMatSec);
    canopy2.position.set(seed * r * 0.35, tH * 0.78 + r * 0.88, -seed * r * 0.3);
    canopy2.castShadow = true;
    tree.add(canopy2);

    // Semak Dasar di Bawah Pohon (Understory Shrub)
    const baseShrub = new THREE.Mesh(new THREE.SphereGeometry(r * 0.52, 6, 5), fMat);
    baseShrub.scale.set(1.25, 0.5, 1.25);
    baseShrub.position.set(-seed * 0.4, 0.32, seed * 0.4);
    tree.add(baseShrub);

    parent.add(tree);
  };

  const addBushCluster = (parent, x, z, r = 1.2, toneIdx = 0, yLevel = 0) => {
    const bush = new THREE.Group();
    bush.position.set(x, yLevel, z);
    const fMat = foliageMats[toneIdx % foliageMats.length];
    const fMat2 = foliageMats[(toneIdx + 2) % foliageMats.length];

    const b1 = new THREE.Mesh(new THREE.SphereGeometry(r, 6, 5), fMat);
    b1.scale.set(1.28, 0.62, 1.28);
    b1.position.set(0, r * 0.38, 0);
    b1.castShadow = true;
    bush.add(b1);

    const b2 = new THREE.Mesh(new THREE.SphereGeometry(r * 0.72, 6, 4), fMat2);
    b2.scale.set(1.15, 0.55, 1.15);
    b2.position.set(r * 0.4, r * 0.32, -r * 0.32);
    bush.add(b2);

    parent.add(bush);
  };

  const addParkedCar = (parent, x, z, rotY = 0, colorHex = 0xf8fafc) => {
    const car = new THREE.Group();
    car.position.set(x, 0, z);
    car.rotation.y = rotY;

    const body = new THREE.Mesh(
      new THREE.BoxGeometry(1.85, 0.75, 4.1),
      new THREE.MeshStandardMaterial({ color: colorHex, roughness: 0.35, metalness: 0.2 })
    );
    body.position.set(0, 0.55, 0);
    body.castShadow = true;
    car.add(body);

    const cab = new THREE.Mesh(new THREE.BoxGeometry(1.65, 0.65, 2.3), vehicleWindowMat);
    cab.position.set(0, 1.15, -0.2);
    cab.castShadow = true;
    car.add(cab);

    [-0.92, 0.92].forEach(wx => {
      [-1.25, 1.25].forEach(wz => {
        const wh = new THREE.Mesh(new THREE.CylinderGeometry(0.3, 0.3, 0.25, 8), wheelBlackMat);
        wh.rotation.z = Math.PI / 2;
        wh.position.set(wx, 0.3, wz);
        car.add(wh);
      });
    });
    parent.add(car);
  };

  const addShuttleBus = (parent, x, z, rotY = 0, bodyHex = 0x1e293b, roofHex = 0xf8fafc) => {
    const bus = new THREE.Group();
    bus.position.set(x, 0, z);
    bus.rotation.y = rotY;

    const bMesh = new THREE.Mesh(
      new THREE.BoxGeometry(2.5, 2.3, 9.4),
      new THREE.MeshStandardMaterial({ color: bodyHex, roughness: 0.4, metalness: 0.1 })
    );
    bMesh.position.set(0, 1.5, 0);
    bMesh.castShadow = true;
    bus.add(bMesh);

    const rMesh = new THREE.Mesh(new THREE.BoxGeometry(2.45, 0.4, 9.2), new THREE.MeshStandardMaterial({ color: roofHex, roughness: 0.5 }));
    rMesh.position.set(0, 2.75, 0);
    rMesh.castShadow = true;
    bus.add(rMesh);

    const ac = new THREE.Mesh(new THREE.BoxGeometry(1.4, 0.3, 2.4), massingRoofMat);
    ac.position.set(0, 3.05, 0);
    bus.add(ac);

    const win = new THREE.Mesh(new THREE.BoxGeometry(2.54, 0.85, 8.6), vehicleWindowMat);
    win.position.set(0, 1.85, 0.1);
    bus.add(win);

    [-1.25, 1.25].forEach(wx => {
      [-2.8, 2.8].forEach(wz => {
        const wh = new THREE.Mesh(new THREE.CylinderGeometry(0.44, 0.44, 0.3, 10), wheelBlackMat);
        wh.rotation.z = Math.PI / 2;
        wh.position.set(wx, 0.44, wz);
        bus.add(wh);
      });
    });
    parent.add(bus);
  };

  const addContainerBlock = (parent, w, h, l, x, z, mat, rotY = 0) => {
    const cGroup = new THREE.Group();
    cGroup.position.set(x, h / 2, z);
    if (rotY !== 0) cGroup.rotation.y = rotY;

    const geo = new THREE.BoxGeometry(w, h, l);
    const mesh = new THREE.Mesh(geo, mat);
    mesh.castShadow = true;
    mesh.receiveShadow = true;
    cGroup.add(mesh);

    const edge = new THREE.LineSegments(new THREE.EdgesGeometry(geo), edgeContDarkMat);
    cGroup.add(edge);
    parent.add(cGroup);
  };

  const addHighMastTower = (parent, x, z, h = 22) => {
    const tower = new THREE.Group();
    tower.position.set(x, 0, z);

    const mastGeo = new THREE.CylinderGeometry(0.25, 0.55, h, 8);
    const mast = new THREE.Mesh(mastGeo, steelMat);
    mast.position.set(0, h / 2, 0);
    mast.castShadow = true;
    tower.add(mast);

    const ring = new THREE.Mesh(new THREE.CylinderGeometry(1.6, 1.6, 0.25, 12), steelMat);
    ring.position.set(0, h - 0.5, 0);
    tower.add(ring);

    for (let i = 0; i < 6; i++) {
      const ang = (i / 6) * Math.PI * 2;
      const fix = new THREE.Mesh(new THREE.BoxGeometry(0.35, 0.25, 0.45), lampGlowMat);
      fix.position.set(Math.cos(ang) * 1.4, h - 0.2, Math.sin(ang) * 1.4);
      fix.rotation.y = -ang;
      tower.add(fix);
    }
    parent.add(tower);
  };

  // ============================================================================
  // 3. ZONA SELATAN (-X): KOMPLEKS GRAHA PELINDO, MASJID, LAPANGAN & PARKIR
  // VERSI DETAIL TINGGI 100% PRESISI SESUAI 5 FOTO SATELIT HISTORIS
  // ============================================================================
  const southComplex = new THREE.Group();
  southComplex.position.set(0, 1.63, 0);

  // ----------------------------------------------------------------------------
  // A. MATERIAL TAMBAHAN KHUSUS DETAIL HEAD OFFICE & JARINGAN JALAN
  // ----------------------------------------------------------------------------
  const terracottaRoofTrimMat = new THREE.MeshStandardMaterial({
    color: 0xc2410c, // Terracotta / burnt orange arch trim seen in photos 1, 2, 4, 5
    roughness: 0.45,
    metalness: 0.15
  });
  const tensileMembraneMat = new THREE.MeshStandardMaterial({
    color: 0xffffff, // Pure white tensile fabric canopy
    roughness: 0.3,
    metalness: 0.05,
    side: THREE.DoubleSide
  });
  const plazaPavingMat = new THREE.MeshStandardMaterial({
    color: 0xd8dde2, // Ornamental drop-off forecourt paving
    roughness: 0.8
  });
  const courtPlayingGreenMat2 = new THREE.MeshStandardMaterial({
    color: 0x2e7d32, // Deep sports green
    roughness: 0.65
  });
  const courtTerracottaMat2 = new THREE.MeshStandardMaterial({
    color: 0xc2410c, // Vibrant terracotta court keys and apron
    roughness: 0.7
  });
  const fenceWireMat2 = new THREE.MeshStandardMaterial({
    color: 0x334155,
    roughness: 0.5,
    wireframe: true
  });
  const chillerGridMat = new THREE.MeshStandardMaterial({
    color: 0x1e293b,
    roughness: 0.6,
    metalness: 0.7
  });
  const campusRoadMat = new THREE.MeshStandardMaterial({
    color: 0x3a4046, // Dark grey port asphalt matching Satellite Photos 1 & 2
    roughness: 0.85,
    metalness: 0.05
  });
  const curbConcreteMat = new THREE.MeshStandardMaterial({
    color: 0xd4d8dc, // Light grey concrete curbstone
    roughness: 0.65,
    metalness: 0.05
  });
  const sidewalkPaverMat = new THREE.MeshStandardMaterial({
    color: 0xc6cbd0, // Pedestrian sidewalk pavers
    roughness: 0.8
  });
  const pondWaterMat = new THREE.MeshStandardMaterial({
    color: 0x264239, // Natural calm teal-green pond water
    roughness: 0.15,
    metalness: 0.3
  });
  const yellowHatchMat = new THREE.MeshStandardMaterial({
    color: 0xfacc15,
    roughness: 0.4
  });
  const tactilePavingMat = new THREE.MeshStandardMaterial({
    color: 0xeab308,
    roughness: 0.5
  });

  // ----------------------------------------------------------------------------
  // B. DASAR TANAH ALAMI & JALUR INSPEKSI TANGGUL PERIMETER
  // ----------------------------------------------------------------------------
  const southSoilMat = new THREE.MeshStandardMaterial({ color: 0x767061, roughness: 0.95 });
  const southSoil = new THREE.Mesh(new THREE.PlaneGeometry(184, 144), southSoilMat);
  southSoil.rotation.x = -Math.PI / 2;
  southSoil.position.set(-109, 0.002, 715);
  southSoil.receiveShadow = true;
  southComplex.add(southSoil);

  // Jalur Inspeksi Tanggul Perimeter (Dirt/Gravel Service Track along Seawall)
  const trackMat = new THREE.MeshStandardMaterial({ color: 0x8a8475, roughness: 0.95 });
  const addPerimeterTrack = (x, z, w, l) => {
    const trk = new THREE.Mesh(new THREE.PlaneGeometry(w, l), trackMat);
    trk.rotation.x = -Math.PI / 2;
    trk.position.set(x, 0.004, z);
    trk.receiveShadow = true;
    southComplex.add(trk);
  };
  addPerimeterTrack(-115, 646, 178, 6); // Jalur barat
  addPerimeterTrack(-198, 715, 6, 140); // Jalur selatan
  addPerimeterTrack(-115, 784, 178, 6); // Jalur timur

  // ----------------------------------------------------------------------------
  // HELPER GEOMETRI KANSTIN, TAMAN & JALAN
  // ----------------------------------------------------------------------------
  // Helper Kanstin Beton Fisik 3D Lurus
  const addCurbBlock = (x, z, lenX, lenZ, mat = curbConcreteMat) => {
    const curb = new THREE.Mesh(new THREE.BoxGeometry(lenX, 0.16, lenZ), mat);
    curb.position.set(x, 0.08, z);
    curb.castShadow = true;
    curb.receiveShadow = true;
    southComplex.add(curb);
    return curb;
  };

  // Helper Kanstin Antar Dua Titik (Garis Lurus Segmen Bebas)
  const addCurbLine = (x1, z1, x2, z2, mat = curbConcreteMat) => {
    const dx = x2 - x1;
    const dz = z2 - z1;
    const len = Math.hypot(dx, dz);
    if (len < 0.1) return;
    const angle = Math.atan2(dx, dz);
    const curb = new THREE.Mesh(new THREE.BoxGeometry(0.26, 0.16, len), mat);
    curb.position.set((x1 + x2) / 2, 0.08, (z1 + z2) / 2);
    curb.rotation.y = angle;
    curb.castShadow = true;
    southComplex.add(curb);
    return curb;
  };

  // Helper Taman Rumput Hijau Berkanstin
  const addLawnWithCurb = (x, z, w, l) => {
    const lawn = new THREE.Mesh(new THREE.PlaneGeometry(w, l), officeLawnMat);
    lawn.rotation.x = -Math.PI / 2;
    lawn.position.set(x, 0.008, z);
    lawn.receiveShadow = true;
    southComplex.add(lawn);

    addCurbBlock(x - w / 2, z, 0.26, l);
    addCurbBlock(x + w / 2, z, 0.26, l);
    addCurbBlock(x, z - l / 2, w, 0.26);
    addCurbBlock(x, z + l / 2, w, 0.26);
    return lawn;
  };

  // Helper Trotoar Pejalan Kaki (Sidewalk)
  const addSidewalk = (x, z, w, l) => {
    const sw = new THREE.Mesh(new THREE.BoxGeometry(w, 0.16, l), sidewalkPaverMat);
    sw.position.set(x, 0.08, z);
    sw.receiveShadow = true;
    sw.castShadow = true;
    southComplex.add(sw);
    return sw;
  };

  // Helper Marka Zebra Cross Rapi
  const addZebraCross = (cx, cz, width, length, isHorizontal = false) => {
    const zg = new THREE.Group();
    zg.position.set(cx, 0.015, cz);

    const numBars = Math.max(3, Math.floor(length / 0.9));
    const barW = 0.45;
    const halfL = (numBars * 0.9 - 0.45) / 2;

    for (let b = 0; b < numBars; b++) {
      const offset = -halfL + b * 0.9;
      const bar = new THREE.Mesh(
        new THREE.PlaneGeometry(isHorizontal ? barW : width, isHorizontal ? width : barW),
        whiteLineMat
      );
      bar.rotation.x = -Math.PI / 2;
      bar.position.set(isHorizontal ? offset : 0, 0.005, isHorizontal ? 0 : offset);
      zg.add(bar);
    }

    // Garis Stop di Depan Penyeberangan
    [-halfL - 1.0, halfL + 1.0].forEach(st => {
      const sLine = new THREE.Mesh(
        new THREE.PlaneGeometry(isHorizontal ? 0.35 : width, isHorizontal ? width : 0.35),
        whiteLineMat
      );
      sLine.rotation.x = -Math.PI / 2;
      sLine.position.set(isHorizontal ? st : 0, 0.005, isHorizontal ? 0 : st);
      zg.add(sLine);
    });

    southComplex.add(zg);
  };

  // ----------------------------------------------------------------------------
  // C. JARINGAN JALAN BERDETAIL TINGGI 100% SESUAI FOTO SATELIT ORTO 1 & 2
  // ----------------------------------------------------------------------------

  // 1. APRON MASUK DARI JALAN ARTERI PULAU 1 (X in [-26, -20], Z in [690, 740])
  const entryApron = new THREE.Mesh(new THREE.PlaneGeometry(6, 50), campusRoadMat);
  entryApron.rotation.x = -Math.PI / 2;
  entryApron.position.set(-23, 0.01, 715);
  entryApron.receiveShadow = true;
  southComplex.add(entryApron);

  // 2. TAMAN SEGITIGA DI PINTU MASUK (PERSIS DI TENGAH FOTO SATELIT 1 & 2!)
  // Bentuk segitiga hijau mengarah ke bawah: Base X=-26, Z=[702, 728], Apex X=-46, Z=715
  const triIslandPos = [
    -26, 0.012, 702,
    -26, 0.012, 728,
    -46, 0.012, 715
  ];
  const triIslandGeo = new THREE.BufferGeometry();
  triIslandGeo.setAttribute('position', new THREE.Float32BufferAttribute(triIslandPos, 3));
  triIslandGeo.computeVertexNormals();
  const triIslandMesh = new THREE.Mesh(triIslandGeo, officeLawnMat);
  triIslandMesh.receiveShadow = true;
  southComplex.add(triIslandMesh);

  // Kanstin pembatas taman segitiga
  addCurbLine(-26, 702, -26, 728, curbHazardWhiteMat); // Base atas
  addCurbLine(-26, 702, -46, 715, curbConcreteMat);    // Sisi barat
  addCurbLine(-26, 728, -46, 715, curbConcreteMat);    // Sisi timur

  // Pohon peneduh & semak di dalam taman segitiga
  addSatelliteTree(southComplex, -33, 715, 2.7, 2);
  addSatelliteTree(southComplex, -29, 710, 2.3, 0);
  addSatelliteTree(southComplex, -29, 720, 2.3, 1);

  // 3. DUA JALUR MASUK/KELUAR YANG MENGAPIT TAMAN SEGITIGA
  // Jalur Barat (Menghubungkan apron masuk barat ke jalan poros tengah)
  const leftSlipPos = [
    -23, 0.01, 694, -23, 0.01, 702, -46, 0.01, 710,
    -23, 0.01, 694, -46, 0.01, 710, -46, 0.01, 704
  ];
  const leftSlipGeo = new THREE.BufferGeometry();
  leftSlipGeo.setAttribute('position', new THREE.Float32BufferAttribute(leftSlipPos, 3));
  leftSlipGeo.computeVertexNormals();
  const leftSlipMesh = new THREE.Mesh(leftSlipGeo, campusRoadMat);
  leftSlipMesh.receiveShadow = true;
  southComplex.add(leftSlipMesh);
  addCurbLine(-23, 694, -46, 704, curbConcreteMat); // Kanstin luar jalur barat

  // Jalur Timur (Menghubungkan apron masuk timur ke jalan poros tengah)
  const rightSlipPos = [
    -23, 0.01, 728, -23, 0.01, 736, -46, 0.01, 726,
    -23, 0.01, 728, -46, 0.01, 726, -46, 0.01, 720
  ];
  const rightSlipGeo = new THREE.BufferGeometry();
  rightSlipGeo.setAttribute('position', new THREE.Float32BufferAttribute(rightSlipPos, 3));
  rightSlipGeo.computeVertexNormals();
  const rightSlipMesh = new THREE.Mesh(rightSlipGeo, campusRoadMat);
  rightSlipMesh.receiveShadow = true;
  southComplex.add(rightSlipMesh);
  addCurbLine(-23, 736, -46, 726, curbConcreteMat); // Kanstin luar jalur timur

  // Taman Rumput di Sudut Barat Laut & Timur Laut
  addLawnWithCurb(-35, 678, 18, 28);
  addLawnWithCurb(-35, 752, 18, 28);

  // Marka Zebra Cross di Pintu Masuk Depan Pos Jaga
  addZebraCross(-28, 715, 10, 3.0, false);

  // 4. JALAN POROS TENGAH VERTIKAL (CENTRAL ROAD: X in [-106, -46], Z in [710, 720])
  // Membujur vertikal lurus ke bawah persis di antara Lapangan/Parkir dan Shelter
  const centralRoad = new THREE.Mesh(new THREE.PlaneGeometry(60, 10), campusRoadMat);
  centralRoad.rotation.x = -Math.PI / 2;
  centralRoad.position.set(-76, 0.01, 715);
  centralRoad.receiveShadow = true;
  southComplex.add(centralRoad);

  // Marka Garis Putus-Putus Tengah Jalan Poros
  for (let cx = -48; cx >= -104; cx -= 6.0) {
    const dash = new THREE.Mesh(new THREE.PlaneGeometry(3.0, 0.16), whiteLineMat);
    dash.rotation.x = -Math.PI / 2;
    dash.position.set(cx - 1.5, 0.016, 715);
    southComplex.add(dash);
  }

  // Garis Marka Tepi Putih Solid Sepanjang Jalan Poros
  [-4.8, 4.8].forEach(oz => {
    const eLine = new THREE.Mesh(new THREE.PlaneGeometry(60, 0.16), whiteLineMat);
    eLine.rotation.x = -Math.PI / 2;
    eLine.position.set(-76, 0.016, 715 + oz);
    southComplex.add(eLine);
  });

  // Kanstin Beton 3D Pembatas Jalan Poros Barat & Timur
  addCurbBlock(-76, 709.85, 60, 0.26);
  addCurbBlock(-76, 720.15, 60, 0.26);

  // 5. PEREMPATAN / JALAN HORIZONTAL PENGHUBUNG (CROSSROAD: X in [-115, -106], Z in [665, 746])
  // Menghubungkan Parkir Utara/Masjid ke Lobi Utama Graha Pelindo
  const crossRoad = new THREE.Mesh(new THREE.PlaneGeometry(9, 81), campusRoadMat);
  crossRoad.rotation.x = -Math.PI / 2;
  crossRoad.position.set(-110.5, 0.01, 705.5);
  crossRoad.receiveShadow = true;
  southComplex.add(crossRoad);

  // Kanstin Pembatas Sisi Utara Jalan Horizontal
  addCurbBlock(-105.85, 688, 0.26, 42); // Barat dari poros tengah
  addCurbBlock(-105.85, 733, 0.26, 24); // Timur dari poros tengah

  // Marka Zebra Cross Antara Parkir Utara dan Graha Pelindo
  addZebraCross(-100, 715, 9.5, 3.2, false);

  // 6. TAMAN SENTRAL ORGANIK DENGAN KOLAM BUNDAR (PERSIS FOTO SATELIT 1 & 2!)
  // Terletak di antara Masjid, Jalan Graha Pelindo, dan Parkir Selatan (X in [-148, -115], Z in [696, 732])
  const centralGarden = new THREE.Mesh(new THREE.PlaneGeometry(33, 36), officeLawnMat);
  centralGarden.rotation.x = -Math.PI / 2;
  centralGarden.position.set(-131.5, 0.008, 714);
  centralGarden.receiveShadow = true;
  southComplex.add(centralGarden);

  // Kanstin Pembatas Taman Sentral
  addCurbBlock(-115.15, 714, 0.26, 36); // Batas utara taman sentral
  addCurbBlock(-148.0, 714, 0.26, 36);  // Batas selatan taman sentral
  addCurbBlock(-131.5, 695.85, 33, 0.26); // Batas barat taman sentral
  addCurbBlock(-131.5, 732.15, 33, 0.26); // Batas timur taman sentral

  // Kolam Bundar di Tengah Taman Sentral (Persis Lingkaran di Foto Satelit!)
  const pondRim = new THREE.Mesh(new THREE.CylinderGeometry(3.8, 4.0, 0.35, 24), curbConcreteMat);
  pondRim.position.set(-133, 0.18, 714);
  southComplex.add(pondRim);

  const pondWater = new THREE.Mesh(new THREE.CircleGeometry(3.5, 24), pondWaterMat);
  pondWater.rotation.x = -Math.PI / 2;
  pondWater.position.set(-133, 0.32, 714);
  southComplex.add(pondWater);

  // Pohon Peneduh Rindang Mengelilingi Kolam Sentral (Persis Foto 1 & 2)
  addSatelliteTree(southComplex, -123, 705, 2.7, 1);
  addSatelliteTree(southComplex, -141, 706, 2.8, 0);
  addSatelliteTree(southComplex, -125, 723, 2.7, 2);
  addSatelliteTree(southComplex, -142, 722, 2.6, 3);

  // 7. JALAN MENUJU PARKIR SELATAN (DI SISI TIMUR TAMAN SENTRAL, Z in [732, 742])
  // Berada tepat di depan fasad Graha Pelindo membujur ke arah parkiran selatan
  const southDriveway = new THREE.Mesh(new THREE.PlaneGeometry(50, 10), campusRoadMat);
  southDriveway.rotation.x = -Math.PI / 2;
  southDriveway.position.set(-140, 0.01, 737);
  southDriveway.receiveShadow = true;
  southComplex.add(southDriveway);

  // Kanstin pembatas timur jalan selatan
  addCurbBlock(-140, 742.15, 50, 0.26);

  // 8. JALAN MENUJU MASJID (DI SISI BARAT TAMAN SENTRAL, Z in [684, 696])
  // Menghubungkan perempatan ke pelataran aula sholat masjid
  const mosqueDriveway = new THREE.Mesh(new THREE.PlaneGeometry(32, 10), campusRoadMat);
  mosqueDriveway.rotation.x = -Math.PI / 2;
  mosqueDriveway.position.set(-131, 0.01, 691);
  mosqueDriveway.receiveShadow = true;
  southComplex.add(mosqueDriveway);

  // Kanstin pembatas barat jalan masjid
  addCurbBlock(-131, 685.85, 32, 0.26);

  // Marka Zebra Cross Menuju Masjid
  addZebraCross(-128, 691, 9.5, 3.0, false);

  // 9. PELATARAN DROP-OFF LOBI UTAMA GRAHA PELINDO (PORTE-COCHÈRE)
  // Berada di X in [-128, -106], Z in [744, 752]
  const lobbyPlaza = new THREE.Mesh(new THREE.PlaneGeometry(22, 8), plazaPavingMat);
  lobbyPlaza.rotation.x = -Math.PI / 2;
  lobbyPlaza.position.set(-117, 0.012, 748);
  lobbyPlaza.receiveShadow = true;
  southComplex.add(lobbyPlaza);

  // Marka Kotak Kuning Drop-Off
  const dropBox = new THREE.Mesh(new THREE.PlaneGeometry(16, 6), campusRoadMat);
  dropBox.rotation.x = -Math.PI / 2;
  dropBox.position.set(-117, 0.013, 744);
  southComplex.add(dropBox);

  const boxBorder = new THREE.Mesh(new THREE.PlaneGeometry(16.4, 6.4), yellowHatchMat);
  boxBorder.rotation.x = -Math.PI / 2;
  boxBorder.position.set(-117, 0.0125, 744);
  southComplex.add(boxBorder);

  // Marka Zebra Cross di Depan Lobi Utama Graha Pelindo
  addZebraCross(-110.5, 737, 8.5, 3.0, true);

  // 10. TROTOAR PEJALAN KAKI SEPANJANG BANGUNAN & SHELTER
  addSidewalk(-112, 750, 96, 2.5); // Trotoar depan Graha Pelindo
  addSidewalk(-82, 722, 44, 2.0);  // Trotoar sepanjang shelter 5-bay

  // 11. LAMPU PENERANGAN JALAN KAMPUS MODERN
  [
    [-30, 706, 0], [-30, 724, Math.PI], // Lampu gerbang
    [-50, 708, 0], [-50, 722, Math.PI], // Lampu masuk poros tengah
    [-74, 708, 0], [-74, 722, Math.PI], // Lampu poros tengah
    [-98, 708, 0], [-98, 722, Math.PI], // Lampu sebelum perempatan
    [-110.5, 728, Math.PI / 2], [-110.5, 744, -Math.PI / 2], // Lampu lobi utama
    [-134, 743, -Math.PI / 2], [-158, 743, -Math.PI / 2],   // Lampu jalan parkir selatan
    [-128, 684, Math.PI / 2], [-144, 684, Math.PI / 2]      // Lampu jalan masjid
  ].forEach(lp => {
    const lg = new THREE.Group();
    lg.position.set(lp[0], 0, lp[1]);
    lg.rotation.y = lp[2];

    const pole = new THREE.Mesh(new THREE.CylinderGeometry(0.08, 0.12, 6.2, 8), steelMat);
    pole.position.set(0, 3.1, 0);
    pole.castShadow = true;
    lg.add(pole);

    const arm = new THREE.Mesh(new THREE.CylinderGeometry(0.04, 0.04, 1.6, 6), steelMat);
    arm.rotation.z = -Math.PI / 3;
    arm.position.set(0.55, 5.9, 0);
    lg.add(arm);

    const luminaire = new THREE.Mesh(new THREE.BoxGeometry(0.4, 0.1, 0.2), steelMat);
    luminaire.position.set(1.15, 6.3, 0);
    lg.add(luminaire);

    const bulb = new THREE.Mesh(new THREE.PlaneGeometry(0.35, 0.15), lampGlowMat);
    bulb.rotation.x = Math.PI / 2;
    bulb.position.set(1.15, 6.24, 0);
    lg.add(bulb);

    southComplex.add(lg);
  });
  // ----------------------------------------------------------------------------
  // D. GEDUNG UTAMA GRAHA PELINDO (DETAIL ARSITEKTUR ASLI SESUAI 5 FOTO SATELIT)
  // Membujur vertikal utara-selatan di sisi timur (Z = 762, X in [-166, -58])
  // ----------------------------------------------------------------------------

  // 1. SAYAP UTARA / AUDITORIUM (X in [-102, -58], Panjang 44m, Lebar 24m, Tinggi 14.5m)
  southComplex.add(createMassingBuilding(44, 14.5, 24, -80, 762, 0, massingWhiteMat));

  // Atap Melengkung Setengah Silinder Silver (Curved / Barrel-Vault Roof)
  const northCurvedRoofGeo = new THREE.CylinderGeometry(12.0, 12.0, 43.8, 32, 1, false, 0, Math.PI);
  const northCurvedRoofMat = new THREE.MeshStandardMaterial({
    color: 0xcfd5db, // Silver metallic architectural profile
    roughness: 0.35,
    metalness: 0.25
  });
  const northCurvedRoof = new THREE.Mesh(northCurvedRoofGeo, northCurvedRoofMat);
  northCurvedRoof.rotation.z = Math.PI / 2;
  northCurvedRoof.rotation.y = Math.PI / 2;
  northCurvedRoof.scale.set(1.0, 0.38, 1.0);
  northCurvedRoof.position.set(-80, 14.5, 762);
  northCurvedRoof.castShadow = true;
  southComplex.add(northCurvedRoof);

  // Aksen Busur Lis Terracotta / Oranye di Ujung Utara Atap (Persis Foto 1, 2, 4, 5!)
  const northArchTrimGeo = new THREE.TorusGeometry(12.08, 0.42, 8, 32, Math.PI);
  const northArchTrim = new THREE.Mesh(northArchTrimGeo, terracottaRoofTrimMat);
  northArchTrim.scale.set(1.0, 0.38, 1.0);
  northArchTrim.position.set(-58.1, 14.5, 762);
  northArchTrim.rotation.y = Math.PI / 2;
  northArchTrim.castShadow = true;
  southComplex.add(northArchTrim);

  // Rusuk-Rusuk Garis Arsitektural Atap Lengkung
  for (let rx = -100; rx <= -62; rx += 4.5) {
    const ribGeo = new THREE.TorusGeometry(12.05, 0.12, 6, 24, Math.PI);
    const ribMesh = new THREE.Mesh(ribGeo, steelMat);
    ribMesh.scale.set(1.0, 0.38, 1.0);
    ribMesh.position.set(rx, 14.5, 762);
    ribMesh.rotation.y = Math.PI / 2;
    southComplex.add(ribMesh);
  }

  // Unit Pendingin HVAC Chiller di Dek Belakang Sayap Utara
  [-66, -76].forEach(cx => {
    const chBox = createMassingBuilding(7, 2.2, 5.5, cx, 762, 14.5, chillerGridMat);
    southComplex.add(chBox);

    // Kipas Chiller di Atas Box
    const fan = new THREE.Mesh(new THREE.CylinderGeometry(0.9, 0.9, 0.3, 12), steelMat);
    fan.position.set(cx, 14.5 + 2.35, 762);
    southComplex.add(fan);
  });

  // Jendela Kaca Horizontal Pita Aqua Sayap Utara
  for (let lvl = 1; lvl <= 3; lvl++) {
    const winWest = new THREE.Mesh(new THREE.BoxGeometry(42, 1.2, 0.3), massingGlassAquaMat);
    winWest.position.set(-80, lvl * 3.6 + 1.0, 749.8);
    southComplex.add(winWest);

    const winEast = new THREE.Mesh(new THREE.BoxGeometry(42, 1.2, 0.3), massingGlassAquaMat);
    winEast.position.set(-80, lvl * 3.6 + 1.0, 774.2);
    southComplex.add(winEast);
  }

  // 2. SEGMEN PENGHUBUNG TENGAH & ATRIUM KACA MELENGKUNG (X in [-132, -102], Tinggi 11m)
  southComplex.add(createMassingBuilding(30, 11.0, 22, -117, 762, 0, massingRoofMat));

  // Atap Dek Abu-abu Gelap dengan Unit Mekanikal
  const midDeck = new THREE.Mesh(new THREE.PlaneGeometry(28, 20), massingDarkSlateMat);
  midDeck.rotation.x = -Math.PI / 2;
  midDeck.position.set(-117, 11.02, 762);
  southComplex.add(midDeck);

  // Penthouse Lift & Pipa Sirkulasi AC di Atap Tengah
  southComplex.add(createMassingBuilding(8, 3.2, 7, -108, 762, 11.0, massingWhiteMat));
  southComplex.add(createMassingBuilding(5, 1.8, 8, -122, 762, 11.0, chillerGridMat));

  // Tiang Antena Komunikasi di Atap Tengah
  const commMast = new THREE.Mesh(new THREE.CylinderGeometry(0.08, 0.16, 12, 6), steelMat);
  commMast.position.set(-108, 11.0 + 3.2 + 6.0, 762);
  commMast.castShadow = true;
  southComplex.add(commMast);

  // Atrium Koridor Kaca Melengkung di Fasad Barat (Curved Glass Gallery) - Persis Foto 3, 4, 5!
  const curvedGalleryGeo = new THREE.CylinderGeometry(14.0, 14.0, 7.5, 24, 1, true, Math.PI * 0.75, Math.PI * 0.5);
  const curvedGallery = new THREE.Mesh(curvedGalleryGeo, massingGlassAquaMat);
  curvedGallery.position.set(-117, 3.75, 751);
  southComplex.add(curvedGallery);

  // Kanopi Drop-Off Lobi Barat (Porte-Cochère)
  southComplex.add(createMassingBuilding(8, 0.5, 12, -117, 742, 4.2, massingWhiteMat));
  [-114, -120].forEach(px => {
    const col = new THREE.Mesh(new THREE.CylinderGeometry(0.18, 0.18, 4.2, 8), steelMat);
    col.position.set(px, 2.1, 736);
    col.castShadow = true;
    southComplex.add(col);
  });

  // 3. SAYAP SELATAN KOTAK PUTIH MEGAH (X in [-166, -132], Panjang 34m, Lebar 28m, Tinggi 13m)
  // Balok Persegi Masif Beratap Putih Sangat Kontras & Mencolok (Foto 1-5)
  southComplex.add(createMassingBuilding(34, 13.0, 28, -149, 762, 0, massingWhiteMat));

  // Atap Putih Bersih Mencolok dengan Parapet Tegas
  const whiteRoofMat = new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 0.2, metalness: 0.05 });
  const whiteSquareRoof = new THREE.Mesh(new THREE.PlaneGeometry(32.5, 26.5), whiteRoofMat);
  whiteSquareRoof.rotation.x = -Math.PI / 2;
  whiteSquareRoof.position.set(-149, 13.03, 762);
  southComplex.add(whiteSquareRoof);

  // Parapet Pembatas Tepi Atap Putih
  const parapetGeo = new THREE.LineSegments(
    new THREE.EdgesGeometry(new THREE.PlaneGeometry(33.5, 27.5)),
    new THREE.LineBasicMaterial({ color: 0x94a3b8, linewidth: 2 })
  );
  parapetGeo.rotation.x = -Math.PI / 2;
  parapetGeo.position.set(-149, 13.3, 762);
  southComplex.add(parapetGeo);

  // Jendela Kaca Pita Sayap Selatan
  for (let lvl = 1; lvl <= 2; lvl++) {
    const winMeshS = new THREE.Mesh(new THREE.BoxGeometry(32.2, 1.3, 0.3), massingGlassAquaMat);
    winMeshS.position.set(-149, lvl * 3.8 + 1.2, 747.8);
    southComplex.add(winMeshS);
  }

  // ----------------------------------------------------------------------------
  // E. KANOPI SHELTER 5-BAY TENSILE FABRIC BARAT (PERSIS FOTO 1-5!)
  // 5 Tenda Kerucut Membran Putih Berjajar di Sepanjang Jalan Barat Gedung
  // (X in [-102, -62], Z = 734)
  // ----------------------------------------------------------------------------
  const shelterGroup = new THREE.Group();
  for (let i = 0; i < 5; i++) {
    const bayCenterX = -66 - i * 8.0;
    const bayCenterZ = 734;

    // 4 Tiang Baja Sudut per Bay
    [-3.8, 3.8].forEach(ox => {
      [-3.4, 3.4].forEach(oz => {
        const post = new THREE.Mesh(new THREE.CylinderGeometry(0.1, 0.1, 3.2, 6), steelMat);
        post.position.set(bayCenterX + ox, 1.6, bayCenterZ + oz);
        post.castShadow = true;
        shelterGroup.add(post);
      });
    });

    // Rangka Balok Atas
    const frame = new THREE.Mesh(new THREE.BoxGeometry(7.6, 0.15, 6.8), steelMat);
    frame.position.set(bayCenterX, 3.2, bayCenterZ);
    shelterGroup.add(frame);

    // Atap Membran Kerucut Limas Tensile Putih
    const peakPyramid = new THREE.Mesh(
      new THREE.ConeGeometry(4.8, 1.6, 4),
      tensileMembraneMat
    );
    peakPyramid.position.set(bayCenterX, 3.2 + 0.8, bayCenterZ);
    peakPyramid.rotation.y = Math.PI / 4;
    peakPyramid.castShadow = true;
    shelterGroup.add(peakPyramid);
  }
  southComplex.add(shelterGroup);

  // ----------------------------------------------------------------------------
  // F. LAPANGAN OLAHRAGA DUAL-PURPOSE (BASKET & FUTSAL / TENNIS - SUDUT BARAT LAUT)
  // Dilengkapi Area Kunci Terracotta di Kedua Ujung & Pagar Harmonika (Foto 1-5)
  // ----------------------------------------------------------------------------
  // Apron Terracotta/Abu-abu Keliling Lapangan ($34m x 22m$)
  const courtApron = new THREE.Mesh(new THREE.PlaneGeometry(34, 22), courtTerracottaMat2);
  courtApron.rotation.x = -Math.PI / 2;
  courtApron.position.set(-59, 0.015, 663);
  courtApron.receiveShadow = true;
  southComplex.add(courtApron);

  // Karpet Lapangan Hijau ($28m x 16m$)
  const courtGreenField = new THREE.Mesh(new THREE.PlaneGeometry(28, 16), courtPlayingGreenMat2);
  courtGreenField.rotation.x = -Math.PI / 2;
  courtGreenField.position.set(-59, 0.02, 663);
  courtGreenField.receiveShadow = true;
  southComplex.add(courtGreenField);

  // Marka Garis Lapangan Futsal & Basket Putih
  const courtBorderLine = new THREE.LineSegments(
    new THREE.EdgesGeometry(new THREE.PlaneGeometry(28, 16)),
    new THREE.LineBasicMaterial({ color: 0xffffff, linewidth: 2 })
  );
  courtBorderLine.rotation.x = -Math.PI / 2;
  courtBorderLine.position.set(-59, 0.022, 663);
  southComplex.add(courtBorderLine);

  const courtMidLine = new THREE.Mesh(new THREE.PlaneGeometry(0.18, 16), whiteLineMat);
  courtMidLine.rotation.x = -Math.PI / 2;
  courtMidLine.position.set(-59, 0.022, 663);
  southComplex.add(courtMidLine);

  const courtCircle = new THREE.Mesh(new THREE.RingGeometry(2.1, 2.25, 24), whiteLineMat);
  courtCircle.rotation.x = -Math.PI / 2;
  courtCircle.position.set(-59, 0.022, 663);
  southComplex.add(courtCircle);

  // Area Kunci / Semicircle Terracotta di Kedua Ujung Lapangan (Persis Foto 1-5!)
  [-71.5, -46.5].forEach((kx, i) => {
    const keyBox = new THREE.Mesh(new THREE.PlaneGeometry(5.0, 5.8), courtTerracottaMat2);
    keyBox.rotation.x = -Math.PI / 2;
    keyBox.position.set(kx + (i === 0 ? 2.5 : -2.5), 0.021, 663);
    southComplex.add(keyBox);

    const arcMesh = new THREE.Mesh(
      new THREE.RingGeometry(2.1, 2.25, 20, 1, i === 0 ? -Math.PI / 2 : Math.PI / 2, Math.PI),
      whiteLineMat
    );
    arcMesh.rotation.x = -Math.PI / 2;
    arcMesh.position.set(kx + (i === 0 ? 5.0 : -5.0), 0.023, 663);
    southComplex.add(arcMesh);
  });

  // 2 Tiang Ring Basket (Utara & Selatan)
  [-72.5, -45.5].forEach((bx, i) => {
    const post = new THREE.Mesh(new THREE.CylinderGeometry(0.08, 0.08, 3.8, 6), steelMat);
    post.position.set(bx, 1.9, 663);
    post.castShadow = true;
    southComplex.add(post);

    const bBoard = new THREE.Mesh(new THREE.BoxGeometry(0.1, 1.05, 1.8), massingWhiteMat);
    bBoard.position.set(bx + (i === 0 ? 0.35 : -0.35), 3.3, 663);
    southComplex.add(bBoard);

    const rim = new THREE.Mesh(new THREE.TorusGeometry(0.3, 0.03, 6, 12), new THREE.MeshBasicMaterial({ color: 0xea580c }));
    rim.rotation.x = Math.PI / 2;
    rim.position.set(bx + (i === 0 ? 0.65 : -0.65), 3.05, 663);
    southComplex.add(rim);
  });

  // Pagar Kawat Keliling Lapangan ($34m x 22m x 3.2m$)
  const courtFence = new THREE.Mesh(new THREE.BoxGeometry(34, 3.2, 22), fenceWireMat2);
  courtFence.position.set(-59, 1.6, 663);
  southComplex.add(courtFence);

  // 4 Tiang Lampu Lapangan di Sudut Apron
  [
    [-74, 652], [-74, 674], [-44, 652], [-44, 674]
  ].forEach(cp => {
    const lPole = new THREE.Mesh(new THREE.CylinderGeometry(0.08, 0.12, 7.5, 6), steelMat);
    lPole.position.set(cp[0], 3.75, cp[1]);
    lPole.castShadow = true;
    southComplex.add(lPole);

    const fix = new THREE.Mesh(new THREE.BoxGeometry(0.4, 0.2, 0.5), lampGlowMat);
    fix.position.set(cp[0], 7.5, cp[1]);
    southComplex.add(fix);
  });

  // ----------------------------------------------------------------------------
  // G. AREA PARKIR UTARA (3 BARIS MOBIL PARALEL - PERSIS FOTO 1, 3, 5!)
  // Terletak di antara Lapangan dan Kanopi Shelter (X in [-88, -44], Z in [682, 722])
  // ----------------------------------------------------------------------------
  const northParkingLot = new THREE.Mesh(new THREE.PlaneGeometry(44, 40), parkingAsphaltMat);
  northParkingLot.rotation.x = -Math.PI / 2;
  northParkingLot.position.set(-66, 0.015, 702);
  northParkingLot.receiveShadow = true;
  southComplex.add(northParkingLot);

  // Marka Garis Parkir Putih 3 Lajur
  for (let px = -84; px <= -48; px += 3.4) {
    [690, 702, 714].forEach(pz => {
      const pLine = new THREE.Mesh(new THREE.PlaneGeometry(0.14, 5.0), whiteLineMat);
      pLine.rotation.x = -Math.PI / 2;
      pLine.position.set(px, 0.02, pz);
      southComplex.add(pLine);
    });
  }

  // Barisan ~28 Mobil Terparkir Rapi di Parkiran Utara (Sesuai Foto 1 & 3)
  const northParkedCars = [
    // Kolom 1 (Z = 690, menghadap timur/barat)
    [-82, 690, 0xf8fafc], [-78, 690, 0x1e293b], [-74, 690, 0x94a3b8], [-70, 690, 0xdc2626],
    [-66, 690, 0x0284c7], [-62, 690, 0xf8fafc], [-58, 690, 0x475569], [-54, 690, 0xca8a04],
    [-50, 690, 0xf8fafc],
    // Kolom 2 (Z = 702)
    [-82, 702, 0x94a3b8], [-78, 702, 0xf8fafc], [-74, 702, 0x1e293b], [-70, 702, 0xca8a04],
    [-66, 702, 0xf8fafc], [-62, 702, 0xdc2626], [-58, 702, 0x0284c7], [-54, 702, 0x1e293b],
    [-50, 702, 0x94a3b8],
    // Kolom 3 (Z = 714)
    [-82, 714, 0xf8fafc], [-78, 714, 0x0284c7], [-74, 714, 0xca8a04], [-70, 714, 0x94a3b8],
    [-66, 714, 0x1e293b], [-62, 714, 0xf8fafc], [-58, 714, 0xdc2626], [-54, 714, 0xf8fafc],
    // Baris Selatan (X = -86)
    [-86, 696, 0xf8fafc], [-86, 708, 0x1e293b]
  ];
  northParkedCars.forEach(c => addParkedCar(southComplex, c[0], c[1], 0, c[2]));

  // ----------------------------------------------------------------------------
  // H. AREA PARKIR SELATAN (~24 MOBIL DI SELATAN GRAHA PELINDO - FOTO 1-5)
  // X in [-194, -170], Z in [724, 782] (Aman di Dalam Daratan Pulau)
  // ----------------------------------------------------------------------------
  const southParkingLot = new THREE.Mesh(new THREE.PlaneGeometry(24, 58), parkingAsphaltMat);
  southParkingLot.rotation.x = -Math.PI / 2;
  southParkingLot.position.set(-182, 0.015, 753);
  southParkingLot.receiveShadow = true;
  southComplex.add(southParkingLot);

  // Marka Parkir Putih
  for (let pz = 728; pz <= 778; pz += 3.4) {
    [-176, -188].forEach(px => {
      const pLine = new THREE.Mesh(new THREE.PlaneGeometry(5.0, 0.14), whiteLineMat);
      pLine.rotation.x = -Math.PI / 2;
      pLine.position.set(px, 0.02, pz);
      southComplex.add(pLine);
    });
  }

  // 24 Mobil Terparkir Rapi Menghadap Utara/Selatan
  const southParkedCars = [
    // Baris Utara (X = -176)
    [-176, 730, 0xf8fafc], [-176, 734, 0x1e293b], [-176, 738, 0x94a3b8], [-176, 742, 0xdc2626],
    [-176, 746, 0x0284c7], [-176, 750, 0xf8fafc], [-176, 754, 0xca8a04], [-176, 758, 0x475569],
    [-176, 762, 0xf8fafc], [-176, 766, 0x1e293b], [-176, 770, 0x94a3b8], [-176, 774, 0xdc2626],
    // Baris Selatan (X = -188)
    [-188, 730, 0x94a3b8], [-188, 734, 0xf8fafc], [-188, 738, 0x1e293b], [-188, 742, 0xca8a04],
    [-188, 746, 0xf8fafc], [-188, 750, 0xdc2626], [-188, 754, 0x0284c7], [-188, 758, 0x1e293b],
    [-188, 762, 0xf8fafc], [-188, 766, 0x94a3b8], [-188, 770, 0xca8a04], [-188, 774, 0xf8fafc]
  ];
  southParkedCars.forEach(c => addParkedCar(southComplex, c[0], c[1], Math.PI / 2, c[2]));

  // ----------------------------------------------------------------------------
  // I. MASJID TELUK LAMONG (KUBAH TENDA OVAL ARSITEKTURAL PUTIH & KORIDOR ANEKS)
  // Sesuai Bentuk Oval / Tensile Shell di Foto 1, 2, 3, 4
  // ----------------------------------------------------------------------------
  const mosqueCenter = { x: -138, z: 672 };

  // Plaza Dasar Masjid
  const mosqueBasePlaza = new THREE.Mesh(new THREE.CylinderGeometry(16.5, 17.0, 0.35, 32), massingRoofMat);
  mosqueBasePlaza.position.set(mosqueCenter.x, 0.18, mosqueCenter.z);
  mosqueBasePlaza.receiveShadow = true;
  southComplex.add(mosqueBasePlaza);

  // Dinding Drum Silinder Aula Sholat
  const mosqueDrumGeo = new THREE.CylinderGeometry(13.5, 13.5, 4.2, 32);
  const mosqueDrum = new THREE.Mesh(mosqueDrumGeo, massingWhiteMat);
  mosqueDrum.scale.set(1.12, 1.0, 0.9); // Membentuk oval leaf-like sesuai foto
  mosqueDrum.position.set(mosqueCenter.x, 2.45, mosqueCenter.z);
  mosqueDrum.castShadow = true;
  mosqueDrum.receiveShadow = true;
  southComplex.add(mosqueDrum);

  const drumEdge = new THREE.LineSegments(new THREE.EdgesGeometry(mosqueDrumGeo), edgeSlateMat);
  drumEdge.scale.set(1.12, 1.0, 0.9);
  drumEdge.position.set(mosqueCenter.x, 2.45, mosqueCenter.z);
  southComplex.add(drumEdge);

  // Kubah Tenda Oval Putih (Tensile Parabolic Shell)
  const domeRadius = 13.2;
  const mosqueDomeGeo = new THREE.SphereGeometry(domeRadius, 32, 16, 0, Math.PI * 2, 0, Math.PI / 2);
  const mosqueDome = new THREE.Mesh(mosqueDomeGeo, massingWhiteMat);
  mosqueDome.scale.set(1.15, 0.75, 0.92); // Oval tent shape persis foto satelit
  mosqueDome.position.set(mosqueCenter.x, 4.55, mosqueCenter.z);
  mosqueDome.castShadow = true;
  southComplex.add(mosqueDome);

  // Rusuk Meridian Garis Kubah
  const ribMat = new THREE.LineBasicMaterial({ color: 0x94a3b8 });
  for (let i = 0; i < 16; i++) {
    const ang = (i / 16) * Math.PI * 2;
    const ribPts = [];
    for (let k = 0; k <= 12; k++) {
      const phi = (k / 12) * (Math.PI / 2);
      ribPts.push(new THREE.Vector3(
        Math.cos(ang) * Math.sin(phi) * (domeRadius + 0.05) * 1.15,
        Math.cos(phi) * (domeRadius + 0.05) * 0.75,
        Math.sin(ang) * Math.sin(phi) * (domeRadius + 0.05) * 0.92
      ));
    }
    const ribGeo = new THREE.BufferGeometry().setFromPoints(ribPts);
    const ribLine = new THREE.Line(ribGeo, ribMat);
    ribLine.position.set(mosqueCenter.x, 4.55, mosqueCenter.z);
    southComplex.add(ribLine);
  }

  // Puncak Finial & Bulan Sabit Emas
  const domeFinial = new THREE.Mesh(new THREE.CylinderGeometry(0.12, 0.25, 2.4, 8), goldFinialMat);
  domeFinial.position.set(mosqueCenter.x, 4.55 + domeRadius * 0.75 + 1.2, mosqueCenter.z);
  southComplex.add(domeFinial);

  const domeCrescent = new THREE.Mesh(new THREE.TorusGeometry(0.5, 0.08, 8, 16, Math.PI * 1.5), goldFinialMat);
  domeCrescent.position.set(mosqueCenter.x, 4.55 + domeRadius * 0.75 + 2.5, mosqueCenter.z);
  domeCrescent.rotation.z = -Math.PI / 4;
  southComplex.add(domeCrescent);

  // Koridor Kanopi Tertutup Miring Menuju Tenggara (Angled Walkway) - Persis Foto 1-5
  const walkwayAngle = Math.atan2(12, -24);
  const walkwayLen = Math.sqrt(24 * 24 + 12 * 12);
  const walkwayCanopy = new THREE.Mesh(
    new THREE.BoxGeometry(walkwayLen, 0.4, 6.5),
    massingWhiteMat
  );
  walkwayCanopy.position.set(-160, 3.6, 686);
  walkwayCanopy.rotation.y = walkwayAngle;
  walkwayCanopy.castShadow = true;
  southComplex.add(walkwayCanopy);

  // Pilar-Pilar Kolom Koridor
  for (let st = 0; st <= 4; st++) {
    const frac = st / 4;
    const px = -148 - frac * 24;
    const pz = 680 + frac * 12;
    [-2.8, 2.8].forEach(lat => {
      const col = new THREE.Mesh(new THREE.CylinderGeometry(0.14, 0.14, 3.6, 6), steelMat);
      const perpAng = walkwayAngle + Math.PI / 2;
      col.position.set(px + Math.cos(perpAng) * lat, 1.8, pz + Math.sin(perpAng) * lat);
      col.castShadow = true;
      southComplex.add(col);
    });
  }

  // Gedung Aneks Wudhu & DKM di Ujung Tenggara Koridor
  southComplex.add(createMassingBuilding(15, 4.2, 14, -178, 694, 0, massingWhiteMat));

  // Menara Masjid Ramping Bertingkat (Minaret Tower)
  const minaret = new THREE.Group();
  minaret.position.set(-170, 0, 660);
  minaret.add(createMassingBuilding(3.8, 18, 3.8, 0, 0, 0, massingWhiteMat));
  minaret.add(createMassingBuilding(4.6, 0.6, 4.6, 0, 0, 18, massingRoofMat));
  minaret.add(createMassingBuilding(2.8, 3.5, 2.8, 0, 0, 18.6, massingWhiteMat));
  const minCone = new THREE.Mesh(new THREE.ConeGeometry(1.6, 4.2, 8), goldFinialMat);
  minCone.position.set(0, 24.2, 0);
  minaret.add(minCone);
  southComplex.add(minaret);

  // ----------------------------------------------------------------------------
  // J. POS SATPAM TIMUR LAUT, TIANG BENDERA & GERBANG
  // ----------------------------------------------------------------------------
  // Pos Satpam Putih di Timur Laut (Persis Kotak Putih di Foto 1, 2, 4!)
  southComplex.add(createMassingBuilding(5.5, 3.2, 5.5, -34, 766, 0, massingWhiteMat));

  // Pos Jaga Akses Masuk Barat
  southComplex.add(createMassingBuilding(4.0, 3.0, 4.0, -34, 738, 0, massingWhiteMat));
  const sBarrier = new THREE.Mesh(new THREE.BoxGeometry(0.12, 0.16, 4.5), new THREE.MeshBasicMaterial({ color: 0xdc2626 }));
  sBarrier.position.set(-34, 1.0, 734);
  southComplex.add(sBarrier);

  // Tiang Bendera Upacara di Depan Graha Pelindo
  [-1.5, 0, 1.5].forEach((fz, i) => {
    const fPole = new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.09, 9.5, 8), steelMat);
    fPole.position.set(-48, 4.75, 752 + fz);
    fPole.castShadow = true;
    southComplex.add(fPole);

    const flagGeo = new THREE.PlaneGeometry(1.6, 1.0);
    const flagMat = new THREE.MeshBasicMaterial({ color: i === 1 ? 0xdc2626 : 0x0284c7, side: THREE.DoubleSide });
    const flag = new THREE.Mesh(flagGeo, flagMat);
    flag.position.set(-48, 9.0, 752 + fz + 0.8);
    southComplex.add(flag);
  });

  // ----------------------------------------------------------------------------
  // K. PEPOHONAN RINDANG BERLAPIS (MENGIKUTI POLA FOTO SATELIT 1-5 DENGAN PRESISI)
  // ----------------------------------------------------------------------------
  const headOfficeTrees = [
    // 1. Rimbunan Pohon Mengelilingi Masjid Teluk Lamong
    [-122, 654, 2.6, 0], [-130, 648, 2.7, 1], [-145, 646, 2.9, 2], [-158, 650, 2.6, 3],
    [-168, 654, 2.5, 0], [-180, 662, 2.7, 1], [-186, 676, 2.6, 2], [-184, 690, 2.5, 3],
    [-168, 676, 2.6, 0], [-152, 662, 2.7, 1], [-135, 690, 2.8, 2], [-148, 702, 2.6, 3],
    [-126, 674, 2.5, 1], [-160, 674, 2.7, 2], [-174, 680, 2.6, 0],

    // 2. Rimbunan Pohon di Antara Masjid & Graha Pelindo (Central Park Grove)
    [-100, 715, 2.6, 1], [-130, 714, 2.7, 0], [-115, 700, 2.5, 2], [-115, 718, 2.6, 3],
    [-132, 724, 2.7, 1], [-96, 724, 2.5, 0], [-140, 718, 2.6, 2], [-124, 716, 2.8, 3],

    // 3. Taman Segitiga Masuk & Taman Timur Laut
    [-34, 710, 2.6, 2], [-42, 736, 2.5, 3], [-48, 764, 2.6, 0], [-54, 772, 2.5, 1],
    [-36, 756, 2.4, 2], [-44, 776, 2.5, 3],

    // 4. Sabuk Hijau Tanggul Timur (Di Sisi Timur Graha Pelindo)
    [-66, 778, 2.6, 0], [-80, 778, 2.7, 1], [-96, 778, 2.6, 2], [-112, 778, 2.5, 3],
    [-128, 778, 2.7, 0], [-144, 778, 2.6, 1], [-160, 778, 2.5, 2], [-174, 778, 2.4, 3],

    // 5. Sabuk Hijau Tanggul Barat (Barat Lapangan & Masjid)
    [-46, 646, 2.5, 1], [-60, 646, 2.6, 2], [-74, 646, 2.5, 3], [-88, 646, 2.6, 0],
    [-102, 646, 2.5, 1], [-116, 646, 2.7, 2],

    // 6. Sabuk Hijau Tanggul Selatan (Selatan Parkiran)
    [-194, 730, 2.5, 0], [-194, 742, 2.6, 1], [-194, 754, 2.7, 2], [-194, 766, 2.5, 3],
    [-194, 776, 2.4, 0]
  ];
  headOfficeTrees.forEach(tc => {
    addSatelliteTree(southComplex, tc[0], tc[1], tc[2], tc[3]);
  });

  islandGroup.add(southComplex);

  // ============================================================================
  // 4. MAIN GATE INBOUND: KANOPI GERBANG TOL MODERN (MODERN PORT TOLL PLAZA)
  // Bentuk busur lengkung melintang di atas 4 lajur masuk Z in [872, 904]
  // Sisi outbound (-X) tetap terbuka tanpa kanopi persis seperti di citra satelit
  // ============================================================================
  const mainGateGroup = new THREE.Group();
  mainGateGroup.position.set(0, 1.63, 0);

  // Parameter Geometri Kanopi Gerbang Tol (Toll Plaza Canopy)
  const gateXMin = 0.6;   // Sisi median pemisah jalan
  const gateXMax = 17.2;  // Sisi luar bahu jalan utara
  const gateWidth = gateXMax - gateXMin; // 16.6m melintasi 4 lajur pemeriksaan
  const gateCenterX = (gateXMin + gateXMax) / 2; // 8.9m
  const gateRadius = gateWidth / 2; // 8.3m
  const gateZStart = 872.0;
  const gateZEnd = 904.0;
  const gateLength = gateZEnd - gateZStart; // 32.0m
  const gateClearanceY = 5.5; // Tinggi bebas truk petikemas (5.5m)
  const gateArchRise = 1.5;   // Lengkungan busur naik ke puncak (7.0m)
  const gateSlabThick = 0.28; // Ketebalan pelat atap kanopi

  // 1. Profil 2D Atap Lengkung Busur (Arch Barrel-Vault Canopy Roof)
  const archRoofShape = new THREE.Shape();
  const archSteps = 24;

  // Lengkung Bawah (Underside of Arch: dari kiri u = -1 ke kanan u = +1)
  for (let i = 0; i <= archSteps; i++) {
    const u = -1.0 + 2.0 * (i / archSteps);
    const x = gateCenterX + u * gateRadius;
    const y = gateClearanceY + gateArchRise * (1.0 - u * u);
    if (i === 0) archRoofShape.moveTo(x, y);
    else archRoofShape.lineTo(x, y);
  }
  // Lengkung Atas (Top Surface of Arch: dari kanan u = +1 kembali ke kiri u = -1)
  for (let i = archSteps; i >= 0; i--) {
    const u = -1.0 + 2.0 * (i / archSteps);
    const x = gateCenterX + u * gateRadius;
    const y = gateClearanceY + gateArchRise * (1.0 - u * u) + gateSlabThick;
    archRoofShape.lineTo(x, y);
  }
  archRoofShape.closePath();

  // Ekstrusi Memanjang Searah Jalan (Z: 872 s/d 904)
  const archRoofGeo = new THREE.ExtrudeGeometry(archRoofShape, {
    depth: gateLength,
    bevelEnabled: false,
    steps: 1
  });
  const archRoofMat = new THREE.MeshStandardMaterial({
    color: 0xd0d6dc, // Galvalume silver metallic khas atap gerbang pelabuhan
    roughness: 0.38,
    metalness: 0.22,
    side: THREE.DoubleSide
  });
  const archRoof = new THREE.Mesh(archRoofGeo, archRoofMat);
  archRoof.position.set(0, 0, gateZStart);
  archRoof.castShadow = true;
  archRoof.receiveShadow = true;
  mainGateGroup.add(archRoof);

  // 2. Rusuk Busur Melintang (Standing-Seam Transverse Ribs) Setiap 4m Sesuai Citra Satelit
  const ribShape = new THREE.Shape();
  for (let i = 0; i <= archSteps; i++) {
    const u = -1.0 + 2.0 * (i / archSteps);
    const x = gateCenterX + u * (gateRadius + 0.05);
    const y = gateClearanceY + gateArchRise * (1.0 - u * u) + gateSlabThick - 0.02;
    if (i === 0) ribShape.moveTo(x, y);
    else ribShape.lineTo(x, y);
  }
  for (let i = archSteps; i >= 0; i--) {
    const u = -1.0 + 2.0 * (i / archSteps);
    const x = gateCenterX + u * (gateRadius + 0.05);
    const y = gateClearanceY + gateArchRise * (1.0 - u * u) + gateSlabThick + 0.12;
    ribShape.lineTo(x, y);
  }
  ribShape.closePath();

  const ribGeo = new THREE.ExtrudeGeometry(ribShape, { depth: 0.25, bevelEnabled: false, steps: 1 });
  const gateRibMat = new THREE.MeshStandardMaterial({ color: 0x64748b, roughness: 0.45, metalness: 0.5 });

  for (let pz = gateZStart; pz <= gateZEnd; pz += 4.0) {
    const isPortal = Math.abs(pz - gateZStart) < 0.1 || Math.abs(pz - gateZEnd) < 0.1;
    const rMesh = new THREE.Mesh(ribGeo, isPortal ? gateBlueMat : gateRibMat);
    rMesh.position.set(0, 0, pz);
    rMesh.castShadow = true;
    mainGateGroup.add(rMesh);
  }

  // 3. Papan Nama Gerbang Pelindo (Header Signboard pada Portal Masuk Z = 872)
  const signBoard = new THREE.Mesh(new THREE.BoxGeometry(11.2, 0.95, 0.25), gateBlueMat);
  signBoard.position.set(gateCenterX, gateClearanceY + gateArchRise + 0.48, gateZStart - 0.15);
  signBoard.castShadow = true;
  mainGateGroup.add(signBoard);

  const signTextFace = new THREE.Mesh(new THREE.PlaneGeometry(10.6, 0.7), buildingWallMat);
  signTextFace.position.set(gateCenterX, gateClearanceY + gateArchRise + 0.48, gateZStart - 0.29);
  mainGateGroup.add(signTextFace);

  // 4. Pilar-Pilar Baja Penopang Kanopi (Support Columns)
  // A. Barisan Kolom Sisi Median (X = 0.7m)
  [873.0, 880.5, 888.0, 895.5, 903.0].forEach(pz => {
    const colMedian = new THREE.Mesh(new THREE.CylinderGeometry(0.22, 0.26, gateClearanceY, 12), steelMat);
    colMedian.position.set(gateXMin + 0.1, gateClearanceY / 2, pz);
    colMedian.castShadow = true;
    mainGateGroup.add(colMedian);

    const baseMed = new THREE.Mesh(new THREE.BoxGeometry(0.65, 0.35, 0.65), curbHazardWhiteMat);
    baseMed.position.set(gateXMin + 0.1, 0.175, pz);
    mainGateGroup.add(baseMed);
  });

  // B. Barisan Kolom Sisi Luar Bahu Utara (X = 17.1m)
  [873.0, 880.5, 888.0, 895.5, 903.0].forEach(pz => {
    const colOuter = new THREE.Mesh(new THREE.CylinderGeometry(0.22, 0.26, gateClearanceY, 12), steelMat);
    colOuter.position.set(gateXMax - 0.1, gateClearanceY / 2, pz);
    colOuter.castShadow = true;
    mainGateGroup.add(colOuter);

    const baseOuter = new THREE.Mesh(new THREE.BoxGeometry(0.65, 0.35, 0.65), curbHazardWhiteMat);
    baseOuter.position.set(gateXMax - 0.1, 0.175, pz);
    mainGateGroup.add(baseOuter);
  });

  // 5. Pulau Tol & Gardu Pemeriksaan (Toll Splitter Islands & Booths)
  // 3 Pulau Pemisah terletak tepat di garis batas lajur: X = [5.05, 8.85, 12.65]
  // Membagi jalan menjadi 4 lajur lalu lintas truk dengan pusat di:
  // Lajur 1: X = 3.175, Lajur 2: X = 6.95, Lajur 3: X = 10.75, Lajur 4: X = 14.575
  const splitterIslandX = [5.05, 8.85, 12.65];
  const gateCenterZ = 888.0;

  splitterIslandX.forEach((bx) => {
    // A. Pulau Kanstin Beton Pembatas (Panjang 22m, Lebar 0.85m)
    const isl = new THREE.Mesh(new THREE.BoxGeometry(0.85, 0.28, 22.0), curbHazardWhiteMat);
    isl.position.set(bx, 0.14, gateCenterZ);
    isl.castShadow = true;
    mainGateGroup.add(isl);

    // Hazard Stripes Hitam di Ujung Depan & Belakang Kanstin
    [-10.4, 10.4].forEach(bz => {
      const hzTip = new THREE.Mesh(new THREE.BoxGeometry(0.87, 0.29, 1.2), curbHazardBlackMat);
      hzTip.position.set(bx, 0.145, gateCenterZ + bz);
      mainGateGroup.add(hzTip);
    });

    // B. Kolom Penyangga Tambahan di Ujung Pulau
    const uX = (bx - gateCenterX) / gateRadius;
    const archH = gateClearanceY + gateArchRise * (1.0 - uX * uX);
    const colLen = archH - 0.28;
    [-9.0, 9.0].forEach(bz => {
      const pCol = new THREE.Mesh(new THREE.CylinderGeometry(0.12, 0.14, colLen, 10), steelMat);
      pCol.position.set(bx, 0.28 + colLen / 2, gateCenterZ + bz);
      pCol.castShadow = true;
      mainGateGroup.add(pCol);
    });

    // C. Gardu Tol Modern (Toll Booth)
    const boothBody = new THREE.Mesh(new THREE.BoxGeometry(0.80, 2.5, 3.2), buildingWallMat);
    boothBody.position.set(bx, 0.28 + 1.25, gateCenterZ);
    boothBody.castShadow = true;
    mainGateGroup.add(boothBody);

    // Plinth / Lis Bawah Gardu
    const boothPlinth = new THREE.Mesh(new THREE.BoxGeometry(0.82, 0.35, 3.22), buildingDarkTrimMat);
    boothPlinth.position.set(bx, 0.28 + 0.175, gateCenterZ);
    mainGateGroup.add(boothPlinth);

    // Kaca Jendela Observasi Gardu
    const boothWin = new THREE.Mesh(new THREE.BoxGeometry(0.84, 0.95, 2.2), glassWindowMat);
    boothWin.position.set(bx, 0.28 + 1.35, gateCenterZ);
    mainGateGroup.add(boothWin);

    // Kanopi Atap Kecil Gardu
    const boothRoof = new THREE.Mesh(new THREE.BoxGeometry(0.92, 0.14, 3.4), gateBlueMat);
    boothRoof.position.set(bx, 0.28 + 2.5 + 0.07, gateCenterZ);
    boothRoof.castShadow = true;
    mainGateGroup.add(boothRoof);

    // D. Palang Tol Otomatis (Automatic Boom Barrier)
    const barrierBase = new THREE.Mesh(new THREE.BoxGeometry(0.32, 0.95, 0.32), boomBarrierMat);
    barrierBase.position.set(bx - 0.25, 0.28 + 0.475, gateCenterZ + 2.8);
    barrierBase.castShadow = true;
    mainGateGroup.add(barrierBase);

    const barrierArm = new THREE.Mesh(new THREE.BoxGeometry(2.8, 0.09, 0.07), curbHazardWhiteMat);
    barrierArm.position.set(bx - 1.65, 0.28 + 0.78, gateCenterZ + 2.8);
    barrierArm.castShadow = true;
    mainGateGroup.add(barrierArm);

    // Garis Merah pada Palang
    for (let rx = -1.2; rx <= 1.2; rx += 0.6) {
      const redStripe = new THREE.Mesh(new THREE.BoxGeometry(0.18, 0.1, 0.08), boomBarrierMat);
      redStripe.position.set(bx - 1.65 + rx, 0.28 + 0.78, gateCenterZ + 2.8);
      mainGateGroup.add(redStripe);
    }
  });

  // E. Trotoar Kanstin Sisi Luar Bahu Utara & Palang Tol Lajur 4 (Outer Lane 4 Equipment)
  const outerCurbX = 16.7;
  const outerIsl = new THREE.Mesh(new THREE.BoxGeometry(0.85, 0.28, 22.0), curbHazardWhiteMat);
  outerIsl.position.set(outerCurbX, 0.14, gateCenterZ);
  outerIsl.castShadow = true;
  mainGateGroup.add(outerIsl);

  [-10.4, 10.4].forEach(bz => {
    const hzTip = new THREE.Mesh(new THREE.BoxGeometry(0.87, 0.29, 1.2), curbHazardBlackMat);
    hzTip.position.set(outerCurbX, 0.145, gateCenterZ + bz);
    mainGateGroup.add(hzTip);
  });

  // Pos Jaga / Gardu Sisi Luar Bahu
  const outerBoothBody = new THREE.Mesh(new THREE.BoxGeometry(0.80, 2.5, 3.2), buildingWallMat);
  outerBoothBody.position.set(outerCurbX, 0.28 + 1.25, gateCenterZ);
  outerBoothBody.castShadow = true;
  mainGateGroup.add(outerBoothBody);

  const outerBoothWin = new THREE.Mesh(new THREE.BoxGeometry(0.84, 0.95, 2.2), glassWindowMat);
  outerBoothWin.position.set(outerCurbX, 0.28 + 1.35, gateCenterZ);
  mainGateGroup.add(outerBoothWin);

  const outerBoothRoof = new THREE.Mesh(new THREE.BoxGeometry(0.92, 0.14, 3.4), gateBlueMat);
  outerBoothRoof.position.set(outerCurbX, 0.28 + 2.5 + 0.07, gateCenterZ);
  mainGateGroup.add(outerBoothRoof);

  // Palang Tol Otomatis Lajur 4
  const barrierBase4 = new THREE.Mesh(new THREE.BoxGeometry(0.32, 0.95, 0.32), boomBarrierMat);
  barrierBase4.position.set(outerCurbX - 0.25, 0.28 + 0.475, gateCenterZ + 2.8);
  barrierBase4.castShadow = true;
  mainGateGroup.add(barrierBase4);

  const barrierArm4 = new THREE.Mesh(new THREE.BoxGeometry(2.8, 0.09, 0.07), curbHazardWhiteMat);
  barrierArm4.position.set(outerCurbX - 1.65, 0.28 + 0.78, gateCenterZ + 2.8);
  barrierArm4.castShadow = true;
  mainGateGroup.add(barrierArm4);

  for (let rx = -1.2; rx <= 1.2; rx += 0.6) {
    const redStripe = new THREE.Mesh(new THREE.BoxGeometry(0.18, 0.1, 0.08), boomBarrierMat);
    redStripe.position.set(outerCurbX - 1.65 + rx, 0.28 + 0.78, gateCenterZ + 2.8);
    mainGateGroup.add(redStripe);
  }

  // 6. Lampu Indikator Lajur (Green LED Lane Signals) di Portal Masuk Kanopi (Z = 871.8)
  const laneCentersX = [3.175, 6.95, 10.75, 14.575];
  laneCentersX.forEach((lx, idx) => {
    const uX = (lx - gateCenterX) / gateRadius;
    const archH = gateClearanceY + gateArchRise * (1.0 - uX * uX);

    // Kotak Lampu Sinyal
    const sigBox = new THREE.Mesh(new THREE.BoxGeometry(0.65, 0.45, 0.25), buildingDarkTrimMat);
    sigBox.position.set(lx, archH - 0.45, gateZStart - 0.1);
    sigBox.castShadow = true;
    mainGateGroup.add(sigBox);

    // Lensa LED Hijau (Panah / Indikator Aktif)
    const sigLens = new THREE.Mesh(new THREE.BoxGeometry(0.42, 0.32, 0.05), ledGreenArrowMat);
    sigLens.position.set(lx, archH - 0.45, gateZStart - 0.23);
    mainGateGroup.add(sigLens);

    // Plat Nomor Lajur (01, 02, 03, 04)
    const numPlate = new THREE.Mesh(new THREE.BoxGeometry(0.5, 0.3, 0.06), buildingWallMat);
    numPlate.position.set(lx, archH - 0.9, gateZStart - 0.1);
    mainGateGroup.add(numPlate);
  });

  islandGroup.add(mainGateGroup);

  // ============================================================================
  // 5. ZONA UTARA (+X): KAWASAN UTILITAS, DEPO PETIKEMAS & LAPANGAN STAGING
  // Didesain Presisi Mencerminkan Citra Satelit Apple Maps (Arsitektur Blocky Low-Memory)
  // ============================================================================
  const northComplex = new THREE.Group();
  northComplex.position.set(0, 1.63, 0);

  // ----------------------------------------------------------------------------
  // Shared Specialized Materials (Hemat Memori & Kinerja Tinggi)
  // ----------------------------------------------------------------------------
  const portacampBlueMat = new THREE.MeshStandardMaterial({ color: 0x0284c7, roughness: 0.45, metalness: 0.1 });
  const portacampWhiteMat = new THREE.MeshStandardMaterial({ color: 0xf8fafc, roughness: 0.4 });
  const tankBlackMat = new THREE.MeshStandardMaterial({ color: 0x181e24, roughness: 0.6, metalness: 0.35 });
  const tankPadMat = new THREE.MeshStandardMaterial({ color: 0x94a3b8, roughness: 0.85 });
  const runnerConcreteMat = new THREE.MeshStandardMaterial({ color: 0x64748b, roughness: 0.85 });
  const truckCabColors = [0xdc2626, 0xf8fafc, 0x16a34a, 0xca8a04, 0x0284c7, 0x1e293b, 0xea580c];

  // Helper: Unit Kontainer Kantor Portable (Porta-camp Biru Khas Pelabuhan)
  const addPortaCabin = (parent, w, l, x, z, rotY = 0, colorHex = 0x0284c7) => {
    const cabin = new THREE.Group();
    cabin.position.set(x, 1.3, z);
    cabin.rotation.y = rotY;

    const bMat = colorHex === 0x0284c7 ? portacampBlueMat : new THREE.MeshStandardMaterial({ color: colorHex, roughness: 0.45 });
    const bMesh = new THREE.Mesh(new THREE.BoxGeometry(w, 2.6, l), bMat);
    bMesh.castShadow = true;
    bMesh.receiveShadow = true;
    cabin.add(bMesh);

    const rMesh = new THREE.Mesh(new THREE.BoxGeometry(w + 0.2, 0.15, l + 0.2), portacampWhiteMat);
    rMesh.position.set(0, 1.35, 0);
    cabin.add(rMesh);

    const door = new THREE.Mesh(new THREE.PlaneGeometry(0.85, 1.9), portacampWhiteMat);
    door.position.set(0, -0.3, l / 2 + 0.01);
    cabin.add(door);

    parent.add(cabin);
  };

  // Helper: Tangki Silinder Horizontal pada Dudukan Beton
  const addHorizontalTank = (parent, radius, length, x, z, rotY = 0) => {
    const tank = new THREE.Group();
    tank.position.set(x, 0, z);
    tank.rotation.y = rotY;

    // 2 Dudukan Beton
    [-length * 0.3, length * 0.3].forEach(pz => {
      const cradle = new THREE.Mesh(new THREE.BoxGeometry(radius * 2.2, radius * 0.7, 0.8), officePavementMat);
      cradle.position.set(0, radius * 0.35, pz);
      tank.add(cradle);
    });

    // Badan Silinder Tangki Hitam
    const cylGeo = new THREE.CylinderGeometry(radius, radius, length, 12);
    cylGeo.rotateX(Math.PI / 2);
    const cyl = new THREE.Mesh(cylGeo, tankBlackMat);
    cyl.position.set(0, radius + 0.25, 0);
    cyl.castShadow = true;
    tank.add(cyl);

    parent.add(tank);
  };

  // Helper: Gudang / Workshop Shed Beratap Pelana Segitiga (Low-poly Blocky)
  const addGableShed = (parent, w, h, l, x, z) => {
    const shed = new THREE.Group();
    shed.position.set(x, 0, z);

    // Badan Bangunan
    const body = new THREE.Mesh(new THREE.BoxGeometry(w, h, l), massingWarehouseMat);
    body.position.set(0, h / 2, 0);
    body.castShadow = true;
    body.receiveShadow = true;
    shed.add(body);

    // Atap Pelana Seng Bergaris
    const roofShape = new THREE.Shape();
    roofShape.moveTo(-w / 2 - 0.25, 0);
    roofShape.lineTo(0, 1.35);
    roofShape.lineTo(w / 2 + 0.25, 0);
    roofShape.closePath();
    const roofGeo = new THREE.ExtrudeGeometry(roofShape, { depth: l + 0.6, bevelEnabled: false });
    roofGeo.translate(0, 0, -(l + 0.6) / 2);
    const roofMesh = new THREE.Mesh(roofGeo, massingRoofMat);
    roofMesh.position.set(0, h, 0);
    roofMesh.castShadow = true;
    shed.add(roofMesh);

    // Pintu Roll Door Pelayanan Servis di Sisi Dinding
    for (let pz = -l / 2 + 5.0; pz <= l / 2 - 5.0; pz += 10.0) {
      const door = new THREE.Mesh(new THREE.PlaneGeometry(3.6, 3.2), massingDarkSlateMat);
      door.position.set(w / 2 + 0.02, 1.6, pz);
      door.rotation.y = Math.PI / 2;
      shed.add(door);
    }
    parent.add(shed);
  };

  // Helper: Truk Prime Mover & Trailer Kontainer untuk Antrean Tunggu & Staging
  const addParkedTruck = (parent, x, z, rotY = 0, cabColorHex = 0xdc2626, contColorHex = null) => {
    const truck = new THREE.Group();
    truck.position.set(x, 0, z);
    truck.rotation.y = rotY;

    // Kabin Kepala Truk
    const cabMat = new THREE.MeshStandardMaterial({ color: cabColorHex, roughness: 0.4 });
    const cab = new THREE.Mesh(new THREE.BoxGeometry(2.4, 2.7, 2.6), cabMat);
    cab.position.set(0, 1.55, 3.8);
    cab.castShadow = true;
    truck.add(cab);

    // Kaca Kabin
    const win = new THREE.Mesh(new THREE.BoxGeometry(2.42, 0.85, 1.7), vehicleWindowMat);
    win.position.set(0, 2.05, 4.0);
    truck.add(win);

    // Rangka Sasis Trailer Hitam
    const ch = new THREE.Mesh(new THREE.BoxGeometry(2.4, 0.45, 12.2), steelMat);
    ch.position.set(0, 0.75, -1.8);
    ch.castShadow = true;
    truck.add(ch);

    // Roda Ban Truk (3 Pasang)
    [-1.15, 1.15].forEach(wx => {
      [3.8, -4.6, -6.6].forEach(wz => {
        const wh = new THREE.Mesh(new THREE.CylinderGeometry(0.48, 0.48, 0.35, 8), wheelBlackMat);
        wh.rotation.z = Math.PI / 2;
        wh.position.set(wx, 0.48, wz);
        truck.add(wh);
      });
    });

    // Kontainer Muatan (Jika Ada)
    if (contColorHex !== null) {
      const contMat = new THREE.MeshStandardMaterial({ color: contColorHex, roughness: 0.55, metalness: 0.15 });
      const cont = new THREE.Mesh(new THREE.BoxGeometry(2.44, 2.59, 12.19), contMat);
      cont.position.set(0, 2.27, -1.8);
      cont.castShadow = true;
      truck.add(cont);
      const edge = new THREE.LineSegments(new THREE.EdgesGeometry(cont.geometry), edgeContDarkMat);
      cont.add(edge);
    }
    parent.add(truck);
  };

  // Helper: Tumpukan Kontainer Multi-Tier yang Realistis (Presisi 20ft & 40ft)
  const addRealisticContainerStack = (parent, countBays, tiers, x, z, colorHexList, rotY = 0) => {
    const stack = new THREE.Group();
    stack.position.set(x, 0, z);
    stack.rotation.y = rotY;

    const cH = 2.59;
    const cW = 2.44;
    let cIdx = 0;

    for (let t = 0; t < tiers; t++) {
      const y = t * cH + cH / 2;
      for (let b = 0; b < countBays; b++) {
        const cX = (b - (countBays - 1) / 2) * (cW + 0.12);
        const col = colorHexList[cIdx % colorHexList.length];
        cIdx++;

        const cMat = new THREE.MeshStandardMaterial({ color: col, roughness: 0.55, metalness: 0.15 });
        const boxGeo = new THREE.BoxGeometry(cW, cH, 12.19);
        const box = new THREE.Mesh(boxGeo, cMat);
        box.position.set(cX, y, 0);
        box.castShadow = true;
        box.receiveShadow = true;
        stack.add(box);

        const edge = new THREE.LineSegments(new THREE.EdgesGeometry(boxGeo), edgeContDarkMat);
        box.add(edge);
      }
    }
    parent.add(stack);
  };

  // ----------------------------------------------------------------------------
  // A. KAWASAN UTILITAS, BENGKEL & KANTOR OPERASIONAL (+X in [24, 140], Z in [630, 746])
  // Tata Letak Presisi Sesuai Citra Satelit Apple Maps:
  // - Lahan Terbuka Semak/Tanah Alami (Scrubland & Wild Grass) di Sisi Barat Laut
  // - Kompleks Tangki Bahan Bakar & Porta-Camps Berpagar Rapi di Sisi Selatan
  // - Gedung Kantor Operasional & Parkiran Mobil Beraspal
  // - Gudang/Workshop Sheds, Bak Pendingin & Gardu Trafo Substation
  // ----------------------------------------------------------------------------

  const scrublandMat = new THREE.MeshStandardMaterial({
    color: 0x746a53, // Tan/golden-brown dry coastal scrubland
    roughness: 0.96,
    metalness: 0.05
  });
  const scrublandGrassMat = new THREE.MeshStandardMaterial({
    color: 0x586044, // Olive-brown wild grass patches
    roughness: 0.95
  });
  const utilityGravelMat = new THREE.MeshStandardMaterial({
    color: 0x828b94, // Compacted industrial gravel/concrete pad
    roughness: 0.88,
    metalness: 0.1
  });
  const fenceWireMat3 = new THREE.MeshStandardMaterial({
    color: 0x475569,
    roughness: 0.6,
    wireframe: true
  });

  // 0. LAHAN TERBUKA SEMAK & TANAH ALAMI (Dihapus sesuai permintaan screenshot)

  // Bercak-bercak Rumput Liar Kering pada Lahan Terbuka
  const grassPatch1 = new THREE.Mesh(new THREE.PlaneGeometry(36, 32), scrublandGrassMat);
  grassPatch1.rotation.x = -Math.PI / 2;
  grassPatch1.position.set(58, 0.004, 665);
  grassPatch1.receiveShadow = true;
  northComplex.add(grassPatch1);

  const grassPatch2 = new THREE.Mesh(new THREE.PlaneGeometry(28, 24), scrublandGrassMat);
  grassPatch2.rotation.x = -Math.PI / 2;
  grassPatch2.position.set(95, 0.004, 685);
  grassPatch2.receiveShadow = true;
  northComplex.add(grassPatch2);

  // Gardu Pompa / Pondok Kecil di Sudut Barat Daya (X = 22, Z = 634) - Sesuai Foto Satelit
  const pumpShack = createMassingBuilding(3.2, 2.4, 4.0, 22, 634, 0, massingWarehouseMat);
  northComplex.add(pumpShack);
  addSatelliteTree(northComplex, 26, 634, 2.2, 1);
  addSatelliteTree(northComplex, 20, 638, 2.4, 2);

  // Deretan Pepohonan & Semak Liar Tersebar Alami di Lahan Semak (Persis Gugusan Foto Satelit)
  const wildScrubTrees = [
    [38, 644, 2.5, 0], [45, 648, 2.7, 1], [56, 654, 2.8, 2], [68, 664, 2.6, 3],
    [80, 672, 2.9, 0], [92, 678, 2.5, 1], [105, 686, 2.8, 2], [118, 692, 2.6, 3],
    [50, 640, 2.3, 1], [72, 650, 2.5, 2], [88, 662, 2.7, 0], [102, 675, 2.4, 3],
    [64, 676, 2.6, 1], [78, 685, 2.8, 2], [90, 695, 2.5, 0], [104, 702, 2.7, 1]
  ];
  wildScrubTrees.forEach(wt => {
    addSatelliteTree(northComplex, wt[0], wt[1], wt[2], wt[3]);
  });

  // Semak-semak Bulat Alami
  [
    [34, 640], [48, 646], [62, 658], [75, 668], [88, 675], [98, 682], [112, 690]
  ].forEach(bp => {
    const bsh = new THREE.Mesh(new THREE.SphereGeometry(1.2, 6, 5), bushGreenMat);
    bsh.scale.set(1.3, 0.7, 1.3);
    bsh.position.set(bp[0], 0.6, bp[1]);
    northComplex.add(bsh);
  });

  // 1. KOMPLEKS TANGKI BAHAN BAKAR & KONTAINER BIRU (X in [28, 62], Z in [648, 688])
  // Pelataran Kerikil/Beton Padat Khusus Area Tangki Berpagar (Strictly Bounded)
  const tankCompoundYard = new THREE.Mesh(new THREE.PlaneGeometry(34, 40), utilityGravelMat);
  tankCompoundYard.rotation.x = -Math.PI / 2;
  tankCompoundYard.position.set(45, 0.006, 668);
  tankCompoundYard.receiveShadow = true;
  northComplex.add(tankCompoundYard);

  // Jalan Akses Masuk Beraspal dari Jalan Utama ke Gerbang Tangki
  const tankDriveway = new THREE.Mesh(new THREE.PlaneGeometry(8, 12), campusRoadMat);
  tankDriveway.rotation.x = -Math.PI / 2;
  tankDriveway.position.set(45, 0.007, 644);
  tankDriveway.receiveShadow = true;
  northComplex.add(tankDriveway);

  // Pagar Pengaman Kawat Keliling Kompleks Tangki
  const fenceH = 1.8;
  const addFenceSeg = (x1, z1, x2, z2) => {
    const dx = x2 - x1;
    const dz = z2 - z1;
    const len = Math.sqrt(dx * dx + dz * dz);
    const ang = Math.atan2(dz, dx);
    const fMesh = new THREE.Mesh(new THREE.PlaneGeometry(len, fenceH), fenceWireMat3);
    fMesh.position.set(x1 + dx / 2, fenceH / 2, z1 + dz / 2);
    fMesh.rotation.y = -ang;
    northComplex.add(fMesh);
  };
  addFenceSeg(28, 648, 28, 688); // Barat
  addFenceSeg(28, 688, 62, 688); // Utara
  addFenceSeg(62, 688, 62, 648); // Timur
  addFenceSeg(28, 648, 41, 648); // Selatan kiri
  addFenceSeg(49, 648, 62, 648); // Selatan kanan

  // Tanggul Beton Rendah Pengaman Tangki (Bund Wall)
  const bundWall = new THREE.Mesh(new THREE.BoxGeometry(22.0, 0.4, 28.0), curbHazardWhiteMat);
  bundWall.position.set(45, 0.2, 669);
  northComplex.add(bundWall);

  const tankPad = new THREE.Mesh(new THREE.PlaneGeometry(21.4, 27.4), tankPadMat);
  tankPad.rotation.x = -Math.PI / 2;
  tankPad.position.set(45, 0.008, 669);
  tankPad.receiveShadow = true;
  northComplex.add(tankPad);

  // 2 Baris Tangki Silinder Hitam Sejajar (Persis Foto Satelit)
  [661, 669, 677].forEach(tz => {
    addHorizontalTank(northComplex, 1.35, 6.0, 40, tz, 0);
    addHorizontalTank(northComplex, 1.35, 6.0, 50, tz, 0);
  });

  // Deretan Unit Kontainer Kantor Portable Biru (Porta-camps) Sesuai Citra Satelit
  // Sisi Barat
  addPortaCabin(northComplex, 2.5, 6.0, 31, 660, 0, 0x0284c7);
  addPortaCabin(northComplex, 2.5, 6.0, 31, 674, 0, 0x0284c7);
  // Sisi Utara
  addPortaCabin(northComplex, 6.0, 2.5, 38, 685, 0, 0x0284c7);
  addPortaCabin(northComplex, 6.0, 2.5, 52, 685, 0, 0x0284c7);
  // Sisi Selatan
  addPortaCabin(northComplex, 5.5, 2.5, 35, 651, 0, 0x0284c7);
  addPortaCabin(northComplex, 5.5, 2.5, 55, 651, 0, 0x0284c7);
  // Sisi Timur
  addPortaCabin(northComplex, 2.5, 6.0, 59, 664, 0, 0x0284c7);
  addPortaCabin(northComplex, 2.5, 6.0, 59, 676, 0, 0x0284c7);

  // 2. KANTOR OPERASIONAL & LAPANGAN PARKIR (X in [26, 66], Z in [694, 738])
  // Pelataran Parkir Beraspal
  const opParkingLot = new THREE.Mesh(new THREE.PlaneGeometry(38, 42), parkingAsphaltMat);
  opParkingLot.rotation.x = -Math.PI / 2;
  opParkingLot.position.set(46, 0.006, 716);
  opParkingLot.receiveShadow = true;
  northComplex.add(opParkingLot);

  // Trotoar Beton Keliling Gedung
  const opSidewalk = new THREE.Mesh(new THREE.PlaneGeometry(26, 20), officePavementMat);
  opSidewalk.rotation.x = -Math.PI / 2;
  opSidewalk.position.set(46, 0.008, 712);
  opSidewalk.receiveShadow = true;
  northComplex.add(opSidewalk);

  // Gedung Kantor Operasional Blocky 2-Lantai
  const opBldgGroup = new THREE.Group();
  opBldgGroup.position.set(46, 0, 712);

  const opMain = new THREE.Mesh(new THREE.BoxGeometry(20.0, 7.2, 14.0), massingWhiteMat);
  opMain.position.set(0, 3.6, 0);
  opMain.castShadow = true;
  opMain.receiveShadow = true;
  opBldgGroup.add(opMain);

  const opRoof = new THREE.Mesh(new THREE.BoxGeometry(21.0, 1.2, 15.0), massingRoofMat);
  opRoof.position.set(0, 7.8, 0);
  opRoof.castShadow = true;
  opBldgGroup.add(opRoof);

  const opCanopy = new THREE.Mesh(new THREE.BoxGeometry(5.5, 0.35, 6.0), massingRoofMat);
  opCanopy.position.set(-11.5, 3.8, 0);
  opCanopy.castShadow = true;
  opBldgGroup.add(opCanopy);

  [-2.4, 2.4].forEach(cz => {
    const cPole = new THREE.Mesh(new THREE.CylinderGeometry(0.12, 0.12, 3.8, 6), steelMat);
    cPole.position.set(-13.8, 1.9, cz);
    opBldgGroup.add(cPole);
  });

  const winStrip1 = new THREE.Mesh(new THREE.BoxGeometry(20.2, 1.1, 10.5), massingGlassAquaMat);
  winStrip1.position.set(0, 2.4, 0);
  opBldgGroup.add(winStrip1);
  const winStrip2 = new THREE.Mesh(new THREE.BoxGeometry(20.2, 1.1, 10.5), massingGlassAquaMat);
  winStrip2.position.set(0, 5.2, 0);
  opBldgGroup.add(winStrip2);

  northComplex.add(opBldgGroup);

  // Mobil Terparkir di Halaman Kantor
  [
    [32, 702, 0xf8fafc], [32, 708, 0x1e293b], [32, 714, 0xca8a04], [32, 720, 0xdc2626],
    [58, 702, 0xf8fafc], [58, 708, 0x94a3b8], [58, 714, 0x1e293b], [58, 720, 0x0284c7]
  ].forEach(car => addParkedCar(northComplex, car[0], car[1], Math.PI / 2, car[2]));

  // POHON RINDANG & TAMAN PEMBATAS KANTOR & SHEDS (SANGAT IKONIK DI FOTO SATELIT!)
  // A. Hamparan Rumput Hijau Taman Kantor
  const opGardenLawn1 = new THREE.Mesh(new THREE.PlaneGeometry(26, 46), officeLawnMat);
  opGardenLawn1.rotation.x = -Math.PI / 2;
  opGardenLawn1.position.set(56, 0.007, 720);
  opGardenLawn1.receiveShadow = true;
  northComplex.add(opGardenLawn1);

  const opGardenLawn2 = new THREE.Mesh(new THREE.PlaneGeometry(22, 28), officeLawnMat);
  opGardenLawn2.rotation.x = -Math.PI / 2;
  opGardenLawn2.position.set(34, 0.007, 692);
  opGardenLawn2.receiveShadow = true;
  northComplex.add(opGardenLawn2);

  // B. Taman Barat / Halaman Depan Kantor (West Grove: Persis Foto Satelit)
  [
    [32, 688, 3.4, 0], [25, 694, 2.8, 1], [38, 690, 3.6, 2],
    [26, 706, 3.0, 3], [35, 696, 3.8, 1], [44, 688, 3.2, 0]
  ].forEach(gt => {
    addSatelliteTree(northComplex, gt[0], gt[1], gt[2], gt[3]);
    addBushCluster(northComplex, gt[0] + 1.2, gt[1] - 1.0, 1.3, gt[3]);
  });

  // C. Sabuk Pohon Rindang Pemisah Kantor & 3 Gudang Workshop (East Divider Park)
  [
    [50, 734, 4.4, 0], [58, 732, 3.4, 1], [52, 742, 4.0, 2], [62, 738, 3.6, 3],
    [48, 724, 3.2, 1], [64, 726, 3.0, 2]
  ].forEach(dt => {
    addSatelliteTree(northComplex, dt[0], dt[1], dt[2], dt[3]);
    addBushCluster(northComplex, dt[0] - 1.5, dt[1] + 1.2, 1.4, dt[3]);
    addBushCluster(northComplex, dt[0] + 1.5, dt[1] - 1.4, 1.2, (dt[3] + 1) % 4);
  });

  // D. Semak & Tanaman Hias Pembatas Parkir Mobil
  for (let pz = 696; pz <= 736; pz += 6.5) {
    addBushCluster(northComplex, 64.5, pz, 1.2, Math.floor(pz / 6) % 4);
    addBushCluster(northComplex, 27.5, pz, 1.1, (Math.floor(pz / 6) + 1) % 4);
  }

  // 3. TIGA BARIS GUDANG / WORKSHOP SHEDS PARALEL (X in [68, 108], Z in [712, 746])
  // Pelataran Beton Terbatas Khusus Area Workshop
  const shedsApron = new THREE.Mesh(new THREE.PlaneGeometry(42, 36), tankPadMat);
  shedsApron.rotation.x = -Math.PI / 2;
  shedsApron.position.set(88, 0.006, 728);
  shedsApron.receiveShadow = true;
  northComplex.add(shedsApron);

  addGableShed(northComplex, 8.8, 4.6, 32.0, 74, 728);
  addGableShed(northComplex, 8.8, 4.6, 32.0, 88, 728);
  addGableShed(northComplex, 8.8, 4.6, 32.0, 102, 728);

  // Jalur Hijau & Pohon Pembatas Belakang Gudang (Shed North Perimeter)
  const shedBackLawn = new THREE.Mesh(new THREE.PlaneGeometry(12, 38), officeLawnMat);
  shedBackLawn.rotation.x = -Math.PI / 2;
  shedBackLawn.position.set(110, 0.007, 728);
  shedBackLawn.receiveShadow = true;
  northComplex.add(shedBackLawn);

  [714, 722, 730, 738, 744].forEach((bz, idx) => {
    addSatelliteTree(northComplex, 110, bz, 2.6 + (idx % 2) * 0.4, idx % 4);
    addBushCluster(northComplex, 110, bz - 2.0, 1.2, (idx + 2) % 4);
  });

  // 4. BAK PENAMPUNGAN AIR & GARDU LISTRIK (X in [110, 140], Z in [696, 734])
  // Pelataran Khusus Utilitas
  const basinPad = new THREE.Mesh(new THREE.PlaneGeometry(30, 38), tankPadMat);
  basinPad.rotation.x = -Math.PI / 2;
  basinPad.position.set(125, 0.006, 715);
  basinPad.receiveShadow = true;
  northComplex.add(basinPad);

  [705, 725].forEach(bz => {
    northComplex.add(createMassingBuilding(14.0, 1.8, 12.0, 126, bz, 0, massingRoofMat));
    const wSur = new THREE.Mesh(new THREE.PlaneGeometry(12.6, 10.6), massingGlassAquaMat);
    wSur.rotation.x = -Math.PI / 2;
    wSur.position.set(126, 1.5, bz);
    northComplex.add(wSur);
  });

  // Gardu Trafo Substation
  northComplex.add(createMassingBuilding(12.0, 4.5, 12.0, 112, 705, 0, massingWhiteMat));
  [-3.0, 3.0].forEach(tz => {
    const tr = new THREE.Mesh(new THREE.BoxGeometry(3.2, 3.0, 3.0), steelMat);
    tr.position.set(112, 1.5, 718 + tz);
    tr.castShadow = true;
    northComplex.add(tr);
  });

  // 5. JALAN AKSES INTERNAL PENGHUBUNG FASILITAS KE CY
  const spineRoad = new THREE.Mesh(new THREE.PlaneGeometry(80, 8.5), stagingAsphaltMat);
  spineRoad.rotation.x = -Math.PI / 2;
  spineRoad.rotation.z = Math.PI / 2;
  spineRoad.position.set(80, 0.007, 745);
  spineRoad.receiveShadow = true;
  northComplex.add(spineRoad);

  // ----------------------------------------------------------------------------
  // B. DEPO PETIKEMAS & AREA ANTREAN TUNGGU TRUK (+X in [25, 140], Z in [748, 978])
  // Menampilkan Tumpukan Kontainer Berwarna Pelayaran Nyata & 5 Lajur Antrean Truk
  // ----------------------------------------------------------------------------
  const cyPavement = new THREE.Mesh(new THREE.PlaneGeometry(112, 230), cyAsphaltMat);
  cyPavement.rotation.x = -Math.PI / 2;
  cyPavement.position.set(85, 0.006, 863);
  cyPavement.receiveShadow = true;
  northComplex.add(cyPavement);

  // Runner Pad Beton Fondasi di Bawah Blok Kontainer
  const topPad = new THREE.Mesh(new THREE.PlaneGeometry(14.0, 224), runnerConcreteMat);
  topPad.rotation.x = -Math.PI / 2;
  topPad.position.set(124, 0.008, 863);
  northComplex.add(topPad);

  const midPad = new THREE.Mesh(new THREE.PlaneGeometry(14.0, 215), runnerConcreteMat);
  midPad.rotation.x = -Math.PI / 2;
  midPad.position.set(84, 0.008, 863);
  northComplex.add(midPad);

  // 1. TUMPUKAN BARIS ATAS (+X in [116, 132], Z in [755, 972])
  // 8 Kluster Bay Terpisah dengan Ketinggian Variatif (1-3 Tier) & Warna Satelit
  addRealisticContainerStack(northComplex, 5, 2, 124, 765, [0x0284c7, 0x38bdf8, 0xdc2626]); // CMA CGM & Maersk
  addRealisticContainerStack(northComplex, 5, 3, 124, 792, [0xdc2626, 0x16a34a, 0xca8a04]); // Red & Evergreen
  addRealisticContainerStack(northComplex, 6, 2, 124, 822, [0xea580c, 0xf8fafc, 0x0284c7]); // Hapag & Reefer
  addRealisticContainerStack(northComplex, 6, 3, 124, 852, [0x38bdf8, 0xdc2626, 0x16a34a]); // Maersk Sky & Red
  addRealisticContainerStack(northComplex, 5, 2, 124, 882, [0xca8a04, 0x16a34a, 0xf8fafc]); // MSC Yellow & Green
  addRealisticContainerStack(northComplex, 6, 3, 124, 912, [0xf8fafc, 0x0284c7, 0xdc2626]); // White Reefer & Blue
  addRealisticContainerStack(northComplex, 5, 2, 124, 942, [0xdc2626, 0x475569, 0xea580c]); // Red & Slate Grey
  addRealisticContainerStack(northComplex, 4, 1, 124, 968, [0x0284c7, 0xf8fafc]);           // CMA CGM 1-Tier

  // 2. LORONG OPERASIONAL ALAT BERAT & REACH STACKER (X in [96, 114])
  // Unit Reach Stacker yang Bekerja di Depo
  const addReachStacker = (parent, x, z, rotY = 0) => {
    const rs = new THREE.Group();
    rs.position.set(x, 0, z);
    rs.rotation.y = rotY;

    // Body Sasis Oranye / Kuning Pelabuhan
    const b = new THREE.Mesh(new THREE.BoxGeometry(3.6, 2.4, 7.8), new THREE.MeshStandardMaterial({ color: 0xca8a04, roughness: 0.4 }));
    b.position.set(0, 1.4, 0);
    b.castShadow = true;
    rs.add(b);

    // Boom Teleskopik Miring
    const boom = new THREE.Mesh(new THREE.BoxGeometry(0.8, 1.2, 10.5), steelMat);
    boom.position.set(0, 4.8, 1.2);
    boom.rotation.x = -0.45;
    boom.castShadow = true;
    rs.add(boom);

    // Spreader Bar
    const sp = new THREE.Mesh(new THREE.BoxGeometry(2.6, 0.4, 6.2), steelMat);
    sp.position.set(0, 7.2, 4.5);
    rs.add(sp);

    // 4 Roda Ban Raksasa
    [-1.9, 1.9].forEach(wx => {
      [-2.2, 2.2].forEach(wz => {
        const wh = new THREE.Mesh(new THREE.CylinderGeometry(0.85, 0.85, 0.6, 12), wheelBlackMat);
        wh.rotation.z = Math.PI / 2;
        wh.position.set(wx, 0.85, wz);
        rs.add(wh);
      });
    });
    parent.add(rs);
  };
  addReachStacker(northComplex, 104, 815, 0);
  addReachStacker(northComplex, 104, 895, Math.PI);

  // 3. TUMPUKAN BARIS TENGAH (X in [76, 92], Z in [762, 965])
  // Tulang Punggung Kontainer Panjang & Padat (Persis Citra Satelit)
  // Kluster Barat: Putih Reefer & Biru
  addRealisticContainerStack(northComplex, 6, 2, 84, 775, [0xf8fafc, 0x38bdf8, 0xdc2626]);
  addRealisticContainerStack(northComplex, 6, 3, 84, 798, [0xdc2626, 0x0284c7, 0xf8fafc]);
  // Kluster Tengah: Biru Tua, Oranye, Merah
  addRealisticContainerStack(northComplex, 7, 3, 84, 825, [0x0284c7, 0xea580c, 0x1e293b, 0x38bdf8]);
  addRealisticContainerStack(northComplex, 7, 3, 84, 855, [0x0284c7, 0x0284c7, 0xea580c, 0xdc2626]);
  addRealisticContainerStack(northComplex, 7, 3, 84, 885, [0xdc2626, 0x16a34a, 0x0284c7, 0xca8a04]);
  // Kluster Timur: Hijau Evergreen, Terracotta, Abu-abu
  addRealisticContainerStack(northComplex, 6, 2, 84, 915, [0x16a34a, 0x475569, 0xf8fafc]);
  addRealisticContainerStack(northComplex, 6, 2, 84, 942, [0xdc2626, 0x16a34a, 0xca8a04]);
  addRealisticContainerStack(northComplex, 5, 1, 84, 964, [0x475569, 0x0284c7]);

  // Baris Kontainer Pendek di Sisi Bawah (X = 66, Z in [780, 875])
  addRealisticContainerStack(northComplex, 4, 1, 66, 792, [0x0284c7, 0x38bdf8]);
  addRealisticContainerStack(northComplex, 5, 2, 66, 835, [0xdc2626, 0xf8fafc, 0x0284c7]);
  addRealisticContainerStack(northComplex, 4, 1, 66, 868, [0x16a34a, 0xca8a04]);

  // 4. AREA ANTREAN TUNGGU TRUK KONTAINER (BUFFER WAITING LANES: X in [34, 60], Z in [748, 970])
  // 5 LAJUR PARALEL ANTREAN TRUK DENGAN MARKA STRIPING JELAS
  [38, 43, 48, 53, 58].forEach((lx, idx) => {
    // Garis Putus-putus Marka Lajur Antrean Truk (Z: 755 s/d 965)
    for (let pz = 755; pz <= 965; pz += 10.0) {
      const bLine = new THREE.Mesh(new THREE.PlaneGeometry(0.2, 5.0), whiteLineMat);
      bLine.rotation.x = -Math.PI / 2;
      bLine.position.set(lx, 0.012, pz + 2.5);
      northComplex.add(bLine);
    }
  });

  // Marka Putaran Lengkung di Ujung Barat Area Antrean: Dihapus sesuai permintaan

  // Deretan Truk Kontainer yang Sedang Mengantre di Buffer Lanes (Persis Foto Satelit)
  addParkedTruck(northComplex, 40.5, 785, 0, 0xdc2626, 0x0284c7);
  addParkedTruck(northComplex, 40.5, 810, 0, 0xf8fafc, 0xdc2626);
  addParkedTruck(northComplex, 40.5, 845, 0, 0x16a34a, 0xf8fafc);
  addParkedTruck(northComplex, 45.5, 800, 0, 0xca8a04, 0x16a34a);
  addParkedTruck(northComplex, 45.5, 830, 0, 0x0284c7, 0xea580c);
  addParkedTruck(northComplex, 45.5, 865, 0, 0x1e293b, 0x0284c7);
  addParkedTruck(northComplex, 50.5, 790, 0, 0xdc2626, 0xca8a04);
  addParkedTruck(northComplex, 50.5, 825, 0, 0xf8fafc, 0x38bdf8);
  addParkedTruck(northComplex, 55.5, 815, 0, 0x16a34a, 0xdc2626);
  addParkedTruck(northComplex, 55.5, 850, 0, 0xea580c, 0xf8fafc);

  // Tiang Lampu Sorot High-Mast di Sudut-Sudut Depo Petikemas
  addHighMastTower(northComplex, 35, 755, 24);
  addHighMastTower(northComplex, 134, 755, 24);
  addHighMastTower(northComplex, 134, 975, 24);
  addHighMastTower(northComplex, 35, 975, 24);

  // ----------------------------------------------------------------------------
  // C. LAPANGAN STAGING TRUK & RAK SASIS (+X in [25, 140], Z in [980, 1080])
  // Lengkap dengan Marka Putaran Lingkaran Besar, Armada Prime Mover & Rak Sasis
  // ----------------------------------------------------------------------------
  const byPavement = new THREE.Mesh(new THREE.PlaneGeometry(112, 100), stagingAsphaltMat);
  byPavement.rotation.x = -Math.PI / 2;
  byPavement.position.set(85, 0.007, 1030);
  byPavement.receiveShadow = true;
  northComplex.add(byPavement);

  // 1. MARKA PUTARAN LINGKARAN BESAR: Dihapus sesuai permintaan (clean staging asphalt)

  // 2. DERETAN TRUK TRAILER & PRIME MOVER DI LAPANGAN STAGING (Persis Foto Satelit)
  // Baris Tengah 1 (Z = 1018): 6 Truk
  for (let i = 0; i < 6; i++) {
    const tx = 58 + i * 7.5;
    const col = truckCabColors[i % truckCabColors.length];
    addParkedTruck(northComplex, tx, 1018, 0, col, null);
  }

  // Baris Tengah 2 (Z = 1038): 6 Truk Berhadapan
  for (let i = 0; i < 6; i++) {
    const tx = 58 + i * 7.5;
    const col = truckCabColors[(i + 3) % truckCabColors.length];
    addParkedTruck(northComplex, tx, 1038, Math.PI, col, null);
  }

  // Baris Tengah 3 (Z = 1058): 6 Truk Sasis
  for (let i = 0; i < 6; i++) {
    const tx = 58 + i * 7.5;
    const col = truckCabColors[(i + 1) % truckCabColors.length];
    addParkedTruck(northComplex, tx, 1058, 0, col, null);
  }

  // Kendaraan Servis & Minibus Shuttle di Sisi Barat Staging
  for (let sx = 60; sx <= 96; sx += 7.2) {
    addParkedCar(northComplex, sx, 992, Math.PI / 2, 0xf8fafc);
  }

  // 3. RAK PENYIMPANAN SASIS KONTAINER KOSONG (CHASSIS DEPOT: Sudut Timur Laut, X in [120, 138])
  // Rangka sasis baja tersusun sejajar persis seperti pada foto satelit
  for (let cz = 998; cz <= 1072; cz += 4.8) {
    const chassis1 = new THREE.Mesh(new THREE.BoxGeometry(2.4, 0.5, 12.2), steelMat);
    chassis1.position.set(130, 0.35, cz);
    chassis1.castShadow = true;
    northComplex.add(chassis1);

    const chassis2 = new THREE.Mesh(new THREE.BoxGeometry(2.4, 0.5, 12.2), steelMat);
    chassis2.position.set(130, 0.9, cz);
    chassis2.castShadow = true;
    northComplex.add(chassis2);
  }

  // Pos Jaga Dispatch & Portal Masuk Lapangan Staging (X = 36, Z = 992)
  const stagingBooth = createMassingBuilding(4.2, 3.2, 5.0, 36, 992, 0, massingWhiteMat);
  northComplex.add(stagingBooth);

  const stagingBarrier = new THREE.Mesh(new THREE.BoxGeometry(4.5, 0.14, 0.14), boomBarrierMat);
  stagingBarrier.position.set(30, 1.2, 992);
  northComplex.add(stagingBarrier);

  // 4. SABUK HIJAU & VEGETASI PEMBATAS JALAN UTARA (INBOUND ROADSIDE GREEN BELTS)
  // Disesuaikan presisi dengan citra satelit:
  // Membuka celah aspal bersih untuk seluruh jalur keluar masuk kendaraan (slip road, gate plaza, staging entrance)
  const northRoadsideVergeGroup = new THREE.Group();

  // A. Segmen 1: Depan Gedung Kantor (Z in [688, 730])
  // Berhenti di Z = 730 untuk memberi ruang bukaan Jalur Slip Masuk Deselerasi (Z in [732, 772])
  const vergeLawn1 = new THREE.Mesh(new THREE.PlaneGeometry(13.6, 42.0), officeLawnMat);
  vergeLawn1.rotation.x = -Math.PI / 2;
  vergeLawn1.position.set(19.6, 0.007, 709);
  vergeLawn1.receiveShadow = true;
  northRoadsideVergeGroup.add(vergeLawn1);

  const curb1 = new THREE.Mesh(new THREE.BoxGeometry(0.25, 0.22, 42.0), curbConcreteGreyMat);
  curb1.position.set(12.8, 0.11, 709);
  curb1.castShadow = true;
  northRoadsideVergeGroup.add(curb1);

  [692, 701, 710, 719, 728].forEach((tz, idx) => {
    addSatelliteTree(northRoadsideVergeGroup, 19.5, tz, 2.8 + (idx % 2) * 0.4, idx % 4);
    addBushCluster(northRoadsideVergeGroup, 17.5, tz - 3.5, 1.25, (idx + 1) % 4);
  });

  // [BUKAAN 1: Z in [730, 772] BEBAS POHON & ASPAL TERBUKA]
  // Merupakan Jalur Slip Masuk Truk ke Buffer Waiting Yard sesuai marka chevron & slipRoadGeo

  // B. Segmen 2: Taman Pembatas Sebelum Gerbang (Pre-Gate Tree Belt: Z in [772, 854])
  // Berhenti sebelum Z = 855 untuk memberi ruang bukaan pendekatan gerbang, zebra cross & timbangan
  const vergeLawn2 = new THREE.Mesh(new THREE.PlaneGeometry(11.0, 82.0), officeLawnMat);
  vergeLawn2.rotation.x = -Math.PI / 2;
  vergeLawn2.position.set(20.5, 0.007, 813);
  vergeLawn2.receiveShadow = true;
  northRoadsideVergeGroup.add(vergeLawn2);

  const curb2 = new THREE.Mesh(new THREE.BoxGeometry(0.25, 0.22, 82.0), curbConcreteGreyMat);
  curb2.position.set(14.8, 0.11, 813);
  curb2.castShadow = true;
  northRoadsideVergeGroup.add(curb2);

  for (let tz = 775; tz <= 850; tz += 8.5) {
    const idx = Math.floor((tz - 775) / 8.5);
    addSatelliteTree(northRoadsideVergeGroup, 20.5, tz, 2.9 + (idx % 3) * 0.3, idx % 4);
    addBushCluster(northRoadsideVergeGroup, 18.2, tz - 4.0, 1.3, (idx + 2) % 4);
    addBushCluster(northRoadsideVergeGroup, 22.8, tz + 3.0, 1.15, (idx + 1) % 4);
  }

  // [BUKAAN 2: Z in [855, 914] BEBAS POHON / APRON OPERASIONAL GERBANG TOL]
  // Area pendekatan stop bar, zebra cross petugas, kanopi 4-lajur pemeriksaan, dan pos kontrol samping
  // Pelataran apron aspal/beton bersih untuk operasional checkpoint

  // C. Segmen 3: Taman Pembatas Pasca Gerbang (Post-Gate Tree Island: Z in [914, 965])
  // Memisahkan jalan pasca gerbang dengan depo kontainer sebelum persimpangan staging
  const vergeLawn3 = new THREE.Mesh(new THREE.PlaneGeometry(9.5, 51.0), officeLawnMat);
  vergeLawn3.rotation.x = -Math.PI / 2;
  vergeLawn3.position.set(21.8, 0.007, 939.5);
  vergeLawn3.receiveShadow = true;
  northRoadsideVergeGroup.add(vergeLawn3);

  const curb3 = new THREE.Mesh(new THREE.BoxGeometry(0.25, 0.22, 51.0), curbConcreteGreyMat);
  curb3.position.set(16.8, 0.11, 939.5);
  curb3.castShadow = true;
  northRoadsideVergeGroup.add(curb3);

  [918, 927, 936, 945, 954, 962].forEach((tz, idx) => {
    addSatelliteTree(northRoadsideVergeGroup, 21.8, tz, 2.9 + (idx % 3) * 0.35, idx % 4);
    addBushCluster(northRoadsideVergeGroup, 19.2, tz - 4.0, 1.35, (idx + 1) % 4);
    addBushCluster(northRoadsideVergeGroup, 24.2, tz + 3.5, 1.2, (idx + 2) % 4);
  });

  // [BUKAAN 3: Z in [965, 1018] BEBAS POHON & ASPAL TERBUKA]
  // Akses Utama Persimpangan Keluar Masuk Lapangan Staging Truk & Depo Timur
  // Memberikan jalur lalu lintas mulus bagi truk yang berbelok menuju stagingBooth & stagingBarrier di Z = 992

  // D. Segmen 4: Taman Pembatas Ujung Timur Staging (East Staging Verge: Z in [1018, 1075])
  // Berada di sisi selatan barisan truk sasis hingga sudut tenggara pulau
  const vergeLawn4 = new THREE.Mesh(new THREE.PlaneGeometry(9.5, 57.0), officeLawnMat);
  vergeLawn4.rotation.x = -Math.PI / 2;
  vergeLawn4.position.set(21.8, 0.007, 1046.5);
  vergeLawn4.receiveShadow = true;
  northRoadsideVergeGroup.add(vergeLawn4);

  const curb4 = new THREE.Mesh(new THREE.BoxGeometry(0.25, 0.22, 57.0), curbConcreteGreyMat);
  curb4.position.set(16.8, 0.11, 1046.5);
  curb4.castShadow = true;
  northRoadsideVergeGroup.add(curb4);

  [1022, 1031, 1040, 1049, 1058, 1067].forEach((tz, idx) => {
    addSatelliteTree(northRoadsideVergeGroup, 21.8, tz, 2.8 + (idx % 3) * 0.35, idx % 4);
    addBushCluster(northRoadsideVergeGroup, 19.2, tz - 4.0, 1.35, (idx + 1) % 4);
    addBushCluster(northRoadsideVergeGroup, 24.2, tz + 3.5, 1.2, (idx + 2) % 4);
  });

  northComplex.add(northRoadsideVergeGroup);

  islandGroup.add(northComplex);

  // ============================================================================
  // 6. TANGGUL & SABUK HIJAU MANGROVE / CEMARA LAUT KELILING PULAU
  // Deretan Pepohonan Rimbun Membingkai Seluruh Garis Pantai (Persis Foto Satelit)
  // ============================================================================
  const perimeterTreesGroup = new THREE.Group();
  perimeterTreesGroup.position.set(0, 1.63, 0);

  // A. SABUK POHON TANGGUL UTARA & TIMUR (X = 42): Dihapus karena membelah area operasional/depo kontainer/staging yard

  // C. SABUK POHON TANGGUL TIMUR SEMENANJUNG SELATAN (X in [-196, -20] pada Z = 786)
  for (let x = -196; x <= -20; x += 16) {
    const tone = Math.floor(Math.abs(x) / 16) % 4;
    addSatelliteTree(perimeterTreesGroup, x, 786, 2.5 + (Math.abs(x) % 3) * 0.2, tone);
  }

  // D. SABUK POHON TANGGUL SELATAN SEMENANJUNG SELATAN (Z in [648, 782] pada X = -200)
  for (let z = 648; z <= 782; z += 16) {
    const tone = Math.floor(z / 16) % 4;
    addSatelliteTree(perimeterTreesGroup, -200, z, 2.6 + (z % 3) * 0.2, tone);
  }

  // E. SABUK POHON TANGGUL BARAT SEMENANJUNG SELATAN (X in [-196, -36] pada Z = 644)
  for (let x = -196; x <= -36; x += 16) {
    const tone = Math.floor(Math.abs(x) / 16) % 4;
    addSatelliteTree(perimeterTreesGroup, x, 644, 2.5 + (Math.abs(x) % 3) * 0.2, tone);
  }

  // F. VEGETASI PEMBATAS PANTAI BARAT LAUT (Sesuai Batas Daratan)
  // Membentuk kanopi pepohonan rapat di tepi pantai yang memisahkan air dengan area operasional
  const nwBoundaryPoints = [
    [8.5, 624.5], [12, 625], [20, 628], [36, 634], [45, 644], [142, 690]
  ];
  
  for (let i = 0; i < nwBoundaryPoints.length - 1; i++) {
    const p1 = nwBoundaryPoints[i];
    const p2 = nwBoundaryPoints[i + 1];
    const dx = p2[0] - p1[0];
    const dz = p2[1] - p1[1];
    const dist = Math.sqrt(dx * dx + dz * dz);
    const steps = Math.ceil(dist / 3.5); // Pohon rapat setiap ~3.5 meter
    
    for (let j = 0; j <= steps; j++) {
      const t = j / steps;
      const x = p1[0] + dx * t;
      const z = p1[1] + dz * t;
      
      const nx = -dz / dist;
      const nz = dx / dist;
      
      // Lapisan 1: Baris luar persis di tepi pantai
      const tone1 = Math.floor((x + z) / 10) % 4;
      addSatelliteTree(perimeterTreesGroup, x, z, 3.2 + (j % 3) * 0.3, tone1);
      
      // Lapisan 2: Baris dalam (sedikit menjorok ke darat) agar rimbun
      const inX = x + nx * 4.5;
      const inZ = z + nz * 4.5;
      const tone2 = Math.floor((inX + inZ) / 10) % 4;
      addSatelliteTree(perimeterTreesGroup, inX, inZ, 3.8 + (j % 3) * 0.4, tone2);
      
      // Lapisan 3: Tambahkan semak-semak lebat di sela-sela
      if (j % 2 === 0) {
         addBushCluster(perimeterTreesGroup, x + nx * 2.0, z + nz * 2.0, 1.5, (tone1 + 1) % 4);
      }
    }
  }

  // G. POHON TAMAN & PENEDUH DI AREA KANTOR & MASJID
  const campusTrees = [
    [-46, 650, 2.3, 1], [-70, 650, 2.4, 2], [-42, 680, 2.3, 0], [-80, 680, 2.4, 3],
    [-106, 648, 2.5, 0], [-106, 672, 2.4, 1], [-130, 650, 2.6, 2], [-160, 652, 2.5, 3],
    [-180, 664, 2.6, 0], [-175, 720, 2.4, 1], [-155, 725, 2.3, 2], [-90, 725, 2.4, 0],
    [-65, 735, 2.3, 1], [-48, 745, 2.4, 2], [-48, 765, 2.3, 3]
  ];
  campusTrees.forEach(ct => {
    addSatelliteTree(perimeterTreesGroup, ct[0], ct[1], ct[2], ct[3]);
  });

  islandGroup.add(perimeterTreesGroup);

  group.add(islandGroup);

  // ============================================================================
  // SECTION 3: SATELLITE-ACCURATE INTER-ISLAND CAUSEWAY & TOLL PLAZA COMPLEX
  // Rekonstruksi Penuh 1:1 Berdasarkan Citra Satelit Resolusi Tinggi:
  // - Segmen 1: Koridor Tanggul Lurus 6-Lajur (Z: 1080 s/d 1490) dengan Jalur Aspal Gelap Sisi Utara & Pipa Utilitas Kontinu
  // - Segmen 2: Plaza Gerbang Tol Pelebaran Lensa Aerodinamis (Z: 1490 s/d 1720) dengan Mobil Servis Kuning
  // - Segmen 3: Kanopi Lengkung Barrel-Vault Megah 50m & 10 Gardu Tol (Z: 1686 s/d 1704, Center Z = 1695)
  // - Segmen 4: Pulau Teardrop Oval Pasca Tol (Z: 1720 s/d 1855) dengan Cincin Pohon & Gedung Kontrol Administrasi
  // - Segmen 5: Koridor Menuju Terminal (Z: 1855 s/d 2030)
  // - Segmen 6: Simpang 4 Terminal Masuk Dermaga (Z: 2030 s/d 2060) dengan Marka Kotak Kuning & Lampu Sorot Tower
  // - Segmen 7: Pergudangan Logistik Masif & Port Staging Yard di Kuadran Tenggara (Z: 1960 s/d 2090, X in [-50, -16])
  // - Segmen 8: Pipa Utilitas Industri Ganda Kontinu di Sepanjang Tanggul Utara (Z: 1085 s/d 2040)
  // - Segmen 9: Pulau Konservasi Mangrove Masif dengan Sudut Melengkung Barat-Laut (Z: 1630 s/d 1940, X in [-165, -42])
  // ============================================================================
  const causewayGroup = new THREE.Group();
  causewayGroup.name = 'ttl_inter_island_causeway';

  // 1. MATERIAL KHUSUS KORIDOR CAUSEWAY (SERAGAM DENGAN JALAN PULAU 1 & MAINLAND)
  const causewayWhiteLineMat = new THREE.MeshBasicMaterial({
    color: 0xf8fafc,
    side: THREE.DoubleSide,
    polygonOffset: true,
    polygonOffsetFactor: -2.0,
    polygonOffsetUnits: -2.0
  });

  const causewayYellowLineMat = new THREE.MeshBasicMaterial({
    color: 0xfbbf24,
    side: THREE.DoubleSide,
    polygonOffset: true,
    polygonOffsetFactor: -2.0,
    polygonOffsetUnits: -2.0
  });

  // Builder Panah Jalan Vektor Tajam Putih
  const createHighwayArrow = (shapePointsSouth = true) => {
    const shape = new THREE.Shape();
    const stemW = 0.28;
    const stemL = 2.60;
    const headW = 1.05;
    const headL = 1.55;

    // CATATAN: Setelah rotation.x = -PI/2:
    //   Shape +Y -> World -Z (arah keluar) = visual menunjuk ke Pulau 1 (South / -Z)
    //   Shape -Y -> World +Z (arah masuk) = visual menunjuk ke Terminal (North / +Z)
    if (shapePointsSouth) {
      // Outbound: Menunjuk ke Pulau 1 (-Z / South)
      shape.moveTo(-stemW / 2, -stemL);
      shape.lineTo(stemW / 2, -stemL);
      shape.lineTo(stemW / 2, 0);
      shape.lineTo(headW / 2, 0);
      shape.lineTo(0, headL);
      shape.lineTo(-headW / 2, 0);
      shape.lineTo(-stemW / 2, 0);
      shape.closePath();
    } else {
      // Inbound: Menunjuk ke Terminal (+Z / North)
      shape.moveTo(-stemW / 2, stemL);
      shape.lineTo(stemW / 2, stemL);
      shape.lineTo(stemW / 2, 0);
      shape.lineTo(headW / 2, 0);
      shape.lineTo(0, -headL);
      shape.lineTo(-headW / 2, 0);
      shape.lineTo(-stemW / 2, 0);
      shape.closePath();
    }

    const geo = new THREE.ShapeGeometry(shape);
    const mesh = new THREE.Mesh(geo, causewayWhiteLineMat);
    mesh.rotation.x = -Math.PI / 2;
    return mesh;
  };
  const warmBermEarthMat = new THREE.MeshStandardMaterial({
    color: 0x94785c, // Warm sandy clay earthen berm flanking the causeway
    roughness: 0.95
  });
  const riprapRockMat = new THREE.MeshStandardMaterial({
    color: 0x5a554e,
    roughness: 0.95,
    metalness: 0.08
  });
  const tollCanopySilverMat = new THREE.MeshStandardMaterial({
    color: 0xf1f3f4, // Off-white / metallic silver barrel-vault roof
    roughness: 0.35,
    metalness: 0.25,
    side: THREE.DoubleSide
  });
  const tollBoothGlassMat = new THREE.MeshStandardMaterial({
    color: 0x0284c7,
    roughness: 0.1,
    metalness: 0.9,
    transparent: true,
    opacity: 0.75
  });
  const yellowShuttleMat = new THREE.MeshStandardMaterial({
    color: 0xeab308, // Vibrant yellow port service vehicle
    roughness: 0.4,
    metalness: 0.2
  });
  const utilityPipeMat = new THREE.MeshStandardMaterial({
    color: 0x828c94, // Galvanized steel pipeline
    roughness: 0.45,
    metalness: 0.8
  });
  const warehouseWallMat = new THREE.MeshStandardMaterial({
    color: 0xe2e8f0, // White / light grey industrial sandwich panels
    roughness: 0.65,
    metalness: 0.2
  });
  const warehouseRoofMat = new THREE.MeshStandardMaterial({
    color: 0x94a3b8, // Galvanized corrugated gable roof
    roughness: 0.5,
    metalness: 0.4
  });
  const yardGravelMat = new THREE.MeshStandardMaterial({
    color: 0x7c827c, // Compacted port equipment staging yard gravel
    roughness: 0.95,
    metalness: 0.05
  });
  const pipeStackMat = new THREE.MeshStandardMaterial({
    color: 0x64748b, // Precast concrete pipes and structural steel
    roughness: 0.6,
    metalness: 0.5
  });

  // 2. PROFIL MATEMATIS LEBAR JALAN & TANGGUL SEPANJANG KORIDOR (Z: 1080 s/d 1600)
  // Proporsi diperkecil sesuai citra foto satelit resolusi tinggi
  const getRoadNorthX = (z) => {
    if (z <= 1115) {
      const t = (z - 1080) / 35.0;
      const s = t * t * (3 - 2 * t);
      return 16.5 - s * 3.7;
    }
    if (z <= 1200) return 12.8; // Segmen lurus 85m (sesuai satelit)
    if (z <= 1330) {
      const t = (z - 1200) / 130.0;
      const s = Math.sin(t * Math.PI * 0.5);
      return 12.8 + s * 14.2; // Puncak flare di 27.0m pada Z = 1330
    }
    if (z <= 1340) return 27.0; // Area Gate Utama & Apron
    if (z <= 1430) { // Tapering Cepat
      const t = (z - 1340) / 90.0;
      const s = t * t * (3 - 2 * t);
      return 27.0 - s * 13.0; // Tapering ke 14.0m
    }
    if (z <= 1530) return 14.0; // Lurus selebar pulau
    if (z <= 1560) {
      const t = (z - 1530) / 30.0;
      const s = t * t * (3 - 2 * t);
      return 14.0 - s * 2.3; // Tapering ke 11.7m
    }
    return 11.7; // Lebar standar (termasuk setengah median)
  };

  const getRoadSouthX = (z) => {
    if (z <= 1200) return -12.8;
    if (z <= 1330) {
      const t = (z - 1200) / 130.0;
      const s = Math.sin(t * Math.PI * 0.5);
      return -12.8 - s * 12.2; // Puncak flare di -25.0m pada Z = 1330
    }
    if (z <= 1340) return -25.0; // Area Gate Utama & Apron
    if (z <= 1430) {
      const t = (z - 1340) / 90.0;
      const s = t * t * (3 - 2 * t);
      return -25.0 + s * 11.0; // Tapering ke -14.0m
    }
    if (z <= 1530) return -14.0;
    if (z <= 1560) {
      const t = (z - 1530) / 30.0;
      const s = t * t * (3 - 2 * t);
      return -14.0 + s * 2.3; // Tapering ke -11.7m
    }
    return -11.7;
  };

  const getBermNorthX = (z) => getRoadNorthX(z) + 4.8;
  const getBermSouthX = (z) => getRoadSouthX(z) - 4.8;
  const getRiprapNorthX = (z) => getBermNorthX(z) + 5.0;
  const getRiprapSouthX = (z) => getBermSouthX(z) - 5.0;

  const getOvalHalfWidth = (z) => {
    if (z < 1430) return 0;
    if (z <= 1470) {
      const t = (z - 1430) / 40.0;
      return t * 3.5; // V-shape linear taper untuk painted gore
    }
    if (z <= 1530) {
      return 3.5; // Straight wide section
    }
    if (z <= 1560) {
      const t = (z - 1530) / 30.0;
      const s = t * t * (3 - 2 * t);
      return 3.5 - s * 2.3; // Taper to 1.2
    }
    return 1.2; // Standar median
  };

  // 3. FONDASI TANGGUL REKLAMASI LAUT & LERENG BATU ALAM (EMBANKMENT SUBGRADE & RIPRAP)
  const causewayZStart = 1080;
  const causewayZEnd = 1575; // Diperpendek agar area sisa menjadi laut
  const zStep = 10.0;
  const causewaySteps = Math.ceil((causewayZEnd - causewayZStart) / zStep);

  const subgradePositions = [];
  const subgradeNormals = [];
  const northSlopePositions = [];
  const northSlopeNormals = [];
  const southSlopePositions = [];
  const southSlopeNormals = [];
  const northBermPositions = [];
  const northBermNormals = [];
  const southBermPositions = [];
  const southBermNormals = [];

  const yPlateau = 1.625;
  const yWater = -0.15;

  for (let i = 0; i < causewaySteps; i++) {
    const z1 = causewayZStart + i * zStep;
    const z2 = Math.min(causewayZEnd, z1 + zStep);

    const bn1 = getBermNorthX(z1);
    const bn2 = getBermNorthX(z2);
    const bs1 = getBermSouthX(z1);
    const bs2 = getBermSouthX(z2);

    const rn1 = getRoadNorthX(z1);
    const rn2 = getRoadNorthX(z2);
    const rs1 = getRoadSouthX(z1);
    const rs2 = getRoadSouthX(z2);

    const rpn1 = getRiprapNorthX(z1);
    const rpn2 = getRiprapNorthX(z2);
    const rps1 = getRiprapSouthX(z1);
    const rps2 = getRiprapSouthX(z2);

    const ySubgrade = 1.48; // Di bawah level aspal (1.638m), bebas z-fighting tanah tembus
    const yBerm = 1.625;

    // Inti Subgrade Datar
    subgradePositions.push(
      bs1, ySubgrade, z1, bn2, ySubgrade, z2, bn1, ySubgrade, z1,
      bs1, ySubgrade, z1, bs2, ySubgrade, z2, bn2, ySubgrade, z2
    );
    for (let k = 0; k < 6; k++) subgradeNormals.push(0, 1, 0);

    // Bahu Jalan Tanah Cokelat Utara
    northBermPositions.push(
      rn1, yBerm, z1, bn2, yBerm, z2, bn1, yBerm, z1,
      rn1, yBerm, z1, rn2, yBerm, z2, bn2, yBerm, z2
    );
    for (let k = 0; k < 6; k++) northBermNormals.push(0, 1, 0);

    // Bahu Jalan Tanah Cokelat Selatan
    southBermPositions.push(
      bs1, yBerm, z1, rs2, yBerm, z2, rs1, yBerm, z1,
      bs1, yBerm, z1, bs2, yBerm, z2, rs2, yBerm, z2
    );
    for (let k = 0; k < 6; k++) southBermNormals.push(0, 1, 0);

    // Lereng Riprap Batu Pemecah Ombak Utara
    northSlopePositions.push(
      bn1, yBerm, z1, rpn2, yWater, z2, rpn1, yWater, z1,
      bn1, yBerm, z1, bn2, yBerm, z2, rpn2, yWater, z2
    );
    for (let k = 0; k < 6; k++) northSlopeNormals.push(0.35, 0.93, 0);

    // Lereng Riprap Batu Pemecah Ombak Selatan
    southSlopePositions.push(
      rps1, yWater, z1, bs2, yBerm, z2, bs1, yBerm, z1,
      rps1, yWater, z1, rps2, yWater, z2, bs2, yBerm, z2
    );
    for (let k = 0; k < 6; k++) southSlopeNormals.push(-0.35, 0.93, 0);
  }

  // Mesh Subgrade & Bahu Tanah
  const subgradeGeo = new THREE.BufferGeometry();
  subgradeGeo.setAttribute('position', new THREE.Float32BufferAttribute(subgradePositions, 3));
  subgradeGeo.setAttribute('normal', new THREE.Float32BufferAttribute(subgradeNormals, 3));
  const subgradeMesh = new THREE.Mesh(subgradeGeo, islandSoilMat);
  subgradeMesh.receiveShadow = true;
  causewayGroup.add(subgradeMesh);

  // Inti Pondasi Bawah Air
  const underBaseBox = new THREE.Mesh(
    new THREE.BoxGeometry(42.0, 2.5, causewayZEnd - causewayZStart),
    islandSoilMat
  );
  underBaseBox.position.set(0, 0.35, (causewayZStart + causewayZEnd) / 2);
  underBaseBox.receiveShadow = true;
  causewayGroup.add(underBaseBox);

  // Mesh Bahu Tanah Utara & Selatan
  const northBermGeo = new THREE.BufferGeometry();
  northBermGeo.setAttribute('position', new THREE.Float32BufferAttribute(northBermPositions, 3));
  northBermGeo.setAttribute('normal', new THREE.Float32BufferAttribute(northBermNormals, 3));
  const northBermMesh = new THREE.Mesh(northBermGeo, warmBermEarthMat);
  northBermMesh.receiveShadow = true;
  causewayGroup.add(northBermMesh);

  const southBermGeo = new THREE.BufferGeometry();
  southBermGeo.setAttribute('position', new THREE.Float32BufferAttribute(southBermPositions, 3));
  southBermGeo.setAttribute('normal', new THREE.Float32BufferAttribute(southBermNormals, 3));
  const southBermMesh = new THREE.Mesh(southBermGeo, warmBermEarthMat);
  southBermMesh.receiveShadow = true;
  causewayGroup.add(southBermMesh);

  // Mesh Lereng Batu Riprap Utara & Selatan
  const northSlopeGeo = new THREE.BufferGeometry();
  northSlopeGeo.setAttribute('position', new THREE.Float32BufferAttribute(northSlopePositions, 3));
  northSlopeGeo.setAttribute('normal', new THREE.Float32BufferAttribute(northSlopeNormals, 3));
  const northSlopeMesh = new THREE.Mesh(northSlopeGeo, riprapRockMat);
  northSlopeMesh.receiveShadow = true;
  causewayGroup.add(northSlopeMesh);

  const southSlopeGeo = new THREE.BufferGeometry();
  southSlopeGeo.setAttribute('position', new THREE.Float32BufferAttribute(southSlopePositions, 3));
  southSlopeGeo.setAttribute('normal', new THREE.Float32BufferAttribute(southSlopeNormals, 3));
  const southSlopeMesh = new THREE.Mesh(southSlopeGeo, riprapRockMat);
  southSlopeMesh.receiveShadow = true;
  causewayGroup.add(southSlopeMesh);

  // Gugusan Batu Armor Pemecah Ombak di Garis Air
  const rockArmorGeo = new THREE.DodecahedronGeometry(1.1, 1);
  for (let rz = causewayZStart + 5; rz <= causewayZEnd - 5; rz += 12.0) {
    const seedN = Math.sin(rz * 4.31);
    const seedS = Math.cos(rz * 5.17);

    const rockN = new THREE.Mesh(rockArmorGeo, riprapRockMat);
    const scaleN = 0.9 + Math.abs(seedN) * 0.7;
    rockN.scale.set(scaleN * 1.3, scaleN * 0.8, scaleN * 1.25);
    rockN.position.set(getRiprapNorthX(rz) - 0.5 + seedN * 0.4, 0.15, rz);
    rockN.rotation.set(seedN * 2.1, seedN * 3.4, seedN * 1.5);
    rockN.castShadow = true;
    causewayGroup.add(rockN);

    const rockS = new THREE.Mesh(rockArmorGeo, riprapRockMat);
    const scaleS = 0.9 + Math.abs(seedS) * 0.7;
    rockS.scale.set(scaleS * 1.3, scaleS * 0.8, scaleS * 1.25);
    rockS.position.set(getRiprapSouthX(rz) + 0.5 - seedS * 0.4, 0.15, rz);
    rockS.rotation.set(seedN * 2.1, seedN * 3.4, seedN * 1.5);
    rockS.castShadow = true;
    causewayGroup.add(rockS);
  }

  // 4. HAMPARAN PERKERASAN JALAN SERAGAM (PORT ASPHALT) DI ELEVASI Y = 1.638m
  const yRoad = 1.638;
  const yMark = 1.646;

  // A. SEGMEN 1: Koridor Lurus (Z in [1080, 1200], Panjang 120m)
  // Outbound 3-Lajur Aspal Port (-X in [-12.8, -1.3])
  const straightOutbound = new THREE.Mesh(new THREE.PlaneGeometry(11.5, 120), portRoadPavementMat);
  straightOutbound.rotation.x = -Math.PI / 2;
  straightOutbound.position.set(-7.05, yRoad, 1140.0);
  straightOutbound.receiveShadow = true;
  causewayGroup.add(straightOutbound);

  // Inbound 3-Lajur Aspal Port (+X in [1.3, 12.8], Z in [1115, 1200])
  const straightInbound = new THREE.Mesh(new THREE.PlaneGeometry(11.5, 85), portRoadPavementMat);
  straightInbound.rotation.x = -Math.PI / 2;
  straightInbound.position.set(7.05, yRoad, 1157.5);
  straightInbound.receiveShadow = true;
  causewayGroup.add(straightInbound);

  // Transisi Taper Inbound (Z in [1080, 1115] dari 16.5m ke 12.8m)
  const taperGeo = new THREE.BufferGeometry();
  const taperPos = [];
  const taperNorm = [];
  const taperSteps = 12;
  for (let i = 0; i < taperSteps; i++) {
    const tA = i / taperSteps;
    const tB = (i + 1) / taperSteps;
    const zA = 1080 + tA * 35;
    const zB = 1080 + tB * 35;
    const xA = getRoadNorthX(zA);
    const xB = getRoadNorthX(zB);
    taperPos.push(
      1.3, yRoad, zA, xB, yRoad, zB, xA, yRoad, zA,
      1.3, yRoad, zA, 1.3, yRoad, zB, xB, yRoad, zB
    );
    for (let k = 0; k < 6; k++) taperNorm.push(0, 1, 0);
  }
  taperGeo.setAttribute('position', new THREE.Float32BufferAttribute(taperPos, 3));
  taperGeo.setAttribute('normal', new THREE.Float32BufferAttribute(taperNorm, 3));
  const taperMesh = new THREE.Mesh(taperGeo, portRoadPavementMat);
  taperMesh.receiveShadow = true;
  causewayGroup.add(taperMesh);

  // B. SEGMEN 2: Plaza Gerbang Utama (Z in [1200, 1342])
  const plazaRoadGeo = new THREE.BufferGeometry();
  const plazaRoadPos = [];
  const plazaRoadNorm = [];
  const plazaSteps = 24;
  for (let i = 0; i < plazaSteps; i++) {
    const zA = 1200 + (i / plazaSteps) * 142;
    const zB = 1200 + ((i + 1) / plazaSteps) * 142;
    const xNA = getRoadNorthX(zA);
    const xNB = getRoadNorthX(zB);
    const xSA = getRoadSouthX(zA);
    const xSB = getRoadSouthX(zB);

    plazaRoadPos.push(
      xSA, yRoad, zA, xNB, yRoad, zB, xNA, yRoad, zA,
      xSA, yRoad, zA, xSB, yRoad, zB, xNB, yRoad, zB
    );
    for (let k = 0; k < 6; k++) plazaRoadNorm.push(0, 1, 0);
  }
  plazaRoadGeo.setAttribute('position', new THREE.Float32BufferAttribute(plazaRoadPos, 3));
  plazaRoadGeo.setAttribute('normal', new THREE.Float32BufferAttribute(plazaRoadNorm, 3));
  const plazaRoadMesh = new THREE.Mesh(plazaRoadGeo, portRoadPavementMat);
  plazaRoadMesh.receiveShadow = true;
  causewayGroup.add(plazaRoadMesh);

  // Pelat Apron Beton Khusus di Area Gardu Tol (Z in [1318, 1342], X in [-24, +29])
  const tollBoothApron = new THREE.Mesh(new THREE.PlaneGeometry(53.0, 24.0), gatePlazaConcreteMat);
  tollBoothApron.rotation.x = -Math.PI / 2;
  tollBoothApron.position.set(2.5, yRoad + 0.001, 1330);
  tollBoothApron.receiveShadow = true;
  causewayGroup.add(tollBoothApron);

  // C. SEGMEN 3, 4, 5: Pasca Main Gate (Taper & Koridor) dengan Rongga Median (Z in [1342, 1575])
  const postTollInboundGeo = new THREE.BufferGeometry();
  const postTollOutboundGeo = new THREE.BufferGeometry();
  const ptInPos = [];
  const ptOutPos = [];
  const ptStart = 1342;
  const ptEnd = 1575;
  const ptSteps = Math.ceil((ptEnd - ptStart) / 5.0); // Resolusi 5m

  for (let i = 0; i < ptSteps; i++) {
    const zA = ptStart + (i / ptSteps) * (ptEnd - ptStart);
    const zB = ptStart + ((i + 1) / ptSteps) * (ptEnd - ptStart);
    const xNA = getRoadNorthX(zA);
    const xNB = getRoadNorthX(zB);
    const xSA = getRoadSouthX(zA);
    const xSB = getRoadSouthX(zB);
    const owA = getOvalHalfWidth(zA);
    const owB = getOvalHalfWidth(zB);

    // Inbound Jalan Utara (+X)
    ptInPos.push(
      owA, yRoad, zA, xNB, yRoad, zB, xNA, yRoad, zA,
      owA, yRoad, zA, owB, yRoad, zB, xNB, yRoad, zB
    );

    // Outbound Jalan Selatan (-X)
    ptOutPos.push(
      xSA, yRoad, zA, -owB, yRoad, zB, -owA, yRoad, zA,
      xSA, yRoad, zA, xSB, yRoad, zB, -owB, yRoad, zB
    );
  }
  const ptNorm = [];
  for (let k = 0; k < ptInPos.length / 3; k++) ptNorm.push(0, 1, 0);

  postTollInboundGeo.setAttribute('position', new THREE.Float32BufferAttribute(ptInPos, 3));
  postTollInboundGeo.setAttribute('normal', new THREE.Float32BufferAttribute(ptNorm, 3));
  const ptInMesh = new THREE.Mesh(postTollInboundGeo, portRoadPavementMat);
  ptInMesh.receiveShadow = true;
  causewayGroup.add(ptInMesh);

  postTollOutboundGeo.setAttribute('position', new THREE.Float32BufferAttribute(ptOutPos, 3));
  postTollOutboundGeo.setAttribute('normal', new THREE.Float32BufferAttribute(ptNorm, 3));
  const ptOutMesh = new THREE.Mesh(postTollOutboundGeo, portRoadPavementMat);
  ptOutMesh.receiveShadow = true;
  causewayGroup.add(ptOutMesh);

  // E. SEGMEN 6: Simpang 4 Terminal Masuk Dermaga (Dihapus agar sisa area menjadi laut)

  // ============================================================================
  // MARKA JALAN LENGKAP KORIDOR CAUSEWAY (100% KONSISTEN PULAU 1 & MAINLAND)
  // ============================================================================

  // Helper Ribbon Garis Kurva Mulus
  const addCurvedRibbonLine = (getXFunc, offsetSign, startZ, endZ, mat, width = 0.22, yLvl = yMark) => {
    const steps = Math.ceil((endZ - startZ) / 4.0);
    const pos = [];
    const norm = [];
    const halfW = width / 2;
    for (let i = 0; i < steps; i++) {
      const zA = startZ + (i / steps) * (endZ - startZ);
      const zB = startZ + ((i + 1) / steps) * (endZ - startZ);
      const xA = getXFunc(zA) - offsetSign * 0.18;
      const xB = getXFunc(zB) - offsetSign * 0.18;
      pos.push(
        xA - halfW, yLvl, zA, xB + halfW, yLvl, zB, xA + halfW, yLvl, zA,
        xA - halfW, yLvl, zA, xB - halfW, yLvl, zB, xB + halfW, yLvl, zB
      );
      for (let k = 0; k < 6; k++) norm.push(0, 1, 0);
    }
    const geo = new THREE.BufferGeometry();
    geo.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3));
    geo.setAttribute('normal', new THREE.Float32BufferAttribute(norm, 3));
    const mesh = new THREE.Mesh(geo, mat);
    causewayGroup.add(mesh);
    return mesh;
  };

  // 1. GARIS PUTIH TEPI LUAR JALAN MENERUS (OUTER EDGE SOLID WHITE LINES)
  addCurvedRibbonLine(getRoadNorthX, 1, 1080, 1575, causewayWhiteLineMat, 0.22);
  addCurvedRibbonLine(getRoadSouthX, -1, 1080, 1575, causewayWhiteLineMat, 0.22);

  // 2. TAMAN MEDIAN TENGAH PENDEKATAN GERBANG (MENGGUNAKAN DESAIN PULAU 1)
  // Z: 1085 s/d 1250 (Dilengkapi kanstin, rumput, pohon, tiang lampu, dan marka kuning)
  createDetailedMedianIsland(1085, 1250, 2.6, { density: 2.2, lampZ: [1110, 1140, 1170, 1200, 1230] });

  // Sisa jalan menuju gerbang utama (Z: 1250 s/d 1318) menggunakan 1 garis lurus putih
  const medYLine = new THREE.Mesh(new THREE.PlaneGeometry(0.30, 68), causewayWhiteLineMat);
  medYLine.rotation.x = -Math.PI / 2;
  medYLine.position.set(0, yMark, 1284.0); // Center Z = (1250+1318)/2 = 1284
  causewayGroup.add(medYLine);

  // Segmen 3 & 4 Mengitari Pulau Teardrop Oval & Chevron (Z: 1430 s/d 1560)
  addCurvedRibbonLine(getOvalHalfWidth, -1, 1430, 1560, causewayWhiteLineMat, 0.20);
  const getNegOvalHalfWidth = (z) => -getOvalHalfWidth(z);
  addCurvedRibbonLine(getNegOvalHalfWidth, 1, 1430, 1560, causewayWhiteLineMat, 0.20);

  // Segmen 5 Menuju Terminal (Z: 1460 s/d 1570)
  [-1.34, 1.34].forEach(mx => {
    const medYLine = new THREE.Mesh(new THREE.PlaneGeometry(0.20, 110), causewayWhiteLineMat);
    medYLine.rotation.x = -Math.PI / 2;
    medYLine.position.set(mx, yMark, 1515.0);
    causewayGroup.add(medYLine);
  });

  // 3. GARIS PUTUS-PUTUS PEMBAGI LAJUR (DASHED LANE DIVIDERS, 3.5m dash / 5.5m gap)
  const addDashedLaneLine = (startX, endX, startZ, endZ, dashL = 3.5, gapL = 5.5) => {
    const totalLen = Math.hypot(endX - startX, endZ - startZ);
    const cycle = dashL + gapL;
    const numDashes = Math.floor(totalLen / cycle);
    const angle = Math.atan2(endX - startX, endZ - startZ);
    for (let i = 0; i < numDashes; i++) {
      const curDist = (i + 0.5) * cycle;
      const t = curDist / totalLen;
      const curX = startX + (endX - startX) * t;
      const curZ = startZ + (endZ - startZ) * t;
      const dash = new THREE.Mesh(new THREE.PlaneGeometry(0.20, dashL), causewayWhiteLineMat);
      dash.rotation.x = -Math.PI / 2;
      dash.rotation.z = -angle;
      dash.position.set(curX, yMark, curZ);
      causewayGroup.add(dash);
    }
  };

  // A. Segmen 1 (Z in [1080, 1200]): 3 Lajur Masuk (+X) & 3 Lajur Keluar (-X)
  addDashedLaneLine(5.15, 5.15, 1085, 1197);
  addDashedLaneLine(11.5, 8.95, 1080, 1115);
  addDashedLaneLine(8.95, 8.95, 1115, 1197);

  addDashedLaneLine(-5.15, -5.15, 1085, 1197);
  addDashedLaneLine(-8.95, -8.95, 1085, 1197);

  // B. Segmen 2 Pendekatan Tol (Z in [1200, 1310]): Fanning 3 Lajur ke 5 Lajur Tiap Arah
  // Inbound (+X)
  addDashedLaneLine(5.15, 5.0, 1200, 1310);
  addDashedLaneLine(8.95, 10.0, 1200, 1310);
  addDashedLaneLine(10.5, 15.0, 1240, 1310);
  addDashedLaneLine(15.2, 20.0, 1270, 1310);

  // Outbound (-X)
  addDashedLaneLine(-5.15, -5.0, 1200, 1310);
  addDashedLaneLine(-8.95, -10.0, 1200, 1310);
  addDashedLaneLine(-10.5, -15.0, 1240, 1310);
  addDashedLaneLine(-15.2, -20.0, 1270, 1310);

  // Garis Solid Kanalisasi Putih di 25m Menjelang Gardu Tol (Z in [1300, 1320])
  [5.0, 10.0, 15.0, 20.0, -5.0, -10.0, -15.0, -20.0].forEach(kx => {
    const kLine = new THREE.Mesh(new THREE.PlaneGeometry(0.22, 20.0), causewayWhiteLineMat);
    kLine.rotation.x = -Math.PI / 2;
    kLine.position.set(kx, yMark, 1310.0);
    causewayGroup.add(kLine);
  });

  // Stop Bar Putih Tebal di Depan Setiap Gardu Tol (Z = 1318)
  [-20, -15, -10, -5, 0, 5, 10, 15, 20].forEach(bx => {
    const sBar = new THREE.Mesh(new THREE.PlaneGeometry(3.6, 0.75), causewayWhiteLineMat);
    sBar.rotation.x = -Math.PI / 2;
    sBar.position.set(bx + 2.5, yMark, 1318);
    causewayGroup.add(sBar);
  });

  // C. Segmen 3, 4, 5 Pasca Main Gate (Z in [1345, 1570])

  // Fanning In: 5 Lajur ke 3 Lajur (Z in [1345, 1430])
  // Inbound (+X)
  addDashedLaneLine(5.0, 7.0, 1345, 1430); // Divider 1
  addDashedLaneLine(10.0, 10.5, 1345, 1430); // Divider 2
  addDashedLaneLine(15.0, 10.3, 1345, 1400); // Divider 3 merges into 2
  addDashedLaneLine(20.0, 12.3, 1345, 1380); // Divider 4 merges into 3

  // Outbound (-X)
  addDashedLaneLine(-5.0, -7.0, 1345, 1430);
  addDashedLaneLine(-10.0, -10.5, 1345, 1430);
  addDashedLaneLine(-15.0, -10.3, 1345, 1400);
  addDashedLaneLine(-20.0, -12.3, 1345, 1380);

  // Menerus 3 Lajur (Z in [1430, 1570])
  for (let z = 1430; z <= 1570; z += 9.0) {
    const ow = getOvalHalfWidth(z);
    const rn = getRoadNorthX(z);
    const rs = getRoadSouthX(z);

    // Inbound (+X) 2 Garis Pembagi
    [0.33, 0.67].forEach(ratio => {
      const curX = ow + (rn - ow) * ratio;
      const nextZ = z + 0.5;
      const nextX = getOvalHalfWidth(nextZ) + (getRoadNorthX(nextZ) - getOvalHalfWidth(nextZ)) * ratio;
      const angle = Math.atan2(nextX - curX, nextZ - z);
      const dash = new THREE.Mesh(new THREE.PlaneGeometry(0.20, 3.5), causewayWhiteLineMat);
      dash.rotation.x = -Math.PI / 2;
      dash.rotation.z = -angle;
      dash.position.set(curX, yMark, z + 1.75);
      causewayGroup.add(dash);
    });

    // Outbound (-X) 2 Garis Pembagi
    [0.33, 0.67].forEach(ratio => {
      const curX = -ow + (rs - (-ow)) * ratio;
      const nextZ = z + 0.5;
      const nextX = -getOvalHalfWidth(nextZ) + (getRoadSouthX(nextZ) - (-getOvalHalfWidth(nextZ))) * ratio;
      const angle = Math.atan2(nextX - curX, nextZ - z);
      const dash = new THREE.Mesh(new THREE.PlaneGeometry(0.20, 3.5), causewayWhiteLineMat);
      dash.rotation.x = -Math.PI / 2;
      dash.rotation.z = -angle;
      dash.position.set(curX, yMark, z + 1.75);
      causewayGroup.add(dash);
    });
  }

  // 4. MARKA CHEVRON / SERONG GORE PUTIH
  const addChevronBars = (minX, maxX, minZ, maxZ, angle = Math.PI / 4) => {
    const w = maxX - minX;
    const l = maxZ - minZ;
    const midX = (minX + maxX) / 2;
    const spacing = 2.0;
    const numBars = Math.floor(l / spacing);
    for (let i = 0; i < numBars; i++) {
      const curZ = minZ + (i + 0.5) * spacing;
      const progress = (curZ - minZ) / Math.max(l, 1);
      const curW = Math.max(0.6, w * Math.sin(progress * Math.PI));
      const bar = new THREE.Mesh(new THREE.PlaneGeometry(0.24, Math.min(curW * 1.35, 5.5)), causewayWhiteLineMat);
      bar.rotation.x = -Math.PI / 2;
      bar.rotation.z = angle;
      bar.position.set(midX, yMark, curZ);
      causewayGroup.add(bar);
    }
  };

  // (Marka chevron di pendekatan tol dihapus karena median kini berupa garis lurus tunggal)


  // Chevron V-Shape pada painted gore sebelum pulau (Z in [1430, 1470])
  const addChevronV = (minZ, maxZ) => {
    const spacing = 3.0;
    const numBars = Math.floor((maxZ - minZ) / spacing);
    for (let i = 0; i < numBars; i++) {
      const curZ = minZ + (i + 0.5) * spacing;
      const curW = getOvalHalfWidth(curZ);
      if (curW > 0.3) {
        // Top half (-X)
        const barTop = new THREE.Mesh(new THREE.PlaneGeometry(0.24, curW * 1.5), causewayWhiteLineMat);
        barTop.rotation.x = -Math.PI / 2;
        barTop.rotation.z = Math.PI / 4;
        barTop.position.set(-curW / 2, yMark, curZ);
        causewayGroup.add(barTop);

        // Bottom half (+X)
        const barBot = new THREE.Mesh(new THREE.PlaneGeometry(0.24, curW * 1.5), causewayWhiteLineMat);
        barBot.rotation.x = -Math.PI / 2;
        barBot.rotation.z = -Math.PI / 4;
        barBot.position.set(curW / 2, yMark, curZ);
        causewayGroup.add(barBot);
      }
    }
  };
  addChevronV(1430, 1470);

  // Chevron pada apex selatan pulau teardrop oval (Z in [1560, 1575])
  addChevronBars(-2.2, 2.2, 1560, 1575, Math.PI / 4);

  // 5. MARKA PANAH ARAH LALU LINTAS VEKTOR (HIGHWAY DIRECTION ARROWS)
  const addRoadArrow = (x, z, pointSouth) => {
    const arrow = createHighwayArrow(pointSouth);
    arrow.position.set(x, yMark + 0.001, z);
    causewayGroup.add(arrow);
  };

  // Inbound (+X): Menunjuk ke Terminal (+Z / North, pointSouth = false)
  [1130, 1180, 1530].forEach(az => {
    addRoadArrow(3.2, az, false);
    addRoadArrow(7.0, az, false);
    addRoadArrow(10.8, az, false);
  });
  // Flare mendekati gerbang tol (Z = 1270)
  [2.5, 7.5, 12.5, 17.5].forEach(ax => addRoadArrow(ax, 1270, false));
  // Mengitari pulau oval (Z = 1490)
  [4.5, 9.5, 14.5].forEach(ax => addRoadArrow(ax, 1490, false));

  // Outbound (-X): Menunjuk ke Pulau 1 (-Z / South, pointSouth = true)
  [1130, 1180].forEach(az => {
    addRoadArrow(-3.2, az, true);
    addRoadArrow(-7.0, az, true);
    addRoadArrow(-10.8, az, true);
  });
  // Flare meninggalkan gerbang tol (Z = 1270)
  [-2.5, -7.5, -12.5, -17.5].forEach(ax => addRoadArrow(ax, 1270, true));
  // Mengitari pulau oval (Z = 1490)
  [-4.5, -9.5, -14.5].forEach(ax => addRoadArrow(ax, 1490, true));

  // 6. SIMPANG 4 TERMINAL (Dihapus sepenuhnya)

  // 5. MEDIAN JALAN TENGAH (Z in [1084, 1310])
  // Berdasarkan citra satelit, TIDAK ADA pulau rumput, pohon, atau pembatas beton di tengah jalan sebelum gerbang tol.
  // Jalan hanya dipisahkan oleh marka garis ganda putih (sudah digambar di atas).

  // Shuttle Bus / Servis Pelabuhan Warna Kuning Cerah (Z = 1290 di lajur dalam)
  const yellowShuttleBus = new THREE.Group();
  yellowShuttleBus.position.set(2.5, 1.631, 1290);
  const shuttleBody = new THREE.Mesh(new THREE.BoxGeometry(2.4, 1.8, 7.2), yellowShuttleMat);
  shuttleBody.position.set(0, 1.1, 0);
  shuttleBody.castShadow = true;
  yellowShuttleBus.add(shuttleBody);

  const shuttleCab = new THREE.Mesh(new THREE.BoxGeometry(2.2, 0.9, 6.8), tollBoothGlassMat);
  shuttleCab.position.set(0, 1.5, 0);
  yellowShuttleBus.add(shuttleCab);

  [-1.25, 1.25].forEach(wx => {
    [-2.2, 2.2].forEach(wz => {
      const wh = new THREE.Mesh(new THREE.CylinderGeometry(0.45, 0.45, 0.35, 12), steelMat);
      wh.rotation.z = Math.PI / 2;
      wh.position.set(wx, 0.45, wz);
      yellowShuttleBus.add(wh);
    });
  });
  causewayGroup.add(yellowShuttleBus);

  // 6. KANOPI GERBANG TOL LENGKUNG MEGAH MELINTANG (GRAND BARREL-VAULT TOLL CANOPY)
  // Membentang melintang sepanjang 50m (X in [-22.5, +27.5], Z in [1481, 1499], Center Z = 1490)
  const tollPlazaGroup = new THREE.Group();
  tollPlazaGroup.name = 'toll_plaza_gate';

  const canopyWidth = 50.0; // Panjang melintang North-South
  const canopyLength = 18.0; // Lebar membujur East-West (Z)
  const canopyCenterX = 2.5;
  const canopyCenterZ = 1330.0;
  const canopyClearanceY = 5.8;

  // Atap Melengkung Barrel-Vault (Extrude Geometry)
  const archProfile = new THREE.Shape();
  const archSegs = 24;
  const chordW = canopyWidth;
  const sagittaH = 2.2; // Lengkungan busur 2.2 meter

  archProfile.moveTo(-chordW / 2, canopyClearanceY);
  for (let s = 1; s <= archSegs; s++) {
    const u = s / archSegs;
    const curX = -chordW / 2 + u * chordW;
    const curY = canopyClearanceY + sagittaH * 4.0 * u * (1.0 - u);
    archProfile.lineTo(curX, curY);
  }
  archProfile.lineTo(chordW / 2, canopyClearanceY + 0.4);
  for (let s = archSegs; s >= 0; s--) {
    const u = s / archSegs;
    const curX = -chordW / 2 + u * chordW;
    const curY = canopyClearanceY + 0.4 + sagittaH * 4.0 * u * (1.0 - u);
    archProfile.lineTo(curX, curY);
  }
  archProfile.closePath();

  const canopyArchGeo = new THREE.ExtrudeGeometry(archProfile, {
    steps: 1,
    depth: canopyLength,
    bevelEnabled: false
  });
  canopyArchGeo.translate(canopyCenterX, 0, canopyCenterZ - canopyLength / 2);
  const canopyRoof = new THREE.Mesh(canopyArchGeo, tollCanopySilverMat);
  canopyRoof.castShadow = true;
  canopyRoof.receiveShadow = true;
  tollPlazaGroup.add(canopyRoof);

  // Fascia Aksen Biru Pelindo di Portal Depan & Belakang Kanopi
  [-canopyLength / 2, canopyLength / 2].forEach(fz => {
    const fascia = new THREE.Mesh(new THREE.BoxGeometry(canopyWidth * 1.01, 0.7, 0.35), gateBlueMat);
    fascia.position.set(canopyCenterX, canopyClearanceY + 1.2, canopyCenterZ + fz);
    fascia.castShadow = true;
    tollPlazaGroup.add(fascia);
  });

  // 7 Kolom Penopang Rangka Baja Kanopi dengan Pedestal Beton
  [-22.0, -14.0, -6.0, +2.5, +11.0, +19.0, +27.0].forEach(cx => {
    const pedestal = new THREE.Mesh(new THREE.BoxGeometry(1.2, 0.8, 3.2), curbConcreteGreyMat);
    pedestal.position.set(cx, 1.631 + 0.4, canopyCenterZ);
    pedestal.castShadow = true;
    tollPlazaGroup.add(pedestal);

    const column = new THREE.Mesh(new THREE.CylinderGeometry(0.24, 0.28, 5.2, 8), steelMat);
    column.position.set(cx, 1.631 + 3.2, canopyCenterZ);
    column.castShadow = true;
    tollPlazaGroup.add(column);
  });

  // 10 PULAU PEMBATAS LAJUR & GARDU PEMERIKSAAN TOL (5 INBOUND + 5 OUTBOUND)
  const tollIslandPositions = [
    // Sisi Masuk (Inbound +X)
    { x: 2.5, isIn: true }, { x: 7.5, isIn: true }, { x: 12.5, isIn: true }, { x: 17.5, isIn: true }, { x: 22.5, isIn: true },
    // Sisi Keluar (Outbound -X)
    { x: -2.5, isIn: false }, { x: -7.5, isIn: false }, { x: -12.5, isIn: false }, { x: -17.5, isIn: false }, { x: -22.5, isIn: false }
  ];

  tollIslandPositions.forEach((isl) => {
    // Pulau Beton Kanstin (Panjang 20m)
    const islandBlock = new THREE.Mesh(new THREE.BoxGeometry(1.1, 0.25, 20.0), curbConcreteGreyMat);
    islandBlock.position.set(isl.x, 1.631 + 0.125, canopyCenterZ);
    islandBlock.castShadow = true;
    tollPlazaGroup.add(islandBlock);

    // Gardu Tol Kaca Modern
    const boothGroup = new THREE.Group();
    boothGroup.position.set(isl.x, 1.631 + 0.25, canopyCenterZ - 1.5);

    const bBase = new THREE.Mesh(new THREE.BoxGeometry(0.9, 1.2, 3.2), massingWhiteMat);
    bBase.position.set(0, 0.6, 0);
    bBase.castShadow = true;
    boothGroup.add(bBase);

    const bGlass = new THREE.Mesh(new THREE.BoxGeometry(0.85, 1.1, 2.8), tollBoothGlassMat);
    bGlass.position.set(0, 1.65, 0);
    boothGroup.add(bGlass);

    const bRoof = new THREE.Mesh(new THREE.BoxGeometry(1.1, 0.25, 3.6), buildingDarkTrimMat);
    bRoof.position.set(0, 2.3, 0);
    boothGroup.add(bRoof);

    // Palang Tol Otomatis Merah-Putih
    const barrierBase = new THREE.Mesh(new THREE.BoxGeometry(0.3, 0.9, 0.3), buildingDarkTrimMat);
    barrierBase.position.set(isl.x > 0 ? -0.4 : 0.4, 0.45, 2.2);
    boothGroup.add(barrierBase);

    const barrierArm = new THREE.Mesh(new THREE.BoxGeometry(3.6, 0.1, 0.1), boomBarrierMat);
    barrierArm.position.set(isl.x > 0 ? -2.2 : 2.2, 0.85, 2.2);
    boothGroup.add(barrierArm);

    // Lampu Sinyal Hijau di Depan Gardu
    const signalLight = new THREE.Mesh(new THREE.SphereGeometry(0.12, 8, 8), ledGreenArrowMat);
    signalLight.position.set(0, 2.6, isl.isIn ? -1.7 : 1.7);
    boothGroup.add(signalLight);

    tollPlazaGroup.add(boothGroup);
  });

  // Stop Bar & Garis Zebra Antrean Gerbang Tol
  const stopBarPlaza = new THREE.Mesh(new THREE.PlaneGeometry(canopyWidth, 0.8), whiteLineMat);
  stopBarPlaza.rotation.x = -Math.PI / 2;
  stopBarPlaza.position.set(canopyCenterX, 1.637, canopyCenterZ - 12.0);
  tollPlazaGroup.add(stopBarPlaza);

  // Gedung Operasional Gerbang Tol di Sisi Sayap Utara (X = 31, Z = 1330)
  const northTollControlOffice = createMassingBuilding(7.5, 4.5, 14.0, 31.0, 1330, 1.631, massingWhiteMat);
  tollPlazaGroup.add(northTollControlOffice);

  causewayGroup.add(tollPlazaGroup);

  // 7. PULAU TEARDROP OVAL PASCA MAIN GATE & POS KONTROL ADMINISTRASI (Z in [1430, 1560])
  const ovalIslandGroup = new THREE.Group();
  ovalIslandGroup.name = 'post_toll_oval_island';

  // Geometri Hamparan Tanah & Vegetasi Pulau Oval
  const ovalLawnGeo = new THREE.BufferGeometry();
  const ovalPositions = [];
  const ovalNormals = [];
  const ovalSteps = 40;
  const ovalZStart = 1445;
  const ovalZEnd = 1560;
  const ovalLen = ovalZEnd - ovalZStart;

  for (let i = 0; i < ovalSteps; i++) {
    const zA = ovalZStart + (i / ovalSteps) * ovalLen;
    const zB = ovalZStart + ((i + 1) / ovalSteps) * ovalLen;
    const owA = getOvalHalfWidth(zA);
    const owB = getOvalHalfWidth(zB);
    const y = 1.745;

    ovalPositions.push(
      -owA, y, zA, owB, y, zB, owA, y, zA,
      -owA, y, zA, -owB, y, zB, owB, y, zB
    );
    for (let k = 0; k < 6; k++) ovalNormals.push(0, 1, 0);
  }
  ovalLawnGeo.setAttribute('position', new THREE.Float32BufferAttribute(ovalPositions, 3));
  ovalLawnGeo.setAttribute('normal', new THREE.Float32BufferAttribute(ovalNormals, 3));
  const ovalLawnMesh = new THREE.Mesh(ovalLawnGeo, officeLawnMat);
  ovalLawnMesh.receiveShadow = true;
  ovalIslandGroup.add(ovalLawnMesh);

  // Kanstin Beton Pembatas Mengitari Pulau Oval
  for (let i = 0; i < ovalSteps; i++) {
    const zA = ovalZStart + (i / ovalSteps) * ovalLen;
    const zB = ovalZStart + ((i + 1) / ovalSteps) * ovalLen;
    const owA = getOvalHalfWidth(zA);
    const owB = getOvalHalfWidth(zB);
    const dz = zB - zA;

    // Kanstin Sisi Utara
    const dxN = owB - owA;
    const lenN = Math.hypot(dxN, dz);
    const angleN = Math.atan2(dxN, dz);
    const curbN = new THREE.Mesh(new THREE.BoxGeometry(0.24, 0.22, lenN), curbConcreteGreyMat);
    curbN.position.set((owA + owB) / 2, 1.74, (zA + zB) / 2);
    curbN.rotation.y = angleN;
    curbN.castShadow = true;
    ovalIslandGroup.add(curbN);

    // Kanstin Sisi Selatan
    const dxS = -owB - (-owA);
    const lenS = Math.hypot(dxS, dz);
    const angleS = Math.atan2(dxS, dz);
    const curbS = new THREE.Mesh(new THREE.BoxGeometry(0.24, 0.22, lenS), curbConcreteGreyMat);
    curbS.position.set((-owA - owB) / 2, 1.74, (zA + zB) / 2);
    curbS.rotation.y = angleS;
    curbS.castShadow = true;
    ovalIslandGroup.add(curbS);
  }

  // Cincin Pohon Peneduh Mengelilingi Perimeter Pulau Oval
  for (let z = 1400; z <= 1475; z += 9.5) {
    const curW = getOvalHalfWidth(z);
    if (curW > 2.0) {
      const idx = Math.floor((z - 1400) / 9.5);
      // Baris Pohon Sisi Utara
      addSatelliteTree(ovalIslandGroup, curW * 0.72, z, 2.6 + (idx % 2) * 0.25, idx % 4, 1.74);
      // Baris Pohon Sisi Selatan (hindari tumpuk dengan gedung di Z=1460)
      if (Math.abs(z - 1460) > 6.0) {
        addSatelliteTree(ovalIslandGroup, -curW * 0.72, z, 2.6 + ((idx + 1) % 2) * 0.25, (idx + 2) % 4, 1.74);
      }
    }
  }

  // Area Parkir Beton / Pull-off Bay di Sisi Utara Gedung Kontrol
  const serviceBayPad = new THREE.Mesh(new THREE.PlaneGeometry(6.0, 30.0), gatePlazaConcreteMat);
  serviceBayPad.rotation.x = -Math.PI / 2;
  serviceBayPad.position.set(0, 1.76, 1515);
  serviceBayPad.receiveShadow = true;
  ovalIslandGroup.add(serviceBayPad);

  // Gedung Pos Kontrol Administrasi Bertingkat di Sisi Selatan Pulau Oval
  const adminPostBooth = createMassingBuilding(6.0, 4.8, 6.0, 0, 1520, 1.74, massingWhiteMat);
  ovalIslandGroup.add(adminPostBooth);

  causewayGroup.add(ovalIslandGroup);

  // C. Median Lurus Ujung Koridor Menuju Terminal (Z in [1480, 1570])
  const med3Len = 1570 - 1480;
  const med3CenterZ = (1480 + 1570) / 2;
  [-1.2, 1.2].forEach(cx => {
    const curb = new THREE.Mesh(new THREE.BoxGeometry(0.22, 0.22, med3Len), curbConcreteGreyMat);
    curb.position.set(cx, 1.74, med3CenterZ);
    curb.castShadow = true;
    causewayGroup.add(curb);
  });

  const med3Grass = new THREE.Mesh(new THREE.PlaneGeometry(2.18, med3Len), medianGrassMat);
  med3Grass.rotation.x = -Math.PI / 2;
  med3Grass.position.set(0, 1.745, med3CenterZ);
  med3Grass.receiveShadow = true;
  causewayGroup.add(med3Grass);

  for (let z = 1465; z <= 1563; z += 8.5) {
    const idx = Math.floor((z - 1465) / 8.5);
    addSatelliteTree(causewayGroup, 0, z, 2.4, idx % 4, 1.74);
  }

  for (let lz = 1470; lz <= 1560; lz += 28) {
    const pole = new THREE.Mesh(new THREE.CylinderGeometry(0.09, 0.14, 8.2, 8), steelMat);
    pole.position.set(0, 1.74 + 4.1, lz);
    pole.castShadow = true;
    causewayGroup.add(pole);

    [-1.4, 1.4].forEach(armX => {
      const arm = new THREE.Mesh(new THREE.CylinderGeometry(0.04, 0.04, 1.8, 6), steelMat);
      arm.rotation.z = armX > 0 ? -Math.PI / 4 : Math.PI / 4;
      arm.position.set(armX * 0.55, 1.74 + 7.8, lz);
      causewayGroup.add(arm);

      const fixture = new THREE.Mesh(new THREE.BoxGeometry(0.42, 0.12, 0.22), lampGlowMat);
      fixture.position.set(armX * 1.15, 1.74 + 8.25, lz);
      causewayGroup.add(fixture);
    });
  }

  // 8. SALURAN PIPA UTILITAS GANDA DI SEPANJANG TANGGUL UTARA (Z: 1085 s/d 1570)
  const pipelineGroup = new THREE.Group();
  pipelineGroup.name = 'north_causeway_utility_pipeline';
  const pipeStep = 12.0;
  for (let pz = 1085; pz <= 1565; pz += pipeStep) {
    const pzNext = Math.min(1570, pz + pipeStep);
    const px1 = getBermNorthX(pz) + 1.2;
    const px2 = getBermNorthX(pzNext) + 1.2;
    const dz = pzNext - pz;
    const dx = px2 - px1;
    const len = Math.hypot(dx, dz);
    const angle = Math.atan2(dx, dz);

    // Pipa Utama Galvanis (Diameter 0.35m)
    const mainPipe = new THREE.Mesh(new THREE.CylinderGeometry(0.18, 0.18, len, 8), utilityPipeMat);
    mainPipe.rotation.x = Math.PI / 2;
    mainPipe.rotation.z = -angle;
    mainPipe.position.set((px1 + px2) / 2, 1.631 + 0.45, (pz + pzNext) / 2);
    mainPipe.castShadow = true;
    pipelineGroup.add(mainPipe);

    // Pipa Sekunder (Diameter 0.22m)
    const secPipe = new THREE.Mesh(new THREE.CylinderGeometry(0.11, 0.11, len, 8), utilityPipeMat);
    secPipe.rotation.x = Math.PI / 2;
    secPipe.rotation.z = -angle;
    secPipe.position.set((px1 + px2) / 2 + 0.38, 1.631 + 0.38, (pz + pzNext) / 2);
    secPipe.castShadow = true;
    pipelineGroup.add(secPipe);

    // Dudukan Beton Penyangga Pipa (Concrete Saddle) setiap 12m
    const saddle = new THREE.Mesh(new THREE.BoxGeometry(0.95, 0.45, 0.5), curbConcreteGreyMat);
    saddle.position.set(px1 + 0.19, 1.631 + 0.22, pz);
    saddle.castShadow = true;
    pipelineGroup.add(saddle);
  }
  causewayGroup.add(pipelineGroup);

  // 9. AVENIU POHON PENEDUH BAHU JALAN DI SEPANJANG TANGGUL (Z: 1085 s/d 1830)
  for (let z = causewayZStart + 5; z <= causewayZEnd - 15; z += 8.5) {
    const idx = Math.floor((z - causewayZStart) / 8.5);
    const toneN = idx % 4;
    const toneS = (idx + 2) % 4;

    const xN = getRoadNorthX(z) + 2.4;
    const xS = getRoadSouthX(z) - 2.4;

    // Pohon & Semak Bahu Utara
    addSatelliteTree(causewayGroup, xN, z, 2.6 + (idx % 3) * 0.25, toneN, 1.63);
    addBushCluster(causewayGroup, xN + 1.2, z - 2.5, 1.2, (toneN + 1) % 4, 1.63);

    // Pohon & Semak Bahu Selatan (hindari bentrok dengan area staging di Z in [1525, 1590])
    if (z < 1520) {
      addSatelliteTree(causewayGroup, xS, z, 2.6 + ((idx + 1) % 3) * 0.25, toneS, 1.63);
      addBushCluster(causewayGroup, xS - 1.2, z + 2.5, 1.2, (toneS + 1) % 4, 1.63);
    }
  }

  // Pagar Pengaman Baja Jalan Tol (W-Beam Guardrails)
  for (let z = 1115; z <= 1575; z += 5.0) {
    const xN = getRoadNorthX(z) + 0.15;
    const xS = getRoadSouthX(z) - 0.15;

    const postN = new THREE.Mesh(new THREE.BoxGeometry(0.14, 0.8, 0.14), steelMat);
    postN.position.set(xN, 1.63 + 0.4, z);
    causewayGroup.add(postN);

    const postS = new THREE.Mesh(new THREE.BoxGeometry(0.14, 0.8, 0.14), steelMat);
    postS.position.set(xS, 1.63 + 0.4, z);
    causewayGroup.add(postS);
  }

  // 10. PERGUDANGAN LOGISTIK MASIF (Dihapus sepenuhnya)

  // 11. PULAU HUTAN MANGROVE KONSERVASI MASIF DENGAN SUDUT MELENGKUNG BARAT-LAUT (Dihapus sepenuhnya)

  // 12. PELAMPUNG SUAR MARITIM
  // Pelampung Suar Navigasi Alur Pelayaran
  const createNavBuoy = (x, z, colorHex, isGreen) => {
    const buoyGroup = new THREE.Group();
    buoyGroup.position.set(x, 0, z);

    const bodyMat = new THREE.MeshStandardMaterial({ color: colorHex, roughness: 0.4 });
    const body = new THREE.Mesh(new THREE.CylinderGeometry(1.2, 0.9, 1.8, 12), bodyMat);
    body.position.set(0, 0.5, 0);
    body.castShadow = true;
    buoyGroup.add(body);

    const cage = new THREE.Mesh(new THREE.CylinderGeometry(0.35, 0.8, 1.4, 6, 1, true), steelMat);
    cage.position.set(0, 2.0, 0);
    buoyGroup.add(cage);

    const beaconMat = new THREE.MeshBasicMaterial({ color: isGreen ? 0x22c55e : 0xef4444 });
    const beacon = new THREE.Mesh(new THREE.SphereGeometry(0.25, 8, 8), beaconMat);
    beacon.position.set(0, 2.8, 0);
    buoyGroup.add(beacon);

    causewayGroup.add(buoyGroup);
  };

  createNavBuoy(52, 1150, 0x15803d, true);   // Suar Hijau
  createNavBuoy(-52, 1150, 0xb91c1c, false); // Suar Merah

  group.add(causewayGroup);

  scene.add(group);
  return group;
}
