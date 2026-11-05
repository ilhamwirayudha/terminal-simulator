import * as THREE from 'three';
import {
  CONTAINER_SPECS,
  CONTAINER_PALETTE,
  createInstancedContainerBlock
} from '../../assets/containers/createContainer.js';
import { createRTGCrane } from '../../assets/equipment/createYardCranes.js';
import {
  CY_BOUNDS,
  EAST_RTG_CONFIG
} from './GeoContainerYard.js';

/**
 * ==============================================================================
 * Sub-Area: Koridor Reefer, Peralatan & Blok Timur + 2 Unit RTG Crane
 *           (Zona Kanan CY: Z = 2442.5 s/d 2469.0 | X = -33.0 s/d -642.5)
 * ==============================================================================
 * Sesuai Koordinat Ground Truth (-7.19307, 112.6796 s/d -7.196885, 112.683548)
 * dan Gambar Detail (media_1793903903544_dcfacd7a.png & media_1793903922081_0f7ee248.png):
 * 1. Sektor Utara (X: -35 s/d -265): Kontainer Reefer putih, reefer plug racks & peralatan
 * 2. Sektor Tengah (X ~ -335): Gedung Gardu / Substasiun Reefer
 * 3. Sektor Selatan (X: -360 s/d -640): Tumpukan padat kontainer warna-warni
 * 4. 2 Unit RTG (Rubber Tyred Gantry) Crane yang beroperasi di koridor ini
 */
