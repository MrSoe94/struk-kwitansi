/* ============================================================
   RekaDok — core logic (port dari src/lib/*.ts + src/components/icons.tsx)
   ============================================================ */

/* --------------------------- Icons --------------------------- */

const ICON_PATHS = {
  logo: '<path d="M4 4h13l3 3v13a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V5a1 1 0 0 1 1-1Z"/><path d="M17 4v3h3"/><path d="M8 12h8M8 15.5h5.5"/><circle cx="8.2" cy="8.3" r="1" fill="currentColor" stroke="none"/>',
  dashboard: '<rect x="3" y="3" width="8" height="9" rx="1.5"/><rect x="13" y="3" width="8" height="5" rx="1.5"/><rect x="13" y="11" width="8" height="10" rx="1.5"/><rect x="3" y="15" width="8" height="6" rx="1.5"/>',
  doc: '<path d="M14 3H7a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V8l-5-5Z"/><path d="M14 3v5h5"/>',
  settings: '<circle cx="12" cy="12" r="3.2"/><path d="M12 2.5v2.4M12 19.1v2.4M2.5 12h2.4M19.1 12h2.4M5.2 5.2l1.7 1.7M17.1 17.1l1.7 1.7M5.2 18.8l1.7-1.7M17.1 6.9l1.7-1.7"/>',
  plus: '<path d="M12 5v14M5 12h14"/>',
  search: '<circle cx="11" cy="11" r="6.5"/><path d="m20 20-3.8-3.8"/>',
  back: '<path d="m15 18-6-6 6-6"/>',
  "arrow-right": '<path d="M4.5 12h15"/><path d="m13 5.5 6.5 6.5-6.5 6.5"/>',
  printer: '<path d="M7 8V3h10v5"/><rect x="3" y="8" width="18" height="9" rx="2"/><path d="M7 14h10v7H7z"/>',
  trash: '<path d="M4 7h16M10 11v6M14 11v6"/><path d="M6 7l1 13a1 1 0 0 0 1 1h8a1 1 0 0 0 1-1l1-13"/><path d="M9 7V4h6v3"/>',
  copy: '<rect x="9" y="9" width="12" height="12" rx="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/>',
  sparkle: '<path d="M12 3.5 13.8 8.7 19 10.5l-5.2 1.8L12 17.5l-1.8-5.2L5 10.5l5.2-1.8Z"/><path d="M18.5 16.5 19.2 18.4l1.9.7-1.9.7-.7 1.9-.7-1.9-1.9-.7 1.9-.7Z"/>',
  check: '<path d="m5 13 4 4L19 7"/>',
  x: '<path d="M6 6l12 12M18 6 6 18"/>',
  edit: '<path d="M12 20h9"/><path d="M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4Z"/>',
  receipt: '<path d="M5.5 3h13v18l-2.2-1.6L14 21l-2-1.5L10 21l-2.3-1.6L5.5 21Z"/><path d="M9 8h6M9 11.5h6M9 15h3.5"/>',
  kwitansi: '<circle cx="12" cy="12" r="8.5"/><path d="m8.4 12.3 2.4 2.4 4.8-5"/>',
  nota: '<path d="M14 3H7a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V8l-5-5Z"/><path d="M14 3v5h5M9 13h6M9 16.5h4"/>',
  invoice: '<path d="M14 3H7a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V8l-5-5Z"/><path d="M14 3v5h5"/><path d="M12 11v6M10 12.5c0-.8.9-1.3 2-1.3s2 .5 2 1.3-.9 1.2-2 1.2-2 .5-2 1.3.9 1.3 2 1.3 2-.5 2-1.3"/>',
  faktur: '<path d="m12 3 7 2.8v5c0 4.6-3 7.7-7 9.4-4-1.7-7-4.8-7-9.4v-5Z"/><path d="m9 11.8 2.1 2.1L15 9.9"/>',
  banknote: '<rect x="2.5" y="6.5" width="19" height="11" rx="2"/><circle cx="12" cy="12" r="2.6"/><path d="M6 12h.01M18 12h.01"/>',
  hpp: '<path d="M3.5 11.5v-8h8l9 9-8 8-9-9Z"/><circle cx="8" cy="8" r="1.4"/>',
  truck: '<path d="M2 6.5h11.5V16H2Z"/><path d="M13.5 9.5H17l3.5 3.5v3h-3.5"/><circle cx="6.2" cy="17.8" r="1.7"/><circle cx="16.2" cy="17.8" r="1.7"/>',
  penawaran: '<path d="M14 3H7a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V8l-5-5Z"/><path d="M14 3v5h5"/><path d="m9.5 15.5 3.8-3.8 2 2-3.8 3.8-2.4.4Z"/>',
  "berita-acara": '<rect x="5.5" y="4.5" width="13" height="16.5" rx="2"/><path d="M9.5 4.5a2.5 2.5 0 0 1 5 0"/><path d="m9 13.5 2.1 2.1 4-4.3"/>',
  sptjm: '<path d="M14 3H7a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V8l-5-5Z"/><path d="M14 3v5h5"/><path d="m12 10.5 2.6 1v2.1c0 1.7-1.1 2.9-2.6 3.4-1.5-.5-2.6-1.7-2.6-3.4v-2.1Z"/>',
  perjanjian: '<path d="M4 15.5c2.4-4.8 3.9-4.8 5-1.8s2.6 3 5.4-1.7"/><path d="M4 19h16"/>',
  kuasa: '<circle cx="8" cy="15.5" r="3.8"/><path d="m10.8 12.7 7.7-7.7"/><path d="m15 8.5 2.8 2.8M12.3 11.2l2 2"/>',
  keterangan: '<rect x="2.5" y="5" width="19" height="14" rx="2"/><circle cx="8.5" cy="10.5" r="2"/><path d="M5.5 15.5c.6-1.5 1.7-2.2 3-2.2s2.4.7 3 2.2"/><path d="M14.5 10h4.5M14.5 13.5h3"/>',
  calendar: '<rect x="3.5" y="5" width="17" height="16" rx="2"/><path d="M3.5 9.5h17M8 3v4M16 3v4"/>',
  building: '<path d="M4 21V4a1 1 0 0 1 1-1h9a1 1 0 0 1 1 1v17"/><path d="M15 9h4a1 1 0 0 1 1 1v11"/><path d="M2.5 21h19"/><path d="M7.5 7h2M7.5 10.5h2M7.5 14h2M11 7h1M11 10.5h1M11 14h1"/>',
  wallet: '<path d="M20 7H5a2 2 0 0 1 0-4h13v4"/><path d="M3 5v13a2 2 0 0 0 2 2h15a1 1 0 0 0 1-1V8a1 1 0 0 0-1-1"/><circle cx="16.5" cy="13.5" r="1" fill="currentColor" stroke="none"/>',
  eye: '<path d="M2.5 12S6 5.5 12 5.5 21.5 12 21.5 12 18 18.5 12 18.5 2.5 12 2.5 12Z"/><circle cx="12" cy="12" r="3"/>',
  refresh: '<path d="M20 12a8 8 0 1 1-2.34-5.66"/><path d="M20 4v4h-4"/>',
  clock: '<circle cx="12" cy="12" r="8.5"/><path d="M12 7.5V12l3 2"/>',
  users: '<circle cx="9" cy="8" r="3"/><path d="M2.5 19.5c.6-3.2 3.2-4.6 6.5-4.6s5.9 1.4 6.5 4.6"/><path d="M16.5 5.7a3 3 0 0 1 0 5.6"/><path d="M17.5 15.2c2.2.5 3.6 1.9 4 4.3"/>',
  image: '<rect x="3" y="4.5" width="18" height="15" rx="2"/><circle cx="8.5" cy="10" r="1.6"/><path d="m4 17.5 4.5-4.5 3.5 3.5 3-3L20 18"/>',
  upload: '<path d="M12 16V4"/><path d="m7 9 5-5 5 5"/><path d="M4 16v2.5A1.5 1.5 0 0 0 5.5 20h13a1.5 1.5 0 0 0 1.5-1.5V16"/>',
  pen: '<path d="M12 20h9"/><path d="M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4Z"/>',
  swap: '<path d="M4 8h13"/><path d="m13 4.5 4 3.5-4 3.5"/><path d="M20 16H7"/><path d="m11 12.5-4 3.5 4 3.5"/>',
};

