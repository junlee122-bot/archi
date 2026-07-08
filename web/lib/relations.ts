import type { Spec, Feature } from './types';

export function linkedHypotheses(spec: Spec, featureId: string) {
  return spec.hypotheses.filter(
    (h) =>
      h.supporting_features.includes(featureId) ||
      (h as any).requires_features?.includes(featureId) ||
      h.ui_treatment?.highlight?.includes(featureId)
  );
}

export function linkedPhases(spec: Spec, featureId: string) {
  return spec.phases.filter((p) => p.visible_features.includes(featureId));
}

// Static map: which verifier checks guard which feature families. Kept in the
// viewer (not the verifier) — display aid only.
const CHECKS_BY_PREFIX: [RegExp, string[]][] = [
  [/^layout\.grid/, ['V05_GRID_SOURCE_CONSISTENCY', 'V42_REPORT_DIMENSION_TO_GEOMETRY_DISCLOSURE', 'V47_REPORT2022_CORE_FEATURE_BACKING', 'V40_COLUMN_GRID_DERIVED_FROM_BAYS']],
  [/^layout\.omitted/, ['V32_NO_EXACT_POSITION_WITHOUT_LOCATOR', 'V47_REPORT2022_CORE_FEATURE_BACKING', 'V41_SOURCE_SEGMENT_LOCATOR_BACKING']],
  [/^foundation\./, ['V22_EXACT_DIMENSIONS_NULL_WITHOUT_LOCATOR', 'V47_REPORT2022_CORE_FEATURE_BACKING']],
  [/^entrance\./, ['V47_REPORT2022_CORE_FEATURE_BACKING', 'V41_SOURCE_SEGMENT_LOCATOR_BACKING']],
  [/^walkway\./, ['V47_REPORT2022_CORE_FEATURE_BACKING']],
  [/^corridor\./, ['V47_REPORT2022_CORE_FEATURE_BACKING']],
  [/^superstructure\.proxy/, ['V55_SUPERSTRUCTURE_PROXY_LAYER_ONLY', 'V56_NO_STYLE_ASSIGNMENT_IN_SILHOUETTE', 'V57_COLUMN_HEIGHT_NOT_MEASURED', 'V61_PROXY_FEATURES_HAVE_EVIDENCE_OR_EXPLICIT_NULL']],
  [/^superstructure\.proxy\.roof_envelope/, ['V58_ROOF_ENVELOPE_UNTYPED']],
  [/^superstructure\.proxy\.column_posts/, ['V62_OMITTED_COLUMN_ZONE_NOT_FILLED']],
  [/^superstructure\./, ['V21_SUPERSTRUCTURE_GHOST_ONLY', 'V33_BRACKET_TYPOLOGY_FORBIDDEN', 'V34_ROOF_TYPOLOGY_FORBIDDEN']],
  [/^material_context\./, ['V59_MATERIAL_CONTEXT_NOT_GEOMETRY', 'V41_SOURCE_SEGMENT_LOCATOR_BACKING']],
  [/^scale_helper\./, ['V61_PROXY_FEATURES_HAVE_EVIDENCE_OR_EXPLICIT_NULL']],
  [/^(trench|stratigraphy|land_preparation)\./, ['V46_PHASE_JI2023_BACKING']],
  [/^context\.pre_wolji_dongji/, ['V46_PHASE_JI2023_BACKING']],
  [/^hypothesis\./, ['V35_HYPOTHESIS_AXIS_MODEL', 'V14_HYPOTHESIS_COUNTER_EVIDENCE']],
  [/^uncertainty\./, ['V12_UNCERTAINTY_MARKERS_PRESENT']]
];

