'use client';

import React, { useState, useRef } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { apiFetch, parseApiResponse } from '@/lib/api';
import ResumeAnalysisLoader from '@/components/ResumeAnalysisLoader';
import {
  UploadCloud,
  FileText,
  AlertCircle,
  CheckCircle2,
  Lock,
  Briefcase,
  Layers,
  Sparkles,
  ArrowRight,
  ShieldCheck,
} from 'lucide-react';

export default function HomePage() {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [file, setFile] = useState<File | null>(null);
  const [targetRole, setTargetRole] = useState('');
  const [targetJobDescription, setTargetJobDescription] = useState('');
  const [showJobDescription, setShowJobDescription] = useState(false);
  const [privacyConsent, setPrivacyConsent] = useState(true);

  const [isUploading, setIsUploading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setErrorMessage(null);
    if (e.target.files && e.target.files[0]) {
      const selected = e.target.files[0];
      const ext = selected.name.split('.').pop()?.toLowerCase();
      if (ext !== 'pdf' && ext !== 'docx') {
        setErrorMessage('Only PDF (.pdf) and Word (.docx) files are supported.');
        return;
      }
      if (selected.size > 5 * 1024 * 1024) {
        setErrorMessage('File size exceeds the 5 MB limit.');
        return;
      }
      setFile(selected);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const dropped = e.dataTransfer.files[0];
      const ext = dropped.name.split('.').pop()?.toLowerCase();
      if (ext !== 'pdf' && ext !== 'docx') {
        setErrorMessage('Only PDF (.pdf) and Word (.docx) files are supported.');
        return;
      }
      if (dropped.size > 5 * 1024 * 1024) {
        setErrorMessage('File size exceeds the 5 MB limit.');
        return;
      }
      setFile(dropped);
    }
  };

  // Synthetic sample generator for quick testing
  const handleLoadSample = () => {
    setErrorMessage(null);
    const sampleText = `Alex Taylor
Senior Full-Stack Software Engineer
Email: alex.taylor@example.com
Phone: (555) 019-2834
Address: 742 Evergreen Terrace, Seattle, WA 98101
LinkedIn: https://linkedin.com/in/alex-taylor-dev

PROFESSIONAL SUMMARY
Results-driven software engineer with 5+ years of experience building high-scale web applications, microservices, and cloud architectures. Proven track record of improving application throughput by 40% and mentoring cross-functional agile teams.

TECHNICAL SKILLS
Languages: JavaScript, TypeScript, Python, SQL, HTML5, CSS3, Bash
Frameworks & Libraries: React, Next.js, Node.js, Express, Tailwind CSS, Redux
Databases: PostgreSQL, MySQL, Redis, MongoDB
Cloud & DevOps: Amazon Web Services (AWS), Docker, Kubernetes, CI/CD, GitHub Actions
Methodologies: Agile, Scrum, REST APIs, Microservices, Unit Testing, Jest

WORK EXPERIENCE
Senior Software Engineer | CloudScale Systems | 2022 - Present
- Architected and delivered resilient Next.js and TypeScript frontend consuming distributed Node.js microservices, supporting over 200,000 monthly active users.
- Optimized PostgreSQL database queries and introduced Redis caching, reducing p95 API latency by 45%.
- Built automated CI/CD deployment pipelines using GitHub Actions and Docker, reducing deployment cycle times from 2 hours to 8 minutes.
- Mentored 4 junior engineers on clean code practices and test-driven development (TDD).

Software Engineer | Apex Digital Solutions | 2020 - 2022
- Developed responsive web interfaces using React, Redux, and Tailwind CSS for enterprise analytics clients.
- Engineered secure RESTful APIs using Python and FastAPI, handling 5,000 requests per minute with 99.9% uptime.
- Collaborated with product designers in bi-weekly Agile sprints to deliver 15+ major client features ahead of schedule.

TECHNICAL PROJECTS
E-Commerce Real-time Analytics Platform (Next.js, TypeScript, PostgreSQL, Docker)
- Created open-source real-time metrics dashboard visualizing transactional events via WebSocket streams.
- Achieved sub-second data synchronization and deployed on AWS ECS with auto-scaling.

TaskFlow Orchestration CLI (Python, Redis, Docker)
- Built lightweight distributed task queuing worker in Python with Redis backend.

EDUCATION & CERTIFICATIONS
Bachelor of Science in Computer Science | University of Washington | 2016 - 2020
AWS Certified Solutions Architect – Associate | Amazon Web Services | 2023`;

    // Create synthetic text file with .docx-like or readable format
    // Since our parser accepts PDF or DOCX binary signatures, we create a synthetic PDF buffer or alert
    // Instead of a fake file that fails magic bytes, we alert user or provide test guidance
    setShowJobDescription(true);
    setTargetRole('Senior Full-Stack Engineer');
    setTargetJobDescription(
      'Looking for a Senior Full-Stack Engineer with strong experience in React, Next.js, TypeScript, Node.js, PostgreSQL, Docker, and AWS. Must have experience optimizing web performance and building microservices.'
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file) {
      setErrorMessage('Please select a resume file (PDF or DOCX).');
      return;
    }
    if (!privacyConsent) {
      setErrorMessage('Please acknowledge the privacy disclosure to proceed.');
      return;
    }

    setIsUploading(true);
    setErrorMessage(null);

    try {
      const formData = new FormData();
      formData.append('file', file);
      if (targetRole) formData.append('targetRole', targetRole);
      if (targetJobDescription) formData.append('targetJobDescription', targetJobDescription);

      const res = await apiFetch('/resumes/analyze', {
        method: 'POST',
        body: formData,
      });

      const data = await parseApiResponse<{ analysisId: string }>(res);
      router.push(`/analysis/${data.analysisId}`);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Analysis failed';
      setErrorMessage(msg);
      setIsUploading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-10">
      {/* Hero Header */}
      <div className="text-center space-y-4">
        <div className="inline-flex items-center space-x-2 px-3 py-1 bg-indigo-50 border border-indigo-200 text-indigo-700 text-xs font-semibold rounded-full shadow-xs">
          <ShieldCheck className="w-3.5 h-3.5" />
          <span>Secure, Fast & Transparent AI Resume Analysis</span>
        </div>
        <h1 className="text-4xl sm:text-5xl font-extrabold text-slate-900 tracking-tight">
          Level Up Your Resume With{' '}
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-violet-600">
            Explainable AI
          </span>
        </h1>
        <p className="max-w-2xl mx-auto text-base sm:text-lg text-slate-600">
          Upload your resume for structured skill extraction, canonical taxonomy mapping, and deterministic quality scoring. Zero black-box guesswork.
        </p>

        {/* Feature Highlights */}
        <div className="pt-2 flex flex-wrap justify-center gap-4 text-xs font-medium text-slate-600">
          <span className="flex items-center space-x-1.5 bg-white px-3 py-1.5 rounded-lg border border-slate-200 shadow-xs">
            <Lock className="w-3.5 h-3.5 text-indigo-600" />
            <span>PII Redacted Before AI</span>
          </span>
          <span className="flex items-center space-x-1.5 bg-white px-3 py-1.5 rounded-lg border border-slate-200 shadow-xs">
            <Layers className="w-3.5 h-3.5 text-indigo-600" />
            <span>Pluggable OpenAI & Gemini</span>
          </span>
          <span className="flex items-center space-x-1.5 bg-white px-3 py-1.5 rounded-lg border border-slate-200 shadow-xs">
            <Sparkles className="w-3.5 h-3.5 text-indigo-600" />
            <span>Deterministic Scoring Engine</span>
          </span>
        </div>
      </div>

      {/* Main Upload Card */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 sm:p-8 space-y-6">
        {isUploading ? (
          <ResumeAnalysisLoader
            fileName={file?.name}
            fileSize={file?.size}
            targetRole={targetRole || undefined}
          />
        ) : (
          <form onSubmit={handleSubmit} className="space-y-6">
          {/* File Dropzone */}
          <div
            onDragOver={(e) => e.preventDefault()}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
            className={`border-2 border-dashed rounded-xl p-8 sm:p-10 text-center cursor-pointer transition ${
              file
                ? 'border-indigo-400 bg-indigo-50/30'
                : 'border-slate-300 hover:border-indigo-500 hover:bg-slate-50'
            }`}
          >
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileChange}
              accept=".pdf,.docx,application/pdf,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
              className="hidden"
            />

            {file ? (
              <div className="flex flex-col items-center space-y-2">
                <div className="p-3 bg-indigo-100 text-indigo-700 rounded-full">
                  <FileText className="w-8 h-8" />
                </div>
                <div className="font-semibold text-slate-800 text-base">{file.name}</div>
                <div className="text-xs text-slate-500">
                  {(file.size / 1024).toFixed(1)} KB • Ready for analysis
                </div>
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    setFile(null);
                  }}
                  className="mt-2 text-xs text-red-600 hover:text-red-700 font-medium underline"
                >
                  Change file
                </button>
              </div>
            ) : (
              <div className="flex flex-col items-center space-y-3">
                <div className="p-3.5 bg-slate-100 text-slate-600 rounded-full">
                  <UploadCloud className="w-8 h-8 text-indigo-600" />
                </div>
                <div>
                  <span className="font-semibold text-slate-800 text-sm sm:text-base">
                    Click to upload
                  </span>{' '}
                  <span className="text-slate-500 text-sm sm:text-base">or drag and drop</span>
                </div>
                <p className="text-xs text-slate-400">PDF or Word (.docx) documents up to 5 MB</p>
              </div>
            )}
          </div>

          {/* Target Job Role / Description Toggle */}
          <div className="pt-2">
            <button
              type="button"
              onClick={() => setShowJobDescription(!showJobDescription)}
              className="text-sm font-semibold text-indigo-600 hover:text-indigo-700 flex items-center space-x-1.5"
            >
              <Briefcase className="w-4 h-4" />
              <span>{showJobDescription ? 'Hide Target Job Match (Optional)' : 'Add Target Job for Match Scoring (Optional)'}</span>
            </button>

            {showJobDescription && (
              <div className="mt-4 p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Target Role Title
                  </label>
                  <input
                    type="text"
                    value={targetRole}
                    onChange={(e) => setTargetRole(e.target.value)}
                    placeholder="e.g. Senior Backend Engineer"
                    className="w-full px-3 py-2 text-sm bg-white border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Target Job Description
                  </label>
                  <textarea
                    rows={4}
                    value={targetJobDescription}
                    onChange={(e) => setTargetJobDescription(e.target.value)}
                    placeholder="Paste job posting requirements, required tech stack, or qualification bullets here..."
                    className="w-full px-3 py-2 text-sm bg-white border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
                <div className="flex justify-end">
                  <button
                    type="button"
                    onClick={handleLoadSample}
                    className="text-xs text-slate-600 hover:text-indigo-600 underline font-medium"
                  >
                    Fill sample target job description
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Privacy Acknowledgement */}
          <div className="flex items-start space-x-2.5 p-3.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-600">
            <input
              type="checkbox"
              id="privacy"
              checked={privacyConsent}
              onChange={(e) => setPrivacyConsent(e.target.checked)}
              className="mt-0.5 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
            />
            <label htmlFor="privacy" className="cursor-pointer">
              I acknowledge that resume text is scrubbed of contact details (emails, phone numbers, addresses) and processed by the system&apos;s configured AI provider (OpenAI or Google Gemini) for structured analysis. Guest reports expire automatically in 24 hours.
            </label>
          </div>

          {/* Error Message & Quota Handling */}
          {errorMessage && (
            errorMessage.includes('Guest analysis limit reached') ? (
              <div className="p-5 bg-amber-50 border border-amber-200 rounded-2xl space-y-3 text-amber-900 shadow-xs">
                <div className="flex items-center space-x-2 font-bold text-sm text-amber-950">
                  <AlertCircle className="w-5 h-5 text-amber-600 flex-shrink-0" />
                  <span>Free Guest Analysis Limit Reached</span>
                </div>
                <p className="text-xs text-amber-800 leading-relaxed">
                  Guests are allowed 1 free preliminary resume analysis per session. Create a free account or log in to unlock unlimited analyses, view full skills breakdowns, and receive customized recommendations.
                </p>
                <div className="pt-1 flex flex-wrap items-center gap-2">
                  <Link
                    href="/register"
                    className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-semibold shadow-xs transition"
                  >
                    Create Free Account
                  </Link>
                  <Link
                    href="/login"
                    className="px-4 py-2 bg-white border border-slate-300 hover:bg-slate-50 text-slate-700 rounded-xl text-xs font-semibold shadow-xs transition"
                  >
                    Log In
                  </Link>
                </div>
              </div>
            ) : (
              <div className="p-4 bg-red-50 border border-red-200 rounded-xl flex items-start space-x-2.5 text-sm text-red-700">
                <AlertCircle className="w-5 h-5 flex-shrink-0 text-red-600 mt-0.5" />
                <div>
                  <p className="font-semibold">Analysis Failed</p>
                  <p className="text-xs mt-0.5">{errorMessage}</p>
                </div>
              </div>
            )
          )}

          {/* Submit Button */}
          <button
            type="submit"
            disabled={!file}
            className={`w-full py-3.5 px-4 rounded-xl font-semibold text-sm sm:text-base flex items-center justify-center space-x-2 shadow-sm transition ${
              !file
                ? 'bg-slate-200 text-slate-400 cursor-not-allowed'
                : 'bg-indigo-600 hover:bg-indigo-700 text-white'
            }`}
          >
            <span>Analyze Resume Now</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>
        )}
      </div>

      {/* How it works grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-4">
        <div className="bg-white p-5 rounded-xl border border-slate-200 space-y-2">
          <div className="w-8 h-8 bg-blue-50 text-blue-600 rounded-lg flex items-center justify-center font-bold text-sm">
            1
          </div>
          <h3 className="font-semibold text-slate-800 text-sm">Local Extraction & Sanitization</h3>
          <p className="text-xs text-slate-500 leading-relaxed">
            PDF/DOCX magic bytes and structural integrity are validated. Personal contact details (emails, phones, addresses) are scrubbed before any AI call.
          </p>
        </div>

        <div className="bg-white p-5 rounded-xl border border-slate-200 space-y-2">
          <div className="w-8 h-8 bg-purple-50 text-purple-600 rounded-lg flex items-center justify-center font-bold text-sm">
            2
          </div>
          <h3 className="font-semibold text-slate-800 text-sm">Canonical Skill Normalization</h3>
          <p className="text-xs text-slate-500 leading-relaxed">
            Skills are mapped to standard industry taxonomies with alias matching (e.g. JS → JavaScript, K8s → Kubernetes) and grounded evidence citations.
          </p>
        </div>

        <div className="bg-white p-5 rounded-xl border border-slate-200 space-y-2">
          <div className="w-8 h-8 bg-emerald-50 text-emerald-600 rounded-lg flex items-center justify-center font-bold text-sm">
            3
          </div>
          <h3 className="font-semibold text-slate-800 text-sm">Deterministic Transparent Scores</h3>
          <p className="text-xs text-slate-500 leading-relaxed">
            Calculated by backend rules with configurable weights. 100% testable, predictable, and free of arbitrary LLM numerical hallucination.
          </p>
        </div>
      </div>
    </div>
  );
}
