'use client';

import type { Feature } from '../lib/types';
import ConfidenceBadge from './ConfidenceBadge';

const STACK_LABEL: Record<string, string> = {
  archaeology: '보고 사실',
  context: '보고 사실 / 맥락',
  hypothesis: '기능 가설',
  uncertainty: '불확실성',
};

// Fact confidence and render confidence are shown SEPARATELY (patch C):
// an E1 reported fact keeps its E1 badge even though its on-screen geometry
// is a DEMO relative placeholder.
export default function EvidenceDrawer({ feature }: { feature: Feature | null }) {
  if (!feature) {
    return <p className="small">feature를 선택하면 사실 근거와 표시 근거를 분리해 보여줍니다.</p>;
  }
  const stack = feature.derived_badges?.archaeology_vs_hypothesis ?? 'context';
  return (
    <div className="card">
      <h3>{feature.name_ko}</h3>
      <div>
        <span className="badge stage">{STACK_LABEL[stack] ?? stack}</span>
        {feature.render_layer.startsWith('interpretation') && <span className="badge stage">구조 해석</span>}
      </div>
      <div className="divider" />
      <h4>사실 layer (fact_layer)</h4>
      <p>
        <ConfidenceBadge cls={feature.fact_layer.confidence} /> {feature.fact_layer.statement_ko}
      </p>
      <ul>
        {feature.fact_layer.evidence.map((ev, i) => (
          <li key={i}>
            <ConfidenceBadge cls={ev.class} short /> {ev.source_id}
            {ev.locator?.page ? ` · locator: ${ev.locator.page}` : ' · locator 미확보'}
            {ev.verified === false && ' · 미검증'}
          </li>
        ))}
      </ul>
      <h4>표시 layer (geometry_layer)</h4>
      <p>
        <ConfidenceBadge cls={feature.render_confidence} /> {feature.geometry_layer.type}
        {feature.ui_flags.relative_geometry && ' — 상대 배치, 실측 아님'}
      </p>
      {feature.warnings.length > 0 && (
        <>
          <h4>주의</h4>
          <ul>
            {feature.warnings.map((w, i) => (
              <li key={i} className="warn">{w}</li>
            ))}
          </ul>
        </>
      )}
    </div>
  );
}
