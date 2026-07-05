# HYPOTHESIS POLICY — 축 모델

## 왜 축 모델인가

기존 구조는 H1/H2/H3를 병렬 경쟁 가설(3택 1)로 두었다. PATCH v0.9.2는 이를 두 축으로
분리한다 — 공간·정치 비정과 기능 프로그램은 서로 다른 질문이기 때문이다.

**Axis A — 공간·정치 비정 축** (`spatial_political_attribution`)
- A1 = H1: 서편 A건물지 = 왕의 공식 공간 / 정전급 권위 건물
- A2 = H2: 서편 A건물지 = 기존 동궁/태자궁 관련 해석

**Axis B — 기능 프로그램 축** (`functional_program`)
- B1: 정전/공식 의례·접견 기능
- B2: 연회·경관·임해전 계열 기능
- B3: unresolved mixed function
- H3는 이 축 전체를 다루는 layer이며, H1 내부의 기능 세부 해석으로도 작동한다.

(`historiography` 축은 연구사 layer용으로 예약되어 있다.)

## 현재 균형 (2026-07-05 기준)

| 가설 | 축 | confidence | 상태 |
|---|---|---|---|
| H1 왕의 공식 공간/정전급 | 공간·정치 | E4 | **가장 강한 해석축** — 김경열 2023 + 2025-02-06 국가유산청 공식 보도자료 합치 |
| H2 기존 동궁·태자궁 해석 | 공간·정치 | E5 | **legacy / 최신 재비정으로 약화됨** 배지 필수 |
| H3 의례·접견·연회 기능 | 기능 프로그램 | E5 | 월지 water/context layer 없이는 render 불가 |

## 집행 규칙 (verifier)

- V35: 모든 가설은 축 선언 필수. 상호배타 3택으로 표시 금지 (`mutually_exclusive=false`).
- V36: H3 ↔ `context.wolji_water_edge` 의존.
- V37: H2 legacy 배지 + counter-evidence 노출 의무.
- V14: 모든 가설에 counter_evidence 강제.
- V15: 가설 confidence 상한 E4, 근거 등급 초과 금지.
- H1은 상부 목구조의 확정된 복원으로 제시하지 않는다 (ghost opacity ≤ 0.2 + 경고문).

## 승격 경로

- H1 subclaim("정전" 표현): 보고서 PDF 본문에서 표현·page locator 확인 시 E1로 승격.
- H3: 도면 기반 시각축·동선축 검증 또는 독립 문헌·유물 연결 확보 시 E4로 승격 검토.
