'use client';

import React, { useState, useEffect, useRef } from 'react';
import {
  FileText,
  Sparkles,
  Lightbulb,
  Clock,
  ShieldCheck,
  CheckCircle2,
} from 'lucide-react';

export const ANALYSIS_STATUS_MESSAGES = [
  'Validating your resume file...',
  'Extracting text from your resume...',
  'Identifying your technical skills and frameworks...',
  'Organizing your experience and project details...',
  'Analyzing your resume structure...',
  'Evaluating relevant skills and qualifications...',
  'Calculating your resume assessment score...',
  'Preparing your analysis report...',
];

export const RESUME_AND_INTERVIEW_TIPS = [
  'Tip: Highlight projects where you solved a real technical problem.',
  'Tip: Mention the technologies you used in each project.',
  'Tip: Quantify achievements whenever you have reliable metrics.',
  'Tip: Describe your actual contribution instead of listing only team responsibilities.',
  'Tip: Keep your experience dates consistent and easy to understand.',
  'Interview tip: Be ready to explain the technical decisions behind your projects.',
  'Interview tip: Prepare examples of bugs you fixed and how you investigated them.',
  'Interview tip: Review the fundamentals of the technologies listed on your resume.',
];

interface ResumeAnalysisLoaderProps {
  fileName?: string;
  fileSize?: number;
  targetRole?: string;
  currentStepOverride?: string;
  className?: string;
}

