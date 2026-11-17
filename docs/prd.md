# Product Requirements Document (PRD): Terminal Teluk Lamong (TTL) 3D Operation Simulator

> Dokumen ini menjelaskan spesifikasi produk **Terminal Teluk Lamong (TTL) 3D Operation Simulator** secara menyeluruh dalam bahasa Indonesia.
> Aturan penulisan kode, struktur folder, dan katalog aset 3D berada di [Assets.md](Assets.md). Panduan menjalankan proyek berada di [README.md](../README.md).

---

## 1. Product Overview

**Terminal Teluk Lamong (TTL) 3D Operation Simulator** adalah aplikasi *digital twin* operasional dan visualisasi interaktif berbasis web 3D (Three.js + Vite) yang mereplika kawasan **Terminal Teluk Lamong (PT Pelabuhan Indonesia / Pelindo, Surabaya)** dalam skala metrik **1:1** (`1 unit Three.js = 1 meter`) yang terkalibrasi terhadap koordinat GPS nyata (WGS84).

Aplikasi ini menggabungkan rekonstruksi 3D seluruh koridor darat hingga dermaga lepas pantai dengan antarmuka HUD (*Heads-Up Display*) operasional yang berfokus pada alur petikemas. Melalui satu aplikasi browser, pengguna dapat menjelajahi infrastruktur fisik terminal dalam mode kamera `DRONE` maupun `POV`, melacak koordinat geografis secara real-time, memilih 5 sektor operasional utama (`Pre-Gate`, `Waiting CY`, `Main Gate`, `Container Yard`, dan `Dermaga`), serta memantau ringkasan aktivitas berjalan, capaian selesai, kesiapan alat berat, dan waktu operasional (`LIVE` / `SIM`).

---

## 2. Problem / Goal

### Problem (Permasalahan)
1. **Keterbatasan Pemahaman Spasial dari Denah 2D**: Kompleksitas tata letak Terminal Teluk Lamong—yang membentang dari akses darat Osowilangun, jembatan laut, zona penyangga, gerbang, lapangan penumpukan petikemas, terminal curah kering, hingga trestle dan dermaga lepas pantai—sulit dipahami secara utuh apabila hanya disajikan melalui peta 2D statis atau tabel terpisah.
2. **Terpisahnya Konteks Fisik dan Data Operasional**: Tim operasional maupun pemangku kepentingan memerlukan tampilan terpadu yang menghubungkan posisi spasial suatu sektor dengan status kegiatan dan kapasitas alat di sektor tersebut.
3. **Kebutuhan Media Presentasi dan Edukasi yang Mudah Diakses**: Diperlukan sarana demonstrasi dan pembelajaran operasional maritim yang interaktif, ringan, dan dapat langsung dijalankan di browser tanpa instalasi perangkat lunak 3D khusus.

### Goal (Tujuan)
1. Menghadirkan replika visual 3D Terminal Teluk Lamong berskala 1:1 yang selaras dengan koordinat GPS aktual (datum Causeway 1 `-7.2100105, 112.6626984`, bearing koridor `57.55°`).
2. Menyediakan pengalaman eksplorasi spasial yang presisi melalui kamera dual-mode (`DRONE` dan `POV`), kompas terkalibrasi Utara Sejati, peta koridor 2D (*mini-map*), serta telemetri dan teleportasi koordinat GPS.
3. Menyediakan antarmuka pemantauan operasional berbasis **5 Sektor Petikemas** (`SectorRegistry`, `SectorDataStore`, dan `InformationPanel`) yang menampilkan status aktivitas aktif, capaian pekerjaan, progres kapal/dermaga, dan kesiapan kapasitas alat berat sesuai standar terminal.
4. Menyediakan sistem jam operasional fleksibel (`SimClock`) yang mendukung mode waktu nyata (`LIVE`) beserta shift pelabuhan (`S1`–`S3`) maupun mode simulasi (`SIM`) dengan kontrol pemutaran dan percepatan waktu.

---

## 3. Target User

1. **Manajemen & Tim Operasional Terminal (PT Pelindo / TTL)**  
   Menggunakan simulator untuk meninjau tata letak lintas zona, memverifikasi jalur akses dan kapasitas area, serta memantau indikator aktivitas dan kesiapan alat pada 5 sektor petikemas.
2. **Stakeholder Eksternal, Mitra Logistik, & Klien Bisnis**  
   Memanfaatkan tampilan 3D interaktif saat sesi paparan atau *virtual tour* untuk memahami kapabilitas infrastruktur, pemisahan layanan petikemas dan curah kering, serta alur pergerakan barang di TTL.
