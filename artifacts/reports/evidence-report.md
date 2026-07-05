# Evidence Report — 경주 동궁과 월지 서편 A건물지

사실(fact) confidence와 표시(render) confidence는 별개다. 아래 표의 geometry는 모두 발굴유구 기반 표시이며, DEMO는 시각화용 상대 placeholder를 뜻한다.

## 사실 layer가 E1(공식 보고 사실)인 feature

- **source_context.official_2018_report** — 『경주 동궁과 월지 복원정비사업 발굴조사보고서 - A건물지 -』(2018, 국립경주문화유산연구소)가 공식 원문 페이지에서 확인되며, 이 프로젝트 fact_layer의 1차 근거 소스다.
- **site_context.wolji_west** — A건물지는 정비·복원된 동궁과 월지 서편건물지 중 남단에 위치하며, 북편에 B건물지·동편에 복원된 제1건물지가 있다(2022 보고서 p.84). 서편 건물지군은 A·B·C 3개 건물지가 익랑·회랑으로 연결되어 일곽을 구성한다(지영배 2023 p.857).
- **context.historical_name_donggung_wolji** — 현행 공식 명칭으로 「경주 동궁과 월지」가 사용되며, 2018 보고서 표제에서도 확인된다. 명칭 자체가 동궁의 위치를 고고학적으로 확정하는 것은 아니다.
- **layout.grid.seven_by_four** — 2022 보고서 본문(p.84)은 A건물지 평면 규모를 정면(도리칸) 25.5m × 측면(보칸) 15.2m, 정면 7칸 × 측면 4칸으로 보고한다. 2018 공식 초록도 7×4칸 내진감주 대형건물지로 설명한다.
- **layout.main_axis** — A건물지는 동서 방향으로 길게 배치된 장방형 건물지이며(2022 p.84), 서편 3개 대형 건물지는 남북 중심축으로 동일선상에 자리한다(p.16). 출입시설은 남편 2개소·북편 1개소로(p.85) 남-북 방향 진입 구조를 갖는다. 정확한 방위각·좌표는 도면 디지타이즈 전까지 미확정이다(도면 방위는 자북 기준 — 일러두기).
- **layout.omitted_inner_columns** — 2022 보고서 p.84는 건물 중앙부에서 4개의 적심이 확인되지 않아 내진감주로 처리한 것으로 판단하며, 고찰(p.309-310)은 중앙열 4개소 적심 공백을 내진감주 기법으로 정리한다. 2018 초록도 내진감주 대형건물지로 설명한다.
- **platform.main_building** — 2022 보고서 p.85: 기단 지대석·면석·갑석·초석은 잔존하지 않으나 계단 지대석과 답도 등 출입시설이 남아 있어 가구식기단(架構式基壇) 건물로 판단된다. 김경열 2023 초록은 기단토를 언급한다. 기단의 정확한 높이·규모는 미확정이다.
- **foundation.general_layout** — A건물지는 대형건물지로 보고되었으며(2018 초록), 초석은 잔존하지 않고 각 초석 위치에 적심시설만 확인되었다(2022 보고서 p.85).
- **foundation.jeoksim_grid** — 2022 보고서 p.85: A건물지 적심 직경은 220~280cm, 깊이는 204cm이며, 대지성토·기단 조성 후 되파기 공법으로 9단의 천석과 잡석을 층층이 쌓아 축조하였다. 초석과 기단 상부 부재는 잔존하지 않고 각 초석 위치에 적심시설만 확인되었다.
- **entrance.south.left** — 2022 보고서 p.85: 출입시설은 남편 좌·우 2개소와 북편 중앙 1개소이며, 남편 출입시설 2개소에는 모두 답도(踏道)가 확인되었다. 이 feature는 남편 좌측 출입시설(답도)이다. 계단 중앙 답도를 기준으로 양쪽에 계단을 두는 구조로 추정된다.
- **entrance.south.right** — 2022 보고서 p.85: 출입시설은 남편 좌·우 2개소와 북편 중앙 1개소이며, 남편 출입시설 2개소에는 모두 답도(踏道)가 확인되었다. 이 feature는 남편 우측 출입시설(답도)이다. 계단 중앙 답도를 기준으로 양쪽에 계단을 두는 구조로 추정된다.
- **entrance.north.center** — 2022 보고서 p.85: 북편 중앙에 1개소의 출입시설이 있으며, 양쪽에서 3~5열의 낙수받이(보도)시설이 확인되었고 가공 석재 5매 중 일부가 계단지 위치로 추정된다.
- **corridor.east_wing** — 2018 초록에서 동서편 익랑이 확인되었다고 보고한다. 2022 고찰(p.316)은 동익랑 최서편 적심 재검토를 통해 동·서익랑의 규모를 잠정 3×1칸으로 판단한다.
- **corridor.west_wing** — 2022 보고서 p.107-110: 서익랑지는 A건물지 서편 적심 중앙에서 5.1~5.3m 떨어져 확인되었고, 정면 3칸 × 측면 1칸, 정면 길이 10.1m·측면 너비 최대 4.2m, 주칸 정면 3.2~3.5m·측면 3.8~4.2m, 적심 직경 160~220cm(평균 192cm)이다. 고찰(p.316)은 동·서익랑을 잠정 3×1칸으로 정리한다.
- **walkway.drainage_or_paved_facility** — 2022 보고서 p.85: 북편 출입시설 양쪽에서 3~5열의 낙수받이(보도)시설이 확인되었고, 전(塼)을 한 줄은 세우고 한 줄은 평평하게 깔아 두 줄을 평행하게 두고 그 외연에 장방형 전을 비스듬히 깔았다. 이 시설로 건물지 전체 평면 규모를 추정하였다. 고찰(p.311)은 기능을 보도 가능성을 배제할 수 없으나 낙수받이시설로 보는 것이 합리적이라고 판단한다. 2018 초록은 전축 보도시설로 기술한다.
- **ritual.earthquake_charm** — 2018 초록은 축조연대 추정이 가능한 지진구 확인을 보고한다. 2022 보고서 p.103은 진단구 2개체(단경호 2점 세트 / 상부 인화문 개+하부 단경호, Ⅲ-1층 내)를 서술하며, 지영배 2023(p.859)은 이를 7세기 후반으로 편년되는 진단구 2개체(4점)로 정리한다.
- **land_preparation.layer** — 2022 보고서 p.103: 성토(대지조성) 두께는 북편 트렌치 1.9m, A건물지 중앙부 1.3m, 남편 1.4m로 지점별 차이가 있으나 동일 시기에 유사한 토양으로 대규모 성토된 것으로 파악되며, 습지층 상면(북 50.4m, 중앙·남 50.9m)을 평탄화하였다. 김경열 2023 초록은 약 2m 대지성토를 언급한다.
- **land_preparation.prior_phase_candidate** — 2022 보고서는 성토층 하부의 3~4세기 토기·수혈·주혈(W형 단면 수혈의 3세기 와질토기 노형토기편 포함)을 근거로 동궁과 월지 축조 이전 3~4세기 선대 유적의 존재 가능성이 높다고 기술한다(p.95-99, 103). 지영배 2023은 이와 별도로 5C 후엽 선대 대지조성층을 설정한다(p.876).
- **surrounding.south_line_foundation.building.01** — 공식 보고서 초록에서 A건물지 남편 대지에 2동의 줄기초 건물지가 확인되었다고 보고한다. 이 feature는 그중 1동이며, 개별 위치·규모는 미확정이다. 2022 보고서 p.106은 남편 트렌치에서 평면상 줄기초 건물과 지름 약 110cm의 적심을 확인하고, A건물지와의 선후관계 파악을 위한 추가 조사가 필요하다고 서술한다.
- **surrounding.south_line_foundation.building.02** — 공식 보고서 초록에서 A건물지 남편 대지에 2동의 줄기초 건물지가 확인되었다고 보고한다. 이 feature는 그중 1동이며, 개별 위치·규모는 미확정이다. 2022 보고서 p.106은 남편 트렌치에서 평면상 줄기초 건물과 지름 약 110cm의 적심을 확인하고, A건물지와의 선후관계 파악을 위한 추가 조사가 필요하다고 서술한다.
- **corridor.west_corridor** — 2022 보고서 p.115-119: 서회랑지는 A건물지 서편 기단적심석열에서 약 10.4m 서쪽에서 확인되었으며, 6기의 회랑 적심(직경 150~190cm, 평균 163cm)과 회랑석축기단이 확인되었다. 회랑 동편에서 내측 기단 관련 추정 구상유구도 확인되었다.
- **corridor.west_corridor_stone_platform** — 2022 보고서 p.115-117: 서회랑 석축기단이 확인되었고 평면·입단면은 도면12(p.117)에 수록되어 있다. 고찰은 최소 5단의 사고석(장대석 포함)으로 켜켜이 쌓인 석축으로 정리하며(p.309, 316), A·B·C건물지 전체를 감싸는 1곽의 석축기단이자 동궁과 월지 서쪽 경계로 판단한다(p.84, 316). 맺음말(p.334)은 석축기단이 총 5단으로 4~5단은 미치석 대형 기초석, 1~3단은 치석된 사고석·장대석 교차 축조임을 상술한다.
- **trench.north** — 2022 보고서 p.98-99: 북편 트렌치는 2021년 북쪽으로 확장되어 길이 약 15m·폭 4m·깊이 3.3m(해발 49.6~52.9m)로 굴착되었고, 시기가 다른 최소 2개 문화층(대지조성 전 유구/후 유구)이 확인되었다. 지영배 2023(p.857)은 이 트렌치를 8개 대별층으로 구분해 재검토한다.
- **stratigraphy.layers** — 북편 트렌치는 기반층(Ⅷ)→습지층(Ⅶ)→선대 유구층(Ⅵ, 3세기 전후 와질토기)→대지조성층(Ⅴ: 수평축토층 Ⅴ-3·보토시설층 Ⅴ-2·성토 상부층 Ⅴ-1)→매립층(Ⅳ)→통일신라 문화층(Ⅲ)→근현대(Ⅱ)→교란·복토(Ⅰ)의 8개 대별층으로 구분된다(지영배 2023 p.857; 2022 보고서 p.95-99의 남·북편 트렌치 층서 서술 합치). 습지층 두께 약 70cm, 대지조성층 1~1.2m(남편) 등 지점별 두께가 보고되어 있다.
- **land_preparation.multistage** — 2022 보고서 p.98은 대지조성과 A건물지 축조 사이에 공정상의 선후관계가 존재하고 성토 전후로 시기가 다른 문화층이 있음을 보고한다. 지영배 2023은 토층·유물·방사성탄소연대(C14 불연속, p.867)·東池 논의를 근거로 대지조성이 단기간이 아니라 시간 간격과 단계를 가진 다단계 조성임을 논한다(p.855).
- **late_use.disturbance_and_discard** — 2022 보고서는 1·2군 기와무지와 1~4호 수혈 등 후대 사용 관련 유구(p.84), 서익랑 일대의 근·현대 교란과 적심 상부 훼손·삭평(p.107-108), 낙수받이시설 전의 탈락 양상(p.311)을 보고한다.

