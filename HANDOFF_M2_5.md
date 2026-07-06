# HANDOFF — M2.5 presentable viewer sprint

기준일: 2026-07-05 · 브랜치: `claude/fable-5-gongpo-donggung-patch-y6zz03`

## 착수 시점 상태 (checkpoint)

- **M1.5 core: GREEN** — `npm run goal:core` exit 0, verify **52 pass / 2 warn / 0 fail** (V01–V54),
  corruption **15/15 CAUGHT**, core 테스트 15종 PASS. strict는 의도적 red (license·좌표 blocker).
- 4소스 corpus 동결 상태: 2022 보고서 / 김경열 2023(전문 첨부) / 이현태 2023 / 지영배 2023.
  segment 42종, feature 45종, phase 5단계.
- **web route 현황**: `/` 단일 route (M2 뷰어 — 8모드 탭, R3F). `/studio` `/verify` `/report` 없음.
- artifacts: structural-spec.json(45f), source-coverage.json, verification-report.json(V01-54),
  corruption-report.json(15), reports 3종(md). `artifacts/verifier-report.json` 경로는 이 리포에서
  `artifacts/verification-report.json`이며, phase-report.md는 아직 없음(이번 스프린트에서 생성).

## M2.5 미충족 요구 (이번 스프린트 대상)

- route 4종(/, /studio, /verify, /report) 중 3종 부재
- 9모드 탭 (현재 8모드, 라벨 상이)
- rubble 적심 패드 / 답도 스트립 / 북편 출입 구분 / 절차적 전 스트립 / 5단 석축 layered /
  2.5D 층서 단면 / 東池 컨텍스트 / 치수 라벨·스케일바·북쪽 화살표
- 해석축 UI(축 모델 + 배지 + feature highlight), 상호작용 phase timeline (기존 부분 구현)
- corruption UI 데모 (클릭 가능, 로컬 state만 변형)
- /studio corpus 리뷰 테이블, /report 리포트 카드
- viewer-preview-checklist.md + 스크린샷

## 계획된 core-side 예외 (viewer-blocking — 사유 문서화)

scope lock상 core는 동결이지만, 아래 2건은 뷰어 요구와 직접 충돌하여 최소 수정한다:

1. **`params/target-site.json` mode_tabs_template**: 8탭 → M2.5 요구 9탭
   (발굴유구/제원·그리드/내진감주/출입·동선/익랑·회랑/대지조성·트렌치/해석축/불확실성/검증결과).
   V24는 template 전개와 spec을 비교하므로 params 변경만으로 정합 유지.
2. **`scripts/verify.mjs` V48**: 기존 8탭 리터럴 검사 → 9탭 리터럴 + route 4종 파일 검사로 갱신
   (M2.5 도달로 route 완결성 요구가 활성화됨). V48은 web/ 부재 환경에서는 계속 skip(코어 단독 green 유지).
   부수 테스트 조정: e2e-smoke(8→9), derive.test('칸 그리드'→'제원/그리드'),
   verify.test(placeholder 탭 라벨 검증 제거 — 새 탭셋은 정적 라벨).

