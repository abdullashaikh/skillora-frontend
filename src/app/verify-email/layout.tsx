import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Email Verification — Skilled Resume',
  description: 'Verify your email address to unlock your complete ATS resume report.',
  robots: {
    index: false,
    follow: false,
  },
};

export default function VerifyEmailLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
