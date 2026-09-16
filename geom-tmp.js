/* Verifikasi geometri TTD nyata via Chromium (puppeteer-core).
   Jalankan: node geom-tmp.js */
const puppeteer = require("puppeteer-core");
const path = require("path");

const CHROME = "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe";
const URL = "file:///" + path.join(__dirname, "geom-tmp.html").replace(/\\/g, "/");

/* dokumen uji */
const LOGO_W = 200, LOGO_H = 80;
const co = (sig) => ({
  name: "PT NKU", address: "Jl. Sudirman 45", phone: "(021) 555", email: "a@b.id",
  website: "b.id", npwp: "02.314", npkp: "NP-1", signatory: "Dewi Anggraini",
  signatoryTitle: "Direktur Utama", logo: "LOGO", signatureImg: sig ? "TTD" : "",
});
const cust = (sig) => ({ name: "Siti Aminah", address: "Jl. Gatot 12", phone: "021", npwp: "09.221", signatureImg: sig ? "CTTD" : "" });

function mkDoc(typeId, over) {
  const base = {
    type: typeId, number: "KWT/2026/0001", date: "2026-09-15", status: "draf",
    company: co(true), customer: cust(true),
    items: [{ id: "a", name: "Uang Tunai", qty: 1, price: 1500000 }],
    meta: { tujuan: "Pelunasan Invoice INV/2026/0001", kota: "Jakarta" },
    ppnRate: 11, discount: 0, note: "", body: "",
  };
  return Object.assign(base, over || {});
}

const CASES = [
  { name: "kwitansi (2 TTD + logo)", doc: mkDoc("kwitansi") },
  { name: "invoice 1 item (TTD tunggal)", doc: mkDoc("invoice", { items: [{ id: "a", name: "Jasa konsultasi", qty: 1, price: 2500000 }] }) },
  { name: "surat keterangan (TTD tunggal)", doc: mkDoc("keterangan", { meta: { kota: "Bandung", jabatan: "Manajer", tanggal_mulai: "1 Maret 2023", status_karyawan: "karyawan tetap" } }) },
  { name: "nota debet (2 TTD)", doc: mkDoc("nota-debet", { items: [{ id: "a", name: "Selisih barang", qty: 1, price: 250000 }] }) },
];

(async () => {
  const browser = await puppeteer.launch({ executablePath: CHROME, headless: "new", args: ["--no-sandbox", "--disable-web-security"] });
  const page = await browser.newPage();
  await page.setViewport({ width: 1100, height: 1500, deviceScaleFactor: 1 });
  await page.goto(URL, { waitUntil: "domcontentloaded" });

  /* ganti placeholder data URL dengan gambar canvas 200x80 */
  await page.evaluate(({ LOGO_W, LOGO_H }) => {
    const mk = (r, g, b) => {
      const c = document.createElement("canvas");
      c.width = LOGO_W; c.height = LOGO_H;
      const x = c.getContext("2d");
      x.fillStyle = `rgb(${r},${g},${b})`;
      x.fillRect(0, 0, LOGO_W, LOGO_H);
      return c.toDataURL("image/png");
    };
    window.__IMG = { LOGO: mk(20, 80, 60), TTD: mk(30, 60, 120), CTTD: mk(120, 40, 40) };
  }, { LOGO_W, LOGO_H });

  let fails = 0;
  const check = (ok, msg, extra) => {
    console.log((ok ? "  ✓ " : "  ✗ ") + msg + (extra ? "  [" + extra + "]" : ""));
    if (!ok) fails++;
  };

  for (const c of CASES) {
    console.log("\n[" + c.name + "]");
    await page.evaluate((doc) => {
      const s = JSON.stringify(doc);
      const replaced = s
        .replace(/"LOGO"/g, `"${window.__IMG.LOGO}"`)
        .replace(/"TTD"/g, `"${window.__IMG.TTD}"`)
        .replace(/"CTTD"/g, `"${window.__IMG.CTTD}"`);
      document.getElementById("host").innerHTML = ""; // reset
      document.getElementById("host").innerHTML = window.renderDocPaper(JSON.parse(replaced));
    }, c.doc);

    const g = await page.evaluate(() => {
      const R = (el) => (el ? { x: el.getBoundingClientRect().x, y: el.getBoundingClientRect().y, w: el.getBoundingClientRect().width, h: el.getBoundingClientRect().height, right: el.getBoundingClientRect().right, bottom: el.getBoundingClientRect().bottom } : null);
      const paper = R(document.querySelector(".paper"));
      const sigBlock = R(document.querySelector(".signatures")) || R(document.querySelector(".kw-foot"));
      const footer = R(document.querySelector(".doc-footer"));
      const logos = [...document.querySelectorAll(".lh-logo, .kw-logo, .struk-logo")].map(R);
      const sigImgs = [...document.querySelectorAll(".sig-img")].map(R);
      const sigLines = [...document.querySelectorAll(".sig-line")].map(R);
      const labels = [...document.querySelectorAll(".sig-label, .kw-sig .sig-label")].map((e) => e.textContent);
      return { paper, sigBlock, footer, logos, sigImgs, sigLines, labels };
    });

    check(!!g.paper, "paper ter-render");
    check(g.logos.length > 0, "logo tampil", "logo count=" + g.logos.length);
    if (g.logos.length) check(g.logos[0].y < g.paper.h / 2, "logo di paruh atas kertas", "y=" + Math.round(g.logos[0].y));
    check(g.sigImgs.length >= 1, "gambar TTD ter-render", "count=" + g.sigImgs.length);

    /* anchor bawah: dasar blok TTD harus dekat dasar kertas (selisih <= footer + aman) */
    if (g.sigBlock && g.paper) {
      const gap = g.paper.bottom - g.sigBlock.bottom;
      check(gap <= 200, "blok TTD menempel di bawah kertas", "jarak ke dasar=" + Math.round(gap) + "px (kertas " + Math.round(g.paper.h) + "px)");
    }
    /* alignment: gambar TTD harus di dalam kolomnya (x dalam batas sig-line) */
    g.sigImgs.forEach((img, i) => {
      const line = g.sigLines[i];
      if (line) {
        const inside = img.x >= line.x - 5 && img.right <= line.right + 5;
        check(inside, "TTD segaris dengan kolom nama #" + (i + 1), "imgX=" + Math.round(img.x) + " lineX=" + Math.round(line.x) + " lineRight=" + Math.round(line.right));
      }
    });
  }

  await browser.close();
  console.log("\n" + (fails === 0 ? "GEOMETRI OK" : fails + " GEOMETRI GAGAL"));
  process.exit(fails === 0 ? 0 : 1);
})().catch((e) => { console.error(e); process.exit(2); });
