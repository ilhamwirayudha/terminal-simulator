import * as THREE from 'three';
import { curbHazardWhiteMat } from '../../assets/materials/roadMaterials.js';
import {
  CUKER_TERMINAL_BOUNDS,
  ORU_CONFIG,
  getSwMangroveDepthAtX,
  getNwMangroveWidthAtZ
} from './GeoCurahKering.js';

/**
 * ==============================================================================
 * Sub-Area: Perkerasan Lahan & Zonasi Terminal Curah Kering (364.5m x 341.8m)
 * ==============================================================================
 * Zonasi sesuai Sketsa AutoCAD & Citra Satelit:
 * 1. Zona ORU (Z: 2117.6 s/d 2200.6, Lebar 83m):
 *    - X: 21.4 s/d 246.0 -> Perkerasan aspal/beton gelap + jalan loop internal
 *    - X: 246.0 s/d 363.2 -> Lahan tanah cokelat reklamasi
 * 2. Koridor Tengah (Z: 2200.6 s/d 2259.1, Lebar 58.5m):
 *    - Permukaan tanah kapur/konstruksi terang sesuai foto satelit
 * 3. Bulk Area Utama (Z: 2259.1 s/d 2482.1, Lebar 223m):
 *    - Perkerasan beton industri terang (apron silo, flat storage, & sirkulasi truk)
 *    - Area hijau belakang di sisi utara/barat laut (X: 312 s/d 363.2)
 */
