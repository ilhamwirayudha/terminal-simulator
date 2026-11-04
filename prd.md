# PRD: Terminal Teluk Lamong (TTL) 3D Operation Simulator

> Dokumen ini adalah **sumber kebenaran** proyek: tujuan, roadmap fase, dan konvensi koordinat.
> Aturan penulisan kode dan struktur folder ada di [Assets.md](Assets.md). Cara menjalankan ada di [README.md](README.md).
> Bila ada konflik antara dokumen ini dan dokumen lain, dokumen ini yang berlaku.

---

## 1. Ringkasan & Tujuan

Simulator web 3D (Three.js + Vite) yang mereplika Terminal Teluk Lamong (PT Pelindo, Surabaya) dalam skala 1:1 dan dipakai sebagai *digital twin* operasional.

Prioritas pengembangan: **operasional petikemas lebih dulu**, karena alurnya bisa diukur. Kantor/Head Office dikerjakan paling akhir.

Tujuan:
1. Replika visual terminal yang akurat terhadap denah dan koordinat nyata.
2. Dasar simulasi alur truk kontainer (antre, gerbang, yard, dermaga) dengan metrik terukur.
3. Media presentasi dan edukasi bagi stakeholder.

---

## 2. Roadmap Fase

| Fase | Isi | Folder | Status |
|---|---|---|---|
| 1 | Jalan + Buffer Area (utilitas, waiting CY, waiting Cuker) | `jalan/`, `bufferArea/` | Selesai (kalibrasi legacy, lihat 3.4) |
| 2 | Container Yard + jalan pendukung + **Main Gate** (gerbang masuk menuju CY utama). Diawali ekstraksi aset kontainer dan truk. | `containerYard/`, `gateOffice/` | Belum |
| 3 | Dermaga + jalan pendukung | `dermaga/` | Belum |
| 4 | Terminal Curah Kering | `curahKering/` | Belum |
| 5 | Panel informasi kegiatan per area + animasi sederhana di area operasional utama + 1–2 metrik | `ui/`, `vehicles/`, `simulation/` | Belum |
| 6 | Kantor/Head Office, alat berat (reach stacker, ASC, STS), kalibrasi ulang Fase 1, penyempurnaan detail | `gateOffice/`, `equipment/`, semua | Belum |

Perkiraan progres per Nov 2026: ±20–25% dari total.

### 2.1 Batas waktu: 10 hari (mulai 4 Nov 2026)

Target demo: **semua area ada dan setiap area punya informasi kegiatan**. Animasi hanya di area operasional utama (CY, Dermaga, Main Gate).

| Hari | Pekerjaan | Input dari pemilik proyek |
|---|---|---|
| 1 | Revisi dokumen, ekstraksi aset kontainer/truk dari `waitingCY` | Konfirmasi dimensi |
| 2–3 | Fase 2: Container Yard + Main Gate | Denah + lat/lon + deskripsi kegiatan |
| 4–5 | Fase 3: Dermaga | Denah + lat/lon + deskripsi kegiatan |
| 6 | Fase 4: Curah Kering | Denah + lat/lon + deskripsi kegiatan |
| 7–8 | Fase 5: panel informasi + animasi + metrik | Teks kegiatan per area |
| 9 | Fase 6: Kantor + alat berat | Denah + lat/lon |
| 10 | Penyempurnaan, kalibrasi ulang seperlunya, cadangan waktu | Review akhir |

**Urutan pemotongan bila mundur** (yang pertama dikorbankan di atas):
1. Kantor/Head Office dan penyempurnaan detail (Fase 6)
2. Animasi (Fase 5)
3. Curah Kering (Fase 4)

Container Yard, Dermaga, dan Main Gate tidak dipotong.

> Input dikirim **per area saat fasenya dimulai**. Keterlambatan input langsung menggeser jadwal, jadi kirim secepat mungkin.

**Kriteria selesai tiap fase (area):**
- Bentuk dan posisi sesuai denah/screenshot.
- Tidak ada tabrakan atau tumpang-tindih dengan area tetangga.
- Kamu mengecek visual di browser dan menyetujui.
- Detail halus sengaja ditunda ke Fase 6.

**Alur kerja per area:**
1. Pemilik proyek mengirim screenshot denah dan 2–4 titik sudut lat/lon dari Google Maps.
2. Pengembang membuat `Geo*.js`, aset di `src/assets/`, dan `SubArea*.js`.
3. Pemilik proyek memeriksa hasilnya di browser.

---

## 3. Konvensi Koordinat

