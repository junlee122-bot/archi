'use client';

import { useEffect, useMemo, useState } from 'react';
import dynamic from 'next/dynamic';
import type { Feature, Spec, VerificationReport } from '../lib/types';
import ModeTabs from '../components/ModeTabs';
import HypothesisPanel from '../components/HypothesisPanel';
import EvidenceDrawer from '../components/EvidenceDrawer';
import PhaseTimeline from '../components/PhaseTimeline';
import VerificationPanel from '../components/VerificationPanel';
import UncertaintyPanel from '../components/UncertaintyPanel';
import ConfidenceBadge from '../components/ConfidenceBadge';

const SceneViewer = dynamic(() => import('../components/SceneViewer'), { ssr: false });

const LIST_MODES: Record<string, (f: Feature) => boolean> = {
  '발굴유구': (f) => f.render_layer.startsWith('archaeology'),
  '내진감주': (f) => f.id === 'layout.omitted_inner_columns' || f.id.startsWith('superstructure.column_grid'),
  '동선/출입': (f) => f.category === 'movement' || f.category === 'entrance' || f.category === 'corridor' || f.category === 'walkway'
};

export default function Page() {
  const [spec, setSpec] = useState<Spec | null>(null);
  const [verification, setVerification] = useState<VerificationReport | null>(null);
  const [mode, setMode] = useState<string>('발굴유구');
  const [selectedFeature, setSelectedFeature] = useState<string | null>(null);
  const [activeHypothesis, setActiveHypothesis] = useState<string | null>(null);
  const [activePhase, setActivePhase] = useState<string | null>(null);

  useEffect(() => {
    fetch('artifacts/structural-spec.json')
      .then((r) => r.json())
      .then(setSpec)
      .catch(() => setSpec(null));
    fetch('artifacts/verification-report.json')
      .then((r) => r.json())
      .then(setVerification)
      .catch(() => setVerification(null));
  }, []);

  const feature = useMemo(
    () => spec?.features.find((f) => f.id === selectedFeature) ?? null,
    [spec, selectedFeature]
  );
  const hypothesis = useMemo(
    () => spec?.hypotheses.find((h) => h.id === activeHypothesis) ?? null,
    [spec, activeHypothesis]
  );
  const phaseFeatures = useMemo(() => {
    if (mode !== 'phase timeline' || !activePhase || !spec) return null;
    return spec.phases.find((p) => p.id === activePhase)?.visible_features ?? null;
  }, [mode, activePhase, spec]);

  if (!spec) {
    return (
      <div className="app">
        <header className="header">
          <h1>GONGPO-DONGGUNG PRO</h1>
          <span className="sub">structural-spec.json 로드 중… (goal:core → copy:web 필요)</span>
        </header>
      </div>
    );
  }

  const listFilter = LIST_MODES[mode];
  const gridTab = spec.derived.mode_tabs[1];

  return (
    <div className="app">
      <header className="header">
        <h1>GONGPO-DONGGUNG PRO — 경주 동궁과 월지 서편 A건물지</h1>
        <span className="sub">
          발굴유구 기반 표시 · 보고서 기반 해석 · spec v{spec.meta.spec_version} · 원형 복원이 아닙니다
        </span>
        <span className="safety">
          commercial_safe={String(spec.license_audit.commercial_safe)} — 소스별 license 개별 확인 정책
        </span>
      </header>

      <ModeTabs
        tabs={spec.derived.mode_tabs}
        active={mode}
        onSelect={(t) => {
          setMode(t);
          if (t !== 'phase timeline') setActivePhase(null);
        }}
      />

      <div className="main">
        <div className="scene">
          <SceneViewer spec={spec} mode={mode} activeHypothesis={hypothesis} phaseFeatures={phaseFeatures} />
          <div className="scene-overlay">
            <div>
              <ConfidenceBadge cls="DEMO" /> 화면의 모든 배치는 상대 placeholder — 실측 치수·좌표 아님 (source required)
            </div>
            {mode === gridTab && (
              <div>
                기둥 마커 {spec.derived.symbolic_column_grid.columns_along_front}×{spec.derived.symbolic_column_grid.columns_along_side}는 칸 수에서 파생한 symbolic 표시이며 발굴 위치가 아닙니다.
              </div>
            )}
            {mode === '내진감주' && <div>중앙 hatch는 내진감주(E1 보고 사실)의 symbolic 표시 — 생략 기둥의 정확한 위치는 미확정.</div>}
            {mode === '위계/기능 해석' && <div>반투명 mass는 상부구조 가설(ghost)이며 지붕·공포 형식은 지정하지 않습니다.</div>}
          </div>
        </div>

        <aside className="side">
          {listFilter && (
            <>
              <p className="small">feature를 클릭하면 사실/표시 confidence를 분리해 표시합니다.</p>
              {spec.features.filter(listFilter).map((f) => (
                <div
                  key={f.id}
                  className={`feature-row${selectedFeature === f.id ? ' selected' : ''}`}
                  onClick={() => setSelectedFeature(selectedFeature === f.id ? null : f.id)}
                >
                  <span>{f.name_ko}</span>
                  <span>
                    <ConfidenceBadge cls={f.confidence} short />
                    <ConfidenceBadge cls={f.render_confidence} short />
                  </span>
                </div>
              ))}
              <div className="divider" />
              <EvidenceDrawer feature={feature} />
            </>
          )}
          {mode === gridTab && (
            <>
              <div className="card">
                <h3>{gridTab}</h3>
                <p>칸 구성(E1 보고 사실)과 상대 그리드 표시(DEMO)를 분리합니다. 칸 간격 실측치는 null — PDF/도면 ingest 후 확정.</p>
              </div>
              <EvidenceDrawer feature={spec.features.find((f) => f.id === spec.meta.target_site.grid_feature_id) ?? null} />
            </>
          )}
          {mode === '위계/기능 해석' && (
            <HypothesisPanel hypotheses={spec.hypotheses} active={activeHypothesis} onSelect={setActiveHypothesis} />
          )}
          {mode === 'phase timeline' && (
            <PhaseTimeline phases={spec.phases} active={activePhase} onSelect={setActivePhase} />
          )}
          {mode === '불확실성' && <UncertaintyPanel spec={spec} />}
          {mode === '검증 결과' && <VerificationPanel report={verification} />}
        </aside>
      </div>
    </div>
  );
}
