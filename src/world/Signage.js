import * as THREE from 'three';

/**
 * ==============================================================================
 * Simple Wooden Roadside Signboard System (ENTRY / EXIT)
 * ==============================================================================
 *
 * Places simple rustic wooden signposts on the grass verge right next to the highway:
 * - SISI KIRI (X = -18.5): Papan Kayu bertuliskan "ENTRY"
 * - SISI KANAN (X = +18.5): Papan Kayu bertuliskan "EXIT"
 */

// Helper to generate realistic wooden plank texture with bold text
function createWoodSignTexture(type = 'ENTRY') {
  const canvas = document.createElement('canvas');
  canvas.width = 1024;
  canvas.height = 512;
  const ctx = canvas.getContext('2d');

  // 1. Wood Planks Background Gradient
  const woodBaseColor = type === 'ENTRY' ? '#b45309' : '#c2410c'; // Warm rich wood tones
  const grad = ctx.createLinearGradient(0, 0, 0, 512);
  grad.addColorStop(0, '#78350f');
  grad.addColorStop(0.3, '#92400e');
  grad.addColorStop(0.7, '#b45309');
  grad.addColorStop(1, '#78350f');
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, 1024, 512);

  // 2. Horizontal Wood Plank Separators
  const plankHeights = [0, 128, 256, 384, 512];
  ctx.strokeStyle = '#451a03';
  ctx.lineWidth = 6;
  plankHeights.forEach(y => {
    ctx.beginPath();
    ctx.moveTo(0, y);
    ctx.lineTo(1024, y);
    ctx.stroke();
  });

  // 3. Subtle Wood Grain Lines
  ctx.fillStyle = 'rgba(69, 26, 3, 0.15)';
  for (let i = 0; i < 40; i++) {
    const y = Math.random() * 512;
    const h = 2 + Math.random() * 6;
    ctx.fillRect(0, y, 1024, h);
  }

  // 4. Nail / Bolt Details in Planks
  const nailPositions = [
    { x: 40, y: 64 }, { x: 984, y: 64 },
    { x: 40, y: 192 }, { x: 984, y: 192 },
    { x: 40, y: 320 }, { x: 984, y: 320 },
    { x: 40, y: 448 }, { x: 984, y: 448 }
  ];
  ctx.fillStyle = '#292524';
  nailPositions.forEach(n => {
    ctx.beginPath();
    ctx.arc(n.x, n.y, 8, 0, Math.PI * 2);
    ctx.fill();
  });

  // 5. Bold High-Contrast Text
  const isEntry = type === 'ENTRY';
  const text = isEntry ? 'ENTRY' : 'EXIT';
  const arrow = isEntry ? '▲' : '▼';

  // Text Shadow / Outline for Maximum Readability
  ctx.font = '900 130px "Arial Black", sans-serif';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';

  ctx.strokeStyle = '#1c1917';
  ctx.lineWidth = 18;
  ctx.strokeText(`${arrow} ${text} ${arrow}`, 512, 256);

  // Text Fill (Bright White with subtle warm tint)
  ctx.fillStyle = isEntry ? '#ffffff' : '#fef08a';
  ctx.fillText(`${arrow} ${text} ${arrow}`, 512, 256);

  // Subtitle / Direction indicator
  ctx.font = 'bold 36px Arial, sans-serif';
  ctx.fillStyle = '#fef3c7';
  const subText = isEntry ? 'TERMINAL TELUK LAMONG' : 'TOL SURABAYA / GRESIK';
  ctx.fillText(subText, 512, 400);

  const texture = new THREE.CanvasTexture(canvas);
  texture.anisotropy = 8;
  texture.needsUpdate = true;
  return texture;
}

// Cached Textures
const entryTexture = createWoodSignTexture('ENTRY');
const exitTexture = createWoodSignTexture('EXIT');

// Shared Materials
const woodPostMat = new THREE.MeshStandardMaterial({
  color: 0x5c3a21,
  roughness: 0.9,
  metalness: 0.05
});

