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

interface Assessment {
  assessmentId: string;
  title: string;
  questionSetId: string;
  numQuestions: number;
  durationMinutes: number;
  createdAt: string;
}

export default function AssessmentsTab() {
  const [assessments, setAssessments] = useState<Assessment[]>([]);
  const [questionSets, setQuestionSets] = useState<QuestionSet[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  // Form state
  const [title, setTitle] = useState("");
  const [questionSetId, setQuestionSetId] = useState("");
  const [numQuestions, setNumQuestions] = useState(20);
  const [durationMinutes, setDurationMinutes] = useState(20);

  async function fetchData() {
    try {
      const [aRes, qsRes] = await Promise.all([
        fetch("/api/assessments"),
        fetch("/api/question-sets"),
      ]);
      const aData = await aRes.json();
      const qsData = await qsRes.json();
      setAssessments(aData.assessments ?? []);
      setQuestionSets(qsData.questionSets ?? []);
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
    setQuestionSetId("");
    setNumQuestions(20);
    setDurationMinutes(20);
    setShowForm(false);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!questionSetId) {
      setError("Select a question set");
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
          questionSetId,
          numQuestions,
          durationMinutes,
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

  function getQuestionSetName(id: string): string {
    const qs = questionSets.find((s) => s.questionSetId === id);
    return qs ? qs.name : "Unknown";
  }

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
              <div>
                <label className="block text-sm font-medium text-slate-300/90 mb-1.5 tracking-wide">
                  Question Set
                </label>
                <select
                  value={questionSetId}
                  onChange={(e) => setQuestionSetId(e.target.value)}
                  required
                  className="w-full rounded-xl border border-white/[0.06] bg-white/[0.03] px-4 py-3 text-gray-100 placeholder-slate-500 outline-none transition-all duration-300 focus:border-violet-500/50 focus:ring-2 focus:ring-violet-500/10 focus:bg-white/[0.05] backdrop-blur-sm"
                >
                  <option value="" className="bg-slate-900 text-slate-400">Select a question set...</option>
                  {questionSets.map((qs) => (
                    <option key={qs.questionSetId} value={qs.questionSetId} className="bg-slate-900 text-gray-100">
                      {qs.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <FormInput
                label="Number of Random Questions"
                type="number"
                value={numQuestions}
                onChange={(e) => setNumQuestions(Number(e.target.value))}
                required
                min={1}
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
                Question Set
              </th>
              <th className="px-6 py-3.5 text-left text-xs font-semibold uppercase tracking-wider bg-gradient-to-r from-violet-400 to-cyan-400 bg-clip-text text-transparent">
                Random Qs
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
                <td colSpan={5} className="px-6 py-12 text-center text-sm text-slate-500">
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
                  <td className="px-6 py-4 text-sm text-slate-400">{getQuestionSetName(a.questionSetId)}</td>
                  <td className="px-6 py-4 text-sm text-slate-400">{a.numQuestions}</td>
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
