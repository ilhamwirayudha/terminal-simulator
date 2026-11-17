# Standar Arsitektur, Pustaka Aset & Pedoman Pengembangan: Terminal 3D Simulator

Dokumen ini merupakan pedoman wajib dan katalog teknis aset 3D bagi agen/pengembang dalam memelihara dan mengembangkan dunia 3D **Terminal Teluk Lamong (TTL) 3D Operation Simulator**.

> [!NOTE]
> Ringkasan produk, tujuan, kebutuhan fungsional/non-fungsional, serta daftar sektor operasional ada di [prd.md](prd.md). Panduan menjalankan proyek ada di [README.md](../README.md).

---

## 1. Aturan Penamaan Wilayah (Kamus Resmi)


* **Root Peta 3D:** Seluruh dunia 3D ini disebut sebagai **"Terminal"**.
* **Pembagian Area Makro (Level 1 — `src/terminal/`):**
  * **Jalan** (`src/terminal/jalan/`): Seluruh jaringan jalan dan gerbang akses di terminal, meliputi Akses Darat Osowilangun, Jembatan Laut Melengkung (`680 m`), Jalan Pre-Gate (kanopi & 3 portal WIM), Main Gate & Kanopi Utama, serta Koridor Jalan Pasca-Gate dengan Median Pohon & Median Kontainer.
  * **Buffer Area / Zona Penyangga Barat** (`src/terminal/bufferArea/`): Kawasan penyangga pra-gerbang di sisi barat laut koridor jalan masuk, mencakup klaster Utilitas (IPAL, shelter supir, parkir motor, mangrove), Waiting CY (Waiting Area A/B 66 slot, Blok TR 2 & TR 4, jalur supir, mangrove pesisir), serta Waiting Curah Kering (Blok TR 5, armada dump truck tronton, fasilitas operasional cuker, mangrove).
  * **Container Yard Utama** (`src/terminal/containerYard/`): Lahan & jalan akses internal CY, Lapangan Ekspansi Barat, Kompleks CFS (gudang CFS, workshop, terminal office, halte bus, SPBU), `10` baris Blok Utama dengan `20` unit ASC & area transfer R/D, `5` baris Blok Cadangan Selatan, serta Blok Timur & koridor Reefer dengan `2` unit RTG.
  * **Dermaga / Berth Lepas Pantai** (`src/terminal/dermaga/`): Jembatan Trestle penghubung (`954 m`) + `2-lane` *circular pipe sea conveyor* (`975 m`) beserta menara transfer, Dermaga Petikemas (`656 m × 80 m`, `8` unit STS Crane), dan Dermaga Curah Kering L-shape (`249.5 m`, `2` unit STS Crane curah kering, *jetty conveyor*, *mooring dolphins*).
  * **Terminal Curah Kering** (`src/terminal/curahKering/`): Area ORU (`14` tangki silinder & fasilitas operasional), koridor gudang tengah (`4` silo pendukung), fasilitas depan (PMK, GWT, HVS-3, *weighbridge*), serta area utama berisi `10` unit silo (`2×5`), *Twin Flat Storage Warehouse*, menara transfer TT-3, dan jalur konveyor 2 lajur menuju dermaga.
  * **Kantor Utama / Head Office** (`src/terminal/kantor/`): Gedung Utama Graha Pelindo, kompleks Masjid kubah putih beserta koridor penghubung dan tempat wudhu, lapangan futsal/basket, serta 4 zona parkir kendaraan dan sabuk vegetasi tepi.
* **Tempat / Sub-Wilayah (Level 2 & 3):**
  * Setiap tempat spesifik **wajib memiliki file terpisah** dengan penamaan Bahasa Indonesia (`SubArea...js` & `Geo...js`) agar modular, mudah dirawat, dan tidak menjadi file monolitik raksasa.

---

## 2. Prinsip "Asset Dibuat Dulu" (Reusable Asset-First)

