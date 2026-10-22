'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { apiFetch, parseApiResponse } from '@/lib/api';
import Navbar from '@/components/Navbar';
import {
  BookOpen,
  Code2,
  ChevronDown,
  ChevronUp,
  CheckCircle2,
  HelpCircle,
  Search,
  Filter,
  ExternalLink,
  Sparkles,
  ChevronLeft,
  ChevronRight,
  Shield,
  Layers,
  ArrowRight,
} from 'lucide-react';

interface TechnologyItem {
  id: string;
  name: string;
  category: string;
  questionCount: number;
}

interface QuestionItem {
  id: string;
  technology: { id: string; canonicalName: string; category: string };
  topic: string;
  subtopic: string | null;
  questionText: string;
  answerContent: string;
  explanation: string | null;
  difficulty: 'BEGINNER' | 'INTERMEDIATE' | 'ADVANCED' | 'UNKNOWN';
  questionType: 'SHORT_ANSWER' | 'MULTIPLE_CHOICE' | 'CODE_OUTPUT' | 'DEBUGGING' | 'OPEN_ENDED';
  options: string[] | null;
  correctOption: string | null;
  sourceUrl: string | null;
  attribution: string;
  license: string;
  publishedAt: string;
}

function QuestionsContent() {
  const searchParams = useSearchParams();
  const initialSkill = searchParams.get('skill') || '';

  const [technologies, setTechnologies] = useState<TechnologyItem[]>([]);
  const [selectedTechId, setSelectedTechId] = useState<string>('');
  const [topics, setTopics] = useState<string[]>([]);
  const [selectedTopic, setSelectedTopic] = useState<string>('');
  const [difficulty, setDifficulty] = useState<string>('');
  const [questionType, setQuestionType] = useState<string>('');
  const [search, setSearch] = useState<string>('');

  const [questions, setQuestions] = useState<QuestionItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalQuestionsCount, setTotalQuestionsCount] = useState(0);

  // Expanded answers state: questionId -> boolean
  const [revealedAnswers, setRevealedAnswers] = useState<{ [id: string]: boolean }>({});
  // Selected option state for MCQ: questionId -> optionText
  const [selectedOptions, setSelectedOptions] = useState<{ [id: string]: string }>({});

  // 1. Load available technologies
  useEffect(() => {
    apiFetch('/technologies')
      .then((res) => parseApiResponse<{ technologies: TechnologyItem[] }>(res))
      .then((data) => {
        const list = data.technologies || [];
        setTechnologies(list);

        if (initialSkill) {
          const match = list.find(
            (t) => t.name.toLowerCase() === initialSkill.toLowerCase() || t.id === initialSkill
          );
          if (match) setSelectedTechId(match.id);
        } else if (list.length > 0) {
          setSelectedTechId(list[0].id);
        }
      })
      .catch(() => {});
  }, [initialSkill]);

  // 2. Load topics when technology changes
  useEffect(() => {
    if (!selectedTechId) {
      setTopics([]);
      setSelectedTopic('');
      return;
    }

    apiFetch(`/technologies/${selectedTechId}/topics`)
      .then((res) => parseApiResponse<{ topics: string[] }>(res))
      .then((data) => {
        setTopics(data.topics || []);
        setSelectedTopic('');
      })
      .catch(() => setTopics([]));
  }, [selectedTechId]);

  // 3. Load questions based on selected filters
  useEffect(() => {
    setLoading(true);
    const params = new URLSearchParams({
      page: page.toString(),
      limit: '10',
      ...(selectedTechId ? { technologyId: selectedTechId } : {}),
      ...(selectedTopic ? { topic: selectedTopic } : {}),
      ...(difficulty ? { difficulty } : {}),
      ...(questionType ? { questionType } : {}),
      ...(search ? { search } : {}),
    });

    apiFetch(`/questions?${params.toString()}`)
      .then((res) =>
        parseApiResponse<{
          questions: QuestionItem[];
          pagination: { page: number; totalPages: number; totalCount: number };
        }>(res)
      )
      .then((data) => {
        setQuestions(data.questions || []);
        setTotalPages(data.pagination?.totalPages || 1);
        setTotalQuestionsCount(data.pagination?.totalCount || 0);
      })
      .catch(() => {
        setQuestions([]);
      })
      .finally(() => setLoading(false));
  }, [selectedTechId, selectedTopic, difficulty, questionType, page]);

  const toggleReveal = (id: string) => {
    setRevealedAnswers((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const handleSelectOption = (questionId: string, option: string) => {
    setSelectedOptions((prev) => ({ ...prev, [questionId]: option }));
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1);
    setLoading(true);
    const params = new URLSearchParams({
      page: '1',
      limit: '10',
      ...(selectedTechId ? { technologyId: selectedTechId } : {}),
      ...(selectedTopic ? { topic: selectedTopic } : {}),
      ...(difficulty ? { difficulty } : {}),
      ...(questionType ? { questionType } : {}),
      ...(search ? { search } : {}),
    });

    apiFetch(`/questions?${params.toString()}`)
      .then((res) => parseApiResponse<any>(res))
      .then((data) => {
        setQuestions(data.questions || []);
        setTotalPages(data.pagination?.totalPages || 1);
        setTotalQuestionsCount(data.pagination?.totalCount || 0);
      })
      .finally(() => setLoading(false));
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <Navbar />

      {/* Hero Header */}
      <section className="bg-gradient-to-b from-white to-slate-50 border-b border-slate-200 py-10 px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto space-y-3">
          <div className="inline-flex items-center space-x-2 px-3 py-1 bg-indigo-50 border border-indigo-100 rounded-full text-indigo-700 text-xs font-semibold">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Curated Question Bank • Local High-Speed Delivery</span>
          </div>

          <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
            Technical Interview Questions & Solutions
          </h1>

          <p className="text-sm sm:text-base text-slate-600 max-w-2xl">
            Practice hand-curated questions, code implementations, multiple-choice drills, and explanations across verified technologies.
          </p>

          {/* Technology Pills Bar */}
          <div className="pt-4 flex items-center space-x-2 overflow-x-auto pb-2 scrollbar-thin">
            <button
              onClick={() => {
                setSelectedTechId('');
                setPage(1);
              }}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition flex items-center space-x-1.5 flex-shrink-0 ${
                selectedTechId === ''
                  ? 'bg-indigo-600 text-white shadow-xs'
                  : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-100'
              }`}
            >
              <span>All Technologies</span>
            </button>

            {technologies.map((tech) => (
              <button
                key={tech.id}
                onClick={() => {
                  setSelectedTechId(tech.id);
                  setPage(1);
                }}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition flex items-center space-x-1.5 flex-shrink-0 ${
                  selectedTechId === tech.id
                    ? 'bg-indigo-600 text-white shadow-xs'
                    : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-100'
                }`}
              >
                <span>{tech.name}</span>
                <span
                  className={`px-1.5 py-0.2 rounded-full text-[10px] ${
                    selectedTechId === tech.id
                      ? 'bg-indigo-700 text-white'
                      : 'bg-slate-100 text-slate-600'
                  }`}
                >
                  {tech.questionCount}
                </span>
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Main Content & Filter Sidebar Layout */}
      <main className="max-w-6xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-8 flex-1">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Sidebar Filters */}
          <aside className="space-y-6">
            {/* Search Box */}
            <form onSubmit={handleSearchSubmit} className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                Search Questions
              </label>
              <div className="relative">
                <input
                  type="text"
                  placeholder="e.g. closures, hooks, indexing..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 bg-white border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-indigo-500 focus:outline-hidden"
                />
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
              </div>
            </form>

            {/* Topics Filter */}
            {topics.length > 0 && (
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center justify-between">
                  <span>Topics</span>
                  {selectedTopic && (
                    <button
                      onClick={() => {
                        setSelectedTopic('');
                        setPage(1);
                      }}
                      className="text-[10px] text-indigo-600 hover:underline capitalize"
                    >
                      Clear
                    </button>
                  )}
                </label>
                <div className="space-y-1 max-h-48 overflow-y-auto pr-1">
                  <button
                    onClick={() => {
                      setSelectedTopic('');
                      setPage(1);
                    }}
                    className={`w-full text-left px-2.5 py-1.5 rounded-lg text-xs font-medium transition ${
                      selectedTopic === ''
                        ? 'bg-indigo-50 text-indigo-700 font-bold'
                        : 'text-slate-600 hover:bg-slate-100'
                    }`}
                  >
                    All Topics
                  </button>
                  {topics.map((t) => (
                    <button
                      key={t}
                      onClick={() => {
                        setSelectedTopic(t);
                        setPage(1);
                      }}
                      className={`w-full text-left px-2.5 py-1.5 rounded-lg text-xs font-medium transition ${
                        selectedTopic === t
                          ? 'bg-indigo-50 text-indigo-700 font-bold'
                          : 'text-slate-600 hover:bg-slate-100'
                      }`}
                    >
                      {t}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Difficulty Filter */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                Difficulty
              </label>
              <select
                value={difficulty}
                onChange={(e) => {
                  setDifficulty(e.target.value);
                  setPage(1);
                }}
                className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-indigo-500 bg-white"
              >
                <option value="">All Difficulties</option>
                <option value="BEGINNER">Beginner</option>
                <option value="INTERMEDIATE">Intermediate</option>
                <option value="ADVANCED">Advanced</option>
              </select>
            </div>

            {/* Question Type Filter */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                Question Format
              </label>
              <select
                value={questionType}
                onChange={(e) => {
                  setQuestionType(e.target.value);
                  setPage(1);
                }}
                className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-indigo-500 bg-white"
              >
                <option value="">All Formats</option>
                <option value="SHORT_ANSWER">Technical Q&A</option>
                <option value="MULTIPLE_CHOICE">Multiple Choice Quiz</option>
                <option value="CODE_OUTPUT">Code Output Prediction</option>
                <option value="DEBUGGING">Code Debugging</option>
              </select>
            </div>

            {/* Provenance Disclosure Box */}
            <div className="p-4 bg-white border border-slate-200 rounded-2xl text-xs text-slate-500 space-y-1.5 shadow-xs">
              <div className="flex items-center space-x-1.5 font-bold text-slate-700">
                <Shield className="w-4 h-4 text-emerald-600" />
                <span>Verified Source Licensing</span>
              </div>
              <p className="text-[11px] leading-relaxed">
                All questions maintain explicit provenance, attribution notices, and open license compliance.
              </p>
            </div>
          </aside>

          {/* Question Cards Feed */}
          <div className="lg:col-span-3 space-y-5">
            <div className="flex items-center justify-between text-xs text-slate-500 border-b border-slate-200 pb-2">
              <span>
                Showing <strong className="text-slate-800">{questions.length}</strong> of{' '}
                <strong className="text-slate-800">{totalQuestionsCount}</strong> questions
              </span>
              {(selectedTopic || difficulty || questionType || search) && (
                <button
                  onClick={() => {
                    setSelectedTopic('');
                    setDifficulty('');
                    setQuestionType('');
                    setSearch('');
                    setPage(1);
                  }}
                  className="text-indigo-600 hover:underline font-semibold"
                >
                  Reset Filters
                </button>
              )}
            </div>

            {loading ? (
              <div className="p-16 text-center text-xs text-slate-400 flex flex-col items-center justify-center space-y-3">
                <div className="w-8 h-8 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin" />
                <span>Loading interview questions...</span>
              </div>
            ) : questions.length === 0 ? (
              <div className="bg-white p-12 text-center rounded-2xl border border-slate-200 space-y-3">
                <BookOpen className="w-10 h-10 text-slate-300 mx-auto" />
                <h3 className="font-bold text-slate-800 text-sm">No Questions Found</h3>
                <p className="text-xs text-slate-500 max-w-sm mx-auto">
                  No interview questions match the current technology, topic, or difficulty filter.
                </p>
              </div>
            ) : (
              questions.map((q, idx) => {
                const isRevealed = Boolean(revealedAnswers[q.id]);
                const selectedOpt = selectedOptions[q.id];

                return (
                  <article
                    key={q.id}
                    className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-4 hover:border-slate-300 transition"
                  >
                    {/* Header: Tech, Topic, Difficulty */}
                    <div className="flex flex-wrap items-center justify-between gap-2 text-xs">
                      <div className="flex items-center space-x-2">
                        <span className="px-2.5 py-0.5 bg-indigo-50 text-indigo-700 font-bold rounded-md text-[11px]">
                          {q.technology.canonicalName}
                        </span>
                        <span className="px-2 py-0.5 bg-slate-100 text-slate-700 rounded-md text-[11px] font-medium">
                          {q.topic}
                        </span>
                        {q.subtopic && (
                          <span className="text-slate-400 text-[11px]">› {q.subtopic}</span>
                        )}
                      </div>

                      <div className="flex items-center space-x-2">
                        <span
                          className={`px-2 py-0.5 rounded font-bold text-[10px] ${
                            q.difficulty === 'BEGINNER'
                              ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                              : q.difficulty === 'INTERMEDIATE'
                              ? 'bg-amber-50 text-amber-700 border border-amber-200'
                              : q.difficulty === 'ADVANCED'
                              ? 'bg-purple-50 text-purple-700 border border-purple-200'
                              : 'bg-slate-100 text-slate-600'
                          }`}
                        >
                          {q.difficulty}
                        </span>
                        <span className="text-slate-400 text-[10px] uppercase font-mono">
                          {q.questionType.replace('_', ' ')}
                        </span>
                      </div>
                    </div>

                    {/* Question Content */}
                    <div className="space-y-2">
                      <h3 className="text-base sm:text-lg font-bold text-slate-900 leading-snug">
                        {q.questionText}
                      </h3>
                    </div>

                    {/* Multiple Choice Interactive Options */}
                    {q.questionType === 'MULTIPLE_CHOICE' && q.options && q.options.length > 0 && (
                      <div className="space-y-2 pt-1">
                        <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                          Select an option to test your knowledge:
                        </span>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                          {q.options.map((opt, optIdx) => {
                            const isSelected = selectedOpt === opt;
                            const isCorrect = q.correctOption === opt || q.correctOption === String(optIdx);

                            let optionClasses =
                              'p-3 rounded-xl border text-xs font-medium cursor-pointer transition text-left flex items-start space-x-2 ';

                            if (isRevealed) {
                              if (isCorrect) {
                                optionClasses += 'bg-emerald-50 border-emerald-400 text-emerald-900 font-bold';
                              } else if (isSelected && !isCorrect) {
                                optionClasses += 'bg-rose-50 border-rose-300 text-rose-900 line-through';
                              } else {
                                optionClasses += 'bg-white border-slate-200 text-slate-400 opacity-60';
                              }
                            } else {
                              if (isSelected) {
                                optionClasses += 'bg-indigo-50 border-indigo-500 text-indigo-900 shadow-xs';
                              } else {
                                optionClasses += 'bg-white border-slate-200 hover:border-slate-300 text-slate-800';
                              }
                            }

                            return (
                              <button
                                key={optIdx}
                                onClick={() => handleSelectOption(q.id, opt)}
                                className={optionClasses}
                              >
                                <span className="font-mono text-slate-400 text-[11px]">
                                  {String.fromCharCode(65 + optIdx)}.
                                </span>
                                <span>{opt}</span>
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    )}

                    {/* Solution Reveal Toggle */}
                    <div className="pt-2">
                      <button
                        onClick={() => toggleReveal(q.id)}
                        className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center space-x-2 ${
                          isRevealed
                            ? 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                            : 'bg-indigo-600 hover:bg-indigo-700 text-white shadow-xs'
                        }`}
                      >
                        <span>{isRevealed ? 'Hide Solution' : 'Reveal Solution & Explanation'}</span>
                        {isRevealed ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                      </button>
                    </div>

                    {/* Collapsible Answer & Explanation */}
                    {isRevealed && (
                      <div className="space-y-3 pt-3 border-t border-slate-100 animate-fadeIn">
                        <div className="p-4 bg-slate-50 border border-slate-200/80 rounded-xl space-y-2">
                          <div className="text-[11px] font-bold text-slate-600 uppercase tracking-wider flex items-center space-x-1.5">
                            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                            <span>Detailed Answer</span>
                          </div>
                          <div className="text-xs text-slate-800 leading-relaxed font-mono whitespace-pre-wrap bg-white p-3 rounded-lg border border-slate-100">
                            {q.answerContent}
                          </div>
                        </div>

                        {q.explanation && (
                          <div className="p-3 bg-indigo-50/60 border border-indigo-100 rounded-xl text-xs text-indigo-950 space-y-1">
                            <span className="font-bold text-[11px] text-indigo-900 block">
                              Key Concept & Explanation:
                            </span>
                            <p className="leading-relaxed">{q.explanation}</p>
                          </div>
                        )}
                      </div>
                    )}

                    {/* Source Attribution Footer */}
                    <div className="pt-3 border-t border-slate-100 flex flex-wrap items-center justify-between text-[11px] text-slate-400 gap-2">
                      <div className="flex items-center space-x-2">
                        <span>Attribution: {q.attribution}</span>
                        <span className="px-1.5 py-0.2 bg-slate-100 text-slate-600 rounded text-[10px]">
                          {q.license}
                        </span>
                      </div>

                      {q.sourceUrl && (
                        <a
                          href={q.sourceUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-indigo-600 hover:underline flex items-center space-x-1 font-medium"
                        >
                          <span>Original Reference</span>
                          <ExternalLink className="w-3 h-3" />
                        </a>
                      )}
                    </div>
                  </article>
                );
              })
            )}

            {/* Pagination Controls */}
            {totalPages > 1 && (
              <div className="flex items-center justify-center space-x-2 pt-6">
                <button
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={page === 1}
                  className="p-2 border border-slate-200 bg-white rounded-lg text-slate-700 hover:bg-slate-50 disabled:opacity-40"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <span className="text-xs text-slate-600 font-semibold px-2">
                  Page {page} of {totalPages}
                </span>
                <button
                  onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                  disabled={page === totalPages}
                  className="p-2 border border-slate-200 bg-white rounded-lg text-slate-700 hover:bg-slate-50 disabled:opacity-40"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}

export default function QuestionsPage() {
  return (
    <Suspense fallback={<div className="p-12 text-center text-xs text-slate-400">Loading Question Bank...</div>}>
      <QuestionsContent />
    </Suspense>
  );
}
