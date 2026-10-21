'use client';

import React, { useEffect, useState, Suspense } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { apiFetch, parseApiResponse } from '@/lib/api';
import { CheckCircle2, AlertCircle, Loader2, Sparkles, ArrowRight, Mail } from 'lucide-react';

function VerifyEmailContent() {
  const searchParams = useSearchParams();
  const token = searchParams.get('token') || '';

  const [status, setStatus] = useState<'VERIFYING' | 'SUCCESS' | 'ERROR'>('VERIFYING');
  const [message, setMessage] = useState('Verifying your email address...');

  useEffect(() => {
    if (!token) {
      setStatus('ERROR');
      setMessage('No verification token found. Please check your link or request a new verification email.');
      return;
    }

    apiFetch('/auth/verify-email', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ token }),
    })
      .then((res) => parseApiResponse<{ success: boolean; message: string }>(res))
      .then((data) => {
        setStatus('SUCCESS');
        setMessage(data.message || 'Your email address has been successfully verified! All full report features are now unlocked.');
      })
      .catch((err: unknown) => {
        setStatus('ERROR');
        setMessage(err instanceof Error ? err.message : 'Email verification failed.');
      });
  }, [token]);

  return (
    <div className="bg-white rounded-2xl border border-slate-200 p-8 sm:p-10 shadow-xs text-center space-y-6">
      {status === 'VERIFYING' && (
        <div className="space-y-4 py-6">
          <Loader2 className="w-10 h-10 text-indigo-600 animate-spin mx-auto" />
          <h2 className="text-lg font-bold text-slate-900">Verifying Your Email</h2>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            Please wait while we validate your secure verification link...
          </p>
        </div>
      )}

      {status === 'SUCCESS' && (
        <div className="space-y-5 py-4">
          <div className="inline-flex p-4 bg-emerald-100 text-emerald-700 rounded-full shadow-inner">
            <CheckCircle2 className="w-10 h-10" />
          </div>
          <div className="space-y-2">
            <h2 className="text-xl font-bold text-slate-900">Email Address Confirmed!</h2>
            <div className="inline-flex items-center space-x-1 px-3 py-1 bg-indigo-50 text-indigo-700 rounded-full text-xs font-semibold">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Full Resume Analysis Unlocked</span>
            </div>
            <p className="text-xs text-slate-600 max-w-md mx-auto leading-relaxed pt-2">
              {message}
            </p>
          </div>
          <div className="pt-4 flex flex-col sm:flex-row items-center justify-center gap-3">
            <Link
              href="/dashboard"
              className="w-full sm:w-auto px-6 py-2.5 bg-indigo-600 text-white rounded-xl text-xs font-semibold hover:bg-indigo-700 shadow-sm flex items-center justify-center space-x-2 transition"
            >
              <span>Go to My Dashboard</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
            <Link
              href="/"
              className="w-full sm:w-auto px-5 py-2.5 bg-slate-100 text-slate-700 rounded-xl text-xs font-semibold hover:bg-slate-200 transition"
            >
              <span>Analyze Another Resume</span>
            </Link>
          </div>
        </div>
      )}

      {status === 'ERROR' && (
        <div className="space-y-5 py-4">
          <div className="inline-flex p-4 bg-red-100 text-red-700 rounded-full shadow-inner">
            <AlertCircle className="w-10 h-10" />
          </div>
          <div className="space-y-2">
            <h2 className="text-xl font-bold text-slate-900">Verification Link Expired or Invalid</h2>
            <p className="text-xs text-red-600 max-w-md mx-auto leading-relaxed">
              {message}
            </p>
          </div>
          <div className="pt-4 flex flex-col sm:flex-row items-center justify-center gap-3">
            <Link
              href="/verification-pending"
              className="w-full sm:w-auto px-6 py-2.5 bg-indigo-600 text-white rounded-xl text-xs font-semibold hover:bg-indigo-700 shadow-sm flex items-center justify-center space-x-2 transition"
            >
              <Mail className="w-4 h-4" />
              <span>Resend Verification Link</span>
            </Link>
            <Link
              href="/login"
              className="w-full sm:w-auto px-5 py-2.5 bg-slate-100 text-slate-700 rounded-xl text-xs font-semibold hover:bg-slate-200 transition"
            >
              <span>Back to Sign In</span>
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}

export default function VerifyEmailPage() {
  return (
    <div className="max-w-md mx-auto py-12 space-y-6">
      <div className="text-center space-y-2">
        <div className="inline-flex p-3 bg-indigo-600 text-white rounded-2xl shadow-sm mb-2">
          <Sparkles className="w-6 h-6" />
        </div>
        <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Account Verification</h1>
        <p className="text-xs text-slate-500">
          Unlocking your complete ATS score report, skills gaps, and suggestions.
        </p>
      </div>

      <Suspense fallback={<div className="text-center py-12 text-sm text-slate-500">Verifying token...</div>}>
        <VerifyEmailContent />
      </Suspense>
    </div>
  );
}
