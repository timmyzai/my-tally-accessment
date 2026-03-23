"use client";

import React, { useEffect, useState } from "react";
import Spinner from "./Spinner";
import GlassCard from "./GlassCard";
import GradientButton from "./GradientButton";
import FormInput from "./FormInput";

interface QuestionSet {
  questionSetId: string;
  name: string;
  createdAt: string;
}

interface Question {
  questionId: string;
  questionText: string;
  isOptional: boolean;
  questionSetId: string;
  createdAt: string;
}

export default function QuestionBankTab() {
  const [questionSets, setQuestionSets] = useState<QuestionSet[]>([]);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // UI toggles
  const [showNewSetForm, setShowNewSetForm] = useState(false);
  const [showAddQuestionForm, setShowAddQuestionForm] = useState(false);
  const [expandedSetId, setExpandedSetId] = useState<string | null>(null);

  // New Set form state
  const [setName, setSetName] = useState("");
  const [savingSet, setSavingSet] = useState(false);

  // Add Question form state
  const [questionText, setQuestionText] = useState("");
  const [isOptional, setIsOptional] = useState(false);
  const [questionSetId, setQuestionSetId] = useState("");
  const [savingQuestion, setSavingQuestion] = useState(false);

  async function fetchData() {
    try {
      const [qsRes, qRes] = await Promise.all([
        fetch("/api/question-sets"),
        fetch("/api/questions"),
      ]);
      const qsData = await qsRes.json();
      const qData = await qRes.json();
      setQuestionSets(qsData.questionSets ?? []);
      setQuestions(qData.questions ?? []);
    } catch {
      setError("Failed to load data");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchData();
  }, []);

  // Pre-select the expanded set when opening the add question form
  function handleShowAddQuestion() {
    if (!showAddQuestionForm && expandedSetId) {
      setQuestionSetId(expandedSetId);
    }
    setShowAddQuestionForm(!showAddQuestionForm);
    setShowNewSetForm(false);
  }

  function handleShowNewSet() {
    setShowNewSetForm(!showNewSetForm);
    setShowAddQuestionForm(false);
  }

  async function handleCreateSet(e: React.FormEvent) {
    e.preventDefault();
    setSavingSet(true);
    setError("");

    try {
      const res = await fetch("/api/question-sets", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: setName }),
      });

      if (!res.ok) throw new Error("Failed to create question set");

      setSetName("");
      setShowNewSetForm(false);
      await fetchData();
    } catch {
      setError("Failed to create question set");
    } finally {
      setSavingSet(false);
    }
  }

  async function handleCreateQuestion(e: React.FormEvent) {
    e.preventDefault();
    setSavingQuestion(true);
    setError("");

    try {
      const res = await fetch("/api/questions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ questionText, isOptional, questionSetId }),
      });

      if (!res.ok) throw new Error("Failed to create question");

      setQuestionText("");
      setIsOptional(false);
      setQuestionSetId("");
      setShowAddQuestionForm(false);
      await fetchData();
    } catch {
      setError("Failed to create question");
    } finally {
      setSavingQuestion(false);
    }
  }

  function getQuestionCount(setId: string) {
    return questions.filter((q) => q.questionSetId === setId).length;
  }

  function getSetQuestions(setId: string) {
    return questions.filter((q) => q.questionSetId === setId);
  }

  if (loading) {
    return <Spinner label="Loading question bank..." />;
  }

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-bold bg-gradient-to-r from-gray-100 to-slate-300 bg-clip-text text-transparent">
          Question Bank
          <span className="ml-2 text-sm font-normal text-slate-500">
            ({questions.length})
          </span>
        </h2>
        <div className="flex items-center gap-3">
          <GradientButton onClick={handleShowNewSet}>
            {showNewSetForm ? "Cancel" : "+ New Set"}
          </GradientButton>
          <GradientButton onClick={handleShowAddQuestion}>
            {showAddQuestionForm ? "Cancel" : "+ Add Question"}
          </GradientButton>
        </div>
      </div>

      {/* Error */}
      {error && (
        <div className="mb-4 rounded-xl border border-red-500/20 bg-red-500/[0.07] backdrop-blur-sm px-4 py-3 text-sm text-red-400">
          {error}
        </div>
      )}

      {/* New Set Form */}
      {showNewSetForm && (
        <GlassCard className="mb-6">
          <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-500 mb-4">
            Create Question Set
          </h3>
          <form onSubmit={handleCreateSet} className="flex items-end gap-4">
            <div className="flex-1">
              <FormInput
                label="Set Name"
                value={setName}
                onChange={(e) => setSetName(e.target.value)}
                required
                placeholder="e.g. JavaScript Advanced"
              />
            </div>
            <GradientButton type="submit" disabled={savingSet}>
              {savingSet ? "Creating..." : "Create"}
            </GradientButton>
          </form>
        </GlassCard>
      )}

      {/* Add Question Form */}
      {showAddQuestionForm && (
        <GlassCard className="mb-6">
          <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-500 mb-4">
            Add Question
          </h3>
          <form onSubmit={handleCreateQuestion} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-300/90 mb-1.5 tracking-wide">
                Question Text
              </label>
              <textarea
                value={questionText}
                onChange={(e) => setQuestionText(e.target.value)}
                required
                rows={3}
                className="w-full rounded-xl border border-white/[0.06] bg-white/[0.03] px-4 py-3 text-gray-100 placeholder-slate-500 outline-none transition-all duration-300 focus:border-violet-500/50 focus:ring-2 focus:ring-violet-500/10 focus:bg-white/[0.05] backdrop-blur-sm resize-none"
                placeholder="Enter the question..."
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-300/90 mb-1.5 tracking-wide">
                Question Set
              </label>
              <select
                value={questionSetId}
                onChange={(e) => setQuestionSetId(e.target.value)}
                className="w-full rounded-xl border border-white/[0.06] bg-white/[0.03] px-4 py-3 text-gray-100 outline-none transition-all duration-300 focus:border-violet-500/50 focus:ring-2 focus:ring-violet-500/10 focus:bg-white/[0.05] backdrop-blur-sm"
              >
                <option value="">-- Select a question set --</option>
                {questionSets.map((qs) => (
                  <option key={qs.questionSetId} value={qs.questionSetId}>
                    {qs.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex items-center gap-3">
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={isOptional}
                  onChange={(e) => setIsOptional(e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-9 h-5 rounded-full border border-white/[0.06] bg-white/[0.03] peer-checked:bg-gradient-to-r peer-checked:from-violet-500/40 peer-checked:to-cyan-500/40 peer-checked:border-violet-500/30 transition-all duration-300 after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-slate-300 after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:after:translate-x-full peer-checked:after:bg-white" />
              </label>
              <span className="text-sm font-medium text-slate-300/90 tracking-wide">
                Optional question
              </span>
            </div>

            <GradientButton type="submit" disabled={savingQuestion}>
              {savingQuestion ? "Creating..." : "Create Question"}
            </GradientButton>
          </form>
        </GlassCard>
      )}

      {/* Question Sets List */}
      <div className="space-y-3">
        {questionSets.length === 0 ? (
          <GlassCard>
            <p className="text-center text-sm text-slate-500">
              No question sets yet. Create one to get started.
            </p>
          </GlassCard>
        ) : (
          questionSets.map((qs) => (
            <GlassCard key={qs.questionSetId}>
              <div
                className="flex items-center justify-between cursor-pointer"
                onClick={() =>
                  setExpandedSetId(
                    expandedSetId === qs.questionSetId
                      ? null
                      : qs.questionSetId
                  )
                }
              >
                <div>
                  <h3 className="text-sm font-medium text-gray-200">
                    {qs.name}
                  </h3>
                  <p className="text-xs text-slate-500 mt-0.5">
                    {getQuestionCount(qs.questionSetId)} questions &middot;
                    Created{" "}
                    {new Date(qs.createdAt).toLocaleDateString()}
                  </p>
                </div>
                <svg
                  className={`h-5 w-5 text-slate-400 transition-transform duration-200 ${
                    expandedSetId === qs.questionSetId ? "rotate-180" : ""
                  }`}
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={2}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M19 9l-7 7-7-7"
                  />
                </svg>
              </div>

              {expandedSetId === qs.questionSetId && (
                <div className="mt-4 border-t border-white/[0.06] pt-4 space-y-2">
                  {getSetQuestions(qs.questionSetId).length === 0 ? (
                    <p className="text-sm text-slate-500">
                      No questions in this set yet.
                    </p>
                  ) : (
                    getSetQuestions(qs.questionSetId).map((q, i) => (
                      <div
                        key={q.questionId}
                        className="flex items-start gap-3 rounded-xl bg-white/[0.02] border border-white/[0.04] px-4 py-3"
                      >
                        <span className="text-xs text-slate-500 mt-0.5">
                          {i + 1}.
                        </span>
                        <span className="text-sm text-gray-300 flex-1">
                          {q.questionText}
                        </span>
                        {q.isOptional && (
                          <span className="shrink-0 rounded-lg bg-amber-500/10 border border-amber-500/20 px-2 py-0.5 text-xs text-amber-400">
                            Optional
                          </span>
                        )}
                      </div>
                    ))
                  )}
                </div>
              )}
            </GlassCard>
          ))
        )}
      </div>
    </div>
  );
}
