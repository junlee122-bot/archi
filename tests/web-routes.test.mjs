import assert from 'node:assert/strict';
import { existsSync, readFileSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const app = join(root, 'web', 'app');

for (const route of ['page.tsx', 'studio/page.tsx', 'verify/page.tsx', 'report/page.tsx']) {
  assert.ok(existsSync(join(app, route)), `web/app/${route} exists`);
}

// the nine M2.5 viewer modes are all handled somewhere in the viewer code
const mainSrc = readFileSync(join(app, 'page.tsx'), 'utf8')
  + readFileSync(join(root, 'web', 'components', 'SceneViewer.tsx'), 'utf8');
for (const tab of ['발굴유구', '제원/그리드', '내진감주', '출입/동선', '익랑·회랑', '대지조성·트렌치', '해석축', '불확실성', '검증결과']) {
  assert.ok(mainSrc.includes(tab), `mode '${tab}' handled`);
}

// corruption UI is clickable (component wired into both / and /verify)
const verifySrc = readFileSync(join(app, 'verify', 'page.tsx'), 'utf8');
assert.ok(verifySrc.includes('CorruptionDemo'), '/verify has corruption demo');
assert.ok(mainSrc.includes('CorruptionDemo'), 'main viewer has corruption demo');
const demoSrc = readFileSync(join(root, 'web', 'components', 'CorruptionDemo.tsx'), 'utf8')
  + readFileSync(join(root, 'web', 'lib', 'relations.ts'), 'utf8');
assert.ok(demoSrc.includes('복원 거부'), 'corruption demo shows refusal message');
assert.ok(demoSrc.includes('전체 복원'), 'corruption demo has restore button');
console.log('web-routes.test: PASS');
