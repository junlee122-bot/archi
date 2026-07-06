'use client';

import type { Spec } from '../lib/types';

const LAYER_COLORS = ['#4a4136', '#5a4f40', '#6b5a44', '#7c6a4e', '#c8a23c', '#8a7654', '#6e6a5a', '#57606e'];

// 2.5D stratigraphy mini-section (north trench). Thickness ratios come from
// the reported values in the artifact; the section shape is schematic — no
// source drawing or photo is ever used.
export default function StratigraphyInset({ spec, onSelect }: { spec: Spec; onSelect: (id: string) => void }) {
  const s = spec.derived.stratigraphy_section;
  if (!s) return null;
  const layers = [...(s.layers ?? [])].reverse(); // top-first for display
  return (
    <div className="card">
      <h3>북편 트렌치 층서 단면 (2.5D 모식)</h3>
      <p className="small">{s.note}</p>
      <div style={{ border: '1px solid var(--line)', borderRadius: 6, overflow: 'hidden', position: 'relative' }}>
        {layers.map((l: any, i: number) => (
          <div
            key={l.code}
            onClick={() => onSelect('stratigraphy.layers')}
            style={{
              background: LAYER_COLORS[(layers.length - 1 - i) % LAYER_COLORS.length],
              height: `${18 + (l.relative_thickness ?? 1) * 14}px`,
              display: 'flex', alignItems: 'center', justifyContent: 'space-between',
              padding: '0 8px', cursor: 'pointer', fontSize: 10.5,
              borderBottom: '1px solid rgba(0,0,0,0.35)', color: '#f2efe8', textShadow: '0 1px 1px rgba(0,0,0,0.6)'
            }}
          >
            <span><b>{l.code}</b> {l.name_ko}</span>
            <span>{l.thickness_note ?? l.dating_note ?? ''}</span>
          </div>
        ))}
        {/* 보토시설: vertical band overlay (Ji p.859 — 1.8m × 0.95m) */}
        <div
          onClick={() => onSelect('land_preparation.boto_facility')}
          title="보토시설 (Ⅴ-2층) — 높이 약 1.8m·너비 0.95m, 방수/호안 기능은 해석"
          style={{
            position: 'absolute', right: '18%', top: '30%', bottom: '18%', width: 14,
            background: 'repeating-linear-gradient(180deg,#e0c23c,#e0c23c 6px,#b89a2c 6px,#b89a2c 12px)',
            border: '1px solid #7a6a1e', cursor: 'pointer'
          }}
        />
      </div>
      <p className="small">
        노란 세로 밴드 = 보토시설(Ⅴ-2, 지영배 2023 p.859). 東池 수변 맥락은 해석 layer로 별도 표시됩니다.
      </p>
    </div>
  );
}
