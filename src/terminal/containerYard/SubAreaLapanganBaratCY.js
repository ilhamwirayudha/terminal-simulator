import * as THREE from 'three';
import {
  CONTAINER_SPECS,
  CONTAINER_PALETTE,
  createInstancedContainerBlock
} from '../../assets/containers/createContainer.js';
import {
  CY_BOUNDS,
  WEST_EXPANSION_CONFIG
} from './GeoContainerYard.js';

/**
 * ==============================================================================
 * Sub-Area: Lapangan Ekspansi Barat CY (Z: 1836.3 s/d 1997.5 | X: -21.4 s/d -676.1)
 * ==============================================================================
 * Sesuai Koordinat Ground Truth (-7.196901, 112.675711 s/d -7.200058, 112.68108)
 * dan Citra Satelit Gambar 1:
 * 1. Sektor Atas (X: -21.4 s/d -145): Area staging material & 2 bangunan barak/gudang kecil
 * 2. Sektor Tengah (X: -145 s/d -395): Apron beton terang + jembatan akses ke Jalan Barat
 *    + 3 barisan tumpukan kontainer aktif
 * 3. Sektor Bawah (X: -395 s/d -676.1): Lahan tanah reklamasi kecokelatan & deretan kontainer
 *    di tepi Jalan Akses Barat
 */
