import assert from 'node:assert/strict';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { existsSync, readdirSync } from 'node:fs';
import { join } from 'node:path';
import { loadAll } from '../scripts/lib/io.mjs';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const { sources, segments, features, hypotheses } = loadAll(root);
const KIM = 'kim_2023_sillasahakbo_a_building_structure_function';

// Kim source is attached/local, no longer missing
const kim = sources.find((s) => s.id === KIM);
assert.equal(kim.missing_source, false, 'Kim upgraded from missing_source');
assert.equal(kim.attachment_available, true);
assert.equal(kim.local_available, true);
assert.equal(kim.license, 'unknown', 'license stays unknown until independently verified');
assert.equal(kim.public_asset_allowed, false);

// Kim segments exist with locators
const kimSegs = segments.filter((s) => s.source_id === KIM);
assert.ok(kimSegs.length >= 6, `>=6 Kim segments (${kimSegs.length})`);
for (const s of kimSegs) assert.ok(s.locator.page != null, `${s.id}: locator`);

// H1 cites Kim with page locators
const h1 = hypotheses.find((h) => h.id === 'H1_royal_formal_space');
const kimEvs = h1.supporting_evidence.filter((ev) => ev.source_id === KIM);
assert.ok(kimEvs.length >= 2, 'H1 cites Kim 2023');
assert.ok(kimEvs.some((ev) => /\d/.test(String(ev.locator?.page))), 'Kim citation has page locator');

// Kim never backs geometry alone, never E1
for (const f of features) {
  for (const ev of f.geometry_layer.evidence) assert.notEqual(ev.source_id, KIM, `${f.id}: Kim not a geometry source`);
  for (const ev of f.fact_layer.evidence) {
    if (ev.source_id === KIM) assert.notEqual(ev.class, 'E1', `${f.id}: Kim never E1`);
  }
}

// no Kim-derived files in web/public
const pub = join(root, 'web', 'public');
if (existsSync(pub)) {
  const walk = (d) => readdirSync(d, { withFileTypes: true }).flatMap((e) =>
    e.isDirectory() ? walk(join(d, e.name)) : [join(d, e.name)]);
  for (const f of walk(pub)) assert.ok(!f.toLowerCase().includes('kim'), `no Kim asset: ${f}`);
}
console.log('kim2023-h1.test: PASS');
