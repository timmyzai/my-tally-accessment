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
}

export default function QuestionSetsTab() {
  const [questionSets, setQuestionSets] = useState<QuestionSet[]>([]);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [expandedSetId, setExpandedSetId] = useState<string | null>(null);

  const [name, setName] = useState("");

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

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError("");

    try {
      const res = await fetch("/api/question-sets", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name }),
      });

      if (!res.ok) throw new Error("Failed to create question set");

      setName("");
      setShowForm(false);
      await fetchData();
    } catch {
      setError("Failed to create question set");
    } finally {
      setSaving(false);
    }
  }

  function getQuestionCount(setId: string) {
    return questions.filter((q) => q.questionSetId === setId).length;
  }

  function getSetQuestions(setId: string) {
    return questions.filter((q) => q.questionSetId === setId);
  }

  if (loading) {
    return <Spinner label="Loading question sets..." />;
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-bold bg-gradient-to-r from-gray-100 to-slate-300 bg-clip-text text-transparent">
          Question Sets
          <span className="ml-2 text-sm font-normal text-slate-500">({questionSets.length})</span>
        </h2>
        <GradientButton onClick={() => setShowForm(!showForm)}>
          {showForm ? "Cancel" : "+ New Set"}
        </GradientButton>
      </div>

      {error && (
        <div className="mb-4 rounded-xl border border-red-500/20 bg-red-500/[0.07] backdrop-blur-sm px-4 py-3 text-sm text-red-400">
          {error}
        </div>
      )}

      {showForm && (
        <GlassCard className="mb-8">
          <form onSubmit={handleSubmit} className="space-y-4">
            <FormInput
              label="Set Name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              placeholder="e.g. JavaScript Advanced"
            />
            <GradientButton type="submit" disabled={saving}>
              {saving ? "Creating..." : "Create Set"}
            </GradientButton>
          </form>
        </GlassCard>
      )}

      <div className="space-y-3">
        {questionSets.length === 0 ? (
          <GlassCard>
            <p className="text-center text-sm text-slate-500">No question sets yet. Create one to get started.</p>
          </GlassCard>
        ) : (
          questionSets.map((qs) => (
            <GlassCard key={qs.questionSetId}>
              <div
                className="flex items-center justify-between cursor-pointer"
                onClick={() => setExpandedSetId(expandedSetId === qs.questionSetId ? null : qs.questionSetId)}
              >
                <div>
                  <h3 className="text-sm font-medium text-gray-200">{qs.name}</h3>
                  <p className="text-xs text-slate-500 mt-0.5">
                    {getQuestionCount(qs.questionSetId)} questions &middot; Created {new Date(qs.createdAt).toLocaleDateString()}
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
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                </svg>
              </div>

              {expandedSetId === qs.questionSetId && (
                <div className="mt-4 border-t border-white/[0.06] pt-4 space-y-2">
                  {getSetQuestions(qs.questionSetId).length === 0 ? (
                    <p className="text-sm text-slate-500">No questions in this set yet.</p>
                  ) : (
                    getSetQuestions(qs.questionSetId).map((q, i) => (
                      <div
                        key={q.questionId}
                        className="flex items-start gap-3 rounded-xl bg-white/[0.02] border border-white/[0.04] px-4 py-3"
                      >
                        <span className="text-xs text-slate-500 mt-0.5">{i + 1}.</span>
                        <span className="text-sm text-gray-300 flex-1">{q.questionText}</span>
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
