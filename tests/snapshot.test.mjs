import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { buildSpec } from '../scripts/derive.mjs';
import { loadJson, paths, stableStringify } from '../scripts/lib/io.mjs';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');

// deterministic build: two derivations are byte-identical
const a = buildSpec(root);
const b = buildSpec(root);
assert.equal(stableStringify(a), stableStringify(b), 'derive must be deterministic');

// snapshot artifact matches the current spec on disk
const snap = spawnSync(process.execPath, [join(root, 'scripts', 'snapshot-artifacts.mjs')], { cwd: root, encoding: 'utf8' });
assert.equal(snap.status, 0, snap.stderr);
const spec = loadJson(paths.spec(root));
const hashes = loadJson(join(paths.artifacts(root), 'snapshot', 'hashes.json'));
assert.equal(hashes.integrity, spec.meta.integrity);
assert.equal(hashes.spec_version, spec.meta.spec_version);

// in-memory rebuild agrees with the sealed artifact
assert.equal(a.meta.integrity, spec.meta.integrity, 'spec on disk is fresh');

console.log('snapshot.test: PASS');