function icon(name, size) {
  const s = size || 16;
  const p = ICON_PATHS[name] || ICON_PATHS.doc;
  return `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" width="${s}" height="${s}" aria-hidden="true" style="flex:none">${p}</svg>`;
}
const ic = icon;

/* --------------------------- Format (src/lib/format.ts) --------------------------- */

const BULAN = ["Januari","Februari","Maret","April","Mei","Juni","Juli","Agustus","September","Oktober","November","Desember"];
const HARI = ["Minggu","Senin","Selasa","Rabu","Kamis","Jumat","Sabtu"];

function pad2(n) { return String(n).padStart(2, "0"); }

function todayISO() {
  const d = new Date();
  return `${d.getFullYear()}-${pad2(d.getMonth() + 1)}-${pad2(d.getDate())}`;
}

function parseISO(iso) {
  if (!iso || !/^\d{4}-\d{2}-\d{2}$/.test(iso)) return null;
  const [y, m, d] = iso.split("-").map(Number);
  return new Date(y, m - 1, d);
}

function formatDateID(iso) {
  const d = parseISO(iso);
  if (!d) return "—";
  return `${d.getDate()} ${BULAN[d.getMonth()]} ${d.getFullYear()}`;
}

function formatDateLongID(iso) {
  const d = parseISO(iso);
  if (!d) return "—";
  return `${HARI[d.getDay()]}, ${d.getDate()} ${BULAN[d.getMonth()]} ${d.getFullYear()}`;
}

function formatShortISO(iso) {
  const d = parseISO(iso);
  if (!d) return "—";
  return `${pad2(d.getDate())}/${pad2(d.getMonth() + 1)}/${d.getFullYear()}`;
}

function formatShortID(iso) {
  const d = parseISO(iso);
  if (!d) return "—";
  return `${d.getDate()} ${BULAN[d.getMonth()].slice(0, 3)} ${d.getFullYear()}`;
}

function formatRupiah(n) {
  return "Rp " + Math.round(n || 0).toLocaleString("id-ID");
}
function formatRupiahDash(n) { return formatRupiah(n) + ",-"; }
function formatNumber(n) { return Math.round(n || 0).toLocaleString("id-ID"); }

const SATUAN = ["Nol","Satu","Dua","Tiga","Empat","Lima","Enam","Tujuh","Delapan","Sembilan"];

