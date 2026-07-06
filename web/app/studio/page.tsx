'use client';

import { useMemo, useState } from 'react';
import { useArtifacts } from '../../lib/useArtifacts';
import { hasLocator, segmentCount, linkedHypotheses, linkedPhases } from '../../lib/relations';
import StatusBar from '../../components/StatusBar';
import ConfidenceBadge from '../../components/ConfidenceBadge';

type Flag = 'all' | 'missing_locator' | 'demo_geometry' | 'uncertain' | 'e1_backed' | 'hypothesis_linked';

export default function StudioPage() {
  const artifacts = useArtifacts();
  const { spec, sources } = artifacts;
  const [q, setQ] = useState('');
  const [flag, setFlag] = useState<Flag>('all');

  const rows = useMemo(() => {
    if (!spec) return [];
    return spec.features.map((f) => {
      const hyps = linkedHypotheses(spec, f.id).map((h) => h.id);
      const phases = linkedPhases(spec, f.id).map((p) => p.id);
      return {
        f, hyps, phases,
        segs: segmentCount(f),
        locator: hasLocator(f),
        demo: f.render_confidence === 'DEMO',
        uncertain: ['E5', 'DEMO'].includes(f.confidence) || f.category === 'uncertainty',
        e1: f.confidence === 'E1'
      };
    });
  }, [spec]);

  const filtered = rows.filter((r) => {
    if (q && !(r.f.id + r.f.name_ko + r.f.category).toLowerCase().includes(q.toLowerCase())) return false;
    switch (flag) {
      case 'missing_locator': return !r.locator;
      case 'demo_geometry': return r.demo;
      case 'uncertain': return r.uncertain;
      case 'e1_backed': return r.e1;
      case 'hypothesis_linked': return r.hyps.length > 0;
      default: return true;
    }
  });

  const licenseWarn = (sources ?? []).filter((s) => !s.license_verified && s.type !== 'internal_rule');

  return (
    <div className="shell-page">
      <StatusBar artifacts={artifacts} />
      <div className="page-body">
        <h2>Corpus Review Studio</h2>
        <p className="small">
          feature {rows.length}개 · segment 연결·locator 상태·fact/render confidence를 검수하는 정적 리뷰 테이블입니다 (쓰기 없음).
          license 미확정 소스 {licenseWarn.length}건: {licenseWarn.map((s) => s.id).join(', ')}
        </p>
        <div className="filters">
          <input placeholder="검색 (id / 이름 / category)" value={q} onChange={(e) => setQ(e.target.value)} />
          {([
            ['all', '전체'],
            ['missing_locator', '숫자 locator 없음'],
            ['demo_geometry', 'DEMO geometry'],
            ['uncertain', 'E5/불확실'],
            ['e1_backed', 'E1 보고 사실'],
            ['hypothesis_linked', '가설 연결']
          ] as [Flag, string][]).map(([k, label]) => (
            <button key={k} className={`tab${flag === k ? ' active' : ''}`} onClick={() => setFlag(k)}>{label}</button>
          ))}
          <span className="small">{filtered.length} / {rows.length}</span>
        </div>
        <table className="studio">
          <thead>
            <tr>
              <th>feature id</th><th>이름</th><th>category</th><th>fact</th><th>render</th>
              <th>seg</th><th>locator</th><th>가설</th><th>phase</th><th>flags</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map(({ f, hyps, phases, segs, locator, demo, uncertain }) => (
              <tr key={f.id}>
                <td className="mono">{f.id}</td>
                <td>{f.name_ko}</td>
                <td>{f.category}</td>
                <td><ConfidenceBadge cls={f.confidence} short /></td>
                <td><ConfidenceBadge cls={f.render_confidence} short /></td>
                <td>{segs}</td>
                <td>{locator ? <span className="status-pass">page ✓</span> : <span className="status-warn">없음</span>}</td>
                <td className="mono">{hyps.map((h) => h.replace(/_.*/, '')).join(' ') || '—'}</td>
                <td className="mono">{phases.map((p) => p.split('_')[0]).join(' ') || '—'}</td>
                <td>
                  {demo && <span className="badge DEMO">DEMO</span>}
                  {uncertain && <span className="badge E5">불확실</span>}
                  {(f.geometry_layer as any).geometry_mode === 'report_dimension_scaled' && <span className="badge E3">scaled</span>}
                  {f.warnings.length > 0 && <span className="badge outline">주의 {f.warnings.length}</span>}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
