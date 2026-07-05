// Evidence-class semantics shared by derive/verify. Values live in params where
// site-specific; only class algebra lives here.
export const CLASS_RANK = { E1: 5, E2: 4, E3: 3, E4: 2, E5: 1, DEMO: 0 };
export const CLASSES = Object.keys(CLASS_RANK);

export const AXIS_LABELS_KO = {
  spatial_political_attribution: '공간·정치 비정 축',
  functional_program: '기능 프로그램 축',
  historiography: '연구사 축'
};

export function rank(cls) {
  if (!(cls in CLASS_RANK)) throw new Error(`unknown evidence class: ${cls}`);
  return CLASS_RANK[cls];
}

export function isValidClass(cls) {
  return cls in CLASS_RANK;
}

export function bestClass(evidence = []) {
  let best = null;
  for (const ev of evidence) {
    if (!isValidClass(ev.class)) continue;
    if (best === null || rank(ev.class) > rank(best)) best = ev.class;
  }
  return best;
}

// An evidence entry counts as a measured locator only when it was actually
// measured against a located source page/figure.
export function isMeasuredLocator(ev) {
  return ev && ev.method === 'measured' && ev.locator && ev.locator.page != null;
}

export function sourceById(sources, id) {
  return sources.find((s) => s.id === id) || null;
}

export function isInternalRuleSource(source) {
  return source != null && source.type === 'internal_rule';
}

// KOGL: only 제1유형 permits commercial derivative use without extra review.
export function licenseStatus(source) {
  const lic = String(source.license ?? '');
  if (source.type === 'internal_rule') return 'internal';
  if (!source.license_verified) {
    if (lic === 'to_verify' || lic === 'unknown' || lic === '') return 'unverified';
    return 'declared_unverified';
  }
  if (lic.includes('제1유형')) return 'kogl_type1';
  if (lic.includes('제2유형')) return 'kogl_type2';
  if (lic.includes('제3유형')) return 'kogl_type3';
  if (lic.includes('제4유형')) return 'kogl_type4';
  return 'other_verified';
}

export function isCommercialCompatible(source) {
  const st = licenseStatus(source);
  return st === 'internal' || st === 'kogl_type1';
}

// Collect every source id referenced by evidence anywhere in the corpus.
export function usedSourceIds({ features, hypotheses, phases }) {
  const used = new Set();
  for (const f of features) {
    for (const ev of f.fact_layer?.evidence ?? []) used.add(ev.source_id);
    for (const ev of f.geometry_layer?.evidence ?? []) used.add(ev.source_id);
  }
  for (const h of hypotheses) {
    for (const ev of h.supporting_evidence ?? []) used.add(ev.source_id);
    for (const ev of h.counter_evidence ?? []) if (ev.source_id) used.add(ev.source_id);
  }
  for (const p of phases) for (const sid of p.sources ?? []) used.add(sid);
  return used;
}

// Max evidence class a phase may claim, given the sources it cites.
export function phaseClassCap(sources) {
  let cap = 'E5';
  for (const s of sources) {
    let c = 'E5';
    if (s.type === 'excavation_report' && s.verified) c = 'E1';
    else if (s.type === 'academic_article' && s.verified) c = 'E2';
    else if (s.type === 'official_interpretation') c = 'E4';
    else if (s.type === 'internal_rule') c = 'E5';
    else if (s.verified) c = 'E4';
    if (rank(c) > rank(cap)) cap = c;
  }
  return cap;
}

export function expandModeTabs(params) {
  const t = params.target_site;
  return params.mode_tabs_template.map((tab) =>
    tab
      .replaceAll('{bays_front}', String(t.expected_bays_front))
      .replaceAll('{bays_side}', String(t.expected_bays_side))
  );
}
