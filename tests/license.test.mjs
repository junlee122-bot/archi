import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import { readFileSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { loadJson, paths } from '../scripts/lib/io.mjs';
import { licenseStatus, isCommercialCompatible } from '../scripts/lib/model.mjs';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const sources = loadJson(paths.sources(root));

// KOGL semantics: only verified Type-1 (and internal rules) are commercially compatible
const r2018 = sources.find((s) => s.id === 'nrich_2018_a_building_restoration_excavation_report');
assert.equal(licenseStatus(r2018), 'kogl_type1');
assert.equal(isCommercialCompatible(r2018), true);
const type4 = { license: '공공누리 제4유형', license_verified: true, type: 'excavation_report' };
assert.equal(licenseStatus(type4), 'kogl_type4');
assert.equal(isCommercialCompatible(type4), false, 'Type 4 blocks commercial derivative use');
const unverified = { license: 'to_verify', license_verified: false, type: 'excavation_report' };
assert.equal(isCommercialCompatible(unverified), false);

// audit artifact: per-source entries, no global assumption, commercial_safe=false
const r = spawnSync(process.execPath, [join(root, 'scripts', 'generate-license-audit.mjs')], { cwd: root, encoding: 'utf8' });
assert.equal(r.status, 0, r.stderr);
const spec = loadJson(paths.spec(root));
assert.equal(spec.license_audit.commercial_safe, false);
assert.equal(spec.license_audit.sources.length, sources.length, 'one audit entry per source');
assert.ok(!('global_license' in spec.license_audit));
const md = readFileSync(join(paths.reportsDir(root), 'license-audit.md'), 'utf8');
assert.ok(md.includes('commercial_safe: `false`'));
assert.ok(md.includes('nrich_2018_a_building_restoration_excavation_report'));

// mixed policy: unverified sources are flagged for human review
for (const e of spec.license_audit.sources) {
  if (e.status === 'unverified' || e.status === 'declared_unverified' || e.status === 'kogl_type4') {
    assert.equal(e.public_derivative_requires_human_review, true, `${e.id}: human review flag`);
  }
}
console.log('license.test: PASS');