> [!IMPORTANT]
> **JANGAN PERNAH** menulis ulang kode geometri (`BoxGeometry`, `CylinderGeometry`, dsb.) dan material berulang-ulang langsung di dalam file area/tempat untuk objek yang berulang.

1. **Buat Asset Terlebih Dahulu**:
   * Setiap objek (alat berat, truk, kontainer, mobil, kanopi, portal gerbang, silo, konveyor, tangki IPAL, vegetasi, dsb.) harus dibuat sebagai modul/fungsi tersendiri di dalam direktori `src/assets/`.
2. **Efisiensi Memori & Draw Call Three.js**:
   * Aset wajib memanfaatkan *module-scoped shared materials* dan *shared geometries* (seperti pada `createContainerTruck.js` dan `roadMaterials.js`), atau `THREE.InstancedMesh` untuk objek berjumlah ratusan/ribuan (seperti `createInstancedContainerBlock` dan `createRoadsideTreeBand`) agar beban VRAM GPU tetap ringan.
3. **Panggil di File Tempat**:
   * File `SubArea*.js` bertugas mengimpor aset dari `src/assets/`, mengonfigurasi opsi varian, menempatkan posisi (`x, y, z`), rotasi, atau skala sesuai koordinat acuan di `Geo*.js`, dan menambahkannya ke `THREE.Group` sub-area terkait.

---

## 3. Katalog Aset 3D Utama (Alat Berat, Truk, Kontainer & Lainnya)

### 3.1 Alat Berat (`src/assets/equipment/` & Kapasitas Operasional)

Batas kapasitas armada alat berat resmi Terminal Teluk Lamong terdaftar pada `EQUIPMENT_LIMITS` di [SectorDataStore.js](../src/simulation/SectorDataStore.js):
* **STS (Ship-to-Shore / Container Crane)**: maksimal **`10` unit**
* **ASC (Automated Stacking Crane)**: maksimal **`20` unit**
* **RTG (Rubber Tyred Gantry)**: maksimal **`2` unit**
* **RS (Reach Stacker)**: maksimal **`5` unit** *(tercatat di data kesiapan sektor `WAITING_CY` & `CONTAINER_YARD`)*
* **EH (Empty Handler)**: maksimal **`2` unit** *(tercatat di data kesiapan sektor `WAITING_CY` & `CONTAINER_YARD`)*

#### A. `createBerthCranes.js` — Alat Berat Dermaga (`createSTSCrane` & `createBerthRailTrack`)
* **Fungsi `createSTSCrane(options)`**: Membangun 1 unit *Ship-to-Shore (CC/STS) Gantry Crane* skala 1:1 lengkap dengan bogie roda & *sill beam*, 4 kaki portal & *bracing*, tangga akses, *twin box girder* boom & *backreach*, *machinery house*, menara puncak A-Frame dengan batang tarik *forestay/backstay*, kabin operator di bawah *trolley*, serta *spreader* 40 ft kuning atau *grab clamshell bucket* + *hopper*.
  * **Parameter Utama**:
    * `railGaugeZ` (default `30.0`, dipasang `24.0` m di dermaga terpadu): jarak antar rel kaki darat dan kaki laut.
    * `portalWidthX` (default `16.0` m): lebar kaki portal searah sumbu rel `X`.
    * `portalClearHeight` (default `14.5` m): ruang bebas bawah portal untuk lintasan truk kontainer (CTT).
    * `boomElevationY` (`38.0` m) & `towerPeakY` (`62.0` m): elevasi girder boom dan puncak A-Frame di atas dek dermaga.
    * `watersideOutreach` (`56.0` m) & `landsideBackreach` (`18.0` m): jangkauan boom ke atas kapal dan ke sisi belakang.
    * `boomDirectionZ`: `+1` menghadap Laut Lepas / Internasional (`+Z`), `-1` menghadap Kolam Dalam / Domestik (`-Z`).
    * `colorScheme`: `'RED_ORANGE'` (merah-oranye Pelindo), `'TEAL_GREEN'` (hijau-teal TTL), atau `'BULK_TEAL'` (hijau gelap industrial curah kering).
    * `hasBulkHopper`: `false` menghasilkan *spreader* kontainer 40 ft; `true` menampilkan *grab clamshell bucket* dan corong *hopper* di portal untuk menyuplai *jetty conveyor* curah kering.
    * `trolleyReachRatio` (`0.0–0.85`): posisi *trolley* sepanjang boom.
  * **Penempatan di Scene**: `10` unit sesuai `STS_CRANES_PLACEMENT` di [GeoDermaga.js](../src/terminal/dermaga/GeoDermaga.js) — `8` unit di Dermaga Petikemas (`4` sisi luar + `4` sisi dalam) dan `2` unit dengan `hasBulkHopper: true` di Dermaga Curah Kering.
