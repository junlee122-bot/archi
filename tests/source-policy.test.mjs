import assert from 'node:assert/strict';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { loadAll } from '../scripts/lib/io.mjs';
import { isInternalRuleSource, usedSourceIds } from '../scripts/lib/model.mjs';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const corpus = loadAll(root);
const { sources, features } = corpus;
const byId = new Map(sources.map((s) => [s.id, s]));

// source-specific license: every source carries its own license + verification flag
for (const s of sources) {
  assert.equal(typeof s.license, 'string', `${s.id}: license`);
  assert.equal(typeof s.license_verified, 'boolean', `${s.id}: license_verified`);
}

// 2018 report: Type-1 recorded per official page; 2022 candidate stays to_verify
const r2018 = byId.get('nrich_2018_a_building_restoration_excavation_report');
assert.ok(r2018.license.includes('제1유형'));
assert.equal(r2018.license_verified, true);
const r2022 = byId.get('gyeongju_2022_a_building_full_excavation_report');
assert.equal(r2022.license, 'to_verify');
assert.equal(r2022.priority, 'P0');

// unverified 2022 P0 candidate must not be cited by any evidence yet
const used = usedSourceIds(corpus);
assert.ok(!used.has(r2022.id), '2022 candidate is registry-only until verified');

// internal demo rule never backs factual E1–E4 claims
for (const f of features) {
  for (const ev of [...f.fact_layer.evidence, ...f.geometry_layer.evidence]) {
    const src = byId.get(ev.source_id);
    if (isInternalRuleSource(src)) {
      assert.ok(['DEMO', 'E5'].includes(ev.class), `${f.id}: demo rule cited as ${ev.class}`);
    }
  }
}

// press/official 2025 interpretation is never a geometry source
for (const f of features) {
  for (const ev of f.geometry_layer.evidence) {
    assert.notEqual(ev.source_id, 'khs_2025_silla_capital_10year_outcome', `${f.id}: 2025 해석 소스는 geometry에 사용 금지`);
  }
}

// academic articles are never cited for exact geometry values either
for (const f of features) {
  for (const ev of f.geometry_layer.evidence) {
    const src = byId.get(ev.source_id);
    assert.ok(src.type === 'internal_rule' || ev.method === 'measured',
      `${f.id}: geometry evidence는 internal placeholder 또는 measured locator만 허용 (${ev.source_id})`);
  }
}

console.log('source-policy.test: PASS');
