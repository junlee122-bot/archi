import { fileURLToPath } from 'node:url';
import { join } from 'node:path';
import { writeFileSync, mkdirSync } from 'node:fs';
import { repoRootFromArgs, loadJson, paths, fileExists } from './lib/io.mjs';

export function main(argv = process.argv.slice(2)) {
  const root = repoRootFromArgs(argv);
  if (!fileExists(paths.spec(root))) {
    console.error('hypotheses report: structural-spec.json 없음 — derive 먼저 실행');
    process.exit(1);
  }
  const spec = loadJson(paths.spec(root));
  const lines = [];
  lines.push('# Hypotheses Report — 해석축·기능축 모델');
  lines.push('');
  lines.push('H1/H2/H3는 서로 배타적인 3개의 최종 정답 후보가 아니다. 공간·정치 비정 축과 기능 프로그램 축 위의 layer이며, H1과 H3는 겹칠 수 있다.');
  lines.push('');
  for (const h of spec.hypotheses) {
    lines.push(`## ${h.id} — ${h.title_ko}`);
    lines.push('');
    lines.push(`- 축: **${h.axis_label_ko}** (\`${h.axis}\`)`);
    lines.push(`- confidence: **${h.confidence}**${h.badges.strongest ? ' — 가장 강한 해석축' : ''}`);
    if (h.badges.legacy) lines.push(`- 배지: **${h.badges.legacy_label_ko}**`);
    lines.push(`- 렌더 가능: ${h.renderable}${h.missing_required_features.length ? ` (누락: ${h.missing_required_features.join(', ')})` : ''}`);
    lines.push(`- 요약: ${h.summary_ko}`);
    lines.push('');
    lines.push('### 근거');
    for (const ev of h.supporting_evidence) lines.push(`- [${ev.class}] ${ev.claim} (${ev.source_id})`);
    lines.push('');
    lines.push('### 반대 근거');
    for (const ev of h.counter_evidence) lines.push(`- [${ev.class}] ${ev.claim}${ev.source_id ? ` (${ev.source_id})` : ''}`);
    lines.push('');
    lines.push('### 미해결 질문');
    for (const q of h.unresolved_questions) lines.push(`- ${q}`);
    lines.push('');
  }
  mkdirSync(paths.reportsDir(root), { recursive: true });
  writeFileSync(join(paths.reportsDir(root), 'hypotheses-report.md'), lines.join('\n') + '\n');
  console.log(`hypotheses report written (${spec.hypotheses.length} hypotheses)`);
}

if (process.argv[1] && fileURLToPath(import.meta.url) === process.argv[1]) main();
