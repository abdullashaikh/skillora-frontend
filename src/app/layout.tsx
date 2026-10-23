import type { Metadata } from 'next';
import './globals.css';
import Navbar from '@/components/Navbar';

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://skilledresume.com';

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: 'Skilled Resume — Production AI Resume Analyzer & Interview Prep',
    template: '%s | Skilled Resume',
  },
  description:
    'Secure, fast, and explainable AI resume analysis with canonical skill normalization, ATS scoring, and comprehensive technical interview practice questions.',
  keywords: [
    'AI resume analyzer',
    'ATS resume checker',
    'interview preparation',
    'technical questions and answers',
    'skill extraction',
    'career optimization',
  ],
  authors: [{ name: 'Skilled Resume Team' }],
  openGraph: {
    title: 'Skilled Resume — AI Resume Analyzer & Technical Interview Prep',
    description:
      'Deterministic ATS scoring, canonical skill normalization, and curated technical interview questions.',
    url: siteUrl,
    siteName: 'Skilled Resume',
    locale: 'en_US',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Skilled Resume — AI Resume Analyzer & Interview Prep',
    description:
      'Evaluate your resume with ATS-style deterministic scoring and practice curated interview questions.',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="bg-slate-50 text-slate-900 antialiased min-h-screen flex flex-col">
        <Navbar />
        <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {children}
        </main>
        <footer className="border-t border-slate-200 bg-white py-6 text-center text-xs text-slate-500">
          <div className="max-w-7xl mx-auto px-4">
            <p>
              © {new Date().getFullYear()} Skilled Resume Analyzer. All scores are deterministic rule-based evaluations intended for resume optimization.
            </p>
            <p className="mt-1 text-slate-400">
              Personal contact details are scrubbed prior to AI provider evaluation. No candidate scores predict employer hiring decisions.
            </p>
          </div>
        </footer>
      </body>
    </html>
  );
}
