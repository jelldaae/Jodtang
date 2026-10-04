const fs = require('fs');
const path = require('path');
const { Resvg } = require('@resvg/resvg-js');

// High-fidelity SVG of "Cute Gold Coin - Happy"
const coinMascotSvg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" width="512" height="512">
  <defs>
    <!-- Soft ambient drop shadows -->
    <filter id="mascot_shadow" x="-30%" y="-30%" width="160%" height="160%">
      <feDropShadow dx="0" dy="16" stdDeviation="16" flood-color="#804B00" flood-opacity="0.25" />
    </filter>
    <filter id="coin_float_shadow" x="-30%" y="-30%" width="160%" height="160%">
      <feDropShadow dx="2" dy="8" stdDeviation="8" flood-color="#804B00" flood-opacity="0.2" />
    </filter>
    <filter id="sparkle_glow" x="-40%" y="-40%" width="180%" height="180%">
      <feDropShadow dx="0" dy="0" stdDeviation="4" flood-color="#FFE082" flood-opacity="0.8" />
    </filter>

    <!-- Coin Face Gradients -->
    <radialGradient id="face_grad" cx="45%" cy="40%" r="58%">
      <stop offset="0%" stop-color="#FFF176" />
      <stop offset="35%" stop-color="#FFEE58" />
      <stop offset="70%" stop-color="#FFD54F" />
      <stop offset="100%" stop-color="#FFCA28" />
    </radialGradient>

    <linearGradient id="rim_grad" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="#FFF9C4" />
      <stop offset="25%" stop-color="#FFE082" />
      <stop offset="60%" stop-color="#FFCA28" />
      <stop offset="90%" stop-color="#FFA000" />
      <stop offset="100%" stop-color="#FF8F00" />
    </linearGradient>

    <linearGradient id="side_depth_grad" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="#FFA000" />
      <stop offset="100%" stop-color="#E65100" />
    </linearGradient>

    <!-- Limb Gradients -->
    <linearGradient id="arm_grad" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="#FFF176" />
      <stop offset="70%" stop-color="#FFCA28" />
      <stop offset="100%" stop-color="#FFA000" />
    </linearGradient>

    <linearGradient id="shoe_grad" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stop-color="#795548" />
      <stop offset="50%" stop-color="#5D4037" />
      <stop offset="100%" stop-color="#3E2723" />
    </linearGradient>

    <!-- Green Leaves Gradients -->
    <linearGradient id="leaf_grad1" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="#81C784" />
      <stop offset="60%" stop-color="#4CAF50" />
      <stop offset="100%" stop-color="#2E7D32" />
    </linearGradient>
    <linearGradient id="leaf_grad2" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="#A5D6A7" />
      <stop offset="60%" stop-color="#66BB6A" />
      <stop offset="100%" stop-color="#388E3C" />
    </linearGradient>

    <!-- Floating Coins -->
    <linearGradient id="mini_coin_grad" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="#FFF59D" />
      <stop offset="40%" stop-color="#FFD54F" />
      <stop offset="85%" stop-color="#FFB300" />
      <stop offset="100%" stop-color="#FF8F00" />
    </linearGradient>

    <!-- Sparkle Gold Gradient -->
    <linearGradient id="sparkle_grad" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="#FFFFFF" />
      <stop offset="40%" stop-color="#FFE082" />
      <stop offset="100%" stop-color="#FFB300" />
    </linearGradient>
  </defs>

  <!-- 1. Floating Sparkle Stars -->
  <g id="sparkles">
    <!-- Star Left -->
    <path d="M 88 190 Q 94 190 94 178 Q 94 190 100 190 Q 94 190 94 202 Q 94 190 88 190 Z" fill="url(#sparkle_grad)" filter="url(#sparkle_glow)" />
    <!-- Star Bottom-Left -->
    <path d="M 36 415 Q 52 415 52 392 Q 52 415 68 415 Q 52 415 52 438 Q 52 415 36 415 Z" fill="url(#sparkle_grad)" filter="url(#sparkle_glow)" />
    <!-- Star Top-Mid -->
    <path d="M 225 125 Q 235 125 235 110 Q 235 125 245 125 Q 235 125 235 140 Q 235 125 225 125 Z" fill="url(#sparkle_grad)" filter="url(#sparkle_glow)" />
    <!-- Star Right -->
    <path d="M 445 168 Q 460 168 460 148 Q 460 168 475 168 Q 460 168 460 188 Q 460 168 445 168 Z" fill="url(#sparkle_grad)" filter="url(#sparkle_glow)" />
    <!-- Star Bottom-Right -->
    <path d="M 440 350 Q 452 350 452 334 Q 452 350 464 350 Q 452 350 452 366 Q 452 350 440 350 Z" fill="url(#sparkle_grad)" filter="url(#sparkle_glow)" />
  </g>

  <!-- 2. Orbiting Floating Coins -->
  <g id="floating_coins">
    <!-- Top-Left Coin -->
    <g transform="translate(112, 128) rotate(-35)" filter="url(#coin_float_shadow)">
      <ellipse cx="0" cy="0" rx="34" ry="20" fill="url(#mini_coin_grad)" stroke="#FFA000" stroke-width="2" />
      <ellipse cx="0" cy="0" rx="26" ry="14" fill="none" stroke="#FFE082" stroke-width="2" />
      <ellipse cx="-2" cy="-2" rx="20" ry="10" fill="#FFF9C4" opacity="0.6" />
    </g>

    <!-- Far-Left Coin -->
    <g transform="translate(68, 328) rotate(-28)" filter="url(#coin_float_shadow)">
      <ellipse cx="0" cy="0" rx="34" ry="20" fill="url(#mini_coin_grad)" stroke="#FFA000" stroke-width="2" />
      <ellipse cx="0" cy="0" rx="26" ry="14" fill="none" stroke="#FFE082" stroke-width="2" />
      <ellipse cx="-2" cy="-2" rx="20" ry="10" fill="#FFF9C4" opacity="0.6" />
    </g>

    <!-- Top-Right Floating Coin 1 -->
    <g transform="translate(325, 85) rotate(22)" filter="url(#coin_float_shadow)">
      <ellipse cx="0" cy="0" rx="24" ry="15" fill="url(#mini_coin_grad)" stroke="#FFA000" stroke-width="2" />
      <ellipse cx="0" cy="0" rx="18" ry="10" fill="none" stroke="#FFE082" stroke-width="1.5" />
    </g>

    <!-- Top-Right Floating Coin 2 -->
    <g transform="translate(388, 155) rotate(32)" filter="url(#coin_float_shadow)">
      <ellipse cx="0" cy="0" rx="34" ry="20" fill="url(#mini_coin_grad)" stroke="#FFA000" stroke-width="2" />
      <ellipse cx="0" cy="0" rx="26" ry="14" fill="none" stroke="#FFE082" stroke-width="2" />
      <ellipse cx="-2" cy="-2" rx="20" ry="10" fill="#FFF9C4" opacity="0.6" />
    </g>

    <!-- Bottom-Right Floating Coin -->
    <g transform="translate(415, 415) rotate(38)" filter="url(#coin_float_shadow)">
      <ellipse cx="0" cy="0" rx="34" ry="20" fill="url(#mini_coin_grad)" stroke="#FFA000" stroke-width="2" />
      <ellipse cx="0" cy="0" rx="26" ry="14" fill="none" stroke="#FFE082" stroke-width="2" />
      <ellipse cx="-2" cy="-2" rx="20" ry="10" fill="#FFF9C4" opacity="0.6" />
    </g>
  </g>

  <!-- 3. Character Limbs Behind/Beside Body -->
  <!-- Left Foot / Shoe jumping -->
  <g transform="translate(172, 418) rotate(-18)">
    <ellipse cx="0" cy="0" rx="24" ry="17" fill="url(#shoe_grad)" />
    <!-- Highlight on Shoe -->
    <ellipse cx="-5" cy="-5" rx="12" ry="7" fill="#A1887F" opacity="0.5" />
  </g>

  <!-- Right Foot / Shoe jumping -->
  <g transform="translate(300, 424) rotate(16)">
    <ellipse cx="0" cy="0" rx="24" ry="17" fill="url(#shoe_grad)" />
    <ellipse cx="-4" cy="-5" rx="12" ry="7" fill="#A1887F" opacity="0.5" />
  </g>

  <!-- Green Sprout Leaves on Top Right of Head -->
  <g id="head_sprouts">
    <!-- Leaf 1 (Left) -->
    <g transform="translate(325, 160) rotate(-45)">
      <ellipse cx="0" cy="0" rx="18" ry="32" fill="url(#leaf_grad1)" />
      <path d="M 0 -28 Q 2 0 0 28" stroke="#81C784" stroke-width="2" fill="none" />
    </g>
    <!-- Leaf 2 (Right) -->
    <g transform="translate(390, 205) rotate(48)">
      <ellipse cx="0" cy="0" rx="18" ry="32" fill="url(#leaf_grad2)" />
      <path d="M 0 -28 Q 2 0 0 28" stroke="#A5D6A7" stroke-width="2" fill="none" />
    </g>
  </g>

  <!-- Left Arm Raised Up Joyfully -->
  <g transform="translate(108, 255) rotate(-38)" filter="url(#mascot_shadow)">
    <path d="M 0 0 C -15 -18 -15 -45 5 -55 C 22 -62 40 -40 32 -18 C 26 -2 15 5 0 0 Z" fill="url(#arm_grad)" />
    <circle cx="8" cy="-48" r="14" fill="#FFE082" />
  </g>

  <!-- Right Arm Raised Up Joyfully -->
  <g transform="translate(375, 275) rotate(42)" filter="url(#mascot_shadow)">
    <path d="M 0 0 C 15 -18 15 -45 -5 -55 C -22 -62 -40 -40 -32 -18 C -26 -2 -15 5 0 0 Z" fill="url(#arm_grad)" />
    <circle cx="-8" cy="-48" r="14" fill="#FFE082" />
  </g>

  <!-- 4. Main Character Body (Cute Round Golden Coin) -->
  <g id="main_coin_body" filter="url(#mascot_shadow)">
    <!-- 3D Coin Extrusion Rim (Bevel depth) -->
    <circle cx="258" cy="278" r="138" fill="url(#side_depth_grad)" />

    <!-- Outer Raised Beveled Rim of Coin -->
    <circle cx="254" cy="270" r="136" fill="url(#rim_grad)" />
    <!-- Bright Rim Inner Highlight Ring -->
    <circle cx="254" cy="270" r="130" fill="none" stroke="#FFFDE7" stroke-width="3" opacity="0.8" />

    <!-- Inner Recessed Coin Face -->
    <circle cx="254" cy="270" r="114" fill="url(#face_grad)" />
    <circle cx="254" cy="270" r="114" fill="none" stroke="#FFB300" stroke-width="3.5" opacity="0.6" />

    <!-- Specular Arc at Top-Left Rim -->
    <path
      d="M 160 215 C 185 175 230 152 280 155 C 240 155 195 178 172 212 C 164 224 158 238 155 252 C 154 238 156 225 160 215 Z"
      fill="#FFFFFF"
      opacity="0.65"
    />

    <!-- 5. Cute Facial Features -->
    <!-- Left Smiling Arched Eye -->
    <path
      d="M 190 230 C 196 218 212 218 220 230"
      fill="none"
      stroke="#211E1D"
      stroke-width="7"
      stroke-linecap="round"
      stroke-linejoin="round"
    />

    <!-- Right Smiling Arched Eye -->
    <path
      d="M 280 238 C 286 226 302 226 310 238"
      fill="none"
      stroke="#211E1D"
      stroke-width="7"
      stroke-linecap="round"
      stroke-linejoin="round"
    />

    <!-- Left Peachy Blush Cheek -->
    <ellipse cx="178" cy="252" rx="16" ry="12" fill="#FF8A80" opacity="0.75" />

    <!-- Right Peachy Blush Cheek -->
    <ellipse cx="320" cy="260" rx="16" ry="12" fill="#FF8A80" opacity="0.75" />

    <!-- Big Open Joyful Mouth with Tongue -->
    <g transform="translate(248, 260)">
      <!-- Mouth Cavity -->
      <path
        d="M -22 -6 C -20 18 20 18 22 -6 Q 0 -9 -22 -6 Z"
        fill="#211E1D"
      />
      <!-- Cute Pink Tongue -->
      <path
        d="M -13 4 C -6 4 -4 14 0 14 C 4 14 6 4 13 4 C 11 12 5 16 0 16 C -5 16 -11 12 -13 4 Z"
        fill="#FF5252"
      />
      <!-- Soft Upper Lip Shine -->
      <ellipse cx="0" cy="-6" rx="12" ry="2" fill="#FFA726" opacity="0.3" />
    </g>
  </g>
