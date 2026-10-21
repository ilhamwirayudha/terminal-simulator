import * as THREE from 'three';

/**
 * ==============================================================================
 * Terminal Teluk Lamong (TTL) - 3-Lane Dedicated Highway Road Network
 * ==============================================================================
 *
 * DEDICATED 3-LANE SYSTEM FOR EACH DIRECTION:
 *
 * 1. SISI JALUR MASUK (INBOUND / SCREEN-LEFT: X in [-16.0, -4.2]):
 *    - LAJUR KIRI (X = -13.8): TRUK KONTAINER (Container Trucks Queue & Driving)
 *    - LAJUR TENGAH (X = -10.0): TRUK CURAH KERING (Dry Bulk & Dump Trucks)
 *    - LAJUR KANAN (X = -6.2): MOTOR & MOBIL (Cars, Pickups, Motorcycles)
 *    - Seluruh panah menunjuk KE DEPAN / UTARA (↑)
 *    - Garis henti Stop Line pada pos pemeriksaan (Z = -80)
 *
 * 2. SISI JALUR KELUAR (OUTBOUND / SCREEN-RIGHT: X in [+4.2, +16.0]):
 *    - LAJUR KIRI DRIVER (X = +13.8 / Sisi Luar): TRUK KONTAINER
 *    - LAJUR TENGAH (X = +10.0): TRUK CURAH KERING
 *    - LAJUR KANAN DRIVER (X = +6.2 / Sisi Dalam): MOTOR & MOBIL
 *    - Seluruh panah menunjuk KE BELAKANG / SELATAN (↓)
 *
 * 3. MEDIAN TAMAN TENGAH (X = 0) with 2 U-Turn Crossovers
 */
