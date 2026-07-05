'use client';

const LABELS: Record<string, string> = {
  E1: 'E1 공식 보고 사실',
  E2: 'E2 학술 소스 사실',
  E3: 'E3 복수 소스 추론',
  E4: 'E4 학술·공식 해석',
  E5: 'E5 탐색 가설',
  DEMO: 'DEMO 상대 placeholder'
};

export default function ConfidenceBadge({ cls, short }: { cls: string; short?: boolean }) {
  return (
    <span className={`badge ${cls}`} title={LABELS[cls] ?? cls}>
      {short ? cls : LABELS[cls] ?? cls}
    </span>
  );
}