* **Fungsi `createBerthRailTrack({ startX, endX, centerZ, railGaugeZ, ySurface })`**: Membangun landasan *soleplate*, sepasang batang rel baja berat sepanjang sumbu `X`, serta *buffer stop* kuning di kedua ujung rel. Dipasang pada rel sisi luar (`894 m` menerus dari `X = -634` hingga `X = +260`) dan rel sisi dalam (`X = -634` s/d `-28`).

#### B. `createYardCranes.js` — Alat Berat Lapangan (`createASCCrane`, `createASCRailTrack`, `createRTGCrane`)
* **Fungsi `createASCCrane(options)`**: Membangun 1 unit *Automated Stacking Crane (ASC)* berwarna hijau tosca khas TTL lengkap dengan *bogie* & bumper kuning, kolom portal A-Frame, *double box girder* melintang sumbu `X`, *machinery house* + *trolley* + *spreader* kuning berkabel baja, serta panel *E-House* di sisi samping.
  * **Parameter Utama**: `spanX = 21.6` m (bentang portal melampaui 6 baris/row kontainer), `clearHeight = 16.5` m (mampu melewati tumpukan hingga 5 tier), `legWidthZ = 8.2` m, `cantileverX = 3.2` m.
  * **Penempatan di Scene**: `20` unit di `SubAreaBlokUtamaASC.js` (`2` unit per baris blok pada `10` baris Blok Utama CY: `1` *landside* Barat + `1` *seaside* Timur).
* **Fungsi `createASCRailTrack({ spanX = 21.6, lengthZ = 356.0 })`**: Membangun sepasang rel baja sejajar sumbu `Z` sepanjang blok ASC.
* **Fungsi `createRTGCrane(options)`**: Membangun 1 unit *Rubber Tyred Gantry (RTG) Crane* biru-teal beroda karet (`4` pasang ban karet besar beradius `0.72` m di setiap sisi kaki) dengan orientasi portal melintang sumbu `Z` (`spanZ = 22.8` m, `clearHeight = 15.2` m, `legSpanX = 7.6` m) dan bergerak sepanjang sumbu `X`.
  * **Penempatan di Scene**: `2` unit di Blok Timur / Koridor Reefer (`SubAreaBlokTimurRTG.js`).

> [!NOTE]
> Untuk **Reach Stacker (`RS`, maks 5)** dan **Empty Handler (`EH`, maks 2)**, kapasitas dan kesiapannya sudah dikelola pada `SectorDataStore.js` dan ditampilkan di `InformationPanel.js`. Apabila model 3D khusus keduanya ditambahkan di kemudian hari, modulnya ditempatkan di `src/assets/equipment/` mengikuti standar di dokumen ini.

---

### 3.2 Kendaraan & Truk (`src/assets/vehicles/` & Armada Area)

