/* ============================================================
   RekaDok — document preview renderer (port src/components/DocPreview.tsx)
   ============================================================ */

function letterheadHTML(co, right) {
  const contact = [co.phone, co.email, co.website].filter(Boolean).join("  •  ");
  const tax = [];
  if (co.npwp) tax.push(`NPWP: <span class="mono">${esc(co.npwp)}</span>`);
  if (co.npkp) tax.push(`NPKP: <span class="mono">${esc(co.npkp)}</span>`);
  return `
  <div class="letterhead">
    <div class="lh-left">
      ${co.logo ? `<img class="lh-logo" src="${co.logo}" alt="Logo">` : ""}
      <div style="min-width:0">
        <div class="lh-name">${esc(co.name || "Nama Perusahaan")}</div>
        ${co.address ? `<div class="lh-addr">${esc(co.address)}</div>` : ""}
        ${contact ? `<div class="lh-contact">${esc(contact)}</div>` : ""}
        ${tax.length ? `<div class="lh-tax">${tax.join('<span class="lh-sep">•</span>')}</div>` : ""}
      </div>
    </div>
    ${right || ""}
  </div>`;
}

function docMetaHTML(doc, title, extra) {
  return `
  <div class="docmeta">
    <div class="docmeta-title">${esc(title)}</div>
    <div class="docmeta-lines">
      <div>Nomor&nbsp;&nbsp;: <span class="mono">${esc(doc.number || "(otomatis)")}</span></div>
      <div>Tanggal : ${esc(formatDateID(doc.date))}</div>
      ${extra || ""}
    </div>
  </div>`;
}

function toBlockHTML(doc, label) {
  const c = doc.customer;
  const contact = [];
  if (c.phone) contact.push(`<span>Telp: ${esc(c.phone)}</span>`);
  if (c.npwp) contact.push(`<span>NPWP: <span class="mono">${esc(c.npwp)}</span></span>`);
  return `
  <div class="toblock">
    <div class="to-label">${esc(label || "Kepada")}</div>
    <div class="to-body">
      <div class="to-name">${esc(c.name || "Nama Penerima")}</div>
      ${c.address ? `<div class="to-addr">${esc(c.address)}</div>` : ""}
      ${contact.length ? `<div class="to-contact">${contact.join("")}</div>` : ""}
    </div>
  </div>`;
}

function kvHTML(k, v) {
  return `<div class="kv"><div class="kv-k">${k}</div><div class="kv-sep">:</div><div class="kv-v">${v}</div></div>`;
}

function itemTableHTML(items) {
  if (!items || items.length === 0) {
    return `<table class="items"><thead><tr>
      <th class="c-no">No</th><th>Keterangan</th><th class="c-qty">Qty</th>
      <th class="c-harga">Harga</th><th class="c-jumlah">Jumlah</th></tr></thead>
      <tbody><tr class="empty-row"><td colspan="5">Belum ada item</td></tr></tbody></table>`;
  }
  const rows = items.map((it, i) => `
    <tr class="${i % 2 ? "alt" : ""}">
      <td>${i + 1}</td>
      <td>${esc(it.name || "—")}</td>
      <td class="c mono">${formatNumber(it.qty || 0)}</td>
      <td class="r mono">${formatNumber(it.price || 0)}</td>
      <td class="r mono" style="font-weight:600">${formatNumber((it.qty || 0) * (it.price || 0))}</td>
    </tr>`).join("");
  return `<table class="items">
    <thead><tr>
      <th class="c-no">No</th><th>Keterangan</th><th class="c-qty">Qty</th>
      <th class="c-harga">Harga</th><th class="c-jumlah">Jumlah</th>
    </tr></thead><tbody>${rows}</tbody></table>`;
}

