import * as THREE from 'three';
import { createRoadsideTreeBand } from '../../assets/nature/createRoadsideTreeBand.js';
import { CY_BOUNDS } from './GeoContainerYard.js';

/**
 * ==============================================================================
 * Sub-Area: Sabuk Pepohonan Pesisir Container Yard (Berdasarkan Citra Satelit)
 * ==============================================================================
 * Ditempatkan di atas tanggul luar (di luar koordinat lahan bersih CY):
 * 1. Sisi Kiri / Barat Daya (SW, Z < 1836.3):
 *    Menyambung dari berhentinya pohon jalan SE (X = -21.4, Z = 1836.3) ke arah
 *    pantai tenggara (X = -676.1). Rapat di X: -21.4 s/d -460 (sesuai gambar)
 *    dan berlanjut lebih jarang hingga sudut X = -690.
 * 2. Sisi Bawah / Tenggara (SE, X < -676.1):
 *    Sabuk hijau sepanjang tepi pantai tenggara (Z: 1820 s/d 2494).
 * 3. Sisi Kanan / Timur Laut (NE, Z > 2478.4):
 *    Sabuk hijau tebal di tepi pantai timur laut (X: -85 s/d -690, menyisakan
 *    ruang akses jalan di dekat koridor utama X: -21.4 s/d -85 sesuai gambar).
 */
export function createSubAreaPohonPesisirCY() {
  const treeGroup = new THREE.Group();
  treeGroup.name = 'subarea_pohon_pesisir_cy';

  const {
    zMin,
    zMax,
    xRoadEdge,
    xOuterSE,
    ySoil,
    coastalBeltWidth
  } = CY_BOUNDS;

  let seed = 778899112;
  const rand = () => {
    seed = (seed * 1664525 + 1013904223) % 4294967296;
    return seed / 4294967296;
  };

  const treePoints = [];

  // ----------------------------------------------------------------------------
  // 1. Sabuk Pohon Sisi Barat Daya (Kiri pada Gambar: Z in [zMin - 16, zMin - 2])
  //    Membentang dari X = -24.0 (menyambung pohon tepi jalan) s/d X = -688.0
  // ----------------------------------------------------------------------------
  for (let x = xRoadEdge - 2.5; x >= xOuterSE - coastalBeltWidth + 3.0; x -= 5.2) {
    // Sesuai citra satelit: di sisi kiri atas-tengah (X: -24 s/d -460) sabuk pohon tebal (3 baris),
    // sedangkan mendekati sudut kiri bawah (X < -460) lebih tipis (1-2 baris tepi pantai)
    const offsetsZ = x >= -460.0 ? [-3.2, -7.8, -12.5] : [-4.5, -10.0];

    offsetsZ.forEach((dz) => {
      if (x < -460.0 && rand() < 0.35) return; // Lebih renggang di sudut kiri bawah sesuai foto
      const jx = x + (rand() - 0.5) * 2.2;
      const jz = zMin + dz + (rand() - 0.5) * 2.0;
      treePoints.push({
        x: jx,
        z: jz,
        scale: 0.85 + rand() * 0.45
      });
    });
  }

  // ----------------------------------------------------------------------------
  // 2. Sabuk Pohon Sisi Tenggara (Bawah pada Gambar: X in [xOuterSE - 16, xOuterSE - 2])
  //    Membentang sepanjang Z = 1824.0 s/d 2492.0
  // ----------------------------------------------------------------------------
  for (let z = zMin - 12.0; z <= zMax + coastalBeltWidth - 3.0; z += 5.2) {
    [-3.2, -7.8, -12.8].forEach((dx) => {
      if (rand() < 0.12) return;
      const jx = xOuterSE + dx + (rand() - 0.5) * 2.0;
      const jz = z + (rand() - 0.5) * 2.2;
      treePoints.push({
        x: jx,
        z: jz,
        scale: 0.85 + rand() * 0.45
      });
    });
  }

  // ----------------------------------------------------------------------------
  // 3. Sabuk Pohon Sisi Timur Laut (Kanan pada Gambar: Z in [zMax + 2, zMax + 16])
  //    Sesuai gambar: area kanan-atas dekat jalan (X: -21.4 s/d -85) adalah perkerasan/jalan,
  //    pepohonan/mangrove pantai kanan mulai rapat dari X = -85.0 hingga sudut kanan-bawah X = -688.0
  // ----------------------------------------------------------------------------
  for (let x = -85.0; x >= xOuterSE - coastalBeltWidth + 3.0; x -= 4.8) {
    [3.2, 7.8, 12.8].forEach((dz) => {
      if (rand() < 0.10) return;
      const jx = x + (rand() - 0.5) * 2.2;
      const jz = zMax + dz + (rand() - 0.5) * 2.0;
      treePoints.push({
        x: jx,
        z: jz,
        scale: 0.90 + rand() * 0.45
      });
    });
  }

  treeGroup.add(createRoadsideTreeBand(treePoints, ySoil));

  return treeGroup;
}
