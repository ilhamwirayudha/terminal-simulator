import * as THREE from 'three';
import { createSubAreaJalanMainGate } from './SubAreaJalanMainGate.js';
import { createSubAreaPohonTepi } from './SubAreaPohonTepi.js';
import { createSubAreaKanopiMainGate } from './SubAreaKanopiMainGate.js';

/**
 * ==============================================================================
 * Area: Jalan - Sub-Klaster: Main Gate (Z: 1168 s/d 1699)
 * ==============================================================================
 */
export function createMainGateArea() {
  const mainGateGroup = new THREE.Group();
  mainGateGroup.name = 'sub_jalan_main_gate';

  mainGateGroup.add(createSubAreaJalanMainGate());
  mainGateGroup.add(createSubAreaPohonTepi());
  mainGateGroup.add(createSubAreaKanopiMainGate());

  return mainGateGroup;
}
