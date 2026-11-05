import * as THREE from 'three';

/**
 * ==============================================================================
 * Reusable Asset: Truk Kontainer / CTT Truck Standar (Prime Mover + 40ft Flatbed)
 * Diekstrak langsung dari standar pemilik proyek di waitingCY/SubAreaWaitingCY.js
 * ==============================================================================
 * Spesifikasi:
 * - Panjang total: 16.0m (Ujung belakang trailer Z = -8.00m s/d bumper depan Z = +8.00m)
 * - Lebar: 2.46m, 6 Gandar (12 Roda: 3 gandar trailer, 2 gandar belakang traktor, 1 depan)
 * - Varian muatan (loadType): 'ONE_40FT', 'TWO_20FT', 'ONE_20FT', 'EMPTY'
 */

export const TRUCK_CAB_MATERIALS = {
  WHITE: new THREE.MeshStandardMaterial({ color: 0xf8fafc, roughness: 0.4 }),
  GREEN: new THREE.MeshStandardMaterial({ color: 0x15803d, roughness: 0.5 }),
  RED: new THREE.MeshStandardMaterial({ color: 0xb91c1c, roughness: 0.5 }),
  YELLOW: new THREE.MeshStandardMaterial({ color: 0xd97706, roughness: 0.5 }),
  BLUE: new THREE.MeshStandardMaterial({ color: 0x0284c7, roughness: 0.45 })
};

export const TRUCK_CONTAINER_MATERIALS = {
  BLUE: new THREE.MeshStandardMaterial({ color: 0x1d4ed8, roughness: 0.5 }),   // Maersk / CMA CGM
  ORANGE: new THREE.MeshStandardMaterial({ color: 0xc2410c, roughness: 0.5 }), // Hapag Lloyd
  GREEN: new THREE.MeshStandardMaterial({ color: 0x047857, roughness: 0.5 }),  // Evergreen
  GREY: new THREE.MeshStandardMaterial({ color: 0x94a3b8, roughness: 0.5 }),   // Yang Ming
  RED: new THREE.MeshStandardMaterial({ color: 0x991b1b, roughness: 0.5 }),    // K-Line / ONE
  WHITE: new THREE.MeshStandardMaterial({ color: 0xf1f5f9, roughness: 0.4 })   // Reefer
};

const chassisMat = new THREE.MeshStandardMaterial({ color: 0x1f2937, roughness: 0.8 });
const wheelMat = new THREE.MeshStandardMaterial({ color: 0x111827, roughness: 0.9 });
const glassMat = new THREE.MeshStandardMaterial({ color: 0x0f172a, roughness: 0.2 });
const brakeLightMat = new THREE.MeshStandardMaterial({ color: 0xdc2626, emissive: 0x991b1b, roughness: 0.3 });
const tankMat = new THREE.MeshStandardMaterial({ color: 0x64748b, metalness: 0.8, roughness: 0.3 });
const grillMat = new THREE.MeshStandardMaterial({ color: 0x0f172a, roughness: 0.8 });
const lightMat = new THREE.MeshStandardMaterial({ color: 0xfffbeb, emissive: 0xfef08a, roughness: 0.2 });
const exhaustMat = new THREE.MeshStandardMaterial({ color: 0x94a3b8, metalness: 0.9, roughness: 0.2 });
const twistlockMat = new THREE.MeshStandardMaterial({ color: 0xd97706, roughness: 0.5 });

// Shared Geometries untuk efisiensi GPU
const trailerBedGeo = new THREE.BoxGeometry(2.46, 0.35, 12.40);
const rearBumperGeo = new THREE.BoxGeometry(2.46, 0.22, 0.15);
const brakeLightGeo = new THREE.BoxGeometry(0.35, 0.12, 0.05);
const wheelGeo = new THREE.CylinderGeometry(0.50, 0.50, 0.35, 14);
const tractorChassisGeo = new THREE.BoxGeometry(1.90, 0.40, 4.80);
const fifthWheelGeo = new THREE.CylinderGeometry(0.55, 0.55, 0.12, 16);
const fuelTankGeo = new THREE.CylinderGeometry(0.35, 0.35, 1.80, 12);
const cabGeo = new THREE.BoxGeometry(2.45, 2.65, 2.65);
const windshieldGeo = new THREE.BoxGeometry(2.20, 1.05, 0.10);
const sideWindowGeo = new THREE.BoxGeometry(0.08, 0.75, 1.10);
const frontGrillGeo = new THREE.BoxGeometry(1.60, 0.85, 0.10);
const frontBumperGeo = new THREE.BoxGeometry(2.45, 0.45, 0.30);
const headlightGeo = new THREE.BoxGeometry(0.35, 0.16, 0.05);
const exhaustGeo = new THREE.CylinderGeometry(0.08, 0.08, 2.80, 10);
const c20Geo = new THREE.BoxGeometry(2.44, 2.59, 6.06);
const c40Geo = new THREE.BoxGeometry(2.44, 2.59, 12.19);
const twistlockGeo = new THREE.BoxGeometry(0.18, 0.12, 0.18);

