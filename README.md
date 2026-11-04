# Terminal Teluk Lamong (TTL) 3D Operation Simulator

Simulator web 3D interaktif (Three.js + Vite) yang mereplika Terminal Teluk Lamong, Surabaya (PT Pelindo), dalam skala 1:1 berdasarkan koordinat nyata. Tujuan akhirnya adalah simulasi operasional petikemas yang terukur.

Proyek ini sedang dikembangkan bertahap. Tujuan, roadmap fase, dan konvensi koordinat ada di **[prd.md](prd.md)**. Aturan kode dan struktur folder ada di **[Assets.md](Assets.md)**.

## Stack

| Komponen | Teknologi |
|---|---|
| Grafis 3D | Three.js `^0.185.1` |
| Build tool | Vite `^8.2.0` |
| Bahasa | JavaScript (ESM) |
| UI | HTML + CSS (panel HUD) |

## Menjalankan

Prasyarat: Node.js 18+ dan browser dengan WebGL 2.

```bash
npm install
npm run dev       # server pengembangan
npm run build     # build produksi
npm run preview   # pratinjau hasil build
```

## Kontrol

| Kontrol | Fungsi |
|---|---|
| Mouse | Mengarahkan/memutar kamera (mode first-person) |
| `W` `A` `S` `D` | Bergerak maju, kiri, mundur, kanan |
| `Q` / `E` | Naik / turun |
| `Shift` | Bergerak lebih cepat |
| `[` / `]` | Zoom lensa (FOV) |
| `R` atau `Esc` | Reset kamera ke posisi Overview |
| Tombol stasiun di panel | Pindah cepat ke sudut pandang preset |
| Panel GPS | Lihat koordinat kamera, salin, dan teleportasi lewat lat/lon |

## Struktur Singkat

```text
src/
├── assets/     # Aset 3D reusable (material, infrastruktur, bangunan, industri, alam)
├── terminal/   # Dunia 3D: jalan/, bufferArea/ (area lain menyusul sesuai roadmap)
├── world/      # Scene, lampu, proyeksi GPS, environment
├── camera/     # Kamera dan preset stasiun
├── vehicles/   # Truk (belum aktif)
├── simulation/ # State machine dan seleksi objek
└── ui/         # Panel HUD dan kompas
```

Detail lengkap ada di [Assets.md](Assets.md).

## Pengembangan

Proyek ini dikembangkan untuk program simulasi dan visualisasi 3D operasional maritim di lingkungan Terminal Teluk Lamong, PT Pelabuhan Indonesia (Persero) / Universitas Ciputra Surabaya.
