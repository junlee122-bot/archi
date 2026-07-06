import assert from 'node:assert/strict';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { loadAll } from '../scripts/lib/io.mjs';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const { segments, sources } = loadAll(root);
const srcIds = new Set(sources.map((s) => s.id));

const REQUIRED = [
  // 2022 report
  'seg_report2022_notes_measurement_policy_p3',
  'seg_report2022_preface_authority_p5_6',
  'seg_report2022_survey_history_p17',
  'seg_report2022_a_building_overview_p84',
  'seg_report2022_jeoksim_entrances_p85',
  'seg_report2022_west_wing_corridor_plan_p107_110',
  'seg_report2022_discussion_features_p306_312',
  'seg_report2022_report_authorship_p21',
  // Lee 2023
  'seg_lee2023_legacy_theory_p245_246',
  'seg_lee2023_scale_critique_p245',
  'seg_lee2023_inner_column_and_royal_space_p246',
  'seg_lee2023_research_history_p247',
  'seg_lee2023_recent_discussion_tasks_p259_263',
  // Ji 2023
  'seg_ji2023_multistage_land_preparation_p855',
  'seg_ji2023_trench_layers_p857',
  'seg_ji2023_boto_facility_p859',
  'seg_ji2023_dongji_discussion_p867_876',
  // Kim 2023
  'seg_kim2023_abstract_core_p161_162',
  'seg_kim2023_research_scope_p163_166',
  'seg_kim2023_location_map_p167',
  'seg_kim2023_excavation_characteristics_table_p168',
  'seg_kim2023_spec_table_p169',
  'seg_kim2023_conclusion_royal_space_p202'
];

const byId = new Map(segments.map((s) => [s.id, s]));
for (const id of REQUIRED) assert.ok(byId.has(id), `required segment ${id}`);

for (const s of segments) {
  assert.ok(srcIds.has(s.source_id), `${s.id}: source_id valid`);
  assert.ok(s.locator && s.locator.page != null, `${s.id}: page locator`);
  const len = String(s.summary_ko ?? '').length;
  assert.ok(len > 0, `${s.id}: summary_ko present`);
  assert.ok(len <= 500, `${s.id}: summary_ko short paraphrase (${len} chars)`);
  assert.ok(!/[「『][^」』]{120,}[」』]/.test(s.summary_ko), `${s.id}: no long quotation`);
}
console.log(`source-segments.test: PASS (${segments.length} segments, ${REQUIRED.length} required ids)`);