export function createSubAreaLahanCuker() {
  const lahanGroup = new THREE.Group();
  lahanGroup.name = 'subarea_lahan_cuker';

  const {
    zMin,
    zMax,
    zOruEnd,
    zMidEnd,
    xRoadEdge,
    xOuterNW,
    yPavement,
    ySoil,
    neBeltWidth
  } = CUKER_TERMINAL_BOUNDS;

  const lengthZ = zMax - zMin;            // 364.5m
  const widthX = xOuterNW - xRoadEdge;    // 341.8m
  const midZ = (zMin + zMax) / 2;
  const midX = (xRoadEdge + xOuterNW) / 2;

  // Material Permukaan
  const oruAsphaltMat = new THREE.MeshStandardMaterial({
    color: 0x454c54,
    roughness: 0.88,
    metalness: 0.06
  });

  const oruUpperSoilMat = new THREE.MeshStandardMaterial({
    color: 0x7a5c43,
    roughness: 0.95,
    metalness: 0.03
  });

  const midLimestoneMat = new THREE.MeshStandardMaterial({
    color: 0xbab2a4,
    roughness: 0.92,
    metalness: 0.04
  });

  const bulkConcreteMat = new THREE.MeshStandardMaterial({
    color: 0x7d858d,
    roughness: 0.82,
    metalness: 0.08
  });

  const rearGreenGroundMat = new THREE.MeshStandardMaterial({
    color: 0x3b4d34,
    roughness: 0.94,
    metalness: 0.03
  });

  const coastalSoilMat = new THREE.MeshStandardMaterial({
    color: 0x6b5037,
    roughness: 0.95,
    metalness: 0.04
  });

  const fenceWallMat = new THREE.MeshStandardMaterial({
    color: 0x94a3b8,
    roughness: 0.7,
    metalness: 0.2
  });

  // ----------------------------------------------------------------------------
  // 1. Zona 1: AREA ORU (Z: 2117.6 s/d 2200.6, Lebar 83m)
  // ----------------------------------------------------------------------------
  const oruWidthZ = zOruEnd - zMin; // 83.0m
  const oruMidZ = (zMin + zOruEnd) / 2;

  // 1A. Perkerasan Aspal Bawah-Tengah ORU (X: 21.4 s/d 246.0)
  const oruAsphaltLenX = ORU_CONFIG.xAsphaltMax - xRoadEdge;
  const oruAsphaltMesh = new THREE.Mesh(
    new THREE.BoxGeometry(oruAsphaltLenX, 0.30, oruWidthZ),
    oruAsphaltMat
  );
  oruAsphaltMesh.position.set(xRoadEdge + oruAsphaltLenX / 2, yPavement - 0.15, oruMidZ);
  oruAsphaltMesh.receiveShadow = true;
  lahanGroup.add(oruAsphaltMesh);

  // 1B. Lahan Tanah Cokelat Atas ORU (X: 246.0 s/d 363.2)
  const oruSoilLenX = xOuterNW - ORU_CONFIG.xAsphaltMax;
  const oruSoilMesh = new THREE.Mesh(
    new THREE.BoxGeometry(oruSoilLenX, 0.30, oruWidthZ),
    oruUpperSoilMat
  );
  oruSoilMesh.position.set(ORU_CONFIG.xAsphaltMax + oruSoilLenX / 2, yPavement - 0.15, oruMidZ);
  oruSoilMesh.receiveShadow = true;
  lahanGroup.add(oruSoilMesh);

  // ----------------------------------------------------------------------------
  // 2. Zona 2: KORIDOR TENGAH (Z: 2200.6 s/d 2259.1, Lebar 58.5m)
  // ----------------------------------------------------------------------------
  const midWidthZ = zMidEnd - zOruEnd; // 58.5m
  const midCenterZ = (zOruEnd + zMidEnd) / 2;
  const midSlabMesh = new THREE.Mesh(
    new THREE.BoxGeometry(widthX, 0.30, midWidthZ),
    midLimestoneMat
  );
  midSlabMesh.position.set(midX, yPavement - 0.15, midCenterZ);
  midSlabMesh.receiveShadow = true;
  lahanGroup.add(midSlabMesh);

  // ----------------------------------------------------------------------------
  // 3. Zona 3: BULK AREA UTAMA (Z: 2259.1 s/d 2482.1, Lebar 223.0m)
  // ----------------------------------------------------------------------------
  const bulkWidthZ = zMax - zMidEnd; // 223.0m
  const bulkCenterZ = (zMidEnd + zMax) / 2;
  const bulkSlabMesh = new THREE.Mesh(
    new THREE.BoxGeometry(widthX, 0.30, bulkWidthZ),
    bulkConcreteMat
  );
  bulkSlabMesh.position.set(midX, yPavement - 0.15, bulkCenterZ);
  bulkSlabMesh.receiveShadow = true;
  lahanGroup.add(bulkSlabMesh);

  // Area Hijau / Taman Belakang di atas Silo & Flat Storage (X: 314 s/d 361)
  const greenPatchMesh = new THREE.Mesh(
    new THREE.PlaneGeometry(46.0, bulkWidthZ - 8.0),
    rearGreenGroundMat
  );
  greenPatchMesh.rotation.x = -Math.PI / 2;
  greenPatchMesh.position.set(337.0, yPavement + 0.008, bulkCenterZ);
  greenPatchMesh.receiveShadow = true;
  lahanGroup.add(greenPatchMesh);

  // ----------------------------------------------------------------------------
  // 4. Dinding / Pagar Pembatas Internal Antar-Zona (Sesuai Garis AutoCAD & Satelit)
  // ----------------------------------------------------------------------------
  [zOruEnd, zMidEnd].forEach((fz) => {
    const wallLine = new THREE.Mesh(
      new THREE.BoxGeometry(widthX - 4.0, 2.2, 0.35),
      fenceWallMat
    );
    wallLine.position.set(midX, yPavement + 1.1, fz);
    wallLine.castShadow = true;
    lahanGroup.add(wallLine);
  });

  // ----------------------------------------------------------------------------
  // 5. Daratan Pesisir Organik & Semenanjung Mangrove Luar (SW, NW, NE)
  // ----------------------------------------------------------------------------
  const coastShape = new THREE.Shape();
  coastShape.moveTo(xRoadEdge, -zMin);

  const swSteps = 32;
  for (let i = 0; i <= swSteps; i++) {
    const u = i / swSteps;
    const x = xRoadEdge + u * widthX;
    const depthZ = getSwMangroveDepthAtX(x);
    coastShape.lineTo(x, -(zMin - depthZ));
  }

  const nwStartW = getNwMangroveWidthAtZ(zMin);
  const swEndD = getSwMangroveDepthAtX(xOuterNW);
  coastShape.quadraticCurveTo(
    xOuterNW + nwStartW * 0.85,
    -(zMin - swEndD * 0.85),
    xOuterNW + nwStartW,
    -zMin
  );

  const nwSteps = 32;
  for (let i = 1; i <= nwSteps; i++) {
    const u = i / nwSteps;
    const z = zMin + u * lengthZ;
    const extX = getNwMangroveWidthAtZ(z);
    coastShape.lineTo(xOuterNW + extX, -z);
  }

  const nwEndW = getNwMangroveWidthAtZ(zMax);
  coastShape.lineTo(xOuterNW + nwEndW * 0.6, -(zMax + neBeltWidth));
  coastShape.lineTo(xRoadEdge, -(zMax + neBeltWidth));
  coastShape.lineTo(xRoadEdge, -zMin);
  coastShape.closePath();

  const coastGeo = new THREE.ExtrudeGeometry(coastShape, {
    depth: 0.28,
    bevelEnabled: false
  });
  const coastMesh = new THREE.Mesh(coastGeo, coastalSoilMat);
  coastMesh.rotation.x = -Math.PI / 2;
  coastMesh.position.set(0, ySoil - 0.28, 0);
  coastMesh.receiveShadow = true;
  lahanGroup.add(coastMesh);

  // ----------------------------------------------------------------------------
  // 6. Kanstin Pembatas Tepi Luar Lahan Bersih Cuker (SW, NW, NE)
  // ----------------------------------------------------------------------------
  const curbH = 0.22;
  const curbW = 0.40;

  const curbSW = new THREE.Mesh(new THREE.BoxGeometry(widthX, curbH, curbW), curbHazardWhiteMat);
  curbSW.position.set(midX, yPavement + curbH / 2, zMin);
  curbSW.castShadow = true;
  lahanGroup.add(curbSW);

  const curbNW = new THREE.Mesh(new THREE.BoxGeometry(curbW, curbH, lengthZ), curbHazardWhiteMat);
  curbNW.position.set(xOuterNW, yPavement + curbH / 2, midZ);
  curbNW.castShadow = true;
  lahanGroup.add(curbNW);

  const curbNE = new THREE.Mesh(new THREE.BoxGeometry(widthX, curbH, curbW), curbHazardWhiteMat);
  curbNE.position.set(midX, yPavement + curbH / 2, zMax);
  curbNE.castShadow = true;
  lahanGroup.add(curbNE);

  return lahanGroup;
}
