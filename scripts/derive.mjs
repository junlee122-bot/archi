// derive.mjs — builds artifacts/structural-spec.json from canonical data.
// Keeps fact_layer confidence and geometry_layer (render) confidence strictly
// separate. Fails closed on structurally invalid input.
import { fileURLToPath } from 'node:url';
import { join } from 'node:path';
import {
  repoRootFromArgs, hasFlag, loadAll, saveJson, paths, stableStringify, sha256, sha256File, DATA_FILES
} from './lib/io.mjs';
import {
  rank, bestClass, AXIS_LABELS_KO, usedSourceIds, licenseStatus, isCommercialCompatible, expandModeTabs
} from './lib/model.mjs';
import { validateCorpus } from './lib/schema-check.mjs';

export function buildSpec(root, { strict = false } = {}) {
  const corpus = loadAll(root);
  const { params, sources, segments, features, hypotheses, phases } = corpus;

  const schemaErrors = validateCorpus(corpus);
  if (schemaErrors.length) {
    throw new Error(`derive fail-closed: schema errors:\n${schemaErrors.join('\n')}`);
  }

  const warnings = [];
  const sourceMap = new Map(sources.map((s) => [s.id, s]));
  const used = usedSourceIds(corpus);

  // ── license audit (GATE_R inputs) ────────────────────────────────────
  const auditEntries = sources.map((s) => {
    const status = licenseStatus(s);
    return {
      id: s.id,
      title: s.title,
      priority: s.priority,
      license: s.license,
      license_verified: s.license_verified,
      status,
      used_by_evidence: used.has(s.id),
      commercial_compatible: isCommercialCompatible(s),
      public_derivative_requires_human_review: status === 'kogl_type4' || status === 'unverified' || status === 'declared_unverified',
      restriction_note:
        status === 'kogl_type4'
          ? '제4유형: 출처표시·상업적 이용금지·변경금지. 내부 연구 뷰어 참고는 가능하나 상업/공개 파생 자산에는 human review 없이 사용 불가.'
          : status === 'unverified' || status === 'declared_unverified'
            ? 'license 미확인. 확인 전까지 상업/공개 파생 사용 불가.'
            : null
    };
  });
  const commercial_safe = auditEntries
    .filter((e) => e.used_by_evidence)
    .every((e) => e.commercial_compatible);

  for (const e of auditEntries) {
    if (e.used_by_evidence && !e.commercial_compatible) {
      warnings.push(`source ${e.id}: license status '${e.status}' — commercial_safe=false 유지 사유.`);
    }
    if (e.priority === 'P0' && (e.status === 'unverified' || e.status === 'declared_unverified')) {
      const msg = `P0 source ${e.id} license가 to_verify 상태 — human review 전 상업/공개 파생 사용 금지.`;
      warnings.push(msg);
      if (strict) throw new Error(`derive --strict: ${msg}`);
    }
  }

  // Citation gate: license verification gates commercial/public use, but
  // CITATION requires content verification. Unverified or missing sources
  // can never back E1/E2 facts (fail-closed).
  const segMap = new Map(segments.map((s) => [s.id, s]));
  for (const f of features) {
    for (const ev of [...(f.fact_layer?.evidence ?? []), ...(f.geometry_layer?.evidence ?? [])]) {
      const src = sourceMap.get(ev.source_id);
      if (!src) continue;
      if (src.verified !== true && ['E1', 'E2'].includes(ev.class)) {
        throw new Error(`derive fail-closed: ${f.id} — 내용 미검증 소스 ${src.id}를 ${ev.class} 근거로 인용 불가`);
      }
      if (src.missing_source === true) {
        if (ev.class === 'E1') {
          throw new Error(`derive fail-closed: ${f.id} — missing_source ${src.id}를 E1 근거로 인용 불가`);
        }
        const seg = ev.source_segment_id ? segMap.get(ev.source_segment_id) : null;
        const page = String(seg?.locator?.page ?? ev.locator?.page ?? '');
        if (page && !page.includes('abstract')) {
          throw new Error(`derive fail-closed: ${f.id} — missing_source ${src.id}에 본문 page locator(${page}) 사용 불가`);
        }
      }
    }
  }

  // ── features: normalize, never let geometry DEMO downgrade facts ─────
  const specFeatures = features.map((f) => {
    const factBest = bestClass(f.fact_layer.evidence);
    if (factBest && rank(f.fact_layer.confidence) > rank(factBest)) {
      throw new Error(
        `derive fail-closed: feature ${f.id} fact confidence ${f.fact_layer.confidence} exceeds evidence support ${factBest}`
      );
    }
    return {
      ...f,
      confidence: f.fact_layer.confidence,
      render_confidence: f.geometry_layer.confidence,
      derived_badges: {
        fact_badge: f.fact_layer.confidence,
        render_badge: f.geometry_layer.confidence,
        archaeology_vs_hypothesis:
          f.render_layer.startsWith('hypothesis') ? 'hypothesis'
          : f.render_layer === 'uncertainty' ? 'uncertainty'
          : f.render_layer.startsWith('archaeology') ? 'archaeology' : 'context'
      }
    };
  });
  const featureIds = new Set(specFeatures.map((f) => f.id));

  // ── symbolic column grid derived from bay counts (V40) ───────────────
  const gridFeature = specFeatures.find((f) => f.id === params.target_site.grid_feature_id);
  if (!gridFeature) throw new Error('derive fail-closed: grid feature missing');
  const baysFront = gridFeature.fact_layer.bays_front;
  const baysSide = gridFeature.fact_layer.bays_side;
  if (!Number.isInteger(baysFront) || !Number.isInteger(baysSide)) {
    throw new Error('derive fail-closed: grid feature lacks integer bay counts in fact_layer');
  }
  const symbolicColumnGrid = {
    columns_along_front: baysFront + 1,
    columns_along_side: baysSide + 1,
    derivation: 'fact_layer.bays_front+1 × fact_layer.bays_side+1 — visualization only',
    render_confidence: 'DEMO',
    is_excavated_positions: false,
    note: 'symbolic 마커. 실제 발굴 기초 위치는 source locator 확보 후만 표시.'
  };

  // ── report-dimension-scaled footprint (V42) ──────────────────────────
  const reportDimensionScaled =
    Number.isFinite(gridFeature.fact_layer.report_length_m) && Number.isFinite(gridFeature.fact_layer.report_width_m)
      ? {
          length_m: gridFeature.fact_layer.report_length_m,
          width_m: gridFeature.fact_layer.report_width_m,
          source_feature: gridFeature.id,
          source_segment_id: 'seg_r2022_p84_overview_grid',
          mode: gridFeature.geometry_layer.geometry_mode ?? 'symbolic',
          subdivision_assumed: gridFeature.geometry_layer.subdivision_assumed === true,
          note: '전체 footprint는 보고 치수 스케일. 칸 간격은 균등 가정 — 실측 아님.'
        }
      : null;

  // ── jeoksim rubble pads: symbolic positions, report-backed size range ─
  const jeoksim = specFeatures.find((f) => f.id === 'foundation.jeoksim_grid');
  const hash01 = (s) => {
    let h = 2166136261;
    for (const ch of s) { h ^= ch.charCodeAt(0); h = Math.imul(h, 16777619) >>> 0; }
    return (h % 1000) / 1000;
  };
  const jeoksimPads = [];
  if (jeoksim) {
    const range = jeoksim.fact_layer.jeoksim_diameter_range_cm ?? null;
    for (let i = 0; i <= baysFront; i++) {
      for (let j = 0; j <= baysSide; j++) {
        jeoksimPads.push({
          col: i,
          row: j,
          u: i / baysFront,
          v: j / baysSide,
          jitter: Number((hash01(`${i}:${j}`) * 0.08 - 0.04).toFixed(4)),
          diameter_range_cm: range,
          depth_cm: jeoksim.fact_layer.jeoksim_depth_cm ?? null,
          is_excavated_position: false
        });
      }
    }
  }
  const jeoksimPadsBlock = jeoksim
    ? {
        pads: jeoksimPads,
        size_source: 'foundation.jeoksim_grid fact_layer (2022 p.85)',
        positions: 'derived_from_bay_grid_symbolic — 발굴 좌표 아님',
        render_confidence: 'DEMO'
      }
    : null;

  // ── 2.5D stratigraphy mini-section from reported layer sequence ──────
  const strat = specFeatures.find((f) => f.id === 'stratigraphy.layers');
  const stratigraphySection = strat
    ? {
        section_scope: strat.geometry_layer.section_scope ?? 'north_trench',
        layers: (strat.fact_layer.layer_sequence ?? []).map((l, i) => ({
          ...l,
          order_from_bottom: i,
          relative_thickness: l.code === 'VII' ? 0.7 : l.code?.startsWith('V-') ? 0.5 : 1.0
        })),
        thickness_source: strat.geometry_layer.thickness_source ?? null,
        render_confidence: strat.geometry_layer.confidence,
        note: '층 두께 비율은 보고·논문 기재 수치 기반, 단면 형상은 모식화.'
      }
    : null;

  // ── entrance layout from report-stated sides (p.85) ──────────────────
  const entranceFeatures = specFeatures.filter((f) => f.id.startsWith('entrance.'));
  const entranceLayout = {
    south: entranceFeatures.filter((f) => f.fact_layer.position_side?.startsWith('south')).map((f) => f.id),
    north: entranceFeatures.filter((f) => f.fact_layer.position_side?.startsWith('north')).map((f) => f.id),
    dapdo_on: entranceFeatures.filter((f) => f.fact_layer.has_dapdo === true).map((f) => f.id),
    side_source: '2022 보고서 p.85 (남편 좌·우 / 북편 중앙)',
    offsets: 'placeholder — 도면 디지타이즈 전까지 미확정'
  };

  // ── M2.6: constrained superstructure proxy silhouette ────────────────
  // Visual-only layer derived from the frozen corpus: positions reuse the
  // symbolic jeoksim grid, heights are scene-unit presets (never measured),
  // roof stays an untyped envelope, and the omitted-column zone is NEVER
  // filled with confident posts (V62 enforces this).
  const proxyCfg = params.superstructure_proxy ?? null;
  const proxyOverview = proxyCfg
    ? specFeatures.find((f) => f.id === proxyCfg.overview_feature_id)
    : null;
  let proxySuperstructure = null;
  if (proxyCfg && proxyOverview && jeoksim) {
    // symbolic omitted zone: the reported "중앙열 4개소 적심 공백" mapped onto
    // the symbolic post grid center row — NOT excavated coordinates.
    const centerRow = Math.floor(baysSide / 2);
    const omittedCols = [2, 3, 4, 5].filter((c) => c <= baysFront);
    const isOmitted = (col, row) => row === centerRow && omittedCols.includes(col);
    proxySuperstructure = {
      enabled: true,
      default_visible: false,
      mode_visible: ['구조 실루엣', '해석축', '불확실성'],
      features: [
        ...proxyCfg.proxy_feature_ids,
        ...proxyCfg.material_context_feature_ids,
        ...proxyCfg.helper_feature_ids
      ].filter((id) => specFeatures.some((f) => f.id === id)),
      policy: {
        roof_typology: null,
        bracket_typology: null,
        column_height_measured: false,
        is_reconstruction: false,
        render_confidence: 'E5',
        fact_basis: [
          'report_dimension_scaled_footprint',
          'reported_jeoksim_grid',
          'reported_entrances',
          'reported_corridor_stone_platform',
          'academic_high_status_interpretation',
          'roof_tile_chimi_material_context'
        ]
      },
      column_positions: jeoksimPads.map((p) => ({
        col: p.col,
        row: p.row,
        u: p.u,
        v: p.v,
        in_omitted_zone: isOmitted(p.col, p.row),
        style: isOmitted(p.col, p.row) ? 'absent_slot' : 'proxy_post',
        is_excavated_position: false
      })),
      omitted_zone: {
        filled: false,
        style: 'absent_or_hollow_slot',
        label_ko: '감주 영역 — 기둥 없음/미확인',
        symbolic_positions: omittedCols.map((c) => ({ col: c, row: centerRow })),
        positions_source: 'symbolic — 도면 미디지타이즈, 발굴 좌표 아님 (layout.omitted_inner_columns E1 사실의 상징 표현)'
      },
      height_presets: {
        unit: 'scene_units_not_measured',
        label_ko: '시각화 preset — 실측 높이 아님',
        options: { '낮게': 0.75, '중간': 1.0, '높게': 1.25 },
        default: proxyCfg.default_height_preset ?? '중간'
      },
      opacity: {
        columns: 0.3,
        beams: 0.26,
        roof: 0.16,
        roof_emphasized_max: 0.28,
        corridor: 0.12
      },
      warnings_required: proxyCfg.required_warning_labels,
      render_confidence: 'E5',
      note: '구조 실루엣은 표시 layer다 — 지붕형식·공포양식·기둥 높이를 확정하지 않으며 원형 복원이 아니다.'
    };
  }

  // ── hypotheses: axis model, badges, render gating ─────────────────────
  const specHypotheses = hypotheses.map((h) => {
    const missing = (h.requires_features ?? []).filter((id) => !featureIds.has(id));
    const renderable = missing.length === 0;
    if (!renderable) {
      warnings.push(`hypothesis ${h.id}: required context features missing (${missing.join(', ')}) — render 차단.`);
    }
    return {
      ...h,
      axis_label_ko: AXIS_LABELS_KO[h.axis] ?? h.axis,
      renderable,
      missing_required_features: missing,
      badges: {
        axis: h.axis,
        axis_label_ko: AXIS_LABELS_KO[h.axis] ?? h.axis,
        confidence: h.confidence,
        legacy: h.ui_treatment?.legacy_badge === true,
        legacy_label_ko: h.ui_treatment?.legacy_badge_label_ko ?? null,
        legacy_label_en: h.ui_treatment?.legacy_badge_label_en ?? null,
        strongest: h.id === params.hypothesis_rules.strongest_hypothesis
      }
    };
  });

  // ── phases ────────────────────────────────────────────────────────────
  const specPhases = phases.map((p) => ({
    ...p,
    source_titles: p.sources.map((sid) => sourceMap.get(sid)?.title ?? sid)
  }));

  for (const s of sources) {
    if (!s.verified && used.has(s.id)) {
      warnings.push(`source ${s.id}: verified=false 상태로 evidence에 인용됨. locator 확인 필요.`);
    }
  }

  const body = {
    meta: {
      generator: 'derive.mjs',
      spec_version: params.spec_version,
      target_site: params.target_site,
      fallback_mode: params.fallback_mode,
      input_hashes: Object.fromEntries(
        DATA_FILES.map(([name, fn]) => [name, sha256File(fn(root))])
      ),
      counts: {
        sources: sources.length,
        segments: segments.length,
        features: specFeatures.length,
        hypotheses: specHypotheses.length,
        phases: specPhases.length
      }
    },
    license_audit: {
      commercial_safe,
      policy: 'source별 개별 license. 전역 license 가정 금지. unknown/to_verify/제4유형 사용 시 commercial_safe=false.',
      sources: auditEntries
    },
    derived: {
      mode_tabs: expandModeTabs(params),
      symbolic_column_grid: symbolicColumnGrid,
      report_dimension_scaled: reportDimensionScaled,
      jeoksim_pads: jeoksimPadsBlock,
      stratigraphy_section: stratigraphySection,
      entrance_layout: entranceLayout,
      proxy_superstructure: proxySuperstructure,
      phase_order: specPhases.map((p) => p.id),
      hypothesis_axis_model: {
        mutually_exclusive: false,
        axes: params.required_axes,
        note: 'H1/H2/H3는 서로 배타적인 3개의 최종 정답 후보가 아니라 해석축·기능축 위의 layer다.'
      }
    },
    features: specFeatures,
    hypotheses: specHypotheses,
    phases: specPhases,
    segments,
    warnings
  };

  const integrity = sha256(stableStringify(body));
  return { ...body, meta: { ...body.meta, integrity } };
}

