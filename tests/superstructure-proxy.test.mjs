// M2.6 — constrained superstructure silhouette: corpus + spec invariants.
import assert from 'node:assert/strict';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { loadJson } from '../scripts/lib/io.mjs';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const params = loadJson(join(root, 'params', 'target-site.json'));
const features = loadJson(join(root, 'data', 'canonical-features.json'));
const spec = loadJson(join(root, 'artifacts', 'structural-spec.json'));

const cfg = params.superstructure_proxy;
assert.ok(cfg, 'params.superstructure_proxy present');

const byId = new Map(features.map((f) => [f.id, f]));
const allIds = [
  ...cfg.proxy_feature_ids,
  ...cfg.material_context_feature_ids,
  ...cfg.helper_feature_ids,
  ...cfg.uncertainty_feature_ids
];

// every proxy/material/helper/uncertainty feature exists with both layers
for (const id of allIds) {
  const f = byId.get(id);
  assert.ok(f, `feature ${id} exists in canonical corpus`);
  assert.ok(f.fact_layer && f.fact_layer.statement_ko, `${id} has fact_layer`);
  assert.ok(f.geometry_layer && f.geometry_layer.type, `${id} has geometry_layer`);
  assert.ok(Array.isArray(f.fact_layer.evidence) && f.fact_layer.evidence.length > 0, `${id} provenance non-empty`);
}

// render confidence: E5/DEMO only — never E1 geometry
for (const id of [...cfg.proxy_feature_ids, ...cfg.material_context_feature_ids, ...cfg.helper_feature_ids]) {
  const f = byId.get(id);
  assert.ok(['E5', 'DEMO'].includes(f.geometry_layer.confidence), `${id} render confidence E5/DEMO (got ${f.geometry_layer.confidence})`);
  // superstructure proxies never claim E1 facts (no direct upper-structure remains);
  // material-context facts MAY be E1 — they are report-stated artifacts.
  if (id.startsWith('superstructure.proxy')) {
    assert.notEqual(f.fact_layer.confidence, 'E1', `${id} proxy fact never E1`);
  }
}
// material context facts may be E1 (report-stated artifacts) — but geometry stays DEMO
for (const id of cfg.material_context_feature_ids) {
  const f = byId.get(id);
  assert.equal(f.geometry_layer.confidence, 'DEMO', `${id} material marker geometry DEMO`);
  assert.equal(f.render_layer, 'material_context');
}

// no typology / no measured height anywhere in proxy geometry
for (const id of cfg.proxy_feature_ids) {
  const g = byId.get(id).geometry_layer;
  for (const key of ['roof_typology', 'roof_type', 'bracket_typology']) {
    if (key in g) assert.equal(g[key], null, `${id}.${key} must be null`);
  }
  for (const [k, v] of Object.entries(g)) {
    if (/(height|diameter)_(m|mm|cm)$/.test(k)) assert.equal(v, null, `${id}.${k} must be null (scene presets only)`);
  }
}
const posts = byId.get('superstructure.proxy.column_posts');
assert.equal(posts.geometry_layer.height_mode, 'preset_not_measured');

// not_usable_for covers the constitution
for (const id of cfg.proxy_feature_ids) {
  const nu = byId.get(id).not_usable_for ?? [];
  for (const k of ['roof_typology', 'bracket_typology', 'original_appearance']) {
    assert.ok(nu.includes(k), `${id} not_usable_for includes ${k}`);
  }
}

// helper is declared a UI helper, not archaeology
const helper = byId.get('scale_helper.human_silhouette');
assert.equal(helper.ui_flags.ui_helper, true);
assert.equal(helper.archaeological_status, 'ui_helper_not_archaeological');

// derived spec block: presets in scene units, omitted zone never filled
const ps = spec.derived.proxy_superstructure;
assert.ok(ps, 'spec.derived.proxy_superstructure present');
assert.equal(ps.default_visible, false, 'proxy hidden by default');
assert.ok(!ps.mode_visible.includes('발굴유구'), 'archaeology mode untouched');
assert.equal(ps.height_presets.unit, 'scene_units_not_measured');
assert.equal(ps.policy.roof_typology, null);
assert.equal(ps.policy.bracket_typology, null);
assert.equal(ps.policy.column_height_measured, false);
assert.equal(ps.policy.is_reconstruction, false);
assert.equal(ps.omitted_zone.filled, false);
const omitted = ps.column_positions.filter((p) => p.in_omitted_zone);
assert.ok(omitted.length >= 4, 'symbolic omitted slots present');
for (const p of omitted) assert.equal(p.style, 'absent_slot', 'omitted zone renders absent slots, not posts');

console.log('superstructure-proxy.test: PASS');
