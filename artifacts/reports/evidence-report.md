# Evidence Report — 경주 동궁과 월지 서편 A건물지

사실(fact) confidence와 표시(render) confidence는 별개다. 아래 표의 geometry는 모두 발굴유구 기반 표시이며, DEMO는 시각화용 상대 placeholder를 뜻한다.

## 사실 layer가 E1(공식 보고 사실)인 feature

- **source_context.official_2018_report** — 『경주 동궁과 월지 복원정비사업 발굴조사보고서 - A건물지 -』(2018, 국립경주문화유산연구소)가 공식 원문 페이지에서 확인되며, 이 프로젝트 fact_layer의 1차 근거 소스다.
- **context.historical_name_donggung_wolji** — 현행 공식 명칭으로 「경주 동궁과 월지」가 사용되며, 2018 보고서 표제에서도 확인된다. 명칭 자체가 동궁의 위치를 고고학적으로 확정하는 것은 아니다.
- **layout.grid.seven_by_four** — 공식 보고서 초록에서 A건물지를 7×4칸 내진감주 대형건물지로 설명한다.
- **layout.omitted_inner_columns** — 보고서 초록은 A건물지를 내진감주된 대형건물지로 설명한다.
- **foundation.general_layout** — A건물지는 대형건물지로 보고되었으며 기초 유구가 확인된다. 개별 기초의 정확한 배치·치수는 도면 확인 전 미확정이다.
- **entrance.facility.01** — 공식 보고서 초록에서 A건물지에 출입시설 3개소가 확인되었다고 보고한다. 이 feature는 그중 1개소를 나타내며, 개별 위치는 도면 확인 전 미확정이다.
- **entrance.facility.02** — 공식 보고서 초록에서 A건물지에 출입시설 3개소가 확인되었다고 보고한다. 이 feature는 그중 1개소를 나타내며, 개별 위치는 도면 확인 전 미확정이다.
- **entrance.facility.03** — 공식 보고서 초록에서 A건물지에 출입시설 3개소가 확인되었다고 보고한다. 이 feature는 그중 1개소를 나타내며, 개별 위치는 도면 확인 전 미확정이다.
- **corridor.east_wing** — 공식 보고서 초록에서 동서편 익랑이 확인되었다고 보고한다. 이 feature는 동편 익랑이다.
- **corridor.west_wing** — 공식 보고서 초록에서 동서편 익랑이 확인되었다고 보고한다. 이 feature는 서편 익랑이다.
- **walkway.brick_paved** — 공식 보고서 초록에서 건물지 전체에 전(塼)으로 축조한 보도시설이 확인되었다고 보고한다. 재료(전)는 보고 사실이나, 타일 모듈·정확 범위는 미확정이다.
- **ritual.earthquake_charm** — 공식 보고서 초록에서 축조연대 추정이 가능한 지진구가 확인되었다고 보고한다. 출토 위치·세부 내용은 도면·본문 확인 전 미확정이다.
- **surrounding.south_line_foundation.building.01** — 공식 보고서 초록에서 A건물지 남편 대지에 2동의 줄기초 건물지가 확인되었다고 보고한다. 이 feature는 그중 1동이며, 개별 위치·규모는 미확정이다.
- **surrounding.south_line_foundation.building.02** — 공식 보고서 초록에서 A건물지 남편 대지에 2동의 줄기초 건물지가 확인되었다고 보고한다. 이 feature는 그중 1동이며, 개별 위치·규모는 미확정이다.

## 전체 feature: fact vs render confidence

| feature | fact | render | geometry 상태 |
|---|---|---|---|
| source_context.official_2018_report | E1 | E5 | 공간 지오메트리 없음 |
| source_context.2022_full_report_candidate | E5 | E5 | 공간 지오메트리 없음 |
| site_context.wolji_west | E2 | DEMO | 상대 placeholder (실측 아님) |
| context.historical_name_donggung_wolji | E1 | E5 | 공간 지오메트리 없음 |
| context.legacy_west_donggung_interpretation | E4 | E5 | 공간 지오메트리 없음 |
| context.western_royal_space_interpretation | E4 | E5 | 공간 지오메트리 없음 |
| context.eastern_donggung_reinterpretation | E4 | E5 | 공간 지오메트리 없음 |
| context.wolji_water_edge | E2 | DEMO | 상대 placeholder (실측 아님) |
| context.wolseong_relation | E4 | DEMO | 상대 placeholder (실측 아님) |
| layout.grid.seven_by_four | E1 | DEMO | 상대 placeholder (실측 아님) |
| layout.main_axis | E5 | DEMO | 상대 placeholder (실측 아님) |
| layout.omitted_inner_columns | E1 | DEMO | 상대 placeholder (실측 아님) |
| platform.main_building | E2 | DEMO | 상대 placeholder (실측 아님) |
| foundation.general_layout | E1 | DEMO | 상대 placeholder (실측 아님) |
| foundation.stone_or_jeoksim_grid | E5 | DEMO | 상대 placeholder (실측 아님) |
| entrance.facility.01 | E1 | DEMO | 상대 placeholder (실측 아님) |
| entrance.facility.02 | E1 | DEMO | 상대 placeholder (실측 아님) |
| entrance.facility.03 | E1 | DEMO | 상대 placeholder (실측 아님) |
| corridor.east_wing | E1 | DEMO | 상대 placeholder (실측 아님) |
| corridor.west_wing | E1 | DEMO | 상대 placeholder (실측 아님) |
| walkway.brick_paved | E1 | DEMO | 상대 placeholder (실측 아님) |
| ritual.earthquake_charm | E1 | DEMO | 상대 placeholder (실측 아님) |
| land_preparation.layer | E2 | DEMO | 상대 placeholder (실측 아님) |
| land_preparation.prior_phase_candidate | E4 | DEMO | 상대 placeholder (실측 아님) |
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

