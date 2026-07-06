# HANDOFF — M1.5 locator-backed corpus sprint

기준일: 2026-07-05 · 브랜치: `claude/fable-5-gongpo-donggung-patch-y6zz03`

## 착수 시점 상태 (inspection)

- 리포 구조: `params/target-site.json` (params.yaml 없음), `data/canonical-features.json`
  (data/canonical/gyeongju_… 경로 없음 — 단일 corpus 파일), scripts/derive·verify·corrupt,
  web/app + web/components 8종. 모두 직전 스프린트(M1~M3) 산출물.
- baseline `npm run goal:core`: **green** (verify 38 pass / 2 warn / 0 fail, corruption 12/12,
  core 테스트 9종 통과) — M1.5 착수 전 기록.

## source packet 상황 (중요)

지시서의 `source_packets/*.pdf` 4개 파일과 `source_segments_seed_gongpo_m15.json`은
이 컨테이너 어디에도 존재하지 않았다 (전체 파일시스템 검색 확인). locator를 지어내는
대신 **1차 소스 원문을 직접 확보**했다:

| 파일 | 확보 경로 | 규모 |
|---|---|---|
| `source_packets/report2022_full_source.pdf` | cha.go.kr 간행물 게시판 공식 PDF (직전 스프린트에서 검증한 URL) | 112MB, 366p |
| `source_packets/lee2023_core_source.pdf` | KCI 원문 서비스 (공개, 무료) — ART002993374 | 1.0MB, 인쇄 pp.245-268 |
| `source_packets/ji2023_core_source.pdf` | KCI 원문 서비스 (공개, 무료) — ART003048877 | 9.1MB, 인쇄 pp.855-879 |
| 김경열 2023 (신라사학보 57) | **전문 미확보** — DBpia 유료. `missing_source:true`로 등록 | — |

- `source_packets/*.pdf`는 `.gitignore`에 등록 — **커밋 금지, web/public 복사 금지** (V43이 집행).
- 페이지 매핑 검증: 2022 보고서는 인쇄 페이지와 PDF 페이지가 어긋나므로(도판 등)
  본문 텍스트의 페이지 헤더로 실측 확인. Lee: 인쇄 p = PDF p + 244. Ji: 인쇄 p = PDF p + 854.

## 지시서 locator와 실제 원문의 차이 (실측으로 교정)

지시서의 페이지 번호 일부는 실제 인쇄 페이지와 다르다. **원문 실측 locator를 채택**:

- 서익랑지: p.107-110 ✓ (지시서와 일치). 서회랑지는 p.115-119, 회랑석축기단 도면 p.117.
- 내진감주 고찰: 지시서 p.307 → 실제 **p.309-310** (표2 요약 p.309, 중앙열 4개소 감주 p.310).
- 낙수받이(보도)시설 고찰: 지시서 p.308-309 → 실제 **p.311**.
- 발해 상경성 제3호 정전 비교(정전급 근거): **p.315**. 익랑 3×1칸 잠정·석축기단 5단: **p.316**.
- Lee 2023: 지시서 p.245-246, 259-263 ✓ (실제 논문 범위 pp.245-268).
- Ji 2023: p.855, 857, 859 ✓ + 본문 근거 p.867(C14), p.869/872(東池·수성퇴적), p.874(보토=방수/호안), p.876(맺음말).

## 확보된 핵심 locator-backed 사실 (요약)

- **p.84**: A건물지 정면(도리칸) 25.5m × 측면(보칸) 15.2m, 정면 7칸×측면 4칸, 중앙부 4개
  적심 미확인 → 내진감주 판단. 동서 장방형, 서편건물지군 남단.
- **p.85**: 적심 직경 220~280cm·깊이 204cm·9단 천석+잡석·되파기; 초석 미잔존, 가구식기단
  추정; 출입시설 남편 좌·우 2개소(모두 답도)+북편 중앙 1개소; 낙수받이(보도)시설 3~5열 전 축조.
- **p.95-99**: 남·북편 트렌치 층서 (Ⅷ 기반층→Ⅶ 습지층→Ⅵ 선대 유구층(3C 와질토기)→Ⅴ 대지
  조성층→Ⅳ 매립층→Ⅲ-1 통일신라 문화층); 성토 전/후 2개 문화층.
- **p.103**: 진단구 2개소(Ⅲ-1층), 성토 두께 북1.9/중앙1.3/남1.4m, 3~4세기 선대 유적 가능성 높음.
- **p.107-110 / 115-119**: 서익랑 3×1칸(10.1×4.2m, 적심 160~220cm) / 서회랑 6적심(150~190cm)+석축기단.
- **p.309-311, 315-316**: 고찰 — 내진감주=사찰 제외 신라왕경 유일 권위 속성, 발해 상경성
  제3호 정전과 거의 동일 구조, 낙수받이 기능 판단, 1곽 석축기단.
- **Lee p.246**: "국왕의 공간일 가능성이 큰 월지 서편의 A건물". **p.259**: 내진감주+답도 →
  "중앙부에 御座가 놓이는 등 正殿으로 사용되었음을 의미". **p.263**: 서편 건물군-태자궁 연결
  곤란, 동편=동궁 후보(검증 과제). **p.245-246**: '동궁(태자궁)과 월지'설 형성·2011 명칭 변경·비판.
