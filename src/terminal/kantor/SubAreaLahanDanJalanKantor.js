import * as THREE from 'three';
import { KANTOR_BOUNDS } from './GeoKantor.js';
import { asphaltMat, curbHazardWhiteMat } from '../../assets/materials/roadMaterials.js';

/**
 * ==============================================================================
 * SubAreaLahanDanJalanKantor.js
 * ==============================================================================
 * Membangun:
 * 1. Daratan Reklamasi Utama Head Office (Z: 624.3 s/d 774.5, X: -13.3 s/d -181.3)
 *    + Tonjolan Barat Daya (-7.204763, 112.667865 & -7.204919, 112.668015)
 * 2. Simpang Akses Masuk/Keluar Berbentuk Y dengan Pulau Taman Segitiga di Tepi Jalan
 * 3. Jaringan Jalan Internal Beraspal Gelap (0x22262e) & Taman Lanskap Tengah
 * 4. Sabuk Hutan Mangrove Pesisir Bentuk U (Barat Daya, Selatan, & Timur Laut)
 *    beserta Pepohonan Taman Internal (InstancedMesh performa tinggi)
 */
export function createSubAreaLahanDanJalanKantor() {
  const group = new THREE.Group();
  group.name = 'subarea_lahan_dan_jalan_kantor';

  const {
    zMinMain,
    zMaxMangrove,
    xRoadCurb,
    xInnerCompoundMin,
    xOuterCoastMin,
    swBulge,
    yGround,
    yPavement,
    yRoadInternal
  } = KANTOR_BOUNDS;

  // Material Palet
  const mudflatSoilMat = new THREE.MeshStandardMaterial({
    color: 0x4a5246,
    roughness: 0.95,
    metalness: 0.04
  });

  const redBrownSoilMat = new THREE.MeshStandardMaterial({
    color: 0x8c6244, // Tanah cokelat-merah di tonjolan kiri-atas sesuai foto satelit
    roughness: 0.94,
    metalness: 0.04
  });

  const lawnGrassMat = new THREE.MeshStandardMaterial({
    color: 0x3f5e34, // Rumput hijau taman kompleks kantor
    roughness: 0.92,
    metalness: 0.03
  });

  const gardenIslandGrassMat = new THREE.MeshStandardMaterial({
    color: 0x36532b,
    roughness: 0.9
  });

  const concreteApronMat = new THREE.MeshStandardMaterial({
    color: 0x828992, // Pelataran paving/beton parkir belakang gedung HO
    roughness: 0.84,
    metalness: 0.06
  });

  // ----------------------------------------------------------------------------
  // 1. DARATAN DASAR REKLAMASI UTAMA & TONJOLAN BARAT DAYA
  // ----------------------------------------------------------------------------
  const mainLenZ = zMaxMangrove - zMinMain; // 150.2m
  const mainMidZ = (zMinMain + zMaxMangrove) / 2;
  const mainDepthX = Math.abs(xOuterCoastMin - xRoadCurb); // 168.0m
  const mainMidX = (xRoadCurb + xOuterCoastMin) / 2;

  const mainLandSlab = new THREE.Mesh(
    new THREE.BoxGeometry(mainDepthX, yGround + 0.2, mainLenZ),
    mudflatSoilMat
  );
  mainLandSlab.position.set(mainMidX, (yGround - 0.2) / 2, mainMidZ);
  mainLandSlab.receiveShadow = true;
  group.add(mainLandSlab);

  // Tonjolan Barat Daya (-7.204763, 112.667865 & -7.204919, 112.668015 -> Z: 597.9 s/d 624.3, X: -13.3 s/d -38.0)
  const bulgeLenZ = swBulge.zMax - swBulge.zMin; // 26.4m
  const bulgeMidZ = (swBulge.zMin + swBulge.zMax) / 2;
  const bulgeDepthX = Math.abs(swBulge.xMin - swBulge.xMax); // 24.7m
  const bulgeMidX = (swBulge.xMax + swBulge.xMin) / 2;

  const bulgeSlab = new THREE.Mesh(
    new THREE.BoxGeometry(bulgeDepthX, yGround + 0.2, bulgeLenZ),
    mudflatSoilMat
  );
  bulgeSlab.position.set(bulgeMidX, (yGround - 0.2) / 2, bulgeMidZ);
  bulgeSlab.receiveShadow = true;
  group.add(bulgeSlab);

  // Hamparan Tanah Cokelat Terbuka di Sudut Kiri-Atas (Terlihat jelas di foto satelit ke-2)
  const nwSoilPatch = new THREE.Mesh(
    new THREE.PlaneGeometry(18.0, 22.0),
    redBrownSoilMat
  );
  nwSoilPatch.rotation.x = -Math.PI / 2;
  nwSoilPatch.position.set(-22.5, yGround + 0.015, 622.0);
  nwSoilPatch.receiveShadow = true;
  group.add(nwSoilPatch);

  // ----------------------------------------------------------------------------
  // 2. PELATARAN RUMPUT TAMAN DALAM KOMPLEKS (Z: 638.0 s/d 756.0, X: -14.0 s/d -164.0)
  // ----------------------------------------------------------------------------
  const innerLenZ = 756.0 - 638.0; // 118.0m
  const innerMidZ = (638.0 + 756.0) / 2;
  const innerDepthX = Math.abs(xInnerCompoundMin - (-14.0)); // 150.0m
  const innerMidX = (-14.0 + xInnerCompoundMin) / 2;

  const compoundLawn = new THREE.Mesh(
    new THREE.PlaneGeometry(innerDepthX, innerLenZ),
    lawnGrassMat
  );
  compoundLawn.rotation.x = -Math.PI / 2;
  compoundLawn.position.set(innerMidX, yPavement, innerMidZ);
  compoundLawn.receiveShadow = true;
  group.add(compoundLawn);

  // ----------------------------------------------------------------------------
  // 3. JARINGAN JALAN SIRKULASI INTERNAL BERASPAL GELAP (0x22262e) & PULAU SEGITIGA
  // ----------------------------------------------------------------------------
  const addAsphaltStrip = (xMin, xMax, zMin, zMax, rotY = 0) => {
    const wX = Math.abs(xMax - xMin);
    const wZ = Math.abs(zMax - zMin);
    const cx = (xMin + xMax) / 2;
    const cz = (zMin + zMax) / 2;

    const road = new THREE.Mesh(new THREE.PlaneGeometry(wX, wZ), asphaltMat);
    road.rotation.x = -Math.PI / 2;
    if (rotY !== 0) road.rotation.z = rotY;
    road.position.set(cx, yRoadInternal, cz);
    road.receiveShadow = true;
    group.add(road);
  };

  // A. Apron Gerbang Masuk & Keluar Berbentuk Y dari Jalan Pre-Gate (Z: 672 s/d 718, X: -13.1 s/d -42.0)
  addAsphaltStrip(-42.0, -13.1, 672.0, 718.0);

  // Pulau Taman Segitiga di Tengah Akses Masuk/Keluar (Sesuai Foto Satelit & PDF: Z: 682 s/d 708, X: -15.5 s/d -33.5)
  const triShape = new THREE.Shape();
  // Dalam ShapeGeometry yang diputar rotation.x = -Math.PI/2: X_shape = X_world, Y_shape = -Z_world
  triShape.moveTo(-15.5, -682.0);
  triShape.lineTo(-15.5, -708.0);
  triShape.lineTo(-33.5, -695.0);
  triShape.closePath();

  const triCurb = new THREE.Mesh(
    new THREE.ExtrudeGeometry(triShape, { depth: 0.22, bevelEnabled: false }),
    curbHazardWhiteMat
  );
  triCurb.rotation.x = -Math.PI / 2;
  triCurb.position.set(0, yRoadInternal, 0);
  group.add(triCurb);

  const triGrass = new THREE.Mesh(new THREE.ShapeGeometry(triShape), gardenIslandGrassMat);
  triGrass.rotation.x = -Math.PI / 2;
  triGrass.position.set(0, yRoadInternal + 0.23, 0);
  group.add(triGrass);

  // Taman Hijau di Sisi Kiri & Kanan Gerbang Akses (Menutupi bagian luar Y-junction agar membentuk lengan miring)
  const leftGrassTri = new THREE.Shape();
  leftGrassTri.moveTo(-14.0, -670.0);
  leftGrassTri.lineTo(-42.0, -670.0);
  leftGrassTri.lineTo(-42.0, -691.0);
  leftGrassTri.closePath();
  const leftGrassMesh = new THREE.Mesh(new THREE.ShapeGeometry(leftGrassTri), lawnGrassMat);
  leftGrassMesh.rotation.x = -Math.PI / 2;
  leftGrassMesh.position.set(0, yRoadInternal + 0.005, 0);
  group.add(leftGrassMesh);

  // B. Jalan Utama Tengah Utara-Selatan (Antara Parkir Umum Z=690 & Parkir VIP Z=706.5)
  addAsphaltStrip(-88.0, -40.0, 690.5, 706.0);

  // C. Jalan Koridor Utara Gedung HO & Pos Jaga Timur Laut (Z: 706.0 s/d 752.0, X: -35.0 s/d -47.5)
  addAsphaltStrip(-47.5, -35.0, 706.0, 752.0);

  // D. Jalan Melintang Tengah di Bawah Lapangan Olahraga & Parkir Umum (Z: 644.0 s/d 727.5, X: -80.0 s/d -88.0)
  addAsphaltStrip(-88.0, -80.0, 644.0, 727.5);

  // E. Jalan Fasad Barat Gedung Utama HO (Lobby Drop-off Corridor: Z: 715.5 s/d 727.8, X: -42.0 s/d -145.0)
  addAsphaltStrip(-145.0, -42.0, 715.5, 727.8);

  // F. Jalan Samping Timur Masjid Menuju Parkir Belakang (Z: 691.0 s/d 701.0, X: -88.0 s/d -152.0)
  addAsphaltStrip(-152.0, -88.0, 691.0, 701.0);

  // G. Pelataran Beton/Paving Parkir Selatan di Belakang Gedung HO (Z: 682.0 s/d 753.0, X: -139.5 s/d -161.5)
  const southParkingApron = new THREE.Mesh(
    new THREE.BoxGeometry(22.0, 0.14, 71.0),
    concreteApronMat
  );
  southParkingApron.position.set(-150.5, yPavement + 0.07, 717.5);
  southParkingApron.receiveShadow = true;
  group.add(southParkingApron);

  // H. Pulau Taman Lanskap Tengah (Antara Jalan Masjid Z=701 & Jalan Gedung HO Z=715.5, X: -89.0 s/d -140.0)
  const midGardenIsland = new THREE.Mesh(
    new THREE.BoxGeometry(51.0, 0.24, 13.5),
    gardenIslandGrassMat
  );
  midGardenIsland.position.set(-114.5, yRoadInternal + 0.12, 708.25);
  midGardenIsland.receiveShadow = true;
  group.add(midGardenIsland);

  // ----------------------------------------------------------------------------
  // 4. SABUK HUTAN MANGROVE PESISIR BENTUK U & PEPOHONAN TAMAN INTERNAL
  // ----------------------------------------------------------------------------
  let seed = 44556677;
  const rand = () => {
    seed = (seed * 1664525 + 1013904223) % 4294967296;
    return seed / 4294967296;
  };

  const treeInstances = [];
  const colMangroveDark = new THREE.Color(0x153116);
  const colMangroveMid = new THREE.Color(0x1f4220);
  const colParkGreen = new THREE.Color(0x2d5a27);
  const colParkLight = new THREE.Color(0x3f6e34);

  // 4A. Sabuk Mangrove Barat Daya (Kiri pada foto: Z: 599 s/d 639, X: -15 s/d -180)
  for (let z = 599.5; z <= 639.0; z += 4.2) {
    const xMinLimit = z < 624.3 ? -37.0 : -180.0;
    for (let x = -15.5; x >= xMinLimit; x -= 4.2) {
      // Kosongkan sedikit bagian tanah cokelat di Z: 612-630, X: -15 s/d -30
      if (z >= 612.0 && z <= 630.0 && x >= -30.0) continue;
      if (rand() < 0.12) continue;
      treeInstances.push({
        x: x + (rand() - 0.5) * 1.8,
        z: z + (rand() - 0.5) * 1.8,
        scale: 0.9 + rand() * 0.45,
        color: rand() < 0.6 ? colMangroveDark : colMangroveMid
      });
    }
  }

  // 4B. Sabuk Mangrove Selatan / Tenggara (Bawah pada foto: Z: 639 s/d 773, X: -163.5 s/d -180)
  for (let z = 639.0; z <= 773.0; z += 4.2) {
    for (let x = -163.5; x >= -180.0; x -= 4.2) {
      if (rand() < 0.12) continue;
      treeInstances.push({
        x: x + (rand() - 0.5) * 1.8,
        z: z + (rand() - 0.5) * 1.8,
        scale: 0.9 + rand() * 0.45,
        color: rand() < 0.6 ? colMangroveDark : colMangroveMid
      });
    }
  }

  // 4C. Sabuk Mangrove Timur Laut (Kanan pada foto: Z: 755.5 s/d 773.5, X: -15.5 s/d -163.5)
  for (let z = 755.5; z <= 773.5; z += 4.2) {
    for (let x = -15.5; x >= -163.5; x -= 4.2) {
      if (rand() < 0.14) continue;
      treeInstances.push({
        x: x + (rand() - 0.5) * 1.8,
        z: z + (rand() - 0.5) * 1.8,
        scale: 0.88 + rand() * 0.45,
        color: rand() < 0.55 ? colMangroveDark : colMangroveMid
      });
    }
  }

  // 4D. Pepohonan Taman Lanskap Internal (Sesuai Foto Satelit Ke-2)
  const internalTreeCoords = [
    // Pohon di tepi utara dekat jalan Pre-Gate & Pulau Segitiga
    { x: -24.0, z: 646.0, s: 1.25 },
    { x: -28.0, z: 658.0, s: 1.15 },
    { x: -32.0, z: 672.0, s: 1.10 },
    { x: -23.0, z: 695.0, s: 0.95 }, // Di dalam Pulau Taman Segitiga
    { x: -24.0, z: 724.0, s: 1.10 },
    { x: -22.0, z: 742.0, s: 1.30 },
    // Pohon peneduh antara Parkir Umum, Jalan Tengah, & Parkir Direktur
    { x: -48.0, z: 702.0, s: 1.05 },
    { x: -60.0, z: 701.5, s: 1.20 },
    { x: -72.0, z: 701.5, s: 1.15 },
    { x: -52.0, z: 718.0, s: 0.95 },
    { x: -64.0, z: 718.0, s: 0.95 },
    { x: -76.0, z: 718.0, s: 0.95 },
    // Pohon rindang di Pulau Taman Tengah & Sekeliling Masjid
    { x: -96.0, z: 708.0, s: 1.20 },
    { x: -108.0, z: 708.0, s: 1.25 },
    { x: -122.0, z: 708.0, s: 1.20 },
    { x: -134.0, z: 708.0, s: 1.35 },
    { x: -86.0, z: 662.0, s: 1.20 },
    { x: -106.0, z: 688.0, s: 1.30 },
    { x: -124.0, z: 690.0, s: 1.35 },
    { x: -136.0, z: 674.0, s: 1.30 },
    { x: -148.0, z: 662.0, s: 1.25 },
    { x: -122.0, z: 650.0, s: 1.15 },
    { x: -102.0, z: 646.0, s: 1.10 },
    // Pohon di selatan Gedung HO (antara gedung & parkir belakang)
    { x: -141.5, z: 732.0, s: 1.15 },
    { x: -141.5, z: 742.0, s: 1.15 }
  ];

  internalTreeCoords.forEach((pt) => {
    treeInstances.push({
      x: pt.x,
      z: pt.z,
      scale: pt.s,
      color: rand() < 0.5 ? colParkGreen : colParkLight
    });
  });

  // Render seluruh pohon dengan InstancedMesh (1 Draw Call)
  const count = treeInstances.length;
  const trunkGeo = new THREE.CylinderGeometry(0.22, 0.34, 2.4, 6);
  const trunkMat = new THREE.MeshStandardMaterial({ color: 0x3b2d1f, roughness: 0.9 });
  const trunkInst = new THREE.InstancedMesh(trunkGeo, trunkMat, count);
  trunkInst.castShadow = true;

  const crownGeo = new THREE.DodecahedronGeometry(2.35, 1);
  const crownMat = new THREE.MeshStandardMaterial({
    roughness: 0.82,
    metalness: 0.04,
    flatShading: true
  });
  const crownInst = new THREE.InstancedMesh(crownGeo, crownMat, count);
  crownInst.castShadow = true;
  crownInst.receiveShadow = true;

  const dummy = new THREE.Object3D();
  for (let i = 0; i < count; i++) {
    const t = treeInstances[i];
    const s = t.scale;

    dummy.position.set(t.x, yGround + 1.2 * s, t.z);
    dummy.rotation.set(0, (i * 1.7) % (Math.PI * 2), 0);
    dummy.scale.set(s, s, s);
    dummy.updateMatrix();
    trunkInst.setMatrixAt(i, dummy.matrix);

    dummy.position.set(t.x, yGround + 2.85 * s, t.z);
    dummy.rotation.set(0, (i * 2.3) % (Math.PI * 2), 0);
    dummy.scale.set(s * 1.15, s * 0.74, s * 1.15);
    dummy.updateMatrix();
    crownInst.setMatrixAt(i, dummy.matrix);
    crownInst.setColorAt(i, t.color);
  }

  trunkInst.instanceMatrix.needsUpdate = true;
  crownInst.instanceMatrix.needsUpdate = true;
  if (crownInst.instanceColor) crownInst.instanceColor.needsUpdate = true;

  group.add(trunkInst);
  group.add(crownInst);

  return group;
}
