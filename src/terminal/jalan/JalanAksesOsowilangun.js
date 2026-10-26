import * as THREE from 'three';
import {
  asphaltMat,
  containerShoulderMat,
  whiteLineMat,
  yellowLineMat,
  flyoverConcreteMat,
  flyoverPierMat,
  flyoverBarrierMat
} from '../../assets/materials/roadMaterials.js';

/**
 * ==============================================================================
 * Area: Jalan - Sub: Akses Darat Osowilangun (Z: -1130 s/d -55)
 * Status: SUDAH 1:1 (Akurat dengan Ground Truth Apple Maps / WGS84)
 * ==============================================================================
 *
 * Koridor 3-Lajur Terdedikasi Masuk & Keluar:
 * - Titik Pangkal Flyover Tol Romokalisari & Jl. Raya Tambak Osowilangun (Z = -1130 s/d -1108)
 * - Turunan Flyover Tol Romokalisari (Ramp Down Y = 7.0m -> 0.81m, Z in [-1108, -792])
 * - Area Penggabungan & Taper (Touchdown & Merge, Z in [-792, -680])
 * - Koridor Utama Darat 3-Lajur (Z in [-680, -106]) dengan U-Turn Crossovers
 * - Tapered Road Merge Zone menuju bibir jembatan (Z in [-106, -55])
 */