- **Ji p.855/876**: 선대 대지조성(5C 후엽 추정), 보토시설=방수시설, 月池 이전 東池가 A건물지
  북편에 위치하는 경관 추정. **p.857/859**: 8개 대별층(Ⅴ-3 수평축토·Ⅴ-2 보토·Ⅴ-1), 보토시설
  높이 1.8m·너비 0.95m 황색 점질실트. **p.867**: C14 불연속. **p.869/872**: 수성퇴적 흔적·東池 논증.

## M1.5 결과 (완료 — goal:core GREEN)

- **사용자 packet 수령 완료**: zip 업로드로 4개 packet 파일 확보. `source_segments_seed_gongpo_m15.json`을
  필수 seed로 채택(21 segment 전부 정규화 수록). packet PDF는 동일 소스의 발췌본임을 확인.
- **seed locator 교정 2건** (원문 실측): 고찰 내진감주 seed p.307 → 인쇄 p.309-310, 낙수받이
  고찰 seed p.308-309 → 인쇄 p.311 (seed는 PDF 페이지 기준이었음). Ji trench seed p.857 → p.857-859 확장.
- **seed로 새로 확보·검증된 근거**: p.16 「A건물지(**추정 정전**)」 지칭 + 3개 건물지 남북 중심축(E1),
  p.334-335 맺음말(서익랑 3×1칸, 석축기단 5단 상세, 점토층 보토 역할, **왕궁 기능 가능성 매우 높음**),
  p.3 일러두기(자북·RTK-GNSS·해발), p.5-6 발간사, p.17 표1, p.21 집필자(고찰=김경열·정현승),
  p.106 남편 줄기초+적심 110cm.
- segment 총 30종 / canonical feature 45종 / phase 5단계(P0~P4) / verify V01~V50.
- corruption 드릴 14/14 CAUGHT — 신규: C08(segment 없는 E1), C13(missing_source 본문 locator),
  C14(web/public PDF). C07이 잡은 회귀: report_dimension_scaled 공시가 exact mm 값을 해금하지
  않도록 measured-only 게이트로 교정.
- `npm run goal:core` **green** (48 pass / 2 warn / 0 fail + core 테스트 9종).
- `verify:strict` 의도적 **fail** (아래 blocker 잔존 — 로드맵 게이트).

M2.5 (presentable viewer)는 착수하지 않음 — 다음 스프린트.

## 남은 blocker (strict-mode)

- 2022 보고서 license: 판권지 제한 문구 vs 페이지 공통 KOGL 로고 — human review 필요.
- 김경열 2023 전문 (DBpia 유료) — abstract-level 근거만 사용 가능 (V44 집행).
- Lee/Ji 논문의 저작권 조건(학회 저작권, KCI 공개 배포) — 인용·발췌 한도 내 사용, license unknown 유지.
- commercial_safe=false 유지.

## M1.5b 추가 (김경열 2023 전문 반영 — goal:core GREEN 재확인)

- **김경열 2023 전문 PDF 첨부 수령** → `source_packets/kim2023_full_article_for_fable.pdf` (49p 스캔본,
  텍스트 레이어 없음 → 페이지 이미지 추출 후 시각 판독). `missing_source` 해제,
  `attachment_available/local_available: true`, license는 unknown 유지.
- 판독 검증 페이지: p.161-162(초록: 왕궁급 속성·최상위 위계), p.165(북궁·남궁 비정 한계),
  p.167(도면1 — locator 전용), p.168(표1), p.169(표2 제원표 — **2022 보고서 p.308 표2와 수치 합치 확인**:
  적심 2.04m/2.2~2.8m, 주칸 외진 3.8~4.0m·내진 3.5m), p.202(남·서편=국왕 공간, 동편 나지구=동궁 잠정).
  p.163-164·166·170-201은 부분 판독 → 해당 segment `needs_source_review:true`.
- 석축기단 단수: 보고서 5단(+1~2단 추정) vs Kim 표2 스캔 판독 6단 — 보고서 수치 채택, 불일치 주석 유지.
- segment 42종(김 6종 포함, 요구 ID 23종 전부 존재). corpus: footprint_front/side_m 필드,
  주칸거리(E1, p.308), 낙수받이 너비, 석축 1.2m 추가. 리네임: land_preparation.boto_facility /
  context.pre_wolji_dongji / artifact.discard_phase_context. H2 axis → historiography.
- verifier V51~V54 추가 (총 54). corruption 15/15 CAUGHT (C13=학술 논문 E1 인용 거부,
  C15=H1 김 근거 삭제 거부). core 테스트 16종 (신규 6종 포함) 전부 PASS.
- `npm run goal:core` **GREEN**. `verify:strict` 의도적 fail (license/좌표 디지타이즈 blocker).
- **M2.5 미착수** — 사용자 지시(“goal:core 먼저”)에 따라 대기. 다음 작업: 4개 route(/, /studio,
  /verify, /report), 9모드 탭, rubble pads·답도 스트립·층서 단면 렌더, viewer-preview-checklist.