function tigaDigit(n) {
  if (n === 0) return "";
  const parts = [];
  const c = Math.floor(n / 100);
  const rest = n % 100;
  if (c > 0) parts.push(SATUAN[c] + " Ratus");
  if (rest === 10) parts.push("Sepuluh");
  else if (rest > 10 && rest < 20) parts.push(SATUAN[rest - 10] + " Belas");
  else if (rest > 0 && rest < 10) parts.push(c > 0 && rest === 1 ? "Sepuluh" : SATUAN[rest]);
  else if (rest >= 20) {
    const p = Math.floor(rest / 10);
    const s = rest % 10;
    parts.push(SATUAN[p] + " Puluh" + (s > 0 ? " " + SATUAN[s] : ""));
  }
  return parts.join(" ");
}

function terbilang(n) {
  const value = Math.floor(Math.abs(Math.round(n || 0)));
  if (value === 0) return "Nol";
  const scales = [[1e12,"Triliun"],[1e9,"Miliar"],[1e6,"Juta"],[1e3,"Ribu"]];
  let rest = value;
  const out = [];
  for (const [v, name] of scales) {
    const q = Math.floor(rest / v);
    if (q > 0) {
      out.push((q === 1 ? "Satu" : tigaDigit(q)) + " " + name);
      rest = rest % v;
    }
  }
  if (rest > 0) out.push(tigaDigit(rest));
  return out.join(" ");
}
function terbilangRupiah(n) { return terbilang(n) + " Rupiah"; }

function daysAgoISO(n) {
  const d = new Date();
  d.setDate(d.getDate() - n);
  return `${d.getFullYear()}-${pad2(d.getMonth() + 1)}-${pad2(d.getDate())}`;
}

/* --------------------------- Calc (src/lib/calc.ts) --------------------------- */

function calcTotals(i) {
  const gross = i.items.reduce((a, it) => a + (Number(it.qty) || 0) * (Number(it.price) || 0), 0);
  const subtotal = Math.max(0, gross - (Number(i.discount) || 0));
  const ppn = i.hasPpn ? Math.round(subtotal * (Number(i.ppnRate) || 0) / 100) : 0;
  return { gross, subtotal, ppn, total: subtotal + ppn };
}

/* --------------------------- Doc types (src/lib/docTypes.ts) --------------------------- */

