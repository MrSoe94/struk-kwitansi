# RekaDok — Versi HTML Murni

Port lengkap aplikasi **RekaDok** (Generator Dokumen Bisnis Indonesia) ke
HTML/CSS/JavaScript murni — **tanpa framework, tanpa build step, tanpa server**.

Cukup buka `index.html` di browser (Chrome/Edge/Firefox), dan aplikasi langsung jalan.
Seluruh data disimpan di `localStorage` browser, jadi tidak perlu database.

## Cara pakai

1. Buka folder ini di File Explorer.
2. Klik dobel **`index.html`** (atau seret ke jendela browser).
3. Selesai. Untuk mulai, klik **"Muat Data Contoh"** di dasbor untuk mengisi 6 dokumen contoh.

> Opsional — jalankan dari server lokal jika browser membatasi `file://`:
> `npx serve .` atau `python -m http.server`, lalu buka `http://localhost:3000`.

## Halaman

| File | Fungsi |
|---|---|
| `index.html` | Dasbor — statistik, 15 tipe dokumen siap pakai, dokumen terbaru |
| `baru.html?type=<id>` | Editor dokumen baru + pratinjau langsung + cetak |
| `baru.html?id=<id>` | Lihat / edit dokumen tersimpan (mode edit) |
| `dokumen.html` | Arsip — cari, filter jenis, filter status, hapus, duplikasi |
| `pengaturan.html` | Profil perusahaan, tarif PPN, prefix & reset penomoran |

## 15 Tipe Dokumen

- **Penjualan & Kas:** Struk, Kwitansi, Nota, Invoice, Faktur, Nota Debet, Nota Kredit, HPP
- **Logistik & Penawaran:** Surat Jalan, Surat Penawaran
- **Surat Resmi:** Berita Acara, SPTJM, Surat Perjanjian, Surat Kuasa, Surat Keterangan

Fitur otomatis: penomoran urut per tipe (`PREFIX/TAHUN/0001`), subtotal-diskon-PPN-total
real-time, **terbilang** otomatis untuk kwitansi, template surat dengan variabel
(`{perusahaan} {nama} {alamat} {kota} {tanggal} …`), dan cetak / simpan PDF
satu klik (Ctrl+P → "Simpan sebagai PDF").

## Struktur

```
html-version/
├── index.html         dasbor
├── baru.html          editor (baru & edit)
├── dokumen.html       arsip
├── pengaturan.html    pengaturan
├── test.js            runnable check:  node test.js
└── assets/
    ├── style.css      seluruh gaya (port visual dari aplikasi asli)
    ├── core.js        format, terbilang, kalkulasi, 15 tipe dokumen, penyimpanan
    ├── preview.js     rendering 7 layout dokumen + scaling pratinjau
    ├── dashboard.js   logika dasbor
    ├── dokumen.js     logika arsip
    ├── editor.js      logika editor
    └── pengaturan.js  logika pengaturan
```

## Verifikasi

```bash
node test.js    # 76 asersi: format, terbilang, kalkulasi, penomoran,
                # penyimpanan, 7 layout dokumen, alur editor, semua halaman
```

Juga sudah diuji end-to-end di browser sungguhan (Edge/Chrome headless via
puppeteer-core): ke-4 halaman dimuat bersih **tanpa console error**, semua 15 tipe
dokumen merender, pratinjau update real-time, arsip/cari/pfilter bekerja,
pengaturan tersimpan, dan alur simpan-redirect-nomor otomatis berjalan.

> Chip total di toolbar editor menampilkan **total sudah termasuk PPN**
> (mis. 4.500.000 + PPN 11% → Rp 4.995.000), sama seperti kotak Total di dokumen.

## Catatan

- **Data tersimpan di browser** (localStorage). Menghapus data browsing akan menghapus dokumen.
  Untuk cadangan, ekspor lewat DevTools → Application → Local Storage.
- Font dimuat dari Google Fonts saat online; jika offline otomatis memakai font sistem.
- Untuk mencetak struk thermal di kertas 58mm, atur ukuran kertas khusus di dialog cetak.
- Port ini setia dengan logika aplikasi asli, termasuk *quirk* `terbilang` di sumbernya
  (mis. `11` → "Satu Belas", `20100` → "Dua Puluh Ribu Satu Ratus").
