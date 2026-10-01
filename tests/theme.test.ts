import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { lightColors, darkColors, getColors } from '../src/constants/theme';

const shape = (o: unknown): unknown =>
  o && typeof o === 'object' ? Object.fromEntries(Object.entries(o).map(([k, v]) => [k, shape(v)])) : typeof o;

test('les thèmes clair et sombre ont exactement les mêmes jetons', () => {
  assert.deepEqual(shape(darkColors), shape(lightColors));
});

test('getColors renvoie le bon thème', () => {
  assert.equal(getColors('light'), lightColors);
  assert.equal(getColors('dark'), darkColors);
});

function sourceFiles(dir: string, out: string[] = []): string[] {
  for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
    const p = path.join(dir, e.name);
    if (e.isDirectory()) sourceFiles(p, out);
    else if (/\.tsx?$/.test(e.name)) out.push(p);
  }
  return out;
}

// Compilé dans .test-build/tests : la racine du dépôt est deux niveaux au-dessus.
const root = path.resolve(__dirname, '..', '..');

test('aucun écran n\'ajoute un suffixe hexadécimal à un jeton rgba() (accent, overlay)', () => {
  const offenders: string[] = [];
  for (const f of sourceFiles(path.join(root, 'src'))) {
    if (f.endsWith(path.join('constants', 'theme.ts'))) continue;
    fs.readFileSync(f, 'utf8').split('\n').forEach((line, i) => {
      if (/colors\.(accent|overlay)\s*\+/.test(line)) offenders.push(`${path.relative(root, f)}:${i + 1}`);
    });
  }
  assert.deepEqual(offenders, []);
});

test('aucun écran ne lit plus le thème clair en statique', () => {
  const offenders: string[] = [];
  for (const f of sourceFiles(path.join(root, 'src'))) {
    if (/constants[\\/]theme\.ts$|stores[\\/]theme\.tsx$/.test(f)) continue;
    const text = fs.readFileSync(f, 'utf8');
    // Un import statique de `colors` doit s'accompagner de useThemeColors / useTheme pour rester dans un composant.
    if (/import\s*\{[^}]*\bcolors\b[^}]*\}\s*from\s*'[^']*constants\/theme'/.test(text) &&
        !/useThemeColors|useTheme\b/.test(text)) {
      offenders.push(path.relative(root, f));
    }
  }
  assert.deepEqual(offenders, []);
});
