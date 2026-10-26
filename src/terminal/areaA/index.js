import * as THREE from 'three';
import {
  ZONES_CONFIG,
  COASTLINE_UV,
  uvToWorld
} from './AreaAGeo.js';
import { createIpalSubArea } from './IpalSubArea.js';
import { createShelterSubArea } from './ShelterSubArea.js';
import { createParkirMotorSubArea } from './ParkirMotorSubArea.js';
import { createMangroveSubArea } from './MangroveSubArea.js';

/**
 * ==============================================================================
 * Area: Area A (Coordinator File)
 * Sisi Barat Laut (Kiri) Jalan Pre-Gate (Z: 604.5 s/d 775, Sebelum Pelebaran Jalan)
 * Status: Refactored & Terkalibrasi Deklaratif Sesuai Citra Satelit Nyata
 * ==============================================================================
 *
 * Mengoordinasikan seluruh sub-area fasilitas di Area A:
 * 1. Base Reklamasi & Poligon Zona Deklaratif (ZONES_CONFIG)
 *    - Zona D: Hamparan Tanah Merah Kiri-Bawah (u: 0.25-0.51, v: 0.89-1.00)
 *    - Zona E: Strip Tanah Merah Kanan-Atas (u: 0.82-0.99, v: 0.27-0.31)
 *    - Zona C: Padang Rumput / Semak Terbuka (u: 0.28-0.55, v: 0.55-0.87)
 *    - Yard Tengah: Lantai Beton Abu-abu (u: 0.52-0.78, v: 0.68-0.90)
 *    - Jalur Perkerasan Beton Vertikal (u: 0.80-0.84, v: 0.42-0.97)
 *    - Kompleks Bangunan Tepi Kanan (u: 0.82-1.00, v: 0.27-0.97)
 * 2. Fasilitas Yard Tengah (IpalSubArea.js)
 * 3. Kompleks Bangunan Timur Laut (ShelterSubArea.js)
 * 4. Utilitas & Penerangan (ParkirMotorSubArea.js)
 * 5. Sabuk Hutan Mangrove & Vegetasi Terkalibrasi (MangroveSubArea.js)
 */
export function createAreaA(scene) {
  const areaAGroup = new THREE.Group();
  areaAGroup.name = 'area_a';

  const yGround = 1.55;

  // ----------------------------------------------------------------------------
  // 1. Base Reklamasi Daratan Area A (Mengikuti Garis Pantai Tracing Satelit)
  // ----------------------------------------------------------------------------
  const groundBaseMat = new THREE.MeshStandardMaterial({
    color: 0x484f4a, // Gravel/tanah padat reklamasi
    roughness: 0.94,
    metalness: 0.05
  });

  const groundShape = new THREE.Shape();

  // Susun garis pantai daratan dari u=0.12 s/d u=1.00
  const coastlineWorldPts = COASTLINE_UV.map(([u, v]) => uvToWorld(u, v));

  groundShape.moveTo(coastlineWorldPts[0].x, -coastlineWorldPts[0].z);
  for (let i = 1; i < coastlineWorldPts.length; i++) {
    groundShape.lineTo(coastlineWorldPts[i].x, -coastlineWorldPts[i].z);
  }

  // Tepi timur laut (ujung area kerja Z = 775, tepat sebelum pelebaran jalan)
  const ptNE = uvToWorld(1.00, 1.00);
  groundShape.lineTo(ptNE.x, -ptNE.z);

  // Sisi kanstin tepi jalan dari Z=775 mundur ke abutmen Z=625 mengikuti transisi jalan
  for (let u = 1.00; u >= 0.12; u -= 0.04) {
    const pt = uvToWorld(u, 1.00);
    groundShape.lineTo(pt.x, -pt.z);
  }
  const ptSE = uvToWorld(0.12, 1.00);
  groundShape.lineTo(ptSE.x, -ptSE.z);
  groundShape.lineTo(coastlineWorldPts[0].x, -coastlineWorldPts[0].z);
  groundShape.closePath();

  const groundGeo = new THREE.ShapeGeometry(groundShape);
  const groundMesh = new THREE.Mesh(groundGeo, groundBaseMat);
  groundMesh.rotation.x = -Math.PI / 2;
  groundMesh.position.set(0, yGround, 0);
  groundMesh.receiveShadow = true;
  groundMesh.name = 'area_a_ground_base';
  areaAGroup.add(groundMesh);

  // ----------------------------------------------------------------------------
  // 2. Render Tiap Zona Deklaratif sebagai ShapeGeometry dengan Offset-Y
  // ----------------------------------------------------------------------------
  ZONES_CONFIG.forEach((zone) => {
    const shape = new THREE.Shape();
    const uvs = zone.uvPolygon;
    const p0 = uvToWorld(uvs[0][0], uvs[0][1]);
    shape.moveTo(p0.x, -p0.z);

    for (let i = 1; i < uvs.length; i++) {
      const p = uvToWorld(uvs[i][0], uvs[i][1]);
      shape.lineTo(p.x, -p.z);
    }
    shape.closePath();

    const mat = new THREE.MeshStandardMaterial({
      color: zone.color,
      roughness: zone.roughness || 0.92,
      metalness: 0.04
    });

    const geo = new THREE.ShapeGeometry(shape);
    const mesh = new THREE.Mesh(geo, mat);
    mesh.rotation.x = -Math.PI / 2;
    mesh.position.set(0, yGround + (zone.yOffset || 0.015), 0);
    mesh.receiveShadow = true;
    mesh.name = zone.id;
    areaAGroup.add(mesh);
  });

  // ----------------------------------------------------------------------------
  // 3. Sub-Area Halaman / Yard Fasilitas Tengah
  // ----------------------------------------------------------------------------
  const subYard = createIpalSubArea();
  areaAGroup.add(subYard);

  // ----------------------------------------------------------------------------
  // 4. Sub-Area Kompleks Bangunan Tepi Kanan (Timur Laut)
  // ----------------------------------------------------------------------------
  const subKompleks = createShelterSubArea();
  areaAGroup.add(subKompleks);

  // ----------------------------------------------------------------------------
  // 5. Sub-Area Utilitas & Penerangan Perimeter
  // ----------------------------------------------------------------------------
  const subParkir = createParkirMotorSubArea();
  areaAGroup.add(subParkir);

  // ----------------------------------------------------------------------------
  // 6. Sub-Area Sabuk Hutan Mangrove & Vegetasi Terkalibrasi
  // ----------------------------------------------------------------------------
  const subMangrove = createMangroveSubArea();
  areaAGroup.add(subMangrove);

  // ----------------------------------------------------------------------------
  // 7. Daftarkan Seluruh Collider AABB Bangunan ke Scene UserData untuk Simulasi
  // ----------------------------------------------------------------------------
  if (scene) {
    scene.userData.colliders = scene.userData.colliders || [];
    areaAGroup.traverse((obj) => {
      if (obj.userData && obj.userData.isCollider && obj.userData.aabb) {
        scene.userData.colliders.push(obj.userData.aabb);
      }
    });
    scene.add(areaAGroup);
  }

  return areaAGroup;
}
