import * as THREE from 'three';

/**
 * ==============================================================================
 * Reusable Asset: Alat Berat Lapangan Penumpukan (ASC & RTG Gantry Cranes)
 * ==============================================================================
 * 1. ASC (Automated Stacking Crane):
 *    - Berwarna hijau tosca khas Terminal Teluk Lamong (2 unit per baris blok CY)
 *    - Berjalan di atas rel baja sepanjang blok dengan lengan kantilever
 * 2. RTG (Rubber Tyred Gantry Crane):
 *    - Beroda karet untuk melayani Blok Timur / Reefer & Empty Corridor (2 unit)
 */

const ascGreenMat = new THREE.MeshStandardMaterial({
  color: 0x108565, // Hijau tosca khas ASC Terminal Teluk Lamong
  roughness: 0.42,
  metalness: 0.45,
  name: 'mat_asc_teal_green'
});

const ascDarkAccentMat = new THREE.MeshStandardMaterial({
  color: 0x1e293b,
  roughness: 0.55,
  metalness: 0.5,
  name: 'mat_asc_dark_accent'
});

const rtgBlueTealMat = new THREE.MeshStandardMaterial({
  color: 0x0d7490, // Biru-hijau industrial RTG Pelindo
  roughness: 0.45,
  metalness: 0.42,
  name: 'mat_rtg_frame'
});

const yellowSafetyMat = new THREE.MeshStandardMaterial({
  color: 0xfacc15,
  roughness: 0.5,
  metalness: 0.3,
  name: 'mat_crane_yellow_safety'
});

const railSteelMat = new THREE.MeshStandardMaterial({
  color: 0x64748b,
  roughness: 0.4,
  metalness: 0.75,
  name: 'mat_asc_rail_steel'
});

const rubberTireMat = new THREE.MeshStandardMaterial({
  color: 0x18181b,
  roughness: 0.9,
  metalness: 0.1,
  name: 'mat_rtg_rubber_tire'
});

/**
 * Membuat 1 unit Automated Stacking Crane (ASC)
 * Sumbu X = bentang portal (span melintang lebar blok ~22m)
 * Sumbu Z = arah jalan rel crane (sepanjang panjang blok)
 */
export function createASCCrane({
  spanX = 21.6,       // Jarak antar rel kaki portal (mencakup 6 row kontainer)
  clearHeight = 16.5, // Tinggi bebas di bawah girder (mampu melewati 5 tier)
  legWidthZ = 8.2,    // Lebar portal kaki searah rel Z
  cantileverX = 3.2   // Overhang girder di luar kaki
} = {}) {
  const group = new THREE.Group();
  group.name = 'asset_asc_crane';

  const halfSpan = spanX / 2;
  const halfLegZ = legWidthZ / 2;
  const totalGirderX = spanX + cantileverX * 2;

  // 1. Bogie Roda Rel & Balok Sill Bawah (Sisi Kiri -X & Sisi Kanan +X)
  [-halfSpan, halfSpan].forEach((lx) => {
    const sillBeam = new THREE.Mesh(
      new THREE.BoxGeometry(0.95, 1.1, legWidthZ + 2.6),
      ascDarkAccentMat
    );
    sillBeam.position.set(lx, 0.65, 0);
    sillBeam.castShadow = true;
    group.add(sillBeam);

    // Bumper kuning di kedua ujung bogie
    [-(legWidthZ / 2 + 1.4), legWidthZ / 2 + 1.4].forEach((bz) => {
      const bumper = new THREE.Mesh(
        new THREE.BoxGeometry(1.05, 0.65, 0.45),
        yellowSafetyMat
      );
      bumper.position.set(lx, 0.55, bz);
      group.add(bumper);
    });

    // 2. Sepasang Kaki Kolom Portal A-Frame di setiap sisi rel
    [-halfLegZ, halfLegZ].forEach((lz) => {
      const legCol = new THREE.Mesh(
        new THREE.BoxGeometry(0.82, clearHeight, 0.82),
        ascGreenMat
      );
      legCol.position.set(lx, 1.1 + clearHeight / 2, lz);
      legCol.castShadow = true;
      legCol.receiveShadow = true;
      group.add(legCol);
    });

    // Balok pengaku tengah kaki (portal tie beam)
    const midTie = new THREE.Mesh(
      new THREE.BoxGeometry(0.65, 0.65, legWidthZ),
      ascGreenMat
    );
    midTie.position.set(lx, 1.1 + clearHeight * 0.55, 0);
    group.add(midTie);

    // Balok kepala kaki atas
    const topCap = new THREE.Mesh(
      new THREE.BoxGeometry(0.95, 1.1, legWidthZ + 1.2),
      ascGreenMat
    );
    topCap.position.set(lx, 1.1 + clearHeight + 0.4, 0);
    topCap.castShadow = true;
    group.add(topCap);
  });

  // 3. Sepasang Balok Girder Utama Melintang (Double Box Girder sepanjang sumbu X)
  const girderY = 1.1 + clearHeight + 1.25;
  [-halfLegZ, halfLegZ].forEach((gz) => {
    const girder = new THREE.Mesh(
      new THREE.BoxGeometry(totalGirderX, 1.55, 0.92),
      ascGreenMat
    );
    girder.position.set(0, girderY, gz);
    girder.castShadow = true;
    girder.receiveShadow = true;
    group.add(girder);
  });

  // 4. Rumah Trolley & Spreader Pengangkat Kontainer di Atas Girder
  const trolleyOffsetX = (Math.random() - 0.5) * (spanX * 0.55);
  const trolleyGroup = new THREE.Group();
  trolleyGroup.position.set(trolleyOffsetX, girderY + 0.9, 0);

  const trolleyFrame = new THREE.Mesh(
    new THREE.BoxGeometry(3.8, 1.2, legWidthZ + 1.4),
    ascDarkAccentMat
  );
  trolleyFrame.castShadow = true;
  trolleyGroup.add(trolleyFrame);

  const machHouse = new THREE.Mesh(
    new THREE.BoxGeometry(3.2, 1.5, 3.6),
    ascGreenMat
  );
  machHouse.position.y = 1.3;
  machHouse.castShadow = true;
  trolleyGroup.add(machHouse);

  // Spreader kuning tergantung dengan 4 kabel baja
  const spreaderDrop = 4.2;
  const spreader = new THREE.Mesh(
    new THREE.BoxGeometry(2.5, 0.55, 6.2),
    yellowSafetyMat
  );
  spreader.position.y = -spreaderDrop;
  spreader.castShadow = true;
  trolleyGroup.add(spreader);

  [-0.9, 0.9].forEach((cx) => {
    [-2.2, 2.2].forEach((cz) => {
      const cable = new THREE.Mesh(
        new THREE.CylinderGeometry(0.04, 0.04, spreaderDrop, 6),
        ascDarkAccentMat
      );
      cable.position.set(cx, -spreaderDrop / 2, cz);
      trolleyGroup.add(cable);
    });
  });

  group.add(trolleyGroup);

  // 5. Panel E-House / Gardu Listrik Kecil di Kaki Samping
  const eHouse = new THREE.Mesh(
    new THREE.BoxGeometry(1.6, 3.2, 4.2),
    ascGreenMat
  );
  eHouse.position.set(halfSpan + 1.1, 4.5, 0);
  eHouse.castShadow = true;
  group.add(eHouse);

  return group;
}

