// M2.6 — user-facing surfaces must never make positive superstructure claims
// (roof/bracket typology as site assignment, measured column height, original
// reconstruction). Negated policy statements are allowed.
import assert from 'node:assert/strict';
import { readFileSync, readdirSync, statSync, existsSync } from 'node:fs';
import { dirname, join, resolve, relative } from 'node:path';
import { fileURLToPath } from 'node:url';
import { scanText, isNegatedContext, isCommentLine } from '../scripts/lib/forbidden.mjs';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');

// the forbidden scanner itself must reject M2.6 overclaims...
assert.ok(scanText('이 모델은 실제 신라 궁궐을 보여준다.').length >= 1);
assert.ok(scanText('주심포 복원을 완료했다.').length >= 1);
assert.ok(scanText('기둥 높이 실측 결과를 반영했다.').length >= 1);
// ...while negations stay allowed (원형 복원 아님 badge, 아니다/않는다 family)
assert.equal(scanText('원형 복원 아님').length, 0);
assert.equal(scanText('이것은 원형 복원이 아니다.').length, 0);

// additional overclaim needles beyond the shared forbidden list
const OVERCLAIM = [
  '실제 신라 궁궐', '확정 지붕', '팔작 복원', '맞배 복원', '우진각 복원',
  '주심포 복원', '다포 복원', '기둥 높이 실측', '원형 복원', '실제 기둥 높이',
  '정확한 지붕형식', '신라 지붕 복원', '완벽한 고증'
];

function walk(dir, out = []) {
  if (!existsSync(dir)) return out;
  for (const entry of readdirSync(dir)) {
    if (['node_modules', '.next', '.git', 'out'].includes(entry)) continue;
    const p = join(dir, entry);
    const st = statSync(p);
    if (st.isDirectory()) walk(p, out);
    else out.push(p);
  }
  return out;
}

const targets = [];
for (const dir of [join(root, 'web', 'app'), join(root, 'web', 'components'), join(root, 'web', 'lib')]) {
  for (const f of walk(dir)) if (/\.(tsx|ts)$/.test(f)) targets.push(f);
}
for (const f of walk(join(root, 'artifacts', 'reports'))) if (/\.md$/.test(f)) targets.push(f);
for (const name of ['README.md', join('docs', 'DEMO_SCRIPT.md')]) {
  const p = join(root, name);
  if (existsSync(p)) targets.push(p);
}

const violations = [];
for (const file of targets) {
  const lines = readFileSync(file, 'utf8').split('\n');
  lines.forEach((line, i) => {
    if (isCommentLine(line) || isNegatedContext(line)) return;
    if (/미지정|미확정|금지|미상/.test(line)) return; // policy/uncertainty phrasing
    for (const term of OVERCLAIM) {
      if (line.includes(term)) violations.push(`${relative(root, file)}:${i + 1}: '${term}'`);
    }
  });
}
assert.deepEqual(violations, [], `superstructure overclaims found:\n${violations.join('\n')}`);
console.log('no-superstructure-overclaim.test: PASS');
