'use client';

import { useEffect, useState } from 'react';
import type { VerificationReport } from '../lib/types';

interface CorruptionReport {
  fail_closed: boolean;
  scenarios: { name: string; expect: string; caught: boolean; caught_by: string | null }[];
}

export default function VerificationPanel({ report }: { report: VerificationReport | null }) {
  const [corruption, setCorruption] = useState<CorruptionReport | null>(null);
  useEffect(() => {
    fetch('/artifacts/corruption-report.json')
      .then((r) => r.json())
      .then(setCorruption)
      .catch(() => setCorruption(null));
  }, []);
  if (!report) return <p className="small">verification-report.json 로드 실패 — goal:core를 먼저 실행하세요.</p>;
  return (
    <div>
      <div className="card">
        <h3>corruption 드릴 (fail-closed)</h3>
        {corruption ? (
          <>
            <p>
              {corruption.scenarios.filter((s) => s.caught).length}/{corruption.scenarios.length} 조작 시나리오 거부
              — fail_closed: <b>{String(corruption.fail_closed)}</b>
            </p>
            <ul>
              {corruption.scenarios.map((s) => (
                <li key={s.name}>
                  <span className={s.caught ? 'status-pass' : 'status-fail'}>{s.caught ? 'CAUGHT' : 'MISSED'}</span>{' '}
                  {s.name} <span className="small">{s.caught_by ?? ''}</span>
                </li>
              ))}
            </ul>
          </>
        ) : (
          <p className="small">corruption-report.json 미로드 — npm run corrupt 후 copy:web 필요.</p>
        )}
      </div>
      <div className="card">
        <h3>검증 결과 (V01–V64)</h3>
        <p>
          {report.summary.pass} pass · {report.summary.warn} warn · {report.summary.fail} fail
          {report.strict ? ' (strict)' : ''}
        </p>
        <p className="small">warn 항목은 소스 locator/license 확정 로드맵 항목이며 strict mode에서 fail로 승격됩니다.</p>
      </div>
      {report.checks.map((c) => (
        <div key={c.id} className="check-row">
          <span className={`status-${c.status}`}>{c.status.toUpperCase()}</span>
          <span>
            {c.id} — {c.title}
            {c.details && c.details.length > 0 && (
              <div className="details">{c.details.join(' · ')}</div>
            )}
          </span>
        </div>
      ))}
    </div>
  );
}
