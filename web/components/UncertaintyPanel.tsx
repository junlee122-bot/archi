'use client';

import type { Feature, Spec } from '../lib/types';
import ConfidenceBadge from './ConfidenceBadge';

export default function UncertaintyPanel({ spec }: { spec: Spec }) {
  const markers = spec.features.filter((f) => f.category === 'uncertainty');
  const demoFeatures = spec.features.filter((f: Feature) => f.render_confidence === 'DEMO');
  return (
    <div>
      {markers.map((f) => (
        <div key={f.id} className="card">
          <h3>{f.name_ko}</h3>
          <p>{f.fact_layer.statement_ko}</p>
        </div>
      ))}
      <div className="card">
        <h3>상대 geometry placeholder ({demoFeatures.length}개)</h3>
        <p className="small">
          아래 layer의 화면 배치는 전부 상대 placeholder이며 실측이 아닙니다. 정확한 치수·좌표는 source locator 확보 후에만 표시됩니다 (source required).
        </p>
        <ul>
          {demoFeatures.map((f) => (
            <li key={f.id}>
              <ConfidenceBadge cls={f.confidence} short /> → <ConfidenceBadge cls="DEMO" short /> {f.name_ko}
            </li>
          ))}
        </ul>
      </div>
      <div className="card">
        <h3>상부구조 typology</h3>
        <p>
          지붕 형식과 공포 양식은 이 사이트에 지정되지 않았습니다 (not assigned for this site). 상부구조는 반투명 ghost mass로만 표시하며, 이는 규모·형식 추정이 아닙니다.
        </p>
      </div>
    </div>
  );
}
