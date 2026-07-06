import assert from 'node:assert/strict';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { buildSpec } from '../scripts/derive.mjs';
import { loadJson, paths } from '../scripts/lib/io.mjs';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const params = loadJson(paths.params(root));
const hypotheses = loadJson(paths.hypotheses(root));
const spec = buildSpec(root);

// axis model: every hypothesis declares a permitted axis
for (const h of hypotheses) {
  assert.ok(params.required_axes.includes(h.axis), `${h.id}: axis declared`);
  assert.ok(h.counter_evidence.length > 0, `${h.id}: counter-evidence forced`);
}

const h1 = hypotheses.find((h) => h.id === 'H1_royal_formal_space');
const h2 = hypotheses.find((h) => h.id === 'H2_prince_palace_legacy_interpretation');
const h3 = hypotheses.find((h) => h.id === 'H3_ritual_audience_banquet_program');

// rebalance: H1 strongest (E4, spatial axis), H2 weakened legacy (E5), H3 functional axis (E5)
assert.equal(h1.axis, 'spatial_political_attribution');
assert.equal(h1.confidence, 'E4');
assert.equal(params.hypothesis_rules.strongest_hypothesis, h1.id);
assert.equal(h2.axis, 'historiography');
assert.equal(h2.confidence, 'E5');
assert.equal(h2.ui_treatment.legacy_badge, true, 'H2 legacy badge');
assert.ok(h2.ui_treatment.legacy_badge_label_ko.length > 0);
assert.equal(h3.axis, 'functional_program');
assert.deepEqual(h3.requires_features, ['context.wolji_water_edge', 'context.pre_wolji_dongji'],
  'H3 gated on Wolji AND pre-Wolji water context');

// M1.5: H2 must carry Lee 2023 backing on both sides (V45)
assert.ok(h2.supporting_evidence.some((ev) => ev.source_id === 'lee_2023_donggung_wolji_character_debate'));
assert.ok(h2.counter_evidence.some((ev) => ev.source_id === 'lee_2023_donggung_wolji_character_debate'));
// H1 backed by 2022 report and Lee 2023 with page locators, never "confirmed"
assert.ok(h1.supporting_evidence.some((ev) => ev.source_id === 'gyeongju_2022_a_building_full_excavation_report' && /\d/.test(String(ev.locator?.page))));
assert.ok(h1.supporting_evidence.some((ev) => ev.source_id === 'lee_2023_donggung_wolji_character_debate' && /\d/.test(String(ev.locator?.page))));
assert.ok(!h1.summary_ko.includes('확정'), 'H1 never phrased as confirmed');

// spec-side badges and gating
const s1 = spec.hypotheses.find((h) => h.id === h1.id);
const s2 = spec.hypotheses.find((h) => h.id === h2.id);
const s3 = spec.hypotheses.find((h) => h.id === h3.id);
assert.equal(s1.badges.strongest, true);
assert.equal(s2.badges.legacy, true);
assert.equal(s3.renderable, true, 'water edge present → H3 renderable');
for (const s of [s1, s2, s3]) assert.ok(s.axis_label_ko.length > 0, 'axis label rendered');
assert.equal(spec.derived.hypothesis_axis_model.mutually_exclusive, false, 'not three exclusive answers');

// H1 must not be presented as exact original reconstruction: its warning text
// negates a definitive reconstruction and superstructure stays translucent ghost.
assert.ok(h1.ui_treatment.warning.includes('아니다'), 'H1 warning negates definitive reconstruction');
assert.ok(h1.ui_treatment.superstructure_opacity <= 0.2, 'ghost opacity only');

console.log('hypothesis.test: PASS');
