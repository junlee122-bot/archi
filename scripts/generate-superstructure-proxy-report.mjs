// M2.6 — superstructure proxy silhouette report. Generated from the sealed
// spec so counts/policies stay live. User-facing markdown: keep every
// typology mention negated (forbidden-language scanner runs on this file).
import { fileURLToPath } from 'node:url';
import { join } from 'node:path';
import { writeFileSync, mkdirSync, existsSync } from 'node:fs';
import { repoRootFromArgs, loadJson, paths, fileExists } from './lib/io.mjs';

export function main(argv = process.argv.slice(2)) {
  const root = repoRootFromArgs(argv);
  if (!fileExists(paths.spec(root))) {
    console.error('superstructure-proxy report: structural-spec.json 없음 — derive 먼저 실행');
    process.exit(1);
  }
  const spec = loadJson(paths.spec(root));
  const params = loadJson(paths.params(root));
  const cfg = params.superstructure_proxy;
  const ps = spec.derived.proxy_superstructure;
  if (!cfg || !ps) {
    console.error('superstructure-proxy report: proxy 설정/파생 블록 없음');
    process.exit(1);
  }
  const byId = new Map(spec.features.map((f) => [f.id, f]));
  const lines = [];
  lines.push('# Superstructure Proxy Report — 구조 실루엣 (M2.6)');
  lines.push('');
  lines.push('## 1. 목적');
  lines.push('');
  lines.push('발굴유구만으로는 A건물지가 고위계 대형 건물이었다는 보고·해석의 공간감이 전달되지 않는다.');
  lines.push('구조 실루엣 layer는 보고서 치수·적심 그리드·출입·회랑 등 **하부 사실에 의해 제약된 투명 표시**로');
  lines.push('상부구조의 존재감을 보여준다. 이것은 원형 복원이 아니다 — 지붕형식·공포양식·기둥 높이를 확정하지 않는다.');
  lines.push('');
  lines.push('## 2. 새로 추가된 proxy features');
  lines.push('');
  for (const id of [...cfg.proxy_feature_ids, ...cfg.material_context_feature_ids, ...cfg.helper_feature_ids, ...cfg.uncertainty_feature_ids]) {
    const f = byId.get(id);
    if (!f) continue;
    lines.push(`- \`${id}\` — ${f.name_ko} (fact ${f.confidence} / render ${f.render_confidence})`);
  }
  lines.push('');
  lines.push('## 3. FACT 근거 (하부 사실)');
  lines.push('');
  lines.push('- 25.5×15.2m·7×4칸 평면과 적심 제원 — 2022 보고서 p.84-85 (E1, segment locator)');
  lines.push('- 답도·출입시설·서회랑·석축기단 — 2022 보고서 p.85, p.107-110 (E1)');
  lines.push('- 기와류(평기와·수막새·암막새·전)·치미편 출토 맥락 — 2022 보고서 p.12-13 화보, p.190 유물 88·89, 도판55 (E1)');
  lines.push('- 고위계·왕궁급 속성 해석 — 김경열 2023 pp.161-162 (E4)');
  lines.push('');
  lines.push('## 4. RENDER 방식');
  lines.push('');
  lines.push(`- 기둥: symbolic 적심 위치의 반투명 기둥. 높이는 scene-unit preset(${Object.keys(ps.height_presets.options).join('/')}) — ${ps.height_presets.label_ko}.`);
  lines.push('- 보 프레임: 그리드 리듬만 잇는 얇은 wireframe rail. 접합부·부재 상세 표현 없음.');
  lines.push('- 지붕: 형식 미지정 반투명 질량 volume + wire canopy. 특정 지붕형식 실루엣을 만들지 않는다.');
  lines.push(`- 회랑 실루엣: 본채보다 낮은 불투명도(${ps.opacity.corridor}) + 불확정 연장 점선.`);
  lines.push('- 재료 맥락: 측면 트레이의 절차적 추상 마커 — 지붕면 위 기와 재현 없음, 보고서 도판 미사용.');
  lines.push(`- 기본 불투명도: 기둥 ${ps.opacity.columns} · 보 ${ps.opacity.beams} · 지붕 ${ps.opacity.roof} (강조 시에도 ≤ ${ps.opacity.roof_emphasized_max}).`);
  lines.push(`- 감주 영역: ${ps.omitted_zone.label_ko} — 점선 슬롯 ${ps.omitted_zone.symbolic_positions.length}개소, 기둥으로 채우지 않는다.`);
  lines.push('');
  lines.push('## 5. 명시적 비주장 (NOT CLAIMED)');
  lines.push('');
  lines.push('- 지붕형식 미지정 · 공포양식 미지정 · 기둥 높이 미확정 · 배흘림 여부 미지정 · 단청 미지정');
  lines.push('- 처마 길이·지붕 물매·용마루 장식 미지정');
  lines.push('- 원형 복원 아님 — 확정 재현 아님. 기와·치미 출토는 지붕형식 확정 근거로 사용하지 않는다.');
  lines.push('');
  lines.push('## 6. verifier V55–V64');
  lines.push('');
  lines.push('- V55 proxy layer 격리 (excavated 위장·고신뢰 geometry 차단)');
  lines.push('- V56 실루엣 형식(지붕/공포) 미지정 강제');
  lines.push('- V57 기둥 높이 preset 전용 (실측·E1 승격 차단)');
  lines.push('- V58 roof envelope 형식 미지정 유지');
  lines.push('- V59 재료 맥락 추상 마커 전용 + web/public 이미지 금지');
  lines.push('- V60 발굴유구 기본 모드 보존 (proxy 기본 OFF)');
  lines.push('- V61 provenance 또는 직접-근거-없음 명시 의무, helper 분류 강제');
  lines.push('- V62 감주 영역 기둥 미충전');
  lines.push('- V63 proxy UI 경고 문구 표출 의무');
  lines.push('- V64 실루엣 프리뷰(내부 렌더) 의무');
  lines.push('');
  lines.push('## 7. corruption C16–C20');
  lines.push('');
  lines.push('- C16 proxy 지붕에 형식 용어 주입 → V56/V58 거부');
  lines.push('- C17 기둥 실측 높이+E1 승격 → V57/V55 거부');
  lines.push('- C18 proxy 보에 공포양식 주입 → V56 거부');
  lines.push('- C19 감주 영역 기둥 충전 → V62 거부');
  lines.push('- C20 web/public 이미지 반입 → V59/V20 거부');
  lines.push('');
  lines.push('## 8. screenshots');
  lines.push('');
  for (const name of cfg.preview_files) {
    const p = join(paths.artifacts(root), 'preview', name);
    lines.push(`- artifacts/preview/${name} ${existsSync(p) ? '' : '(미캡처 — V64 fail 상태)'}`);
  }
  lines.push('- 전부 내부 뷰어 실렌더 — 소스 이미지·도판 아님 (preview-manifest.json origin 필드로 강제).');
  lines.push('');
  lines.push('## 9. remaining blockers');
  lines.push('');
  lines.push('- 2022 보고서 license human review (to_verify) · 학회지 3종 license unknown');
  lines.push('- 좌표 미디지타이즈 — 기둥 위치는 symbolic, 감주 위치도 상징 표현');
  lines.push('- 상부 목구조 직접 근거 없음 — 실루엣이 E5/DEMO를 벗어날 수 없는 이유');
  lines.push('');
  lines.push('## 10. why strict mode remains red');
  lines.push('');
  lines.push('strict는 license·locator blocker가 해소될 때까지 의도적으로 red다. 구조 실루엣 layer는');
  lines.push('E5/DEMO 표시 전용이므로 strict green의 전제조건이 아니며, blocker를 우회해 green으로 만들지 않는다.');
  lines.push('');
  mkdirSync(paths.reportsDir(root), { recursive: true });
  writeFileSync(join(paths.reportsDir(root), 'superstructure-proxy-report.md'), lines.join('\n') + '\n');
  console.log(`superstructure-proxy report written (${ps.features.length} proxy features)`);
}

if (process.argv[1] && fileURLToPath(import.meta.url) === process.argv[1]) main();
