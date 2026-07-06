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

// E1 facts are not downgraded by placeholder/scaled geometry
const grid = spec.features.find((f) => f.id === params.target_site.grid_feature_id);
assert.equal(grid.confidence, 'E1', 'grid fact stays E1');
assert.equal(grid.render_confidence, 'E3', 'grid geometry scaled from report dims + Kim cross-check (E3), not exact');
assert.equal(grid.geometry_layer.geometry_mode, 'report_dimension_scaled');
assert.equal(grid.geometry_layer.bay_spacing_front_mm, null, 'bay spacing stays null');
const e1Ids = spec.features.filter((f) => f.confidence === 'E1').map((f) => f.id);
for (const id of [
  'layout.grid.seven_by_four', 'layout.omitted_inner_columns', 'foundation.jeoksim_grid',
  'entrance.south.left', 'entrance.south.right', 'entrance.north.center',
  'corridor.east_wing', 'corridor.west_wing', 'corridor.west_corridor',
  'corridor.west_corridor_stone_platform', 'walkway.drainage_or_paved_facility',
  'ritual.earthquake_charm', 'trench.north', 'stratigraphy.layers',
  'surrounding.south_line_foundation.building.01', 'surrounding.south_line_foundation.building.02'
]) {
  assert.ok(e1Ids.includes(id), `${id} must be E1 (report-backed fact)`);
}

// M1.5 derived blocks: report-dimension-scaled footprint, jeoksim pads,
// stratigraphy section, entrance layout
const rds = spec.derived.report_dimension_scaled;
assert.equal(rds.length_m, grid.fact_layer.report_length_m);
assert.equal(rds.width_m, grid.fact_layer.report_width_m);
assert.equal(rds.subdivision_assumed, true);
const pads = spec.derived.jeoksim_pads;
assert.equal(pads.pads.length, (grid.fact_layer.bays_front + 1) * (grid.fact_layer.bays_side + 1));
assert.equal(pads.render_confidence, 'DEMO', 'pad positions stay symbolic');
assert.deepEqual(pads.pads[0].diameter_range_cm, [220, 280], 'pad size range from report p.85');
const strat = spec.derived.stratigraphy_section;
assert.ok(strat.layers.length >= 8, '8 macro-layers in section');
const ent = spec.derived.entrance_layout;
assert.deepEqual(ent.south.sort(), ['entrance.south.left', 'entrance.south.right']);
assert.deepEqual(ent.north, ['entrance.north.center']);
assert.deepEqual(ent.dapdo_on.sort(), ['entrance.south.left', 'entrance.south.right'], 'dapdo on south entrances only');

// symbolic columns derive from bay counts, not hardcode
const sg = spec.derived.symbolic_column_grid;
assert.equal(sg.columns_along_front, grid.fact_layer.bays_front + 1);
assert.equal(sg.columns_along_side, grid.fact_layer.bays_side + 1);
assert.equal(sg.is_excavated_positions, false);
assert.ok(['DEMO', 'E5'].includes(sg.render_confidence));

// mode tabs come from params template
assert.deepEqual(spec.derived.mode_tabs, expandModeTabs(params));
assert.equal(spec.derived.mode_tabs.length, 9, 'M2.5 nine mode tabs');
assert.ok(spec.derived.mode_tabs.includes('제원/그리드'));

// license gate propagated
assert.equal(spec.license_audit.commercial_safe, false, 'unverified sources keep commercial_safe=false');
assert.ok(spec.warnings.length > 0, 'to_verify warnings surfaced');

// axis model is not mutually exclusive
assert.equal(spec.derived.hypothesis_axis_model.mutually_exclusive, false);

assert.ok(spec.meta.integrity.length === 64, 'integrity hash present');
console.log('derive.test: PASS');
