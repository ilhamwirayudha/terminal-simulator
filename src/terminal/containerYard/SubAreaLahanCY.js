import * as THREE from 'three';
import {
  asphaltMat,
  curbHazardWhiteMat,
  whiteLineMat,
  yellowLineMat
} from '../../assets/materials/roadMaterials.js';
import {
  CY_BOUNDS,
  WEST_EXPANSION_CONFIG,
  EAST_RTG_CONFIG
} from './GeoContainerYard.js';

/**
 * ==============================================================================
 * Sub-Area: Perkerasan Dasar & Jaringan Jalan Akses Internal Container Yard
 * ==============================================================================
 * Mencakup:
 * 1. Slab utama lapangan beton CY (642.1m x 654.7m)
 * 2. Jalan Akses Barat CY (antara Lapangan Barat & Zona Tengah: Z = 2002 s/d 2036)
 * 3. Jalan Horizontal Selatan CFS (antara CFS & Blok 1 ASC: X = -139 s/d -114)
 * 4. Jalan Akses Timur CY (antara Blok Utama & Blok Timur RTG: Z = 2415.5 s/d 2441.5)
 * 5. Jalan Servis Tepi Timur Laut (di sisi SE Blok Timur: Z = 2469.5 s/d 2477.5)
 * 6. Jalan Penghubung Selatan (di bawah Blok 15: X = -658 s/d -642)
 * 7. Strip tanah reklamasi selatan di dekat sabuk pohon pantai (X = -676.1 s/d -658)
 */
