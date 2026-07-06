// verify.mjs — V01–V54 verification gate over canonical data + derived artifacts.
// Site-specific expectations (bay counts, required features, banned typology
// vocabulary) come from params/corpus — NEVER hardcoded in check code (V05).
import { readFileSync, readdirSync, statSync, existsSync } from 'node:fs';
import { spawnSync } from 'node:child_process';
import { join, relative } from 'node:path';
import { fileURLToPath } from 'node:url';
import {
  repoRootFromArgs, hasFlag, loadAll, loadJson, saveJson, paths, stableStringify, sha256, sha256File, DATA_FILES, fileExists
} from './lib/io.mjs';
import {
  rank, isValidClass, bestClass, isMeasuredLocator, isInternalRuleSource, sourceById,
  licenseStatus, isCommercialCompatible, usedSourceIds, phaseClassCap, expandModeTabs, AXIS_LABELS_KO
} from './lib/model.mjs';
import { validateCorpus } from './lib/schema-check.mjs';
import { scanText, scanSpecObject, forbiddenTerms } from './lib/forbidden.mjs';
import { buildSpec } from './derive.mjs';

const EXACT_VALUE_KEY = /(_mm|_coordinates)$/;

function walkFiles(dir, out = []) {
  if (!existsSync(dir)) return out;
  for (const entry of readdirSync(dir)) {
    const p = join(dir, entry);
    const st = statSync(p);
    if (st.isDirectory()) {
      if (entry === 'node_modules' || entry === '.next' || entry === '.git') continue;
      walkFiles(p, out);
    } else out.push(p);
  }
  return out;
}

function geometryExactValueViolations(feature) {
  const out = [];
  const hasMeasured = (feature.geometry_layer.evidence ?? []).some(isMeasuredLocator);
  const visit = (node, path) => {
    if (node == null || typeof node !== 'object') return;
    for (const [k, v] of Object.entries(node)) {
      if (EXACT_VALUE_KEY.test(k) && v !== null && !hasMeasured) {
        out.push(`${feature.id}: geometry '${path}${k}'=${JSON.stringify(v)} — measured locator 없음`);
      }
      if (typeof v === 'object') visit(v, `${path}${k}.`);
    }
  };
  visit(feature.geometry_layer, '');
  return out;
}

// A user-facing string "assigns" a typology term if it contains the term
// outside a negated / not-assigned context.
// Korean particles create substring false positives (e.g. '1개소로' contains
// '소로'). An occurrence only counts when not embedded in a known benign word.
const TYPOLOGY_FALSE_POSITIVE_CONTEXTS = { '소로': ['개소로', '소로서'], '다포': ['보다포'] };
function hasRealTerm(text, term) {
  const benign = TYPOLOGY_FALSE_POSITIVE_CONTEXTS[term] ?? [];
  let idx = text.indexOf(term);
  while (idx !== -1) {
    const context = text.slice(Math.max(0, idx - 2), idx + term.length + 2);
    if (!benign.some((b) => context.includes(b))) return true;
    idx = text.indexOf(term, idx + 1);
  }
  return false;
}

function typologyAssignments(strings, terms) {
  const NEG = ['금지', '지정하지 않', '지정되지 않', 'not assigned', '미지정', '미상', '아니다', '아님', '없다', '확정되지 않'];
  const hits = [];
  for (const { text, where } of strings) {
    for (const term of terms) {
      if (hasRealTerm(text, term) && !NEG.some((n) => text.includes(n))) {
        hits.push(`${where}: '${term}' — ${text.slice(0, 100)}`);
      }
    }
  }
  return hits;
}

function collectUserFacingStrings(spec) {
  const out = [];
  const KEYS = ['statement_ko', 'summary_ko', 'name_ko', 'name_en', 'title_ko', 'title_en', 'warning', 'claim', 'note'];
  const visit = (node, path) => {
    if (node == null) return;
    if (Array.isArray(node)) return node.forEach((v, i) => visit(v, `${path}[${i}]`));
    if (typeof node === 'object') {
      for (const [k, v] of Object.entries(node)) {
        if (typeof v === 'string' && (KEYS.includes(k) || k === 'warnings')) out.push({ where: `${path}.${k}`, text: v });
        else if (Array.isArray(v) && ['warnings', 'confidence_notes', 'unresolved_questions', 'claims'].includes(k)) {
          v.forEach((s, i) => { if (typeof s === 'string') out.push({ where: `${path}.${k}[${i}]`, text: s }); });
        } else visit(v, `${path}.${k}`);
      }
    }
  };
  visit(spec, '$');
  return out;
}

