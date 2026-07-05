// extract-source-segments.mjs — validates segments against the registry and
// emits a derived segment index (claims per source) for the viewer/evidence UI.
import { fileURLToPath } from 'node:url';
import { join } from 'node:path';
import { repoRootFromArgs, loadAll, saveJson, paths } from './lib/io.mjs';

export function main(argv = process.argv.slice(2)) {
  const root = repoRootFromArgs(argv);
  const { sources, segments } = loadAll(root);
  const sourceIds = new Set(sources.map((s) => s.id));
  const errors = [];
  for (const seg of segments) {
    if (!sourceIds.has(seg.source_id)) errors.push(`${seg.id}: unknown source ${seg.source_id}`);
    if (!Array.isArray(seg.claims)) errors.push(`${seg.id}: claims 배열 필요`);
  }
  if (errors.length) {
    for (const e of errors) console.error('extract: ' + e);
    process.exit(1);
  }
  const index = segments.map((seg) => ({
    id: seg.id,
    source_id: seg.source_id,
    kind: seg.kind,
    text_status: seg.text_status,
    claim_count: seg.claims.length,
    locator: seg.locator
  }));
  saveJson(join(paths.artifacts(root), 'source-segments.derived.json'), { segments: index });
  console.log(`extract: ${segments.length} segment(s) indexed`);
}

if (process.argv[1] && fileURLToPath(import.meta.url) === process.argv[1]) main();
