import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Resume ATS Evaluation Report — Skilled Resume',
  description: 'Private resume evaluation, ATS score breakdown, and canonical skill assessment.',
  robots: {
    index: false,
    follow: false,
  },
};

export default function AnalysisLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