3. **Akademisi, Mahasiswa, & Peserta Edukasi Maritim**  
   Mempelajari anatomi terminal pelabuhan modern (mulai dari portal WIM, area tunggu truk, Main Gate, blok ASC/RTG, sistem konveyor curah kering, hingga dermaga STS) secara visual dan geospasial.
4. **Pengembang & Analis Sistem Digital Twin**  
   Menggunakan arsitektur modular 3D (`src/terminal/`, `src/assets/`) bersama `GeoProjection`, `SectorRegistry`, `SectorDataStore`, dan `SimClock` sebagai antarmuka integrasi data maupun skenario simulasi.

---

## 4. Core Features

### 4.1 Rekonstruksi Dunia 3D Terminal Skala 1:1
Mencakup keseluruhan 6 kawasan utama terminal beserta lingkungan darat, rambu koridor, dan hamparan lautan teranimasi berbasis shader (`createOcean`):
- **Jaringan Jalan & Gerbang (`src/terminal/jalan/`)**: Akses Darat Osowilangun dan ramp Tol Romokalisari, Jembatan Laut Melengkung (`680 m`), Jalan Pre-Gate beserta kanopi dan 3 portal WIM (`Z ≈ 955`), Kompleks Main Gate (kanopi *barrel-vault*, gardu booth, dan *boom barrier*), serta Koridor Pasca-Gate dengan median pohon dan median kontainer.
- **Buffer Area Barat (`src/terminal/bufferArea/`)**: Klaster Utilitas (IPAL, driver shelter, parkir motor, sabuk mangrove), Waiting CY (Waiting Area A & B berkapasitas `66` slot truk miring, Blok TR 2 & TR 4, jalur supir, akses jalan), dan Waiting Curah Kering (Blok TR 5, area parkir armada *dump truck* tronton ~32 CBM, fasilitas gerbang/kantor/BBM/gardu cuker, serta sabuk mangrove).
- **Container Yard Utama (`src/terminal/containerYard/`)**: Lahan & jalan akses internal CY, Lapangan Ekspansi Barat, Kompleks CFS (gudang CFS, workshop, terminal office, halte bus, SPBU, yard samping CFS), `10` baris Blok Utama dengan `20` unit ASC (*Automated Stacking Crane*) & area transfer R/D, `5` baris Blok Cadangan Selatan, serta Blok Timur & koridor Reefer dengan `2` unit RTG (*Rubber Tyred Gantry*).
- **Dermaga Terpadu (`src/terminal/dermaga/`)**: Jembatan Trestle penghubung (`954 m`) + `2-lane` *circular pipe sea conveyor* (`975 m`) beserta menara transfer, Dermaga Petikemas (`656 m × 80 m`) dengan `8` unit CC/STS Crane pada rel sisi luar & dalam, serta Dermaga Curah Kering berbentuk L (`249.5 m`) yang menyatu dengan Dermaga Petikemas beserta `2` unit STS Crane curah kering, *jetty conveyor*, dan *mooring dolphins*.
- **Terminal Curah Kering (`src/terminal/curahKering/`)**: Zonasi ORU (`14` tangki silinder & fasilitas operasional), koridor gudang tengah, fasilitas depan (PMK, GWT, HVS-3, *weighbridge*), serta area utama berisi `10` unit silo (`2×5`), *Twin Flat Storage Warehouse*, menara transfer TT-3, dan jalur konveyor 2 lajur menuju dermaga.
- **Kantor Utama / Head Office (`src/terminal/kantor/`)**: Gedung Utama Graha Pelindo, kompleks Masjid kubah putih beserta koridor penghubung dan tempat wudhu, lapangan futsal/basket, serta 4 zona parkir kendaraan beserta sabuk pepohonan dan mangrove pesisir.

### 4.2 Sistem Proyeksi Geodesik & Telemetri GPS (`GeoProjection`)
- Konversi dua arah antara koordinat geografis WGS84 (`lat`, `lon`) dan koordinat metrik simulator (`X`, `Z`) menggunakan `gpsToSim` dan `simToGps`.
- Pembacaan telemetri real-time pada HUD meliputi `LAT`, `LON`, posisi metrik (`X`, `Z`, `Alt`), serta deteksi otomatis sektor operasional tempat kamera berada (`resolveOperationalSector`).
- Tombol `Salin` koordinat ke *clipboard* dan fitur **Teleportasi GPS** (`Lat, Lon`) dengan validasi batas geografis Surabaya/TTL.

