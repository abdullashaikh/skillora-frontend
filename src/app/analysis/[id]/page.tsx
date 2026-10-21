'use client';

import React, { useEffect, useState, use } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { apiFetch, parseApiResponse } from '@/lib/api';
import {
  Award,
  CheckCircle2,
  AlertTriangle,
  Briefcase,
  GraduationCap,
  FolderGit2,
  Cpu,
  Trash2,
  Edit3,
  ArrowLeft,
  Info,
  Clock,
  Sparkles,
  ExternalLink,
  Save,
  Plus,
  X,
  Lock,
  ArrowRight,
  ShieldAlert,
  FileText,
  BarChart3,
  Lightbulb,
  Download,
} from 'lucide-react';

interface DimensionScore {
  name: string;
  score: number;
  weight: number;
  weightedScore: number;
  explanation: string;
  recommendations: string[];
}

interface AnalysisSkill {
  id: string;
  rawName: string;
  canonicalName: string;
  category: string;
  evidence: string | null;
  sourceSection: string;
  confidence: number;
  isExplicit: boolean;
}

interface AnalysisData {
  id: string;
  filename: string;
  qualityScore: number;
  jobMatchScore: number | null;
  targetRole: string | null;
  targetJobDescription: string | null;
  scoreBreakdown: {
    qualityDimensions: DimensionScore[] | null;
    jobMatchDimensions?: DimensionScore[] | null;
    matchedSkills: string[] | null;
    missingSkills: string[] | null;
    suggestions: string[] | null;
    disclaimer: string;
  } | null;
  extractedProfile: {
    summary: string | null;
    skills: Array<{ name: string; evidence: string | null; sourceSection: string }>;
    experience: Array<{
      jobTitle: string | null;
      company: string | null;
      startDate: string | null;
      endDate: string | null;
      isCurrent: boolean;
      responsibilities: string[];
      achievements: string[];
    }>;
    projects: Array<{
      name: string | null;
      description: string | null;
      technologies: string[];
      outcomes: string[];
    }>;
    education: Array<{
      degree: string | null;
      institution: string | null;
      fieldOfStudy: string | null;
      graduationYear: string | null;
    }>;
    certifications: Array<{
      name: string;
      issuer: string | null;
      year: string | null;
    }>;
    sectionsPresent: string[];
  } | null;
  skills: AnalysisSkill[];
  warnings: string[];
  isGuest: boolean;
  isLocked?: boolean;
  lockReason?: 'GUEST' | 'UNVERIFIED' | null;
  expiresAt: string | null;
  createdAt: string;
  providerUsed: string | null;
  modelUsed: string | null;
}

