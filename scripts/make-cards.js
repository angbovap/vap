// Renders a downloadable business card (PNG and print-ready PDF) for every team member.
// Run with: npm run cards
// Uses Microsoft Edge (or Chrome) headless to render, so it only needs to run on a machine
// that has one. The generated files in src/assets/cards/ are committed and shipped as-is.
const fs = require("fs");
const os = require("os");
const path = require("path");
const { execFileSync } = require("child_process");
const { pathToFileURL } = require("url");

const root = path.join(__dirname, "..");
const site = require(path.join(root, "src/_data/site.json"));
const team = require(path.join(root, "src/_data/team.json"));
const outDir = path.join(root, "src/assets/cards");

const browsers = [
  process.env.CARD_BROWSER,
  "C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe",
  "C:/Program Files/Microsoft/Edge/Application/msedge.exe",
  "C:/Program Files/Google/Chrome/Application/chrome.exe",
].filter(Boolean);
const browser = browsers.find((b) => fs.existsSync(b));
if (!browser) throw new Error("No Edge or Chrome found. Set CARD_BROWSER to its path.");

const fileUrl = (p) => pathToFileURL(p).href;
const logo = fileUrl(path.join(root, "src/assets/img/brand/vaplogo.png"));

const esc = (s) => String(s).replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));
const first = (m) => m.name.split(" ")[0].toLowerCase();

// The card follows the printed VAP business card: white, large logo with the wordmark,
// name in teal capitals with the title beside it, then M / LI / E lines and the address.
// Designed at 900 x 550 CSS px (90mm x 55mm, the Australian standard size).
function cardHtml(m, mode) {
  const office = site.offices[0];
  const linkedin = m.linkedin ? m.linkedin.replace(/^https?:\/\/(www\.)?/, "").replace(/\/$/, "") : "";
  const item = (label, value) => `<span class="item"><b>${label}</b>${esc(value)}</span>`;

  const lines = [];
  const first = [m.phone && item("M", m.phone), linkedin && item("LI", linkedin)].filter(Boolean);
  if (first.length) lines.push(first.join(""));
  lines.push(item("E", m.email));
  lines.push(`${esc(office.line1)}, ${esc(office.line2.replace(/, Australia$/, ""))}`);

  const pdf = mode === "pdf";
  return `<!doctype html><html><head><meta charset="utf-8">
<style>
@page { size: 90mm 55mm; margin: 0; }
* { box-sizing: border-box; margin: 0; padding: 0; }
html, body { width: 900px; height: 550px; overflow: hidden; background: #fff; }
${pdf ? "html { zoom: 0.37795; }" : ""}
body { position: relative; padding: 50px 56px; font-family: 'ATF Franklin Gothic', 'Franklin Gothic Medium', 'Libre Franklin', 'Segoe UI', system-ui, sans-serif; color: #323232; -webkit-print-color-adjust: exact; print-color-adjust: exact; }
.top { display: flex; align-items: center; gap: 26px; }
.top img { width: 190px; height: 190px; object-fit: contain; }
.brand { font-size: 41px; line-height: 1.2; letter-spacing: .01em; text-transform: uppercase; }
.brand b { display: block; font-weight: 700; color: #1f1f1f; }
.brand span { display: block; font-weight: 300; color: #4a4a4a; }
.name { margin-top: 36px; font-size: 31px; line-height: 1.2; font-weight: 700; letter-spacing: .01em; text-transform: uppercase; color: #00707C; }
.name span { margin-left: 14px; font-weight: 400; color: #323232; }
.contact { position: absolute; left: 56px; right: 40px; bottom: 44px; display: grid; gap: 7px; font-size: 24px; line-height: 1.3; }
.contact b { margin-right: 9px; font-weight: 700; color: #00707C; }
.item { margin-right: 22px; white-space: nowrap; }
.item:last-child { margin-right: 0; }
</style></head><body>
<div class="top"><img src="${logo}" alt="">
  <div class="brand"><b>${esc(site.brandPrimary)}</b><span>${esc(site.brandSecondary)}</span></div></div>
<div class="name">${esc(m.name)}${m.role ? `<span>${esc(m.role)}</span>` : ""}</div>
<div class="contact">${lines.map((l) => `<div>${l}</div>`).join("")}</div>
</body></html>`;
}

fs.mkdirSync(outDir, { recursive: true });
const tmp = fs.mkdtempSync(path.join(os.tmpdir(), "vap-cards-"));
const profile = path.join(tmp, "profile");

// Edge exits before it has finished writing the file, so wait for the output to appear and settle.
function run(args, output) {
  fs.rmSync(output, { force: true });
  execFileSync(browser, ["--headless=new", "--disable-gpu", "--hide-scrollbars", `--user-data-dir=${profile}`, ...args], { stdio: "ignore", timeout: 60000 });
  const end = Date.now() + 30000;
  let last = -1;
  while (Date.now() < end) {
    const size = fs.existsSync(output) ? fs.statSync(output).size : 0;
    if (size > 0 && size === last) return;
    last = size;
    Atomics.wait(new Int32Array(new SharedArrayBuffer(4)), 0, 0, 500);
  }
  throw new Error("Timed out waiting for " + output);
}

for (const m of team) {
  const name = first(m);
  const pngHtml = path.join(tmp, `${name}-png.html`);
  const pdfHtml = path.join(tmp, `${name}-pdf.html`);
  fs.writeFileSync(pngHtml, cardHtml(m, "png"));
  fs.writeFileSync(pdfHtml, cardHtml(m, "pdf"));

  const png = path.join(outDir, `${name}.png`);
  const pdf = path.join(outDir, `${name}.pdf`);
  run(["--force-device-scale-factor=2.5", "--window-size=900,550", "--virtual-time-budget=3000",
    `--screenshot=${png}`, fileUrl(pngHtml)], png);
  run(["--no-pdf-header-footer", "--virtual-time-budget=3000",
    `--print-to-pdf=${pdf}`, fileUrl(pdfHtml)], pdf);
  console.log(`${m.name}: ${name}.png, ${name}.pdf`);
}

try { fs.rmSync(tmp, { recursive: true, force: true }); } catch (e) { /* browser may still hold its profile; the OS temp folder is cleaned up later */ }
