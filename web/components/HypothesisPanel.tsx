'use client';

import type { Hypothesis } from '../lib/types';
import ConfidenceBadge from './ConfidenceBadge';

const AXIS_ORDER = ['spatial_political_attribution', 'historiography', 'functional_program'];
const AXIS_DESC: Record<string, string> = {
  spatial_political_attribution: '공간·정치 비정 축 — 이 공간이 누구의 공간인가',
  historiography: '연구사 축 — 기존 해석의 형성과 비판',
  functional_program: '기능 프로그램 축 — 무엇을 하던 공간인가 (H1과 중첩 가능)'
};

// Axis-model panel: H1/H2/H3 are layers on interpretation axes — NOT three
// equal final options. Clicking a card highlights its related features.
export default function HypothesisPanel({
  hypotheses, active, onSelect
}: {
  hypotheses: Hypothesis[];
  active: string | null;
  onSelect: (id: string | null) => void;
}) {
  return (
    <div>
      <p className="small">
        해석축 모델 — 카드는 축 위의 layer이며 서로 배타적인 정답 후보가 아닙니다. 카드를 클릭하면 관련 유구가 장면에서 강조됩니다.
      </p>
      {AXIS_ORDER.map((axis) => {
        const list = hypotheses.filter((h) => h.axis === axis);
        if (!list.length) return null;
        return (
          <div key={axis}>
            <p className="small" style={{ borderBottom: '1px solid var(--line)', paddingBottom: 3 }}>
              <span className="badge axis">{list[0].axis_label_ko}</span> {AXIS_DESC[axis]}
            </p>
            {list.map((h) => {
              const badges: string[] = (h.ui_treatment as any).badges_ko ?? [];
              return (
                <div
                  key={h.id}
                  className={`card${h.renderable ? '' : ' dimmed'}`}
                  onClick={() => h.renderable && onSelect(active === h.id ? null : h.id)}
                  style={{ cursor: h.renderable ? 'pointer' : 'not-allowed', outline: active === h.id ? '1px solid var(--accent)' : 'none' }}
                >
                  <h3>{h.title_ko}</h3>
                  <div>
                    <ConfidenceBadge cls={h.confidence} short />
                    {h.badges.strongest && <span className="badge strongest">가장 강한 해석축</span>}
                    {badges.filter((b) => b !== '가장 강한 해석축').map((b) => (
                      <span key={b} className="badge outline">{b}</span>
                    ))}
                    {h.badges.legacy && <span className="badge legacy">{h.badges.legacy_label_ko}</span>}
                    {h.axis === 'functional_program' && <span className="badge outline">기능축 · E5 낮은 신뢰도</span>}
                  </div>
                  <p className="small">
                    근거 {h.supporting_evidence.length}건 · 반대 근거 {h.counter_evidence.length}건 · 관련 유구 {h.supporting_features.length}개
                  </p>
                  <p>{h.summary_ko}</p>
                  {!h.renderable && (
                    <p className="warn">render 차단: 필수 컨텍스트 layer 누락 ({h.missing_required_features.join(', ')})</p>
                  )}
                  {active === h.id && (
                    <>
                      <h4>근거</h4>
                      <ul>
                        {h.supporting_evidence.map((ev, i) => (
                          <li key={i}>
                            <ConfidenceBadge cls={ev.class} short /> {ev.claim}{' '}
                            <span className="small">({ev.source_id}{(ev as any).locator?.page ? ` p.${(ev as any).locator.page}` : ''})</span>
                          </li>
                        ))}
                      </ul>
                      <h4>반대 근거</h4>
                      <ul>
                        {h.counter_evidence.map((ev, i) => (
                          <li key={i}><ConfidenceBadge cls={ev.class} short /> {ev.claim}</li>
                        ))}
                      </ul>
                      <h4>미해결 질문</h4>
                      <ul>{h.unresolved_questions.map((q, i) => <li key={i}>{q}</li>)}</ul>
                    </>
                  )}
                  <p className="warn">{h.ui_treatment.warning}</p>
                </div>
              );
            })}
          </div>
        );
      })}
    </div>
  );
}