function totalsHTML(doc, totals, showPpn, title) {
  const lines = [
    `<div class="trow"><span class="k">Subtotal</span><span class="v mono">${formatRupiah(totals.gross)}</span></div>`,
  ];
  if ((doc.discount || 0) > 0) {
    lines.push(`<div class="trow"><span class="k">Diskon</span><span class="v mono">− ${formatRupiah(doc.discount || 0)}</span></div>`);
  }
  if (showPpn) {
    lines.push(`<div class="trow"><span class="k">PPN ${doc.ppnRate || 0}%</span><span class="v mono">${formatRupiah(totals.ppn)}</span></div>`);
  }
  lines.push(`<div class="trow-total"><span>${esc(title || "Total")}</span><span class="mono">${formatRupiahDash(totals.total)}</span></div>`);
  if (showPpn) {
    lines.push(`<div class="terbilang">Terbilang: ${esc(terbilangRupiah(totals.total))}</div>`);
  }
  return `<div class="totals"><div class="totals-box">${lines.join("")}</div></div>`;
}

function parseStampBox(v) {
  if (!v) return null;
  const p = String(v).split(",").map(Number);
  if (p.length !== 4 || p.some((n) => Number.isNaN(n))) return null;
  return { x: p[0], y: p[1], w: p[2], h: p[3] };
}

function stampBoxDefault() { return { x: 2, y: 16, w: 92, h: 50 }; }

/** Versi format meta.stamp — naik versi saat stempel pindah ke kertas. */
const STAMP_META_VERSION = 2;

/** true bila meta.stamp berasal dari versi format lama (stempel di kolom TTD). */
function stampBoxIsLegacy(doc) {
  return !!(doc && doc.meta && String(doc.meta.stamp || "").trim() && Number(doc.meta.stampV || 0) < STAMP_META_VERSION);
}

/**
 * Stempel menempel langsung di kertas (.paper) sebagai overlay: bisa digeser
 * & diubah ukurannya ke mana saja di halaman, tidak lagi terkunci di kolom
 * tanda tangan. Posisi/ukuran disimpan per-dokumen di meta.stamp (format
 * "x,y,w,h", relatif terhadap kertas) bersama meta.stampV.
 */
function stampOverlayHTML(stamp, box, interactive) {
  if (!stamp) return "";
  const b = box || stampBoxDefault();
  const handle = interactive
    ? `<span class="stamp-handle" style="left:${b.x + b.w}px;top:${b.y + b.h}px"></span>`
    : "";
  return `<div class="stamp-wrap${interactive ? " interactive" : ""}" data-stamp>${handle}<img class="sig-stamp stamp-img" src="${stamp}" alt="Stempel"
    style="left:${b.x}px;top:${b.y}px;width:${b.w}px;height:${b.h}px;opacity:0.92"></div>`;
}

/** Sisipkan overlay stempel tepat setelah tag pembuka <div class="paper…">. */
function attachStampOverlay(paperHTML, overlay) {
  if (!overlay) return paperHTML;
  const m = /^(\s*<div[^>]*class="[^"]*paper[^"]*"[^>]*>)/.exec(paperHTML);
  if (!m) return paperHTML;
  return paperHTML.slice(0, m[0].length) + overlay + paperHTML.slice(m[0].length);
}

/** Penempatan awal stempel: menumpang di kolom TTD perusahaan (seperti
 *  stempel fisik di atas tanda tangan). Box dipakai ukurannya saja.
 *  Mengembalikan null bila tidak ada kolom TTD yang bisa diukur. */
function placeStampOnSignature(img) {
  const paper = img.closest(".paper");
  const col = paper && (paper.querySelector('[data-sig-party="company"]') || paper.querySelector(".sig"));
  if (!paper || !col) return null;
  const pr = paper.getBoundingClientRect();
  const cr = col.getBoundingClientRect();
  if (!pr.width || !pr.height || !cr.width) return null;
  // pratinjau diskalakan lewat transform: scale() -> kembalikan ke px kertas
  const k = pr.width ? paper.offsetWidth / pr.width : 1;
  const box = {
    x: parseFloat(img.style.left) || 0,
    y: parseFloat(img.style.top) || 0,
    w: parseFloat(img.style.width) || 92,
    h: parseFloat(img.style.height) || 50,
  };
  const cx = (cr.left - pr.left) * k;
  const cy = (cr.top - pr.top) * k;
  const cw = cr.width * k;
  const ch = cr.height * k;
  return {
    x: clampVal(cx + cw / 2 - box.w / 2, 0, Math.max(0, paper.offsetWidth - box.w)),
    y: clampVal(cy + ch - box.h - 4, 0, Math.max(0, paper.offsetHeight - box.h)),
    w: box.w,
    h: box.h,
  };
}

