import * as THREE from 'three';
import {
  uvToWorld,
  isLandUV,
  getCoastlineV,
  isPointInsideBuildingUV
} from './AreaAGeo.js';

/**
 * ==============================================================================
 * Sub-Area: Vegetasi & Sabuk Hutan Mangrove (MangroveSubArea.js)
 * Sesuai Citra Satelit Nyata:
 * - Garis pantai diagonal tegas (air di sisi barat/kiri-atas, ZERO pohon di air)
 * - Zona A: Hutan bakau rapat (pita lebar 0.10-0.15 di pantai; melebar di atas ke u≈0.80)
 * - Zona B: Hutan campuran lebih jarang (50-60%) + bercak kering oranye/cokelat
 * - Zona C: Padang rumput / semak terbuka (u 0.28-0.55, v 0.55-0.87), pohon jarang (10-15%) & rendah
 * - Pohon tunggal dekat halaman di (0.52, 0.95) dan (0.70, 0.90)
 *
 * Menggunakan THREE.InstancedMesh dengan instanceColor + deterministik seeded RNG
 * ==============================================================================
 */
export function createMangroveSubArea() {
  const mangroveGroup = new THREE.Group();
  mangroveGroup.name = 'subarea_mangrove_vegetasi';

  const yMud = 1.05;
  const yGround = 1.55;

  // ----------------------------------------------------------------------------
  // 1. Zona Lumpur Pasang Surut Pesisir (Intertidal Mudflat)
  // Mengikuti garis pantai diagonal luar
  // ----------------------------------------------------------------------------
  const mudflatMat = new THREE.MeshStandardMaterial({
    color: 0x333b32, // Lumpur pasang surut estuari basah
    roughness: 0.96,
    metalness: 0.04
  });

  const mudflatShape = new THREE.Shape();
  // Tracing titik pantai dari abutmen jembatan ke arah utara
  const mudPointsUV = [
    [0.10, 0.95],
    [0.12, 0.92],
    [0.20, 0.67],
    [0.33, 0.46],
    [0.46, 0.31],
    [0.62, 0.15],
    [0.69, 0.10],
    [1.00, 0.09],
    [1.00, 0.22],
    [0.72, 0.24],
    [0.55, 0.45],
    [0.35, 0.65],
    [0.22, 0.85],
    [0.15, 0.95]
  ];

  const firstPt = uvToWorld(mudPointsUV[0][0], mudPointsUV[0][1]);
  mudflatShape.moveTo(firstPt.x, -firstPt.z);
  for (let i = 1; i < mudPointsUV.length; i++) {
    const pt = uvToWorld(mudPointsUV[i][0], mudPointsUV[i][1]);
    mudflatShape.lineTo(pt.x, -pt.z);
  }
  mudflatShape.closePath();

  const mudflatGeo = new THREE.ShapeGeometry(mudflatShape);
  const mudflatMesh = new THREE.Mesh(mudflatGeo, mudflatMat);
  mudflatMesh.rotation.x = -Math.PI / 2;
  mudflatMesh.position.set(0, yMud, 0);
  mudflatMesh.receiveShadow = true;
  mangroveGroup.add(mudflatMesh);

  // ----------------------------------------------------------------------------
  // 2. Generator Pohon Deterministik (Jittered Grid + Seeded PRNG)
  // ----------------------------------------------------------------------------
  let seed = 987654321;
  const rand = () => {
    seed = (seed * 1664525 + 1013904223) % 4294967296;
    return seed / 4294967296;
  };

  const treeInstances = [];

  // Palet Warna Alami
  const colMangroveDark = new THREE.Color(0x132a14);   // Hijau tua lebat pesisir pantai
  const colMangroveMedium = new THREE.Color(0x1a381c); // Hijau pekat pucuk bakau
  const colInlandGreen = new THREE.Color(0x2d4f22);    // Hijau pedalaman hutan campuran
  const colInlandLight = new THREE.Color(0x3c642e);    // Hijau cerah celah pedalaman
  const colDryOrange1 = new THREE.Color(0x785228);     // Daun kering oranye-cokelat
  const colDryOrange2 = new THREE.Color(0x8a5f30);     // Bercak vegetasi kering
  const colShrubLight = new THREE.Color(0x566d32);     // Semak terbuka Zona C

  const isDryPatch = (u, v) => {
    // Bercak kering di sekitar (0.69, 0.35) dan (0.50, 0.40)
    const d1 = Math.hypot(u - 0.69, v - 0.35);
    const d2 = Math.hypot(u - 0.50, v - 0.40);
    return (d1 < 0.055) || (d2 < 0.045);
  };

  const isZoneC = (u, v) => {
    // Zona C: Padang rumput / semak terbuka
    return (u >= 0.28 && u <= 0.55 && v >= 0.55 && v <= 0.87);
  };

  const isTanahMerahD = (u, v) => {
    return (u >= 0.25 && u <= 0.51 && v >= 0.89 && v <= 1.00);
  };

  const isYardOrComplex = (u, v) => {
    // Halaman / Yard Tengah
    if (u >= 0.52 && u <= 0.78 && v >= 0.68 && v <= 0.90) return true;
    // Jalur perkerasan & kompleks gedung timur laut
    if (u >= 0.79 && v >= 0.27) return true;
    return false;
  };

  const isRoadBuffer = (u, v) => {
    // Tepi jalan langsung
    return v >= 0.985;
  };

  // Jittered Grid Sampling
  const uStep = 0.015;
  const vStep = 0.018;

  for (let uGrid = 0.11; uGrid <= 0.99; uGrid += uStep) {
    for (let vGrid = 0.08; vGrid <= 0.99; vGrid += vStep) {
      // Jitter posisi di dalam sel grid
      const u = uGrid + (rand() - 0.5) * uStep * 0.95;
      const v = vGrid + (rand() - 0.5) * vStep * 0.95;

      // 1. MUTLAK: Tidak ada pohon di luar garis pantai (sisi air/laut)!
      if (!isLandUV(u, v)) continue;

      // 2. Eksklusi bangunan & infrastruktur
      if (isPointInsideBuildingUV(u, v, 0.02)) continue;
      if (isYardOrComplex(u, v)) continue;
      if (isRoadBuffer(u, v)) continue;

      const vCoast = getCoastlineV(u);
      const distFromCoast = v - vCoast;

      // Penentuan Zona & Probabilitas Keberadaan Pohon:
      let isTree = false;
      let scale = 1.0;
      let treeHeight = 5.0;
      let treeColor = colMangroveDark;
      let isShrub = false;

      if (isTanahMerahD(u, v)) {
        // Hamparan tanah merah: dominan terbuka bersih, hanya beberapa pohon jarang
        if (rand() < 0.03) {
          isTree = true;
          scale = 0.85 + rand() * 0.35;
          treeHeight = 4.5;
          treeColor = colInlandGreen;
        }
      } else if (isZoneC(u, v)) {
        // Zona C: Padang rumput & semak terbuka (Kerapatan hanya 10-15%, perdu pendek)
        if (rand() < 0.12) {
          isTree = true;
          isShrub = true;
          scale = 0.55 + rand() * 0.35; // Perdu rendah
          treeHeight = 2.4;
          treeColor = colShrubLight;
        }
      } else if (
        (distFromCoast >= 0 && distFromCoast <= 0.14) ||
        (v >= 0.09 && v <= 0.44 && u <= 0.80)
      ) {
        // Zona A: Hutan bakau rapat (pita 0.10-0.15 di pantai & melebar di atas ke u≈0.80)
        // Kerapatan 95-100%
        if (rand() < 0.96) {
          isTree = true;
          scale = 0.88 + rand() * 0.45;
          treeHeight = 5.2 + rand() * 1.2;
          treeColor = (rand() < 0.6) ? colMangroveDark : colMangroveMedium;
        }
      } else {
        // Zona B: Hutan campuran lebih jarang di pedalaman (Kerapatan 50-60%)
        if (rand() < 0.52) {
          isTree = true;
          scale = 0.80 + rand() * 0.45;
          treeHeight = 4.8 + rand() * 1.5;

          if (isDryPatch(u, v)) {
            treeColor = (rand() < 0.6) ? colDryOrange1 : colDryOrange2;
          } else {
            treeColor = (rand() < 0.5) ? colInlandGreen : colInlandLight;
          }
        }
      }

      if (isTree) {
        const worldPos = uvToWorld(u, v);
        treeInstances.push({
          x: worldPos.x,
          z: worldPos.z,
          scale,
          height: treeHeight,
          color: treeColor,
          isShrub,
          rotY: rand() * Math.PI * 2
        });
      }
    }
  }

  // ----------------------------------------------------------------------------
  // 3. Pohon Tunggal Kecil Tersebar Dekat Halaman (Sesuai Citra Satelit)
  // Sekitar (0.52, 0.95) dan (0.70, 0.90)
  // ----------------------------------------------------------------------------
  const isolatedUVs = [
    { u: 0.52, v: 0.95, scale: 0.95, color: colInlandGreen },
    { u: 0.50, v: 0.93, scale: 0.85, color: colInlandLight },
    { u: 0.70, v: 0.90, scale: 0.90, color: colInlandGreen },
    { u: 0.72, v: 0.92, scale: 0.80, color: colInlandLight }
  ];

  isolatedUVs.forEach((pt) => {
    const worldPos = uvToWorld(pt.u, pt.v);
    treeInstances.push({
      x: worldPos.x,
      z: worldPos.z,
      scale: pt.scale,
      height: 4.8,
      color: pt.color,
      isShrub: false,
      rotY: Math.PI * 0.4
    });
  });

  // ----------------------------------------------------------------------------
  // 4. InstancedMesh Rendering dengan Performa Maksimal
  // ----------------------------------------------------------------------------
  const count = treeInstances.length;
  if (count === 0) return mangroveGroup;

  // Trunk Geometry (Batang)
  const trunkGeo = new THREE.CylinderGeometry(0.2, 0.32, 2.5, 6);
  const trunkMat = new THREE.MeshStandardMaterial({
    color: 0x33281e,
    roughness: 0.92
  });
  const trunkMesh = new THREE.InstancedMesh(trunkGeo, trunkMat, count);
  trunkMesh.castShadow = true;

  // Crown Geometry (Kanopi Pipih Alami: scale.y ~0.7)
  const crownGeo = new THREE.DodecahedronGeometry(2.3, 1);
  const crownMat = new THREE.MeshStandardMaterial({
    roughness: 0.82,
    metalness: 0.04,
    flatShading: true
  });
  const crownMesh = new THREE.InstancedMesh(crownGeo, crownMat, count);
  crownMesh.castShadow = true;
  crownMesh.receiveShadow = true;

  const dummy = new THREE.Object3D();

  for (let i = 0; i < count; i++) {
    const t = treeInstances[i];
    const s = t.scale;

    if (t.isShrub) {
      // Semak perdu rendah Zona C (tanpa batang tinggi terlihat)
      dummy.position.set(t.x, yGround + 0.9 * s, t.z);
      dummy.rotation.set(0, t.rotY, 0);
      dummy.scale.set(s * 1.1, s * 0.65, s * 1.1); // Pipih mendatar
      dummy.updateMatrix();
      crownMesh.setMatrixAt(i, dummy.matrix);
      crownMesh.setColorAt(i, t.color);

      // Dummy trunk scale 0 untuk semak
      dummy.scale.set(0.001, 0.001, 0.001);
      dummy.updateMatrix();
      trunkMesh.setMatrixAt(i, dummy.matrix);
    } else {
      // Batang pohon normal
      dummy.position.set(t.x, yGround + 1.25 * s, t.z);
      dummy.rotation.set(0, t.rotY, 0);
      dummy.scale.set(s, s, s);
      dummy.updateMatrix();
      trunkMesh.setMatrixAt(i, dummy.matrix);

      // Tajuk utama (kanopi agak pipih sesuai instruksi: scale.y ~0.7)
      dummy.position.set(t.x, yGround + 2.8 * s, t.z);
      dummy.rotation.set(0, t.rotY * 1.4, 0);
      dummy.scale.set(s * 1.15, s * 0.72, s * 1.15);
      dummy.updateMatrix();
      crownMesh.setMatrixAt(i, dummy.matrix);
      crownMesh.setColorAt(i, t.color);
    }
  }

  trunkMesh.instanceMatrix.needsUpdate = true;
  crownMesh.instanceMatrix.needsUpdate = true;
  if (crownMesh.instanceColor) crownMesh.instanceColor.needsUpdate = true;

  mangroveGroup.add(trunkMesh);
  mangroveGroup.add(crownMesh);

  return mangroveGroup;
}
