import * as THREE from 'three';
import { TR5_CONFIG } from './GeoCuker.js';

/**
 * ==============================================================================
 * Sub-Area: Marka Jalan & Grid Slot CY TR 5
 * ==============================================================================
 * - Grid marka putih bay & row di lantai aspal untuk Blok TR 5 (SW 6 Row x 8 Bay, NE 9 Row x 11 Bay)
 *   (Panjang kontainer 20ft melintang searah X, lebar kontainer memanjang searah Z)
 * - Garis pembatas jalur sirkulasi & marka panah di bukaan gerbang Cuker (Z ≈ 1062m)
 * - Bersih total dari garis parkir chevron dan marka mobil fiktif (sesuai instruksi)
 */
export function createSubAreaMarkaCuker() {
  const markingsGroup = new THREE.Group();
  markingsGroup.name = 'subarea_cuker_markings';

  const yMark = 1.572;

  const whiteMat = new THREE.MeshBasicMaterial({ color: 0xf8fafc, side: THREE.DoubleSide });
  const yellowMat = new THREE.MeshBasicMaterial({ color: 0xfbbf24, side: THREE.DoubleSide });

  // Helper untuk membuat garis marka berbentuk pita segi empat
  const createMarkingStrip = (x1, z1, x2, z2, width = 0.18, mat = whiteMat) => {
    const dx = x2 - x1;
    const dz = z2 - z1;
    const len = Math.hypot(dx, dz);
    if (len < 0.001) return null;

    const angle = Math.atan2(dx, -dz);
    const stripGeo = new THREE.PlaneGeometry(width, len);
    const strip = new THREE.Mesh(stripGeo, mat);
    strip.rotation.x = -Math.PI / 2;
    strip.rotation.z = -angle;
    strip.position.set((x1 + x2) / 2, yMark, (z1 + z2) / 2);
    return strip;
  };

  // ----------------------------------------------------------------------------
  // 1. Grid Marka Lantai Kontainer CY Blok TR 5 (Sub SW 6 Row & Sub NE 9 Row)
  // - Rows (melintang arah X): panjang slot 20ft (6.06m)
  // - Bays (memanjang arah Z): lebar slot kontainer (2.44m)
  // ----------------------------------------------------------------------------
  const drawBlockGrid = (config) => {
    const { bays, rows, xMin, xMax, zMin, zMax } = config;
    const rowStep = (xMax - xMin) / rows;
    const bayStep = (zMax - zMin) / bays;

    // Garis keliling batas blok (kuning tegas)
    const bTop = createMarkingStrip(xMin, zMin, xMax, zMin, 0.20, yellowMat);
    const bBottom = createMarkingStrip(xMin, zMax, xMax, zMax, 0.20, yellowMat);
    const bLeft = createMarkingStrip(xMin, zMin, xMin, zMax, 0.20, yellowMat);
    const bRight = createMarkingStrip(xMax, zMin, xMax, zMax, 0.20, yellowMat);
    if (bTop) markingsGroup.add(bTop);
    if (bBottom) markingsGroup.add(bBottom);
    if (bLeft) markingsGroup.add(bLeft);
    if (bRight) markingsGroup.add(bRight);

    // Garis pembagi baris melintang X (Row dividers)
    for (let r = 1; r < rows; r++) {
      const rx = xMin + r * rowStep;
      const rLine = createMarkingStrip(rx, zMin, rx, zMax, 0.12, whiteMat);
      if (rLine) markingsGroup.add(rLine);
    }

    // Garis pembagi deret memanjang Z (Bay dividers)
    for (let b = 1; b < bays; b++) {
      const bz = zMin + b * bayStep;
      const bLine = createMarkingStrip(xMin, bz, xMax, bz, 0.12, whiteMat);
      if (bLine) markingsGroup.add(bLine);
    }
  };

  // Sub-Blok Barat Daya (6 Row melintang X x 8 Bay memanjang Z)
  drawBlockGrid(TR5_CONFIG.SW_BLOCK);

  // Sub-Blok Timur Laut (9 Row melintang X x 11 Bay memanjang Z)
  drawBlockGrid(TR5_CONFIG.NE_BLOCK);

  // ----------------------------------------------------------------------------
  // 2. Marka Jalur Sirkulasi Pemisah & Panah Gerbang Akses Masuk-Keluar Cuker
  // ----------------------------------------------------------------------------
  // Garis solid pembatas antara CY TR 5 dan koridor manuver Cuker (X = 86.0, Z: 1070 s/d 1143)
  const dividerLine = createMarkingStrip(86.0, 1070.0, 86.0, 1143.0, 0.22, whiteMat);
  if (dividerLine) markingsGroup.add(dividerLine);

  // Marka Panah Akses Gerbang Cuker (Z in [1050, 1074]):
  // - Lajur Masuk: Menghadap BARAT LAUT (+X, masuk dari jalan ke dalam lapangan)
  // - Lajur Keluar: Menghadap TENGGARA (-X, keluar dari lapangan ke arah jalan)
  const addArrowToNorthwest = (xMid, zMid) => {
    const shaft = createMarkingStrip(xMid - 1.8, zMid, xMid + 1.2, zMid, 0.42, whiteMat);
    const fin1 = createMarkingStrip(xMid + 0.8, zMid - 0.85, xMid + 2.2, zMid, 0.42, whiteMat);
    const fin2 = createMarkingStrip(xMid + 0.8, zMid + 0.85, xMid + 2.2, zMid, 0.42, whiteMat);
    if (shaft) markingsGroup.add(shaft);
    if (fin1) markingsGroup.add(fin1);
    if (fin2) markingsGroup.add(fin2);
  };

  const addArrowToSoutheast = (xMid, zMid) => {
    const shaft = createMarkingStrip(xMid - 1.2, zMid, xMid + 1.8, zMid, 0.42, whiteMat);
    const fin1 = createMarkingStrip(xMid - 0.8, zMid - 0.85, xMid - 2.2, zMid, 0.42, whiteMat);
    const fin2 = createMarkingStrip(xMid - 0.8, zMid + 0.85, xMid - 2.2, zMid, 0.42, whiteMat);
    if (shaft) markingsGroup.add(shaft);
    if (fin1) markingsGroup.add(fin1);
    if (fin2) markingsGroup.add(fin2);
  };

  // Lajur Masuk di Z = 1056.5 (Menghadap Barat Laut / +X)
  addArrowToNorthwest(22.0, 1056.5);

  // Lajur Keluar di Z = 1067.5 (Menghadap Tenggara / -X)
  addArrowToSoutheast(22.0, 1067.5);

  return markingsGroup;
}
