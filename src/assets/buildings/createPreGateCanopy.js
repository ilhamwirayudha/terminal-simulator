import * as THREE from 'three';

/**
 * ==============================================================================
 * Reusable Asset: Kanopi Gerbang Pre-Gate (Pre-Gate Entrance Canopy & WIM Scales)
 * ==============================================================================
 * Struktur kanopi gerbang lengkung ikonik putih Terminal Teluk Lamong:
 * - Dimensi terkalibrasi: Panjang 24.8m x Lebar 18.0m (X: 0.0 s/d 18.0m)
 * - Pilar median di X = 0.0m (tepat di sumbu tengah pulau median, zero-overflow ke outbound)
 * - Pilar luar di X = 18.0m (di atas bahu jalan luar berkanstin)
 * - Ketinggian proporsional: Klirens bawah 6.8m & Puncak lengkung atap 9.6m
 * - Auto-Gate System murni tanpa gardu manual petugas
 * - Timbangan Platform Dinamis WIM (Weigh-In-Motion) terpasang di lantai aspal
 *   pada Lajur 2, 3, dan 4 (Receiving & Delivery), sedangkan Lajur 1 (Umum/Cuker) polos.
 */

// Shared PBR Materials
const canopyWhiteMat = new THREE.MeshStandardMaterial({
  color: 0xf8fafc, // Crisp white composite panel
  roughness: 0.35,
  metalness: 0.15,
  name: 'mat_pre_gate_canopy_white'
});

const canopyTrussMat = new THREE.MeshStandardMaterial({
  color: 0x334155, // Dark slate steel truss / framing
  roughness: 0.45,
  metalness: 0.75,
  name: 'mat_pre_gate_canopy_truss'
});

const islandConcreteMat = new THREE.MeshStandardMaterial({
  color: 0x94a3b8,
  roughness: 0.7,
  metalness: 0.2,
  name: 'mat_pre_gate_island_concrete'
});

const wimScalePlateMat = new THREE.MeshStandardMaterial({
  color: 0x27272a, // Dark steel diamond tread plate
  roughness: 0.5,
  metalness: 0.8,
  name: 'mat_wim_scale_plate'
});

const wimYellowMat = new THREE.MeshBasicMaterial({
  color: 0xfbbf24,
  side: THREE.DoubleSide,
  name: 'mat_wim_hazard_yellow'
});

const wimSensorMat = new THREE.MeshBasicMaterial({
  color: 0x38bdf8,
  side: THREE.DoubleSide
});

const kioskMat = new THREE.MeshStandardMaterial({
  color: 0x0284c7, // Pelindo Cyan Kiosk
  roughness: 0.35,
  metalness: 0.5
});

