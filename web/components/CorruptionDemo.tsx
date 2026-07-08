'use client';

import { UI_CORRUPTION_SCENARIOS } from '../lib/relations';

// Local-state corruption demo: mutates React state ONLY — never files or
// artifacts. Shows why the pipeline is fail-closed: corrupted evidence makes
// the affected feature/hypothesis render as refused (red) with the check ids
// that would catch it in the real verifier.
export default function CorruptionDemo({
  active, onToggle, onRestore
}: {
  active: string[];
  onToggle: (id: string) => void;
  onRestore: () => void;
}) {
  return (
    <div className="card">
      <h3>UI corruption 데모 (로컬 state 전용)</h3>
      <p className="small">
        아래 시나리오는 화면 상태만 조작합니다 — 실제 데이터/아티팩트 파일은 절대 변경되지 않습니다.
        실제 파이프라인에서는 동일 조작이 corruption 드릴(C01~C20, fail-closed)로 검증됩니다.
      </p>
      {UI_CORRUPTION_SCENARIOS.map((sc) => {
        const on = active.includes(sc.id);
        return (
          <div key={sc.id} className={`card ${on ? 'error' : ''}`} style={{ marginBottom: 8 }}>
            <p><b>{sc.label}</b></p>
            <p className="small mono">대상: {sc.target} · 관련 체크: {sc.simulatedChecks.join(', ')}</p>
            {on && <p className="warn">⛔ {sc.message}</p>}
            <button className={`btn ${on ? '' : 'danger'}`} onClick={() => onToggle(sc.id)}>
              {on ? '이 시나리오 해제' : '조작 실행 (시뮬레이션)'}
            </button>
          </div>
        );
      })}
      <button className="btn primary" onClick={onRestore} disabled={active.length === 0}>
        전체 복원 (원본 상태로)
      </button>
    </div>
  );
}
