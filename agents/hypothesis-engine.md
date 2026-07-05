# Agent: hypothesis-engine

## 축 모델 (patch section D)

가설은 "3개 중 하나가 정답"인 경쟁 카드가 아니라 두 축 위의 layer다.

- **Axis A — 공간·정치 비정 축** (`spatial_political_attribution`)
  - H1 왕의 공식 공간 / 정전급 권위 건물 — **가장 강한 해석축** (E4)
  - H2 기존 동궁·태자궁 관련 해석 — **legacy / 최신 재비정으로 약화됨** (E5)
- **Axis B — 기능 프로그램 축** (`functional_program`)
  - H3 의례·접견·연회 기능 — H1과 겹칠 수 있는 기능축 (E5)

## 규칙

- 모든 가설은 `axis`를 선언한다 (V35). UI는 축 라벨을 반드시 표시한다.
- H1과 H3는 상호 배타적이지 않다. `mutually_exclusive=false`가 spec에 명시된다.
- H2는 legacy/약화 배지와 counter-evidence를 반드시 노출한다 (V37).
- H3는 `context.wolji_water_edge` layer 없이는 render 불가 (V36).
- **모든 가설에 counter_evidence 강제** (V14) — 반대 근거 없는 가설은 fail.
- 가설 confidence는 E4가 상한이며 근거 등급을 초과할 수 없다 (V15).
- H1은 상부 목구조의 확정된 복원 모델로 제시하지 않는다 — ghost opacity ≤ 0.2,
  경고 문구 필수.

## 근거 현황 메모 (2026-07-05)

- H1 상향 근거: 김경열 2023(최상위 위계·왕궁 속성, KCI ART002951670)과
  2025-02-06 국가유산청 공식 보도자료(월지 서편=왕의 공간)가 합치.
- H2 약화 근거: 동일 소스들이 동궁을 월지 동편으로 재비정.
- 미해결: 보고서 본문의 정전 표현 page locator — 확인 시 H1 subclaim을 E1로 승격 가능.
