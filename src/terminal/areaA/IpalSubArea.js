import * as THREE from 'three';
import {
  uvToWorld,
  BUILDINGS_CONFIG
} from './AreaAGeo.js';

/**
 * ==============================================================================
 * Sub-Area: Halaman / Yard Fasilitas Tengah (Sebelumnya Sub IPAL)
 * Sesuai Citra Satelit: u in [0.52, 0.78], v in [0.68, 0.90]
 * ==============================================================================
 *
 * Komponen Fisik Sesuai Citra:
 * 1. Base lantai perkerasan beton abu-abu (ShapeGeometry via index.js)
 * 2. Bangunan kecil atap putih/tan di bagian atas yard (u: 0.60-0.64, v: 0.68-0.75)
 * 3. Dua unit shed kecil atap biru di sisi kiri (u: ~0.53, v: ~0.77 & ~0.86)
 * 4. Dua baris silinder tangki horizontal abu-abu terang di tengah (u: 0.59-0.68, v: 0.77-0.84)
 * 5. Shed atap biru & bangunan putih kecil di sisi kanan (u: ~0.72-0.76, v: ~0.72-0.78)
 *
 * CATATAN PENGHAPUSAN:
 * - "Lapangan hijau mirip tenis" (aeration basin lama) telah dihapus penuh karena tidak ada padanan di satelit.
 * - Setiap bangunan dilengkapi AABB Box collider sederhana untuk simulasi.
 */
export function createIpalSubArea() {
  const yardGroup = new THREE.Group();
  yardGroup.name = 'subarea_yard_tengah';

  const yBase = 1.57;

  // Filter konfigurasi bangunan untuk yard tengah
  const yardBuildings = BUILDINGS_CONFIG.filter((b) => b.id.startsWith('yard_'));

  yardBuildings.forEach((bldg) => {
    const { uMin, uMax, vMin, vMax } = bldg.uvRect;

    // Hitung posisi dunia sudut-sudut rect
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
    const height = bldg.height || 3.2;

    if (bldg.type === 'skid_tanks') {
      // ------------------------------------------------------------------------
      // Deretan Silinder Tangki Horizontal Metalik di Atas Dudukan Baja
      // ------------------------------------------------------------------------
      const tankRadius = 1.05;
      const tankLength = sizeZ * 0.28;
      const tankCount = bldg.tankCount || 3;

      const tankMat = new THREE.MeshStandardMaterial({
        color: bldg.tankColor || 0xcfd8dc,
        roughness: 0.35,
        metalness: 0.65
      });
      const skidFrameMat = new THREE.MeshStandardMaterial({
        color: 0x475569,
        roughness: 0.7,
        metalness: 0.5
      });

      const tankRowGroup = new THREE.Group();
      tankRowGroup.name = bldg.id;
      tankRowGroup.position.set(posX, yBase, posZ);

      const spacingZ = sizeZ / tankCount;
      const startZ = -sizeZ / 2 + spacingZ / 2;

      for (let i = 0; i < tankCount; i++) {
        const tz = startZ + i * spacingZ;

        // Tangki silinder horizontal memanjang sepanjang sumbu Z lokal
        const tankGeo = new THREE.CylinderGeometry(tankRadius, tankRadius, tankLength, 18);
        const tankMesh = new THREE.Mesh(tankGeo, tankMat);
        tankMesh.rotation.x = Math.PI / 2;
        tankMesh.position.set(0, tankRadius + 0.3, tz);
        tankMesh.castShadow = true;
        tankMesh.receiveShadow = true;
        tankRowGroup.add(tankMesh);

        // Tutup ujung tangki (dished head bulat)
        const capGeo = new THREE.SphereGeometry(tankRadius, 16, 8, 0, Math.PI * 2, 0, Math.PI / 2);
        const cap1 = new THREE.Mesh(capGeo, tankMat);
        cap1.rotation.x = -Math.PI / 2;
        cap1.position.set(0, tankRadius + 0.3, tz + tankLength / 2);
        tankRowGroup.add(cap1);

        const cap2 = new THREE.Mesh(capGeo, tankMat);
        cap2.rotation.x = Math.PI / 2;
        cap2.position.set(0, tankRadius + 0.3, tz - tankLength / 2);
        tankRowGroup.add(cap2);

        // Kaki rangka skid penopang
        const saddleGeo = new THREE.BoxGeometry(sizeX * 0.75, 0.35, tankLength * 0.65);
        const saddle = new THREE.Mesh(saddleGeo, skidFrameMat);
        saddle.position.set(0, 0.175, tz);
        saddle.castShadow = true;
        saddle.receiveShadow = true;
        tankRowGroup.add(saddle);
      }

      // Box collider AABB
      tankRowGroup.userData.isCollider = true;
      tankRowGroup.userData.aabb = new THREE.Box3(
        new THREE.Vector3(minX, yBase, minZ),
        new THREE.Vector3(maxX, yBase + height, maxZ)
      );

      yardGroup.add(tankRowGroup);

    } else {
      // ------------------------------------------------------------------------
      // Bangunan / Shed Kotak Bersih Ringan (Industrial Utility Shed)
      // ------------------------------------------------------------------------
      const bldgGroup = new THREE.Group();
      bldgGroup.name = bldg.id;
      bldgGroup.position.set(posX, yBase, posZ);

      const wallMat = new THREE.MeshStandardMaterial({
        color: bldg.wallColor || 0xf1f5f9,
        roughness: 0.65,
        metalness: 0.05
      });
      const roofMat = new THREE.MeshStandardMaterial({
        color: bldg.roofColor || 0x0284c7,
        roughness: 0.45,
        metalness: 0.15
      });

      // Dinding utama gedung
      const wallGeo = new THREE.BoxGeometry(sizeX, height, sizeZ);
      const wallMesh = new THREE.Mesh(wallGeo, wallMat);
      wallMesh.position.y = height / 2;
      wallMesh.castShadow = true;
      wallMesh.receiveShadow = true;
      bldgGroup.add(wallMesh);

      // Plat atap dengan sedikit overhang kanopi (0.3m)
      const overhang = 0.35;
      const roofThick = 0.22;
      const roofGeo = new THREE.BoxGeometry(sizeX + overhang * 2, roofThick, sizeZ + overhang * 2);
      const roofMesh = new THREE.Mesh(roofGeo, roofMat);
      roofMesh.position.y = height + roofThick / 2;
      roofMesh.castShadow = true;
      roofMesh.receiveShadow = true;
      bldgGroup.add(roofMesh);

      // Box collider AABB untuk simulasi
      bldgGroup.userData.isCollider = true;
      bldgGroup.userData.aabb = new THREE.Box3(
        new THREE.Vector3(minX, yBase, minZ),
        new THREE.Vector3(maxX, yBase + height + roofThick, maxZ)
      );

      yardGroup.add(bldgGroup);
    }
  });

  return yardGroup;
}
