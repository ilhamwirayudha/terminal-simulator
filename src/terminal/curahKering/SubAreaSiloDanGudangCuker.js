import * as THREE from 'three';
import { createGrainSilo } from '../../assets/industrial/createGrainSilo.js';
import { createFlatStorageComplex } from '../../assets/industrial/createFlatStorageWarehouse.js';
import {
  createConveyorGallery,
  createTransferTower
} from '../../assets/industrial/createConveyorGallery.js';
import { createRoadsideTreeBand } from '../../assets/nature/createRoadsideTreeBand.js';
import {
  CUKER_TERMINAL_BOUNDS,
  BULK_AREA_CONFIG
} from './GeoCurahKering.js';

/**
 * ==============================================================================
 * Sub-Area: Silo Storage 10x6000T, Twin Flat Storage & 2 Lane Conveyor
 * ==============================================================================
 * Sesuai Sketsa AutoCAD & Citra Satelit (BULK AREA Z: 2259.1 s/d 2482.1):
 * 1. 10 Silo Jagung (2x5) + 2 Overhead Conveyor Gallery + Elevator Towers
 * 2. Gudang Kembar Flat Storage (Phase #1 & Phase #2, 2 x 54m x 140m+)
 * 3. Jembatan Konveyor Selatan & Utara + Menara Transfer TT-3
 * 4. 2 Lane Conveyor dari TT-3 ke tepi jalan (-7.192015, 112.678909 s/d -7.192524, 112.679425)
 * 5. Sabuk pepohonan internal di bagian belakang atas gudang (X: 318 s/d 356)
 */
