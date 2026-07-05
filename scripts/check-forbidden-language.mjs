// check-forbidden-language.mjs — scans USER-FACING surfaces only (patch section J):
//   web/app/**/*.tsx, web/components/**/*.tsx, generated public reports,
//   README.md, docs/DEMO_SCRIPT.md.
// Policy docs (docs/SOURCE_POLICY.md, docs/VERIFIER_SPEC.md), forbiddenTerms
// arrays, code comments, and negated policy sentences are exempt.
import { readFileSync, readdirSync, statSync, existsSync } from 'node:fs';
import { join, relative } from 'node:path';
import { fileURLToPath } from 'node:url';
import { repoRootFromArgs, paths } from './lib/io.mjs';
import { scanText } from './lib/forbidden.mjs';

function walk(dir, out = []) {
  if (!existsSync(dir)) return out;
  for (const entry of readdirSync(dir)) {
    const p = join(dir, entry);
    const st = statSync(p);
    if (st.isDirectory()) {
      if (entry === 'node_modules' || entry === '.next' || entry === '.git') continue;
      walk(p, out);
    } else out.push(p);
  }
  return out;
}

export function main(argv = process.argv.slice(2)) {
  const root = repoRootFromArgs(argv);
  const targets = [];
  for (const dir of [join(paths.web(root), 'app'), join(paths.web(root), 'components')]) {
    for (const f of walk(dir)) if (/\.(tsx|ts)$/.test(f)) targets.push([f, 'code']);
  }
  for (const f of walk(paths.reportsDir(root))) if (/\.md$/.test(f)) targets.push([f, 'markdown']);
  for (const f of walk(join(paths.web(root), 'public', 'artifacts'))) if (/\.md$/.test(f)) targets.push([f, 'markdown']);
  for (const name of ['README.md', join('docs', 'DEMO_SCRIPT.md')]) {
    const p = join(root, name);
    if (existsSync(p)) targets.push([p, 'markdown']);
  }
  const violations = [];
  for (const [file, kind] of targets) {
    for (const v of scanText(readFileSync(file, 'utf8'), { kind })) {
      violations.push(`${relative(root, file)}:${v.line}: '${v.term}' — ${v.text}`);
    }
  }
  if (violations.length) {
    console.error(`forbidden: ${violations.length} user-facing violation(s):`);
    for (const v of violations) console.error('  · ' + v);
    process.exit(1);
  }
  console.log(`forbidden: ${targets.length} user-facing file(s) clean`);
}

if (process.argv[1] && fileURLToPath(import.meta.url) === process.argv[1]) main();
