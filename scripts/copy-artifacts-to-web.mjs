// Copies ONLY json/md artifacts into web/public/artifacts. Never report
// images, PDF pages, or excavation photos (license gate / V20).
import { cpSync, mkdirSync, existsSync, readdirSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { repoRootFromArgs, paths } from './lib/io.mjs';

export function main(argv = process.argv.slice(2)) {
  const root = repoRootFromArgs(argv);
  const dest = join(paths.web(root), 'public', 'artifacts');
  mkdirSync(dest, { recursive: true });
  const copies = [
    [paths.spec(root), join(dest, 'structural-spec.json')],
    [paths.verification(root), join(dest, 'verification-report.json')],
    [join(paths.artifacts(root), 'corruption-report.json'), join(dest, 'corruption-report.json')]
  ];
  for (const f of existsSync(paths.reportsDir(root)) ? readdirSync(paths.reportsDir(root)) : []) {
    if (/\.md$/.test(f)) copies.push([join(paths.reportsDir(root), f), join(dest, 'reports', f)]);
  }
  let copied = 0;
  for (const [src, dst] of copies) {
    if (!existsSync(src)) continue;
    if (!/\.(json|md)$/.test(src)) continue;
    mkdirSync(join(dst, '..'), { recursive: true });
    cpSync(src, dst);
    copied++;
  }
  if (copied === 0) {
    console.error('copy:web — 복사할 아티팩트 없음 (goal:core 먼저 실행)');
    process.exit(1);
  }
  console.log(`copy:web — ${copied} artifact(s) → web/public/artifacts (json/md only)`);
}

if (process.argv[1] && fileURLToPath(import.meta.url) === process.argv[1]) main();
