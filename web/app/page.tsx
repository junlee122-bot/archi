'use client';

import { useEffect, useMemo, useState } from 'react';
import dynamic from 'next/dynamic';
import type { Feature } from '../lib/types';
import { useArtifacts } from '../lib/useArtifacts';
import { UI_CORRUPTION_SCENARIOS, CONF_COLOR } from '../lib/relations';
import StatusBar from '../components/StatusBar';
import ModeTabs from '../components/ModeTabs';
import HypothesisPanel from '../components/HypothesisPanel';
import EvidenceDrawer from '../components/EvidenceDrawer';
import PhaseTimeline from '../components/PhaseTimeline';
import VerificationPanel from '../components/VerificationPanel';
import UncertaintyPanel from '../components/UncertaintyPanel';
import CorruptionDemo from '../components/CorruptionDemo';
import StratigraphyInset from '../components/StratigraphyInset';
import ConfidenceBadge from '../components/ConfidenceBadge';

const SceneViewer = dynamic(() => import('../components/SceneViewer'), { ssr: false });

// which feature list the right panel shows per mode
const LIST_FILTER: Record<string, (f: Feature) => boolean> = {
  '발굴유구': (f) => f.render_layer.startsWith('archaeology'),
  '제원/그리드': (f) => ['layout', 'foundation', 'platform'].includes(f.category),
  '내진감주': (f) => f.id === 'layout.omitted_inner_columns' || f.id === 'foundation.jeoksim_grid' || f.id.startsWith('superstructure.column'),
  '출입/동선': (f) => ['entrance', 'movement', 'walkway'].includes(f.category),
  '익랑·회랑': (f) => f.category === 'corridor',
  '대지조성·트렌치': (f) => ['land_preparation', 'trench', 'stratigraphy'].includes(f.category) || f.id === 'context.pre_wolji_dongji',
  '구조 실루엣': (f) =>
    ['conjectural_superstructure_proxy', 'material_context', 'helper'].includes(f.category) ||
    ['uncertainty.column_height_unknown', 'uncertainty.roof_typology_unknown', 'uncertainty.bracket_typology_unknown'].includes(f.id)
};

const PROXY_WARNING_BADGES = ['원형 복원 아님', '지붕형식 미지정', '공포양식 미지정', '기둥 높이 미확정'];

