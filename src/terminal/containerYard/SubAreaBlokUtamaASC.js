import * as THREE from 'three';
import { whiteLineMat } from '../../assets/materials/roadMaterials.js';
import {
  CONTAINER_SPECS,
  CONTAINER_PALETTE,
  createInstancedContainerBlock
} from '../../assets/containers/createContainer.js';
import {
  createASCCrane,
  createASCRailTrack
} from '../../assets/equipment/createYardCranes.js';
import {
  createContainerTruck,
  TRUCK_CAB_MATERIALS,
  TRUCK_CONTAINER_MATERIALS
} from '../../assets/vehicles/createContainerTruck.js';
import {
  CY_BOUNDS,
  ASC_BLOCKS_CONFIG
} from './GeoContainerYard.js';

/**
 * ==============================================================================
 * Sub-Area: 10 Baris Blok Utama CY + 20 Unit ASC Crane + Area Transfer R/D
 *           (Bagian 2 Zona Tengah: Z = 2054.5 s/d 2413.8 | X = -140.5 s/d -475.5)
 * ==============================================================================
 * Sesuai Koordinat Ground Truth (-7.196262, 112.677859 s/d -7.198358, 112.680025)
 * dan Gambar Detail (media_1793903597671_57e75bdf.png):
 * - 10 Baris Blok Kontainer (jarak antar baris 33.5m)
 * - Masing-masing baris memiliki 2 ASC Crane (Landside di Barat & Seaside di Timur)
 * - Ujung Barat (Z: 2055-2092) & Ujung Timur (Z: 2376-2413) adalah tempat parkir/transfer
 *   truk untuk kegiatan Receiving/Delivery (6 lajur per blok)
 * - Tiap blok terbagi menjadi Seksi Barat (20 bay) & Seksi Timur (20 bay) dengan celah
 *   tengah di Z = 2234.0
 */
