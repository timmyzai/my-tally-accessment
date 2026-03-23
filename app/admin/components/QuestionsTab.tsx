"use client";

import React, { useEffect, useState } from "react";
import Spinner from "./Spinner";
import GlassCard from "./GlassCard";
import GradientButton from "./GradientButton";
import FormInput from "./FormInput";

type Question = {
  questionId: string;
  questionText: string;
  isOptional: boolean;
  questionSetId: string;
  createdAt: string;
};

type QuestionSet = {
  questionSetId: string;
  name: string;
  createdAt: string;
};

export default function QuestionsTab() {
  const [questions, setQuestions] = useState<Question[]>([]);
  const [questionSets, setQuestionSets] = useState<QuestionSet[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  // Form state
  const [questionText, setQuestionText] = useState("");
  const [isOptional, setIsOptional] = useState(false);
  const [questionSetId, setQuestionSetId] = useState("");

  async function fetchQuestions() {
    try {
      const res = await fetch("/api/questions");
      const data = await res.json();
      setQuestions(data.questions ?? []);
    } catch {
      setError("Failed to load questions");
    } finally {
      setLoading(false);
    }
  }

  async function fetchQuestionSets() {
    try {
      const qsRes = await fetch("/api/question-sets");
      const qsData = await qsRes.json();
      setQuestionSets(qsData.questionSets ?? []);
    } catch {
      setError("Failed to load question sets");
    }
  }

  useEffect(() => {
    fetchQuestions();
    fetchQuestionSets();
  }, []);

  function resetForm() {
    setQuestionText("");
    setIsOptional(false);
    setQuestionSetId("");
    setShowForm(false);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError("");

    try {
      const res = await fetch("/api/questions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ questionText, isOptional, questionSetId }),
      });

      if (!res.ok) throw new Error("Failed to create question");

      resetForm();
      await fetchQuestions();
    } catch {
      setError("Failed to create question");
    } finally {
      setSaving(false);
    }
  }

  function getSetName(setId: string): string {
    const qs = questionSets.find((s) => s.questionSetId === setId);
    return qs ? qs.name : "-";
  }

  if (loading) {
    return <Spinner label="Loading questions..." />;
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h2
          className="text-xl font-bold bg-gradient-to-r from-gray-100 to-slate-300 bg-clip-text text-transparent"
        >
          Questions
          <span className="ml-2 text-sm font-normal text-slate-500">({questions.length})</span>
        </h2>
        <GradientButton onClick={() => setShowForm(!showForm)}>
          {showForm ? "Cancel" : "+ Add Question"}
        </GradientButton>
      </div>

      {error && (
        <div className="mb-4 rounded-xl border border-red-500/20 bg-red-500/[0.07] backdrop-blur-sm px-4 py-3 text-sm text-red-400">
          {error}
        </div>
      )}

      {/* Add Question Form */}
      {showForm && (
        <GlassCard className="mb-8">
          <form onSubmit={handleSubmit} className="space-y-4">
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

            <GradientButton type="submit" disabled={saving}>
              {saving ? "Creating..." : "Create Question"}
            </GradientButton>
          </form>
        </GlassCard>
      )}

      {/* Questions Table */}
      <GlassCard noPadding className="overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="border-b border-white/[0.06]">
              <th className="px-6 py-3.5 text-left text-xs font-semibold uppercase tracking-wider bg-gradient-to-r from-violet-400 to-cyan-400 bg-clip-text text-transparent">
                #
              </th>
              <th className="px-6 py-3.5 text-left text-xs font-semibold uppercase tracking-wider bg-gradient-to-r from-violet-400 to-cyan-400 bg-clip-text text-transparent">
                Question Text
              </th>
              <th className="px-6 py-3.5 text-left text-xs font-semibold uppercase tracking-wider bg-gradient-to-r from-violet-400 to-cyan-400 bg-clip-text text-transparent">
                Set
              </th>
              <th className="px-6 py-3.5 text-left text-xs font-semibold uppercase tracking-wider bg-gradient-to-r from-violet-400 to-cyan-400 bg-clip-text text-transparent">
                Optional
              </th>
            </tr>
          </thead>
          <tbody>
            {questions.length === 0 ? (
              <tr>
                <td colSpan={4} className="px-6 py-12 text-center text-sm text-slate-500">
                  No questions yet. Add one to get started.
                </td>
              </tr>
            ) : (
              questions.map((q, i) => (
                <tr
                  key={q.questionId}
                  className="border-b border-white/[0.03] transition-colors duration-200 hover:bg-white/[0.02]"
                >
                  <td className="px-6 py-4 text-sm text-slate-500">{i + 1}</td>
                  <td className="px-6 py-4 text-sm text-gray-200 max-w-xs">
                    <span className="line-clamp-2">{q.questionText}</span>
                  </td>
                  <td className="px-6 py-4 text-sm text-slate-400">
                    {getSetName(q.questionSetId)}
                  </td>
                  <td className="px-6 py-4">
                    {q.isOptional ? (
                      <span className="inline-flex items-center rounded-lg bg-gradient-to-br from-amber-500/20 to-orange-500/20 border border-amber-500/20 px-2.5 py-0.5 text-xs font-semibold text-amber-300">
                        Yes
                      </span>
                    ) : (
                      <span className="inline-flex items-center rounded-lg bg-gradient-to-br from-violet-500/20 to-cyan-500/20 border border-violet-500/20 px-2.5 py-0.5 text-xs font-semibold text-violet-300">
                        No
                      </span>
                    )}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </GlassCard>
    </div>
  );
}