/** Pasang event drag/resize ke semua .stamp-wrap di dalam host.
 *  DOM diupdate langsung saat drag (mulus), meta disimpan saat mouseup.
 *  opts.autoPlace = true -> tempatkan menumpang di kolom TTD perusahaan
 *  saat dokumen belum punya posisi tersimpan. */
function bindStampInteraction(host, getBox, setBox, opts) {
  const autoPlace = !!(opts && opts.autoPlace);
  const wraps = host.querySelectorAll(".stamp-wrap");
  wraps.forEach((wrap) => {
    const img = wrap.querySelector(".stamp-img");
    const handle = wrap.querySelector(".stamp-handle");
    if (!img) return;
    const interactive = !!handle;
    if (interactive) {
      handle.addEventListener("pointerdown", (e) => startDrag(e, "resize"));
      img.addEventListener("pointerdown", (e) => startDrag(e, "move"));
      img.classList.add("cursor-move");
    }
    function applyToDOM(b) {
      img.style.left = b.x + "px";
      img.style.top = b.y + "px";
      img.style.width = b.w + "px";
      img.style.height = b.h + "px";
      if (handle) {
        handle.style.left = (b.x + b.w) + "px";
        handle.style.top = (b.y + b.h) + "px";
      }
    }
    if (autoPlace) {
      const placed = placeStampOnSignature(img);
      if (placed) { applyToDOM(placed); setBox(placed); }
    }
    function startDrag(e, kind) {
      e.preventDefault();
      e.stopPropagation();
      // area referensi = kertas (.paper); .stamp-wrap sendiri 0x0
      const area = img.closest(".paper") || img.parentElement;
      const ar = area.getBoundingClientRect();
      // pratinjau diskalakan lewat transform: scale() -> kembalikan ke px kertas
      const k = ar.width ? area.offsetWidth / ar.width : 1;
      const box = getBox();
      img.classList.add("stamp-active");
      const sx = e.clientX, sy = e.clientY;
      const mv = (ev) => {
        const dx = (ev.clientX - sx) * k;
        const dy = (ev.clientY - sy) * k;
        let nb;
        if (kind === "move") {
          // bebas ke mana saja di halaman, asal tetap di atas kertas
          nb = {
            ...box,
            x: clampVal(box.x + dx, 0, Math.max(0, area.offsetWidth - box.w)),
            y: clampVal(box.y + dy, 0, Math.max(0, area.offsetHeight - box.h)),
          };
        } else {
          nb = {
            ...box,
            w: clampVal(box.w + dx, 24, Math.min(260, Math.max(0, area.offsetWidth - box.x))),
            h: clampVal(box.h + dy, 16, Math.min(150, Math.max(0, area.offsetHeight - box.y))),
          };
        }
        applyToDOM(nb);
      };
      const up = () => {
        img.classList.remove("stamp-active");
        window.removeEventListener("pointermove", mv);
        window.removeEventListener("pointerup", up);
        // simpan ke meta setelah drag selesai
        setBox({
          x: parseFloat(img.style.left) || 0,
          y: parseFloat(img.style.top) || 0,
          w: parseFloat(img.style.width) || 0,
          h: parseFloat(img.style.height) || 0,
        });
      };
      window.addEventListener("pointermove", mv);
      window.addEventListener("pointerup", up);
    }
  });
}

function clampVal(v, min, max) { return Math.min(max, Math.max(min, v)); }

