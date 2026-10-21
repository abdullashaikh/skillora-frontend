'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { apiFetch, parseApiResponse, clearStoredToken } from '@/lib/api';
import {
  FileText,
  Clock,
  Trash2,
  ExternalLink,
  Plus,
  User,
  ShieldAlert,
  AlertCircle,
} from 'lucide-react';

interface AnalysisItem {
  id: string;
  filename: string;
  qualityScore: number | null;
  jobMatchScore: number | null;
  targetRole: string | null;
  createdAt: string;
  expiresAt?: string | null;
  status: string;
}

interface UserProfile {
  id: string;
  email: string;
  name: string | null;
  role: string;
  isEmailVerified?: boolean;
}

export default function DashboardPage() {
  const router = useRouter();
  const [analyses, setAnalyses] = useState<AnalysisItem[]>([]);
  const [user, setUser] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [deleteAccountLoading, setDeleteAccountLoading] = useState(false);

  useEffect(() => {
    // Check auth
    apiFetch('/auth/me')
      .then((res) => parseApiResponse<{ user: UserProfile | null }>(res))
      .then((data) => {
        if (!data.user) {
          router.push('/login');
        } else {
          setUser(data.user);
        }
      })
      .catch(() => router.push('/login'));

    // Fetch analyses
    apiFetch('/resume-analyses')
      .then((res) => parseApiResponse<{ analyses: AnalysisItem[] }>(res))
      .then((data) => {
        setAnalyses(data.analyses || []);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [router]);

  const handleDeleteAnalysis = async (id: string) => {
    if (!confirm('Are you sure you want to delete this report?')) return;
    try {
      const res = await apiFetch(`/resume-analyses/${id}`, { method: 'DELETE' });
      await parseApiResponse(res);
      setAnalyses((prev) => prev.filter((a) => a.id !== id));
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : 'Error deleting report.');
    }
  };

  const handleDeleteAccount = async () => {
    if (
      !confirm(
        'WARNING: This will permanently delete your account and all associated resume analysis reports. This action cannot be undone. Proceed?'
      )
    ) {
      return;
    }
    setDeleteAccountLoading(true);
    try {
      const res = await apiFetch('/auth/account', { method: 'DELETE' });
      await parseApiResponse(res);
      clearStoredToken();
      router.push('/');
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : 'Error deleting account.');
    } finally {
      setDeleteAccountLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="py-20 flex flex-col items-center justify-center space-y-4">
        <div className="w-10 h-10 border-3 border-indigo-600 border-t-transparent rounded-full animate-spin" />
        <p className="text-sm text-slate-500 font-medium">Loading analyses...</p>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto space-y-8 pb-12">
      {/* Unverified Notice Banner */}
      {user && !user.isEmailVerified && (
        <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 sm:p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-start space-x-3">
            <div className="p-2 bg-amber-100 text-amber-700 rounded-xl mt-0.5 sm:mt-0">
              <AlertCircle className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-amber-900">Email Verification Required</h3>
              <p className="text-xs text-amber-700 mt-0.5">
                Your account is currently unverified. Full resume reports, AI skills breakdown, and recommendations remain locked until email verification is complete.
              </p>
            </div>
          </div>
          <Link
            href={`/verification-pending?email=${encodeURIComponent(user.email)}`}
            className="px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white font-semibold text-xs rounded-xl whitespace-nowrap shadow-xs transition"
          >
            Verify Now
          </Link>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-5">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">
            My Resume Analyses
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            Manage your saved reports, track score revisions, and access extracted data.
          </p>
        </div>
        <Link
          href="/"
          className="px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs sm:text-sm rounded-xl flex items-center space-x-2 shadow-sm transition self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Analyze New Resume</span>
        </Link>
      </div>

      {/* Reports Table / Cards */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        {analyses.length === 0 ? (
          <div className="py-16 text-center space-y-3">
            <div className="w-12 h-12 bg-slate-100 text-slate-400 rounded-full flex items-center justify-center mx-auto">
              <FileText className="w-6 h-6" />
            </div>
            <p className="text-sm font-semibold text-slate-700">No analyses found</p>
            <p className="text-xs text-slate-500 max-w-sm mx-auto">
              You haven&apos;t analyzed any resumes yet. Upload a PDF or DOCX file to see instant structured insights and quality scores.
            </p>
            <div className="pt-2">
              <Link
                href="/"
                className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs rounded-xl inline-flex items-center space-x-1.5 shadow-sm"
              >
                <span>Upload Resume</span>
              </Link>
            </div>
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            {analyses.map((item) => (
              <div
                key={item.id}
                className="p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-slate-50 transition"
              >
                <div className="flex items-start space-x-3.5">
                  <div className="p-2.5 bg-indigo-50 text-indigo-600 rounded-xl mt-0.5">
                    <FileText className="w-5 h-5" />
                  </div>
                  <div className="space-y-1">
                    <h3 className="font-semibold text-slate-900 text-sm">{item.filename}</h3>
                    <div className="flex flex-wrap items-center gap-2 text-xs text-slate-500">
                      <span>{new Date(item.createdAt).toLocaleDateString()}</span>
                      {item.targetRole && (
                        <>
                          <span>•</span>
                          <span className="text-indigo-600 font-medium">Role: {item.targetRole}</span>
                        </>
                      )}
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between sm:justify-end space-x-4">
                  <div className="flex items-center space-x-3">
                    <div className="text-right">
                      <span className="text-[10px] uppercase font-bold text-slate-400 block">
                        Quality
                      </span>
                      <span className="text-sm font-extrabold text-slate-900">
                        {item.qualityScore ?? 'N/A'}/100
                      </span>
                    </div>

                    {item.jobMatchScore !== null && (
                      <div className="text-right border-l border-slate-200 pl-3">
                        <span className="text-[10px] uppercase font-bold text-slate-400 block">
                          Match
                        </span>
                        <span className="text-sm font-extrabold text-emerald-600">
                          {item.jobMatchScore}/100
                        </span>
                      </div>
                    )}
                  </div>

                  <div className="flex items-center space-x-2 pl-2">
                    <Link
                      href={`/analysis/${item.id}`}
                      className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-lg text-xs font-semibold flex items-center space-x-1 transition"
                    >
                      <span>View</span>
                      <ExternalLink className="w-3.5 h-3.5 text-slate-500" />
                    </Link>

                    <button
                      onClick={() => handleDeleteAnalysis(item.id)}
                      title="Delete report"
                      className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Account Settings / Deletion Card */}
      {user && (
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div className="flex items-center space-x-2">
              <User className="w-5 h-5 text-slate-500" />
              <h2 className="font-bold text-slate-900 text-base">Account Information</h2>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div>
              <span className="text-slate-400 block font-medium">Email</span>
              <span className="text-slate-800 font-semibold">{user.email}</span>
            </div>
            <div>
              <span className="text-slate-400 block font-medium">Role</span>
              <span className="text-slate-800 font-semibold capitalize">{user.role.toLowerCase()}</span>
            </div>
          </div>

          <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
            <div className="text-xs text-slate-500">
              Permanently delete your profile, resume files, and analysis history.
            </div>
            <button
              onClick={handleDeleteAccount}
              disabled={deleteAccountLoading}
              className="px-3 py-1.5 bg-red-50 hover:bg-red-100 text-red-700 font-semibold text-xs rounded-lg transition"
            >
              {deleteAccountLoading ? 'Deleting Account...' : 'Delete Account'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
