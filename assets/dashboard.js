/* RekaDok — halaman Dasbor */

(function () {
  renderShell("index.html");
  const main = document.getElementById("main");

  const docs = listDocs();

  const head = `
  <div class="pagehead no-print">
    <div>
      <h1>Dasbor</h1>
      <p>${esc(formatDateLongID(todayISO()))}</p>
    </div>
    <div class="actions">
      <a class="btn-primary" href="baru.html">${ic("plus", 16)} Buat Dokumen</a>
    </div>
  </div>`;

  if (docs.length === 0) {
    main.innerHTML = head + `
    <div class="card empty" style="max-width:672px;margin:0 auto">
      <div class="ic">${ic("logo", 28)}</div>
      <h2>Belum ada dokumen</h2>
      <p>Buat struk, kwitansi, nota, invoice, faktur, surat jalan, hingga surat resmi —
         semuanya dengan penomoran, kalkulasi, dan terbilang otomatis.</p>
      <div style="margin-top:24px;display:flex;flex-wrap:wrap;gap:12px;justify-content:center">
        <a class="btn-primary" href="baru.html">${ic("plus", 16)} Buat Dokumen Pertama</a>
        <button class="btn-ghost" id="seedBtn">${ic("sparkle", 16)} Muat Data Contoh</button>
      </div>
      <p id="seedMsg" style="margin-top:12px;font-size:12px;font-weight:600;color:var(--pine-700)"></p>
    </div>`;

    document.getElementById("seedBtn").addEventListener("click", () => {
      const n = seedSampleDocs();
      document.getElementById("seedMsg").textContent = `${n} dokumen contoh berhasil dibuat`;
      setTimeout(() => location.reload(), 900);
    });
    return;
  }

  /* ---------------- statistik (port /api/stats) ---------------- */
  const now = new Date();
  const ym = `${now.getFullYear()}-${pad2(now.getMonth() + 1)}`;
  const valueOf = (r) => {
    const def = typeById(r.type);
    if (!def.hasItems) return null;
    return calcTotals({ items: r.items, ppnRate: r.ppnRate, discount: r.discount, hasPpn: def.hasPpn }).total;
  };

  const total = docs.length;
  const monthRows = docs.filter((r) => r.date.startsWith(ym));
  const monthCount = monthRows.length;
  const monthValue = monthRows.reduce((a, r) => a + (valueOf(r) || 0), 0);

  const byTypeMap = {};
  docs.forEach((r) => {
    const cur = byTypeMap[r.type] || (byTypeMap[r.type] = { type: r.type, count: 0, value: 0 });
    cur.count++;
    cur.value += valueOf(r) || 0;
  });
  const byType = Object.values(byTypeMap).sort((a, b) => b.count - a.count).slice(0, 6);

  const statusCounts = { draf: 0, terbit: 0, lunas: 0 };
  docs.forEach((r) => { if (statusCounts[r.status] != null) statusCounts[r.status]++; });

  const recent = docs.slice(0, 5);

  const statCards = `
  <div class="stats-grid" style="margin-bottom:24px">
    <div class="card statcard">
      <div class="ic">${ic("doc", 20)}</div>
      <div><div class="k">Total Dokumen</div><div class="v">${total}</div>
      <div class="s">${statusCounts.lunas} lunas • ${statusCounts.terbit} terbit • ${statusCounts.draf} draf</div></div>
    </div>
    <div class="card statcard">
      <div class="ic">${ic("calendar", 20)}</div>
      <div><div class="k">Dokumen Bulan Ini</div><div class="v">${monthCount}</div>
      <div class="s">Berdasarkan tanggal dokumen</div></div>
    </div>
    <div class="card statcard">
      <div class="ic">${ic("wallet", 20)}</div>
      <div><div class="k">Nilai Bulan Ini</div><div class="v">${formatRupiah(monthValue)}</div>
      <div class="s">Dokumen bernilai transaksi</div></div>
    </div>
    <div class="card statcard">
      <div class="ic">${ic("receipt", 20)}</div>
      <div><div class="k">Jenis Terpakai</div><div class="v">${byType.length}</div>
      <div class="s">dari ${DOC_TYPES.length} tipe tersedia</div></div>
    </div>
  </div>`;

  /* ---------------- buat dokumen baru ---------------- */
  const newDocCard = `
  <div class="card" style="overflow:hidden;margin-bottom:24px">
    <div class="panel-head">
      <div>
        <div class="panel-title">Buat Dokumen Baru</div>
        <div class="panel-sub">Pilih tipe, isi formulir, pratinjau langsung, lalu cetak.</div>
      </div>
    </div>
    <div class="grid-3" style="padding:20px">
      ${CATEGORIES.map((cat) => `
        <div class="cat-box">
          <div class="cat-box-title">${esc(cat)}</div>
          <div style="display:flex;flex-direction:column;gap:6px">
            ${DOC_TYPES.filter((t) => t.category === cat).map((t) => `
              <a class="type-row" href="baru.html?type=${t.id}">
                <span class="ic">${ic(t.icon, 16)}</span>
                <span style="min-width:0;flex:1">
                  <span class="t" style="display:block;overflow:hidden;text-overflow:ellipsis;white-space:nowrap">${esc(t.label)}</span>
                  <span class="d" style="display:block">${esc(t.desc)}</span>
                </span>
                ${ic("arrow-right", 14)}
              </a>`).join("")}
          </div>
        </div>`).join("")}
    </div>
  </div>`;

  /* ---------------- dokumen terbaru ---------------- */
  const recentRows = recent.map((r) => {
    const v = valueOf(r);
    return `
    <tr class="row-link" data-go="baru.html?id=${encodeURIComponent(r.id)}">
      <td class="td-strong mono nowrap" style="font-size:12.5px;color:var(--pine-800)">${esc(r.number || "—")}</td>
      <td>${typeBadge(r.type)}</td>
      <td class="nowrap td-soft">${esc(formatShortID(r.date))}</td>
      <td class="mono nowrap" style="font-size:12.5px">${v != null ? formatRupiah(v) : "—"}</td>
      <td>${statusBadge(r.status)}</td>
    </tr>`;
  }).join("");

  const recentCard = `
  <div class="card" style="overflow:hidden">
    <div class="panel-head">
      <div class="panel-title">Dokumen Terbaru</div>
      <a class="link-underline" href="dokumen.html">Lihat semua</a>
    </div>
    <div class="table-wrap">
      <table class="tbl">
        <thead><tr>
          <th>Nomor</th><th>Jenis</th><th>Tanggal</th><th>Nilai</th><th>Status</th>
        </tr></thead>
        <tbody>${recentRows}</tbody>
      </table>
    </div>
  </div>`;

  /* ---------------- rincian per jenis ---------------- */
  const maxCount = Math.max.apply(null, byType.map((b) => b.count).concat([1]));
  const byTypeCard = `
  <div class="card" style="padding:20px">
    <div class="panel-title">Rincian per Jenis</div>
    <div style="margin-top:16px">
      ${byType.length === 0
        ? `<p class="td-soft" style="font-size:12px">Belum ada data.</p>`
        : byType.map((b) => {
            const t = typeById(b.type);
            return `
            <div class="bytype-row">
              <div class="bytype-label">
                <span class="n">${ic(t.icon, 14)} ${esc(t.label)}</span>
                <span class="v">${b.count} • ${formatRupiah(b.value)}</span>
              </div>
              <div class="bar-track">
                <div class="bar-fill" style="width:${Math.round((b.count / maxCount) * 100)}%"></div>
              </div>
            </div>`;
          }).join("")}
    </div>
  </div>`;

  main.innerHTML = head + statCards + newDocCard + `
    <div class="recent-grid">
      ${recentCard}
      ${byTypeCard}
    </div>`;

  main.querySelectorAll("[data-go]").forEach((tr) => {
    tr.addEventListener("click", () => { location.href = tr.dataset.go; });
  });
})();
