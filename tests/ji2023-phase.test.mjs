import assert from 'node:assert/strict';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { loadAll } from '../scripts/lib/io.mjs';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const { phases, features } = loadAll(root);
const JI = 'ji_2023_wolji_west_land_preparation_recheck';

for (const pid of ['P0_pre_wolji_wetland_and_prior_use', 'P1_late_5c_prior_land_preparation']) {
  const p = phases.find((x) => x.id === pid);
  assert.ok(p, `${pid} exists`);
  assert.ok(p.sources.includes(JI), `${pid} cites Ji 2023`);
}
assert.ok(phases.find((p) => p.id === 'P4_late_use_and_discard_context').visible_features.includes('artifact.discard_phase_context'));

const prior = features.find((f) => f.id === 'land_preparation.prior_phase_candidate');
assert.ok(prior, 'prior land preparation feature exists');
const boto = features.find((f) => f.id === 'land_preparation.boto_facility');
assert.ok(boto, 'boto facility feature (renamed) exists');

// Dongji context must never be presented as E1/E2 fact
const dongji = features.find((f) => f.id === 'context.pre_wolji_dongji');
assert.ok(dongji, 'pre-Wolji Dongji context feature exists');
assert.ok(['E4', 'E5'].includes(dongji.fact_layer.confidence), `Dongji is ${dongji.fact_layer.confidence}, not E1/E2`);
console.log('ji2023-phase.test: PASS');
