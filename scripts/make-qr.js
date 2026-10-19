// Generates the permanent QR codes for each /go/ link into ./qr
// (SVG with and without the VAP logo, plus a plain PNG). Run with: npm run qr
const fs = require("fs");
const path = require("path");
const QRCode = require("qrcode");

const site = require("../src/_data/site.json");
const go = require("../src/_data/go.json");
const logo = fs
  .readFileSync(path.join(__dirname, "../src/assets/img/brand/vaplogo.png"))
  .toString("base64");
const out = path.join(__dirname, "../qr");
fs.mkdirSync(out, { recursive: true });

(async () => {
  for (const key of Object.keys(go)) {
    const url = `${site.siteUrl}/go/${key}/`;
    const opts = { errorCorrectionLevel: "H", margin: 4, color: { dark: "#00464e", light: "#ffffff" } };

    const svg = await QRCode.toString(url, { ...opts, type: "svg" });
    fs.writeFileSync(path.join(out, `${key}-plain.svg`), svg);

    // The logo sits on a white plate covering about 5% of the area, well inside level H's tolerance.
    const size = Number(/viewBox="0 0 (\d+)/.exec(svg)[1]);
    const plate = Math.round(size * 0.22);
    const pos = (size - plate) / 2;
    const pad = Math.round(plate * 0.1);
    const withLogo = svg.replace(
      "</svg>",
      `<rect x="${pos}" y="${pos}" width="${plate}" height="${plate}" rx="${pad}" fill="#fff"/>` +
        `<image x="${pos + pad}" y="${pos + pad}" width="${plate - 2 * pad}" height="${plate - 2 * pad}" href="data:image/png;base64,${logo}"/></svg>`
    );
    fs.writeFileSync(path.join(out, `${key}-logo.svg`), withLogo);

    await QRCode.toFile(path.join(out, `${key}.png`), url, { ...opts, width: 1600 });
    console.log(`${key}: ${url}`);
  }
})();
