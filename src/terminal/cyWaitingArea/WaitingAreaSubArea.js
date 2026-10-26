import * as THREE from 'three';
import { BLOCKS_CONFIG } from './CyWaitingGeo.js';

/**
 * ==============================================================================
 * Sub-Area: Truck Waiting Area (Slot A & B - 66 Slot Jajar Genjang)
 * Sesuai Citra Satelit Nyata:
 * - Waiting Area A: 33 Slot Truk Miring Jajar Genjang (Menghadap Barat / Container Yard)
 * - Waiting Area B: 33 Slot Truk Miring Jajar Genjang (Menghadap Selatan / Shelter)
 * - Panjang garis kuning WA-A sama persis dengan WA-B (Z: 798.5m s/d 985.5m)
 * - Truk statis terparkir proporsional cukup untuk 2 kontainer 20ft:
 *   Variasi: Kosong (chassis), 1x20ft, 2x20ft, dan 1x40ft
 * ==============================================================================
 */
export function createWaitingAreaSubArea() {
  const waGroup = new THREE.Group();
  waGroup.name = 'subarea_truck_waiting_area';

  const yGround = 1.568; // Rata mulus dengan aspal CY & pedestrian

  const slotLineMat = new THREE.MeshStandardMaterial({
    color: 0xf1f5f9, // Marka putih cerah
    roughness: 0.35,
    metalness: 0.1
  });

  const slotYellowMat = new THREE.MeshStandardMaterial({
    color: 0xfbbf24, // Marka kuning batas slot
    roughness: 0.35,
    metalness: 0.1
  });

  // Helper untuk membuat garis tebal marka berbentuk pita segi empat
  const createMarkingStrip = (x1, z1, x2, z2, width = 0.18, mat = slotLineMat) => {
    const dx = x2 - x1;
    const dz = z2 - z1;
    const len = Math.hypot(dx, dz);
    if (len < 0.001) return null;

    // Karena rotation.x = -Math.PI / 2 membalikkan sumbu Y lokal ke -Z dunia, gunakan -dz
    const angle = Math.atan2(dx, -dz);
    const stripGeo = new THREE.PlaneGeometry(width, len);
    const strip = new THREE.Mesh(stripGeo, mat);
    strip.rotation.x = -Math.PI / 2;
    strip.rotation.z = -angle;
    strip.position.set((x1 + x2) / 2, yGround + 0.008, (z1 + z2) / 2);
    return strip;
  };

  // ----------------------------------------------------------------------------
  // 1. WAITING AREA A (Baris Luar / Dekat CY): 33 Slot Truk
  // Menghadap Barat (Arah Container Yard / +X)
  // Panjang Garis Kuning Disesuaikan Sama Persis dengan WA-B (Z: 798.5 s/d 985.5)
  // ----------------------------------------------------------------------------
  const waA_count = 33;
  const waA_zStart = 798.5;
  const waA_zEnd = 985.5;
  const waA_dzStep = (waA_zEnd - waA_zStart) / waA_count; // ≈ 5.66m per slot
  const waA_xOuter = 68.6;
  const waA_xInner = 54.8;
  const waA_zSlant = 15.2;

  // Garis batas luar dan dalam WA-A (Panjang sama dengan WA-B)
  const lineA_outer = createMarkingStrip(waA_xOuter, waA_zStart, waA_xOuter, waA_zEnd, 0.22, slotYellowMat);
  const lineA_inner = createMarkingStrip(waA_xInner, waA_zStart + waA_zSlant, waA_xInner, waA_zEnd + waA_zSlant, 0.22, slotYellowMat);
  if (lineA_outer) waGroup.add(lineA_outer);
  if (lineA_inner) waGroup.add(lineA_inner);

  // 34 garis penyekat untuk 33 slot jajar genjang
  const slotCentersA = [];
  for (let i = 0; i <= waA_count; i++) {
    const zBase = waA_zStart + i * waA_dzStep;
    const x1 = waA_xOuter;
    const z1 = zBase;
    const x2 = waA_xInner;
    const z2 = zBase + waA_zSlant;

    const divider = createMarkingStrip(x1, z1, x2, z2, 0.16, slotLineMat);
    if (divider) waGroup.add(divider);

    if (i < waA_count) {
      const midZBase = zBase + waA_dzStep / 2;
      slotCentersA.push({
        x: (x1 + x2) / 2,
        z: midZBase + waA_zSlant / 2,
        // Menghadap ke arah BARAT (kabin mengarah ke xOuter = 68.6 / Container Yard)
        angle: Math.atan2(waA_xOuter - waA_xInner, -waA_zSlant)
      });
    }
  }

  // ----------------------------------------------------------------------------
  // 2. WAITING AREA B (Baris Dalam / Dekat Jalan): 33 Slot Truk
  // Menghadap Selatan (Arah Masuk / Shelter / -Z)
  // Panjang Garis Kuning: Z: 798.5 s/d 985.5
  // ----------------------------------------------------------------------------
  const waB_count = 33;
  const waB_zStart = 798.5;
  const waB_zEnd = 985.5;
  const waB_dzStep = (waB_zEnd - waB_zStart) / waB_count; // ≈ 5.66m per slot
  const waB_xOuter = 33.5;
  const waB_xInner = 47.5;
  const waB_zSlant = 15.2;

  const lineB_outer = createMarkingStrip(waB_xOuter, waB_zStart, waB_xOuter, waB_zEnd, 0.22, slotYellowMat);
  const lineB_inner = createMarkingStrip(waB_xInner, waB_zStart + waB_zSlant, waB_xInner, waB_zEnd + waB_zSlant, 0.22, slotYellowMat);
  if (lineB_outer) waGroup.add(lineB_outer);
  if (lineB_inner) waGroup.add(lineB_inner);

  // 34 garis penyekat untuk 33 slot jajar genjang
  const slotCentersB = [];
  for (let i = 0; i <= waB_count; i++) {
    const zBase = waB_zStart + i * waB_dzStep;
    const x1 = waB_xOuter;
    const z1 = zBase;
    const x2 = waB_xInner;
    const z2 = zBase + waB_zSlant;

    const divider = createMarkingStrip(x1, z1, x2, z2, 0.16, slotLineMat);
    if (divider) waGroup.add(divider);

    if (i < waB_count) {
      const midZBase = zBase + waB_dzStep / 2;
      slotCentersB.push({
        x: (x1 + x2) / 2,
        z: midZBase + waB_zSlant / 2,
        // Menghadap ke arah SELATAN (kabin mengarah ke -Z / Shelter)
        angle: Math.atan2(waB_xOuter - waB_xInner, -waB_zSlant)
      });
    }
  }

  // ----------------------------------------------------------------------------
  // 3. Model Truk Kontainer Statis Fleksibel (Cukup Muat 2x20ft atau 1x40ft)
  // Mendukung Variasi:
  // - 'EMPTY': Chassis flatbed kosong tanpa kontainer
  // - 'ONE_20FT': Membawa 1 kontainer 20ft
  // - 'TWO_20FT': Membawa 2 kontainer 20ft (berbeda warna / shipping line)
  // - 'ONE_40FT': Membawa 1 kontainer 40ft
  // ----------------------------------------------------------------------------
  const cabGreenMat = new THREE.MeshStandardMaterial({ color: 0x15803d, roughness: 0.5 });
  const cabRedMat = new THREE.MeshStandardMaterial({ color: 0xb91c1c, roughness: 0.5 });
  const cabWhiteMat = new THREE.MeshStandardMaterial({ color: 0xf8fafc, roughness: 0.4 });
  const cabYellowMat = new THREE.MeshStandardMaterial({ color: 0xd97706, roughness: 0.5 });
  const chassisMat = new THREE.MeshStandardMaterial({ color: 0x1f2937, roughness: 0.8 });
  const wheelMat = new THREE.MeshStandardMaterial({ color: 0x111827, roughness: 0.9 });
  const glassMat = new THREE.MeshStandardMaterial({ color: 0x0f172a, roughness: 0.2 });

  // Material Kontainer Berbagai Shipping Lines
  const contBlueMat = new THREE.MeshStandardMaterial({ color: 0x1d4ed8, roughness: 0.5 }); // Maersk / CMA CGM
  const contOrangeMat = new THREE.MeshStandardMaterial({ color: 0xc2410c, roughness: 0.5 }); // Hapag Lloyd
  const contGreenMat = new THREE.MeshStandardMaterial({ color: 0x047857, roughness: 0.5 }); // Evergreen
  const contGreyMat = new THREE.MeshStandardMaterial({ color: 0x94a3b8, roughness: 0.5 }); // Yang Ming
  const contRedMat = new THREE.MeshStandardMaterial({ color: 0x991b1b, roughness: 0.5 }); // K-Line / ONE
  const contWhiteMat = new THREE.MeshStandardMaterial({ color: 0xf1f5f9, roughness: 0.4 }); // Reefer

  const createParkedTruck = ({
    loadType = 'ONE_40FT',
    cabMat = cabWhiteMat,
    matCont1 = contBlueMat,
    matCont2 = contOrangeMat
  } = {}) => {
    const truck = new THREE.Group();

    // -------------------------------------------------------------------------
    // A. TRAILER GANDENGAN (Semi-Trailer Flatbed Chassis): Panjang 12.4m
    // Khusus memuat 2x kontainer 20ft atau 1x kontainer 40ft
    // -------------------------------------------------------------------------
    const trailerBedGeo = new THREE.BoxGeometry(2.46, 0.35, 12.40);
    const trailerBed = new THREE.Mesh(trailerBedGeo, chassisMat);
    trailerBed.position.set(0, 0.75, -1.80); // Rentang Z: -8.00 s/d +4.40
    trailerBed.castShadow = true;
    truck.add(trailerBed);

    // Bumper belakang trailer & lampu rem
    const rearBumperGeo = new THREE.BoxGeometry(2.46, 0.22, 0.15);
    const rearBumper = new THREE.Mesh(rearBumperGeo, chassisMat);
    rearBumper.position.set(0, 0.45, -7.95);
    truck.add(rearBumper);

    const brakeLightMat = new THREE.MeshStandardMaterial({ color: 0xdc2626, emissive: 0x991b1b, roughness: 0.3 });
    [-1.0, 1.0].forEach((lx) => {
      const bl = new THREE.Mesh(new THREE.BoxGeometry(0.35, 0.12, 0.05), brakeLightMat);
      bl.position.set(lx, 0.45, -8.03);
      truck.add(bl);
    });

    // -------------------------------------------------------------------------
    // B. RODA (Total 12 Roda / 6 Gandar Realistis):
    // - 3 Gandar Belakang Trailer (Triple Axle): Z = -6.8, -5.6, -4.4
    // - 2 Gandar Belakang Traktor (Tandem Axle): Z = +3.3, +4.5
    // - 1 Gandar Depan Traktor (Steer Axle):     Z = +7.1
    // -------------------------------------------------------------------------
    const wheelGeo = new THREE.CylinderGeometry(0.50, 0.50, 0.35, 14);
    const trailerAxles = [-6.8, -5.6, -4.4];
    const tractorRearAxles = [3.3, 4.5];
    const tractorFrontAxle = [7.1];

    [...trailerAxles, ...tractorRearAxles, ...tractorFrontAxle].forEach((wz) => {
      [-1.15, 1.15].forEach((wx) => {
        const wheel = new THREE.Mesh(wheelGeo, wheelMat);
        wheel.rotation.z = Math.PI / 2;
        wheel.position.set(wx, 0.50, wz);
        truck.add(wheel);
      });
    });

    // -------------------------------------------------------------------------
    // C. KEPALA TRUK (Prime Mover / Tractor Unit): Terletak di DEPAN Trailer
    // Sasis Traktor & Gandengan Terhubung Fifth Wheel Kingpin
    // -------------------------------------------------------------------------
    const tractorChassisGeo = new THREE.BoxGeometry(1.90, 0.40, 4.80);
    const tractorChassis = new THREE.Mesh(tractorChassisGeo, chassisMat);
    tractorChassis.position.set(0, 0.70, 5.60); // Rentang Z: +3.20 s/d +8.00
    tractorChassis.castShadow = true;
    truck.add(tractorChassis);

    // Fifth Wheel Coupling (Piringan Gandengan Kingpin)
    const fifthWheelGeo = new THREE.CylinderGeometry(0.55, 0.55, 0.12, 16);
    const fifthWheel = new THREE.Mesh(fifthWheelGeo, chassisMat);
    fifthWheel.position.set(0, 0.94, 3.80);
    truck.add(fifthWheel);

    // Tangki Bahan Bakar Samping Traktor
    const fuelTankGeo = new THREE.CylinderGeometry(0.35, 0.35, 1.80, 12);
    const tankMat = new THREE.MeshStandardMaterial({ color: 0x64748b, metalness: 0.8, roughness: 0.3 });
    [-1.02, 1.02].forEach((tx) => {
      const tank = new THREE.Mesh(fuelTankGeo, tankMat);
      tank.rotation.x = Math.PI / 2;
      tank.position.set(tx, 0.65, 5.70);
      truck.add(tank);
    });

    // Kabin Kepala Truk (Berdiri Mandiri di Depan Kontainer, tidak tumpang tindih)
    const cabGeo = new THREE.BoxGeometry(2.45, 2.65, 2.65);
    const cab = new THREE.Mesh(cabGeo, cabMat);
    cab.position.set(0, 2.15, 6.375); // Rentang Z: +5.05 s/d +7.70
    cab.castShadow = true;
    truck.add(cab);

    // Kaca Depan Kabin (Windshield)
    const windshield = new THREE.Mesh(new THREE.BoxGeometry(2.20, 1.05, 0.10), glassMat);
    windshield.position.set(0, 2.45, 7.71);
    truck.add(windshield);

    // Kaca Samping Kabin (Kiri & Kanan)
    [-1.23, 1.23].forEach((sx) => {
      const sideWindow = new THREE.Mesh(new THREE.BoxGeometry(0.08, 0.75, 1.10), glassMat);
      sideWindow.position.set(sx, 2.45, 6.55);
      truck.add(sideWindow);
    });

    // Grille Radiator & Bumper Depan
    const grillMat = new THREE.MeshStandardMaterial({ color: 0x0f172a, roughness: 0.8 });
    const frontGrill = new THREE.Mesh(new THREE.BoxGeometry(1.60, 0.85, 0.10), grillMat);
    frontGrill.position.set(0, 1.40, 7.73);
    truck.add(frontGrill);

    const frontBumper = new THREE.Mesh(new THREE.BoxGeometry(2.45, 0.45, 0.30), chassisMat);
    frontBumper.position.set(0, 0.55, 7.85); // Ujung depan di Z = +8.00
    truck.add(frontBumper);

    // Lampu Depan (Headlights)
    const lightMat = new THREE.MeshStandardMaterial({ color: 0xfffbeb, emissive: 0xfef08a, roughness: 0.2 });
    [-0.95, 0.95].forEach((hx) => {
      const hl = new THREE.Mesh(new THREE.BoxGeometry(0.35, 0.16, 0.05), lightMat);
      hl.position.set(hx, 0.58, 8.01);
      truck.add(hl);
    });

    // Knalpot Vertikal di Belakang Kabin
    const exhaustMat = new THREE.MeshStandardMaterial({ color: 0x94a3b8, metalness: 0.9, roughness: 0.2 });
    const exhaust = new THREE.Mesh(new THREE.CylinderGeometry(0.08, 0.08, 2.80, 10), exhaustMat);
    exhaust.position.set(0.95, 2.50, 5.15);
    truck.add(exhaust);

    // -------------------------------------------------------------------------
    // D. KONFIGURASI MUATAN KONTAINER (Duduk di atas Sasis Trailer Gandengan)
    // -------------------------------------------------------------------------
    const contW = 2.44;
    const contH = 2.59;
    const contY = 0.925 + contH / 2; // Y di atas sasis trailer

    if (loadType === 'TWO_20FT') {
      // 2x Kontainer 20ft (masing-masing 6.06m)
      const c20Geo = new THREE.BoxGeometry(contW, contH, 6.06);

      // Kontainer Belakang (20ft) - Rentang Z: -7.88 s/d -1.82
      const cRear = new THREE.Mesh(c20Geo, matCont1);
      cRear.position.set(0, contY, -4.85);
      cRear.castShadow = true;
      truck.add(cRear);

      // Kontainer Depan (20ft) - Rentang Z: -1.70 s/d +4.36
      const cFront = new THREE.Mesh(c20Geo, matCont2);
      cFront.position.set(0, contY, 1.33);
      cFront.castShadow = true;
      truck.add(cFront);

    } else if (loadType === 'ONE_40FT') {
      // 1x Kontainer 40ft (panjang 12.19m) - Rentang Z: -7.86 s/d +4.33
      const c40Geo = new THREE.BoxGeometry(contW, contH, 12.19);
      const c40 = new THREE.Mesh(c40Geo, matCont1);
      c40.position.set(0, contY, -1.76);
      c40.castShadow = true;
      truck.add(c40);

    } else if (loadType === 'ONE_20FT') {
      // 1x Kontainer 20ft di BAGIAN DEPAN trailer (dekat kepala truk) - Rentang Z: -1.70 s/d +4.36
      const c20Geo = new THREE.BoxGeometry(contW, contH, 6.06);
      const cOne = new THREE.Mesh(c20Geo, matCont1);
      cOne.position.set(0, contY, 1.33);
      cOne.castShadow = true;
      truck.add(cOne);

      // Twistlocks di slot belakang trailer yang kosong (4 pin pengunci)
      const twistlockGeo = new THREE.BoxGeometry(0.18, 0.12, 0.18);
      const twistlockMat = new THREE.MeshStandardMaterial({ color: 0xd97706, roughness: 0.5 });
      [
        [-1.15, -7.85], [1.15, -7.85],
        [-1.15, -1.76], [1.15, -1.76]
      ].forEach(([tx, tz]) => {
        const lock = new THREE.Mesh(twistlockGeo, twistlockMat);
        lock.position.set(tx, 0.96, tz);
        truck.add(lock);
      });

    } else if (loadType === 'EMPTY') {
      // Twistlocks di atas flatbed kosong (8 pin pengunci kontainer)
      const twistlockGeo = new THREE.BoxGeometry(0.18, 0.12, 0.18);
      const twistlockMat = new THREE.MeshStandardMaterial({ color: 0xd97706, roughness: 0.5 });
      [
        [-1.15, -7.85], [1.15, -7.85],
        [-1.15, -1.76], [1.15, -1.76],
        [-1.15, 1.33],  [1.15, 1.33],
        [-1.15, 4.35],  [1.15, 4.35]
      ].forEach(([tx, tz]) => {
        const lock = new THREE.Mesh(twistlockGeo, twistlockMat);
        lock.position.set(tx, 0.96, tz);
        truck.add(lock);
      });
    }

    return truck;
  };

  // ----------------------------------------------------------------------------
  // 5. Penempatan Armada Truk Terparkir dengan Variasi Kontainer Lengkap
  // ----------------------------------------------------------------------------
  // WA-A (Menghadap ke arah BARAT):
  const parkedA = [
    { slotIdx: 3, loadType: 'TWO_20FT', cabMat: cabGreenMat, matCont1: contGreenMat, matCont2: contBlueMat },
    { slotIdx: 8, loadType: 'EMPTY', cabMat: cabRedMat },
    { slotIdx: 14, loadType: 'ONE_20FT', cabMat: cabWhiteMat, matCont1: contOrangeMat },
    { slotIdx: 20, loadType: 'ONE_40FT', cabMat: cabRedMat, matCont1: contRedMat },
    { slotIdx: 26, loadType: 'TWO_20FT', cabMat: cabYellowMat, matCont1: contBlueMat, matCont2: contWhiteMat }
  ];

  parkedA.forEach((p) => {
    if (slotCentersA[p.slotIdx]) {
      const s = slotCentersA[p.slotIdx];
      const truck = createParkedTruck(p);
      truck.position.set(s.x, yGround, s.z);
      truck.rotation.y = s.angle;
      waGroup.add(truck);
    }
  });

  // WA-B (Menghadap ke arah SELATAN):
  const parkedB = [
    { slotIdx: 4, loadType: 'EMPTY', cabMat: cabWhiteMat },
    { slotIdx: 9, loadType: 'TWO_20FT', cabMat: cabGreenMat, matCont1: contGreenMat, matCont2: contOrangeMat },
    { slotIdx: 15, loadType: 'ONE_40FT', cabMat: cabRedMat, matCont1: contGreyMat },
    { slotIdx: 21, loadType: 'ONE_20FT', cabMat: cabWhiteMat, matCont1: contBlueMat },
    { slotIdx: 27, loadType: 'TWO_20FT', cabMat: cabGreenMat, matCont1: contRedMat, matCont2: contGreenMat }
  ];

  parkedB.forEach((p) => {
    if (slotCentersB[p.slotIdx]) {
      const s = slotCentersB[p.slotIdx];
      const truck = createParkedTruck(p);
      truck.position.set(s.x, yGround, s.z);
      truck.rotation.y = s.angle;
      waGroup.add(truck);
    }
  });

  return waGroup;
}
