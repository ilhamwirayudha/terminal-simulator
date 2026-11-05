import * as THREE from 'three';

/**
 * ==============================================================================
 * Reusable Asset: Jembatan Konveyor Tabung Lingkaran & Menara Transfer
 *                 (Tubular Circular Conveyor Gallery & Transfer Tower)
 * ==============================================================================
 * Di Terminal Teluk Lamong, jalur konveyor curah kering (terutama 2 lane conveyor
 * menuju dermaga) berbentuk tabung silinder / lingkaran sempurna (tubular pipe
 * conveyor gallery) dengan cincin flensa pengaku melingkar dan tiang penyangga.
 */

const galleryTubeMat = new THREE.MeshStandardMaterial({
  color: 0xdbe2ea,
  roughness: 0.42,
  metalness: 0.48,
  name: 'mat_conveyor_tubular_pipe'
});

const galleryRingMat = new THREE.MeshStandardMaterial({
  color: 0x94a3b8,
  roughness: 0.48,
  metalness: 0.58,
  name: 'mat_conveyor_flange_ring'
});

const galleryRoofMat = new THREE.MeshStandardMaterial({
  color: 0xe5e7eb,
  roughness: 0.38,
  metalness: 0.45,
  name: 'mat_conveyor_gallery_roof'
});

const steelTrussMat = new THREE.MeshStandardMaterial({
  color: 0x475569,
  roughness: 0.55,
  metalness: 0.65,
  name: 'mat_conveyor_steel_support'
});

const towerWallMat = new THREE.MeshStandardMaterial({
  color: 0xcbd5e1,
  roughness: 0.52,
  metalness: 0.35,
  name: 'mat_transfer_tower_wall'
});

/**
 * Membuat segmen konveyor berbentuk tabung lingkaran sempurna (Tubular Conveyor)
 * antara titik start (x1, y1, z1) dan end (x2, y2, z2)
 */
export function createConveyorGallery({
  start = { x: 0, y: 12, z: 0 },
  end = { x: 50, y: 12, z: 0 },
  width = 3.0,          // Diameter tabung lingkaran sempurna
  height = 3.0,
  isCircular = true,    // Default: lingkaran sempurna (tubular conveyor)
  withSupports = true,
  supportSpacing = 20.0,
  groundY = 1.62
} = {}) {
  const group = new THREE.Group();
  group.name = 'asset_conveyor_gallery';

  const dx = end.x - start.x;
  const dy = end.y - start.y;
  const dz = end.z - start.z;
  const horizLen = Math.hypot(dx, dz);
  const totalLen = Math.hypot(dx, dy, dz);

  if (totalLen < 0.5) return group;

  const midX = (start.x + end.x) / 2;
  const midY = (start.y + end.y) / 2;
  const midZ = (start.z + end.z) / 2;

  const beamGroup = new THREE.Group();
  beamGroup.position.set(midX, midY, midZ);
  beamGroup.lookAt(end.x, end.y, end.z);

  const radius = width / 2;

  if (isCircular) {
    // 1. Tabung Silinder Lingkaran Sempurna (CylinderGeometry berada di sumbu Y lokal -> rotasi X = PI/2 agar searah +Z lokal)
    const tubeGeo = new THREE.CylinderGeometry(radius, radius, totalLen, 28);
    tubeGeo.rotateX(Math.PI / 2);
    const tubeMesh = new THREE.Mesh(tubeGeo, galleryTubeMat);
    tubeMesh.castShadow = true;
    tubeMesh.receiveShadow = true;
    beamGroup.add(tubeMesh);

    // 2. Cincin Flensa Sambungan Melingkar Sepanjang Tabung (Stiffener Rings)
    const ringSpacing = 6.0;
    const numRings = Math.floor(totalLen / ringSpacing);
    if (numRings > 0) {
      const ringGeo = new THREE.CylinderGeometry(radius * 1.05, radius * 1.05, 0.22, 28);
      ringGeo.rotateX(Math.PI / 2);
      for (let i = 1; i <= numRings; i++) {
        const rz = -totalLen / 2 + (totalLen / (numRings + 1)) * i;
        const ringMesh = new THREE.Mesh(ringGeo, galleryRingMat);
        ringMesh.position.z = rz;
        beamGroup.add(ringMesh);
      }
    }
  } else {
    const boxMesh = new THREE.Mesh(
      new THREE.BoxGeometry(width, height, totalLen),
      galleryTubeMat
    );
    boxMesh.castShadow = true;
    boxMesh.receiveShadow = true;
    beamGroup.add(boxMesh);
  }

  group.add(beamGroup);

  // 3. Tiang Penyangga Portal Baja & Saddle Penopang Lingkaran ke Tanah
  if (withSupports && horizLen >= 10.0) {
    const numSupports = Math.max(1, Math.floor(horizLen / supportSpacing));
    const yawAngle = Math.atan2(dx, dz);

    for (let i = 1; i <= numSupports; i++) {
      const u = i / (numSupports + 1);
      const px = start.x + u * dx;
      const py = start.y + u * dy - radius;
      const pz = start.z + u * dz;
      const legH = py - groundY;

      if (legH > 1.2) {
        const bentGroup = new THREE.Group();
        bentGroup.position.set(px, groundY, pz);
        bentGroup.rotation.y = yawAngle;

        [-radius * 0.78, radius * 0.78].forEach((lx) => {
          const leg = new THREE.Mesh(
            new THREE.CylinderGeometry(0.20, 0.26, legH, 10),
            steelTrussMat
          );
          leg.position.set(lx, legH / 2, 0);
          leg.castShadow = true;
          bentGroup.add(leg);
        });

        // Balok Penopang Saddle di Bawah Tabung Lingkaran
        const crossBar = new THREE.Mesh(
          new THREE.BoxGeometry(width * 0.95, 0.35, 0.45),
          steelTrussMat
        );
        crossBar.position.set(0, legH - 0.15, 0);
        bentGroup.add(crossBar);

        group.add(bentGroup);
      }
    }
  }

  return group;
}

/**
 * Membuat Menara Transfer Konveyor (Transfer Tower seperti TT-3)
 */
export function createTransferTower({
  widthX = 11.0,
  widthZ = 11.0,
  height = 24.0
} = {}) {
  const tower = new THREE.Group();
  tower.name = 'asset_transfer_tower';

  const openH = height * 0.38;
  const colPositions = [
    [-widthX * 0.42, -widthZ * 0.42],
    [widthX * 0.42, -widthZ * 0.42],
    [-widthX * 0.42, widthZ * 0.42],
    [widthX * 0.42, widthZ * 0.42]
  ];

  colPositions.forEach(([cx, cz]) => {
    const col = new THREE.Mesh(
      new THREE.BoxGeometry(0.55, openH, 0.55),
      steelTrussMat
    );
    col.position.set(cx, openH / 2, cz);
    col.castShadow = true;
    tower.add(col);
  });

  const upperH = height - openH;
  const houseMesh = new THREE.Mesh(
    new THREE.BoxGeometry(widthX, upperH, widthZ),
    towerWallMat
  );
  houseMesh.position.set(0, openH + upperH / 2, 0);
  houseMesh.castShadow = true;
  houseMesh.receiveShadow = true;
  tower.add(houseMesh);

  const roofMesh = new THREE.Mesh(
    new THREE.BoxGeometry(widthX + 0.8, 0.45, widthZ + 0.8),
    galleryRoofMat
  );
  roofMesh.position.set(0, height + 0.22, 0);
  roofMesh.castShadow = true;
  tower.add(roofMesh);

  return tower;
}
