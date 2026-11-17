import * as THREE from 'three';
import {
  KANTOR_BOUNDS,
  SPORTS_COURT_CONFIG,
  PUBLIC_PARKING_CONFIG,
  VIP_PARKING_CONFIG,
  SOUTH_PARKING_CONFIG
} from './GeoKantor.js';
import {
  createPassengerCar,
  CAR_COLOR_PALETTE
} from '../../assets/vehicles/createPassengerCar.js';

/**
 * ==============================================================================
 * SubAreaOlahragaDanParkir.js
 * ==============================================================================
 * Membangun:
 * 1. Lapangan Futsal / Basket (19.5m x 34.6m | -7.204678, 112.668357 s/d -7.204558, 112.668485)
 * 2. Parkir Mobil Umum (26.0m x 36.3m | -7.204544, 112.668480 s/d -7.204777, 112.668715)
 * 3. Parkir Direktur & Senior Manager (7.0m x 36.7m | -7.204274, 112.668753 s/d -7.204504, 112.668989)
 * 4. 2 Baris Parkir Mobil Selatan di Belakang Gedung Utama HO
 */
export function createSubAreaOlahragaDanParkir() {
  const group = new THREE.Group();
  group.name = 'subarea_olahraga_dan_parkir_kantor';

  const { yPavement } = KANTOR_BOUNDS;

  // Material Palet
  const courtBorderMat = new THREE.MeshStandardMaterial({
    color: 0x8b929a,
    roughness: 0.82
  });

  const courtGreenMat = new THREE.MeshStandardMaterial({
    color: 0x236e48, // Hijau lapangan futsal/basket sesuai foto satelit
    roughness: 0.75
  });

  const courtKeyOrangeMat = new THREE.MeshStandardMaterial({
    color: 0xc25e3c, // Area setengah lingkaran merah-bata/oranye di kedua ujung lapangan
    roughness: 0.75,
    polygonOffset: true,
    polygonOffsetFactor: -1,
    polygonOffsetUnits: -1
  });

  const whiteLineMat = new THREE.MeshBasicMaterial({
    color: 0xf8fafc,
    side: THREE.DoubleSide
  });

  const publicPavingMat = new THREE.MeshStandardMaterial({
    color: 0x8b7d70, // Paving kecokelatan area parkir mobil umum sesuai foto satelit
    roughness: 0.88
  });

  const canopyWhiteMat = new THREE.MeshStandardMaterial({
    color: 0xf8fafc,
    roughness: 0.38,
    metalness: 0.2
  });

  const steelPoleMat = new THREE.MeshStandardMaterial({
    color: 0x475569,
    roughness: 0.5,
    metalness: 0.7
  });

  // ----------------------------------------------------------------------------
  // 1. LAPANGAN FUTSAL / BASKET (Z: 644.0 s/d 663.5, X: -44.6 s/d -79.2 -> 19.5m x 34.6m)
  // ----------------------------------------------------------------------------
  const scLenX = Math.abs(SPORTS_COURT_CONFIG.xMax - SPORTS_COURT_CONFIG.xMin); // 34.6m
  const scWidthZ = SPORTS_COURT_CONFIG.zMax - SPORTS_COURT_CONFIG.zMin;         // 19.5m
  const scGroup = new THREE.Group();
  scGroup.position.set(SPORTS_COURT_CONFIG.centerX, yPavement, SPORTS_COURT_CONFIG.centerZ);

  // Pelataran tepi beton lapangan
  const courtBase = new THREE.Mesh(
    new THREE.BoxGeometry(scLenX, 0.14, scWidthZ),
    courtBorderMat
  );
  courtBase.position.y = 0.07;
  courtBase.receiveShadow = true;
  scGroup.add(courtBase);

  // Lantai hijau lapangan utama (30m x 16m)
  const playLenX = scLenX - 3.6;
  const playWidthZ = scWidthZ - 3.0;
  const courtGreen = new THREE.Mesh(
    new THREE.PlaneGeometry(playLenX, playWidthZ),
    courtGreenMat
  );
  courtGreen.rotation.x = -Math.PI / 2;
  courtGreen.position.y = 0.15;
  courtGreen.receiveShadow = true;
  scGroup.add(courtGreen);

  // Area Key / Three-Point Setengah Lingkaran Oranye-Merah di Ujung Utara (+X) & Selatan (-X)
  [-playLenX / 2 + 3.8, playLenX / 2 - 3.8].forEach((kx) => {
    const keyCircle = new THREE.Mesh(
      new THREE.CircleGeometry(4.8, 24),
      courtKeyOrangeMat
    );
    keyCircle.rotation.x = -Math.PI / 2;
    keyCircle.position.set(kx, 0.156, 0);
    scGroup.add(keyCircle);
  });

  // Garis Tengah & Lingkaran Tengah Putih
  const midCourtLine = new THREE.Mesh(
    new THREE.PlaneGeometry(0.18, playWidthZ),
    whiteLineMat
  );
  midCourtLine.rotation.x = -Math.PI / 2;
  midCourtLine.position.y = 0.162;
  scGroup.add(midCourtLine);

  const centerRing = new THREE.Mesh(
    new THREE.RingGeometry(2.2, 2.38, 24),
    whiteLineMat
  );
  centerRing.rotation.x = -Math.PI / 2;
  centerRing.position.y = 0.162;
  scGroup.add(centerRing);

  // Tiang Ring Basket & Gawang Futsal di Kedua Ujung Lapangan
  [-playLenX / 2 - 0.6, playLenX / 2 + 0.6].forEach((gx, idx) => {
    const dir = idx === 0 ? 1 : -1;
    const post = new THREE.Mesh(
      new THREE.CylinderGeometry(0.12, 0.12, 3.4, 8),
      steelPoleMat
    );
    post.position.set(gx, 1.7, 0);
    post.castShadow = true;
    scGroup.add(post);

    const backboard = new THREE.Mesh(
      new THREE.BoxGeometry(0.12, 1.1, 1.8),
      canopyWhiteMat
    );
    backboard.position.set(gx + dir * 0.6, 3.1, 0);
    scGroup.add(backboard);
  });

  group.add(scGroup);

  // ----------------------------------------------------------------------------
  // 2. PARKIR MOBIL UMUM (Z: 664.0 s/d 690.0, X: -43.5 s/d -79.8 -> 26.0m x 36.3m)
  // ----------------------------------------------------------------------------
  const pubLenX = Math.abs(PUBLIC_PARKING_CONFIG.xMax - PUBLIC_PARKING_CONFIG.xMin); // 36.3m
  const pubWidthZ = PUBLIC_PARKING_CONFIG.zMax - PUBLIC_PARKING_CONFIG.zMin;         // 26.0m

  const pubApron = new THREE.Mesh(
    new THREE.BoxGeometry(pubLenX, 0.12, pubWidthZ),
    publicPavingMat
  );
  pubApron.position.set(
    PUBLIC_PARKING_CONFIG.centerX,
    yPavement + 0.06,
    PUBLIC_PARKING_CONFIG.centerZ
  );
  pubApron.receiveShadow = true;
  group.add(pubApron);

  // Marka Slot Parkir & Mobil yang Terparkir di Parkir Umum (Sesuai Foto Satelit Ke-2)
  const publicCarRowsX = [-48.5, -56.5, -62.5, -72.5, -76.0];
  publicCarRowsX.forEach((cx, rIdx) => {
    // Baris Timur (Z = 684.5, menghadap Barat/Timur)
    const carE = createPassengerCar({
      color: CAR_COLOR_PALETTE[(rIdx * 2) % CAR_COLOR_PALETTE.length],
      isSUV: rIdx % 2 === 0
    });
    carE.position.set(cx, yPavement + 0.12, 684.5);
    carE.rotation.y = 0; // Panjang mobil sejajar sumbu Z (menghadap jalan tengah)
    group.add(carE);

    if (rIdx % 2 === 1) {
      const carW = createPassengerCar({
        color: CAR_COLOR_PALETTE[(rIdx * 3 + 1) % CAR_COLOR_PALETTE.length],
        isSUV: false
      });
      carW.position.set(cx, yPavement + 0.12, 678.5);
      carW.rotation.y = Math.PI;
      group.add(carW);
    }
  });

  // ----------------------------------------------------------------------------
  // 3. PARKIR MOBIL DIREKTUR & SENIOR MANAGER (7.0m x 36.7m — Sesuai PDF 36.70m!)
  //    Koordinat GPS: -7.204274, 112.668753 s/d -7.204504, 112.668989
  // ----------------------------------------------------------------------------
  const vipLenX = Math.abs(VIP_PARKING_CONFIG.xMax - VIP_PARKING_CONFIG.xMin); // 36.7m
  const vipWidthZ = VIP_PARKING_CONFIG.zMax - VIP_PARKING_CONFIG.zMin;         // 7.0m
  const vipH = VIP_PARKING_CONFIG.canopyHeight;

  // Lantai perkerasan bawah kanopi VIP
  const vipPad = new THREE.Mesh(
    new THREE.BoxGeometry(vipLenX, 0.14, vipWidthZ),
    courtBorderMat
  );
  vipPad.position.set(VIP_PARKING_CONFIG.centerX, yPavement + 0.07, VIP_PARKING_CONFIG.centerZ);
  vipPad.receiveShadow = true;
  group.add(vipPad);

  // Atap Kanopi Putih Memanjang 36.7m x 7.0m
  const vipCanopyRoof = new THREE.Mesh(
    new THREE.BoxGeometry(vipLenX + 0.6, 0.35, vipWidthZ + 0.6),
    canopyWhiteMat
  );
  vipCanopyRoof.position.set(
    VIP_PARKING_CONFIG.centerX,
    yPavement + vipH,
    VIP_PARKING_CONFIG.centerZ
  );
  vipCanopyRoof.castShadow = true;
  vipCanopyRoof.receiveShadow = true;
  group.add(vipCanopyRoof);

  // Tiang Penyangga Kanopi VIP
  for (let vx = VIP_PARKING_CONFIG.xMin + 2.5; vx <= VIP_PARKING_CONFIG.xMax - 2.0; vx += 6.2) {
    const col = new THREE.Mesh(
      new THREE.CylinderGeometry(0.14, 0.14, vipH, 8),
      steelPoleMat
    );
    col.position.set(vx, yPavement + vipH / 2, VIP_PARKING_CONFIG.zMax - 0.6);
    col.castShadow = true;
    group.add(col);
  }

  // Mobil Direktur & SM di Bawah Kanopi VIP
  [-47.0, -53.5, -60.5, -67.5, -74.0].forEach((vx, idx) => {
    const vipCar = createPassengerCar({
      color: idx % 2 === 0 ? 0x1e293b : 0xf8fafc, // Hitam & Putih Eksekutif
      isSUV: true
    });
    vipCar.position.set(vx, yPavement + 0.14, VIP_PARKING_CONFIG.centerZ);
    vipCar.rotation.y = Math.PI;
    group.add(vipCar);
  });

  // ----------------------------------------------------------------------------
  // 4. DUA BARIS PARKIR MOBIL SELATAN (DI BELAKANG GEDUNG UTAMA HO)
  // ----------------------------------------------------------------------------
  const { row1, row2 } = SOUTH_PARKING_CONFIG;

  // Kanopi Putih Kecil di Kiri-Belakang Gedung HO (Z: 703.5 s/d 716.5, X = -142.0, tampak di foto satelit)
  const rearCanopyLenZ = row1.canopyZMax - row1.canopyZMin; // 13.0m
  const rearCanopy = new THREE.Mesh(
    new THREE.BoxGeometry(5.2, 0.32, rearCanopyLenZ),
    canopyWhiteMat
  );
  rearCanopy.position.set(
    row1.canopyXCenter,
    yPavement + 3.5,
    (row1.canopyZMin + row1.canopyZMax) / 2
  );
  rearCanopy.castShadow = true;
  group.add(rearCanopy);

  // Baris 1 Mobil Parkir Selatan (-7.204832, 112.669501 s/d -7.204622, 112.669709 -> X = -145.5)
  for (let pz = row1.zMin + 3.0; pz <= row1.zMax - 2.0; pz += 4.2) {
    // Marka garis putih pembatas slot
    const stallLine = new THREE.Mesh(
      new THREE.PlaneGeometry(4.8, 0.14),
      whiteLineMat
    );
    stallLine.rotation.x = -Math.PI / 2;
    stallLine.position.set(row1.xCenter, yPavement + 0.15, pz - 1.5);
    group.add(stallLine);

    if (Math.sin(pz) > -0.2) {
      const car = createPassengerCar({
        color: CAR_COLOR_PALETTE[Math.floor(pz) % CAR_COLOR_PALETTE.length],
        isSUV: Math.floor(pz) % 3 === 0
      });
      car.position.set(row1.xCenter, yPavement + 0.14, pz);
      car.rotation.y = Math.PI / 2; // Menghadap Utara/Selatan вдоль sumbu X
      group.add(car);
    }
  }

  // Baris 2 Mobil Parkir Selatan (-7.205032, 112.669449 s/d -7.204661, 112.669817 -> X = -156.5)
  for (let pz = row2.zMin + 3.5; pz <= row2.zMax - 2.5; pz += 3.8) {
    const stallLine = new THREE.Mesh(
      new THREE.PlaneGeometry(4.8, 0.14),
      whiteLineMat
    );
    stallLine.rotation.x = -Math.PI / 2;
    stallLine.position.set(row2.xCenter, yPavement + 0.15, pz - 1.4);
    group.add(stallLine);

    if (Math.cos(pz * 0.7) > -0.35) {
      const car = createPassengerCar({
        color: CAR_COLOR_PALETTE[(Math.floor(pz) + 2) % CAR_COLOR_PALETTE.length],
        isSUV: Math.floor(pz) % 2 === 0
      });
      car.position.set(row2.xCenter, yPavement + 0.14, pz);
      car.rotation.y = -Math.PI / 2;
      group.add(car);
    }
  }

  return group;
}
