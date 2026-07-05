import { readFileSync, writeFileSync, mkdirSync, existsSync } from 'node:fs';
import { createHash } from 'node:crypto';
import { dirname, resolve, join } from 'node:path';
import { fileURLToPath } from 'node:url';

export function repoRootFromArgs(argv = process.argv.slice(2)) {
  const i = argv.indexOf('--root');
  if (i >= 0 && argv[i + 1]) return resolve(argv[i + 1]);
  // scripts/lib/io.mjs -> repo root is two levels up
  return resolve(dirname(fileURLToPath(import.meta.url)), '..', '..');
}

export function hasFlag(flag, argv = process.argv.slice(2)) {
  return argv.includes(flag);
}

export function loadJson(path) {
  return JSON.parse(readFileSync(path, 'utf8'));
}

export function saveJson(path, value) {
  mkdirSync(dirname(path), { recursive: true });
  writeFileSync(path, JSON.stringify(value, null, 2) + '\n');
}

export function fileExists(path) {
  return existsSync(path);
}

// Deterministic serialization: object keys sorted, arrays in order.
export function stableStringify(value) {
  if (value === null || typeof value !== 'object') return JSON.stringify(value);
  if (Array.isArray(value)) return '[' + value.map(stableStringify).join(',') + ']';
  const keys = Object.keys(value).sort();
  return '{' + keys.map((k) => JSON.stringify(k) + ':' + stableStringify(value[k])).join(',') + '}';
}

export function sha256(text) {
  return createHash('sha256').update(text).digest('hex');
}

export function sha256File(path) {
  return createHash('sha256').update(readFileSync(path)).digest('hex');
}

export const paths = {
  params: (root) => join(root, 'params', 'target-site.json'),
  sources: (root) => join(root, 'data', 'sources.json'),
  segments: (root) => join(root, 'data', 'source-segments.json'),
  features: (root) => join(root, 'data', 'canonical-features.json'),
  hypotheses: (root) => join(root, 'data', 'hypotheses.json'),
  phases: (root) => join(root, 'data', 'phases.json'),
  scoutFindings: (root) => join(root, 'data', 'source-scout-findings.json'),
  artifacts: (root) => join(root, 'artifacts'),
  spec: (root) => join(root, 'artifacts', 'structural-spec.json'),
  verification: (root) => join(root, 'artifacts', 'verification-report.json'),
  reportsDir: (root) => join(root, 'artifacts', 'reports'),
  web: (root) => join(root, 'web')
};

export function loadAll(root) {
  return {
    params: loadJson(paths.params(root)),
    sources: loadJson(paths.sources(root)),
    segments: loadJson(paths.segments(root)),
    features: loadJson(paths.features(root)),
    hypotheses: loadJson(paths.hypotheses(root)),
    phases: loadJson(paths.phases(root))
  };
}

export const DATA_FILES = [
  ['params/target-site.json', paths.params],
  ['data/sources.json', paths.sources],
  ['data/source-segments.json', paths.segments],
  ['data/canonical-features.json', paths.features],
  ['data/hypotheses.json', paths.hypotheses],
  ['data/phases.json', paths.phases]
];
