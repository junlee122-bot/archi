// derive.mjs — builds artifacts/structural-spec.json from canonical data.
// Keeps fact_layer confidence and geometry_layer (render) confidence strictly
// separate. Fails closed on structurally invalid input.
import { fileURLToPath } from 'node:url';
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
      const msg = `P0 source ${e.id} license가 to_verify 상태.`;
      if (e.used_by_evidence && !params.fallback_mode) {
        throw new Error(`derive fail-closed: ${msg} 미확인 P0 소스를 evidence로 사용할 수 없다.`);
      }
      warnings.push(`${msg} 후보 등록 상태로만 유지(fallback: evidence 미사용).`);
      if (strict) throw new Error(`derive --strict: ${msg}`);
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

export function main(argv = process.argv.slice(2)) {
  const root = repoRootFromArgs(argv);
  const strict = hasFlag('--strict', argv);
  const spec = buildSpec(root, { strict });
  saveJson(paths.spec(root), spec);
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
