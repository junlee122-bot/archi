import { fileURLToPath } from 'node:url';
import { join } from 'node:path';
import { writeFileSync, mkdirSync } from 'node:fs';
import { repoRootFromArgs, loadJson, paths, fileExists } from './lib/io.mjs';

export function main(argv = process.argv.slice(2)) {
  const root = repoRootFromArgs(argv);
  if (!fileExists(paths.spec(root))) {
    console.error('evidence report: structural-spec.json 없음 — derive 먼저 실행');
    process.exit(1);
  }
  const spec = loadJson(paths.spec(root));
  const lines = [];
  lines.push('# Evidence Report — 경주 동궁과 월지 서편 A건물지');
  lines.push('');
  lines.push('사실(fact) confidence와 표시(render) confidence는 별개다. 아래 표의 geometry는 모두 발굴유구 기반 표시이며, DEMO는 시각화용 상대 placeholder를 뜻한다.');
  lines.push('');
  lines.push('## 사실 layer가 E1(공식 보고 사실)인 feature');
  lines.push('');
  for (const f of spec.features.filter((x) => x.confidence === 'E1')) {
    lines.push(`- **${f.id}** — ${f.fact_layer.statement_ko}`);
  }
  lines.push('');
  lines.push('## 전체 feature: fact vs render confidence');
  lines.push('');
  lines.push('| feature | fact | render | geometry 상태 |');
  lines.push('|---|---|---|---|');
  for (const f of spec.features) {
    const g = f.render_confidence === 'DEMO' ? '상대 placeholder (실측 아님)' : f.geometry_layer.type === 'non-spatial' ? '공간 지오메트리 없음' : f.geometry_layer.type;
    lines.push(`| ${f.id} | ${f.confidence} | ${f.render_confidence} | ${g} |`);
  }
  lines.push('');
  lines.push('## DEMO / 상대 geometry placeholder 목록');
  lines.push('');
  for (const f of spec.features.filter((x) => x.render_confidence === 'DEMO')) {
    lines.push(`- **${f.id}** (${f.geometry_layer.type}) — ${(f.warnings ?? []).join(' / ')}`);
  }
  lines.push('');
  lines.push('## 미확정(소스 locator 필요) 항목');
  lines.push('');
  lines.push('- 칸 간격(bay spacing), 좌표, 기단 높이, 초석 치수, 감주 정확 위치, 보도 타일 모듈: 전부 null — PDF/도면 ingest 후 확정 (source required).');
  lines.push('- 지붕 형식·공포 양식: 이 사이트에 지정하지 않는다 (unresolved).');
  lines.push('');
  mkdirSync(paths.reportsDir(root), { recursive: true });
  writeFileSync(join(paths.reportsDir(root), 'evidence-report.md'), lines.join('\n') + '\n');
  console.log(`evidence report written (${spec.features.length} features)`);
}

if (process.argv[1] && fileURLToPath(import.meta.url) === process.argv[1]) main();
