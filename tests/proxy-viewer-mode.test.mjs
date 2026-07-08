// M2.6 — 구조 실루엣 viewer mode: tab, toggles, warnings, drawer wiring.
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { loadJson } from '../scripts/lib/io.mjs';
import { expandModeTabs } from '../scripts/lib/model.mjs';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const params = loadJson(join(root, 'params', 'target-site.json'));

// 10 mode tabs including 구조 실루엣
const tabs = expandModeTabs(params);
assert.equal(tabs.length, 10, '10 mode tabs');
assert.ok(tabs.includes('구조 실루엣'), '구조 실루엣 tab present');

const page = readFileSync(join(root, 'web', 'app', 'page.tsx'), 'utf8');
const scene = readFileSync(join(root, 'web', 'components', 'SceneViewer.tsx'), 'utf8');
const drawer = readFileSync(join(root, 'web', 'components', 'EvidenceDrawer.tsx'), 'utf8');
const combined = page + scene + drawer;

// mode + required warning copy
assert.ok(combined.includes('구조 실루엣'), 'mode handled');
for (const s of ['원형 복원 아님', '지붕형식 미지정', '공포양식 미지정', '기둥 높이 미확정']) {
  assert.ok(combined.includes(s), `warning '${s}' present in viewer code`);
}

// toggles + preset + split view
for (const s of ['상부구조 실루엣', '기둥', '보 프레임', '지붕 질량감', '회랑 실루엣', '스케일 인물']) {
  assert.ok(page.includes(s), `toggle '${s}' present`);
}
assert.ok(page.includes('시각화 preset — 실측 높이 아님'), 'height preset disclaimer');
for (const s of ['낮게', '중간', '높게']) assert.ok(page.includes(`'${s}'`) || page.includes(`"${s}"`), `preset ${s}`);
assert.ok(page.includes('발굴유구만') && page.includes('실루엣 겹쳐보기'), 'split view buttons');

// scene renders proxy parts + omitted zone stays hollow
for (const s of ['proxy.column_posts', 'proxy.beam_frame', 'proxy.roof_envelope', 'corridor_upper_silhouette', 'in_omitted_zone']) {
  assert.ok(scene.includes(s), `scene handles ${s}`);
}
assert.ok(scene.includes('scale_helper.human_silhouette'), 'scale helper rendered');
assert.ok(scene.includes('material_context.roof_tile_fragments'), 'material tray rendered');

// drawer: NOT CLAIMED + why-allowed microcopy
assert.ok(drawer.includes('NOT CLAIMED'), 'drawer NOT CLAIMED block');
assert.ok(drawer.includes('왜 표시가 허용되는가'), 'drawer why-allowed microcopy');

// default overview selection on entering the mode
assert.ok(page.includes('superstructure.proxy.overview'), 'overview default-selected');

console.log('proxy-viewer-mode.test: PASS');
