# ARCHAEOLOGICAL FEATURES — fact layer vs geometry layer

## 2층 corpus 구조 (patch section A/C)

canonical feature는 반드시 두 layer를 가진다.

```
fact_layer      사실 layer — 소스 초록/보고서/논문에서 확인되는 정성·구조 사실.
                confidence: E1/E2/E4 등. geometry는 null 또는 relative여도 된다.

geometry_layer  표시 layer — viewer에 필요한 상대 배치와 placeholder.
                confidence: measured locator가 없는 한 DEMO/E5.
                ui_flags.relative_geometry=true, ui_flags.not_measured=true.
```

- `feature.confidence`는 가장 잘 뒷받침되는 **사실** 주장의 요약 (= fact_layer.confidence).
- `render_confidence`는 **geometry 정밀도**의 요약 (= geometry_layer.confidence).
- 두 값은 다를 수 있고, verifier(V10/V31)는 둘을 따로 검사한다.
- 핵심 금지: **근거 있는 사실을 DEMO로 강등하지 않는다.** 예 — "7×4칸 내진감주
  대형건물지"는 공식 초록 근거 E1 사실이고, 화면의 그리드 간격만 DEMO다.

## E1 사실 (2018 공식 초록 근거)

- 7×4칸 내진감주 대형건물지 (`layout.grid.seven_by_four`, `layout.omitted_inner_columns`)
- 출입시설 3개소 (`entrance.facility.01..03` — 개수는 E1, 개별 위치는 placeholder)
- 동서편 익랑 (`corridor.east_wing`, `corridor.west_wing`)
- 전축(塼築) 보도시설 (`walkway.brick_paved` — 재료는 보고 사실, 모듈은 null)
- 축조연대 추정이 가능한 지진구(地鎭具) (`ritual.earthquake_charm`)
- 남편 대지 줄기초 건물지 2동 (`surrounding.south_line_foundation.building.01/02`)

## source locator 확보 전까지 DEMO/relative placeholder인 값

bay spacing(정면/측면), x/y/z 좌표, 감주 정확 위치, 초석 치수, 기단 높이, 보도 타일
모듈, 지붕 높이, 상부구조 질량, 지붕 typology, 공포 typology, 재료·색채 복원.

이 값들은 corpus에서 전부 `null`이며 (V22/V32), measured locator(method=measured +
소스 page/figure)가 생기기 전에는 채울 수 없다.

## 3단 배지 (agents/korean-palace-architecture.md)

UI는 모든 feature에 `보고 사실` / `구조 해석` / `기능 가설` stacked badge와 함께
fact confidence·render confidence 배지를 분리 표시한다.

## 37개 P0 feature

`params/target-site.json`의 `required_p0_features`가 정본이며 V07이 존재를 강제한다.
`superstructure.*`는 ghost/symbolic 전용(V21), `uncertainty.*` 3종은 미확정 상태
자체를 기록하는 marker다(V12).