const DOC_TYPES = [
  { id:"struk", label:"Struk Belanja", docTitle:"STRUK", desc:"Bukti transaksi kasir / retail", category:"Penjualan & Kas", prefix:"STR", layout:"struk", hasItems:true, hasPpn:false, hasCustomer:false, hasBody:false,
    fields:[{ key:"tunai", label:"Dibayar tunai", numeric:true, placeholder:"cth 150000" }], signatures:[], icon:"receipt" },
  { id:"kwitansi", label:"Kwitansi", docTitle:"KWITANSI", desc:"Bukti penerimaan uang", category:"Penjualan & Kas", prefix:"KWT", layout:"kwitansi", hasItems:true, hasPpn:false, hasCustomer:true, hasBody:false,
    fields:[{ key:"tujuan", label:"Untuk pembayaran", placeholder:"cth Pelunasan Invoice INV/2026/0001" },{ key:"kota", label:"Kota" }],
    signatures:[{ label:"Yang Menerima", party:"company" },{ label:"Yang Memberikan", party:"customer" }], icon:"kwitansi" },
  { id:"nota", label:"Nota (Nota Jual)", docTitle:"NOTA", desc:"Bukti penjualan retail / cash", category:"Penjualan & Kas", prefix:"NTA", layout:"nota", hasItems:true, hasPpn:true, hasCustomer:true, hasBody:false,
    fields:[], signatures:[{ label:"Yang Mengetahui", party:"company" }], icon:"nota" },
  { id:"invoice", label:"Invoice / Tagihan", docTitle:"INVOICE", desc:"Tagihan ke pelanggan / vendor", category:"Penjualan & Kas", prefix:"INV", layout:"nota", hasItems:true, hasPpn:true, hasCustomer:true, hasBody:false,
    fields:[{ key:"jatuh_tempo", label:"Jatuh tempo", placeholder:"cth 14 hari" }], signatures:[{ label:"Hormat kami", party:"company" }], icon:"invoice" },
  { id:"faktur", label:"Faktur (Pajak)", docTitle:"FAKTUR", desc:"Faktur penjualan + NPKP/NPWP", category:"Penjualan & Kas", prefix:"FAK", layout:"nota", hasItems:true, hasPpn:true, hasCustomer:true, hasBody:false,
    fields:[{ key:"jatuh_tempo", label:"Jatuh tempo", placeholder:"cth 14 hari" }], signatures:[{ label:"Hormat kami", party:"company" }], icon:"faktur" },
  { id:"nota-debet", label:"Nota Debet", docTitle:"NOTA DEBET", desc:"Tagihan tambahan ke piutang", category:"Penjualan & Kas", prefix:"NDB", layout:"nota", hasItems:true, hasPpn:false, hasCustomer:true, hasBody:false,
    fields:[], signatures:[{ label:"Pihak Pemberi", party:"company" },{ label:"Pihak Penerima", party:"customer" }], icon:"banknote" },
  { id:"nota-kredit", label:"Nota Kredit", docTitle:"NOTA KREDIT", desc:"Pengembalian / potongan piutang", category:"Penjualan & Kas", prefix:"NKR", layout:"nota", hasItems:true, hasPpn:false, hasCustomer:true, hasBody:false,
    fields:[], signatures:[{ label:"Pihak Pemberi", party:"company" },{ label:"Pihak Penerima", party:"customer" }], icon:"banknote" },
  { id:"hpp", label:"HPP (Harga Pokok)", docTitle:"HPP", desc:"Rekap harga pokok penjualan", category:"Penjualan & Kas", prefix:"HPP", layout:"hpp", hasItems:true, hasPpn:false, hasCustomer:false, hasBody:false,
    fields:[{ key:"periode", label:"Periode", placeholder:"cth Maret 2026" }], signatures:[{ label:"Hormat kami", party:"company" }], icon:"hpp" },
  { id:"surat-jalan", label:"Surat Jalan", docTitle:"SURAT JALAN", desc:"Bukti pengiriman barang", category:"Logistik & Penawaran", prefix:"SJL", layout:"surat-jalan", hasItems:true, hasPpn:false, hasCustomer:true, hasBody:false,
    fields:[{ key:"tujuan_kirim", label:"Alamat tujuan pengiriman" }],
    signatures:[{ label:"Petugas Mengantar", party:"company" },{ label:"Penerima Barang", party:"customer" }], icon:"truck" },
  { id:"penawaran", label:"Surat Penawaran", docTitle:"SURAT PENAWARAN", desc:"Penawaran harga barang / jasa", category:"Logistik & Penawaran", prefix:"SNW", layout:"penawaran", hasItems:true, hasPpn:true, hasCustomer:true, hasBody:false,
    fields:[{ key:"berlaku", label:"Masa berlaku penawaran", placeholder:"14 hari" }], signatures:[{ label:"Hormat kami", party:"company" }], icon:"penawaran" },
  { id:"berita-acara", label:"Berita Acara", docTitle:"BERITA ACARA", desc:"Dokumen serah terima / pelaksanaan", category:"Surat Resmi", prefix:"BA", layout:"surat", hasItems:false, hasPpn:false, hasCustomer:true, hasBody:true,
    fields:[{ key:"objek", label:"Objek berita acara", placeholder:"cth pekerjaan renovasi kantor cabang" },{ key:"kota", label:"Kota" }],
    signatures:[{ label:"Pihak Pertama", party:"company" },{ label:"Pihak Kedua", party:"customer" }], icon:"berita-acara",
    template: `Bahwa pada hari ini {hari_tanggal}, bertempat di {kota}, telah dilaksanakan serah terima {objek} antara {perusahaan}, yang diwakili oleh {ttd_company} (Pihak Pertama), dengan {nama}, beralamat di {alamat} (Pihak Kedua).\n\nSetelah dilakukan pemeriksaan bersama, Pihak Kedua menyatakan bahwa seluruh objek tersebut telah diterima dalam keadaan lengkap, baik, dan sesuai dengan ketentuan yang telah disepakati. Dengan demikian, serah terima dinyatakan sah dan selesai serta tidak dapat diganggu gugat.\n\nDemikian berita acara ini dibuat dengan sebenarnya untuk dipergunakan sebagaimana mestinya.` },
  { id:"sptjm", label:"SPTJM", docTitle:"SURAT PERNYATAAN TANGGUNG JAWAB MUTLAK", desc:"Surat pernyataan tanggung jawab", category:"Surat Resmi", prefix:"PTJM", layout:"surat", hasItems:false, hasPpn:false, hasCustomer:true, hasBody:true,
    fields:[{ key:"jabatan", label:"Jabatan" },{ key:"identitas", label:"No. KTP / Identitas" },{ key:"kota", label:"Kota" }],
    signatures:[{ label:"Yang Menyatakan", party:"customer" }], icon:"sptjm", tightTitle:true,
    template: `Yang bertanda tangan di bawah ini:\n\nNama : {nama}\nJabatan : {jabatan}\nAlamat : {alamat}\nNo. Identitas : {identitas}\n\nDengan ini menyatakan dengan sesungguhnya bahwa seluruh data dan informasi yang kami berikan adalah benar dan dapat dipertanggungjawabkan. Apabila di kemudian hari ditemukan kekeliruan atau ketidakbenaran dalam data tersebut, kami bersedia menanggung segala akibat yang timbul serta dapat dimintai keterangan lebih lanjut kapan pun dibutuhkan.\n\nDemikian surat pernyataan tanggung jawab mutlak ini dibuat dengan sadar dan tanpa adanya paksaan dari pihak mana pun, untuk dapat dipergunakan sebagaimana mestinya.` },
  { id:"perjanjian", label:"Surat Perjanjian", docTitle:"SURAT PERJANJIAN", desc:"Perjanjian kerja sama / jasa", category:"Surat Resmi", prefix:"PRJ", layout:"surat", hasItems:false, hasPpn:false, hasCustomer:true, hasBody:true,
    fields:[{ key:"objek", label:"Objek / Pasal 1", placeholder:"cth penyediaan jasa desain interior kantor" },{ key:"masa", label:"Masa berlaku / Pasal 3", placeholder:"cth 6 (enam) bulan" },{ key:"kota", label:"Kota" }],
    signatures:[{ label:"Pihak Pertama", party:"company" },{ label:"Pihak Kedua", party:"customer" }], icon:"perjanjian",
    template: `Pada hari ini {hari_tanggal}, bertempat di {kota}, kedua belah pihak:\n\n1. {perusahaan}, beralamat di {alamat_perusahaan}, selanjutnya disebut sebagai PIHAK PERTAMA.\n2. {nama}, beralamat di {alamat}, selanjutnya disebut sebagai PIHAK KEDUA.\n\nKedua belah pihak yang bertindak untuk dan atas nama sendiri sepakat untuk mengadakan perjanjian dengan ketentuan dan syarat sebagai berikut:\n\nPasal 1 — Objek Perjanjian\n{objek}\n\nPasal 2 — Hak dan Kewajiban\nKedua belah pihak sepakat untuk melaksanakan hak dan kewajiban masing-masing sesuai dengan ketentuan yang telah disepakati dalam perjanjian ini.\n\nPasal 3 — Masa Berlaku\nPerjanjian ini berlaku selama {masa} terhitung sejak tanggal ditandatanganinya perjanjian ini dan berakhir secara hukum pada saat jangka waktunya habis, kecuali diperpanjang atas kesepakatan kedua belah pihak.\n\nDemikian perjanjian ini dibuat dan ditandatangani oleh kedua belah pihak dalam keadaan sadar dan tanpa adanya paksaan dari pihak mana pun, untuk dipergunakan sebagaimana mestinya.` },
  { id:"kuasa", label:"Surat Kuasa", docTitle:"SURAT KUASA", desc:"Pemberian kuasa bertindak", category:"Surat Resmi", prefix:"SKU", layout:"surat", hasItems:false, hasPpn:false, hasCustomer:true, hasBody:true,
    fields:[{ key:"jabatan", label:"Jabatan pemberi kuasa" },{ key:"nama_berkuasa", label:"Nama penerima kuasa" },{ key:"jabatan_berkuasa", label:"Jabatan penerima kuasa" },{ key:"identitas_berkuasa", label:"No. KTP penerima kuasa" },{ key:"kuasa_kegiatan", label:"Kegiatan yang dikuasakan", placeholder:"cth mengurus pengurusan dokumen Bea Cukai atas nama perusahaan" },{ key:"kota", label:"Kota" }],
    signatures:[{ label:"Pemberi Kuasa", party:"company" }], icon:"kuasa",
    template: `Saya yang bertanda tangan di bawah ini:\n\nNama : {ttd_company}\nJabatan : {jabatan}\nPerusahaan : {perusahaan}\nAlamat : {alamat_perusahaan}\nSelanjutnya disebut sebagai PEMBERI KUASA.\n\nDengan ini memberikan kuasa kepada:\n\nNama : {nama_berkuasa}\nJabatan : {jabatan_berkuasa}\nNo. Identitas : {identitas_berkuasa}\nSelanjutnya disebut sebagai PENERIMA KUASA.\n\nUntuk dan atas nama Pemberi Kuasa melakukan {kuasa_kegiatan}, serta melakukan segala tindakan yang diperlukan sehubungan dengan hal tersebut. Segala perbuatan hukum yang dilakukan oleh Penerima Kuasa sebagai akibat dari pemberian kuasa ini adalah sah dan mengikat, serta menjadi tanggung jawab Pemberi Kuasa.\n\nSurat kuasa ini dibuat dan ditandatangani untuk dapat dipergunakan sebagaimana mestinya.` },
  { id:"keterangan", label:"Surat Keterangan", docTitle:"SURAT KETERANGAN", desc:"Keterangan kerja / domisili / usaha", category:"Surat Resmi", prefix:"SKT", layout:"surat", hasItems:false, hasPpn:false, hasCustomer:true, hasBody:true,
    fields:[{ key:"jabatan", label:"Jabatan" },{ key:"tanggal_mulai", label:"Bekerja sejak", placeholder:"cth 1 Maret 2023" },{ key:"status_karyawan", label:"Status", placeholder:"cth karyawan tetap" },{ key:"kota", label:"Kota" }],
    signatures:[{ label:"Hormat kami", party:"company" }], icon:"keterangan",
    template: `Dengan hormat,\n\nYang bertanda tangan di bawah ini, {ttd_company} selaku {jabatan_dir} dari {perusahaan}, beralamat di {alamat_perusahaan}, dengan ini menerangkan bahwa:\n\nNama : {nama}\nJabatan : {jabatan}\nAlamat : {alamat}\n\nAdalah benar telah bekerja di {perusahaan} sejak {tanggal_mulai} dengan status {status_karyawan}. Selama bekerja, yang bersangkutan memiliki tanggung jawab dan perilaku kerja yang baik.\n\nDemikian surat keterangan ini kami buat dengan sebenar-benarnya agar dapat dipergunakan sebagaimana mestinya.` },
];

