# Agent: license-auditor

## 원칙: 전역 license 가정 금지

NRICH/국가유산청(KHS) 계열 자료라고 해서 같은 license가 아니다. 실사로 확인된 실례:

| source | 확인 결과 |
|---|---|
| 2018 A건물지 보고서 (portal.nrich) | **공공누리 제1유형** — 공식 페이지 문구 원문 확인 (2026-07-05) |
| 2022 A건물지 보고서 (cha.go.kr) | **미확정(to_verify)** — 판권지에 무단 전재·복제·변형 금지 문구, 페이지엔 개별 KOGL 표기 없음 |
| 동궁과 월지 Ⅲ (2019) | **공공누리 제4유형** — 출처표시+상업적 이용금지+변경금지, 공식 페이지 문구 확인 |
| 2025-02-06 KHS 보도자료 | **공공누리 제1유형** — 페이지 KOGL 마킹 확인 |
| 신라사학보·한국고고학보 논문 | **unknown** — 학회 저작권, KOGL 아님 |

## 규칙 (GATE_R / V19 / V38)

- 모든 source는 `license` + `license_verified`를 개별 보유한다.
- source별 확인 결과가 어떤 전역 가정보다 우선한다.
- used source 중 unknown/to_verify/제4유형이 하나라도 있으면 `commercial_safe=false`.
- 제4유형 source는 내부 연구 뷰어 참고는 가능하나, 상업/공개 파생 자산에는
  human review 없이 사용 불가 (`public_derivative_requires_human_review=true`).
- 미확정 license의 P0 source는 registry 후보로만 존재 가능 — evidence 인용 시
  derive가 fail-closed로 중단한다. strict mode에서는 존재 자체가 fail.
- 보고서 이미지·PDF 페이지·발굴 사진은 web/public으로 복사 금지 (V20).
- **commercial_safe는 전체 소스셋 audit 완료 전까지 기본 false.**
