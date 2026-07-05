'use client';

import type { VerificationReport } from '../lib/types';

export default function VerificationPanel({ report }: { report: VerificationReport | null }) {
  if (!report) return <p className="small">verification-report.json 로드 실패 — goal:core를 먼저 실행하세요.</p>;
  return (
    <div>
      <div className="card">
        <h3>검증 결과 (V01–V40)</h3>
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