function sigSpaceHTML(img, h) {
  if (!img) return `<div class="sig-space" style="height:${h || 68}px"></div>`;
  return `<div class="sig-space sig-space-img" style="height:${h || 68}px"><img class="sig-img" src="${img}" alt="Tanda tangan"></div>`;
}

function signaturesHTML(doc, def) {
  if (!def.signatures || !def.signatures.length) return "";
  const nameOf = (p) => (p === "company" ? doc.company.signatory : doc.customer.name) || "";
  const titleOf = (p) => (p === "company" && doc.company.signatory ? doc.company.signatoryTitle : "");
  const imgOf = (p) => (p === "company" ? doc.company.signatureImg : (doc.customer.signatureImg || ""));
  const single = def.signatures.length === 1;
  // meta.swapSignature: "swap" = tukar kolom, "img" = tukar hanya gambar TTD
  const swap = (doc.meta && doc.meta.swapSignature) || "";
  const cols = def.signatures.map((s) => ({ s, img: imgOf(s.party) }));
  if (swap === "img" && cols.length >= 2) {
    const imgs = cols.map((c) => c.img);
    cols.forEach((c, i) => { c.img = imgs[imgs.length - 1 - i]; });
  }
  const list = swap === "swap" && cols.length >= 2 ? cols.slice().reverse() : cols;
  const sigs = list.map(({ s, img }) => `
    <div class="sig" data-sig-party="${esc(s.party)}">
      <div class="sig-label">${esc(s.label)}</div>
      ${sigSpaceHTML(img, 68)}
      <div class="sig-line">
        <div class="sig-name">${esc(nameOf(s.party)) || "_____________________"}</div>
        ${titleOf(s.party) ? `<div class="sig-title">${esc(titleOf(s.party))}</div>` : ""}
      </div>
    </div>`).join("");
  return `<div class="signatures ${single ? "single" : ""}">${sigs}</div>`;
}

function footerHTML(doc) {
  return `<div class="doc-footer">${esc(doc.company.name || "Perusahaan")} — ${esc(doc.number || "(nomor otomatis)")} • ${esc(formatDateID(doc.date))}</div>`;
}

function noteHTML(doc, narrow) {
  if (!doc.note) return "";
  return `<div class="note-line ${narrow ? "narrow" : ""}"><b>Catatan: </b>${esc(doc.note)}</div>`;
}

/* --------------------------- Layouts --------------------------- */

function strukHTML(doc, totals) {
  const tunai = Number((doc.meta && doc.meta.tunai) || 0);
  const kembali = tunai > totals.total ? tunai - totals.total : 0;
  const items = (doc.items || []).map((it) => `
    <div class="item">
      <div>${esc(it.name || "Item")}</div>
      <div class="sub">
        <span>${formatNumber(it.qty || 0)} x ${formatNumber(it.price || 0)}</span>
        <span>${formatNumber((it.qty || 0) * (it.price || 0))}</span>
      </div>
    </div>`).join("");
  return `
  <div class="paper paper--struk" id="print-root">
    <div class="struk">
      <div class="ctr">
        ${doc.company.logo ? `<img class="struk-logo" src="${doc.company.logo}" alt="Logo">` : ""}
        <div class="shop">${esc(doc.company.name || "Nama Toko")}</div>
        ${doc.company.address ? `<div class="tiny">${esc(doc.company.address)}</div>` : ""}
        ${doc.company.phone ? `<div class="tiny">Telp ${esc(doc.company.phone)}</div>` : ""}
      </div>
      <div class="dashed"></div>
      <div class="row"><span>NO</span><span>${esc(doc.number || "—otomatis—")}</span></div>
      <div class="row"><span>TANGGAL</span><span>${esc(formatShortISO(doc.date))}</span></div>
      <div class="dashed"></div>
      ${items}
      <div class="dashed"></div>
      <div class="grand"><span>TOTAL</span><span>${formatNumber(totals.total)}</span></div>
      ${tunai > 0 ? `
        <div class="row"><span>TUNAI</span><span>${formatNumber(tunai)}</span></div>
        <div class="row"><span>KEMBALI</span><span>${formatNumber(kembali)}</span></div>` : ""}
      <div class="dashed"></div>
      <div class="thanks">
        Terima kasih telah berbelanja
        ${doc.company.email ? `<div>${esc(doc.company.email)}</div>` : ""}
      </div>
    </div>
  </div>`;
}