### 4.3 Navigasi Kamera Dual-Mode (`CameraManager`)
- **Mode `DRONE` (Default)**: Drag kiri untuk pan mendatar adaptif ketinggian, drag kanan/tengah (atau `Ctrl + Drag Kiri`) untuk orbit 360° mengelilingi pivot permukaan, dan *scroll* untuk *cursor-anchored dolly zoom*.
- **Mode `POV`**: Drag kiri/kanan untuk menoleh 360° di tempat (*zero-drift*), dan *scroll* untuk bergerak maju/mundur di atas jalur.
- **Pergerakan Bebas & Pintasan**: `WASD` untuk gerak horizontal, `Q`/`E` (atau `Z`) untuk naik/turun elevasi, `Shift` (`2.5x`) dan `Alt` (`0.2x`) untuk pengaturan kecepatan, `V` untuk ganti mode kamera, serta `R`/`Esc` untuk reset ke Overview.
- **Perlindungan Kontur & Persistensi**: Kamera otomatis dibatasi agar tidak menembus elevasi permukaan daratan, jembatan lengkung, jalan reklamasi, maupun dek trestle/dermaga (`getGroundHeight`), serta menyimpan posisi terakhir di `sessionStorage`.

### 4.4 Seleksi 5 Sektor Operasional & Pin 3D Melayang
- Cakupan 5 sektor resmi pada `SectorRegistry`:
  1. `01 Pre-Gate` (`PRE_GATE` — TBS & WIM, 3 lajur berportal)
  2. `02 Waiting CY` (`WAITING_CY` — Buffer & Antrean 66 slot + Blok TR 2/4/5)
  3. `03 Main Gate` (`MAIN_GATE` — Gate In / Out)
  4. `04 Container Yard` (`CONTAINER_YARD` — Stacking & R/D)
  5. `05 Dermaga` (`DERMAGA` — Berth `656 m` & alokasi STS maks `10`)
- Seleksi sektor melalui *raycasting* 3D langsung pada kanvas (lengkap dengan highlight garis batas dan area transparan), tab sektor di bar navigasi atas, Pin 3D melayang (*SectorMarkersOverlay*) yang dapat di-toggle tampil/sembunyi, klik pada Mini-Map 2D, atau pintasan `1–5` dan `[` / `]`.

### 4.5 Panel Informasi Sektor (*Activity-by-Data* & Kesiapan Alat)
Menampilkan data sektor secara reaktif dari `SectorDataStore` dalam 3 bagian:
- **Sedang Dikerjakan**: Jumlah truk cek WIM & event terkini (Pre-Gate), truk tunggu resolusi & blok buffer TR 2/4/5 (Waiting CY), proses Gate-In/Out aktif & sub-kartu *Truk Terakhir Melintas* (Main Gate), job truk eksternal R/D & internal Dermaga (CY), serta daftar kartu kapal sandar dengan alokasi STS dan bar progres *Discharge* & *Load* (Dermaga).
- **Sudah Dikerjakan**: Truk lolos ke Main Gate vs dialihkan ke Waiting (Pre-Gate), truk *solved* keluar ke CY & kontainer buffer (Waiting CY), total Gate-In/Gate-Out selesai & rata-rata *dwell time* (Main Gate), total box ditangani & YOR % (CY), serta total *Discharge* dan *Load* box (Dermaga).
- **Kesiapan & Kapasitas**: Chip indikator kesiapan infrastruktur dan alat berat sesuai kapasitas resmi terminal (`EQUIPMENT_LIMITS`): `Portal WIM` (`3` lajur), `Slot Tunggu` (`66`), `STS` (maks `10`), `ASC` (maks `20`), `RTG` (maks `2`), `RS` (maks `5`), `EH` (maks `2`), serta rincian `BOR Total / Int / Dom` pada Dermaga.

