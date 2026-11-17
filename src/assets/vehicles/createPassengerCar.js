import * as THREE from 'three';

/**
 * ==============================================================================
 * Reusable Asset: Mobil Penumpang / Operasional Kantor (Sedan & SUV)
 * ==============================================================================
 * Digunakan untuk area parkir Kompleks Kantor Utama (Head Office):
 * - Parkir Mobil Umum (29 slot)
 * - Parkir Mobil Direktur & Senior Manager (VIP berkanopi)
 * - Parkir Mobil Selatan (Belakang Gedung Utama HO)
 */

const carWheelMat = new THREE.MeshStandardMaterial({
  color: 0x18181b,
  roughness: 0.9,
  metalness: 0.1,
  name: 'mat_car_wheel'
});

const carGlassMat = new THREE.MeshStandardMaterial({
  color: 0x1e293b,
  roughness: 0.15,
  metalness: 0.85,
  name: 'mat_car_glass'
});

const carHeadlightMat = new THREE.MeshStandardMaterial({
  color: 0xfef08a,
  emissive: 0xfef08a,
  emissiveIntensity: 0.25,
  roughness: 0.3
});

const carTaillightMat = new THREE.MeshStandardMaterial({
  color: 0xdc2626,
  emissive: 0xdc2626,
  emissiveIntensity: 0.2,
  roughness: 0.3
});

export const CAR_COLOR_PALETTE = [
  0xf8fafc, // Putih Mutiara
  0x1e293b, // Hitam Metalik
  0x94a3b8, // Perak / Silver
  0x475569, // Abu-abu Gelap
  0xb91c1c, // Merah Marun
  0x1d4ed8  // Biru Tua
];

const carBodyMaterials = new Map();
function getCarBodyMaterial(hexColor) {
  if (!carBodyMaterials.has(hexColor)) {
    carBodyMaterials.set(
      hexColor,
      new THREE.MeshStandardMaterial({
        color: hexColor,
        roughness: 0.32,
        metalness: 0.55
      })
    );
  }
  return carBodyMaterials.get(hexColor);
}

/**
 * Membuat 1 unit mobil penumpang ( Panjang вдоль Z lokal = 4.4m, Lebar вдоль X lokal = 1.82m )
 * @param {Object} options
 * @param {number} [options.color=0xf8fafc]
 * @param {boolean} [options.isSUV=false]
 */
export function createPassengerCar({ color = 0xf8fafc, isSUV = false } = {}) {
  const carGroup = new THREE.Group();
  carGroup.name = 'asset_passenger_car';

  const bodyMat = getCarBodyMaterial(color);
  const lengthZ = isSUV ? 4.65 : 4.40;
  const widthX = 1.82;
  const lowerH = isSUV ? 0.78 : 0.68;
  const cabinH = isSUV ? 0.68 : 0.56;
  const cabinLenZ = isSUV ? 2.85 : 2.25;

  // 1. Bodi Bawah
  const lowerBody = new THREE.Mesh(
    new THREE.BoxGeometry(widthX, lowerH, lengthZ),
    bodyMat
  );
  lowerBody.position.set(0, 0.32 + lowerH / 2, 0);
  lowerBody.castShadow = true;
  lowerBody.receiveShadow = true;
  carGroup.add(lowerBody);

  // 2. Kabin Atas & Kaca
  const cabin = new THREE.Mesh(
    new THREE.BoxGeometry(widthX * 0.86, cabinH, cabinLenZ),
    bodyMat
  );
  cabin.position.set(0, 0.32 + lowerH + cabinH / 2 - 0.04, isSUV ? -0.25 : -0.15);
  cabin.castShadow = true;
  carGroup.add(cabin);

  const windowBand = new THREE.Mesh(
    new THREE.BoxGeometry(widthX * 0.88, cabinH * 0.68, cabinLenZ * 0.92),
    carGlassMat
  );
  windowBand.position.copy(cabin.position);
  carGroup.add(windowBand);

  // 3. 4 Roda
  const wheelGeo = new THREE.CylinderGeometry(0.34, 0.34, 0.24, 12);
  [-widthX / 2 + 0.08, widthX / 2 - 0.08].forEach((wx) => {
    [-lengthZ * 0.31, lengthZ * 0.31].forEach((wz) => {
      const wheel = new THREE.Mesh(wheelGeo, carWheelMat);
      wheel.rotation.z = Math.PI / 2;
      wheel.position.set(wx, 0.34, wz);
      carGroup.add(wheel);
    });
  });

  // 4. Lampu Depan (+Z) & Belakang (-Z)
  [-0.62, 0.62].forEach((lx) => {
    const headLight = new THREE.Mesh(new THREE.BoxGeometry(0.32, 0.16, 0.06), carHeadlightMat);
    headLight.position.set(lx, 0.72, lengthZ / 2 + 0.01);
    carGroup.add(headLight);

    const tailLight = new THREE.Mesh(new THREE.BoxGeometry(0.34, 0.16, 0.06), carTaillightMat);
    tailLight.position.set(lx, 0.75, -lengthZ / 2 - 0.01);
    carGroup.add(tailLight);
  });

  return carGroup;
}