const CATEGORIES = [...new Set(DOC_TYPES.map((t) => t.category))];

function typeById(id) {
  return DOC_TYPES.find((t) => t.id === id) || DOC_TYPES.find((t) => t.id === "invoice");
}

const EMPTY_COMPANY = { name:"", address:"", phone:"", email:"", website:"", npwp:"", npkp:"", signatory:"", signatoryTitle:"", logo:"", signatureImg:"" };
const EMPTY_CUSTOMER = { name:"", address:"", phone:"", npwp:"", signatureImg:"" };

function normalizeCompany(c) { return { ...EMPTY_COMPANY, ...(c || {}) }; }
function normalizeCustomer(c) { return { ...EMPTY_CUSTOMER, ...(c || {}) }; }

const DEFAULT_COMPANY = {
  name: "PT Nusantara Karya Utama",
  address: "Jl. Jend. Sudirman Kav. 45, Jakarta Selatan 12930",
  phone: "(021) 555-0142",
  email: "admin@nusantarakarya.co.id",
  website: "nusantarakarya.co.id",
  npwp: "02.314.567.8-011.000",
  npkp: "1234-ABCD-EFGH-0000",
  signatory: "Dewi Anggraini",
  signatoryTitle: "Direktur Utama",
};

function defaultPrefixes() {
  const p = {};
  DOC_TYPES.forEach((t) => { p[t.id] = t.prefix; });
  return p;
}

