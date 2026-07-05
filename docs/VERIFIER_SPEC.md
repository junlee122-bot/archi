# VERIFIER SPEC — V01–V40

`scripts/verify.mjs`가 실행. 기본 모드는 fail/warn/pass 3상태, `--strict`는 warn→fail.
사이트 고유 기대값(칸 수, 필수 feature, 금지 typology 용어)은 전부
`params/target-site.json`과 corpus에 살고, 검사 코드에는 하드코딩하지 않는다.

## 기반 무결성 (V01–V04)

| ID | 내용 |
|---|---|
| V01_SCHEMA_VALID | 모든 데이터 파일이 `schemas/schemas.json` 구조를 만족 |
| V02_SOURCE_REGISTRY_INTEGRITY | source id 유일, license/license_verified 필드 존재 |
| V03_EVIDENCE_SOURCE_LINKAGE | 모든 evidence.source_id가 레지스트리에 존재 |
| V04_SEGMENT_LINKAGE | evidence.source_segment_id가 존재하고 소스 일치 |

## 사실·geometry 일관성 (V05–V12)

| ID | 내용 |
|---|---|
| V05_GRID_SOURCE_CONSISTENCY | (구 V05_GRID_7_BY_4 대체) grid feature 존재, fact_layer에 정수 bays_front/bays_side, E1급 evidence 또는 명시적 fallback seed warning, params.expected_bays와 일치. **verifier 내부에 7×4 하드코딩 없음** — 5×3 전치 fixture 테스트로 증명. measured locator 없으면 exact spacing 요구 금지 |
| V06_CONFIDENCE_ENUM | 모든 confidence가 E1–E5/DEMO enum |
| V07_REQUIRED_P0_FEATURES | 필수 P0 feature 37종 존재, id 유일, corpus ≥ 30 |
| V08_EVIDENCE_PRESENT | 두 layer 모두 evidence 비어 있지 않음 |
| V09_DEMO_SOURCE_POLICY | internal rule 소스는 DEMO/E5로만 인용, E1–E4 사실엔 외부 소스 필수 |
| V10_CONFIDENCE_CONSISTENT | confidence=fact_layer, render=geometry_layer, 사실 confidence ≤ evidence 지원 |
| V11_RELATIVE_GEOMETRY_FLAGS | DEMO geometry엔 relative_geometry/not_measured 플래그 |
| V12_UNCERTAINTY_MARKERS_PRESENT | 불확실성 marker 3종 존재 |

## 가설·phase (V13–V18)

| ID | 내용 |
|---|---|
| V13_HYPOTHESIS_FEATURE_LINKS | 가설이 참조하는 feature 전부 존재 |
| V14_HYPOTHESIS_COUNTER_EVIDENCE | 모든 가설에 반대 근거 의무 |
| V15_HYPOTHESIS_CONFIDENCE_CAP | 해석 가설 상한 E4, 근거 등급 초과 금지 |
| V16_PHASE_SOURCES | 소스 없는 phase 금지 |
| V17_PHASE_CONFIDENCE_CAP | phase confidence ≤ 소스 지원 상한 |
| V18_PHASE_FEATURE_LINKS | phase visible_features 전부 존재 |

## license·아티팩트 (V19–V30)

| ID | 내용 |
|---|---|
| V19_GATE_R_LICENSE | GATE_R: P0 to_verify는 미사용 후보만 허용(사용 시 fail, strict는 존재만으로 fail), commercial_safe 계산 일치 |
| V20_NO_SOURCE_MEDIA_IN_WEB_PUBLIC | web/public에 PDF/TIF 금지, raster는 ALLOWED_ASSETS 신고제 |
| V21_SUPERSTRUCTURE_GHOST_ONLY | superstructure.*는 ghost=true, render_layer=hypothesis_ghost, DEMO/E5 |
| V22_EXACT_DIMENSIONS_NULL_WITHOUT_LOCATOR | `*_mm`/`*_coordinates`는 measured locator 없이는 null |
| V23_ARTIFACT_INTEGRITY | spec integrity hash 재계산 일치 + input hash 신선도 |
| V24_MODE_TABS | mode tabs가 params template 전개와 일치 (8종) |
| V25_AXIS_LABELS_IN_SPEC | spec 가설에 axis + axis_label_ko |
| V26_WARNINGS_SURFACED | DEMO geometry엔 warnings 필수 |
| V27_ACCESS_DATES | verified source에 accessed 날짜 (warn) |
| V28_SPEC_FORBIDDEN_LANGUAGE | 생성 spec의 user-facing 문자열 금지어 검사 |
| V29_COMMERCIAL_SAFE_CONSISTENT | spec commercial_safe = 재계산값 |
| V30_DETERMINISTIC_BUILD | 두 번 derive → 동일 출력 |

## PATCH 신설 (V31–V40)