export default function Page() {
  const artifacts = useArtifacts();
  const { spec, verification, sources } = artifacts;
  const [mode, setMode] = useState('발굴유구');
  const [selected, setSelected] = useState<string | null>(null);
  const [activeHyp, setActiveHyp] = useState<string | null>(null);
  const [activePhase, setActivePhase] = useState<string | null>(null);
  const [ghostOn, setGhostOn] = useState(false);
  const [corrupted, setCorrupted] = useState<string[]>([]);
  // M2.6 구조 실루엣 layer state (표시 전용 — 실측·형식 주장 없음)
  const [silOn, setSilOn] = useState(true);
  const [silParts, setSilParts] = useState({ columns: true, beams: true, roof: true, corridor: true, scale: true });
  const [heightPreset, setHeightPreset] = useState('중간');
  const [silEmph, setSilEmph] = useState(false);
  const [cameraPreset, setCameraPreset] = useState('유구 중심');

  useEffect(() => {
    // entering 구조 실루엣: silhouette on, overview selected, oblique camera
    if (mode === '구조 실루엣') {
      setSilOn(true);
      setSelected((prev) => prev ?? 'superstructure.proxy.overview');
      setCameraPreset('건물 실루엣');
    } else if (mode === '발굴유구') {
      setCameraPreset('유구 중심');
    }
  }, [mode]);

  const feature = useMemo(() => spec?.features.find((f) => f.id === selected) ?? null, [spec, selected]);
  const hypothesis = useMemo(() => spec?.hypotheses.find((h) => h.id === activeHyp) ?? null, [spec, activeHyp]);
  const phaseFeatures = useMemo(() => {
    if (!activePhase || !spec) return null;
    return spec.phases.find((p) => p.id === activePhase)?.visible_features ?? null;
  }, [activePhase, spec]);

  if (artifacts.loading) return <div className="shell"><header className="topbar"><h1>GONGPO — 로딩 중…</h1></header></div>;
  if (!spec) {
    return (
      <div className="shell">
        <header className="topbar"><h1>GONGPO — 동궁과 월지 A건물지 근거 기반 뷰어</h1></header>
        <div className="page-body"><p>structural-spec.json 로드 실패 — <code>npm run goal:core && npm run copy:web</code> 후 다시 빌드하세요.</p></div>
      </div>
    );
  }

  const corruptedFeatureIds = UI_CORRUPTION_SCENARIOS
    .filter((s) => corrupted.includes(s.id) && s.targetKind === 'feature')
    .flatMap((s) => [s.target, ...(s.alsoAffects ?? [])]);
  const corruptedHypIds = UI_CORRUPTION_SCENARIOS
    .filter((s) => corrupted.includes(s.id) && s.targetKind === 'hypothesis')
    .map((s) => s.target);
  const highlightIds = mode === '해석축' && hypothesis
    ? [...hypothesis.supporting_features, ...(hypothesis.ui_treatment.highlight ?? [])]
    : [];
  const ghostOpacity = hypothesis?.ui_treatment.superstructure_opacity ?? 0.14;
  const listFilter = LIST_FILTER[mode];
  const rds = spec.derived.report_dimension_scaled;
  // proxy silhouette visibility per mode (발굴유구 등 고고학 기본 모드에서는 항상 OFF)
  const proxyVisible =
    mode === '구조 실루엣' ? silOn
    : mode === '불확실성' ? silOn
    : mode === '해석축' ? activeHyp === 'H1_royal_formal_space'
    : mode === '검증결과' ? (silOn && corrupted.includes('ui_c2_promote_roof_to_e1'))
    : false;

  return (
    <div className="shell">
      <StatusBar artifacts={artifacts} />
      <div className="viewer-grid">
        {/* ── left: modes + phases + hypothesis switcher ─────────── */}
        <aside className="leftpanel">
          <h4 className="small">뷰어 모드</h4>
          <ModeTabs tabs={spec.derived.mode_tabs} active={mode} onSelect={(t) => { setMode(t); if (t !== '해석축') setActiveHyp(null); }} />
          <div className="divider" />
          <h4 className="small">phase timeline (클릭 → 해당 단계 layer만 표시)</h4>
          <PhaseTimeline phases={spec.phases} active={activePhase} onSelect={setActivePhase} compact />
          <div className="divider" />
          <h4 className="small">해석축 빠른 전환</h4>
          {spec.hypotheses.map((h) => (
            <button
              key={h.id}
              className={`tab${activeHyp === h.id ? ' active' : ''}`}
              style={{ display: 'block', width: '100%', textAlign: 'left', marginBottom: 4 }}
              onClick={() => { setMode('해석축'); setActiveHyp(activeHyp === h.id ? null : h.id); }}
            >
              <span className="badge axis">{h.axis_label_ko.slice(0, 6)}</span> {h.title_ko.slice(0, 22)}…
            </button>
          ))}
          <div className="divider" />
          <button className="btn" onClick={() => setGhostOn(!ghostOn)}>
            상부구조 ghost {ghostOn ? '끄기' : '켜기'} (형식 미지정)
          </button>
          {ghostOn && <p className="warn small">ghost mass는 존재 개연성 표시일 뿐 — 지붕형식·공포양식·기둥 높이 주장 없음.</p>}
          <div className="divider" />
          <h4 className="small">카메라 preset</h4>
          {(['유구 중심', '건물 실루엣', '상부/평면 비교'] as const).map((p) => (
            <button
              key={p}
              className={`tab${cameraPreset === p ? ' active' : ''}`}
              style={{ display: 'block', width: '100%', textAlign: 'left', marginBottom: 4 }}
              onClick={() => setCameraPreset(p)}
            >
              {p}
            </button>
          ))}
        </aside>

        {/* ── center: scene + overlays ───────────────────────────── */}
        <main className="centerpane">
          <SceneViewer
            spec={spec}
            mode={mode}
            highlightIds={highlightIds}
            corruptedIds={corruptedFeatureIds}
            phaseFeatures={phaseFeatures}
            ghostOn={ghostOn || (mode === '해석축' && !!hypothesis)}
            ghostOpacity={ghostOpacity}
            onSelect={setSelected}
            proxyOn={proxyVisible}
            proxyParts={silParts}
            heightPreset={heightPreset}
            emphasizeSilhouette={silEmph}
            cameraPreset={cameraPreset}
          />
          <div className="overlay tl">
            <div className="dimlabel">정면 <b>{rds?.length_m ?? '—'}m</b> × 측면 <b>{rds?.width_m ?? '—'}m</b> · 7×4칸 <span className="small">(2022 보고서 p.84 — 보고서 근거 치수)</span></div>
            {mode === '제원/그리드' && (
              <div className="dimlabel">개별 적심 좌표 미디지타이즈 — 전체 치수 기반 scaled grid · 칸 분할 균등 가정</div>
            )}
            {mode === '내진감주' && (
              <div className="dimlabel"><span className="badge legacy">내진감주 해석</span> 중앙 4개소 적심 공백(E1) — hatch는 상징 표시, 기능 미확정</div>
            )}
            {mode === '출입/동선' && (
              <div className="dimlabel">화살표는 <b>해석</b>(동선 상정)이며 발굴 사실이 아님 · 남편 2개소 답도 E1</div>
            )}
            {mode === '대지조성·트렌치' && (
              <div className="dimlabel">東池 수변(북쪽 청록 면)은 <b>해석 layer</b> (지영배 2023, E4) — 호안선 아님</div>
            )}
            {mode === '구조 실루엣' && (
              <>
                <div className="dimlabel"><b>구조 실루엣</b> — 상부구조 가설을 투명하게 보기 · <span className="badge legacy">RENDER E5 / DEMO</span></div>
                <div className="dimlabel small">기둥·보·지붕 질량감은 발굴유구와 보고서 치수에 의해 제약된 표시 layer입니다. 지붕형식·공포양식·기둥 높이는 확정하지 않습니다.</div>
                {silParts.roof && proxyVisible && <div className="dimlabel">지붕 질량감 — 형식 미지정</div>}
                {silParts.columns && proxyVisible && <div className="dimlabel">감주 영역 — 기둥 없음/미확인 (점선 슬롯)</div>}
              </>
            )}
            {mode === '해석축' && proxyVisible && (
              <div className="dimlabel"><span className="badge legacy">확정 아님</span> H1 선택 — 구조 실루엣 저불투명 표시 (원형 복원 아님)</div>
            )}
            {selected && <div className="dimlabel">선택: <b>{feature?.name_ko}</b> <span className="mono small">{selected}</span></div>}
          </div>
          <div className="overlay tr">
            <div className="northarrow" title="도면 방위는 자북 기준(2022 일러두기) — 화면 배치는 상대 표시">
              <svg width="26" height="26" viewBox="0 0 24 24">
                <polygon points="12,2 16,14 12,11 8,14" fill="#d9a441" />
                <text x="12" y="22" textAnchor="middle" fontSize="7" fill="#98a0ad">N</text>
              </svg>
            </div>
            <div className="dimlabel">배치 상대 표시</div>
          </div>
          <div className="overlay bl">
            <div className="legend">
              <b>confidence</b>{' '}
              {Object.entries(CONF_COLOR).map(([k, c]) => (
                <span key={k} style={{ marginRight: 6 }}><span className="sw" style={{ background: c }} />{k}</span>
              ))}
              <span> · 반투명/점묘 = DEMO·symbolic · 스케일바 5m</span>
            </div>
          </div>
          <div className="overlay br">
            <div className="legend">발굴유구 기반 표시 · 보고서 기반 해석 — 원형 복원이 아닙니다</div>
          </div>
        </main>

        {/* ── right: mode-specific panel + drawer ────────────────── */}
        <aside className="rightpanel">
          {listFilter && (
            <>
              {mode === '대지조성·트렌치' && <StratigraphyInset spec={spec} onSelect={setSelected} />}
              {mode === '구조 실루엣' && (
                <div className="card">
                  <h3>구조 실루엣</h3>
                  <p className="small">
                    이 레이어는 A건물지의 평면 규모·적심·답도·회랑 등 보고서 기반 유구 위에, 상부구조의
                    존재감을 이해하기 위한 투명한 시각화입니다. 지붕형식·공포양식·기둥 높이는 확정하지 않습니다.
                  </p>
                  <div style={{ marginBottom: 8 }}>
                    {PROXY_WARNING_BADGES.map((b) => (
                      <span key={b} className="badge legacy" style={{ marginRight: 4, marginBottom: 4 }}>{b}</span>
                    ))}
                    <span className="badge outline">표시 geometry E5/DEMO</span>
                    <span className="badge outline">상부 목구조 직접 근거 없음</span>
                  </div>
                  <div style={{ display: 'flex', gap: 6, marginBottom: 8 }}>
                    <button className={`btn${!silOn ? ' primary' : ''}`} onClick={() => setSilOn(false)}>발굴유구만</button>
                    <button className={`btn${silOn ? ' primary' : ''}`} onClick={() => setSilOn(true)}>실루엣 겹쳐보기</button>
                  </div>
                  <label className="small" style={{ display: 'block', marginBottom: 4 }}>
                    <input type="checkbox" checked={silOn} onChange={(e) => setSilOn(e.target.checked)} /> 상부구조 실루엣
                  </label>
                  {([
                    ['columns', '기둥'], ['beams', '보 프레임'], ['roof', '지붕 질량감'],
                    ['corridor', '회랑 실루엣'], ['scale', '스케일 인물']
                  ] as const).map(([k, label]) => (
                    <label key={k} className="small" style={{ display: 'inline-block', marginRight: 10, marginBottom: 4 }}>
                      <input
                        type="checkbox"
                        checked={silParts[k]}
                        onChange={(e) => setSilParts({ ...silParts, [k]: e.target.checked })}
                      /> {label}
                    </label>
                  ))}
                  <label className="small" style={{ display: 'block', marginBottom: 6 }}>
                    <input type="checkbox" checked={silEmph} onChange={(e) => setSilEmph(e.target.checked)} /> 실루엣 강조 (상한 유지)
                  </label>
                  <h4 className="small">기둥 높이 preset — <b>시각화 preset — 실측 높이 아님</b></h4>
                  <div style={{ display: 'flex', gap: 6 }}>
                    {['낮게', '중간', '높게'].map((p) => (
                      <button key={p} className={`tab${heightPreset === p ? ' active' : ''}`} onClick={() => setHeightPreset(p)}>{p}</button>
                    ))}
                  </div>
                  <p className="small warn" style={{ marginTop: 6 }}>
                    감주 영역 — 기둥 없음/미확인: 중앙 4개소는 점선 슬롯으로만 표시되며 기둥으로 채우지 않습니다.
                  </p>
                </div>
              )}
              <h4 className="small">이 모드의 feature (fact / render)</h4>
              {spec.features.filter(listFilter).map((f) => (
                <div
                  key={f.id}
                  className={`feature-row${selected === f.id ? ' selected' : ''}${corruptedFeatureIds.includes(f.id) ? ' corrupted' : ''}`}
                  onClick={() => setSelected(selected === f.id ? null : f.id)}
                >
                  <span>{f.name_ko}</span>
                  <span><ConfidenceBadge cls={f.confidence} short /><ConfidenceBadge cls={f.render_confidence} short /></span>
                </div>
              ))}
              <div className="divider" />
              <EvidenceDrawer feature={feature} spec={spec} sources={sources} />
            </>
          )}
          {mode === '해석축' && (
            <>
              <HypothesisPanel
                hypotheses={spec.hypotheses.map((h) => corruptedHypIds.includes(h.id)
                  ? { ...h, renderable: false, missing_required_features: ['김경열 2023 근거 (UI 조작으로 제거됨)'] }
                  : h)}
                active={activeHyp}
                onSelect={setActiveHyp}
              />
              <EvidenceDrawer feature={feature} spec={spec} sources={sources} />
            </>
          )}
          {mode === '불확실성' && (
            <>
              <UncertaintyPanel spec={spec} />
              <EvidenceDrawer feature={feature} spec={spec} sources={sources} />
            </>
          )}
          {mode === '검증결과' && (
            <>
              <CorruptionDemo
                active={corrupted}
                onToggle={(id) => setCorrupted((c) => (c.includes(id) ? c.filter((x) => x !== id) : [...c, id]))}
                onRestore={() => setCorrupted([])}
              />
              <VerificationPanel report={verification} />
            </>
          )}
        </aside>
      </div>

      {/* ── bottom: verifier mini bar + links ────────────────────── */}
      <footer className="bottombar">
        {verification && (
          <span>
            verifier: <span className="status-pass">{verification.summary.pass}P</span>{' '}
            <span className="status-warn">{verification.summary.warn}W</span>{' '}
            <span className="status-fail">{verification.summary.fail}F</span> / {verification.summary.total} (V01–V{String(verification.summary.total).padStart(2, '0')})
          </span>
        )}
        <button className="btn danger" onClick={() => setMode('검증결과')}>corruption 데모</button>
        <span className="small">strict RED는 license·좌표 blocker 해소 전까지 의도된 상태입니다.</span>
        <span style={{ marginLeft: 'auto' }} className="small">
          <a href="/studio">Studio</a> · <a href="/verify">Verify</a> · <a href="/report">Report</a>
        </span>
      </footer>
    </div>
  );
}
