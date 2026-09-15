/* ============================================================
   RekaDok (HTML) — runnable check
   Jalankan:  node test.js
   Menguatkan: format/terbilang, kalkulasi, penomoran, penyimpanan,
   rendering semua layout dokumen, alur editor, dan halaman.
   ============================================================ */

const fs = require("fs");
const vm = require("vm");
const path = require("path");
const dir = __dirname + "/assets/";

/* --------------------------- DOM stub --------------------------- */
const store = {};
const elements = {};
function mkEl(id) {
  return {
    id, _h: {}, value: "", textContent: "", className: "", innerHTML: "",
    dataset: {}, style: {}, clientWidth: 800, offsetHeight: 1100,
    addEventListener(t, fn) { this._h[t] = fn; },
    dispatch(t) { if (this._h[t]) this._h[t]({ target: this }); },
    closest() { return null; },
    querySelector() { return null; },
    querySelectorAll() { return []; },
    appendChild() {}, setAttribute() {}, focus() {}, blur() {},
  };
}
function extractFromHTML(html, sel) {
  const out = [];
  if (sel.startsWith("[")) {
    const attr = sel.slice(1, -1);
    const tagRe = /<(\w+)([^>]*)>/g;
    let m;
    while ((m = tagRe.exec(html))) {
      const attrs = m[2];
      if (attrs.includes(attr + "=")) {
        const el = mkEl(attr + "_" + out.length);
        const g = (name) => { const r = new RegExp(name + '="([^"]*)"').exec(attrs); return r ? r[1] : ""; };
        const key = attr.replace("data-", "");
        el.dataset = {}; el.dataset[key] = g(attr);
        el.value = g("value");
        elements[attr + "::" + g(attr)] = el;
        out.push(el);
      }
    }
  } else if (sel.startsWith("#")) {
    if (new RegExp('id="' + sel.slice(1) + '"').test(html)) out.push(mkEl(sel.slice(1)));
  }
  return out;
}
const redirects = [];
const _origSetTimeout = setTimeout;
global.setTimeout = (fn, ms) => _origSetTimeout(fn, Math.min(ms, 5));
global.localStorage = {
  getItem: (k) => (k in store ? store[k] : null),
  setItem: (k, v) => { store[k] = String(v); },
  removeItem: (k) => { delete store[k]; },
};
global.document = {
  getElementById(id) { if (!elements[id]) elements[id] = mkEl(id); return elements[id]; },
  createElement: mkEl,
  querySelectorAll(sel) { return extractFromHTML(elements["main"] ? elements["main"].innerHTML : "", sel); },
  querySelector() { return null; },
  addEventListener() {},
};
global.ResizeObserver = class { observe() {} disconnect() {} };
global.window = { addEventListener() {}, print() { global.__printed = (global.__printed || 0) + 1; } };
global.confirm = () => true;
Object.defineProperty(global, "location", {
  value: { pathname: "/index.html", search: "", get href() { return ""; }, set href(v) { redirects.push(v); }, reload() { global.__reloaded = (global.__reloaded || 0) + 1; } },
  writable: false,
});
global.delay = (ms) => new Promise((r) => _origSetTimeout(r, ms));

vm.runInThisContext(fs.readFileSync(dir + "core.js", "utf8"));
vm.runInThisContext(fs.readFileSync(dir + "preview.js", "utf8"));

let fails = 0;
let n = 0;
function check(cond, name, extra) {
  n++;
  if (!cond) { fails++; console.log(`  ✗ ${name}${extra ? " → " + extra : ""}`); }
  else console.log(`  ✓ ${name}`);
}
const Y = new Date().getFullYear();
function nextNumAfter(num) {
  const m = num.match(/^(.*)\/\d+\/(\d+)$/);
  return `${m[1]}/${Y}/${String(Number(m[2]) + 1).padStart(4, "0")}`;
}
function runScript(file) {
  for (const k in elements) delete elements[k];
  redirects.length = 0;
  global.__printed = 0;
  vm.runInThisContext(fs.readFileSync(dir + file, "utf8"));
  return elements["main"];
}

