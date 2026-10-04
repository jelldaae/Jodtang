const fs = require('fs');
const path = require('path');
const { Resvg } = require('@resvg/resvg-js');

const iconPath = path.join(__dirname, '../public/Logo-icon.png');
const iconBuffer = fs.readFileSync(iconPath);
const iconBase64 = iconBuffer.toString('base64');
const iconDataUri = `data:image/png;base64,${iconBase64}`;

const fullLogoSvg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1350 460" width="1350" height="460">
  <!-- Embedded exact uploaded 3D Icon -->
  <image href="${iconDataUri}" x="20" y="20" width="420" height="420" preserveAspectRatio="xMidYMid meet" />

  <!-- Typography: จดตังค์ JODTANG -->
  <g transform="translate(470, 245)">
    <!-- Text จดตังค์ in Deep Emerald Forest Green -->
    <text x="0" y="0" font-family="'Loma', 'Garuda', 'Waree', 'Liberation Sans', sans-serif" font-size="172" font-weight="900" fill="#133F2E" letter-spacing="-3">จดตังค์</text>

    <!-- Golden Sprout accent over Thai letter ค์ -->
    <g transform="translate(545, -165) scale(2.5)">
      <path d="M4 12C3 6 7 2 11 1C11 5 8 10 4 12Z" fill="#F4D35E" stroke="#D69E2E" stroke-width="1.2" />
      <path d="M10 13C9 8 12 5 15 5C15 8 13 11 10 13Z" fill="#F6E05E" stroke="#D69E2E" stroke-width="1.2" />
    </g>

    <!-- Subtitle JODTANG -->
    <text x="6" y="95" font-family="'Liberation Sans', 'DejaVu Sans', sans-serif" font-size="64" font-weight="900" fill="#252525" letter-spacing="18">JODTANG</text>
  </g>
</svg>`;

const resvg = new Resvg(fullLogoSvg, {
  fitTo: { mode: 'width', value: 1350 },
});
const fullLogoPng = resvg.render().asPng();

const targets = [
  path.join(__dirname, '../public/Logo.png'),
  path.join(__dirname, '../src/assets/Logo.png'),
  path.join(__dirname, '../dist/Logo.png'),
  path.join(__dirname, '../Logo.png'),
];

targets.forEach(t => {
  fs.writeFileSync(t, fullLogoPng);
  console.log('Written:', t, fullLogoPng.length);
});