// NOT CLAIMED labels for the drawer (M2.6 — what a proxy feature refuses to assert)
export const NOT_CLAIMED_LABELS: Record<string, string> = {
  exact_roof_type: '지붕형식 미지정',
  roof_typology: '지붕형식 미지정',
  bracket_typology: '공포양식 미지정',
  column_height: '기둥 높이 미확정',
  column_diameter: '기둥 직경 미확정',
  column_position_exact: '기둥 정확 위치 미확정',
  entasis: '배흘림 여부 미지정',
  dancheong: '단청 미지정',
  original_appearance: '원형 복원 아님',
  confirmed_reconstruction: '확정 재현 아님',
  roof_pitch: '지붕 물매 미지정',
  eave_length: '처마 길이 미지정',
  ridge_decoration: '용마루 장식 미지정',
  roof_reconstruction: '지붕 재현 아님',
  exact_roof_covering: '지붕 피복 재현 아님',
  chimi_shape: '치미 형태 복원 아님',
  joinery_detail: '접합부 상세 미지정',
  historical_person: '역사적 인물 재현 아님',
  costume: '복식 재현 아님'
};

export function relatedChecks(featureId: string): string[] {
  const out = new Set<string>(['V31_FACT_GEOMETRY_LAYER_SEPARATION']);
  for (const [re, checks] of CHECKS_BY_PREFIX) {
    if (re.test(featureId)) checks.forEach((c) => out.add(c));
  }
  return Array.from(out);
}

export const CONF_COLOR: Record<string, string> = {
  E1: '#3fa66a', E2: '#6cae4f', E3: '#8fae4f', E4: '#c8842c', E5: '#a05a2c', DEMO: '#7b8494'
};

export function hasLocator(f: Feature): boolean {
  return f.fact_layer.evidence.some(
    (ev) => ev.source_segment_id && ev.locator?.page != null && /\d/.test(String(ev.locator.page))
  );
}

export function segmentCount(f: Feature): number {
  return new Set(
    [...f.fact_layer.evidence, ...f.geometry_layer.evidence]
      .map((ev) => ev.source_segment_id)
      .filter(Boolean)
  ).size;
}

// Local UI corruption scenarios (state-only — never touches files).
export interface CorruptionScenario {
  id: string;
  label: string;
  target: string;
  targetKind: 'feature' | 'hypothesis';
  simulatedChecks: string[];
  message: string;
  alsoAffects?: string[];
}

export const UI_CORRUPTION_SCENARIOS: CorruptionScenario[] = [
  {
    id: 'ui_c1_remove_omitted_provenance',
    label: '내진감주 feature의 provenance(evidence) 제거',
    target: 'layout.omitted_inner_columns',
    targetKind: 'feature',
    simulatedChecks: ['V08_EVIDENCE_PRESENT', 'V41_SOURCE_SEGMENT_LOCATOR_BACKING'],
    message: '복원 거부: provenance/evidence가 제거되었습니다. 소스 없는 feature는 렌더할 수 없습니다.'
  },
  {
    id: 'ui_c2_promote_roof_to_e1',
    label: '지붕 ghost mass confidence를 E1으로 조작',
    target: 'superstructure.roof_mass.ghost',
    targetKind: 'feature',
    simulatedChecks: ['V21_SUPERSTRUCTURE_GHOST_ONLY', 'V31_FACT_GEOMETRY_LAYER_SEPARATION', 'V10_CONFIDENCE_CONSISTENT', 'V55_SUPERSTRUCTURE_PROXY_LAYER_ONLY'],
    message: '복원 거부: 소스 근거 없는 상부구조를 E1으로 승격할 수 없습니다. ghost/E5만 허용됩니다.',
    alsoAffects: ['superstructure.proxy.roof_envelope']
  },
  {
    id: 'ui_c3_remove_kim_from_h1',
    label: 'H1에서 김경열 2023 근거 제거',
    target: 'H1_royal_formal_space',
    targetKind: 'hypothesis',
    simulatedChecks: ['V51_KIM2023_H1_BACKING', 'V54_H1_TRIANGULATION'],
    message: '복원 거부: H1의 3원 교차(2022+Kim+Lee)가 깨졌습니다. 김경열 2023 근거가 필요합니다.'
  }
];
