/* Debug: kenapa layout "surat" tidak menghasilkan kelas surat-p lagi? */
const fs = require("fs");
const vm = require("vm");

const dir = __dirname + "/assets/";
const sandbox = {
  console, Date, Math, JSON, RegExp, Number, String, Array, Object,
  parseInt, parseFloat, setTimeout, clearTimeout,
  localStorage: { getItem: () => null, setItem: () => {}, removeItem: () => {} },
  document: {
    getElementById: () => null,
    querySelector: () => null,
    querySelectorAll: () => [],
    createElement: () => ({ style: {}, classList: { add() {}, remove() {} }, setAttribute() {}, appendChild() {} }),
  },
  window: {},
  location: { pathname: "/", search: "", href: "" },
  navigator: { userAgent: "node" },
  URLSearchParams,
};
sandbox.globalThis = sandbox;
sandbox.self = sandbox;
const ctx = vm.createContext(sandbox);

for (const f of ["core.js", "preview.js"]) {
  vm.runInContext(fs.readFileSync(dir + f, "utf-8").replace(/\r/g, ""), ctx, { filename: f });
}

const doc = {
  type: "berita-acara",
  number: "BA/2026/0001",
  date: "2026-09-16",
  status: "draf",
  company: { name: "PT NKU", address: "Jl. Sudirman", signatory: "Dewi", signatoryTitle: "Dir" },
  customer: { name: "Siti" },
  items: [],
  meta: { kota: "Bandung", jabatan: "Manajer", objek: "renovasi", masa: "6 bulan" },
  ppnRate: 0,
  discount: 0,
  note: "",
  body: "",
};
const out = sandbox.renderDocPaper(doc);
console.log("LEN", out.length);
console.log(out);
console.log("has surat-p:", out.includes("surat-p"));
console.log("--- templateCtx? ---");
console.log("typeof templateCtx:", typeof sandbox.templateCtx);
console.log("typeof fillTemplate:", typeof sandbox.fillTemplate);
