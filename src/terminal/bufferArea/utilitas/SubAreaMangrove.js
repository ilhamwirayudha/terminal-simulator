import * as THREE from 'three';
import {
  uvToWorld,
  isLandUV,
  getCoastlineV,
  isPointInsideBuildingUV
} from './GeoUtilitas.js';

/**
 * ==============================================================================
 * Sub-Area: Vegetasi & Sabuk Hutan Mangrove (MangroveSubArea.js)
 * Sesuai Citra Satelit Nyata & Terkalibrasi Seamless dengan cyWaitingArea:
 * - Garis pantai utara lurus di X = 175.0 (menyambung langsung dengan CY & Cuker)
 * - Tanjung barat laut melengkung halus (smooth Catmull-Rom spline) ke abutmen jembatan
 * - Bidang air laut pasang (yWater = 0.85) menyambung water plane CY (X: 175-235)
 * - Bidang lumpur intertidal mudflat (yMud = 1.05) menyambung mudflat CY (X: 146-176)
 * - Sabuk bakau rapat pesisir (X: 146-172) dengan palet warna pekat identik CY
 * - Strip tanah cokelat reklamasi (X: 136-146) bersih dari pohon
 * ==============================================================================
 */
export function createSubAreaMangrove() {
  const mangroveGroup = new THREE.Group();
  mangroveGroup.name = 'subarea_mangrove_vegetasi';

  const yMud = 1.05;
  const yGround = 1.55;

  // ----------------------------------------------------------------------------
  // 1. Zona Lumpur Pasang Surut Pesisir (Intertidal Mudflat) di y = 1.05 -> -0.20
  // Menyambung seamless di Z = 775 dengan mudflat CY (X: 146 - 176)
  // ----------------------------------------------------------------------------
  const mudflatMat = new THREE.MeshStandardMaterial({
    color: 0x333b32, // Lumpur pasang surut basah
    roughness: 0.96,
    metalness: 0.04
  });

  const mudflatShape = new THREE.Shape();
  const mudSteps = 44;

  // Garis luar mudflat (dari abutmen u = 0.00 ke Z = 775)
  const outerPts = [];
  for (let i = 0; i <= mudSteps; i++) {
    const u = i / mudSteps;
    const vCoast = getCoastlineV(u);
    const w = uvToWorld(u, Math.max(0, vCoast - 0.006));
    outerPts.push(w);
  }
  outerPts[outerPts.length - 1].x = 176.0;

  // Garis dalam mudflat (dari Z = 775 kembali ke abutmen u = 0.00)
  const innerPts = [];
  for (let i = mudSteps; i >= 0; i--) {
    const u = i / mudSteps;
    const vCoast = getCoastlineV(u);
    const vInner = u >= 0.59 ? 0.18 : Math.min(0.98, vCoast + 0.18);
    const w = uvToWorld(u, vInner);
    innerPts.push(w);
  }
  innerPts[0].x = 146.0;

  mudflatShape.moveTo(outerPts[0].x, -outerPts[0].z);
  for (let i = 1; i < outerPts.length; i++) {
    mudflatShape.lineTo(outerPts[i].x, -outerPts[i].z);
  }
  for (let i = 0; i < innerPts.length; i++) {
    mudflatShape.lineTo(innerPts[i].x, -innerPts[i].z);
  }
  mudflatShape.closePath();

  const mudDepth = yMud + 0.2;
  const mudflatGeo = new THREE.ExtrudeGeometry(mudflatShape, {
    depth: mudDepth,
    bevelEnabled: false
  });
  const mudflatMesh = new THREE.Mesh(mudflatGeo, mudflatMat);
  mudflatMesh.rotation.x = -Math.PI / 2;
  mudflatMesh.position.set(0, -0.2, 0);
  mudflatMesh.receiveShadow = true;
  mudflatMesh.name = 'area_a_mudflat';
  mangroveGroup.add(mudflatMesh);

  // ----------------------------------------------------------------------------
  // 3. Generator Pohon Deterministik (Jittered Grid + Seeded PRNG)
  // ----------------------------------------------------------------------------
  let seed = 987654321;
  const rand = () => {
    seed = (seed * 1664525 + 1013904223) % 4294967296;
    return seed / 4294967296;
  };

  const treeInstances = [];

  // Palet Warna Alami Bakau & Hutan Tropis Pesisir
  const colMangroveDark = new THREE.Color(0x132a14);   // Hijau tua lebat pesisir pantai
  const colMangroveMedium = new THREE.Color(0x1a381c); // Hijau pekat pucuk bakau
  const colInlandGreen = new THREE.Color(0x2d4f22);    // Hijau pedalaman hutan campuran
  const colInlandLight = new THREE.Color(0x3c642e);    // Hijau cerah celah pedalaman
  const colDryOrange1 = new THREE.Color(0x785228);     // Daun kering oranye-cokelat
  const colDryOrange2 = new THREE.Color(0x8a5f30);     // Bercak vegetasi kering
  const colShrubLight = new THREE.Color(0x566d32);     // Semak terbuka Zona C

  const isDryPatch = (u, v) => {
    const d1 = Math.hypot(u - 0.69, v - 0.35);
    const d2 = Math.hypot(u - 0.50, v - 0.40);
    return (d1 < 0.055) || (d2 < 0.045);
  };

  const isZoneC = (u, v) => {
    return (u >= 0.16 && u <= 0.43 && v >= 0.48 && v <= 0.86);
  };

  const isTanahMerahD = (u, v) => {
    return (u >= 0.12 && u <= 0.43 && v >= 0.86 && v <= 1.00);
  };

  const isYardOrComplex = (u, v) => {
    // Halaman SubAreaIpal (u: 0.433 - 0.696, v: 0.669 - 0.994)
    if (u >= 0.43 && u <= 0.70 && v >= 0.66 && v <= 0.995) return true;
    // Jalur perkerasan & kompleks ParkirMotor + Shelter (u >= 0.715, v >= 0.25)
    if (u >= 0.715 && v >= 0.25) return true;
    return false;
  };

  const isSoilStrip = (u, v) => {
    // Strip tanah cokelat reklamasi utara
    return (u >= 0.72 && v >= 0.175 && v <= 0.25);
  };

  const isRoadBuffer = (u, v) => {
    return v >= 0.985;
  };

  // Jittered Grid Sampling (dimulai dari uGrid = 0.005 s/d 0.995)
  const uStep = 0.012;
  const vStep = 0.015;

  for (let uGrid = 0.005; uGrid <= 0.995; uGrid += uStep) {
    for (let vGrid = 0.008; vGrid <= 0.99; vGrid += vStep) {
      const u = uGrid + (rand() - 0.5) * uStep * 0.95;
      const v = vGrid + (rand() - 0.5) * vStep * 0.95;

      // 1. MUTLAK: Tidak ada pohon di luar garis pantai (sisi air/laut)!
      if (!isLandUV(u, v)) continue;

      // 2. Eksklusi bangunan & infrastruktur
      if (isPointInsideBuildingUV(u, v, 0.02)) continue;
      if (isYardOrComplex(u, v)) continue;
      if (isSoilStrip(u, v)) continue;
      if (isRoadBuffer(u, v)) continue;

      const vCoast = getCoastlineV(u);
      const distFromCoast = v - vCoast;

      let isTree = false;
      let scale = 1.0;
      let treeHeight = 5.0;
      let treeColor = colMangroveDark;
      let isShrub = false;

      if (isTanahMerahD(u, v)) {
        // Hamparan tanah merah: pohon sangat jarang
        if (rand() < 0.03) {
          isTree = true;
          scale = 0.85 + rand() * 0.35;
          treeHeight = 4.5;
          treeColor = colInlandGreen;
        }
      } else if (isZoneC(u, v)) {
        // Zona C: Padang rumput & semak terbuka (Kerapatan 10-15%, perdu pendek)
        if (rand() < 0.12) {
          isTree = true;
          isShrub = true;
          scale = 0.55 + rand() * 0.35;
          treeHeight = 2.4;
          treeColor = colShrubLight;
        }
      } else if (
        (distFromCoast >= 0 && distFromCoast <= 0.175) ||
        (v >= 0.00 && v <= 0.35 && u <= 0.80)
      ) {
        // Zona A: Sabuk hutan bakau rapat pesisir (X: 146-172 di utara, menyambung CY)
        // Kerapatan 94%
        if (rand() < 0.94) {
          isTree = true;
          scale = 0.88 + rand() * 0.45;
          treeHeight = 5.2 + rand() * 1.2;
          treeColor = (rand() < 0.65) ? colMangroveDark : colMangroveMedium;
          if (distFromCoast > 0.13 && rand() < 0.4) treeColor = colInlandGreen;
        }
      } else {
        // Zona B: Hutan campuran di pedalaman (Kerapatan 50-60%)
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
  // 4. Pohon Tunggal Kecil Tersebar Dekat Halaman (Sesuai Citra Satelit)
  // ----------------------------------------------------------------------------
  const isolatedUVs = [
    { u: 0.42, v: 0.93, scale: 0.95, color: colInlandGreen },
    { u: 0.40, v: 0.91, scale: 0.85, color: colInlandLight },
    { u: 0.61, v: 0.91, scale: 0.90, color: colInlandGreen },
    { u: 0.64, v: 0.93, scale: 0.80, color: colInlandLight },
    // Barisan pohon peneduh di dalam kompleks timur laut (di bawah bak putih utara & sepanjang jalan akses)
    { u: 0.78, v: 0.328, scale: 0.85, color: colInlandLight },
    { u: 0.82, v: 0.328, scale: 0.90, color: colInlandGreen },
    { u: 0.86, v: 0.328, scale: 0.85, color: colInlandLight },
    { u: 0.90, v: 0.328, scale: 0.88, color: colInlandGreen },
    { u: 0.94, v: 0.328, scale: 0.85, color: colInlandLight },
    { u: 0.71, v: 0.72,  scale: 1.05, color: colInlandGreen },
    { u: 0.77, v: 0.50,  scale: 0.85, color: colInlandLight },
    { u: 0.77, v: 0.58,  scale: 0.85, color: colInlandGreen },
    { u: 0.77, v: 0.66,  scale: 0.85, color: colInlandLight }
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
  // 5. InstancedMesh Rendering dengan Performa Maksimal
  // ----------------------------------------------------------------------------
  const count = treeInstances.length;
  if (count === 0) return mangroveGroup;

  const trunkGeo = new THREE.CylinderGeometry(0.2, 0.32, 2.5, 6);
  const trunkMat = new THREE.MeshStandardMaterial({
    color: 0x33281e,
    roughness: 0.92
  });
  const trunkMesh = new THREE.InstancedMesh(trunkGeo, trunkMat, count);
  trunkMesh.castShadow = true;

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
      dummy.position.set(t.x, yGround + 0.9 * s, t.z);
      dummy.rotation.set(0, t.rotY, 0);
      dummy.scale.set(s * 1.1, s * 0.65, s * 1.1);
      dummy.updateMatrix();
      crownMesh.setMatrixAt(i, dummy.matrix);
      crownMesh.setColorAt(i, t.color);

      dummy.scale.set(0.001, 0.001, 0.001);
      dummy.updateMatrix();
      trunkMesh.setMatrixAt(i, dummy.matrix);
    } else {
      dummy.position.set(t.x, yGround + 1.25 * s, t.z);
      dummy.rotation.set(0, t.rotY, 0);
      dummy.scale.set(s, s, s);
      dummy.updateMatrix();
      trunkMesh.setMatrixAt(i, dummy.matrix);

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
