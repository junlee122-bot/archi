// corrupt.mjs — fail-closed corruption drill. Each scenario tampers a copy of
// the corpus or artifacts; the pipeline (derive and/or verify) MUST reject it.
// Exit 0 only when every scenario is caught.
import { cpSync, mkdirSync, rmSync, existsSync, writeFileSync } from 'node:fs';
import { spawnSync } from 'node:child_process';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { loadJson, saveJson, paths, stableStringify, sha256 } from './lib/io.mjs';

const here = dirname(fileURLToPath(import.meta.url));
const realRoot = resolve(here, '..');
const corruptionDir = join(realRoot, 'artifacts', 'corruption');

function run(script, root) {
  return spawnSync(process.execPath, [join(here, script), '--root', root], { encoding: 'utf8' });
}

function cloneRoot(name) {
  const dir = join(corruptionDir, name);
  rmSync(dir, { recursive: true, force: true });
  mkdirSync(dir, { recursive: true });
  cpSync(join(realRoot, 'params'), join(dir, 'params'), { recursive: true });
  cpSync(join(realRoot, 'data'), join(dir, 'data'), { recursive: true });
  mkdirSync(join(dir, 'artifacts'), { recursive: true });
  cpSync(paths.spec(realRoot), paths.spec(dir));
  const preview = join(realRoot, 'artifacts', 'preview');
  if (existsSync(preview)) cpSync(preview, join(dir, 'artifacts', 'preview'), { recursive: true });
  const corruptionReport = join(realRoot, 'artifacts', 'corruption-report.json');
  if (existsSync(corruptionReport)) cpSync(corruptionReport, join(dir, 'artifacts', 'corruption-report.json'));
  return dir;
}

function resealSpec(root) {
  const spec = loadJson(paths.spec(root));
  const { integrity, ...restMeta } = spec.meta;
  const body = { ...spec, meta: restMeta };
  saveJson(paths.spec(root), { ...body, meta: { ...restMeta, integrity: sha256(stableStringify(body)) } });
}

const editJson = (path, fn) => {
  const value = loadJson(path);
  fn(value);
  saveJson(path, value);
};