#### A. `createContainerTruck.js` — Truk Kontainer / CTT Standar (`createContainerTruck`)
Model standar tunggal proyek untuk truk kontainer (Prime Mover + 40ft Semi-Trailer Flatbed Chassis):
* **Spesifikasi Geometris**:
  * Panjang total: **`16.0 m`** (ujung belakang trailer `Z = -8.00 m` s/d bumper depan traktor `Z = +8.00 m`).
  * Lebar: **`2.46 m`**.
  * Susunan Roda: **`6` gandar (`12` roda)** — `3` gandar belakang trailer (`Z = -6.8, -5.6, -4.4`), `2` gandar belakang traktor (`Z = +3.3, +4.5`), dan `1` gandar kemudi depan (`Z = +7.1`).
  * Detail Komponen: *trailer bed* `12.4 m`, bumper belakang & lampu rem, sasis traktor & *fifth wheel coupling*, tangki bahan bakar ganda, kabin depan mandiri (kaca depan/samping, grill, bumper, lampu utama, knalpot vertikal), serta *twistlock* kuning pengunci kontainer.
  * Semua geometri dan material dibagi pakai (*shared geometries & materials*) di level modul.
* **Parameter `createContainerTruck({ loadType, cabMat, matCont1, matCont2 })`**:
  * `loadType`:
    * `'ONE_40FT'` *(default)*: 1 kontainer `40 ft` (`2.44 × 2.59 × 12.19 m`).
    * `'TWO_20FT'`: 2 kontainer `20 ft` berurutan (`matCont1` di belakang, `matCont2` di depan).
    * `'ONE_20FT'`: 1 kontainer `20 ft` di posisi depan + *twistlock* belakang terbuka.
    * `'EMPTY'`: trailer kosong dengan `8` pin *twistlock* terlihat.
  * `cabMat`: pilihan material dari `TRUCK_CAB_MATERIALS` (`WHITE`, `GREEN`, `RED`, `YELLOW`, `BLUE`).
  * `matCont1`, `matCont2`: pilihan material dari `TRUCK_CONTAINER_MATERIALS` (`BLUE`, `ORANGE`, `GREEN`, `GREY`, `RED`, `WHITE`).
* **Penempatan & Catatan Kode**: Digunakan di loading dock CFS (`SubAreaFasilitasCFS.js`), lajur transfer R/D Blok ASC (`SubAreaBlokUtamaASC.js`), jembatan Trestle (`SubAreaTrestleDanConveyor.js`), dan dek Dermaga Petikemas (`SubAreaDermagaPetikemas.js`). Di `SubAreaWaitingCY.js` (66 slot Waiting Area A/B), terdapat implementasi awal truk parkir inline dengan dimensi identik yang menjadi acuan ekstraksi aset `createContainerTruck`. *(Catatan: pastikan pemanggil `createContainerTruck` menggunakan `cabMat` dan `matCont1`/`matCont2` sesuai tanda tangan fungsi di atas.)*

#### B. Armada Dump Truck Curah Kering (`SubAreaArmadaCuker.js` & `GeoCuker.js`)
Armada truk curah kering di area tunggu Blok TR 5 dimodelkan sebagai **Dump Truck Tronton 10 Roda (~32 CBM)** dengan spesifikasi di `CUKER_PARKING_CONFIG.TRUCK_SPECS`:
* Panjang sasis tronton: `9.8 m`; lebar kabin `2.45 m`, panjang `2.4 m`, tinggi `2.6 m`.
* Bak muatan curah terbuka: `7.4 m × 2.46 m × 1.75 m` (`≈ 31.85 CBM`), dilengkapi silinder hidrolik teleskopik krom dan muatan curah (batubara/pasir).
* Susunan roda: `10` roda (1 pasang kemudi depan + 2 pasang *dual wheel* tandem belakang).
* Terparkir `16` unit (`2` barisan × `8` truk saling berhadapan) di `SubAreaArmadaCuker.js`. Jika kelak dijadikan aset lintas area, modulnya diekstrak ke `src/assets/vehicles/`.

#### C. `createPassengerCar.js` — Mobil Penumpang & Operasional Kantor (`createPassengerCar`)
* Membuat 1 unit mobil Sedan (`4.40 m × 1.82 m`) atau SUV (`isSUV: true`, `4.65 m × 1.82 m`) lengkap dengan bodi bertingkat, kaca kabin, 4 roda, lampu depan & belakang.
* Menyediakan palet warna `CAR_COLOR_PALETTE` (6 warna metalik/solid) dengan *caching* material per warna (`getCarBodyMaterial`).
* Digunakan di 4 zona parkir Kompleks Kantor Utama / Head Office (`SubAreaOlahragaDanParkir.js`).

