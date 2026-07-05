// Records content hashes of derived artifacts for determinism tracking.
import { fileURLToPath } from 'node:url';
import { join } from 'node:path';
import { repoRootFromArgs, loadJson, saveJson, paths, sha256File, fileExists } from './lib/io.mjs';

export function main(argv = process.argv.slice(2)) {
  const root = repoRootFromArgs(argv);
  if (!fileExists(paths.spec(root))) {
    console.error('snapshot: structural-spec.json 없음');
    process.exit(1);
  }
  const spec = loadJson(paths.spec(root));
  const snapshot = {
    spec_version: spec.meta.spec_version,
    integrity: spec.meta.integrity,
    input_hashes: spec.meta.input_hashes,
    artifact_hashes: {
      'structural-spec.json': sha256File(paths.spec(root))
    }
  };
  saveJson(join(paths.artifacts(root), 'snapshot', 'hashes.json'), snapshot);
  console.log(`snapshot: integrity=${spec.meta.integrity.slice(0, 16)}…`);
}

if (process.argv[1] && fileURLToPath(import.meta.url) === process.argv[1]) main();