// source-coverage.json: which sources back which features (fact evidence),
// with P0 coverage — the M1.5 locator-backing ledger.
export function buildSourceCoverage(root) {
  const { params, sources, segments, features, hypotheses, phases } = loadAll(root);
  const bySource = Object.fromEntries(sources.map((s) => [s.id, {
    id: s.id, priority: s.priority, verified: s.verified, missing_source: s.missing_source === true,
    local_available: s.local_available === true,
    segments: segments.filter((seg) => seg.source_id === s.id).map((seg) => seg.id),
    fact_evidence_count: 0, geometry_evidence_count: 0,
    features_backed: [], hypotheses_backed: [], phases_backed: []
  }]));
  const p0 = new Set(params.required_p0_features);
  const p0Coverage = {};
  for (const f of features) {
    const backers = new Set();
    for (const ev of f.fact_layer?.evidence ?? []) {
      const b = bySource[ev.source_id];
      if (b) { b.fact_evidence_count++; if (!b.features_backed.includes(f.id)) b.features_backed.push(f.id); backers.add(ev.source_id); }
    }
    for (const ev of f.geometry_layer?.evidence ?? []) {
      const b = bySource[ev.source_id];
      if (b) b.geometry_evidence_count++;
    }
    if (p0.has(f.id)) p0Coverage[f.id] = [...backers].sort();
  }
  for (const h of hypotheses) {
    for (const ev of [...(h.supporting_evidence ?? []), ...(h.counter_evidence ?? [])]) {
      const b = ev.source_id ? bySource[ev.source_id] : null;
      if (b && !b.hypotheses_backed.includes(h.id)) b.hypotheses_backed.push(h.id);
    }
  }
  for (const p of phases) for (const sid of p.sources) {
    const b = bySource[sid];
    if (b && !b.phases_backed.includes(p.id)) b.phases_backed.push(p.id);
  }
  const uncovered = params.required_p0_features.filter((id) => !(p0Coverage[id] ?? []).some((sid) => bySource[sid] && !bySource[sid].missing_source && sid !== 'demo_rule_silla_palace_archaeology_basic'));
  return {
    sources: Object.values(bySource),
    p0_coverage: p0Coverage,
    p0_without_external_backing: uncovered,
    note: 'p0_without_external_backing에는 불확실성 marker·가설 layer 등 자체 사실 주장이 없는 feature가 포함될 수 있다.'
  };
}

export function main(argv = process.argv.slice(2)) {
  const root = repoRootFromArgs(argv);
  const strict = hasFlag('--strict', argv);
  const spec = buildSpec(root, { strict });
  saveJson(paths.spec(root), spec);
  const coverage = buildSourceCoverage(root);
  saveJson(join(paths.artifacts(root), 'source-coverage.json'), coverage);
  console.log(
    `derive: wrote structural-spec.json (${spec.meta.counts.features} features, ` +
    `${spec.meta.counts.hypotheses} hypotheses, ${spec.meta.counts.phases} phases, ` +
    `commercial_safe=${spec.license_audit.commercial_safe}, warnings=${spec.warnings.length})`
  );
}

if (process.argv[1] && fileURLToPath(import.meta.url) === process.argv[1]) {
  try {
    main();
  } catch (err) {
    console.error(String(err.message ?? err));
    process.exit(1);
  }
}
