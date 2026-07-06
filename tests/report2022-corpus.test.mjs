import assert from 'node:assert/strict';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { loadAll } from '../scripts/lib/io.mjs';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const { features } = loadAll(root);
const by = (id) => features.find((f) => f.id === id);
const R22 = 'gyeongju_2022_a_building_full_excavation_report';
const cites22 = (f) => f.fact_layer.evidence.some((ev) => ev.source_id === R22 && /^\d/.test(String(ev.locator?.page ?? '')));

// report dimensions live in fact_layer with the required field names
const grid = by('layout.grid.seven_by_four');
assert.equal(grid.fact_layer.footprint_front_m, 25.5);
assert.equal(grid.fact_layer.footprint_side_m, 15.2);
assert.equal(grid.fact_layer.bays_front, 7);
assert.equal(grid.fact_layer.bays_side, 4);
assert.ok(cites22(grid), 'grid cites 2022 report with page');

const omitted = by('layout.omitted_inner_columns');
assert.equal(omitted.fact_layer.central_four_missing_jeoksim, true);
assert.ok(cites22(omitted), 'omitted columns cite 2022 report');

const jeoksim = by('foundation.jeoksim_grid');
assert.equal(jeoksim.fact_layer.jeoksim_depth_m, 2.04);
assert.deepEqual(jeoksim.fact_layer.jeoksim_width_range_m, [2.2, 2.8]);
assert.deepEqual(jeoksim.fact_layer.outer_bay_spacing_m, [3.8, 4.0]);
assert.equal(jeoksim.fact_layer.inner_bay_spacing_m, 3.5);
assert.ok(cites22(jeoksim), 'jeoksim dims cite 2022 report');

for (const id of ['entrance.south.left', 'entrance.south.right', 'entrance.north.center']) {
  assert.ok(cites22(by(id)), `${id} cites 2022 report`);
}
assert.ok(cites22(by('walkway.drainage_or_paved_facility')));
assert.ok(cites22(by('corridor.west_corridor_stone_platform')));
console.log('report2022-corpus.test: PASS');
