import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import { existsSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { loadJson } from '../scripts/lib/io.mjs';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const dest = join(root, 'web', 'public', 'artifacts');

// stage artifacts (same script goal:web uses)
const copy = spawnSync(process.execPath, [join(root, 'scripts', 'copy-artifacts-to-web.mjs')], { cwd: root, encoding: 'utf8' });
assert.equal(copy.status, 0, copy.stderr);

for (const f of ['structural-spec.json', 'source-coverage.json', 'verifier-report.json', 'verification-report.json', 'corruption-report.json', 'sources.json']) {
  assert.ok(existsSync(join(dest, f)), `web/public/artifacts/${f} staged`);
}

const spec = loadJson(join(dest, 'structural-spec.json'));
const ids = new Set(spec.features.map((f) => f.id));
for (const id of [
  'layout.grid.seven_by_four', 'layout.omitted_inner_columns', 'foundation.jeoksim_grid',
  'entrance.south.left', 'entrance.south.right', 'entrance.north.center',
  'corridor.west_wing', 'corridor.west_corridor', 'corridor.west_corridor_stone_platform',
  'trench.north', 'stratigraphy.layers'
]) {
  assert.ok(ids.has(id), `spec includes ${id}`);
}
assert.equal(spec.hypotheses.length, 3);
assert.equal(spec.phases.length, 5);
assert.equal(spec.derived.report_dimension_scaled.length_m, 25.5);
assert.equal(spec.derived.report_dimension_scaled.width_m, 15.2);

// source coverage covers the four backed sources
const cov = loadJson(join(dest, 'source-coverage.json'));
const covIds = new Set(cov.sources.map((s) => s.id));
for (const sid of [
  'gyeongju_2022_a_building_full_excavation_report',
  'kim_2023_sillasahakbo_a_building_structure_function',
  'lee_2023_donggung_wolji_character_debate',
  'ji_2023_wolji_west_land_preparation_recheck'
]) {
  assert.ok(covIds.has(sid), `coverage includes ${sid}`);
}
console.log('viewer-artifact-smoke.test: PASS');