export function createSubAreaLapanganBaratCY() {
  const westGroup = new THREE.Group();
  westGroup.name = 'subarea_lapangan_barat_cy';

  const { yPavement } = CY_BOUNDS;
  const { zMin, zMax } = WEST_EXPANSION_CONFIG;
  const zoneWidthZ = zMax - zMin; // 161.2m
  const zoneMidZ = (zMin + zMax) / 2;

  // Material Permukaan
  const stagingSoilMat = new THREE.MeshStandardMaterial({
    color: 0x6d655e,
    roughness: 0.92,
    metalness: 0.04
  });

  const lightApronConcreteMat = new THREE.MeshStandardMaterial({
    color: 0x9ca3af,
    roughness: 0.80,
    metalness: 0.06
  });

  const lowerReclamationMat = new THREE.MeshStandardMaterial({
    color: 0x856d58,
    roughness: 0.95,
    metalness: 0.03
  });

  const bldgWallMat = new THREE.MeshStandardMaterial({
    color: 0xe2e8f0,
    roughness: 0.6
  });

  const bldgRoofMat = new THREE.MeshStandardMaterial({
    color: 0xcbd5e1,
    roughness: 0.45
  });

  // 1. Permukaan Dasar Sektor Atas (X: -21.4 s/d -145.0)
  const upperLenX = 145.0 - 21.4;
  const upperMesh = new THREE.Mesh(
    new THREE.PlaneGeometry(upperLenX, zoneWidthZ - 2.0),
    stagingSoilMat
  );
  upperMesh.rotation.x = -Math.PI / 2;
  upperMesh.position.set(-(21.4 + 145.0) / 2, yPavement + 0.006, zoneMidZ);
  upperMesh.receiveShadow = true;
  westGroup.add(upperMesh);

  // 2 Bangunan Barak / Gudang Kecil di Sektor Atas (X = -132, Z = 1865 & 1925)
  [
    { x: -132.0, z: 1865.0, wX: 12.0, wZ: 18.0 },
    { x: -130.0, z: 1928.0, wX: 14.0, wZ: 24.0 }
  ].forEach((b) => {
    const bMesh = new THREE.Mesh(new THREE.BoxGeometry(b.wX, 4.5, b.wZ), bldgWallMat);
    bMesh.position.set(b.x, yPavement + 2.25, b.z);
    bMesh.castShadow = true;
    bMesh.receiveShadow = true;
    westGroup.add(bMesh);

    const rMesh = new THREE.Mesh(new THREE.BoxGeometry(b.wX + 0.8, 0.35, b.wZ + 0.8), bldgRoofMat);
    rMesh.position.set(b.x, yPavement + 4.65, b.z);
    westGroup.add(rMesh);
  });

  // 2. Apron Beton Terang Sektor Tengah (X: -148.0 s/d -392.0, Z: 1840.0 s/d 1986.0)
  const apronUpper = new THREE.Mesh(
    new THREE.BoxGeometry(74.0, 0.16, 144.0),
    lightApronConcreteMat
  );
  apronUpper.position.set(-185.0, yPavement + 0.08, 1913.0);
  apronUpper.receiveShadow = true;
  westGroup.add(apronUpper);

  const apronLower = new THREE.Mesh(
    new THREE.BoxGeometry(156.0, 0.16, 144.0),
    lightApronConcreteMat
  );
  apronLower.position.set(-312.0, yPavement + 0.08, 1913.0);
  apronLower.receiveShadow = true;
  westGroup.add(apronLower);

  // Jembatan/Ramp Penghubung Apron Beton ke Jalan Akses Barat (di X = -352.0, Z: 1985 s/d 2004)
  // Terlihat sangat jelas di Gambar 1 sebagai bukaan jalan beton terang menembus drainase
  const accessBridge = new THREE.Mesh(
    new THREE.BoxGeometry(22.0, 0.18, 22.0),
    lightApronConcreteMat
  );
  accessBridge.position.set(-352.0, yPavement + 0.09, 1994.5);
  accessBridge.receiveShadow = true;
  westGroup.add(accessBridge);

  // 3. Permukaan Tanah Reklamasi Sektor Bawah (X: -392.0 s/d -675.5)
  const lowerLenX = 675.5 - 392.0;
  const lowerMesh = new THREE.Mesh(
    new THREE.PlaneGeometry(lowerLenX, zoneWidthZ - 2.0),
    lowerReclamationMat
  );
  lowerMesh.rotation.x = -Math.PI / 2;
  lowerMesh.position.set(-(392.0 + 675.5) / 2, yPavement + 0.006, zoneMidZ);
  lowerMesh.receiveShadow = true;
  westGroup.add(lowerMesh);

  // 4. Tumpukan Kontainer di Apron Tengah & Tepi Jalan Akses Barat (Sesuai Gambar 1)
  const spec = CONTAINER_SPECS.TEU_20FT;
  const contH = spec.height;
  const yBase = yPavement + 0.16;

  let seed = 445566771;
  const rand = () => {
    seed = (seed * 1664525 + 1013904223) % 4294967296;
    return seed / 4294967296;
  };

  const swNeContainers = []; // Kontainer menghadap SW-NE (panjang 6.06m searah Z)

  // A. 3 Barisan Vertikal Tumpukan Kontainer di Apron Tengah (Z = 1852, 1906, 1966)
  const stackColsZ = [
    { z: 1852.0, xStart: -248.0, xEnd: -378.0, baysZ: 2 },
    { z: 1906.0, xStart: -265.0, xEnd: -365.0, baysZ: 3 },
    { z: 1964.0, xStart: -245.0, xEnd: -382.0, baysZ: 3 }
  ];

  stackColsZ.forEach((col) => {
    for (let x = col.xStart; x >= col.xEnd; x -= 2.85) {
      if (rand() < 0.18) continue;
      for (let b = 0; b < col.baysZ; b++) {
        if (rand() < 0.25) continue;
        const pz = col.z + (b - (col.baysZ - 1) / 2) * 6.5;
        const tiers = 1 + Math.floor(rand() * 3);
        const domCol = CONTAINER_PALETTE[Math.floor(rand() * CONTAINER_PALETTE.length)];
        for (let t = 0; t < tiers; t++) {
          swNeContainers.push({
            x,
            y: yBase + contH / 2 + t * contH,
            z: pz,
            color: rand() < 0.75 ? domCol : CONTAINER_PALETTE[Math.floor(rand() * CONTAINER_PALETTE.length)]
          });
        }
      }
    }
  });

  // B. Klaster Kecil di Apron Atas (X = -188, Z = 1895)
  for (let r = 0; r < 4; r++) {
    for (let b = 0; b < 2; b++) {
      const tiers = 1 + Math.floor(rand() * 2);
      const col = CONTAINER_PALETTE[Math.floor(rand() * CONTAINER_PALETTE.length)];
      for (let t = 0; t < tiers; t++) {
        swNeContainers.push({
          x: -182.0 - r * 2.8,
          y: yBase + contH / 2 + t * contH,
          z: 1892.0 + b * 6.5,
          color: col
        });
      }
    }
  }

  // C. Deretan Kontainer di Tepi Barat-Bawah Jalan Akses Barat (Z = 2010, X: -468 s/d -650)
  // Terlihat jelas di kiri-bawah Gambar 1 & Gambar 2
  for (let x = -468.0; x >= -648.0; x -= 3.2) {
    if (rand() < 0.22) continue;
    const tiers = 1 + Math.floor(rand() * 3);
    const col = CONTAINER_PALETTE[Math.floor(rand() * CONTAINER_PALETTE.length)];
    for (let t = 0; t < tiers; t++) {
      swNeContainers.push({
        x,
        y: yPavement + contH / 2 + t * contH,
        z: 2011.0 + (rand() < 0.4 ? 6.5 : 0),
        color: col
      });
    }
  }

  westGroup.add(createInstancedContainerBlock(swNeContainers, { orientedCrosswise: false }));

  return westGroup;
}