export function createSubAreaSiloDanGudangCuker() {
  const bulkMainGroup = new THREE.Group();
  bulkMainGroup.name = 'subarea_silo_dan_gudang_cuker';

  const { yPavement } = CUKER_TERMINAL_BOUNDS;
  const {
    siloCluster,
    flatStorage,
    transferTowerTT3,
    conveyorLanesToBerth
  } = BULK_AREA_CONFIG;

  // ----------------------------------------------------------------------------
  // 1. Kompleks 10 Silo Penyimpanan Jagung (2 Kolom x 5 Baris = 10 Unit)
  // ----------------------------------------------------------------------------
  const siloGroup = new THREE.Group();
  siloGroup.name = 'bulk_silo_storage_10x6000t';

  // Alas beton apron silo (Z: 2266 s/d 2330, X: 108 s/d 272)
  const siloPadMat = new THREE.MeshStandardMaterial({
    color: 0x64748b,
    roughness: 0.85
  });
  const siloPad = new THREE.Mesh(new THREE.BoxGeometry(164.0, 0.25, 64.0), siloPadMat);
  siloPad.position.set(190.0, yPavement + 0.125, 2298.5);
  siloPad.receiveShadow = true;
  siloGroup.add(siloPad);

  const { colZ, rowXStart, rowStepX, numRows, radius, cylinderHeight, roofHeight } = siloCluster;

  colZ.forEach((cz) => {
    for (let r = 0; r < numRows; r++) {
      const rx = rowXStart + r * rowStepX;
      const silo = createGrainSilo({
        radius,
        cylinderHeight,
        roofHeight,
        plinthHeight: 1.4,
        numRings: 6
      });
      silo.position.set(rx, yPavement, cz);
      siloGroup.add(silo);
    }
  });

  // 2 Jalur Overhead Conveyor Gallery di Atas Puncak Masing-masing Kolom 5 Silo
  const topSiloY = yPavement + 1.4 + cylinderHeight + roofHeight + 1.2;
  const xFirstSilo = rowXStart - radius * 0.7;
  const xLastSilo = rowXStart + (numRows - 1) * rowStepX + radius * 0.7;

  colZ.forEach((cz) => {
    siloGroup.add(
      createConveyorGallery({
        start: { x: 106.0, y: topSiloY, z: cz },
        end: { x: xLastSilo, y: topSiloY, z: cz },
        width: 3.0,
        height: 2.8,
        withSupports: false
      })
    );

    // Menara Elevator di Ujung Selatan Kolom Silo (X = 106.0)
    const elevTower = createTransferTower({
      widthX: 7.5,
      widthZ: 7.5,
      height: topSiloY - yPavement + 2.5
    });
    elevTower.position.set(106.0, yPavement, cz);
    siloGroup.add(elevTower);
  });

  // Jembatan Penghubung Antar 2 Kolom Silo di Puncak
  [rowXStart, rowXStart + 2 * rowStepX, rowXStart + 4 * rowStepX].forEach((bx) => {
    siloGroup.add(
      createConveyorGallery({
        start: { x: bx, y: topSiloY - 0.5, z: colZ[0] },
        end: { x: bx, y: topSiloY - 0.5, z: colZ[1] },
        width: 2.2,
        height: 2.2,
        withSupports: false
      })
    );
  });

  bulkMainGroup.add(siloGroup);

  // ----------------------------------------------------------------------------
  // 2. Gudang Kembar Flat Storage (Phase #1 & Phase #2)
  // ----------------------------------------------------------------------------
  const flatWarehouse = createFlatStorageComplex({
    lengthX: flatStorage.lengthX,
    singleWidthZ: flatStorage.singleWidthZ,
    centerGapZ: flatStorage.centerGapZ,
    sideBayWidthZ: flatStorage.sideBayWidthZ,
    wallHeight: flatStorage.wallHeight,
    roofPeakHeight: flatStorage.roofPeakHeight
  });
  flatWarehouse.position.set(flatStorage.centerX, yPavement, flatStorage.centerZ);
  bulkMainGroup.add(flatWarehouse);

  // ----------------------------------------------------------------------------
  // 3. Sistem Jembatan Konveyor Utama & Transfer Tower TT-3
  // ----------------------------------------------------------------------------
  const convNetworkGroup = new THREE.Group();
  convNetworkGroup.name = 'bulk_conveyor_network';

  // A. Jembatan Konveyor Melintang Selatan (X = 103.5, menghubungkan Silo & Flat Storage ke TT-3)
  convNetworkGroup.add(
    createConveyorGallery({
      start: { x: 103.5, y: 15.5, z: 2280.0 },
      end: { x: 103.5, y: 15.5, z: transferTowerTT3.z },
      width: 4.2,
      height: 3.4,
      withSupports: true,
      supportSpacing: 26.0,
      groundY: yPavement
    })
  );

  // Jembatan Konveyor Kedua Sejajar di Selatan Flat Storage (X = 109.0, Z: 2313.5 s/d 2469.5)
  convNetworkGroup.add(
    createConveyorGallery({
      start: { x: 109.0, y: 19.5, z: 2313.5 },
      end: { x: 109.0, y: 22.0, z: transferTowerTT3.z },
      width: 3.4,
      height: 3.0,
      withSupports: true,
      supportSpacing: 28.0,
      groundY: yPavement
    })
  );

  // B. Jembatan Konveyor Melintang Utara di Belakang Flat Storage (X = 307.5, Z: 2336 s/d 2465)
  convNetworkGroup.add(
    createConveyorGallery({
      start: { x: 307.5, y: 18.5, z: 2336.0 },
      end: { x: 307.5, y: 18.5, z: 2465.0 },
      width: 3.4,
      height: 3.0,
      withSupports: true,
      supportSpacing: 30.0,
      groundY: yPavement
    })
  );

  // Menara Transfer Kecil di Belakang Flat Storage
  const rearTower = createTransferTower({ widthX: 8.5, widthZ: 8.5, height: 22.0 });
  rearTower.position.set(307.5, yPavement, 2466.0);
  convNetworkGroup.add(rearTower);

  // C. Menara Utama Transfer Tower TT-3 (Sudut Kanan-Bawah Flat Storage: X = 103.5, Z = 2469.5)
  const tt3Mesh = createTransferTower({
    widthX: transferTowerTT3.widthX,
    widthZ: transferTowerTT3.widthZ,
    height: transferTowerTT3.height
  });
  tt3Mesh.position.set(transferTowerTT3.x, yPavement, transferTowerTT3.z);
  convNetworkGroup.add(tt3Mesh);

  // ----------------------------------------------------------------------------
  // 4. DUA LANE CONVEYOR MENUJU DERMAGA CURAH KERING
  //    Koordinat GPS: -7.192015, 112.678909 s/d -7.192524, 112.679425
  //    Membentang dari TT-3 (X = 103.5) ke tepi jalan (X = 21.4) di Z = 2466.8 & 2472.2
  // ----------------------------------------------------------------------------
  const { startX, endX, laneZ, elevationY } = conveyorLanesToBerth;
  const laneLenX = startX - endX;
  const laneMidX = (startX + endX) / 2;
  const laneMidZ = (laneZ[0] + laneZ[1]) / 2;

  // Saluran/Koridor Bawah Conveyor (tampak seperti saluran memanjang di citra satelit)
  const trenchMat = new THREE.MeshStandardMaterial({
    color: 0x2d353d,
    roughness: 0.9
  });
  const trenchWallMat = new THREE.MeshStandardMaterial({
    color: 0x94a3b8,
    roughness: 0.7
  });

  const trenchBed = new THREE.Mesh(
    new THREE.BoxGeometry(laneLenX, 0.18, 9.2),
    trenchMat
  );
  trenchBed.position.set(laneMidX, yPavement + 0.09, laneMidZ);
  trenchBed.receiveShadow = true;
  convNetworkGroup.add(trenchBed);

  [-4.4, 4.4].forEach((dz) => {
    const sideWall = new THREE.Mesh(
      new THREE.BoxGeometry(laneLenX, 0.85, 0.35),
      trenchWallMat
    );
    sideWall.position.set(laneMidX, yPavement + 0.42, laneMidZ + dz);
    sideWall.castShadow = true;
    convNetworkGroup.add(sideWall);
  });

  // 2 Jalur Jembatan Conveyor Layang Sejajar (Lane 1 & Lane 2)
  laneZ.forEach((lz) => {
    convNetworkGroup.add(
      createConveyorGallery({
        start: { x: startX, y: elevationY, z: lz },
        end: { x: endX, y: elevationY, z: lz },
        width: 3.1,
        height: 2.9,
        withSupports: true,
        supportSpacing: 18.0,
        groundY: yPavement
      })
    );
  });

  // Menara Penyangga Ujung Jalan (Junction Tower di X = 25.5 sebelum menyeberang jalan)
  const roadEdgeTower = createTransferTower({
    widthX: 8.5,
    widthZ: 9.6,
    height: elevationY + 3.5
  });
  roadEdgeTower.position.set(25.5, yPavement, laneMidZ);
  convNetworkGroup.add(roadEdgeTower);

  bulkMainGroup.add(convNetworkGroup);

  // ----------------------------------------------------------------------------
  // 5. Sabuk Pepohonan Internal di Halaman Belakang Atas (X: 318 s/d 356)
  //    Sesuai citra satelit: pohon hijau rapat di atas Flat Storage & sebagian atas Silo
  // ----------------------------------------------------------------------------
  let seed = 887766554;
  const rand = () => {
    seed = (seed * 1664525 + 1013904223) % 4294967296;
    return seed / 4294967296;
  };

  const internalTrees = [];
  // Area hijau atas Flat Storage (Z: 2350 s/d 2475, X: 318 s/d 356)
  for (let z = 2352.0; z <= 2474.0; z += 6.2) {
    for (let x = 319.0; x <= 355.0; x += 6.2) {
      if (rand() < 0.22) continue;
      internalTrees.push({
        x: x + (rand() - 0.5) * 2.5,
        z: z + (rand() - 0.5) * 2.5,
        scale: 0.8 + rand() * 0.4
      });
    }
  }
  // Klaster pohon di sebelah kiri-atas Silo (Z: 2262 s/d 2285, X: 295 s/d 355)
  for (let z = 2263.0; z <= 2284.0; z += 5.8) {
    for (let x = 295.0; x <= 355.0; x += 5.8) {
      if (rand() < 0.25) continue;
      internalTrees.push({
        x: x + (rand() - 0.5) * 2.2,
        z: z + (rand() - 0.5) * 2.2,
        scale: 0.8 + rand() * 0.35
      });
    }
  }

  bulkMainGroup.add(createRoadsideTreeBand(internalTrees, yPavement));

  return bulkMainGroup;
}