## 전체 feature: fact vs render confidence

| feature | fact | render | geometry 상태 |
|---|---|---|---|
| source_context.official_2018_report | E1 | E5 | 공간 지오메트리 없음 |
| source_context.2022_full_report_candidate | E5 | E5 | 공간 지오메트리 없음 |
| site_context.wolji_west | E1 | DEMO | 상대 placeholder (실측 아님) |
| context.historical_name_donggung_wolji | E1 | E5 | 공간 지오메트리 없음 |
| context.legacy_west_donggung_interpretation | E2 | E5 | 공간 지오메트리 없음 |
| context.western_royal_space_interpretation | E4 | E5 | 공간 지오메트리 없음 |
| context.eastern_donggung_reinterpretation | E4 | E5 | 공간 지오메트리 없음 |
| context.wolji_water_edge | E2 | DEMO | 상대 placeholder (실측 아님) |
| context.wolseong_relation | E4 | DEMO | 상대 placeholder (실측 아님) |
| layout.grid.seven_by_four | E1 | E2 | bay-grid |
| layout.main_axis | E1 | DEMO | 상대 placeholder (실측 아님) |
| layout.omitted_inner_columns | E1 | DEMO | 상대 placeholder (실측 아님) |
| platform.main_building | E1 | DEMO | 상대 placeholder (실측 아님) |
| foundation.general_layout | E1 | DEMO | 상대 placeholder (실측 아님) |
| foundation.jeoksim_grid | E1 | DEMO | 상대 placeholder (실측 아님) |
| entrance.south.left | E1 | DEMO | 상대 placeholder (실측 아님) |
| entrance.south.right | E1 | DEMO | 상대 placeholder (실측 아님) |
| entrance.north.center | E1 | DEMO | 상대 placeholder (실측 아님) |
| corridor.east_wing | E1 | DEMO | 상대 placeholder (실측 아님) |
| corridor.west_wing | E1 | E2 | wing-volume |
| walkway.drainage_or_paved_facility | E1 | DEMO | 상대 placeholder (실측 아님) |
| ritual.earthquake_charm | E1 | DEMO | 상대 placeholder (실측 아님) |
| land_preparation.layer | E1 | DEMO | 상대 placeholder (실측 아님) |
| land_preparation.prior_phase_candidate | E1 | DEMO | 상대 placeholder (실측 아님) |
| surrounding.south_line_foundation.building.01 | E1 | DEMO | 상대 placeholder (실측 아님) |
| surrounding.south_line_foundation.building.02 | E1 | DEMO | 상대 placeholder (실측 아님) |
| movement.primary_entrance_axis | E4 | DEMO | 상대 placeholder (실측 아님) |
| movement.corridor_connection_east | E4 | DEMO | 상대 placeholder (실측 아님) |
| movement.corridor_connection_west | E4 | DEMO | 상대 placeholder (실측 아님) |
| superstructure.column_grid.symbolic | E4 | DEMO | 상대 placeholder (실측 아님) |
| superstructure.roof_mass.ghost | E5 | DEMO | 상대 placeholder (실측 아님) |
| uncertainty.superstructure_height | E5 | E5 | 공간 지오메트리 없음 |
| uncertainty.roof_type | E5 | E5 | 공간 지오메트리 없음 |
| uncertainty.function_interpretation | E5 | E5 | 공간 지오메트리 없음 |
| hypothesis.layer.royal_formal_space | E5 | E5 | 공간 지오메트리 없음 |
| hypothesis.layer.prince_palace_legacy | E5 | E5 | 공간 지오메트리 없음 |
| hypothesis.layer.ritual_audience_banquet | E5 | E5 | 공간 지오메트리 없음 |
| corridor.west_corridor | E1 | DEMO | 상대 placeholder (실측 아님) |
| corridor.west_corridor_stone_platform | E1 | DEMO | 상대 placeholder (실측 아님) |
| trench.north | E1 | E2 | trench-volume |
| stratigraphy.layers | E1 | E2 | 2.5d-stratigraphy-section |
| land_preparation.multistage | E1 | E5 | phase-annotation |
| boto_facility | E2 | E2 | wall-like-fill-feature |
| pre_wolji_dongji | E4 | DEMO | 상대 placeholder (실측 아님) |
| late_use.disturbance_and_discard | E1 | DEMO | 상대 placeholder (실측 아님) |