export function createSubAreaLahanCY() {
  const lahanGroup = new THREE.Group();
  lahanGroup.name = 'subarea_lahan_dan_jalan_cy';

  const {
    zMin,
    zMax,
    xRoadEdge,
    xOuterSE,
    yPavement,
    ySoil,
    coastalBeltWidth
  } = CY_BOUNDS;

  const lengthZ = zMax - zMin;                    // 642.1m
  const widthX = Math.abs(xRoadEdge - xOuterSE);  // 654.7m
  const midZ = (zMin + zMax) / 2;
  const midX = (xRoadEdge + xOuterSE) / 2;

  // Material Permukaan
  const cyConcreteMat = new THREE.MeshStandardMaterial({
    color: 0x575e66,
    roughness: 0.86,
    metalness: 0.06
  });

  const internalRoadAsphaltMat = asphaltMat;

  const southReclamationSoilMat = new THREE.MeshStandardMaterial({
    color: 0x785c44,
    roughness: 0.94,
    metalness: 0.03
  });

  const coastalSoilMat = new THREE.MeshStandardMaterial({
    color: 0x6e5239,
    roughness: 0.95,
    metalness: 0.04
  });

  const grassDividerMat = new THREE.MeshStandardMaterial({
    color: 0x3a5232,
    roughness: 0.92
  });

  // 1. Slab Utama Lahan Beton CY (654.7m x 642.1m)
  const mainSlabGeo = new THREE.BoxGeometry(widthX, 0.30, lengthZ);
  const mainSlabMesh = new THREE.Mesh(mainSlabGeo, cyConcreteMat);
  mainSlabMesh.position.set(midX, yPavement - 0.15, midZ);
  mainSlabMesh.receiveShadow = true;
  lahanGroup.add(mainSlabMesh);

  // 2. Tanggul Reklamasi Pesisir Luar (Bentuk U di luar batas lahan bersih CY)
  const totalSoilWidthX = widthX + coastalBeltWidth;
  const totalSoilLenZ = lengthZ + coastalBeltWidth * 2;
  const soilCenterX = xRoadEdge - totalSoilWidthX / 2;

  const soilSlabGeo = new THREE.BoxGeometry(totalSoilWidthX, 0.28, totalSoilLenZ);
  const soilSlabMesh = new THREE.Mesh(soilSlabGeo, coastalSoilMat);
  soilSlabMesh.position.set(soilCenterX, ySoil - 0.14, midZ);
  soilSlabMesh.receiveShadow = true;
  lahanGroup.add(soilSlabMesh);

  // ----------------------------------------------------------------------------
  // 3. Jaringan Jalan Akses Internal CY (Aspal Gelap + Marka Lajur)
  // ----------------------------------------------------------------------------
  const addRoadStrip = (x1, x2, z1, z2, withCenterLine = false, isVerticalAlongX = true) => {
    const wX = Math.abs(x2 - x1);
    const wZ = Math.abs(z2 - z1);
    const cx = (x1 + x2) / 2;
    const cz = (z1 + z2) / 2;

    const rMesh = new THREE.Mesh(
      new THREE.PlaneGeometry(wX, wZ),
      internalRoadAsphaltMat
    );
    rMesh.rotation.x = -Math.PI / 2;
    rMesh.position.set(cx, yPavement + 0.008, cz);
    rMesh.receiveShadow = true;
    lahanGroup.add(rMesh);

    if (withCenterLine) {
      const cLine = new THREE.Mesh(
        new THREE.PlaneGeometry(isVerticalAlongX ? wX - 8.0 : 0.22, isVerticalAlongX ? 0.22 : wZ - 8.0),
        yellowLineMat
      );
      cLine.rotation.x = -Math.PI / 2;
      cLine.position.set(cx, yPavement + 0.014, cz);
      lahanGroup.add(cLine);
    }
  };

  // A. Jalan Akses Barat CY (Z: 2002 s/d 2036, X: -21.4 s/d -658)
  addRoadStrip(-21.4, -658.0, WEST_EXPANSION_CONFIG.westRoadZMin, WEST_EXPANSION_CONFIG.westRoadZMax, true, true);

  // Sabuk drainase/rumput tipis pemisah di sisi barat Jalan Akses Barat (Z: 1998.5 s/d 2001.5)
  const westDrainGrass = new THREE.Mesh(
    new THREE.PlaneGeometry(630.0, 3.0),
    grassDividerMat
  );
  westDrainGrass.rotation.x = -Math.PI / 2;
  westDrainGrass.position.set(-340.0, yPavement + 0.012, 2000.0);
  lahanGroup.add(westDrainGrass);

  // B. Jalan Horizontal Selatan CFS (X: -138.0 s/d -114.0, Z: 2036 s/d 2441.5)
  addRoadStrip(-114.0, -138.0, 2036.0, 2441.5, true, false);

  // C. Jalan Akses Timur CY (Z: 2415.5 s/d 2441.5, X: -21.4 s/d -658)
  addRoadStrip(-21.4, -658.0, EAST_RTG_CONFIG.eastAccessRoadZMin, EAST_RTG_CONFIG.eastAccessRoadZMax, true, true);

  // D. Jalan Servis Tepi Timur Laut (Di sisi SE Zona Kanan RTG: Z: 2469.5 s/d 2477.5, X: -21.4 s/d -658)
  addRoadStrip(-21.4, -658.0, EAST_RTG_CONFIG.sePerimeterRoadZMin, EAST_RTG_CONFIG.sePerimeterRoadZMax, false, true);

  // E. Jalan Penghubung Selatan (Di bawah Blok 15: X: -658.0 s/d -643.0, Z: 2002 s/d 2477.5)
  addRoadStrip(-643.0, -658.0, 2002.0, 2477.5, false, false);

  // F. Strip Tanah Reklamasi Cokelat di Tepi Paling Bawah (X: -675.5 s/d -658.5, Z: 2038 s/d 2438)
  // Sesuai bagian bawah Gambar 1 di mana terdapat jalur tanah cokelat sebelum pohon pantai
  const southSoilStrip = new THREE.Mesh(
    new THREE.PlaneGeometry(17.0, 400.0),
    southReclamationSoilMat
  );
  southSoilStrip.rotation.x = -Math.PI / 2;
  southSoilStrip.position.set(-667.0, yPavement + 0.009, 2238.0);
  southSoilStrip.receiveShadow = true;
  lahanGroup.add(southSoilStrip);

  // ----------------------------------------------------------------------------
  // 4. Kanstin Pembatas Tepi Luar Lahan Bersih CY (SW, SE, NE)
  // ----------------------------------------------------------------------------
  const curbH = 0.22;
  const curbW = 0.40;

  const curbSW = new THREE.Mesh(new THREE.BoxGeometry(widthX, curbH, curbW), curbHazardWhiteMat);
  curbSW.position.set(midX, yPavement + curbH / 2, zMin);
  curbSW.castShadow = true;
  lahanGroup.add(curbSW);

  const curbSE = new THREE.Mesh(new THREE.BoxGeometry(curbW, curbH, lengthZ), curbHazardWhiteMat);
  curbSE.position.set(xOuterSE, yPavement + curbH / 2, midZ);
  curbSE.castShadow = true;
  lahanGroup.add(curbSE);

  const curbNE = new THREE.Mesh(new THREE.BoxGeometry(widthX, curbH, curbW), curbHazardWhiteMat);
  curbNE.position.set(midX, yPavement + curbH / 2, zMax);
  curbNE.castShadow = true;
  lahanGroup.add(curbNE);

  return lahanGroup;
}
