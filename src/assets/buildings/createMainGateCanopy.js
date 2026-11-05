import * as THREE from 'three';

/**
 * ==============================================================================
 * Reusable Asset: Kanopi Main Gate Terminal (Main Container Gate Canopy)
 * ==============================================================================
 * Kanopi megah barrel-vault bentang lebar menaungi 7 lajur kontainer (4 in + 3 out).
 */

const canopyRoofMat = new THREE.MeshStandardMaterial({
  color: 0xf1f5f9, // Clean white composite panels
  roughness: 0.32,
  metalness: 0.18,
  side: THREE.DoubleSide,
  name: 'mat_main_gate_canopy_roof'
});

const canopyTrussMat = new THREE.MeshStandardMaterial({
  color: 0x1e293b, // Dark navy steel truss
  roughness: 0.45,
  metalness: 0.82,
  name: 'mat_main_gate_truss'
});

const columnMat = new THREE.MeshStandardMaterial({
  color: 0x334155, // Slate steel column
  roughness: 0.4,
  metalness: 0.75,
  name: 'mat_main_gate_col'
});

const fasciaPelindoMat = new THREE.MeshStandardMaterial({
  color: 0x0284c7, // Pelindo blue fascia band
  roughness: 0.3,
  metalness: 0.5,
  name: 'mat_main_gate_fascia'
});

const ledLightMat = new THREE.MeshBasicMaterial({
  color: 0xffffff
});

export function createMainGateCanopy({
  xStart = -25.0, // SE edge (4 gates out)
  xEnd = 25.0,    // NW edge (4 gates in)
  centerZ = 1613.0,
  length = 20.0,
  height = 9.8,
  clearance = 6.8,
  yRoad = 1.631
} = {}) {
  const canopyGroup = new THREE.Group();
  canopyGroup.name = 'asset_main_gate_canopy';

  const width = xEnd - xStart;
  const xMid = (xStart + xEnd) / 2;
  const halfLen = length / 2;

  // 1. Lengkungan Atap Barrel-Vault (Extruded curved arch)
  const archSegments = 32;
  const roofShape = new THREE.Shape();
  const archRise = height - clearance;

  // Bangun kontur atas dan bawah atap melengkung
  const topPts = [];
  const btmPts = [];
  const roofThick = 0.35;

  for (let i = 0; i <= archSegments; i++) {
    const u = i / archSegments; // 0 s/d 1
    const x = xStart + u * width;
    // Parabolic camber
    const archNorm = 4 * u * (1 - u);
    const yBtm = yRoad + clearance + archNorm * archRise;
    const yTop = yBtm + roofThick;

    topPts.push(new THREE.Vector2(x, yTop));
    btmPts.push(new THREE.Vector2(x, yBtm));
  }

  roofShape.moveTo(topPts[0].x, topPts[0].y);
  for (let i = 1; i < topPts.length; i++) {
    roofShape.lineTo(topPts[i].x, topPts[i].y);
  }
  for (let i = btmPts.length - 1; i >= 0; i--) {
    roofShape.lineTo(btmPts[i].x, btmPts[i].y);
  }
  roofShape.closePath();

  const extrudeSettings = {
    steps: 1,
    depth: length,
    bevelEnabled: false
  };

  const roofGeo = new THREE.ExtrudeGeometry(roofShape, extrudeSettings);
  // Extrude default goes along +Z, center it around centerZ
  roofGeo.translate(0, 0, -halfLen);
  const roofMesh = new THREE.Mesh(roofGeo, canopyRoofMat);
  roofMesh.position.set(0, 0, centerZ);
  roofMesh.castShadow = true;
  roofMesh.receiveShadow = true;
  canopyGroup.add(roofMesh);

  // 2. Fasia Depan & Belakang Pelindo Blue
  [-halfLen, halfLen].forEach((zRel) => {
    const fasciaShape = new THREE.Shape();
    for (let i = 0; i <= archSegments; i++) {
      const u = i / archSegments;
      const x = xStart + u * width;
      const archNorm = 4 * u * (1 - u);
      const yBtm = yRoad + clearance + archNorm * archRise - 0.45;
      const yTop = yBtm + roofThick + 0.55;
      if (i === 0) fasciaShape.moveTo(x, yTop);
      else fasciaShape.lineTo(x, yTop);
    }
    for (let i = archSegments; i >= 0; i--) {
      const u = i / archSegments;
      const x = xStart + u * width;
      const archNorm = 4 * u * (1 - u);
      const yBtm = yRoad + clearance + archNorm * archRise - 0.45;
      fasciaShape.lineTo(x, yBtm);
    }
    fasciaShape.closePath();

    const fasciaGeo = new THREE.ExtrudeGeometry(fasciaShape, { steps: 1, depth: 0.35, bevelEnabled: false });
    fasciaGeo.translate(0, 0, -0.175);
    const fasciaMesh = new THREE.Mesh(fasciaGeo, fasciaPelindoMat);
    fasciaMesh.position.set(0, 0, centerZ + zRel);
    canopyGroup.add(fasciaMesh);
  });

  // 3. Tiang-Tiang Silinder Baja Penyangga (Columns)
  // Kolom tepat di atas pulau pembatas: X = -25.0, -13.0, 0.0 (median), 13.0, 25.0
  const colXPositions = [
    xStart,
    xStart + width * 0.24,
    0.0, // Median tengah
    xEnd - width * 0.24,
    xEnd
  ];
  const colZPositions = [centerZ - halfLen + 2.0, centerZ, centerZ + halfLen - 2.0];

  const colGeo = new THREE.CylinderGeometry(0.38, 0.42, clearance + archRise * 0.5, 16);
  colGeo.translate(0, (clearance + archRise * 0.5) / 2, 0);

  colXPositions.forEach((cx) => {
    colZPositions.forEach((cz) => {
      // Calculate local canopy clearance at this X
      const u = (cx - xStart) / width;
      const localArch = 4 * u * (1 - u) * archRise;
      const colHeight = clearance + localArch;

      const singleColGeo = new THREE.CylinderGeometry(0.35, 0.42, colHeight, 16);
      const colMesh = new THREE.Mesh(singleColGeo, columnMat);
      colMesh.position.set(cx, yRoad + colHeight / 2, cz);
      colMesh.castShadow = true;
      canopyGroup.add(colMesh);

      // Concrete plinth footing
      const plinthGeo = new THREE.BoxGeometry(1.2, 0.45, 1.2);
      const plinthMesh = new THREE.Mesh(plinthGeo, columnMat);
      plinthMesh.position.set(cx, yRoad + 0.22, cz);
      plinthMesh.castShadow = true;
      canopyGroup.add(plinthMesh);
    });
  });

  // 4. Lampu Penerangan Bawah Kanopi (Ceiling Canopy LED Downlights)
  for (let x = xStart + 3.0; x <= xEnd - 3.0; x += 6.0) {
    [-halfLen + 4.0, 0, halfLen - 4.0].forEach((zRel) => {
      const u = (x - xStart) / width;
      const yCeiling = yRoad + clearance + 4 * u * (1 - u) * archRise - 0.05;
      const lightMesh = new THREE.Mesh(new THREE.CylinderGeometry(0.3, 0.3, 0.08, 12), ledLightMat);
      lightMesh.position.set(x, yCeiling, centerZ + zRel);
      canopyGroup.add(lightMesh);
    });
  }

  return canopyGroup;
}
