'use client';

import React, { useState, useEffect, Suspense } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { apiFetch, parseApiResponse, setStoredToken } from '@/lib/api';
import { Sparkles, AlertCircle, ArrowRight, Lock, Mail, CheckCircle2 } from 'lucide-react';
import GoogleSignInButton from '@/components/GoogleSignInButton';

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectUrl = searchParams.get('redirect') || '';
  const queryError = searchParams.get('error') || '';
  const queryEmail = searchParams.get('email') || '';
  const queryLinked = searchParams.get('linked') || '';

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [infoNotice, setInfoNotice] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (queryEmail) {
      setEmail(queryEmail);
    }

    if (queryError === 'account_exists_link_required') {
      setInfoNotice(
        'An account with this email already exists. Please sign in with your password to link your Google account.'
      );
    } else if (queryError === 'google_cancelled') {
      setErrorMessage('Google sign-in was cancelled.');
    } else if (queryError === 'google_not_configured') {
      setErrorMessage('Google authentication is not yet configured on this server.');
    } else if (queryError === 'account_suspended') {
      setErrorMessage('This account has been suspended or deactivated. Please contact an administrator.');
    } else if (queryError === 'google_failed') {
      const detail = searchParams.get('detail');
      setErrorMessage(detail ? `Google authentication failed: ${detail}` : 'Google authentication failed. Please try again.');
    } else if (queryError === 'invalid_oauth_state' || queryError === 'expired_oauth_state') {
      setErrorMessage('Authentication session expired or was invalid. Please try again.');
    }

    if (queryLinked === 'google') {
      setInfoNotice('Your Google account was successfully linked!');
    }
  }, [queryError, queryEmail, queryLinked, searchParams]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setLoading(true);

    try {
      const res = await apiFetch('/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      const data = await parseApiResponse<{
        user: { role: string; isEmailVerified: boolean };
        token?: string;
      }>(res);

      if (data.token) {
        setStoredToken(data.token);
      }

      if (data.user?.role === 'ADMIN') {
        const adminUrl = process.env.NEXT_PUBLIC_ADMIN_URL || 'http://localhost:3001';
        window.location.href = adminUrl;
        return;
      }

      if (redirectUrl) {
        router.push(redirectUrl);
      } else if (!data.user.isEmailVerified) {
        router.push('/verification-pending');
      } else {
        router.push('/dashboard');
      }
      router.refresh();
    } catch (err: unknown) {
      setErrorMessage(err instanceof Error ? err.message : 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-8 shadow-xs space-y-5">
      {/* Notice & Error Banners */}
      {infoNotice && (
        <div className="p-3 bg-indigo-50 border border-indigo-200 rounded-xl flex items-start space-x-2 text-xs text-indigo-800">
          <CheckCircle2 className="w-4 h-4 flex-shrink-0 text-indigo-600 mt-0.5" />
          <span>{infoNotice}</span>
        </div>
      )}

      {errorMessage && (
        <div className="p-3 bg-red-50 border border-red-200 rounded-xl flex items-start space-x-2 text-xs text-red-700">
          <AlertCircle className="w-4 h-4 flex-shrink-0 text-red-600 mt-0.5" />
          <span>{errorMessage}</span>
        </div>
      )}

      {/* Google Sign-In */}
      <GoogleSignInButton mode="login" redirectUrl={redirectUrl} />

      {/* Divider */}
      <div className="relative my-4">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-slate-200" />
        </div>
        <div className="relative flex justify-center text-xs uppercase">
          <span className="bg-white px-3 text-slate-400 font-medium tracking-wider">
            Or continue with email
          </span>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">

        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1">Email Address</label>
          <div className="relative">
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="alex@example.com"
              className="w-full pl-9 pr-3 py-2 text-sm bg-white border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
            <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          </div>
        </div>

        <div>
          <div className="flex items-center justify-between mb-1">
            <label className="block text-xs font-semibold text-slate-700">Password</label>
            <Link
              href="/forgot-password"
              className="text-xs font-semibold text-indigo-600 hover:text-indigo-800"
            >
              Forgot password?
            </Link>
          </div>
          <div className="relative">
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full pl-9 pr-3 py-2 text-sm bg-white border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
            <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          </div>
        </div>

        <button
          type="submit"
          disabled={loading}
          className={`w-full py-2.5 rounded-xl font-semibold text-sm flex items-center justify-center space-x-1.5 shadow-sm transition ${
            loading
              ? 'bg-slate-200 text-slate-400 cursor-not-allowed'
              : 'bg-indigo-600 hover:bg-indigo-700 text-white'
          }`}
        >
          <span>{loading ? 'Signing In...' : 'Sign In'}</span>
          {!loading && <ArrowRight className="w-4 h-4" />}
        </button>
      </form>

      <div className="pt-4 border-t border-slate-100 text-center text-xs text-slate-500">
        Don&apos;t have an account?{' '}
        <Link
          href={redirectUrl ? `/register?redirect=${encodeURIComponent(redirectUrl)}` : '/register'}
          className="font-semibold text-indigo-600 hover:text-indigo-700"
        >
          Sign up for free
        </Link>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <div className="max-w-md mx-auto py-12 space-y-6">
      <div className="text-center space-y-2">
        <div className="inline-flex p-3 bg-indigo-600 text-white rounded-2xl shadow-sm mb-2">
          <Sparkles className="w-6 h-6" />
        </div>
        <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Sign In to Your Account</h1>
        <p className="text-xs text-slate-500">
          Access your saved resume analyses and unlock full report breakdowns.
        </p>
      </div>

      <Suspense fallback={<div className="text-center py-8 text-sm text-slate-500">Loading sign in...</div>}>
        <LoginForm />
      </Suspense>
    </div>
  );
}