export function createRoadNetwork(scene) {
  const roadGroup = new THREE.Group();
  roadGroup.name = 'ttl_3lane_highway_road_network';

  // ----------------------------------------------------------------------------
  // Shared PBR Materials
  // ----------------------------------------------------------------------------
  const asphaltMaterial = new THREE.MeshStandardMaterial({
    color: 0x22262e, // Deep asphalt
    roughness: 0.88,
    metalness: 0.08
  });

  const containerShoulderMat = new THREE.MeshStandardMaterial({
    color: 0x2b303a, // Reinforced concrete-asphalt shoulder for heavy containers
    roughness: 0.92,
    metalness: 0.05
  });

  const whiteLineMaterial = new THREE.MeshBasicMaterial({
    color: 0xf8fafc,
    side: THREE.DoubleSide
  });

  const yellowCurbMaterial = new THREE.MeshBasicMaterial({
    color: 0xfbbf24,
    side: THREE.DoubleSide
  });

  const hatchLineMaterial = new THREE.MeshBasicMaterial({
    color: 0xf1f5f9,
    side: THREE.DoubleSide
  });

  const flyoverConcreteMat = new THREE.MeshStandardMaterial({
    color: 0x94a3b8, // Slate reinforced concrete for flyover box girders
    roughness: 0.72,
    metalness: 0.2
  });

  const flyoverPierMat = new THREE.MeshStandardMaterial({
    color: 0x64748b, // Darker concrete for pier columns & pier caps
    roughness: 0.82,
    metalness: 0.15
  });

  const flyoverBarrierMat = new THREE.MeshStandardMaterial({
    color: 0xe2e8f0, // White-grey crash barrier wall
    roughness: 0.5,
    metalness: 0.3
  });

  const steelMat = new THREE.MeshStandardMaterial({
    color: 0x334155,
    roughness: 0.4,
    metalness: 0.8
  });

  // ----------------------------------------------------------------------------
  // Sharp Vector Highway Arrow Builder
  // ----------------------------------------------------------------------------
  const createHighwayArrow = (shapePointsUp = true) => {
    const shape = new THREE.Shape();
    const stemW = 0.28;
    const stemL = 2.60;
    const headW = 1.05;
    const headL = 1.55;

    // CATATAN: Setelah rotation.x = -PI/2:
    //   Shape +Y → World -Z (arah layar/keluar) = visual ↓ EXIT
    //   Shape -Y → World +Z (arah kantor/masuk) = visual ↑ ENTRY
    // Gunakan shapePointsUp=false untuk ENTRY (↑), shapePointsUp=true untuk EXIT (↓)

    if (shapePointsUp) {
      // EXIT: Shape +Y → setelah rotasi = visual menunjuk KE LAYAR (↓ / keluar)
      shape.moveTo(-stemW / 2, -stemL);
      shape.lineTo(stemW / 2, -stemL);
      shape.lineTo(stemW / 2, 0);
      shape.lineTo(headW / 2, 0);
      shape.lineTo(0, headL);
      shape.lineTo(-headW / 2, 0);
      shape.lineTo(-stemW / 2, 0);
      shape.closePath();
    } else {
      // ENTRY: Shape -Y → setelah rotasi = visual menunjuk KE KANTOR (↑ / masuk)
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
    const mesh = new THREE.Mesh(geo, whiteLineMaterial);
    mesh.rotation.x = -Math.PI / 2;

    return mesh;
  };

  const addRoadArrow = (x, z, pointUpwards, yLevel = 0.81) => {
    const arrow = createHighwayArrow(pointUpwards);
    arrow.position.set(x, yLevel + 0.016, z);
    roadGroup.add(arrow);
  };

  // ----------------------------------------------------------------------------
  // Helper: Diagonal Chevron Hatching Box (for U-Turns & Tapers)
  // ----------------------------------------------------------------------------
  const addChevronHatchBox = (minX, maxX, minZ, maxZ, yLevel = 0.812) => {
    const w = maxX - minX;
    const l = maxZ - minZ;
    const spacing = 1.8;
    const numLines = Math.floor((w + l) / spacing);

    for (let i = 0; i < numLines; i++) {
      const offset = minZ + (i * spacing);
      const lineGeo = new THREE.PlaneGeometry(0.22, Math.min(w * 1.4, 7.0));
      const lineMesh = new THREE.Mesh(lineGeo, hatchLineMaterial);
      lineMesh.rotation.x = -Math.PI / 2;
      lineMesh.rotation.z = Math.PI / 4;
      lineMesh.position.set((minX + maxX) / 2, yLevel, Math.min(Math.max(offset, minZ), maxZ));
      roadGroup.add(lineMesh);
    }
  };

  // ----------------------------------------------------------------------------
  // Helper: Hourglass Chevron Hatching Box (for U-Turns)
  // ----------------------------------------------------------------------------
  const addUTurnChevron = (minX, maxX, minZ, maxZ, yLevel = 0.812) => {
    const w = maxX - minX;
    const l = maxZ - minZ;
    const midX = (minX + maxX) / 2;
    const midZ = (minZ + maxZ) / 2;

    const canvas = document.createElement('canvas');
    canvas.width = 512;
    canvas.height = Math.round(512 * (l / w));
    const ctx = canvas.getContext('2d');
    
    // Draw Hourglass Outline
    ctx.beginPath();
    ctx.moveTo(0, 0); // Top-left
    // Top concave curve (faces incoming median end)
    ctx.quadraticCurveTo(canvas.width / 2, canvas.height * 0.25, canvas.width, 0);
    ctx.lineTo(canvas.width, canvas.height); // Right edge
    // Bottom concave curve (faces outgoing median end)
    ctx.quadraticCurveTo(canvas.width / 2, canvas.height * 0.75, 0, canvas.height);
    ctx.lineTo(0, 0); // Left edge
    ctx.closePath();

    ctx.save();
    ctx.clip(); // Clip diagonal lines inside the hourglass

    // Draw diagonal hatching lines
    ctx.lineWidth = 14;
    ctx.strokeStyle = '#f1f5f9';
    const maxDim = Math.max(canvas.width, canvas.height) * 2;
    for (let i = -maxDim; i < maxDim; i += 36) {
      ctx.beginPath();
      ctx.moveTo(i, 0);
      ctx.lineTo(i + maxDim, maxDim);
      ctx.stroke();
    }
    ctx.restore();

    // Draw the white outline border
    ctx.lineWidth = 12;
    ctx.strokeStyle = '#f1f5f9';
    ctx.stroke(); // strokes the hourglass path defined earlier

    const tex = new THREE.CanvasTexture(canvas);
    const geo = new THREE.PlaneGeometry(w, l);
    const mat = new THREE.MeshBasicMaterial({ 
      map: tex, 
      transparent: true,
      side: THREE.DoubleSide 
    });
    const mesh = new THREE.Mesh(geo, mat);
    mesh.rotation.x = -Math.PI / 2;
    mesh.position.set(midX, yLevel, midZ);
    roadGroup.add(mesh);
  };

  // ----------------------------------------------------------------------------
  // Helper: Tapered Solid Lines
  // ----------------------------------------------------------------------------
  const createTaperLine = (startX, endX, startZ, endZ, mat = whiteLineMaterial, width = 0.25, yLevel = 0.825) => {
    const shape = new THREE.Shape();
    const halfW = width / 2;
    shape.moveTo(startX - halfW, -startZ);
    shape.lineTo(startX + halfW, -startZ);
    shape.lineTo(endX + halfW,   -endZ);
    shape.lineTo(endX - halfW,   -endZ);
    shape.closePath();
    const geo = new THREE.ShapeGeometry(shape);
    const lineMesh = new THREE.Mesh(geo, mat);
    lineMesh.rotation.x = -Math.PI / 2;
    lineMesh.position.set(0, yLevel, 0);
    roadGroup.add(lineMesh);
  };

  // ----------------------------------------------------------------------------
  // Helper: Vector Polygon Diagonal Stripe Generator (Garis-Garis Putih Chevron)
  // ----------------------------------------------------------------------------
  const addPolygonDiagonalStripes = (polygonPoints, spacing = 2.2, stripeWidth = 0.35, yLevel = 0.822) => {
    const nx = Math.SQRT1_2;
    const nz = Math.SQRT1_2;

    let minD = Infinity;
    let maxD = -Infinity;
    polygonPoints.forEach(([x, z]) => {
      const d = nx * x + nz * z;
      if (d < minD) minD = d;
      if (d > maxD) maxD = d;
    });

    const positions = [];
    const numEdges = polygonPoints.length;

    for (let d = minD + spacing * 0.4; d < maxD; d += spacing) {
      const intersections = [];

      for (let i = 0; i < numEdges; i++) {
        const [x1, z1] = polygonPoints[i];
        const [x2, z2] = polygonPoints[(i + 1) % numEdges];

        const d1 = nx * x1 + nz * z1;
        const d2 = nx * x2 + nz * z2;
        const denom = d2 - d1;

        if (Math.abs(denom) > 1e-6) {
          const s = (d - d1) / denom;
          if (s >= 0 && s <= 1) {
            intersections.push({ x: x1 + s * (x2 - x1), z: z1 + s * (z2 - z1) });
          }
        }
      }

      if (intersections.length >= 2) {
        intersections.sort((p1, p2) => p1.x - p2.x || p1.z - p2.z);
        const A = intersections[0];
        const B = intersections[intersections.length - 1];
        const halfW = stripeWidth / 2;
        const offX = nx * halfW;
        const offZ = nz * halfW;

        const p1 = [A.x + offX, yLevel, A.z + offZ];
        const p2 = [A.x - offX, yLevel, A.z - offZ];
        const p3 = [B.x - offX, yLevel, B.z - offZ];
        const p4 = [B.x + offX, yLevel, B.z + offZ];

        positions.push(...p1, ...p2, ...p3);
        positions.push(...p1, ...p3, ...p4);
      }
    }

    if (positions.length > 0) {
      const geo = new THREE.BufferGeometry();
      geo.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
      geo.computeVertexNormals();
      const mesh = new THREE.Mesh(geo, whiteLineMaterial);
      roadGroup.add(mesh);
    }
  };

  // ----------------------------------------------------------------------------
  // Helper: Road Pavement & Lines
  // ----------------------------------------------------------------------------
  const addRoadPavement = (centerX, width, startZ, endZ, isShoulder = false, yLevel = 0.81) => {
    const length = Math.abs(endZ - startZ);
    const midZ = (startZ + endZ) / 2;
    const mat = isShoulder ? containerShoulderMat : asphaltMaterial;

    const geo = new THREE.PlaneGeometry(width, length);
    const mesh = new THREE.Mesh(geo, mat);
    mesh.rotation.x = -Math.PI / 2;
    mesh.position.set(centerX, yLevel, midZ);
    mesh.receiveShadow = true;
    roadGroup.add(mesh);
  };

  const addSolidLine = (x, startZ, endZ, mat = whiteLineMaterial, yLevel = 0.82) => {
    const length = Math.abs(endZ - startZ);
    const midZ = (startZ + endZ) / 2;
    const geo = new THREE.PlaneGeometry(0.22, length);
    const mesh = new THREE.Mesh(geo, mat);
    mesh.rotation.x = -Math.PI / 2;
    mesh.position.set(x, yLevel, midZ);
    roadGroup.add(mesh);
  };

  const addDashedLine = (x, startZ, endZ, yLevel = 0.82) => {
    const length = Math.abs(endZ - startZ);
    const dashL = 3.0;
    const gapL = 2.0;
    const numDashes = Math.floor(length / (dashL + gapL));

    for (let i = 0; i < numDashes; i++) {
      const curZ = startZ + i * (dashL + gapL) + dashL / 2;
      const geo = new THREE.PlaneGeometry(0.18, dashL);
      const mesh = new THREE.Mesh(geo, whiteLineMaterial);
      mesh.rotation.x = -Math.PI / 2;
      mesh.position.set(x, yLevel, curZ);
      roadGroup.add(mesh);
    }
  };


  // ============================================================
  // KORIDOR JALAN DARATAN TERMINAL TELUK LAMONG (Z = -1108 s/d Z = -80)
  // Berdasarkan Koordinat GPS Asli Apple Maps & WGS84 Datum Presisi:
  //
  // GEOMETRI SIMETRIS IDENTIK (SISI MASUK & SISI KELUAR PERSIS SAMA LEBARNYA):
  // 1. SEGMEN 1: AKSES DARAT TAMBAK OSOWILANGON & FLYOVER TOL (Z in [-1108, -792])
  //    - Lebar Total Koridor Melebar: 48.0 Meter
  //    - Sisi Masuk (+X):
  //      * Jalan Darat Osowilangon: X in [+13.0, +25.0] (Lebar 12.0m, 3 Lajur Penuh di Level Tanah)
  //      * Flyover Tol Masuk (Ramp Down): X in [+4.0, +12.0] (Lebar 8.0m, 2 Lajur Tol Melayang Turun)
  //    - Median Tengah Berpohon (Celah Antar Flyover): X in [-4.0, +4.0] (Lebar 8.0m)
  //    - Sisi Keluar (-X):
  //      * Flyover Tol Keluar (Ramp Down/Up): X in [-12.0, -4.0] (Lebar 8.0m, 2 Lajur Tol Melayang Turun)
  //      * Jalan Darat Osowilangon: X in [-25.0, -13.0] (Lebar 12.0m, 3 Lajur Penuh di Level Tanah)
  //    - Ketinggian Flyover Tol: Turun melandai (Ramp Down) dari Y = 7.0m di Z = -1108 ke Y = 0.81m di Z = -792
  //    - Di bawah kolong flyover: Tanah/rumput & pilar beton (BERSIH DARI JALAN & TRUK)
  //
  // 2. SEGMEN 2: TITIK PENGGABUNGAN & PENYEMPITAN (TOUCHDOWN & MERGE: Z in [-792, -680])
  //    - Ujung turunan tol mendarat di tanah (Y = 0.81m) di Z = -792
  //    - Marka Hidung Chevron Gore di X in [+11, +13] dan X in [-13, -11]
  //    - Jalan menyempit secara mulus dari lebar 48.0m menjadi 32.0m (tetap 3 lajur utama)
  //
  // 3. SEGMEN 3: KORIDOR UTAMA MENUJU TERMINAL (Z in [-680, -80])
  //    - 3 Lajur Masuk Terdedikasi: X in [+4.0, +16.0] (Lebar 12.0m: Kontainer, Curah Kering, Mobil/Motor)
  //    - Median Tengah Berpohon: X in [-4.0, +4.0] (Lebar 8.0m)
  //    - 3 Lajur Keluar Terdedikasi: X in [-16.0, -4.0] (Lebar 12.0m: Mobil/Motor, Curah Kering, Kontainer)
  //    - Pos Keamanan di Z = -186 menaungi 3 lajur masuk
  // ============================================================

  const osowStartZ = -1108;
  const mergeZ = -792;
  const mainStartZ = -680;
  const mainEndZ = -80;

  // ------------------------------------------------------------
  // SEGMEN 1: JALAN DARAT OSOWILANGON (LEVEL TANAH Y = 0.81m, Z in [-1108, -792])
  // Masing-masing sisi memiliki 3 lajur penuh identik (Lebar 12.0m)
  // ------------------------------------------------------------

  // A. Jalan Darat Masuk Osowilangon (+X in [13.0, 25.0], Lebar 12.0m)
  // Lajur 1 (Kontainer / Luar): X = +23.0 (Lebar 4.0m)
  // Lajur 2 (Curah Kering / Tengah): X = +19.0 (Lebar 4.0m)
  // Lajur 3 (Motor & Mobil / Dalam): X = +15.0 (Lebar 4.0m)
  addRoadPavement(23.0, 4.0, osowStartZ, mergeZ, true);
  addRoadPavement(19.0, 4.0, osowStartZ, mergeZ, false);
  addRoadPavement(15.0, 4.0, osowStartZ, mergeZ, false);
  addSolidLine( 25.0, osowStartZ, mergeZ, whiteLineMaterial); // Garis bahu luar
  addDashedLine(21.0, osowStartZ, mergeZ);                     // Pemisah Kontainer & Curah
  addDashedLine(17.0, osowStartZ, mergeZ);                     // Pemisah Curah & Mobil
  addSolidLine( 13.0, osowStartZ, mergeZ, yellowCurbMaterial); // Garis tepi dalam pembatas flyover

  // B. Jalan Darat Keluar Osowilangon (-X in [-25.0, -13.0], Lebar 12.0m)
  // Lajur 3 (Motor & Mobil / Dalam): X = -15.0 (Lebar 4.0m)
  // Lajur 2 (Curah Kering / Tengah): X = -19.0 (Lebar 4.0m)
  // Lajur 1 (Kontainer / Luar): X = -23.0 (Lebar 4.0m)
  addRoadPavement(-15.0, 4.0, osowStartZ, mergeZ, false);
  addRoadPavement(-19.0, 4.0, osowStartZ, mergeZ, false);
  addRoadPavement(-23.0, 4.0, osowStartZ, mergeZ, true);
  addSolidLine(-13.0, osowStartZ, mergeZ, yellowCurbMaterial); // Garis tepi dalam pembatas flyover
  addDashedLine(-17.0, osowStartZ, mergeZ);                     // Pemisah Mobil & Curah
  addDashedLine(-21.0, osowStartZ, mergeZ);                     // Pemisah Curah & Kontainer
  addSolidLine(-25.0, osowStartZ, mergeZ, whiteLineMaterial); // Garis bahu luar

  // Panah Marka Jalan Segmen Osowilangon
  [-1070, -1000, -930, -850].forEach(z => {
    addRoadArrow( 23.0, z, false);
    addRoadArrow( 19.0, z, false);
    addRoadArrow( 15.0, z, false);
    addRoadArrow(-15.0, z, true);
    addRoadArrow(-19.0, z, true);
    addRoadArrow(-23.0, z, true);
  });

  // Sambungan Melintang Jl. Raya Tambak Osowilangon di Ujung Selatan (Z in [-1130, -1108])
  addRoadPavement(0, 56.0, -1130, -1108, false, 0.808);
  addSolidLine(-28.0, -1130, -1108, whiteLineMaterial);
  addSolidLine( 28.0, -1130, -1108, whiteLineMaterial);
  addSolidLine(  0.0, -1130, -1108, yellowCurbMaterial);

  // Jalan Kolong Melintang (Underpass Cross-Connector) di Bawah Tiang Flyover (Z in [-920, -895])
  addRoadPavement(0, 50.0, -920, -895, false, 0.809);
  addSolidLine(0, -920, -895, yellowCurbMaterial, 0.811);
  const yellowBoxPoly = [
    [-13.0, -920],
    [ 13.0, -920],
    [ 13.0, -895],
    [-13.0, -895]
  ];
  addPolygonDiagonalStripes(yellowBoxPoly, 2.8, 0.28, 0.813);
  createTaperLine(-13.0,  13.0, -920, -920.01, yellowCurbMaterial, 0.35, 0.814);
  createTaperLine(-13.0,  13.0, -895, -895.01, yellowCurbMaterial, 0.35, 0.814);
  createTaperLine(-13.0, -13.0, -920, -895,    yellowCurbMaterial, 0.35, 0.814);
  createTaperLine( 13.0,  13.0, -920, -895,    yellowCurbMaterial, 0.35, 0.814);

  // ============================================================
  // STRUKTUR 3D FLYOVER TOL ROMOKALISARI (RAMP DOWN MENERUS: Z in [-1108, -792])
  // ============================================================
  const flyoverGroup = new THREE.Group();
  flyoverGroup.name = 'flyover_tol_romokalisari_descent';

  const flyoverStartZ = -1108;
  const flyoverEndZ = -792;
  const flyoverLen = Math.abs(flyoverEndZ - flyoverStartZ); // 316m
  const flyoverMidZ = (flyoverStartZ + flyoverEndZ) / 2;    // -950m
  const flyoverStartY = 7.0;                                // Ketinggian melayang awal
  const flyoverEndY = 0.81;                                 // Ketinggian mendarat di tanah
  const flyoverMidY = (flyoverStartY + flyoverEndY) / 2;    // 3.905m
  const flyoverSlope = Math.atan2(flyoverStartY - flyoverEndY, flyoverLen); // ~1.12° kemiringan melandai turun
  const flyoverHypotLen = Math.hypot(flyoverLen, flyoverStartY - flyoverEndY); // 316.06m

  // 1. Pangkal Abutment & Portal Gerbang Tol Layang di Z = -1108
  const addFlyoverSouthAbutment = () => {
    // Tiang-tiang kolom besar penyangga pangkal flyover di selatan
    [-8.0, 8.0].forEach(px => {
      const col = new THREE.Mesh(new THREE.CylinderGeometry(0.85, 1.0, 7.0, 16), flyoverPierMat);
      col.position.set(px, 3.5, flyoverStartZ);
      col.castShadow = true;
      flyoverGroup.add(col);
    });

    // Balok penutup gelagar melintang (End Cap Crossbeam)
    const endCap = new THREE.Mesh(new THREE.BoxGeometry(25.0, 1.4, 2.4), flyoverConcreteMat);
    endCap.position.set(0, 6.3, flyoverStartZ);
    endCap.castShadow = true;
    flyoverGroup.add(endCap);

    // Dinding penutup selatan
    const southWall = new THREE.Mesh(new THREE.BoxGeometry(25.0, 6.3, 1.2), flyoverPierMat);
    southWall.position.set(0, 3.15, flyoverStartZ - 1.2);
    southWall.castShadow = true;
    flyoverGroup.add(southWall);
  };
  addFlyoverSouthAbutment();

  // 2. Dek Layang Kembar Melandai Turun (Ramp Down Decks: Lebar 8.0m Masing-Masing)
  const addSymmetricFlyoverDeck = (centerX, width = 8.0, isOutbound = false) => {
    const deckGroup = new THREE.Group();
    deckGroup.position.set(centerX, flyoverMidY, flyoverMidZ);
    deckGroup.rotation.x = flyoverSlope;

    // A. Box Girder Beton Miring Solid (Tebal 0.90m)
    // Berada di bawah lapisan aspal (y_local = -0.48)
    const boxGeo = new THREE.BoxGeometry(width, 0.90, flyoverHypotLen);
    const boxMesh = new THREE.Mesh(boxGeo, flyoverConcreteMat);
    boxMesh.position.set(0, -0.48, 0);
    boxMesh.castShadow = true;
    boxMesh.receiveShadow = true;
    deckGroup.add(boxMesh);

    // B. Lapisan Aspal Gelap Menerus (Tebal 0.06m)
    // Permukaan atas aspal tepat di y_local = +0.03 (menempel sempurna dari Y = 7.0m di selatan ke Y = 0.81m di utara)
    const aspGeo = new THREE.BoxGeometry(width, 0.06, flyoverHypotLen);
    const aspMesh = new THREE.Mesh(aspGeo, asphaltMaterial);
    aspMesh.position.set(0, 0, 0);
    aspMesh.receiveShadow = true;
    deckGroup.add(aspMesh);

    // C. Concrete Crash Barrier Parapets di Kedua Sisi Dek (Tinggi 0.85m, Tebal 0.32m)
    const halfW = width / 2;
    [-halfW + 0.16, halfW - 0.16].forEach(bx => {
      const barGeo = new THREE.BoxGeometry(0.32, 0.85, flyoverHypotLen);
      const barMesh = new THREE.Mesh(barGeo, flyoverBarrierMat);
      barMesh.position.set(bx, 0.425, 0);
      barMesh.castShadow = true;
      deckGroup.add(barMesh);
    });

    // D. Marka Garis Putus-Putus Tengah Dek (Pemisah 2 Lajur Tol)
    const numDashes = Math.floor(flyoverHypotLen / 6.0);
    const dashGeo = new THREE.BoxGeometry(0.18, 0.015, 3.2);
    for (let i = 0; i < numDashes; i++) {
      if (i % 2 === 0) {
        const localZ = -flyoverHypotLen / 2 + (i + 0.5) * 6.0;
        const dMesh = new THREE.Mesh(dashGeo, whiteLineMaterial);
        dMesh.position.set(0, 0.035, localZ);
        deckGroup.add(dMesh);
      }
    }

    // E. Panah Marka Jalan Tol di Atas Dek (isOutbound=false: Menunjuk Utara / Masuk; true: Selatan / Keluar)
    [-100, -20, 60].forEach(localZ => {
      const arrowMesh = createHighwayArrow(isOutbound);
      arrowMesh.position.set(0, 0.035, localZ);
      deckGroup.add(arrowMesh);
    });

    flyoverGroup.add(deckGroup);
  };

  addSymmetricFlyoverDeck( 8.0, 8.0, false); // Dek Tol Masuk (+X in [4.0, 12.0], Arah Utara / Masuk)
  addSymmetricFlyoverDeck(-8.0, 8.0, true);  // Dek Tol Keluar (-X in [-12.0, -4.0], Arah Selatan / Keluar)

  // Tiang Kolom Silinder Beton & Pier Cap di Bawah Flyover (Setiap 24m)
  for (let z = flyoverStartZ + 24; z <= flyoverEndZ - 20; z += 24) {
    const t = (z - flyoverStartZ) / flyoverLen;
    const curYDeck = flyoverStartY - t * (flyoverStartY - flyoverEndY);
    const colH = Math.max(0.6, curYDeck - 0.81 - 1.2);

    [-8.0, 8.0].forEach(px => {
      const col = new THREE.Mesh(new THREE.CylinderGeometry(0.55, 0.65, colH, 16), flyoverPierMat);
      col.position.set(px, 0.81 + colH / 2, z);
      col.castShadow = true;
      flyoverGroup.add(col);

      const cap = new THREE.Mesh(new THREE.BoxGeometry(8.0, 0.65, 1.6), flyoverPierMat);
      cap.position.set(px, 0.81 + colH + 0.32, z);
      cap.castShadow = true;
      flyoverGroup.add(cap);
    });
  }

  // Barisan Balok Melintang di Celah Tengah (Ladder Rungs in Center Gap X in [-4.0, +4.0])
  // Hanya menghubungkan struktur saat melayang tinggi (Z in [-1100, -880], Y >= 2.5m)
  const tieGeo = new THREE.BoxGeometry(7.7, 0.35, 0.52);
  for (let z = flyoverStartZ + 8; z <= -880; z += 12.0) {
    const t = (z - flyoverStartZ) / flyoverLen;
    const curYDeck = flyoverStartY - t * (flyoverStartY - flyoverEndY);
    const tie = new THREE.Mesh(tieGeo, flyoverConcreteMat);
    tie.position.set(0, curYDeck - 0.40, z);
    tie.castShadow = true;
    flyoverGroup.add(tie);
  }

  // ------------------------------------------------------------
  // SEGMEN 2: TITIK PENGGABUNGAN & PENYEMPITAN (TOUCHDOWN & MERGE: Z in [-792, -680])
  // Di Z = -792, flyover mendarat di tanah (Y = 0.81m).
  // Arus tol & arus Osowilangon menyatu, dan jalan menyempit dari 48m ke 32m (tetap 3 lajur)
  // ------------------------------------------------------------
  // Hidung Pemisah Marka Chevron Gore Area Sisi Masuk (+X in [11.0, 13.0])
  const mergeInGore = [
    [11.0, -792],
    [13.0, -792],
    [12.0, -730]
  ];
  addPolygonDiagonalStripes(mergeInGore, 2.0, 0.35, 0.824);
  createTaperLine(11.0, 12.0, -792, -730, whiteLineMaterial, 0.25, 0.825);
  createTaperLine(13.0, 12.0, -792, -730, whiteLineMaterial, 0.25, 0.825);

  // Hidung Pemisah Marka Chevron Gore Area Sisi Keluar (-X in [-13.0, -11.0])
  const mergeOutGore = [
    [-11.0, -792],
    [-13.0, -792],
    [-12.0, -730]
  ];
  addPolygonDiagonalStripes(mergeOutGore, 2.0, 0.35, 0.824);
  createTaperLine(-11.0, -12.0, -792, -730, whiteLineMaterial, 0.25, 0.825);
  createTaperLine(-13.0, -12.0, -792, -730, whiteLineMaterial, 0.25, 0.825);

  // Taper Aspal Penyempitan Simetris dari Lebar 48m (X: +/- 25) ke Lebar 32m (X: +/- 16)
  // Sisi Masuk (+X)
  const entryMergeShape = new THREE.Shape();
  entryMergeShape.moveTo( 4.0, 792);
  entryMergeShape.lineTo(25.0, 792);
  entryMergeShape.lineTo(16.0, 680);
  entryMergeShape.lineTo( 4.0, 680);
  entryMergeShape.closePath();
  const entryMergeMesh = new THREE.Mesh(new THREE.ShapeGeometry(entryMergeShape), asphaltMaterial);
  entryMergeMesh.rotation.x = -Math.PI / 2;
  entryMergeMesh.position.set(0, 0.81, 0);
  entryMergeMesh.receiveShadow = true;
  roadGroup.add(entryMergeMesh);

  // Sisi Keluar (-X)
  const exitMergeShape = new THREE.Shape();
  exitMergeShape.moveTo(-25.0, 792);
  exitMergeShape.lineTo( -4.0, 792);
  exitMergeShape.lineTo( -4.0, 680);
  exitMergeShape.lineTo(-16.0, 680);
  exitMergeShape.closePath();
  const exitMergeMesh = new THREE.Mesh(new THREE.ShapeGeometry(exitMergeShape), asphaltMaterial);
  exitMergeMesh.rotation.x = -Math.PI / 2;
  exitMergeMesh.position.set(0, 0.81, 0);
  exitMergeMesh.receiveShadow = true;
  roadGroup.add(exitMergeMesh);

  // Garis Pembatas Tepi Luar yang Menyempit Masuk (Taper Outer Borders)
  createTaperLine( 25.0,  16.0, -792, -680, whiteLineMaterial, 0.28, 0.825);
  createTaperLine(-25.0, -16.0, -792, -680, whiteLineMaterial, 0.28, 0.825);

  // Garis Pembatas Tepi Dalam Median
  addSolidLine( 4.0, -792, -680, yellowCurbMaterial);
  addSolidLine(-4.0, -792, -680, yellowCurbMaterial);

  // ------------------------------------------------------------
  // SEGMEN 3: KORIDOR UTAMA MENUJU TERMINAL (Z in [-680, -80])
  // 3 Lajur Masuk Terdedikasi (+X) & 3 Lajur Keluar Terdedikasi (-X)
  // Lebar masing-masing arah: 12.0m | Median Tengah: 8.0m (Total 32.0m)
  // ------------------------------------------------------------
  // Jalur Masuk (+X, 3 Lajur Utama: Kontainer, Curah Kering, Mobil/Motor)
  addRoadPavement(14.0, 4.0, mainStartZ, mainEndZ, true);   // Lajur 1 (Kontainer / Luar)
  addRoadPavement(10.0, 4.0, mainStartZ, mainEndZ, false);  // Lajur 2 (Curah Kering / Tengah)
  addRoadPavement( 6.0, 4.0, mainStartZ, mainEndZ, false);  // Lajur 3 (Mobil & Motor / Sisi Median)
  addSolidLine( 16.0, mainStartZ, mainEndZ, whiteLineMaterial); // Garis luar
  addDashedLine(12.0, mainStartZ, mainEndZ);                     // Pemisah Kontainer & Curah
  addDashedLine( 8.0, mainStartZ, mainEndZ);                     // Pemisah Curah & Mobil
  addSolidLine(  4.0, mainStartZ, mainEndZ, yellowCurbMaterial); // Garis kuning tepi median

  // Jalur Keluar (-X, 3 Lajur Utama: Mobil/Motor, Curah Kering, Kontainer)
  addRoadPavement(-6.0,  4.0, mainStartZ, mainEndZ, false);  // Lajur 3 (Mobil & Motor / Sisi Median)
  addRoadPavement(-10.0, 4.0, mainStartZ, mainEndZ, false);  // Lajur 2 (Curah Kering / Tengah)
  addRoadPavement(-14.0, 4.0, mainStartZ, mainEndZ, true);   // Lajur 1 (Kontainer / Luar)
  addSolidLine( -4.0, mainStartZ, mainEndZ, yellowCurbMaterial); // Garis kuning tepi median
  addDashedLine( -8.0, mainStartZ, mainEndZ);                     // Pemisah Mobil & Curah
  addDashedLine(-12.0, mainStartZ, mainEndZ);                     // Pemisah Curah & Kontainer
  addSolidLine( -16.0, mainStartZ, mainEndZ, whiteLineMaterial); // Garis luar

  // Panah Marka Jalan Koridor Utama
  [-640, -560, -480, -400, -320, -240, -160, -100].forEach(z => {
    addRoadArrow(14.0, z, false);
    addRoadArrow(10.0, z, false);
    addRoadArrow( 6.0, z, false);
    addRoadArrow(-6.0,  z, true);
    addRoadArrow(-10.0, z, true);
    addRoadArrow(-14.0, z, true);
  });

  // U-Turn Crossovers di Segmen Utama
  const crossoverZones = [
    [-380, -350],   // Crossover 1: Menjelang Area Pos Keamanan
    [-170, -140],   // Crossover 2: Pasca Pos Keamanan
  ];
  crossoverZones.forEach(([zS, zE]) => {
    addRoadPavement(0, 8.0, zS - 4.0, zE + 4.0, false, 0.812);
    addUTurnChevron(-4.0, 4.0, zS + 0.5, zE - 0.5, 0.814);
  });

  // Gantry Portal Penunjuk Arah Pasca Simpang Tol
  const createOverheadGantry = (x, z, titleText, subText, width = 34) => {
    const gantry = new THREE.Group();
    gantry.position.set(x, 0.8, z);

    const postGeo = new THREE.CylinderGeometry(0.28, 0.32, 6.8, 12);
    const postLeft = new THREE.Mesh(postGeo, containerShoulderMat);
    postLeft.position.set(-width / 2, 3.4, 0);
    gantry.add(postLeft);

    const postRight = new THREE.Mesh(postGeo, containerShoulderMat);
    postRight.position.set(width / 2, 3.4, 0);
    gantry.add(postRight);

    const beamGeo = new THREE.BoxGeometry(width + 1.2, 0.6, 0.6);
    const beam = new THREE.Mesh(beamGeo, containerShoulderMat);
    beam.position.set(0, 6.4, 0);
    gantry.add(beam);

    const canvas = document.createElement('canvas');
    canvas.width = 1024;
    canvas.height = 256;
    const ctx = canvas.getContext('2d');
    ctx.fillStyle = '#15803d'; // Green highway signboard
    ctx.fillRect(0, 0, 1024, 256);
    ctx.lineWidth = 14;
    ctx.strokeStyle = '#ffffff';
    ctx.strokeRect(10, 10, 1004, 236);

    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 52px Inter, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText(titleText, 512, 95);

    ctx.fillStyle = '#facc15';
    ctx.font = 'bold 36px Inter, sans-serif';
    ctx.fillText(subText, 512, 175);

    const signTex = new THREE.CanvasTexture(canvas);
    const signMat = new THREE.MeshBasicMaterial({ map: signTex });
    const signBoard = new THREE.Mesh(new THREE.PlaneGeometry(width * 0.75, 2.2), signMat);
    signBoard.position.set(0, 5.2, 0.32);
    gantry.add(signBoard);

    return gantry;
  };

  flyoverGroup.add(createOverheadGantry(0, -610, 'TERMINAL TELUK LAMONG (TTL)', '➔ JALUR TERDEDIKASI 3 LAJUR MENUJU DERMAGA', 34));
  roadGroup.add(flyoverGroup);


  // ============================================================
  // 4. SEGMEN 4: TAPERED ROAD MERGE ZONE (Z = -106 to Z = -53)
  // Desain mengerucut dari lebar 32m (X: -16 s/d +16) ke lebar jembatan 16m (X: -8 s/d +8)
  // ============================================================

  // A. Aspal Trapesium Mengerucut (Tapered Base Pavement)
  const taperShape = new THREE.Shape();
  // Shape coordinates: +Y = -Z di world
  taperShape.moveTo(-16.0, 106.0);
  taperShape.lineTo( 16.0, 106.0);
  taperShape.lineTo(  8.0,  55.0); // Menyambung tepat di bibir jembatan Z = -55
  taperShape.lineTo( -8.0,  55.0); // Menyambung tepat di bibir jembatan Z = -55
  taperShape.closePath();

  const taperGeo = new THREE.ShapeGeometry(taperShape);
  const taperMesh = new THREE.Mesh(taperGeo, asphaltMaterial);
  taperMesh.rotation.x = -Math.PI / 2;
  taperMesh.position.set(0, 0.81, 0);
  taperMesh.receiveShadow = true;
  roadGroup.add(taperMesh);

  // B. Garis Tepi Luar Putih yang Mengerucut (Outer Taper Solid Lines)
  createTaperLine( 16.0,  8.0, -106, -55, whiteLineMaterial, 0.25); // Garis tepi luar kanan
  createTaperLine(-16.0, -8.0, -106, -55, whiteLineMaterial, 0.25); // Garis tepi luar kiri

  // C. SEGITIGA MARKA GARIS PUTIH TENGAH (CENTER MEDIAN CHEVRON MERGE)
  // Segitiga dari ujung taman Z = -106 (lebar 8.4m) meruncing ke apex di Z = -62 (X = 0)
  const centerTrianglePoly = [
    [-4.2, -106],
    [ 4.2, -106],
    [ 0.0,  -62]
  ];
  addPolygonDiagonalStripes(centerTrianglePoly, 2.0, 0.38, 0.822);

  // Garis Border Putih Solid Keliling Segitiga Tengah
  createTaperLine(-4.2,  0.0, -106, -62, whiteLineMaterial, 0.28, 0.825); // Sisi kiri segitiga
  createTaperLine( 4.2,  0.0, -106, -62, whiteLineMaterial, 0.28, 0.825); // Sisi kanan segitiga
  createTaperLine(-4.2,  4.2, -106, -106.01, whiteLineMaterial, 0.28, 0.825); // Alas segitiga

  // Garis kuning median dari apex segitiga (Z = -62) ke bibir jembatan (Z = -55)
  addSolidLine(0, -62, -55, yellowCurbMaterial, 0.826);

  // D. MARKA GARIS-GARIS PUTIH BAHU LUAR (OUTER SHOULDER CHEVRON HATCHING)
  // Sisi ENTRY / Jalur Masuk (+X)
  const entryShoulderPoly = [
    [11.9, -106],
    [16.0, -106],
    [ 8.0,  -55]
  ];
  addPolygonDiagonalStripes(entryShoulderPoly, 2.0, 0.38, 0.822);
  createTaperLine(11.9, 8.0, -106, -55, whiteLineMaterial, 0.25, 0.825); // Garis batas dalam bahu kanan

  // Sisi EXIT / Jalur Keluar (-X)
  const exitShoulderPoly = [
    [-11.9, -106],
    [-16.0, -106],
    [ -8.0,  -55]
  ];
  addPolygonDiagonalStripes(exitShoulderPoly, 2.0, 0.38, 0.822);
  createTaperLine(-11.9, -8.0, -106, -55, whiteLineMaterial, 0.25, 0.825); // Garis batas dalam bahu kiri

  // E. Garis Putus-putus Lajur yang Menyatu Menuju Jembatan
  const addConvergingDashedLine = (startX, endX, startZ, endZ) => {
    const numDashes = 8;
    for (let i = 0; i < numDashes; i++) {
      const t = (i + 0.5) / numDashes;
      const curX = startX + (endX - startX) * t;
      const curZ = startZ + (endZ - startZ) * t;
      const geo = new THREE.PlaneGeometry(0.20, 3.2);
      const mesh = new THREE.Mesh(geo, whiteLineMaterial);
      mesh.rotation.x = -Math.PI / 2;
      mesh.rotation.z = Math.atan2(endX - startX, -(endZ - startZ));
      mesh.position.set(curX, 0.826, curZ);
      roadGroup.add(mesh);
    }
  };
  addConvergingDashedLine( 8.1,  4.1, -106, -55); // Entry Divider
  addConvergingDashedLine(-8.1, -4.1, -106, -55); // Exit Divider

  scene.add(roadGroup);
  return roadGroup;
}
