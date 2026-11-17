# Terminal Teluk Lamong (TTL) 3D Operation Simulator

Simulator web 3D interaktif berbasis Three.js dan Vite yang mereplika kawasan Terminal Teluk Lamong, Surabaya (PT Pelindo), dalam skala metrik 1:1 berdasarkan koordinat GPS nyata.

## Dokumentasi Proyek

Untuk menghindari duplikasi, detail spesifikasi dan arsitektur dipisah pada dokumen berikut:

* **[docs/prd.md](docs/prd.md)** — *Product Requirements Document* (overview produk, tujuan, target pengguna, fitur inti, *user flow*, kebutuhan fungsional/non-fungsional, ruang lingkup, dan kriteria keberhasilan).
* **[docs/Assets.md](docs/Assets.md)** — Standar arsitektur kode, struktur direktori `src/`, serta spesifikasi aset 3D (alat berat STS/ASC/RTG, armada truk, kontainer ISO, bangunan, infrastruktur, dan lingkungan).

## Stack Teknologi

| Komponen | Teknologi |
|---|---|
| Grafis 3D | Three.js `^0.185.1` |
| Build Tool | Vite `^8.2.0` |
| Bahasa | JavaScript (ESM) |
| Antarmuka | HTML + CSS (HUD interaktif & Mini-Map 2D Canvas) |

## Menjalankan Proyek

Prasyarat: **Node.js 18+** dan browser desktop modern dengan dukungan **WebGL 2**.

```bash
npm install
npm run dev       # menjalankan server pengembangan lokal
npm run build     # membangun bundel produksi ke dist/
npm run preview   # pratinjau hasil build produksi
```

## Referensi Kontrol Cepat

| Input | Fungsi |
|---|---|
| `Drag Kiri` | Pan peta mendatar (`DRONE`) / Menoleh 360° (`POV`) |
| `Drag Kanan` / `Tengah` / `Ctrl+Kiri` | Orbit 360° mengelilingi titik fokus (`DRONE`) |
| `Scroll` | Zoom ke arah kursor (`DRONE`) / Maju-mundur di jalur (`POV`) |
| `W` `A` `S` `D` | Gerak horizontal |
| `Q` / `E` (atau `Z`) | Naik / turun ketinggian |
| `Shift` / `Alt` | Pengali kecepatan cepat (`2.5x`) / presisi (`0.2x`) |
| `1`–`5` | Pilih sektor operasional (`Pre-Gate` s/d `Dermaga`) |
| `[` / `]` | Berpindah ke sektor sebelumnya / berikutnya |
| `V` | Ganti mode kamera (`DRONE` / `POV`) |
| `R` atau `Esc` | Reset kamera ke tampilan Overview |
| `Space` | Play / Pause simulasi waktu (saat mode jam `SIM` aktif) |

## Pengembangan

Proyek ini dikembangkan untuk program simulasi dan visualisasi 3D operasional maritim di lingkungan Terminal Teluk Lamong, PT Pelabuhan Indonesia (Persero) / Universitas Ciputra Surabaya.
