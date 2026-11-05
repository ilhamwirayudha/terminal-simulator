import * as THREE from 'three';
import { createMainGateCanopy } from '../../../assets/buildings/createMainGateCanopy.js';
import { createGateBooth } from '../../../assets/infrastructure/createGateBooth.js';
import { createBoomBarrier } from '../../../assets/infrastructure/createBoomBarrier.js';
import { FRAME, MAIN_GATE_CONFIG } from './GeoMainGate.js';

/**
 * ==============================================================================
 * Sub-Area: Kompleks Kanopi & Gerbang Main Gate (Z ≈ 1603 s/d 1623)
 * ==============================================================================
 */
export function createSubAreaKanopiMainGate() {
  const gateGroup = new THREE.Group();
  gateGroup.name = 'subarea_kanopi_main_gate';

  const { z0, yRoad } = FRAME;
  const centerZ = z0 + MAIN_GATE_CONFIG.sCenter;

  // 1. Kanopi Utama Barrel-Vault
  const canopy = createMainGateCanopy({
    xStart: MAIN_GATE_CONFIG.canopyXMin,
    xEnd: MAIN_GATE_CONFIG.canopyXMax,
    centerZ: centerZ,
    length: MAIN_GATE_CONFIG.sLength,
    height: MAIN_GATE_CONFIG.canopyHeight,
    clearance: MAIN_GATE_CONFIG.clearanceHeight,
    yRoad: yRoad
  });
  gateGroup.add(canopy);

  // 2. Gardu Booth & Palang Barrier Sisi NW (Inbound)
  const inIslands = [1.3, 7.0, 13.0, 19.0, 25.0];
  inIslands.forEach((ix, idx) => {
    const booth = createGateBooth({
      x: ix,
      z: centerZ,
      yRoad: yRoad,
      islandLength: 14.0,
      hasSignalGreen: idx % 2 === 0
    });
    gateGroup.add(booth);
  });

  const inLanes = [4.0, 10.0, 16.0, 22.0, 28.0];
  inLanes.forEach((lx, idx) => {
    const barrier = createBoomBarrier({
      x: lx + 2.4,
      z: centerZ + 2.5,
      yRoad: yRoad,
      armLength: 4.2,
      isOpen: idx === 1 || idx === 3,
      pointsNegativeX: true
    });
    gateGroup.add(barrier);
  });

  // 3. Gardu Booth & Palang Barrier Sisi SE (Outbound)
  const outIslands = [-1.3, -7.0, -13.0, -19.0, -25.0];
  outIslands.forEach((ix, idx) => {
    const booth = createGateBooth({
      x: ix,
      z: centerZ,
      yRoad: yRoad,
      islandLength: 14.0,
      hasSignalGreen: idx === 1 || idx === 3
    });
    gateGroup.add(booth);
  });

  const outLanes = [-4.0, -10.0, -16.0, -22.0, -28.0];
  outLanes.forEach((lx, idx) => {
    const barrier = createBoomBarrier({
      x: lx - 2.4,
      z: centerZ - 2.5,
      yRoad: yRoad,
      armLength: 4.2,
      isOpen: idx === 0 || idx === 2,
      pointsNegativeX: false
    });
    gateGroup.add(barrier);
  });

  return gateGroup;
}
