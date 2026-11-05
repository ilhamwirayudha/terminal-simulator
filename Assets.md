# Standar Arsitektur & Pedoman Pengembangan: Terminal 3D Simulator

Dokumen ini merupakan pedoman wajib dan aturan tetap bagi agen/pengembang dalam membangun dunia 3D simulator Terminal Teluk Lamong (TTL).

> [!NOTE]
> Roadmap fase, konvensi koordinat (lat/lon sebagai jangkar), dan daftar kode legacy ada di [prd.md](prd.md). Dokumen ini hanya mengatur aturan kode dan struktur folder.

---

## 1. Aturan Penamaan Wilayah (Kamus Resmi)

> [!CAUTION]
> **DILARANG MENGGUNAKAN ISTILAH "PULAU 1"**.
> Istilah tersebut sudah resmi dihapus dari codebase dan dokumentasi karena tidak sesuai dengan topografi nyata pulau reklamasi Terminal Teluk Lamong.

* **Root Peta 3D:** Seluruh dunia 3D ini disebut sebagai **"Terminal"**.
* **Pembagian Area Makro (Level 1):**
  * **Jalan** (`src/terminal/jalan/`: Seluruh jaringan jalan dan gerbang akses di terminal, meliputi Akses Osowilangun, Jembatan Laut / Causeway, Jalan Pre-Gate, Main Gate & Kanopi Utama, serta Jalan Koridor Pasca Gate dengan Median Pohon & Median Kontainer).
  * **Buffer Area / Zona Penyangga Barat** (`src/terminal/bufferArea/`: Kawasan penyangga pra-gerbang di sisi barat laut koridor jalan masuk, mencakup IPAL, shelter supir, parkir motor, waiting area truk petikemas Blok TR 2-4, waiting area truk curah kering Blok TR 5, dan sabuk hutan mangrove pesisir).
  * **Container Yard Utama** (`src/terminal/containerYard/`: Rencana pengembangan, **Fase 2** - Lapangan penumpukan petikemas Blok 1 s/d Blok 4, rel Automated Stacking Cranes / ASC, reefer yard, dan empty yard).
  * **Dermaga / Berth Lepas Pantai** (`src/terminal/dermaga/`: Rencana pengembangan, **Fase 3** - Jembatan trestle laut, dermaga petikemas & curah kering, dan Ship-to-Shore / STS cranes).
  * **Terminal Curah Kering** (`src/terminal/curahKering/`: Rencana pengembangan, **Fase 4** - Kompleks silo gandum/kedelai, dome warehouse, dan jembatan konveyor layang).
  * **Kantor Utama / Head Office** (`src/terminal/kantor/`: Rencana pengembangan, **Fase 6** - Gedung Graha Pelindo, masjid, lapangan olahraga, dan plaza parkir kantor).
* **Tempat / Sub-Wilayah (Level 2 & 3):**
  * Tempat-tempat spesifik di dalam masing-masing Area.
  * Setiap tempat spesifik **wajib memiliki file terpisah** dengan penamaan Bahasa Indonesia (`SubArea...js` & `Geo...js`) agar modular, mudah di-maintain, dan tidak menjadi file monolitik raksasa.

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
├── assets/                     <-- PUSTAKA ASSET (Dibuat dulu di sini)
│   ├── materials/              # Shared PBR materials (aspal, beton, baja, kaca, rumput)
│   ├── infrastructure/         # Lampu jalan, rambu, pagar BRC, pembatas beton, kanopi & booth gate
│   ├── buildings/              # Pos satpam, shelter supir, modul gedung, gardu listrik
│   ├── industrial/             # Tangki IPAL/BBM, rak pipa, genset
│   ├── nature/                 # Pohon palem, semak, vegetasi, mangrove, pita pohon tepi jalan
│   ├── containers/             # createContainer: standar dimensi kontainer 20ft/40ft & InstancedMesh
│   └── vehicles/               # (Rencana Fase 2) createContainerTruck: standar dimensi truk tunggal
│
└── terminal/                   <-- SELURUH DUNIA 3D TERMINAL
    │
    ├── jalan/                  <-- Area: Seluruh Jaringan Jalan, Jembatan & Gerbang Utama
    │   ├── index.js            # Coordinator Area Jalan
    │   ├── JalanAksesOsowilangun.js
    │   ├── JembatanLaut.js
    │   ├── JalanPreGate.js
    │   ├── mainGate/           # Sub-Klaster: Jalan & Kanopi Main Gate (Z: 1168 - 1699)
    │   │   ├── index.js
    │   │   ├── GeoMainGate.js
    │   │   ├── SubAreaJalanMainGate.js
    │   │   ├── SubAreaKanopiMainGate.js
    │   │   └── SubAreaPohonTepi.js
    │   └── pascaGate/          # Sub-Klaster: Koridor Jalan Pasca Gate, Median Pohon & Kontainer (Z: 1699 - 2436)
    │       ├── index.js
    │       ├── GeoPascaGate.js
    │       ├── SubAreaJalanPascaGate.js
    │       ├── SubAreaMedianPohon.js
    │       ├── SubAreaMedianKontainer.js
    │       └── SubAreaPohonPascaGate.js
    │
    └── bufferArea/             <-- Area: Zona Penyangga & Fasilitas Barat
        ├── index.js            # Coordinator Utama Buffer Area
        │
        ├── utilitas/           # Sub-Klaster: Fasilitas Utilitas & Pendukung (Z: 604.5 - 775)
        │   ├── index.js
        │   ├── GeoUtilitas.js
        │   ├── SubAreaIpal.js
        │   ├── SubAreaShelter.js
        │   ├── SubAreaParkirMotor.js
        │   └── SubAreaMangrove.js
        │
        ├── waitingCY/          # Sub-Klaster: Waiting Area Truk Petikemas (Z: 775 - 1034)
        │   ├── index.js
        │   ├── GeoWaitingCY.js
        │   ├── SubAreaAksesJalan.js
        │   ├── SubAreaWaitingCY.js
        │   ├── SubAreaBlokTR.js
        │   ├── SubAreaJalurSupir.js
        │   └── SubAreaMangrovePesisir.js
        │
        └── waitingCuker/       # Sub-Klaster: Waiting Area Truk Curah Kering (Z: 1034 - 1220+)
            ├── index.js
            ├── GeoCuker.js
            ├── SubAreaPerkerasanCuker.js
            ├── SubAreaMarkaCuker.js
            ├── SubAreaBlokTR5.js
            ├── SubAreaArmadaCuker.js
            └── SubAreaFasilitasCuker.js
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