### 4.6 Jam Operasional (`SimClock`), Kompas, & Mini-Map Koridor 2D
- **Jam Operasional**: Mendukung mode `LIVE` (waktu asli perangkat real-time) dan mode `SIM` (tombol Play/Pause atau `Space`, pengali kecepatan `1x`, `2x`, `5x`, `10x`, dan tombol `Sync` ke waktu nyata) lengkap dengan penanda shift pelabuhan (`S1`: 08.00–16.00, `S2`: 16.00–24.00, `S3`: 00.00–08.00).
- **Kompas Interaktif (`CompassWidget`)**: Dial kompas berputar dinamis terhadap arah pandang kamera dengan kalibrasi Utara Sejati (`32.45°` scene angle), readout derajat & mata angin, serta klik pada dial untuk langsung meluruskan kamera menghadap Utara (`0°`).
- **Mini-Map Koridor 2D (`NavigationHUD`)**: Peta skematik dengan skala `OPS` (fokus 5 sektor) dan `FULL` (koridor Osowilangun s/d Dermaga), menampilkan konteks bangunan non-sektor (Head Office, Utilitas, Curah Kering, Pier Cuker), indikator posisi & *view cone* kamera secara real-time, tooltip koordinat/sektor, serta klik langsung untuk fokus ke sektor atau teleportasi koordinat.

---

## 5. User Flow

1. **Inisialisasi & Tampilan Awal (Overview)**  
   Pengguna membuka aplikasi di browser. Kanvas WebGL 2 memuat seluruh kawasan Terminal Teluk Lamong beserta laut animasi, menempatkan kamera pada posisi tersimpan sesi atau sudut pandang Overview default (mode `DRONE`), mengaktifkan jam `LIVE`, menampilkan Pin 3D sektor, bar navigasi atas, panel Kompas & Telemetri, serta Mini-Map 2D (panel Kontrol berada dalam kondisi terlipat).
2. **Eksplorasi Kawasan Terminal**  
   Pengguna menggeser, mengorbit, dan melakukan zoom ke titik kursor di mode `DRONE`, atau menekan `V` / tombol `POV` untuk meninjau terminal dari ketinggian permukaan jalan dan dermaga. Pengguna dapat memanfaatkan Mini-Map (`OPS` / `FULL`), mengklik dial Kompas untuk menghadap Utara, atau memasukkan koordinat `Lat, Lon` pada kotak telemetri lalu menekan `Go` untuk berpindah instan.
3. **Pemilihan & Inspeksi Sektor Operasional**  
   Pengguna memilih salah satu sektor (`Pre-Gate`, `Waiting CY`, `Main Gate`, `Container Yard`, atau `Dermaga`) melalui klik langsung area 3D, Pin 3D melayang, tab bar atas, Mini-Map 2D, atau tombol angka `1–5`. Kamera bertransisi halus menuju sudut pandang preset sektor, batas sektor disorot di kanvas 3D, dan Panel Informasi terbuka menampilkan detail aktivitas serta kesiapan alat sektor tersebut.
4. **Navigasi Lintas Sektor & Kontrol Tampilan**  
   Pengguna dapat berpindah ke sektor berikutnya atau sebelumnya melalui tombol `‹` / `›` maupun pintasan `[` / `]`, mengulang fokus kamera ke sektor aktif lewat tombol `Fokus`, menyembunyikan atau menampilkan `Pin 3D`, menciutkan panel HUD (`−` / `+`), atau menutup panel informasi (`×` / klik area non-sektor).
5. **Pengaturan Mode Waktu (`LIVE` / `SIM`) & Reset Kamera**  
   Pengguna dapat mengalihkan kontrol waktu ke mode `SIM` untuk menguji laju waktu (`1x`–`10x`), menjeda/melanjutkan (`Space`), atau melakukan `Sync` kembali ke jam nyata. Untuk kembali ke perspektif awal terminal, pengguna menekan tombol `Reset` atau pintasan `R` / `Esc`.

---

## 6. Functional Requirements

