import * as THREE from 'three';
import {
  uvToWorld,
  BUILDINGS_CONFIG
} from './AreaAGeo.js';

/**
 * ==============================================================================
 * Sub-Area: Kompleks Bangunan Tepi Kanan (Timur Laut)
 * Sesuai Citra Satelit: u in [0.82, 1.00], v in [0.27, 0.97]
 * ==============================================================================
 *
 * Urut dari ATAS ke BAWAH (Barat Laut -> Tenggara):
 * 1. Bangunan atap putih: u in [0.82, 0.96], v in [0.33, 0.39]
 * 2. Dua deretan atap cokelat/gelap memanjang horizontal: u in [0.82, 0.98], v in [0.43, 0.49]
 * 3. Gudang atap seng abu/putih bergaris memanjang vertikal (3-4 bilah sejajar): u in [0.86, 0.98], v in [0.50, 0.72]
 * 4. Bangunan putih besar di ujung bawah: u in [0.83, 0.97], v in [0.77, 0.97]
 *    ditambah satu bangunan putih lebih kecil di sisi kirinya (u: 0.83-0.93, v: 0.82-0.93)
 *
 * Seluruh bangunan dibuat ringan (AABB collider, performa 60 FPS untuk simulasi kendaraan/drone).
 */
export function createShelterSubArea() {
  const complexGroup = new THREE.Group();
  complexGroup.name = 'subarea_kompleks_bangunan_timur_laut';

  const yBase = 1.57;

  // Filter konfigurasi bangunan untuk kompleks timur laut
  const easternBuildings = BUILDINGS_CONFIG.filter((b) => b.id.startsWith('bldg_'));

  easternBuildings.forEach((bldg) => {
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
    const height = bldg.height || 4.5;

    const bldgGroup = new THREE.Group();
    bldgGroup.name = bldg.id;
    bldgGroup.position.set(posX, yBase, posZ);

    const wallMat = new THREE.MeshStandardMaterial({
      color: bldg.wallColor || 0xcfd6dc,
      roughness: 0.65,
      metalness: 0.05
    });

    const roofMat = new THREE.MeshStandardMaterial({
      color: bldg.roofColor || 0xf8fafc,
      roughness: 0.4,
      metalness: 0.15
    });

    // 1. Dinding Utama Bangunan
    const wallGeo = new THREE.BoxGeometry(sizeX, height, sizeZ);
    const wallMesh = new THREE.Mesh(wallGeo, wallMat);
    wallMesh.position.y = height / 2;
    wallMesh.castShadow = true;
    wallMesh.receiveShadow = true;
    bldgGroup.add(wallMesh);

    // 2. Tipe Atap Sesuai Karakteristik Visual Satelit
    const roofOverhang = 0.4;
    const roofThick = 0.25;

    if (bldg.roofType === 'corrugated_vertical') {
      // Atap gudang seng bertingkat/bergaris vertikal
      const ridgeHeight = 0.5;
      const roofGeo = new THREE.BoxGeometry(sizeX + roofOverhang * 2, roofThick + ridgeHeight, sizeZ + roofOverhang * 2);
      const roofMesh = new THREE.Mesh(roofGeo, roofMat);
      roofMesh.position.y = height + (roofThick + ridgeHeight) / 2;
      roofMesh.castShadow = true;
      roofMesh.receiveShadow = true;
      bldgGroup.add(roofMesh);

      // Garis kontras bubungan atap seng
      const ridgeMat = new THREE.MeshStandardMaterial({ color: 0x94a3b8, roughness: 0.5 });
      const ridge = new THREE.Mesh(
        new THREE.BoxGeometry(sizeX * 0.95, 0.1, 0.35),
        ridgeMat
      );
      ridge.position.y = height + roofThick + ridgeHeight + 0.05;
      bldgGroup.add(ridge);

    } else if (bldg.roofType === 'pitched_horizontal') {
      // Deretan atap memanjang horizontal (cokelat gelap)
      const roofGeo = new THREE.BoxGeometry(sizeX + roofOverhang * 2, roofThick * 1.5, sizeZ + roofOverhang * 2);
      const roofMesh = new THREE.Mesh(roofGeo, roofMat);
      roofMesh.position.y = height + (roofThick * 1.5) / 2;
      roofMesh.castShadow = true;
      roofMesh.receiveShadow = true;
      bldgGroup.add(roofMesh);

    } else if (bldg.roofType === 'pitched_subtle') {
      // Gedung putih besar utama di ujung bawah
      const roofGeo = new THREE.BoxGeometry(sizeX + roofOverhang * 2, roofThick * 1.8, sizeZ + roofOverhang * 2);
      const roofMesh = new THREE.Mesh(roofGeo, roofMat);
      roofMesh.position.y = height + (roofThick * 1.8) / 2;
      roofMesh.castShadow = true;
      roofMesh.receiveShadow = true;
      bldgGroup.add(roofMesh);

      // Lis fasad modern Pelindo Blue di keliling atap
      const trimMat = new THREE.MeshStandardMaterial({ color: 0x0284c7, roughness: 0.4 });
      const trimMesh = new THREE.Mesh(
        new THREE.BoxGeometry(sizeX + roofOverhang * 2.2, 0.3, sizeZ + roofOverhang * 2.2),
        trimMat
      );
      trimMesh.position.y = height + 0.15;
      bldgGroup.add(trimMesh);

    } else {
      // Atap datar standar dengan overhang
      const roofGeo = new THREE.BoxGeometry(sizeX + roofOverhang * 2, roofThick, sizeZ + roofOverhang * 2);
      const roofMesh = new THREE.Mesh(roofGeo, roofMat);
      roofMesh.position.y = height + roofThick / 2;
      roofMesh.castShadow = true;
      roofMesh.receiveShadow = true;
      bldgGroup.add(roofMesh);
    }

    // Collider AABB untuk simulasi kendaraan / drone
    bldgGroup.userData.isCollider = true;
    bldgGroup.userData.aabb = new THREE.Box3(
      new THREE.Vector3(minX, yBase, minZ),
      new THREE.Vector3(maxX, yBase + height + 1.0, maxZ)
    );

    complexGroup.add(bldgGroup);
  });

  return complexGroup;
}
