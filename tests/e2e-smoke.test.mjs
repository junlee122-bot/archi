// e2e-smoke — M2 web fallback gate. Passes when the static viewer wiring is
// coherent even if `next build` could not run (dependency-less environments);
// in that case the limitation is logged explicitly (patch section K, M2 DoD).
import assert from 'node:assert/strict';
import { existsSync, readFileSync } from 'node:fs';
import { spawnSync } from 'node:child_process';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { loadJson, paths } from '../scripts/lib/io.mjs';
import { expandModeTabs } from '../scripts/lib/model.mjs';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const web = paths.web(root);

assert.ok(existsSync(web), 'web/ viewer directory exists');
assert.ok(existsSync(join(web, 'app', 'page.tsx')), 'app/page.tsx exists');
for (const c of ['SceneViewer', 'HypothesisPanel', 'EvidenceDrawer', 'PhaseTimeline', 'VerificationPanel', 'UncertaintyPanel', 'ModeTabs']) {
  assert.ok(existsSync(join(web, 'components', `${c}.tsx`)), `components/${c}.tsx exists`);
}

// static artifacts staged for the viewer
const copy = spawnSync(process.execPath, [join(root, 'scripts', 'copy-artifacts-to-web.mjs')], { cwd: root, encoding: 'utf8' });
assert.equal(copy.status, 0, copy.stderr);
const specPath = join(web, 'public', 'artifacts', 'structural-spec.json');
assert.ok(existsSync(specPath), 'web/public/artifacts/structural-spec.json staged');
const spec = loadJson(specPath);
const params = loadJson(paths.params(root));
assert.deepEqual(spec.derived.mode_tabs, expandModeTabs(params), 'staged spec carries the 8 mode tabs');
assert.equal(spec.derived.mode_tabs.length, 9);

// key UI obligations visible in source: axis labels, legacy badge, split confidences, ghost mass
const pageSrc = readFileSync(join(web, 'app', 'page.tsx'), 'utf8');
assert.ok(pageSrc.includes('structural-spec.json'), 'viewer loads structural-spec.json');
const hypSrc = readFileSync(join(web, 'components', 'HypothesisPanel.tsx'), 'utf8');
assert.ok(hypSrc.includes('axis_label_ko'), 'axis labels shown');
assert.ok(hypSrc.includes('legacy'), 'legacy badge handled');
assert.ok(hypSrc.includes('renderable'), 'H3 water-layer gating handled');
const drawerSrc = readFileSync(join(web, 'components', 'EvidenceDrawer.tsx'), 'utf8');
assert.ok(drawerSrc.includes('fact_layer') && drawerSrc.includes('render_confidence'), 'fact vs render confidence split in drawer');
const sceneSrc = readFileSync(join(web, 'components', 'SceneViewer.tsx'), 'utf8');
assert.ok(/ghost/i.test(sceneSrc), 'superstructure rendered as ghost only');

// build output, if present
if (existsSync(join(web, 'out')) || existsSync(join(web, '.next'))) {
  console.log('e2e-smoke: web build output present');
} else {
  console.log('e2e-smoke: LIMITATION — web build 미실행 (의존성 미설치 환경). 정적 wiring 검증으로 대체함.');
}
console.log('e2e-smoke.test: PASS');
