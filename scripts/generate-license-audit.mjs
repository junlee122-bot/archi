import { fileURLToPath } from 'node:url';
import { join } from 'node:path';
import { writeFileSync, mkdirSync } from 'node:fs';
import { repoRootFromArgs, loadJson, paths, fileExists } from './lib/io.mjs';

export function main(argv = process.argv.slice(2)) {
  const root = repoRootFromArgs(argv);
  if (!fileExists(paths.spec(root))) {
    console.error('license audit: structural-spec.json 없음 — derive 먼저 실행');
    process.exit(1);
  }
  const spec = loadJson(paths.spec(root));
  const a = spec.license_audit;
  const lines = [];
  lines.push('# License Audit — GONGPO-DONGGUNG PRO');
  lines.push('');
  lines.push(`- **commercial_safe: \`${a.commercial_safe}\`**`);
  lines.push(`- 정책: ${a.policy}`);
  lines.push('- 소스별 license는 개별 확인한다. 전역 license 가정은 없다.');
  lines.push('- 보고서 이미지·PDF 페이지·발굴 사진은 public viewer로 복사하지 않는다 (V20).');
  lines.push('');
  lines.push('| source | priority | license | verified | status | evidence 사용 | 상업 호환 | human review 필요 |');
  lines.push('|---|---|---|---|---|---|---|---|');
  for (const s of a.sources) {
    lines.push(`| ${s.id} | ${s.priority} | ${s.license} | ${s.license_verified} | ${s.status} | ${s.used_by_evidence} | ${s.commercial_compatible} | ${s.public_derivative_requires_human_review} |`);
  }
  lines.push('');
  lines.push('## 제한 사항');
  for (const s of a.sources.filter((x) => x.restriction_note)) {
    lines.push(`- **${s.id}**: ${s.restriction_note}`);
  }
  lines.push('');
  mkdirSync(paths.reportsDir(root), { recursive: true });
  writeFileSync(join(paths.reportsDir(root), 'license-audit.md'), lines.join('\n') + '\n');
  console.log('license audit written (commercial_safe=' + a.commercial_safe + ')');
}

if (process.argv[1] && fileURLToPath(import.meta.url) === process.argv[1]) main();