const woodBackMat = new THREE.MeshStandardMaterial({
  color: 0x78350f,
  roughness: 0.95
});

/**
 * Builds a single wooden signpost 3D object
 */
function createWoodenSignpost(type = 'ENTRY', rotationY = 0) {
  const group = new THREE.Group();
  const texture = type === 'ENTRY' ? entryTexture : exitTexture;

  const boardWidth = 4.8;
  const boardHeight = 2.4;
  const boardDepth = 0.16;
  const postHeight = 4.2;

  // 1. Single Center Wooden Post
  const postGeo = new THREE.BoxGeometry(0.35, postHeight, 0.35);
  const post = new THREE.Mesh(postGeo, woodPostMat);
  post.position.set(0, postHeight / 2 + 0.8, 0);
  post.castShadow = true;
  group.add(post);

  // 2. Wooden Board Backing Box
  const boardGeo = new THREE.BoxGeometry(boardWidth, boardHeight, boardDepth);
  const board = new THREE.Mesh(boardGeo, woodBackMat);
  board.position.set(0, postHeight + 0.8 - boardHeight / 2, 0);
  board.castShadow = true;
  group.add(board);

  // 3. Front Decal (Wood Texture + Text)
  const decalMat = new THREE.MeshBasicMaterial({
    map: texture,
    side: THREE.DoubleSide
  });

  const frontDecal = new THREE.Mesh(new THREE.PlaneGeometry(boardWidth, boardHeight), decalMat);
  frontDecal.position.set(0, postHeight + 0.8 - boardHeight / 2, boardDepth / 2 + 0.01);
  group.add(frontDecal);

  // 4. Back Decal (Visible from opposite direction)
  const backDecal = new THREE.Mesh(new THREE.PlaneGeometry(boardWidth, boardHeight), decalMat);
  backDecal.rotation.y = Math.PI;
  backDecal.position.set(0, postHeight + 0.8 - boardHeight / 2, -(boardDepth / 2 + 0.01));
  group.add(backDecal);

  group.rotation.y = rotationY;
  return group;
}

/**
 * Creates and places the wooden signposts along the grass verge
 */
export function createHighwaySignage(scene) {
  const signageGroup = new THREE.Group();
  signageGroup.name = 'ttl_wooden_signposts';

  // ----------------------------------------------------------------------------
  // Di Three.js: +X = KIRI layar (sisi ENTRY / MASUK ke kantor)
  //              -X = KANAN layar (sisi EXIT / KELUAR dari kantor)
  // ----------------------------------------------------------------------------

  // 1. SISI KIRI LAYAR (X = +18.5): JALUR MASUK (ENTRY)
  // ----------------------------------------------------------------------------
  const entryPositions = [
    { x: 18.5, z: -670 }, // Pangkal Segmen 1 (Dekat Kota)
    { x: 18.5, z: -280 }, // Pertengahan Segmen 2
    { x: 18.5, z: -70  }  // Segmen 4 (Dekat Jembatan Laut)
  ];

  entryPositions.forEach(pos => {
    const sign = createWoodenSignpost('ENTRY', 0);
    sign.position.set(pos.x, 0, pos.z);
    signageGroup.add(sign);
  });

  // 2. SISI KANAN LAYAR (X = -18.5): JALUR KELUAR (EXIT)
  // ----------------------------------------------------------------------------
  const exitPositions = [
    { x: -18.5, z: -670 }, // Pangkal Segmen 1 (Menuju Kota)
    { x: -18.5, z: -280 }, // Pertengahan Segmen 2
    { x: -18.5, z: -70  }  // Segmen 4 (Dekat Jembatan Laut)
  ];

  exitPositions.forEach(pos => {
    const sign = createWoodenSignpost('EXIT', 0);
    sign.position.set(pos.x, 0, pos.z);
    signageGroup.add(sign);
  });

  scene.add(signageGroup);
  return signageGroup;
}
