"use client";

import React, { useEffect, useState } from "react";
import type { Question, Assessment } from "@/lib/types";
import Spinner from "./Spinner";
import GlassCard from "./GlassCard";
import GradientButton from "./GradientButton";
import FormInput from "./FormInput";

export default function AssessmentsTab() {
  const [assessments, setAssessments] = useState<Assessment[]>([]);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  // Form state
  const [title, setTitle] = useState("");
  const [durationMinutes, setDurationMinutes] = useState(30);
  const [selectedQuestionIds, setSelectedQuestionIds] = useState<Set<string>>(new Set());
  const [questionFilter, setQuestionFilter] = useState("");

  async function fetchData() {
    try {
      const [aRes, qRes] = await Promise.all([
        fetch("/api/assessments"),
        fetch("/api/questions"),
      ]);
      const aData = await aRes.json();
      const qData = await qRes.json();
      setAssessments(aData.assessments ?? []);
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

  function resetForm() {
    setTitle("");
    setDurationMinutes(30);
    setSelectedQuestionIds(new Set());
    setQuestionFilter("");
    setShowForm(false);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (selectedQuestionIds.size === 0) {
      setError("Select at least one question");
      return;
    }
    setSaving(true);
    setError("");

    try {
      const res = await fetch("/api/assessments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title,
          durationMinutes,
          questionIds: Array.from(selectedQuestionIds),
        }),
      });

      if (!res.ok) throw new Error("Failed to create assessment");

      resetForm();
      await fetchData();
    } catch {
      setError("Failed to create assessment");
    } finally {
      setSaving(false);
    }
  }

  function toggleQuestion(id: string) {
    setSelectedQuestionIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  const filteredQuestions = questions.filter((q) =>
    q.questionText.toLowerCase().includes(questionFilter.toLowerCase())
  );

  if (loading) {
    return <Spinner label="Loading assessments..." />;
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h2
          className="text-xl font-bold bg-gradient-to-r from-gray-100 to-slate-300 bg-clip-text text-transparent"
        >
          Assessments
          <span className="ml-2 text-sm font-normal text-slate-500">({assessments.length})</span>
        </h2>
        <GradientButton onClick={() => setShowForm(!showForm)}>
          {showForm ? "Cancel" : "+ Create Assessment"}
        </GradientButton>
      </div>

      {error && (
        <div className="mb-4 rounded-xl border border-red-500/20 bg-red-500/[0.07] backdrop-blur-sm px-4 py-3 text-sm text-red-400">
          {error}
        </div>
      )}

      {/* Create Assessment Form */}
      {showForm && (
        <GlassCard className="mb-8">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <FormInput
                label="Title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
                placeholder="Assessment title"
              />
              <FormInput
                label="Duration (minutes)"
                type="number"
                value={durationMinutes}
                onChange={(e) => setDurationMinutes(Number(e.target.value))}
                required
                min={1}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-300/90 mb-1.5 tracking-wide">
                Select Questions
                <span className="ml-2 text-violet-400">({selectedQuestionIds.size} selected)</span>
              </label>
              <input
                type="text"
                value={questionFilter}
                onChange={(e) => setQuestionFilter(e.target.value)}
                className="w-full rounded-xl border border-white/[0.06] bg-white/[0.03] px-4 py-3 text-gray-100 placeholder-slate-500 outline-none transition-all duration-300 focus:border-violet-500/50 focus:ring-2 focus:ring-violet-500/10 focus:bg-white/[0.05] backdrop-blur-sm mb-3"
                placeholder="Filter questions..."
              />
              <div className="max-h-60 overflow-y-auto rounded-xl border border-white/[0.06] bg-white/[0.02] divide-y divide-white/[0.04]">
                {filteredQuestions.length === 0 ? (
                  <p className="px-4 py-3 text-sm text-slate-500">No questions found</p>
                ) : (
                  filteredQuestions.map((q) => (
                    <label
                      key={q.questionId}
                      className="flex items-center gap-3 px-4 py-3 cursor-pointer transition-colors duration-200 hover:bg-white/[0.02]"
                    >
                      <input
                        type="checkbox"
                        checked={selectedQuestionIds.has(q.questionId)}
                        onChange={() => toggleQuestion(q.questionId)}
                        className="h-4 w-4 rounded border-white/10 bg-white/[0.03] text-violet-500 focus:ring-violet-500/20"
                      />
                      <span className="text-sm text-gray-200 line-clamp-1">{q.questionText}</span>
                    </label>
                  ))
                )}
              </div>
            </div>

            <GradientButton type="submit" disabled={saving}>
              {saving ? "Creating..." : "Create Assessment"}
            </GradientButton>
          </form>
        </GlassCard>
      )}

      {/* Assessments Table */}
      <GlassCard noPadding className="overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="border-b border-white/[0.06]">
              <th className="px-6 py-3.5 text-left text-xs font-semibold uppercase tracking-wider bg-gradient-to-r from-violet-400 to-cyan-400 bg-clip-text text-transparent">
                Title
              </th>
              <th className="px-6 py-3.5 text-left text-xs font-semibold uppercase tracking-wider bg-gradient-to-r from-violet-400 to-cyan-400 bg-clip-text text-transparent">
                # Questions
              </th>
              <th className="px-6 py-3.5 text-left text-xs font-semibold uppercase tracking-wider bg-gradient-to-r from-violet-400 to-cyan-400 bg-clip-text text-transparent">
                Duration
              </th>
              <th className="px-6 py-3.5 text-left text-xs font-semibold uppercase tracking-wider bg-gradient-to-r from-violet-400 to-cyan-400 bg-clip-text text-transparent">
                Created
              </th>
            </tr>
          </thead>
          <tbody>
            {assessments.length === 0 ? (
              <tr>
                <td colSpan={4} className="px-6 py-12 text-center text-sm text-slate-500">
                  No assessments yet. Create one to get started.
                </td>
              </tr>
            ) : (
              assessments.map((a) => (
                <tr
                  key={a.assessmentId}
                  className="border-b border-white/[0.03] transition-colors duration-200 hover:bg-white/[0.02]"
                >
                  <td className="px-6 py-4 text-sm font-medium text-gray-200">{a.title}</td>
                  <td className="px-6 py-4 text-sm text-slate-400">{a.questionIds.length}</td>
                  <td className="px-6 py-4 text-sm text-slate-400">{a.durationMinutes} min</td>
                  <td className="px-6 py-4 text-sm text-slate-500">
                    {new Date(a.createdAt).toLocaleDateString()}
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
