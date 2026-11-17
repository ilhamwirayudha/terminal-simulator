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


// 6. Air Laut Teluk & Tanggul Pesisir (Shared)
export const seaWaterMat = new THREE.MeshStandardMaterial({
  color: 0x1360a3,
  roughness: 0.22,
  metalness: 0.14,
  name: 'mat_sea_water'
});

export const coastalEmbankmentMat = new THREE.MeshStandardMaterial({
  color: 0x43533a,
  roughness: 0.94,
  metalness: 0.03,
  name: 'mat_coastal_embankment'
});

/**
 * Membangun BufferGeometry tanggul jalur koridor tanpa triangulasi earcut & tanpa
 * sisi bawah yang tak pernah terlihat, sekaligus menggabungkan beberapa strip
 * ke dalam 1 draw call.
 *
 * @param {Array<Array<{xLeft: number, xRight: number, z: number}>>} bands
 * @param {number} topY
 * @param {number} bottomY
 */
export function createEmbankmentGeometry(bands, topY = 1.591, bottomY = -0.2) {
  const positions = [];
  const pushTri = (ax, ay, az, bx, by, bz, cx, cy, cz) => {
    positions.push(ax, ay, az, bx, by, bz, cx, cy, cz);
  };

  bands.forEach((pts) => {
    if (!pts || pts.length < 2) return;

    // Tutup ujung awal (-Z)
    const pStart = pts[0];
    pushTri(pStart.xLeft, topY, pStart.z, pStart.xLeft, bottomY, pStart.z, pStart.xRight, bottomY, pStart.z);
    pushTri(pStart.xLeft, topY, pStart.z, pStart.xRight, bottomY, pStart.z, pStart.xRight, topY, pStart.z);

    for (let i = 0; i < pts.length - 1; i++) {
      const p0 = pts[i];
      const p1 = pts[i + 1];

      // Permukaan atas (+Y)
      pushTri(p0.xLeft, topY, p0.z, p0.xRight, topY, p0.z, p1.xRight, topY, p1.z);
      pushTri(p0.xLeft, topY, p0.z, p1.xRight, topY, p1.z, p1.xLeft, topY, p1.z);

      // Dinding sisi kiri (+X / NW)
      pushTri(p0.xLeft, topY, p0.z, p1.xLeft, topY, p1.z, p1.xLeft, bottomY, p1.z);
      pushTri(p0.xLeft, topY, p0.z, p1.xLeft, bottomY, p1.z, p0.xLeft, bottomY, p0.z);

      // Dinding sisi kanan (-X / SE)
      pushTri(p0.xRight, topY, p0.z, p0.xRight, bottomY, p0.z, p1.xRight, bottomY, p1.z);
      pushTri(p0.xRight, topY, p0.z, p1.xRight, bottomY, p1.z, p1.xRight, topY, p1.z);
    }

    // Tutup ujung akhir (+Z)
    const pEnd = pts[pts.length - 1];
    pushTri(pEnd.xLeft, topY, pEnd.z, pEnd.xRight, topY, pEnd.z, pEnd.xRight, bottomY, pEnd.z);
    pushTri(pEnd.xLeft, topY, pEnd.z, pEnd.xRight, bottomY, pEnd.z, pEnd.xLeft, bottomY, pEnd.z);
  });

  const geo = new THREE.BufferGeometry();
  geo.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
  geo.computeVertexNormals();
  return geo;
}