export function createJalanAksesOsowilangun() {
  const roadGroup = new THREE.Group();
  roadGroup.name = 'sub_jalan_akses_osowilangun';

  // ----------------------------------------------------------------------------
  // Vector Highway Arrow Builder
  // ----------------------------------------------------------------------------
  const createHighwayArrow = (shapePointsUp = true) => {
    const shape = new THREE.Shape();
    const stemW = 0.28;
    const stemL = 2.60;
    const headW = 1.05;
    const headL = 1.55;

    if (shapePointsUp) {
      shape.moveTo(-stemW / 2, -stemL);
      shape.lineTo(stemW / 2, -stemL);
      shape.lineTo(stemW / 2, 0);
      shape.lineTo(headW / 2, 0);
      shape.lineTo(0, headL);
      shape.lineTo(-headW / 2, 0);
      shape.lineTo(-stemW / 2, 0);
      shape.closePath();
    } else {
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
    const mesh = new THREE.Mesh(geo, whiteLineMat);
    mesh.rotation.x = -Math.PI / 2;
    return mesh;
  };

  const addRoadArrow = (x, z, pointUpwards, yLevel = 0.81) => {
    const arrow = createHighwayArrow(pointUpwards);
    arrow.position.set(x, yLevel + 0.016, z);
    roadGroup.add(arrow);
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

    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.quadraticCurveTo(canvas.width / 2, canvas.height * 0.25, canvas.width, 0);
    ctx.lineTo(canvas.width, canvas.height);
    ctx.quadraticCurveTo(canvas.width / 2, canvas.height * 0.75, 0, canvas.height);
    ctx.lineTo(0, 0);
    ctx.closePath();

    ctx.save();
    ctx.clip();

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

    ctx.lineWidth = 12;
    ctx.strokeStyle = '#f1f5f9';
    ctx.stroke();

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
  const createTaperLine = (startX, endX, startZ, endZ, mat = whiteLineMat, width = 0.25, yLevel = 0.825) => {
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
    roadGroup.add(lineMesh);
  };

  // ----------------------------------------------------------------------------
  // Helper: Vector Polygon Diagonal Stripe Generator
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
      const mesh = new THREE.Mesh(geo, whiteLineMat);
      roadGroup.add(mesh);
    }
  };

  // ----------------------------------------------------------------------------
  // Helper: Road Pavement & Lines
  // ----------------------------------------------------------------------------
  const addRoadPavement = (centerX, width, startZ, endZ, isShoulder = false, yLevel = 0.81) => {
    const length = Math.abs(endZ - startZ);
    const midZ = (startZ + endZ) / 2;
    const mat = isShoulder ? containerShoulderMat : asphaltMat;

    const geo = new THREE.PlaneGeometry(width, length);
    const mesh = new THREE.Mesh(geo, mat);
    mesh.rotation.x = -Math.PI / 2;
    mesh.position.set(centerX, yLevel, midZ);
    mesh.receiveShadow = true;
    roadGroup.add(mesh);
  };

  const addSolidLine = (x, startZ, endZ, mat = whiteLineMat, yLevel = 0.82) => {
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
      const mesh = new THREE.Mesh(geo, whiteLineMat);
      mesh.rotation.x = -Math.PI / 2;
      mesh.position.set(x, yLevel, curZ);
      roadGroup.add(mesh);
    }
  };

  // ----------------------------------------------------------------------------
  // SEGMEN 1: JALAN DARAT OSOWILANGON (Z in [-1108, -792])
  // ----------------------------------------------------------------------------
  const osowStartZ = -1108;
  const mergeZ = -792;
  const mainStartZ = -680;
  const mainEndZ = -80;

  // Jalur Masuk (+X in [13.0, 25.0])
  addRoadPavement(23.0, 4.0, osowStartZ, mergeZ, true);
  addRoadPavement(19.0, 4.0, osowStartZ, mergeZ, false);
  addRoadPavement(15.0, 4.0, osowStartZ, mergeZ, false);
  addSolidLine(25.0, osowStartZ, mergeZ, whiteLineMat);
  addDashedLine(21.0, osowStartZ, mergeZ);
  addDashedLine(17.0, osowStartZ, mergeZ);
  addSolidLine(13.0, osowStartZ, mergeZ, yellowLineMat);

  // Jalur Keluar (-X in [-25.0, -13.0])
  addRoadPavement(-15.0, 4.0, osowStartZ, mergeZ, false);
  addRoadPavement(-19.0, 4.0, osowStartZ, mergeZ, false);
  addRoadPavement(-23.0, 4.0, osowStartZ, mergeZ, true);
  addSolidLine(-13.0, osowStartZ, mergeZ, yellowLineMat);
  addDashedLine(-17.0, osowStartZ, mergeZ);
  addDashedLine(-21.0, osowStartZ, mergeZ);
  addSolidLine(-25.0, osowStartZ, mergeZ, whiteLineMat);

  // Panah Marka Jalan
  [-1070, -1000, -930, -850].forEach((z) => {
    addRoadArrow(23.0, z, false);
    addRoadArrow(19.0, z, false);
    addRoadArrow(15.0, z, false);
    addRoadArrow(-15.0, z, true);
    addRoadArrow(-19.0, z, true);
    addRoadArrow(-23.0, z, true);
  });

  // Sambungan Melintang Jl. Raya Tambak Osowilangon (Z in [-1130, -1108])
  addRoadPavement(0, 56.0, -1130, -1108, false, 0.808);
  addSolidLine(-28.0, -1130, -1108, whiteLineMat);
  addSolidLine(28.0, -1130, -1108, whiteLineMat);
  addSolidLine(0.0, -1130, -1108, yellowLineMat);

  // Jalan Kolong Melintang di Bawah Flyover (Z in [-920, -895])
  addRoadPavement(0, 50.0, -920, -895, false, 0.809);
  addSolidLine(0, -920, -895, yellowLineMat, 0.811);
  const yellowBoxPoly = [
    [-13.0, -920],
    [13.0, -920],
    [13.0, -895],
    [-13.0, -895]
  ];
  addPolygonDiagonalStripes(yellowBoxPoly, 2.8, 0.28, 0.813);
  createTaperLine(-13.0, 13.0, -920, -920.01, yellowLineMat, 0.35, 0.814);
  createTaperLine(-13.0, 13.0, -895, -895.01, yellowLineMat, 0.35, 0.814);
  createTaperLine(-13.0, -13.0, -920, -895, yellowLineMat, 0.35, 0.814);
  createTaperLine(13.0, 13.0, -920, -895, yellowLineMat, 0.35, 0.814);

  // ------------------------------------------------------------
  // STRUKTUR 3D FLYOVER TOL ROMOKALISARI (RAMP DOWN: Z in [-1108, -792])
  // ------------------------------------------------------------
  const flyoverGroup = new THREE.Group();
  flyoverGroup.name = 'flyover_tol_romokalisari_descent';

  const flyoverStartZ = -1108;
  const flyoverEndZ = -792;
  const flyoverLen = Math.abs(flyoverEndZ - flyoverStartZ);
  const flyoverMidZ = (flyoverStartZ + flyoverEndZ) / 2;
  const flyoverStartY = 7.0;
  const flyoverEndY = 0.81;
  const flyoverMidY = (flyoverStartY + flyoverEndY) / 2;
  const flyoverSlope = Math.atan2(flyoverStartY - flyoverEndY, flyoverLen);
  const flyoverHypotLen = Math.hypot(flyoverLen, flyoverStartY - flyoverEndY);

  // Pangkal Abutment di Selatan
  [-8.0, 8.0].forEach((px) => {
    const col = new THREE.Mesh(new THREE.CylinderGeometry(0.85, 1.0, 7.0, 16), flyoverPierMat);
    col.position.set(px, 3.5, flyoverStartZ);
    col.castShadow = true;
    flyoverGroup.add(col);
  });
  const endCap = new THREE.Mesh(new THREE.BoxGeometry(25.0, 1.4, 2.4), flyoverConcreteMat);
  endCap.position.set(0, 6.3, flyoverStartZ);
  endCap.castShadow = true;
  flyoverGroup.add(endCap);
  const southWall = new THREE.Mesh(new THREE.BoxGeometry(25.0, 6.3, 1.2), flyoverPierMat);
  southWall.position.set(0, 3.15, flyoverStartZ - 1.2);
  southWall.castShadow = true;
  flyoverGroup.add(southWall);

  // Dek Tol Layang Kembar
  const addSymmetricFlyoverDeck = (centerX, width = 8.0, isOutbound = false) => {
    const deckGroup = new THREE.Group();
    deckGroup.position.set(centerX, flyoverMidY, flyoverMidZ);
    deckGroup.rotation.x = flyoverSlope;

    // Gelagar Box Girder
    const boxGeo = new THREE.BoxGeometry(width, 0.90, flyoverHypotLen);
    const boxMesh = new THREE.Mesh(boxGeo, flyoverConcreteMat);
    boxMesh.position.set(0, -0.48, 0);
    boxMesh.castShadow = true;
    boxMesh.receiveShadow = true;
    deckGroup.add(boxMesh);

    // Aspal
    const aspGeo = new THREE.BoxGeometry(width, 0.06, flyoverHypotLen);
    const aspMesh = new THREE.Mesh(aspGeo, asphaltMat);
    aspMesh.position.set(0, 0, 0);
    aspMesh.receiveShadow = true;
    deckGroup.add(aspMesh);

    // Barrier
    const halfW = width / 2;
    [-halfW + 0.16, halfW - 0.16].forEach((bx) => {
      const barGeo = new THREE.BoxGeometry(0.32, 0.85, flyoverHypotLen);
      const barMesh = new THREE.Mesh(barGeo, flyoverBarrierMat);
      barMesh.position.set(bx, 0.425, 0);
      barMesh.castShadow = true;
      deckGroup.add(barMesh);
    });

    // Marka Putus-putus
    const numDashes = Math.floor(flyoverHypotLen / 6.0);
    const dashGeo = new THREE.BoxGeometry(0.18, 0.015, 3.2);
    for (let i = 0; i < numDashes; i++) {
      if (i % 2 === 0) {
        const localZ = -flyoverHypotLen / 2 + (i + 0.5) * 6.0;
        const dMesh = new THREE.Mesh(dashGeo, whiteLineMat);
        dMesh.position.set(0, 0.035, localZ);
        deckGroup.add(dMesh);
      }
    }

    [-100, -20, 60].forEach((localZ) => {
      const arrowMesh = createHighwayArrow(isOutbound);
      arrowMesh.position.set(0, 0.035, localZ);
      deckGroup.add(arrowMesh);
    });

    flyoverGroup.add(deckGroup);
  };

  addSymmetricFlyoverDeck(8.0, 8.0, false);
  addSymmetricFlyoverDeck(-8.0, 8.0, true);

  // Tiang Silinder & Pier Cap di Bawah Flyover
  for (let z = flyoverStartZ + 24; z <= flyoverEndZ - 20; z += 24) {
    const t = (z - flyoverStartZ) / flyoverLen;
    const curYDeck = flyoverStartY - t * (flyoverStartY - flyoverEndY);
    const colH = Math.max(0.6, curYDeck - 0.81 - 1.2);

    [-8.0, 8.0].forEach((px) => {
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

  // Ladder Rungs
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
  // SEGMEN 2: TOUCHDOWN & MERGE (Z in [-792, -680])
  // ------------------------------------------------------------
  const mergeInGore = [
    [11.0, -792],
    [13.0, -792],
    [12.0, -730]
  ];
  addPolygonDiagonalStripes(mergeInGore, 2.0, 0.35, 0.824);
  createTaperLine(11.0, 12.0, -792, -730, whiteLineMat, 0.25, 0.825);
  createTaperLine(13.0, 12.0, -792, -730, whiteLineMat, 0.25, 0.825);

  const mergeOutGore = [
    [-11.0, -792],
    [-13.0, -792],
    [-12.0, -730]
  ];
  addPolygonDiagonalStripes(mergeOutGore, 2.0, 0.35, 0.824);
  createTaperLine(-11.0, -12.0, -792, -730, whiteLineMat, 0.25, 0.825);
  createTaperLine(-13.0, -12.0, -792, -730, whiteLineMat, 0.25, 0.825);

  // Taper Aspal
  const entryMergeShape = new THREE.Shape();
  entryMergeShape.moveTo(4.0, 792);
  entryMergeShape.lineTo(25.0, 792);
  entryMergeShape.lineTo(16.0, 680);
  entryMergeShape.lineTo(4.0, 680);
  entryMergeShape.closePath();
  const entryMergeMesh = new THREE.Mesh(new THREE.ShapeGeometry(entryMergeShape), asphaltMat);
  entryMergeMesh.rotation.x = -Math.PI / 2;
  entryMergeMesh.position.set(0, 0.81, 0);
  entryMergeMesh.receiveShadow = true;
  roadGroup.add(entryMergeMesh);

  const exitMergeShape = new THREE.Shape();
  exitMergeShape.moveTo(-25.0, 792);
  exitMergeShape.lineTo(-4.0, 792);
  exitMergeShape.lineTo(-4.0, 680);
  exitMergeShape.lineTo(-16.0, 680);
  exitMergeShape.closePath();
  const exitMergeMesh = new THREE.Mesh(new THREE.ShapeGeometry(exitMergeShape), asphaltMat);
  exitMergeMesh.rotation.x = -Math.PI / 2;
  exitMergeMesh.position.set(0, 0.81, 0);
  exitMergeMesh.receiveShadow = true;
  roadGroup.add(exitMergeMesh);

  createTaperLine(25.0, 16.0, -792, -680, whiteLineMat, 0.28, 0.825);
  createTaperLine(-25.0, -16.0, -792, -680, whiteLineMat, 0.28, 0.825);
  addSolidLine(4.0, -792, -680, yellowLineMat);
  addSolidLine(-4.0, -792, -680, yellowLineMat);

  // ------------------------------------------------------------
  // SEGMEN 3: KORIDOR UTAMA MENUJU TERMINAL (Z in [-680, -80])
  // ------------------------------------------------------------
  addRoadPavement(14.0, 4.0, mainStartZ, mainEndZ, true);
  addRoadPavement(10.0, 4.0, mainStartZ, mainEndZ, false);
  addRoadPavement(6.0, 4.0, mainStartZ, mainEndZ, false);
  addSolidLine(16.0, mainStartZ, mainEndZ, whiteLineMat);
  addDashedLine(12.0, mainStartZ, mainEndZ);
  addDashedLine(8.0, mainStartZ, mainEndZ);
  addSolidLine(4.0, mainStartZ, mainEndZ, yellowLineMat);

  addRoadPavement(-6.0, 4.0, mainStartZ, mainEndZ, false);
  addRoadPavement(-10.0, 4.0, mainStartZ, mainEndZ, false);
  addRoadPavement(-14.0, 4.0, mainStartZ, mainEndZ, true);
  addSolidLine(-4.0, mainStartZ, mainEndZ, yellowLineMat);
  addDashedLine(-8.0, mainStartZ, mainEndZ);
  addDashedLine(-12.0, mainStartZ, mainEndZ);
  addSolidLine(-16.0, mainStartZ, mainEndZ, whiteLineMat);

  [-640, -560, -480, -400, -320, -240, -160, -100].forEach((z) => {
    addRoadArrow(14.0, z, false);
    addRoadArrow(10.0, z, false);
    addRoadArrow(6.0, z, false);
    addRoadArrow(-6.0, z, true);
    addRoadArrow(-10.0, z, true);
    addRoadArrow(-14.0, z, true);
  });

  // U-Turn Crossovers
  const crossoverZones = [
    [-380, -350],
    [-170, -140]
  ];
  crossoverZones.forEach(([zS, zE]) => {
    addRoadPavement(0, 8.0, zS - 4.0, zE + 4.0, false, 0.812);
    addUTurnChevron(-4.0, 4.0, zS + 0.5, zE - 0.5, 0.814);
  });

  // Gantry Portal Penunjuk Arah
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
    ctx.fillStyle = '#15803d';
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

  flyoverGroup.add(
    createOverheadGantry(0, -610, 'TERMINAL TELUK LAMONG (TTL)', '➔ JALUR TERDEDIKASI 3 LAJUR MENUJU DERMAGA', 34)
  );
  roadGroup.add(flyoverGroup);

  // ------------------------------------------------------------
  // SEGMEN 4: TAPERED ROAD MERGE ZONE MENUJU JEMBATAN (Z in [-106, -55])
  // ------------------------------------------------------------
  const taperShape = new THREE.Shape();
  taperShape.moveTo(-16.0, 106.0);
  taperShape.lineTo(16.0, 106.0);
  taperShape.lineTo(8.0, 55.0);
  taperShape.lineTo(-8.0, 55.0);
  taperShape.closePath();

  const taperGeo = new THREE.ShapeGeometry(taperShape);
  const taperMesh = new THREE.Mesh(taperGeo, asphaltMat);
  taperMesh.rotation.x = -Math.PI / 2;
  taperMesh.position.set(0, 0.81, 0);
  taperMesh.receiveShadow = true;
  roadGroup.add(taperMesh);

  createTaperLine(16.0, 8.0, -106, -55, whiteLineMat, 0.25);
  createTaperLine(-16.0, -8.0, -106, -55, whiteLineMat, 0.25);

  const centerTrianglePoly = [
    [-4.2, -106],
    [4.2, -106],
    [0.0, -62]
  ];
  addPolygonDiagonalStripes(centerTrianglePoly, 2.0, 0.38, 0.822);
  createTaperLine(-4.2, 0.0, -106, -62, whiteLineMat, 0.28, 0.825);
  createTaperLine(4.2, 0.0, -106, -62, whiteLineMat, 0.28, 0.825);
  createTaperLine(-4.2, 4.2, -106, -106.01, whiteLineMat, 0.28, 0.825);
  addSolidLine(0, -62, -55, yellowLineMat, 0.826);

  const entryShoulderPoly = [
    [11.9, -106],
    [16.0, -106],
    [8.0, -55]
  ];
  addPolygonDiagonalStripes(entryShoulderPoly, 2.0, 0.38, 0.822);
  createTaperLine(11.9, 8.0, -106, -55, whiteLineMat, 0.25, 0.825);

  const exitShoulderPoly = [
    [-11.9, -106],
    [-16.0, -106],
    [-8.0, -55]
  ];
  addPolygonDiagonalStripes(exitShoulderPoly, 2.0, 0.38, 0.822);
  createTaperLine(-11.9, -8.0, -106, -55, whiteLineMat, 0.25, 0.825);

  const addConvergingDashedLine = (startX, endX, startZ, endZ) => {
    const numDashes = 8;
    for (let i = 0; i < numDashes; i++) {
      const t = (i + 0.5) / numDashes;
      const curX = startX + (endX - startX) * t;
      const curZ = startZ + (endZ - startZ) * t;
      const geo = new THREE.PlaneGeometry(0.20, 3.2);
      const mesh = new THREE.Mesh(geo, whiteLineMat);
      mesh.rotation.x = -Math.PI / 2;
      mesh.rotation.z = Math.atan2(endX - startX, -(endZ - startZ));
      mesh.position.set(curX, 0.826, curZ);
      roadGroup.add(mesh);
    }
  };
  addConvergingDashedLine(8.1, 4.1, -106, -55);
  addConvergingDashedLine(-8.1, -4.1, -106, -55);

  return roadGroup;
}
