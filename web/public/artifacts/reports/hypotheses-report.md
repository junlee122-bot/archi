# Hypotheses Report — 해석축·기능축 모델

H1/H2/H3는 서로 배타적인 3개의 최종 정답 후보가 아니다. 공간·정치 비정 축과 기능 프로그램 축 위의 layer이며, H1과 H3는 겹칠 수 있다.

## H1_royal_formal_space — 왕의 공식 공간 / 정전급 권위 건물 해석

- 축: **공간·정치 비정 축** (`spatial_political_attribution`)
- confidence: **E4** — 가장 강한 해석축
- 렌더 가능: true
- 요약: 서편 A건물지를 월지 서편의 최상위 위계 건물, 왕의 공식 공간 또는 정전급 권위 건물로 보는 해석이다.

### 근거
- [E1] A건물지의 구조·규모·주변 관계가 보고됨. (nrich_2018_a_building_restoration_excavation_report)
- [E4] A건물지를 왕궁으로 볼 만한 건축 속성 및 최상위 위계 건물로 해석. (kim_2023_sillasahakbo_a_building_structure_function)
- [E4] 월지 서편을 왕의 공간으로 보는 최신 조사성과. 2025-02-06 국가유산청 공식 보도자료로 확인됨. (khs_2025_silla_capital_10year_outcome)

### 반대 근거
- [E4] 기존에는 월지 서편이 동궁/태자궁 관련 공간으로 해석되어 왔다. (kim_2023_sillasahakbo_a_building_structure_function)
- [E5] 왕의 공식 공간과 정전 기능은 상부구조가 아니라 기능 해석이므로 단일 확정 모델로 렌더할 수 없다. (demo_rule_silla_palace_archaeology_basic)

### 미해결 질문
- 보고서 본문에서 정전 표현이 정확히 어디에 등장하는가?
- A건물지의 공식 기능을 정전·의례·접견·연회 중 어디까지 구분할 수 있는가?
- 월성·월지·동편 동궁 후보지와의 관계를 어느 축으로 시각화해야 하는가?

## H2_prince_palace_legacy_interpretation — 기존 동궁·태자궁 관련 해석

- 축: **공간·정치 비정 축** (`spatial_political_attribution`)
- confidence: **E5**
- 배지: **기존 해석 / 최신 재비정으로 약화됨**
- 렌더 가능: true
- 요약: 동궁과 월지라는 명칭과 기존 연구사에 따라 서편 A건물지를 태자궁 또는 동궁 관련 공간으로 연결해 온 해석이다. 최신 재비정 이후에는 약화된 competing hypothesis로 다룬다.

### 근거
- [E4] 동궁 위치 문제와 기존 논란을 정리하는 연구사 근거. (kim_2023_sillasahakbo_a_building_structure_function)

### 반대 근거
- [E4] 월지 동편을 동궁으로, 서편을 왕의 공간으로 보는 최신 조사성과가 제시됨. (khs_2025_silla_capital_10year_outcome)
- [E4] 김경열 2023 논문은 동궁 가능성이 높은 곳을 월지 동편으로 추정. (kim_2023_sillasahakbo_a_building_structure_function)

### 미해결 질문
- 동궁이라는 현대 명칭과 고고학적 동궁 위치 재비정을 UI에서 어떻게 동시에 설명할 것인가?
- 기존 서편 동궁 가설을 historical layer로 보존할지, 낮은 confidence competing hypothesis로 둘지?

## H3_ritual_audience_banquet_program — 의례·접견·연회 기능 프로그램 해석

- 축: **기능 프로그램 축** (`functional_program`)
- confidence: **E5**
- 렌더 가능: true
- 요약: A건물지의 큰 평면, 출입시설, 익랑, 보도시설, 월지 경관과의 관계를 바탕으로 공식 의례·접견·연회 기능 가능성을 검토하는 기능축이다. H1과 완전히 배타적이지 않고, H1 내부의 기능 세부 해석으로도 작동한다.

### 근거
- [E1] 출입시설, 익랑, 보도시설 등 동선 관련 feature가 보고됨. (nrich_2018_a_building_restoration_excavation_report)
- [E5] 기능 연결은 탐색 가설로만 처리. (demo_rule_silla_palace_archaeology_basic)

### 반대 근거
- [E5] 유구만으로 구체적 실내 기능을 단정하기 어렵다. (demo_rule_silla_palace_archaeology_basic)

### 미해결 질문
- 월지 경관·시각축·동선축을 실제 도면으로 검증할 수 있는가?
- 의례·접견·연회 기능을 어느 evidence class 이상으로 올릴 수 있는 독립 source가 있는가?

