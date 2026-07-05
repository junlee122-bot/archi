import type { ReactNode } from 'react';
import './globals.css';

export const metadata = {
  title: 'GONGPO-DONGGUNG PRO — 경주 동궁과 월지 서편 A건물지 (발굴유구 기반 표시)',
  description:
    '경주 동궁과 월지 서편 A건물지 evidence-separated viewer. 보고서 기반 해석과 상대 geometry placeholder를 분리해 표시한다.'
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="ko">
      <body>{children}</body>
    </html>
  );
}
