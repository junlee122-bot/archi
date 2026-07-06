# Viewer Preview Checklist — M2.5

## 실행 방법 (로컬)

- npm run goal:core
- npm run web:install
- npm run goal:web
- cd web && npm run dev
- 열기: http://localhost:3000 · /studio · /verify · /report
  (정적 확인: `cd web/out && python3 -m http.server 8124`)

## 스크린샷 (실캡처 — internal render 전용)

artifacts/viewer-preview.png (메인) + artifacts/preview/*.png 11장(발표/검수 세트) — 2026-07-06 정적 빌드 headless Chromium 캡처. 파일 목록·장면은 artifacts/preview/preview-manifest.json 참조.

## route 체크리스트

- [x] `/` Public Evidence Viewer — 9모드 탭·phase timeline·해석축 패널·evidence drawer·상단 상태칩·하단 verifier 바
- [x] `/studio` Corpus Review Studio — 45 feature 테이블, 검색+5필터(locator 없음/DEMO/E5/E1/가설 연결)
- [x] `/verify` Verification Console — V01–V54, normal vs strict 설명, UI corruption 3종 + 실제 드릴 15/15
- [x] `/report` Report Viewer — 증거/가설/phase/license/checklist 카드

## 모드별 확인 사항

- [x] 발굴유구: footprint·rubble 적심 패드·출입 3개소·전 스트립·서익랑·서회랑·석축 / ghost 꺼짐
- [x] 제원/그리드: 25.5m×15.2m 라벨(p.84 배지)·7×4 그리드·스케일바 5m·좌표 미디지타이즈 고지
- [x] 내진감주: 중앙 hatch·「내진감주 해석」 배지·기능 미확정 고지·hatch 내부 패드 소거(상징)
- [x] 출입/동선: 남편 답도 스트립 2개소·북편 구분 마커·해석 라벨 화살표
- [x] 익랑·회랑: 서익랑(10.1×4.2m)·서회랑 6적심·5단 layered 석축·점선(반투명 페이드) 연장
- [x] 대지조성·트렌치: 북편 트렌치·2.5D 층서 단면(8층)·보토 세로 밴드·東池 해석 layer(북쪽)
- [x] 해석축: 축 그룹핑(공간·정치/연구사/기능), H1 「가장 강한 해석축/확정 아님/상부구조 복원 아님」, H2 legacy, H3 기능축 E5 — 클릭 시 관련 유구 강조
- [x] 불확실성: fact/render confidence 이중 배지·DEMO 반투명·E1 견고
- [x] 검증결과: verifier 요약·UI corruption 데모(빨간 표시+복원 거부 문구+복원 버튼)

## 수동 인수 체크리스트

- [ ] 지붕형식·공포양식 표기 없음 (ghost mass만) — 자동 게이트 V21/V33/V34
- [ ] web/public 내 PDF·소스 이미지 없음 — 자동 게이트 V43/V52 + no-public-pdf-assets.test
- [ ] strict RED 설명이 /verify 상단에 있음
