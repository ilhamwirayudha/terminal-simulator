import * as THREE from 'three';
import { createSubAreaLahanCY } from './SubAreaLahanCY.js';
import { createSubAreaPohonPesisirCY } from './SubAreaPohonPesisirCY.js';
import { createSubAreaLapanganBaratCY } from './SubAreaLapanganBaratCY.js';
import { createSubAreaFasilitasCFS } from './SubAreaFasilitasCFS.js';
import { createSubAreaBlokUtamaASC } from './SubAreaBlokUtamaASC.js';
import { createSubAreaBlokCadanganSelatan } from './SubAreaBlokCadanganSelatan.js';
import { createSubAreaBlokTimurRTG } from './SubAreaBlokTimurRTG.js';

/**
 * ==============================================================================
 * Area: Container Yard Utama (Z: 1836.3 s/d 2478.4 | X: -21.4 s/d -676.1)
 * ==============================================================================
 * Menggabungkan seluruh sub-area fungsional Container Yard:
 * 1. Lahan Dasar & Jaringan Jalan Akses Internal CY (SubAreaLahanCY)
 * 2. Sabuk Pepohonan Pesisir Luar SW, SE, NE (SubAreaPohonPesisirCY)
 * 3. Lapangan Ekspansi Barat (SubAreaLapanganBaratCY)
 * 4. Kompleks CFS, Workshop, Terminal Office, Halte Bus & SPBU (SubAreaFasilitasCFS)
 * 5. 10 Baris Blok Utama + 20 Unit ASC Crane + Area Transfer R/D (SubAreaBlokUtamaASC)
 * 6. 5 Baris Blok Cadangan Selatan (SubAreaBlokCadanganSelatan)
 * 7. Koridor Reefer, Peralatan & Blok Timur + 2 Unit RTG Crane (SubAreaBlokTimurRTG)
 */
export function createContainerYardArea(scene) {
  const cyAreaGroup = new THREE.Group();
  cyAreaGroup.name = 'area_container_yard';

  cyAreaGroup.add(createSubAreaLahanCY());
  cyAreaGroup.add(createSubAreaPohonPesisirCY());
  cyAreaGroup.add(createSubAreaLapanganBaratCY());
  cyAreaGroup.add(createSubAreaFasilitasCFS());
  cyAreaGroup.add(createSubAreaBlokUtamaASC());
  cyAreaGroup.add(createSubAreaBlokCadanganSelatan());
  cyAreaGroup.add(createSubAreaBlokTimurRTG());

  if (scene) {
    scene.add(cyAreaGroup);
  }

  return cyAreaGroup;
}
