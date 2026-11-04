import * as THREE from 'three';
import {
  curbHazardWhiteMat,
  curbHazardBlackMat
} from '../materials/roadMaterials.js';

/**
 * ==============================================================================
 * Reusable Infrastructure: Heavy-Duty Pre-Gate Port Gantry Portal (Auto-Gate & VGM)
 * ==============================================================================
 * Struktur portal gantry truss baja industri berat (Heavy-Duty Port Space-Truss):
 * - Pilar median di X = 0.0m (100% aman di dalam pulau median, zero-overflow ke outbound)
 * - Pilar luar di X = 18.0m (di atas bahu jalan luar berkanstin)
 * - Rangka box space-truss berdimensi tebal: Kedalaman 1.2m x Tinggi balok 1.6m
 * - Klirens bawah proporsional: 6.0m (1.5m di atas atap truk kontainer 4.5m)
 * - Catwalk maintenance platform dengan safety handrails kuning di atas balok
 * - Dilengkapi scanner OCR kamera industri, LED display tonase VGM besar, traffic light,
 *   dan barrier gate kokoh dengan bollard pengaman.
 */

// Shared PBR Materials
const gantrySteelMat = new THREE.MeshStandardMaterial({
  color: 0x334155, // Dark slate heavy structural steel
  roughness: 0.40,
  metalness: 0.80,
  name: 'mat_gantry_steel'
});

const gantryYellowMat = new THREE.MeshStandardMaterial({
  color: 0xeab308, // Safety yellow for handrails & bollards
  roughness: 0.40,
  metalness: 0.30,
  name: 'mat_gantry_safety_yellow'
});

const equipmentWhiteMat = new THREE.MeshStandardMaterial({
  color: 0xf8fafc,
  roughness: 0.30,
  metalness: 0.20,
  name: 'mat_gantry_equip_white'
});

const scannerSensorMat = new THREE.MeshStandardMaterial({
  color: 0x0f172a,
  roughness: 0.15,
  metalness: 0.90,
  name: 'mat_gantry_scanner_dark'
});

const signalHousingMat = new THREE.MeshStandardMaterial({
  color: 0x18181b,
  roughness: 0.60,
  metalness: 0.30
});

const signalGreenMat = new THREE.MeshBasicMaterial({ color: 0x22c55e });
const signalYellowMat = new THREE.MeshBasicMaterial({ color: 0xeab308 });
const signalRedMat = new THREE.MeshBasicMaterial({ color: 0xef4444 });
const barrierOrangeMat = new THREE.MeshStandardMaterial({ color: 0xf97316, roughness: 0.4 });
const barrierPoleMat = new THREE.MeshStandardMaterial({ color: 0xf8fafc, roughness: 0.3 });
const barrierStripeRedMat = new THREE.MeshBasicMaterial({ color: 0xdc2626 });
const concretePlinthMat = new THREE.MeshStandardMaterial({ color: 0x64748b, roughness: 0.8 });

