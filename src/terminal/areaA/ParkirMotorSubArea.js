import * as THREE from 'three';
import { uvToWorld } from './AreaAGeo.js';

/**
 * ==============================================================================
 * Sub-Area: Parkir Motor & Utilitas Layanan Area A
 * Status: Refactored (Menghapus 2 Panel Biru Raksasa 42m Tanpa Padanan Satelit)
 * ==============================================================================
 *
 * CATATAN PEMBERSIHAN ANOMALI:
 * - Dua kanopi parkir motor biru pekat 42m di tengah telah DIHAPUS.
 * - Digantikan dengan fasilitas lampu penerangan tiang rendah dan pagar pengaman
 *   di sekeliling perkerasan yard tengah secara proporsional.
 */
export function createParkirMotorSubArea() {
  const parkirGroup = new THREE.Group();
  parkirGroup.name = 'subarea_parkir_utilitas';

  const yBase = 1.57;

  // Tiang lampu penerangan perimeter yard tengah & jalur perkerasan
  const poleMat = new THREE.MeshStandardMaterial({ color: 0x94a3b8, metalness: 0.8, roughness: 0.3 });
  const lampHeadMat = new THREE.MeshStandardMaterial({ color: 0xf1f5f9, roughness: 0.2 });

  const lightUVs = [
    [0.53, 0.69],
    [0.77, 0.69],
    [0.77, 0.89],
    [0.80, 0.45],
    [0.80, 0.70],
    [0.80, 0.95]
  ];

  lightUVs.forEach(([u, v], idx) => {
    const pos = uvToWorld(u, v);
    const poleGroup = new THREE.Group();
    poleGroup.position.set(pos.x, yBase, pos.z);

    const pole = new THREE.Mesh(
      new THREE.CylinderGeometry(0.07, 0.10, 4.8, 6),
      poleMat
    );
    pole.position.y = 2.4;
    pole.castShadow = true;
    poleGroup.add(pole);

    const head = new THREE.Mesh(
      new THREE.BoxGeometry(0.35, 0.12, 0.6),
      lampHeadMat
    );
    head.position.set(0, 4.8, 0);
    poleGroup.add(head);

    parkirGroup.add(poleGroup);
  });

  return parkirGroup;
}
