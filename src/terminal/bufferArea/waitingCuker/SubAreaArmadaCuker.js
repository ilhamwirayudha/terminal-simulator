import * as THREE from 'three';
import { CUKER_PARKING_CONFIG } from './GeoCuker.js';

/**
 * ==============================================================================
 * Sub-Area: Armada Dump Truck Curah Kering (~32 CBM / Tronton 10 Roda)
 * ==============================================================================
 * SPESIFIKASI VOLUME CURAH KERING REALISTIS (Pembanding Kontainer 20ft):
 * - Kapasitas volume bak: 7.4m x 2.46m x 1.75m ≈ 31.85 CBM (Standar 22.7 - 45.3 CBM)
 * - Panjang bak (7.4m) lebih panjang dan proporsional dibanding kontainer 20ft (6.06m)
 * - Sasis baja tronton heavy-duty 9.8m dengan 10 roda (tandem ganda belakang)
 * - Silinder hidrolik teleskopik krom, pelindung kanopi kabin, dan rusuk penguat samping
 *
 * TATA LETAK PARKIR RAPI TERSUSUN (2 Sisi Berhadapan, Menghadap Barat Laut & Tenggara):
 * - Barisan Barat Laut (X = 125.0m): 8 Truk menghadap Tenggara (-X, ke dalam lapangan)
 * - Barisan Tenggara Seberang (X = 102.0m): 8 Truk menghadap Barat Laut (+X, berhadapan rapi)
 * - Lorong sirkulasi tengah selebar 13.2m bebas rintangan
 * - Bersih total dari tiang lampu, marka chevron fiktif, dan mobil penumpang
 */
