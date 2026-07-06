'use client';

import type { Phase } from '../lib/types';
import ConfidenceBadge from './ConfidenceBadge';

// Phase timeline is part of product scope (patch section I): each phase cites
// sources and is labeled 유구 단계 vs 해석 단계.
export default function PhaseTimeline({
  phases,
  active,
  onSelect,
  compact = false
}: {
  phases: Phase[];
  active: string | null;
  onSelect: (id: string | null) => void;
  compact?: boolean;
}) {
  return (
    <div>
      {!compact && (
        <p className="small">유구 단계(발굴 보고 사실)와 해석 단계(학술·공식 해석)를 구분해 표시합니다. phase를 선택하면 해당 단계 layer만 scene에 남습니다.</p>
      )}
      {phases.map((p) => (
        <div
          key={p.id}
          className="card"
          onClick={() => onSelect(active === p.id ? null : p.id)}
          style={{ cursor: 'pointer', outline: active === p.id ? '1px solid var(--accent)' : 'none', padding: compact ? '6px 9px' : undefined }}
        >
          <h3 style={{ fontSize: compact ? 12 : undefined }}>{p.name_ko}</h3>
          <div>
            <span className="badge stage">{p.stage_kind}</span>
            <ConfidenceBadge cls={p.confidence} short />
            {p.stage_kind === '해석 단계' && <span className="badge outline">해석 — 확정 아님</span>}
          </div>
          {(!compact || active === p.id) && (
            <>
              <p className="small">근거: {p.source_titles.join(' · ')}</p>
              <p className="small">가시 feature {p.visible_features.length}개: <span className="mono">{p.visible_features.slice(0, 4).join(', ')}{p.visible_features.length > 4 ? ' …' : ''}</span></p>
              {!compact && <p>{p.notes}</p>}
            </>
          )}
        </div>
      ))}
    </div>
  );
}
