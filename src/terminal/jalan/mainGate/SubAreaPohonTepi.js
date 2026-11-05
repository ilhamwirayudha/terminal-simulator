import * as THREE from 'three';
import { createRoadsideTreeBand } from '../../../assets/nature/createRoadsideTreeBand.js';
import { createMedianTree } from '../../../assets/nature/createMedianTree.js';
import { FRAME, getRoadEdgesAtS } from './GeoMainGate.js';

/**
 * ==============================================================================
 * Sub-Area: Sabuk Vegetasi & Pepohonan Tepi Jalan (Main Gate Tree Bands)
 * ==============================================================================
 */
export function createSubAreaPohonTepi() {
  const treeGroup = new THREE.Group();
  treeGroup.name = 'subarea_pohon_tepi_main_gate';

  const { z0, totalLength, yRoad } = FRAME;
  const treePoints = [];

  let seed = 123456789;
  const rand = () => {
    seed = (seed * 1664525 + 1013904223) % 4294967296;
    return seed / 4294967296;
  };

  // 1. Sabuk Pohon Tepi Barat Laut (NW / +X)
  for (let s = 5; s < totalLength - 5; s += 5.0) {
    const edge = getRoadEdgesAtS(s);
    [2.8, 6.5, 10.2].forEach((offsetDist) => {
      if (s >= 430 && s <= 460 && offsetDist < 5.0) return;

      const jx = edge.tNW + offsetDist + (rand() - 0.5) * 1.5;
      const jz = edge.z + (rand() - 0.5) * 2.0;
      treePoints.push({
        x: jx,
        z: jz,
        scale: 0.85 + rand() * 0.4
      });
    });
  }

  // 2. Sabuk Pohon Tepi Tenggara (SE / -X)
  for (let s = 5; s < totalLength - 5; s += 5.0) {
    if (s >= 280 && s <= 375) continue;

    const edge = getRoadEdgesAtS(s);
    [-2.8, -6.5, -10.2].forEach((offsetDist) => {
      if (s >= 430 && s <= 460 && Math.abs(offsetDist) < 5.0) return;

      const jx = edge.tSE + offsetDist + (rand() - 0.5) * 1.5;
      const jz = edge.z + (rand() - 0.5) * 2.0;
      treePoints.push({
        x: jx,
        z: jz,
        scale: 0.85 + rand() * 0.4
      });
    });
  }

  // 3. Tanah Terbuka Reklamasi Cokelat di Sisi SE (s in [275, 380])
  const soilMat = new THREE.MeshStandardMaterial({
    color: 0x8a6240,
    roughness: 0.94,
    metalness: 0.05
  });

  const soilGeo = new THREE.PlaneGeometry(16.0, 105.0);
  const soilMesh = new THREE.Mesh(soilGeo, soilMat);
  soilMesh.rotation.x = -Math.PI / 2;
  const edgeSoilMid = getRoadEdgesAtS(327.5);
  soilMesh.position.set(edgeSoilMid.tSE - 8.0, yRoad - 0.02, z0 + 327.5);
  soilMesh.receiveShadow = true;
  treeGroup.add(soilMesh);

  treeGroup.add(createRoadsideTreeBand(treePoints, yRoad));

  // 4. Pohon Median Parsial (Hanya s: 10 s/d 210)
  for (let s = 14.0; s <= 210.0; s += 14.0) {
    const tree = createMedianTree({
      scale: 0.95 + Math.sin(s * 0.1) * 0.15,
      rotationY: (s * 0.5) % (Math.PI * 2)
    });
    tree.position.set(0, yRoad + 0.11, z0 + s);
    treeGroup.add(tree);
  }

  return treeGroup;
}