### B. Format File Tempat Spesifik (`src/terminal/bufferArea/utilitas/SubAreaIpal.js`)
File tempat hanya mengimpor asset dan menempatkannya:

```javascript
// Contoh: src/terminal/bufferArea/utilitas/SubAreaIpal.js
import * as THREE from 'three';
import { uvToWorld, BUILDINGS_CONFIG } from './GeoUtilitas.js';

export function createSubAreaIpal() {
  const group = new THREE.Group();
  group.name = 'subarea_ipal_utilitas';

  // Penempatan objek / aset
  ...

  return group;
}
```

### C. Format Coordinator Sub-Klaster (`src/terminal/bufferArea/utilitas/index.js`)
Mengumpulkan semua tempat di dalam sub-klaster:

```javascript
import * as THREE from 'three';
import { createSubAreaIpal } from './SubAreaIpal.js';
import { createSubAreaShelter } from './SubAreaShelter.js';

export function createUtilitasArea(scene = null) {
  const group = new THREE.Group();
  group.name = 'subarea_utilitas';

  group.add(createSubAreaIpal());
  group.add(createSubAreaShelter());

  return group;
}
```

### D. Format Coordinator Utama Area (`src/terminal/bufferArea/index.js`)
Menggabungkan seluruh sub-klaster menjadi satu kesatuan:

```javascript
import * as THREE from 'three';
import { createUtilitasArea } from './utilitas/index.js';
import { createWaitingCYArea } from './waitingCY/index.js';
import { createWaitingCukerArea } from './waitingCuker/index.js';

export function createBufferArea(scene = null) {
  const bufferGroup = new THREE.Group();
  bufferGroup.name = 'area_buffer_barat';

  bufferGroup.add(createUtilitasArea());
  bufferGroup.add(createWaitingCYArea());
  bufferGroup.add(createWaitingCukerArea());

  if (scene) {
    scene.add(bufferGroup);
  }

  return bufferGroup;
}
```

---

## 5. Ringkasan Checklist untuk Agen

Sebelum menulis atau merefaktor kode:
- [ ] Apakah ada penyebutan istilah lama yang dilarang ("Pulau 1")? Jika ada, ganti dengan konteks **Terminal** atau Area yang tepat.
- [ ] Apakah objek 3D yang akan dibuat sudah ada di `src/assets/`? Jika belum, buat asetnya dulu di folder asset.
- [ ] Apakah tempat spesifik dibuat dalam file terpisah dengan konvensi penamaan Bahasa Indonesia (`SubArea...js` & `Geo...js`)?
- [ ] Apakah file area bertindak sebagai penggabung (*coordinator*) dari tempat-tempat di dalamnya?
- [ ] Untuk area baru: apakah `Geo*.js` mencantumkan 2-4 titik sudut lat/lon sumbernya, dan batas UV diturunkan dari titik itu lewat `GeoProjection` (lihat prd.md bagian 3.2)?
- [ ] Apakah kontainer dan truk memakai aset standar tunggal (`createContainer`, `createContainerTruck`) dan bukan dimensi yang ditulis ulang?