export function createContainerTruck({
  loadType = 'ONE_40FT',
  cabMat = TRUCK_CAB_MATERIALS.WHITE,
  matCont1 = TRUCK_CONTAINER_MATERIALS.BLUE,
  matCont2 = TRUCK_CONTAINER_MATERIALS.ORANGE
} = {}) {
  const truck = new THREE.Group();
  truck.name = 'asset_container_truck';

  // A. TRAILER GANDENGAN (Panjang 12.4m, Z: -8.00 s/d +4.40)
  const trailerBed = new THREE.Mesh(trailerBedGeo, chassisMat);
  trailerBed.position.set(0, 0.75, -1.80);
  trailerBed.castShadow = true;
  truck.add(trailerBed);

  const rearBumper = new THREE.Mesh(rearBumperGeo, chassisMat);
  rearBumper.position.set(0, 0.45, -7.95);
  truck.add(rearBumper);

  [-1.0, 1.0].forEach((lx) => {
    const bl = new THREE.Mesh(brakeLightGeo, brakeLightMat);
    bl.position.set(lx, 0.45, -8.03);
    truck.add(bl);
  });

  // B. RODA (Total 12 Roda / 6 Gandar)
  const allAxles = [-6.8, -5.6, -4.4, 3.3, 4.5, 7.1];
  allAxles.forEach((wz) => {
    [-1.15, 1.15].forEach((wx) => {
      const wheel = new THREE.Mesh(wheelGeo, wheelMat);
      wheel.rotation.z = Math.PI / 2;
      wheel.position.set(wx, 0.50, wz);
      truck.add(wheel);
    });
  });

  // C. KEPALA TRUK (Prime Mover / Tractor Unit: Z = +3.20 s/d +8.00)
  const tractorChassis = new THREE.Mesh(tractorChassisGeo, chassisMat);
  tractorChassis.position.set(0, 0.70, 5.60);
  tractorChassis.castShadow = true;
  truck.add(tractorChassis);

  const fifthWheel = new THREE.Mesh(fifthWheelGeo, chassisMat);
  fifthWheel.position.set(0, 0.94, 3.80);
  truck.add(fifthWheel);

  [-1.02, 1.02].forEach((tx) => {
    const tank = new THREE.Mesh(fuelTankGeo, tankMat);
    tank.rotation.x = Math.PI / 2;
    tank.position.set(tx, 0.65, 5.70);
    truck.add(tank);
  });

  const cab = new THREE.Mesh(cabGeo, cabMat);
  cab.position.set(0, 2.15, 6.375);
  cab.castShadow = true;
  truck.add(cab);

  const windshield = new THREE.Mesh(windshieldGeo, glassMat);
  windshield.position.set(0, 2.45, 7.71);
  truck.add(windshield);

  [-1.23, 1.23].forEach((sx) => {
    const sideWindow = new THREE.Mesh(sideWindowGeo, glassMat);
    sideWindow.position.set(sx, 2.45, 6.55);
    truck.add(sideWindow);
  });

  const frontGrill = new THREE.Mesh(frontGrillGeo, grillMat);
  frontGrill.position.set(0, 1.40, 7.73);
  truck.add(frontGrill);

  const frontBumper = new THREE.Mesh(frontBumperGeo, chassisMat);
  frontBumper.position.set(0, 0.55, 7.85);
  truck.add(frontBumper);

  [-0.95, 0.95].forEach((hx) => {
    const hl = new THREE.Mesh(headlightGeo, lightMat);
    hl.position.set(hx, 0.58, 8.01);
    truck.add(hl);
  });

  const exhaust = new THREE.Mesh(exhaustGeo, exhaustMat);
  exhaust.position.set(0.95, 2.50, 5.15);
  truck.add(exhaust);

  // D. KONFIGURASI MUATAN KONTAINER DI ATAS SASIS TRAILER
  const contH = 2.59;
  const contY = 0.925 + contH / 2;

  if (loadType === 'TWO_20FT') {
    const cRear = new THREE.Mesh(c20Geo, matCont1);
    cRear.position.set(0, contY, -4.85);
    cRear.castShadow = true;
    truck.add(cRear);

    const cFront = new THREE.Mesh(c20Geo, matCont2);
    cFront.position.set(0, contY, 1.33);
    cFront.castShadow = true;
    truck.add(cFront);
  } else if (loadType === 'ONE_40FT') {
    const c40 = new THREE.Mesh(c40Geo, matCont1);
    c40.position.set(0, contY, -1.76);
    c40.castShadow = true;
    truck.add(c40);
  } else if (loadType === 'ONE_20FT') {
    const cOne = new THREE.Mesh(c20Geo, matCont1);
    cOne.position.set(0, contY, 1.33);
    cOne.castShadow = true;
    truck.add(cOne);

    [
      [-1.15, -7.85], [1.15, -7.85],
      [-1.15, -1.76], [1.15, -1.76]
    ].forEach(([tx, tz]) => {
      const lock = new THREE.Mesh(twistlockGeo, twistlockMat);
      lock.position.set(tx, 0.96, tz);
      truck.add(lock);
    });
  } else if (loadType === 'EMPTY') {
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
}
