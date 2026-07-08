import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { loadJson } from '../scripts/lib/io.mjs';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');

const r = spawnSync(process.execPath, [join(root, 'scripts', 'corrupt.mjs')], { cwd: root, encoding: 'utf8' });
assert.equal(r.status, 0, `corruption drill must be fail-closed:\n${r.stdout}\n${r.stderr}`);

const report = loadJson(join(root, 'artifacts', 'corruption-report.json'));
assert.equal(report.fail_closed, true);
assert.ok(report.scenarios.length >= 20, 'at least 20 corruption scenarios (M2.6: C01–C20)');
for (const s of report.scenarios) assert.equal(s.caught, true, `${s.name} caught`);

// the patch's headline scenarios must be covered
const names = report.scenarios.map((s) => s.name).join(' ');
for (const needle of ['fact_e1_downgraded', 'bracket_typology', 'roof_typology', 'omitted_positions',
  'commercial_safe', 'forbidden_claim', 'without_segment_locator', 'academic_article_cited_as_E1', 'pdf_copied_into_web_public', 'h1_kim_citations_removed',
  // M2.6 silhouette overclaim drills
  'roof_typology_assigned_to_proxy_envelope', 'proxy_column_height_measured_e1',
  'bracket_typology_assigned_to_proxy', 'omitted_zone_filled_with_confident_columns',
  'source_image_copied_into_web_public']) {
  assert.ok(names.includes(needle), `scenario ${needle} present`);
}
console.log('corruption.test: PASS');