function uid() {
  return Math.random().toString(36).slice(2, 10) + Date.now().toString(36).slice(-4);
}

function blankDraft(typeId, company, ppnRate) {
  const def = typeById(typeId);
  return {
    type: def.id,
    number: "",
    date: todayISO(),
    status: "draf",
    company: normalizeCompany(company),
    customer: { name:"", address:"", phone:"", npwp:"" },
    items: def.hasItems ? [{ id: uid(), name: "", qty: 1, price: 0 }] : [],
    meta: {},
    ppnRate: def.hasPpn ? ppnRate : 0,
    discount: 0,
    note: "",
    body: def.template || "",
  };
}

function formatDocNumber(prefix, year, seq) {
  return `${prefix}/${year}/${String(seq).padStart(4, "0")}`;
}

function nextNumberFor(counters, prefixes, typeId) {
  const def = typeById(typeId);
  const prefix = ((prefixes && prefixes[typeId]) || def.prefix).trim() || def.prefix;
  const year = new Date().getFullYear();
  const c = counters && counters[typeId];
  const seq = c && c.year === year ? c.seq + 1 : 1;
  return formatDocNumber(prefix, year, seq);
}

function bumpCounters(counters, typeId) {
  const year = new Date().getFullYear();
  const c = counters && counters[typeId];
  const seq = c && c.year === year ? c.seq + 1 : 1;
  return { ...(counters || {}), [typeId]: { year, seq } };
}

function fillTemplate(body, ctx) {
  return body.replace(/\{([a-zA-Z_]+)\}/g, (m, k) => {
    const v = ctx[k.toLowerCase()];
    return v && String(v).trim() !== "" ? v : m;
  });
}

function templateCtx(doc) {
  const base = {
    perusahaan: doc.company.name,
    alamat_perusahaan: doc.company.address,
    npwp_perusahaan: doc.company.npwp,
    kota: (doc.meta && doc.meta.kota) || "",
    nama: doc.customer.name,
    alamat: doc.customer.address,
    alamat_pelanggan: doc.customer.address,
    telepon: doc.customer.phone,
    npwp: doc.customer.npwp,
    nomor: doc.number,
    tanggal: formatDateID(doc.date),
    hari_tanggal: formatDateLongID(doc.date),
    ttd_company: doc.company.signatory,
    jabatan_dir: doc.company.signatoryTitle,
  };
  const meta = {};
  for (const [k, v] of Object.entries(doc.meta || {})) {
    if (v && String(v).trim() !== "") meta[k.toLowerCase()] = v;
  }
  return { ...base, ...meta };
}

function recordToDraft(r) {
  return {
    type: r.type,
    number: r.number,
    date: r.date,
    status: r.status,
    company: normalizeCompany(r.company),
    customer: normalizeCustomer(r.customer),
    items: (r.items || []).map((it) => ({ ...it })),
    meta: { ...(r.meta || {}) },
    ppnRate: r.ppnRate || 0,
    discount: r.discount || 0,
    note: r.note || "",
    body: r.body || "",
  };
}

/* --------------------------- Storage (localStorage) --------------------------- */

const LS_DOCS = "rekadok_documents_v1";
const LS_SETTINGS = "rekadok_settings_v1";

function loadDocs() {
  try {
    const raw = localStorage.getItem(LS_DOCS);
    const arr = raw ? JSON.parse(raw) : [];
    return Array.isArray(arr) ? arr : [];
  } catch { return []; }
}
function saveDocs(docs) {
  localStorage.setItem(LS_DOCS, JSON.stringify(docs));
}

function defaultSettings() {
  return {
    id: 1,
    company: { ...DEFAULT_COMPANY },
    ppnRate: 11,
    currency: "IDR",
    prefixes: defaultPrefixes(),
    counters: {},
    updatedAt: new Date().toISOString(),
  };
}

function loadSettings() {
  try {
    const raw = localStorage.getItem(LS_SETTINGS);
    if (!raw) {
      const s = defaultSettings();
      saveSettings(s);
      return s;
    }
    const s = JSON.parse(raw);
    return {
      id: 1,
      company: normalizeCompany(s.company),
      ppnRate: s.ppnRate != null ? Number(s.ppnRate) : 11,
      currency: s.currency || "IDR",
      prefixes: { ...defaultPrefixes(), ...(s.prefixes || {}) },
      counters: s.counters || {},
      updatedAt: s.updatedAt || null,
    };
  } catch { return defaultSettings(); }
}
function saveSettings(s) {
  localStorage.setItem(LS_SETTINGS, JSON.stringify({ ...s, updatedAt: new Date().toISOString() }));
}

