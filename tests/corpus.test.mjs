import assert from 'node:assert/strict';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { loadAll } from '../scripts/lib/io.mjs';
import { CLASS_RANK } from '../scripts/lib/model.mjs';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const { params, features } = loadAll(root);
const ids = new Set(features.map((f) => f.id));

// scale + required P0 coverage
assert.ok(features.length >= 30, `canonical features ${features.length} >= 30`);
assert.equal(params.required_p0_features.length, 44, 'M1.5 adds 7 locator-backed P0 features');
for (const id of params.required_p0_features) assert.ok(ids.has(id), `P0 feature ${id}`);

// two-layer structure everywhere, with independent confidence
for (const f of features) {
  assert.ok(f.fact_layer && typeof f.fact_layer === 'object', `${f.id}: fact_layer`);
  assert.ok(f.geometry_layer && typeof f.geometry_layer === 'object', `${f.id}: geometry_layer`);
  assert.ok(f.fact_layer.confidence in CLASS_RANK);
  assert.ok(f.geometry_layer.confidence in CLASS_RANK);
  assert.notEqual(f.fact_layer.confidence, 'DEMO', `${f.id}: fact layer can never be DEMO`);
  assert.ok(Array.isArray(f.warnings), `${f.id}: warnings`);
}

// exact dimensions stay null until a measured locator exists
for (const f of features) {
  const visit = (node, path) => {
    if (node == null || typeof node !== 'object') return;
    for (const [k, v] of Object.entries(node)) {
      if (/(_mm|_coordinates)$/.test(k)) assert.equal(v, null, `${f.id}.${path}${k} must be null (source locator 필요)`);
      if (typeof v === 'object') visit(v, `${path}${k}.`);
    }
  };
  visit(f.geometry_layer, '');
}

// superstructure = ghost only, typology unassigned
for (const f of features.filter((x) => x.id.startsWith('superstructure.'))) {
  assert.equal(f.geometry_layer.ghost, true, `${f.id}: ghost`);
  assert.equal(f.render_confidence, 'DEMO');
}
const roof = features.find((f) => f.id === 'superstructure.roof_mass.ghost');
assert.equal(roof.geometry_layer.roof_type, null);
assert.equal(roof.geometry_layer.bracket_typology, null);

// omitted columns: E1 fact, symbolic-only geometry
const omitted = features.find((f) => f.id === 'layout.omitted_inner_columns');
assert.equal(omitted.fact_layer.confidence, 'E1');
assert.equal(omitted.geometry_layer.omitted_positions, null);
assert.equal(omitted.ui_flags.not_exact_positions, true);

console.log('corpus.test: PASS');
