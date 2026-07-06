import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import { existsSync, readdirSync, readFileSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');

// nothing PDF/HWP-like is tracked by git
const ls = spawnSync('git', ['ls-files'], { cwd: root, encoding: 'utf8' });
if (ls.status === 0) {
  const bad = ls.stdout.split('\n').filter((f) => /\.(pdf|hwp|hwpx|tif|tiff)$/i.test(f));
  assert.deepEqual(bad, [], `no source documents tracked: ${bad}`);
}

// web/public: no pdfs, no source-page raster images (only declared internal renders allowed)
const pub = join(root, 'web', 'public');
if (existsSync(pub)) {
  const walk = (d) => readdirSync(d, { withFileTypes: true }).flatMap((e) =>
    e.isDirectory() ? walk(join(d, e.name)) : [join(d, e.name)]);
  const files = walk(pub);
  assert.deepEqual(files.filter((f) => /\.(pdf|hwp|hwpx|tif|tiff)$/i.test(f)), [], 'no PDFs in web/public');
  const rasters = files.filter((f) => /\.(png|jpe?g|webp|gif)$/i.test(f));
  const allowedPath = join(pub, 'ALLOWED_ASSETS.json');
  const allowed = existsSync(allowedPath)
    ? new Set(JSON.parse(readFileSync(allowedPath, 'utf8')).map((a) => join(pub, a.path)))
    : new Set();
  const undeclared = rasters.filter((f) => !allowed.has(f));
  assert.deepEqual(undeclared, [], `no undeclared raster images (source pages) in web/public: ${undeclared}`);
}
console.log('no-public-pdf-assets.test: PASS');
