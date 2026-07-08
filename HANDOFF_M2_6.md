# HANDOFF — M2.6 constrained superstructure silhouette sprint

기준일: 2026-07-08 · 브랜치: `claude/fable-5-gongpo-donggung-patch-y6zz03`

## 착수 시점 상태 (checkpoint — 변경 전 실측)

- `npm run goal:core` → **exit 0** (verify 52P/2W/0F, V01–V54, 코어 15종 PASS)
- `npm run goal:web` → **exit 0** (정적 export 7페이지)
- `npm run test:web-smoke` → **exit 0** (3종 PASS)
- strict: 의도적 RED (2022 license to_verify + 좌표 미디지타이즈) — M2.6에서도 유지.

## 새 정책: 구조 실루엣 (superstructure proxy silhouette)

`docs/SUPERSTRUCTURE_PROXY_POLICY.md` 신설. 핵심: 하부 사실(footprint·적심·답도·
회랑·기와/치미 재료 맥락)에 **제약된 투명 표시 layer**만 허용 — 지붕형식·공포양식·
기둥 높이·배흘림·단청·원형 재현은 어떤 형태로도 주장하지 않는다. 기둥 높이는
scene-unit preset(낮게/중간/높게, 「시각화 preset — 실측 높이 아님」), 지붕은
untyped envelope, 감주 영역은 「기둥 없음/미확인」 점선 슬롯 유지(기둥 충전 금지).

## 변경 파일 (정확 목록)

**data/params/scripts (core):**
- `params/target-site.json` — mode_tabs 10종(+구조 실루엣), forbidden_roof_terms +모임지붕,
  `superstructure_proxy` 설정 블록(feature id 목록·허용 layer·경고 라벨·프리뷰 파일명·불투명 상한)
- `data/canonical-features.json` — 45→**56 features** (+11: proxy 5종, material_context 2종,
  scale helper 1종, uncertainty 3종). 기존 feature 무변경(감주 category 등 동결).
- `data/source-segments.json` — 42→**43 segments** (+`seg_report2022_roof_tile_chimi_material_context_p12_14`
  — 화보 p.12-13 사진13-15 + 본문 p.190 유물 88·89 치미, 도판55. **PDF 직접 판독으로 검증**, 페이지 발명 없음)
- `scripts/derive.mjs` — `derived.proxy_superstructure` 블록 (column_positions는 기존 symbolic
  jeoksim 그리드 재사용, omitted_zone.filled=false, height preset scene_units_not_measured, 불투명도 상한)
- `scripts/verify.mjs` — **V55–V64** 추가, V48을 params 템플릿 기반 탭 검사로 일반화(10탭),
  V21에 '등록된 proxy_silhouette layer' 허용(등록 = params 목록 + V55–V58 이중 규제 — 완화 아님)
- `scripts/corrupt.mjs` — **C16–C20** 추가 (형식 주입/실측 높이+E1/공포양식 주입/감주 충전/public 이미지)
- `scripts/lib/forbidden.mjs` — 금지어 확장(실제 신라 궁궐·정확한 지붕형식·형식+복원 결합어·
  기둥 높이 실측 등) + NEGATION_PATTERNS에 '아님' 추가(「원형 복원 아님」 배지가 부정 문맥으로
  인식되게 하는 동일 형태소 확장 — 완화 아님, 목록은 오히려 강화)
- `scripts/generate-superstructure-proxy-report.mjs` — 신규 리포트 생성기, `reports` 체인에 연결

**web:**
- `web/lib/types.ts` (+proxy_superstructure 타입, not_usable_for), `web/lib/relations.ts`
  (proxy 체크 매핑, NOT_CLAIMED_LABELS, ui_c2 alsoAffects=proxy 지붕)
- `web/components/SceneViewer.tsx` — 구조 실루엣 렌더(기둥/보 wireframe/untyped envelope/
  회랑 실루엣/재료 트레이/스케일 인물/감주 hollow slot), CameraRig(카메라 preset 3종),
  styleFor 경유(=corruption 빨강·불확실성 채색이 proxy에도 적용)
- `web/components/EvidenceDrawer.tsx` — NOT CLAIMED 블록 + 「왜 표시가 허용되는가?」 microcopy
- `web/app/page.tsx` — 10번째 탭, silhouette 패널(토글 6종+높이 preset+발굴유구만/실루엣 겹쳐보기),
  모드별 기본값(발굴유구 OFF·해석축 H1 시에만·불확실성 ON·검증결과 ui_c2 연동),
  overview 기본 선택, 카메라 preset 버튼, SIL 오버레이 경고

**tests/docs/reports:**
- 신규: `tests/superstructure-proxy.test.mjs`, `tests/proxy-viewer-mode.test.mjs`,
  `tests/no-superstructure-overclaim.test.mjs`
- 갱신: derive(10탭)/verify(64)/corpus(상부구조 render DEMO/E5)/corruption(≥20+needle)/e2e-smoke(10탭)
- `package.json` — test:core 17종, test:web-smoke 4종, reports에 proxy 리포트 연결
- 신규 문서: `docs/SUPERSTRUCTURE_PROXY_POLICY.md`, `artifacts/reports/superstructure-proxy-report.md`(생성)
- 갱신 문서: `docs/VERIFIER_SPEC.md`(V51–V64), `docs/DEMO_SCRIPT.md`(장면 8),
  `docs/HYPOTHESIS_POLICY.md`(실루엣-가설 관계), `README.md`, HANDOFF_M2_6.md(본 문서)

## 새 verifier / corruption

- V55 proxy layer 격리 · V56 형식 미지정 강제 · V57 높이 preset 전용 · V58 untyped envelope ·
  V59 재료 맥락 추상 마커+public 이미지 금지 · V60 발굴유구 기본 모드 보존 ·
  V61 provenance/무근거 명시 · V62 감주 미충전 · V63 UI 경고 표출 · V64 실루엣 프리뷰
- C16→V56/V58, C17→V55/V57, C18→V33/V56, C19→V62, C20→V20/V59 — **20/20 CAUGHT**

## 실행 결과 (M2.6 완료 시점)

- `npm run goal:core` → **exit 0** — verify **62 pass / 2 warn / 0 fail** (V01–V64), 코어 17종 PASS
- `npm run corrupt` → **exit 0** — all **20** corruption scenarios caught (fail-closed OK)
- `npm run goal:web` → **exit 0** — 정적 export 7페이지
- `npm run test:web-smoke` → exit 0 (web-routes·viewer-artifact-smoke·proxy-viewer-mode·e2e-smoke)
- `npm run m3` → exit 0 (리포트 5종 + forbidden clean)
- `npm run goal:strict` → **exit 1 (의도된 RED)** — 2022 license to_verify가 derive를 차단. 우회 없음.

## 스크린샷 (전부 내부 뷰어 실렌더)

`artifacts/preview/` 16장 — M2.5 세트 11장 + M2.6 5장:
home-structural-silhouette / home-column-frame-drawer / home-roof-envelope-warning /
home-archaeology-vs-silhouette-split(좌 유구만·우 겹쳐보기, 내부 렌더 2장 합성) /
home-uncertainty-proxy. manifest 전 항목 origin=internal_viewer_render (V49/V64).

## 잔여 blocker (변동 없음)

- 2022 보고서 license human review(to_verify) · 학회지 3종 license unknown → commercial_safe=false
- 좌표 미디지타이즈 — 기둥·감주 위치는 symbolic
- 상부 목구조 직접 근거 없음 — 실루엣이 E5/DEMO에 고정되는 이유 (지붕/공포 typology 미해결 유지)
