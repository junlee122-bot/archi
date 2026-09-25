# Viewer Preview Checklist — M2.6

## 실행 방법 (로컬)

- npm run goal:core
- npm run web:install
- npm run goal:web
- cd web && npm run dev
- 열기: http://localhost:3000 · /studio · /verify · /report
  (정적 확인: `cd web/out && python3 -m http.server 8124`)

## 스크린샷 (실캡처 — internal render 전용)

artifacts/viewer-preview.png (메인) + artifacts/preview/*.png 16장(발표/검수 11장 + M2.6 구조 실루엣 5장)
— 2026-07-08 정적 빌드 headless Chromium 캡처. 파일 목록·장면은 artifacts/preview/preview-manifest.json 참조.
비교 컷(home-archaeology-vs-silhouette-split.png)은 내부 렌더 2장을 좌우 합성한 것이다.

## route 체크리스트

- [x] `/` Public Evidence Viewer — 10모드 탭·phase timeline·해석축 패널·evidence drawer·상단 상태칩·하단 verifier 바
- [x] `/studio` Corpus Review Studio — 56 feature 테이블, 검색+5필터(locator 없음/DEMO/E5/E1/가설 연결)
- [x] `/verify` Verification Console — V01–V64, normal vs strict 설명, UI corruption 3종 + 실제 드릴 20/20
- [x] `/report` Report Viewer — 증거/가설/phase/license/checklist 카드

## 모드별 확인 사항

- [x] 발굴유구: footprint·rubble 적심 패드·출입 3개소·전 스트립·서익랑·서회랑·석축 / ghost·실루엣 꺼짐 (V60)
- [x] 제원/그리드: 25.5m×15.2m 라벨(p.84 배지)·7×4 그리드·스케일바 5m·좌표 미디지타이즈 고지
- [x] 내진감주: 중앙 hatch·「내진감주 해석」 배지·기능 미확정 고지·hatch 내부 패드 소거(상징)
- [x] 출입/동선: 남편 답도 스트립 2개소·북편 구분 마커·해석 라벨 화살표
- [x] 익랑·회랑: 서익랑(10.1×4.2m)·서회랑 6적심·5단 layered 석축·점선(반투명 페이드) 연장
- [x] 대지조성·트렌치: 북편 트렌치·2.5D 층서 단면(8층)·보토 세로 밴드·東池 해석 layer(북쪽)
- [x] 해석축: 축 그룹핑(공간·정치/연구사/기능), H1 「가장 강한 해석축/확정 아님/상부구조 복원 아님」, H2 legacy, H3 기능축 E5 — 클릭 시 관련 유구 강조 + H1 선택 시 실루엣 저불투명
- [x] **구조 실루엣(M2.6)**: 기둥 proxy(높이 preset — 실측 아님)·보 wireframe·형식 미지정 roof envelope·회랑 실루엣·재료 트레이·스케일 인물 / 감주 영역 점선 슬롯(「기둥 없음/미확인」) / 「발굴유구만·실루엣 겹쳐보기」 전환 / 배지 4종(원형 복원 아님·지붕형식 미지정·공포양식 미지정·기둥 높이 미확정) / overview drawer 기본 열림
- [x] 불확실성: fact/render confidence 이중 배지·DEMO 반투명·E1 견고 + proxy layer 불확실성 채색
- [x] 검증결과: verifier 요약·UI corruption 데모(빨간 표시+복원 거부 문구+복원 버튼) — ui_c2가 proxy 지붕도 빨강 처리

## 수동 인수 체크리스트

- [ ] 지붕형식·공포양식 표기 없음 (ghost mass·untyped envelope만) — 자동 게이트 V21/V33/V34/V56/V58
- [ ] web/public 내 PDF·소스 이미지 없음 — 자동 게이트 V43/V52/V59 + no-public-pdf-assets.test
- [ ] strict RED 설명이 /verify 상단에 있음
- [ ] 감주 영역이 기둥으로 채워지지 않음 — 자동 게이트 V62 (C19 드릴)
- [ ] 기둥 높이 preset이 「시각화 preset — 실측 높이 아님」으로 표기 — 자동 게이트 V57/V63
