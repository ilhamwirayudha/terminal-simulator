import * as THREE from 'three';

/**
 * ==============================================================================
 * Reusable Asset: Gardu Petugas & Pulau Gerbang (Gate Booth & Island)
 * ==============================================================================
 */

const boothConcreteMat = new THREE.MeshStandardMaterial({
  color: 0x94a3b8,
  roughness: 0.75,
  name: 'mat_booth_concrete'
});

const boothWallMat = new THREE.MeshStandardMaterial({
  color: 0xe2e8f0, // Light slate metal cladding
  roughness: 0.4,
  metalness: 0.3,
  name: 'mat_booth_wall'
});

const boothGlassMat = new THREE.MeshStandardMaterial({
  color: 0x38bdf8,
  roughness: 0.1,
  metalness: 0.9,
  transparent: true,
  opacity: 0.7,
  name: 'mat_booth_glass'
});

const redSignalMat = new THREE.MeshBasicMaterial({ color: 0xef4444 });
const greenSignalMat = new THREE.MeshBasicMaterial({ color: 0x22c55e });
const scannerPoleMat = new THREE.MeshStandardMaterial({ color: 0x1e293b, roughness: 0.5, metalness: 0.7 });

export function createGateBooth({
  x = 0,
  z = 0,
  yRoad = 1.631,
  laneWidth = 4.8,
  islandLength = 12.0,
  hasSignalGreen = true
} = {}) {
  const boothGroup = new THREE.Group();
  boothGroup.name = 'asset_gate_booth';

  const islandWidth = 0.9;
  const islandHeight = 0.25;

  // 1. Pulau Beton Pembatas (Curbed Island)
  const islandGeo = new THREE.BoxGeometry(islandWidth, islandHeight, islandLength);
  const island = new THREE.Mesh(islandGeo, boothConcreteMat);
  island.position.set(x, yRoad + islandHeight / 2, z);
  island.receiveShadow = true;
  island.castShadow = true;
  boothGroup.add(island);

  // 2. Gardu Petugas (Kiosk)
  const boothW = 0.82;
  const boothL = 2.8;
  const boothH = 2.4;
  const boothY = yRoad + islandHeight + boothH / 2;

  const boothBody = new THREE.Mesh(new THREE.BoxGeometry(boothW, boothH, boothL), boothWallMat);
  boothBody.position.set(x, boothY, z);
  boothBody.castShadow = true;
  boothGroup.add(boothBody);

  // Jendela Kaca Inspeksi
  const glassW = boothW + 0.02;
  const glassH = 0.9;
  const glassL = 2.2;
  const windowMesh = new THREE.Mesh(new THREE.BoxGeometry(glassW, glassH, glassL), boothGlassMat);
  windowMesh.position.set(x, boothY + 0.2, z);
  boothGroup.add(windowMesh);

  // Kanopi kecil pelindung jendela booth
  const kioskRoof = new THREE.Mesh(new THREE.BoxGeometry(boothW + 0.35, 0.1, boothL + 0.4), boothWallMat);
  kioskRoof.position.set(x, boothY + boothH / 2 + 0.05, z);
  boothGroup.add(kioskRoof);

  // 3. Tiang Lampu Sinyal & Scanner OCR
  const pole = new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.06, 3.2, 10), scannerPoleMat);
  pole.position.set(x, yRoad + 1.6, z + islandLength * 0.35);
  boothGroup.add(pole);

  // Kotak Lampu Sinyal (Merah/Hijau)
  const signalBox = new THREE.Mesh(new THREE.BoxGeometry(0.25, 0.45, 0.2), scannerPoleMat);
  signalBox.position.set(x, yRoad + 3.0, z + islandLength * 0.35);
  boothGroup.add(signalBox);

  const topLight = new THREE.Mesh(new THREE.SphereGeometry(0.08, 12, 12), hasSignalGreen ? greenSignalMat : redSignalMat);
  topLight.position.set(x, yRoad + 3.12, z + islandLength * 0.35 + 0.1);
  boothGroup.add(topLight);

  const btmLight = new THREE.Mesh(new THREE.SphereGeometry(0.08, 12, 12), hasSignalGreen ? redSignalMat : greenSignalMat);
  btmLight.position.set(x, yRoad + 2.88, z + islandLength * 0.35 + 0.1);
  boothGroup.add(btmLight);

  return boothGroup;
}
