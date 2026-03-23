"use client";

import React, { useEffect, useState } from "react";
import type { Question } from "@/lib/types";
import Spinner from "./Spinner";
import GlassCard from "./GlassCard";
import GradientButton from "./GradientButton";
import FormInput from "./FormInput";

export default function QuestionsTab() {
  const [questions, setQuestions] = useState<Question[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  // Form state
  const [questionText, setQuestionText] = useState("");
  const [optionA, setOptionA] = useState("");
  const [optionB, setOptionB] = useState("");
  const [optionC, setOptionC] = useState("");
  const [optionD, setOptionD] = useState("");
  const [correctAnswer, setCorrectAnswer] = useState<"A" | "B" | "C" | "D">("A");

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

  useEffect(() => {
    fetchQuestions();
  }, []);

  function resetForm() {
    setQuestionText("");
    setOptionA("");
    setOptionB("");
    setOptionC("");
    setOptionD("");
    setCorrectAnswer("A");
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
        body: JSON.stringify({ questionText, optionA, optionB, optionC, optionD, correctAnswer }),
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

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {[
                { label: "Option A", value: optionA, setter: setOptionA },
                { label: "Option B", value: optionB, setter: setOptionB },
                { label: "Option C", value: optionC, setter: setOptionC },
                { label: "Option D", value: optionD, setter: setOptionD },
              ].map((opt) => (
                <FormInput
                  key={opt.label}
                  label={opt.label}
                  value={opt.value}
                  onChange={(e) => opt.setter(e.target.value)}
                  required
                  placeholder={opt.label}
                />
              ))}
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-300/90 mb-1.5 tracking-wide">
                Correct Answer
              </label>
              <select
                value={correctAnswer}
                onChange={(e) => setCorrectAnswer(e.target.value as "A" | "B" | "C" | "D")}
                className="w-full rounded-xl border border-white/[0.06] bg-white/[0.03] px-4 py-3 text-gray-100 outline-none transition-all duration-300 focus:border-violet-500/50 focus:ring-2 focus:ring-violet-500/10 focus:bg-white/[0.05] backdrop-blur-sm"
              >
                <option value="A">A</option>
                <option value="B">B</option>
                <option value="C">C</option>
                <option value="D">D</option>
              </select>
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
                Options
              </th>
              <th className="px-6 py-3.5 text-left text-xs font-semibold uppercase tracking-wider bg-gradient-to-r from-violet-400 to-cyan-400 bg-clip-text text-transparent">
                Answer
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
                    <div className="flex flex-wrap gap-1.5">
                      {(["A", "B", "C", "D"] as const).map((key) => (
                        <span
                          key={key}
                          className="inline-block max-w-[120px] truncate rounded-lg bg-white/[0.04] border border-white/[0.04] px-2 py-0.5 text-xs text-slate-300"
                        >
                          {key}: {q[`option${key}` as keyof Question] as string}
                        </span>
                      ))}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className="inline-flex h-7 w-7 items-center justify-center rounded-lg bg-gradient-to-br from-violet-500/20 to-cyan-500/20 text-xs font-bold text-violet-300 border border-violet-500/20">
                      {q.correctAnswer}
                    </span>
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
