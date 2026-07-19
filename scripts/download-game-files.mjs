// Runs as postinstall on Vercel — downloads large game source files from the public GitHub repo
// so the deploy_to_vercel tool call stays small enough to fit within output token limits.
import { writeFile, mkdir } from 'fs/promises';
import { dirname, join } from 'path';
import { fileURLToPath } from 'url';

if (!process.env.VERCEL) {
  process.exit(0); // skip on local dev
}

const BASE = 'https://raw.githubusercontent.com/mariamoniquestaana63/STARLITX/main';
const ROOT = join(fileURLToPath(import.meta.url), '../..');

const FILES = [
  'src/app/layout.tsx',
  'src/app/page.tsx',
  'src/app/auth/page.tsx',
  'src/app/game/page.tsx',
  'src/app/premium/page.tsx',
  'src/components/GameCanvas.tsx',
  'src/lib/supabase/client.ts',
  'src/lib/supabase/server.ts',
  'src/game/config.ts',
  'src/game/audio/SoundManager.ts',
  'src/game/scenes/BootScene.ts',
  'src/game/scenes/MainMenuScene.ts',
  'src/game/scenes/CharacterSelectScene.ts',
  'src/game/scenes/BattleScene.ts',
  'src/game/scenes/OverworldScene.ts',
  'src/game/scenes/ShopScene.ts',
  'src/game/scenes/LeaderboardScene.ts',
  'src/game/data/classes.ts',
  'src/game/data/items.ts',
  'src/game/data/shop.ts',
  'src/game/data/demons.ts',
];

console.log('Downloading game source files from GitHub...');
await Promise.all(FILES.map(async (file) => {
  const res = await fetch(`${BASE}/${file}`);
  if (!res.ok) throw new Error(`HTTP ${res.status} fetching ${file}`);
  const text = await res.text();
  const dest = join(ROOT, file);
  await mkdir(dirname(dest), { recursive: true });
  await writeFile(dest, text, 'utf8');
  console.log(`  ✓ ${file}`);
}));
console.log('All game files ready.');
