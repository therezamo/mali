import { spawnSync } from 'node:child_process';
import { copyFile, mkdir, readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.dirname(fileURLToPath(import.meta.url));
const run = spawnSync(process.execPath, [
  path.join(root, 'node_modules', 'tailwindcss', 'lib', 'cli.js'),
  '-i', './input.css',
  '-o', './assets/css/app.css',
  '--minify',
], { cwd: root, stdio: 'inherit' });

if (run.status !== 0) process.exit(run.status ?? 1);

const fontDir = path.join(root, 'node_modules', '@fontsource', 'vazirmatn', 'files');
let appCss = await readFile(path.join(root, 'assets/css/app.css'), 'utf8');
for (const weight of [300, 400, 500, 600, 700, 800, 900]) {
  const font = await readFile(path.join(fontDir, `vazirmatn-arabic-${weight}-normal.woff2`));
  const dataUri = `url(data:font/woff2;base64,${font.toString('base64')})`;
  appCss = appCss.replaceAll(`url(../fonts/vazirmatn-${weight}.woff2)`, dataUri);
}
await writeFile(path.join(root, 'assets/css/app.css'), appCss);

const awesomeDir = path.join(root, 'node_modules', '@fortawesome', 'fontawesome-free');
let awesomeCss = await readFile(path.join(awesomeDir, 'css', 'all.min.css'), 'utf8');
awesomeCss = awesomeCss.replace(/@font-face\{[^}]*\}/g, '');
const awesomeFont = await readFile(path.join(awesomeDir, 'webfonts', 'fa-solid-900.woff2'));
const awesomeFontFace = `@font-face{font-family:"Font Awesome 6 Free";font-style:normal;font-weight:900;font-display:block;src:url(data:font/woff2;base64,${awesomeFont.toString('base64')}) format("woff2")}`;
awesomeCss = `${awesomeFontFace}${awesomeCss}`;
await mkdir(path.join(root, 'assets/vendor/fontawesome/css'), { recursive: true });
await writeFile(path.join(root, 'assets/vendor/fontawesome/css/all.min.css'), awesomeCss);

await mkdir(path.join(root, 'assets/vendor'), { recursive: true });
await copyFile(path.join(root, 'node_modules', 'chart.js', 'dist', 'chart.umd.js'), path.join(root, 'assets/vendor/chart.umd.js'));


