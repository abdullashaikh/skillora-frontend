'use client';

import React, { useState, useEffect } from 'react';
import { apiFetch, parseApiResponse, API_BASE_URL } from '@/lib/api';
import { AlertCircle } from 'lucide-react';

interface GoogleSignInButtonProps {
  mode: 'login' | 'register';
  redirectUrl?: string;
  className?: string;
}

export default function GoogleSignInButton({
  mode,
  redirectUrl,
  className = '',
}: GoogleSignInButtonProps) {
  const [loading, setLoading] = useState(false);
  const [isConfigured, setIsConfigured] = useState<boolean | null>(null);
  const [errorNotice, setErrorNotice] = useState<string | null>(null);

  useEffect(() => {
    // Check if Google OAuth is configured on backend
    apiFetch('/auth/google/status')
      .then((res) => parseApiResponse<{ configured: boolean }>(res))
      .then((data) => {
        setIsConfigured(data.configured);
      })
      .catch(() => {
        setIsConfigured(false);
      });
  }, []);

  const handleGoogleClick = () => {
    if (loading) return;

    if (isConfigured === false) {
      setErrorNotice(
        'Google OAuth is not configured on this server. Please sign in with email and password, or add GOOGLE_CLIENT_ID in the backend .env.'
      );
      return;
    }

    setLoading(true);
    setErrorNotice(null);

    // Build backend authorization initiation URL
    const baseUrl = (API_BASE_URL || 'http://localhost:5000/api').replace(/\/$/, '');
    const targetUrl = new URL(`${baseUrl}/auth/google`);
    if (redirectUrl) {
      targetUrl.searchParams.set('redirect', redirectUrl);
    }

    // Redirect browser to initiate Google OAuth flow
    window.location.href = targetUrl.toString();
  };

  const buttonText = mode === 'register' ? 'Sign up with Google' : 'Continue with Google';

  return (
    <div className={`space-y-2 ${className}`}>
      {errorNotice && (
        <div className="p-2.5 bg-amber-50 border border-amber-200 rounded-xl flex items-start space-x-2 text-xs text-amber-800 animate-fade-in">
          <AlertCircle className="w-4 h-4 text-amber-600 flex-shrink-0 mt-0.5" />
          <span>{errorNotice}</span>
        </div>
      )}

      <button
        type="button"
        onClick={handleGoogleClick}
        disabled={loading}
        title={isConfigured === false ? 'Google OAuth is unconfigured' : buttonText}
        className={`w-full py-2.5 px-4 bg-white border border-slate-300 hover:bg-slate-50 text-slate-700 font-semibold text-sm rounded-xl flex items-center justify-center space-x-3 shadow-xs transition hover:border-slate-400 active:bg-slate-100 ${
          loading ? 'opacity-70 cursor-wait' : ''
        }`}
      >
        {loading ? (
          <div className="w-4 h-4 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin" />
        ) : (
          <GoogleIcon className="w-4 h-4 flex-shrink-0" />
        )}
        <span>{loading ? 'Redirecting to Google...' : buttonText}</span>
      </button>
    </div>
  );
}

/**
 * Official Google multi-color SVG Icon
 */
function GoogleIcon({ className = 'w-4 h-4' }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
        fill="#4285F4"
      />
      <path
        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
        fill="#34A853"
      />
      <path
        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
        fill="#FBBC05"
      />
      <path
        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
        fill="#EA4335"
      />
    </svg>
  );
}