</svg>`;

// Render to high-res PNG buffers
const resvgMascot = new Resvg(coinMascotSvg, {
  fitTo: { mode: 'width', value: 512 },
});
const mascotPng = resvgMascot.render().asPng();

const publicDir = path.join(__dirname, '../public');
const assetsDir = path.join(__dirname, '../src/assets');

fs.writeFileSync(path.join(publicDir, 'Cute-Gold-Coin-Happy.png'), mascotPng);
fs.writeFileSync(path.join(publicDir, 'Cute Gold Coin - Happy.png'), mascotPng);
fs.writeFileSync(path.join(publicDir, 'mascot.png'), mascotPng);

fs.writeFileSync(path.join(assetsDir, 'Cute-Gold-Coin-Happy.png'), mascotPng);
fs.writeFileSync(path.join(assetsDir, 'Cute Gold Coin - Happy.png'), mascotPng);
fs.writeFileSync(path.join(assetsDir, 'mascot.png'), mascotPng);

// Also save in root
fs.writeFileSync(path.join(__dirname, '../Cute-Gold-Coin-Happy.png'), mascotPng);
fs.writeFileSync(path.join(__dirname, '../Cute Gold Coin - Happy.png'), mascotPng);

console.log('Successfully rendered Cute-Gold-Coin-Happy.png everywhere!');
