# SOURCE POLICY

## 소스 정책 (patch section B)

1. license는 source별로 확정한다. 전역 가정 금지.
2. 2018 A건물지 복원정비사업 발굴조사보고서: 공식 페이지 기준 **제1유형** — 2026-07-05
   페이지 문구 원문으로 확인 완료.
3. 관련 보고서는 제4유형일 수 있다 — 동궁과 월지 Ⅲ(2019)는 **제4유형**으로 확인 완료.
4. 2022 『경주 동궁과 월지 A건물지 발굴조사보고서』: 별도 source. 서지·PDF는 확인
   완료(학술연구총서 173), 그러나 판권지의 제한 문구와 페이지의 공통 로고가 충돌하므로
   license는 **to_verify** 유지. human review 전 evidence·파생 사용 금지.
5. 언론 보도는 최신 해석 clue로만 쓰고, geometry source로 쓰지 않는다.
6. 공식 보도자료가 확인되면 latest_interpretation source로 승격 — 2025-02-06
   국가유산청 보도자료(newsItemId=155705252)로 **승격 완료** (제1유형 확인).
7. unknown/to_verify license source가 사용 중이면 `commercial_safe=false`.
8. public viewer에 보고서 이미지·PDF 페이지·발굴 사진을 render asset으로 복사하지 않는다.

## evidence class

| class | 의미 |
|---|---|
| E1 | 공식 1차 소스(발굴보고서·공식 페이지 초록)에서 직접 확인된 보고 사실 |
| E2 | 검증된 2차 학술 소스에서 확인된 정성·구조 사실 |
| E3 | 복수 독립 소스 합치 추론 |
| E4 | 학술·공식 해석 |
| E5 | 탐색 가설·내부 추정 |
| DEMO | 시각화용 임의 placeholder 값 — 사실 주장 근거로 사용 금지 |

원칙: **DEMO는 "내가 임의로 채운 값"에만 붙인다.** 소스가 뒷받침하는 정성 사실을
DEMO로 강등하는 것은 V31 위반이다.

## 금지어 (user-facing claim 한정)

아래 표현은 공개 UI·생성 리포트·README 공개 섹션에서 긍정 주장으로 사용 금지.
(이 목록 자체와 부정문·인용·코드 주석은 scanner 예외 — patch section J.)

- 원형 복원
- 정확한 신라 궁궐 복원
- 실제 동궁 모습
- AI가 복원한 실제 모습
- 완벽한 고증
- 확정된 태자궁
- 확정된 왕의 공간
- 확정 복원
- confirmed original appearance

허용 대체 표현: 발굴유구 기반 표시 · 보고서 기반 해석 · 상부구조 가설 ·
기능 해석 가설 · 경쟁 해석 · 최신 재비정 · source required · unresolved