export function createPreGateCanopy({
  xStart = 0.0,    // Tepi naungan di median (tepat di sumbu median X = 0)
  xEnd = 18.0,     // Tepi naungan luar di trotoar kiri
  centerZ = 955.0, // Posisi pusat Z di koridor Jalan Pre-Gate
  length = 24.8,   // Panjang kanopi (terkalibrasi GPS 24.8m)
  height = 9.6,    // Puncak lengkung atap (9.6m proporsional)
  baseH = 6.8,     // Klirens tepi bawah kanopi 6.8m (sangat aman untuk truk 4.5m)
  yRoad = 1.631    // Elevasi jalan
} = {}) {
  const canopyGroup = new THREE.Group();
  canopyGroup.name = 'asset_pre_gate_canopy';

  const width = Math.abs(xEnd - xStart);
  const midX = (xStart + xEnd) / 2;

  // ----------------------------------------------------------------------------
  // 1. Atap Lengkung Barrel Vault (Cylindrical Arch)
  // ----------------------------------------------------------------------------
  const archSegments = 24;
  const archShape = new THREE.Shape();
  const crownH = height;

  // Profil busur lengkung kanopi (melintang jalan)
  archShape.moveTo(-width / 2 - 0.5, baseH);
  for (let i = 0; i <= archSegments; i++) {
    const t = i / archSegments;
    const curX = -width / 2 - 0.5 + t * (width + 1.0);
    // Parabola melengkung
    const curY = baseH + (crownH - baseH) * Math.sin(t * Math.PI);
    archShape.lineTo(curX, curY);
  }
  archShape.lineTo(width / 2 + 0.5, baseH - 0.40);
  for (let i = archSegments; i >= 0; i--) {
    const t = i / archSegments;
    const curX = -width / 2 - 0.5 + t * (width + 1.0);
    const curY = (baseH - 0.40) + (crownH - baseH) * Math.sin(t * Math.PI);
    archShape.lineTo(curX, curY);
  }
  archShape.closePath();

  const extrudeSettings = {
    steps: 1,
    depth: length,
    bevelEnabled: true,
    bevelThickness: 0.35,
    bevelSize: 0.25,
    bevelSegments: 2
  };

  const archGeo = new THREE.ExtrudeGeometry(archShape, extrudeSettings);
  const archMesh = new THREE.Mesh(archGeo, canopyWhiteMat);
  archMesh.position.set(midX, yRoad, centerZ - length / 2);
  archMesh.castShadow = true;
  archMesh.receiveShadow = true;
  canopyGroup.add(archMesh);

  // ----------------------------------------------------------------------------
  // 2. Kolom Tiang Penyangga Baja Silinder (Ditempatkan Presisi di Median & Bahu Luar)
  // ----------------------------------------------------------------------------
  // Pilar Median di X = 0.0m (sumbu tengah median X in [-1.3, +1.3], aman 1.3m dari outbound)
  // Pilar Luar di X = 18.0m (di atas bahu jalan luar berkanstin)
  const xColMedian = 0.0;
  const xColOuter = 18.0;
  const pillarGeo = new THREE.CylinderGeometry(0.48, 0.56, baseH + 0.4, 16);
  const plinthGeo = new THREE.CylinderGeometry(0.60, 0.65, 0.60, 16);

  [-length / 2 + 2.5, 0, length / 2 - 2.5].forEach((pz) => {
    // Sisi Median (X = 0.0m)
    const plinthMedian = new THREE.Mesh(plinthGeo, islandConcreteMat);
    plinthMedian.position.set(xColMedian, yRoad + 0.30, centerZ + pz);
    canopyGroup.add(plinthMedian);

    const pMedian = new THREE.Mesh(pillarGeo, canopyTrussMat);
    pMedian.position.set(xColMedian, yRoad + (baseH + 0.4) / 2, centerZ + pz);
    pMedian.castShadow = true;
    canopyGroup.add(pMedian);

    // Sisi Luar Kiri (X = 18.0m)
    const plinthOuter = new THREE.Mesh(plinthGeo, islandConcreteMat);
    plinthOuter.position.set(xColOuter, yRoad + 0.30, centerZ + pz);
    canopyGroup.add(plinthOuter);

    const pOuter = new THREE.Mesh(pillarGeo, canopyTrussMat);
    pOuter.position.set(xColOuter, yRoad + (baseH + 0.4) / 2, centerZ + pz);
    pOuter.castShadow = true;
    canopyGroup.add(pOuter);
  });

  // ----------------------------------------------------------------------------
  // 3. Pulau Pembatas Lajur Auto-Gate (Tanpa Gardu Manual Petugas)
  // Memisahkan 4 lajur di X = 4.9m, X = 8.5m, X = 12.1m
  // ----------------------------------------------------------------------------
  const islandWidth = 0.65;
  const islandLength = length * 0.85; // 21.0m
  const separatorXPositions = [4.9, 8.5, 12.1];

  separatorXPositions.forEach((ix) => {
    // Pulau pembatas beton
    const islandBase = new THREE.Mesh(
      new THREE.BoxGeometry(islandWidth, 0.32, islandLength),
      islandConcreteMat
    );
    islandBase.position.set(ix, yRoad + 0.16, centerZ);
    islandBase.castShadow = true;
    islandBase.receiveShadow = true;
    canopyGroup.add(islandBase);

    // Garis Hazard Hitam-Kuning di Ujung-Ujung Pulau Beton
    [-islandLength / 2 + 0.8, islandLength / 2 - 0.8].forEach((pz) => {
      const hazardCap = new THREE.Mesh(
        new THREE.BoxGeometry(islandWidth + 0.02, 0.33, 1.2),
        wimYellowMat
      );
      hazardCap.position.set(ix, yRoad + 0.165, centerZ + pz);
      canopyGroup.add(hazardCap);
    });

    // Kiosk Terminal Auto-Gate Otomatis (RFID Card Tap & Display Status Kios)
    const kiosk = new THREE.Mesh(
      new THREE.BoxGeometry(0.35, 1.45, 0.45),
      kioskMat
    );
    kiosk.position.set(ix, yRoad + 0.32 + 0.725, centerZ - 1.5);
    kiosk.castShadow = true;
    canopyGroup.add(kiosk);

    // Tiang CCTV / Intercom Otomatis
    const pole = new THREE.Mesh(
      new THREE.CylinderGeometry(0.04, 0.04, 2.8, 8),
      canopyTrussMat
    );
    pole.position.set(ix, yRoad + 1.4, centerZ + 2.0);
    canopyGroup.add(pole);

    const cctvCam = new THREE.Mesh(
      new THREE.BoxGeometry(0.12, 0.10, 0.22),
      canopyWhiteMat
    );
    cctvCam.position.set(ix, yRoad + 2.75, centerZ + 2.0);
    canopyGroup.add(cctvCam);
  });

  // ----------------------------------------------------------------------------
  // 4. Platform Timbangan Dinamis WIM (Weigh-In-Motion)
  // Khusus Lajur 2, 3, 4 (Receiving & Delivery) | Lajur 1 (Umum/Cuker) Polos
  // ----------------------------------------------------------------------------
  const vgmScaleLanes = [
    { id: 4, name: 'Delivery', x: 3.1 },
    { id: 3, name: 'Receiving', x: 6.7 },
    { id: 2, name: 'Receiving', x: 10.3 }
  ];

  const wimLength = 18.0; // Panjang platform timbangan (Z: 946.0 s/d 964.0) - standar truk kontainer 40ft / 2x20ft
  const wimWidth = 3.0;   // Lebar tapak timbangan baja

  vgmScaleLanes.forEach((lane) => {
    // A. Plat Baja Timbangan Berat (Checkered Steel Scale Deck)
    const scaleDeck = new THREE.Mesh(
      new THREE.BoxGeometry(wimWidth, 0.025, wimLength),
      wimScalePlateMat
    );
    scaleDeck.position.set(lane.x, yRoad + 0.015, centerZ);
    scaleDeck.receiveShadow = true;
    canopyGroup.add(scaleDeck);

    // B. Garis Kuning Hazard Perimeter di Sekeliling Plat Timbangan
    const borderThickness = 0.16;
    // Sisi Kiri & Kanan
    [-wimWidth / 2, wimWidth / 2].forEach((bx) => {
      const bSide = new THREE.Mesh(
        new THREE.PlaneGeometry(borderThickness, wimLength),
        wimYellowMat
      );
      bSide.rotation.x = -Math.PI / 2;
      bSide.position.set(lane.x + bx, yRoad + 0.03, centerZ);
      canopyGroup.add(bSide);
    });

    // Sisi Depan & Belakang
    [-wimLength / 2, wimLength / 2].forEach((bz) => {
      const bEnd = new THREE.Mesh(
        new THREE.PlaneGeometry(wimWidth + borderThickness, borderThickness),
        wimYellowMat
      );
      bEnd.rotation.x = -Math.PI / 2;
      bEnd.position.set(lane.x, yRoad + 0.03, centerZ + bz);
      canopyGroup.add(bEnd);
    });

    // C. Sensor Garis Load-Cell Piezoelektrik Melintang Plat Timbangan
    [-4.5, 4.5].forEach((sz) => {
      const sensorStrip = new THREE.Mesh(
        new THREE.PlaneGeometry(wimWidth * 0.9, 0.10),
        wimSensorMat
      );
      sensorStrip.rotation.x = -Math.PI / 2;
      sensorStrip.position.set(lane.x, yRoad + 0.032, centerZ + sz);
      canopyGroup.add(sensorStrip);
    });
  });

  // ----------------------------------------------------------------------------
  // 5. Papan Fascia Plang Nama Gerbang Pre-Gate (Auto-Gate System & VGM)
  // ----------------------------------------------------------------------------
  const canvas = document.createElement('canvas');
  canvas.width = 1024;
  canvas.height = 160;
  const ctx = canvas.getContext('2d');

  // Dark slate banner background
  ctx.fillStyle = '#0a101d';
  ctx.fillRect(0, 0, 1024, 160);

  // Border cyan
  ctx.strokeStyle = '#0284c7';
  ctx.lineWidth = 6;
  ctx.strokeRect(6, 6, 1012, 148);

  // Header Title
  ctx.fillStyle = '#f8fafc';
  ctx.font = 'bold 44px Inter, sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText('GERBANG PRE-GATE TELUK LAMONG', 512, 65);

  // Subtitle
  ctx.fillStyle = '#38bdf8';
  ctx.font = 'bold 28px Inter, sans-serif';
  ctx.fillText('AUTO GATE SYSTEM • VERIFIED GROSS MASS (VGM) WEIGH-IN-MOTION', 512, 120);

  const signTex = new THREE.CanvasTexture(canvas);
  const signMat = new THREE.MeshBasicMaterial({ map: signTex });
  const signBoard = new THREE.Mesh(new THREE.PlaneGeometry(width * 0.90, 1.8), signMat);
  signBoard.position.set(midX, yRoad + baseH + 0.9, centerZ - length / 2 - 0.35);
  canopyGroup.add(signBoard);

  return canopyGroup;
}
