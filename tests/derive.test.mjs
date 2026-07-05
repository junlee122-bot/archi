import assert from 'node:assert/strict';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { buildSpec } from '../scripts/derive.mjs';
import { loadJson, paths } from '../scripts/lib/io.mjs';
import { expandModeTabs } from '../scripts/lib/model.mjs';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const params = loadJson(paths.params(root));
const spec = buildSpec(root);

// fact/render confidence separation is preserved end-to-end
for (const f of spec.features) {
  assert.equal(f.confidence, f.fact_layer.confidence, `${f.id}: confidence mirrors fact_layer`);
  assert.equal(f.render_confidence, f.geometry_layer.confidence, `${f.id}: render mirrors geometry_layer`);
}

// E1 facts are not downgraded to DEMO by DEMO geometry
const grid = spec.features.find((f) => f.id === params.target_site.grid_feature_id);
assert.equal(grid.confidence, 'E1', 'grid fact stays E1');
assert.equal(grid.render_confidence, 'DEMO', 'grid geometry stays DEMO');
const e1Ids = spec.features.filter((f) => f.confidence === 'E1').map((f) => f.id);
for (const id of [
  'layout.grid.seven_by_four', 'layout.omitted_inner_columns',
  'entrance.facility.01', 'entrance.facility.02', 'entrance.facility.03',
  'corridor.east_wing', 'corridor.west_wing', 'walkway.brick_paved',
  'ritual.earthquake_charm',
  'surrounding.south_line_foundation.building.01', 'surrounding.south_line_foundation.building.02'
]) {
  assert.ok(e1Ids.includes(id), `${id} must be E1 (abstract-backed fact)`);
}

// symbolic columns derive from bay counts, not hardcode
const sg = spec.derived.symbolic_column_grid;
assert.equal(sg.columns_along_front, grid.fact_layer.bays_front + 1);
assert.equal(sg.columns_along_side, grid.fact_layer.bays_side + 1);
assert.equal(sg.is_excavated_positions, false);
assert.ok(['DEMO', 'E5'].includes(sg.render_confidence));

// mode tabs come from params template
assert.deepEqual(spec.derived.mode_tabs, expandModeTabs(params));
assert.ok(spec.derived.mode_tabs.some((t) => t.includes('칸 그리드')));

// license gate propagated
assert.equal(spec.license_audit.commercial_safe, false, 'unverified sources keep commercial_safe=false');
assert.ok(spec.warnings.length > 0, 'to_verify warnings surfaced');

// axis model is not mutually exclusive
assert.equal(spec.derived.hypothesis_axis_model.mutually_exclusive, false);

assert.ok(spec.meta.integrity.length === 64, 'integrity hash present');
console.log('derive.test: PASS');
