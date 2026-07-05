// ingest-pdf.mjs — roadmap stub. When official report PDFs are available at
// sources[].local_path, this step extracts page/figure locators so exact
// dimensions can graduate from null to measured values. Until then it reports
// what is missing; --require turns that into a failure (strict roadmap gate).
import { fileURLToPath } from 'node:url';
import { repoRootFromArgs, hasFlag, loadJson, paths, fileExists } from './lib/io.mjs';

export function main(argv = process.argv.slice(2)) {
  const root = repoRootFromArgs(argv);
  const sources = loadJson(paths.sources(root));
  const reports = sources.filter((s) => s.type === 'excavation_report');
  let missing = 0;
  for (const s of reports) {
    if (s.local_path && fileExists(s.local_path)) {
      console.log(`ingest:pdf — ${s.id}: local PDF 존재 (${s.local_path}) — 파서 연결은 후속 마일스톤`);
    } else {
      console.log(`ingest:pdf — ${s.id}: local PDF 없음 (pdf_url=${s.pdf_url ?? 'null'})`);
      missing++;
    }
  }
  console.log(`ingest:pdf — ${missing}/${reports.length} report PDF 미확보. exact dimension은 null 유지 (source required).`);
  if (missing > 0 && hasFlag('--require', argv)) process.exit(1);
}

if (process.argv[1] && fileURLToPath(import.meta.url) === process.argv[1]) main();
