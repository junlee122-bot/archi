# Superstructure Proxy Report — 구조 실루엣 (M2.6)

## 1. 목적

발굴유구만으로는 A건물지가 고위계 대형 건물이었다는 보고·해석의 공간감이 전달되지 않는다.
구조 실루엣 layer는 보고서 치수·적심 그리드·출입·회랑 등 **하부 사실에 의해 제약된 투명 표시**로
상부구조의 존재감을 보여준다. 이것은 원형 복원이 아니다 — 지붕형식·공포양식·기둥 높이를 확정하지 않는다.

## 2. 새로 추가된 proxy features

- `superstructure.proxy.overview` — 상부구조 실루엣 개요 (fact E4 / render E5)
- `superstructure.proxy.column_posts` — 기둥 proxy 실루엣 (fact E4 / render E5)
- `superstructure.proxy.beam_frame` — 보·도리 리듬 wireframe (fact E4 / render E5)
- `superstructure.proxy.roof_envelope` — 지붕 질량감 envelope(형식 미지정) (fact E4 / render E5)
- `superstructure.proxy.corridor_upper_silhouette` — 회랑 상부 실루엣 (fact E4 / render E5)
- `material_context.roof_tile_fragments` — 기와류 출토 맥락(평기와·막새·전) (fact E1 / render DEMO)
- `material_context.chimi_fragments` — 치미편 출토 맥락 (fact E1 / render DEMO)
- `scale_helper.human_silhouette` — 스케일 인물(scale helper) (fact E5 / render DEMO)
- `uncertainty.column_height_unknown` — 기둥 높이 미확정 (fact E5 / render E5)
- `uncertainty.roof_typology_unknown` — 지붕형식 미지정 (fact E5 / render E5)
- `uncertainty.bracket_typology_unknown` — 공포양식 미지정 (fact E5 / render E5)

## 3. FACT 근거 (하부 사실)

- 25.5×15.2m·7×4칸 평면과 적심 제원 — 2022 보고서 p.84-85 (E1, segment locator)
- 답도·출입시설·서회랑·석축기단 — 2022 보고서 p.85, p.107-110 (E1)
- 기와류(평기와·수막새·암막새·전)·치미편 출토 맥락 — 2022 보고서 p.12-13 화보, p.190 유물 88·89, 도판55 (E1)
- 고위계·왕궁급 속성 해석 — 김경열 2023 pp.161-162 (E4)

## 4. RENDER 방식

- 기둥: symbolic 적심 위치의 반투명 기둥. 높이는 scene-unit preset(낮게/중간/높게) — 시각화 preset — 실측 높이 아님.
- 보 프레임: 그리드 리듬만 잇는 얇은 wireframe rail. 접합부·부재 상세 표현 없음.
- 지붕: 형식 미지정 반투명 질량 volume + wire canopy. 특정 지붕형식 실루엣을 만들지 않는다.
- 회랑 실루엣: 본채보다 낮은 불투명도(0.12) + 불확정 연장 점선.
- 재료 맥락: 측면 트레이의 절차적 추상 마커 — 지붕면 위 기와 재현 없음, 보고서 도판 미사용.
- 기본 불투명도: 기둥 0.3 · 보 0.26 · 지붕 0.16 (강조 시에도 ≤ 0.28).
- 감주 영역: 감주 영역 — 기둥 없음/미확인 — 점선 슬롯 4개소, 기둥으로 채우지 않는다.

## 5. 명시적 비주장 (NOT CLAIMED)

- 지붕형식 미지정 · 공포양식 미지정 · 기둥 높이 미확정 · 배흘림 여부 미지정 · 단청 미지정
- 처마 길이·지붕 물매·용마루 장식 미지정
- 원형 복원 아님 — 확정 재현 아님. 기와·치미 출토는 지붕형식 확정 근거로 사용하지 않는다.

## 6. verifier V55–V64

- V55 proxy layer 격리 (excavated 위장·고신뢰 geometry 차단)
- V56 실루엣 형식(지붕/공포) 미지정 강제
- V57 기둥 높이 preset 전용 (실측·E1 승격 차단)
- V58 roof envelope 형식 미지정 유지
- V59 재료 맥락 추상 마커 전용 + web/public 이미지 금지
- V60 발굴유구 기본 모드 보존 (proxy 기본 OFF)
- V61 provenance 또는 직접-근거-없음 명시 의무, helper 분류 강제
- V62 감주 영역 기둥 미충전
- V63 proxy UI 경고 문구 표출 의무
- V64 실루엣 프리뷰(내부 렌더) 의무

## 7. corruption C16–C20

- C16 proxy 지붕에 형식 용어 주입 → V56/V58 거부
- C17 기둥 실측 높이+E1 승격 → V57/V55 거부
- C18 proxy 보에 공포양식 주입 → V56 거부
- C19 감주 영역 기둥 충전 → V62 거부
- C20 web/public 이미지 반입 → V59/V20 거부

## 8. screenshots

- artifacts/preview/home-structural-silhouette.png 
- artifacts/preview/home-column-frame-drawer.png 
- artifacts/preview/home-roof-envelope-warning.png 
- artifacts/preview/home-archaeology-vs-silhouette-split.png 
- 전부 내부 뷰어 실렌더 — 소스 이미지·도판 아님 (preview-manifest.json origin 필드로 강제).

## 9. remaining blockers

- 2022 보고서 license human review (to_verify) · 학회지 3종 license unknown
- 좌표 미디지타이즈 — 기둥 위치는 symbolic, 감주 위치도 상징 표현
- 상부 목구조 직접 근거 없음 — 실루엣이 E5/DEMO를 벗어날 수 없는 이유

## 10. why strict mode remains red

strict는 license·locator blocker가 해소될 때까지 의도적으로 red다. 구조 실루엣 layer는
E5/DEMO 표시 전용이므로 strict green의 전제조건이 아니며, blocker를 우회해 green으로 만들지 않는다.