// mode 'data': tamper canonical data, then derive+verify must reject.
// mode 'artifact': tamper the sealed spec (optionally resealing), verify must reject.
const SCENARIOS = [
  {
    name: 'C01_fact_e1_downgraded_to_e5',
    mode: 'data',
    expect: 'E1 근거 사실의 강등을 V31이 거부',
    setup: (dir, params) => editJson(paths.features(dir), (features) => {
      const grid = features.find((f) => f.id === params.target_site.grid_feature_id);
      grid.fact_layer.confidence = 'E5';
      grid.confidence = 'E5';
    })
  },
  {
    name: 'C02_bracket_typology_assigned',
    mode: 'data',
    expect: '공포 양식 지정을 V33이 거부',
    setup: (dir) => editJson(paths.features(dir), (features) => {
      const roof = features.find((f) => f.id === 'superstructure.roof_mass.ghost');
      roof.geometry_layer.bracket_typology = '주심포';
    })
  },
  {
    name: 'C03_roof_typology_assigned',
    mode: 'data',
    expect: '지붕 형식 지정을 V34가 거부',
    setup: (dir) => editJson(paths.features(dir), (features) => {
      const roof = features.find((f) => f.id === 'superstructure.roof_mass.ghost');
      roof.geometry_layer.roof_type = '팔작지붕';
    })
  },
  {
    name: 'C04_hypothesis_axis_removed',
    mode: 'data',
    expect: 'axis 누락을 schema/V35가 거부',
    setup: (dir) => editJson(paths.hypotheses(dir), (hyps) => { delete hyps[0].axis; })
  },
  {
    name: 'C05_wolji_water_edge_removed',
    mode: 'data',
    expect: '월지 수변 layer 삭제를 V07/V13/V36이 거부',
    setup: (dir) => editJson(paths.features(dir), (features) => {
      const i = features.findIndex((f) => f.id === 'context.wolji_water_edge');
      features.splice(i, 1);
    })
  },
  {
    name: 'C06_omitted_positions_without_locator',
    mode: 'data',
    expect: 'locator 없는 감주 좌표를 V32가 거부',
    setup: (dir) => editJson(paths.features(dir), (features) => {
      const f = features.find((x) => x.id === 'layout.omitted_inner_columns');
      f.geometry_layer.omitted_positions = [[3, 2], [4, 2]];
    })
  },
  {
    name: 'C07_exact_bay_spacing_without_locator',
    mode: 'data',
    expect: 'locator 없는 실측 칸 간격을 V05/V22가 거부',
    setup: (dir, params) => editJson(paths.features(dir), (features) => {
      const grid = features.find((f) => f.id === params.target_site.grid_feature_id);
      grid.geometry_layer.bay_spacing_front_mm = 5200;
    })
  },
  {
    name: 'C08_e1_evidence_without_segment_locator',
    mode: 'data',
    expect: 'segment locator 없는 E1 근거를 V41이 거부',
    setup: (dir) => editJson(paths.features(dir), (features) => {
      const f = features.find((x) => x.id === 'platform.main_building');
      f.fact_layer.evidence.push({
        source_id: 'gyeongju_2022_a_building_full_excavation_report',
        class: 'E1',
        method: 'report_stated',
        verified: true
      });
    })
  },
  {
    name: 'C13_missing_source_body_page_locator',
    mode: 'data',
    expect: 'missing_source 논문의 본문 page locator를 derive/V44가 거부',
    setup: (dir) => editJson(paths.segments(dir), (segments) => {
      const seg = segments.find((s) => s.id === 'seg_kim2023_abstract_a_building');
      seg.locator.page = '170';
    })
  },
  {
    name: 'C14_pdf_copied_into_web_public',
    mode: 'artifact',
    reseal: true,
    expect: 'web/public 내 PDF 자산을 V43이 거부',
    setup: (dir) => {
      mkdirSync(join(dir, 'web', 'public'), { recursive: true });
      writeFileSync(join(dir, 'web', 'public', 'report-page.pdf'), '%PDF-1.4 dummy');
    }
  },
  {
    name: 'C09_params_grid_mismatch',
    mode: 'data',
    expect: 'params 기대 칸수와 corpus 불일치를 V05가 거부',
    setup: (dir) => editJson(paths.params(dir), (params) => {
      params.target_site.expected_bays_front = 9;
    })
  },
  {
    name: 'C10_commercial_safe_flipped_in_spec',
    mode: 'artifact',
    reseal: true,
    expect: 'commercial_safe=true 조작을 V19/V29가 거부',
    setup: (dir) => editJson(paths.spec(dir), (spec) => { spec.license_audit.commercial_safe = true; })
  },
  {
    name: 'C11_spec_tampered_without_reseal',
    mode: 'artifact',
    reseal: false,
    expect: 'integrity hash 불일치를 V23이 거부',
    setup: (dir) => editJson(paths.spec(dir), (spec) => { spec.features[0].name_ko = '조작된 이름'; })
  },
  {
    name: 'C12_forbidden_claim_injected_into_spec',
    mode: 'artifact',
    reseal: true,
    expect: '금지 표현 주입을 V28이 거부',
    setup: (dir) => editJson(paths.spec(dir), (spec) => {
      spec.hypotheses[0].summary_ko = '이 뷰어는 신라 왕궁의 원형 복원을 보여준다.';
    })
  }
];

export function main() {
  const params = loadJson(paths.params(realRoot));
  const results = [];
  for (const sc of SCENARIOS) {
    const dir = cloneRoot(sc.name);
    sc.setup(dir, params);
    let caughtBy = null;
    if (sc.mode === 'data') {
      const d = run('derive.mjs', dir);
      if (d.status !== 0) caughtBy = 'derive (fail-closed)';
      else {
        const v = run('verify.mjs', dir);
        if (v.status !== 0) {
          const failed = (loadJson(paths.verification(dir)).checks ?? []).filter((c) => c.status === 'fail').map((c) => c.id);
          caughtBy = `verify (${failed.join(', ')})`;
        }
      }
    } else {
      if (sc.reseal) resealSpec(dir);
      const v = run('verify.mjs', dir);
      if (v.status !== 0) {
        const failed = (loadJson(paths.verification(dir)).checks ?? []).filter((c) => c.status === 'fail').map((c) => c.id);
        caughtBy = `verify (${failed.join(', ')})`;
      }
    }
    results.push({ name: sc.name, expect: sc.expect, caught: caughtBy !== null, caught_by: caughtBy });
    console.log(`${caughtBy ? 'CAUGHT ' : 'MISSED '} ${sc.name} — ${caughtBy ?? '어떤 게이트도 거부하지 않음!'}`);
  }
  const missed = results.filter((r) => !r.caught);
  saveJson(join(realRoot, 'artifacts', 'corruption-report.json'), {
    fail_closed: missed.length === 0,
    scenarios: results
  });
  if (missed.length) {
    console.error(`corrupt: ${missed.length}/${results.length} scenarios NOT caught — fail-closed 위반`);
    process.exit(1);
  }
  console.log(`corrupt: all ${results.length} corruption scenarios caught (fail-closed OK)`);
}

if (process.argv[1] && fileURLToPath(import.meta.url) === process.argv[1]) main();
