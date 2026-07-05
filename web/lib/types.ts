export type EvidenceClass = 'E1' | 'E2' | 'E3' | 'E4' | 'E5' | 'DEMO';

export interface Evidence {
  source_id: string;
  source_segment_id?: string;
  locator?: { page?: string | null; figure?: string | null; note?: string };
  class: EvidenceClass;
  method: string;
  verified?: boolean;
  note?: string;
  claim?: string;
}

export interface Feature {
  id: string;
  name_ko: string;
  name_en: string;
  category: string;
  archaeological_status: string;
  render_layer: string;
  fact_layer: { statement_ko: string; confidence: EvidenceClass; evidence: Evidence[]; bays_front?: number; bays_side?: number };
  geometry_layer: Record<string, any> & { type: string; confidence: EvidenceClass; evidence: Evidence[] };
  confidence: EvidenceClass;
  render_confidence: EvidenceClass;
  ui_flags: Record<string, boolean>;
  warnings: string[];
  derived_badges?: { fact_badge: EvidenceClass; render_badge: EvidenceClass; archaeology_vs_hypothesis: string };
  linked_hypothesis?: string;
}

export interface Hypothesis {
  id: string;
  axis: string;
  axis_label_ko: string;
  title_ko: string;
  title_en: string;
  summary_ko: string;
  confidence: EvidenceClass;
  confidence_notes: string[];
  supporting_features: string[];
  supporting_evidence: Evidence[];
  counter_evidence: { claim: string; source_id?: string; class: EvidenceClass }[];
  unresolved_questions: string[];
  ui_treatment: Record<string, any>;
  renderable: boolean;
  missing_required_features: string[];
  badges: {
    axis: string;
    axis_label_ko: string;
    confidence: EvidenceClass;
    legacy: boolean;
    legacy_label_ko: string | null;
    strongest: boolean;
  };
}

export interface Phase {
  id: string;
  name_ko: string;
  stage_kind: string;
  confidence: EvidenceClass;
  sources: string[];
  source_titles: string[];
  visible_features: string[];
  notes: string;
}

export interface Spec {
  meta: { spec_version: string; target_site: any; counts: Record<string, number>; integrity: string };
  license_audit: { commercial_safe: boolean; policy: string; sources: any[] };
  derived: {
    mode_tabs: string[];
    symbolic_column_grid: { columns_along_front: number; columns_along_side: number; render_confidence: string; is_excavated_positions: boolean };
    hypothesis_axis_model: { mutually_exclusive: boolean; axes: string[]; note: string };
  };
  features: Feature[];
  hypotheses: Hypothesis[];
  phases: Phase[];
  warnings: string[];
}

export interface VerificationReport {
  strict: boolean;
  summary: { total: number; pass: number; warn: number; fail: number };
  ok: boolean;
  checks: { id: string; title: string; status: 'pass' | 'warn' | 'fail'; details?: string[] }[];
}