export function runChecks(root, { strict = false } = {}) {
  const corpus = loadAll(root);
  const { params, sources, segments, features, hypotheses, phases } = corpus;
  const specPath = paths.spec(root);
  const spec = fileExists(specPath) ? loadJson(specPath) : null;

  const sourceMap = new Map(sources.map((s) => [s.id, s]));
  const segmentMap = new Map(segments.map((s) => [s.id, s]));
  const featureIds = new Set(features.map((f) => f.id));
  const results = [];
  const add = (id, title, outcome) => results.push({ id, title, ...outcome });
  const fail = (details) => ({ status: 'fail', details });
  const warn = (details) => ({ status: strict ? 'fail' : 'warn', details });
  const pass = (details = []) => ({ status: 'pass', details });
  const evAll = (f) => [...(f.fact_layer?.evidence ?? []), ...(f.geometry_layer?.evidence ?? [])];

  // V01
  {
    const errs = validateCorpus(corpus);
    add('V01_SCHEMA_VALID', '데이터 파일 스키마 유효성', errs.length ? fail(errs) : pass());
  }

  // V02
  {
    const errs = [];
    const seen = new Set();
    for (const s of sources) {
      if (seen.has(s.id)) errs.push(`duplicate source id ${s.id}`);
      seen.add(s.id);
      if (typeof s.license !== 'string' || s.license.length === 0) errs.push(`${s.id}: license 누락`);
      if (typeof s.license_verified !== 'boolean') errs.push(`${s.id}: license_verified boolean 누락`);
    }
    add('V02_SOURCE_REGISTRY_INTEGRITY', '소스 레지스트리 무결성', errs.length ? fail(errs) : pass());
  }

  // V03
  {
    const errs = [];
    for (const f of features) for (const ev of evAll(f)) {
      if (!sourceMap.has(ev.source_id)) errs.push(`${f.id}: unknown source ${ev.source_id}`);
    }
    for (const h of hypotheses) {
      for (const ev of h.supporting_evidence ?? []) if (!sourceMap.has(ev.source_id)) errs.push(`${h.id}: unknown source ${ev.source_id}`);
      for (const ev of h.counter_evidence ?? []) if (ev.source_id && !sourceMap.has(ev.source_id)) errs.push(`${h.id}: unknown counter source ${ev.source_id}`);
    }
    for (const p of phases) for (const sid of p.sources) if (!sourceMap.has(sid)) errs.push(`${p.id}: unknown source ${sid}`);
    add('V03_EVIDENCE_SOURCE_LINKAGE', 'evidence→source 연결', errs.length ? fail(errs) : pass());
  }

  // V04
  {
    const errs = [];
    for (const f of features) for (const ev of evAll(f)) {
      if (!ev.source_segment_id) continue;
      const seg = segmentMap.get(ev.source_segment_id);
      if (!seg) errs.push(`${f.id}: unknown segment ${ev.source_segment_id}`);
      else if (seg.source_id !== ev.source_id) errs.push(`${f.id}: segment ${seg.id} belongs to ${seg.source_id}, not ${ev.source_id}`);
    }
    add('V04_SEGMENT_LINKAGE', 'evidence→segment 연결', errs.length ? fail(errs) : pass());
  }

  // V05 — generic grid/source consistency; expectations live in params+corpus only.
  {
    const errs = [];
    const t = params.target_site;
    const grid = features.find((f) => f.id === t.grid_feature_id);
    if (!grid) errs.push(`grid feature '${t.grid_feature_id}' 없음`);
    else {
      const bf = grid.fact_layer?.bays_front;
      const bs = grid.fact_layer?.bays_side;
      if (!Number.isInteger(bf) || !Number.isInteger(bs)) errs.push(`${grid.id}: fact_layer.bays_front/bays_side 정수 필요`);
      const best = bestClass(grid.fact_layer?.evidence ?? []);
      const hasFallbackSeedWarning = params.fallback_mode && (grid.warnings ?? []).some((w) => w.includes('fallback'));
      if (!(best && rank(best) >= rank('E1')) && !hasFallbackSeedWarning) {
        errs.push(`${grid.id}: fact_layer에 E1급 evidence 또는 명시적 fallback seed warning 필요 (best=${best})`);
      }
      if (Number.isInteger(t.expected_bays_front) && bf !== t.expected_bays_front) {
        errs.push(`bays_front: corpus=${bf} ≠ params.expected=${t.expected_bays_front}`);
      }
      if (Number.isInteger(t.expected_bays_side) && bs !== t.expected_bays_side) {
        errs.push(`bays_side: corpus=${bs} ≠ params.expected=${t.expected_bays_side}`);
      }
      const hasMeasured = (grid.geometry_layer?.evidence ?? []).some(isMeasuredLocator);
      if (!hasMeasured) {
        if (grid.geometry_layer?.bay_spacing_front_mm != null || grid.geometry_layer?.bay_spacing_side_mm != null) {
          errs.push(`${grid.id}: measured locator 없이 exact bay spacing 설정 금지`);
        }
      }
    }
    add('V05_GRID_SOURCE_CONSISTENCY', '그리드 사실-소스 일관성 (하드코딩 없음)', errs.length ? fail(errs) : pass());
  }

  // V06
  {
    const errs = [];
    for (const f of features) {
      for (const [where, c] of [
        [`${f.id}.confidence`, f.confidence],
        [`${f.id}.render_confidence`, f.render_confidence],
        [`${f.id}.fact_layer.confidence`, f.fact_layer?.confidence],
        [`${f.id}.geometry_layer.confidence`, f.geometry_layer?.confidence]
      ]) if (!isValidClass(c)) errs.push(`${where}='${c}' invalid`);
      for (const ev of evAll(f)) if (!isValidClass(ev.class)) errs.push(`${f.id}: evidence class '${ev.class}' invalid`);
    }
    for (const h of hypotheses) if (!isValidClass(h.confidence)) errs.push(`${h.id}: confidence invalid`);
    for (const p of phases) if (!isValidClass(p.confidence)) errs.push(`${p.id}: confidence invalid`);
    add('V06_CONFIDENCE_ENUM', 'confidence enum 검사', errs.length ? fail(errs) : pass());
  }

  // V07
  {
    const errs = [];
    const seen = new Set();
    for (const f of features) {
      if (seen.has(f.id)) errs.push(`duplicate feature id ${f.id}`);
      seen.add(f.id);
    }
    for (const id of params.required_p0_features) if (!featureIds.has(id)) errs.push(`required P0 feature 누락: ${id}`);
    if (features.length < 30) errs.push(`canonical features ${features.length} < 30`);
    add('V07_REQUIRED_P0_FEATURES', '필수 P0 feature 존재', errs.length ? fail(errs) : pass());
  }

  // V08
  {
    const errs = [];
    for (const f of features) {
      if (!(f.fact_layer?.evidence?.length > 0)) errs.push(`${f.id}: fact_layer.evidence 비어 있음`);
      if (!(f.geometry_layer?.evidence?.length > 0)) errs.push(`${f.id}: geometry_layer.evidence 비어 있음`);
    }
    add('V08_EVIDENCE_PRESENT', '모든 layer evidence 존재', errs.length ? fail(errs) : pass());
  }

  // V09 — internal demo rule can never back E1–E4 claims.
  {
    const errs = [];
    for (const f of features) {
      for (const ev of evAll(f)) {
        const src = sourceMap.get(ev.source_id);
        if (isInternalRuleSource(src) && !['DEMO', 'E5'].includes(ev.class)) {
          errs.push(`${f.id}: internal_rule source가 class ${ev.class}로 인용됨`);
        }
      }
      const fc = f.fact_layer.confidence;
      if (rank(fc) >= rank('E4') && fc !== 'DEMO') {
        const hasExternal = (f.fact_layer.evidence ?? []).some((ev) => {
          const src = sourceMap.get(ev.source_id);
          return src && !isInternalRuleSource(src) && rank(ev.class) >= rank(fc);
        });
        if (!hasExternal) errs.push(`${f.id}: fact confidence ${fc}에 외부 소스 evidence 없음`);
      }
    }
    add('V09_DEMO_SOURCE_POLICY', 'DEMO/internal rule 소스 사용 정책', errs.length ? fail(errs) : pass());
  }

  // V10
  {
    const errs = [];
    for (const f of features) {
      if (f.confidence !== f.fact_layer.confidence) errs.push(`${f.id}: confidence(${f.confidence}) ≠ fact_layer(${f.fact_layer.confidence})`);
      if (f.render_confidence !== f.geometry_layer.confidence) errs.push(`${f.id}: render_confidence(${f.render_confidence}) ≠ geometry_layer(${f.geometry_layer.confidence})`);
      const best = bestClass(f.fact_layer.evidence ?? []);
      if (best !== null && rank(f.fact_layer.confidence) > rank(best)) {
        errs.push(`${f.id}: fact confidence ${f.fact_layer.confidence} > evidence support ${best}`);
      }
    }
    add('V10_CONFIDENCE_CONSISTENT', 'confidence 요약 일관성', errs.length ? fail(errs) : pass());
  }

  // V11
  {
    const errs = [];
    for (const f of features) {
      const g = f.geometry_layer;
      if (g.confidence === 'DEMO' || g.demo_placeholder === true) {
        if (f.ui_flags?.relative_geometry !== true) errs.push(`${f.id}: DEMO geometry인데 ui_flags.relative_geometry≠true`);
        if (f.ui_flags?.not_measured !== true) errs.push(`${f.id}: DEMO geometry인데 ui_flags.not_measured≠true`);
      }
    }
    add('V11_RELATIVE_GEOMETRY_FLAGS', '상대 geometry UI 플래그', errs.length ? fail(errs) : pass());
  }

  // V12
  {
    const missing = features.filter((f) => f.category === 'uncertainty').length >= 3
      ? []
      : ['uncertainty category feature < 3'];
    add('V12_UNCERTAINTY_MARKERS_PRESENT', '불확실성 marker 존재', missing.length ? fail(missing) : pass());
  }

  // V13
  {
    const errs = [];
    for (const h of hypotheses) {
      for (const fid of [...(h.supporting_features ?? []), ...(h.requires_features ?? []), ...(h.ui_treatment?.highlight ?? [])]) {
        if (!featureIds.has(fid)) errs.push(`${h.id}: unknown feature ${fid}`);
      }
    }
    add('V13_HYPOTHESIS_FEATURE_LINKS', '가설→feature 연결', errs.length ? fail(errs) : pass());
  }

  // V14
  {
    const errs = hypotheses.filter((h) => !(h.counter_evidence?.length > 0)).map((h) => `${h.id}: counter_evidence 없음`);
    add('V14_HYPOTHESIS_COUNTER_EVIDENCE', '가설 반대근거 의무', errs.length ? fail(errs) : pass());
  }

  // V15 — interpretations cap at E4; confidence cannot exceed best support.
  {
    const errs = [];
    for (const h of hypotheses) {
      if (rank(h.confidence) > rank('E4')) errs.push(`${h.id}: 해석 가설 confidence는 E4 초과 불가 (${h.confidence})`);
      const best = bestClass(h.supporting_evidence ?? []);
      if (best !== null && rank(h.confidence) > rank(best)) errs.push(`${h.id}: confidence ${h.confidence} > 근거 support ${best}`);
    }
    add('V15_HYPOTHESIS_CONFIDENCE_CAP', '가설 confidence 상한', errs.length ? fail(errs) : pass());
  }

  // V16
  {
    const errs = phases.filter((p) => !(p.sources?.length > 0)).map((p) => `${p.id}: source 없는 phase 금지`);
    add('V16_PHASE_SOURCES', 'phase 소스 인용 의무', errs.length ? fail(errs) : pass());
  }

  // V17
  {
    const errs = [];
    for (const p of phases) {
      const cited = p.sources.map((sid) => sourceMap.get(sid)).filter(Boolean);
      const cap = phaseClassCap(cited);
      if (rank(p.confidence) > rank(cap)) errs.push(`${p.id}: confidence ${p.confidence} > 소스 지원 상한 ${cap}`);
    }
    add('V17_PHASE_CONFIDENCE_CAP', 'phase confidence ≤ 소스 지원', errs.length ? fail(errs) : pass());
  }

  // V18
  {
    const errs = [];
    for (const p of phases) for (const fid of p.visible_features) {
      if (!featureIds.has(fid)) errs.push(`${p.id}: unknown feature ${fid}`);
    }
    add('V18_PHASE_FEATURE_LINKS', 'phase→feature 연결', errs.length ? fail(errs) : pass());
  }

  // V19 — GATE_R license gate. License verification gates commercial/public
  // derivative use (not citation); content verification gates citation (V41,
  // derive fail-closed).
  {
    const errs = [];
    const warns = [];
    const used = usedSourceIds(corpus);
    for (const s of sources) {
      const st = licenseStatus(s);
      if (s.priority === 'P0' && (st === 'unverified' || st === 'declared_unverified')) {
        warns.push(`P0 source ${s.id}: license to_verify — human review 전 상업/공개 파생 사용 금지 (strict에서 fail)`);
      }
      if (used.has(s.id) && s.verified !== true) {
        errs.push(`source ${s.id}: 내용 미검증(verified=false) 상태로 evidence에 사용됨`);
      }
    }
    const expectedSafe = sources.filter((s) => used.has(s.id)).every((s) => isCommercialCompatible(s));
    if (spec && spec.license_audit?.commercial_safe !== expectedSafe) {
      errs.push(`spec.license_audit.commercial_safe=${spec?.license_audit?.commercial_safe} ≠ computed ${expectedSafe}`);
    }
    if (errs.length) add('V19_GATE_R_LICENSE', 'license gate (GATE_R)', fail([...errs, ...warns]));
    else if (warns.length) add('V19_GATE_R_LICENSE', 'license gate (GATE_R)', warn(warns));
    else add('V19_GATE_R_LICENSE', 'license gate (GATE_R)', pass());
  }

  // V20 — no source media copied into web/public.
  {
    const errs = [];
    const pub = join(paths.web(root), 'public');
    if (existsSync(pub)) {
      const allowedPath = join(pub, 'ALLOWED_ASSETS.json');
      const allowed = existsSync(allowedPath) ? new Set(loadJson(allowedPath).map((a) => a.path)) : new Set();
      for (const file of walkFiles(pub)) {
        const rel = relative(pub, file);
        if (/\.(pdf|tif|tiff)$/i.test(rel)) errs.push(`web/public 내 source 문서 금지: ${rel}`);
        else if (/\.(png|jpe?g|webp|gif)$/i.test(rel) && !allowed.has(rel)) {
          errs.push(`web/public 내 미신고 raster 이미지: ${rel} (ALLOWED_ASSETS.json 등록 필요, 보고서/도판 복사 금지)`);
        }
      }
    }
    add('V20_NO_SOURCE_MEDIA_IN_WEB_PUBLIC', '보고서 이미지/PDF 웹 복사 금지', errs.length ? fail(errs) : pass());
  }

  // V21
  {
    const errs = [];
    for (const f of features.filter((f) => f.id.startsWith('superstructure.'))) {
      if (f.geometry_layer.ghost !== true) errs.push(`${f.id}: geometry_layer.ghost=true 필요`);
      if (!['DEMO', 'E5'].includes(f.render_confidence)) errs.push(`${f.id}: render_confidence는 DEMO/E5만 허용`);
      if (f.render_layer !== 'hypothesis_ghost') errs.push(`${f.id}: render_layer=hypothesis_ghost 필요`);
    }
    add('V21_SUPERSTRUCTURE_GHOST_ONLY', '상부구조 ghost/symbolic 전용', errs.length ? fail(errs) : pass());
  }

  // V22
  {
    const errs = features.flatMap(geometryExactValueViolations);
    add('V22_EXACT_DIMENSIONS_NULL_WITHOUT_LOCATOR', 'measured locator 없는 실측치 금지', errs.length ? fail(errs) : pass());
  }

  // V23 — artifact integrity (fail-closed corruption detection).
  {
    const errs = [];
    if (!spec) errs.push('artifacts/structural-spec.json 없음 (derive 먼저 실행)');
    else {
      const { integrity, ...restMeta } = spec.meta ?? {};
      if (!integrity) errs.push('meta.integrity 누락');
      else {
        const recomputed = sha256(stableStringify({ ...spec, meta: restMeta }));
        if (recomputed !== integrity) errs.push(`integrity 불일치: spec=${integrity.slice(0, 12)}… recomputed=${recomputed.slice(0, 12)}…`);
      }
      for (const [name, fn] of DATA_FILES) {
        const now = sha256File(fn(root));
        if (spec.meta?.input_hashes?.[name] !== now) errs.push(`input hash 불일치: ${name} (stale artifact — derive 재실행 필요)`);
      }
    }
    add('V23_ARTIFACT_INTEGRITY', '아티팩트 무결성/신선도', errs.length ? fail(errs) : pass());
  }

  // V24
  {
    const errs = [];
    if (spec) {
      const expected = expandModeTabs(params);
      const actual = spec.derived?.mode_tabs ?? [];
      if (JSON.stringify(actual) !== JSON.stringify(expected)) {
        errs.push(`mode_tabs 불일치: ${JSON.stringify(actual)} ≠ ${JSON.stringify(expected)}`);
      }
    } else errs.push('spec 없음');
    add('V24_MODE_TABS', '모드 탭 구성', errs.length ? fail(errs) : pass());
  }

  // V25
  {
    const errs = [];
    if (spec) {
      for (const h of spec.hypotheses ?? []) {
        if (!h.axis) errs.push(`${h.id}: axis 없음`);
        if (!h.axis_label_ko) errs.push(`${h.id}: axis_label_ko 없음`);
      }
    } else errs.push('spec 없음');
    add('V25_AXIS_LABELS_IN_SPEC', 'spec 내 축 라벨', errs.length ? fail(errs) : pass());
  }

  // V26
  {
    const errs = [];
    for (const f of features) {
      if (f.geometry_layer.confidence === 'DEMO' && !(f.warnings?.length > 0)) {
        errs.push(`${f.id}: DEMO geometry에 warnings 필요`);
      }
    }
    add('V26_WARNINGS_SURFACED', 'DEMO geometry 경고 표면화', errs.length ? fail(errs) : pass());
  }

  // V27
  {
    const warns = [];
    for (const s of sources) {
      if (s.verified && !/^\d{4}-\d{2}-\d{2}$/.test(String(s.accessed ?? ''))) {
        warns.push(`${s.id}: verified인데 accessed 날짜 형식 누락`);
      }
    }
    add('V27_ACCESS_DATES', '소스 열람일 기록', warns.length ? warn(warns) : pass());
  }

  // V28
  {
    const errs = [];
    if (spec) {
      for (const v of scanSpecObject(spec)) errs.push(`${v.path}: '${v.term}' — ${v.text}`);
    }
    add('V28_SPEC_FORBIDDEN_LANGUAGE', '생성 스펙 내 금지 표현', errs.length ? fail(errs) : pass());
  }

  // V29
  {
    const errs = [];
    if (spec) {
      const used = usedSourceIds(corpus);
      const expected = sources.filter((s) => used.has(s.id)).every((s) => isCommercialCompatible(s));
      if (spec.license_audit?.commercial_safe !== expected) errs.push(`commercial_safe=${spec.license_audit?.commercial_safe}, expected ${expected}`);
    } else errs.push('spec 없음');
    add('V29_COMMERCIAL_SAFE_CONSISTENT', 'commercial_safe 일관성', errs.length ? fail(errs) : pass());
  }

  // V30 — deterministic rebuild.
  {
    const errs = [];
    try {
      const a = buildSpec(root);
      const b = buildSpec(root);
      if (stableStringify(a) !== stableStringify(b)) errs.push('연속 두 번 derive 결과가 다름 (비결정성)');
    } catch (err) {
      errs.push(`rebuild 실패: ${err.message}`);
    }
    add('V30_DETERMINISTIC_BUILD', '결정적 빌드', errs.length ? fail(errs) : pass());
  }

  // V31 — fact/geometry layer separation.
  {
    const errs = [];
    for (const f of features) {
      if (!f.fact_layer?.confidence) errs.push(`${f.id}: fact_layer.confidence 없음`);
      if (!f.geometry_layer?.confidence) errs.push(`${f.id}: geometry_layer.confidence 없음`);
      const hasExternalFact = (f.fact_layer?.evidence ?? []).some((ev) => {
        const src = sourceMap.get(ev.source_id);
        return src && !isInternalRuleSource(src) && ['E1', 'E2', 'E3'].includes(ev.class);
      });
      if (hasExternalFact && ['E5', 'DEMO'].includes(f.confidence)) {
        errs.push(`${f.id}: 외부 소스 E1~E3 근거가 있는 사실을 ${f.confidence}로 강등 금지`);
      }
      if (f.fact_layer?.confidence === 'DEMO') errs.push(`${f.id}: fact_layer confidence는 DEMO가 될 수 없음`);
    }
    add('V31_FACT_GEOMETRY_LAYER_SEPARATION', 'fact/geometry layer 분리', errs.length ? fail(errs) : pass());
  }

  // V32
  {
    const errs = [];
    for (const f of features) {
      const g = f.geometry_layer;
      if (g.type === 'omitted-column-zone') {
        const hasMeasured = (g.evidence ?? []).some(isMeasuredLocator);
        if (g.omitted_positions !== null && g.omitted_positions !== undefined && !hasMeasured) {
          errs.push(`${f.id}: source locator 없이 omitted_positions 좌표 설정 금지`);
        }
      }
    }
    add('V32_NO_EXACT_POSITION_WITHOUT_LOCATOR', '감주 정확 위치 locator 의무', errs.length ? fail(errs) : pass());
  }

  // V33 / V34 — typology bans (vocabulary from params, not hardcoded).
  {
    const strings = collectUserFacingStrings({ features, hypotheses, phases });
    const bracketTerms = [...(params.forbidden_bracket_terms ?? []), ...(params.forbidden_bracket_generic_terms ?? [])];
    const errs = [];
    for (const f of features) {
      const bt = f.geometry_layer?.bracket_typology;
      if (bt !== undefined && bt !== null) errs.push(`${f.id}: bracket_typology는 null이어야 함 (='${bt}')`);
    }
    errs.push(...typologyAssignments(strings, bracketTerms));
    add('V33_BRACKET_TYPOLOGY_FORBIDDEN', '공포(bracket) 양식 지정 금지', errs.length ? fail(errs) : pass());

    const errs34 = [];
    for (const f of features) {
      const rt = f.geometry_layer?.roof_type;
      if (rt !== undefined && rt !== null) errs34.push(`${f.id}: roof_type은 null이어야 함 (='${rt}')`);
    }
    errs34.push(...typologyAssignments(strings, params.forbidden_roof_terms ?? []));
    add('V34_ROOF_TYPOLOGY_FORBIDDEN', '지붕 형식 지정 금지', errs34.length ? fail(errs34) : pass());
  }

  // V35
  {
    const errs = [];
    for (const h of hypotheses) {
      if (!h.axis) errs.push(`${h.id}: axis 선언 필요`);
      else if (!params.required_axes.includes(h.axis)) errs.push(`${h.id}: axis '${h.axis}' 미허용`);
    }
    if (spec && spec.derived?.hypothesis_axis_model?.mutually_exclusive !== false) {
      errs.push('spec은 가설을 상호배타 3택으로 표시하면 안 됨 (mutually_exclusive=false 필요)');
    }
    add('V35_HYPOTHESIS_AXIS_MODEL', '가설 축 모델', errs.length ? fail(errs) : pass());
  }

  // V36
  {
    const errs = [];
    const rule = params.hypothesis_rules;
    const h3 = hypotheses.find((h) => h.axis === 'functional_program');
    if (h3) {
      const required = h3.requires_features ?? [rule.h3_requires_feature];
      for (const fid of required) if (!featureIds.has(fid)) errs.push(`${h3.id}: 필수 컨텍스트 feature '${fid}' 없음 — render 불가`);
      if (spec) {
        const sh = (spec.hypotheses ?? []).find((x) => x.id === h3.id);
        if (sh && sh.renderable !== (errs.length === 0)) errs.push(`spec의 ${h3.id}.renderable 판정 불일치`);
      }
    }
    add('V36_WOLJI_CONTEXT_REQUIRED_FOR_FUNCTION_HYPOTHESIS', '기능 가설의 월지 컨텍스트 의무', errs.length ? fail(errs) : pass());
  }

  // V37
  {
    const errs = [];
    const h2 = hypotheses.find((h) => h.id === params.hypothesis_rules.legacy_badge_hypothesis);
    if (!h2) errs.push('legacy 가설 없음');
    else {
      if (h2.ui_treatment?.legacy_badge !== true) errs.push(`${h2.id}: legacy_badge=true 필요`);
      if (!h2.ui_treatment?.legacy_badge_label_ko) errs.push(`${h2.id}: legacy badge 라벨 필요`);
      if (!(h2.counter_evidence?.length > 0)) errs.push(`${h2.id}: counter_evidence 필요`);
    }
    add('V37_LEGACY_INTERPRETATION_BADGE', 'H2 legacy/약화 배지', errs.length ? fail(errs) : pass());
  }

  // V38 — mixed license policy, no global assumption.
  {
    const errs = [];
    const warns = [];
    if (spec?.license_audit) {
      if ('global_license' in spec.license_audit) errs.push('전역 license 필드 금지');
      const entries = spec.license_audit.sources ?? [];
      if (entries.length !== sources.length) errs.push('license audit에 소스별 entry 필요');
      for (const e of entries) {
        if (e.status === 'kogl_type4' && e.public_derivative_requires_human_review !== true) {
          errs.push(`${e.id}: 제4유형은 human review 플래그 필요`);
        }
      }
    } else errs.push('spec.license_audit 없음');
    for (const s of sources) {
      const st = licenseStatus(s);
      if ((st === 'unverified' || st === 'declared_unverified') && s.priority !== 'fallback') {
        warns.push(`${s.id}: license 미확인 (${s.license})`);
      }
    }
    if (errs.length) add('V38_SOURCE_LICENSE_MIXED_POLICY', '소스별 개별 license 정책', fail([...errs, ...warns]));
    else if (warns.length) add('V38_SOURCE_LICENSE_MIXED_POLICY', '소스별 개별 license 정책', warn(warns));
    else add('V38_SOURCE_LICENSE_MIXED_POLICY', '소스별 개별 license 정책', pass());
  }

  // V39 — forbidden language, user-facing surfaces only.
  {
    const errs = [];
    const targets = [];
    const webDir = paths.web(root);
    for (const dir of [join(webDir, 'app'), join(webDir, 'components')]) {
      for (const f of walkFiles(dir)) if (/\.(tsx|ts)$/.test(f)) targets.push([f, 'code']);
    }
    for (const f of walkFiles(paths.reportsDir(root))) if (/\.md$/.test(f)) targets.push([f, 'markdown']);
    const readme = join(root, 'README.md');
    if (existsSync(readme)) targets.push([readme, 'markdown']);
    const demoScript = join(root, 'docs', 'DEMO_SCRIPT.md');
    if (existsSync(demoScript)) targets.push([demoScript, 'markdown']);
    for (const [file, kind] of targets) {
      for (const v of scanText(readFileSync(file, 'utf8'), { kind })) {
        errs.push(`${relative(root, file)}:${v.line}: '${v.term}' — ${v.text}`);
      }
    }
    add('V39_FORBIDDEN_LANGUAGE_USER_FACING_ONLY', '금지 표현 (user-facing 한정)', errs.length ? fail(errs) : pass());
  }

  // V40
  {
    const errs = [];
    const grid = features.find((f) => f.id === params.target_site.grid_feature_id);
    const sym = features.find((f) => f.id === 'superstructure.column_grid.symbolic');
    if (spec && grid) {
      const g = spec.derived?.symbolic_column_grid;
      if (!g) errs.push('spec.derived.symbolic_column_grid 없음');
      else {
        if (g.columns_along_front !== grid.fact_layer.bays_front + 1) errs.push(`columns_along_front=${g.columns_along_front} ≠ bays_front+1`);
        if (g.columns_along_side !== grid.fact_layer.bays_side + 1) errs.push(`columns_along_side=${g.columns_along_side} ≠ bays_side+1`);
        if (!['DEMO', 'E5'].includes(g.render_confidence)) errs.push('symbolic grid render_confidence는 DEMO/E5');
        if (g.is_excavated_positions !== false) errs.push('symbolic grid는 발굴 위치가 아님을 명시해야 함');
      }
    }
    if (sym && !['DEMO', 'E5'].includes(sym.render_confidence)) errs.push(`${sym.id}: render_confidence DEMO/E5 필요`);
    add('V40_COLUMN_GRID_DERIVED_FROM_BAYS', '기둥열은 칸 수 파생 symbolic만', errs.length ? fail(errs) : pass());
  }

  // ── M1.5 checks V41–V50 ────────────────────────────────────────────────

  // V41 — every E1/E2 evidence citing an external source must resolve to a
  // segment with a concrete locator page.
  {
    const errs = [];
    for (const f of features) {
      for (const ev of evAll(f)) {
        const src = sourceMap.get(ev.source_id);
        if (!src || isInternalRuleSource(src)) continue;
        if (!['E1', 'E2'].includes(ev.class)) continue;
        if (!ev.source_segment_id) { errs.push(`${f.id}: ${ev.class} evidence (${ev.source_id})에 source_segment_id 없음`); continue; }
        const seg = segmentMap.get(ev.source_segment_id);
        if (!seg) errs.push(`${f.id}: segment ${ev.source_segment_id} 없음`);
        else if (seg.locator?.page == null) errs.push(`${f.id}: segment ${seg.id}에 locator.page 없음`);
      }
    }
    for (const seg of segments) {
      if (seg.locator?.page == null) errs.push(`segment ${seg.id}: locator.page 없음`);
    }
    add('V41_SOURCE_SEGMENT_LOCATOR_BACKING', 'E1/E2 근거의 segment locator 의무', errs.length ? fail(errs) : pass());
  }

  // V42 — report dimensions must flow into geometry only via a disclosed
  // report_dimension_scaled (or stay symbolic).
  {
    const errs = [];
    for (const f of features) {
      const hasReportDims = Object.keys(f.fact_layer ?? {}).some((k) => /^(report_.*_m|wing_length_m|wing_width_max_m|trench_(length|width|depth)_m|boto_(height|width)_m)$/.test(k));
      const mode = f.geometry_layer?.geometry_mode;
      if (hasReportDims && !['report_dimension_scaled', 'symbolic'].includes(mode ?? '')) {
        errs.push(`${f.id}: 보고 치수가 있는 feature는 geometry_mode를 report_dimension_scaled/symbolic으로 공시해야 함 (현재 ${mode})`);
      }
      if (mode === 'report_dimension_scaled' && !(f.geometry_layer.footprint_source || f.geometry_layer.thickness_source)) {
        errs.push(`${f.id}: report_dimension_scaled 공시(footprint_source/thickness_source) 누락`);
      }
    }
    if (spec) {
      const grid = features.find((f) => f.id === params.target_site.grid_feature_id);
      const rds = spec.derived?.report_dimension_scaled;
      if (grid?.fact_layer?.report_length_m != null) {
        if (!rds) errs.push('spec.derived.report_dimension_scaled 없음');
        else {
          if (rds.length_m !== grid.fact_layer.report_length_m || rds.width_m !== grid.fact_layer.report_width_m) {
            errs.push(`derived footprint(${rds.length_m}×${rds.width_m}) ≠ fact_layer(${grid.fact_layer.report_length_m}×${grid.fact_layer.report_width_m})`);
          }
          if (rds.subdivision_assumed !== true) errs.push('칸 분할 가정(subdivision_assumed) 공시 필요');
        }
      }
    }
    add('V42_REPORT_DIMENSION_TO_GEOMETRY_DISCLOSURE', '보고 치수→geometry 공시', errs.length ? fail(errs) : pass());
  }

  // V43 — no source documents as public assets, ever.
  {
    const errs = [];
    const webDir = paths.web(root);
    if (existsSync(webDir)) {
      for (const file of walkFiles(webDir)) {
        if (/\.(pdf|hwp|hwpx|tif|tiff)$/i.test(file)) errs.push(`web/ 내 source 문서 금지: ${relative(root, file)}`);
      }
    }
    const ls = spawnSync('git', ['ls-files', '*.pdf', '*.hwp', '*.hwpx'], { cwd: root, encoding: 'utf8' });
    if (ls.status === 0 && ls.stdout.trim()) {
      errs.push(`git 추적 중인 source 문서 금지: ${ls.stdout.trim().split('\n').join(', ')}`);
    }
    add('V43_NO_PUBLIC_PDF_ASSET', 'PDF/HWP 공개 자산·커밋 금지', errs.length ? fail(errs) : pass());
  }

  // V44 — academic articles: never E1, never geometry-backing beyond disclosed
  // report_dimension_scaled, abstract-only when missing_source.
  {
    const errs = [];
    for (const f of features) {
      for (const ev of f.fact_layer?.evidence ?? []) {
        const src = sourceMap.get(ev.source_id);
        if (!src || src.type !== 'academic_article') continue;
        if (ev.class === 'E1') errs.push(`${f.id}: 학술 논문 evidence는 E1 불가 (${ev.source_id})`);
        if (src.missing_source === true) {
          const seg = ev.source_segment_id ? segmentMap.get(ev.source_segment_id) : null;
          const page = String(seg?.locator?.page ?? ev.locator?.page ?? '');
          if (!page.includes('abstract')) errs.push(`${f.id}: missing_source ${src.id}는 abstract-level locator만 허용 (page='${page}')`);
        }
      }
      for (const ev of f.geometry_layer?.evidence ?? []) {
        const src = sourceMap.get(ev.source_id);
        if (!src || src.type !== 'academic_article') continue;
        if (ev.method !== 'report_dimension_scaled') {
          errs.push(`${f.id}: 학술 논문은 geometry evidence로 사용 불가 (공시된 치수 스케일 제외) — ${ev.source_id}/${ev.method}`);
        }
        if (src.missing_source === true) errs.push(`${f.id}: missing_source 논문의 geometry 사용 금지`);
      }
    }
    add('V44_ACADEMIC_ARTICLE_USAGE_LIMIT', '학술 논문 사용 한도', errs.length ? fail(errs) : pass());
  }

  // V45 — H2 must be backed by Lee 2023 with a page locator.
  {
    const errs = [];
    const h2 = hypotheses.find((h) => h.id === params.hypothesis_rules.legacy_badge_hypothesis);
    if (!h2) errs.push('H2 없음');
    else {
      const lee = (h2.supporting_evidence ?? []).filter((ev) => ev.source_id === 'lee_2023_donggung_wolji_character_debate');
      if (!lee.length) errs.push('H2에 이현태 2023 supporting evidence 필요');
      else if (!lee.some((ev) => /\d/.test(String(ev.locator?.page ?? '')))) errs.push('H2의 이현태 2023 근거에 page locator 필요');
      if (!(h2.counter_evidence ?? []).some((ev) => ev.source_id === 'lee_2023_donggung_wolji_character_debate')) {
        errs.push('H2 counter_evidence에도 이현태 2023 근거(약화 논거) 필요');
      }
    }
    add('V45_H2_LEE2023_BACKING', 'H2의 이현태 2023 locator 근거', errs.length ? fail(errs) : pass());
  }

  // V46 — pre-Wolji / prior-land-preparation phases and features must be
  // backed by Ji 2023 with page locators.
  {
    const errs = [];
    for (const pid of params.ji2023_backed_phases ?? []) {
      const p = phases.find((x) => x.id === pid);
      if (!p) { errs.push(`phase ${pid} 없음`); continue; }
      if (!p.sources.includes('ji_2023_wolji_west_land_preparation_recheck')) errs.push(`${pid}: 지영배 2023 인용 필요`);
    }
    for (const fid of params.ji2023_backed_features ?? []) {
      const f = features.find((x) => x.id === fid);
      if (!f) { errs.push(`feature ${fid} 없음`); continue; }
      const ji = (f.fact_layer.evidence ?? []).filter((ev) => ev.source_id === 'ji_2023_wolji_west_land_preparation_recheck');
      if (!ji.length) errs.push(`${fid}: 지영배 2023 evidence 필요`);
      else if (!ji.some((ev) => /\d/.test(String(ev.locator?.page ?? '')))) errs.push(`${fid}: 지영배 2023 근거에 page locator 필요`);
    }
    // 東池 landscape is an interpretation — it can never be presented as E1/E2 fact.
    const dongji = features.find((x) => x.id === 'context.pre_wolji_dongji');
    if (dongji && !['E4', 'E5'].includes(dongji.fact_layer.confidence)) {
      errs.push(`context.pre_wolji_dongji: 東池 경관은 E4/E5만 허용 (현재 ${dongji.fact_layer.confidence})`);
    }
    add('V46_PHASE_JI2023_BACKING', '선대 단계의 지영배 2023 근거', errs.length ? fail(errs) : pass());
  }

  // V47 — 2022-report core features must be page-locator backed.
  {
    const errs = [];
    for (const fid of params.report2022_core_features ?? []) {
      const f = features.find((x) => x.id === fid);
      if (!f) { errs.push(`feature ${fid} 없음`); continue; }
      const evs = (f.fact_layer.evidence ?? []).filter((ev) => ev.source_id === 'gyeongju_2022_a_building_full_excavation_report');
      if (!evs.length) errs.push(`${fid}: 2022 보고서 evidence 필요`);
      else if (!evs.some((ev) => /^\d/.test(String(ev.locator?.page ?? '')))) errs.push(`${fid}: 2022 보고서 근거에 숫자 page locator 필요`);
    }
    add('V47_REPORT2022_CORE_FEATURE_BACKING', '핵심 유구의 2022 보고서 locator 근거', errs.length ? fail(errs) : pass());
  }

  // V48 — viewer route completeness (M2.5: /, /studio, /verify, /report + the
  // nine mode tabs). Skipped when web/ absent so core stays green in web-less
  // environments; the M2.5 gate re-runs it with web present.
  {
    const errs = [];
    const webDir = paths.web(root);
    if (existsSync(join(webDir, 'app'))) {
      for (const route of ['page.tsx', 'studio/page.tsx', 'verify/page.tsx', 'report/page.tsx']) {
        if (!existsSync(join(webDir, 'app', route))) errs.push(`web/app/${route} 없음 (route 미구현)`);
      }
      let combined = '';
      for (const f of walkFiles(join(webDir, 'app'))) if (/\.(tsx|ts)$/.test(f)) combined += readFileSync(f, 'utf8');
      for (const f of walkFiles(join(webDir, 'components'))) if (/\.(tsx|ts)$/.test(f)) combined += readFileSync(f, 'utf8');
      for (const tab of ['발굴유구', '제원/그리드', '내진감주', '출입/동선', '익랑·회랑', '대지조성·트렌치', '해석축', '불확실성', '검증결과']) {
        if (!combined.includes(tab)) errs.push(`뷰어 코드에 '${tab}' 모드 처리 없음`);
      }
      if (!combined.includes('structural-spec.json')) errs.push('viewer가 structural-spec.json을 로드하지 않음');
      for (const c of ['SceneViewer', 'HypothesisPanel', 'EvidenceDrawer', 'PhaseTimeline', 'VerificationPanel', 'ModeTabs']) {
        if (!existsSync(join(webDir, 'components', `${c}.tsx`))) errs.push(`components/${c}.tsx 없음`);
      }
      add('V48_VIEWER_ROUTE_COMPLETENESS', '뷰어 라우트/모드 완결성 (M2.5)', errs.length ? fail(errs) : pass());
    } else {
      add('V48_VIEWER_ROUTE_COMPLETENESS', '뷰어 라우트/모드 완결성 (M2.5)', pass(['web/ 없음 — core-only 환경, M2.5 게이트에서 재검사']));
    }
  }

  // V49 — presentation preview manifest with existing internal renders.
  {
    const errs = [];
    const manifestPath = join(paths.artifacts(root), 'preview', 'preview-manifest.json');
    if (!existsSync(manifestPath)) errs.push('artifacts/preview/preview-manifest.json 없음');
    else {
      const manifest = loadJson(manifestPath);
      if (!(manifest.files?.length > 0)) errs.push('preview manifest에 파일 없음');
      for (const f of manifest.files ?? []) {
        if (f.origin !== 'internal_viewer_render') errs.push(`${f.path}: origin은 internal_viewer_render만 허용 (source 이미지 금지)`);
        if (!existsSync(join(paths.artifacts(root), 'preview', f.path))) errs.push(`preview 파일 없음: ${f.path}`);
      }
    }
    add('V49_PRESENTATION_PREVIEW_REQUIRED', '프레젠테이션 프리뷰 (내부 렌더 전용)', errs.length ? fail(errs) : pass());
  }

  // V50 — corruption drill wired into product surface. Report freshness is
  // warn-level (report is produced later in the same pipeline run).
  {
    const errs = [];
    const warns = [];
    // Wiring checks run against the real repo (scripts/web are shared code,
    // not part of per-root data clones).
    const codeRoot = repoRootFromArgs([]);
    const corruptSrcPath = join(codeRoot, 'scripts', 'corrupt.mjs');
    if (!existsSync(corruptSrcPath)) errs.push('scripts/corrupt.mjs 없음');
    else {
      const src = readFileSync(corruptSrcPath, 'utf8');
      const count = (src.match(/name:\s*'C\d+/g) ?? []).length;
      if (count < 12) errs.push(`corruption 시나리오 ${count} < 12`);
    }
    const copySrc = readFileSync(join(codeRoot, 'scripts', 'copy-artifacts-to-web.mjs'), 'utf8');
    if (!copySrc.includes('corruption-report.json')) errs.push('copy:web이 corruption-report를 스테이징하지 않음');
    const vpPath = join(paths.web(repoRootFromArgs([])), 'components', 'VerificationPanel.tsx');
    if (existsSync(vpPath) && !readFileSync(vpPath, 'utf8').includes('corruption-report')) {
      errs.push('VerificationPanel이 corruption-report를 표시하지 않음');
    }
    const reportPath = join(paths.artifacts(root), 'corruption-report.json');
    if (!existsSync(reportPath)) warns.push('corruption-report.json 미생성 — 이 파이프라인 후속 단계(corrupt)에서 생성 필요');
    else if (loadJson(reportPath).fail_closed !== true) errs.push('corruption-report: fail_closed=false');
    if (errs.length) add('V50_CORRUPTION_UI_REQUIRED', 'corruption 드릴의 UI 연결', fail([...errs, ...warns]));
    else if (warns.length) add('V50_CORRUPTION_UI_REQUIRED', 'corruption 드릴의 UI 연결', warn(warns));
    else add('V50_CORRUPTION_UI_REQUIRED', 'corruption 드릴의 UI 연결', pass());
  }

  // ── M1.5b checks V51–V54 (Kim 2023 integration) ───────────────────────

  // V51 — H1 must be backed by Kim 2023 with page locators.
  {
    const errs = [];
    const warns = [];
    const kimId = params.kim2023_source_id;
    const kim = sourceMap.get(kimId);
    const h1 = hypotheses.find((h) => h.id === params.hypothesis_rules.strongest_hypothesis);
    if (!kim) errs.push('Kim 2023 source 없음');
    else if (kim.missing_source === true) {
      warns.push('Kim 2023 전문 미확보(missing_source) — H1은 abstract-level 근거만 사용 가능');
    }
    if (!h1) errs.push('H1 없음');
    else {
      const kimEvs = (h1.supporting_evidence ?? []).filter((ev) => ev.source_id === kimId);
      if (!kimEvs.length) errs.push('H1에 김경열 2023 supporting evidence 필요');
      else {
        const located = kimEvs.filter((ev) => /\d/.test(String(ev.locator?.page ?? '')));
        if (!located.length) {
          if (strict) errs.push('strict: H1의 김경열 2023 근거에 locator-backed segment 필요');
          else warns.push('H1의 김경열 2023 근거에 page locator 없음 (부분 판독 상태)');
        }
        for (const ev of kimEvs) {
          const seg = ev.source_segment_id ? segmentMap.get(ev.source_segment_id) : null;
          if (seg?.needs_source_review === true) warns.push(`H1 인용 segment ${seg.id}: needs_source_review (부분 판독)`);
        }
      }
    }
    if (errs.length) add('V51_KIM2023_H1_BACKING', 'H1의 김경열 2023 근거', fail([...errs, ...warns]));
    else if (warns.length) add('V51_KIM2023_H1_BACKING', 'H1의 김경열 2023 근거', warn(warns));
    else add('V51_KIM2023_H1_BACKING', 'H1의 김경열 2023 근거', pass());
  }

  // V52 — Kim 2023 pages/figures never become public assets.
  {
    const errs = [];
    const pub = join(paths.web(repoRootFromArgs([])), 'public');
    if (existsSync(pub)) {
      for (const file of walkFiles(pub)) {
        const rel = relative(pub, file).toLowerCase();
        if (rel.includes('kim') && /\.(png|jpe?g|webp|gif|pdf|tif|tiff)$/i.test(rel)) {
          errs.push(`web/public 내 Kim 2023 파생 자산 금지: ${rel}`);
        }
      }
    }
    const previewDir = join(paths.artifacts(root), 'preview');
    if (existsSync(previewDir)) {
      const manifestPath = join(previewDir, 'preview-manifest.json');
      if (existsSync(manifestPath)) {
        for (const f of loadJson(manifestPath).files ?? []) {
          if (String(f.path).toLowerCase().includes('kim')) errs.push(`preview에 Kim 소스 이미지 금지: ${f.path}`);
        }
      }
    }
    add('V52_NO_KIM_PUBLIC_ASSET', 'Kim 2023 public asset 금지', errs.length ? fail(errs) : pass());
  }

  // V53 — Kim segments: short paraphrase + locator, no long quotes.
  {
    const errs = [];
    const kimSegs = segments.filter((s) => s.source_id === params.kim2023_source_id);
    if (!kimSegs.length) errs.push('Kim 2023 segment 없음');
    for (const s of kimSegs) {
      if (s.locator?.page == null) errs.push(`${s.id}: locator.page 필요`);
      const len = String(s.summary_ko ?? '').length;
      if (len === 0) errs.push(`${s.id}: summary_ko 없음`);
      if (len > 500) errs.push(`${s.id}: summary_ko ${len}자 — 짧은 paraphrase 한도(500자) 초과`);
      if (/[「『][^」』]{120,}[」』]/.test(String(s.summary_ko))) errs.push(`${s.id}: 장문 인용 금지`);
    }
    add('V53_KIM_SEGMENT_QUALITY', 'Kim segment 품질 (짧은 paraphrase+locator)', errs.length ? fail(errs) : pass());
  }

  // V54 — H1 triangulation: 2022 report + Kim 2023 + Lee 2023.
  {
    const errs = [];
    const warns = [];
    const h1 = hypotheses.find((h) => h.id === params.hypothesis_rules.strongest_hypothesis);
    const required = params.h1_triangulation_source_ids ?? [];
    if (!h1) errs.push('H1 없음');
    else {
      const cited = new Set((h1.supporting_evidence ?? []).map((ev) => ev.source_id));
      for (const sid of required) {
        if (!cited.has(sid)) {
          const msg = `H1 triangulation 소스 누락: ${sid}`;
          if (strict) errs.push(`strict: ${msg}`);
          else warns.push(msg);
        }
      }
    }
    if (errs.length) add('V54_H1_TRIANGULATION', 'H1 3원 교차(2022+Kim+Lee)', fail([...errs, ...warns]));
    else if (warns.length) add('V54_H1_TRIANGULATION', 'H1 3원 교차(2022+Kim+Lee)', warn(warns));
    else add('V54_H1_TRIANGULATION', 'H1 3원 교차(2022+Kim+Lee)', pass());
  }

  const failed = results.filter((r) => r.status === 'fail');
  const warned = results.filter((r) => r.status === 'warn');
  return {
    strict,
    summary: { total: results.length, pass: results.filter((r) => r.status === 'pass').length, warn: warned.length, fail: failed.length },
    ok: failed.length === 0,
    checks: results
  };
}

export function main(argv = process.argv.slice(2)) {
  const root = repoRootFromArgs(argv);
  const strict = hasFlag('--strict', argv);
  const report = runChecks(root, { strict });
  saveJson(paths.verification(root), report);
  for (const c of report.checks) {
    const mark = c.status === 'pass' ? 'PASS' : c.status === 'warn' ? 'WARN' : 'FAIL';
    console.log(`[${mark}] ${c.id} — ${c.title}`);
    if (c.status !== 'pass') for (const d of c.details ?? []) console.log(`       · ${d}`);
  }
  console.log(`verify: ${report.summary.pass} pass / ${report.summary.warn} warn / ${report.summary.fail} fail${strict ? ' (strict)' : ''}`);
  if (!report.ok) process.exit(1);
}

if (process.argv[1] && fileURLToPath(import.meta.url) === process.argv[1]) {
  try {
    main();
  } catch (err) {
    console.error(String(err.stack ?? err));
    process.exit(1);
  }
}
