import * as THREE from 'three';

/**
 * ==============================================================================
 * Reusable Asset: Kanopi Gerbang Pre-Gate (Pre-Gate Entrance Canopy)
 * ==============================================================================
 * Struktur kanopi gerbang lengkung ikonik putih yang menaungi 4 lajur masuk
 * menuju Terminal Teluk Lamong, lengkap dengan tiang penyangga, atap lengkung,
 * dan gardu pemeriksaan/toll booth di bawahnya.
 */

// Shared PBR Materials
const canopyWhiteMat = new THREE.MeshStandardMaterial({
  color: 0xf1f5f9, // Crisp white composite panel
  roughness: 0.35,
  metalness: 0.15,
  name: 'mat_pre_gate_canopy_white'
});

const canopyTrussMat = new THREE.MeshStandardMaterial({
  color: 0x475569, // Slate steel truss / framing
  roughness: 0.5,
  metalness: 0.7,
  name: 'mat_pre_gate_canopy_truss'
});

const boothConcreteMat = new THREE.MeshStandardMaterial({
  color: 0x94a3b8,
  roughness: 0.7,
  metalness: 0.2,
  name: 'mat_pre_gate_booth_concrete'
});

const boothGlassMat = new THREE.MeshStandardMaterial({
  color: 0x1e293b,
  roughness: 0.1,
  metalness: 0.9,
  transparent: true,
  opacity: 0.6,
  name: 'mat_pre_gate_booth_glass'
});

export function createPreGateCanopy({
  xStart = 1.3,   // Tepi median dalam
  xEnd = 16.9,    // Tepi luar lajur 4
  centerZ = 955,  // Posisi Z di sepanjang koridor Jalan Pre-Gate
  length = 26,    // Panjang kanopi sepanjang jalan (arah Z)
  height = 8.2    // Ketinggian puncak lengkung atap
} = {}) {
  const canopyGroup = new THREE.Group();
  canopyGroup.name = 'asset_pre_gate_canopy';

  const width = Math.abs(xEnd - xStart);
  const midX = (xStart + xEnd) / 2;

  // ----------------------------------------------------------------------------
  // 1. Atap Lengkung Barrel Vault (Cylindrical Arch)
  // ----------------------------------------------------------------------------
  const archSegments = 20;
  const archShape = new THREE.Shape();
  const baseH = 5.2; // Ketinggian klirens truk terendah di tepi
  const crownH = height; // Puncak kanopi di tengah

  // Profil busur lengkung kanopi (tampak depan melintang jalan)
  archShape.moveTo(-width / 2 - 0.6, baseH);
  for (let i = 0; i <= archSegments; i++) {
    const t = i / archSegments;
    const curX = -width / 2 - 0.6 + t * (width + 1.2);
    // Parabola melengkung
    const curY = baseH + (crownH - baseH) * Math.sin(t * Math.PI);
    archShape.lineTo(curX, curY);
  }
  archShape.lineTo(width / 2 + 0.6, baseH - 0.4);
  for (let i = archSegments; i >= 0; i--) {
    const t = i / archSegments;
    const curX = -width / 2 - 0.6 + t * (width + 1.2);
    const curY = (baseH - 0.4) + (crownH - baseH) * Math.sin(t * Math.PI);
    archShape.lineTo(curX, curY);
  }
  archShape.closePath();

  const extrudeSettings = {
    steps: 1,
    depth: length,
    bevelEnabled: true,
    bevelThickness: 0.3,
    bevelSize: 0.2,
    bevelSegments: 2
  };

  const archGeo = new THREE.ExtrudeGeometry(archShape, extrudeSettings);
  const archMesh = new THREE.Mesh(archGeo, canopyWhiteMat);
  // Pusatkan di Z
  archMesh.position.set(midX, 0, centerZ - length / 2);
  archMesh.castShadow = true;
  archMesh.receiveShadow = true;
  canopyGroup.add(archMesh);

  // ----------------------------------------------------------------------------
  // 2. Kolom Tiang Penyangga Utama (Pilar Baja Silinder)
  // ----------------------------------------------------------------------------
  const pillarGeo = new THREE.CylinderGeometry(0.45, 0.55, baseH + 0.5, 16);

  // Tiang sisi median (X dalam) dan sisi luar (X luar)
  [-length / 2 + 3.0, 0, length / 2 - 3.0].forEach((pz) => {
    // Sisi Median
    const pMedian = new THREE.Mesh(pillarGeo, canopyTrussMat);
    pMedian.position.set(xStart + 0.35, (baseH + 0.5) / 2, centerZ + pz);
    pMedian.castShadow = true;
    canopyGroup.add(pMedian);

    // Sisi Luar
    const pOuter = new THREE.Mesh(pillarGeo, canopyTrussMat);
    pOuter.position.set(xEnd - 0.35, (baseH + 0.5) / 2, centerZ + pz);
    pOuter.castShadow = true;
    canopyGroup.add(pOuter);
  });

  // ----------------------------------------------------------------------------
  // 3. Gardu / Island Booth Pemeriksaan Truk di Bawah Kanopi (3 Island Pemisah)
  // ----------------------------------------------------------------------------
  const islandWidth = 1.0;
  const islandLength = length * 0.75;
  const laneWidth = (width - 3 * islandWidth) / 4; // Lebar bersih 4 lajur

  [1, 2, 3].forEach((laneIdx) => {
    const islandX = xStart + laneIdx * laneWidth + (laneIdx - 0.5) * islandWidth;

    // Pulau pembatas beton
    const islandBase = new THREE.Mesh(
      new THREE.BoxGeometry(islandWidth, 0.35, islandLength),
      boothConcreteMat
    );
    islandBase.position.set(islandX, 1.63 + 0.175, centerZ);
    islandBase.castShadow = true;
    islandBase.receiveShadow = true;
    canopyGroup.add(islandBase);

    // Pos gardu kaca kecil di atas pulau beton
    const boothBody = new THREE.Mesh(
      new THREE.BoxGeometry(islandWidth * 0.8, 2.4, 3.6),
      boothGlassMat
    );
    boothBody.position.set(islandX, 1.63 + 0.35 + 1.2, centerZ);
    boothBody.castShadow = true;
    canopyGroup.add(boothBody);
  });

  // ----------------------------------------------------------------------------
  // 4. Papan Fascia Plang Nama Gerbang Pre-Gate
  // ----------------------------------------------------------------------------
  const canvas = document.createElement('canvas');
  canvas.width = 1024;
  canvas.height = 128;
  const ctx = canvas.getContext('2d');
  ctx.fillStyle = '#0f172a'; // Dark slate banner
  ctx.fillRect(0, 0, 1024, 128);
  ctx.fillStyle = '#f8fafc';
  ctx.font = 'bold 44px Inter, sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText('GERBANG PRE-GATE TELUK LAMONG', 512, 78);

  const signTex = new THREE.CanvasTexture(canvas);
  const signMat = new THREE.MeshBasicMaterial({ map: signTex });
  const signBoard = new THREE.Mesh(new THREE.PlaneGeometry(width * 0.85, 1.8), signMat);
  signBoard.position.set(midX, baseH + 1.2, centerZ - length / 2 - 0.32);
  canopyGroup.add(signBoard);

  return canopyGroup;
}
