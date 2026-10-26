# Standar Arsitektur & Pedoman Pengembangan: Terminal 3D Simulator

Dokumen ini merupakan pedoman wajib dan aturan tetap bagi agen/pengembang dalam membangun dunia 3D simulator Terminal Teluk Lamong (TTL).

---

## 1. Aturan Penamaan Wilayah (Kamus Resmi)

> [!CAUTION]
> **DILARANG MENGGUNAKAN ISTILAH "PULAU 1"**.
> Istilah tersebut sudah resmi dihapus dari codebase dan dokumentasi.

* **Root Peta 3D:** Seluruh dunia 3D ini disebut sebagai **"Terminal"**.
* **Pembagian Area (Level 1):**
  * **Jalan** (Seluruh jaringan jalan, jembatan penghubung laut, dsb.)
  * **Head Office** (Gedung kantor utama Graha Pelindo, plaza, parkiran, pos satpam kantor, dsb.)
  * **Area A** (Zona utilitas, IPAL, gardu daya, tangki, dsb.)
  * *Area lain sesuai pengembangan berikutnya (misal: Area B, Dermaga/Berth, dll.)*
* **Tempat / Sub-Wilayah (Level 2):**
  * Tempat-tempat spesifik di dalam masing-masing Area.
  * Setiap tempat spesifik **wajib memiliki file terpisah** agar modular, mudah di-maintain, dan tidak menjadi file monolitik raksasa.

---

## 2. Prinsip "Asset Dibuat Dulu" (Reusable Asset-First)

> [!IMPORTANT]
> **JANGAN PERNAH** menulis ulang kode geometri (`BoxGeometry`, `CylinderGeometry`, dsb.) dan material berulang-ulang langsung di dalam file area/tempat untuk objek yang sama.

1. **Buat Asset Terlebih Dahulu**:
   * Setiap objek (lampu jalan, rambu lalu lintas, pohon, pagar BRC, pos jaga, tangki silinder, kontainer, dsb.) harus dibuat sebagai modul/fungsi tersendiri di dalam direktori `src/assets/` atau `src/world/assets/`.
2. **Efisiensi Memori Three.js**:
   * Asset harus memanfaatkan shared materials atau shared geometries (atau `THREE.InstancedMesh` jika jumlahnya sangat banyak) agar GPU VRAM tidak terbebani secara berlebihan.
3. **Panggil di File Tempat**:
   * File tempat/area hanya bertugas:
     1. Mengimpor asset yang dibutuhkan.
     2. Menentukan posisi (`x, y, z`), rotasi, atau skala sesuai koordinat nyata (*ground truth*).
     3. Menambahkannya ke grup tempat tersebut.

---

## 3. Struktur Direktori yang Direkomendasikan

```text
src/
│
├── assets/                     <-- PUSTAKA ASSET (Dibuat dulu di sini)
│   ├── materials/              # Shared PBR materials (aspal, beton, baja, kaca, rumput)
│   ├── infrastructure/         # Lampu jalan, rambu, pagar BRC, pembatas beton (jersey barrier)
│   ├── buildings/              # Pos satpam, modul gedung, gardu listrik
│   ├── industrial/             # Tangki IPAL/BBM, rak pipa, genset
│   └── nature/                 # Pohon palem, semak, vegetasi
│
└── terminal/                   <-- SELURUH DUNIA 3D TERMINAL
    ├── TerminalRoot.js         # Menggabungkan seluruh Area ke dalam scene utama
    │
    ├── jalan/                  <-- Area: Jalan
    │   ├── index.js            # Coordinator Area Jalan
    │   ├── JembatanLaut.js     # Sub: Jembatan penghubung laut
    │   └── KoridorDarat.js     # Sub: Jalan akses darat & putaran
    │
    ├── headOffice/             <-- Area: Head Office
    │   ├── index.js            # Coordinator Area Head Office
    │   ├── GedungUtama.js      # Sub: Gedung Graha Pelindo
    │   ├── AreaParkir.js       # Sub: Lahan parkir mobil & motor
    │   └── GerbangKantor.js    # Sub: Pos masuk kantor & drop-off
    │
    └── areaA/                  <-- Area: Area A
        ├── index.js            # Coordinator Area A
        ├── TempatUtilitasIpal.js # Sub: Fasilitas IPAL & pengolahan air
        ├── TempatGarduListrik.js # Sub: Gardu induk PLN / Substation
        └── TempatTangkiBBM.js  # Sub: Area tangki penyimpanan
```

---

## 4. Standar Penulisan Kode

### A. Format Pembuatan Asset (`src/assets/...`)
Asset harus berupa fungsi yang menerima konfigurasi opsional (transformasi/parameter) dan mengembalikan `THREE.Group` atau `THREE.Mesh`:

```javascript
// Contoh: src/assets/infrastructure/createStreetLight.js
import * as THREE from 'three';
import { getSharedMaterial } from '../materials/sharedMaterials.js';

export function createStreetLight({ height = 8, poleColor = 0x94a3b8 } = {}) {
  const lightGroup = new THREE.Group();
  lightGroup.name = 'asset_street_light';

  // Gunakan shared geometry/material jika memungkinkan
  const poleGeo = new THREE.CylinderGeometry(0.08, 0.12, height, 8);
  const poleMat = getSharedMaterial('galvanizedSteel');
  const pole = new THREE.Mesh(poleGeo, poleMat);
  pole.position.y = height / 2;
  lightGroup.add(pole);

  return lightGroup;
}
```

### B. Format File Tempat Spesifik (`src/terminal/areaA/TempatUtilitasIpal.js`)
File tempat hanya mengimpor asset dan menempatkannya:

```javascript
// Contoh: src/terminal/areaA/TempatUtilitasIpal.js
import * as THREE from 'three';
import { createStorageTank } from '../../assets/industrial/createStorageTank.js';
import { createSecurityPost } from '../../assets/buildings/createSecurityPost.js';

export function createTempatUtilitasIpal() {
  const group = new THREE.Group();
  group.name = 'subarea_tempat_utilitas_ipal';

  // Penempatan Asset 1
  const tankA = createStorageTank({ radius: 3.5, height: 9 });
  tankA.position.set(120, 0, -450);
  group.add(tankA);

  // Penempatan Asset 2
  const posSatpam = createSecurityPost();
  posSatpam.position.set(110, 0, -440);
  group.add(posSatpam);

  return group;
}
```

### C. Format Coordinator Area (`src/terminal/areaA/index.js`)
Mengumpulkan semua tempat di dalam area tersebut:

```javascript
import * as THREE from 'three';
import { createTempatUtilitasIpal } from './TempatUtilitasIpal.js';
import { createTempatGarduListrik } from './TempatGarduListrik.js';

export function createAreaA() {
  const areaGroup = new THREE.Group();
  areaGroup.name = 'area_A';

  areaGroup.add(createTempatUtilitasIpal());
  areaGroup.add(createTempatGarduListrik());

  return areaGroup;
}
```

---

## 5. Ringkasan Checklist untuk Agen

Sebelum menulis atau merefaktor kode:
- [ ] Apakah ada penyebutan istilah lama yang dilarang ("Pulau 1")? Jika ada, ganti dengan konteks **Terminal** atau Area yang tepat.
- [ ] Apakah objek 3D yang akan dibuat sudah ada di `src/assets/`? Jika belum, buat asetnya dulu di folder asset.
- [ ] Apakah tempat spesifik dibuat dalam file terpisah di dalam foldernya masing-masing?
- [ ] Apakah file area bertindak sebagai penggabung (*coordinator*) dari tempat-tempat di dalamnya?