| ID | 내용 |
|---|---|
| V31_FACT_GEOMETRY_LAYER_SEPARATION | 두 layer confidence 각각 존재. DEMO geometry가 E1 사실을 강등 금지, fact_layer는 DEMO 불가, E1이 exact geometry를 함의 금지 |
| V32_NO_EXACT_POSITION_WITHOUT_LOCATOR | omitted_positions 좌표는 locator 없이는 금지, symbolic zone은 DEMO로 허용 |
| V33_BRACKET_TYPOLOGY_FORBIDDEN | bracket_typology는 null 강제. params의 금지 용어(주심포·다포·익공·하앙·공포·첨차·소로·살미)가 부정 문맥 없이 진술에 등장하면 fail. UI 등장 시 "not assigned for this site"로만 |
| V34_ROOF_TYPOLOGY_FORBIDDEN | roof_type null 강제, generic ghost mass만 허용, 팔작/맞배/우진각 기본 assign 금지 |
| V35_HYPOTHESIS_AXIS_MODEL | 축 선언 필수 (spatial_political_attribution/functional_program/historiography), 상호배타 3택 표시 금지 |
| V36_WOLJI_CONTEXT_REQUIRED_FOR_FUNCTION_HYPOTHESIS | H3는 context.wolji_water_edge 없이는 render 불가 |
| V37_LEGACY_INTERPRETATION_BADGE | H2 legacy/약화 배지 + counter evidence |
| V38_SOURCE_LICENSE_MIXED_POLICY | 소스별 개별 license, 전역 가정 금지, Type4 human-review 플래그, unknown/to_verify/Type4 사용 시 commercial_safe=false |
| V39_FORBIDDEN_LANGUAGE_USER_FACING_ONLY | user-facing 표면만 검사. 금지어 목록·부정 문맥·인용·코드 주석은 예외. 공개 UI가 확정적 복원을 주장하면 fail |
| V40_COLUMN_GRID_DERIVED_FROM_BAYS | symbolic 기둥은 bays+1 파생·DEMO/E5 전용, 발굴 위치는 source locator 필수 |

## M1.5 신설 (V41–V50)

| ID | 내용 |
|---|---|
| V41_SOURCE_SEGMENT_LOCATOR_BACKING | 외부 소스를 인용하는 모든 E1/E2 evidence는 locator.page가 있는 segment로 연결 의무. 모든 segment는 locator.page 보유 |
| V42_REPORT_DIMENSION_TO_GEOMETRY_DISCLOSURE | 보고 치수를 가진 feature의 geometry_mode는 report_dimension_scaled/symbolic 공시 의무. derived footprint는 fact_layer 치수와 일치, 칸 분할 가정 공시. **주의: 치수 스케일 공시는 exact mm 값(칸 간격 등)을 해금하지 않는다 — exact 값은 method=measured locator 전용 (C07 드릴이 집행)** |
| V43_NO_PUBLIC_PDF_ASSET | web/ 하위에 PDF/HWP/TIF 금지 + git 추적 파일에 PDF/HWP 금지. source_packets/*.pdf는 gitignore |
| V44_ACADEMIC_ARTICLE_USAGE_LIMIT | 학술 논문 evidence는 E1 불가, geometry 사용 불가(공시된 치수 스케일 제외), missing_source 논문은 abstract-level locator만 |
| V45_H2_LEE2023_BACKING | H2는 이현태 2023 page locator 근거를 supporting과 counter 양쪽에 보유 의무 |
| V46_PHASE_JI2023_BACKING | 선대 단계(P0/P1)와 Ji-backed feature 5종은 지영배 2023 page locator 근거 의무 |
| V47_REPORT2022_CORE_FEATURE_BACKING | params.report2022_core_features 10종은 2022 보고서 숫자 page locator 근거 의무 |
| V48_VIEWER_ROUTE_COMPLETENESS | 뷰어 8모드 처리·컴포넌트 완결성 (web/ 부재 시 core-only로 skip, M2에서 재검사) |
| V49_PRESENTATION_PREVIEW_REQUIRED | artifacts/preview manifest 존재, 파일은 internal_viewer_render만 (소스 이미지 금지) |
| V50_CORRUPTION_UI_REQUIRED | corruption 드릴 ≥12 시나리오, copy:web 스테이징, VerificationPanel 표시, fail_closed=true (리포트 미생성은 warn) |

## 금지어 scanner 세부 (V39 / check-forbidden-language.mjs)

검사 대상: `web/app/**/*.tsx`, `web/components/**/*.tsx`, 생성 공개 리포트,
README 공개 섹션, `docs/DEMO_SCRIPT.md`.

예외 처리: 이 문서와 SOURCE_POLICY의 금지어 목록 섹션, `forbiddenTerms` 배열 내부
문자열, 코드 주석, 부정 문맥 문장(금지 / 사용하지 않는다 / must not / do not /
not a / 아니다 등).
