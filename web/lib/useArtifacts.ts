'use client';

import { useEffect, useState } from 'react';
import type { Spec, VerificationReport } from './types';

export interface CorruptionReport {
  fail_closed: boolean;
  scenarios: { name: string; expect: string; caught: boolean; caught_by: string | null }[];
}

export interface SourceMeta {
  id: string;
  title: string;
  author?: string;
  publisher?: string;
  journal?: string;
  type: string;
  year: number;
  license: string;
  license_verified: boolean;
  verified: boolean;
  priority: string;
  local_available?: boolean;
  missing_source?: boolean;
  public_asset_allowed?: boolean;
  use_policy?: string;
  pages?: string;
}

export interface Coverage {
  sources: {
    id: string; priority: string; verified: boolean; missing_source: boolean; local_available: boolean;
    segments: string[]; fact_evidence_count: number; geometry_evidence_count: number;
    features_backed: string[]; hypotheses_backed: string[]; phases_backed: string[];
  }[];
  p0_coverage: Record<string, string[]>;
  p0_without_external_backing: string[];
}

export interface Artifacts {
  spec: Spec | null;
  verification: VerificationReport | null;
  corruption: CorruptionReport | null;
  coverage: Coverage | null;
  sources: SourceMeta[] | null;
  loading: boolean;
}

const J = (path: string) =>
  fetch(path).then((r) => (r.ok ? r.json() : null)).catch(() => null);

export function useArtifacts(): Artifacts {
  const [state, setState] = useState<Artifacts>({
    spec: null, verification: null, corruption: null, coverage: null, sources: null, loading: true
  });
  useEffect(() => {
    Promise.all([
      J('/artifacts/structural-spec.json'),
      J('/artifacts/verification-report.json'),
      J('/artifacts/corruption-report.json'),
      J('/artifacts/source-coverage.json'),
      J('/artifacts/sources.json')
    ]).then(([spec, verification, corruption, coverage, sources]) =>
      setState({ spec, verification, corruption, coverage, sources, loading: false })
    );
  }, []);
  return state;
}

export const fetchText = (path: string) =>
  fetch(path).then((r) => (r.ok ? r.text() : null)).catch(() => null);
