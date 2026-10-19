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
const hero = fileUrl(path.join(root, "src/assets/img/site/hero.webp"));
const fraunces = fileUrl(path.join(root, "src/assets/fonts/fraunces-italic-latin.woff2"));

const esc = (s) => String(s).replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));
const first = (m) => m.name.split(" ")[0].toLowerCase();

const icons = {
  phone: '<path d="M5 4h4l2 5-2.5 1.5a11 11 0 0 0 5 5L15 13l5 2v4a2 2 0 0 1-2 2A15 15 0 0 1 3 6a2 2 0 0 1 2-2z"/>',
  mail: '<rect x="3" y="5" width="18" height="14" rx="2.5"/><path d="m4 7 8 6 8-6"/>',
  linkedin: '<path d="M5 9.5V19M5 5.5v.01M10 19v-9.5M10 13.5c0-2.5 1.5-4 3.5-4s3.5 1.5 3.5 4V19"/>',
  globe: '<circle cx="12" cy="12" r="9"/><path d="M3 12h18M12 3c3 3 3 15 0 18M12 3c-3 3-3 15 0 18"/>',
  pin: '<path d="M12 21s-6.5-5.6-6.5-11a6.5 6.5 0 0 1 13 0c0 5.4-6.5 11-6.5 11z"/><circle cx="12" cy="10" r="2.3"/>',
};

const row = (icon, html) =>
  `<li><svg viewBox="0 0 24 24">${icons[icon]}</svg><span>${html}</span></li>`;

function cardHtml(m, mode) {
  const office = site.offices[0];
  const linkedin = m.linkedin ? m.linkedin.replace(/^https?:\/\/(www\.)?/, "").replace(/\/$/, "") : "";
  const lines = [];
  if (m.phone) lines.push(row("phone", esc(m.phone)));
  lines.push(row("mail", esc(m.email)));
  if (linkedin) lines.push(row("linkedin", esc(linkedin)));
  lines.push(row("globe", esc(site.siteUrl.replace(/^https?:\/\//, ""))));
  lines.push(row("pin", `${esc(office.line1)}<br>${esc(office.locality)} ${esc(office.region)} ${esc(office.postalCode)}`));

  // Designed at 840 x 480 CSS px (3.5in x 2in). The PDF is the same layout scaled to real size.
  const pdf = mode === "pdf";
  return `<!doctype html><html><head><meta charset="utf-8">
<style>
@font-face { font-family: Fraunces; font-style: italic; src: url("${fraunces}") format("woff2"); }
@page { size: 3.5in 2in; margin: 0; }
* { box-sizing: border-box; margin: 0; padding: 0; }
html, body { width: 840px; height: 480px; overflow: hidden; background: #fff; }
${pdf ? "html { zoom: 0.4; }" : ""}
body { display: flex; font-family: 'ATF Franklin Gothic', 'Franklin Gothic Medium', 'Libre Franklin', 'Segoe UI', system-ui, sans-serif; color: #323232; -webkit-print-color-adjust: exact; print-color-adjust: exact; }
.left { position: relative; flex: 0 0 300px; padding: 40px 34px; color: #fff;
  background: ${pdf ? "linear-gradient(180deg, #00464e, #00707C)" : `linear-gradient(180deg, rgba(0,62,70,.9), rgba(0,92,104,.84)), url("${hero}") center / cover no-repeat`};
  display: flex; flex-direction: column; justify-content: space-between; }
.mark { width: 64px; height: 64px; padding: 5px; background: #fff; border-radius: 12px; }
.brand { margin-top: 18px; font-size: 22px; line-height: 1.2; }
.brand b { font-weight: 700; display: block; letter-spacing: .02em; }
.brand span { font-weight: 300; display: block; letter-spacing: .02em; }
.tag { font-family: Fraunces, Georgia, serif; font-style: italic; font-size: 22px; color: #B8E6EC; line-height: 1.25; }
.bar { position: absolute; right: 0; top: 0; bottom: 0; width: 6px; background: #F5A524; }
.right { flex: 1; padding: 44px 44px 40px 52px; display: flex; flex-direction: column; justify-content: space-between; }
h1 { font-size: 44px; line-height: 1.08; font-weight: 600; color: #323232; }
.role { margin-top: 8px; font-family: Fraunces, Georgia, serif; font-style: italic; font-size: 26px; color: #00707C; }
ul { list-style: none; display: grid; gap: 13px; }
li { display: flex; align-items: flex-start; gap: 14px; font-size: 19px; line-height: 1.3; }
li svg { flex: 0 0 24px; width: 24px; height: 24px; margin-top: 1px; fill: none; stroke: #00707C; stroke-width: 1.8; stroke-linecap: round; stroke-linejoin: round; }
</style></head><body>
<div class="left">
  <div><img class="mark" src="${logo}" alt="">
    <div class="brand"><b>${esc(site.brandPrimary)}</b><span>${esc(site.brandSecondary)}</span></div></div>
  <div class="tag">${esc(site.tagline)}</div>
  <div class="bar"></div>
</div>
<div class="right">
  <div><h1>${esc(m.name)}</h1>${m.role ? `<div class="role">${esc(m.role)}</div>` : ""}</div>
  <ul>${lines.join("")}</ul>
</div>
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
  run(["--force-device-scale-factor=2.5", "--window-size=840,480", "--virtual-time-budget=3000",
    `--screenshot=${png}`, fileUrl(pngHtml)], png);
  run(["--no-pdf-header-footer", "--virtual-time-budget=3000",
    `--print-to-pdf=${pdf}`, fileUrl(pdfHtml)], pdf);
  console.log(`${m.name}: ${name}.png, ${name}.pdf`);
}

try { fs.rmSync(tmp, { recursive: true, force: true }); } catch (e) { /* browser may still hold its profile; the OS temp folder is cleaned up later */ }