function kwitansiHTML(doc, totals, def) {
  return `
  <div class="paper" id="print-root">
    <div class="kw-head">
      <div>
        <div class="kw-title">KWITANSI</div>
        <div class="kw-num">Nomor : <span class="mono" style="font-weight:600;color:var(--ink)">${esc(doc.number || "(otomatis)")}</span></div>
      </div>
      <div class="kw-co-wrap">
        <div class="kw-co">
          <div class="n">${esc(doc.company.name)}</div>
          ${doc.company.address ? `<div>${esc(doc.company.address)}</div>` : ""}
          ${doc.company.phone ? `<div>${esc(doc.company.phone)}</div>` : ""}
        </div>
        ${doc.company.logo ? `<img class="kw-logo" src="${doc.company.logo}" alt="Logo">` : ""}
      </div>
    </div>

    <div class="kw-box">
      <div class="kw-box-label">Terbilang</div>
      <div class="kw-box-val">${esc(terbilangRupiah(totals.total))}</div>
    </div>

    <div class="kw-body">
      ${kvHTML("Telah diterima dari", `<div style="font-weight:700">${esc(doc.customer.name || "—")}</div>${doc.customer.address ? `<div style="font-size:11px;color:var(--ink-soft)">${esc(doc.customer.address)}</div>` : ""}`)}
      ${kvHTML("Uang sejumlah", `<span class="kw-amount">${formatRupiahDash(totals.total)}</span>`)}
      ${kvHTML("Untuk pembayaran", `<span class="kw-underline">${esc((doc.meta && doc.meta.tujuan) || " ")}</span>`)}
    </div>

    <div class="kw-foot">
      <div class="kw-city">${esc((doc.meta && doc.meta.kota) || "· · ·")}, ${esc(formatDateID(doc.date))}</div>
      <div class="kw-sigs">${(() => {
        const swap = (doc.meta && doc.meta.swapSignature) || "";
        const cols = [
          { party: "company", label: "Yang Menerima", img: doc.company.signatureImg, name: doc.company.signatory, title: doc.company.signatoryTitle },
          { party: "customer", label: "Yang Memberikan", img: doc.customer.signatureImg, name: doc.customer.name, title: "" },
        ];
        if (swap === "img") {
          const imgs = cols.map((c) => c.img);
          cols.forEach((c, i) => { c.img = imgs[imgs.length - 1 - i]; });
        }
        const list = swap === "swap" ? cols.slice().reverse() : cols;
        return list.map((c) => `
        <div class="kw-sig" data-sig-party="${esc(c.party)}">
          <div class="sig-label">${esc(c.label)}</div>
          ${sigSpaceHTML(c.img, 70)}
          <div class="sig-line">
            <div class="sig-name">${esc(c.name) || "____________________"}</div>
            ${c.title ? `<div class="sig-title">${esc(c.title)}</div>` : ""}
          </div>
        </div>`).join("");
      })()}</div>
    </div>
    ${footerHTML(doc)}
  </div>`;
}

function notaHTML(doc, def, totals) {
  const extra = [];
  if (doc.meta && doc.meta.jatuh_tempo) extra.push(`<div>Jatuh tempo : ${esc(doc.meta.jatuh_tempo)}</div>`);
  if (def.id === "faktur") extra.push(`<div>NPKP : <span class="mono">${esc(doc.company.npkp || "—")}</span></div>`);
  return `
  <div class="paper" id="print-root">
    ${letterheadHTML(doc.company, docMetaHTML(doc, def.docTitle, extra.join("")))}
    ${toBlockHTML(doc, def.id === "nota-kredit" ? "Kepada (kredit)" : "Kepada")}
    ${itemTableHTML(doc.items)}
    ${totalsHTML(doc, totals, def.hasPpn)}
    ${noteHTML(doc, true)}
    ${signaturesHTML(doc, def)}
    ${footerHTML(doc)}
  </div>`;
}

