/* RekaDok — editor dokumen (baru.html?type=…  atau  baru.html?id=…) */

(function () {
  const params = new URLSearchParams(location.search);
  const editId = params.get("id");
  const mode = editId ? "edit" : "new";
  const settings = loadSettings();

  const existing = editId ? getDoc(editId) : null;
  if (mode === "edit" && !existing) {
    renderShell("dokumen.html");
    document.getElementById("main").innerHTML = `
      <div class="card empty" style="max-width:448px;margin:0 auto">
        <div class="ic" style="background:var(--brick-100);color:var(--brick-600)">${ic("x", 24)}</div>
        <h2>Dokumen tidak ditemukan</h2>
        <p>Mungkin dokumen ini sudah dihapus.</p>
        <a class="btn-primary" style="margin-top:20px" href="dokumen.html">${ic("back", 16)} Ke Arsip Dokumen</a>
      </div>`;
    return;
  }

  const typeId = mode === "edit" ? existing.type : (params.get("type") || "invoice");
  const draft = mode === "edit"
    ? recordToDraft(existing)
    : blankDraft(typeId, settings.company, settings.ppnRate);

  let nextNumberPreview = "";
  let savedFlash = false;
  let error = "";

  renderShell(mode === "edit" ? "dokumen.html" : "index.html");
  const main = document.getElementById("main");

  function refreshNextNumber() {
    if (draft.number === "") {
      nextNumberPreview = nextNumberFor(settings.counters, settings.prefixes, draft.type);
    } else {
      nextNumberPreview = "";
    }
  }
  refreshNextNumber();

  const def = () => typeById(draft.type);
  const totals = () => calcTotals({ items: draft.items, ppnRate: draft.ppnRate, discount: draft.discount, hasPpn: def().hasPpn });

  /* ---------------- form builders ---------------- */

  function infoCard() {
    const d = def();
    return `
    <div class="card" style="padding:16px">
      <div class="section-h" style="margin-bottom:12px">${ic(d.icon, 16)} Informasi Dokumen</div>
      ${mode === "new" ? `
        <div style="margin-bottom:12px">
          <label class="label">Tipe Dokumen</label>
          <select class="input" id="dtype">
            ${DOC_TYPES.map((t) => `<option value="${t.id}" ${t.id === draft.type ? "selected" : ""}>${esc(t.label)}</option>`).join("")}
          </select>
        </div>` : ""}
      <div class="form-grid-2">
        <div class="span2">
          <label class="label">Nomor Dokumen</label>
          <div style="display:flex;gap:8px;align-items:center">
            <input class="input mono" id="dnum" style="font-size:13px" value="${esc(draft.number)}" placeholder="${esc(nextNumberPreview) || "otomatis"}" />
            <button class="btn-ghost btn-sm" id="autoNum" style="flex:none" title="Isi kolom dengan nomor urut otomatis berikutnya">
              ${ic("sparkle", 14)} Otomatis
            </button>
          </div>
          ${draft.number === "" ? `
            <p class="hint">Akan disimpan otomatis sebagai <span class="mono" style="font-weight:600;color:var(--pine-700)">${esc(nextNumberPreview) || "…"}</span></p>` : ""}
        </div>
        <div>
          <label class="label">Tanggal</label>
          <input type="date" class="input" id="ddate" value="${esc(draft.date)}" />
        </div>
        <div>
          <label class="label">Status</label>
          <select class="input" id="dstatus">
            <option value="draf" ${draft.status === "draf" ? "selected" : ""}>Draf</option>
            <option value="terbit" ${draft.status === "terbit" ? "selected" : ""}>Terbit</option>
            <option value="lunas" ${draft.status === "lunas" ? "selected" : ""}>Lunas</option>
          </select>
        </div>
      </div>
      <div class="company-strip">
        <div class="row">
          <div style="display:flex;min-width:0;align-items:center;gap:8px">
            ${ic("building", 16)}
            <span style="font-weight:600;overflow:hidden;text-overflow:ellipsis;white-space:nowrap">${esc(draft.company.name || "Perusahaan belum diisi")}</span>
          </div>
          <a class="link-underline" href="pengaturan.html">Ubah</a>
        </div>
        ${draft.company.address ? `<div class="sub">${esc(draft.company.address)}</div>` : ""}
      </div>
    </div>`;
  }

  function customerCard() {
    const c = draft.customer;
    const custSig = def().signatures.find((s) => s.party === "customer");
    return `
    <div class="card" style="padding:16px">
      <div class="section-h" style="margin-bottom:12px">${ic("users", 16)} Data Penerima</div>
      <div class="form-grid-2">
        <div class="span2">
          <label class="label">Nama</label>
          <input class="input" data-c="name" value="${esc(c.name)}" placeholder="cth PT Maju Jaya Sejahtera" />
        </div>
        <div class="span2">
          <label class="label">Alamat</label>
          <textarea class="input" rows="2" data-c="address">${esc(c.address)}</textarea>
        </div>
        <div>
          <label class="label">Telepon</label>
          <input class="input" data-c="phone" value="${esc(c.phone)}" />
        </div>
        <div>
          <label class="label">NPWP</label>
          <input class="input mono" data-c="npwp" value="${esc(c.npwp)}" />
        </div>
        ${custSig ? `
        <div class="span2 imgup-row">
          <div class="imgup">
            <label class="label">Tanda Tangan (${esc(custSig.label)})</label>
            <div class="imgup-box" data-img-box="csig">
              ${c.signatureImg ? `<img src="${c.signatureImg}" alt="">` : `<span class="imgup-ph">${ic("image", 20)}</span>`}
            </div>
            <div class="imgup-btns">
              <button class="btn-ghost sm" type="button" data-img-pick="csig">${ic("upload", 14)} ${c.signatureImg ? "Ganti" : "Unggah"}</button>
              ${c.signatureImg ? `<button class="btn-ghost sm danger" type="button" data-img-clear="csig">${ic("trash", 14)} Hapus</button>` : ""}
            </div>
            <p class="hint">Tanda tangan pihak pelanggan untuk kolom TTD di dokumen ini.</p>
            <input type="file" accept="image/*" data-img-input="csig" style="display:none" />
          </div>
        </div>` : ""}
      </div>
    </div>`;
  }

  function signatoryCard() {
    const c = draft.company;
    const s = settings.company;
    const d = def();
    return `
    <div class="card" style="padding:16px">
      <div class="section-h" style="margin-bottom:4px">${ic("pen", 16)} Penandatangan</div>
      <p class="hint" style="margin-bottom:12px">
        Nama &amp; jabatan ini tampil di kolom TTD perusahaan. Diambil bawaan dari
        <a class="link-underline" href="pengaturan.html">Pengaturan</a>, bisa dikustom untuk dokumen ini.
      </p>
      ${d.signatures && d.signatures.length >= 2 ? `
      <div class="swap-row">
        <div class="hint">Posisi TTD: <b>${d.signatures.map((x) => esc(x.label)).join(" ↔ ")}</b></div>
        <div class="seg" data-swap-group>
          ${[["", "Normal"], ["swap", "Tukar Kolom"], ["img", "Tukar Gambar"]]
            .map(([v, lbl]) => `<button type="button" class="seg-btn${(draft.meta.swapSignature || "") === v ? " on" : ""}" data-swap="${v}" title="${v === "swap" ? "Tukar kolom kiri <-> kanan" : v === "img" ? "Tukar hanya gambar TTD; label & nama tetap" : "Posisi bawaan"}">${lbl}</button>`)
            .join("")}
        </div>
      </div>` : ""}
      <div class="form-grid-2">
        <div>
          <label class="label">Nama Penandatangan</label>
          <input class="input" data-sig="signatory" value="${esc(c.signatory)}" placeholder="${esc(s.signatory || "cth Budi Santoso")}" />
        </div>
        <div>
          <label class="label">Jabatan Penandatangan</label>
          <input class="input" data-sig="signatoryTitle" value="${esc(c.signatoryTitle)}" placeholder="${esc(s.signatoryTitle || "cth Direktur Utama")}" />
        </div>
      </div>
    </div>`;
  }

  function kwitansiCard() {
    const amt = (draft.items[0] && draft.items[0].price) || 0;
    const t = totals();
    return `
    <div class="card" style="padding:16px">
      <div class="section-h" style="margin-bottom:12px">${ic("banknote", 16)} Nominal</div>
      <label class="label">Uang Sejumlah (Rp)</label>
      <input type="number" min="0" class="input mono" id="kwAmt" style="font-size:18px;font-weight:600" value="${amt ? amt : ""}" placeholder="0" />
      <p class="hint">Terbilang otomatis: <b>${t.total > 0 ? esc(terbilangRupiah(t.total)) : "—"}</b></p>
    </div>`;
  }

  function itemsCard() {
    const t = totals();
    const rows = draft.items.map((it, i) => `
      <div style="display:grid;grid-template-columns:1fr 60px 110px 30px;align-items:center;gap:8px">
        <input class="input" data-it="${it.id}" data-k="name" placeholder="Item ${i + 1}" value="${esc(it.name)}" />
        <input type="number" min="0" class="input" style="padding:6px 8px;text-align:center;font-family:var(--font-mono);font-size:13px" data-it="${it.id}" data-k="qty" value="${it.qty ? it.qty : ""}" placeholder="1" />
        <input type="number" min="0" class="input" style="padding:6px 8px;text-align:right;font-family:var(--font-mono);font-size:13px" data-it="${it.id}" data-k="price" value="${it.price ? it.price : ""}" placeholder="0" />
        <button class="btn-danger btn-xs" data-rm="${it.id}" ${draft.items.length <= 1 ? "disabled" : ""} title="Hapus item">${ic("x", 13)}</button>
      </div>`).join("");

    return `
    <div class="card" style="padding:16px">
      <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:12px">
        <div class="section-h">${ic("receipt", 16)} Item</div>
        <button class="btn-ghost btn-xs" id="addItem">${ic("plus", 14)} Tambah</button>
      </div>
      <div id="itemList" style="display:flex;flex-direction:column;gap:8px">
        <div style="display:grid;grid-template-columns:1fr 60px 110px 30px;gap:8px;padding:0 2px;font-size:10px;font-weight:700;text-transform:uppercase;letter-spacing:0.05em;color:var(--ink-soft)">
          <span>Keterangan</span><span style="text-align:center">Qty</span><span style="text-align:right">Harga</span><span></span>
        </div>
        ${rows}
      </div>
      <div id="itemTotals" style="margin-top:12px;display:flex;flex-direction:column;gap:6px">${itemTotalsHTML()}</div>
    </div>`;
  }

  function itemTotalsHTML() {
    const t = totals();
    return `
      <div style="display:flex;justify-content:space-between;font-size:13px;color:var(--ink-soft)">
        <span>Subtotal</span><span class="mono">${formatRupiah(t.gross)}</span>
      </div>
      <div style="display:flex;align-items:center;justify-content:space-between;gap:12px;color:var(--ink-soft);font-size:13px">
        <span style="display:flex;align-items:center;gap:8px">Diskon
          <input type="number" min="0" id="dDiscount" style="width:96px;padding:4px 8px;text-align:right;font-family:var(--font-mono);font-size:12px" value="${draft.discount ? draft.discount : ""}" placeholder="0" />
        </span>
        <span class="mono">− ${formatRupiah(draft.discount || 0)}</span>
      </div>
      ${def().hasPpn ? `
      <div style="display:flex;align-items:center;justify-content:space-between;gap:12px;color:var(--ink-soft);font-size:13px">
        <span style="display:flex;align-items:center;gap:8px">PPN
          <select id="dPpn" style="width:64px;padding:4px 6px;font-family:var(--font-mono);font-size:12px" class="input">
            <option value="0" ${draft.ppnRate === 0 ? "selected" : ""}>0%</option>
            <option value="11" ${draft.ppnRate === 11 ? "selected" : ""}>11%</option>
          </select>
        </span>
        <span class="mono">${formatRupiah(t.ppn)}</span>
      </div>` : ""}
      <div style="display:flex;align-items:baseline;justify-content:space-between;border-top:2px solid var(--pine-800);padding-top:8px;font-size:14px;font-weight:700">
        <span>Total</span><span class="mono">${formatRupiah(t.total)}</span>
      </div>`;
  }

  function fieldsCard() {
    const d = def();
    if (!d.fields || !d.fields.length) return "";
    const wide = new Set(["tujuan", "kuasa_kegiatan", "objek", "tujuan_kirim"]);
    return `
    <div class="card" style="padding:16px">
      <div class="section-h" style="margin-bottom:12px">Detail Tambahan</div>
      <div class="form-grid-2">
        ${d.fields.map((f) => `
          <div class="${wide.has(f.key) ? "span2" : ""}">
            <label class="label">${esc(f.label)}</label>
            <input class="input" data-f="${f.key}" placeholder="${esc(f.placeholder || "")}" value="${esc((draft.meta && draft.meta[f.key]) || "")}" />
          </div>`).join("")}
      </div>
    </div>`;
  }

  function bodyCard() {
    return `
    <div class="card" style="padding:16px">
      <div class="section-h" style="margin-bottom:4px">Isi Surat</div>
      <p class="hint" style="margin-bottom:12px">
        Gunakan variabel: <span class="mono" style="color:var(--pine-700)">{perusahaan} {nama} {alamat} {kota} {tanggal} {hari_tanggal} {nomor} {ttd_company}</span>
        — diganti otomatis saat dicetak.
      </p>
      <textarea class="input mono" id="dBody" rows="12" style="font-size:12px;line-height:1.625">${esc(draft.body)}</textarea>
      ${def().template ? `
        <button class="link-underline" id="resetBody" style="margin-top:8px">Reset ke template bawaan</button>` : ""}
    </div>`;
  }

  function noteCard() {
    return `
    <div class="card" style="padding:16px">
      <div class="section-h" style="margin-bottom:12px">Catatan</div>
      <textarea class="input" id="dNote" rows="3" placeholder="cth Syarat pembayaran, bank transfer, dll…">${esc(draft.note)}</textarea>
    </div>`;
  }

  function formHTML() {
    const d = def();
    const parts = [infoCard()];
    if (d.hasCustomer) parts.push(customerCard());
    if (d.signatures && d.signatures.some((s) => s.party === "company")) parts.push(signatoryCard());
    if (d.layout === "kwitansi") parts.push(kwitansiCard());
    if (d.hasItems && d.layout !== "kwitansi") parts.push(itemsCard());
    if (d.fields && d.fields.length) parts.push(fieldsCard());
    if (d.hasBody) parts.push(bodyCard());
    if (d.layout !== "surat") parts.push(noteCard());
    return `<div class="no-print" style="display:flex;flex-direction:column;gap:16px">${parts.join("")}</div>`;
  }

  function toolbarHTML() {
    const t = totals();
    return `
    <div class="preview-toolbar no-print">
      <div class="l">
        ${ic("eye", 16)} Pratinjau langsung
        <span class="chip chip-lunas" id="totalChip" style="display:none"></span>
      </div>
      <div class="r">
        ${error ? `<span style="font-size:11px;font-weight:600;color:var(--brick-600)">${esc(error)}</span>` : ""}
        ${savedFlash ? `<span style="font-size:11px;font-weight:600;color:var(--pine-700)">Tersimpan ✓</span>` : ""}
        <button class="btn-ghost btn-sm" id="btnPrint">${ic("printer", 14)} Cetak</button>
        <button class="btn-primary btn-sm" id="btnSavePrint">${ic("printer", 14)} Simpan &amp; Cetak</button>
        <button class="btn-primary btn-sm" id="btnSave">${ic("check", 14)} Simpan</button>
      </div>
    </div>`;
  }

  /* ---------------- render ---------------- */

  const previewHost = document.createElement("div");

  function renderAll() {
    const d = def();
    const editHead = mode === "edit" ? `
      <div class="pagehead no-print">
        <div>
          <h1>${esc(d.label)}</h1>
          <p><span class="mono" style="font-weight:600;color:var(--pine-800)">${esc(existing.number)}</span>  •  ${esc(existing.customer.name || "Tanpa penerima")}</p>
        </div>
        <div class="actions">
          <select class="input w-auto" id="quickStatus" style="padding:8px 12px;font-size:13px">
            <option value="draf" ${draft.status === "draf" ? "selected" : ""}>Draf</option>
            <option value="terbit" ${draft.status === "terbit" ? "selected" : ""}>Terbit</option>
            <option value="lunas" ${draft.status === "lunas" ? "selected" : ""}>Lunas</option>
          </select>
          <button class="btn-ghost" id="btnDup" title="Buat salinan dengan nomor baru">${ic("copy", 16)} Duplikat</button>
          <button class="btn-danger" id="btnDel">${ic("trash", 16)} Hapus</button>
          <a class="btn-ghost" href="dokumen.html" title="Kembali">${ic("back", 16)}</a>
        </div>
      </div>` : `
      <div class="pagehead no-print">
        <div>
          <h1>Buat ${esc(d.label)}</h1>
          <p>${esc(d.desc)}</p>
        </div>
        <div class="actions">
          <a class="btn-ghost" href="dokumen.html">${ic("back", 16)} Kembali</a>
        </div>
      </div>`;

    main.innerHTML = editHead + `
      <div class="editor-grid">
        ${formHTML()}
        <div class="preview-col" style="min-width:0">
          ${toolbarHTML()}
          <div id="previewHost"></div>
        </div>
      </div>`;

    previewHost.id = "previewHost";
    bindForm();
    renderPreview();
  }

  function renderPreview() {
    mountScaledPreview(document.getElementById("previewHost"), draft);
    const t = totals();
    const chip = document.getElementById("totalChip");
    if (chip) {
      chip.textContent = formatRupiah(t.total);
      chip.style.display = t.total > 0 ? "" : "none";
    }
  }

  function refreshItems() {
    document.getElementById("itemList").innerHTML = `
      <div style="display:grid;grid-template-columns:1fr 60px 110px 30px;gap:8px;padding:0 2px;font-size:10px;font-weight:700;text-transform:uppercase;letter-spacing:0.05em;color:var(--ink-soft)">
        <span>Keterangan</span><span style="text-align:center">Qty</span><span style="text-align:right">Harga</span><span></span>
      </div>` + draft.items.map((it, i) => `
      <div style="display:grid;grid-template-columns:1fr 60px 110px 30px;align-items:center;gap:8px">
        <input class="input" data-it="${it.id}" data-k="name" placeholder="Item ${i + 1}" value="${esc(it.name)}" />
        <input type="number" min="0" class="input" style="padding:6px 8px;text-align:center;font-family:var(--font-mono);font-size:13px" data-it="${it.id}" data-k="qty" value="${it.qty ? it.qty : ""}" placeholder="1" />
        <input type="number" min="0" class="input" style="padding:6px 8px;text-align:right;font-family:var(--font-mono);font-size:13px" data-it="${it.id}" data-k="price" value="${it.price ? it.price : ""}" placeholder="0" />
        <button class="btn-danger btn-xs" data-rm="${it.id}" ${draft.items.length <= 1 ? "disabled" : ""} title="Hapus item">${ic("x", 13)}</button>
      </div>`).join("");
    document.getElementById("itemTotals").innerHTML = itemTotalsHTML();
    bindItems();
    renderPreview();
  }

  function refreshKwitansiCard() {
    const t = totals();
    const hint = document.querySelector("#kwAmt");
    if (hint) {
      const p = hint.parentElement.querySelector(".hint b");
      if (p) p.textContent = t.total > 0 ? terbilangRupiah(t.total) : "—";
    }
    renderPreview();
  }

  function refreshTotalsOnly() {
    const box = document.getElementById("itemTotals");
    if (box) box.innerHTML = itemTotalsHTML();
    bindTotals();
    renderPreview();
  }

  /* ---------------- bindings ---------------- */

  function bindTotals() {
    const dd = document.getElementById("dDiscount");
    if (dd) dd.addEventListener("input", () => {
      draft.discount = Number(dd.value) || 0;
      refreshTotalsOnly();
    });
    const pp = document.getElementById("dPpn");
    if (pp) pp.addEventListener("change", () => {
      draft.ppnRate = Number(pp.value) || 0;
      refreshTotalsOnly();
    });
  }

  function bindItems() {
    document.querySelectorAll("[data-it]").forEach((el) => {
      el.addEventListener("input", () => {
        const it = draft.items.find((x) => x.id === el.dataset.it);
        if (!it) return;
        it[el.dataset.k] = el.dataset.k === "name" ? el.value : (Number(el.value) || 0);
        refreshTotalsOnly();
      });
    });
    document.querySelectorAll("[data-rm]").forEach((b) => {
      b.addEventListener("click", () => {
        draft.items = draft.items.filter((x) => x.id !== b.dataset.rm);
        refreshItems();
      });
    });
    const add = document.getElementById("addItem");
    if (add) add.addEventListener("click", () => {
      draft.items.push({ id: uid(), name: "", qty: 1, price: 0 });
      refreshItems();
    });
    bindTotals();
  }

  function bindForm() {
    const dtype = document.getElementById("dtype");
    if (dtype) dtype.addEventListener("change", () => {
      const t = dtype.value;
      const kept = { ...draft };
      Object.assign(draft, blankDraft(t, settings.company, settings.ppnRate));
      draft.number = "";
      draft.status = kept.status;
      refreshNextNumber();
      renderAll();
    });

    const dnum = document.getElementById("dnum");
    if (dnum) dnum.addEventListener("input", () => { draft.number = dnum.value; });

    const auto = document.getElementById("autoNum");
    if (auto) auto.addEventListener("click", () => {
      const n = issueNumber(draft.type);
      if (n) {
        draft.number = n;
        dnum.value = n;
        refreshNextNumber();
        renderAll();
      }
    });

    const ddate = document.getElementById("ddate");
    if (ddate) ddate.addEventListener("change", () => { draft.date = ddate.value; renderPreview(); });

    const dstatus = document.getElementById("dstatus");
    if (dstatus) dstatus.addEventListener("change", () => { draft.status = dstatus.value; });

    const swapSig = document.querySelector("[data-swap-group]");
    if (swapSig) swapSig.addEventListener("click", (e) => {
      const b = e.target.closest("[data-swap]");
      if (!b) return;
      draft.meta = draft.meta || {};
      draft.meta.swapSignature = b.dataset.swap;
      renderAll();
    });

    const qs = document.getElementById("quickStatus");
    if (qs) qs.addEventListener("change", () => {
      draft.status = qs.value;
      save(true);
    });

    document.querySelectorAll("[data-c]").forEach((el) => {
      el.addEventListener("input", () => {
        draft.customer[el.dataset.c] = el.value;
        renderPreview();
      });
    });

    const csigPick = document.querySelector('[data-img-pick="csig"]');
    if (csigPick) csigPick.addEventListener("click", () => {
      const input = document.querySelector('[data-img-input="csig"]');
      if (input) input.click();
    });
    const csigClear = document.querySelector('[data-img-clear="csig"]');
    if (csigClear) csigClear.addEventListener("click", () => {
      draft.customer.signatureImg = "";
      renderAll();
    });
    const csigInput = document.querySelector('[data-img-input="csig"]');
    if (csigInput) csigInput.addEventListener("change", async () => {
      const file = csigInput.files && csigInput.files[0];
      csigInput.value = "";
      if (!file) return;
      try {
        draft.customer.signatureImg = await readImageFile(file, 320);
        renderAll();
      } catch (e) {
        error = (e && e.message) || "Gagal memuat gambar.";
        renderAll();
      }
    });

    const kw = document.getElementById("kwAmt");
    if (kw) kw.addEventListener("input", () => {
      const v = Number(kw.value) || 0;
      const first = draft.items[0];
      if (first) { first.price = v; first.name = first.name || "Uang Tunai"; }
      else draft.items.push({ id: uid(), name: "Uang Tunai", qty: 1, price: v });
      refreshKwitansiCard();
    });

    document.querySelectorAll("[data-f]").forEach((el) => {
      el.addEventListener("input", () => {
        draft.meta = draft.meta || {};
        draft.meta[el.dataset.f] = el.value;
        renderPreview();
      });
    });

    document.querySelectorAll("[data-sig]").forEach((el) => {
      el.addEventListener("input", () => {
        draft.company[el.dataset.sig] = el.value;
        renderPreview();
      });
    });

    const dbody = document.getElementById("dBody");
    if (dbody) dbody.addEventListener("input", () => { draft.body = dbody.value; renderPreview(); });

    const resetBody = document.getElementById("resetBody");
    if (resetBody) resetBody.addEventListener("click", () => {
      draft.body = def().template || "";
      renderAll();
    });

    const dnote = document.getElementById("dNote");
    if (dnote) dnote.addEventListener("input", () => { draft.note = dnote.value; renderPreview(); });

    bindItems();

    document.getElementById("btnPrint").addEventListener("click", () => window.print());
    document.getElementById("btnSave").addEventListener("click", () => save(false));
    document.getElementById("btnSavePrint").addEventListener("click", () => save(true));

    const dup = document.getElementById("btnDup");
    if (dup) dup.addEventListener("click", () => {
      const copy = duplicateDoc(existing.id);
      if (copy) location.href = `baru.html?id=${encodeURIComponent(copy.id)}`;
    });
    const del = document.getElementById("btnDel");
    if (del) del.addEventListener("click", () => {
      if (confirm(`Hapus dokumen ${existing.number}? Tindakan ini tidak bisa dibatalkan.`)) {
        deleteDoc(existing.id);
        location.href = "dokumen.html";
      }
    });
  }

  /* ---------------- save ---------------- */

  function save(printAfter) {
    error = "";
    const d = def();
    const useAuto = !draft.number.trim() || draft.number.trim().toUpperCase() === "AUTO";
    const number = useAuto ? issueNumber(draft.type) : draft.number.trim();
    const rec = {
      id: mode === "edit" ? existing.id : uid(),
      type: draft.type,
      number,
      date: draft.date || todayISO(),
      company: normalizeCompany({ ...settings.company, ...draft.company }),
      customer: normalizeCustomer(draft.customer),
      items: draft.items.map((it) => ({ ...it })),
      meta: { ...draft.meta },
      ppnRate: draft.ppnRate || 0,
      discount: draft.discount || 0,
      note: draft.note || "",
      body: draft.body || "",
      status: draft.status || "draf",
    };
    upsertDoc(rec);
    savedFlash = true;

    if (printAfter) {
      setTimeout(() => {
        location.href = `baru.html?id=${encodeURIComponent(rec.id)}&print=1`;
      }, 150);
    } else {
      setTimeout(() => {
        location.href = `baru.html?id=${encodeURIComponent(rec.id)}`;
      }, 150);
    }
  }

  renderAll();

  if (params.get("print") === "1") {
    setTimeout(() => window.print(), 700);
  }
})();
