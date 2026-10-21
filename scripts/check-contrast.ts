import { readFileSync } from 'node:fs';

const TOKENS_FILE = './src/styles/tokens.css';
const css = readFileSync(TOKENS_FILE, 'utf8');

function extractThemeTokens(selector: string) {
  const pattern = new RegExp(`${selector.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\s*\\{([^}]*)\\}`, 'm');
  const match = css.match(pattern);
  if (!match) return {} as Record<string, string>;

  const tokens: Record<string, string> = {};
  for (const pair of match[1].split(';')) {
    const tokenMatch = pair.match(/--([a-z-]+)\s*:\s*([^;]+);?/i);
    if (!tokenMatch) continue;
    const [, name, value] = tokenMatch;
    tokens[name] = value.trim();
  }

  return tokens;
}

const lightTokens = extractThemeTokens(':root');
const darkTokens = extractThemeTokens(":root[data-theme='dark']");

const colorPairs = {
  text: ['ink', 'paper'],
  textSmall: ['inkMuted', 'paper'],
  accent: ['accent', 'paper'],
  graphics: ['inkFaint', 'paper'],
  rule: ['rule', 'paper']
} as const;

const makeTheme = (tokens: Record<string, string>) => ({
  paper: tokens.paper || '#F9F9F8',
  ink: tokens.ink || '#1F2328',
  inkMuted: tokens.inkMuted || '#5B6169',
  inkFaint: tokens.inkFaint || '#8A9099',
  rule: tokens.rule || '#E4E4E1',
  accent: tokens.accent || '#2347D0'
});

const lightTheme = makeTheme(lightTokens);
const darkTheme = makeTheme({
  ...lightTheme,
  paper: darkTokens.paper || '#17191C',
  ink: darkTokens.ink || '#E8E9EA',
  inkMuted: darkTokens.inkMuted || '#9A9FA6',
  inkFaint: darkTokens.inkFaint || '#6F757C',
  rule: darkTokens.rule || '#2A2D31',
  accent: darkTokens.accent || '#8EA2FF'
});

function hexToRgb(hex: string) {
  const normalized = hex.replace('#', '').trim();
  const expanded = normalized.length === 3
    ? normalized.split('').map(ch => ch + ch).join('')
    : normalized;

  const num = Number.parseInt(expanded, 16);
  return {
    r: (num >> 16) & 255,
    g: (num >> 8) & 255,
    b: num & 255
  };
}

function relativeLuminance(hex: string) {
  const { r, g, b } = hexToRgb(hex);
  const channels = [r, g, b].map(channel => {
    const value = channel / 255;
    return value <= 0.03928 ? value / 12.92 : ((value + 0.055) / 1.055) ** 2.4;
  });

  return 0.2126 * channels[0] + 0.7152 * channels[1] + 0.0722 * channels[2];
}

function contrast(a: string, b: string) {
  const lumA = relativeLuminance(a);
  const lumB = relativeLuminance(b);
  const lighter = Math.max(lumA, lumB);
  const darker = Math.min(lumA, lumB);
  return (lighter + 0.05) / (darker + 0.05);
}

const results: Array<{ name: string; ratio: number; valid: boolean }> = [];

for (const [name, [foregroundKey, backgroundKey]] of Object.entries(colorPairs)) {
  if (name === 'rule') continue;

  const minRatio = name === 'graphics' ? 3 : 4.5;
  const lightRatio = contrast(lightTheme[foregroundKey], lightTheme[backgroundKey]);
  const darkRatio = contrast(darkTheme[foregroundKey], darkTheme[backgroundKey]);

  results.push({ name: `${name} (light)`, ratio: lightRatio, valid: lightRatio >= minRatio });
  results.push({ name: `${name} (dark)`, ratio: darkRatio, valid: darkRatio >= minRatio });
}

console.log('Contrast check results:');
console.log('----------------------');

let allValid = true;
for (const result of results) {
  const status = result.valid ? '✅' : '❌';
  console.log(`${status} ${result.name}: ${result.ratio.toFixed(2)}`);
  if (!result.valid) allValid = false;
}

if (!allValid) {
  process.exit(1);
}

console.log('All contrast checks passed!');