---

### 3.3 Kontainer Standar ISO (`src/assets/containers/createContainer.js`)

Seluruh kontainer di proyek wajib mengacu pada `CONTAINER_SPECS` (skala metrik 1:1):
* **Kontainer 20 ft (`TEU_20FT`)**: `width = 2.44 m`, `height = 2.59 m`, `length = 6.06 m`
* **Kontainer 40 ft (`FEU_40FT`)**: `width = 2.44 m`, `height = 2.59 m`, `length = 12.19 m`

Tersedia `CONTAINER_PALETTE` berisi **13 warna realistis** operator pelayaran (Maersk/CMA CGM merah bata, merah marun, Hapag-Lloyd oranye, biru tua samudra, biru Pelindo, biru laut cerah, Evergreen hijau tua, hijau zamrud, hijau tosca, putih *reefer*, abu-abu terang, abu-abu baja, dan abu-abu gelap industri), dengan material bersama `sharedContainerMat`.

* **Fungsi `createContainer({ type = '20ft', color = 0x0284c7, orientedCrosswise = false })`**: Membuat 1 mesh kontainer tunggal (`'20ft'` atau `'40ft'`) dengan opsi orientasi panjang kontainer melintang sumbu `X` (`orientedCrosswise = true`) atau sejajar sumbu `Z` (`false`).
* **Fungsi `createInstancedContainerBlock(instances = [], { orientedCrosswise = true } = {})`**: Merender kumpulan ratusan hingga ribuan kontainer `20 ft` dalam **1 draw call** via `THREE.InstancedMesh` dengan warna per instans (`setColorAt`). Digunakan di `SubAreaBlokUtamaASC.js`, `SubAreaBlokCadanganSelatan.js`, `SubAreaBlokTimurRTG.js`, `SubAreaLapanganBaratCY.js`, `SubAreaFasilitasCFS.js`, dan `SubAreaMedianKontainer.js`.
  *(Blok TR 2/4 di `SubAreaBlokTR.js` dan Blok TR 5 di `SubAreaBlokTR5.js` juga memanfaatkan `THREE.InstancedMesh` dengan dimensi TEU `2.44 × 2.59 × 6.06 m` yang sama.)*

---

### 3.4 Kategori Aset Pendukung Lainnya (`src/assets/`)