export function createSubAreaBlokUtamaASC() {
  const ascBlocksGroup = new THREE.Group();
  ascBlocksGroup.name = 'subarea_10_blok_utama_asc';

  const { yPavement } = CY_BOUNDS;
  const {
    zMin,
    zMax,
    xMax,
    numBlocks,
    blockPitchX,
    rowsPerBlock,
    ascRailSpanX,
    westTransferZMin,
    westTransferZMax,
    westStackZMin,
    westStackZMax,
    eastStackZMin,
    eastStackZMax,
    eastTransferZMin,
    eastTransferZMax,
    baysPerHalf
  } = ASC_BLOCKS_CONFIG;

  const spec = CONTAINER_SPECS.TEU_20FT;
  const contWidthX = spec.width;   // 2.44m (searah X)
  const contHeight = spec.height;  // 2.59m
  const contLengthZ = spec.length; // 6.06m (searah Z)
  const rowStepX = 2.82;           // Jarak antar row kontainer di dalam blok
  const bayStepZ = (westStackZMax - westStackZMin) / baysPerHalf; // 6.80m per bay

  const totalRailLenZ = zMax - zMin - 3.0; // 356.3m
  const railCenterZ = (zMin + zMax) / 2;   // 2234.15m

  // Material Lantai Blok & Kisi Transfer R/D
  const blockApronMat = new THREE.MeshStandardMaterial({
    color: 0x626971,
    roughness: 0.84
  });
  const transferPadMat = new THREE.MeshStandardMaterial({
    color: 0x868e96,
    roughness: 0.78
  });

  // Geometry gabungan untuk seluruh garis marka slot putih & lajur parkir truk R/D (1 Draw Call)
  const slotLinePositions = [];
  const addWhiteRectXZ = (cx, cz, wX, wZ) => {
    const hx = wX / 2;
    const hz = wZ / 2;
    const yL = yPavement + 0.022;
    slotLinePositions.push(
      cx - hx, yL, cz - hz,
      cx + hx, yL, cz - hz,
      cx + hx, yL, cz + hz,

      cx - hx, yL, cz - hz,
      cx + hx, yL, cz + hz,
      cx - hx, yL, cz + hz
    );
  };

  let seed = 112233445;
  const rand = () => {
    seed = (seed * 1664525 + 1013904223) % 4294967296;
    return seed / 4294967296;
  };

  const containerInstances = [];

  // Posisi Z variatif untuk 2 ASC (Landside & Seaside) di masing-masing dari 10 baris blok
  // Sesuai sebaran crane hijau di citra satelit media_1793903597671_57e75bdf.png
  const ascPositionsZ = [
    [2145.0, 2318.0], // Blok 1
    [2098.0, 2362.0], // Blok 2
    [2112.0, 2378.0], // Blok 3
    [2088.0, 2345.0], // Blok 4
    [2078.0, 2325.0], // Blok 5
    [2064.0, 2385.0], // Blok 6
    [2092.0, 2338.0], // Blok 7
    [2085.0, 2392.0], // Blok 8
    [2155.0, 2298.0], // Blok 9
    [2168.0, 2358.0]  // Blok 10
  ];

  for (let bIdx = 0; bIdx < numBlocks; bIdx++) {
    // Pusat X dari baris blok ke-(bIdx + 1)
    const blockCenterX = xMax - blockPitchX / 2 - bIdx * blockPitchX;

    // 1. Alas Perkerasan Blok & Rel Baja ASC
    const blockPad = new THREE.Mesh(
      new THREE.PlaneGeometry(ascRailSpanX - 0.8, westStackZMax - westStackZMin + (eastStackZMax - eastStackZMin) + 8.0),
      blockApronMat
    );
    blockPad.rotation.x = -Math.PI / 2;
    blockPad.position.set(blockCenterX, yPavement + 0.01, railCenterZ);
    blockPad.receiveShadow = true;
    ascBlocksGroup.add(blockPad);

    const railTrack = createASCRailTrack({
      spanX: ascRailSpanX,
      lengthZ: totalRailLenZ
    });
    railTrack.position.set(blockCenterX, yPavement, railCenterZ);
    ascBlocksGroup.add(railTrack);

    // 2. Area Parkir / Transfer Truk R/D di Ujung Barat & Ujung Timur ASC
    [
      (westTransferZMin + westTransferZMax) / 2,
      (eastTransferZMin + eastTransferZMax) / 2
    ].forEach((tz) => {
      const tPad = new THREE.Mesh(
        new THREE.PlaneGeometry(ascRailSpanX - 1.2, 36.0),
        transferPadMat
      );
      tPad.rotation.x = -Math.PI / 2;
      tPad.position.set(blockCenterX, yPavement + 0.012, tz);
      tPad.receiveShadow = true;
      ascBlocksGroup.add(tPad);

      // Marka 6 lajur parkir truk R/D di ujung blok
      for (let r = 0; r <= rowsPerBlock; r++) {
        const lineX = blockCenterX - (rowsPerBlock * rowStepX) / 2 + r * rowStepX;
        addWhiteRectXZ(lineX, tz, 0.16, 28.0);
      }

      // Parkirkan beberapa CTT Truck di lajur transfer R/D ujung ASC (seperti di citra satelit)
      for (let r = 0; r < rowsPerBlock; r++) {
        if (rand() < 0.78) continue;
        const laneCenterX = blockCenterX - ((rowsPerBlock - 1) * rowStepX) / 2 + r * rowStepX;
        const isWestEnd = tz < 2200.0;
        const loadList = ['ONE_40FT', 'TWO_20FT', 'ONE_20FT', 'EMPTY'];
        const cabList = [TRUCK_CAB_MATERIALS.WHITE, TRUCK_CAB_MATERIALS.BLUE, TRUCK_CAB_MATERIALS.RED, TRUCK_CAB_MATERIALS.YELLOW];
        const contList = [TRUCK_CONTAINER_MATERIALS.BLUE, TRUCK_CONTAINER_MATERIALS.RED, TRUCK_CONTAINER_MATERIALS.GREEN, TRUCK_CONTAINER_MATERIALS.ORANGE];

        const rdTruck = createContainerTruck({
          loadType: loadList[Math.floor(rand() * loadList.length)],
          cabMat: cabList[Math.floor(rand() * cabList.length)],
          matCont1: contList[Math.floor(rand() * contList.length)],
          matCont2: contList[Math.floor(rand() * contList.length)]
        });
        // Di ujung barat: kabin menghadap keluar ke Jalan Barat (-Z -> rotation.y = PI)
        // Di ujung timur: kabin menghadap keluar ke Jalan Timur (+Z -> rotation.y = 0)
        rdTruck.rotation.y = isWestEnd ? Math.PI : 0;
        rdTruck.position.set(laneCenterX, yPavement, tz);
        ascBlocksGroup.add(rdTruck);
      }
    });

    // 3. Tempatkan 2 Unit ASC Crane (1 Landside di Barat, 1 Seaside di Timur)
    const [zAscWest, zAscEast] = ascPositionsZ[bIdx];
    [zAscWest, zAscEast].forEach((az) => {
      const ascCrane = createASCCrane({
        spanX: ascRailSpanX,
        clearHeight: 16.5,
        legWidthZ: 8.2
      });
      ascCrane.position.set(blockCenterX, yPavement, az);
      ascBlocksGroup.add(ascCrane);
    });

    // 4. Marka Garis Putih Ground Slot & Tumpukan Kontainer di Seksi Barat & Seksi Timur
    [westStackZMin, eastStackZMin].forEach((halfStartZ, halfIdx) => {
      for (let bay = 0; bay < baysPerHalf; bay++) {
        const bayCenterZ = halfStartZ + bayStepZ / 2 + bay * bayStepZ;

        // Garis putih batas antar bay (terlihat jelas di slot yang kosong pada citra satelit)
        addWhiteRectXZ(blockCenterX, bayCenterZ - bayStepZ / 2 + 0.2, rowsPerBlock * rowStepX, 0.18);

        for (let row = 0; row < rowsPerBlock; row++) {
          const rowCenterX = blockCenterX - ((rowsPerBlock - 1) * rowStepX) / 2 + row * rowStepX;

          // Pola kepadatan kontainer mengikuti foto satelit (Blok 5 sedikit lebih renggang di tengah,
          // Blok 6-10 sangat padat di tengah)
          let fillProb = 0.68;
          if (bIdx === 4 && bay >= 6 && bay <= 14) {
            fillProb = 0.22; // Blok 5 tengah agak lowong sesuai Gambar 1
          } else if (bIdx >= 5) {
            fillProb = 0.78; // Blok 6-10 sangat padat
          } else if (halfIdx === 0 && bay >= 13) {
            fillProb = 0.35; // Area tengah blok 1-4 sedikit berongga sesuai Gambar 1 & 2
          }

          if (rand() < fillProb) {
            const rTier = rand();
            const tiers = rTier > 0.68 ? 4 : rTier > 0.35 ? 3 : rTier > 0.12 ? 2 : 1;
            const domColor = CONTAINER_PALETTE[Math.floor(rand() * CONTAINER_PALETTE.length)];

            for (let t = 0; t < tiers; t++) {
              const py = yPavement + contHeight / 2 + t * contHeight;
              const col = rand() < 0.76 ? domColor : CONTAINER_PALETTE[Math.floor(rand() * CONTAINER_PALETTE.length)];
              containerInstances.push({
                x: rowCenterX,
                y: py,
                z: bayCenterZ,
                color: col
              });
            }
          }
        }
      }
    });
  }

  // Render seluruh garis marka slot & lajur transfer truk dengan 1 BufferGeometry
  if (slotLinePositions.length > 0) {
    const lineGeo = new THREE.BufferGeometry();
    lineGeo.setAttribute('position', new THREE.Float32BufferAttribute(slotLinePositions, 3));
    lineGeo.computeVertexNormals();
    const lineMesh = new THREE.Mesh(lineGeo, whiteLineMat);
    ascBlocksGroup.add(lineMesh);
  }

  // Render seluruh ribuan kontainer di 10 blok utama dengan 1 InstancedMesh (60 FPS)
  ascBlocksGroup.add(
    createInstancedContainerBlock(containerInstances, { orientedCrosswise: false })
  );

  return ascBlocksGroup;
}