## DEMO / 상대 geometry placeholder 목록

- **site_context.wolji_west** (site-placement) — 정확한 좌표·범위는 도면 ingest 후 확정.
- **context.wolji_water_edge** (water-plane) — 실제 호안선 형태·거리는 도면 ingest 후 확정. / H3 기능축 표시는 이 layer가 있어야 가능하다.
- **context.wolseong_relation** (direction-marker) — 정확한 거리·축선은 도면 ingest 후 확정.
- **layout.grid.seven_by_four** (bay-grid) — 정성 사실은 보고서 근거 E1 / 정확한 칸 간격과 좌표는 PDF/도면 ingest 후 확정 / 현재 geometry는 상대 배치
- **layout.main_axis** (axis-line) — 방위는 표시용 가정이며 소스 근거가 없다.
- **layout.omitted_inner_columns** (omitted-column-zone) — 내진감주는 보고서 기술 E1 / 정확한 생략 기둥 좌표는 아직 확정하지 않음 / 기능 해석은 별도 hypothesis panel에서만 다룸
- **platform.main_building** (platform-mass) — 기단 실측치는 null. PDF/도면 ingest 후 확정.
- **foundation.general_layout** (foundation-footprint) — 개별 기초 위치는 source locator 확보 후만 표시 가능.
- **foundation.stone_or_jeoksim_grid** (symbolic-foundation-markers) — symbolic 마커이며 실제 초석/적심 위치가 아니다.
- **entrance.facility.01** (entrance-marker) — 개수(3개소)는 E1, 개별 위치는 placeholder.
- **entrance.facility.02** (entrance-marker) — 개수(3개소)는 E1, 개별 위치는 placeholder.
- **entrance.facility.03** (entrance-marker) — 개수(3개소)는 E1, 개별 위치는 placeholder.
- **corridor.east_wing** (wing-volume) — 익랑 존재는 E1, 규모·정확 위치는 placeholder.
- **corridor.west_wing** (wing-volume) — 익랑 존재는 E1, 규모·정확 위치는 placeholder.
- **walkway.brick_paved** (walkway-strip) — 보도시설 존재·재료는 E1, 범위·모듈은 placeholder.
- **ritual.earthquake_charm** (find-marker) — 지진구 확인은 E1, 출토 지점은 placeholder. / feature id의 earthquake_charm은 관례적 표기이며 실제 의미는 지진구(地鎭具, 진단구)다.
- **land_preparation.layer** (fill-layer-volume) — 「약 2m」는 논문 초록의 언급이며 본 프로젝트 실측치가 아니다. geometry 수치는 null.
- **land_preparation.prior_phase_candidate** (under-layer-hint) — 해석 단계 feature이며 확정 유구가 아니다.
- **surrounding.south_line_foundation.building.01** (line-foundation-footprint) — 2동 존재는 E1, 개별 배치는 placeholder.
- **surrounding.south_line_foundation.building.02** (line-foundation-footprint) — 2동 존재는 E1, 개별 배치는 placeholder.
- **movement.primary_entrance_axis** (movement-axis) — 동선축은 해석이며 유구 사실이 아니다.
- **movement.corridor_connection_east** (movement-link) — 연결 동선은 해석이며 유구 사실이 아니다.
- **movement.corridor_connection_west** (movement-link) — 연결 동선은 해석이며 유구 사실이 아니다.
- **superstructure.column_grid.symbolic** (symbolic-column-grid) — symbolic 마커이며 발굴 기초 위치가 아니다. / 기둥 높이는 null.
- **superstructure.roof_mass.ghost** (ghost-roof-mass) — 지붕 형식·공포 양식은 이 사이트에 지정되지 않음(not assigned for this site). / ghost mass는 규모 추정이 아니다.

## 미확정(소스 locator 필요) 항목

- 칸 간격(bay spacing), 좌표, 기단 높이, 초석 치수, 감주 정확 위치, 보도 타일 모듈: 전부 null — PDF/도면 ingest 후 확정 (source required).
- 지붕 형식·공포 양식: 이 사이트에 지정하지 않는다 (unresolved).

