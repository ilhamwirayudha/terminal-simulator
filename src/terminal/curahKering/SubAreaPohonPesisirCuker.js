import * as THREE from 'three';
import { createRoadsideTreeBand } from '../../assets/nature/createRoadsideTreeBand.js';
import {
  CUKER_TERMINAL_BOUNDS,
  getSwMangroveDepthAtX,
  getNwMangroveWidthAtZ
} from './GeoCurahKering.js';

/**
 * ==============================================================================
 * Sub-Area: Sabuk Pepohonan & Hutan Mangrove Pesisir Curah Kering
 * ==============================================================================
 * Sesuai Citra Satelit (media_1793861223472_f1039788.png):
 * 1. Sisi Kiri / Barat Daya (SW, Z < 2117.6):
 *    - Dekat jalan (X: 21.4 s/d 95): Tanggul tanah terbuka dengan pohon di tepi luar,
 *      menyambung dari berhentinya sabuk pohon jalan NW (Z = 2117.6, X = 21.4).
 *    - Tengah-Atas Kiri (X: 95 s/d 363.2): Hutan bakau/mangrove sangat lebat dan
 *      membulat menonjol ke arah laut barat daya hingga kedalaman ~92m.
 * 2. Sisi Atas / Barat Laut (NW, X > 363.2):
 *    - Sabuk hutan mangrove sepanjang pantai barat laut (Z: 2117.6 s/d 2482.1)
 *      dengan tanjung yang menebal di bagian tengah (Z ~ 2220 s/d 2370).
 * 3. Sisi Kanan / Timur Laut (NE, Z > 2482.1):
 *    - Barisan pohon pesisir tipis di tepi kanan-atas (X: 190 s/d 363.2).
 */
export function createSubAreaPohonPesisirCuker() {
  const treeGroup = new THREE.Group();
  treeGroup.name = 'subarea_pohon_pesisir_cuker';

  const {
    zMin,
    zMax,
    xRoadEdge,
    xOuterNW,
    ySoil,
    neBeltWidth
  } = CUKER_TERMINAL_BOUNDS;

  let seed = 334455667;
  const rand = () => {
    seed = (seed * 1664525 + 1013904223) % 4294967296;
    return seed / 4294967296;
  };

  const treePoints = [];

  // ----------------------------------------------------------------------------
  // 1. Hutan Mangrove & Sabuk Pohon Sisi Barat Daya (Kiri pada Gambar, Z < zMin)
  // ----------------------------------------------------------------------------
  for (let x = xRoadEdge + 2.5; x <= xOuterNW + 12.0; x += 4.8) {
    const maxDepth = getSwMangroveDepthAtX(x);

    // Di dekat jalan (X < 95m), sesuai citra satelit terdapat area tanah urukan terbuka
    // di dekat pagar, sehingga pohon terkonsentrasi di tepi pantai luarnya
    const startOffset = x < 95.0 ? Math.max(4.0, maxDepth - 14.0) : 4.0;

    for (let d = startOffset; d <= maxDepth - 2.5; d += 4.8) {
      if (rand() < 0.10) continue;
      const jx = x + (rand() - 0.5) * 2.2;
      const jz = zMin - d + (rand() - 0.5) * 2.2;
      treePoints.push({
        x: jx,
        z: jz,
        scale: 0.85 + rand() * 0.48
      });
    }
  }

  // ----------------------------------------------------------------------------
  // 2. Sabuk Hutan Mangrove Sisi Barat Laut (Atas pada Gambar, X > xOuterNW)
  // ----------------------------------------------------------------------------
  for (let z = zMin - 8.0; z <= zMax + neBeltWidth - 2.0; z += 4.8) {
    const maxW = getNwMangroveWidthAtZ(z);
    for (let w = 3.5; w <= maxW - 2.0; w += 4.6) {
      if (rand() < 0.10) continue;
      const jx = xOuterNW + w + (rand() - 0.5) * 2.0;
      const jz = z + (rand() - 0.5) * 2.2;
      treePoints.push({
        x: jx,
        z: jz,
        scale: 0.85 + rand() * 0.45
      });
    }
  }

  // ----------------------------------------------------------------------------
  // 3. Sabuk Pohon Tepi Timur Laut (Kanan pada Gambar, Z > zMax)
  //    Sesuai gambar: vegetasi tepi pantai kanan berada di separuh atas (X: 185 s/d 363.2)
  // ----------------------------------------------------------------------------
  for (let x = 185.0; x <= xOuterNW + 8.0; x += 5.2) {
    [3.5, 8.2].forEach((dz) => {
      if (rand() < 0.20) return;
      const jx = x + (rand() - 0.5) * 2.0;
      const jz = zMax + dz + (rand() - 0.5) * 1.8;
      treePoints.push({
        x: jx,
        z: jz,
        scale: 0.82 + rand() * 0.38
      });
    });
  }

  treeGroup.add(createRoadsideTreeBand(treePoints, ySoil));

  return treeGroup;
}
