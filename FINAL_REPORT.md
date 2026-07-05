# FINAL REPORT — GONGPO-DONGGUNG PRO v0.9.2

대상: 경주 동궁과 월지 서편 A건물지 · 기준일: 2026-07-05

핵심 산출물은 시각적 재현이 아니라 **증거 분리**다. 이 빌드는 원형 복원이 아니며,
보고 사실(E1)·구조 해석(E4)·기능 가설(E5)·표시 placeholder(DEMO)를 분리해
저장·검증·표시한다.

## Feedback Patch Applied

### 1. License correction

- 2018 A건물지 보고서: **공공누리 제1유형** — 공식 페이지(portal.nrich.go.kr,
  info_idx=8404)의 KOGL 문구를 2026-07-05 실사로 원문 확인, `license_verified=true`,
  직접 PDF locator(약 59.5MB) 기록.
- 관련 보고서의 license는 실제로 서로 다름을 확인: 동궁과 월지 Ⅲ(2019)는 **제4유형**
  (상업·변형 제한, human review 플래그), 2022 전면 보고서는 판권지 제한 문구 때문에
  **to_verify** 유지, 2025 국가유산청 보도자료는 **제1유형**, 학회지 논문 2건은 unknown.
- **전역 license 가정 없음** — GATE_R(V19)와 V38이 소스별 개별 license를 강제.
- **commercial_safe = false** (used source에 unknown license 논문 2건 포함).

### 2. E1 vs DEMO correction

- 사실 layer E1로 복원된 항목(2018 공식 초록 근거): 7×4칸 내진감주 대형건물지,
  출입시설 3개소, 동서편 익랑, 전축 보도시설, 지진구, 남편 줄기초 2동, 사적 명칭.
  (기존에 이들을 DEMO로 낮췄던 처리 폐기 — V31이 재발을 차단.)
- DEMO/relative placeholder로 남는 것: bay spacing, 좌표, 감주 정확 위치, 초석 치수,
  기단 높이, 보도 타일 모듈, 지붕 높이·질량 — 전부 `null` + `relative_geometry` 플래그
  (V22/V32). 전체 목록은 `artifacts/reports/evidence-report.md`.

### 3. Hypothesis rebalance

- **H1 왕의 공식 공간/정전급** → 가장 강한 해석축(E4)으로 상향. 근거: 김경열 2023
  (신라사학보 57, KCI ART002951670) + 2025-02-06 국가유산청 공식 보도자료.
- **H2 동궁·태자궁 해석** → legacy/약화 배지 의무(E5). counter-evidence로 동편 재비정
  2건 노출 (V37).
- **H3 의례·접견·연회** → 별개 경쟁 가설이 아닌 **기능 프로그램 축**으로 분리(E5),
  H1과 중첩 가능, `context.wolji_water_edge` 없이는 render 불가 (V36).
- 세 카드는 상호 배타적 3택으로 표시되지 않는다 (`mutually_exclusive=false`, V35).

### 4. Verifier generic update

- 구 `V05_GRID_7_BY_4`(7×4 하드코딩) 폐기 → `V05_GRID_SOURCE_CONSISTENCY`:
  기대 칸 수는 `params/target-site.json`과 corpus fact_layer에만 존재.
  `tests/verify.test.mjs`가 5×3 전치 fixture로 하드코딩 부재를 증명.
- **V31–V40 신규 구현 완료** (fact/geometry 분리, locator 없는 좌표 금지, 공포·지붕
  typology 금지, 축 모델, 월지 컨텍스트 의존, legacy 배지, 혼합 license, user-facing
  한정 금지어, 칸 수 파생 기둥열). 명세: `docs/VERIFIER_SPEC.md`.

### 5. Core/web split

| milestone | 상태 |
|---|---|
| M1 goal:core | **green** — validate/derive/verify(38 pass·2 warn·0 fail)/리포트 + core 테스트 9종 전부 통과. 웹 의존성 없이 실행 가능 |
| M2 goal:web | **green** — next build(정적 export) 성공, e2e-smoke 통과, headless Chromium 렌더 확인(8 mode tabs, 축 라벨, legacy 배지, ghost mass, evidence drawer의 fact/render 분리) |
| M3 docs/reports | **green** — 증거·가설·license 리포트 생성, 금지어 스캔 18개 파일 clean, 정책 문서 5종 + agents 4종 |
| goal:strict | **의도적 fail** — 미확정 locator/license가 남아 있는 동안 실패하는 로드맵 게이트 |

### 6. Typology guard

- 공포(bracket) 양식 assign 없음 — corpus의 `bracket_typology=null`, V33 집행.
- 지붕 형식 assign 없음 — `roof_type=null`, generic ghost mass만 렌더, V34 집행.
- 상부구조는 ghost/symbolic 전용 (V21) — 기둥 마커는 칸 수+1 파생 symbolic (V40).
- corruption 드릴 C02/C03이 typology 주입을 실제로 거부함을 증명 (12/12 CAUGHT).

### 7. Remaining blockers

1. **2022 전면 보고서 license** — 판권지 제한 문구 vs 페이지 공통 KOGL 로고 충돌.
   human review로 확정 전까지 to_verify, evidence 인용 금지 (derive가 fail-closed).
2. **exact page/figure locator** — 2018/2022 PDF ingest 후 seg locator 보강 필요.
3. **exact 치수·좌표** — measured locator 확보 전까지 전부 null 유지.
4. ~~2025 공식 source locator~~ — **해결됨**: 2025-02-06 국가유산청 보도자료
   (khs.go.kr newsItemId=155705252, KOGL 제1유형)로 공식 승격 완료.
5. 신라사학보 57·한국고고학보 129 논문의 저작권 이용 조건 확인.

## 실측 소스 검증 요약 (source-scout, 2026-07-05)

6개 소스 전부 병렬 웹 실사로 확인(`data/source-scout-findings.json`): 2018 보고서
제1유형 문구·PDF locator 확인, 2022 보고서는 공식 PDF 판권지까지 직접 판독
(학술연구총서 173, ISBN 978-89-299-2658-8), 김경열 2023 DOI
10.65509/JSHS.2023.04.57.161, 지영배 2023 DOI 10.47439/JKRAS.2023.4.855,
2025 보도자료 원문, 동궁과 월지 Ⅲ 제4유형 문구.

## 재현

```bash
npm run goal:core   # M1 (웹 의존성 불필요)
npm run corrupt     # fail-closed 12/12
npm run web:install && npm run goal:web   # M2
npm run m3          # M3
```