| ID | Kebutuhan Fungsional |
|---|---|
| **FR-01** | **Rendering 6 Kawasan Terminal & Lautan**: Sistem harus merender seluruh kawasan terminal (`jalan`, `bufferArea`, `containerYard`, `dermaga`, `curahKering`, `kantor`), rambu koridor, lingkungan daratan, serta lautan beranimasi dalam satu scene Three.js skala 1:1. |
| **FR-02** | **Konversi & Teleportasi GPS**: Sistem harus mengonversi posisi kamera ke koordinat WGS84 (`LAT`, `LON`) dan metrik (`X`, `Z`, `Alt`) secara berkala, menyediakan tombol salin ke clipboard, serta memvalidasi input teleportasi `Lat, Lon` dalam rentang wilayah Surabaya/TTL (`lat` -10 s/d -5, `lon` 110 s/d 115) sebelum memfokuskan kamera. |
| **FR-03** | **Kontrol Kamera Dual-Mode & Pembatasan Kontur**: Sistem harus mendukung mode `DRONE` dan `POV` dengan transisi interpolasi kamera, pembatasan ketinggian minimum di atas kontur tanah/jembatan/dermaga (`getGroundHeight`), pembatasan batas luar scene, serta penyimpanan state kamera pada `sessionStorage`. |
| **FR-04** | **Seleksi 5 Sektor Operasional**: Sistem harus menyediakan deteksi klik dan hover berbasis raycasting 3D (dengan fallback perpotongan bidang datar) untuk 5 sektor pada `SectorRegistry`, serta menyinkronkan status terpilih ke highlight 3D, tab HUD, Pin 3D, Mini-Map 2D, dan `InformationPanel`. |
| **FR-05** | **Tampilan Data & Kesiapan Alat per Sektor**: `InformationPanel` dan `SectorMarkersOverlay` harus merender pembaruan dari `SectorDataStore` secara reaktif, meliputi metrik spesifik tiap sektor (`PRE_GATE`, `WAITING_CY`, `MAIN_GATE`, `CONTAINER_YARD`, `DERMAGA`), kartu *Truk Terakhir Melintas*, progres per kapal di Dermaga, dan kesiapan alat sesuai `EQUIPMENT_LIMITS` (`STS: 10`, `ASC: 20`, `RTG: 2`, `RS: 5`, `EH: 2`). |
| **FR-06** | **Kontrol Jam Operasional (`SimClock`)**: Sistem harus menyediakan pergantian mode `LIVE` dan `SIM`, kontrol Play/Pause (tombol & `Space`), pilihan kecepatan `1x`, `2x`, `5x`, `10x`, tombol `Sync` ke waktu perangkat, dan pembaruan otomatis kode shift (`S1`, `S2`, `S3`). |
| **FR-07** | **Kompas Terkalibrasi Utara Sejati**: `CompassWidget` harus memutar dial sesuai bearing kamera terhadap `NORTH_SCENE_ANGLE_DEG` (`32.45°`), menampilkan sudut derajat dan arah mata angin, serta mengarahkan kamera ke `0°` (Utara Sejati) saat dial diklik. |
| **FR-08** | **Mini-Map Koridor 2D & Kontrol HUD**: `NavigationHUD` harus menggambar peta skematik mode `OPS` dan `FULL` beserta posisi dan arah pandang kamera, menampilkan tooltip koordinat/sektor saat hover, merespons klik untuk fokus sektor/koordinat, serta menyediakan panel HUD yang dapat dibuka/diciutkan dan toggle `Pin 3D`. |

---

## 7. Non-Functional Requirements

1. **Performa Rendering & Efisiensi Memori GPU**:  
   Aplikasi harus berjalan responsif pada browser desktop dengan menerapkan *instancing* (`THREE.InstancedMesh`) untuk objek berulang dalam jumlah besar (kontainer, vegetasi, pilar jembatan), penggunaan bersama geometri dan material (*shared geometries/materials*), tekstur Lookup Table (LUT) jarak pantai dan normal map pada shader laut, pembatasan `devicePixelRatio` maksimal `2`, serta *throttling* pembaruan DOM HUD (telemetri GPS setiap `80 ms`, mini-map setiap `50 ms`, dan kompas hanya saat perubahan sudut `≥ 0.15°`).
2. **Akurasi Skala & Konsistensi Geodesik**:  
   Seluruh geometri area wajib mematuhi konvensi skala 1:1 (`1 unit = 1 meter`) dan jangkar koordinat GPS pada modul `Geo*.js` serta `GeoProjection.js` sehingga jarak dan posisi antar-fasilitas konsisten terhadap kondisi lapangan.
3. **Kompatibilitas & Kemandirian Runtime Web**:  
   Aplikasi dibangun sebagai bundel ESM statis melalui Vite tanpa dependensi backend wajib untuk visualisasi dasar, dan dapat berjalan di browser desktop modern yang mendukung **WebGL 2**, **ES Modules**, dan API web standar (`Clipboard API`, `sessionStorage`), serta beradaptasi otomatis terhadap perubahan ukuran viewport (`resize`).
4. **Modularitas & Keterawatan Kode (*Maintainability*)**:  
   Struktur kode mematuhi pola *Asset-First* (`src/assets/`) dan pemisahan file per kawasan/sub-area (`Geo*.js` & `SubArea*.js`) sesuai pedoman [Assets.md](../Assets.md), dengan pemisahan yang jelas antara layer dunia 3D (`src/terminal/`, `src/world/`), kontrol kamera (`src/camera/`), state operasional & waktu (`src/simulation/`), dan antarmuka pengguna (`src/ui/`).
