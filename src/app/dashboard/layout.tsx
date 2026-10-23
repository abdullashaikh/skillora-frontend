import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Candidate Dashboard — Skilled Resume',
  description: 'Manage your evaluated resumes, history, and account settings.',
  robots: {
    index: false,
    follow: false,
  },
};

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
