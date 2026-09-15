/* RekaDok — halaman Semua Dokumen (cari / filter jenis / filter status) */

(function () {
  renderShell("dokumen.html");
  const main = document.getElementById("main");

  const params = new URLSearchParams(location.search);
  const state = {
    search: "",
    type: "",
    status: "",
  };

  const head = `
  <div class="pagehead no-print">
    <div>
      <h1>Semua Dokumen</h1>
      <p id="desc">Memuat arsip…</p>
    </div>
    <div class="actions">
      <a class="btn-primary" href="baru.html">${ic("plus", 16)} Buat Dokumen</a>
    </div>
  </div>

  <div class="card filterbar no-print" style="margin-bottom:16px">
    <div class="search-wrap">
      ${ic("search", 16)}
      <input class="input" id="q" placeholder="Cari nomor, nama penerima, atau catatan…" />
    </div>
    <select class="input w-auto" id="ftype">
      <option value="">Semua jenis</option>
      ${DOC_TYPES.map((t) => `<option value="${t.id}">${esc(t.label)}</option>`).join("")}
    </select>
    <div class="pillrow" id="pills">
      ${[["", "Semua"], ["draf", "Draf"], ["terbit", "Terbit"], ["lunas", "Lunas"]]
        .map(([id, label]) => `<button class="pill ${id === state.status ? "on" : ""}" data-st="${id}">${label}</button>`).join("")}
    </div>
  </div>

  <div class="card" style="overflow:hidden">
    <div class="table-wrap">
      <table class="tbl">
        <thead><tr>
          <th>Tipe</th><th>Nomor</th><th>Penerima</th><th>Tanggal</th>
          <th style="text-align:right">Nilai</th><th>Status</th><th style="text-align:right">Aksi</th>
        </tr></thead>
        <tbody id="rows"></tbody>
      </table>
    </div>
    <div id="emptyState" class="empty" style="display:none">
      <div class="ic">${ic("search", 28)}</div>
      <h2>Tidak ditemukan</h2>
      <p>Coba kata kunci lain atau ubah filter jenis / status dokumen.</p>
    </div>
  </div>`;

  main.innerHTML = head;

  const qEl = document.getElementById("q");
  const fEl = document.getElementById("ftype");
  const rowsEl = document.getElementById("rows");
  const emptyEl = document.getElementById("emptyState");
  const descEl = document.getElementById("desc");

  let debounce = null;
  qEl.addEventListener("input", () => {
    clearTimeout(debounce);
    debounce = setTimeout(() => { state.search = qEl.value.trim(); render(); }, 250);
  });
  fEl.addEventListener("change", () => { state.type = fEl.value; render(); });
  document.getElementById("pills").addEventListener("click", (e) => {
    const b = e.target.closest(".pill");
    if (!b) return;
    state.status = b.dataset.st;
    document.querySelectorAll("#pills .pill").forEach((p) => p.classList.toggle("on", p === b));
    render();
  });

  function visibleDocs() {
    const s = state.search.toLowerCase();
    return listDocs().filter((r) => {
      if (state.type && r.type !== state.type) return false;
      if (state.status && r.status !== state.status) return false;
      if (s) {
        const hay = [r.number, r.customer && r.customer.name, r.note].filter(Boolean).join(" ").toLowerCase();
        if (!hay.includes(s)) return false;
      }
      return true;
    });
  }

  function render() {
    const items = visibleDocs();
    descEl.textContent = `${items.length} dokumen tersimpan di arsip`;
    emptyEl.style.display = items.length ? "none" : "block";
    rowsEl.innerHTML = items.map((r) => {
      const v = docValue(r);
      return `
      <tr>
        <td>${typeBadge(r.type)}</td>
        <td class="td-strong mono nowrap">${esc(r.number || "—")}</td>
        <td><div class="td-strong">${esc((r.customer && r.customer.name) || "—")}</div></td>
        <td class="nowrap">${esc(formatShortID(r.date))}</td>
        <td class="r mono nowrap">${v != null ? formatRupiah(v) : "—"}</td>
        <td>${statusBadge(r.status)}</td>
        <td class="r nowrap">
          <a class="btn-ghost btn-xs" href="baru.html?id=${encodeURIComponent(r.id)}" title="Lihat / edit">${ic("eye", 13)}</a>
          <button class="btn-ghost btn-xs" data-dup="${encodeURIComponent(r.id)}" title="Duplikasi">${ic("copy", 13)}</button>
          <button class="btn-danger btn-xs" data-del="${encodeURIComponent(r.id)}" title="Hapus">${ic("trash", 13)}</button>
        </td>
      </tr>`;
    }).join("");
  }

  rowsEl.addEventListener("click", (e) => {
    const del = e.target.closest("[data-del]");
    const dup = e.target.closest("[data-dup]");
    if (del) {
      const id = decodeURIComponent(del.dataset.del);
      const rec = getDoc(id);
      if (rec && confirm(`Hapus dokumen ${rec.number}? Tindakan ini tidak bisa dibatalkan.`)) {
        deleteDoc(id);
        render();
      }
      return;
    }
    if (dup) {
      const id = decodeURIComponent(dup.dataset.dup);
      const copy = duplicateDoc(id);
      if (copy) location.href = `baru.html?id=${encodeURIComponent(copy.id)}`;
    }
  });

  if (params.get("type")) {
    state.type = params.get("type");
    fEl.value = state.type;
  }
  render();
})();