export default function AnalysisReportPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const router = useRouter();

  const [data, setData] = useState<AnalysisData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Edit Mode state (for registered users)
  const [isEditing, setIsEditing] = useState(false);
  const [editedSummary, setEditedSummary] = useState('');
  const [editedSkills, setEditedSkills] = useState<string[]>([]);
  const [newSkillInput, setNewSkillInput] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    apiFetch(`/resume-analyses/${id}`)
      .then((res) => parseApiResponse<AnalysisData>(res))
      .then((report) => {
        setData(report);
        setEditedSummary(report.extractedProfile?.summary || '');
        setEditedSkills(report.skills?.map((s: AnalysisSkill) => s.canonicalName) || []);
      })
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, [id]);

  const handleDelete = async () => {
    if (!confirm('Are you sure you want to delete this analysis report and associated data?')) {
      return;
    }
    try {
      const res = await apiFetch(`/resume-analyses/${id}`, { method: 'DELETE' });
      await parseApiResponse(res);
      router.push(data?.isGuest ? '/' : '/dashboard');
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : 'Error deleting report.');
    }
  };

  const handleSaveCorrections = async () => {
    setIsSaving(true);
    try {
      const res = await apiFetch(`/resume-analyses/${id}/profile`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          summary: editedSummary,
          skills: editedSkills.map((name) => ({ name, sourceSection: 'skills' })),
        }),
      });
      const result = await parseApiResponse<{
        qualityScore: number;
        jobMatchScore: number | null;
        skills: AnalysisSkill[];
        scoreBreakdown: any;
      }>(res);

      setData((prev) =>
        prev
          ? {
              ...prev,
              qualityScore: result.qualityScore,
              jobMatchScore: result.jobMatchScore,
              skills: result.skills,
              scoreBreakdown: result.scoreBreakdown,
              extractedProfile: prev.extractedProfile
                ? {
                    ...prev.extractedProfile,
                    summary: editedSummary,
                  }
                : null,
            }
          : null
      );
      setIsEditing(false);
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : 'Update failed');
    } finally {
      setIsSaving(false);
    }
  };

  const handleAddSkill = () => {
    if (newSkillInput.trim() && !editedSkills.includes(newSkillInput.trim())) {
      setEditedSkills([...editedSkills, newSkillInput.trim()]);
      setNewSkillInput('');
    }
  };

  const handleRemoveSkill = (skillToRemove: string) => {
    setEditedSkills(editedSkills.filter((s) => s !== skillToRemove));
  };

  if (loading) {
    return (
      <div className="py-20 flex flex-col items-center justify-center space-y-4">
        <div className="w-10 h-10 border-3 border-indigo-600 border-t-transparent rounded-full animate-spin" />
        <p className="text-sm text-slate-500 font-medium">Loading analysis report...</p>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="max-w-2xl mx-auto py-12 text-center space-y-4">
        <div className="p-4 bg-red-50 border border-red-200 rounded-2xl text-red-700 text-sm">
          <p className="font-semibold text-base">Unable to load report</p>
          <p className="mt-1">{error || 'Report not found or has expired.'}</p>
        </div>
        <Link
          href="/"
          className="inline-flex items-center space-x-2 text-sm font-semibold text-indigo-600 hover:text-indigo-700"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Resume Upload</span>
        </Link>
      </div>
    );
  }

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-emerald-600 border-emerald-500 bg-emerald-50/50';
    if (score >= 60) return 'text-amber-600 border-amber-500 bg-amber-50/50';
    return 'text-rose-600 border-rose-500 bg-rose-50/50';
  };

  const isReportLocked = Boolean(data.isLocked);

  // Group skills by category if unlocked
  const skillsByCategory: Record<string, AnalysisSkill[]> = {};
  if (!isReportLocked && data.skills) {
    for (const s of data.skills) {
      const cat = s.category || 'Other / General';
      if (!skillsByCategory[cat]) skillsByCategory[cat] = [];
      skillsByCategory[cat].push(s);
    }
  }

  return (
    <div className="max-w-5xl mx-auto space-y-8 pb-12">
      {/* Expiry Banner for Guests */}
      {data.isGuest && (
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs sm:text-sm text-amber-900">
          <div className="flex items-center space-x-2">
            <Clock className="w-4 h-4 text-amber-600 flex-shrink-0" />
            <span>
              This is a temporary guest report. It will automatically expire in{' '}
              {data.expiresAt ? new Date(data.expiresAt).toLocaleTimeString() : '24 hours'}.
            </span>
          </div>
          <Link
            href={`/register?redirect=/analysis/${id}`}
            className="px-3 py-1.5 bg-amber-600 hover:bg-amber-700 text-white font-semibold rounded-lg shadow-xs flex-shrink-0 text-xs"
          >
            Create Account to Save
          </Link>
        </div>
      )}

      {/* Header with Title and Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-5">
        <div>
          <div className="flex items-center space-x-2 text-xs text-slate-500 mb-1">
            <Link href="/" className="hover:underline flex items-center space-x-1">
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Analyses</span>
            </Link>
            <span>•</span>
            <span>{new Date(data.createdAt).toLocaleDateString()}</span>
            <span>•</span>
            <span className="capitalize">{data.providerUsed?.toLowerCase() || 'AI'} Analysis</span>
            {isReportLocked && (
              <>
                <span>•</span>
                <span className="inline-flex items-center space-x-1 px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 font-semibold text-[11px]">
                  <Lock className="w-3 h-3" />
                  <span>Score Only</span>
                </span>
              </>
            )}
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">
            Resume Analysis Report
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            Document: <span className="font-semibold text-slate-700">{data.filename}</span>
            {data.targetRole && (
              <>
                {' '}• Target Role: <span className="font-semibold text-indigo-600">{data.targetRole}</span>
              </>
            )}
          </p>
        </div>

        <div className="flex items-center space-x-2">
          {!isReportLocked && !data.isGuest && (
            <button
              onClick={() => setIsEditing(!isEditing)}
              className="px-3 py-2 bg-white border border-slate-300 text-slate-700 hover:bg-slate-50 rounded-xl text-xs font-semibold flex items-center space-x-1.5 transition shadow-xs"
            >
              <Edit3 className="w-3.5 h-3.5" />
              <span>{isEditing ? 'Cancel Edit' : 'Correct Skills'}</span>
            </button>
          )}

          <button
            onClick={handleDelete}
            title="Delete this analysis report"
            className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-xl border border-slate-200 transition"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Warnings Banner if any */}
      {data.warnings && data.warnings.length > 0 && (
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 text-xs text-amber-800 space-y-1">
          <div className="flex items-center space-x-1.5 font-semibold text-amber-900">
            <AlertTriangle className="w-4 h-4 text-amber-600" />
            <span>Document Parsing Alerts</span>
          </div>
          <ul className="list-disc pl-5 space-y-0.5">
            {data.warnings.map((w, idx) => (
              <li key={idx}>{w}</li>
            ))}
          </ul>
        </div>
      )}

      {/* Primary Score Overview Card */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Resume Quality / ATS Score */}
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs flex flex-col justify-between space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                Transparent ATS Assessment
              </span>
              <h2 className="text-xl font-bold text-slate-900">ATS Quality Score</h2>
            </div>
            <div
              className={`w-18 h-18 rounded-2xl border-2 flex items-center justify-center font-extrabold text-3xl shadow-xs ${getScoreColor(
                data.qualityScore
              )}`}
            >
              {data.qualityScore}
            </div>
          </div>
          <p className="text-xs text-slate-600 leading-relaxed">
            Evaluates document structural completeness, readability, measurable achievement evidence, and keyword categorization clarity.
          </p>
          <div className="space-y-1.5">
            <div className="flex justify-between text-xs font-semibold text-slate-700">
              <span>Overall Match</span>
              <span>{data.qualityScore} / 100</span>
            </div>
            <div className="w-full bg-slate-100 rounded-full h-2.5">
              <div
                className="bg-indigo-600 h-2.5 rounded-full transition-all duration-500"
                style={{ width: `${data.qualityScore}%` }}
              />
            </div>
          </div>
        </div>

        {/* Score Context & Transparency Disclaimer */}
        <div className="bg-slate-50 rounded-2xl border border-slate-200 p-6 shadow-xs flex flex-col justify-between space-y-3">
          <div className="flex items-center space-x-2 text-slate-800 font-bold text-sm">
            <Info className="w-4 h-4 text-indigo-600 flex-shrink-0" />
            <span>Score Transparency & Methodology</span>
          </div>
          <p className="text-xs text-slate-600 leading-relaxed">
            {data.scoreBreakdown?.disclaimer ||
              'These scores and evaluations are deterministic estimates generated by our assessment engine to guide resume enhancement. They do not predict or guarantee employment outcomes or official employer ATS results.'}
          </p>
          <div className="pt-2 border-t border-slate-200/60 flex items-center justify-between text-xs text-slate-500">
            <span>Status: <strong className="text-slate-800">{isReportLocked ? 'Preliminary Score Available' : 'Comprehensive Analysis Unlocked'}</strong></span>
            <span>Scale: 0 – 100</span>
          </div>
        </div>
      </div>

      {/* ===================================================================== */}
      {/* LOCKED REPORT SECTION (GUESTS & UNVERIFIED USERS)                      */}
      {/* ===================================================================== */}
      {isReportLocked ? (
        <div className="space-y-6 pt-2">
          {/* Prominent Unlock Callout Section */}
          <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-indigo-900 via-indigo-800 to-slate-900 p-8 sm:p-10 text-white shadow-xl">
            <div className="relative z-10 max-w-2xl space-y-4">
              <div className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full bg-indigo-500/30 border border-indigo-400/40 text-indigo-200 text-xs font-semibold">
                <Sparkles className="w-3.5 h-3.5" />
                <span>Full Detailed Breakdown Available</span>
              </div>
              <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
                Your full resume report is ready to unlock.
              </h2>
              <p className="text-sm text-indigo-100 leading-relaxed">
                Create a free account or log in to view your extracted skills, detailed score breakdown, resume improvement recommendations, experience analysis, and complete report.
              </p>

              <div className="pt-4 flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
                <Link
                  href={`/register?redirect=${encodeURIComponent(`/analysis/${id}`)}`}
                  className="px-6 py-3 bg-white text-indigo-900 hover:bg-indigo-50 font-bold rounded-xl text-sm shadow-md flex items-center justify-center space-x-2 transition"
                >
                  <span>Create Free Account</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>
                <Link
                  href={`/login?redirect=${encodeURIComponent(`/analysis/${id}`)}`}
                  className="px-6 py-3 bg-indigo-700/60 hover:bg-indigo-700 text-white border border-indigo-500/40 font-semibold rounded-xl text-sm flex items-center justify-center space-x-2 transition"
                >
                  <span>Log In to Unlock</span>
                </Link>
                {data.lockReason === 'UNVERIFIED' && (
                  <Link
                    href="/verification-pending"
                    className="px-5 py-3 bg-amber-500 hover:bg-amber-600 text-white font-semibold rounded-xl text-xs flex items-center justify-center space-x-1.5 transition"
                  >
                    <span>Check Verification Status</span>
                  </Link>
                )}
              </div>
            </div>

            {/* Subtle background decoration */}
            <div className="absolute -right-12 -bottom-12 w-80 h-80 bg-indigo-600/20 rounded-full blur-3xl pointer-events-none" />
          </div>

          {/* Locked Preview Cards */}
          <div className="space-y-5">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold uppercase tracking-wider text-slate-500 flex items-center space-x-2">
                <Lock className="w-4 h-4 text-slate-400" />
                <span>Locked Features Preview</span>
              </h3>
              <span className="text-xs text-slate-400">Unlock with free account</span>
            </div>

            {/* Locked Card 1: Skills Breakdown */}
            <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs relative overflow-hidden">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center space-x-2">
                  <Cpu className="w-5 h-5 text-indigo-600" />
                  <h4 className="font-bold text-slate-900 text-sm">Extracted Skills Breakdown</h4>
                </div>
                <span className="px-2.5 py-1 bg-indigo-50 text-indigo-700 rounded-full text-xs font-semibold flex items-center space-x-1">
                  <Lock className="w-3 h-3" />
                  <span>Locked</span>
                </span>
              </div>
              <p className="text-xs text-slate-500 mb-4">
                Detailed categorized listing of all programming languages, libraries, databases, and DevOps tools detected in your resume with confidence scoring.
              </p>
              {/* Blurred preview chips */}
              <div className="flex flex-wrap gap-2 select-none filter blur-[5px] opacity-60 pointer-events-none">
                <span className="px-3 py-1 bg-slate-100 rounded-lg text-xs font-medium">React.js (95%)</span>
                <span className="px-3 py-1 bg-slate-100 rounded-lg text-xs font-medium">TypeScript (95%)</span>
                <span className="px-3 py-1 bg-slate-100 rounded-lg text-xs font-medium">Node.js (90%)</span>
                <span className="px-3 py-1 bg-slate-100 rounded-lg text-xs font-medium">PostgreSQL (90%)</span>
                <span className="px-3 py-1 bg-slate-100 rounded-lg text-xs font-medium">AWS Cloud Architecture</span>
                <span className="px-3 py-1 bg-slate-100 rounded-lg text-xs font-medium">Docker & Kubernetes</span>
                <span className="px-3 py-1 bg-slate-100 rounded-lg text-xs font-medium">CI/CD Pipelines</span>
                <span className="px-3 py-1 bg-slate-100 rounded-lg text-xs font-medium">+20 more skills</span>
              </div>
            </div>

            {/* Locked Card 2: Detailed Scoring Dimensions */}
            <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs relative overflow-hidden">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center space-x-2">
                  <BarChart3 className="w-5 h-5 text-indigo-600" />
                  <h4 className="font-bold text-slate-900 text-sm">Detailed Scoring Dimensions & Weights</h4>
                </div>
                <span className="px-2.5 py-1 bg-indigo-50 text-indigo-700 rounded-full text-xs font-semibold flex items-center space-x-1">
                  <Lock className="w-3 h-3" />
                  <span>Locked</span>
                </span>
              </div>
              <p className="text-xs text-slate-500 mb-4">
                Independent evaluation scores and granular explanations across Section Completeness (25%), Readability & Parsability (20%), Experience Depth (25%), and Quantified Achievements (20%).
              </p>
              {/* Blurred progress bars */}
              <div className="space-y-3 filter blur-[5px] opacity-60 pointer-events-none select-none">
                <div>
                  <div className="flex justify-between text-xs font-medium text-slate-600 mb-1">
                    <span>Section Completeness (25%)</span>
                    <span>95 / 100</span>
                  </div>
                  <div className="w-full bg-slate-100 h-2 rounded-full"><div className="bg-indigo-600 h-2 rounded-full w-[95%]" /></div>
                </div>
                <div>
                  <div className="flex justify-between text-xs font-medium text-slate-600 mb-1">
                    <span>Quantifiable Evidence & Impact (20%)</span>
                    <span>85 / 100</span>
                  </div>
                  <div className="w-full bg-slate-100 h-2 rounded-full"><div className="bg-indigo-600 h-2 rounded-full w-[85%]" /></div>
                </div>
              </div>
            </div>

            {/* Locked Card 3: Actionable Improvement Suggestions */}
            <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs relative overflow-hidden">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center space-x-2">
                  <Lightbulb className="w-5 h-5 text-indigo-600" />
                  <h4 className="font-bold text-slate-900 text-sm">Actionable Improvement Recommendations</h4>
                </div>
                <span className="px-2.5 py-1 bg-indigo-50 text-indigo-700 rounded-full text-xs font-semibold flex items-center space-x-1">
                  <Lock className="w-3 h-3" />
                  <span>Locked</span>
                </span>
              </div>
              <p className="text-xs text-slate-500 mb-4">
                Personalized suggestions generated by AI and scoring engine rules to elevate your resume impact and fix ATS keyword gaps.
              </p>
              <div className="space-y-2 filter blur-[5px] opacity-60 pointer-events-none select-none">
                <div className="p-3 bg-slate-50 rounded-xl text-xs text-slate-700 flex items-center space-x-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  <span>Add quantified metrics (e.g. % throughput increase or cost savings) to experience bullets.</span>
                </div>
                <div className="p-3 bg-slate-50 rounded-xl text-xs text-slate-700 flex items-center space-x-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  <span>Strengthen bullet points with strong action verbs like architected, scaled, and automated.</span>
                </div>
              </div>
            </div>

            {/* Locked Card 4: Full Report PDF Export */}
            <div className="bg-slate-100/70 border border-slate-200 rounded-2xl p-6 flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="flex items-center space-x-3 text-center sm:text-left">
                <div className="p-3 bg-white text-slate-700 rounded-xl shadow-xs">
                  <Download className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="font-bold text-slate-900 text-sm">Downloadable Comprehensive Report</h4>
                  <p className="text-xs text-slate-500">
                    Export your full ATS audit report, skills matrix, and suggested revisions.
                  </p>
                </div>
              </div>
              <Link
                href={`/register?redirect=${encodeURIComponent(`/analysis/${id}`)}`}
                className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-semibold flex items-center space-x-1.5 shadow-sm transition"
              >
                <Lock className="w-3.5 h-3.5" />
                <span>Unlock Full Report</span>
              </Link>
            </div>
          </div>
        </div>
      ) : (
        /* ===================================================================== */
        /* UNLOCKED FULL REPORT SECTION (AUTHENTICATED & VERIFIED USERS)         */
        /* ===================================================================== */
        <div className="space-y-8">
          {/* Detailed Score Dimensions Grid */}
          {data.scoreBreakdown?.qualityDimensions && data.scoreBreakdown.qualityDimensions.length > 0 && (
            <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-4">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <div className="flex items-center space-x-2">
                  <Award className="w-5 h-5 text-indigo-600" />
                  <h3 className="font-bold text-slate-900 text-base">Quality Dimensions Breakdown</h3>
                </div>
                <span className="text-xs font-semibold text-slate-500">5 Weighted Factors</span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
                {data.scoreBreakdown.qualityDimensions.map((dim, idx) => (
                  <div key={idx} className="p-4 bg-slate-50/70 rounded-xl border border-slate-200/80 space-y-2">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-bold text-slate-800">{dim.name}</span>
                      <span className="font-extrabold text-indigo-700">{dim.score} / 100</span>
                    </div>
                    <div className="w-full bg-slate-200 rounded-full h-2">
                      <div
                        className="bg-indigo-600 h-2 rounded-full transition-all duration-300"
                        style={{ width: `${dim.score}%` }}
                      />
                    </div>
                    <p className="text-[11px] text-slate-600 leading-relaxed pt-1">{dim.explanation}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Actionable Improvement Suggestions */}
          {data.scoreBreakdown?.suggestions && data.scoreBreakdown.suggestions.length > 0 && (
            <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-3">
              <div className="flex items-center space-x-2 border-b border-slate-100 pb-3">
                <Lightbulb className="w-5 h-5 text-amber-500" />
                <h3 className="font-bold text-slate-900 text-base">Recommended Improvements</h3>
              </div>
              <ul className="space-y-2 pt-1">
                {data.scoreBreakdown.suggestions.map((sug, idx) => (
                  <li key={idx} className="flex items-start space-x-2.5 text-xs text-slate-700 leading-relaxed">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 mt-0.5 flex-shrink-0" />
                    <span>{sug}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Extracted Technical Skills */}
          <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center space-x-2">
                <Cpu className="w-5 h-5 text-indigo-600" />
                <h3 className="font-bold text-slate-900 text-base">Extracted Technical Skills</h3>
              </div>
              <span className="text-xs font-semibold text-slate-500">{data.skills.length} skills identified</span>
            </div>

            {isEditing ? (
              <div className="space-y-4 pt-2">
                <p className="text-xs text-slate-500">
                  Add or remove skills extracted from your resume to re-calculate your scores accurately:
                </p>
                <div className="flex items-center space-x-2">
                  <input
                    type="text"
                    value={newSkillInput}
                    onChange={(e) => setNewSkillInput(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddSkill())}
                    placeholder="Enter skill name (e.g. Next.js, Kubernetes)"
                    className="flex-1 px-3 py-1.5 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                  <button
                    onClick={handleAddSkill}
                    type="button"
                    className="px-3 py-1.5 bg-indigo-600 text-white rounded-lg text-xs font-semibold flex items-center space-x-1 hover:bg-indigo-700"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Add</span>
                  </button>
                </div>

                <div className="flex flex-wrap gap-2 pt-2">
                  {editedSkills.map((skillName, idx) => (
                    <span
                      key={idx}
                      className="inline-flex items-center space-x-1.5 px-2.5 py-1 bg-indigo-50 text-indigo-700 border border-indigo-200 rounded-lg text-xs font-medium"
                    >
                      <span>{skillName}</span>
                      <button
                        type="button"
                        onClick={() => handleRemoveSkill(skillName)}
                        className="text-indigo-400 hover:text-red-600"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </span>
                  ))}
                </div>

                <div className="pt-3 border-t border-slate-100 flex justify-end space-x-2">
                  <button
                    onClick={() => setIsEditing(false)}
                    className="px-3 py-1.5 border border-slate-300 rounded-lg text-xs font-semibold text-slate-600 hover:bg-slate-50"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleSaveCorrections}
                    disabled={isSaving}
                    className="px-4 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-semibold flex items-center space-x-1 shadow-xs"
                  >
                    <Save className="w-3.5 h-3.5" />
                    <span>{isSaving ? 'Recalculating...' : 'Save & Re-score'}</span>
                  </button>
                </div>
              </div>
            ) : (
              <div className="space-y-4 pt-2">
                {Object.keys(skillsByCategory).map((catName) => (
                  <div key={catName} className="space-y-2">
                    <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider">{catName}</h4>
                    <div className="flex flex-wrap gap-2">
                      {skillsByCategory[catName].map((skill, idx) => (
                        <div
                          key={idx}
                          title={skill.evidence ? `Evidence: "${skill.evidence}"` : undefined}
                          className="px-2.5 py-1 bg-slate-50 hover:bg-indigo-50 border border-slate-200 hover:border-indigo-200 rounded-lg text-xs font-medium text-slate-700 hover:text-indigo-700 transition cursor-help flex items-center space-x-1.5"
                        >
                          <span>{skill.canonicalName}</span>
                          {skill.evidence && <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />}
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Structured Work Experience Chronology */}
          {data.extractedProfile?.experience && data.extractedProfile.experience.length > 0 && (
            <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-4">
              <div className="flex items-center space-x-2 border-b border-slate-100 pb-3">
                <Briefcase className="w-5 h-5 text-indigo-600" />
                <h3 className="font-bold text-slate-900 text-base">Work History Chronology</h3>
              </div>
              <div className="space-y-4 pt-1">
                {data.extractedProfile.experience.map((exp, idx) => (
                  <div key={idx} className="p-4 bg-slate-50/70 border border-slate-200/80 rounded-xl space-y-2">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 text-xs">
                      <span className="font-bold text-slate-900 text-sm">{exp.jobTitle || 'Role'}</span>
                      <span className="text-slate-500 font-medium">
                        {exp.startDate || 'N/A'} – {exp.isCurrent ? 'Present' : exp.endDate || 'N/A'}
                      </span>
                    </div>
                    {exp.company && <div className="text-xs font-semibold text-indigo-600">{exp.company}</div>}
                    {exp.responsibilities && exp.responsibilities.length > 0 && (
                      <ul className="list-disc pl-5 space-y-1 text-xs text-slate-600 pt-1">
                        {exp.responsibilities.map((resp, rIdx) => (
                          <li key={rIdx}>{resp}</li>
                        ))}
                      </ul>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Education & Certifications */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {data.extractedProfile?.education && data.extractedProfile.education.length > 0 && (
              <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-3">
                <div className="flex items-center space-x-2 border-b border-slate-100 pb-2">
                  <GraduationCap className="w-4 h-4 text-indigo-600" />
                  <h4 className="font-bold text-slate-900 text-sm">Education</h4>
                </div>
                {data.extractedProfile.education.map((edu, idx) => (
                  <div key={idx} className="text-xs space-y-0.5">
                    <div className="font-bold text-slate-800">{edu.degree || 'Degree'}</div>
                    <div className="text-slate-600">{edu.institution}</div>
                    {edu.graduationYear && <div className="text-slate-400">Class of {edu.graduationYear}</div>}
                  </div>
                ))}
              </div>
            )}

            {data.extractedProfile?.certifications && data.extractedProfile.certifications.length > 0 && (
              <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-3">
                <div className="flex items-center space-x-2 border-b border-slate-100 pb-2">
                  <Award className="w-4 h-4 text-emerald-600" />
                  <h4 className="font-bold text-slate-900 text-sm">Certifications</h4>
                </div>
                {data.extractedProfile.certifications.map((cert, idx) => (
                  <div key={idx} className="text-xs space-y-0.5">
                    <div className="font-bold text-slate-800">{cert.name}</div>
                    {cert.issuer && <div className="text-slate-600">{cert.issuer}</div>}
                    {cert.year && <div className="text-slate-400">Issued: {cert.year}</div>}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