function hppHTML(doc, def, totals) {
  return `
  <div class="paper" id="print-root">
    ${letterheadHTML(doc.company, docMetaHTML(doc, "HPP", (doc.meta && doc.meta.periode) ? `<div>Periode : ${esc(doc.meta.periode)}</div>` : ""))}
    <div style="margin-bottom:16px;font-size:11px;color:var(--ink-soft)">
      Rekapitulasi harga pokok ${doc.meta && doc.meta.periode ? `<b style="color:var(--ink)">${esc(doc.meta.periode)}</b>` : "barang / jasa yang terjual"} periode berjalan.
    </div>
    ${itemTableHTML(doc.items)}
    ${totalsHTML(doc, totals, false, "Total HPP")}
    <div class="hpp-box">Total Harga Pokok Penjualan : <span class="mono">${formatRupiahDash(totals.total)}</span></div>
    ${noteHTML(doc)}
    ${signaturesHTML(doc, def)}
    ${footerHTML(doc)}
  </div>`;
}

function suratJalanHTML(doc, def, totals) {
  return `
  <div class="paper" id="print-root">
    ${letterheadHTML(doc.company, docMetaHTML(doc, "SURAT JALAN"))}
    ${toBlockHTML(doc, "Dikirim kepada")}
    ${doc.meta && doc.meta.tujuan_kirim ? `
      <div style="margin-bottom:16px;font-size:11px">
        <b>Tujuan pengiriman: </b>${esc(doc.meta.tujuan_kirim)}
      </div>` : ""}
    ${itemTableHTML(doc.items)}
    <div style="margin-top:8px;display:flex;justify-content:flex-end">
      <div style="font-size:11px;color:var(--ink-soft)">
        Total nilai barang : <span class="mono" style="font-weight:600;color:var(--ink)">${formatRupiah(totals.gross)}</span>
      </div>
    </div>
    ${noteHTML(doc)}
    ${signaturesHTML(doc, def)}
    ${footerHTML(doc)}
  </div>`;
}

function penawaranHTML(doc, def, totals) {
  return `
  <div class="paper" id="print-root">
    ${letterheadHTML(doc.company, docMetaHTML(doc, "SURAT PENAWARAN"))}
    ${toBlockHTML(doc, "Kepada Yth.")}
    <div class="pen-intro">
      Sehubungan dengan kebutuhan <b>${esc(doc.customer.name || "Bapak/Ibu")}</b>, bersama ini kami
      <b>${esc(doc.company.name)}</b> mengajukan penawaran harga barang / jasa sebagaimana rincian berikut:
    </div>
    ${itemTableHTML(doc.items)}
    ${totalsHTML(doc, totals, def.hasPpn)}
    <div class="pen-valid">
      Penawaran ini berlaku selama <b>${esc((doc.meta && doc.meta.berlaku) || "14 hari")}</b> sejak tanggal penawaran di atas.
    </div>
    ${noteHTML(doc)}
    ${signaturesHTML(doc, def)}
    ${footerHTML(doc)}
  </div>`;
}

function suratHTML(doc, def) {
  const ctx = templateCtx(doc);
  const filled = fillTemplate(doc.body || def.template || "", ctx);
  const paras = filled.split(/\n/)
    .map((p) => p.replace(/\s+$/, ""))
    .filter((p) => p.trim() !== "");
  const body = paras.map((p) => {
    const isDataLine = /^\s*(\d+[.)]|\w[^:]{0,30})\s*:/.test(p) && p.length < 90;
    return `<p class="surat-p ${isDataLine ? "" : "indent"}">${esc(p)}</p>`;
  }).join("");
  return `
  <div class="paper" id="print-root">
    ${letterheadHTML(doc.company)}
    <div class="surat-meta">
      <div class="surat-meta-box">
        <div>No&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;: <span class="mono" style="font-weight:600">${esc(doc.number || "(otomatis)")}</span></div>
        <div>Tempat&nbsp;&nbsp;: ${esc(ctx.kota || "—")}</div>
        <div>Tanggal&nbsp;&nbsp;: ${esc(formatDateLongID(doc.date))}</div>
      </div>
    </div>
    <h1 class="surat-title${def.tightTitle ? " surat-title-tight" : ""}">${esc(def.docTitle)}</h1>
    <div class="surat-body">${body}</div>
    ${signaturesHTML(doc, def)}
    ${footerHTML(doc)}
  </div>`;
}

