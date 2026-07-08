'use client';

import { useState } from 'react';
import { useArtifacts } from '../../lib/useArtifacts';
import StatusBar from '../../components/StatusBar';
import CorruptionDemo from '../../components/CorruptionDemo';
import { UI_CORRUPTION_SCENARIOS } from '../../lib/relations';

export default function VerifyPage() {
  const artifacts = useArtifacts();
  const { verification, corruption } = artifacts;
  const [uiCorrupted, setUiCorrupted] = useState<string[]>([]);
  const simulatedFails = new Set(
    UI_CORRUPTION_SCENARIOS.filter((s) => uiCorrupted.includes(s.id)).flatMap((s) => s.simulatedChecks)
  );

  return (
    <div className="shell-page">
      <StatusBar artifacts={artifacts} />
      <div className="page-body" style={{ display: 'grid', gridTemplateColumns: '1fr 420px', gap: 16 }}>
        <div>
          <h2>Verification Console — V01–V64</h2>
          {verification ? (
            <>
              <div className="card">
                <p>
                  <b>normal mode</b>: <span className="status-pass">{verification.summary.pass} pass</span> ·{' '}
                  <span className="status-warn">{verification.summary.warn} warn</span> ·{' '}
                  <span className="status-fail">{verification.summary.fail} fail</span> / {verification.summary.total}
                </p>
                <p>
                  <b>strict mode</b>: <span className="status-fail">RED (의도됨)</span> — warn 항목이 전부 fail로
                  승격됩니다. 2022 보고서 license human review, 학회지 3종 license 확인, 좌표 디지타이즈가
                  완료되기 전까지 strict red가 <b>정상 상태</b>입니다. green으로 보이게 만드는 것이 아니라,
                  blocker가 해소될 때만 green이 되도록 설계되어 있습니다.
                </p>
              </div>
              {verification.checks.map((c) => {
                const sim = simulatedFails.has(c.id);
                return (
                  <div key={c.id} className={`check-row${sim ? ' corrupted' : ''}`}>
                    <span className={sim ? 'status-fail' : `status-${c.status}`}>
                      {sim ? 'FAIL*' : c.status.toUpperCase()}
                    </span>
                    <span>
                      <span className="mono">{c.id}</span> — {c.title}
                      {sim && <div className="details status-fail">* UI corruption 시뮬레이션이 이 체크를 위반 — 실제 아티팩트는 변경되지 않음</div>}
                      {c.details && c.details.length > 0 && <div className="details">{c.details.join(' · ')}</div>}
                    </span>
                  </div>
                );
              })}
            </>
          ) : (
            <p>verification-report.json 로드 실패 — goal:core를 먼저 실행하세요.</p>
          )}
        </div>
        <div>
          <CorruptionDemo
            active={uiCorrupted}
            onToggle={(id) => setUiCorrupted((c) => (c.includes(id) ? c.filter((x) => x !== id) : [...c, id]))}
            onRestore={() => setUiCorrupted([])}
          />
          <div className="card">
            <h3>파이프라인 corruption 드릴 (실제 fail-closed 증명)</h3>
            {corruption ? (
              <>
                <p>
                  {corruption.scenarios.filter((s) => s.caught).length}/{corruption.scenarios.length} 시나리오 거부 —
                  fail_closed: <b>{String(corruption.fail_closed)}</b>
                </p>
                <ul>
                  {corruption.scenarios.map((s) => (
                    <li key={s.name}>
                      <span className={s.caught ? 'status-pass' : 'status-fail'}>{s.caught ? 'CAUGHT' : 'MISSED'}</span>{' '}
                      <span className="mono">{s.name}</span>
                      <div className="small">{s.caught_by}</div>
                    </li>
                  ))}
                </ul>
              </>
            ) : (
              <p className="small">corruption-report.json 미로드</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
