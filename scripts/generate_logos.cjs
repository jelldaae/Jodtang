const fs = require('fs');
const path = require('path');
const { Resvg } = require('@resvg/resvg-js');

// 1. Generate Logo-icon.svg
const iconSvg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" width="512" height="512">
  <defs>
    <filter id="notebook_shadow" x="-20%" y="-20%" width="150%" height="150%">
      <feDropShadow dx="4" dy="16" stdDeviation="16" flood-color="#042817" flood-opacity="0.32" />
    </filter>
    <filter id="coin_shadow" x="-30%" y="-30%" width="160%" height="160%">
      <feDropShadow dx="-4" dy="12" stdDeviation="12" flood-color="#073520" flood-opacity="0.35" />
    </filter>
    <filter id="char_shadow" x="-20%" y="-20%" width="140%" height="140%">
      <feDropShadow dx="2" dy="8" stdDeviation="8" flood-color="#083D24" flood-opacity="0.32" />
    </filter>

    <linearGradient id="cover_grad" x1="110" y1="90" x2="440" y2="440" gradientUnits="userSpaceOnUse">
      <stop offset="0%" stop-color="#38CF91" />
      <stop offset="35%" stop-color="#22AC73" />
      <stop offset="75%" stop-color="#168F5E" />
      <stop offset="100%" stop-color="#0F6C45" />
    </linearGradient>

    <linearGradient id="notebook_side_grad" x1="80" y1="100" x2="450" y2="470" gradientUnits="userSpaceOnUse">
      <stop offset="0%" stop-color="#1A8356" />
      <stop offset="100%" stop-color="#0B472C" />
    </linearGradient>

    <linearGradient id="ring_grad" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stop-color="#FFFFFF" />
      <stop offset="30%" stop-color="#FFFFFF" />
      <stop offset="75%" stop-color="#E2E8F0" />
      <stop offset="100%" stop-color="#CBD5E1" />
    </linearGradient>

    <linearGradient id="sprout_grad1" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="#FFE082" />
      <stop offset="50%" stop-color="#FFCA28" />
      <stop offset="100%" stop-color="#FF8F00" />
    </linearGradient>
    <linearGradient id="sprout_grad2" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="#FFF59D" />
      <stop offset="60%" stop-color="#FFD54F" />
      <stop offset="100%" stop-color="#FFA000" />
    </linearGradient>

    <linearGradient id="char_face" x1="200" y1="140" x2="360" y2="380" gradientUnits="userSpaceOnUse">
      <stop offset="0%" stop-color="#FFFFFF" />
      <stop offset="60%" stop-color="#FFFFFF" />
      <stop offset="100%" stop-color="#F1F5F9" />
    </linearGradient>
    <linearGradient id="char_depth" x1="200" y1="140" x2="360" y2="390" gradientUnits="userSpaceOnUse">
      <stop offset="0%" stop-color="#E2E8F0" />
      <stop offset="100%" stop-color="#94A3B8" />
    </linearGradient>

    <linearGradient id="coin_outer_rim" x1="320" y1="280" x2="470" y2="440" gradientUnits="userSpaceOnUse">
      <stop offset="0%" stop-color="#FFF9C4" />
      <stop offset="25%" stop-color="#FDD835" />
      <stop offset="70%" stop-color="#F59E0B" />
      <stop offset="100%" stop-color="#D97706" />
    </linearGradient>
    <radialGradient id="coin_face" cx="40%" cy="35%" r="65%">
      <stop offset="0%" stop-color="#FEE382" />
      <stop offset="60%" stop-color="#F59E0B" />
      <stop offset="100%" stop-color="#B45309" />
    </radialGradient>
    <linearGradient id="coin_side" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="#D97706" />
      <stop offset="100%" stop-color="#78350F" />
    </linearGradient>
    <linearGradient id="flower_grad" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stop-color="#FFF59D" />
      <stop offset="40%" stop-color="#FCD34D" />
      <stop offset="100%" stop-color="#D97706" />
    </linearGradient>
  </defs>

  <!-- 1. Golden Sprout Leaves at Top Right -->
  <g id="sprout_leaves">
    <g transform="translate(408, 118) rotate(42)">
      <ellipse cx="0" cy="0" rx="16" ry="38" fill="url(#sprout_grad1)" />
      <path d="M-5 20 C-3 28 3 28 5 20 C4 15 -4 15 -5 20 Z" fill="#0D4B2E" />
    </g>
    <g transform="translate(456, 142) rotate(60)">
      <ellipse cx="0" cy="0" rx="14" ry="32" fill="url(#sprout_grad2)" />
      <path d="M-4 16 C-2 24 2 24 4 16 C3 12 -3 12 -4 16 Z" fill="#0D4B2E" />
    </g>
  </g>

  <!-- 2. Notebook 3D Depth -->
  <path
    d="M 106 136 C 106 102 128 80 162 80 L 378 80 C 412 80 440 106 444 140 L 444 382 C 444 416 418 444 384 444 L 140 444 C 112 444 94 424 94 398 Z"
    fill="url(#notebook_side_grad)"
    filter="url(#notebook_shadow)"
  />

  <!-- 3. Notebook Front Cover -->
  <g id="notebook_front">
    <rect x="98" y="88" width="336" height="344" rx="64" fill="url(#cover_grad)" />
    <path
      d="M 162 90 L 372 90 C 400 90 422 110 426 138 C 420 116 400 98 372 98 L 162 98 C 134 98 114 116 108 138 C 112 110 134 90 162 90 Z"
      fill="#FFFFFF"
      opacity="0.22"
    />
  </g>

  <!-- 4. Spiral Binding Rings (4 rings) -->
  <g id="spiral_rings">
    <g transform="translate(0, 150)">
      <ellipse cx="98" cy="6" rx="18" ry="16" fill="#073520" opacity="0.25" />
      <rect x="64" y="-9" width="68" height="28" rx="14" fill="url(#ring_grad)" />
      <ellipse cx="74" cy="-2" rx="5" ry="3" fill="#FFFFFF" opacity="0.7" />
    </g>
    <g transform="translate(0, 225)">
      <ellipse cx="98" cy="6" rx="18" ry="16" fill="#073520" opacity="0.25" />
      <rect x="64" y="-9" width="68" height="28" rx="14" fill="url(#ring_grad)" />
      <ellipse cx="74" cy="-2" rx="5" ry="3" fill="#FFFFFF" opacity="0.7" />
    </g>
    <g transform="translate(0, 300)">
      <ellipse cx="98" cy="6" rx="18" ry="16" fill="#073520" opacity="0.25" />
      <rect x="64" y="-9" width="68" height="28" rx="14" fill="url(#ring_grad)" />
      <ellipse cx="74" cy="-2" rx="5" ry="3" fill="#FFFFFF" opacity="0.7" />
    </g>
    <g transform="translate(0, 375)">
      <ellipse cx="98" cy="6" rx="18" ry="16" fill="#073520" opacity="0.25" />
      <rect x="64" y="-9" width="68" height="28" rx="14" fill="url(#ring_grad)" />
      <ellipse cx="74" cy="-2" rx="5" ry="3" fill="#FFFFFF" opacity="0.7" />
    </g>
  </g>

  <!-- 5. 3D White Thai Letter "จ" -->
  <g id="thai_letter_jor" filter="url(#char_shadow)">
    <path
      d="M 198 250 C 180 230 180 195 208 175 C 235 155 285 142 335 152 C 375 162 388 198 382 238 C 375 280 342 348 298 382 C 275 400 248 395 235 378 C 220 358 232 335 255 320 C 278 305 312 258 318 230 C 322 210 310 195 288 195 C 262 195 240 215 230 242 C 222 262 208 262 198 250 Z"
      fill="url(#char_depth)"
      transform="translate(3, 8)"
    />
    <path
      d="M 198 250 C 180 230 180 195 208 175 C 235 155 285 142 335 152 C 375 162 388 198 382 238 C 375 280 342 348 298 382 C 275 400 248 395 235 378 C 220 358 232 335 255 320 C 278 305 312 258 318 230 C 322 210 310 195 288 195 C 262 195 240 215 230 242 C 222 262 208 262 198 250 Z"
      fill="url(#char_face)"
    />
    <path
      d="M 235 170 C 270 152 318 152 345 165 C 362 174 368 192 365 210 C 360 192 350 178 335 170 C 300 158 260 162 235 170 Z"
      fill="#FFFFFF"
      opacity="0.8"
    />
  </g>

  <!-- 6. 3D Golden Coin in Foreground -->
  <g id="golden_coin" filter="url(#coin_shadow)">
    <circle cx="388" cy="366" r="88" fill="url(#coin_side)" />
    <circle cx="384" cy="358" r="86" fill="url(#coin_outer_rim)" />
    <circle cx="384" cy="358" r="83" fill="none" stroke="#FFFDE7" stroke-width="2.5" opacity="0.8" />
    <circle cx="384" cy="358" r="70" fill="url(#coin_face)" />
    <circle cx="384" cy="358" r="70" fill="none" stroke="#B45309" stroke-width="3" opacity="0.4" />

    <g id="coin_flower" transform="translate(384, 358)">
      <circle cx="0" cy="-24" r="13" fill="url(#flower_grad)" />
      <circle cx="21" cy="-12" r="13" fill="url(#flower_grad)" />
      <circle cx="21" cy="12" r="13" fill="url(#flower_grad)" />
      <circle cx="0" cy="24" r="13" fill="url(#flower_grad)" />
      <circle cx="-21" cy="12" r="13" fill="url(#flower_grad)" />
      <circle cx="-21" cy="-12" r="13" fill="url(#flower_grad)" />
      <circle cx="0" cy="0" r="15" fill="url(#flower_grad)" />
      <circle cx="-2" cy="-3" r="5" fill="#FFFDE7" opacity="0.6" />
    </g>

    <path
      d="M 325 315 C 342 290 380 275 415 278 C 390 278 355 290 338 310 C 330 320 324 332 322 344 C 321 332 322 320 325 315 Z"
      fill="#FFFFFF"
      opacity="0.55"
    />
  </g>