| Folder | Modul & Fungsi Ekspor | Kegunaan Utama |
|---|---|---|
| `buildings/` | `createDriverShelter` | Bangunan ruang istirahat pengemudi dengan teras kanopi biru & bangku outdoor (Area Utilitas). |
| `buildings/` | `createPreGateCanopy` | Kanopi lengkung putih Pre-Gate (`24.8 m × 18.0 m`, klirens `6.8 m`) beserta kios dan timbangan platform WIM pada lajur 2–4 (lajur 1 umum/cuker polos). |
| `buildings/` | `createMainGateCanopy` | Kanopi *barrel-vault* bentang lebar Main Gate (klirens `6.8 m`, tinggi puncak `9.8 m`) dengan fascia biru Pelindo & rangka baja. |
| `infrastructure/` | `createPreGatePortal` | Portal gantry *space-truss* Pre-Gate (`type: 'entry' \| 'exit'`, klirens `6.0 m`), *catwalk* kuning, kamera OCR, papan LED VGM, sinyal lalu lintas, dan palang. |
| `infrastructure/` | `createGateBooth` | Pulau beton pembatas jalur gerbang, gardu petugas berbingkai kaca biru, tiang scanner, dan lampu sinyal. |
| `infrastructure/` | `createBoomBarrier` | Kotak motor oranye & lengan palang gerbang merah-putih (`isOpen`, `pointsNegativeX`). |
| `infrastructure/` | `createMedianIsland` | Pulau median jalan dengan kanstin hazard hitam-putih dan area rumput tengah. |
| `infrastructure/` | `createMotorcycleParkingBay` | Shelter kanopi parkir sepeda motor, marka slot parkir, dan prop motor *instanced*. |
| `industrial/` | `createGrainSilo` | Silo baja bergelombang berpondasi beton (`Ø27 m` 6000T di Bulk Area, silo pendukung `Ø8.5 m`, serta varian tangki gelap `isDarkTank` di Area ORU). |
| `industrial/` | `createFlatStorageComplex` | Kompleks gudang *Twin Flat Storage* (Phase #1 & #2) atap krem beserta *ridge gallery* konveyor. |
| `industrial/` | `createConveyorGallery`, `createTransferTower` | Segmen jembatan konveyor tabung lingkaran (*tubular pipe conveyor*) dengan cincin flensa & penyangga, serta menara transfer seperti TT-3. |
| `industrial/` | `createIpalTank`, `createIpalBasin`, `createIpalSmallShed`, `createHorizontalSkidTank` | Tangki silinder vertikal IPAL, kolam pengolahan air limbah, bangunan rumah pompa kecil, dan tangki horizontal berpenyangga baja (Area Utilitas). |
| `nature/` | `createOcean` | Hamparan laut animasi berbasis *custom shader*, tekstur LUT jarak pantai `128×128`, dan *normal map* gelombang periodik. |
| `nature/` | `createMangroveTree`, `createMangroveCluster`, `createMangroveForest` | Vegetasi pohon dan hutan mangrove pesisir reklamasi. |
| `nature/` | `createMedianTree`, `createRoadsideTreeBand` | Pohon median jalan dan pita pepohonan tepi jalan yang dioptimasi untuk koridor panjang. |
| `materials/` | `roadMaterials.js` | Koleksi *shared PBR & basic materials* (`asphaltMat`, `portRoadPavementMat`, `bridgeConcreteMat`, `pierConcreteMat`, `seawallMat`, `flyoverConcreteMat`, `barrierMat`, `steelMat`, `curbHazardWhiteMat`, `curbHazardBlackMat`, `whiteLineMat`, `yellowLineMat`, `coastalEmbankmentMat`, dll.) dan fungsi `createEmbankmentGeometry`. |

---

## 4. Struktur Direktori Proyek (`src/`)

```text
src/
├── main.js                           # Entry point: inisialisasi scene, area, kamera, HUD & loop animasi
├── style.css                         # Styling overlay HUD, kartu sektor, kompas, mini-map & pin 3D
│
├── assets/                           # PUSTAKA ASSET REUSABLE (Dibuat dulu di sini)
│   ├── buildings/                    # createDriverShelter, createPreGateCanopy, createMainGateCanopy
│   ├── containers/                   # createContainer, createInstancedContainerBlock, CONTAINER_SPECS/PALETTE
│   ├── equipment/                    # createBerthCranes (STS & rel), createYardCranes (ASC, rel, RTG)
│   ├── industrial/                   # Silo, FlatStorage, ConveyorGallery/TransferTower, komponen IPAL & skid tank
│   ├── infrastructure/               # PreGatePortal, GateBooth, BoomBarrier, MedianIsland, MotorcycleParkingBay
│   ├── materials/                    # roadMaterials.js (shared PBR materials & embankment geometry)
│   ├── nature/                       # createOcean, mangrove, median tree, roadside tree band
│   └── vehicles/                     # createContainerTruck (standar CTT), createPassengerCar (Sedan/SUV)
│
├── terminal/                         # DUNIA 3D TERMINAL (6 Kawasan + SectorRegistry)
│   ├── SectorRegistry.js             # Single Source of Truth 5 sektor operasional (bounds, pin, cameraView)
│   ├── jalan/                        # Kawasan Jalan, Jembatan Laut 680m, Pre-Gate, Main Gate, Pasca-Gate
│   │   ├── index.js
│   │   ├── JalanAksesOsowilangun.js
│   │   ├── JembatanLaut.js
│   │   ├── JalanPreGate.js
│   │   ├── mainGate/                 # GeoMainGate, SubAreaJalanMainGate, SubAreaKanopiMainGate, SubAreaPohonTepi
│   │   └── pascaGate/                # GeoPascaGate, SubAreaJalanPascaGate, SubAreaMedianPohon/Kontainer, SubAreaPohonPascaGate
│   ├── bufferArea/                   # Kawasan Penyangga Barat (Utilitas, Waiting CY, Waiting Cuker)
│   │   ├── index.js
│   │   ├── utilitas/                 # GeoUtilitas, SubAreaIpal, SubAreaShelter, SubAreaParkirMotor, SubAreaMangrove
│   │   ├── waitingCY/                # GeoWaitingCY, SubAreaAksesJalan, SubAreaWaitingCY, SubAreaBlokTR, SubAreaJalurSupir, SubAreaMangrovePesisir
│   │   └── waitingCuker/             # GeoCuker, SubAreaPerkerasanCuker, SubAreaMarkaCuker, SubAreaBlokTR5, SubAreaArmadaCuker, SubAreaFasilitasCuker
│   ├── containerYard/                # Kawasan Container Yard Utama (Blok ASC, Selatan, Timur RTG, CFS, Barat)
│   │   ├── index.js
│   │   ├── GeoContainerYard.js
│   │   └── SubArea*.js               # LahanCY, PohonPesisirCY, LapanganBaratCY, FasilitasCFS, BlokUtamaASC, BlokCadanganSelatan, BlokTimurRTG
│   ├── dermaga/                      # Kawasan Trestle 954m, Sea Conveyor 975m & Dermaga Petikemas/Cuker
│   │   ├── index.js
│   │   ├── GeoDermaga.js
│   │   └── SubArea*.js               # TrestleDanConveyor, DermagaPetikemas, DermagaCurahKering
│   ├── curahKering/                  # Kawasan Terminal Curah Kering (ORU, Gudang Tengah, Silo & Flat Storage)
│   │   ├── index.js
│   │   ├── GeoCurahKering.js
│   │   └── SubArea*.js               # LahanCuker, PohonPesisirCuker, SiloDanGudangCuker, OperasionalCuker
│   └── kantor/                       # Kawasan Kantor Utama / Head Office (Graha Pelindo, Masjid, Olahraga & Parkir)
│       ├── index.js
│       ├── GeoKantor.js
│       └── SubArea*.js               # LahanDanJalanKantor, GedungUtamaHO, MasjidKantor, OlahragaDanParkir
│
├── world/                            # Setup Scene, Pencahayaan, Proyeksi Geodesik & Lingkungan
│   ├── scene.js                      # Renderer WebGL2, ACESFilmicToneMapping, PCFSoftShadowMap
│   ├── lights.js                     # Ambient, Hemisphere, & Directional Sun Light (2048x2048 shadow)
│   ├── GeoProjection.js              # Konversi WGS84 Lat/Lon <-> X/Z metrik 1:1 (bearing 57.55°)
│   ├── environment.js                # Daratan akses & lingkungan pesisir
│   └── Signage.js                    # Papan penanda ENTRY / EXIT koridor
│
├── camera/
│   └── CameraManager.js              # Kamera dual-mode (DRONE & POV), transisi fokus, & getGroundHeight
│
├── simulation/
│   ├── SectorDataStore.js            # State aktivitas, kapasitas & batas alat (EQUIPMENT_LIMITS) 5 sektor
│   ├── SelectionManager.js           # Raycaster 3D & perimeter highlight 5 sektor
│   └── SimClock.js                   # Jam operasional LIVE vs SIM & deteksi shift S1–S3
│
└── ui/
    ├── NavigationHUD.js              # Bar sektor, kontrol jam LIVE/SIM, kamera, Pin 3D & Mini-Map OPS/FULL
    ├── InformationPanel.js           # Panel Activity-by-Data & Kesiapan Alat per sektor
    ├── SectorMarkersOverlay.js       # Pin 3D melayang terproyeksi layar untuk 5 sektor
    └── CompassWidget.js              # Dial kompas berputar terkalibrasi Utara Sejati (32.45°)
```

---

## 5. Standar Penulisan Kode

### A. Format Pembuatan Asset (`src/assets/...`)
Asset berupa fungsi yang menerima objek opsi dengan nilai default dan mengembalikan `THREE.Group` atau `THREE.Mesh`, menggunakan material bersama di scope modul:

```javascript
// Contoh pola modul di src/assets/
import * as THREE from 'three';

const sharedPoleMat = new THREE.MeshStandardMaterial({
  color: 0x94a3b8,
  roughness: 0.45,
  metalness: 0.7
});

export function createStreetLight({ height = 8 } = {}) {
  const lightGroup = new THREE.Group();
  lightGroup.name = 'asset_street_light';

  const pole = new THREE.Mesh(
    new THREE.CylinderGeometry(0.08, 0.12, height, 8),
    sharedPoleMat
  );
  pole.position.y = height / 2;
  lightGroup.add(pole);

  return lightGroup;
}
```

### B. Format File Tempat Spesifik (`SubArea*.js`)
File tempat hanya mengimpor konfigurasi dari `Geo*.js` dan aset dari `src/assets/` lalu menempatkannya pada koordinat dunia:

```javascript
import * as THREE from 'three';
import { /* konfigurasi */ } from './GeoContainerYard.js';
import { createASCCrane } from '../../assets/equipment/createYardCranes.js';

export function createSubAreaContoh() {
  const group = new THREE.Group();
  group.name = 'subarea_contoh';

  const crane = createASCCrane({ spanX: 21.6, clearHeight: 16.5 });
  crane.position.set(0, 1.62, 2100);
  group.add(crane);

  return group;
}
```

### C. Format Coordinator Sub-Klaster & Area (`index.js`)
Menggabungkan seluruh `SubArea*.js` (dan sub-klaster jika ada) menjadi satu grup area, lalu menambahkannya ke `scene` bila parameter `scene` diberikan:

```javascript
import * as THREE from 'three';
import { createSubAreaA } from './SubAreaA.js';
import { createSubAreaB } from './SubAreaB.js';

export function createContohArea(scene = null) {
  const group = new THREE.Group();
  group.name = 'area_contoh';

  group.add(createSubAreaA());
  group.add(createSubAreaB());

  if (scene) {
    scene.add(group);
  }
  return group;
}
```

---

## 6. Ringkasan Checklist untuk Agen

Sebelum menulis atau memodifikasi kode aset maupun area:
- [ ] **Penamaan Wilayah**: Tidak ada istilah lama yang dilarang ("Pulau 1"); gunakan konteks **Terminal** atau nama kawasan resmi (`jalan`, `bufferArea`, `containerYard`, `dermaga`, `curahKering`, `kantor`).
- [ ] **Reusable Asset-First**: Objek yang dipakai berulang dibuat terlebih dahulu di `src/assets/` dan memanfaatkan *shared material/geometry* atau `THREE.InstancedMesh`.
- [ ] **Standar Kontainer & Truk**: Kontainer menggunakan `createContainer` / `createInstancedContainerBlock` (`2.44 × 2.59 × 6.06 m` untuk 20 ft; `12.19 m` untuk 40 ft), sedangkan truk kontainer memakai `createContainerTruck` dengan parameter `loadType`, `cabMat`, `matCont1`, dan `matCont2`.
- [ ] **Standar Alat Berat**: Crane dermaga memakai `createSTSCrane` / `createBerthRailTrack`, crane lapangan memakai `createASCCrane` / `createASCRailTrack` / `createRTGCrane`, dan total alokasi kapasitas mengacu pada `EQUIPMENT_LIMITS` di `SectorDataStore.js`.
- [ ] **Modularitas Area**: Setiap tempat spesifik terpisah pada file `SubArea*.js` & `Geo*.js` berstandar koordinat GPS via `GeoProjection`, dan dirangkai oleh `index.js`.
