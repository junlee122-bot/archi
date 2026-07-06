'use client';

import { usePathname } from 'next/navigation';
import type { Artifacts } from '../lib/useArtifacts';

export default function StatusBar({ artifacts }: { artifacts: Artifacts }) {
  const { spec, verification, coverage } = artifacts;
  const path = usePathname();
  const localSources = (coverage?.sources ?? []).filter((s) => s.local_available || s.id.startsWith('nrich_2018')).length;
  const totalExternal = (coverage?.sources ?? []).filter((s) => s.id !== 'demo_rule_silla_palace_archaeology_basic').length;
  const nav = [
    ['/', '뷰어'], ['/studio', 'Studio'], ['/verify', 'Verify'], ['/report', 'Report']
  ] as const;
  return (
    <header className="topbar">
      <h1>GONGPO — 동궁과 월지 A건물지 근거 기반 뷰어</h1>
      <span className="statuschip ok">M1.5 core GREEN</span>
      {verification ? (
        <span className={`statuschip ${verification.summary.fail === 0 ? 'ok' : 'bad'}`}>
          verify {verification.summary.pass}P/{verification.summary.warn}W/{verification.summary.fail}F
        </span>
      ) : (
        <span className="statuschip">verify —</span>
      )}
      <span className="statuschip warn" title="license 미확정·좌표 미디지타이즈가 해소될 때까지 strict red가 정상입니다">
        strict RED (의도됨)
      </span>
      {spec && (
        <span className={`statuschip ${spec.license_audit.commercial_safe ? 'ok' : 'warn'}`}>
          commercial_safe={String(spec.license_audit.commercial_safe)}
        </span>
      )}
      {coverage && (
        <span className="statuschip info" title="근거 소스 커버리지 (로컬 확보/전체 외부 소스)">
          sources {localSources}/{totalExternal}
        </span>
      )}
      <nav className="nav">
        {nav.map(([href, label]) => {
          const cur = (path ?? '').replace(/\/+$/, '') || '/';
          const target = href.replace(/\/+$/, '') || '/';
          return (
            <a key={href} href={href} className={cur === target ? 'active' : ''}>{label}</a>
          );
        })}
      </nav>
    </header>
  );
}
