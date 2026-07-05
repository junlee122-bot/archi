// ingest-placeholder.mjs — verifies that every source used by feature evidence
// has at least one source segment; with --write, creates skeleton segments for
// any that are missing (marked text_status=placeholder_pending_ingest).
import { fileURLToPath } from 'node:url';
import { repoRootFromArgs, hasFlag, loadAll, saveJson, paths } from './lib/io.mjs';

export function main(argv = process.argv.slice(2)) {
  const root = repoRootFromArgs(argv);
  const { sources, segments, features } = loadAll(root);
  const covered = new Set(segments.map((s) => s.source_id));
  const usedByFacts = new Set();
  for (const f of features) {
    for (const ev of f.fact_layer?.evidence ?? []) usedByFacts.add(ev.source_id);
  }
  const missing = sources.filter((s) => usedByFacts.has(s.id) && !covered.has(s.id) && s.type !== 'internal_rule');
  if (!missing.length) {
    console.log('ingest:placeholder — fact evidence에 쓰인 모든 외부 소스에 segment 존재');
    return;
  }
  for (const s of missing) console.log(`ingest:placeholder — segment 없음: ${s.id}`);
  if (hasFlag('--write', argv)) {
    const next = [...segments];
    for (const s of missing) {
      next.push({
        id: `seg_${s.id}_placeholder`,
        source_id: s.id,
        kind: 'placeholder',
        locator: { page: null, figure: null, note: 'placeholder — ingest 대기' },
        text_status: 'placeholder_pending_ingest',
        summary_ko: '(placeholder) 소스 ingest 전.',
        claims: []
      });
    }
    saveJson(paths.segments(root), next);
    console.log(`ingest:placeholder — ${missing.length} placeholder segment 생성`);
  } else {
    process.exit(1);
  }
}

if (process.argv[1] && fileURLToPath(import.meta.url) === process.argv[1]) main();
