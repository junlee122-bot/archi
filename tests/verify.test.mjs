import assert from 'node:assert/strict';
import { cpSync, mkdirSync, rmSync, readFileSync } from 'node:fs';
import { spawnSync } from 'node:child_process';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { runChecks } from '../scripts/verify.mjs';
import { loadJson, saveJson, paths } from '../scripts/lib/io.mjs';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');

// default mode: everything green (warnings allowed)
const report = runChecks(root);
assert.equal(report.ok, true, 'default verify must pass');
assert.equal(report.summary.fail, 0);
assert.equal(report.summary.total, 50, 'V01–V50 all present');

// strict mode: unresolved locators/licenses escalate to failures (roadmap gate)
const strictReport = runChecks(root, { strict: true });
assert.equal(strictReport.ok, false, 'strict must fail while to_verify sources remain');

// GENERICITY (patch F): transpose the site to 5×3 — verifier must still pass,
// proving no hardcoded 7×4 inside check code.
const tmp = join(root, 'artifacts', 'test-tmp', 'generic-5x3');
rmSync(tmp, { recursive: true, force: true });
mkdirSync(tmp, { recursive: true });
cpSync(join(root, 'params'), join(tmp, 'params'), { recursive: true });
cpSync(join(root, 'data'), join(tmp, 'data'), { recursive: true });
cpSync(join(root, 'artifacts', 'preview'), join(tmp, 'artifacts', 'preview'), { recursive: true });

const p = loadJson(paths.params(tmp));
p.target_site.expected_bays_front = 5;
p.target_site.expected_bays_side = 3;
saveJson(paths.params(tmp), p);
const feats = loadJson(paths.features(tmp));
const grid = feats.find((f) => f.id === p.target_site.grid_feature_id);
grid.fact_layer.bays_front = 5;
grid.fact_layer.bays_side = 3;
grid.geometry_layer.relative_width = 5;
grid.geometry_layer.relative_depth = 3;
saveJson(paths.features(tmp), feats);

const derive = spawnSync(process.execPath, [join(root, 'scripts', 'derive.mjs'), '--root', tmp], { encoding: 'utf8' });
assert.equal(derive.status, 0, `derive on 5×3 fixture: ${derive.stderr}`);
const verify = spawnSync(process.execPath, [join(root, 'scripts', 'verify.mjs'), '--root', tmp], { encoding: 'utf8' });
assert.equal(verify.status, 0, `verify on 5×3 fixture must pass (no hardcoded 7×4): ${verify.stdout}`);
const fixtureSpec = loadJson(paths.spec(tmp));
assert.equal(fixtureSpec.derived.symbolic_column_grid.columns_along_front, 6);
assert.equal(fixtureSpec.derived.symbolic_column_grid.columns_along_side, 4);
assert.ok(fixtureSpec.derived.mode_tabs.includes('5×3칸 그리드'), 'tabs derive from params');

// verifier source must not embed the target bay counts as literals
const verifySrc = readFileSync(join(root, 'scripts', 'verify.mjs'), 'utf8');
assert.ok(!/bays_front\s*[!=]==?\s*7/.test(verifySrc), 'no hardcoded bays_front=7');
assert.ok(!/bays_side\s*[!=]==?\s*4/.test(verifySrc), 'no hardcoded bays_side=4');
assert.ok(!verifySrc.includes('7_BY_4'), 'old V05_GRID_7_BY_4 removed');

console.log('verify.test: PASS');