</svg>`;

// 2. Full Logo SVG (Icon + "จดตังค์" + "JODTANG")
const fullLogoSvg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1200 420" width="1200" height="420">
  <defs>
    <filter id="full_notebook_shadow" x="-20%" y="-20%" width="150%" height="150%">
      <feDropShadow dx="3" dy="12" stdDeviation="12" flood-color="#042817" flood-opacity="0.3" />
    </filter>
    <filter id="full_coin_shadow" x="-30%" y="-30%" width="160%" height="160%">
      <feDropShadow dx="-3" dy="10" stdDeviation="10" flood-color="#073520" flood-opacity="0.35" />
    </filter>
    <filter id="full_char_shadow" x="-20%" y="-20%" width="140%" height="140%">
      <feDropShadow dx="2" dy="6" stdDeviation="6" flood-color="#083D24" flood-opacity="0.32" />
    </filter>

    <linearGradient id="fl_cover_grad" x1="60" y1="50" x2="330" y2="350" gradientUnits="userSpaceOnUse">
      <stop offset="0%" stop-color="#38CF91" />
      <stop offset="35%" stop-color="#22AC73" />
      <stop offset="75%" stop-color="#168F5E" />
      <stop offset="100%" stop-color="#0F6C45" />
    </linearGradient>

    <linearGradient id="fl_notebook_side" x1="40" y1="60" x2="340" y2="370" gradientUnits="userSpaceOnUse">
      <stop offset="0%" stop-color="#1A8356" />
      <stop offset="100%" stop-color="#0B472C" />
    </linearGradient>

    <linearGradient id="fl_ring_grad" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stop-color="#FFFFFF" />
      <stop offset="30%" stop-color="#FFFFFF" />
      <stop offset="75%" stop-color="#E2E8F0" />
      <stop offset="100%" stop-color="#CBD5E1" />
    </linearGradient>

    <linearGradient id="fl_sprout1" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="#FFE082" />
      <stop offset="50%" stop-color="#FFCA28" />
      <stop offset="100%" stop-color="#FF8F00" />
    </linearGradient>
    <linearGradient id="fl_sprout2" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="#FFF59D" />
      <stop offset="60%" stop-color="#FFD54F" />
      <stop offset="100%" stop-color="#FFA000" />
    </linearGradient>

    <linearGradient id="fl_char_face" x1="140" y1="100" x2="270" y2="300" gradientUnits="userSpaceOnUse">
      <stop offset="0%" stop-color="#FFFFFF" />
      <stop offset="60%" stop-color="#FFFFFF" />
      <stop offset="100%" stop-color="#F1F5F9" />
    </linearGradient>
    <linearGradient id="fl_char_depth" x1="140" y1="100" x2="270" y2="310" gradientUnits="userSpaceOnUse">
      <stop offset="0%" stop-color="#E2E8F0" />
      <stop offset="100%" stop-color="#94A3B8" />
    </linearGradient>

    <linearGradient id="fl_coin_outer" x1="240" y1="210" x2="360" y2="340" gradientUnits="userSpaceOnUse">
      <stop offset="0%" stop-color="#FFF9C4" />
      <stop offset="25%" stop-color="#FDD835" />
      <stop offset="70%" stop-color="#F59E0B" />
      <stop offset="100%" stop-color="#D97706" />
    </linearGradient>
    <radialGradient id="fl_coin_face" cx="40%" cy="35%" r="65%">
      <stop offset="0%" stop-color="#FEE382" />
      <stop offset="60%" stop-color="#F59E0B" />
      <stop offset="100%" stop-color="#B45309" />
    </radialGradient>
    <linearGradient id="fl_coin_side" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="#D97706" />
      <stop offset="100%" stop-color="#78350F" />
    </linearGradient>
    <linearGradient id="fl_flower" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stop-color="#FFF59D" />
      <stop offset="40%" stop-color="#FCD34D" />
      <stop offset="100%" stop-color="#D97706" />
    </linearGradient>
  </defs>

  <!-- Left Icon Scaled and Translated -->
  <g transform="translate(20, 20) scale(0.72)">
    <!-- Sprout Leaves -->
    <g>
      <g transform="translate(408, 118) rotate(42)">
        <ellipse cx="0" cy="0" rx="16" ry="38" fill="url(#fl_sprout1)" />
        <path d="M-5 20 C-3 28 3 28 5 20 C4 15 -4 15 -5 20 Z" fill="#0D4B2E" />
      </g>
      <g transform="translate(456, 142) rotate(60)">
        <ellipse cx="0" cy="0" rx="14" ry="32" fill="url(#fl_sprout2)" />
        <path d="M-4 16 C-2 24 2 24 4 16 C3 12 -3 12 -4 16 Z" fill="#0D4B2E" />
      </g>
    </g>

    <!-- Notebook 3D Side -->
    <path
      d="M 106 136 C 106 102 128 80 162 80 L 378 80 C 412 80 440 106 444 140 L 444 382 C 444 416 418 444 384 444 L 140 444 C 112 444 94 424 94 398 Z"
      fill="url(#fl_notebook_side)"
      filter="url(#full_notebook_shadow)"
    />

    <!-- Cover Front -->
    <rect x="98" y="88" width="336" height="344" rx="64" fill="url(#fl_cover_grad)" />
    <path
      d="M 162 90 L 372 90 C 400 90 422 110 426 138 C 420 116 400 98 372 98 L 162 98 C 134 98 114 116 108 138 C 112 110 134 90 162 90 Z"
      fill="#FFFFFF"
      opacity="0.22"
    />

    <!-- Rings -->
    <g transform="translate(0, 150)">
      <ellipse cx="98" cy="6" rx="18" ry="16" fill="#073520" opacity="0.25" />
      <rect x="64" y="-9" width="68" height="28" rx="14" fill="url(#fl_ring_grad)" />
      <ellipse cx="74" cy="-2" rx="5" ry="3" fill="#FFFFFF" opacity="0.7" />
    </g>
    <g transform="translate(0, 225)">
      <ellipse cx="98" cy="6" rx="18" ry="16" fill="#073520" opacity="0.25" />
      <rect x="64" y="-9" width="68" height="28" rx="14" fill="url(#fl_ring_grad)" />
      <ellipse cx="74" cy="-2" rx="5" ry="3" fill="#FFFFFF" opacity="0.7" />
    </g>
    <g transform="translate(0, 300)">
      <ellipse cx="98" cy="6" rx="18" ry="16" fill="#073520" opacity="0.25" />
      <rect x="64" y="-9" width="68" height="28" rx="14" fill="url(#fl_ring_grad)" />
      <ellipse cx="74" cy="-2" rx="5" ry="3" fill="#FFFFFF" opacity="0.7" />
    </g>
    <g transform="translate(0, 375)">
      <ellipse cx="98" cy="6" rx="18" ry="16" fill="#073520" opacity="0.25" />
      <rect x="64" y="-9" width="68" height="28" rx="14" fill="url(#fl_ring_grad)" />
      <ellipse cx="74" cy="-2" rx="5" ry="3" fill="#FFFFFF" opacity="0.7" />
    </g>

    <!-- Letter จ -->
    <g filter="url(#full_char_shadow)">
      <path
        d="M 198 250 C 180 230 180 195 208 175 C 235 155 285 142 335 152 C 375 162 388 198 382 238 C 375 280 342 348 298 382 C 275 400 248 395 235 378 C 220 358 232 335 255 320 C 278 305 312 258 318 230 C 322 210 310 195 288 195 C 262 195 240 215 230 242 C 222 262 208 262 198 250 Z"
        fill="url(#fl_char_depth)"
        transform="translate(3, 8)"
      />
      <path
        d="M 198 250 C 180 230 180 195 208 175 C 235 155 285 142 335 152 C 375 162 388 198 382 238 C 375 280 342 348 298 382 C 275 400 248 395 235 378 C 220 358 232 335 255 320 C 278 305 312 258 318 230 C 322 210 310 195 288 195 C 262 195 240 215 230 242 C 222 262 208 262 198 250 Z"
        fill="url(#fl_char_face)"
      />
    </g>

    <!-- Golden Coin -->
    <g filter="url(#full_coin_shadow)">
      <circle cx="388" cy="366" r="88" fill="url(#fl_coin_side)" />
      <circle cx="384" cy="358" r="86" fill="url(#fl_coin_outer)" />
      <circle cx="384" cy="358" r="83" fill="none" stroke="#FFFDE7" stroke-width="2.5" opacity="0.8" />
      <circle cx="384" cy="358" r="70" fill="url(#fl_coin_face)" />
      <circle cx="384" cy="358" r="70" fill="none" stroke="#B45309" stroke-width="3" opacity="0.4" />
      <g transform="translate(384, 358)">
        <circle cx="0" cy="-24" r="13" fill="url(#fl_flower)" />
        <circle cx="21" cy="-12" r="13" fill="url(#fl_flower)" />
        <circle cx="21" cy="12" r="13" fill="url(#fl_flower)" />
        <circle cx="0" cy="24" r="13" fill="url(#fl_flower)" />
        <circle cx="-21" cy="12" r="13" fill="url(#fl_flower)" />
        <circle cx="-21" cy="-12" r="13" fill="url(#fl_flower)" />
        <circle cx="0" cy="0" r="15" fill="url(#fl_flower)" />
        <circle cx="-2" cy="-3" r="5" fill="#FFFDE7" opacity="0.6" />
      </g>
    </g>
  </g>

  <!-- Typography: จดตังค์ JODTANG -->
  <g transform="translate(420, 205)">
    <!-- Text จดตังค์ -->
    <text x="0" y="0" font-family="'Loma', 'Garuda', 'Waree', 'Liberation Sans', sans-serif" font-size="160" font-weight="900" fill="#133F2E" letter-spacing="-2">จดตังค์</text>
    
    <!-- Sprout leaf over 'ค์' -->
    <g transform="translate(510, -145) scale(2.2)">
      <path d="M4 12C3 6 7 2 11 1C11 5 8 10 4 12Z" fill="#F4D35E" stroke="#D69E2E" stroke-width="1.2" />
      <path d="M10 13C9 8 12 5 15 5C15 8 13 11 10 13Z" fill="#F6E05E" stroke="#D69E2E" stroke-width="1.2" />
    </g>

    <!-- Subtext JODTANG -->
    <text x="5" y="95" font-family="'Liberation Sans', 'DejaVu Sans', sans-serif" font-size="64" font-weight="900" fill="#252525" letter-spacing="18">JODTANG</text>
  </g>
</svg>`;

