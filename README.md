# GONGPO-DONGGUNG PRO

경주 동궁과 월지 **서편 A건물지**의 증거 분리형(evidence-separated) 고고학 뷰어 코퍼스.

핵심 산출물은 시각적 재현이 아니라 **증거 분리**다: 발굴유구 기반 표시와 보고서 기반
해석, 상부구조 가설을 서로 다른 confidence로 구분해 저장·검증·표시한다. 이 뷰어는
원형 복원이 아니다.

## 구조

```
params/      사이트 기대값 (칸 수, 필수 feature, 금지 typology 용어) — verifier는 이 값만 참조
data/        소스 레지스트리 · 소스 segment · canonical 2층 corpus · 가설(축 모델) · phase
scripts/     derive / verify(V01–V40) / corrupt / 리포트 / 금지어 scanner
artifacts/   생성물: structural-spec.json (integrity 봉인) · verification-report.json · 리포트
tests/       core 9종 + web smoke
web/         Next.js + React Three Fiber 정적 뷰어 (8 mode tabs)
agents/      역할별 규칙 (건축·verifier·license·가설 엔진)
docs/        정책 문서 (SOURCE_POLICY / VERIFIER_SPEC / HYPOTHESIS_POLICY / …)
```

## 실행

```bash
npm run goal:core    # M1: validate → derive → verify(V01–V40) → 리포트 → core 테스트
npm run corrupt      # fail-closed 드릴 (12개 조작 시나리오 전부 거부되어야 통과)
npm run goal:web     # M2: 아티팩트 복사 → next build (web/, npm run web:install 선행)
npm run m3           # M3: 증거/가설/license 리포트 + 금지어 스캔
npm run goal:strict  # 로드맵 게이트 — locator/license 미확정이 남은 동안 의도적으로 실패
```

## 2층 corpus (fact vs geometry)

모든 feature는 `fact_layer`(사실, E1~E5)와 `geometry_layer`(표시, DEMO/E5)를 분리해
가진다. 예 — "7×4칸 내진감주 대형건물지"는 2018 공식 보고서 초록 근거의 **E1 사실**이고,
화면의 칸 간격은 실측 locator가 없으므로 **DEMO 상대 placeholder**다. DEMO geometry가
사실 등급을 강등하면 verifier(V31)가 빌드를 거부한다. 자세한 규칙은
`docs/ARCHAEOLOGICAL_FEATURES.md`.

## License 정정 및 혼합 소스 정책

**전역 license 가정은 없다.** 같은 국가유산청/국립문화유산연구원 계열이라도 소스마다
license가 다르다는 것을 실사(2026-07-05)로 확인했다:

| source | license (개별 확인) |
|---|---|
| 2018 A건물지 보고서 | 공공누리 **제1유형** — 공식 페이지 문구 확인 |
| 2022 A건물지 보고서 (학술연구총서 173) | **to_verify** — 판권지 제한 문구와 페이지 표기 충돌, human review 대기 |
| 경주 동궁과 월지 Ⅲ (2019) | 공공누리 **제4유형** — 상업·변형 제한 |
| 2025-02-06 국가유산청 보도자료 | 공공누리 **제1유형** |
| 신라사학보 57 · 한국고고학보 129 논문 | **unknown** — 학회 저작권 |

사용 중인 소스에 unknown/to_verify/제4유형이 있으므로 **`commercial_safe=false`**.
미확정 license의 P0 소스는 레지스트리 후보로만 존재할 수 있고 evidence로 인용되는
순간 derive가 중단된다. 보고서 이미지·PDF 페이지는 public viewer로 복사하지 않는다.
세부는 `docs/SOURCE_POLICY.md`, `artifacts/reports/license-audit.md`.

## 가설: 축 모델

H1(왕의 공식 공간·정전급, **가장 강한 해석축**, E4) / H2(기존 동궁·태자궁 해석,
**legacy·최신 재비정으로 약화됨**, E5) / H3(의례·접견·연회 기능축, E5, 월지 수변 layer
필수). 세 카드는 상호 배타적 3택이 아니라 해석축·기능축 위의 layer다 —
`docs/HYPOTHESIS_POLICY.md`.

## 미해결 (strict-mode 로드맵)

- 2022 전면 보고서 license 확정 (human review)
- 2018/2022 보고서 PDF ingest → page/figure locator → exact 치수 승격
- 신라사학보·한국고고학보 논문 저작권 조건 확인
- 감주(생략 기둥) 정확 위치 — 도면 locator 확보 전까지 symbolic hatch만 표시
