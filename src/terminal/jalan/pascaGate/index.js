import * as THREE from 'three';
import { createSubAreaJalanPascaGate } from './SubAreaJalanPascaGate.js';
import { createSubAreaMedianPohon } from './SubAreaMedianPohon.js';
import { createSubAreaMedianKontainer } from './SubAreaMedianKontainer.js';
import { createSubAreaPohonPascaGate } from './SubAreaPohonPascaGate.js';

/**
 * ==============================================================================
 * Area: Jalan - Sub-Klaster: Koridor Pasca Main Gate (Z: 1699 s/d 2436)
 * ==============================================================================
 * Menggabungkan:
 * 1. Aspal Jalan 4 In (NW) + 4 Out (SE) & Marka
 * 2. Pulau Median Pohon & Pos Operasional (s: 571.5 s/d 814.0)
 * 3. Pulau Median Kontainer 20ft 1-4 Tier (s: 906.0 s/d 1208.0)
 * 4. Sabuk Pohon Tepi NW (stop s=949.6) & SE (stop s=668.3)
 */
export function createPascaGateArea() {
  const pascaGroup = new THREE.Group();
  pascaGroup.name = 'sub_jalan_pasca_gate';

  pascaGroup.add(createSubAreaJalanPascaGate());
  pascaGroup.add(createSubAreaMedianPohon());
  pascaGroup.add(createSubAreaMedianKontainer());
  pascaGroup.add(createSubAreaPohonPascaGate());

  return pascaGroup;
}