5. **Keandalan Interaksi & Keamanan State**:  
   Pintasan keyboard global tidak boleh aktif ketika fokus berada pada elemen input teks; kondisi koordinat kamera tak valid (`!Number.isFinite`) harus dipulihkan otomatis ke tampilan Overview default; dan status penekanan tombol kamera harus direset ketika jendela browser kehilangan fokus (`blur`).

---

## 8. Scope & Out of Scope

### Scope (Dalam Ruang Lingkup)
- Visualisasi 3D skala 1:1 seluruh kawasan Terminal Teluk Lamong (Jalan & Gerbang, Buffer Area Barat, Container Yard Utama, Dermaga Terpadu, Terminal Curah Kering, dan Kantor Utama/Head Office) beserta lingkungan akses darat dan lautan.
- Sistem proyeksi koordinat dua arah WGS84 ↔ 3D metrik untuk telemetri real-time dan teleportasi kamera.
- Sistem kontrol kamera dual-mode (`DRONE` & `POV`), kompas terkalibrasi, dan Mini-Map koridor 2D (`OPS` & `FULL`).
- Manajemen 5 sektor operasional petikemas (`SectorRegistry`), seleksi 3D & Pin melayang, panel *Activity-by-Data* & kesiapan alat (`InformationPanel`, `SectorDataStore`), serta kontrol jam operasional (`SimClock` `LIVE`/`SIM`).

### Out of Scope (Di Luar Ruang Lingkup)
- Koneksi kendali dua arah secara langsung ke sistem produksi operasional eksternal (TOS, ERP, sistem gate fisik, atau kendali crane aktual PT Pelindo).
- Simulasi fisika tingkat lanjut (deteksi tabrakan dinamis antar-truk secara real-time, ayunan spreader/kabel crane, atau simulasi fluida/gelombang terhadap stabilitas kapal).
- Backend server, basis data persisten, otentikasi pengguna/RBAC, serta penyimpanan histori transaksi operasional jangka panjang.
- Dukungan perangkat VR/AR maupun pengoptimalan antarmuka untuk layar perangkat seluler berukuran kecil.
- Pemodelan kawasan pelabuhan lain di luar Terminal Teluk Lamong.

---

## 9. Success Criteria

1. **Kelengkapan & Konsistensi Spasial 6 Kawasan**: Seluruh 6 kawasan Terminal Teluk Lamong (`jalan`, `bufferArea`, `containerYard`, `dermaga`, `curahKering`, `kantor`) beserta akses darat dan lautan terender utuh dengan proporsi 1:1 yang akurat, menyambung mulus antar-zona tanpa celah atau tabrakan geometri.
2. **Presisi Navigasi Geospasial**: Pembacaan koordinat GPS (`LAT`/`LON`), deteksi sektor aktif, teleportasi koordinat, arah kompas Utara Sejati (`32.45°` scene angle), dan posisi *view cone* pada Mini-Map 2D (`OPS` & `FULL`) selaras terhadap lokasi kamera di dunia 3D.
3. **Berfungsinya Alur Seleksi & Kamera Dual-Mode**: Pengguna dapat berpindah antara mode `DRONE` dan `POV` tanpa menembus kontur permukaan tanah/jembatan/dermaga, serta memilih seluruh 5 sektor operasional melalui kanvas 3D, tab HUD, Pin 3D, Mini-Map, maupun pintasan keyboard (`1–5`, `[`, `]`) dengan transisi kamera dan highlight visual yang sinkron.
4. **Keterpaduan Panel Data & Jam Operasional**: `InformationPanel` dan `SectorMarkersOverlay` memperbarui tampilan secara reaktif ketika state pada `SectorDataStore` berubah sesuai batas kapasitas alat resmi (`STS: 10`, `ASC: 20`, `RTG: 2`, `RS: 5`, `EH: 2`), dan `SimClock` berfungsi konsisten pada mode `LIVE` (waktu nyata + shift `S1`–`S3`) maupun mode `SIM` (Play/Pause, `1x`–`10x`, dan `Sync`).
5. **Kesiapan Build & Stabilitas Aplikasi**: Aplikasi dapat melalui proses build produksi (`npm run build`) tanpa error serta berjalan stabil pada browser modern berdukungan WebGL 2 tanpa error runtime pada konsol.
