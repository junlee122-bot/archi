// build-artifacts.mjs — M1 core pipeline: validate → derive → verify → reports.
import { spawnSync } from 'node:child_process';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const here = dirname(fileURLToPath(import.meta.url));
const root = resolve(here, '..');
const strict = process.argv.includes('--strict');

const steps = [
  ['validate-schemas.mjs', []],
  ['derive.mjs', strict ? ['--strict'] : []],
  ['verify.mjs', strict ? ['--strict'] : []],
  ['generate-license-audit.mjs', []],
  ['generate-evidence-report.mjs', []],
  ['generate-hypotheses-report.mjs', []],
  ['snapshot-artifacts.mjs', []]
];

for (const [script, args] of steps) {
  const r = spawnSync(process.execPath, [join(here, script), ...args], { cwd: root, stdio: 'inherit' });
  if (r.status !== 0) {
    console.error(`build-artifacts: step ${script} failed (exit ${r.status})`);
    process.exit(r.status ?? 1);
  }
}
console.log(`build-artifacts: core pipeline complete${strict ? ' (strict)' : ''}`);