(async () => {
  /* ================= 1. Inti (format / calc / docTypes / storage) ================= */
  console.log("\n[1] Logika inti");
  check(pad2(3) === "03", "pad2");
  check(formatRupiah(3250000) === "Rp 3.250.000", "formatRupiah");
  check(formatRupiahDash(3250000) === "Rp 3.250.000,-", "formatRupiahDash");
  check(terbilang(3250000) === "Tiga Juta Dua Ratus Lima Puluh Ribu", "terbilang 3,25jt");
  check(terbilang(0) === "Nol", "terbilang 0");
  check(terbilang(15000) === "Lima Belas Ribu", "terbilang 15rb");
  check(terbilang(999) === "Sembilan Ratus Sembilan Puluh Sembilan", "terbilang 999");
  // Mengikuti perilaku persis src/lib/format.ts asli (quirk ada di sumber):
  check(terbilang(11) === "Satu Belas", "terbilang 11 = 'Satu Belas' (perilaku asli)");
  check(terbilang(20100) === "Dua Puluh Ribu Satu Ratus", "terbilang 20.100 (perilaku asli)");
  check(terbilangRupiah(5000) === "Lima Ribu Rupiah", "terbilangRupiah");

  const t = calcTotals({ items: [{ qty: 2, price: 2500000 }, { qty: 1, price: 750000 }], ppnRate: 11, discount: 200000, hasPpn: true });
  check(t.gross === 5750000 && t.subtotal === 5550000 && t.ppn === 610500 && t.total === 6160500, "calcTotals lengkap");

  check(DOC_TYPES.length === 15, "15 tipe dokumen");
  check(CATEGORIES.length === 3, "3 kategori");
  check(typeById("invoice").prefix === "INV", "prefix invoice");
  check(typeById("struk").layout === "struk" && !typeById("struk").hasCustomer, "struk thermal tanpa customer");
  check(typeById("nota").hasPpn === true, "nota ber-PPN");
  check(typeById("tidak-ada").id === "invoice", "fallback tipe invalid");

  let counters = {};
  check(nextNumberFor(counters, { invoice: "INV" }, "invoice") === `INV/${Y}/0001`, "nomor pertama");
  counters = bumpCounters(counters, "invoice");
  check(nextNumberFor(counters, { invoice: "INV" }, "invoice") === `INV/${Y}/0002`, "nomor urut naik");
  check(nextNumberFor(counters, { invoice: "INV" }, "struk") === `STR/${Y}/0001`, "counter per tipe terpisah");

  const ctx = { perusahaan: "PT A", nama: "Budi", kota: "Bandung", nomor: "INV/2026/0001" };
  check(fillTemplate("{perusahaan} kirim ke {nama} di {kota} no {nomor}. Kosong {x}.", ctx)
    === "PT A kirim ke Budi di Bandung no INV/2026/0001. Kosong {x}.", "fillTemplate");

  saveSettings(defaultSettings());
  const before = listDocs().length;
  check(seedSampleDocs() === 6 && listDocs().length === before + 6, "seed 6 dokumen contoh");
  upsertDoc({ id: "t1", type: "invoice", number: "X/1", date: "2026-01-05", company: {}, customer: { name: "Z" }, items: [], meta: {}, ppnRate: 0, discount: 0, note: "", body: "", status: "draf" });
  check(getDoc("t1").number === "X/1", "upsert + get");
  const dup = duplicateDoc("t1");
  check(dup.status === "draf" && dup.note === "", "duplikasi: status draf & note dibersihkan");
  deleteDoc("t1");
  check(getDoc("t1") === null, "hapus dokumen");
  check(loadSettings().ppnRate === 11, "PPN default 11%");

  /* ================= 2. Rendering dokumen ================= */
  console.log("\n[2] Rendering dokumen");
  const co = { name: "PT NKU", address: "Jl. Sudirman 45", phone: "(021) 555", email: "a@b.id", website: "b.id", npwp: "02.314", npkp: "NP-1", signatory: "Dewi", signatoryTitle: "Direktur" };
  const cust = { name: "PT Maju Jaya", address: "Jl. Gatot 12", phone: "021", npwp: "09.221" };
  const docFor = (typeId, over) => Object.assign(blankDraft(typeId, co, 11), {
    number: `INV/${Y}/0001`, customer: cust,
    items: [{ id: "a", name: "Jasa konsultasi", qty: 2, price: 2500000 }],
    ...(over || {}),
  });

  let h = renderDocPaper(docFor("struk", { meta: { tunai: "100000" } }));
  check(h.includes("paper--struk"), "struk: kertas thermal");
  check(h.includes("TUNAI") && h.includes("KEMBALI"), "struk: tunai & kembalian");
  h = renderDocPaper(docFor("kwitansi", { meta: { tujuan: "Pelunasan A", kota: "Jakarta" } }));
  check(h.includes("KWITANSI") && h.includes("Terbilang"), "kwitansi: judul + terbilang");
  check(h.includes("Lima Juta Rupiah"), "kwitansi: terbilang sesuai nominal");
  check(h.includes("Yang Menerima") && h.includes("Yang Memberikan"), "kwitansi: 2 tanda tangan");
  for (const t of ["nota", "invoice", "faktur", "nota-debet", "nota-kredit"]) {
    check(renderDocPaper(docFor(t)).includes("Jasa konsultasi"), `${t}: tabel item`);
  }
  check(renderDocPaper(docFor("faktur")).includes("NPKP"), "faktur: baris NPKP");
  check(renderDocPaper(docFor("invoice", { meta: { jatuh_tempo: "14 hari" } })).includes("Jatuh tempo"), "invoice: jatuh tempo");
  check(renderDocPaper(docFor("nota")).includes("PPN 11%"), "nota: baris PPN");
  check(renderDocPaper(docFor("nota-kredit")).includes("Kepada (kredit)"), "nota-kredit: label khusus");
  check(renderDocPaper(docFor("hpp", { meta: { periode: "Maret 2026" } })).includes("Total Harga Pokok Penjualan"), "hpp: kotak total");
  check(renderDocPaper(docFor("surat-jalan", { meta: { tujuan_kirim: "Gudang X" } })).includes("SURAT JALAN"), "surat jalan: judul");
  check(renderDocPaper(docFor("penawaran", { meta: { berlaku: "14 hari" } })).includes("SURAT PENAWARAN"), "penawaran: judul");
  for (const t of ["berita-acara", "sptjm", "perjanjian", "kuasa", "keterangan"]) {
    check(renderDocPaper(docFor(t, { meta: { kota: "Bandung", jabatan: "Manajer", objek: "renovasi", masa: "6 bulan" } })).includes("surat-p"), `${t}: paragraf surat`);
  }
  check(renderDocPaper(docFor("perjanjian")).includes("Pasal 1"), "perjanjian: pasal terisi");
  check(renderDocPaper(docFor("kuasa")).includes("PEMBERI KUASA"), "kuasa: pemberi kuasa");
  check(renderDocPaper(docFor("invoice", { customer: { name: "<img src=x onerror=1>" } })).includes("&lt;img src=x onerror=1&gt;"), "escape karakter berbahaya");

  /* ================= 3. Editor ================= */
  console.log("\n[3] Alur editor");
  global.location.pathname = "/baru.html";
  runScript("editor.js");
  check(elements["main"].innerHTML.includes("Informasi Dokumen"), "render form editor");
  check(elements["main"].innerHTML.includes("Pratinjau langsung"), "toolbar pratinjau");
  const b1 = listDocs().length;
  elements["btnSave"].dispatch("click");
  await delay(30);
  const saved = listDocs()[0];
  check(listDocs().length === b1 + 1, "simpan menambah dokumen");
  check(new RegExp(`^INV/${Y}/\\d{4}$`).test(saved.number), "nomor otomatis", saved.number);
  check(redirects[0].startsWith("baru.html?id="), "redirect ke mode edit");

  runScript("editor.js");
  elements["btnSavePrint"].dispatch("click");
  await delay(30);
  check(redirects.some((r) => r.includes("&print=1")), "simpan & cetak bawa print=1");

  const target = listDocs()[0];
  global.location.search = "?id=" + encodeURIComponent(target.id);
  runScript("editor.js");
  check(elements["main"].innerHTML.includes(target.number), "mode edit memuat nomor lama");
  check(!!elements["quickStatus"], "mode edit ada select status");

  global.location.search = "";
  runScript("editor.js");
  const dt = elements["dtype"];
  dt.value = "kwitansi";
  dt.dispatch("change");
  check(elements["main"].innerHTML.includes("Nominal") && elements["main"].innerHTML.includes("Data Penerima"), "ganti tipe memunculkan kartu khusus");

  runScript("editor.js");
  const n0 = nextNumberFor(loadSettings().counters, loadSettings().prefixes, "invoice");
  elements["autoNum"].dispatch("click");
  check(elements["dnum"].value === n0, "tombol Otomatis mengisi nomor");

  const del = listDocs()[0];
  global.location.search = "?id=" + encodeURIComponent(del.id);
  runScript("editor.js");
  const nb = listDocs().length;
  elements["btnDel"].dispatch("click");
  check(listDocs().length === nb - 1, "hapus dari mode edit");

  global.location.search = "?id=tidak-ada";
  runScript("editor.js");
  check(elements["main"].innerHTML.includes("Dokumen tidak ditemukan"), "id invalid → pesan");

  const alive = listDocs()[0];
  global.location.search = "?id=" + encodeURIComponent(alive.id) + "&print=1";
  runScript("editor.js");
  await delay(400);
  check(global.__printed === 1, "print=1 memicu window.print");

  /* ================= 4. Halaman dashboard / dokumen / pengaturan ================= */
  console.log("\n[4] Halaman");
  store["rekadok_documents_v1"] = "[]";
  runScript("dashboard.js");
  check(elements["main"].innerHTML.includes("Belum ada dokumen"), "dashboard: empty state");
  elements["seedBtn"].dispatch("click");
  check(listDocs().length === 6, "dashboard: tombol seed bekerja");
  runScript("dashboard.js");
  const dm = elements["main"].innerHTML;
  check(dm.includes("Total Dokumen") && dm.includes("Dokumen Terbaru"), "dashboard: statistik + recent");
  check(dm.includes("Penjualan &amp; Kas") && dm.includes("Surat Resmi"), "dashboard: grid per kategori");

  global.location.search = "";
  runScript("dokumen.js");
  check(elements["rows"].innerHTML.split("<tr").length - 1 === 6, "dokumen: 6 baris");
  elements["ftype"].value = "invoice";
  elements["ftype"].dispatch("change");
  check(elements["rows"].innerHTML.split("<tr").length - 1 === 1, "dokumen: filter jenis");
  elements["ftype"].value = "";
  elements["ftype"].dispatch("change");
  elements["q"].value = "budi";
  elements["q"].dispatch("input");
  await delay(400);
  check(elements["rows"].innerHTML.split("<tr").length - 1 === 1, "dokumen: pencarian");

  runScript("pengaturan.js");
  const pm = elements["main"].innerHTML;
  check(pm.includes("Profil Perusahaan") && pm.includes("Nomor Berikutnya"), "pengaturan: profil + tabel penomoran");
  check(pm.includes("PT Nusantara Karya Utama"), "pengaturan: default profil terisi");
  const ni = elements["data-co::name"];
  ni.value = "CV Uji Coba";
  ni.dispatch("input");
  elements["saveBtn"].dispatch("click");
  check(loadSettings().company.name === "CV Uji Coba", "pengaturan: simpan profil");
  check(elements["msg"].className === "msg ok", "pengaturan: pesan sukses");
  const rst = elements["data-reset::invoice"];
  rst.dispatch("click");
  elements["saveBtn"].dispatch("click");
  check(loadSettings().counters.invoice.seq === 0, "pengaturan: reset counter tersimpan");

  /* ================= ringkasan ================= */
  console.log(`\n${fails === 0 ? "SEMUA TEST LULUS" : `${fails} TEST GAGAL`} (${n} asersi)`);
  process.exit(fails === 0 ? 0 : 1);
})();
