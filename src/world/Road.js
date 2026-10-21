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
  // FULL MAINLAND HIGHWAY CORRIDOR (Z = -700 to Z = -106)
  // Seluruh lajur tersambung mulus tanpa celah bolong:
  // - Sisi Jalur Masuk (ENTRY / +X): 3 Lajur Dedicated (X = +6.2, +10.0, +13.8)
  // - Sisi Jalur Keluar (EXIT / -X): 3 Lajur Dedicated (X = -6.2, -10.0, -13.8)
  // ============================================================

  // 1. JALUR MASUK / ENTRY (+X) — Menerus dari -700 s/d -106
  addRoadPavement(13.8, 4.4, -700, -106, true);   // Bahu/Lajur Kontainer
  addRoadPavement(10.0, 3.8, -700, -106, false);  // Lajur Curah Kering
  addRoadPavement(6.2,  3.8, -700, -106, false);  // Lajur Mobil & Motor

  // Marka Garis Jalur Masuk
  addSolidLine( 16.0, -700, -106, whiteLineMaterial);  // Garis luar bahu kanan
  addDashedLine(11.9, -700, -106);                      // Pemisah Container & Cuker
  addDashedLine( 8.1, -700, -106);                      // Pemisah Cuker & Motor/Mobil
  addSolidLine(  4.3, -700, -106, yellowCurbMaterial);  // Garis kuning tepi median

  // 2. JALUR KELUAR / EXIT (-X) — Menerus dari -700 s/d -106
  addRoadPavement(-6.2,  3.8, -700, -106, false);  // Lajur Mobil & Motor
  addRoadPavement(-10.0, 3.8, -700, -106, false);  // Lajur Curah Kering
  addRoadPavement(-13.8, 4.4, -700, -106, true);   // Bahu/Lajur Kontainer

  // Marka Garis Jalur Keluar
  addSolidLine( -4.3, -700, -106, yellowCurbMaterial);  // Garis kuning tepi median
  addDashedLine( -8.1, -700, -106);                      // Pemisah Motor/Mobil & Cuker
  addDashedLine(-11.9, -700, -106);                      // Pemisah Cuker & Container
  addSolidLine( -16.0, -700, -106, whiteLineMaterial);  // Garis luar bahu kiri

  // Panah Marka Jalan ENTRY (+X)
  [-650, -570, -490, -430, -350, -280, -220, -130].forEach(z => {
    addRoadArrow(13.8, z, false);
    addRoadArrow(10.0, z, false);
    addRoadArrow(6.2,  z, false);
  });

  // Panah Marka Jalan EXIT (-X)
  [-650, -570, -490, -430, -350, -280, -220, -130].forEach(z => {
    addRoadArrow(-6.2,  z, true);
    addRoadArrow(-10.0, z, true);
    addRoadArrow(-13.8, z, true);
  });

  // 3. U-TURN / MEDIAN CROSSOVERS (2 Titik Pemisah Sesuai Satelit Asli)
  const crossoverZones = [
    [-410, -380],   // Crossover 1: Pemisah Segmen 1 & Segmen 2
    [-170, -140],   // Crossover 2: Pemisah Segmen 2 & Segmen 3
  ];
  crossoverZones.forEach(([zS, zE]) => {
    // Aspal pengisi sambungan di area putar balik
    addRoadPavement(0, 9.0, zS - 4.2, zE + 4.2, false, 0.812);
    // Marka chevron hourglass di celah putar balik
    addUTurnChevron(-4.2, 4.2, zS + 0.5, zE - 0.5, 0.814);
  });

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

  createTaperLine( 16.0,  8.0, -106, -55, whiteLineMaterial, 0.25); // Garis tepi luar kanan
  createTaperLine(-16.0, -8.0, -106, -55, whiteLineMaterial, 0.25); // Garis tepi luar kiri

  // ----------------------------------------------------------------------------
  // Helper: Vector Polygon Diagonal Stripe Generator (Garis-Garis Putih Chevron)
  // Menghasilkan marka garis diagonal tebal murni putih 100% presisi geometris
  // ----------------------------------------------------------------------------
  const addPolygonDiagonalStripes = (polygonPoints, spacing = 2.2, stripeWidth = 0.35, yLevel = 0.822) => {
    // Normal garis diagonal 45°: x + z = d (arah kemiringan garis / persis foto satelit)
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

        // Triangle 1
        positions.push(...p1, ...p2, ...p3);
        // Triangle 2
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