/**
 * Membuat sepasang rel baja ASC sepanjang blok
 */
export function createASCRailTrack({
  spanX = 21.6,
  lengthZ = 356.0
} = {}) {
  const railGroup = new THREE.Group();
  railGroup.name = 'asset_asc_rail_track';

  const halfSpan = spanX / 2;
  [-halfSpan, halfSpan].forEach((rx) => {
    const railBeam = new THREE.Mesh(
      new THREE.BoxGeometry(0.42, 0.14, lengthZ),
      railSteelMat
    );
    railBeam.position.set(rx, 0.07, 0);
    railBeam.receiveShadow = true;
    railGroup.add(railBeam);
  });

  return railGroup;
}

/**
 * Membuat 1 unit Rubber Tyred Gantry (RTG) Crane untuk Blok Timur
 * Di Blok Timur, kontainer berbaris memanjang sumbu X (utara-selatan),
 * sehingga portal RTG membentang melintasi sumbu Z (lebar koridor ~23.5m)
 * dan berjalan sepanjang sumbu X.
 */
export function createRTGCrane({
  spanZ = 22.8,       // Bentang portal melintasi lebar Blok Timur (sumbu Z)
  clearHeight = 15.2,
  legSpanX = 7.6
} = {}) {
  const rtg = new THREE.Group();
  rtg.name = 'asset_rtg_crane';

  // Kita bangun menggunakan geometri portal lalu diputar 90 derajat (sumbu Y = PI/2)
  // agar bentang portal sejajar sumbu Z dan roda berjalan sejajar sumbu X
  const inner = createASCCrane({
    spanX: spanZ,
    clearHeight,
    legWidthZ: legSpanX,
    cantileverX: 1.5
  });

  // Ganti warna hijau ASC menjadi warna biru-teal RTG + tambahkan ban karet
  inner.traverse((child) => {
    if (child.isMesh && child.material === ascGreenMat) {
      child.material = rtgBlueTealMat;
    }
  });

  // Tambahkan 4 pasang roda ban karet besar di bawah sill beam
  const halfSpan = spanZ / 2;
  [-halfSpan, halfSpan].forEach((lx) => {
    [-legSpanX * 0.55, -legSpanX * 0.2, legSpanX * 0.2, legSpanX * 0.55].forEach((wz) => {
      const wheel = new THREE.Mesh(
        new THREE.CylinderGeometry(0.72, 0.72, 0.65, 14),
        rubberTireMat
      );
      wheel.rotation.z = Math.PI / 2;
      wheel.position.set(lx, 0.72, wz);
      wheel.castShadow = true;
      inner.add(wheel);
    });
  });

  inner.rotation.y = Math.PI / 2;
  rtg.add(inner);

  return rtg;
}
