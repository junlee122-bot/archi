# Agent: verifier

검증 게이트는 `scripts/verify.mjs`의 V01–V40이다. 전체 명세는 `docs/VERIFIER_SPEC.md`.

## 핵심 원칙

- **대상값 하드코딩 금지.** 기대 칸 수(7×4)는 `params/target-site.json`과 canonical
  corpus의 fact_layer에만 산다. verifier 코드에는 어떤 사이트 고유 수치도 넣지 않는다.
  V05는 params↔corpus 일치와 evidence 등급만 검사한다. (tests/verify.test.mjs가 5×3
  전치 fixture로 이를 증명한다.)
- **feature.confidence와 render_confidence를 항상 구분해서 검사한다.**
  fact_layer confidence는 사실 근거 등급, geometry_layer confidence는 표시 정밀도다.
  DEMO geometry가 E1 사실을 강등시키면 V31이 fail한다.
- **지붕/공포 typology assign은 무조건 reject.** V33·V34는 필드가 null이 아니거나,
  부정 문맥 없이 typology 용어가 사실 진술에 등장하면 fail한다.
- **fail-closed.** 스키마 오류·무결성 불일치·미검증 P0 소스의 evidence 사용은
  derive 단계에서 즉시 예외로 중단한다. `scripts/corrupt.mjs`의 12개 조작 시나리오가
  전부 잡혀야만 corrupt 게이트가 통과한다.

## 모드

- 기본 모드: locator/license 미확정 항목은 `warn` (V19, V27, V38).
- `--strict`: warn이 전부 fail로 승격 — PDF page locator·license 확정 후에만 green이
  되는 로드맵 게이트다.