export function createPreGatePortal({
  centerZ = 938.0,
  type = 'entry', // 'entry' | 'exit'
  xMedian = 0.0,  // Pilar median sisi dalam (tepat di sumbu median X = 0)
  xOuter = 18.0,  // Pilar sisi luar kiri di atas bahu jalan
  yRoad = 1.631,  // Elevasi aspal jalan
  underbeamH = 6.0 // Klirens bawah portal 6.0m (proporsional 1.5m di atas kontainer 4.5m)
} = {}) {
  const portalGroup = new THREE.Group();
  portalGroup.name = `pre_gate_portal_${type}_${Math.round(centerZ)}`;

  const spanWidth = Math.abs(xOuter - xMedian);
  const midX = (xMedian + xOuter) / 2;
  const beamDepthZ = 1.2;  // Tebal balok gantry memanjang jalan
  const beamHeightY = 1.6; // Tinggi profil balok gantry vertikal
  const beamYBottom = yRoad + underbeamH;
  const beamYTop = beamYBottom + beamHeightY;
  const beamYCenter = (beamYBottom + beamYTop) / 2;

  // ----------------------------------------------------------------------------
  // 1. Tiang Menara Truss Vertikal (Pilar Kaki Gantry) di X = 0.0m dan X = 18.0m
  // ----------------------------------------------------------------------------
  const legXPositions = [xMedian, xOuter];
  const legDz = beamDepthZ / 2;

  legXPositions.forEach((lx) => {
    // Pedestal Beton Pengaman Tabrakan (Crash Barrier Plinth setinggi 1.1m)
    const plinth = new THREE.Mesh(
      new THREE.BoxGeometry(1.3, 1.1, beamDepthZ + 0.5),
      concretePlinthMat
    );
    plinth.position.set(lx, yRoad + 0.55, centerZ);
    plinth.castShadow = true;
    portalGroup.add(plinth);

    // Garis Hazard Hitam-Kuning di Sudut Pedestal
    const hazardStrip = new THREE.Mesh(
      new THREE.BoxGeometry(1.32, 0.25, beamDepthZ + 0.52),
      gantryYellowMat
    );
    hazardStrip.position.set(lx, yRoad + 0.95, centerZ);
    portalGroup.add(hazardStrip);

    // 2 Kolom Pipa Baja Struktural Berat per Menara (Ø 0.40m)
    [-legDz + 0.15, legDz - 0.15].forEach((pz) => {
      const colHeight = underbeamH + beamHeightY - 1.1;
      const colMesh = new THREE.Mesh(
        new THREE.CylinderGeometry(0.20, 0.22, colHeight, 16),
        gantrySteelMat
      );
      colMesh.position.set(lx, yRoad + 1.1 + colHeight / 2, centerZ + pz);
      colMesh.castShadow = true;
      portalGroup.add(colMesh);
    });

    // Rangka Diagonal Silang (X-Bracing) antar pilar tiang
    for (let h = yRoad + 1.8; h < beamYBottom; h += 1.4) {
      const braceH = new THREE.Mesh(
        new THREE.CylinderGeometry(0.06, 0.06, beamDepthZ - 0.2, 8),
        gantrySteelMat
      );
      braceH.rotation.x = Math.PI / 2;
      braceH.position.set(lx, h, centerZ);
      portalGroup.add(braceH);
    }
  });

  // ----------------------------------------------------------------------------
  // 2. Balok Rangka Baja Space-Truss Raksasa (Heavy-Duty Gantry Girder)
  // Dimensi: Bentang 17.6m x Kedalaman 1.2m x Tinggi 1.6m
  // ----------------------------------------------------------------------------
  const chordLength = spanWidth + 0.8;
  const chordGeo = new THREE.CylinderGeometry(0.12, 0.12, chordLength, 12);
  chordGeo.rotateZ(Math.PI / 2);

  // 4 Batang Utama Horizontal (Chords) di ke-4 sudut balok box
  const cornerZ = [-legDz + 0.15, legDz - 0.15];
  const cornerY = [beamYBottom + 0.12, beamYTop - 0.12];

  cornerZ.forEach((cz) => {
    cornerY.forEach((cy) => {
      const chord = new THREE.Mesh(chordGeo, gantrySteelMat);
      chord.position.set(midX, cy, centerZ + cz);
      chord.castShadow = true;
      portalGroup.add(chord);
    });
  });

  // Rangka Kisi Silang Vertikal (Vertical & Diagonal Lattice Truss pada Muka Depan & Belakang)
  const numTrussBays = 10;
  const bayWidth = spanWidth / numTrussBays;

  cornerZ.forEach((cz) => {
    for (let i = 0; i <= numTrussBays; i++) {
      const bx = xMedian + i * bayWidth;
      // Batang vertikal
      const vPost = new THREE.Mesh(
        new THREE.CylinderGeometry(0.06, 0.06, beamHeightY - 0.24, 8),
        gantrySteelMat
      );
      vPost.position.set(bx, beamYCenter, centerZ + cz);
      portalGroup.add(vPost);

      // Batang diagonal silang
      if (i < numTrussBays) {
        const diagLen = Math.hypot(bayWidth, beamHeightY - 0.24);
        const diagAngle = Math.atan2(beamHeightY - 0.24, bayWidth);
        const d1 = new THREE.Mesh(new THREE.CylinderGeometry(0.05, 0.05, diagLen, 8), gantrySteelMat);
        d1.rotation.z = (i % 2 === 0 ? 1 : -1) * (Math.PI / 2 - diagAngle);
        d1.position.set(bx + bayWidth / 2, beamYCenter, centerZ + cz);
        portalGroup.add(d1);
      }
    }
  });

  // ----------------------------------------------------------------------------
  // 3. Catwalk Platform & Handrail Pengaman Kuning di Atas Balok Gantry
  // ----------------------------------------------------------------------------
  const walkwayGeo = new THREE.BoxGeometry(spanWidth + 0.6, 0.08, beamDepthZ * 0.85);
  const walkwayMesh = new THREE.Mesh(walkwayGeo, gantrySteelMat);
  walkwayMesh.position.set(midX, beamYTop + 0.04, centerZ);
  portalGroup.add(walkwayMesh);

  // Safety Handrail Pipa Kuning (Tinggi 1.0m) di Depan dan Belakang Walkway
  [-legDz + 0.1, legDz - 0.1].forEach((hz) => {
    const railTop = new THREE.Mesh(
      new THREE.CylinderGeometry(0.03, 0.03, spanWidth + 0.6, 8),
      gantryYellowMat
    );
    railTop.rotateZ(Math.PI / 2);
    railTop.position.set(midX, beamYTop + 1.0, centerZ + hz);
    portalGroup.add(railTop);

    // Tiang-tiang stanchion handrail
    for (let ix = xMedian + 0.5; ix <= xOuter - 0.5; ix += 2.0) {
      const stanchion = new THREE.Mesh(
        new THREE.CylinderGeometry(0.03, 0.03, 0.95, 8),
        gantryYellowMat
      );
      stanchion.position.set(ix, beamYTop + 0.52, centerZ + hz);
      portalGroup.add(stanchion);
    }
  });

  // ----------------------------------------------------------------------------
  // 4. Konfigurasi Peralatan per Lajur (Lajur 4, 3, 2 = VGM | Lajur 1 = Non-VGM)
  // ----------------------------------------------------------------------------
  const lanes = [
    { id: 4, name: 'Delivery', x: 3.1, isVgm: true },
    { id: 3, name: 'Receiving', x: 6.7, isVgm: true },
    { id: 2, name: 'Receiving', x: 10.3, isVgm: true },
    { id: 1, name: 'Umum / Cuker', x: 13.9, isVgm: false }
  ];

  const faceZ = type === 'entry' ? centerZ - legDz - 0.08 : centerZ + legDz + 0.08;

  lanes.forEach((lane) => {
    // --------------------------------------------------------------------------
    // A. Lampu Lalu Lintas 3 Aspek Industri Pelabuhan (Traffic Light 1.2m x 0.4m)
    // --------------------------------------------------------------------------
    const tlHousing = new THREE.Mesh(new THREE.BoxGeometry(0.42, 1.15, 0.35), signalHousingMat);
    tlHousing.position.set(lane.x - 1.2, beamYCenter, faceZ + (type === 'entry' ? -0.15 : 0.15));
    portalGroup.add(tlHousing);

    // Lensa Sinyal LED (Merah - Kuning - Hijau)
    const lensRadius = 0.13;
    const lensZ = faceZ + (type === 'entry' ? -0.33 : 0.33);

    // Merah (Atas)
    const tlRed = new THREE.Mesh(new THREE.CircleGeometry(lensRadius, 16), signalRedMat);
    tlRed.position.set(lane.x - 1.2, beamYCenter + 0.35, lensZ);
    if (type === 'exit') tlRed.rotation.y = Math.PI;
    portalGroup.add(tlRed);

    // Kuning (Tengah)
    const tlYellow = new THREE.Mesh(new THREE.CircleGeometry(lensRadius, 16), signalYellowMat);
    tlYellow.position.set(lane.x - 1.2, beamYCenter, lensZ);
    if (type === 'exit') tlYellow.rotation.y = Math.PI;
    portalGroup.add(tlYellow);

    // Hijau (Bawah - Menyala aktif)
    const tlGreen = new THREE.Mesh(new THREE.CircleGeometry(lensRadius, 16), signalGreenMat);
    tlGreen.position.set(lane.x - 1.2, beamYCenter - 0.35, lensZ);
    if (type === 'exit') tlGreen.rotation.y = Math.PI;
    portalGroup.add(tlGreen);

    // --------------------------------------------------------------------------
    // B. Peralatan Khusus Lajur 2, 3, 4 (VGM Weigh-In-Motion & Optical OCR)
    // --------------------------------------------------------------------------
    if (lane.isVgm) {
      // 1. Overhead Optical Scanner & Laser Profiler Box
      // Menggantung di bawah balok gantry (klirens 5.4m, sangat presisi di atas kontainer 4.5m)
      const scannerGroup = new THREE.Group();
      scannerGroup.position.set(lane.x, beamYBottom - 0.35, centerZ);

      // Bracket gantungan baja tebal
      [-0.9, 0.9].forEach((hx) => {
        const hanger = new THREE.Mesh(new THREE.CylinderGeometry(0.05, 0.05, 0.7, 8), gantrySteelMat);
        hanger.position.set(hx, 0.25, 0);
        scannerGroup.add(hanger);
      });

      // Enclosure Scanner Putih Gagah (2.4m x 0.8m x 0.5m)
      const scannerBody = new THREE.Mesh(
        new THREE.BoxGeometry(2.4, 0.45, 0.85),
        equipmentWhiteMat
      );
      scannerBody.position.set(0, -0.10, 0);
      scannerBody.castShadow = true;
      scannerGroup.add(scannerBody);

      // Kamera OCR Sudut Ganda & Lampu Infrared
      [-0.75, 0.75].forEach((camX) => {
        const camPod = new THREE.Mesh(
          new THREE.CylinderGeometry(0.12, 0.12, 0.18, 12),
          scannerSensorMat
        );
        camPod.position.set(camX, -0.35, 0.15);
        scannerGroup.add(camPod);

        // Flash/Illuminator LED
        const lightPod = new THREE.Mesh(
          new THREE.BoxGeometry(0.20, 0.10, 0.15),
          gantryYellowMat
        );
        lightPod.position.set(camX, -0.32, -0.15);
        scannerGroup.add(lightPod);
      });

      portalGroup.add(scannerGroup);

      // 2. Display LED Digital Hasil Tonase VGM / Status Besar (2.6m x 0.85m)
      const displayCanvas = document.createElement('canvas');
      displayCanvas.width = 512;
      displayCanvas.height = 160;
      const ctx = displayCanvas.getContext('2d');

      ctx.fillStyle = '#050b14';
      ctx.fillRect(0, 0, 512, 160);

      // Frame Border Cyan
      ctx.strokeStyle = '#0284c7';
      ctx.lineWidth = 6;
      ctx.strokeRect(6, 6, 500, 148);

      if (type === 'entry') {
        ctx.fillStyle = '#f59e0b'; // Amber yellow
        ctx.font = 'bold 36px Inter, sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText(`LAJUR ${lane.id} • ${lane.name.toUpperCase()}`, 256, 55);

        ctx.fillStyle = '#22c55e'; // Green
        ctx.font = 'bold 42px monospace';
        ctx.fillText('VGM AUTO-SCAN READY', 256, 120);
      } else {
        ctx.fillStyle = '#38bdf8'; // Sky blue
        ctx.font = 'bold 32px Inter, sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText(`LAJUR ${lane.id} • VERIFIKASI SELESAI`, 256, 50);

        ctx.fillStyle = '#22c55e'; // Green
        ctx.font = 'bold 42px monospace';
        const sampleWeights = { 2: '28,450 KG [OK]', 3: '31,200 KG [OK]', 4: '26,800 KG [OK]' };
        ctx.fillText(`VGM: ${sampleWeights[lane.id] || 'VERIFIED'}`, 256, 118);
      }

      const displayTex = new THREE.CanvasTexture(displayCanvas);
      const displayMat = new THREE.MeshBasicMaterial({ map: displayTex });
      const displayMesh = new THREE.Mesh(new THREE.PlaneGeometry(2.6, 0.85), displayMat);
      displayMesh.position.set(lane.x + 0.35, beamYCenter, faceZ + (type === 'entry' ? -0.05 : 0.05));
      if (type === 'exit') displayMesh.rotation.y = Math.PI;
      portalGroup.add(displayMesh);

      // 3. Palang Pintu Otomatis (Auto-Gate Barrier) Kokoh dengan Bollard
      const barrierX = lane.x + 1.65;
      const barrierBase = new THREE.Mesh(
        new THREE.BoxGeometry(0.45, 1.25, 0.50),
        barrierOrangeMat
      );
      barrierBase.position.set(barrierX, yRoad + 0.625, centerZ);
      barrierBase.castShadow = true;
      portalGroup.add(barrierBase);

      // Pipa Bollard Pengaman Baja Kuning di Depan Motor Palang
      const bollard = new THREE.Mesh(
        new THREE.CylinderGeometry(0.08, 0.08, 0.90, 12),
        gantryYellowMat
      );
      bollard.position.set(barrierX, yRoad + 0.45, centerZ - 0.45);
      portalGroup.add(bollard);

      // Lengan Palang Pintu Putih-Merah (Tebal 0.12m)
      const armLen = 3.1;
      const barrierArm = new THREE.Mesh(
        new THREE.BoxGeometry(armLen, 0.12, 0.05),
        barrierPoleMat
      );
      barrierArm.position.set(barrierX - armLen / 2, yRoad + 0.95, centerZ + 0.25);
      portalGroup.add(barrierArm);

      // Garis Merah Reflektif Palang
      for (let s = 0.4; s < armLen - 0.3; s += 0.6) {
        const stripe = new THREE.Mesh(new THREE.PlaneGeometry(0.28, 0.12), barrierStripeRedMat);
        stripe.position.set(barrierX - s, yRoad + 0.95, centerZ + 0.28);
        if (type === 'exit') stripe.rotation.y = Math.PI;
        portalGroup.add(stripe);
      }
    } else {
      // --------------------------------------------------------------------------
      // C. Lajur 1 (Umum / Curah Kering): Rambu Ketinggian & Bebas VGM Besar
      // --------------------------------------------------------------------------
      const signCanvas = document.createElement('canvas');
      signCanvas.width = 512;
      signCanvas.height = 160;
      const ctx = signCanvas.getContext('2d');

      ctx.fillStyle = '#050b14';
      ctx.fillRect(0, 0, 512, 160);

      ctx.strokeStyle = '#f59e0b';
      ctx.lineWidth = 6;
      ctx.strokeRect(6, 6, 500, 148);

      ctx.fillStyle = '#f8fafc';
      ctx.font = 'bold 38px Inter, sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('LAJUR 1: CURAH / UMUM', 256, 58);

      ctx.fillStyle = '#38bdf8';
      ctx.font = 'bold 36px monospace';
      ctx.fillText('MAKS 4.5M • NON-VGM', 256, 118);

      const signTex = new THREE.CanvasTexture(signCanvas);
      const signMat = new THREE.MeshBasicMaterial({ map: signTex });
      const signMesh = new THREE.Mesh(new THREE.PlaneGeometry(2.6, 0.85), signMat);
      signMesh.position.set(lane.x + 0.35, beamYCenter, faceZ + (type === 'entry' ? -0.05 : 0.05));
      if (type === 'exit') signMesh.rotation.y = Math.PI;
      portalGroup.add(signMesh);
    }
  });

  return portalGroup;
}
