'use client';

import type { Hypothesis } from '../lib/types';
import ConfidenceBadge from './ConfidenceBadge';

// Axis-model cards (patch section D): H1/H2/H3 are layers on interpretation
// axes, NOT three mutually exclusive final answers. H2 carries a legacy /
// weakened badge; H3 renders only while the Wolji water/context layer exists.
export default function HypothesisPanel({
  hypotheses,
  active,
  onSelect
}: {
  hypotheses: Hypothesis[];
  active: string | null;
  onSelect: (id: string | null) => void;
}) {
  return (
    <div>
      <p className="small">
        해석축·기능축 모델 — 카드는 경쟁 해석 layer이며, 서로 배타적인 정답 후보가 아닙니다. H1과 H3는 겹칠 수 있습니다.
      </p>
      {hypotheses.map((h) => (
        <div
          key={h.id}
          className={`card${h.renderable ? '' : ' dimmed'}`}
          onClick={() => h.renderable && onSelect(active === h.id ? null : h.id)}
          style={{ cursor: h.renderable ? 'pointer' : 'not-allowed', outline: active === h.id ? '1px solid var(--accent)' : 'none' }}
        >
          <h3>{h.title_ko}</h3>
          <div>
            <span className="badge axis">{h.badges.axis_label_ko}</span>
            <ConfidenceBadge cls={h.confidence} short />
            {h.badges.strongest && <span className="badge strongest">가장 강한 해석축</span>}
            {h.badges.legacy && <span className="badge legacy">{h.badges.legacy_label_ko}</span>}
          </div>
          <p>{h.summary_ko}</p>
          {!h.renderable && (
            <p className="warn">
              render 차단: 필수 컨텍스트 layer 누락 ({h.missing_required_features.join(', ')})
            </p>
          )}
          {active === h.id && (
            <>
              <h4>근거</h4>
              <ul>
                {h.supporting_evidence.map((ev, i) => (
                  <li key={i}>
                    <ConfidenceBadge cls={ev.class} short /> {ev.claim} <span className="small">({ev.source_id})</span>
                  </li>
                ))}
              </ul>
              <h4>반대 근거</h4>
              <ul>
                {h.counter_evidence.map((ev, i) => (
                  <li key={i}>
                    <ConfidenceBadge cls={ev.class} short /> {ev.claim}
                  </li>
                ))}
              </ul>
              <h4>미해결 질문</h4>
              <ul>
                {h.unresolved_questions.map((q, i) => (
                  <li key={i}>{q}</li>
                ))}
              </ul>
            </>
          )}
          <p className="warn">{h.ui_treatment.warning}</p>
        </div>
      ))}
    </div>
  );
}
