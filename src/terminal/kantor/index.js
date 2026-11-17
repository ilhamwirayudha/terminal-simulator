import * as THREE from 'three';
import { createSubAreaLahanDanJalanKantor } from './SubAreaLahanDanJalanKantor.js';
import { createSubAreaGedungUtamaHO } from './SubAreaGedungUtamaHO.js';
import { createSubAreaMasjidKantor } from './SubAreaMasjidKantor.js';
import { createSubAreaOlahragaDanParkir } from './SubAreaOlahragaDanParkir.js';
import { createRoadsideTreeBand } from '../../assets/nature/createRoadsideTreeBand.js';

/**
 * ==============================================================================
 * Modul Utama Area Kantor Utama / Head Office (src/terminal/kantor/index.js)
 * ==============================================================================
 * Mengintegrasikan:
 * 1. Daratan Reklamasi Head Office, Tonjolan Barat Daya, Jalan Internal, Pulau Segitiga & Mangrove
 * 2. Gedung Utama Head Office (Graha Pelindo 25m x 92m) & Pos Jaga Timur Laut
 * 3. Kompleks Masjid Kubah Putih Elips (31m x 23m), Koridor Penghubung, & Tempat Wudhu
 * 4. Lapangan Futsal/Basket, Parkir Mobil Umum, Parkir Direktur & SM, & 2 Baris Parkir Selatan
 * 5. Sabuk Pohon Tepi Tenggara Jalan Pre-Gate (Z: 775.0 s/d 1168.0) sesuai foto satelit utuh
 */
export function createKantorArea(scene) {
  const kantorGroup = new THREE.Group();
  kantorGroup.name = 'kantor_utama_group';

  // 1. Lahan Dasar, Tonjolan Barat Daya, Jalan Sirkulasi Internal, & Sabuk Mangrove
  kantorGroup.add(createSubAreaLahanDanJalanKantor());

  // 2. Gedung Utama Head Office (Graha Pelindo)
  kantorGroup.add(createSubAreaGedungUtamaHO());

  // 3. Kompleks Masjid Kubah Putih, Selasar Penghubung, & Tempat Wudhu
  kantorGroup.add(createSubAreaMasjidKantor());

  // 4. Lapangan Futsal/Basket & 4 Zona Parkir Mobil
  kantorGroup.add(createSubAreaOlahragaDanParkir());

  // 5. Sabuk Pohon Tepi Tenggara Jalan Pre-Gate (Z: 774.5 s/d 1168.0, X: -13.5 s/d -23.5)
  //    Terlihat jelas di foto satelit pertama (media_1794883266516_3b2008f2.png) memanjang
  //    dari timur Head Office hingga menyambung sabuk pohon Main Gate di Z = 1168.0
  const stripLenZ = 1168.0 - 774.0;
  const stripMidZ = (774.0 + 1168.0) / 2;
  const stripGround = new THREE.Mesh(
    new THREE.BoxGeometry(11.0, 0.45, stripLenZ),
    new THREE.MeshStandardMaterial({ color: 0x3b4d34, roughness: 0.94 })
  );
  stripGround.position.set(-18.8, 1.38, stripMidZ);
  stripGround.receiveShadow = true;
  kantorGroup.add(stripGround);

  const seTreePts = [];
  for (let z = 776.0; z <= 1166.0; z += 5.5) {
    [-16.2, -20.5].forEach((tx, idx) => {
      seTreePts.push({
        x: tx + Math.sin(z * 0.4 + idx) * 0.8,
        z: z + Math.cos(z * 0.3) * 0.8,
        scale: 0.85 + Math.abs(Math.sin(z * 0.2)) * 0.35
      });
    });
  }
  kantorGroup.add(createRoadsideTreeBand(seTreePts, 1.58));

  if (scene) {
    scene.add(kantorGroup);
  }
  return kantorGroup;
}