### 3.1 Sistem dunia
- 1 unit Three.js = 1 meter.
- Konversi lat/lon ↔ meter dilakukan oleh [GeoProjection.js](src/world/GeoProjection.js): datum `DEFAULT_DATUM` (`-7.2100105, 112.6626984`), bearing koridor 57.55°, sumbu +Z mengarah ke terminal.
- +Y = ketinggian, +X = sisi kanan koridor.

### 3.2 Aturan untuk area baru (wajib)
1. Ambil **2–4 titik sudut** area dari Google Maps (lat/lon).
2. Konversi ke X/Z lewat `GeoProjection`.
3. Turunkan `SITE_CALIBRATION` (batas UV) dari titik-titik tersebut. **Jangan menulis batas Z/X secara manual.**
4. Gunakan screenshot (UV) hanya untuk detail di dalam area.
5. Cantumkan titik lat/lon sumber di header `Geo*.js`.

### 3.3 Orientasi UV (mengikuti `GeoUtilitas.js`)
- Atas = barat laut (+X), bawah = tenggara (−X, sisi jalan utama).
- Kiri = barat daya (−Z, abutmen jembatan), kanan = timur laut (+Z, arah pre-gate).

### 3.4 Status kalibrasi Fase 1 (legacy)
Jalan dan Buffer Area dikalibrasi dengan UV manual dan **belum selaras lat/lon**. Nilai dibekukan dan dikalibrasi ulang di Fase 6.

| Area | Rentang Z saat ini |
|---|---|
| Utilitas | 604.5 – 775 |
| Waiting CY | 775 – 1034 |
| Waiting Cuker | 1034 – 1220+ |

> README lama memakai Z −1108…+780 untuk koridor daratan. Ini berbeda dengan penempatan buffer area sekarang. Penyelarasan satu sistem Z dikerjakan di Fase 6.

---

## 4. Standar Aset

Ukuran kontainer dan truk yang dipakai adalah yang sudah dikerjakan pemilik proyek di `src/terminal/bufferArea/waitingCY/`. Di **awal Fase 2** keduanya diekstrak menjadi aset bersama `createContainer` dan `createContainerTruck` di `src/assets/`, dengan nilai dari folder tersebut.

| Objek | Sumber standar | Catatan |
|---|---|---|
| Kontainer 20 ft | `SubAreaBlokTR.js`: 2.44 (X) × 2.59 (Y) × 6.06 (Z) | Kontainer 40 ft mengikuti proporsi di `SubAreaWaitingCY.js` |
| Truk kontainer | `SubAreaWaitingCY.js`: varian kosong, 1×20ft, 2×20ft, 1×40ft | Masih inline, diekstrak di Fase 2 |

`Truck.js` (2.4 × 2.5 × 6.0, sasis 9.0 m) **bukan** standar. Itu kode legacy dan tidak dipakai sebagai acuan.

---

## 5. Kode Legacy dari Pengembang Sebelumnya

Tidak dihapus sekarang. Tiap file diputuskan **pakai / tulis ulang / hapus** pada fase penggantinya.

| File | Status saat ini | Diputuskan di |
|---|---|---|
| `src/world/Road.js` | Tidak diimpor `main.js` | Fase 2–3 |
| `src/world/BridgeAndOffice.js` | Tidak diimpor `main.js` | Fase 6 |
| `src/world/Gate.js` | Tidak diimpor `main.js` | Fase 2 (Main Gate) |
| `src/world/environment.js` | Dipakai `main.js` | Fase 6 |
| `src/vehicles/Truck.js`, `TruckManager.js` | `TruckManager` dibuat di `main.js`, armada kosong | Fase 5 |
| `src/simulation/StateMachine.js` | Dipakai `Truck.js` | Fase 5 |
| `src/equipment/ReachStacker.js` | Belum dipakai | Fase 6 |

---

## 6. Fitur "Detail Kegiatan" dan Metrik

- Tiap area punya **panel informasi**: fungsi area dan alur kegiatan di dalamnya (misal CY: bongkar-muat, penumpukan blok). Muncul saat area diklik atau didekati, memakai `SelectionManager` dan `InformationPanel` yang sudah ada.
- Animasi sederhana hanya di area operasional utama: CY, Dermaga, Main Gate.
- Metrik HUD: 1–2 metrik, jenisnya ditentukan di Fase 5.
- Teks kegiatan tiap area disuplai pemilik proyek bersama denah.

## 7. Pertanyaan Terbuka

1. Metrik apa yang ditampilkan di HUD (Fase 5).
2. Daftar area yang dianggap "operasional utama" untuk animasi (usulan: CY, Dermaga, Main Gate).
