#!/usr/bin/env node
// Renderizador determinístico: abre a cena no Chromium, avança o relógio quadro a quadro
// (window.__seek(t)), tira screenshots e o ffmpeg monta o MP4 com o áudio.
// Uso: node render.mjs --scene cena.html --format 9x16|16x9 --duration 8 --audio voz.wav
//        --words voz.json --out saida.mp4 [--fps 30] [--scale 1] [--frames-only dir]
import { createRequire } from 'node:module';
// require() (e não import) respeita NODE_PATH, onde o Playwright global da nuvem está instalado
const { chromium } = createRequire(import.meta.url)('playwright');
import { spawnSync } from 'node:child_process';
import { mkdirSync, readFileSync, rmSync, existsSync } from 'node:fs';
import { resolve, dirname } from 'node:path';

const args = Object.fromEntries(process.argv.slice(2).reduce((a, v, i, arr) =>
  v.startsWith('--') ? [...a, [v.slice(2), arr[i + 1]]] : a, []));
const fps = +(args.fps ?? 30), dur = +args.duration, scale = +(args.scale ?? 1);
const fmt = args.format ?? '9x16';
const [W, H] = fmt === '9x16' ? [1080, 1920] : [1920, 1080];
const outDir = resolve(dirname(args.out), `.frames-${fmt}`);
rmSync(outDir, { recursive: true, force: true }); mkdirSync(outDir, { recursive: true });

const browser = await chromium.launch({ args: ['--no-sandbox'] });
const page = await browser.newPage({ viewport: { width: Math.round(W * scale), height: Math.round(H * scale) }, deviceScaleFactor: 1 });
if (args.words) {
  const words = readFileSync(args.words, 'utf8');
  await page.addInitScript(`window.__WORDS = ${words};`);
}
await page.goto('file://' + resolve(args.scene) + `?format=${fmt}`);
await page.evaluate(() => document.fonts.ready);
await page.waitForFunction(() => typeof window.__seek === 'function');

const n = Math.ceil(dur * fps);
for (let i = 0; i < n; i++) {
  await page.evaluate(t => window.__seek(t), i / fps);
  await page.screenshot({ path: `${outDir}/f${String(i).padStart(5, '0')}.png` });
}
await browser.close();
console.log(`[render] ${n} quadros ${W}x${H} (${fmt})`);
if (args['frames-only']) process.exit(0);

const ff = ['-y', '-v', 'error', '-framerate', String(fps), '-i', `${outDir}/f%05d.png`];
if (args.audio && existsSync(args.audio)) ff.push('-i', args.audio, '-af', 'loudnorm=I=-16:TP=-1.5,apad', '-shortest');
ff.push('-c:v', 'libx264', '-pix_fmt', 'yuv420p', '-crf', '20', '-c:a', 'aac', '-t', String(dur), args.out);
const r = spawnSync('ffmpeg', ff, { stdio: 'inherit' });
rmSync(outDir, { recursive: true, force: true });
process.exit(r.status ?? 1);
