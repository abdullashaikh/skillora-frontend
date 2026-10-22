'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter, usePathname } from 'next/navigation';
import { apiFetch, parseApiResponse, clearStoredToken } from '@/lib/api';
import { FileText, Shield, User, LogOut, LayoutDashboard, Sparkles, AlertCircle, BookOpen } from 'lucide-react';

interface AuthUser {
  id: string;
  email: string;
  name: string | null;
  role: 'USER' | 'ADMIN';
  isEmailVerified?: boolean;
}

export default function Navbar() {
  const router = useRouter();
  const pathname = usePathname();
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    apiFetch('/auth/me')
      .then((res) => parseApiResponse<{ user: AuthUser | null }>(res))
      .then((data) => {
        if (data.user) {
          setUser(data.user);
        } else {
          setUser(null);
        }
      })
      .catch(() => setUser(null))
      .finally(() => setLoading(false));
  }, [pathname]);

  const handleLogout = async () => {
    try {
      await apiFetch('/auth/logout', { method: 'POST' });
    } catch {
      // ignore
    }
    clearStoredToken();
    setUser(null);
    router.push('/');
    router.refresh();
  };

  return (
    <header className="sticky top-0 z-50 bg-white/90 backdrop-blur-md border-b border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Logo */}
        <Link href="/" className="flex items-center space-x-2.5">
          <div className="bg-indigo-600 text-white p-2 rounded-xl shadow-sm">
            <Sparkles className="w-5 h-5" />
          </div>
          <div>
            <span className="font-bold text-lg tracking-tight text-slate-900">
              Skilled<span className="text-indigo-600">Resume</span>
            </span>
            <span className="hidden sm:inline-block ml-2 text-xs font-semibold px-2 py-0.5 bg-indigo-50 text-indigo-700 rounded-full border border-indigo-100">
              Phase 1 AI
            </span>
          </div>
        </Link>

        {/* Navigation links */}
        <nav className="flex items-center space-x-1 sm:space-x-3">
          <Link
            href="/"
            className={`px-3 py-1.5 rounded-lg text-sm font-medium transition ${
              pathname === '/'
                ? 'bg-slate-100 text-slate-900 font-semibold'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
            }`}
          >
            <span className="flex items-center space-x-1.5">
              <FileText className="w-4 h-4 text-slate-500" />
              <span>Analyze</span>
            </span>
          </Link>

          <Link
            href="/questions"
            className={`px-3 py-1.5 rounded-lg text-sm font-medium transition ${
              pathname?.startsWith('/questions')
                ? 'bg-slate-100 text-slate-900 font-semibold'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
            }`}
          >
            <span className="flex items-center space-x-1.5">
              <BookOpen className="w-4 h-4 text-slate-500" />
              <span>Interview Q&A</span>
            </span>
          </Link>

          {user && (
            <Link
              href="/dashboard"
              className={`px-3 py-1.5 rounded-lg text-sm font-medium transition ${
                pathname === '/dashboard'
                  ? 'bg-slate-100 text-slate-900 font-semibold'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
              }`}
            >
              <span className="flex items-center space-x-1.5">
                <LayoutDashboard className="w-4 h-4 text-slate-500" />
                <span>My Reports</span>
              </span>
            </Link>
          )}

          {user?.role === 'ADMIN' && (
            <a
              href={process.env.NEXT_PUBLIC_ADMIN_URL || 'http://localhost:3001'}
              target="_blank"
              rel="noopener noreferrer"
              className="px-3 py-1.5 rounded-lg text-sm font-medium transition text-indigo-700 bg-indigo-50 hover:bg-indigo-100 border border-indigo-200"
            >
              <span className="flex items-center space-x-1.5">
                <Shield className="w-4 h-4 text-indigo-600" />
                <span>Admin Panel ↗</span>
              </span>
            </a>
          )}

          {/* User Status / Login */}
          <div className="pl-2 flex items-center space-x-2 border-l border-slate-200">
            {loading ? (
              <div className="w-6 h-6 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin" />
            ) : user ? (
              <div className="flex items-center space-x-2">
                {!user.isEmailVerified && (
                  <Link
                    href={`/verification-pending?email=${encodeURIComponent(user.email)}`}
                    className="flex items-center space-x-1 px-2.5 py-1 text-xs font-semibold bg-amber-50 text-amber-800 border border-amber-300 rounded-full hover:bg-amber-100 transition shadow-sm"
                    title="Your email is not verified. Click to resend verification link and unlock full reports."
                  >
                    <AlertCircle className="w-3.5 h-3.5 text-amber-600" />
                    <span className="hidden sm:inline">Verify Email</span>
                    <span className="sm:hidden">Verify</span>
                  </Link>
                )}
                <div className="hidden md:flex flex-col text-right">
                  <span className="text-xs font-semibold text-slate-800">{user.name || user.email}</span>
                  <span className="text-[10px] text-slate-500 capitalize">
                    {user.role.toLowerCase()}{!user.isEmailVerified ? ' (Unverified)' : ''}
                  </span>
                </div>
                <button
                  onClick={handleLogout}
                  title="Sign Out"
                  className="p-1.5 text-slate-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <div className="flex items-center space-x-2">
                <Link
                  href="/login"
                  className="px-3 py-1.5 text-sm font-medium text-slate-700 hover:text-slate-900 hover:bg-slate-50 rounded-lg transition"
                >
                  Sign In
                </Link>
                <Link
                  href="/register"
                  className="px-3 py-1.5 text-sm font-medium bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 shadow-sm transition"
                >
                  Sign Up
                </Link>
              </div>
            )}
          </div>
        </nav>
      </div>
    </header>
  );
}