data/*, derive.mjs, 그 외 verifier 체크는 수정하지 않는다.

## 계획 변경 파일

web/app/{page,studio/page,verify/page,report/page}.tsx, web/app/{layout.tsx,globals.css},
web/components/* (SceneViewer·EvidenceDrawer 재작성, StatusBar·CorruptionDemo·StratigraphyInset·
Markdown 신규), web/lib/*, scripts/copy-artifacts-to-web.mjs(+sources.json·coverage 복사),
scripts/generate-phase-report.mjs(신규), package.json(test:web-smoke·reports),
tests/{web-routes,viewer-artifact-smoke}.test.mjs(신규)+e2e 강화, artifacts/viewer-preview-checklist.md,
README 뷰어 섹션, HANDOFF_M2_5.md.

## 실행 커맨드/결과 (완료)

- `npm run goal:core` → **exit 0** (9탭 params 반영 후 재검증: verify 52P/2W/0F, corruption 15/15, core 테스트 15종 PASS)
- `npm run web:install` → exit 0 (기존 설치 재확인, npm audit 경고만)
- `npm run m3` → exit 0 (evidence/hypotheses/**phase(신규)**/license 리포트 + forbidden 28파일 clean)
- `npm run goal:web` → **exit 0** — next build 정적 export 7페이지 (/, /studio, /verify, /report, /_not-found)
- `npm run test:web-smoke` → **exit 0** (web-routes + viewer-artifact-smoke + e2e-smoke)
- headless Chromium 캡처 8장 → artifacts/viewer-preview.png + artifacts/preview/*.png

### 빌드 중 잡은 실제 실패 (교정 완료)

1. `Type error: report_dimension_scaled not in Spec.derived` → web/lib/types.ts에 M1.5 derived 블록 타입 추가
2. `Set<string> 스프레드` ES5 타깃 오류 → tsconfig target ES2017 + Array.from 교체
3. 정적 export가 `studio.html` 평면 파일 생성 → 딥링크 404 → `trailingSlash: true`로 디렉터리형 export
4. web-routes.test의 '복원 거부' 문자열 검사 위치 오류(문구는 relations.ts에 있음) → 테스트 교정

## 변경 파일 (M2.5)

- params/target-site.json (mode_tabs 9종 — 문서화된 예외), scripts/verify.mjs V48 (route+9탭 — 문서화된 예외)
- scripts/copy-artifacts-to-web.mjs (+sources.json·source-coverage·verifier-report 별칭·checklist), scripts/generate-phase-report.mjs (신규)
- web/app/{page,studio/page,verify/page,report/page}.tsx, web/app/globals.css, web/next.config.mjs, web/tsconfig.json
- web/components/{SceneViewer,EvidenceDrawer,HypothesisPanel,PhaseTimeline,StatusBar*,CorruptionDemo*,StratigraphyInset*,Markdown*}.tsx (*신규)
- web/lib/{types,useArtifacts*,relations*}.ts (*신규)
- tests/{web-routes*,viewer-artifact-smoke*}.test.mjs (*신규), tests/{derive,verify,e2e-smoke}.test.mjs (탭 정합)
- artifacts/viewer-preview.png, artifacts/viewer-preview-checklist.md, artifacts/preview/* (실캡처 7장+manifest), artifacts/reports/phase-report.md
- README.md 뷰어 섹션, docs/DEMO_SCRIPT.md 장면 7, package.json (reports·test:web-smoke)

## 적대적 리뷰 결과 (ultracode 3-에이전트)

acceptance **PASS 11/11** · code review **critical/major 없음** · honesty **HONEST**.
minor 8건 전부 반영:

1. SceneViewer 이동 화살표 — `inPhase('movement.primary_entrance_axis')` gating 추가 (다른 그룹과 동일 패턴).
2. StatusBar nav — trailingSlash 정규화(`cur === target`)로 현재 route active 표시 정상화.
3. VerificationPanel 헤딩 `V01–V50` → `V01–V54`.
4. SceneViewer ghost group — `bad.has('superstructure.roof_mass.ghost')`면 빨강(#d96459) tint →
   ui_c2(지붕→E1) 조작이 실제 시각 효과를 냄(실캡처 preview-corruption-ghost-red.png로 실증).
   LIST_FILTER '내진감주'를 `superstructure.` 전체로 확장해 roof feature도 evidence drawer로 열림.
5. VerificationPanel corruption fetch 상대→절대 경로(`/artifacts/corruption-report.json`).
6. README 구조 블록 `verify(V01–V40)`→`V01–V54`, `8 mode tabs`→`route 4종·9 mode tabs`.
7. verify.mjs 라인1 주석 `V01–V40`→`V01–V54` (주석 전용).
8. preview-report.png 재캡처(체크리스트 스테이징 후) — `(없음)` 사라짐, 리포트 카드 정상 렌더.
   (DEMO_SCRIPT의 `12개→15개`·`V01–V40→V01–V54` stale 문구도 함께 정정.)

재검증(fix 이후): goal:core exit 0(52P/2W/0F, 코어 15종 PASS), goal:web exit 0(7페이지),
test:web-smoke exit 0(3종), m3 exit 0(forbidden 28파일 clean). 스크린샷 9장 재캡처.

## 남은 blocker (변동 없음)

- 2022 보고서 license human review · 학회지 3종 license unknown · 좌표 미디지타이즈 →
  strict red 유지가 정상. Kim p.163-166 부분 판독(needs_source_review).