export function createSubAreaArmadaCuker() {
  const vehiclesGroup = new THREE.Group();
  vehiclesGroup.name = 'subarea_cuker_vehicles';

  const yGround = 1.565;

  // Material Bersama (Shared Materials) untuk Efisiensi GPU
  const tireMat = new THREE.MeshStandardMaterial({ color: 0x18181b, roughness: 0.9, metalness: 0.1 });
  const rimMat = new THREE.MeshStandardMaterial({ color: 0x94a3b8, roughness: 0.4, metalness: 0.7 });
  const chassisMat = new THREE.MeshStandardMaterial({ color: 0x1f2428, roughness: 0.8, metalness: 0.3 });
  const hydraulicMat = new THREE.MeshStandardMaterial({ color: 0xe2e8f0, roughness: 0.2, metalness: 0.9 }); // Silinder hidrolik krom
  const windshieldMat = new THREE.MeshStandardMaterial({ color: 0x0f172a, roughness: 0.1, metalness: 0.9 });
  const headlightMat = new THREE.MeshBasicMaterial({ color: 0xffffff });
  const taillightMat = new THREE.MeshBasicMaterial({ color: 0xef4444 });
  const cargoCoalMat = new THREE.MeshStandardMaterial({ color: 0x181a1b, roughness: 0.98, metalness: 0.05 });
  const cargoSandMat = new THREE.MeshStandardMaterial({ color: 0xa89f91, roughness: 0.95, metalness: 0.05 });

  // Palet Warna Bak Terbuka Dump Truck Curah Kering
  const bedColors = [
    0x15803d, // Hijau tua bak dump truck
    0x166534, // Hijau lumut
    0x1e3a1e, // Hijau militer gelap
    0x78350f, // Cokelat karoseri
    0x854d0e, // Cokelat karamel tua
    0x374151, // Abu-abu arang
    0xc2410c  // Oranye bata
  ];

  // Palet Warna Kabin Dump Truck
  const cabColors = [
    0xffffff, // Putih Hino / Fuso
    0xd97706, // Kuning tambang
    0xdc2626, // Merah ekspedisi
    0x2563eb, // Biru Pelindo
    0x15803d, // Hijau armada
    0x475569  // Abu-abu gelap
  ];

  /**
   * Generator Model 3D Dump Truck Curah Kering (~32 CBM / Tronton 10 Roda)
   */
  const createHeavyDumpTruck = (cabColorHex, bedColorHex, cargoType = 'coal') => {
    const truck = new THREE.Group();

    const cabMat = new THREE.MeshStandardMaterial({ color: cabColorHex, roughness: 0.45, metalness: 0.3 });
    const bedMat = new THREE.MeshStandardMaterial({ color: bedColorHex, roughness: 0.65, metalness: 0.25 });

    const specs = CUKER_PARKING_CONFIG.TRUCK_SPECS;

    // 1. Sasis Baja Tronton Utama (Panjang 9.8m)
    const chassis = new THREE.Mesh(new THREE.BoxGeometry(2.35, 0.45, specs.chassisLength), chassisMat);
    chassis.position.set(0, 0.70, 0);
    chassis.castShadow = true;
    truck.add(chassis);

    // 2. Roda Heavy Duty (1 Pasang Depan + 2 Pasang Tandem Ganda Belakang = 10 Roda)
    const wheelGeo = new THREE.CylinderGeometry(0.55, 0.55, 0.38, 14);
    wheelGeo.rotateZ(Math.PI / 2);
    const rimGeo = new THREE.CylinderGeometry(0.34, 0.34, 0.39, 10);
    rimGeo.rotateZ(Math.PI / 2);

    // Roda Depan (Kemudi - Tunggal di kiri dan kanan)
    [-1.15, 1.15].forEach((wx) => {
      const w = new THREE.Mesh(wheelGeo, tireMat);
      w.position.set(wx, 0.55, 3.8);
      w.castShadow = true;
      const r = new THREE.Mesh(rimGeo, rimMat);
      r.position.set(wx, 0.55, 3.8);
      truck.add(w);
      truck.add(r);
    });

    // Roda Belakang Tandem (Roda Ganda/Dual Wheels: 2 roda per sisi pada 2 poros)
    const addRearDuals = (zPos) => {
      [-1.28, -0.92, 0.92, 1.28].forEach((wx) => {
        const w = new THREE.Mesh(wheelGeo, tireMat);
        w.position.set(wx, 0.55, zPos);
        w.castShadow = true;
        const r = new THREE.Mesh(rimGeo, rimMat);
        r.position.set(wx, 0.55, zPos);
        truck.add(w);
        truck.add(r);
      });
    };

    addRearDuals(-2.2); // Poros Tandem Belakang 1
    addRearDuals(-3.6); // Poros Tandem Belakang 2

    // 3. Kabin Heavy Duty Truk (Menghadap arah +Z secara lokal)
    const cabLower = new THREE.Mesh(new THREE.BoxGeometry(specs.cabWidth, 1.2, specs.cabLength), cabMat);
    cabLower.position.set(0, 1.5, 3.6);
    cabLower.castShadow = true;
    truck.add(cabLower);

    const cabUpper = new THREE.Mesh(new THREE.BoxGeometry(specs.cabWidth * 0.98, 1.1, specs.cabLength * 0.88), cabMat);
    cabUpper.position.set(0, 2.65, 3.5);
    cabUpper.castShadow = true;
    truck.add(cabUpper);

    // Kaca Depan & Samping
    const windshield = new THREE.Mesh(new THREE.PlaneGeometry(2.15, 0.85), windshieldMat);
    windshield.position.set(0, 2.7, 4.45);
    truck.add(windshield);

    [-1.21, 1.21].forEach((sx) => {
      const sideWin = new THREE.Mesh(new THREE.PlaneGeometry(0.9, 0.75), windshieldMat);
      sideWin.rotation.y = sx > 0 ? Math.PI / 2 : -Math.PI / 2;
      sideWin.position.set(sx, 2.7, 3.6);
      truck.add(sideWin);
    });

    // Bumper Depan, Radiator Grill & Lampu Utama
    const bumper = new THREE.Mesh(new THREE.BoxGeometry(2.48, 0.5, 0.45), chassisMat);
    bumper.position.set(0, 0.70, 4.7);
    truck.add(bumper);

    const grill = new THREE.Mesh(new THREE.PlaneGeometry(1.7, 0.7), chassisMat);
    grill.position.set(0, 1.45, 4.66);
    truck.add(grill);

    [-0.88, 0.88].forEach((hx) => {
      const hl = new THREE.Mesh(new THREE.BoxGeometry(0.35, 0.20, 0.05), headlightMat);
      hl.position.set(hx, 0.75, 4.93);
      truck.add(hl);
    });

    // Knalpot Vertikal di Belakang Kabin
    const exhaust = new THREE.Mesh(new THREE.CylinderGeometry(0.09, 0.09, 2.2), rimMat);
    exhaust.position.set(1.10, 2.5, 2.3);
    truck.add(exhaust);

    // 4. Silinder Hidrolik Teleskopik Hoist (Antara Kabin dan Bak)
    const hydraulicCylinder = new THREE.Mesh(new THREE.CylinderGeometry(0.18, 0.22, 2.4, 12), hydraulicMat);
    hydraulicCylinder.position.set(0, 2.2, 2.25);
    truck.add(hydraulicCylinder);

    // 5. Bak Terbuka Curah Kering (~32 CBM: 7.4m x 2.46m x 1.75m)
    const bedZCenter = -1.15; // Pusat bak muatan di atas sasis

    // Lantai Dasar Bak
    const bedFloor = new THREE.Mesh(new THREE.BoxGeometry(specs.bedWidth, 0.25, specs.bedLength), bedMat);
    bedFloor.position.set(0, 1.25, bedZCenter);
    bedFloor.castShadow = true;
    truck.add(bedFloor);

    // Dinding Samping Kiri & Kanan Bak (Tinggi 1.75m)
    [-specs.bedWidth / 2, specs.bedWidth / 2].forEach((bx) => {
      const sideWall = new THREE.Mesh(new THREE.BoxGeometry(0.12, specs.bedHeight, specs.bedLength), bedMat);
      sideWall.position.set(bx, 1.25 + specs.bedHeight / 2, bedZCenter);
      sideWall.castShadow = true;
      truck.add(sideWall);

      // Tulang Rusuk Penguat Bak (Vertical Stiffeners)
      for (let ri = -3; ri <= 3; ri++) {
        const rib = new THREE.Mesh(new THREE.BoxGeometry(0.06, specs.bedHeight, 0.10), bedMat);
        rib.position.set(bx > 0 ? bx + 0.06 : bx - 0.06, 1.25 + specs.bedHeight / 2, bedZCenter + ri * 1.1);
        truck.add(rib);
      }
    });

    // Dinding Belakang (Tailgate)
    const tailgate = new THREE.Mesh(new THREE.BoxGeometry(specs.bedWidth, specs.bedHeight, 0.14), bedMat);
    tailgate.position.set(0, 1.25 + specs.bedHeight / 2, bedZCenter - specs.bedLength / 2);
    tailgate.castShadow = true;
    truck.add(tailgate);

    // Dinding Depan & Kanopi Pelindung Kabin (Headboard Protector Overhang)
    const frontWall = new THREE.Mesh(new THREE.BoxGeometry(specs.bedWidth, specs.bedHeight, 0.14), bedMat);
    frontWall.position.set(0, 1.25 + specs.bedHeight / 2, bedZCenter + specs.bedLength / 2);
    truck.add(frontWall);

    const cabProtector = new THREE.Mesh(new THREE.BoxGeometry(specs.bedWidth, 0.14, 1.5), bedMat);
    cabProtector.position.set(0, 1.25 + specs.bedHeight + 0.07, bedZCenter + specs.bedLength / 2 + 0.7);
    cabProtector.castShadow = true;
    truck.add(cabProtector);

    // Lampu Belakang (Taillights)
    [-1.0, 1.0].forEach((tx) => {
      const tl = new THREE.Mesh(new THREE.BoxGeometry(0.28, 0.14, 0.05), taillightMat);
      tl.position.set(tx, 0.70, bedZCenter - specs.bedLength / 2 - 0.1);
      truck.add(tl);
    });

    // 6. Muatan Curah Kering Menjulang di Dalam Bak (~32 CBM)
    const cargoMat = (cargoType === 'coal') ? cargoCoalMat : cargoSandMat;
    const cargoPile = new THREE.Mesh(new THREE.BoxGeometry(specs.bedWidth * 0.92, specs.bedHeight * 0.65, specs.bedLength * 0.94), cargoMat);
    cargoPile.position.set(0, 1.25 + specs.bedHeight * 0.5, bedZCenter);
    cargoPile.castShadow = true;
    truck.add(cargoPile);

    return truck;
  };

  // ----------------------------------------------------------------------------
  // 1. Sisi 1: Barisan Barat Laut (8 Truk Menghadap TENGGARA / -X)
  // X = 125.0m, Z: 1056m s/d 1126m
  // ----------------------------------------------------------------------------
  const rowNW = CUKER_PARKING_CONFIG.ROW_NW;
  const zStepNW = (rowNW.zMax - rowNW.zMin) / (rowNW.count - 1);

  for (let i = 0; i < rowNW.count; i++) {
    const pz = rowNW.zMin + i * zStepNW;
    const cabCol = cabColors[i % cabColors.length];
    const bedCol = bedColors[i % bedColors.length];
    const cargo = (i % 2 === 0) ? 'coal' : 'sand';

    const truck = createHeavyDumpTruck(cabCol, bedCol, cargo);
    truck.rotation.y = rowNW.facing; // Menghadap Tenggara (-X)
    truck.position.set(rowNW.x, yGround, pz);
    vehiclesGroup.add(truck);
  }

  // ----------------------------------------------------------------------------
  // 2. Sisi 2: Barisan Tenggara Seberang (8 Truk Menghadap BARAT LAUT / +X)
  // X = 102.0m, Z: 1056m s/d 1126m (Berhadapan rapi dengan Sisi 1)
  // ----------------------------------------------------------------------------
  const rowSE = CUKER_PARKING_CONFIG.ROW_SE;
  const zStepSE = (rowSE.zMax - rowSE.zMin) / (rowSE.count - 1);

  for (let i = 0; i < rowSE.count; i++) {
    const pz = rowSE.zMin + i * zStepSE;
    const cabCol = cabColors[(i + 3) % cabColors.length];
    const bedCol = bedColors[(i + 2) % bedColors.length];
    const cargo = (i % 2 === 0) ? 'sand' : 'coal';

    const truck = createHeavyDumpTruck(cabCol, bedCol, cargo);
    truck.rotation.y = rowSE.facing; // Menghadap Barat Laut (+X)
    truck.position.set(rowSE.x, yGround, pz);
    vehiclesGroup.add(truck);
  }

  return vehiclesGroup;
}
