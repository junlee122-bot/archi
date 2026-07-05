# Agent: korean-palace-architecture

대상: 경주 동궁과 월지 서편 A건물지 (GONGPO-DONGGUNG PRO v0.9.2, PATCH 적용판)

## 이 대상에 대한 절대 규칙

A건물지는 **고고학적 기초/유구 사이트**로 먼저 다룬다. 서 있는 목조 건물이 아니다.

- 공포(bracket) 양식을 assign하지 않는다.
- 주심포/다포/익공 계열 분류를 assign하지 않는다.
- 지붕 형식을 assign하지 않는다 (팔작/맞배/우진각 계열 추정 금지).
- hipped-gable/gabled/hipped 지붕을 추론하지 않는다.
- 기둥 높이 정확값을 추론하지 않는다.
- 입면(elevation)을 추론하지 않는다.
- 장식 재료·색채를 복원하지 않는다.
- 상부 목구조는 **ghost mass**로만 표시한다 (반투명 generic mass, 형식 정보 없음).

이 규칙은 verifier V33(공포)·V34(지붕)·V21(ghost 전용)이 기계적으로 집행한다.
UI ontology에 이런 용어가 등장해야 한다면 반드시 "이 사이트에 지정되지 않음
(not assigned for this site)" 상태로만 표기한다.

## 3단 분리 (필수)

모든 진술은 아래 3단 중 정확히 하나로 분류하고, UI에서는 stacked badge로 보여준다.

1. **유구/보고 사실** — 배지: `보고 사실`
   - 예: 7×4칸, 내진감주, 출입시설 3개소, 동서편 익랑, 전축 보도시설, 지진구, 남편 줄기초 2동.
   - evidence: 소스가 뒷받침하면 E1 (공식 보고서 초록/본문), E2 (검증된 학술 소스).
2. **구조/공간 해석** — 배지: `구조 해석`
   - 예: 최상위 위계 건물, 정전급 가능성, 왕궁 속성.
   - evidence: E4. 보고서 본문이 직접 그 표현을 쓰는 경우에만 page locator와 함께 E1.
3. **기능/정치 해석** — 배지: `기능 가설`
   - 예: 왕의 공식 공간, 태자궁, 의례·접견·연회.
   - evidence: E4/E5. 공식 소스가 직접 확인해 주는 경우에만 상향.

## geometry 규칙

- 실측 치수·좌표·칸 간격·기단 높이·초석 치수는 **measured locator**(소스 page/figure에
  대해 method=measured) 없이는 전부 `null`.
- viewer 배치는 relative placeholder(DEMO)로만 생성하고
  `ui_flags.relative_geometry=true`, `ui_flags.not_measured=true`를 반드시 켠다.
- symbolic 기둥 마커는 칸 수 파생(bays+1)만 허용하고 발굴 위치로 표기하지 않는다 (V40).
