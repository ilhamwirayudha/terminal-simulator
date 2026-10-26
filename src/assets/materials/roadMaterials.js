import * as THREE from 'three';

/**
 * ==============================================================================
 * Shared Road & Bridge PBR Materials Library
 * ==============================================================================
 * Centralized materials to prevent duplicate GPU allocations and ensure
 * unified visual fidelity across all road segments, bridges, and intersections.
 */

// 1. Aspal PBR
export const asphaltMat = new THREE.MeshStandardMaterial({
  color: 0x22262e, // Deep asphalt
  roughness: 0.88,
  metalness: 0.08,
  name: 'mat_road_asphalt'
});

export const containerShoulderMat = new THREE.MeshStandardMaterial({
  color: 0x2b303a, // Reinforced concrete-asphalt shoulder for heavy trucks
  roughness: 0.92,
  metalness: 0.05,
  name: 'mat_container_shoulder'
});

export const portRoadPavementMat = new THREE.MeshStandardMaterial({
  color: 0x22262e,
  roughness: 0.88,
  metalness: 0.08,
  side: THREE.DoubleSide,
  name: 'mat_port_road_pavement'
});

// 2. Beton Struktural (Jembatan, Pilar, Abutmen, Seawall)
export const bridgeConcreteMat = new THREE.MeshStandardMaterial({
  color: 0x64748b, // Slate 500 reinforced marine concrete
  roughness: 0.75,
  metalness: 0.2,
  name: 'mat_bridge_concrete'
});

export const pierConcreteMat = new THREE.MeshStandardMaterial({
  color: 0x475569, // Wet marine concrete for submerged piers
  roughness: 0.85,
  metalness: 0.15,
  name: 'mat_pier_concrete'
});

export const seawallMat = new THREE.MeshStandardMaterial({
  color: 0x8a929a,
  roughness: 0.85,
  name: 'mat_seawall'
});

export const flyoverConcreteMat = new THREE.MeshStandardMaterial({
  color: 0x94a3b8,
  roughness: 0.72,
  metalness: 0.2,
  name: 'mat_flyover_concrete'
});

export const flyoverPierMat = new THREE.MeshStandardMaterial({
  color: 0x64748b, // Darker concrete for pier columns & pier caps
  roughness: 0.82,
  metalness: 0.15,
  name: 'mat_flyover_pier'
});

// 3. Pembatas & Pengaman Jalan (Barrier, Guardrail, Baja)
export const barrierMat = new THREE.MeshStandardMaterial({
  color: 0x94a3b8,
  roughness: 0.5,
  metalness: 0.6,
  name: 'mat_road_barrier'
});

export const flyoverBarrierMat = new THREE.MeshStandardMaterial({
  color: 0xe2e8f0, // White-grey crash barrier wall for flyover
  roughness: 0.5,
  metalness: 0.3,
  name: 'mat_flyover_barrier'
});

export const steelMat = new THREE.MeshStandardMaterial({
  color: 0x334155,
  roughness: 0.4,
  metalness: 0.8,
  name: 'mat_structural_steel'
});

// 4. Kanstin & Median Jalan
export const curbConcreteGreyMat = new THREE.MeshStandardMaterial({
  color: 0x9ba3ab,
  roughness: 0.8,
  name: 'mat_curb_grey'
});

export const curbHazardWhiteMat = new THREE.MeshStandardMaterial({
  color: 0xf8fafc,
  roughness: 0.4,
  name: 'mat_curb_hazard_white'
});

export const curbHazardBlackMat = new THREE.MeshStandardMaterial({
  color: 0x1e293b,
  roughness: 0.8,
  name: 'mat_curb_hazard_black'
});

export const medianGrassMat = new THREE.MeshStandardMaterial({
  color: 0x3d6836,
  roughness: 0.9,
  name: 'mat_median_grass'
});

// 5. Marka Jalan
export const whiteLineMat = new THREE.MeshBasicMaterial({
  color: 0xf8fafc,
  side: THREE.DoubleSide,
  name: 'mat_marka_putih'
});

export const yellowLineMat = new THREE.MeshBasicMaterial({
  color: 0xfbbf24,
  side: THREE.DoubleSide,
  name: 'mat_marka_kuning'
});
