import * as THREE from 'three';
import { CY_WAITING_BOUNDS, BLOCKS_CONFIG } from './CyWaitingGeo.js';

/**
 * ==============================================================================
 * Sub-Area: Akses Sirkulasi Jalan & Base Perkerasan Aspal CY / Waiting Area
 * Sesuai Citra Satelit Nyata:
 * - Base aspal heavy duty industri gelap tahan beban kontainer & truk
 * - Jalur manuver alat berat / truk selebar 20.5m di antara Blok TR 2 dan TR 4
 * - Jalur sirkulasi truk 6.1m di antara Waiting Area A dan B
 * - Jalur pemisah 7.3m di antara Container Yard dan Waiting Area
 * - Jalur akses masuk/keluar di sisi timur laut (Z: 1000m - 1034m) ke Jalan Pre-Gate
 * - Jalur akses di sisi timur CY TR 4
 * ==============================================================================
 */
export function createAccessRoadsSubArea() {
  const roadGroup = new THREE.Group();
  roadGroup.name = 'subarea_cy_waiting_roads';

  const yBase = 1.56;

  // Material Aspal Industri Gelap (Port Container Yard Asphalt)
  const cyPavementMat = new THREE.MeshStandardMaterial({
    color: 0x2e3338, // Aspal industri gelap berdebu pelabuhan
    roughness: 0.92,
    metalness: 0.08
  });

  // Material Aspal Jalur Manuver Truk / Waiting Area (Disamakan dengan warna aspal CY)
  const waPavementMat = new THREE.MeshStandardMaterial({
    color: 0x2e3338, // Aspal gelap industri serasi 100% dengan CY
    roughness: 0.92,
    metalness: 0.08
  });

  // Material Marka Kuning & Putih
  const whiteMarkingMat = new THREE.MeshStandardMaterial({ color: 0xf8fafc, roughness: 0.4 });
  const yellowMarkingMat = new THREE.MeshStandardMaterial({ color: 0xf59e0b, roughness: 0.4 });
  const curbMat = new THREE.MeshStandardMaterial({ color: 0x94a3b8, roughness: 0.7 });

  // ----------------------------------------------------------------------------
  // 1. Base Perkerasan Aspal Utama CY & Waiting Area
  // ShapeGeometry mencakup Z: 775 s/d 1034.4, X: 28.0 s/d 136.0
  // ditambah akses masuk-keluar timur laut menembus ke kanstin jalan X = 16.9
  // ----------------------------------------------------------------------------
  const shape = new THREE.Shape();
  // Sudut Kiri-Bawah (SW) di batas Area A (mengikuti kanstin jalan di Z = 775, X = 13.3)
  shape.moveTo(13.3, -775.0);
  // Ke arah Barat Laut (NW) menyusuri batas belakang CY
  shape.lineTo(136.0, -775.0);
  // Ke arah Timur Laut (NE) menyusuri batas belakang Blok TR 2
  shape.lineTo(136.0, -1034.4);
  // Ke arah Tenggara (SE) di ujung timur laut menyusuri kanstin jalan Pre-Gate X = 16.9
  shape.lineTo(16.9, -1034.4);
  // Menyusuri kanstin jalan Pre-Gate mundur ke Z = 805 (X = 16.9)
  shape.lineTo(16.9, -805.0);
  // Mengikuti taper pelebaran jalan dari Z = 805 (X = 16.9) ke Z = 775 (X = 13.3)
  shape.lineTo(13.3, -775.0);
  shape.closePath();

  const mainPavementGeo = new THREE.ShapeGeometry(shape);
  const mainPavementMesh = new THREE.Mesh(mainPavementGeo, cyPavementMat);
  mainPavementMesh.rotation.x = -Math.PI / 2;
  mainPavementMesh.position.set(0, yBase, 0);
  mainPavementMesh.receiveShadow = true;
  roadGroup.add(mainPavementMesh);

  // ----------------------------------------------------------------------------
  // 2. Base Perkerasan Khusus Waiting Area (Permukaan Abu-Abu Lebih Halus)
  // X: 30.0 s/d 71.0, Z: 785.0 s/d 1008.0
  // ----------------------------------------------------------------------------
  const waShape = new THREE.Shape();
  waShape.moveTo(30.0, -788.0);
  waShape.lineTo(71.0, -788.0);
  waShape.lineTo(71.0, -1008.0);
  waShape.lineTo(30.0, -1008.0);
  waShape.closePath();

  const waGeo = new THREE.ShapeGeometry(waShape);
  const waMesh = new THREE.Mesh(waGeo, waPavementMat);
  waMesh.rotation.x = -Math.PI / 2;
  waMesh.position.set(0, yBase + 0.005, 0);
  waMesh.receiveShadow = true;
  roadGroup.add(waMesh);

  // ----------------------------------------------------------------------------
  // 3. Marka Jalur Sirkulasi & Batas Driveway
  // ----------------------------------------------------------------------------
  // Garis solid pembatas antara Waiting Area dan CY (X = 73.0)
  const sepLineGeo = new THREE.PlaneGeometry(0.25, 220);
  const sepLine = new THREE.Mesh(sepLineGeo, yellowMarkingMat);
  sepLine.rotation.x = -Math.PI / 2;
  sepLine.position.set(73.0, yBase + 0.01, 898.0);
  roadGroup.add(sepLine);

  // Garis solid pembatas jalur tengah Waiting Area (X = 51.05)
  const midLineGeo = new THREE.PlaneGeometry(0.20, 205);
  const midLine = new THREE.Mesh(midLineGeo, whiteMarkingMat);
  midLine.rotation.x = -Math.PI / 2;
  midLine.position.set(51.05, yBase + 0.01, 897.0);
  roadGroup.add(midLine);

  // ----------------------------------------------------------------------------
  // 4. Akses Keluar / Masuk Sisi Timur Laut (NE Access: Z in [1000, 1034.4])
  // Garis tepi kuning dan marka panah akses keluar/masuk ke Jalan Pre-Gate
  // ----------------------------------------------------------------------------
  const createRoadArrow = (x, z, angleRad = 0) => {
    const arrowShape = new THREE.Shape();
    const w = 0.35, len = 2.4, headW = 1.1, headL = 1.4;
    arrowShape.moveTo(-w / 2, -len / 2);
    arrowShape.lineTo(w / 2, -len / 2);
    arrowShape.lineTo(w / 2, len / 2 - headL);
    arrowShape.lineTo(headW / 2, len / 2 - headL);
    arrowShape.lineTo(0, len / 2);
    arrowShape.lineTo(-headW / 2, len / 2 - headL);
    arrowShape.lineTo(-w / 2, len / 2 - headL);
    arrowShape.closePath();

    const arrowGeo = new THREE.ShapeGeometry(arrowShape);
    const arrowMesh = new THREE.Mesh(arrowGeo, whiteMarkingMat);
    arrowMesh.rotation.x = -Math.PI / 2;
    arrowMesh.rotation.z = angleRad;
    arrowMesh.position.set(x, yBase + 0.012, z);
    return arrowMesh;
  };

  // Panah arah sirkulasi di akses timur laut
  roadGroup.add(createRoadArrow(24.0, 1018.0, 0)); // Masuk ke arah terminal (+Z)
  roadGroup.add(createRoadArrow(45.0, 1022.0, Math.PI / 2)); // Belok ke Waiting Area (-X)
  roadGroup.add(createRoadArrow(90.0, 1025.0, Math.PI / 2)); // Menuju Container Yard (-X)

  // Panah sirkulasi di jalur manuver tengah CY (Z = 850, 920, 990)
  // Jalur CY Blok TR mengarah ke arah sebaliknya (Math.PI)
  [850, 920, 990].forEach((z) => {
    roadGroup.add(createRoadArrow(105.5, z, Math.PI)); // Mengarah ke sebaliknya sepanjang jalur alat berat CY
    roadGroup.add(createRoadArrow(51.05, z, 0)); // Maju sepanjang jalur tengah truk (+Z)
  });

  // ----------------------------------------------------------------------------
  // 5. Kanstin Pembatas Perimeter Luar (Curb Barriers)
  // ----------------------------------------------------------------------------
  // Kanstin pembatas belakang CY (sepanjang X = 136.0, Z: 775 s/d 1034)
  const backCurbLen = 1034.4 - 775.0;
  const backCurbGeo = new THREE.BoxGeometry(0.4, 0.25, backCurbLen);
  const backCurb = new THREE.Mesh(backCurbGeo, curbMat);
  backCurb.position.set(136.0, yBase + 0.125, (775.0 + 1034.4) / 2);
  backCurb.castShadow = true;
  backCurb.receiveShadow = true;
  roadGroup.add(backCurb);

  // Kanstin pembatas depan Waiting Area dikelola secara modular oleh DriverWalkwaySubArea.js
  // lengkap dengan bukaan akses rampe pejalan kaki & penyeberangan zebra cross (Z = 810, 850, 890, 930, 970)

  return roadGroup;
}
