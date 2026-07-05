import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { scanText, scanSpecObject } from '../scripts/lib/forbidden.mjs';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');

// positive: bare user-facing claim fails
assert.equal(scanText('이 화면은 신라 궁궐의 원형 복원입니다.').length, 1);
assert.equal(scanText('This shows the confirmed original appearance of the palace.').length, 1);

// exceptions (patch section J): negated policy sentences pass
assert.equal(scanText('원형 복원이라는 표현은 사용하지 않는다.').length, 0);
assert.equal(scanText('We must not claim a confirmed original appearance.').length, 0);
assert.equal(scanText('이것은 확정 복원이 아니다.').length, 0);

// exceptions: forbiddenTerms array contents pass
assert.equal(scanText("const forbiddenTerms = [\n  '원형 복원',\n  '완벽한 고증'\n];").length, 0);

// exceptions: code comments pass
assert.equal(scanText("// '원형 복원' is a banned phrase in user-facing UI").length, 0);

// exceptions: markdown 금지어 section pass
assert.equal(scanText('## 금지어 목록\n\n- 원형 복원\n- 완벽한 고증\n', { kind: 'markdown' }).length, 0);

// but a claim in a normal markdown section still fails
assert.equal(scanText('## 소개\n\n이 프로젝트는 완벽한 고증을 제공합니다.\n', { kind: 'markdown' }).length, 1);

// spec object scanning: user-facing keys only, negation-aware
assert.equal(scanSpecObject({ summary_ko: '월지 서편의 원형 복원 모델' }).length, 1);
assert.equal(scanSpecObject({ summary_ko: '확정 복원이 아니다' }).length, 0);
assert.equal(scanSpecObject({ internal_note_key: '원형 복원' }).length, 0, 'non-user-facing keys ignored');

// the repo's own user-facing surfaces are clean
const r = spawnSync(process.execPath, [join(root, 'scripts', 'check-forbidden-language.mjs')], { cwd: root, encoding: 'utf8' });
assert.equal(r.status, 0, `repo user-facing scan: ${r.stdout}${r.stderr}`);

console.log('forbidden-language.test: PASS');