## DEMO / 상대 geometry placeholder 목록

- **site_context.wolji_west** (site-placement) — 정확한 좌표·범위는 도면 ingest 후 확정.
- **context.wolji_water_edge** (water-plane) — 실제 호안선 형태·거리는 도면 ingest 후 확정. / H3 기능축 표시는 이 layer가 있어야 가능하다.
- **context.wolseong_relation** (direction-marker) — 정확한 거리·축선은 도면 ingest 후 확정.
- **layout.main_axis** (axis-line) — 장축 방향(동서)·군 배치 축(남북)은 보고서 근거 E1 / 방위각·좌표 수치는 미확정 — 화면 배치는 상대 표시
- **layout.omitted_inner_columns** (omitted-column-zone) — 내진감주와 4개소 공백은 보고서 근거 E1 / 생략 적심의 정확한 그리드 좌표는 도면 디지타이즈 전까지 미확정 — 중앙부 symbolic hatch로만 표시 / 기능 해석(어좌·정전 등)은 hypothesis panel에서만 다룸
- **platform.main_building** (platform-mass) — 가구식기단 판단·부재 상태는 보고서 p.85 근거 E1 / 기단 높이 실측치는 null — placeholder
- **foundation.general_layout** (foundation-footprint) — 개별 기초 위치는 source locator 확보 후만 표시 가능.
- **foundation.jeoksim_grid** (rubble-pad-grid) — 적심 제원(직경·깊이·축조법)은 보고서 p.85 근거 E1 / 개별 적심의 실제 좌표는 도면 디지타이즈 전까지 미확정 — 패드 위치는 칸 그리드 파생 symbolic / rubble 질감 표현은 시각화이며 실측 형상이 아님
- **entrance.south.left** (entrance-marker) — 출입시설의 변(남/북)과 좌·우·중앙 구분은 보고서 p.85 근거 E1 / 답도 확인은 E1. 답도 스트립의 세부 치수는 placeholder / 기단선상 정확한 위치는 도면 디지타이즈 전까지 미확정
- **entrance.south.right** (entrance-marker) — 출입시설의 변(남/북)과 좌·우·중앙 구분은 보고서 p.85 근거 E1 / 답도 확인은 E1. 답도 스트립의 세부 치수는 placeholder / 기단선상 정확한 위치는 도면 디지타이즈 전까지 미확정
- **entrance.north.center** (entrance-marker) — 출입시설의 변(남/북)과 좌·우·중앙 구분은 보고서 p.85 근거 E1 / 북편 계단지 복원 위치는 추정(석재 5매 중 일부) / 기단선상 정확한 위치는 도면 디지타이즈 전까지 미확정
- **corridor.east_wing** (wing-volume) — 익랑 존재는 E1 / 동익랑 세부 배치는 1970년대 조사분 재검토 대상 — 잠정 3×1칸(p.316) / 규모·정확 위치는 placeholder
- **walkway.drainage_or_paved_facility** (procedural-brick-strip) — 시설 존재·재료(전)·부설 방식은 보고서 근거 E1 / 기능(낙수받이 vs 보도)은 고찰의 판단을 따르되 배제 불가 단서 유지 / 타일 모듈·정확 범위는 placeholder
- **ritual.earthquake_charm** (find-marker) — 진단구 확인·개체 구성은 보고서 근거 E1, 편년(7세기 후반)은 지영배 2023 근거 E2 / 출토 지점 표시는 북편 트렌치 일대 근사 — 정확 좌표는 도면 디지타이즈 전까지 미확정
- **land_preparation.layer** (fill-layer-volume) — 성토 두께·평탄화는 보고서 p.103 근거 E1 / 「약 2m」는 김경열 2023 초록의 개괄 표현 / geometry 두께 표현은 상대 스케일
- **land_preparation.prior_phase_candidate** (under-layer-hint) — 선대 유구·유물 확인과 가능성 평가는 보고서 근거 E1 / 5C 후엽 선대 대지조성 설정은 지영배 2023의 해석(E4)
- **surrounding.south_line_foundation.building.01** (line-foundation-footprint) — 2동 존재는 E1, 개별 배치는 placeholder.
- **surrounding.south_line_foundation.building.02** (line-foundation-footprint) — 2동 존재는 E1, 개별 배치는 placeholder.
- **movement.primary_entrance_axis** (movement-axis) — 동선축은 해석이며 유구 사실이 아니다.
- **movement.corridor_connection_east** (movement-link) — 연결 동선은 해석이며 유구 사실이 아니다.
- **movement.corridor_connection_west** (movement-link) — 연결 동선은 해석이며 유구 사실이 아니다.
- **superstructure.column_grid.symbolic** (symbolic-column-grid) — symbolic 마커이며 발굴 기초 위치가 아니다. / 기둥 높이는 null.
- **superstructure.roof_mass.ghost** (ghost-roof-mass) — 지붕 형식·공포 양식은 이 사이트에 지정되지 않음(not assigned for this site). / ghost mass는 규모 추정이 아니다.
- **corridor.west_corridor** (corridor-strip) — 서회랑지 존재·적심 제원은 보고서 p.115-119 근거 E1 / 배치는 상대 표시 — 도면 디지타이즈 전까지 좌표 미확정
- **corridor.west_corridor_stone_platform** (layered-stone-platform) — 석축기단 존재·단수(최소 5단)는 보고서 근거 E1 / 연장·좌표는 미확정 — layered 표현은 시각화
- **pre_wolji_dongji** (water-plane-hint) — 東池 경관은 추정(E4) — 확정 유구가 아님 / 수성퇴적 흔적 관찰은 E2 / H3 기능축과 P0 선대 단계 표시의 전제 컨텍스트
- **late_use.disturbance_and_discard** (annotation-scatter) — 후대 유구·교란의 존재는 E1, 개별 위치는 상징 표시

## 미확정(소스 locator 필요) 항목

- 칸 간격(bay spacing), 좌표, 기단 높이, 초석 치수, 감주 정확 위치, 보도 타일 모듈: 전부 null — PDF/도면 ingest 후 확정 (source required).
- 지붕 형식·공포 양식: 이 사이트에 지정하지 않는다 (unresolved).