export default function ResumeAnalysisLoader({
  fileName,
  fileSize,
  targetRole,
  currentStepOverride,
  className = '',
}: ResumeAnalysisLoaderProps) {
  // Status message rotation
  const [statusIndex, setStatusIndex] = useState(0);
  const [statusFade, setStatusFade] = useState(true);

  // Tip rotation
  const [tipIndex, setTipIndex] = useState(0);
  const [tipFade, setTipFade] = useState(true);

  // Elapsed time tracking
  const [elapsedSeconds, setElapsedSeconds] = useState(0);

  // Status rotation interval (every 3.8s)
  useEffect(() => {
    const statusInterval = setInterval(() => {
      setStatusFade(false);
      setTimeout(() => {
        setStatusIndex((prev) => (prev + 1) % ANALYSIS_STATUS_MESSAGES.length);
        setStatusFade(true);
      }, 200);
    }, 3800);

    return () => clearInterval(statusInterval);
  }, []);

  // Tips rotation interval (every 5.5s)
  useEffect(() => {
    const tipInterval = setInterval(() => {
      setTipFade(false);
      setTimeout(() => {
        setTipIndex((prev) => (prev + 1) % RESUME_AND_INTERVIEW_TIPS.length);
        setTipFade(true);
      }, 250);
    }, 5500);

    return () => clearInterval(tipInterval);
  }, []);

  // Elapsed seconds timer
  useEffect(() => {
    const timer = setInterval(() => {
      setElapsedSeconds((prev) => prev + 1);
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const activeStatus = currentStepOverride || ANALYSIS_STATUS_MESSAGES[statusIndex];
  const activeTip = RESUME_AND_INTERVIEW_TIPS[tipIndex];

  const formatFileSize = (bytes?: number) => {
    if (!bytes) return '';
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  return (
    <div
      role="region"
      aria-label="Resume analysis in progress"
      className={`w-full max-w-xl mx-auto p-6 sm:p-8 bg-white/95 rounded-2xl border border-indigo-100 shadow-xl shadow-indigo-50/50 space-y-6 text-center ${className}`}
    >
      {/* File Badge */}
      {fileName && (
        <div className="inline-flex flex-wrap items-center justify-center gap-1.5 px-3.5 py-1.5 bg-slate-50 border border-slate-200/90 rounded-full text-xs text-slate-700 font-medium max-w-full">
          <FileText className="w-3.5 h-3.5 text-indigo-600 flex-shrink-0" />
          <span className="truncate max-w-[200px] sm:max-w-xs">{fileName}</span>
          {fileSize && (
            <span className="text-slate-400 text-[11px] flex-shrink-0">
              • {formatFileSize(fileSize)}
            </span>
          )}
          {targetRole && (
            <span className="text-indigo-600 text-[11px] font-semibold flex-shrink-0">
              • Target: {targetRole}
            </span>
          )}
        </div>
      )}

      {/* Animated Central Visual */}
      <div className="relative w-40 h-40 mx-auto flex items-center justify-center">
        {/* Outer ambient pulse ring */}
        <div className="absolute inset-0 rounded-full bg-gradient-to-tr from-indigo-500/15 via-violet-500/10 to-indigo-500/5 animate-loader-pulse-ring" />

        {/* Orbit track 1 */}
        <div className="absolute inset-2 rounded-full border border-indigo-200/70 border-dashed animate-loader-orbit">
          {/* Orbiting glowing bead 1 */}
          <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 w-3.5 h-3.5 bg-indigo-600 rounded-full shadow-md shadow-indigo-400 ring-3 ring-white" />
        </div>

        {/* Orbit track 2 (reverse) */}
        <div className="absolute inset-5 rounded-full border border-violet-200/50 animate-loader-orbit-reverse">
          {/* Orbiting glowing bead 2 */}
          <div className="absolute bottom-0 right-1/4 w-2.5 h-2.5 bg-violet-500 rounded-full shadow-sm ring-2 ring-white" />
        </div>

        {/* Central Card with Document & Sparkle */}
        <div className="relative z-10 w-16 h-16 rounded-2xl bg-gradient-to-tr from-indigo-600 to-violet-600 text-white shadow-lg shadow-indigo-300/60 flex items-center justify-center transform transition hover:scale-105">
          <FileText className="w-8 h-8 text-white drop-shadow-sm" />
          <div className="absolute -top-1 -right-1 bg-amber-400 text-slate-900 rounded-full p-1 shadow-sm">
            <Sparkles className="w-3.5 h-3.5 fill-current" />
          </div>
        </div>
      </div>

      {/* Primary Heading & Dynamic Status */}
      <div className="space-y-2">
        <h2 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
          Analyzing your resume
        </h2>

        {/* Stable container for rotating status message to avoid layout shifts */}
        <div className="h-6 flex items-center justify-center">
          <p
            role="status"
            aria-live="polite"
            className={`text-sm font-medium text-indigo-700 transition-all duration-200 transform ${
              statusFade ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-1'
            }`}
          >
            {activeStatus}
          </p>
        </div>
      </div>

      {/* Semantic Accessible Progress Indicator */}
      <div className="space-y-1.5 px-4 sm:px-8">
        {/* Native progress for accessibility */}
        <progress
          aria-label="Analyzing resume"
          className="sr-only"
        />

        {/* Visual modern indeterminate track */}
        <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden relative border border-slate-200/60">
          <div className="h-full rounded-full bg-gradient-to-r from-indigo-500 via-violet-500 to-indigo-600 animate-loader-indeterminate" />
        </div>
        <div className="flex justify-between items-center text-[11px] text-slate-400 pt-0.5">
          <span>AI Profile Extraction</span>
          <span>ATS Quality Engine</span>
        </div>
      </div>

      {/* Rotating Informational Tip Card */}
      <div className="bg-slate-50/90 border border-slate-200/80 rounded-xl p-4 text-left space-y-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-1.5 text-xs font-bold text-slate-800">
            <Lightbulb className="w-4 h-4 text-amber-500 flex-shrink-0" />
            <span>While we analyze your resume</span>
          </div>
          <span className="text-[10px] uppercase font-bold tracking-wider text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-full border border-indigo-100">
            Career Tip
          </span>
        </div>

        {/* Fixed minimum height prevents card jitter */}
        <div className="min-h-[44px] flex items-center">
          <p
            className={`text-xs text-slate-600 leading-relaxed transition-all duration-300 ${
              tipFade ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-1'
            }`}
          >
            {activeTip}
          </p>
        </div>
      </div>

      {/* Reassurance Caption & Long-Wait Notification */}
      <div className="space-y-2 pt-1 border-t border-slate-100">
        <p className="text-xs text-slate-500">
          Feel free to keep this tab open — we&apos;re generating your comprehensive analysis report.
        </p>

        {elapsedSeconds >= 25 && (
          <div className="inline-flex items-center space-x-2 text-xs text-amber-700 bg-amber-50 border border-amber-200/80 px-3 py-1.5 rounded-lg animate-fade-in">
            <Clock className="w-3.5 h-3.5 text-amber-600 flex-shrink-0" />
            <span>Your analysis is taking longer than expected. We&apos;re still waiting for a response.</span>
          </div>
        )}
      </div>
    </div>
  );
}
