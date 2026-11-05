import * as THREE from 'three';
import { createRoadsideTreeBand } from '../../../assets/nature/createRoadsideTreeBand.js';
import {
  PASCA_FRAME,
  VEGETATION_BOUNDS,
  getPascaRoadEdgesAtS
} from './GeoPascaGate.js';

/**
 * ==============================================================================
 * Sub-Area: Sabuk Pepohonan Tepi Jalan Pasca Main Gate
 * ==============================================================================
 * Sesuai Koordinat Ground Truth:
 * - Sisi Tenggara (SE / -X): Pohon berhenti di s = 668.3 (-7.196986, 112.675824)
 * - Sisi Barat Laut (NW / +X): Pohon berhenti di s = 949.6 (-7.194633, 112.677024)
 * Setelah titik tersebut, tepi jalan terbuka (area CY / jalan murni).
 */
export function createSubAreaPohonPascaGate() {
  const treeGroup = new THREE.Group();
  treeGroup.name = 'subarea_pohon_pasca_gate';

  const { yRoad } = PASCA_FRAME;
  const { sStart, sStopSE, sStopNW } = VEGETATION_BOUNDS;

  const treePoints = [];

  let seed = 556677889;
  const rand = () => {
    seed = (seed * 1664525 + 1013904223) % 4294967296;
    return seed / 4294967296;
  };

  // 1. Sabuk Pohon Sisi Barat Laut (NW / +X): s = 531.0 s/d 949.6
  for (let s = sStart + 3.0; s <= sStopNW; s += 5.5) {
    const edge = getPascaRoadEdgesAtS(s);
    [2.8, 6.2].forEach((offsetDist) => {
      const jx = edge.tNW + offsetDist + (rand() - 0.5) * 1.4;
      const jz = edge.z + (rand() - 0.5) * 1.8;
      treePoints.push({
        x: jx,
        z: jz,
        scale: 0.85 + rand() * 0.35
      });
    });
  }

  // 2. Sabuk Pohon Sisi Tenggara (SE / -X): s = 531.0 s/d 668.3
  for (let s = sStart + 3.0; s <= sStopSE; s += 5.5) {
    const edge = getPascaRoadEdgesAtS(s);
    [-2.8, -6.2].forEach((offsetDist) => {
      const jx = edge.tSE + offsetDist + (rand() - 0.5) * 1.4;
      const jz = edge.z + (rand() - 0.5) * 1.8;
      treePoints.push({
        x: jx,
        z: jz,
        scale: 0.85 + rand() * 0.35
      });
    });
  }

  treeGroup.add(createRoadsideTreeBand(treePoints, yRoad));

  return treeGroup;
}
