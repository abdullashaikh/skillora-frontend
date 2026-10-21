'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { apiFetch, parseApiResponse, clearStoredToken } from '@/lib/api';
import { Mail, AlertCircle, CheckCircle2, RefreshCw, ArrowLeft, LogOut, ShieldCheck } from 'lucide-react';

function maskEmail(email: string): string {
  if (!email || !email.includes('@')) return email || '';
  const [localPart, domain] = email.split('@');
  if (localPart.length <= 2) {
    return `${localPart[0]}*@${domain}`;
  }
  const first = localPart[0];
  const last = localPart[localPart.length - 1];
  const stars = '*'.repeat(Math.min(localPart.length - 2, 5));
  return `${first}${stars}${last}@${domain}`;
}

export default function VerificationPendingPage() {
  const router = useRouter();
  const [userEmail, setUserEmail] = useState<string>('');
  const [isVerified, setIsVerified] = useState(false);
  const [loading, setLoading] = useState(false);
  const [resendStatus, setResendStatus] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [cooldown, setCooldown] = useState<number>(0);

  useEffect(() => {
    // Check current auth status
    apiFetch('/auth/me')
      .then((res) => parseApiResponse<{ user?: { email: string; isEmailVerified: boolean } | null }>(res))
      .then((data) => {
        if (data.user) {
          setUserEmail(data.user.email);
          if (data.user.isEmailVerified) {
            setIsVerified(true);
          }
        }
      })
      .catch(() => {});
  }, []);

  // Cooldown timer
  useEffect(() => {
    if (cooldown <= 0) return;
    const timer = setInterval(() => {
      setCooldown((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(timer);
  }, [cooldown]);

  const handleResend = async () => {
    if (cooldown > 0) return;
    setLoading(true);
    setErrorMessage(null);
    setResendStatus(null);

    try {
      const res = await apiFetch('/auth/resend-verification', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: userEmail || undefined }),
      });

      const data = await parseApiResponse<{ success: boolean; message: string }>(res);
      setResendStatus(data.message || 'Verification link sent! Please check your inbox.');
      setCooldown(60); // 60s cooldown
    } catch (err: unknown) {
      setErrorMessage(err instanceof Error ? err.message : 'Failed to resend email');
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    try {
      await apiFetch('/auth/logout', { method: 'POST' });
    } catch {
      // ignore
    }
    clearStoredToken();
    router.push('/login');
    router.refresh();
  };

  if (isVerified) {
    return (
      <div className="max-w-md mx-auto py-12 space-y-6">
        <div className="bg-white rounded-2xl border border-slate-200 p-8 shadow-xs text-center space-y-4">
          <div className="inline-flex p-3 bg-emerald-100 text-emerald-700 rounded-full">
            <CheckCircle2 className="w-8 h-8" />
          </div>
          <h1 className="text-xl font-bold text-slate-900">Your Email is Already Verified!</h1>
          <p className="text-xs text-slate-600">
            You have full access to complete resume analyses, detailed skills breakdowns, and actionable suggestions.
          </p>
          <div className="pt-2">
            <Link
              href="/dashboard"
              className="inline-flex items-center space-x-1.5 px-5 py-2.5 bg-indigo-600 text-white rounded-xl text-xs font-semibold hover:bg-indigo-700 shadow-sm"
            >
              <span>Go to Dashboard</span>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-md mx-auto py-12 space-y-6">
      <div className="text-center space-y-2">
        <div className="inline-flex p-3 bg-amber-500 text-white rounded-2xl shadow-sm mb-2">
          <Mail className="w-6 h-6" />
        </div>
        <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Verify Your Email Address</h1>
        <p className="text-xs text-slate-500 max-w-sm mx-auto">
          We sent a verification link to confirm your account ownership.
        </p>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-8 shadow-xs space-y-5">
        <div className="text-center space-y-3">
          <p className="text-xs text-slate-600">
            Please check your inbox at:
          </p>
          <div className="inline-block px-4 py-2 bg-slate-100 border border-slate-200 rounded-xl font-mono text-xs font-semibold text-slate-800">
            {maskEmail(userEmail) || 'your registered email'}
          </div>
          <p className="text-xs text-slate-500 leading-relaxed pt-1">
            Click the link in the email to activate your account and <strong>unlock your full resume analysis report</strong>, extracted skills, and personalized recommendations.
          </p>
        </div>

        {resendStatus && (
          <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl flex items-center space-x-2 text-xs text-emerald-700">
            <CheckCircle2 className="w-4 h-4 flex-shrink-0 text-emerald-600" />
            <span>{resendStatus}</span>
          </div>
        )}

        {errorMessage && (
          <div className="p-3 bg-red-50 border border-red-200 rounded-xl flex items-center space-x-2 text-xs text-red-700">
            <AlertCircle className="w-4 h-4 flex-shrink-0 text-red-600" />
            <span>{errorMessage}</span>
          </div>
        )}

        <div className="pt-2 space-y-3">
          <button
            onClick={handleResend}
            disabled={loading || cooldown > 0}
            className={`w-full py-2.5 rounded-xl font-semibold text-xs flex items-center justify-center space-x-2 shadow-sm transition ${
              loading || cooldown > 0
                ? 'bg-slate-100 text-slate-400 border border-slate-200 cursor-not-allowed'
                : 'bg-indigo-600 hover:bg-indigo-700 text-white'
            }`}
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
            <span>
              {loading
                ? 'Sending Email...'
                : cooldown > 0
                ? `Resend available in ${cooldown}s`
                : 'Resend Verification Email'}
            </span>
          </button>

          <div className="flex items-center justify-between pt-2 border-t border-slate-100 text-xs">
            <button
              onClick={handleLogout}
              className="inline-flex items-center space-x-1 text-slate-500 hover:text-slate-800 font-medium"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>Log out</span>
            </button>
            <Link
              href="/"
              className="inline-flex items-center space-x-1 text-indigo-600 hover:text-indigo-800 font-semibold"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Return Home</span>
            </Link>
          </div>
        </div>
      </div>

      <div className="p-4 bg-indigo-50/70 border border-indigo-100 rounded-xl flex items-start space-x-3 text-xs text-indigo-900">
        <ShieldCheck className="w-4 h-4 text-indigo-600 mt-0.5 flex-shrink-0" />
        <p className="leading-relaxed">
          <strong>Why verify?</strong> Verification ensures that your resume reports and sensitive profile information remain completely private and accessible only to you.
        </p>
      </div>
    </div>
  );
}