/* Baca berkas gambar dari <input type=file>, persegi kecil, jadikan data URL.
   ponytail: tidak tulis ke disk — data URL ikut di profil perusahaan supaya
   dokumen lama tetap mencetak logo/TTD-nya. */
const MAX_IMAGE_BYTES = 5 * 1024 * 1024;
function readImageFile(file, maxW) {
  return new Promise((resolve, reject) => {
    if (!/^image\//.test(file.type)) return reject(new Error("Berkas harus berupa gambar (PNG/JPEG)."));
    if (file.size > MAX_IMAGE_BYTES) return reject(new Error("Ukuran gambar maksimal 5 MB."));
    const fr = new FileReader();
    fr.onerror = () => reject(new Error("Gagal membaca berkas gambar."));
    fr.onload = () => {
      const dataUrl = fr.result;
      const img = new Image();
      img.onerror = () => reject(new Error("Berkas bukan gambar yang valid."));
      img.onload = () => {
        if (img.width <= maxW) return resolve(dataUrl);
        const canvas = document.createElement("canvas");
        canvas.width = maxW;
        canvas.height = Math.max(1, Math.round((img.height * maxW) / img.width));
        const ctx = canvas.getContext("2d");
        if (!ctx) return resolve(dataUrl);
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
        resolve(canvas.toDataURL(/jpe?g/i.test(file.type) ? "image/jpeg" : "image/png", 0.9));
      };
      img.src = dataUrl;
    };
    fr.readAsDataURL(file);
  });
}

function issueNumber(typeId) {
  const s = loadSettings();
  const number = nextNumberFor(s.counters, s.prefixes, typeId);
  s.counters = bumpCounters(s.counters, typeId);
  saveSettings(s);
  return number;
}

function listDocs() {
  return loadDocs().slice().sort((a, b) =>
    a.date === b.date
      ? String(b.createdAt).localeCompare(String(a.createdAt))
      : b.date.localeCompare(a.date));
}

function getDoc(id) {
  return loadDocs().find((d) => d.id === id) || null;
}

function upsertDoc(rec) {
  const docs = loadDocs();
  const i = docs.findIndex((d) => d.id === rec.id);
  const now = new Date().toISOString();
  if (i >= 0) {
    docs[i] = { ...rec, updatedAt: now };
  } else {
    docs.push({ ...rec, createdAt: now, updatedAt: now });
  }
  saveDocs(docs);
  return rec;
}

function deleteDoc(id) {
  saveDocs(loadDocs().filter((d) => d.id !== id));
}

function duplicateDoc(id) {
  const src = getDoc(id);
  if (!src) return null;
  const s = loadSettings();
  const number = nextNumberFor(s.counters, s.prefixes, src.type);
  s.counters = bumpCounters(s.counters, src.type);
  saveSettings(s);
  const copy = {
    id: uid(),
    type: src.type,
    number,
    date: src.date,
    company: normalizeCompany(src.company),
    customer: normalizeCustomer(src.customer),
    items: (src.items || []).map((it) => ({ ...it, id: uid() })),
    meta: { ...(src.meta || {}) },
    ppnRate: src.ppnRate || 0,
    discount: src.discount || 0,
    note: "",
    body: src.body || "",
    status: "draf",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
  saveDocs([...loadDocs(), copy]);
  return copy;
}

function seedSampleDocs() {
  const s = loadSettings();
  let counters = s.counters || {};
  const previewInv = nextNumberFor(counters, s.prefixes, "invoice");

  const samples = [
    { type:"invoice", date:daysAgoISO(6), status:"lunas", ppnRate:11,
      customer:{ name:"PT Maju Jaya Sejahtera", address:"Jl. Gatot Subroto No. 12, Jakarta Selatan", phone:"(021) 720-4410", npwp:"09.221.445.6-012.000" },
      items:[{ name:"Jasa konsultasi keuangan (2 sesi)", qty:2, price:2500000 },{ name:"Revisi laporan keuangan Q3", qty:1, price:750000 }],
      meta:{ jatuh_tempo:"14 hari" }, note:"Pembayaran melalui transfer bank BCA a.n. PT Nusantara Karya Utama." },
    { type:"kwitansi", date:daysAgoISO(4), status:"lunas",
      customer:{ name:"Budi Santoso", address:"Jl. Kemang Raya No. 88, Jakarta Selatan" },
      items:[{ name:"Uang Tunai", qty:1, price:3250000 }],
      meta:{ tujuan:`Pelunasan invoice ${previewInv}`, kota:"Jakarta" } },
    { type:"surat-jalan", date:daysAgoISO(3), status:"terbit",
      customer:{ name:"CV Sari Remaja", address:"Jl. Kebon Jeruk No. 4, Jakarta Barat" },
      items:[{ name:"Kursi kerja ergonomis", qty:10, price:850000 },{ name:"Meja kerja 120cm", qty:4, price:1200000 }],
      meta:{ tujuan_kirim:"Gudang CV Sari Remaja, Jl. Kebon Jeruk No. 4, Jakarta Barat" } },
    { type:"struk", date:daysAgoISO(2), status:"terbit",
      items:[{ name:"Kopi Susu Gula Aren", qty:2, price:25000 },{ name:"Croissant Mentega", qty:3, price:18000 }],
      meta:{ tunai:"100000" } },
    { type:"penawaran", date:daysAgoISO(1), status:"draf", ppnRate:11,
      customer:{ name:"CV Cahaya Abadi", address:"Jl. Pemuda No. 21, Surabaya" },
      items:[{ name:"Desain logo & brand identity", qty:1, price:3500000 },{ name:"Paket media sosial (3 bulan)", qty:1, price:2400000 }],
      meta:{ berlaku:"14 hari" } },
    { type:"berita-acara", date:todayISO(), status:"terbit",
      customer:{ name:"Ir. Hendra Wijaya, M.T.", address:"Jl. Anggrek No. 5, Bandung" },
      meta:{ objek:"pekerjaan renovasi kantor cabang Bandung", kota:"Bandung" } },
  ];

  const created = [];
  for (const smp of samples) {
    const def = typeById(smp.type);
    const number = nextNumberFor(counters, s.prefixes, smp.type);
    counters = bumpCounters(counters, smp.type);
    const rec = {
      id: uid(),
      type: smp.type,
      number,
      date: smp.date,
      company: normalizeCompany(s.company),
      customer: normalizeCustomer(smp.customer),
      items: (smp.items || []).map((it) => ({ ...it, id: uid() })),
      meta: { ...(smp.meta || {}) },
      ppnRate: smp.ppnRate || 0,
      discount: 0,
      note: smp.note || "",
      body: def.template || "",
      status: smp.status,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    created.push(rec);
  }
  saveSettings({ ...s, counters });
  saveDocs([...loadDocs(), ...created]);
  return created.length;
}

/* --------------------------- Helpers --------------------------- */

const STATUS_META = {
  draf: { label:"Draf", cls:"chip-draf" },
  terbit: { label:"Terbit", cls:"chip-terbit" },
  lunas: { label:"Lunas", cls:"chip-lunas" },
};
function statusBadge(st) {
  const m = STATUS_META[st] || STATUS_META.draf;
  return `<span class="chip ${m.cls}"><span class="dot"></span>${m.label}</span>`;
}
function typeBadge(typeId) {
  const t = typeById(typeId);
  return `<span class="typebadge">${ic(t.icon, 14)}<span>${t.label}</span></span>`;
}
function esc(s) {
  return String(s == null ? "" : s)
    .replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;").replace(/'/g, "&#039;");
}
function docValue(r) {
  const def = typeById(r.type);
  if (!def.hasItems) return null;
  return calcTotals({ items: r.items, ppnRate: r.ppnRate, discount: r.discount, hasPpn: def.hasPpn }).total;
}

/* --------------------------- Shell (sidebar + mobile nav) --------------------------- */

function renderShell(activeKey) {
  const navItem = (href, iconKey, label) => {
    const on = activeKey === href || (href !== "index.html" && location.pathname.endsWith(href));
    return `<a class="nav-item ${on ? "active" : ""}" href="${href}">${ic(iconKey, 16)}${label}</a>`;
  };

  const types = CATEGORIES.map((cat) => `
    <div>
      <div class="side-cat-sub">${cat}</div>
      ${DOC_TYPES.filter((t) => t.category === cat)
        .map((t) => `<a class="side-type" href="baru.html?type=${t.id}">${ic(t.icon, 14)}${t.label}</a>`)
        .join("")}
    </div>`).join("");

  const sidebar = `
  <aside class="sidebar">
    <div class="brand">
      <div class="brand-mark">${ic("logo", 20)}</div>
      <div>
        <div class="brand-name">RekaDok</div>
        <div class="brand-sub">Dokumen Bisnis Indonesia</div>
      </div>
    </div>
    <div class="nav">
      ${navItem("index.html", "dashboard", "Dasbor")}
      ${navItem("dokumen.html", "doc", "Semua Dokumen")}
      ${navItem("pengaturan.html", "settings", "Pengaturan")}
    </div>
    <div class="side-scroll">
      <div class="side-cat-label">Tipe Dokumen</div>
      ${types}
    </div>
    <div class="side-card">
      <div class="side-card-h">${ic("sparkle", 16)} Otomatisasi aktif</div>
      <ul>
        <li>Penomoran berurutan otomatis</li>
        <li>Subtotal, PPN 11%, total real-time</li>
        <li>Terbilang otomatis untuk kwitansi</li>
        <li>Cetak / simpan PDF satu klik</li>
      </ul>
    </div>
  </aside>`;

  const mlinks = [
    { href:"index.html", label:"Dasbor", icon:"dashboard" },
    { href:"dokumen.html", label:"Dokumen", icon:"doc" },
    { href:"pengaturan.html", label:"Pengaturan", icon:"settings" },
  ];
  const mobilenav = `
  <div class="mobilenav">
    <a class="brand" style="padding:0" href="index.html">
      <div class="brand-mark">${ic("logo", 16)}</div>
      <span class="brand-name">RekaDok</span>
    </a>
    <div class="mnav-links">
      ${mlinks.map((l) => `<a class="${activeKey === l.href ? "active" : ""}" href="${l.href}">${l.label}</a>`).join("")}
    </div>
  </div>`;

  const host = document.getElementById("shell");
  if (host) {
    host.className = "shell";
    host.innerHTML = sidebar + `<div class="main-wrap">${mobilenav}<main class="main" id="main"></main></div>`;
  }
}
