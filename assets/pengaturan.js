/* RekaDok — halaman Pengaturan */

(function () {
  renderShell("pengaturan.html");
  const main = document.getElementById("main");

  const s = loadSettings();
  const c = s.company;

  main.innerHTML = `
  <div class="pagehead no-print">
    <div>
      <h1>Pengaturan</h1>
      <p>Profil perusahaan dipakai di semua dokumen, plus kendali penomoran otomatis.</p>
    </div>
    <div class="actions">
      <button class="btn-primary" id="saveBtn">${ic("check", 16)} Simpan Pengaturan</button>
    </div>
  </div>

  <div id="msg"></div>

  <div class="two-col">
    <div class="card" style="padding:20px">
      <div class="section-h" style="margin-bottom:16px;font-size:15px;text-transform:none;letter-spacing:0">
        ${ic("building", 16)} <span style="font-family:var(--font-display)">Profil Perusahaan</span>
      </div>
      <div class="form-grid-2">
        <div class="span2">
          <label class="label">Nama Perusahaan</label>
          <input class="input" data-co="name" value="${esc(c.name)}" />
        </div>
        <div class="span2 imgup-row">
          ${["logo", "signatureImg"].map((key) => `
          <div class="imgup">
            <label class="label">${key === "logo" ? "Logo Perusahaan" : "Tanda Tangan (TTD)"}</label>
            <div class="imgup-box" data-img-box="${key}">
              ${c[key] ? `<img src="${c[key]}" alt="">` : `<span class="imgup-ph">${ic("image", 20)}</span>`}
            </div>
            <div class="imgup-btns">
              <button class="btn-ghost sm" type="button" data-img-pick="${key}">${ic("upload", 14)} ${c[key] ? "Ganti" : "Unggah"}</button>
              ${c[key] ? `<button class="btn-ghost sm danger" type="button" data-img-clear="${key}">${ic("trash", 14)} Hapus</button>` : ""}
            </div>
            <p class="hint">${key === "logo"
              ? "Tampil di kop dokumen &amp; struk. PNG transparan disarankan, maks. 5 MB."
              : "Gambar tanda tangan untuk kolom TTD di dokumen."}</p>
            <input type="file" accept="image/*" data-img-input="${key}" style="display:none" />
          </div>`).join("")}
        </div>
        <div class="span2">
          <label class="label">Alamat</label>
          <textarea class="input" rows="2" data-co="address">${esc(c.address)}</textarea>
        </div>
        <div>
          <label class="label">Telepon</label>
          <input class="input" data-co="phone" value="${esc(c.phone)}" />
        </div>
        <div>
          <label class="label">Email</label>
          <input class="input" data-co="email" value="${esc(c.email)}" />
        </div>
        <div>
          <label class="label">Website</label>
          <input class="input" data-co="website" value="${esc(c.website)}" />
        </div>
        <div>
          <label class="label">NPWP</label>
          <input class="input mono" data-co="npwp" value="${esc(c.npwp)}" />
        </div>
        <div>
          <label class="label">NPKP</label>
          <input class="input mono" data-co="npkp" value="${esc(c.npkp)}" />
        </div>
        <div>
          <label class="label">Nama Penandatangan</label>
          <input class="input" data-co="signatory" value="${esc(c.signatory)}" />
        </div>
        <div>
          <label class="label">Jabatan Penandatangan</label>
          <input class="input" data-co="signatoryTitle" value="${esc(c.signatoryTitle)}" />
        </div>
      </div>
    </div>

    <div class="card" style="padding:20px">
      <div class="section-h" style="margin-bottom:16px;font-size:15px;text-transform:none;letter-spacing:0">
        ${ic("settings", 16)} <span style="font-family:var(--font-display)">Penomoran Otomatis</span>
      </div>
      <div class="form-grid-2" style="margin-bottom:16px">
        <div>
          <label class="label">Tarif PPN Default</label>
          <select class="input" id="ppnRate">
            <option value="0" ${s.ppnRate === 0 ? "selected" : ""}>0%</option>
            <option value="11" ${s.ppnRate === 11 ? "selected" : ""}>11%</option>
          </select>
        </div>
        <div>
          <label class="label">Mata Uang</label>
          <select class="input" id="currency">
            <option value="IDR" ${s.currency === "IDR" ? "selected" : ""}>IDR (Rp)</option>
            <option value="USD" ${s.currency === "USD" ? "selected" : ""}>USD ($)</option>
          </select>
        </div>
      </div>
      <p class="hint" style="margin-bottom:12px">
        Format: <span class="mono" style="color:var(--pine-800)">PREFIX/TAHUN/URUT</span> — urut naik otomatis tiap dokumen disimpan.
      </p>
      <div class="counter-scroll">
        <table class="tbl">
          <thead><tr>
            <th>Tipe</th><th>Prefix</th><th>Nomor Berikutnya</th>
            <th style="text-align:right">Urut</th><th style="width:56px"></th>
          </tr></thead>
          <tbody>
            ${DOC_TYPES.map((t) => {
              const seq = (s.counters && s.counters[t.id] && s.counters[t.id].seq) || 0;
              const curYear = (s.counters && s.counters[t.id] && s.counters[t.id].year) === new Date().getFullYear();
              const next = nextNumberFor(s.counters, s.prefixes, t.id);
              return `
              <tr>
                <td><span style="display:flex;align-items:center;gap:8px;font-size:13px;font-weight:500">${ic(t.icon, 14)} ${esc(t.label)}</span></td>
                <td><input class="input mono" data-pfx="${t.id}" value="${esc((s.prefixes && s.prefixes[t.id]) || t.prefix)}" style="width:80px;padding:4px 8px;font-size:12px" /></td>
                <td class="mono nowrap" style="font-size:12px;color:var(--pine-800)" data-next="${t.id}">${esc(next)}</td>
                <td class="r">
                  <span class="chip ${curYear && seq > 0 ? "chip-lunas" : "chip-draf"}">
                    ${curYear ? seq : "reset tahun"}
                  </span>
                </td>
                <td class="r">
                  <button class="btn-ghost btn-xs" data-reset="${t.id}" title="Reset urutan ke 0">${ic("refresh", 13)}</button>
                </td>
              </tr>`;
            }).join("")}
          </tbody>
        </table>
      </div>
      <p class="hint">
        Format nomor: <span class="mono">PREFIX/TAHUN/NOMOR-URUT</span>, mis. <span class="mono">${esc((s.prefixes && s.prefixes["invoice"]) || "INV")}/${new Date().getFullYear()}/0001</span>.
        Counter disimpan ${counterSummary()}.
      </p>
    </div>
  </div>`;

  function counterSummary() {
    const n = Object.keys(s.counters || {}).length;
    return n ? `untuk ${n} tipe` : "belum ada";
  }

  document.querySelectorAll("[data-co]").forEach((el) => {
    el.addEventListener("input", () => { s.company[el.dataset.co] = el.value; });
  });

  function refreshImageWidgets() {
    ["logo", "signatureImg"].forEach((key) => {
      const val = s.company[key] || "";
      const box = document.querySelector(`[data-img-box="${key}"]`);
      if (box) box.innerHTML = val ? `<img src="${val}" alt="">` : `<span class="imgup-ph">${ic("image", 20)}</span>`;
      const pick = document.querySelector(`[data-img-pick="${key}"]`);
      if (pick) pick.innerHTML = `${ic("upload", 14)} ${val ? "Ganti" : "Unggah"}`;
      const clr = document.querySelector(`[data-img-clear="${key}"]`);
      if (clr) clr.style.display = val ? "" : "none";
    });
  }

  document.querySelectorAll("[data-img-pick]").forEach((btn) => {
    btn.addEventListener("click", () => {
      const input = document.querySelector(`[data-img-input="${btn.dataset.imgPick}"]`);
      if (input && input.click) input.click();
    });
  });

  document.querySelectorAll("[data-img-clear]").forEach((btn) => {
    btn.addEventListener("click", () => {
      s.company[btn.dataset.imgClear] = "";
      refreshImageWidgets();
      showMsg("ok", "Gambar dihapus. Klik Simpan Pengaturan untuk menyimpan.");
    });
  });

  document.querySelectorAll("[data-img-input]").forEach((input) => {
    input.addEventListener("change", async () => {
      const key = input.dataset.imgInput;
      const file = input.files && input.files[0];
      input.value = "";
      if (!file) return;
      try {
        s.company[key] = await readImageFile(file, key === "logo" ? 512 : 320);
        refreshImageWidgets();
        showMsg("ok", (key === "logo" ? "Logo" : "Tanda tangan") + " dimuat. Klik Simpan Pengaturan.");
      } catch (e) {
        showMsg("err", (e && e.message) || "Gagal memuat gambar.");
      }
    });
  });
  document.querySelectorAll("[data-pfx]").forEach((el) => {
    el.addEventListener("input", () => {
      s.prefixes = s.prefixes || {};
      s.prefixes[el.dataset.pfx] = el.value;
      refreshNextNumbers();
    });
  });
  document.getElementById("ppnRate").addEventListener("change", (e) => { s.ppnRate = Number(e.target.value) || 0; });
  document.getElementById("currency").addEventListener("change", (e) => { s.currency = e.target.value; });

  function refreshNextNumbers() {
    document.querySelectorAll("[data-next]").forEach((td) => {
      td.textContent = nextNumberFor(s.counters, s.prefixes, td.dataset.next);
    });
  }

  document.querySelectorAll("[data-reset]").forEach((b) => {
    b.addEventListener("click", () => {
      const id = b.dataset.reset;
      s.counters = s.counters || {};
      s.counters[id] = { year: new Date().getFullYear(), seq: 0 };
      refreshNextNumbers();
      showMsg("ok", "Penghitung " + typeById(id).label + " direset.");
    });
  });

  function showMsg(kind, text) {
    const m = document.getElementById("msg");
    m.className = "msg " + kind;
    m.innerHTML = `${ic(kind === "ok" ? "check" : "x", 16)} ${esc(text)}`;
  }

  document.getElementById("saveBtn").addEventListener("click", () => {
    try {
      saveSettings(s);
      showMsg("ok", "Pengaturan tersimpan.");
    } catch (e) {
      showMsg("err", "Gagal menyimpan pengaturan.");
    }
  });
})();
