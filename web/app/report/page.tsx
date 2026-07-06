'use client';

import { useEffect, useState } from 'react';
import { useArtifacts, fetchText } from '../../lib/useArtifacts';
import StatusBar from '../../components/StatusBar';
import Markdown from '../../components/Markdown';

const REPORTS: [string, string][] = [
  ['evidence-report.md', '증거 리포트 (fact vs render)'],
  ['hypotheses-report.md', '가설 리포트 (해석축 모델)'],
  ['phase-report.md', 'Phase 리포트 (단계 모델)'],
  ['license-audit.md', 'License 감사'],
  ['viewer-preview-checklist.md', '뷰어 프리뷰 체크리스트']
];

export default function ReportPage() {
  const artifacts = useArtifacts();
  const [texts, setTexts] = useState<Record<string, string | null>>({});
  const [open, setOpen] = useState<string>('evidence-report.md');

  useEffect(() => {
    Promise.all(
      REPORTS.map(async ([f]) => [f, await fetchText(`/artifacts/reports/${f}`)] as const)
    ).then((entries) => setTexts(Object.fromEntries(entries)));
  }, []);

  return (
    <div className="shell-page">
      <StatusBar artifacts={artifacts} />
      <div className="page-body">
        <h2>Report Viewer</h2>
        <p className="small">
          아래 리포트는 전부 동결 아티팩트에서 생성된 문서입니다 (goal:core → m3). 소스 PDF·이미지는 포함되지 않습니다.
        </p>
        <div className="tabs">
          {REPORTS.map(([f, label]) => (
            <button key={f} className={`tab${open === f ? ' active' : ''}`} onClick={() => setOpen(f)}>
              {label}{texts[f] === null && ' (없음)'}
            </button>
          ))}
        </div>
        <div className="card">
          {texts[open] ? (
            <Markdown text={texts[open]!} />
          ) : texts[open] === null ? (
            <p className="small">이 리포트 파일이 아직 스테이징되지 않았습니다 — <code>npm run m3 && npm run copy:web</code> 후 재빌드하세요.</p>
          ) : (
            <p className="small">로딩 중…</p>
          )}
        </div>
      </div>
    </div>
  );
}