/* --------------------------- Entry --------------------------- */

/* State global modul stempel. Editor mengatur via setStampState() sebelum render.
 * Nilai null = mode lihat/cetak (stempel statis, tidak interaktif). */
let STAMP_STATE = null;

/**
 * @param {object|null} s - { box, interactive, onBox } atau null untuk non-interaktif
 */
function setStampState(s) { STAMP_STATE = s; }


/** Baca box dari meta dokumen (format "x,y,w,h") atau default. */
function stampBoxFromMeta(doc) {
  return (doc && doc.meta && parseStampBox(doc.meta.stamp)) || stampBoxDefault();
}

/** true bila dokumen sudah punya posisi/ukuran stempel tersimpan (format kertas v2). */
function hasStampBox(doc) {
  return !!(doc && doc.meta && doc.meta.stampV === STAMP_META_VERSION && parseStampBox(doc.meta.stamp));
}

function renderDocPaper(doc) {
  const def = typeById(doc.type);
  const totals = calcTotals({ items: doc.items, ppnRate: doc.ppnRate, discount: doc.discount, hasPpn: def.hasPpn });
  const stamp = doc.company && doc.company.stampImg ? doc.company.stampImg : "";
  const interactive = !!(STAMP_STATE && STAMP_STATE.interactive);
  // stempel hanya memakai meta.stamp bila sudah disimpan dengan format kertas (v2)
  const box = stampBoxIsLegacy(doc) ? null : stampBoxFromMeta(doc);
  const overlay = stampOverlayHTML(stamp, box, interactive);
  const render = (layout) => {
    switch (layout) {
      case "struk": return strukHTML(doc, totals);
      case "kwitansi": return kwitansiHTML(doc, totals, def);
      case "hpp": return hppHTML(doc, def, totals);
      case "surat-jalan": return suratJalanHTML(doc, def, totals);
      case "penawaran": return penawaranHTML(doc, def, totals);
      case "surat": return suratHTML(doc, def);
      default: return notaHTML(doc, def, totals);
    }
  };
  return attachStampOverlay(render(def.layout), overlay);
}

/** Pasang kertas ke kontainer + skalakan agar muat (seperti ScaledPreview). */
function mountScaledPreview(host, doc) {
  const def = typeById(doc.type);
  const width = def.layout === "struk" ? 302 : 794;
  host.innerHTML = `
    <div class="preview-frame">
      <div class="doc-scale-outer">
        <div class="doc-scale-mid">
          <div class="doc-scale-inner">${renderDocPaper(doc)}</div>
        </div>
      </div>
    </div>`;

  const outer = host.querySelector(".doc-scale-outer");
  const mid = host.querySelector(".doc-scale-mid");
  const inner = host.querySelector(".doc-scale-inner");

  const fit = () => {
    if (!outer || !inner) return;
    const scale = Math.min(1, outer.clientWidth / width);
    inner.style.transform = `scale(${scale})`;
    inner.style.width = width + "px";
    mid.style.width = Math.round(width * scale) + "px";
    outer.style.height = Math.round(inner.offsetHeight * scale) + "px";
  };
  fit();
  if (typeof ResizeObserver !== "undefined") {
    const ro = new ResizeObserver(fit);
    ro.observe(outer);
    ro.observe(inner);
  } else {
    window.addEventListener("resize", fit);
  }
  return fit;
}