// Render icon to PNG
const resvgIcon = new Resvg(iconSvg, {
  fitTo: { mode: 'width', value: 512 },
});
const iconPngData = resvgIcon.render();
const iconPngBuffer = iconPngData.asPng();

// Render full logo to PNG
const resvgLogo = new Resvg(fullLogoSvg, {
  fitTo: { mode: 'width', value: 1200 },
});
const logoPngData = resvgLogo.render();
const logoPngBuffer = logoPngData.asPng();

// Write to public/ and root and src/assets
const publicDir = path.join(__dirname, '../public');
const assetsDir = path.join(__dirname, '../src/assets');

if (!fs.existsSync(publicDir)) fs.mkdirSync(publicDir, { recursive: true });
if (!fs.existsSync(assetsDir)) fs.mkdirSync(assetsDir, { recursive: true });

fs.writeFileSync(path.join(publicDir, 'Logo-icon.png'), iconPngBuffer);
fs.writeFileSync(path.join(publicDir, 'Logo.png'), logoPngBuffer);
fs.writeFileSync(path.join(publicDir, 'favicon.svg'), iconSvg);

fs.writeFileSync(path.join(assetsDir, 'Logo-icon.png'), iconPngBuffer);
fs.writeFileSync(path.join(assetsDir, 'Logo.png'), logoPngBuffer);

// Also copy to root so relative links './Logo-icon.png' / 'Logo.png' work in any path
fs.writeFileSync(path.join(__dirname, '../Logo-icon.png'), iconPngBuffer);
fs.writeFileSync(path.join(__dirname, '../Logo.png'), logoPngBuffer);

console.log('Successfully generated Logo-icon.png and Logo.png in public/, src/assets/, and root!');
