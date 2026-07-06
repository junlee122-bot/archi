import { fileURLToPath } from 'node:url';
import { join } from 'node:path';
import { writeFileSync, mkdirSync } from 'node:fs';
import { repoRootFromArgs, loadJson, paths, fileExists } from './lib/io.mjs';

export function main(argv = process.argv.slice(2)) {
  const root = repoRootFromArgs(argv);
  if (!fileExists(paths.spec(root))) {
    console.error('phase report: structural-spec.json 없음 — derive 먼저 실행');
    process.exit(1);
  }
  const spec = loadJson(paths.spec(root));
  const lines = [];
  lines.push('# Phase Report — 지영배 2023 재검토 기반 단계 모델');
  lines.push('');
  lines.push('phase timeline은 장식이 아니다: 각 단계는 소스를 인용하며, 뷰어에서 해당 단계의 가시 layer를 바꾼다. 「유구 단계」는 보고 사실 중심, 「해석 단계」는 학술 해석 중심이다.');
  lines.push('');
  for (const p of spec.phases) {
    lines.push(`## ${p.id} — ${p.name_ko}`);
    lines.push('');
    lines.push(`- 단계 성격: **${p.stage_kind}** · confidence: **${p.confidence}**`);
    lines.push(`- 근거 소스: ${p.source_titles.join(' · ')}`);
    lines.push(`- 가시 feature: ${p.visible_features.join(', ')}`);
    if (p.stage_kind === '해석 단계') lines.push('- ⚠ 이 단계는 해석 단계이며 확정 유구 단계가 아니다.');
    lines.push(`- 비고: ${p.notes}`);
    lines.push('');
  }
  lines.push('## 단계 모델의 한계');
  lines.push('');
  lines.push('- 5세기 후엽 편년(P1)은 지영배 2023의 재검토 해석(E4)이며 확정 편년이 아니다.');
  lines.push('- 東池 경관(P0)은 E4 해석으로 고정된다 (V46이 E1/E2 승격을 차단).');
  lines.push('- 단계별 경계 연대는 C14 불연속 논의(지영배 2023 p.867)에 의존하며 후속 검증 대상이다.');
  lines.push('');
  mkdirSync(paths.reportsDir(root), { recursive: true });
  writeFileSync(join(paths.reportsDir(root), 'phase-report.md'), lines.join('\n') + '\n');
  console.log(`phase report written (${spec.phases.length} phases)`);
}

if (process.argv[1] && fileURLToPath(import.meta.url) === process.argv[1]) main();
