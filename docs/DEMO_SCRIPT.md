# DEMO SCRIPT — GONGPO-DONGGUNG PRO v0.9.2

실행: `npm run goal:core` → `npm run goal:web` → `web/out`을 정적 서빙 (또는 `npm run web:dev`).

## 장면 1 — E1 사실과 DEMO geometry 분리

1. `발굴유구` 탭에서 「7×4칸 평면 그리드」 feature를 클릭한다.
2. evidence drawer가 두 배지를 분리해 보여준다:
   - 사실 layer: **E1 공식 보고 사실** — 2018 보고서 초록 근거, locator 표시.
   - 표시 layer: **DEMO 상대 placeholder** — 칸 간격 실측치는 null.
3. 포인트: 소스가 뒷받침하는 사실은 E1을 유지하고, 화면 배치 정밀도만 DEMO다.
   화면 좌하단 오버레이가 항상 "상대 placeholder — 실측 아님 (source required)"를 고지한다.

## 장면 2 — H1/H2/H3 축 비교

1. `위계/기능 해석` 탭으로 이동한다.
2. 세 카드가 **축 라벨**과 함께 나온다: H1·H2는 「공간·정치 비정 축」, H3는 「기능
   프로그램 축」. 패널 상단 문구가 "서로 배타적인 정답 후보가 아니다"를 명시한다.
3. H1 카드를 펼쳐 근거(E1 보고 사실 + 김경열 2023 + 2025 공식 재비정)와 **반대 근거**,
   미해결 질문을 보여준다.

## 장면 3 — H2 약화 설명

1. H2 카드의 배지를 가리킨다: **「기존 해석 / 최신 재비정으로 약화됨」**.
2. counter-evidence 두 건 — 2025-02-06 국가유산청 보도자료(동편=동궁, 서편=왕의 공간)와
   김경열 2023의 동편 비정 — 이 명칭(동궁과 월지)과 고고학적 위치 비정이 다른 문제임을
   보여준다.

## 장면 4 — 상부구조 ghost mass

1. H1을 선택하면 상부 목구조가 **반투명 generic mass**(opacity 0.18)로만 나타난다.
2. 오버레이 문구: 지붕·공포 형식은 지정하지 않는다. 기둥 마커 8×5는 칸 수(7×4)+1
   파생 symbolic 표시이며 발굴 위치가 아니다.
3. `불확실성` 탭에서 typology가 "not assigned for this site"임을 다시 확인한다.

## 장면 5 — corruption fail-closed

1. 터미널에서 `npm run corrupt`를 실행한다.
2. 15개 조작 시나리오(E1 강등, 공포 양식 주입, 지붕 형식 주입, 축 삭제, 월지 layer 삭제,
   감주 좌표 주입, 실측치 주입, 미검증 P0 소스 인용, params 불일치, commercial_safe 조작,
   hash 조작, 금지어 주입, 학술 소스 E1 승격, web/public PDF 반입, H1 김경열 근거 삭제)가
   전부 CAUGHT로 끝난다.
3. `검증 결과` 탭은 V01–V54 결과를 그대로 렌더한다 — 뷰어가 보여주는 것과 게이트가
   검사하는 것이 같은 아티팩트다.

## 장면 6 — source locator strict-mode 로드맵

1. `npm run verify:strict`를 실행한다 — **의도적으로 실패한다.**
2. 실패 항목이 곧 로드맵이다: 2022 전면 보고서 license 확정, 신라사학보·한국고고학보
   논문 저작권 확인, PDF page/figure locator ingest.
3. locator가 확보되면 exact 치수가 null에서 measured 값으로 승격되고, strict가 green이
   되는 것이 다음 마일스톤이다.

## (M2.5 추가) 장면 7 — 4-route 데모

1. `/` 발굴유구 → 제원/그리드 → 내진감주 → 대지조성·트렌치 순으로 탭 전환: rubble 적심 패드,
   25.5×15.2m 라벨, 중앙 hatch, 2.5D 층서 단면+보토 밴드가 각각 등장한다.
2. 해석축 탭에서 H1 클릭 → 관련 유구가 금색으로 강조되고 ghost mass가 반투명으로 나타난다.
3. `/verify`에서 「조작 실행」 클릭 → 해당 체크가 FAIL*로 바뀌고 「복원 거부…」 문구가 나타난다.
   전체 복원 버튼으로 원상 복구 — 파일은 전혀 변경되지 않는다.
4. `/studio`에서 「숫자 locator 없음」 필터로 잔여 과제를, `/report`에서 phase 리포트를 보여준다.

## (M2.6 추가) 장면 8 — 구조 실루엣 (constrained superstructure silhouette)

1. `구조 실루엣` 탭을 연다 — 발굴유구 위로 반투명 기둥·보 wireframe·형식 미지정
   지붕 질량 envelope가 나타나고, 오버레이와 패널에 「원형 복원 아님」·「지붕형식
   미지정」·「공포양식 미지정」·「기둥 높이 미확정」 배지가 항상 표시된다.
2. 「발굴유구만 / 실루엣 겹쳐보기」 버튼으로 유구-실루엣 비교를 보여준다.
   rubble 적심 패드는 실루엣 아래에서 계속 보인다 — 실루엣이 유구를 가리지 않는다.
3. 높이 preset(낮게/중간/높게)을 바꾼다 — 라벨이 「시각화 preset — 실측 높이 아님」
   임을 강조한다. 중앙 감주 영역은 점선 슬롯으로 남는다(「기둥 없음/미확인」).
4. 기둥 proxy를 클릭 → EvidenceDrawer가 FACT(적심 E1, p.85 locator) / RENDER(E5
   preset) / NOT CLAIMED(형식·높이·원형 재현 부정)를 분리해 보여준다.
5. 재료 트레이(기와·치미 출토 맥락)를 클릭 — 절차적 추상 마커일 뿐이며 「지붕형식
   확정 근거 아님」 경고를 확인한다. 스케일 인물은 scale helper로만 분류된다.
6. `/verify`에서 지붕→E1 조작(ui_c2)을 실행하면 proxy 지붕 envelope도 빨강 거부
   상태로 바뀐다. 실제 파이프라인 드릴은 C16~C20(형식 주입·실측 높이·감주 충전·
   이미지 반입)을 포함해 20/20 CAUGHT다.
