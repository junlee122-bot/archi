import assert from 'node:assert/strict';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { loadAll } from '../scripts/lib/io.mjs';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const { hypotheses } = loadAll(root);
const LEE = 'lee_2023_donggung_wolji_character_debate';

const h2 = hypotheses.find((h) => h.id === 'H2_prince_palace_legacy_interpretation');
assert.equal(h2.axis, 'historiography', 'H2 sits on the historiography axis');
assert.ok(h2.supporting_evidence.some((ev) => ev.source_id === LEE && /\d/.test(String(ev.locator?.page))),
  'H2 supported by Lee 2023 with page locator');
assert.ok(h2.counter_evidence.some((ev) => ev.source_id === LEE), 'H2 countered by Lee 2023');
assert.equal(h2.ui_treatment.legacy_badge, true, 'legacy/weakened badge');
assert.ok(h2.ui_treatment.legacy_badge_label_ko.length > 0);

const h1 = hypotheses.find((h) => h.id === 'H1_royal_formal_space');
assert.ok(h1.supporting_evidence.some((ev) => ev.source_id === LEE && /\d/.test(String(ev.locator?.page))),
  'H1 also cites Lee (royal-space possibility)');
console.log('lee2023-hypothesis.test: PASS');