export function createSubAreaBlokTimurRTG() {
  const eastGroup = new THREE.Group();
  eastGroup.name = 'subarea_blok_timur_rtg';

  const { yPavement } = CY_BOUNDS;
  const { zMin, zMax, xMax, xMin } = EAST_RTG_CONFIG;

  const corridorWidthZ = zMax - zMin; // 26.5m
  const corridorMidZ = (zMin + zMax) / 2; // 2455.75m
  const corridorLenX = Math.abs(xMax - xMin); // 609.5m
  const corridorMidX = (xMax + xMin) / 2;

  // Material Pelataran Koridor Timur, Rak Reefer & Gedung Gardu
  const corridorPadMat = new THREE.MeshStandardMaterial({
    color: 0x767d85,
    roughness: 0.80
  });
  const rackSteelMat = new THREE.MeshStandardMaterial({
    color: 0x475569,
    roughness: 0.5,
    metalness: 0.65
  });
  const subWallMat = new THREE.MeshStandardMaterial({
    color: 0xcbd5e1,
    roughness: 0.6
  });
  const subRoofMat = new THREE.MeshStandardMaterial({
    color: 0x64748b,
    roughness: 0.5
  });

  // 1. Pelataran Beton Koridor Timur (26.5m x 609.5m)
  const corridorPad = new THREE.Mesh(
    new THREE.PlaneGeometry(corridorLenX, corridorWidthZ),
    corridorPadMat
  );
  corridorPad.rotation.x = -Math.PI / 2;
  corridorPad.position.set(corridorMidX, yPavement + 0.012, corridorMidZ);
  corridorPad.receiveShadow = true;
  eastGroup.add(corridorPad);

  // 2. Gedung Gardu Listrik / Substasiun di Tengah Koridor (X = -335.0, Z = 2456.0)
  // Terlihat jelas sebagai bangunan beratap abu-abu bergaris di media_1793903903544_dcfacd7a.png
  const subBldg = new THREE.Mesh(new THREE.BoxGeometry(15.0, 6.2, 18.0), subWallMat);
  subBldg.position.set(-335.0, yPavement + 3.1, corridorMidZ);
  subBldg.castShadow = true;
  subBldg.receiveShadow = true;
  eastGroup.add(subBldg);

  const subRoof = new THREE.Mesh(new THREE.BoxGeometry(16.0, 0.45, 19.0), subRoofMat);
  subRoof.position.set(-335.0, yPavement + 6.4, corridorMidZ);
  subRoof.castShadow = true;
  eastGroup.add(subRoof);

  // 3. Rak Colokan Listrik Reefer (Reefer Gantry Walks) di Sektor Utara
  [-72.0, -108.0, -142.0, -178.0, -212.0].forEach((rx) => {
    const rackWalk = new THREE.Mesh(
      new THREE.BoxGeometry(1.4, 5.2, corridorWidthZ - 5.0),
      rackSteelMat
    );
    rackWalk.position.set(rx, yPavement + 2.6, corridorMidZ);
    rackWalk.castShadow = true;
    eastGroup.add(rackWalk);
  });

  // 4. Tempatkan 2 Unit RTG Crane di Koridor Timur (X = -118.0 & X = -468.0)
  [-118.0, -468.0].forEach((rtgX) => {
    const rtg = createRTGCrane({
      spanZ: 23.6,
      clearHeight: 15.4,
      legSpanX: 7.8
    });
    rtg.position.set(rtgX, yPavement, corridorMidZ);
    eastGroup.add(rtg);
  });

  // 5. Penataan Kontainer Reefer Putih & Kontainer Blok Timur
  const spec = CONTAINER_SPECS.TEU_20FT;
  const contH = spec.height;
  const reeferWhite = new THREE.Color(0xf8fafc);
  const reeferLightGrey = new THREE.Color(0xe2e8f0);

  let seed = 334411229;
  const rand = () => {
    seed = (seed * 1664525 + 1013904223) % 4294967296;
    return seed / 4294967296;
  };

  const nwSeContainers = []; // Panjang 6.06m searah X (vertikal di gambar)
  const swNeContainers = []; // Panjang 6.06m searah Z (horizontal di gambar)

  // A. Sektor Utara: Klaster Kontainer Reefer Putih Menghadap NW-SE (X: -48 s/d -205)
  const reeferClustersX = [-54.0, -64.0, -82.0, -96.0, -118.0, -132.0, -152.0, -166.0, -190.0, -202.0];
  reeferClustersX.forEach((cx) => {
    for (let z = zMin + 3.2; z <= zMax - 3.2; z += 3.1) {
      if (rand() < 0.28) continue;
      const tiers = 1 + Math.floor(rand() * 3);
      for (let t = 0; t < tiers; t++) {
        nwSeContainers.push({
          x: cx,
          y: yPavement + contH / 2 + t * contH,
          z,
          color: rand() < 0.8 ? reeferWhite : reeferLightGrey
        });
      }
    }
  });

  // B. Sektor Tengah-Atas (X: -222 s/d -295): Kontainer Warna & Reefer Menghadap SW-NE
  for (let x = -222.0; x >= -295.0; x -= 3.2) {
    if (rand() < 0.25) continue;
    [corridorMidZ - 5.5, corridorMidZ + 3.5].forEach((cz) => {
      if (rand() < 0.3) return;
      const tiers = 1 + Math.floor(rand() * 3);
      const col = CONTAINER_PALETTE[Math.floor(rand() * CONTAINER_PALETTE.length)];
      for (let t = 0; t < tiers; t++) {
        swNeContainers.push({
          x,
          y: yPavement + contH / 2 + t * contH,
          z: cz,
          color: col
        });
      }
    });
  }

  // C. Sektor Selatan (X: -368 s/d -636): Tumpukan Padat Kontainer Warna-warni
  //    Sesuai bagian bawah media_1793903903544_dcfacd7a.png & media_1793903922081_0f7ee248.png
  for (let x = -368.0; x >= -636.0; x -= 3.0) {
    // Sisakan sedikit celah antar sub-klaster di sekitar X = -445 dan X = -530
    if ((x < -438.0 && x > -452.0) || (x < -522.0 && x > -536.0)) continue;
    if (rand() < 0.14) continue;

    [corridorMidZ - 6.8, corridorMidZ, corridorMidZ + 6.8].forEach((cz) => {
      if (rand() < 0.22) return;
      const tiers = 1 + Math.floor(rand() * 4);
      const domCol = CONTAINER_PALETTE[Math.floor(rand() * CONTAINER_PALETTE.length)];
      for (let t = 0; t < tiers; t++) {
        swNeContainers.push({
          x,
          y: yPavement + contH / 2 + t * contH,
          z: cz,
          color: rand() < 0.75 ? domCol : CONTAINER_PALETTE[Math.floor(rand() * CONTAINER_PALETTE.length)]
        });
      }
    });
  }

  eastGroup.add(createInstancedContainerBlock(nwSeContainers, { orientedCrosswise: true }));
  eastGroup.add(createInstancedContainerBlock(swNeContainers, { orientedCrosswise: false }));

  return eastGroup;
}
