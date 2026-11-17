import * as THREE from 'three';
import { uvToWorld, BUILDINGS_CONFIG } from './GeoUtilitas.js';

/**
 * ==============================================================================
 * Sub-Area: Parkir Motor & Utilitas Utara (SubAreaParkirMotor.js)
 * Sesuai 6 Titik Koordinat GPS Poligon L-Shape:
 * -7.202919, 112.667933 | -7.202618, 112.668226 | -7.203045, 112.668621 |
 * -7.203224, 112.668441 | -7.202949, 112.668153 | -7.203028, 112.668053
 * ==============================================================================
 */
export function createSubAreaParkirMotor() {
  const parkirGroup = new THREE.Group();
  parkirGroup.name = 'subarea_parkir_utilitas';

  const yBase = 1.57;

  // 1. Render Seluruh Kanopi & Bangunan Parkir Motor (`parkir_*` di BUILDINGS_CONFIG)
  const parkirBuildings = BUILDINGS_CONFIG.filter((b) => b.id.startsWith('parkir_'));

  parkirBuildings.forEach((bldg) => {
    const { uMin, uMax, vMin, vMax } = bldg.uvRect;
    const pNW = uvToWorld(uMin, vMin);
    const pSE = uvToWorld(uMax, vMax);

    const minX = Math.min(pNW.x, pSE.x);
    const maxX = Math.max(pNW.x, pSE.x);
    const minZ = Math.min(pNW.z, pSE.z);
    const maxZ = Math.max(pNW.z, pSE.z);

    const sizeX = maxX - minX;
    const sizeZ = maxZ - minZ;
    const posX = (minX + maxX) / 2;
    const posZ = (minZ + maxZ) / 2;
    const height = bldg.height || 4.0;

    const bldgGroup = new THREE.Group();
    bldgGroup.name = bldg.id;
    bldgGroup.position.set(posX, yBase, posZ);

    const wallMat = new THREE.MeshStandardMaterial({
      color: bldg.wallColor || 0x94a3b8,
      roughness: 0.65,
      metalness: 0.1
    });

    const roofMat = new THREE.MeshStandardMaterial({
      color: bldg.roofColor || 0xd8dce0,
      roughness: 0.42,
      metalness: 0.2
    });

    const roofOverhang = 0.35;
    const roofThick = 0.24;

    if (bldg.roofType === 'corrugated_vertical') {
      // Kanopi parkir motor memanjang vertikal (terbuka dengan tiang baja atau dinding semi-terbuka)
      const wallMesh = new THREE.Mesh(
        new THREE.BoxGeometry(sizeX * 0.88, height, sizeZ * 0.92),
        wallMat
      );
      wallMesh.position.y = height / 2;
      wallMesh.castShadow = true;
      wallMesh.receiveShadow = true;
      bldgGroup.add(wallMesh);

      const ridgeHeight = 0.42;
      const roofMesh = new THREE.Mesh(
        new THREE.BoxGeometry(sizeX + roofOverhang * 2, roofThick + ridgeHeight, sizeZ + roofOverhang * 2),
        roofMat
      );
      roofMesh.position.y = height + (roofThick + ridgeHeight) / 2;
      roofMesh.castShadow = true;
      roofMesh.receiveShadow = true;
      bldgGroup.add(roofMesh);

      const ridgeMat = new THREE.MeshStandardMaterial({ color: 0x64748b, roughness: 0.5 });
      const ridge = new THREE.Mesh(
        new THREE.BoxGeometry(sizeX * 0.96, 0.1, 0.3),
        ridgeMat
      );
      ridge.position.y = height + roofThick + ridgeHeight + 0.05;
      bldgGroup.add(ridge);
    } else if (bldg.roofType === 'pitched_horizontal') {
      const wallMesh = new THREE.Mesh(new THREE.BoxGeometry(sizeX, height, sizeZ), wallMat);
      wallMesh.position.y = height / 2;
      wallMesh.castShadow = true;
      wallMesh.receiveShadow = true;
      bldgGroup.add(wallMesh);

      const roofMesh = new THREE.Mesh(
        new THREE.BoxGeometry(sizeX + roofOverhang * 2, roofThick * 1.5, sizeZ + roofOverhang * 2),
        roofMat
      );
      roofMesh.position.y = height + (roofThick * 1.5) / 2;
      roofMesh.castShadow = true;
      roofMesh.receiveShadow = true;
      bldgGroup.add(roofMesh);
    } else {
      const wallMesh = new THREE.Mesh(new THREE.BoxGeometry(sizeX, height, sizeZ), wallMat);
      wallMesh.position.y = height / 2;
      wallMesh.castShadow = true;
      wallMesh.receiveShadow = true;
      bldgGroup.add(wallMesh);

      const roofMesh = new THREE.Mesh(
        new THREE.BoxGeometry(sizeX + roofOverhang * 2, roofThick, sizeZ + roofOverhang * 2),
        roofMat
      );
      roofMesh.position.y = height + roofThick / 2;
      roofMesh.castShadow = true;
      roofMesh.receiveShadow = true;
      bldgGroup.add(roofMesh);
    }

    bldgGroup.userData.isCollider = true;
    bldgGroup.userData.aabb = new THREE.Box3(
      new THREE.Vector3(minX, yBase, minZ),
      new THREE.Vector3(maxX, yBase + height + 0.8, maxZ)
    );

    parkirGroup.add(bldgGroup);
  });

  // 2. Tiang Lampu Penerangan Perimeter Yard & Jalur Akses
  const poleMat = new THREE.MeshStandardMaterial({ color: 0x94a3b8, metalness: 0.8, roughness: 0.3 });
  const lampHeadMat = new THREE.MeshStandardMaterial({ color: 0xf1f5f9, roughness: 0.2 });

  const lightUVs = [
    [0.44, 0.68],
    [0.69, 0.68],
    [0.69, 0.92],
    [0.76, 0.44],
    [0.83, 0.72],
    [0.80, 0.95]
  ];

  lightUVs.forEach(([u, v]) => {
    const pos = uvToWorld(u, v);
    const poleGroup = new THREE.Group();
    poleGroup.position.set(pos.x, yBase, pos.z);

    const pole = new THREE.Mesh(
      new THREE.CylinderGeometry(0.07, 0.10, 4.8, 6),
      poleMat
    );
    pole.position.y = 2.4;
    pole.castShadow = true;
    poleGroup.add(pole);

    const head = new THREE.Mesh(
      new THREE.BoxGeometry(0.35, 0.12, 0.6),
      lampHeadMat
    );
    head.position.set(0, 4.8, 0);
    poleGroup.add(head);

    parkirGroup.add(poleGroup);
  });

  return parkirGroup;
}
